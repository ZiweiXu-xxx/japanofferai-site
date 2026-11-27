// JapanOffer AI Stripe Checkout Session creation.
//
// POST /api/create-checkout — requires a logged-in Supabase user.
// Body: { "product": "single" | "pack" | "premium" }
// Returns: { "url": "<Stripe Checkout URL>" } — the browser redirects there.
//
// - single / pack use Checkout mode "payment" (one-off purchase).
// - premium uses mode "subscription" (monthly, renews until cancelled).
// - Prices come from config/pricing.js; the Stripe Price ID for each
//   product comes from env (STRIPE_PRICE_SINGLE / _PACK / _PREMIUM).
//   Missing Price ID => generic 500, never a hard-coded fallback.
// - The pending order is written to the `orders` table (created by
//   supabase/migrations/20261127_stripe_billing.sql). If that table does
//   not exist yet the order write is logged and skipped — the Checkout
//   Session is still returned and the webhook remains the source of truth
//   for fulfilment. Apply the migration before going live.
// - All Stripe calls use Node's native fetch against api.stripe.com; no
//   Stripe SDK is used (this repo has no package.json / build step).

import { getProduct, getPriceId } from "../config/pricing.js";

// --- rate limiting (in-memory, best-effort, same pattern as analyze.js) -----
const RATE_LIMITS = {
  perUser: { windowMs: 60 * 1000, max: 10 }, // 10 checkout attempts / user / min
  perIp: { windowMs: 60 * 1000, max: 30 }, // 30 requests / IP / min
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

async function stripePost(path, secretKey, params) {
  const res = await fetch(`https://api.stripe.com${path}`, {
    method: "POST",
    headers: stripeHeaders(secretKey),
    body: new URLSearchParams(params),
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

const BILLING_COLUMNS = "id,email,stripe_customer_id";
const LEGACY_COLUMNS = "id,email";

async function fetchUserRow(supabaseUrl, serviceKey, authUser) {
  const email = String(authUser.email || "").trim().toLowerCase();
  let res = await supabaseFetch(
    `${supabaseUrl}/rest/v1/users?id=eq.${encodeURIComponent(authUser.id)}&select=${BILLING_COLUMNS}`,
    serviceKey
  );
  if (res.ok && Array.isArray(res.data) && res.data[0]) return { row: res.data[0], key: "id" };
  res = await supabaseFetch(
    `${supabaseUrl}/rest/v1/users?id=eq.${encodeURIComponent(authUser.id)}&select=${LEGACY_COLUMNS}`,
    serviceKey
  );
  if (res.ok && Array.isArray(res.data) && res.data[0]) return { row: res.data[0], key: "id" };
  if (email) {
    res = await supabaseFetch(
      `${supabaseUrl}/rest/v1/users?email=eq.${encodeURIComponent(email)}&select=${LEGACY_COLUMNS}`,
      serviceKey
    );
    if (res.ok && Array.isArray(res.data) && res.data[0]) return { row: res.data[0], key: "email" };
  }
  return { row: null, key: "id" };
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
    const SUPABASE_URL = (process.env.SUPABASE_URL || "").replace(/\/+$/, "");
    const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
    const STRIPE_SECRET_KEY = process.env.STRIPE_SECRET_KEY;
    if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY || !STRIPE_SECRET_KEY) {
      return res.status(500).json({ error: "Server environment variables are missing." });
    }

    // Test-mode guard: never create a live Checkout Session from this code
    // path by accident. Remove this check only when live billing is approved.
    if (!STRIPE_SECRET_KEY.startsWith("sk_test_")) {
      console.error("create-checkout: STRIPE_SECRET_KEY is not a test key; refusing to create a session.");
      return res.status(500).json({ error: "Payments are not configured yet." });
    }

    const authUser = await getAuthenticatedUser(req);
    if (!authUser) {
      return res.status(401).json({ error: "Sign in required to buy reports." });
    }

    if (rateLimited(`user:${authUser.id}`, RATE_LIMITS.perUser)) {
      res.setHeader("Retry-After", "60");
      return res.status(429).json({ error: "Too many requests. Please try again in a minute." });
    }

    const body = req.body || {};
    const product = getProduct(body.product);
    if (!product) {
      return res.status(400).json({ error: "Unknown product. Use single, pack or premium." });
    }

    let priceId;
    try {
      priceId = getPriceId(product);
    } catch {
      return res.status(500).json({ error: "Payments are not configured yet." });
    }

    const email = String(authUser.email || "").trim().toLowerCase();
    const { row: userRow, key: userKey } = await fetchUserRow(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, authUser);

    // Get or create the Stripe customer, keyed by our user id.
    let customerId = userRow ? String(userRow.stripe_customer_id || "") : "";
    if (!customerId) {
      const created = await stripePost("/v1/customers", STRIPE_SECRET_KEY, {
        email,
        "metadata[user_id]": authUser.id,
      });
      if (!created.ok || !created.data || !created.data.id) {
        console.error("create-checkout: Stripe customer create failed", created.status);
        return res.status(500).json({ error: "Could not start checkout. Please try again." });
      }
      customerId = created.data.id;

      // Remember the customer id for renewals / cancellation. If the
      // billing migration has not been applied yet this update fails;
      // log it and continue — the webhook can still find the user from
      // the Checkout Session metadata.
      if (userRow) {
        const filter = `${userKey}=eq.${encodeURIComponent(userKey === "id" ? authUser.id : email)}`;
        const saved = await supabaseFetch(
          `${SUPABASE_URL}/rest/v1/users?${filter}`,
          SUPABASE_SERVICE_ROLE_KEY,
          { method: "PATCH", body: JSON.stringify({ stripe_customer_id: customerId }) }
        );
        if (!saved.ok) {
          console.error("create-checkout: could not save stripe_customer_id (billing migration applied?)", saved.status);
        }
      }
    }

    const origin = "https://www.japanofferai.com";
    const sessionParams = {
      mode: product.mode,
      customer: customerId,
      "line_items[0][price]": priceId,
      "line_items[0][quantity]": "1",
      success_url: `${origin}/pricing.html?checkout=success&session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${origin}/pricing.html?checkout=cancelled`,
      "metadata[user_id]": authUser.id,
      "metadata[product]": product.key,
      "metadata[credits]": String(product.credits || 0),
    };
    if (product.mode === "subscription") {
      sessionParams["subscription_data[metadata][user_id]"] = authUser.id;
      sessionParams["subscription_data[metadata][product]"] = product.key;
    }

    const session = await stripePost("/v1/checkout/sessions", STRIPE_SECRET_KEY, sessionParams);
    if (!session.ok || !session.data || !session.data.url || !session.data.id) {
      console.error("create-checkout: Stripe session create failed", session.status);
      return res.status(500).json({ error: "Could not start checkout. Please try again." });
    }

    // Record the pending order. Best-effort: if the `orders` table does not
    // exist yet (migration not applied), log and continue — the webhook is
    // the source of truth for fulfilment.
    const order = await supabaseFetch(`${SUPABASE_URL}/rest/v1/orders`, SUPABASE_SERVICE_ROLE_KEY, {
      method: "POST",
      body: JSON.stringify({
        user_id: authUser.id,
        stripe_session_id: session.data.id,
        stripe_customer_id: customerId,
        product: product.key,
        amount_gbp: product.priceGbp,
        credits_granted: product.credits || 0,
        status: "pending",
      }),
    });
    if (!order.ok) {
      console.error("create-checkout: could not record pending order (billing migration applied?)", order.status);
    }

    return res.status(200).json({ url: session.data.url });
  } catch (error) {
    // Never echo internal error details to the client.
    console.error("create-checkout: unexpected error", error);
    return res.status(500).json({ error: "Unexpected server error." });
  }
}
