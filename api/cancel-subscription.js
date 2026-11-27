// JapanOffer AI cancel subscription endpoint.
//
// POST /api/cancel-subscription — requires a logged-in Supabase user.
// Cancels the caller's Premium subscription at the end of the current
// billing period (cancel_at_period_end=true): Premium stays active until
// the period ends, then the webhook (customer.subscription.deleted) marks
// it cancelled. Returns 400 when the user has no active subscription.
//
// The subscription id is not stored in our database; it is found by
// listing the customer's active subscriptions through the Stripe API.

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

// --- Stripe REST helpers (native fetch, no SDK) ------------------------------
function stripeHeaders(secretKey) {
  return {
    Authorization: `Basic ${Buffer.from(`${secretKey}:`).toString("base64")}`,
    "Content-Type": "application/x-www-form-urlencoded",
  };
}

async function stripeRequest(method, path, secretKey, params) {
  const url = `https://api.stripe.com${path}`;
  const options = { method, headers: stripeHeaders(secretKey) };
  if (params) options.body = new URLSearchParams(params);
  const res = await fetch(url, options);
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

  try {
    const SUPABASE_URL = (process.env.SUPABASE_URL || "").replace(/\/+$/, "");
    const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
    const STRIPE_SECRET_KEY = process.env.STRIPE_SECRET_KEY;
    if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY || !STRIPE_SECRET_KEY) {
      return res.status(500).json({ error: "Server environment variables are missing." });
    }

    if (!STRIPE_SECRET_KEY.startsWith("sk_test_")) {
      console.error("cancel-subscription: STRIPE_SECRET_KEY is not a test key; refusing.");
      return res.status(500).json({ error: "Payments are not configured yet." });
    }

    const authUser = await getAuthenticatedUser(req);
    if (!authUser) {
      return res.status(401).json({ error: "Sign in required." });
    }

    // Find the user's stored Stripe customer id. If the billing migration
    // has not been applied, the column is absent and there can be no
    // subscription to cancel from our side.
    const userRes = await supabaseFetch(
      `${SUPABASE_URL}/rest/v1/users?id=eq.${encodeURIComponent(authUser.id)}&select=id,stripe_customer_id,subscription_status,subscription_current_period_end`,
      SUPABASE_SERVICE_ROLE_KEY
    );
    const user = userRes.ok && Array.isArray(userRes.data) ? userRes.data[0] : null;
    const customerId = user ? String(user.stripe_customer_id || "") : "";
    if (!user || !customerId) {
      return res.status(400).json({ error: "No active subscription to cancel." });
    }

    // Look up the active subscription for this customer.
    const list = await stripeRequest(
      "GET",
      `/v1/subscriptions?customer=${encodeURIComponent(customerId)}&status=active&limit=1`,
      STRIPE_SECRET_KEY
    );
    const subscription = list.ok && list.data && Array.isArray(list.data.data) ? list.data.data[0] : null;
    if (!subscription || !subscription.id) {
      return res.status(400).json({ error: "No active subscription to cancel." });
    }

    const cancelled = await stripeRequest(
      "POST",
      `/v1/subscriptions/${encodeURIComponent(subscription.id)}`,
      STRIPE_SECRET_KEY,
      { cancel_at_period_end: "true" }
    );
    if (!cancelled.ok || !cancelled.data) {
      console.error("cancel-subscription: Stripe cancel failed", cancelled.status);
      return res.status(500).json({ error: "Could not cancel the subscription. Please try again." });
    }

    const periodEnd = cancelled.data.current_period_end
      ? new Date(Number(cancelled.data.current_period_end) * 1000).toISOString()
      : user.subscription_current_period_end || null;

    const updated = await supabaseFetch(
      `${SUPABASE_URL}/rest/v1/users?id=eq.${encodeURIComponent(authUser.id)}`,
      SUPABASE_SERVICE_ROLE_KEY,
      {
        method: "PATCH",
        body: JSON.stringify({
          subscription_status: "cancel_at_period_end",
          ...(periodEnd ? { subscription_current_period_end: periodEnd } : {}),
        }),
      }
    );
    if (!updated.ok) {
      console.error("cancel-subscription: could not update user row", updated.status);
      // The Stripe side is already cancelled at period end; report success
      // but log loudly so the operator can reconcile the user row.
    }

    return res.status(200).json({
      success: true,
      cancel_at_period_end: true,
      current_period_end: periodEnd,
    });
  } catch (error) {
    // Never echo internal error details to the client.
    console.error("cancel-subscription: unexpected error", error);
    return res.status(500).json({ error: "Unexpected server error." });
  }
}
