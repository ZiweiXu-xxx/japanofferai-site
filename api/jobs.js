// JapanOffer AI live jobs API
// Legal MVP approach: fetch public job postings from ATS public job-board APIs,
// not from LinkedIn scraping.
//
// Supported sources in this MVP:
// - Greenhouse public Job Board API
// - Lever public Postings API
//
// Deploy on Vercel as /api/jobs

const GREENHOUSE_BOARDS = [
  { company: "Remote", board: "remotecom" },
  { company: "Calendly", board: "calendly" },
  { company: "CircleCI", board: "circleci" },
  { company: "Labelbox", board: "labelbox" },
  { company: "LaunchDarkly", board: "launchdarkly" },
  { company: "AppLovin", board: "applovin" }
];

const LEVER_COMPANIES = [
  { company: "Scale AI", slug: "scaleai" },
  { company: "Rutter", slug: "rutter" }
];

const FALLBACK_JOBS = [
  {
    id: "demo-legal-japan",
    title: "Legal Compliance Analyst",
    company: "JapanOffer AI Demo",
    location: "Tokyo, Japan",
    source: "Demo dataset",
    url: "assessment.html",
    description: "Entry-level legal and compliance role. English and Japanese preferred. Useful for LLB or compliance-focused candidates.",
    matchScore: 86,
    visaRisk: "Medium",
    priority: "Apply first"
  },
  {
    id: "demo-business-sg",
    title: "Cross-border Business Associate",
    company: "JapanOffer AI Demo",
    location: "Singapore",
    source: "Demo dataset",
    url: "assessment.html",
    description: "International business role. Mandarin and English useful. Good for candidates with Asia market interest.",
    matchScore: 79,
    visaRisk: "Low",
    priority: "Shortlist"
  },
  {
    id: "demo-marketing-hk",
    title: "General Marketing Intern",
    company: "JapanOffer AI Demo",
    location: "Hong Kong",
    source: "Demo dataset",
    url: "assessment.html",
    description: "Broad marketing internship with high competition and weaker fit for legal/compliance candidates.",
    matchScore: 42,
    visaRisk: "High",
    priority: "Low priority"
  }
];

function stripHtml(html = "") {
  return String(html)
    .replace(/<style[\s\S]*?<\/style>/gi, " ")
    .replace(/<script[\s\S]*?<\/script>/gi, " ")
    .replace(/<[^>]+>/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function cleanText(value) {
  return String(value || "").toLowerCase();
}

function anyTokenMatch(text, tokens) {
  return tokens.some((token) => token && text.includes(token));
}

function inferVisaRisk(text) {
  const t = cleanText(text);
  if (t.includes("visa sponsorship is not available") || t.includes("unable to sponsor") || t.includes("no sponsorship")) return "High";
  if (t.includes("visa") || t.includes("sponsorship") || t.includes("work authorization")) return "Medium";
  return "Unknown";
}

function scoreJob(job, query, market) {
  const tokens = cleanText(query).split(/[,\s/]+/).filter(Boolean);
  const marketTokens = cleanText(market).split(/[,\s/]+/).filter(Boolean);
  const title = cleanText(job.title);
  const loc = cleanText(job.location);
  const desc = cleanText(job.description);
  const all = `${title} ${loc} ${desc}`;

  let score = 48;

  if (anyTokenMatch(title, tokens)) score += 25;
  else if (anyTokenMatch(all, tokens)) score += 14;

  if (anyTokenMatch(loc, marketTokens)) score += 18;
  else if (anyTokenMatch(all, marketTokens)) score += 8;

  if (all.includes("entry") || all.includes("graduate") || all.includes("junior") || all.includes("associate") || all.includes("intern")) score += 7;
  if (all.includes("legal") || all.includes("compliance") || all.includes("business") || all.includes("international")) score += 6;
  if (all.includes("japanese") || all.includes("mandarin") || all.includes("english")) score += 5;

  return Math.max(35, Math.min(96, score));
}

function priorityFromScore(score) {
  if (score >= 82) return "Apply first";
  if (score >= 68) return "Shortlist";
  if (score >= 52) return "Review";
  return "Low priority";
}

async function fetchWithTimeout(url, ms = 6500) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), ms);
  try {
    const response = await fetch(url, {
      signal: controller.signal,
      headers: { "User-Agent": "JapanOfferAI-Beta/1.0" }
    });
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    return await response.json();
  } finally {
    clearTimeout(timer);
  }
}

