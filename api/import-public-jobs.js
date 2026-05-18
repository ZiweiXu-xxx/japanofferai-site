// JapanOffer AI Step 35
// Public Jobs Auto Importer for Vercel Serverless
//
// Sources:
// - Remotive public remote jobs API, no key required
// - Adzuna jobs API, optional ADZUNA_APP_ID / ADZUNA_APP_KEY
// - Greenhouse public job board API, optional board tokens
// - Lever public postings endpoint, optional company slugs
//
// Required Vercel env vars:
// SUPABASE_URL
// SUPABASE_SERVICE_ROLE_KEY
// ADMIN_PASSWORD
//
// Optional Vercel env vars:
// ADZUNA_APP_ID
// ADZUNA_APP_KEY

const DEFAULT_KEYWORDS = [
  "legal compliance",
  "compliance analyst",
  "AML KYC",
  "financial crime",
  "risk operations",
  "web3 compliance",
  "crypto compliance",
  "legal operations",
  "payments compliance",
  "business development Japanese"
];

const DEFAULT_ADZUNA_COUNTRIES = ["sg", "gb", "us"];

const TARGET_TERMS = [
  "legal", "compliance", "aml", "kyc", "risk", "fraud",
  "financial crime", "sanctions", "due diligence", "fintech",
  "payment", "payments", "crypto", "web3", "blockchain",
  "virtual asset", "legal operations", "policy", "regulatory",
  "japanese", "japan", "hong kong", "singapore", "cross-border",
  "business development", "strategy", "market research"
];

function json(res, status, data) {
  res.statusCode = status;
  res.setHeader("Content-Type", "application/json; charset=utf-8");
  res.setHeader("Cache-Control", "no-store");
  res.end(JSON.stringify(data));
}

function clean(value) {
  return String(value ?? "").replace(/\s+/g, " ").trim();
}

function lower(value) {
  return clean(value).toLowerCase();
}

function unique(values) {
  return Array.from(new Set((values || []).map(clean).filter(Boolean)));
}

