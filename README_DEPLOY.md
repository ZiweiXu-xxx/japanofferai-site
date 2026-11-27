# JapanOffer AI Website - Vercel Deployment Guide

This folder is a static website for JapanOffer AI.

## Before launch

> Historical note (2026-11-27): this guide used to say "open `index.html`
> and replace `YOUR_WENJUANXING_LINK_HERE` with your final Wenjuanxing
> link". That placeholder no longer exists anywhere in the code — the
> survey link step is obsolete and has been removed from this guide.
> Do not search for it.

Check the Vercel Environment Variables before deploying:

- `SUPABASE_URL` and `SUPABASE_ANON_KEY` — used by `/api/analyze` to
  verify a caller's Supabase access token (the anon key is also embedded
  in `auth-config.js` for the browser client).
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

## Included files

- `index.html` - the website page
- `styles.css` - website styling
- `api/` - Vercel Serverless Functions (`analyze`, `jobs`,
  `search-real-jobs`, `import-public-jobs`, `cron-import-jobs`)
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
