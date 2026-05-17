// JapanOffer AI auto report demo
(function () {
  let currentLang = "zh";

  function scoreFrom(form) {
    let score = 58;
    const all = `${form.education} ${form.languages} ${form.market} ${form.career} ${form.visa} ${form.background}`.toLowerCase();

    if (all.includes("law") || all.includes("llb") || all.includes("legal") || all.includes("compliance")) score += 13;
    if (all.includes("japanese") || all.includes("n1") || all.includes("日本")) score += 10;
    if (all.includes("english") || all.includes("英语")) score += 6;
    if (all.includes("mandarin") || all.includes("中文") || all.includes("chinese")) score += 5;
    if (all.includes("sponsorship")) score -= 5;
    if (all.includes("already have work rights")) score += 8;
    if (all.includes("student visa") || all.includes("graduate route")) score += 3;

    return Math.max(42, Math.min(92, score));
  }

  function riskFrom(visa, languages, market) {
    const visaText = visa.toLowerCase();
    const langText = languages.toLowerCase();
    const marketText = market.toLowerCase();

    let visaRisk = "Medium";
    if (visaText.includes("already")) visaRisk = "Low";
    if (visaText.includes("need sponsorship") || visaText.includes("not sure")) visaRisk = "Medium-High";

    let languageRisk = "Medium";
    if (marketText.includes("japan") && (langText.includes("japanese") || langText.includes("n1") || langText.includes("n2"))) languageRisk = "Low";
    else if (marketText.includes("singapore") && langText.includes("english")) languageRisk = "Low";
    else if (marketText.includes("hong kong") && (langText.includes("english") || langText.includes("mandarin"))) languageRisk = "Low";

    return { visaRisk, languageRisk };
  }

  function roleAdvice(career) {
    if (career.includes("Legal")) return ["Legal Compliance Analyst", "KYC / AML Analyst", "Contract Assistant"];
    if (career.includes("Business")) return ["Cross-border Business Associate", "Market Research Analyst", "Partnership Assistant"];
    if (career.includes("Technology")) return ["Junior Product Analyst", "AI Operations Associate", "Technical Support Associate"];
    if (career.includes("Marketing")) return ["Growth Marketing Assistant", "Content Operations Associate", "Japan Market Intern"];
    return ["Legal / Compliance", "Business Associate", "Operations Assistant"];
  }



  function getAnonId() {
    let id = localStorage.getItem("japanoffer_anon_id");
    if (!id) {
      id = "anon_" + Math.random().toString(36).slice(2) + Date.now().toString(36);
      localStorage.setItem("japanoffer_anon_id", id);
    }
    return id;
  }

  function getSessionId() {
    let id = sessionStorage.getItem("japanoffer_session_id");
    if (!id) {
      id = "session_" + Math.random().toString(36).slice(2) + Date.now().toString(36);
      sessionStorage.setItem("japanoffer_session_id", id);
    }
    return id;
  }

  function getSupabaseClient() {
    if (window.japanOfferAuth) return window.japanOfferAuth;
    const ready =
      window.supabase &&
      window.JAPANOFFER_SUPABASE_URL &&
      window.JAPANOFFER_SUPABASE_ANON_KEY &&
      !window.JAPANOFFER_SUPABASE_URL.includes("PASTE_") &&
      !window.JAPANOFFER_SUPABASE_ANON_KEY.includes("PASTE_");
    if (!ready) return null;
    return window.supabase.createClient(
      window.JAPANOFFER_SUPABASE_URL,
      window.JAPANOFFER_SUPABASE_ANON_KEY
    );
  }

  async function saveReportSubmission(form, score, risks, roles) {
    const client = getSupabaseClient();
    if (!client) return;

    let user = null;
    try {
      const { data } = await client.auth.getUser();
      user = data && data.user ? data.user : null;
    } catch (error) {
      user = null;
    }

    const payload = {
      user_id: user ? user.id : null,
      user_email: user ? user.email : null,
      anonymous_id: getAnonId(),
      session_id: getSessionId(),
      lang: currentLang,
      education: form.education || null,
      languages: form.languages || null,
      market: form.market || null,
      career: form.career || null,
      visa: form.visa || null,
      background: form.background || null,
      score,
      visa_risk: risks.visaRisk,
      language_risk: risks.languageRisk,
      roles,
      page_url: window.location.href,
      user_agent: navigator.userAgent
    };

    try {
      const { error } = await client.from("report_submissions").insert(payload);
      if (error) console.warn("Report submission was not saved:", error.message);
    } catch (error) {
      console.warn("Report submission was not saved:", error);
    }

    if (window.japanOfferTrack) {
      window.japanOfferTrack("report_generated", {
        market: form.market,
        career: form.career,
        score,
        lang: currentLang
      });
    }
  }

  function renderZh(form, score, risks, roles) {
    return `
      <article class="generated-report">
        <div class="report-score">
          <span>综合匹配分数</span>
          <strong>${score}%</strong>
        </div>

        <h2>JapanOffer AI 中文匹配报告</h2>
        <p>
          根据你提供的学历、语言、目标市场和职业方向，你目前更适合先走
          <strong>${roles[0]}</strong> 或相关路线。这个结果不是简单聊天建议，而是基于背景、语言、签证和岗位要求的结构化判断。
        </p>

        <div class="report-metrics">
          <div><span>目标市场</span><strong>${form.market}</strong></div>
          <div><span>签证风险</span><strong>${risks.visaRisk}</strong></div>
          <div><span>语言风险</span><strong>${risks.languageRisk}</strong></div>
          <div><span>申请优先级</span><strong>${score >= 80 ? "优先申请" : score >= 65 ? "可进入 shortlist" : "谨慎申请"}</strong></div>
        </div>

        <h3>推荐岗位方向</h3>
        <ul>
          ${roles.map((role) => `<li>${role}</li>`).join("")}
        </ul>

        <h3>下一步建议</h3>
        <p>
          建议你先把简历集中改成一个清晰方向，不要同时投太多无关岗位。
          如果目标是日本，应进一步突出日语、法律/合规相关经历和跨文化背景。
          如果目标是新加坡或香港，应突出英文、普通话和国际业务理解。
        </p>

        <div class="report-actions">
          <a class="btn primary" href="jobs.html?query=${encodeURIComponent(roles[0])}&market=${encodeURIComponent(form.market)}">查看匹配岗位</a>
          <a class="btn secondary" href="feedback.html">提交反馈</a>
          <a class="btn secondary" href="signup.html">保存到账号</a>
        </div>
      </article>
    `;
  }

  function renderEn(form, score, risks, roles) {
    return `
      <article class="generated-report">
        <div class="report-score">
          <span>Overall match score</span>
          <strong>${score}%</strong>
        </div>

        <h2>JapanOffer AI Match Report</h2>
        <p>
          Based on your education, languages, target market and career direction, your strongest starting route is
          <strong>${roles[0]}</strong> or a related path. This is not a generic AI chat answer. It is a structured match view based on background, language, visa and role requirements.
        </p>

        <div class="report-metrics">
          <div><span>Target market</span><strong>${form.market}</strong></div>
          <div><span>Visa risk</span><strong>${risks.visaRisk}</strong></div>
          <div><span>Language risk</span><strong>${risks.languageRisk}</strong></div>
          <div><span>Priority</span><strong>${score >= 80 ? "Apply first" : score >= 65 ? "Shortlist" : "Review carefully"}</strong></div>
        </div>

        <h3>Recommended role directions</h3>
        <ul>
          ${roles.map((role) => `<li>${role}</li>`).join("")}
        </ul>

        <h3>Next step</h3>
        <p>
          Focus your CV around one clear direction instead of applying randomly. For Japan, highlight Japanese ability,
          legal/compliance exposure and cross-cultural background. For Singapore or Hong Kong, highlight English, Mandarin and international business fit.
        </p>

        <div class="report-actions">
          <a class="btn primary" href="jobs.html?query=${encodeURIComponent(roles[0])}&market=${encodeURIComponent(form.market)}">View matched jobs</a>
          <a class="btn secondary" href="feedback.html">Give feedback</a>
          <a class="btn secondary" href="signup.html">Save to account</a>
        </div>
      </article>
    `;
  }

  function setLang(lang) {
    currentLang = lang;
    document.querySelectorAll("[data-report-lang]").forEach((btn) => {
      btn.classList.toggle("active", btn.dataset.reportLang === lang);
    });
    const label = document.getElementById("reportModeLabel");
    if (label) label.textContent = lang === "zh" ? "中文模式" : "English mode";
  }

  document.addEventListener("DOMContentLoaded", function () {
    const params = new URLSearchParams(window.location.search);
    if (params.get("lang") === "en") setLang("en");
    else setLang("zh");

    document.querySelectorAll("[data-report-lang]").forEach((btn) => {
      btn.addEventListener("click", () => setLang(btn.dataset.reportLang));
    });

    const form = document.getElementById("autoReportForm");
    const output = document.getElementById("reportOutput");
    if (!form || !output) return;

    form.addEventListener("submit", async function (event) {
      event.preventDefault();
      const data = Object.fromEntries(new FormData(form).entries());
      const score = scoreFrom(data);
      const risks = riskFrom(data.visa, data.languages, data.market);
      const roles = roleAdvice(data.career);

      output.innerHTML = currentLang === "zh"
        ? renderZh(data, score, risks, roles)
        : renderEn(data, score, risks, roles);

      localStorage.setItem("japanoffer_last_report", JSON.stringify({
        ...data,
        score,
        risks,
        roles,
        lang: currentLang,
        createdAt: new Date().toISOString()
      }));

      await saveReportSubmission(data, score, risks, roles);

      output.scrollIntoView({ behavior: "smooth", block: "start" });
    });
  });
})();