function safeSlug(value) {
  return lower(value)
    .replace(/https?:\/\//g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 110);
}

function arrayFromInput(value, fallback = []) {
  if (Array.isArray(value)) return unique(value);
  if (typeof value === "string") {
    return unique(value.split(/[\n,]+/g));
  }
  return fallback;
}

function keyKind(key) {
  const value = clean(key);
  if (!value) return "empty";
  if (value.startsWith("sb_publishable_")) return "publishable_key_NOT_ALLOWED";
  if (value.startsWith("sb_secret_")) return "secret_key";
  if (value.startsWith("eyJ")) return "legacy_jwt";
  return "unknown";
}

function decodeJwtPayload(key) {
  try {
    if (!String(key || "").startsWith("eyJ")) return null;
    const part = String(key).split(".")[1];
    const normalized = part.replace(/-/g, "+").replace(/_/g, "/");
    const payload = Buffer.from(normalized, "base64").toString("utf8");
    return JSON.parse(payload);
  } catch {
    return null;
  }
}

function getProjectRefFromUrl(url) {
  try {
    const host = new URL(url).hostname;
    return host.split(".")[0];
  } catch {
    return "";
  }
}

function getSupabaseConfig() {
  const url = clean(process.env.SUPABASE_URL || process.env.JAPANOFFER_SUPABASE_URL);

  // Important:
  // Some projects already have SUPABASE_LEGACY_SERVICE_ROLE_KEY, while SUPABASE_SERVICE_ROLE_KEY
  // may accidentally contain a publishable/anon/wrong-project key. Try all possible service keys.
  const candidates = [
    ["SUPABASE_LEGACY_SERVICE_ROLE_KEY", process.env.SUPABASE_LEGACY_SERVICE_ROLE_KEY],
    ["SUPABASE_SERVICE_ROLE_KEY", process.env.SUPABASE_SERVICE_ROLE_KEY],
    ["JAPANOFFER_SUPABASE_SERVICE_ROLE_KEY", process.env.JAPANOFFER_SUPABASE_SERVICE_ROLE_KEY],
    ["SUPABASE_SECRET_KEY", process.env.SUPABASE_SECRET_KEY]
  ]
    .map(([name, key]) => {
      const value = clean(key);
      const payload = decodeJwtPayload(value);
      return {
        name,
        key: value,
        kind: keyKind(value),
        length: value.length,
        role: payload?.role || null,
        ref: payload?.ref || null
      };
    })
    .filter((item) => item.key);

  return { url, keys: candidates, projectRef: getProjectRefFromUrl(url) };
}

async function fetchJson(url, options = {}) {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), options.timeoutMs || 18000);

  try {
    const response = await fetch(url, {
      method: options.method || "GET",
      headers: {
        "Accept": "application/json",
        "User-Agent": "JapanOfferAI/1.0 public jobs importer",
        ...(options.headers || {})
      },
      signal: controller.signal
    });

    const text = await response.text();
    let data = null;

    try {
      data = text ? JSON.parse(text) : null;
    } catch {
      data = { raw: text };
    }

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${clean(text).slice(0, 280)}`);
    }

    return data;
  } finally {
    clearTimeout(timeout);
  }
}

function guessMarket(locationText) {
  const text = lower(locationText);

  if (text.includes("tokyo") || text.includes("japan") || text.includes("日本")) return "Japan";
  if (text.includes("hong kong") || text.includes("hongkong") || text.includes("香港")) return "Hong Kong";
  if (text.includes("singapore") || text.includes("新加坡")) return "Singapore";
  if (text.includes("london") || text.includes("birmingham") || text.includes("united kingdom") || text.includes("uk") || text.includes("england")) return "UK";
  if (text.includes("remote")) return "Remote";
  return "Global";
}

function guessCategory(title, description) {
  const text = lower(`${title} ${description}`);

  if (text.includes("aml") || text.includes("kyc") || text.includes("financial crime") || text.includes("sanctions")) return "Finance / AML";
  if (text.includes("crypto") || text.includes("web3") || text.includes("blockchain") || text.includes("virtual asset")) return "Web3 / Risk";
  if (text.includes("legal") || text.includes("compliance") || text.includes("regulatory") || text.includes("policy")) return "Legal / Compliance";
  if (text.includes("business development") || text.includes("partnership") || text.includes("strategy") || text.includes("market")) return "Business / Strategy";
  if (text.includes("operations") || text.includes("data") || text.includes("analyst")) return "Data / Operations";
  return "Other";
}

function guessLanguages(text) {
  const t = lower(text);
  const languages = ["English"];

  if (t.includes("japanese") || t.includes("japan") || t.includes("日本") || t.includes("日语")) languages.push("Japanese");
  if (t.includes("mandarin") || t.includes("chinese") || t.includes("中文") || t.includes("普通话")) languages.push("Mandarin");
  if (t.includes("cantonese") || t.includes("hong kong")) languages.push("Cantonese");

  return unique(languages);
}

function guessSkills(title, description) {
  const text = lower(`${title} ${description}`);
  const skills = [];

  const skillMap = [
    ["Compliance", ["compliance", "regulatory"]],
    ["AML", ["aml", "anti-money laundering"]],
    ["KYC", ["kyc", "know your customer"]],
    ["Risk review", ["risk", "review"]],
    ["Due diligence", ["due diligence"]],
    ["Sanctions", ["sanctions"]],
    ["Policy review", ["policy"]],
    ["Legal research", ["legal", "law"]],
    ["Crypto", ["crypto", "web3", "blockchain", "virtual asset"]],
    ["Payments", ["payment", "payments"]],
    ["Business development", ["business development", "partnership"]],
    ["Market research", ["market research", "strategy"]],
    ["Operations", ["operations"]]
  ];

  for (const [skill, terms] of skillMap) {
    if (terms.some((term) => text.includes(term))) skills.push(skill);
  }

  return unique(skills).slice(0, 8);
}

function guessVisa(market) {
  if (market === "Hong Kong") return "Medium visa risk";
  if (market === "Singapore") return "Medium visa risk";
  if (market === "Japan") return "Medium visa risk";
  if (market === "UK") return "Higher visa risk";
  if (market === "Remote") return "Remote role";
  return "Visa risk unknown";
}

function scoreJob(title, description, market, category) {
  const text = lower(`${title} ${description} ${market} ${category}`);
  let score = 52;

  TARGET_TERMS.forEach((term) => {
    if (text.includes(term)) score += 3;
  });

  if (["Japan", "Hong Kong", "Singapore"].includes(market)) score += 7;
  if (["Legal / Compliance", "Finance / AML", "Web3 / Risk"].includes(category)) score += 7;
  if (text.includes("entry") || text.includes("graduate") || text.includes("junior") || text.includes("associate")) score += 5;
  if (text.includes("japanese")) score += 5;
  if (text.includes("mandarin")) score += 4;

  return Math.max(45, Math.min(88, score));
}

function isRelevantJob(job) {
  const text = lower([
    job.title,
    job.company_name,
    job.description,
    job.category,
    job.market,
    ...(job.tags || []),
    ...(job.skills || [])
  ].join(" "));

  return TARGET_TERMS.some((term) => text.includes(term));
}

function normalizeJob(input) {
  const title = clean(input.title);
  const company = clean(input.company_name || input.company || "Unknown company");
  const location = clean(input.location || input.city || input.market || "");
  const description = clean(input.description || "");
  const market = input.market || guessMarket(location + " " + description);
  const category = input.category || guessCategory(title, description);
  const sourceName = clean(input.source_name);
  const sourceUrl = clean(input.source_url || input.apply_url || input.url);
  const externalId = clean(input.external_id || sourceUrl || `${company}-${title}-${location}`);
  const slug = safeSlug(`${sourceName}-${externalId || company + "-" + title}`);

  const languages = unique(input.languages || guessLanguages(`${title} ${description} ${location}`));
  const skills = unique(input.skills || guessSkills(title, description));
  const tags = unique([
    ...languages,
    ...skills,
    market,
    category,
    sourceName,
    ...String(title).split(/\s+/).slice(0, 6)
  ]).slice(0, 24);

  const score = input.score || scoreJob(title, description, market, category);

  return {
    slug,
    item_type: "job",
    title,
    subtitle: clean(`${company} · ${location || market}`),
    company_name: company,
    market,
    city: location || market,
    category,
    seniority: input.seniority || "Public job",
    visa: input.visa || guessVisa(market),
    visa_score: input.visa_score || (market === "UK" ? 48 : 65),
    entry_score: input.entry_score || (lower(title).includes("senior") ? 42 : 65),
    match_base: input.match_base || score,
    languages,
    skills,
    tags,
    href: `jobs.html?q=${encodeURIComponent(title)}`,
    description: description.slice(0, 1800),
    score,
    sort_order: input.sort_order || 20,
    is_active: true,
    source_name: sourceName,
    source_url: sourceUrl,
    apply_url: sourceUrl,
    external_id: externalId,
    raw_data: input.raw_data || null,
    imported_at: new Date().toISOString(),
    last_seen_at: new Date().toISOString(),
    is_verified: true
  };
}

function remotiveToJob(row) {
  return normalizeJob({
    source_name: "Remotive",
    external_id: row.id || row.url,
    title: row.title,
    company_name: row.company_name,
    location: row.candidate_required_location || "Remote",
    description: row.description || "",
    source_url: row.url,
    raw_data: row,
    market: guessMarket(row.candidate_required_location || "Remote"),
    seniority: "Remote public job"
  });
}

function adzunaToJob(row, country) {
  const company = row.company?.display_name || "Unknown company";
  const location = row.location?.display_name || country.toUpperCase();
  return normalizeJob({
    source_name: "Adzuna",
    external_id: row.id || row.redirect_url,
    title: row.title,
    company_name: company,
    location,
    description: row.description || "",
    source_url: row.redirect_url,
    raw_data: row,
    market: guessMarket(location),
    seniority: row.contract_time || "Public job"
  });
}

function greenhouseToJob(row, board) {
  const location = row.location?.name || "";
  const description = row.content || "";
  return normalizeJob({
    source_name: "Greenhouse",
    external_id: `${board}-${row.id}`,
    title: row.title,
    company_name: board,
    location,
    description,
    source_url: row.absolute_url,
    raw_data: row,
    market: guessMarket(location + " " + description),
    seniority: "Company career page"
  });
}

function leverToJob(row, company) {
  const categories = row.categories || {};
  const location = categories.location || row.workplaceType || "";
  const description = [
    row.descriptionPlain,
    ...(row.lists || []).map((list) => `${list.text || ""} ${(list.content || "").replace(/<[^>]+>/g, " ")}`)
  ].join(" ");

  return normalizeJob({
    source_name: "Lever",
    external_id: `${company}-${row.id}`,
    title: row.text,
    company_name: company,
    location,
    description,
    source_url: row.hostedUrl || row.applyUrl,
    raw_data: row,
    market: guessMarket(location + " " + description),
    seniority: "Company career page"
  });
}

async function importRemotive(keywords, maxPerKeyword) {
  const jobs = [];
  const errors = [];

  for (const keyword of keywords) {
    try {
      const url = `https://remotive.com/api/remote-jobs?search=${encodeURIComponent(keyword)}`;
      const data = await fetchJson(url);
      const rows = Array.isArray(data.jobs) ? data.jobs.slice(0, maxPerKeyword) : [];
      jobs.push(...rows.map(remotiveToJob));
    } catch (error) {
      errors.push({ source: "Remotive", keyword, message: error.message });
    }
  }

  return { jobs, errors };
}

