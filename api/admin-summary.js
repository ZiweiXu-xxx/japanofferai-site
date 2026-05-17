// JapanOffer AI admin summary API
// Step 16: robust Supabase REST reader with better key handling and diagnostics.
// Environment variables needed in Vercel:
// SUPABASE_URL
// SUPABASE_SERVICE_ROLE_KEY
// ADMIN_PASSWORD

function clean(value) {
  return String(value || "")
    .trim()
    .replace(/^['"]|['"]$/g, "")
    .replace(/\s+/g, "");
}

function cleanUrl(value) {
  return clean(value).replace(/\/rest\/v1\/?$/i, "").replace(/\/+$/g, "");
}

function json(res, status, data) {
  res.statusCode = status;
  res.setHeader("Content-Type", "application/json; charset=utf-8");
  res.setHeader("Cache-Control", "no-store");
  res.end(JSON.stringify(data));
}

async function supabaseGet(path, params = "") {
  const supabaseUrl = cleanUrl(process.env.SUPABASE_URL);
  const key = clean(process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SECRET_KEY);

  if (!supabaseUrl || !key) {
    throw new Error("Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in Vercel Environment Variables.");
  }

  const url = `${supabaseUrl}/rest/v1/${path}${params}`;
  const response = await fetch(url, {
    method: "GET",
    headers: {
      "apikey": key,
      "Authorization": `Bearer ${key}`,
      "Content-Type": "application/json",
      "Accept": "application/json",
      "Prefer": "count=exact"
    }
  });

  const text = await response.text();
  let body = null;
  try {
    body = text ? JSON.parse(text) : null;
  } catch {
    body = text;
  }

  if (!response.ok) {
    const keyHint = key.startsWith("eyJ")
      ? "legacy_jwt_key"
      : key.startsWith("sb_secret_")
        ? "new_secret_key"
        : key.startsWith("sb_publishable_")
          ? "publishable_key_wrong_for_admin"
          : "unknown_key_format";

    const detail = typeof body === "string" ? body : JSON.stringify(body);
    const err = new Error(`Supabase REST error ${response.status}: ${detail}`);
    err.status = response.status;
    err.detail = body;
    err.debug = {
      supabaseUrl,
      keyTypeDetected: keyHint,
      keyLength: key.length,
      endpoint: url.replace(supabaseUrl, "[SUPABASE_URL]")
    };
    throw err;
  }

  return body || [];
}

function countBy(rows, field) {
  const counts = {};
  for (const row of rows || []) {
    const value = row && row[field] ? String(row[field]) : "Unknown";
    counts[value] = (counts[value] || 0) + 1;
  }
  return Object.entries(counts)
    .map(([name, count]) => ({ name, count }))
    .sort((a, b) => b.count - a.count);
}

function average(rows, field) {
  const nums = (rows || [])
    .map((row) => Number(row && row[field]))
    .filter((n) => Number.isFinite(n));
  if (!nums.length) return 0;
  return Math.round(nums.reduce((a, b) => a + b, 0) / nums.length);
}

module.exports = async function handler(req, res) {
  if (req.method !== "POST") {
    return json(res, 405, { error: "Method not allowed" });
  }

  try {
    const adminPassword = clean(process.env.ADMIN_PASSWORD);
    const chunks = [];
    for await (const chunk of req) chunks.push(chunk);
    const raw = Buffer.concat(chunks).toString("utf8");
    let payload = {};
    try {
      payload = raw ? JSON.parse(raw) : {};
    } catch {
      payload = {};
    }

    if (!adminPassword || clean(payload.password) !== adminPassword) {
      return json(res, 401, { error: "Invalid admin password" });
    }

    const reports = await supabaseGet(
      "report_submissions",
      "?select=*&order=created_at.desc&limit=200"
    );

    const events = await supabaseGet(
      "page_events",
      "?select=*&order=created_at.desc&limit=500"
    );

    const uniqueVisitors = new Set(
      (events || []).map((e) => e.visitor_id || e.session_id || e.anonymous_id).filter(Boolean)
    ).size;

    const summary = {
      totalReports: reports.length,
      totalEvents: events.length,
      uniqueVisitors,
      averageScore: average(reports, "match_score"),
      markets: countBy(reports, "market"),
      careers: countBy(reports, "career"),
      languages: countBy(reports, "languages"),
      recentReports: reports.slice(0, 20),
      recentEvents: events.slice(0, 30)
    };

    return json(res, 200, summary);
  } catch (error) {
    return json(res, 500, {
      error: error.message || "Unknown admin summary error",
      detail: error.detail || null,
      debug: error.debug || null,
      note: "If this says Invalid API key, check that Vercel SUPABASE_SERVICE_ROLE_KEY is the Legacy service_role JWT starting with eyJ, with no quotes/spaces/newlines, and then redeploy."
    });
  }
};
