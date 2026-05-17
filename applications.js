// JapanOffer AI - Step 31 Application Hub
(function () {
  const savedJobsList = document.getElementById("savedJobsList");
  const draftList = document.getElementById("draftList");
  const searchInput = document.getElementById("searchInput");

  const profileAuth = document.getElementById("profileAuth");
  const profileCareer = document.getElementById("profileCareer");
  const profileMarket = document.getElementById("profileMarket");
  const profileCv = document.getElementById("profileCv");
  const profileStatus = document.getElementById("profileStatus");

  const savedStatus = document.getElementById("savedStatus");
  const editorStatus = document.getElementById("editorStatus");
  const copyStatus = document.getElementById("copyStatus");

  const selectedTitle = document.getElementById("selectedTitle");
  const selectedSubtitle = document.getElementById("selectedSubtitle");
  const matchScore = document.getElementById("matchScore");
  const marketLabel = document.getElementById("marketLabel");
  const statusLabel = document.getElementById("statusLabel");
  const applicationStatus = document.getElementById("applicationStatus");
  const notesInput = document.getElementById("notesInput");
  const coverLetterOutput = document.getElementById("coverLetterOutput");

  const generateButton = document.getElementById("generateButton");
  const saveDraftButton = document.getElementById("saveDraftButton");
  const copyButton = document.getElementById("copyButton");
  const clearButton = document.getElementById("clearButton");

  let supabaseClient = null;
  let currentUser = null;
  let currentProfile = null;
  let savedJobs = [];
  let drafts = [];
  let selectedJob = null;

  function escapeHtml(value) {
    return String(value ?? "")
      .replaceAll("&", "&amp;")
      .replaceAll("<", "&lt;")
      .replaceAll(">", "&gt;")
      .replaceAll('"', "&quot;")
      .replaceAll("'", "&#039;");
  }

  function normalize(value) {
    return String(value || "").toLowerCase();
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

  function formatDate(value) {
    if (!value) return "";
    try {
      return new Date(value).toLocaleString();
    } catch {
      return String(value);
    }
  }

  function statusZh(value) {
    const map = {
      saved: "已保存",
      drafting: "准备材料中",
      ready: "可以投递",
      applied: "已投递",
      interview: "面试中",
      rejected: "未通过",
      offer: "拿到 Offer"
    };
    return map[value] || value || "已保存";
  }

  function profileLine() {
    return [
      currentProfile?.headline,
      currentProfile?.career_direction,
      currentProfile?.target_market,
      currentProfile?.languages,
      currentProfile?.cv_file_name ? `CV: ${currentProfile.cv_file_name}` : ""
    ].filter(Boolean).join(" · ");
  }

  function loadSelectedJobDraft(jobId) {
    return drafts.find((draft) => draft.job_id === jobId);
  }

  function renderSavedJobs() {
    const q = normalize(searchInput.value);
    let list = savedJobs;

    if (q) {
      list = list.filter((job) => normalize([
        job.job_title,
        job.company_name,
        job.market,
        job.category
      ].join(" ")).includes(q));
    }

    if (!list.length) {
      savedJobsList.innerHTML = `
        <div class="empty">
          还没有保存岗位。请先去「职位」页面保存一个岗位，再回到这里生成申请材料。
        </div>
      `;
      return;
    }

    savedJobsList.innerHTML = list.map((job) => {
      const active = selectedJob?.job_id === job.job_id ? "active" : "";
      const draft = loadSelectedJobDraft(job.job_id);
      return `
        <button class="job-item ${active}" data-id="${escapeHtml(job.job_id)}" type="button">
          <strong>${escapeHtml(job.job_title || "Untitled role")}</strong>
          <span>${escapeHtml(job.company_name || "Unknown company")} · ${escapeHtml(job.market || "")} · ${escapeHtml(job.match_score || "--")} match</span>
          <span class="status-pill">${escapeHtml(statusZh(draft?.status || job.status || "saved"))}</span>
        </button>
      `;
    }).join("");

    Array.from(document.querySelectorAll(".job-item")).forEach((button) => {
      button.addEventListener("click", () => selectJob(button.dataset.id));
    });
  }

  function renderDrafts() {
    if (!drafts.length) {
      draftList.innerHTML = `<div class="empty">还没有申请草稿。</div>`;
      return;
    }

    draftList.innerHTML = drafts.map((draft) => `
      <div class="draft-item">
        <strong>${escapeHtml(draft.job_title || draft.job_id)}</strong>
        <span>${escapeHtml(draft.company_name || "")} · ${escapeHtml(statusZh(draft.status))} · ${escapeHtml(formatDate(draft.updated_at))}</span>
      </div>
    `).join("");
  }

  function selectJob(jobId) {
    selectedJob = savedJobs.find((job) => job.job_id === jobId) || null;
    const draft = selectedJob ? loadSelectedJobDraft(selectedJob.job_id) : null;

    if (!selectedJob) {
      selectedTitle.textContent = "选择一个岗位";
      selectedSubtitle.textContent = "从左侧选择已保存岗位后，这里会显示申请分析。";
      matchScore.textContent = "--";
      marketLabel.textContent = "--";
      statusLabel.textContent = "--";
      notesInput.value = "";
      coverLetterOutput.value = "";
      renderSavedJobs();
      return;
    }

    selectedTitle.textContent = selectedJob.job_title || "Untitled role";
    selectedSubtitle.textContent = `${selectedJob.company_name || "Unknown company"} · ${selectedJob.market || ""} · ${selectedJob.category || ""}`;
    matchScore.textContent = selectedJob.match_score || "--";
    marketLabel.textContent = selectedJob.market || "--";
    applicationStatus.value = draft?.status || selectedJob.status || "saved";
    statusLabel.textContent = statusZh(applicationStatus.value);
    notesInput.value = draft?.notes || selectedJob.notes || "";
    coverLetterOutput.value = draft?.cover_letter || "";

    renderSavedJobs();
  }

  function generateAdvice() {
    if (!selectedJob) {
      showStatus(editorStatus, "请先从左侧选择一个已保存岗位。", "error");
      return;
    }

    const snapshot = selectedJob.job_snapshot || {};
    const title = selectedJob.job_title || snapshot.title || "the role";
    const company = selectedJob.company_name || snapshot.company || "the company";
    const market = selectedJob.market || snapshot.market || "the target market";
    const category = selectedJob.category || snapshot.category || "cross-border career";
    const score = selectedJob.match_score || snapshot.matchScore || "--";
    const name = currentProfile?.full_name || "I";
    const languages = currentProfile?.languages || "English / Mandarin";
    const career = currentProfile?.career_direction || category;
    const profile = profileLine();

    const strengths = [];
    const gaps = [];

    if (normalize(career).includes("合规") || normalize(category).includes("compliance") || normalize(category).includes("aml")) {
      strengths.push("法律或合规方向可以作为核心叙事，把学术背景转化成 risk / compliance awareness。");
    }

    if (normalize(languages).includes("japanese") || normalize(languages).includes("日")) {
      strengths.push("日语能力可以支持日本市场、跨境沟通和本地团队协作。");
    }

    if (normalize(languages).includes("english")) {
      strengths.push("英文能力可以支持 international team、policy review 和跨境沟通。");
    }

    if (normalize(languages).includes("mandarin") || normalize(languages).includes("中文")) {
      strengths.push("中文能力适合连接中国候选人、亚洲客户或跨境业务场景。");
    }

    if (normalize(profile).includes("web3") || normalize(category).includes("web3") || normalize(title).includes("crypto")) {
      strengths.push("Web3 / virtual assets 兴趣可以放在 compliance、risk 或 platform operations 的交叉点上。");
    }

    if (!strengths.length) {
      strengths.push("你的背景可以从跨境理解、语言能力和学习能力角度切入。");
    }

    if (market === "Japan" && !normalize(languages).includes("japanese") && !normalize(languages).includes("日")) {
      gaps.push("如果目标是日本岗位，最好补充日语能力证明或说明可以先从英文环境岗位切入。");
    }

    if (normalize(category).includes("aml") || normalize(category).includes("finance")) {
      gaps.push("CV 中建议明确加入 AML、KYC、due diligence、risk review 等关键词。");
    }

    if (normalize(category).includes("web3")) {
      gaps.push("建议在 CV 中补充 virtual assets、crypto exchange、blockchain compliance 或交易平台理解。");
    }

    if (!gaps.length) {
      gaps.push("目前主要不是方向不匹配，而是需要把经历写得更贴近岗位语言。");
    }

    const coverLetter = [
      `申请岗位：${title}`,
      `公司方向：${company}`,
      `市场：${market}`,
      `当前匹配分：${score}`,
      "",
      "一、申请定位",
      `${name === "I" ? "I" : name} 可以把自己定位为「${category} 方向的跨境候选人」。${profile ? `当前资料显示：${profile}。` : ""}`,
      "",
      "二、可以强调的优势",
      ...strengths.map((item) => `- ${item}`),
      "",
      "三、CV 修改方向",
      ...gaps.map((item) => `- ${item}`),
      "",
      "四、英文 Cover Letter 初稿",
      `Dear Hiring Team,`,
      "",
      `I am writing to express my interest in the ${title} position at ${company}. My background combines international legal and business training, multilingual communication, and a clear interest in ${category}. I am particularly interested in roles where cross-border understanding, compliance awareness and practical execution are valued.`,
      "",
      `Through my studies and project experience, I have developed the ability to understand complex requirements, communicate across different cultural and professional contexts, and learn quickly in new environments. I believe these qualities are especially relevant to ${title}, where the work requires both attention to detail and a practical understanding of international markets.`,
      "",
      `I would be grateful for the opportunity to further discuss how my background can contribute to your team. Thank you for considering my application.`,
      "",
      `Kind regards,`,
      `${currentProfile?.full_name || ""}`,
      "",
      "五、下一步",
      "- 先把 CV 的 Profile Summary 改成贴合该岗位方向。",
      "- 把相关经历改成 action + task + result 的格式。",
      "- 再根据公司官网和岗位描述微调 Cover Letter。"
    ].join("\n");

    coverLetterOutput.value = coverLetter;
    applicationStatus.value = "drafting";
    statusLabel.textContent = statusZh("drafting");
    showStatus(editorStatus, "已生成申请材料。你可以继续手动修改，然后保存草稿。", "success");
  }

  async function saveDraft() {
    if (!selectedJob) {
      showStatus(editorStatus, "请先选择一个岗位。", "error");
      return;
    }

    if (!supabaseClient || !currentUser) {
      showStatus(editorStatus, "请先登录，再保存申请草稿。", "error");
      return;
    }

    const payload = {
      user_id: currentUser.id,
      job_id: selectedJob.job_id,
      saved_job_id: selectedJob.id,
      job_title: selectedJob.job_title,
      company_name: selectedJob.company_name,
      market: selectedJob.market,
      status: applicationStatus.value,
      notes: notesInput.value.trim(),
      cover_letter: coverLetterOutput.value.trim(),
      updated_at: new Date().toISOString()
    };

    const { data, error } = await supabaseClient
      .from("application_drafts")
      .upsert(payload, { onConflict: "user_id,job_id" })
      .select("*")
      .single();

    if (error) {
      showStatus(editorStatus, `保存失败：${error.message}`, "error");
      return;
    }

    const existingIndex = drafts.findIndex((draft) => draft.job_id === selectedJob.job_id);
    if (existingIndex >= 0) drafts[existingIndex] = data;
    else drafts.unshift(data);

    statusLabel.textContent = statusZh(data.status);
    renderDrafts();
    renderSavedJobs();
    showStatus(editorStatus, "申请草稿已保存。", "success");
    logEvent("application_draft_saved", selectedJob.job_id);
  }

  async function loadData() {
    const config = getConfig();

    if (!config) {
      profileAuth.textContent = "配置缺失";
      showStatus(profileStatus, "没有读取到 Supabase 配置。", "error");
      return;
    }

    supabaseClient = window.supabase.createClient(config.url, config.key);

    const { data, error } = await supabaseClient.auth.getUser();

    if (error || !data?.user) {
      currentUser = null;
      profileAuth.textContent = "未登录";
      profileCareer.textContent = "未登录";
      profileMarket.textContent = "未登录";
      profileCv.textContent = "未登录";
      showStatus(profileStatus, "请先登录，再使用申请中心。", "error");
      savedJobsList.innerHTML = `<div class="empty">请先登录，然后去职位页保存岗位。</div>`;
      return;
    }

    currentUser = data.user;
    profileAuth.textContent = "已登录";

    const { data: profile, error: profileError } = await supabaseClient
      .from("user_profiles")
      .select("*")
      .eq("user_id", currentUser.id)
      .maybeSingle();

    if (!profileError && profile) {
      currentProfile = profile;
    }

    profileCareer.textContent = currentProfile?.career_direction || "未填写";
    profileMarket.textContent = currentProfile?.target_market || "未填写";
    profileCv.textContent = currentProfile?.cv_file_name ? "已上传" : "未上传";
    showStatus(profileStatus, currentProfile ? "已读取你的 Profile / CV 记录。" : "你还没有保存个人主页。建议先去我的主页上传 CV。", currentProfile ? "success" : "info");

    const { data: saved, error: savedError } = await supabaseClient
      .from("saved_jobs")
      .select("*")
      .eq("user_id", currentUser.id)
      .order("updated_at", { ascending: false });

    if (savedError) {
      savedJobsList.innerHTML = `<div class="empty">读取已保存岗位失败：${escapeHtml(savedError.message)}</div>`;
      return;
    }

    savedJobs = saved || [];

    const { data: draftRows, error: draftError } = await supabaseClient
      .from("application_drafts")
      .select("*")
      .eq("user_id", currentUser.id)
      .order("updated_at", { ascending: false });

    if (!draftError) {
      drafts = draftRows || [];
    }

    renderSavedJobs();
    renderDrafts();

    const params = new URLSearchParams(window.location.search);
    const preferredJobId = params.get("job");

    if (preferredJobId && savedJobs.some((job) => job.job_id === preferredJobId)) {
      selectJob(preferredJobId);
    } else if (savedJobs.length) {
      selectJob(savedJobs[0].job_id);
    }
  }

  async function logEvent(eventName, jobId) {
    if (!supabaseClient) return;
    try {
      await supabaseClient.from("page_events").insert({
        event_name: eventName,
        page_path: "/applications.html",
        metadata: { job_id: jobId || null }
      });
    } catch {
      try {
        await supabaseClient.from("page_events").insert({
          event_name: eventName,
          page_path: "/applications.html"
        });
      } catch {}
    }
  }

  searchInput.addEventListener("input", renderSavedJobs);
  applicationStatus.addEventListener("change", () => {
    statusLabel.textContent = statusZh(applicationStatus.value);
  });

  generateButton.addEventListener("click", generateAdvice);
  saveDraftButton.addEventListener("click", saveDraft);

  copyButton.addEventListener("click", async () => {
    if (!coverLetterOutput.value.trim()) {
      showStatus(copyStatus, "还没有可复制的内容。", "error");
      return;
    }

    try {
      await navigator.clipboard.writeText(coverLetterOutput.value);
      showStatus(copyStatus, "已复制。", "success");
    } catch {
      showStatus(copyStatus, "复制失败，可以手动全选复制。", "error");
    }
  });

  clearButton.addEventListener("click", () => {
    coverLetterOutput.value = "";
    showStatus(copyStatus, "内容已清空。", "info");
  });

  loadData();
})();
