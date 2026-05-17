# JapanOffer AI Website - Vercel Deployment Guide

This folder is a static website for JapanOffer AI.

## Included files

- `index.html` - the website page
- `styles.css` - website styling
- `assets/images/dashboard-preview.png` - prototype dashboard preview
- `assets/materials/JapanOffer_AI_Prototype.pdf` - product prototype
- `assets/materials/JapanOffer_AI_One_Page_Memo.pdf` - one-page memo PDF
- `assets/materials/JapanOffer_AI_Whitepaper.pdf` - whitepaper PDF
- Original DOCX files are also included in `assets/materials/` as backups.

## Before launch

Open `index.html` and search for:

`YOUR_WENJUANXING_LINK_HERE`

Replace it with your final Wenjuanxing link.

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
