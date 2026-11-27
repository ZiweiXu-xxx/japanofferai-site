// JapanOffer AI Stripe webhook.
//
// POST /api/stripe-webhook — called by Stripe, never by the browser.
// Verifies the Stripe-Signature header (HMAC SHA256, 5-minute tolerance)
// with STRIPE_WEBHOOK_SECRET. A bad signature returns 400 and nothing is
// processed. Verified events return 200 once handled; a processing failure
// returns 500 so Stripe retries delivery.
//
// Events handled:
// - checkout.session.completed — payment: grant paid credits and mark the
//   order completed. subscription: activate Premium for the current period.
// - invoice.payment_succeeded — Premium monthly renewal: reset the month's
//   20-credit allowance to the new billing period.
// - customer.subscription.deleted — Premium cancelled: remove Premium access.
// - customer.subscription.updated — sync the stored subscription status.
//
// Duplicate delivery protection: every processed Stripe event id is stored
// in the `stripe_events` table (see supabase/migrations/20261127_stripe_billing.sql).
// A repeated event id is acknowledged with 200 and not applied twice.
// Fulfilment is also guarded per order / per billing period so a retry
// after a partial write cannot double-grant credits.
//
// Raw body: the signature covers the exact bytes Stripe sent, so the body
// is read from the request stream (same pattern as api/import-public-jobs.js).
// If Vercel has already parsed the body, the handler falls back to
// re-serialising req.body — note that this fallback can fail verification
// if the serialisation differs from Stripe's bytes, so test the endpoint
// with the Stripe CLI after deploy (see STRIPE.md).

import { createHmac, timingSafeEqual } from "node:crypto";
import { getProduct } from "../config/pricing.js";

const SIGNATURE_TOLERANCE_SECONDS = 300; // 5 minutes

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