async function fetchGreenhouse(boardInfo) {
  const url = `https://boards-api.greenhouse.io/v1/boards/${boardInfo.board}/jobs?content=true`;
  const data = await fetchWithTimeout(url);
  const jobs = Array.isArray(data.jobs) ? data.jobs : [];
  return jobs.map((job) => ({
    id: `greenhouse-${boardInfo.board}-${job.id}`,
    title: job.title || "Untitled role",
    company: boardInfo.company,
    location: job.location && job.location.name ? job.location.name : "Location not specified",
    source: "Greenhouse public job board",
    url: job.absolute_url || url,
    description: stripHtml(job.content || ""),
    rawSource: "greenhouse"
  }));
}

async function fetchLever(companyInfo) {
  const url = `https://api.lever.co/v0/postings/${companyInfo.slug}?mode=json`;
  const data = await fetchWithTimeout(url);
  const jobs = Array.isArray(data) ? data : [];
  return jobs.map((job) => ({
    id: `lever-${companyInfo.slug}-${job.id || job.text}`,
    title: job.text || "Untitled role",
    company: companyInfo.company,
    location: job.categories && job.categories.location ? job.categories.location : "Location not specified",
    source: "Lever public postings API",
    url: job.hostedUrl || job.applyUrl || url,
    description: stripHtml(job.descriptionPlain || job.description || ""),
    rawSource: "lever"
  }));
}

module.exports = async function handler(req, res) {
  const query = String(req.query.query || "legal compliance business").slice(0, 80);
  const market = String(req.query.market || "Japan Singapore Hong Kong Remote").slice(0, 80);

  try {
    const sourcePromises = [
      ...GREENHOUSE_BOARDS.map((board) => fetchGreenhouse(board).catch(() => [])),
      ...LEVER_COMPANIES.map((company) => fetchLever(company).catch(() => []))
    ];

    const nested = await Promise.all(sourcePromises);
    let jobs = nested.flat();

    const queryText = cleanText(query);
    const marketText = cleanText(market);
    const queryTokens = queryText.split(/[,\s/]+/).filter(Boolean);
    const marketTokens = marketText.split(/[,\s/]+/).filter(Boolean);

    jobs = jobs
      .map((job) => {
        const matchScore = scoreJob(job, query, market);
        return {
          ...job,
          matchScore,
          visaRisk: inferVisaRisk(`${job.title} ${job.location} ${job.description}`),
          priority: priorityFromScore(matchScore),
          shortDescription: job.description ? job.description.slice(0, 220) : ""
        };
      })
      .filter((job) => {
        const all = cleanText(`${job.title} ${job.company} ${job.location} ${job.description}`);
        const queryOk = queryTokens.length === 0 || anyTokenMatch(all, queryTokens);
        const marketOk = marketTokens.length === 0 || anyTokenMatch(all, marketTokens) || job.location.toLowerCase().includes("remote");
        return queryOk || marketOk || job.matchScore >= 65;
      })
      .sort((a, b) => b.matchScore - a.matchScore)
      .slice(0, 24);

    if (jobs.length < 3) {
      jobs = [...jobs, ...FALLBACK_JOBS].slice(0, 12);
    }

    res.setHeader("Cache-Control", "s-maxage=1800, stale-while-revalidate=3600");
    res.status(200).json({
      ok: true,
      query,
      market,
      count: jobs.length,
      note: "Live results are pulled from public ATS job-board APIs where available. Demo rows appear only when live results are limited.",
      jobs
    });
  } catch (error) {
    res.status(200).json({
      ok: true,
      query,
      market,
      count: FALLBACK_JOBS.length,
      note: "Live job sources are temporarily unavailable. Showing demo dataset.",
      jobs: FALLBACK_JOBS
    });
  }
};
