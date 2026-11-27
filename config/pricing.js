// JapanOffer AI billing configuration — single source of truth.
//
// All prices are in GBP. Change a value here and the whole site follows:
// the pricing page (via /api/pricing), Checkout Sessions and credit grants
// all read from this file. Never hard-code an amount anywhere else.
//
// Stripe Price IDs are NOT stored here. They come from Vercel environment
// variables (STRIPE_PRICE_SINGLE / STRIPE_PRICE_PACK / STRIPE_PRICE_PREMIUM)
// and must be created in the Stripe Dashboard (test mode first).
// If a Price ID env var is missing, checkout fails loudly with a generic
// "payments not configured" error instead of silently falling back.

export const CURRENCY = "GBP";

// Free match reports granted to every newly registered user.
export const FREE_REPORTS = 1;

// Match reports included in a Premium subscription, per billing month.
export const PREMIUM_CREDITS_PER_MONTH = 20;

export const PRODUCTS = {
  single: {
    key: "single",
    name: "Single Match Report",
    tagline: "One structured match report, no subscription.",
    // Credits granted when the Checkout Session completes.
    credits: 1,
    priceGbp: 4.99,
    mode: "payment",
    priceEnvVar: "STRIPE_PRICE_SINGLE",
  },
  pack: {
    key: "pack",
    name: "5-Report Pack",
    tagline: "Five structured match reports, use any time.",
    credits: 5,
    priceGbp: 14.99,
    mode: "payment",
    priceEnvVar: "STRIPE_PRICE_PACK",
  },
  premium: {
    key: "premium",
    name: "Premium Monthly",
    tagline: "Monthly match reports plus premium job-search features.",
    creditsPerMonth: 20,
    priceGbp: 19.99,
    mode: "subscription",
    priceEnvVar: "STRIPE_PRICE_PREMIUM",
  },
};

export function getProduct(key) {
  if (typeof key !== "string") return null;
  return PRODUCTS[key.trim().toLowerCase()] || null;
}

export function listProducts() {
  return Object.values(PRODUCTS);
}

// Resolve the Stripe Price ID for a product from the environment.
// Throws if the env var is missing — callers turn this into a generic
// 500 ("Payments are not configured yet.") and never leak the var name.
export function getPriceId(product) {
  const id = (process.env[product.priceEnvVar] || "").trim();
  if (!id) {
    throw new Error(`Stripe price is not configured for product: ${product.key}`);
  }
  return id;
}

// Stripe takes integer minor units (pence). Derive from the GBP price so
// the amount always follows the config value above.
export function toMinorUnits(gbp) {
  return Math.round(Number(gbp) * 100);
}

export function formatPrice(gbp) {
  return `\u00a3${Number(gbp).toFixed(2)}`;
}
