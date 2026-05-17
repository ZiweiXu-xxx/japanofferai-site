// JapanOffer AI admin summary API
// Step 17: bypass possible stale/corrupted Vercel env var by reading a new variable first.
// Add this new Vercel Environment Variable:
// SUPABASE_LEGACY_SERVICE_ROLE_KEY
// Value: Supabase API Keys (Legacy) -> service_role -> Copy

function clean(value) {
  return String(value || "")
    .trim()
    .replace(/^['"]|['"]$/g, "")
    .replace(/\r?\n|\r/g, "")
    .replace(/\s/g, "");
}

function cleanUrl(value) {
  return clean(value)
    .replace(/\/rest\/v1\/?$/i, "")
    .replace(/\/+$/g, "");
}

function json(res, status, data) {
  res.statusCode = status;
  res.setHeader("Content-Type", "application/json; charset=utf-8");
  res.setHeader("Cache-Control", "no-store");
  res.end(JSON.stringify(data));
}

function keyType(key) {
  if (!key) return "missing";
  if (key.startsWith("eyJ")) return "legacy_service_role_jwt_expected";
  if (key.startsWith("sb_secret_")) return "new_secret_key_may_not_work_with_this_rest_call";
  if (key.startsWith("sb_publishable_")) return "publishable_key_wrong_for_admin";
  return "unknown_format";
}

async function supabaseGet(path, params = "") {
  const supabaseUrl = cleanUrl(process.env.SUPABASE_URL);

  // New variable name first, to avoid Vercel keeping an old/corrupted value under the old name.
  const key = clean(
    process.env.SUPABASE_LEGACY_SERVICE_ROLE_KEY ||
    process.env.SUPABASE_SERVICE_ROLE_KEY ||
    process.env.SUPABASE_SECRET_KEY
  );

  if (!supabaseUrl || !key) {
    throw Object.assign(
      new Error("Missing SUPABASE_URL or service role key in Vercel Environment Variables."),
      {
        debug: {
          hasSupabaseUrl: Boolean(supabaseUrl),
          hasNewLegacyKey: Boolean(process.env.SUPABASE_LEGACY_SERVICE_ROLE_KEY),
          hasOldServiceRoleKey: Boolean(process.env.SUPABASE_SERVICE_ROLE_KEY),
          detectedKeyType: keyType(key),
          keyLength: key.length
        }
      }
    );
  }

  const url = `${supabaseUrl}/rest/v1/${path}${params}`;
  const response = await fetch(url, {
    method: "GET",
    headers: {
      "apikey": key,
      "Authorization": `Bearer ${key}`,
      "Accept": "application/json",
      "Content-Type": "application/json",
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
    const err = new Error(`Supabase REST error ${response.status}: ${typeof body === "string" ? body : JSON.stringify(body)}`);
    err.status = response.status;
    err.detail = body;
    err.debug = {
      supabaseUrl,
      detectedKeyType: keyType(key),
      keyLength: key.length,
      keyPreview: key ? `${key.slice(0, 8)}...${key.slice(-6)}` : "missing",
      usingNewLegacyKey: Boolean(process.env.SUPABASE_LEGACY_SERVICE_ROLE_KEY),
      usingOldServiceRoleKey: !process.env.SUPABASE_LEGACY_SERVICE_ROLE_KEY && Boolean(process.env.SUPABASE_SERVICE_ROLE_KEY),
      endpoint: `/rest/v1/${path}`
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

    return json(res, 200, {
      totalReports: reports.length,
      totalEvents: events.length,
      uniqueVisitors,
      averageScore: average(reports, "match_score"),
      markets: countBy(reports, "market"),
      careers: countBy(reports, "career"),
      languages: countBy(reports, "languages"),
      recentReports: reports.slice(0, 20),
      recentEvents: events.slice(0, 30)
    });
  } catch (error) {
    return json(res, 500, {
      error: error.message || "Unknown admin summary error",
      detail: error.detail || null,
      debug: error.debug || null,
      fix: "Create a NEW Vercel Environment Variable named SUPABASE_LEGACY_SERVICE_ROLE_KEY and paste the Legacy service_role JWT starting with eyJ. Then redeploy."
    });
  }
};
