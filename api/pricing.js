// JapanOffer AI public pricing endpoint.
//
// GET /api/pricing — no login required. Returns the pricing table from
// config/pricing.js so the pricing page (and any other page) always shows
// the configured prices instead of hard-coded amounts.
import { CURRENCY, FREE_REPORTS, PREMIUM_CREDITS_PER_MONTH, listProducts, formatPrice } from "../config/pricing.js";

export default async function handler(req, res) {
  if (req.method !== "GET") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const products = listProducts().map((p) => ({
    key: p.key,
    name: p.name,
    tagline: p.tagline,
    mode: p.mode,
    price_gbp: p.priceGbp,
    price_display: formatPrice(p.priceGbp),
    credits: p.credits || null,
    credits_per_month: p.creditsPerMonth || null,
  }));

  return res.status(200).json({
    currency: CURRENCY,
    free_reports: FREE_REPORTS,
    premium_credits_per_month: PREMIUM_CREDITS_PER_MONTH,
    products,
  });
}
