export default async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") {
    return res.status(200).end();
  }

  const appId = process.env.ADZUNA_APP_ID;
  const appKey = process.env.ADZUNA_APP_KEY;

  if (!appId || !appKey) {
    return res.status(500).json({
      error: "Adzuna API keys are not configured in Vercel environment variables."
    });
  }

  const rawQuery = String(req.query.q || "").trim();
  const selectedCountry = String(req.query.country || "auto").trim().toLowerCase();
  const limit = Math.min(Number(req.query.limit || 24), 40);

  if (!rawQuery) {
    return res.status(400).json({ error: "Missing search keyword." });
  }

  try {
    const parsed = parseSearch(rawQuery, selectedCountry);
    let jobs = [];
    let sources = [];

    if (parsed.adzunaCountry) {
      const adzunaJobs = await searchAdzuna({
        appId,
        appKey,
        countryCode: parsed.adzunaCountry,
        what: parsed.what,
        where: parsed.where,
        limit
      });

      jobs.push(...adzunaJobs);
      sources.push("Adzuna");
    }

    const shouldUseRemotive =
      selectedCountry === "remote" ||
      selectedCountry === "auto" ||
      parsed.unsupportedMarket ||
      jobs.length < 6;

    if (shouldUseRemotive) {
      const remotiveJobs = await searchRemotive(parsed.what || rawQuery, Math.min(18, limit));
      jobs.push(...remotiveJobs);
      sources.push("Remotive");
    }

    jobs = dedupeJobs(jobs)
      .map((job) => enhanceJob(job, rawQuery, parsed))
      .sort((a, b) => {
        const priorityRank = { High: 3, Medium: 2, Low: 1 };
        const pa = priorityRank[a.apply_priority] || 0;
        const pb = priorityRank[b.apply_priority] || 0;

        if (pb !== pa) return pb - pa;
        return (b.match_score || 0) - (a.match_score || 0);
      })
      .slice(0, limit);

    return res.status(200).json({
      query: rawQuery,
      parsed,
      sources: [...new Set(sources)],
      count: jobs.length,
      jobs
    });
  } catch (error) {
    return res.status(500).json({
      error: "Could not fetch real job data.",
      detail: error.message
    });
  }
}

async function searchAdzuna({ appId, appKey, countryCode, what, where, limit }) {
  const params = new URLSearchParams({
    app_id: appId,
    app_key: appKey,
    results_per_page: String(limit),
    what: what || "graduate",
    "content-type": "application/json"
  });

  if (where) {
    params.set("where", where);
  }

  const url = `https://api.adzuna.com/v1/api/jobs/${countryCode}/search/1?${params.toString()}`;

  const response = await fetch(url, {
    headers: { Accept: "application/json" }
  });

  if (!response.ok) {
    throw new Error(`Adzuna API failed: ${response.status}`);
  }

  const data = await response.json();
  const results = Array.isArray(data.results) ? data.results : [];

  return results.map((job) => {
    const location = job.location?.display_name || "";
    const company = job.company?.display_name || "Unknown company";
    const category = job.category?.label || "General";

    return {
      id: "adzuna-" + job.id,
      title: job.title || "Untitled role",
      company,
      country: countryNameFromCode(countryCode),
      city: location,
      category,
      seniority: detectSeniority(job.title + " " + job.description),
      description: truncate(stripHtml(job.description || ""), 360),
      apply_url: job.redirect_url,
      source_url: job.redirect_url,
      source_name: "Adzuna",
      source_type: "Job Search API",
      visa_risk: estimateVisaRisk(job.title + " " + job.description + " " + location, countryCode),
      salary_min: job.salary_min || null,
      salary_max: job.salary_max || null,
      published_at: job.created || null
    };
  });
}

async function searchRemotive(query, limit) {
  const url =
    "https://remotive.com/api/remote-jobs?search=" +
    encodeURIComponent(query || "compliance") +
    "&limit=" +
    encodeURIComponent(limit);

  const response = await fetch(url, {
    headers: { "User-Agent": "JapanOfferAI/1.0" }
  });

  if (!response.ok) {
    return [];
  }

  const data = await response.json();
  const jobs = Array.isArray(data.jobs) ? data.jobs : [];

  return jobs.map((job) => {
    const location = job.candidate_required_location || "Remote";
    const description = stripHtml(job.description || "");

    return {
      id: "remotive-" + job.id,
      title: job.title || "Untitled role",
      company: job.company_name || "Unknown company",
      country: "Remote",
      city: location,
      category: job.category || "Remote role",
      seniority: job.job_type || "Not specified",
      description: truncate(description, 360),
      apply_url: job.url,
      source_url: job.url,
      source_name: "Remotive",
      source_type: "Remote Jobs API",
      visa_risk: estimateRemoteRisk(location),
      published_at: job.publication_date || null
    };
  });
}

