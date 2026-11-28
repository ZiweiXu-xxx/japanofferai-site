// JapanOffer AI AI match report API (secured).
//
// Security model (fixed 2026-11-27, audit P1-2):
// - Requires a logged-in Supabase user: the caller must send
//   `Authorization: Bearer <Supabase access token>`. The token is verified
//   against Supabase Auth (/auth/v1/user); anonymous calls get 401.
// - The free-report quota is counted per Supabase user id, not per email
//   string, so a new email no longer resets the free report.
// - In-memory per-user / per-IP rate limits (best-effort on serverless;
//   buckets reset when the function instance is recycled).
// - Upstream error bodies are never echoed to the client; they are only
//   written to the server log.
//
// Required Vercel env vars:
//   OPENAI_API_KEY, SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY,
//   SUPABASE_PUBLISHABLE_KEY (SUPABASE_ANON_KEY is only a legacy fallback)
//   — used only to verify the caller's access token with Supabase Auth;
//   the key itself is never sent to the client. Prefer the new publishable
//   key: Vercel already has SUPABASE_PUBLISHABLE_KEY configured, while
//   SUPABASE_ANON_KEY is not configured there.
//
// Billing (added 2026-11-27, Stripe Checkout): Premium subscribers get
// PREMIUM_CREDITS_PER_MONTH reports per billing month (see
// config/pricing.js and supabase/migrations/20261127_stripe_billing.sql).
// The quota order is: free report first, then Premium monthly allowance,
// then paid credits. All checks run server-side.

import { PREMIUM_CREDITS_PER_MONTH } from "../config/pricing.js";

// --- rate limiting (in-memory, best-effort) ---------------------------------
const RATE_LIMITS = {
  perUser: { windowMs: 10 * 60 * 1000, max: 5 }, // 5 reports / user / 10 min
  perIp: { windowMs: 60 * 1000, max: 20 } // 20 requests / IP / min
};

const buckets = new Map();

function rateLimited(key, { windowMs, max }) {
  const now = Date.now();
  const bucket = buckets.get(key) || { count: 0, resetAt: now + windowMs };
  if (now > bucket.resetAt) {
    bucket.count = 0;
    bucket.resetAt = now + windowMs;
  }
  bucket.count += 1;
  buckets.set(key, bucket);
  return bucket.count > max;
}

function getClientIp(req) {
  const forwarded = req.headers["x-forwarded-for"];
  if (typeof forwarded === "string" && forwarded) {
    return forwarded.split(",")[0].trim();
  }
  return (req.socket && req.socket.remoteAddress) || "unknown";
}

// --- Supabase Auth verification (no SDK, plain fetch) -----------------------
async function getAuthenticatedUser(req) {
  const authHeader = req.headers.authorization || "";
  const match = /^Bearer\s+(.+)$/i.exec(authHeader);
  if (!match) return null;

  const token = match[1].trim();
  const supabaseUrl = (process.env.SUPABASE_URL || "").replace(/\/+$/, "");
  const publishableKey = process.env.SUPABASE_PUBLISHABLE_KEY || process.env.SUPABASE_ANON_KEY;
  if (!supabaseUrl || !publishableKey || !token) return null;

  try {
    const res = await fetch(`${supabaseUrl}/auth/v1/user`, {
      headers: {
        apikey: publishableKey,
        Authorization: `Bearer ${token}`
      }
    });
    if (!res.ok) return null;
    const user = await res.json();
    if (!user || !user.id) return null;
    return user; // { id, email, ... }
  } catch {
    return null;
  }
}

// --- Premium status --------------------------------------------------------
// A Premium subscription is active when its status is "active" (or
// "cancel_at_period_end", i.e. paid until the period ends) and the current
// billing period has not ended yet.
function premiumStatus(user) {
  const status = String((user && user.subscription_status) || "");
  const periodEndRaw = user ? user.subscription_current_period_end : null;
  const periodEnd = periodEndRaw ? new Date(periodEndRaw) : null;
  const active =
    (status === "active" || status === "cancel_at_period_end") &&
    periodEnd !== null &&
    periodEnd.getTime() > Date.now();
  const used = Number((user && user.premium_credits_used) || 0);
  return {
    active,
    remaining: active ? Math.max(0, PREMIUM_CREDITS_PER_MONTH - used) : 0,
    used,
    resetAt: periodEnd ? periodEnd.toISOString() : null,
  };
}

