// JapanOffer AI admin summary API
// Step 18: use a password-protected Supabase RPC with publishable key.
// This bypasses service_role key issues completely.
//
// Vercel env needed:
// SUPABASE_URL
// SUPABASE_PUBLISHABLE_KEY
// ADMIN_PASSWORD

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

async function callAdminRpc(adminPassword) {
  const supabaseUrl = cleanUrl(process.env.SUPABASE_URL);
  const key = clean(
    process.env.SUPABASE_PUBLISHABLE_KEY ||
    process.env.SUPABASE_ANON_KEY ||
    process.env.SUPABASE_PUBLIC_ANON_KEY
  );

  if (!supabaseUrl || !key) {
    throw new Error("Missing SUPABASE_URL or SUPABASE_PUBLISHABLE_KEY in Vercel Environment Variables.");
  }

  const response = await fetch(`${supabaseUrl}/rest/v1/rpc/japanoffer_admin_summary`, {
    method: "POST",
    headers: {
      "apikey": key,
      "Authorization": `Bearer ${key}`,
      "Content-Type": "application/json",
      "Accept": "application/json"
    },
    body: JSON.stringify({
      p_password: adminPassword
    })
  });

  const text = await response.text();
  let body = null;
  try {
    body = text ? JSON.parse(text) : null;
  } catch {
    body = text;
  }

  if (!response.ok) {
    const keyType = key.startsWith("sb_publishable_")
      ? "publishable_key"
      : key.startsWith("eyJ")
        ? "legacy_anon_jwt"
        : key.startsWith("sb_secret_")
          ? "secret_key_wrong_for_this_fix"
          : "unknown_key_format";

    throw new Error(
      `Admin RPC error ${response.status}: ${typeof body === "string" ? body : JSON.stringify(body)} | keyType=${keyType} | keyLength=${key.length}`
    );
  }

  return body || {};
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

    const summary = await callAdminRpc(adminPassword);
    return json(res, 200, summary);
  } catch (error) {
    return json(res, 500, {
      error: error.message || "Unknown admin summary error",
      fix: "Run supabase_admin_rpc_setup.sql in Supabase SQL Editor, add SUPABASE_PUBLISHABLE_KEY in Vercel, then redeploy."
    });
  }
};