function parseSearch(rawQuery, selectedCountry) {
  const original = String(rawQuery || "").trim();
  const lower = original.toLowerCase();

  const translated = translateChineseKeywords(original);

  const detected = detectCountry(lower, selectedCountry);
  const countryCode = detected.countryCode;
  const unsupportedMarket = detected.unsupportedMarket;

  let what = translated;

  for (const term of detected.removeTerms) {
    what = what.replace(new RegExp(term, "ig"), " ");
  }

  what = what.replace(/\s+/g, " ").trim();

  if (!what) {
    what = "graduate";
  }

  let where = detected.where || "";

  return {
    original,
    what,
    where,
    selectedCountry,
    adzunaCountry: countryCode,
    unsupportedMarket,
    marketLabel: detected.marketLabel
  };
}

function detectCountry(lower, selectedCountry) {
  const selectedMap = {
    gb: { countryCode: "gb", where: "", marketLabel: "United Kingdom", removeTerms: [] },
    uk: { countryCode: "gb", where: "", marketLabel: "United Kingdom", removeTerms: [] },
    sg: { countryCode: "sg", where: "", marketLabel: "Singapore", removeTerms: [] },
    ca: { countryCode: "ca", where: "", marketLabel: "Canada", removeTerms: [] },
    au: { countryCode: "au", where: "", marketLabel: "Australia", removeTerms: [] },
    us: { countryCode: "us", where: "", marketLabel: "United States", removeTerms: [] },
    de: { countryCode: "de", where: "", marketLabel: "Germany", removeTerms: [] },
    fr: { countryCode: "fr", where: "", marketLabel: "France", removeTerms: [] },
    nl: { countryCode: "nl", where: "", marketLabel: "Netherlands", removeTerms: [] },
    nz: { countryCode: "nz", where: "", marketLabel: "New Zealand", removeTerms: [] },
    in: { countryCode: "in", where: "", marketLabel: "India", removeTerms: [] },
    remote: { countryCode: "", where: "", marketLabel: "Remote", removeTerms: [] },
    japan: { countryCode: "", where: "", marketLabel: "Japan", removeTerms: [], unsupportedMarket: true },
    hongkong: { countryCode: "", where: "", marketLabel: "Hong Kong", removeTerms: [], unsupportedMarket: true }
  };

  if (selectedCountry && selectedCountry !== "auto") {
    return selectedMap[selectedCountry] || selectedMap.auto || {
      countryCode: "gb",
      where: "",
      marketLabel: "United Kingdom",
      removeTerms: []
    };
  }

  const patterns = [
    { re: /(united kingdom|uk|england|london|英国)/i, countryCode: "gb", where: lower.includes("london") ? "London" : "", marketLabel: "United Kingdom", removeTerms: ["united kingdom", "uk", "england", "英国"] },
    { re: /(singapore|新加坡)/i, countryCode: "sg", where: "", marketLabel: "Singapore", removeTerms: ["singapore", "新加坡"] },
    { re: /(canada|toronto|vancouver|加拿大)/i, countryCode: "ca", where: lower.includes("toronto") ? "Toronto" : lower.includes("vancouver") ? "Vancouver" : "", marketLabel: "Canada", removeTerms: ["canada", "加拿大"] },
    { re: /(australia|sydney|melbourne|澳洲|澳大利亚)/i, countryCode: "au", where: lower.includes("sydney") ? "Sydney" : lower.includes("melbourne") ? "Melbourne" : "", marketLabel: "Australia", removeTerms: ["australia", "澳洲", "澳大利亚"] },
    { re: /(united states|usa|america|new york|美国)/i, countryCode: "us", where: lower.includes("new york") ? "New York" : "", marketLabel: "United States", removeTerms: ["united states", "usa", "america", "美国"] },
    { re: /(germany|berlin|德国)/i, countryCode: "de", where: lower.includes("berlin") ? "Berlin" : "", marketLabel: "Germany", removeTerms: ["germany", "德国"] },
    { re: /(france|paris|法国)/i, countryCode: "fr", where: lower.includes("paris") ? "Paris" : "", marketLabel: "France", removeTerms: ["france", "法国"] },
    { re: /(netherlands|amsterdam|荷兰)/i, countryCode: "nl", where: lower.includes("amsterdam") ? "Amsterdam" : "", marketLabel: "Netherlands", removeTerms: ["netherlands", "荷兰"] },
    { re: /(new zealand|新西兰)/i, countryCode: "nz", where: "", marketLabel: "New Zealand", removeTerms: ["new zealand", "新西兰"] },
    { re: /(india|印度)/i, countryCode: "in", where: "", marketLabel: "India", removeTerms: ["india", "印度"] },
    { re: /(japan|tokyo|日本|东京)/i, countryCode: "", where: "", marketLabel: "Japan", removeTerms: ["japan", "tokyo", "日本", "东京"], unsupportedMarket: true },
    { re: /(hong kong|hongkong|香港)/i, countryCode: "", where: "", marketLabel: "Hong Kong", removeTerms: ["hong kong", "hongkong", "香港"], unsupportedMarket: true },
    { re: /(remote|remotely|远程)/i, countryCode: "", where: "", marketLabel: "Remote", removeTerms: ["remote", "remotely", "远程"] }
  ];

  for (const item of patterns) {
    if (item.re.test(lower)) {
      return item;
    }
  }

  return {
    countryCode: "gb",
    where: "",
    marketLabel: "United Kingdom",
    removeTerms: []
  };
}

