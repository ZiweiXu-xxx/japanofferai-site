export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const OPENAI_API_KEY = process.env.OPENAI_API_KEY;
    const SUPABASE_URL = process.env.SUPABASE_URL;
    const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!OPENAI_API_KEY || !SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
      return res.status(500).json({
        error: "Server environment variables are missing."
      });
    }

    const body = req.body || {};
    const email = String(body.email || "").trim().toLowerCase();

    if (!email || !email.includes("@")) {
      return res.status(400).json({ error: "Please enter a valid email." });
    }

    const candidate = {
      background: String(body.background || "").slice(0, 2500),
      languages: String(body.languages || "").slice(0, 1000),
      targetCountry: String(body.targetCountry || "").slice(0, 500),
      targetIndustry: String(body.targetIndustry || "").slice(0, 500),
      concerns: String(body.concerns || "").slice(0, 1000)
    };

    const jobs = Array.isArray(body.jobs) ? body.jobs.slice(0, 3).map((job, index) => ({
      title: String(job.title || `Job ${index + 1}`).slice(0, 200),
      description: String(job.description || "").slice(0, 3500)
    })) : [];

    const validJobs = jobs.filter(job => job.description.trim().length > 50);

    if (!candidate.background || validJobs.length === 0) {
      return res.status(400).json({
        error: "Please provide your background and at least one job description."
      });
    }

    const supabaseHeaders = {
      "apikey": SUPABASE_SERVICE_ROLE_KEY,
      "Authorization": `Bearer ${SUPABASE_SERVICE_ROLE_KEY}`,
      "Content-Type": "application/json"
    };

    const userLookup = await fetch(
      `${SUPABASE_URL}/rest/v1/users?email=eq.${encodeURIComponent(email)}&select=email,free_used,paid_credits`,
      { headers: supabaseHeaders }
    );

    if (!userLookup.ok) {
      const text = await userLookup.text();
      return res.status(500).json({ error: "Could not check user record.", details: text });
    }

    const users = await userLookup.json();
    let user = users[0];

    if (!user) {
      const createUser = await fetch(`${SUPABASE_URL}/rest/v1/users`, {
        method: "POST",
        headers: {
          ...supabaseHeaders,
          "Prefer": "return=representation"
        },
        body: JSON.stringify({
          email,
          free_used: false,
          paid_credits: 0
        })
      });

      if (!createUser.ok) {
        const text = await createUser.text();
        return res.status(500).json({ error: "Could not create user.", details: text });
      }

      const created = await createUser.json();
      user = created[0];
    }

    const freeUsed = Boolean(user.free_used);
    const paidCredits = Number(user.paid_credits || 0);

    if (freeUsed && paidCredits <= 0) {
      return res.status(402).json({
        error: "FREE_REPORT_USED",
        message: "You have already used your free report. Additional reports will require paid credits."
      });
    }

const prompt = `
You are JapanOffer AI, an early-stage application priority analysis tool.

Your job is NOT to simply praise every job option.
Your job is to compare the candidate against each job description and decide which applications are genuinely worth prioritising.

You must follow these rules:

1. Compare the jobs against each other.
2. Do not give the same fit score to all jobs unless the job descriptions are truly almost identical.
3. If a job description is vague, unrelated, or too general, reduce the score.
4. Scores must reflect relative priority:
   - 85-95: very strong fit, apply first
   - 70-84: good fit, apply
   - 55-69: possible but risky, maybe
   - below 55: weak fit, low priority
5. Identify different risks for different roles.
6. Be honest. If a role is not strongly connected to the candidate's background, say so.
7. Do not invent visa certainty. Use "visa risk" only as a risk indicator.
8. This is not legal, immigration, or professional career advice.
9. Return ONLY valid JSON. Do not use markdown.

You should especially consider:
- academic background
- language ability
- target country
- role relevance
- visa or sponsorship risk
- whether the role builds a coherent long-term route
- whether the candidate has direct or indirect experience
- whether the job looks realistic for an early-career applicant

Return this exact JSON structure:
{
  "candidate_snapshot": "short summary of the candidate",
  "overall_route": "the most realistic overseas career route based on the information",
  "jobs": [
    {
      "role": "job title",
      "fit_score": 82,
      "priority": "Apply first / Apply / Maybe / Low priority",
      "main_risk": "main risk",
      "reason": "specific explanation of why this role is or is not a good fit",
      "suggested_action": "what the candidate should do next"
    }
  ],
  "final_advice": "clear overall recommendation, including which job should be prioritised first and which should not waste too much time",
  "disclaimer": "This is an early-stage AI assessment and not legal, immigration, or professional career advice."
}
`;

    const openaiResponse = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${OPENAI_API_KEY}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        temperature: 0.2,
        response_format: { type: "json_object" },
        messages: [
          { role: "system", content: prompt },
          {
            role: "user",
            content: JSON.stringify({
              candidate,
              jobs: validJobs
            })
          }
        ]
      })
    });

    if (!openaiResponse.ok) {
      const text = await openaiResponse.text();
      return res.status(500).json({
        error: "OpenAI request failed.",
        details: text
      });
    }

    const openaiData = await openaiResponse.json();
    const content = openaiData.choices?.[0]?.message?.content;

    if (!content) {
      return res.status(500).json({ error: "No report returned from OpenAI." });
    }

    let report;
    try {
      report = JSON.parse(content);
    } catch (e) {
      return res.status(500).json({
        error: "OpenAI returned invalid JSON.",
        raw: content
      });
    }

    const now = new Date().toISOString();

    if (!freeUsed) {
      await fetch(`${SUPABASE_URL}/rest/v1/users?email=eq.${encodeURIComponent(email)}`, {
        method: "PATCH",
        headers: supabaseHeaders,
        body: JSON.stringify({
          free_used: true,
          last_report_at: now
        })
      });
    } else if (paidCredits > 0) {
      await fetch(`${SUPABASE_URL}/rest/v1/users?email=eq.${encodeURIComponent(email)}`, {
        method: "PATCH",
        headers: supabaseHeaders,
        body: JSON.stringify({
          paid_credits: paidCredits - 1,
          last_report_at: now
        })
      });
    }

    await fetch(`${SUPABASE_URL}/rest/v1/reports`, {
      method: "POST",
      headers: supabaseHeaders,
      body: JSON.stringify({
        email,
        candidate_input: candidate,
        job_inputs: validJobs,
        report_output: report
      })
    });

    return res.status(200).json({
      success: true,
      report,
      free_used_now: !freeUsed,
      remaining_paid_credits: freeUsed ? Math.max(paidCredits - 1, 0) : paidCredits
    });

  } catch (error) {
    return res.status(500).json({
      error: "Unexpected server error.",
      details: error.message
    });
  }
}
