// JapanOffer AI admin summary API
// Keep SUPABASE_SERVICE_ROLE_KEY and ADMIN_PASSWORD in Vercel Environment Variables, not in GitHub.

function countBy(rows, getter) {
  const map = new Map();
  for (const row of rows) {
    const value = getter(row) || "Unknown";
    const key = String(value).trim() || "Unknown";
    map.set(key, (map.get(key) || 0) + 1);
  }
  return [...map.entries()]
    .map(([label, count]) => ({ label, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 8);
}

function languageBreakdown(rows) {
  const langs = [
    ["English", /english|英语/i],
    ["Japanese", /japanese|日本|日语|n1|n2/i],
    ["Mandarin", /mandarin|chinese|中文|普通话/i],
    ["Cantonese", /cantonese|粤语/i],
    ["Korean", /korean|韩语/i]
  ];
  const counts = langs.map(([label, regex]) => ({
    label,
    count: rows.filter((r) => regex.test(r.languages || "")).length
  })).filter((x) => x.count > 0);
  return counts.sort((a, b) => b.count - a.count);
}

async function readJsonBody(req) {
  if (req.body && typeof req.body === "object") return req.body;
  if (req.body && typeof req.body === "string") {
    try { return JSON.parse(req.body); } catch { return {}; }
  }
  return new Promise((resolve) => {
    let data = "";
    req.on("data", (chunk) => { data += chunk; });
    req.on("end", () => {
      try { resolve(JSON.parse(data || "{}")); } catch { resolve({}); }
    });
  });
}

async function supabaseGet(path) {
  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  const response = await fetch(`${url}/rest/v1/${path}`, {
    headers: {
      apikey: key,
      Authorization: `Bearer ${key}`,
      "Content-Type": "application/json"
    }
  });
  if (!response.ok) {
    const text = await response.text();
    throw new Error(`Supabase error: ${response.status} ${text}`);
  }
  return response.json();
}

module.exports = async function handler(req, res) {
  if (req.method !== "POST") {
    res.status(405).json({ error: "Method not allowed" });
    return;
  }

  const body = await readJsonBody(req);
  if (!process.env.ADMIN_PASSWORD || body.password !== process.env.ADMIN_PASSWORD) {
    res.status(401).json({ error: "Wrong admin password" });
    return;
  }

  if (!process.env.SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
    res.status(500).json({ error: "Missing Vercel environment variables: SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY" });
    return;
  }

  try {
    const [reports, events] = await Promise.all([
      supabaseGet("report_submissions?select=*&order=created_at.desc&limit=500"),
      supabaseGet("page_events?select=*&order=created_at.desc&limit=1000")
    ]);

    const visitorIds = new Set();
    for (const row of [...reports, ...events]) {
      visitorIds.add(row.user_id || row.user_email || row.anonymous_id || row.session_id || row.id);
    }

    const scores = reports.map((r) => Number(r.score)).filter(Number.isFinite);
    const averageScore = scores.length ? Math.round(scores.reduce((a, b) => a + b, 0) / scores.length) : 0;

    res.status(200).json({
      totalReports: reports.length,
      uniqueVisitors: visitorIds.size,
      pageViews: events.filter((e) => e.event_name === "page_view").length,
      averageScore,
      marketBreakdown: countBy(reports, (r) => r.market),
      careerBreakdown: countBy(reports, (r) => r.career),
      languageBreakdown: languageBreakdown(reports),
      recentReports: reports.slice(0, 10).map((r) => ({
        created_at: r.created_at,
        user_email: r.user_email,
        anonymous_id: r.anonymous_id,
        market: r.market,
        career: r.career,
        score: r.score
      }))
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