// --- Supabase REST helpers ---------------------------------------------------
function supabaseHeaders(serviceKey) {
  return {
    apikey: serviceKey,
    Authorization: `Bearer ${serviceKey}`,
    "Content-Type": "application/json"
  };
}

async function supabaseFetch(url, serviceKey, options = {}) {
  const { headers: extraHeaders, ...rest } = options;
  const res = await fetch(url, {
    ...rest,
    headers: { ...supabaseHeaders(serviceKey), ...(extraHeaders || {}) }
  });
  const text = await res.text();
  let data = null;
  try {
    data = text ? JSON.parse(text) : null;
  } catch {
    data = null;
  }
  return { ok: res.ok, status: res.status, data };
}

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const clientIp = getClientIp(req);
  if (rateLimited(`ip:${clientIp}`, RATE_LIMITS.perIp)) {
    res.setHeader("Retry-After", "60");
    return res.status(429).json({ error: "Too many requests. Please try again in a minute." });
  }

  try {
    const OPENAI_API_KEY = process.env.OPENAI_API_KEY;
    const SUPABASE_URL = (process.env.SUPABASE_URL || "").replace(/\/+$/, "");
    const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!OPENAI_API_KEY || !SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
      return res.status(500).json({
        error: "Server environment variables are missing."
      });
    }

    // Caller must be a signed-in Supabase user.
    const authUser = await getAuthenticatedUser(req);
    if (!authUser) {
      return res.status(401).json({ error: "Sign in required to generate a report." });
    }

    if (rateLimited(`user:${authUser.id}`, RATE_LIMITS.perUser)) {
      res.setHeader("Retry-After", "600");
      return res.status(429).json({ error: "Too many reports. Please try again later." });
    }

    // The authenticated user's email is authoritative; any email sent in the
    // body is ignored so callers cannot claim someone else's quota.
    const email = String(authUser.email || "").trim().toLowerCase();

    const body = req.body || {};

    const candidate = {
      background: String(body.background || "").slice(0, 2500),
      languages: String(body.languages || "").slice(0, 1000),
      targetCountry: String(body.targetCountry || "").slice(0, 500),
      targetIndustry: String(body.targetIndustry || "").slice(0, 500),
      concerns: String(body.concerns || "").slice(0, 1000)
    };

    const jobs = Array.isArray(body.jobs) ? body.jobs.slice(0, 3).map((job, index) => ({
      title: String(job.title || `Job ${index + 1}`).slice(0, 200),
      description: String(job.description || "").slice(0, 3500)
    })) : [];

    const validJobs = jobs.filter(job => job.description.trim().length > 50);

    if (!candidate.background || validJobs.length === 0) {
      return res.status(400).json({
        error: "Please provide your background and at least one job description."
      });
    }

    // Quota is keyed by Supabase user id. The `users` table is expected to
    // have an `id` column holding the Supabase auth user id. If the deployed
    // table was created email-only (no `id` column), fall back to the
    // authenticated email — still tied to the verified login, not to an
    // arbitrary string from the request body.
    //
    // The select asks for the billing columns added by
    // supabase/migrations/20261127_stripe_billing.sql. If the migration
    // has not been applied yet, PostgREST rejects the unknown columns and
    // the lookup retries with the pre-billing column set; Premium is then
    // treated as inactive (never as an error to the client).
    let user = null;
    let userKey = { column: "id", value: authUser.id };

    const billingSelect =
      "id,email,free_used,paid_credits,subscription_status,stripe_customer_id,subscription_current_period_end,premium_credits_used";
    const legacySelect = "id,email,free_used,paid_credits";

    const byIdBilling = await supabaseFetch(
      `${SUPABASE_URL}/rest/v1/users?id=eq.${encodeURIComponent(authUser.id)}&select=${billingSelect}`,
      SUPABASE_SERVICE_ROLE_KEY
    );
    if (byIdBilling.ok && Array.isArray(byIdBilling.data) && byIdBilling.data[0]) {
      user = byIdBilling.data[0];
    } else {
      const byId = await supabaseFetch(
        `${SUPABASE_URL}/rest/v1/users?id=eq.${encodeURIComponent(authUser.id)}&select=${legacySelect}`,
        SUPABASE_SERVICE_ROLE_KEY
      );
      if (byId.ok && Array.isArray(byId.data) && byId.data[0]) {
        user = byId.data[0];
      } else if (!byId.ok && !byIdBilling.ok) {
        const byEmail = await supabaseFetch(
          `${SUPABASE_URL}/rest/v1/users?email=eq.${encodeURIComponent(email)}&select=${legacySelect}`,
          SUPABASE_SERVICE_ROLE_KEY
        );
        if (byEmail.ok && Array.isArray(byEmail.data) && byEmail.data[0]) {
          user = byEmail.data[0];
          userKey = { column: "email", value: email };
        } else if (!byEmail.ok) {
          console.error("analyze: user lookup failed", byIdBilling.status, byId.status, byEmail.status);
          return res.status(500).json({ error: "Could not check user record." });
        }
      } else if (!byId.ok) {
        console.error("analyze: user lookup failed", byIdBilling.status, byId.status);
        return res.status(500).json({ error: "Could not check user record." });
      }
    }

    if (!user) {
      const newRow = { email, free_used: false, paid_credits: 0 };
      // Prefer storing the auth user id so future lookups are id-based.
      let created = await supabaseFetch(
        `${SUPABASE_URL}/rest/v1/users`,
        SUPABASE_SERVICE_ROLE_KEY,
        {
          method: "POST",
          headers: { Prefer: "return=representation" },
          body: JSON.stringify({ id: authUser.id, ...newRow })
        }
      );
      if (!created.ok) {
        // Table may not have an `id` column; retry with email only.
        created = await supabaseFetch(
          `${SUPABASE_URL}/rest/v1/users`,
          SUPABASE_SERVICE_ROLE_KEY,
          {
            method: "POST",
            headers: { Prefer: "return=representation" },
            body: JSON.stringify(newRow)
          }
        );
        if (created.ok) userKey = { column: "email", value: email };
      }
      if (!created.ok || !Array.isArray(created.data) || !created.data[0]) {
        console.error("analyze: user create failed", created.status);
        return res.status(500).json({ error: "Could not create user." });
      }
      user = created.data[0];
    }

    const freeUsed = Boolean(user.free_used);
    const paidCredits = Number(user.paid_credits || 0);
    // Quota order: free report first, then the Premium monthly allowance,
    // then paid credits. All of this is decided server-side.
    const premium = premiumStatus(user);

    if (freeUsed && premium.remaining <= 0 && paidCredits <= 0) {
      return res.status(402).json({
        error: "FREE_REPORT_USED",
        message: "You have already used your free report. Additional reports will require paid credits or Premium."
      });
    }
    // Which allowance pays for this report (decided now, applied after the
    // report is generated successfully).
    const consume = !freeUsed
      ? "free"
      : premium.remaining > 0
        ? "premium"
        : "paid";