async function importAdzuna(keywords, countries, maxPerKeyword) {
  const jobs = [];
  const errors = [];
  const appId = process.env.ADZUNA_APP_ID;
  const appKey = process.env.ADZUNA_APP_KEY;

  if (!appId || !appKey) {
    return {
      jobs,
      errors: [{ source: "Adzuna", message: "ADZUNA_APP_ID / ADZUNA_APP_KEY not configured. Skipped." }]
    };
  }

  for (const country of countries) {
    for (const keyword of keywords) {
      try {
        const url = new URL(`https://api.adzuna.com/v1/api/jobs/${country}/search/1`);
        url.searchParams.set("app_id", appId);
        url.searchParams.set("app_key", appKey);
        url.searchParams.set("results_per_page", String(maxPerKeyword));
        url.searchParams.set("what", keyword);
        url.searchParams.set("content-type", "application/json");

        const data = await fetchJson(url.toString());
        const rows = Array.isArray(data.results) ? data.results : [];
        jobs.push(...rows.map((row) => adzunaToJob(row, country)));
      } catch (error) {
        errors.push({ source: "Adzuna", country, keyword, message: error.message });
      }
    }
  }

  return { jobs, errors };
}

async function importGreenhouse(boards, maxPerBoard) {
  const jobs = [];
  const errors = [];

  for (const board of boards) {
    try {
      const url = `https://boards-api.greenhouse.io/v1/boards/${encodeURIComponent(board)}/jobs?content=true`;
      const data = await fetchJson(url);
      const rows = Array.isArray(data.jobs) ? data.jobs.slice(0, maxPerBoard) : [];
      jobs.push(...rows.map((row) => greenhouseToJob(row, board)));
    } catch (error) {
      errors.push({ source: "Greenhouse", board, message: error.message });
    }
  }

  return { jobs, errors };
}