function translateChineseKeywords(value) {
  return String(value || "")
    .replace(/法律|法务/g, " legal ")
    .replace(/合规/g, " compliance ")
    .replace(/金融/g, " finance ")
    .replace(/风控|风险/g, " risk ")
    .replace(/反洗钱/g, " AML ")
    .replace(/实习/g, " internship ")
    .replace(/毕业生|校招/g, " graduate ")
    .replace(/签证/g, " visa sponsorship ")
    .replace(/数据/g, " data ")
    .replace(/运营/g, " operations ")
    .replace(/商务/g, " business ")
    .replace(/加密货币|虚拟资产|区块链/g, " crypto blockchain ")
    .replace(/\s+/g, " ")
    .trim();
}

function enhanceJob(job, rawQuery, parsed) {
  const score = calculateMatchScore(job, rawQuery);
  const risk = job.visa_risk || "unknown";

  return {
    ...job,
    match_score: score,
    apply_priority: calculatePriority(score, risk),
    ai_note: buildAiNote(job, parsed, risk, score)
  };
}

function calculateMatchScore(job, rawQuery) {
  let score = 50;

  const text = [
    job.title,
    job.company,
    job.country,
    job.city,
    job.category,
    job.description,
    job.seniority
  ].join(" ").toLowerCase();

  const query = translateChineseKeywords(rawQuery).toLowerCase();
  const terms = query.split(/\s+/).filter(Boolean);

  for (const term of terms) {
    if (text.includes(term)) score += 6;
  }

  if (text.includes("compliance")) score += 8;
  if (text.includes("aml")) score += 8;
  if (text.includes("kyc")) score += 8;
  if (text.includes("legal")) score += 7;
  if (text.includes("finance")) score += 6;
  if (text.includes("risk")) score += 6;
  if (text.includes("graduate")) score += 5;
  if (text.includes("intern")) score += 5;
  if (text.includes("crypto") || text.includes("web3") || text.includes("blockchain")) score += 8;

  const risk = String(job.visa_risk || "").toLowerCase();
  if (risk === "low") score += 5;
  if (risk === "high") score -= 8;

  return Math.max(35, Math.min(score, 94));
}

function calculatePriority(score, visaRisk) {
  const risk = String(visaRisk || "").toLowerCase();
  if (score >= 75 && risk !== "high") return "High";
  if (score >= 62) return "Medium";
  return "Low";
}

function buildAiNote(job, parsed, risk, score) {
  const market = parsed.marketLabel || job.country || "this market";
  const category = job.category || "this field";

  if (parsed.unsupportedMarket) {
    return `This market is not fully covered by Adzuna in this version, so this result is a fallback from remote/public sources. Use it for market discovery, then verify location and sponsorship conditions on the source page.`;
  }

  if (score >= 75 && risk !== "high") {
    return `This looks like a strong target for ${market}. Check the source page, then tailor your application around ${category}, language fit and cross-border experience.`;
  }

  if (risk === "high") {
    return `This role may be useful, but visa or location risk looks higher. Apply only if the company mentions sponsorship, remote flexibility or international hiring.`;
  }

  return `This is a reasonable search result for ${market}. Before applying, check location rules, sponsorship, graduate suitability and whether your background matches ${category}.`;
}

