// JapanOffer AI - Chinese AI Match Entry
// Step 22: full-width premium layout + concrete company/search routes.

(function () {
  const form = document.getElementById("matchForm");
  const textarea = document.getElementById("backgroundInput");
  const marketSelect = document.getElementById("targetMarket");
  const careerSelect = document.getElementById("careerDirection");
  const generateButton = document.getElementById("generateButton");

  const resultSection = document.getElementById("resultSection");
  const bestScoreEl = document.getElementById("bestScore");
  const summaryText = document.getElementById("summaryText");
  const roleGrid = document.getElementById("roleGrid");
  const routeGrid = document.getElementById("routeGrid");
  const tagGrid = document.getElementById("tagGrid");
  const judgementList = document.getElementById("judgementList");
  const roadmapList = document.getElementById("roadmapList");
  const copyButton = document.getElementById("copyResult");
  const statusMessage = document.getElementById("statusMessage");
  const jobTitleInput = document.getElementById("jobTitleInput");
  const jobDescInput = document.getElementById("jobDescInput");

  // Short-lived status line under the form (also used by the copy button).
  function showStatus(message) {
    statusMessage.textContent = message;
    statusMessage.classList.add("jo22-show");
    setTimeout(() => statusMessage.classList.remove("jo22-show"), 4000);
  }

  const urlParams = new URLSearchParams(window.location.search);
  const shouldLoadProfile = urlParams.get("source") === "profile" || urlParams.get("from") === "profile" || urlParams.get("auto") === "1";

  function ensureProfileNotice() {
    let notice = document.getElementById("profileMatchNotice");
    if (notice) return notice;

    const formCard = form?.closest("section") || form?.parentElement || document.body;
    notice = document.createElement("div");
    notice.id = "profileMatchNotice";
    notice.style.cssText = [
      "display:none",
      "margin:0 0 14px",
      "padding:13px 15px",
      "border-radius:16px",
      "background:rgba(10,102,194,.09)",
      "border:1px solid rgba(10,102,194,.16)",
      "color:#064b93",
      "font-size:13px",
      "line-height:1.55",
      "font-weight:800"
    ].join(";");
    formCard.insertBefore(notice, formCard.firstChild);
    return notice;
  }

  function showProfileNotice(message, type = "info") {
    const notice = ensureProfileNotice();
    notice.textContent = message;
    notice.style.display = "block";
    if (type === "error") {
      notice.style.background = "rgba(180,35,24,.10)";
      notice.style.borderColor = "rgba(180,35,24,.18)";
      notice.style.color = "#b42318";
    } else if (type === "success") {
      notice.style.background = "rgba(16,185,129,.10)";
      notice.style.borderColor = "rgba(16,185,129,.18)";
      notice.style.color = "#047857";
    }
  }

  function getClientSupabaseConfig() {
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

  async function readBlobAsArrayBuffer(blob) {
    return await blob.arrayBuffer();
  }

  async function extractDocxText(blob) {
    if (!window.mammoth?.extractRawText) return "";
    const arrayBuffer = await readBlobAsArrayBuffer(blob);
    const result = await window.mammoth.extractRawText({ arrayBuffer });
    return String(result?.value || "").trim();
  }

  async function tryExtractCvText(client, profile) {
    if (!profile?.cv_storage_path) return "";

    const fileName = String(profile.cv_file_name || "").toLowerCase();
    const { data, error } = await client.storage.from("cvs").download(profile.cv_storage_path);
    if (error || !data) return "";

    if (fileName.endsWith(".docx")) {
      return await extractDocxText(data);
    }

    // Browser-side PDF/DOC extraction is intentionally not forced here.
    // For PDF/DOC, we still use saved profile fields and CV filename.
    return "";
  }

  function buildBackgroundFromProfile(profile, cvText) {
    const parts = [];

    if (profile?.full_name) parts.push(`我的姓名是 ${profile.full_name}。`);
    if (profile?.headline) parts.push(`我的当前身份是：${profile.headline}。`);
    if (profile?.target_market) parts.push(`我的目标市场是：${profile.target_market}。`);
    if (profile?.career_direction) parts.push(`我的职业方向是：${profile.career_direction}。`);
    if (profile?.languages) parts.push(`我的语言能力是：${profile.languages}。`);
    if (profile?.bio) parts.push(`我的个人简介是：${profile.bio}`);

    if (profile?.cv_file_name) {
      parts.push(`我已经上传了 CV 文件：${profile.cv_file_name}。请把这份 CV 作为申请资料的一部分。`);
    }

    if (cvText && cvText.length > 40) {
      parts.push(`以下是系统从我上传的 CV 中读取到的内容：${cvText.slice(0, 4200)}`);
    }

    return parts.join("\n\n").trim();
  }

  function applyProfileSelects(profile) {
    if (profile?.target_market && marketSelect) {
      const marketMap = {
        "日本": "日本",
        "香港": "香港",
        "新加坡": "新加坡",
        "英国": "英国"
      };
      marketSelect.value = marketMap[profile.target_market] || "auto";
    }

    if (profile?.career_direction && careerSelect) {
      const wanted = String(profile.career_direction);
      const option = Array.from(careerSelect.options || []).find((item) => item.value === wanted || item.textContent === wanted);
      if (option) careerSelect.value = option.value;
    }
  }

  async function loadProfileAndAutoMatch() {
    if (!shouldLoadProfile || !form || !textarea) return;

    const config = getClientSupabaseConfig();
    if (!config) {
      showProfileNotice("没有读取到 Supabase 配置，所以暂时不能自动调用你的个人主页资料。", "error");
      return;
    }

    const client = window.supabase.createClient(config.url, config.key);

    showProfileNotice("正在读取你的个人主页和已上传 CV...");

    const { data: userData, error: userError } = await client.auth.getUser();
    const user = userData?.user;

    if (userError || !user) {
      showProfileNotice("你还没有登录。请先登录后再用个人资料做 AI 匹配。", "error");
      return;
    }

    const { data: profile, error: profileError } = await client
      .from("user_profiles")
      .select("*")
      .eq("user_id", user.id)
      .maybeSingle();

    if (profileError) {
      showProfileNotice(`读取个人主页失败：${profileError.message}`, "error");
      return;
    }

    if (!profile) {
      showProfileNotice("还没有找到你的个人主页资料。请先在「我的主页」保存资料或上传 CV。", "error");
      return;
    }

    let cvText = "";
    try {
      cvText = await tryExtractCvText(client, profile);
    } catch (error) {
      console.warn("CV text extraction failed", error);
    }

    const background = buildBackgroundFromProfile(profile, cvText);

    if (!background || background.length < 20) {
      showProfileNotice("已找到你的账号，但个人资料内容太少。请先在「我的主页」补充目标市场、方向和简介。", "error");
      return;
    }

    textarea.value = background;
    applyProfileSelects(profile);

    // The AI report needs a job description too: only auto-submit when one
    // is already pasted, otherwise ask the user to add it first.
    const jobReady = jobDescInput && jobDescInput.value.trim().length >= 50;
    if (!jobReady) {
      showProfileNotice("已读取你的个人主页和 CV 内容。请再粘贴一个目标岗位描述，然后点击「生成我的岗位匹配」。", "success");
      return;
    }

    if (cvText) {
      showProfileNotice("已读取你的个人主页和 DOCX 简历内容，正在自动生成匹配结果。", "success");
    } else if (profile.cv_file_name) {
      showProfileNotice("已读取你的个人主页和 CV 文件记录。正在自动生成匹配结果。", "success");
    } else {
      showProfileNotice("已读取你的个人主页资料，正在自动生成匹配结果。", "success");
    }

    setTimeout(() => {
      form.requestSubmit ? form.requestSubmit() : form.dispatchEvent(new Event("submit", { cancelable: true, bubbles: true }));
    }, 350);
  }


  const COMPANY_ROUTES = {
    "金融 / 合规": [
      {
        market: "日本",
        company: "PayPay / Rakuten / MUFG",
        role: "Compliance Analyst / Risk Operations Assistant",
        why: "日本金融科技和大型金融机构都需要合规、风控和跨境沟通人才。中文和英文能力可以用于国际业务、支付、风险审查和客户合规。",
        alternates: ["Mercari Fintech", "SBI Holdings", "Coincheck"],
        query: "Japan PayPay compliance analyst entry level English Chinese"
      },
      {
        market: "香港",
        company: "HashKey Group / HSBC / OKX",
        role: "AML Analyst / Compliance Operations Associate",
        why: "香港有传统金融和虚拟资产双重机会，适合金融背景加合规方向的候选人。",
        alternates: ["Animoca Brands", "Standard Chartered Hong Kong", "ZA Bank"],
        query: "Hong Kong AML analyst compliance operations entry level Chinese English"
      },
      {
        market: "新加坡",
        company: "Wise / Crypto.com / DBS",
        role: "Compliance Operations Analyst / Risk Analyst",
        why: "新加坡金融监管体系成熟，支付、银行、虚拟资产和跨境金融公司都需要 KYC/AML 与风险运营人才。",
        alternates: ["Grab Financial", "Coinbase Singapore", "Revolut Singapore"],
        query: "Singapore compliance operations analyst KYC AML entry level"
      }
    ],
    "法律 / 合规": [
      {
        market: "日本",
        company: "Mercari / PayPay / Rakuten",
        role: "Legal Operations Assistant / Compliance Analyst",
        why: "适合法律背景、日英中语言能力和跨境业务兴趣的候选人。优先搜索法务支持、合规分析、合同运营岗位。",
        alternates: ["LINE Yahoo", "Coincheck", "Recruit"],
        query: "Japan legal operations compliance analyst English Japanese Chinese"
      },
      {
        market: "香港",
        company: "HashKey Group / OKX / HSBC",
        role: "Legal & Compliance Assistant / AML Analyst",
        why: "香港的金融、虚拟资产和跨境业务公司更容易把法律背景转化成合规岗位机会。",
        alternates: ["Animoca Brands", "Standard Chartered Hong Kong", "ZA Bank"],
        query: "Hong Kong legal compliance assistant AML analyst entry level"
      },
      {
        market: "新加坡",
        company: "Crypto.com / Wise / DBS",
        role: "Compliance Analyst / Legal Operations Associate",
        why: "新加坡更适合把法律背景、英文能力和金融合规方向结合起来。",
        alternates: ["Coinbase Singapore", "Grab", "Revolut Singapore"],
        query: "Singapore legal operations compliance analyst entry level"
      }
    ],
    "Web3 / 金融合规": [
      {
        market: "日本",
        company: "Coincheck / bitFlyer / SBI VC Trade",
        role: "Crypto Compliance Assistant / AML Operations",
        why: "日本虚拟资产监管较成熟，适合搜索交易所合规、客户审查和风险运营岗位。",
        alternates: ["Mercari Fintech", "PayPay", "Rakuten Wallet"],
        query: "Japan crypto compliance AML operations entry level"
      },
      {
        market: "香港",
        company: "HashKey Group / OKX / Animoca Brands",
        role: "Virtual Asset Compliance Analyst / Risk Operations",
        why: "香港虚拟资产生态更集中，适合有 Web3、金融、法律或合规兴趣的人优先尝试。",
        alternates: ["OSL", "ZA Bank", "HKEX digital assets"],
        query: "Hong Kong virtual asset compliance analyst AML"
      },
      {
        market: "新加坡",
        company: "Crypto.com / Coinbase / Binance",
        role: "KYC Analyst / Compliance Operations Associate",
        why: "新加坡适合搜索交易所、支付和跨境金融平台的 KYC、AML、合规运营岗位。",
        alternates: ["Revolut Singapore", "Wise", "DBS"],
        query: "Singapore crypto compliance KYC analyst entry level"
      }
    ],
    "国际业务": [
      {
        market: "日本",
        company: "Rakuten / Mercari / Recruit",
        role: "Global Business Associate / Business Development Assistant",
        why: "日本公司需要能处理中英日沟通、海外市场和跨境客户合作的人。",
        alternates: ["LINE Yahoo", "PayPay", "Fast Retailing"],
        query: "Japan global business associate English Chinese entry level"
      },
      {
        market: "香港",
        company: "HSBC / Animoca Brands / Cathay",
        role: "Business Development Associate / Client Operations",
        why: "香港适合做跨境客户、金融科技、品牌合作和业务发展岗位。",
        alternates: ["OKX", "HashKey Group", "Hang Seng Bank"],
        query: "Hong Kong business development associate Mandarin English entry level"
      },
      {
        market: "新加坡",
        company: "Grab / Sea Group / Wise",
        role: "Business Operations Associate / Partnerships Assistant",
        why: "新加坡适合东南亚业务、平台运营、金融科技和国际合作方向。",
        alternates: ["Shopee", "TikTok Singapore", "Revolut Singapore"],
        query: "Singapore business operations associate partnerships entry level"
      }
    ],
    "数据 / 分析": [
      {
        market: "日本",
        company: "Rakuten / Mercari / PayPay",
        role: "Business Analyst Assistant / Data Operations Intern",
        why: "适合有 Excel、SQL、Python、金融分析或业务分析项目的人。",
        alternates: ["LINE Yahoo", "Recruit", "MUFG"],
        query: "Japan business analyst assistant SQL English entry level"
      },
      {
        market: "香港",
        company: "HSBC / HKEX / ZA Bank",
        role: "Risk Analyst Assistant / Data Analyst Intern",
        why: "香港金融机构和 fintech 公司都需要数据、风险、运营分析人才。",
        alternates: ["HashKey Group", "OKX", "Standard Chartered Hong Kong"],
        query: "Hong Kong risk analyst data analyst entry level"
      },
      {
        market: "新加坡",
        company: "Grab / Sea Group / DBS",
        role: "Business Analyst / Data Operations Analyst",
        why: "新加坡科技和金融平台更看重数据能力、业务理解和英文表达。",
        alternates: ["Wise", "Shopee", "Revolut Singapore"],
        query: "Singapore business analyst data operations entry level"
      }
    ],
    "市场 / 运营": [
      {
        market: "日本",
        company: "Mercari / Rakuten / Fast Retailing",
        role: "Marketing Operations Assistant / Community Associate",
        why: "适合内容、社群、用户运营和跨文化沟通能力较强的人。",
        alternates: ["LINE Yahoo", "Recruit", "PayPay"],
        query: "Japan marketing operations assistant English Chinese entry level"
      },
      {
        market: "香港",
        company: "Animoca Brands / Cathay / HSBC",
        role: "Marketing Associate / Growth Operations",
        why: "香港适合品牌、金融科技、Web3 和国际市场运营方向。",
        alternates: ["OKX", "HashKey Group", "Hang Seng Bank"],
        query: "Hong Kong marketing operations associate Mandarin English"
      },
      {
        market: "新加坡",
        company: "Shopee / Grab / TikTok Singapore",
        role: "Growth Operations Associate / Marketing Assistant",
        why: "新加坡适合东南亚市场、增长运营、社群和平台业务。",
        alternates: ["Sea Group", "Wise", "Crypto.com"],
        query: "Singapore growth operations marketing associate entry level"
      }
    ]
  };

  function normalize(text) {
    return String(text || "").toLowerCase();
  }

  function hasAny(text, keywords) {
    return keywords.some((keyword) => text.includes(String(keyword).toLowerCase()));
  }





  function inferCareer(text, selected) {
    if (selected && selected !== "auto") return selected;
    if (hasAny(text, ["web3", "加密", "虚拟资产", "crypto", "交易所", "区块链", "defi"])) return "Web3 / 金融合规";
    if (hasAny(text, ["金融", "finance", "银行", "证券", "投行", "审计", "风控", "风险", "合规", "kyc", "aml"])) return "金融 / 合规";
    if (hasAny(text, ["法律", "法学", "合同", "监管", "llb", "llm", "法务"])) return "法律 / 合规";
    if (hasAny(text, ["数据", "分析", "sql", "python", "tableau", "power bi", "建模"])) return "数据 / 分析";
    if (hasAny(text, ["商务", "business", "bd", "国际", "跨境", "销售", "客户"])) return "国际业务";
    if (hasAny(text, ["市场", "运营", "内容", "社交媒体", "品牌", "增长"])) return "市场 / 运营";
    return "国际业务";
  }



  function priorityLabel(score) {
    if (score >= 74) return "优先申请";
    if (score >= 64) return "重点尝试";
    if (score >= 55) return "探索方向";
    return "暂缓申请";
  }



  function getRoutes(career) {
    return COMPANY_ROUTES[career] || COMPANY_ROUTES["国际业务"];
  }



  // Renders a real /api/analyze report into the existing result section.
  // Company routes stay local static data (concrete companies to search);
  // the scores, risks and advice below all come from the AI response.
  function renderApiResult(report, meta, career) {
    const jobs = Array.isArray(report.jobs) ? report.jobs : [];
    const best = jobs.reduce((acc, job) => {
      const s = Number(job.fit_score) || 0;
      return !acc || s > (Number(acc.fit_score) || 0) ? job : acc;
    }, null);
    const bestScore = best ? (Number(best.fit_score) || 0) : 0;
    const market = marketSelect.value === "auto" ? "" : marketSelect.value;
    const routes = getRoutes(career);

    bestScoreEl.textContent = String(bestScore);
    summaryText.textContent = report.overall_route || report.candidate_snapshot || "";

    roleGrid.innerHTML = jobs.map((job, index) => `
      <article class="jo22-role-card">
        <div class="jo22-rank">第 ${index + 1} 位 · ${escapeHtml(job.priority || priorityLabel(Number(job.fit_score) || 0))}</div>
        <h4>${escapeHtml(job.role || "")}</h4>
        <div class="jo22-role-meta">
          <span class="jo22-pill">匹配 ${Number(job.fit_score) || 0} 分</span>
          ${market ? `<span class="jo22-pill">${escapeHtml(market)}</span>` : ""}
        </div>
        <p><strong>主要风险：</strong>${escapeHtml(job.main_risk || "")}</p>
        <p>${escapeHtml(job.reason || "")}</p>
        <p style="margin-top:10px;"><strong>下一步：</strong>${escapeHtml(job.suggested_action || "")}</p>
        <div class="jo22-score">${Number(job.fit_score) || 0} 分</div>
      </article>
    `).join("");

    routeGrid.innerHTML = routes.map((route, index) => {
      const searchUrl = `https://www.google.com/search?q=${encodeURIComponent(route.query)}`;
      return `
        <article class="jo22-route-card">
          <div class="jo22-country">第 ${index + 1} 市场 · ${escapeHtml(route.market)}</div>
          <h4>${escapeHtml(route.role)}</h4>
          <p class="jo22-company">${escapeHtml(route.company)}</p>
          <p>${escapeHtml(route.why)}</p>
          <ul>
            <li>备选公司：${escapeHtml(route.alternates.join(" / "))}</li>
            <li>搜索关键词：${escapeHtml(route.query)}</li>
          </ul>
          <a class="jo22-search-link" href="${searchUrl}" target="_blank" rel="noopener noreferrer">搜索公开岗位</a>
        </article>
      `;
    }).join("");

    const consumedLabel =
      meta && meta.consumed_from === "free" ? "免费报告" :
      meta && meta.consumed_from === "premium" ? "Premium 报告" :
      meta && meta.consumed_from === "paid" ? "付费点数" : "";

    judgementList.innerHTML = [
      { title: "候选人概况", text: report.candidate_snapshot || "" },
      { title: "总体建议", text: report.final_advice || "" },
      { title: "说明", text: report.disclaimer || "" }
    ].filter(item => item.text).map((item) => `
      <div class="jo22-info-item">
        <strong>${escapeHtml(item.title)}</strong>
        <span>${escapeHtml(item.text)}</span>
      </div>
    `).join("");

    const steps = jobs
      .map((job) => ({ title: job.role || "", text: job.suggested_action || "" }))
      .filter(step => step.text);
    if (report.cover_letter_opening) {
      steps.push({ title: "Cover Letter 开头", text: report.cover_letter_opening });
    }
    roadmapList.innerHTML = steps.map((step) => `
      <div class="jo22-info-item">
        <strong>${escapeHtml(step.title)}</strong>
        <span>${escapeHtml(step.text)}</span>
      </div>
    `).join("");

    const tags = [];
    if (market) tags.push(`目标市场：${market}`);
    if (career) tags.push(`方向：${career}`);
    tags.push(`最高匹配：${bestScore} 分`);
    if (consumedLabel) tags.push(`本次使用：${consumedLabel}`);

    tagGrid.innerHTML = tags.map((tag) => `<span class="jo22-tag">${escapeHtml(tag)}</span>`).join("");

    resultSection.classList.add("jo22-show");
    resultSection.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  function escapeHtml(value) {
    return String(value ?? "")
      .replaceAll("&", "&amp;")
      .replaceAll("<", "&lt;")
      .replaceAll(">", "&gt;")
      .replaceAll('"', "&quot;")
      .replaceAll("'", "&#039;");
  }

  function getVisitorId() {
    const key = "japanoffer_visitor_id";
    let id = localStorage.getItem(key);
    if (!id) {
      id = `v_${Date.now()}_${Math.random().toString(16).slice(2)}`;
      localStorage.setItem(key, id);
    }
    return id;
  }

  function getSupabaseConfig() {
    const url = String(window.JAPANOFFER_SUPABASE_URL || "").replace(/\/+$/, "");
    const key = String(
      window.JAPANOFFER_SUPABASE_ANON_KEY ||
      window.JAPANOFFER_SUPABASE_PUBLISHABLE_KEY ||
      window.SUPABASE_ANON_KEY ||
      ""
    ).trim();

    if (!url || !key) return null;
    return { url, key };
  }

  async function supabaseInsert(table, payload) {
    const config = getSupabaseConfig();
    if (!config) return;

    try {
      await fetch(`${config.url}/rest/v1/${table}`, {
        method: "POST",
        headers: {
          "apikey": config.key,
          "Authorization": `Bearer ${config.key}`,
          "Content-Type": "application/json",
          "Prefer": "return=minimal"
        },
        body: JSON.stringify(payload)
      });
    } catch (error) {
      console.warn(`Failed to save ${table}`, error);
    }
  }

  async function saveMatchResult(stored) {
    // The real report is stored server-side by /api/analyze (reports
    // table). Only the anonymous analytics event is still written here.
    await supabaseInsert("page_events", {
      event_name: "ai_match_generated",
      page_path: "/match.html",
      anonymous_id: getVisitorId()
    });
  }



  function resultToText(stored) {
    const report = stored.report || {};
    const jobs = Array.isArray(report.jobs) ? report.jobs : [];
    const best = jobs.reduce((acc, job) => {
      const s = Number(job.fit_score) || 0;
      return !acc || s > (Number(acc.fit_score) || 0) ? job : acc;
    }, null);
    const lines = [
      "JapanOffer AI 岗位匹配结果",
      "",
      `最高匹配分：${best ? (Number(best.fit_score) || 0) : 0} 分`,
      `目标市场：${stored.market || ""}`,
      `职业方向：${stored.career || ""}`,
      "",
      "岗位评估：",
      ...jobs.map((job, index) =>
        `${index + 1}. ${job.role || ""} - ${Number(job.fit_score) || 0} 分 - ${job.priority || ""}\n   主要风险：${job.main_risk || ""}\n   匹配原因：${job.reason || ""}\n   下一步：${job.suggested_action || ""}`),
      "",
      "总体建议：",
      report.final_advice || "",
    ];
    if (report.cover_letter_opening) {
      lines.push("", "Cover Letter 开头：", report.cover_letter_opening);
    }
    if (report.disclaimer) {
      lines.push("", "说明：" + report.disclaimer);
    }
    return lines.join("\n");
  }

  let latestResult = null;

  form.addEventListener("submit", async (event) => {
    event.preventDefault();

    const background = textarea.value.trim();
    if (background.length < 20) {
      showStatus("先输入一段更完整的中文背景，至少写 20 个字左右。");
      return;
    }
    const jobDesc = jobDescInput.value.trim();
    if (jobDesc.length < 50) {
      showStatus("请粘贴目标岗位的完整描述（至少 50 个字），AI 需要一个真实岗位来对比。");
      return;
    }

    generateButton.disabled = true;
    generateButton.textContent = "正在生成 AI 匹配结果...";
    showStatus("正在生成 AI 匹配结果，请稍等…");

    try {
      const payload = {
        background: background.slice(0, 2400),
        languages: "",
        targetCountry: marketSelect.value === "auto" ? "" : marketSelect.value,
        targetIndustry: careerSelect.value === "auto" ? "" : careerSelect.value,
        concerns: "",
        jobs: [{ title: jobTitleInput.value.trim() || "目标岗位", description: jobDesc }]
      };
      const result = await window.JOAnalyze.analyzeReport(payload);
      if (result.status === 200 && result.data && result.data.success && result.data.report) {
        const career = careerSelect.value === "auto" ? inferCareer(background) : careerSelect.value;
        const market = marketSelect.value === "auto" ? "" : marketSelect.value;
        latestResult = { report: result.data.report, meta: result.data, career, market };
        renderApiResult(result.data.report, result.data, career);
        saveMatchResult(latestResult);
        window.JOAnalyze.refreshCredits();
        showStatus("AI 匹配结果已生成。");
        return;
      }
      if (result.status === 401) {
        window.location.href = "login.html?redirect=match.html";
        return;
      }
      if (window.JOAnalyze.errorKind(result) === "no_credits") {
        statusMessage.innerHTML = '报告次数已用完。<a href="pricing.html">获取更多报告 →</a>';
        statusMessage.classList.add("jo22-show");
        return;
      }
      if (window.JOAnalyze.errorKind(result) === "rate_limited") {
        showStatus("生成太频繁，请稍后再试。");
        return;
      }
      showStatus("生成失败，请稍后再试。");
    } catch (e) {
      showStatus("无法连接服务器，请检查网络后重试。");
    } finally {
      generateButton.disabled = false;
      generateButton.textContent = "生成我的岗位匹配";
    }
  });

  copyButton.addEventListener("click", async () => {
    if (!latestResult) return;
    const text = resultToText(latestResult);

    try {
      await navigator.clipboard.writeText(text);
      statusMessage.textContent = "结果已复制。";
    } catch {
      statusMessage.textContent = "复制失败，你可以手动选中页面结果复制。";
    }

    statusMessage.classList.add("jo22-show");
    setTimeout(() => statusMessage.classList.remove("jo22-show"), 2200);
  });

  loadProfileAndAutoMatch();
})();
