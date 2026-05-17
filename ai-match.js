// JapanOffer AI - Chinese AI Match Entry MVP
// This is a stable front-end MVP: Chinese background input -> structured role matching.
// It also tries to save the result to Supabase if auth-config.js is available.

(function () {
  const form = document.getElementById("matchForm");
  const textarea = document.getElementById("backgroundInput");
  const marketSelect = document.getElementById("targetMarket");
  const careerSelect = document.getElementById("careerDirection");
  const generateButton = document.getElementById("generateButton");

  const resultSection = document.getElementById("resultSection");
  const bestScoreEl = document.getElementById("bestScore");
  const roleList = document.getElementById("roleList");
  const tagGrid = document.getElementById("tagGrid");
  const analysisList = document.getElementById("analysisList");
  const roadmapList = document.getElementById("roadmapList");
  const copyButton = document.getElementById("copyResult");
  const statusMessage = document.getElementById("statusMessage");

  const ROLE_LIBRARY = [
    {
      title: "法律合规分析师",
      titleEn: "Legal Compliance Analyst",
      base: 68,
      markets: ["日本", "新加坡", "香港"],
      careers: ["法律 / 合规", "Web3 / 金融合规"],
      keywords: ["法律", "法学", "llb", "llm", "合规", "compliance", "监管", "kyc", "aml", "web3", "加密", "金融", "风控", "合同"],
      reason: "适合有法律背景、语言能力和跨境兴趣的候选人，尤其适合 entry-level 合规、KYC/AML、legal operations 和国际业务支持岗位。"
    },
    {
      title: "Web3 / 金融合规助理",
      titleEn: "Web3 Compliance Associate",
      base: 64,
      markets: ["新加坡", "香港", "日本"],
      careers: ["Web3 / 金融合规", "法律 / 合规"],
      keywords: ["web3", "crypto", "加密", "虚拟资产", "交易所", "defi", "区块链", "kyc", "aml", "合规", "金融"],
      reason: "如果你同时具备法律理解、语言能力和加密行业兴趣，这类岗位更能放大你的差异化优势。"
    },
    {
      title: "跨境商务发展助理",
      titleEn: "Cross-border Business Associate",
      base: 62,
      markets: ["日本", "新加坡", "香港"],
      careers: ["国际业务", "市场 / 运营"],
      keywords: ["商务", "business", "bd", "销售", "客户", "项目", "运营", "市场", "国际", "跨境", "沟通", "合作"],
      reason: "适合语言能力强、愿意做国际沟通和客户拓展的人，尤其适合没有很深技术经验但有跨文化背景的候选人。"
    },
    {
      title: "国际人才匹配 / 招聘助理",
      titleEn: "International Talent Matching Associate",
      base: 58,
      markets: ["日本", "新加坡", "香港"],
      careers: ["国际业务", "市场 / 运营"],
      keywords: ["人力", "招聘", "hr", "人才", "求职", "学生", "社群", "沟通", "咨询", "教育", "留学"],
      reason: "适合理解留学生求职痛点、语言能力强、愿意做候选人沟通和企业匹配的人。"
    },
    {
      title: "技术 / 数据分析实习生",
      titleEn: "Data / Technical Analyst Intern",
      base: 54,
      markets: ["日本", "新加坡", "香港", "英国"],
      careers: ["技术 / 数据"],
      keywords: ["计算机", "python", "sql", "数据", "编程", "前端", "后端", "ai", "机器学习", "产品", "软件", "工程"],
      reason: "适合有技术技能、项目作品或数据分析经验的人。若目标是技术岗，需要用作品集和实习经历证明能力。"
    },
    {
      title: "市场运营助理",
      titleEn: "Marketing / Operations Associate",
      base: 52,
      markets: ["日本", "新加坡", "香港", "英国"],
      careers: ["市场 / 运营", "国际业务"],
      keywords: ["市场", "运营", "内容", "社交媒体", "品牌", "增长", "活动", "文案", "用户", "社区"],
      reason: "适合有内容、社群、活动、用户增长或多语言表达能力的人，门槛相对友好，但竞争也更大。"
    }
  ];

  function normalize(text) {
    return String(text || "").toLowerCase();
  }

  function hasAny(text, keywords) {
    return keywords.some((keyword) => text.includes(String(keyword).toLowerCase()));
  }

  function countMatches(text, keywords) {
    return keywords.reduce((count, keyword) => {
      return count + (text.includes(String(keyword).toLowerCase()) ? 1 : 0);
    }, 0);
  }

  function inferEducation(text) {
    if (hasAny(text, ["llb", "法律本科", "法学本科", "本科", "undergraduate", "bachelor"])) return "本科";
    if (hasAny(text, ["硕士", "研究生", "master", "llm", "msc"])) return "硕士";
    if (hasAny(text, ["高中", "预科"])) return "高中 / 预科";
    return "未明确";
  }

  function inferLanguages(text) {
    const langs = [];
    if (hasAny(text, ["中文", "普通话", "mandarin", "chinese"])) langs.push("中文");
    if (hasAny(text, ["英文", "英语", "ielts", "雅思", "english"])) langs.push("英文");
    if (hasAny(text, ["日语", "日本语", "jlpt", "n1", "n2", "japanese"])) langs.push("日语");
    if (hasAny(text, ["韩语", "korean"])) langs.push("韩语");
    return langs.length ? langs : ["未明确"];
  }

  function inferMarket(text, selected) {
    if (selected && selected !== "auto") return selected;
    if (hasAny(text, ["日本", "东京", "大阪", "japan", "tokyo"])) return "日本";
    if (hasAny(text, ["新加坡", "singapore"])) return "新加坡";
    if (hasAny(text, ["香港", "hong kong", "hk"])) return "香港";
    if (hasAny(text, ["英国", "伦敦", "uk", "london"])) return "英国";
    return "日本";
  }

  function inferCareer(text, selected) {
    if (selected && selected !== "auto") return selected;
    if (hasAny(text, ["web3", "加密", "虚拟资产", "crypto", "交易所", "kyc", "aml"])) return "Web3 / 金融合规";
    if (hasAny(text, ["法律", "法学", "合规", "合同", "监管", "llb", "llm"])) return "法律 / 合规";
    if (hasAny(text, ["计算机", "python", "sql", "数据", "编程", "ai", "技术"])) return "技术 / 数据";
    if (hasAny(text, ["市场", "运营", "内容", "社交媒体", "品牌"])) return "市场 / 运营";
    if (hasAny(text, ["商务", "business", "bd", "国际", "跨境", "销售"])) return "国际业务";
    return "国际业务";
  }

  function inferRisk(text, market, languages) {
    const risks = [];
    const langText = languages.join("、");

    if (market === "日本" && !languages.includes("日语")) {
      risks.push("日本岗位通常需要日语能力。如果没有日语，需要优先寻找英文岗位、外企岗位或跨境业务岗位。");
    }

    if ((market === "新加坡" || market === "香港") && !languages.includes("英文")) {
      risks.push("新加坡和香港岗位通常更看重英文工作能力，建议补强英文 CV、面试表达和商业写作。");
    }

    if (hasAny(text, ["没有经验", "无经验", "没有正式工作经验", "没实习"])) {
      risks.push("正式工作经验不足会影响第一轮筛选，需要用项目、作品集、案例分析或志愿经历补足可信度。");
    }

    if (!hasAny(text, ["签证", "工签", "visa", "永居", "pr"])) {
      risks.push("你没有说明签证情况。跨境求职里签证路径会明显影响申请优先级，建议提前明确可行路径。");
    }

    if (!risks.length) {
      risks.push("整体风险不高，但仍需要把语言、签证、岗位要求和简历故事线做得更具体。");
    }

    return risks;
  }

  function scoreRole(role, text, market, career, languages, education) {
    let score = role.base;

    const keywordMatches = countMatches(text, role.keywords);
    score += Math.min(keywordMatches * 5, 20);

    if (role.markets.includes(market)) score += 8;
    if (role.careers.includes(career)) score += 10;

    if (languages.includes("英文")) score += 5;
    if (languages.includes("日语") && market === "日本") score += 8;
    if (languages.includes("中文")) score += 3;

    if (education === "本科" || education === "硕士") score += 4;

    if (hasAny(text, ["项目", "project", "创业", "社团", "实习", "intern", "志愿", "unhcr", "iom", "unicef"])) score += 5;
    if (hasAny(text, ["没有经验", "无经验", "没有正式工作经验", "没实习"])) score -= 6;

    return Math.max(35, Math.min(96, Math.round(score)));
  }

  function buildAnalysis(profile, topRoles, risks) {
    const strongest = topRoles[0];

    return [
      `系统判断你当前最适合的方向是「${strongest.title}」，因为你的背景与「${profile.career}」方向更接近。`,
      `你的目标市场被识别为「${profile.market}」。如果这是你的首选国家，后续申请应该优先围绕该市场准备简历和岗位关键词。`,
      `你的语言标签是「${profile.languages.join("、")}」。跨境岗位通常会把语言能力当成第一轮筛选条件之一。`,
      `当前最大风险点：${risks[0]}`,
      `建议你不要海投，而是先围绕高匹配岗位建立 2 到 3 条清晰申请路线。`
    ];
  }

  function buildRoadmap(profile, topRoles, risks) {
    const mainRole = topRoles[0].title;
    return [
      {
        title: "第一步：确定主申请方向",
        text: `先把「${mainRole}」作为主方向，不要同时投太多不相关岗位。这样 CV、LinkedIn 和面试故事会更集中。`
      },
      {
        title: "第二步：重写简历关键词",
        text: `把你的教育、语言、项目经历改写成与「${profile.career}」相关的关键词，例如岗位要求、国家市场、语言能力和可迁移技能。`
      },
      {
        title: "第三步：补足风险点",
        text: risks[0] || "补足签证、语言、作品集或实习证明，让企业更容易判断你能不能落地。"
      },
      {
        title: "第四步：优先申请高匹配岗位",
        text: `先投匹配度 75% 以上的岗位，再投探索型岗位。这样更容易获得面试反馈，也方便你调整路线。`
      }
    ];
  }

  function generateMatch(background, marketSelection, careerSelection) {
    const text = normalize(background);
    const education = inferEducation(text);
    const languages = inferLanguages(text);
    const market = inferMarket(text, marketSelection);
    const career = inferCareer(text, careerSelection);
    const risks = inferRisk(text, market, languages);

    const roles = ROLE_LIBRARY
      .map((role) => ({
        ...role,
        score: scoreRole(role, text, market, career, languages, education)
      }))
      .sort((a, b) => b.score - a.score)
      .slice(0, 3);

    return {
      background,
      education,
      languages,
      market,
      career,
      risks,
      roles,
      bestScore: roles[0]?.score || 0,
      analysis: buildAnalysis({ education, languages, market, career }, roles, risks),
      roadmap: buildRoadmap({ education, languages, market, career }, roles, risks)
    };
  }

  function renderResult(result) {
    bestScoreEl.textContent = `${result.bestScore}%`;

    roleList.innerHTML = result.roles.map((role) => `
      <article class="role-card">
        <div>
          <h4>${escapeHtml(role.title)}</h4>
          <p>${escapeHtml(role.titleEn)} · ${escapeHtml(role.reason)}</p>
        </div>
        <div class="role-score">${role.score}%</div>
      </article>
    `).join("");

    const tags = [
      `目标市场：${result.market}`,
      `方向：${result.career}`,
      `学历：${result.education}`,
      `语言：${result.languages.join("、")}`,
      `风险：${result.risks.length ? "需要规划" : "较低"}`
    ];

    tagGrid.innerHTML = tags.map((tag) => `<span class="tag">${escapeHtml(tag)}</span>`).join("");

    analysisList.innerHTML = result.analysis.map((item) => `<li>${escapeHtml(item)}</li>`).join("");

    roadmapList.innerHTML = result.roadmap.map((step) => `
      <div class="roadmap-step">
        <strong>${escapeHtml(step.title)}</strong>
        <span>${escapeHtml(step.text)}</span>
      </div>
    `).join("");

    resultSection.classList.add("show");
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

  async function saveMatchResult(result) {
    const visitorId = getVisitorId();

    await supabaseInsert("page_events", {
      event_name: "ai_match_generated",
      page_path: "/match.html",
      anonymous_id: visitorId
    });

    await supabaseInsert("report_submissions", {
      anonymous_id: visitorId,
      lang: "zh",
      education: result.education,
      languages: result.languages.join(" / "),
      market: result.market,
      career: result.career,
      match_score: result.bestScore,
      visa_risk: result.risks[0] || null,
      language_risk: result.risks.find((risk) => risk.includes("语言") || risk.includes("日语") || risk.includes("英文")) || null,
      recommended_roles: result.roles.map((role) => ({
        title: role.title,
        title_en: role.titleEn,
        score: role.score
      })),
      raw_input: result.background
    });
  }

  function resultToText(result) {
    return [
      "JapanOffer AI 中文岗位匹配结果",
      "",
      `最佳匹配分数：${result.bestScore}%`,
      `目标市场：${result.market}`,
      `职业方向：${result.career}`,
      `学历判断：${result.education}`,
      `语言标签：${result.languages.join("、")}`,
      "",
      "最适合岗位：",
      ...result.roles.map((role, index) => `${index + 1}. ${role.title} / ${role.titleEn} - ${role.score}%`),
      "",
      "系统判断：",
      ...result.analysis.map((item) => `- ${item}`),
      "",
      "下一步建议：",
      ...result.roadmap.map((step) => `- ${step.title}：${step.text}`)
    ].join("\n");
  }

  let latestResult = null;

  form.addEventListener("submit", async (event) => {
    event.preventDefault();

    const background = textarea.value.trim();
    if (background.length < 20) {
      alert("先输入一段更完整的中文背景，至少写 20 个字左右。");
      return;
    }

    generateButton.disabled = true;
    generateButton.textContent = "正在生成匹配结果...";

    try {
      const result = generateMatch(background, marketSelect.value, careerSelect.value);
      latestResult = result;
      renderResult(result);
      saveMatchResult(result);
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

    statusMessage.classList.add("show");
    setTimeout(() => statusMessage.classList.remove("show"), 2200);
  });
})();