const prompt = `
You are JapanOffer AI, an early-stage application priority analysis tool.

Your job is NOT to simply praise every job option.
Your job is to compare the candidate against each job description and decide which applications are genuinely worth prioritising.

You must follow these rules:

1. Compare the jobs against each other.
2. Do not give the same fit score to all jobs unless the job descriptions are truly almost identical.
3. If a job description is vague, unrelated, or too general, reduce the score.
4. Scores must reflect relative priority:
   - 85-95: very strong fit, apply first
   - 70-84: good fit, apply
   - 55-69: possible but risky, maybe
   - below 55: weak fit, low priority
5. Identify different risks for different roles.
6. Be honest. If a role is not strongly connected to the candidate's background, say so.
7. Do not invent visa certainty. Use "visa risk" only as a risk indicator.
8. This is not legal, immigration, or professional career advice.
9. Return ONLY valid JSON. Do not use markdown.

You should especially consider:
- academic background
- language ability
- target country
- role relevance
- visa or sponsorship risk
- whether the role builds a coherent long-term route
- whether the candidate has direct or indirect experience
- whether the job looks realistic for an early-career applicant

Return this exact JSON structure:
{
  "candidate_snapshot": "short summary of the candidate",
  "overall_route": "the most realistic overseas career route based on the information",
  "jobs": [
    {
      "role": "job title",
      "fit_score": 82,
      "priority": "Apply first / Apply / Maybe / Low priority",
      "main_risk": "main risk",
      "reason": "specific explanation of why this role is or is not a good fit",
      "suggested_action": "what the candidate should do next"
    }
  ],
  "final_advice": "clear overall recommendation, including which job should be prioritised first and which should not waste too much time",
  "cover_letter_opening": "a short tailored cover letter opening (2-3 sentences) for the top-priority job, written in the same language as the rest of the report",
  "disclaimer": "This is an early-stage AI assessment and not legal, immigration, or professional career advice."
}
`;

    const openaiResponse = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${OPENAI_API_KEY}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        temperature: 0.2,
        response_format: { type: "json_object" },
        messages: [
          { role: "system", content: prompt },
          {
            role: "user",
            content: JSON.stringify({
              candidate,
              jobs: validJobs
            })
          }
        ]
      })
    });

    if (!openaiResponse.ok) {
      // Do not echo the upstream error body to the client.
      console.error("analyze: OpenAI request failed", openaiResponse.status);
      return res.status(500).json({ error: "OpenAI request failed." });
    }

    const openaiData = await openaiResponse.json();
    const content = openaiData.choices?.[0]?.message?.content;

    if (!content) {
      return res.status(500).json({ error: "No report returned from OpenAI." });
    }

    let report;
    try {
      report = JSON.parse(content);
    } catch (e) {
      console.error("analyze: OpenAI returned invalid JSON");
      return res.status(500).json({ error: "OpenAI returned invalid JSON." });
    }

    const now = new Date().toISOString();
    const userFilter = `${userKey.column}=eq.${encodeURIComponent(userKey.value)}`;

    if (consume === "free") {
      await supabaseFetch(
        `${SUPABASE_URL}/rest/v1/users?${userFilter}`,
        SUPABASE_SERVICE_ROLE_KEY,
        {
          method: "PATCH",
          body: JSON.stringify({ free_used: true, last_report_at: now })
        }
      );
    } else if (consume === "premium") {
      await supabaseFetch(
        `${SUPABASE_URL}/rest/v1/users?${userFilter}`,
        SUPABASE_SERVICE_ROLE_KEY,
        {
          method: "PATCH",
          body: JSON.stringify({ premium_credits_used: premium.used + 1, last_report_at: now })
        }
      );
    } else if (paidCredits > 0) {
      await supabaseFetch(
        `${SUPABASE_URL}/rest/v1/users?${userFilter}`,
        SUPABASE_SERVICE_ROLE_KEY,
        {
          method: "PATCH",
          body: JSON.stringify({ paid_credits: paidCredits - 1, last_report_at: now })
        }
      );
    }

    await supabaseFetch(
      `${SUPABASE_URL}/rest/v1/reports`,
      SUPABASE_SERVICE_ROLE_KEY,
      {
        method: "POST",
        body: JSON.stringify({
          user_id: authUser.id,
          email,
          candidate_input: candidate,
          job_inputs: validJobs,
          report_output: report
        })
      }
    );

    return res.status(200).json({
      success: true,
      report,
      free_used_now: consume === "free",
      consumed_from: consume,
      remaining_paid_credits: consume === "paid" ? Math.max(paidCredits - 1, 0) : paidCredits,
      remaining_premium_credits: consume === "premium" ? Math.max(premium.remaining - 1, 0) : premium.remaining,
      premium_active: premium.active
    });

  } catch (error) {
    // Never echo internal error details to the client.
    console.error("analyze: unexpected error", error);
    return res.status(500).json({ error: "Unexpected server error." });
  }
}
