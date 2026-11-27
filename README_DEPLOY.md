# JapanOffer AI Website - Vercel Deployment Guide

This folder is a static website for JapanOffer AI.

## Before launch

> Historical note (2026-11-27): this guide used to say "open `index.html`
> and replace `YOUR_WENJUANXING_LINK_HERE` with your final Wenjuanxing
> link". That placeholder no longer exists anywhere in the code — the
> survey link step is obsolete and has been removed from this guide.
> Do not search for it.

Check the Vercel Environment Variables before deploying:

- `SUPABASE_URL` and `SUPABASE_PUBLISHABLE_KEY` — used by the `/api/*`
  functions to verify a caller's Supabase access token. Prefer the new
  `SUPABASE_PUBLISHABLE_KEY` (already configured on Vercel);
  `SUPABASE_ANON_KEY` is only a legacy fallback and is no longer
  required. (The browser client uses the key embedded in `auth-config.js`.)
- `SUPABASE_SERVICE_ROLE_KEY` — server-side Supabase access for
  `/api/analyze` and `/api/import-public-jobs`.
- `OPENAI_API_KEY` — used by `/api/analyze` (gpt-4o-mini).
- `ADZUNA_APP_ID` / `ADZUNA_APP_KEY` — used by `/api/search-real-jobs`
  and the job importer.
- `ADMIN_PASSWORD` — shared password for the admin dashboard and the
  manual job import endpoint.
- `CRON_SECRET` — long random string; Vercel Cron sends it as
  `Authorization: Bearer <CRON_SECRET>` to `/api/cron-import-jobs`
  (daily 02:00 UTC). Never commit secrets to the repo.

### Stripe billing (test mode first)

- `STRIPE_SECRET_KEY` — Stripe **test** secret key (`sk_test_…`). The
  server refuses any key that does not start with `sk_test_` until live
  billing is explicitly approved. Never commit it; never send it in chat.
- `STRIPE_PUBLISHABLE_KEY` — Stripe **test** publishable key (`pk_test_…`).
  Reserved for future Stripe.js use; the current Checkout redirect flow
  does not need it in the browser.
- `STRIPE_WEBHOOK_SECRET` — signing secret (`whsec_…`) for the webhook
  endpoint below. Get it from Stripe Dashboard -> Developers -> Webhooks
  after adding the endpoint (test mode).
- `STRIPE_PRICE_SINGLE` — Stripe Price ID for the single report (£4.99).
- `STRIPE_PRICE_PACK` — Stripe Price ID for the 5-report pack (£14.99).
- `STRIPE_PRICE_PREMIUM` — Stripe Price ID for Premium monthly (£19.99).
  Create the three prices in Stripe Dashboard (test mode, GBP, one-off for
  single/pack, recurring monthly for Premium) and paste the `price_…` IDs
  into Vercel Environment Variables. Prices shown on the site come from
  `config/pricing.js`; the Price IDs only tell Stripe which price to charge.

### Stripe setup steps (test mode)

1. In the Stripe Dashboard (switch to **Test mode**), create three
   products with prices in GBP: Single AI Report £4.99 (one-time),
   5-Report Pack £14.99 (one-time), Premium Monthly £19.99 (recurring,
   monthly). Copy the three `price_…` IDs into the env vars above.
2. Add a webhook endpoint: `https://www.japanofferai.com/api/stripe-webhook`
   (test mode), subscribe to `checkout.session.completed`,
   `invoice.payment_succeeded`, `customer.subscription.deleted` and
   `customer.subscription.updated`. Copy the signing secret into
   `STRIPE_WEBHOOK_SECRET`.
3. In Supabase Dashboard -> SQL Editor, run
   `supabase/migrations/20261127_stripe_billing.sql` (creates the `orders`
   and `stripe_events` tables and adds billing columns to `users`).
   The rollback is `supabase/migrations/20261127_stripe_billing_rollback.sql`
   — only run it with the project owner's explicit approval; it deletes
   order history.
4. Deploy, then test with the Stripe CLI:
   `stripe listen --forward-to https://www.japanofferai.com/api/stripe-webhook`
   and `stripe trigger checkout.session.completed` (test mode).
   Confirm the webhook returns 200 and credits land in the `users` table.

## Included files

- `index.html` - the website page
- `styles.css` - website styling
- `api/` - Vercel Serverless Functions (`analyze`, `jobs`,
  `search-real-jobs`, `import-public-jobs`, `cron-import-jobs`,
  `create-checkout`, `stripe-webhook`, `credits`, `cancel-subscription`,
  `pricing`)
- `config/pricing.js` - billing configuration (prices, credits, free
  report). All prices are in GBP; Stripe Price IDs come from env vars.
- `billing.js` - shared frontend helper for credits display, plan box
  and Stripe Checkout buttons (used by `pricing.html`, `report.html`,
  `match.html`, `account.html`)
- `pricing.html` - pricing page (Free / Single / Pack / Premium)
- `supabase/migrations/` - database migrations, including
  `20261127_stripe_billing.sql` (orders, stripe_events, users billing
  columns) and its rollback file
- `assets/images/dashboard-preview.png` - prototype dashboard preview
- `assets/materials/JapanOffer_AI_Prototype.pdf` - product prototype
- `assets/materials/JapanOffer_AI_One_Page_Memo.pdf` - one-page memo PDF
- `assets/materials/JapanOffer_AI_Whitepaper.pdf` - whitepaper PDF
- Original DOCX files are also included in `assets/materials/` as backups.

## Recommended deployment method

1. Create a GitHub account if you do not already have one.
2. Create a new repository called `japanofferai-site`.
3. Upload all files in this folder to the repository.
4. Go to Vercel and import the GitHub repository.
5. Deploy it as a static site.
6. In Vercel, go to Project Settings -> Domains.
7. Add `japanofferai.com`.
8. Follow the DNS instructions Vercel gives you.
9. Go to Namecheap -> Domain List -> japanofferai.com -> Manage -> Advanced DNS.
10. Add or edit the DNS records exactly as Vercel tells you.

## Typical Namecheap DNS setup for Vercel

Vercel usually asks for records like these:

- Type: A Record, Host: @, Value: 76.76.21.21
- Type: CNAME Record, Host: www, Value: cname.vercel-dns.com

Use the values Vercel shows in your own dashboard if they differ.

DNS can take several minutes to several hours to fully update.