async function stripeGet(path, secretKey) {
  const res = await fetch(`https://api.stripe.com${path}`, {
    method: "GET",
    headers: stripeHeaders(secretKey),
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

// --- Signature verification --------------------------------------------------
function verifyStripeSignature(rawBody, signatureHeader, secret) {
  if (!signatureHeader || !secret) return false;
  const parts = String(signatureHeader)
    .split(",")
    .map((p) => p.trim().split("="));
  const timestamp = parts.find(([k]) => k === "t")?.[1];
  const signatures = parts.filter(([k]) => k === "v1").map(([, v]) => v);
  if (!timestamp || signatures.length === 0) return false;

  const age = Math.abs(Math.floor(Date.now() / 1000) - Number(timestamp));
  if (!Number.isFinite(age) || age > SIGNATURE_TOLERANCE_SECONDS) return false;

  const expected = createHmac("sha256", secret).update(`${timestamp}.${rawBody}`).digest("hex");
  return signatures.some((sig) => {
    try {
      const a = Buffer.from(sig, "hex");
      const b = Buffer.from(expected, "hex");
      return a.length === b.length && timingSafeEqual(a, b);
    } catch {
      return false;
    }
  });
}

async function readRawBody(req) {
  // Primary path: read the request stream untouched.
  try {
    const chunks = [];
    for await (const chunk of req) chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk));
    if (chunks.length) return Buffer.concat(chunks).toString("utf8");
  } catch {
    // Fall through to the parsed-body fallback below.
  }
  // Fallback: Vercel may have parsed the JSON body already. Re-serialising
  // can differ from Stripe's exact bytes, so verification may fail; the
  // endpoint must be tested with the Stripe CLI after deploy.
  if (req.body) {
    return typeof req.body === "string" ? req.body : JSON.stringify(req.body);
  }
  return "";
}

function periodEndIso(unixSeconds) {
  if (!unixSeconds) return null;
  const d = new Date(Number(unixSeconds) * 1000);
  return Number.isNaN(d.getTime()) ? null : d.toISOString();
}

// --- Fulfilment --------------------------------------------------------------
// Grant one-off credits for a completed payment Checkout Session.
// Idempotent: if the order is already marked completed, nothing is granted.
async function fulfilPaymentOrder(ctx, session) {
  const { supabaseUrl, serviceKey } = ctx;
  const userId = String((session.metadata && session.metadata.user_id) || "");
  const productKey = String((session.metadata && session.metadata.product) || "");
  const credits = Number((session.metadata && session.metadata.credits) || 0) || 0;
  if (!userId || !productKey) throw new Error("checkout.session.completed is missing metadata");

  const product = getProduct(productKey);
  const granted = credits > 0 ? credits : product ? product.credits || 0 : 0;

  const orderRes = await supabaseFetch(
    `${supabaseUrl}/rest/v1/orders?stripe_session_id=eq.${encodeURIComponent(session.id)}&select=id,status,credits_granted`,
    serviceKey
  );
  const order = orderRes.ok && Array.isArray(orderRes.data) ? orderRes.data[0] : null;
  if (order && order.status === "completed") return { skipped: true, reason: "order already completed" };

  const userRes = await supabaseFetch(
    `${supabaseUrl}/rest/v1/users?id=eq.${encodeURIComponent(userId)}&select=id,paid_credits`,
    serviceKey
  );
  const user = userRes.ok && Array.isArray(userRes.data) ? userRes.data[0] : null;
  if (!user) throw new Error("user row not found for checkout session");

  const updated = await supabaseFetch(
    `${supabaseUrl}/rest/v1/users?id=eq.${encodeURIComponent(userId)}`,
    serviceKey,
    { method: "PATCH", body: JSON.stringify({ paid_credits: Number(user.paid_credits || 0) + granted }) }
  );
  if (!updated.ok) throw new Error("could not grant paid credits");

  if (order) {
    await supabaseFetch(
      `${supabaseUrl}/rest/v1/orders?id=eq.${encodeURIComponent(order.id)}`,
      serviceKey,
      { method: "PATCH", body: JSON.stringify({ status: "completed" }) }
    );
  }
  return { skipped: false, creditsGranted: granted };
}

// Activate Premium for the current billing period.
// Idempotent: if the stored period end already matches, nothing changes.
async function activatePremium(ctx, userId, periodEndIsoValue, customerId) {
  const { supabaseUrl, serviceKey } = ctx;
  if (!userId || !periodEndIsoValue) throw new Error("cannot activate premium without user and period end");

  const userRes = await supabaseFetch(
    `${supabaseUrl}/rest/v1/users?id=eq.${encodeURIComponent(userId)}&select=id,subscription_status,subscription_current_period_end`,
    serviceKey
  );
  const user = userRes.ok && Array.isArray(userRes.data) ? userRes.data[0] : null;
  if (!user) throw new Error("user row not found for subscription");

  if (
    user.subscription_status === "active" &&
    user.subscription_current_period_end === periodEndIsoValue
  ) {
    return { skipped: true, reason: "premium already active for this period" };
  }

  const patch = {
    subscription_status: "active",
    subscription_current_period_end: periodEndIsoValue,
    premium_credits_used: 0,
    premium_credits_reset_at: periodEndIsoValue,
  };
  if (customerId) patch.stripe_customer_id = customerId;

  const updated = await supabaseFetch(
    `${supabaseUrl}/rest/v1/users?id=eq.${encodeURIComponent(userId)}`,
    serviceKey,
    { method: "PATCH", body: JSON.stringify(patch) }
  );
  if (!updated.ok) throw new Error("could not activate premium");
  return { skipped: false };
}

async function findUserByCustomer(ctx, customerId) {
  const { supabaseUrl, serviceKey } = ctx;
  const res = await supabaseFetch(
    `${supabaseUrl}/rest/v1/users?stripe_customer_id=eq.${encodeURIComponent(customerId)}&select=id,subscription_status,subscription_current_period_end,premium_credits_reset_at`,
    serviceKey
  );
  if (!res.ok) throw new Error("user lookup by stripe customer failed");
  return Array.isArray(res.data) ? res.data[0] || null : null;
}

async function handleEvent(ctx, event) {
  const { supabaseUrl, serviceKey, stripeSecret } = ctx;
  const type = event.type;
  const obj = event.data && event.data.object ? event.data.object : {};

  if (type === "checkout.session.completed") {
    if (obj.mode === "subscription" && obj.subscription) {
      // Premium subscription: fetch the subscription for its period end.
      const sub = await stripeGet(`/v1/subscriptions/${encodeURIComponent(obj.subscription)}`, stripeSecret);
      if (!sub.ok || !sub.data) throw new Error("could not fetch subscription after checkout");
      const periodEnd = periodEndIso(sub.data.current_period_end);
      await activatePremium(ctx, String((obj.metadata && obj.metadata.user_id) || ""), periodEnd, String(obj.customer || ""));
      return { handled: true };
    }
    await fulfilPaymentOrder(ctx, obj);
    return { handled: true };
  }

  if (type === "invoice.payment_succeeded") {
    // Monthly renewal: reset the month's Premium allowance.
    if (!obj.subscription || !obj.customer) return { handled: false, reason: "invoice has no subscription" };
    const sub = await stripeGet(`/v1/subscriptions/${encodeURIComponent(obj.subscription)}`, stripeSecret);
    if (!sub.ok || !sub.data) throw new Error("could not fetch subscription for invoice");
    const periodEnd = periodEndIso(sub.data.current_period_end);
    const user = await findUserByCustomer(ctx, String(obj.customer));
    if (!user) throw new Error("no user for invoice customer");
    if (user.premium_credits_reset_at === periodEnd) {
      return { handled: true, skipped: true, reason: "period already reset" };
    }
    const updated = await supabaseFetch(
      `${supabaseUrl}/rest/v1/users?id=eq.${encodeURIComponent(user.id)}`,
      serviceKey,
      {
        method: "PATCH",
        body: JSON.stringify({
          subscription_status: "active",
          subscription_current_period_end: periodEnd,
          premium_credits_used: 0,
          premium_credits_reset_at: periodEnd,
        }),
      }
    );
    if (!updated.ok) throw new Error("could not reset premium credits");
    return { handled: true };
  }

  if (type === "customer.subscription.deleted") {
    if (!obj.customer) return { handled: false, reason: "subscription has no customer" };
    const user = await findUserByCustomer(ctx, String(obj.customer));
    if (!user) throw new Error("no user for deleted subscription");
    const updated = await supabaseFetch(
      `${supabaseUrl}/rest/v1/users?id=eq.${encodeURIComponent(user.id)}`,
      serviceKey,
      { method: "PATCH", body: JSON.stringify({ subscription_status: "cancelled" }) }
    );
    if (!updated.ok) throw new Error("could not mark subscription cancelled");
    return { handled: true };
  }

  if (type === "customer.subscription.updated") {
    if (!obj.customer) return { handled: false, reason: "subscription has no customer" };
    const user = await findUserByCustomer(ctx, String(obj.customer));
    if (!user) throw new Error("no user for updated subscription");
    const status = obj.status === "active" ? "active" : obj.status === "trialing" ? "active" : "past_due";
    const periodEnd = periodEndIso(obj.current_period_end);
    const patch = { subscription_status: obj.cancel_at_period_end ? "cancel_at_period_end" : status };
    if (periodEnd) patch.subscription_current_period_end = periodEnd;
    const updated = await supabaseFetch(
      `${supabaseUrl}/rest/v1/users?id=eq.${encodeURIComponent(user.id)}`,
      serviceKey,
      { method: "PATCH", body: JSON.stringify(patch) }
    );
    if (!updated.ok) throw new Error("could not sync subscription status");
    return { handled: true };
  }

  // Any other event type: acknowledge, do nothing.
  return { handled: false, reason: `ignored event type ${type}` };
}

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const SUPABASE_URL = (process.env.SUPABASE_URL || "").replace(/\/+$/, "");
  const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
  const STRIPE_SECRET_KEY = process.env.STRIPE_SECRET_KEY;
  const STRIPE_WEBHOOK_SECRET = process.env.STRIPE_WEBHOOK_SECRET;
  if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY || !STRIPE_SECRET_KEY || !STRIPE_WEBHOOK_SECRET) {
    console.error("stripe-webhook: server environment variables are missing.");
    return res.status(500).json({ error: "Server environment variables are missing." });
  }

  const rawBody = await readRawBody(req);
  const signature = req.headers["stripe-signature"] || req.headers["Stripe-Signature"] || "";
  if (!rawBody || !verifyStripeSignature(rawBody, signature, STRIPE_WEBHOOK_SECRET)) {
    return res.status(400).json({ error: "Invalid webhook signature." });
  }

  let event;
  try {
    event = JSON.parse(rawBody);
  } catch {
    return res.status(400).json({ error: "Invalid webhook payload." });
  }
  if (!event || !event.id || !event.type) {
    return res.status(400).json({ error: "Invalid webhook payload." });
  }

  const ctx = { supabaseUrl: SUPABASE_URL, serviceKey: SUPABASE_SERVICE_ROLE_KEY, stripeSecret: STRIPE_SECRET_KEY };

  // Duplicate delivery protection.
  const seen = await supabaseFetch(
    `${SUPABASE_URL}/rest/v1/stripe_events?event_id=eq.${encodeURIComponent(event.id)}&select=event_id`,
    SUPABASE_SERVICE_ROLE_KEY
  );
  if (seen.ok && Array.isArray(seen.data) && seen.data.length > 0) {
    return res.status(200).json({ received: true, duplicate: true });
  }
  if (!seen.ok) {
    console.error("stripe-webhook: could not check stripe_events (billing migration applied?)", seen.status);
    // Continue: the per-order / per-period guards still prevent double
    // granting, but the operator should apply the migration.
  }

  try {
    const result = await handleEvent(ctx, event);
    if (result && result.handled === false) {
      console.error("stripe-webhook: event not applied", event.type, result.reason || "");
    }
  } catch (error) {
    // Return 500 so Stripe retries the delivery later.
    console.error("stripe-webhook: event handling failed", event.id, event.type, error);
    return res.status(500).json({ error: "Webhook handling failed." });
  }

  // Record the event id only after successful handling.
  const recorded = await supabaseFetch(`${SUPABASE_URL}/rest/v1/stripe_events`, SUPABASE_SERVICE_ROLE_KEY, {
    method: "POST",
    body: JSON.stringify({ event_id: event.id, type: event.type }),
  });
  if (!recorded.ok) {
    console.error("stripe-webhook: could not record event id (billing migration applied?)", recorded.status);
  }

  return res.status(200).json({ received: true });
}
