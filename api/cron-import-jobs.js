// JapanOffer AI daily job import (Vercel Cron).
//
// Runs once a day (see vercel.json `crons`; the Vercel Hobby plan allows at
// most one cron per day, so this is the maximum frequency on the free tier).
// It reuses /api/import-public-jobs by calling it server-side, so no import
// logic is duplicated here. It also deactivates platform_items rows that
// have not been seen for 30 days, so expired jobs leave the public list.
//
// Authentication: Vercel sends `Authorization: Bearer <CRON_SECRET>` on
// cron invocations. The secret must be set in Vercel Environment Variables
// as CRON_SECRET (generate a long random string; never commit it).
// This endpoint is NOT reachable without that secret.
//
// Required Vercel env vars:
//   CRON_SECRET, ADMIN_PASSWORD
// Optional (for stale-job deactivation; skipped silently if missing):
//   SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY (or SUPABASE_LEGACY_SERVICE_ROLE_KEY)

const crypto = require("crypto");

const STALE_AFTER_DAYS = 30;

function json(res, status, data) {
  res.statusCode = status;
  res.setHeader("Content-Type", "application/json; charset=utf-8");
  res.setHeader("Cache-Control", "no-store");
  res.end(JSON.stringify(data));
}

function clean(value) {
  return String(value || "").trim();
}

// Timing-safe comparison of the cron secret (SHA-256 first so the
// comparison is constant-time regardless of secret length).
function secretsMatch(provided, expected) {
  const a = crypto.createHash("sha256").update(String(provided || "")).digest();
  const b = crypto.createHash("sha256").update(String(expected || "")).digest();
  return crypto.timingSafeEqual(a, b);
}

// Set is_active=false for jobs not seen in STALE_AFTER_DAYS. Returns the
// number of affected rows, or null when Supabase is not configured.
// Failures are reported to the caller but do not fail the whole cron run.
async function deactivateStaleJobs() {
  const url = clean(process.env.SUPABASE_URL || process.env.JAPANOFFER_SUPABASE_URL);
  const key = clean(
    process.env.SUPABASE_SERVICE_ROLE_KEY ||
    process.env.SUPABASE_LEGACY_SERVICE_ROLE_KEY ||
    ""
  );
  if (!url || !key) return null;

  const cutoff = new Date(Date.now() - STALE_AFTER_DAYS * 24 * 60 * 60 * 1000).toISOString();
  const response = await fetch(
    `${url.replace(/\/+$/, "")}/rest/v1/platform_items?last_seen_at=lt.${encodeURIComponent(cutoff)}&is_active=eq.true`,
    {
      method: "PATCH",
      headers: {
        apikey: key,
        Authorization: `Bearer ${key}`,
        "Content-Type": "application/json",
        Prefer: "return=representation"
      },
      body: JSON.stringify({ is_active: false })
    }
  );

  if (!response.ok) {
    const text = await response.text();
    throw new Error(`Stale-job deactivation failed (HTTP ${response.status}): ${text.slice(0, 200)}`);
  }

  const rows = await response.json().catch(() => null);
  return Array.isArray(rows) ? rows.length : 0;
}

module.exports = async function handler(req, res) {
  if (req.method !== "GET") {
    return json(res, 405, { ok: false, error: "Use GET." });
  }

  const secret = process.env.CRON_SECRET;
  const auth = req.headers.authorization || "";
  const token = auth.startsWith("Bearer ") ? auth.slice("Bearer ".length).trim() : "";

  if (!secret || !secretsMatch(token, secret)) {
    return json(res, 401, { ok: false, error: "Unauthorized." });
  }

  if (!process.env.ADMIN_PASSWORD) {
    return json(res, 500, { ok: false, error: "ADMIN_PASSWORD is not configured." });
  }

  try {
    // Reuse the existing importer instead of duplicating its logic. The
    // call stays inside the same deployment; the admin password never
    // leaves the server.
    const proto = req.headers["x-forwarded-proto"] || "https";
    const host = req.headers.host;
    if (!host) {
      // Vercel always sends Host on real cron invocations; without it
      // there is no address to call back into, so fail loudly instead
      // of fetching https://undefined/...
      return json(res, 500, { ok: false, error: "Missing host header." });
    }
    const importUrl = `${proto}://${host}/api/import-public-jobs`;

    const importResponse = await fetch(importUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        password: process.env.ADMIN_PASSWORD,
        maxPerKeyword: 5
      })
    });

    const importData = await importResponse.json().catch(() => ({}));
    if (!importResponse.ok) {
      console.error("cron-import-jobs: import failed", importResponse.status, importData);
      return json(res, 502, {
        ok: false,
        error: "Job import failed.",
        status: importResponse.status
      });
    }

    let staleDeactivated = null;
    let staleError = null;
    try {
      staleDeactivated = await deactivateStaleJobs();
    } catch (error) {
      staleError = error.message;
      console.error("cron-import-jobs: stale deactivation failed", error);
    }

    return json(res, 200, {
      ok: true,
      imported: importData.imported ?? null,
      rawCount: importData.rawCount ?? null,
      relevantCount: importData.relevantCount ?? null,
      errors: importData.errors || [],
      staleDeactivated,
      staleError
    });
  } catch (error) {
    console.error("cron-import-jobs: unexpected error", error);
    return json(res, 500, { ok: false, error: "Unexpected server error." });
  }
};
