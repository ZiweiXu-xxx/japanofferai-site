// JapanOffer AI credits endpoint (read-only).
//
// GET /api/credits — requires a logged-in Supabase user. Returns the
// caller's remaining report allowance: the free report, paid credits and
// Premium status. All checks run server-side; the frontend only displays
// these numbers and never decides whether a report may be generated.
//
// The `users` table is expected to have the billing columns added by
// supabase/migrations/20261127_stripe_billing.sql. If the migration has
// not been applied yet, the select falls back to the pre-billing columns
// and Premium is reported as inactive (never as an error to the client).

import { FREE_REPORTS, PREMIUM_CREDITS_PER_MONTH } from "../config/pricing.js";

// --- Supabase Auth verification (same pattern as api/analyze.js) -----------
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
        Authorization: `Bearer ${token}`,
      },
    });
    if (!res.ok) return null;
    const user = await res.json();
    if (!user || !user.id) return null;
    return user; // { id, email, ... }
  } catch {
    return null;
  }
}

// --- Supabase REST helpers ---------------------------------------------------
function supabaseHeaders(serviceKey) {
  return {
    apikey: serviceKey,
    Authorization: `Bearer ${serviceKey}`,
    "Content-Type": "application/json",
  };
}

async function supabaseFetch(url, serviceKey, options = {}) {
  const { headers: extraHeaders, ...rest } = options;
  const res = await fetch(url, {
    ...rest,
    headers: { ...supabaseHeaders(serviceKey), ...(extraHeaders || {}) },
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

const BILLING_COLUMNS =
  "id,email,free_used,paid_credits,subscription_status,stripe_customer_id,subscription_current_period_end,premium_credits_used,premium_credits_reset_at";
const LEGACY_COLUMNS = "id,email,free_used,paid_credits";

// Fetch the caller's `users` row. Tries the billing columns first; if the
// migration has not been applied (unknown column), retries with the legacy
// column set and reports Premium as inactive.
async function fetchUserRow(supabaseUrl, serviceKey, authUser) {
  const email = String(authUser.email || "").trim().toLowerCase();

  let res = await supabaseFetch(
    `${supabaseUrl}/rest/v1/users?id=eq.${encodeURIComponent(authUser.id)}&select=${BILLING_COLUMNS}`,
    serviceKey
  );
  if (res.ok && Array.isArray(res.data) && res.data[0]) return res.data[0];

  res = await supabaseFetch(
    `${supabaseUrl}/rest/v1/users?id=eq.${encodeURIComponent(authUser.id)}&select=${LEGACY_COLUMNS}`,
    serviceKey
  );
  if (res.ok && Array.isArray(res.data) && res.data[0]) return res.data[0];

  if (email) {
    res = await supabaseFetch(
      `${supabaseUrl}/rest/v1/users?email=eq.${encodeURIComponent(email)}&select=${LEGACY_COLUMNS}`,
      serviceKey
    );
    if (res.ok && Array.isArray(res.data) && res.data[0]) return res.data[0];
  }
  return null;
}

export default async function handler(req, res) {
  if (req.method !== "GET") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const SUPABASE_URL = (process.env.SUPABASE_URL || "").replace(/\/+$/, "");
    const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
    if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
      return res.status(500).json({ error: "Server environment variables are missing." });
    }

    const authUser = await getAuthenticatedUser(req);
    if (!authUser) {
      return res.status(401).json({ error: "Sign in required." });
    }

    const user = await fetchUserRow(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, authUser);

    // A user with no `users` row yet has the free report untouched.
    const freeUsed = user ? Boolean(user.free_used) : false;
    const paidCredits = user ? Number(user.paid_credits || 0) : 0;

    const status = user ? String(user.subscription_status || "") : "";
    const periodEndRaw = user ? user.subscription_current_period_end : null;
    const periodEnd = periodEndRaw ? new Date(periodEndRaw) : null;
    const premiumActive =
      (status === "active" || status === "cancel_at_period_end") &&
      periodEnd !== null &&
      periodEnd.getTime() > Date.now();
    const premiumUsed = user ? Number(user.premium_credits_used || 0) : 0;
    const premiumRemaining = premiumActive
      ? Math.max(0, PREMIUM_CREDITS_PER_MONTH - premiumUsed)
      : 0;

    const freeRemaining = freeUsed ? 0 : FREE_REPORTS;
    const plan = premiumActive ? "premium" : paidCredits > 0 ? "paid" : "free";

    return res.status(200).json({
      free_remaining: freeRemaining,
      paid_credits: paidCredits,
      premium: {
        active: premiumActive,
        status: status || "none",
        credits_remaining: premiumRemaining,
        credits_per_month: PREMIUM_CREDITS_PER_MONTH,
        reset_at: periodEnd ? periodEnd.toISOString() : null,
      },
      plan,
      total_remaining: freeRemaining + paidCredits + premiumRemaining,
    });
  } catch (error) {
    console.error("credits: unexpected error", error);
    return res.status(500).json({ error: "Unexpected server error." });
  }
}
