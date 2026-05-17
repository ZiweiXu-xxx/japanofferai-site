// JapanOffer AI - Step 30 Jobs + Saved Jobs + AI Recommendation MVP
(function () {
  const jobsGrid = document.getElementById("jobsGrid");
  const savedList = document.getElementById("savedList");
  const searchInput = document.getElementById("searchInput");
  const marketFilter = document.getElementById("marketFilter");
  const categoryFilter = document.getElementById("categoryFilter");
  const languageFilter = document.getElementById("languageFilter");
  const sortFilter = document.getElementById("sortFilter");
  const rankWithProfileButton = document.getElementById("rankWithProfileButton");
  const saveStatus = document.getElementById("saveStatus");
  const applyStatus = document.getElementById("applyStatus");
  const applyOutput = document.getElementById("applyOutput");

  const profileAuth = document.getElementById("profileAuth");
  const profileCareer = document.getElementById("profileCareer");
  const profileMarket = document.getElementById("profileMarket");
  const profileLanguages = document.getElementById("profileLanguages");
  const profileCv = document.getElementById("profileCv");
  const profileStatus = document.getElementById("profileStatus");

  let supabaseClient = null;
  let currentUser = null;
  let currentProfile = null;
  let savedJobIds = new Set();

  let jobs = [
    {
      id: "jp-legal-compliance-analyst",
      title: "Legal Compliance Analyst",
      company: "Japan FinTech / Payments Company",
      companyInitials: "JP",
      market: "Japan",
      city: "Tokyo",
      category: "Legal / Compliance",
      seniority: "Entry-level possible",
      visa: "Medium visa risk",
      visaScore: 68,
      entryScore: 78,
      languages: ["English", "Japanese"],
      skills: ["Legal research", "Compliance", "KYC", "Policy review"],
      description: "适合有法律背景、英语能力，并希望进入日本金融科技、支付或平台型公司的合规岗位。",
      baseScore: 64
    },
    {
      id: "jp-web3-compliance-operations",
      title: "Web3 Compliance Operations Associate",
      company: "Japan Crypto Exchange / Web3 Platform",
      companyInitials: "WX",
      market: "Japan",
      city: "Tokyo / Remote hybrid",
      category: "Web3 / Risk",
      seniority: "Junior / Associate",
      visa: "Medium visa risk",
      visaScore: 62,
      entryScore: 72,
      languages: ["English", "Japanese"],
      skills: ["KYC", "AML", "Crypto", "Risk review"],
      description: "适合想把法律背景、Crypto 兴趣和合规运营结合起来的候选人。",
      baseScore: 66
    },
    {
      id: "hk-aml-kyc-analyst",
      title: "AML / KYC Analyst",
      company: "Hong Kong Financial Services Group",
      companyInitials: "HK",
      market: "Hong Kong",
      city: "Hong Kong",
      category: "Finance / AML",
      seniority: "Entry-level possible",
      visa: "Lower visa risk",
      visaScore: 76,
      entryScore: 80,
      languages: ["English", "Mandarin"],
      skills: ["AML", "KYC", "Due diligence", "Risk"],
      description: "适合中文和英文能力较强、想进入香港金融合规或虚拟资产合规方向的人。",
      baseScore: 68
    },
    {
      id: "hk-virtual-assets-risk",
      title: "Virtual Assets Risk Associate",
      company: "Hong Kong Virtual Assets Firm",
      companyInitials: "VA",
      market: "Hong Kong",
      city: "Hong Kong",
      category: "Web3 / Risk",
      seniority: "Associate",
      visa: "Medium visa risk",
      visaScore: 70,
      entryScore: 64,
      languages: ["English", "Mandarin"],
      skills: ["Crypto", "Risk", "Compliance", "Research"],
      description: "适合对虚拟资产、交易所、合规和风控有强兴趣的候选人。",
      baseScore: 67
    },
    {
      id: "sg-cross-border-business-associate",
      title: "Cross-border Business Associate",
      company: "Singapore International Business Team",
      companyInitials: "SG",
      market: "Singapore",
      city: "Singapore",
      category: "Business / Strategy",
      seniority: "Junior / Graduate",
      visa: "Medium visa risk",
      visaScore: 66,
      entryScore: 76,
      languages: ["English", "Mandarin"],
      skills: ["Business development", "Market research", "Client communication"],
      description: "适合语言能力强、想进入国际业务、客户拓展或企业合作方向的人。",
      baseScore: 61
    },
    {
      id: "sg-fintech-risk-operations",
      title: "FinTech Risk Operations Analyst",
      company: "Singapore Payments / FinTech Company",
      companyInitials: "FT",
      market: "Singapore",
      city: "Singapore",
      category: "Data / Operations",
      seniority: "Entry-level possible",
      visa: "Medium visa risk",
      visaScore: 64,
      entryScore: 78,
      languages: ["English", "Mandarin"],
      skills: ["Risk operations", "Data review", "Compliance", "Payments"],
      description: "适合希望从运营、风险审核、支付合规切入新加坡 FinTech 的候选人。",
      baseScore: 63
    },
    {
      id: "uk-legal-operations-assistant",
      title: "Legal Operations Assistant",
      company: "UK Legal / Professional Services Team",
      companyInitials: "UK",
      market: "UK",
      city: "London / Birmingham",
      category: "Legal / Compliance",
      seniority: "Entry-level possible",
      visa: "Higher visa risk",
      visaScore: 48,
      entryScore: 74,
      languages: ["English"],
      skills: ["Legal admin", "Client support", "Research", "Documentation"],
      description: "适合法律学生积累英国本地 legal operations、文档管理和客户支持经验。",
      baseScore: 58
    },
    {
      id: "jp-international-talent-matching",
      title: "International Talent Matching Associate",
      company: "Japan HR Tech / Talent Platform",
      companyInitials: "HR",
      market: "Japan",
      city: "Tokyo",
      category: "Business / Strategy",
      seniority: "Junior / Associate",
      visa: "Medium visa risk",
      visaScore: 67,
      entryScore: 71,
      languages: ["English", "Japanese", "Mandarin"],
      skills: ["Recruiting", "Talent matching", "Market research", "Client communication"],
      description: "适合对跨境招聘、人才匹配、HR Tech 和国际业务有兴趣的人。",
      baseScore: 62
    }
  ];

  function escapeHtml(value) {
    return String(value ?? "")
      .replaceAll("&", "&amp;")
      .replaceAll("<", "&lt;")
      .replaceAll(">", "&gt;")
      .replaceAll('"', "&quot;")
      .replaceAll("'", "&#039;");
  }

  function getConfig() {
    const url = String(window.JAPANOFFER_SUPABASE_URL || window.SUPABASE_URL || "").replace(/\/+$/, "");
    const key = String(
      window.JAPANOFFER_SUPABASE_ANON_KEY ||
      window.JAPANOFFER_SUPABASE_PUBLISHABLE_KEY ||
      window.SUPABASE_ANON_KEY ||
      window.SUPABASE_PUBLISHABLE_KEY ||
      ""
    ).trim();

    if (!url || !key || !window.supabase?.createClient) return null;
    return { url, key };
  }

  function showStatus(el, message, type = "success") {
    if (!el) return;
    el.textContent = message;
    el.className = `status show ${type}`;
  }

  function normalize(value) {
    return String(value || "").toLowerCase();
  }

  function profileText() {
    if (!currentProfile) return "";
    return normalize([
      currentProfile.full_name,
      currentProfile.headline,
      currentProfile.target_market,
      currentProfile.career_direction,
      currentProfile.languages,
      currentProfile.bio,
      currentProfile.cv_file_name
    ].filter(Boolean).join(" "));
  }

  function calculateScore(job) {
    let score = job.baseScore;
    const text = profileText();

    if (!currentProfile) return score;

    const market = normalize(currentProfile.target_market);
    const career = normalize(currentProfile.career_direction);
    const langs = normalize(currentProfile.languages);

    if (market && normalize(job.market).includes(market)) score += 8;
    if (market.includes("多个") || market.includes("multi")) score += 2;

    if (career && normalize(job.category).includes(career.replace(" / ", " "))) score += 5;
    if (career.includes("法律") && job.category.includes("Legal")) score += 10;
    if (career.includes("合规") && (job.category.includes("Compliance") || job.skills.includes("Compliance"))) score += 9;
    if (career.includes("金融") && (job.category.includes("Finance") || job.skills.includes("AML"))) score += 7;
    if (career.includes("web3") && (job.category.includes("Web3") || job.skills.includes("Crypto"))) score += 9;
    if (career.includes("国际") && job.category.includes("Business")) score += 7;

    job.languages.forEach((lang) => {
      if (langs.includes(normalize(lang))) score += 4;
    });

    job.skills.forEach((skill) => {
      if (text.includes(normalize(skill))) score += 3;
    });

    if (text.includes("law") || text.includes("legal") || text.includes("llb") || text.includes("法律")) {
      if (job.category.includes("Legal") || job.skills.includes("Compliance")) score += 7;
    }

    if (text.includes("japanese") || text.includes("日语") || text.includes("日本語")) {
      if (job.market === "Japan") score += 6;
    }

    if (text.includes("crypto") || text.includes("web3") || text.includes("虚拟资产") || text.includes("加密")) {
      if (job.category.includes("Web3") || job.skills.includes("Crypto")) score += 8;
    }

    if (text.includes("project") || text.includes("项目")) {
      score += 2;
    }

    return Math.max(42, Math.min(88, Math.round(score)));
  }

  function getReasons(job, score) {
    const reasons = [];
    const text = profileText();

    if (currentProfile?.target_market && normalize(job.market).includes(normalize(currentProfile.target_market))) {
      reasons.push(`目标市场匹配：你的目标市场包含 ${job.market}。`);
    }

    if (currentProfile?.career_direction && (
      normalize(currentProfile.career_direction).includes("合规") ||
      normalize(currentProfile.career_direction).includes("法律")
    ) && (job.category.includes("Legal") || job.skills.includes("Compliance"))) {
      reasons.push("方向匹配：法律 / 合规背景可以直接转化为岗位优势。");
    }

    if (job.languages.some((lang) => normalize(currentProfile?.languages).includes(normalize(lang)))) {
      reasons.push("语言匹配：你的语言能力覆盖岗位要求的一部分。");
    }

    if (text.includes("web3") && job.category.includes("Web3")) {
      reasons.push("兴趣匹配：你的 Web3 / crypto 兴趣与岗位方向相关。");
    }

    if (job.entryScore >= 75) {
      reasons.push("入门友好：该方向更适合作为早期职业切入点。");
    }

    if (!reasons.length) {
      reasons.push(score >= 70 ? "整体匹配较好，可以优先研究岗位要求。" : "可以作为探索方向，但需要补充更具体经历。");
    }

    return reasons.slice(0, 3);
  }

  function mapPlatformJob(row) {
    return {
      id: row.slug,
      title: row.title,
      company: row.company_name || row.subtitle || "Unknown company",
      companyInitials: String(row.company_name || row.title || "JO")
        .split(/\s+/)
        .filter(Boolean)
        .slice(0, 2)
        .map((word) => word[0])
        .join("")
        .toUpperCase(),
      market: row.market || "Global",
      city: row.city || row.market || "",
      category: row.category || "Other",
      seniority: row.seniority || "Role target",
      visa: row.visa || "Visa risk unknown",
      visaScore: row.visa_score ?? 60,
      entryScore: row.entry_score ?? 60,
      languages: Array.isArray(row.languages) ? row.languages : [],
      skills: Array.isArray(row.skills) ? row.skills : [],
      description: row.description || "",
      baseScore: row.match_base ?? row.score ?? 60
    };
  }

  async function loadJobsFromDatabase() {
    if (!supabaseClient) return false;

    try {
      const { data, error } = await supabaseClient
        .from("platform_items")
        .select("*")
        .eq("item_type", "job")
        .eq("is_active", true)
        .order("sort_order", { ascending: true })
        .order("score", { ascending: false });

      if (error) throw error;

      if (Array.isArray(data) && data.length) {
        jobs = data.map(mapPlatformJob);
        return true;
      }
    } catch (error) {
      console.warn("Could not load jobs from platform_items. Static jobs are used.", error);
    }

    return false;
  }

  function filteredJobs() {
    const q = normalize(searchInput.value);
    const market = marketFilter.value;
    const category = categoryFilter.value;
    const language = languageFilter.value;

    let list = jobs.map((job) => ({
      ...job,
      matchScore: calculateScore(job)
    }));

    list = list.filter((job) => {
      const text = normalize([
        job.title,
        job.company,
        job.market,
        job.city,
        job.category,
        job.skills.join(" "),
        job.description
      ].join(" "));

      if (q && !text.includes(q)) return false;
      if (market !== "all" && job.market !== market) return false;
      if (category !== "all" && job.category !== category) return false;
      if (language !== "all" && !job.languages.includes(language)) return false;
      return true;
    });

    const sort = sortFilter.value;
    list.sort((a, b) => {
      if (sort === "visa") return b.visaScore - a.visaScore;
      if (sort === "entry") return b.entryScore - a.entryScore;
      if (sort === "market") {
        const target = normalize(currentProfile?.target_market);
        const aHit = target && normalize(a.market).includes(target) ? 1 : 0;
        const bHit = target && normalize(b.market).includes(target) ? 1 : 0;
        return bHit - aHit || b.matchScore - a.matchScore;
      }
      return b.matchScore - a.matchScore;
    });

    return list;
  }

  function renderJobs() {
    const list = filteredJobs();

    if (!list.length) {
      jobsGrid.innerHTML = `<div class="empty">没有找到符合筛选条件的岗位。可以放宽市场、方向或语言筛选。</div>`;
      return;
    }

    jobsGrid.innerHTML = list.map((job) => {
      const reasons = getReasons(job, job.matchScore);
      const saved = savedJobIds.has(job.id);

      return `
        <article class="job-card">
          <div class="job-top">
            <div class="company-mark">${escapeHtml(job.companyInitials)}</div>
            <div>
              <h3>${escapeHtml(job.title)}</h3>
              <div class="meta">${escapeHtml(job.company)} · ${escapeHtml(job.city)} · ${escapeHtml(job.seniority)}</div>
            </div>
            <div class="score">
              <strong>${job.matchScore}</strong>
              <span>match</span>
            </div>
          </div>

          <p class="job-desc">${escapeHtml(job.description)}</p>

          <div class="pills">
            <span class="pill">${escapeHtml(job.market)}</span>
            <span class="pill">${escapeHtml(job.category)}</span>
            <span class="pill">${escapeHtml(job.visa)}</span>
            ${job.languages.map((lang) => `<span class="pill">${escapeHtml(lang)}</span>`).join("")}
          </div>

          <div class="job-reasons">
            ${reasons.map((reason) => `<div class="reason">${escapeHtml(reason)}</div>`).join("")}
          </div>

          <div class="job-actions">
            <button class="btn ${saved ? "green" : ""}" data-action="save" data-id="${escapeHtml(job.id)}">
              ${saved ? "已保存" : "保存岗位"}
            </button>
            <button class="btn primary" data-action="apply" data-id="${escapeHtml(job.id)}">进入申请</button>
          </div>
        </article>
      `;
    }).join("");

    bindJobButtons();
  }

  function bindJobButtons() {
    Array.from(document.querySelectorAll("[data-action='save']")).forEach((button) => {
      button.addEventListener("click", () => saveJob(button.dataset.id));
    });

    Array.from(document.querySelectorAll("[data-action='apply']")).forEach((button) => {
      button.addEventListener("click", () => generateApplicationAdvice(button.dataset.id));
    });
  }

  function renderSavedJobs() {
    const saved = jobs.filter((job) => savedJobIds.has(job.id));

    if (!saved.length) {
      savedList.innerHTML = `<div class="empty">还没有保存岗位。</div>`;
      return;
    }

    savedList.innerHTML = saved.map((job) => `
      <div class="saved-item">
        <strong>${escapeHtml(job.title)}</strong>
        <span>${escapeHtml(job.company)} · ${escapeHtml(job.market)} · ${calculateScore(job)} match</span>
      </div>
    `).join("");
  }

  async function loadUserAndProfile() {
    const config = getConfig();

    if (!config) {
      profileAuth.textContent = "配置缺失";
      showStatus(profileStatus, "没有读取到 Supabase 配置。职位库仍可浏览，但不能保存岗位。", "error");
      renderJobs();
      return;
    }

    supabaseClient = window.supabase.createClient(config.url, config.key);

    await loadJobsFromDatabase();

    const { data, error } = await supabaseClient.auth.getUser();

    if (error || !data?.user) {
      currentUser = null;
      currentProfile = null;
      profileAuth.textContent = "未登录";
      profileCareer.textContent = "未登录";
      profileMarket.textContent = "未登录";
      profileLanguages.textContent = "未登录";
      profileCv.textContent = "未登录";
      showStatus(profileStatus, "未登录状态下可以浏览职位，但保存岗位和个性化排序需要先登录。", "info");
      renderJobs();
      return;
    }

    currentUser = data.user;
    profileAuth.textContent = "已登录";

    const { data: profile, error: profileError } = await supabaseClient
      .from("user_profiles")
      .select("*")
      .eq("user_id", currentUser.id)
      .maybeSingle();

    if (profileError) {
      showStatus(profileStatus, `读取个人主页失败：${profileError.message}`, "error");
    } else {
      currentProfile = profile || null;
    }

    profileCareer.textContent = currentProfile?.career_direction || "未填写";
    profileMarket.textContent = currentProfile?.target_market || "未填写";
    profileLanguages.textContent = currentProfile?.languages || "未填写";
    profileCv.textContent = currentProfile?.cv_file_name ? "已上传" : "未上传";

    if (currentProfile) {
      showStatus(profileStatus, "已读取你的 Profile / CV 记录，岗位已经按你的背景重新排序。", "success");
    } else {
      showStatus(profileStatus, "你已登录，但还没有保存个人主页。建议先去我的主页上传 CV。", "info");
    }

    await loadSavedJobs();
    renderJobs();
    renderSavedJobs();
  }

  async function loadSavedJobs() {
    savedJobIds = new Set();

    if (!supabaseClient || !currentUser) return;

    const { data, error } = await supabaseClient
      .from("saved_jobs")
      .select("job_id")
      .eq("user_id", currentUser.id);

    if (error) {
      showStatus(saveStatus, `读取已保存岗位失败：${error.message}`, "error");
      return;
    }

    (data || []).forEach((row) => savedJobIds.add(row.job_id));
  }

  async function saveJob(jobId) {
    const job = jobs.find((item) => item.id === jobId);
    if (!job) return;

    if (!supabaseClient || !currentUser) {
      showStatus(saveStatus, "请先登录，再保存岗位。", "error");
      return;
    }

    const payload = {
      user_id: currentUser.id,
      job_id: job.id,
      job_title: job.title,
      company_name: job.company,
      market: job.market,
      category: job.category,
      match_score: calculateScore(job),
      job_snapshot: job,
      updated_at: new Date().toISOString()
    };

    const { error } = await supabaseClient
      .from("saved_jobs")
      .upsert(payload, { onConflict: "user_id,job_id" });

    if (error) {
      showStatus(saveStatus, `保存失败：${error.message}`, "error");
      return;
    }

    savedJobIds.add(job.id);
    showStatus(saveStatus, "岗位已保存到你的账号。", "success");
    renderJobs();
    renderSavedJobs();
    logEvent("job_saved", job.id);
  }

  async function generateApplicationAdvice(jobId) {
    const job = jobs.find((item) => item.id === jobId);
    if (!job) return;

    if (!supabaseClient || !currentUser) {
      showStatus(applyStatus, "请先登录，再进入申请中心。", "error");
      return;
    }

    showStatus(applyStatus, "正在保存岗位，并跳转到申请中心...", "info");

    const payload = {
      user_id: currentUser.id,
      job_id: job.id,
      job_title: job.title,
      company_name: job.company,
      market: job.market,
      category: job.category,
      match_score: calculateScore(job),
      job_snapshot: job,
      updated_at: new Date().toISOString()
    };

    const { error } = await supabaseClient
      .from("saved_jobs")
      .upsert(payload, { onConflict: "user_id,job_id" });

    if (error) {
      showStatus(applyStatus, `保存岗位失败：${error.message}`, "error");
      return;
    }

    savedJobIds.add(job.id);
    renderJobs();
    renderSavedJobs();
    logEvent("enter_application_hub", job.id);

    setTimeout(() => {
      window.location.href = `applications.html?job=${encodeURIComponent(job.id)}`;
    }, 350);
  }

  async function logEvent(eventName, jobId) {
    if (!supabaseClient) return;

    try {
      await supabaseClient.from("page_events").insert({
        event_name: eventName,
        page_path: "/jobs.html",
        metadata: { job_id: jobId || null }
      });
    } catch (error) {
      // page_events may not have metadata in older setup. Ignore silently.
      try {
        await supabaseClient.from("page_events").insert({
          event_name: eventName,
          page_path: "/jobs.html"
        });
      } catch {}
    }
  }

  [searchInput, marketFilter, categoryFilter, languageFilter, sortFilter].forEach((el) => {
    el.addEventListener("input", renderJobs);
    el.addEventListener("change", renderJobs);
  });

  rankWithProfileButton.addEventListener("click", async () => {
    await loadUserAndProfile();
    showStatus(profileStatus, currentProfile ? "已重新读取你的 Profile / CV，并刷新岗位排序。" : "还没有读取到个人主页资料。", currentProfile ? "success" : "info");
  });

  loadUserAndProfile();
})();
