// JapanOffer AI real AI report — shared browser helper.
//
// Used by report.html and match.html (ai-match.js) to call POST /api/analyze.
// No framework, no new dependencies. The server owns all quota decisions;
// this helper only sends the signed-in user's Supabase access token and
// turns HTTP statuses into typed results the pages can render.
//
// Contract (see api/analyze.js):
//   POST /api/analyze, Authorization: Bearer <Supabase access token>
//   body: { background, languages, targetCountry, targetIndustry,
//           concerns, jobs: [{ title, description }] }
//     - background is required; at least one job needs a description
//       longer than 50 characters (max 3 jobs are considered).
//   200: { success, report: { candidate_snapshot, overall_route,
//          jobs: [{ role, fit_score, priority, main_risk, reason,
//                   suggested_action }], final_advice, disclaimer,
//          cover_letter_opening? }, consumed_from,
//          remaining_paid_credits, remaining_premium_credits, premium_active }
//   401: not signed in (or session expired) — send the user to login.
//   402: { error: "FREE_REPORT_USED" } — no reports left; send to pricing.
//   400: input problem (background or job description missing/too short).
//   429: rate limited — try again later.
//   500: generic server error (upstream details are never echoed).
//
// Nothing in this file spends a credit by itself: a credit is only
// consumed server-side after a report is generated successfully.
(function () {
  var ANALYZE_URL = "/api/analyze";

  function getClient() {
    if (window.japanOfferAuth) return window.japanOfferAuth;
    if (
      window.supabase &&
      window.JAPANOFFER_SUPABASE_URL &&
      window.JAPANOFFER_SUPABASE_ANON_KEY
    ) {
      var client = window.supabase.createClient(
        window.JAPANOFFER_SUPABASE_URL,
        window.JAPANOFFER_SUPABASE_ANON_KEY
      );
      window.japanOfferAuth = client;
      return client;
    }
    return null;
  }

  async function getAccessToken() {
    var client = getClient();
    if (!client) return null;
    try {
      var result = await client.auth.getSession();
      return (result && result.data && result.data.session && result.data.session.access_token) || null;
    } catch (e) {
      return null;
    }
  }

  // Calls the AI report API. Never throws for HTTP errors: the result
  // always carries { status, data } so the page can branch on 401 / 402 /
  // 429 / 500. Only a network failure rejects, and the page shows a
  // generic "could not reach the server" message for that.
  async function analyzeReport(payload) {
    var token = await getAccessToken();
    if (!token) {
      return { status: 401, data: { error: "Sign in required to generate a report." } };
    }
    var res = await fetch(ANALYZE_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: "Bearer " + token,
      },
      body: JSON.stringify(payload),
    });
    var data = null;
    try {
      data = await res.json();
    } catch (e) {
      data = null;
    }
    return { status: res.status, data: data || {} };
  }

  // Short machine-readable kind for a non-200 analyze result, so pages can
  // pick the right translated message without parsing server text.
  function errorKind(result) {
    if (!result) return "network";
    if (result.status === 401) return "unauthorized";
    if (result.status === 402) return "no_credits";
    if (result.status === 429) return "rate_limited";
    if (result.status === 400) return "bad_request";
    return "server";
  }

  // Refresh the credits box after a report is generated (billing.js only
  // renders it once on page load). No-op when billing.js is not loaded.
  function refreshCredits() {
    if (typeof window.JOBillingRefresh === "function") {
      window.JOBillingRefresh();
    }
  }

  function escapeHtml(value) {
    return String(value == null ? "" : value)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;");
  }

  window.JOAnalyze = {
    getAccessToken: getAccessToken,
    analyzeReport: analyzeReport,
    errorKind: errorKind,
    refreshCredits: refreshCredits,
    escapeHtml: escapeHtml,
  };
})();