async function importLever(companies, maxPerCompany) {
  const jobs = [];
  const errors = [];

  for (const company of companies) {
    try {
      const url = `https://api.lever.co/v0/postings/${encodeURIComponent(company)}?mode=json`;
      const data = await fetchJson(url);
      const rows = Array.isArray(data) ? data.slice(0, maxPerCompany) : [];
      jobs.push(...rows.map((row) => leverToJob(row, company)));
    } catch (error) {
      errors.push({ source: "Lever", company, message: error.message });
    }
  }

  return { jobs, errors };
}

async function upsertJobsToSupabase(jobs) {
  const { url, keys, projectRef } = getSupabaseConfig();

  if (!url || !keys.length) {
    throw new Error("Missing SUPABASE_URL or service role key. Add SUPABASE_LEGACY_SERVICE_ROLE_KEY or SUPABASE_SERVICE_ROLE_KEY in Vercel Environment Variables.");
  }

  if (!jobs.length) {
    return { upserted: 0, data: [], usedKey: null };
  }

  const attempts = [];

  for (const candidate of keys) {
    if (candidate.kind === "publishable_key_NOT_ALLOWED") {
      attempts.push({
        name: candidate.name,
        kind: candidate.kind,
        length: candidate.length,
        skipped: true,
        reason: "Publishable key cannot write to Supabase tables."
      });
      continue;
    }

    if (candidate.role && candidate.role !== "service_role") {
      attempts.push({
        name: candidate.name,
        kind: candidate.kind,
        role: candidate.role,
        ref: candidate.ref,
        length: candidate.length,
        skipped: true,
        reason: "JWT role is not service_role."
      });
      continue;
    }

    if (candidate.ref && projectRef && candidate.ref !== projectRef) {
      attempts.push({
        name: candidate.name,
        kind: candidate.kind,
        role: candidate.role,
        ref: candidate.ref,
        projectRef,
        length: candidate.length,
        skipped: true,
        reason: "Key belongs to another Supabase project."
      });
      continue;
    }

    const response = await fetch(`${url.replace(/\/+$/, "")}/rest/v1/platform_items?on_conflict=slug`, {
      method: "POST",
      headers: {
        "apikey": candidate.key,
        "Authorization": `Bearer ${candidate.key}`,
        "Content-Type": "application/json",
        "Prefer": "resolution=merge-duplicates,return=representation"
      },
      body: JSON.stringify(jobs)
    });

    const text = await response.text();
    let data = null;

    try {
      data = text ? JSON.parse(text) : null;
    } catch {
      data = { raw: text };
    }

    attempts.push({
      name: candidate.name,
      kind: candidate.kind,
      role: candidate.role,
      ref: candidate.ref,
      projectRef,
      length: candidate.length,
      status: response.status,
      response: response.ok ? "ok" : String(text || "").slice(0, 320)
    });

    if (response.ok) {
      return {
        upserted: Array.isArray(data) ? data.length : jobs.length,
        data,
        usedKey: {
          name: candidate.name,
          kind: candidate.kind,
          role: candidate.role,
          ref: candidate.ref,
          length: candidate.length
        },
        attempts
      };
    }
  }

  throw new Error(`Supabase upsert failed with all configured keys. Debug: ${JSON.stringify(attempts)}`);
}