function estimateVisaRisk(text, countryCode) {
  const value = String(text || "").toLowerCase();

  if (value.includes("visa sponsorship") || value.includes("sponsorship available") || value.includes("skilled worker")) {
    return "low";
  }

  if (value.includes("must have right to work") || value.includes("no sponsorship") || value.includes("without sponsorship")) {
    return "high";
  }

  if (["sg", "ca", "au", "gb"].includes(countryCode)) {
    return "medium";
  }

  return "medium";
}

function estimateRemoteRisk(location) {
  const text = String(location || "").toLowerCase();

  if (text.includes("worldwide") || text.includes("anywhere")) return "low";
  if (text.includes("us only") || text.includes("u.s.") || text.includes("united states only")) return "high";
  return "medium";
}

function detectSeniority(text) {
  const value = String(text || "").toLowerCase();

  if (value.includes("intern")) return "Internship";
  if (value.includes("graduate")) return "Graduate";
  if (value.includes("entry")) return "Entry-level";
  if (value.includes("junior")) return "Junior";
  if (value.includes("senior")) return "Senior";

  return "Not specified";
}

function countryNameFromCode(code) {
  const map = {
    gb: "United Kingdom",
    sg: "Singapore",
    ca: "Canada",
    au: "Australia",
    us: "United States",
    de: "Germany",
    fr: "France",
    nl: "Netherlands",
    nz: "New Zealand",
    in: "India"
  };

  return map[code] || code.toUpperCase();
}

function dedupeJobs(jobs) {
  const seen = new Set();
  const output = [];

  for (const job of jobs) {
    const key = [
      job.title,
      job.company,
      job.city,
      job.source_name
    ].join("|").toLowerCase();

    if (!seen.has(key)) {
      seen.add(key);
      output.push(job);
    }
  }

  return output;
}

function stripHtml(value) {
  let text = String(value || "");

  // Some public APIs return real HTML. Others return escaped HTML like
  // &lt;p class="h3"&gt;...&lt;/p&gt;. Decode first, then strip tags.
  for (let i = 0; i < 3; i++) {
    text = decodeHtmlEntities(text)
      .replace(/\\u003c/gi, "<")
      .replace(/\\u003e/gi, ">")
      .replace(/\\u0026/gi, "&")
      .replace(/<style[\s\S]*?<\/style>/gi, " ")
      .replace(/<script[\s\S]*?<\/script>/gi, " ")
      .replace(/<br\s*\/?>/gi, ". ")
      .replace(/<\/(p|div|section|article|h1|h2|h3|h4|li|ul|ol)>/gi, ". ")
      .replace(/<li[^>]*>/gi, "• ")
      .replace(/<[^>]+>/g, " ");
  }

  return text
    .replace(/\s+/g, " ")
    .replace(/\s+([,.;:!?])/g, "$1")
    .replace(/([.!?]){2,}/g, "$1")
    .replace(/\s+\./g, ".")
    .trim();
}

function decodeHtmlEntities(value) {
  return String(value || "")
    .replace(/&nbsp;|&#160;/gi, " ")
    .replace(/&amp;/gi, "&")
    .replace(/&lt;/gi, "<")
    .replace(/&gt;/gi, ">")
    .replace(/&quot;/gi, '"')
    .replace(/&#39;|&apos;/gi, "'")
    .replace(/&rsquo;/gi, "’")
    .replace(/&lsquo;/gi, "‘")
    .replace(/&rdquo;/gi, "”")
    .replace(/&ldquo;/gi, "“")
    .replace(/&ndash;/gi, "–")
    .replace(/&mdash;/gi, "—")
    .replace(/&bull;/gi, "•")
    .replace(/&#x([0-9a-f]+);/gi, (_, hex) => {
      const code = parseInt(hex, 16);
      return Number.isFinite(code) ? String.fromCodePoint(code) : " ";
    })
    .replace(/&#(\d+);/g, (_, num) => {
      const code = parseInt(num, 10);
      return Number.isFinite(code) ? String.fromCodePoint(code) : " ";
    });
}

function truncate(value, max) {
  const text = String(value || "").trim();
  if (text.length <= max) return text;
  return text.slice(0, max).trim() + "...";
}
