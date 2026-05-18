export default async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") {
    return res.status(200).end();
  }

  const q = String(req.query.q || "compliance").trim();
  const limit = Math.min(Number(req.query.limit || 20), 30);

  if (!q) {
    return res.status(400).json({ error: "Missing search keyword." });
  }

  try {
    const remotiveUrl =
      "https://remotive.com/api/remote-jobs?search=" +
      encodeURIComponent(q) +
      "&limit=" +
      encodeURIComponent(limit);

    const response = await fetch(remotiveUrl, {
      headers: {
        "User-Agent": "JapanOfferAI/1.0"
      }
    });

    if (!response.ok) {
      throw new Error("Remotive API failed: " + response.status);
    }

    const data = await response.json();
    const jobs = Array.isArray(data.jobs) ? data.jobs : [];

    const mapped = jobs.map((job) => {
      const description = stripHtml(job.description || "");
      const visaRisk = estimateVisaRisk(job.candidate_required_location);

      return {
        id: "remotive-" + job.id,
        title: job.title || "Untitled role",
        company: job.company_name || "Unknown company",
        country: "Remote",
        city: job.candidate_required_location || "Remote",
        category: job.category || "Remote role",
        seniority: job.job_type || "Not specified",
        description: truncate(description, 320),
        apply_url: job.url,
        source_url: job.url,
        source_name: "Remotive",
        source_type: "Public API",
        visa_risk: visaRisk,
        match_score: calculateMatchScore(job, q, visaRisk),
        apply_priority: calculatePriority(job, q, visaRisk),
        published_at: job.publication_date || null
      };
    });

    return res.status(200).json({
      source: "Remotive",
      query: q,
      count: mapped.length,
      jobs: mapped
    });
  } catch (error) {
    return res.status(500).json({
      error: "Could not fetch real job data.",
      detail: error.message
    });
  }
}

function stripHtml(value) {
  return String(value)
    .replace(/<style[\s\S]*?<\/style>/gi, " ")
    .replace(/<script[\s\S]*?<\/script>/gi, " ")
    .replace(/<[^>]+>/g, " ")
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/\s+/g, " ")
    .trim();
}

function truncate(value, max) {
  const text = String(value || "").trim();
  if (text.length <= max) return text;
  return text.slice(0, max).trim() + "...";
}

function estimateVisaRisk(location) {
  const text = String(location || "").toLowerCase();

  if (text.includes("worldwide") || text.includes("anywhere")) {
    return "low";
  }

  if (text.includes("europe") || text.includes("asia") || text.includes("americas")) {
    return "medium";
  }

  if (text.includes("us only") || text.includes("u.s.") || text.includes("united states only")) {
    return "high";
  }

  return "medium";
}

function calculateMatchScore(job, query, visaRisk) {
  let score = 55;
  const text = [
    job.title,
    job.company_name,
    job.category,
    job.job_type,
    job.candidate_required_location,
    stripHtml(job.description || "")
  ].join(" ").toLowerCase();

  const terms = String(query || "")
    .toLowerCase()
    .split(/\s+/)
    .filter(Boolean);

  for (const term of terms) {
    if (text.includes(term)) score += 7;
  }

  if (text.includes("compliance")) score += 8;
  if (text.includes("aml")) score += 8;
  if (text.includes("kyc")) score += 8;
  if (text.includes("legal")) score += 6;
  if (text.includes("risk")) score += 6;
  if (text.includes("crypto") || text.includes("web3") || text.includes("blockchain")) score += 8;

  if (visaRisk === "low") score += 5;
  if (visaRisk === "high") score -= 10;

  return Math.max(40, Math.min(score, 92));
}

function calculatePriority(job, query, visaRisk) {
  const score = calculateMatchScore(job, query, visaRisk);
  if (score >= 74 && visaRisk !== "high") return "High";
  if (score >= 62) return "Medium";
  return "Low";
}