async function insertImportRun(run) {
  const { url, keys } = getSupabaseConfig();
  if (!url || !keys.length) return;

  const usable = keys.find((item) => item.kind !== "publishable_key_NOT_ALLOWED" && (!item.role || item.role === "service_role"));
  if (!usable) return;

  try {
    await fetch(`${url.replace(/\/+$/, "")}/rest/v1/job_import_runs`, {
      method: "POST",
      headers: {
        "apikey": usable.key,
        "Authorization": `Bearer ${usable.key}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify(run)
    });
  } catch {
    // Do not fail the main import if logging fails.
  }
}

module.exports = async function handler(req, res) {
  if (req.method !== "POST") {
    return json(res, 405, { ok: false, error: "Use POST." });
  }

  try {
    const body = typeof req.body === "string" ? JSON.parse(req.body || "{}") : (req.body || {});
    const password = clean(body.password);

    if (!process.env.ADMIN_PASSWORD || password !== process.env.ADMIN_PASSWORD) {
      return json(res, 401, { ok: false, error: "Invalid admin password." });
    }

    const keywords = arrayFromInput(body.keywords, DEFAULT_KEYWORDS).slice(0, 12);
    const adzunaCountries = arrayFromInput(body.adzunaCountries || body.countries, DEFAULT_ADZUNA_COUNTRIES).map((x) => lower(x)).slice(0, 8);
    const greenhouseBoards = arrayFromInput(body.greenhouseBoards, []).slice(0, 20);
    const leverCompanies = arrayFromInput(body.leverCompanies, []).slice(0, 20);

    const maxPerKeyword = Math.min(Number(body.maxPerKeyword || 8), 25);
    const maxPerBoard = Math.min(Number(body.maxPerBoard || 30), 60);

    const sources = body.sources || {};
    const useRemotive = sources.remotive !== false;
    const useAdzuna = sources.adzuna !== false;
    const useGreenhouse = sources.greenhouse !== false && greenhouseBoards.length > 0;
    const useLever = sources.lever !== false && leverCompanies.length > 0;

    const batches = await Promise.all([
      useRemotive ? importRemotive(keywords, maxPerKeyword) : { jobs: [], errors: [] },
      useAdzuna ? importAdzuna(keywords, adzunaCountries, maxPerKeyword) : { jobs: [], errors: [] },
      useGreenhouse ? importGreenhouse(greenhouseBoards, maxPerBoard) : { jobs: [], errors: [] },
      useLever ? importLever(leverCompanies, maxPerBoard) : { jobs: [], errors: [] }
    ]);

    const allErrors = batches.flatMap((batch) => batch.errors);
    const allJobs = batches.flatMap((batch) => batch.jobs);

    const dedupedMap = new Map();
    for (const job of allJobs) {
      if (!job.title || !job.company_name) continue;
      if (!isRelevantJob(job)) continue;
      dedupedMap.set(job.slug, job);
    }

    const dedupedJobs = Array.from(dedupedMap.values()).slice(0, 250);
    const upsertResult = await upsertJobsToSupabase(dedupedJobs);

    const run = {
      source_summary: {
        remotive: useRemotive,
        adzuna: useAdzuna,
        greenhouse: useGreenhouse ? greenhouseBoards : [],
        lever: useLever ? leverCompanies : []
      },
      keywords,
      imported_count: upsertResult.upserted,
      raw_count: allJobs.length,
      relevant_count: dedupedJobs.length,
      errors: allErrors
    };

    await insertImportRun(run);

    return json(res, 200, {
      ok: true,
      imported: upsertResult.upserted,
      usedKey: upsertResult.usedKey,
      keyAttempts: upsertResult.attempts || [],
      rawCount: allJobs.length,
      relevantCount: dedupedJobs.length,
      errors: allErrors,
      jobs: dedupedJobs.slice(0, 30).map((job) => ({
        title: job.title,
        company: job.company_name,
        market: job.market,
        category: job.category,
        source: job.source_name,
        url: job.source_url,
        score: job.score
      }))
    });
  } catch (error) {
    return json(res, 500, { ok: false, error: error.message });
  }
};
