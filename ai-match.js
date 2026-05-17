// JapanOffer AI - Chinese AI Match Entry MVP
// Step 21: more realistic scores and clearer recommendation layout.

(function () {
  const form = document.getElementById("matchForm");
  const textarea = document.getElementById("backgroundInput");
  const marketSelect = document.getElementById("targetMarket");
  const careerSelect = document.getElementById("careerDirection");
  const generateButton = document.getElementById("generateButton");

  const resultSection = document.getElementById("resultSection");
  const bestScoreEl = document.getElementById("bestScore");
  const summaryText = document.getElementById("summaryText");
  const recommendationGrid = document.getElementById("recommendationGrid");
  const tagGrid = document.getElementById("tagGrid");
  const judgementList = document.getElementById("judgementList");
  const roadmapList = document.getElementById("roadmapList");
  const copyButton = document.getElementById("copyResult");
  const statusMessage = document.getElementById("statusMessage");

  const ROLE_LIBRARY = [
    {
      title: "法律合规分析师",
      titleEn: "Legal Compliance Analyst",
      base: 47,
      markets: ["日本", "新加坡", "香港"],
      careers: ["法律 / 合规", "Web3 / 金融合规"],
      keywords: ["法律", "法学", "llb", "llm", "合规", "compliance", "监管", "kyc", "aml", "web3", "加密", "金融", "风控", "合同"],
      reason: "适合有法律背景、语言能力和跨境兴趣的候选人，可以优先看 entry-level 合规、KYC/AML、legal operations 和国际业务支持岗位。",
      caution: "如果没有正式实习，需要用项目经历、案例分析或课程研究证明你理解岗位要求。"
    },
    {
      title: "Web3 / 金融合规助理",
      titleEn: "Web3 Compliance Associate",
      base: 44,
      markets: ["新加坡", "香港", "日本"],
      careers: ["Web3 / 金融合规", "法律 / 合规"],
      keywords: ["web3", "crypto", "加密", "虚拟资产", "交易所", "defi", "区块链", "kyc", "aml", "合规", "金融"],
      reason: "如果你同时具备法律理解、语言能力和加密行业兴趣，这类岗位更能放大差异化优势。",
      caution: "这个方向需要你能讲清楚监管、KYC/AML、交易所业务和风险控制，不然容易显得只是兴趣。"
    },
    {
      title: "跨境商务发展助理",
      titleEn: "Cross-border Business Associate",
      base: 42,
      markets: ["日本", "新加坡", "香港"],
      careers: ["国际业务", "市场 / 运营"],
      keywords: ["商务", "business", "bd", "销售", "客户", "项目", "运营", "市场", "国际", "跨境", "沟通", "合作"],
      reason: "适合语言能力强、愿意做国际沟通、客户拓展和企业合作的人。",
      caution: "如果没有销售或商业项目经历，需要先把沟通、项目和市场理解写得更具体。"
    },
    {
      title: "国际人才匹配 / 招聘助理",
      titleEn: "International Talent Matching Associate",
      base: 39,
      markets: ["日本", "新加坡", "香港"],
      careers: ["国际业务", "市场 / 运营"],
      keywords: ["人力", "招聘", "hr", "人才", "求职", "学生", "社群", "沟通", "咨询", "教育", "留学"],
      reason: "适合理解留学生求职痛点、语言能力强、愿意做候选人沟通和企业匹配的人。",
      caution: "这个方向相对容易进入，但长期上限取决于你能不能做企业端资源和商业化。"
    },
    {
      title: "技术 / 数据分析实习生",
      titleEn: "Data / Technical Analyst Intern",
      base: 38,
      markets: ["日本", "新加坡", "香港", "英国"],
      careers: ["技术 / 数据"],
      keywords: ["计算机", "python", "sql", "数据", "编程", "前端", "后端", "ai", "机器学习", "产品", "软件", "工程"],
      reason: "适合有技术技能、项目作品或数据分析经验的人。",
      caution: "如果没有作品集或代码项目，直接申请技术岗的匹配度会明显下降。"
    },
    {
      title: "市场运营助理",
      titleEn: "Marketing / Operations Associate",
      base: 37,
      markets: ["日本", "新加坡", "香港", "英国"],
      careers: ["市场 / 运营", "国际业务"],
      keywords: ["市场", "运营", "内容", "社交媒体", "品牌", "增长", "活动", "文案", "用户", "社区"],
      reason: "适合有内容、社群、活动、用户增长或多语言表达能力的人。",
      caution: "这个方向入口较多，但竞争也大，需要用作品或增长数据证明能力。"
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
    if (hasAny(text, ["博士", "phd"])) return "博士";
    if (hasAny(text, ["硕士", "研究生", "master", "llm", "msc"])) return "硕士";
    if (hasAny(text, ["llb", "法律本科", "法学本科", "本科", "undergraduate", "bachelor"])) return "本科";
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

  function inferRisks(text, market, languages) {
    const risks = [];

    if (market === "日本" && !languages.includes("日语")) {
      risks.push("日本岗位通常需要日语能力。没有日语时，应优先找英文岗位、外企岗位或跨境业务岗位。");
    }

    if ((market === "新加坡" || market === "香港") && !languages.includes("英文")) {
      risks.push("新加坡和香港岗位通常更看重英文工作能力，需要补强英文 CV 和面试表达。");
    }

    if (hasAny(text, ["没有经验", "无经验", "没有正式工作经验", "没实习"])) {
      risks.push("正式工作经验不足会拉低匹配分，需要用项目、课程案例、作品集或志愿经历补足。");
    }

    if (!hasAny(text, ["签证", "工签", "visa", "永居", "pr"])) {
      risks.push("你没有说明签证情况。跨境求职里签证路径会明显影响申请优先级。");
    }

    if (!risks.length) {
      risks.push("整体风险不高，但仍需要把语言、签证、岗位要求和简历故事线写得更具体。");
    }

    return risks;
  }

  function scoreRole(role, text, market, career, languages, education) {
    let score = role.base;

    const keywordMatches = countMatches(text, role.keywords);
    score += Math.min(keywordMatches * 3.2, 18);

    if (role.markets.includes(market)) score += 5;
    if (role.careers.includes(career)) score += 7;

    if (languages.includes("英文")) score += 4;
    if (languages.includes("日语") && market === "日本") score += 5;
    if (languages.includes("中文")) score += 2;

    if (education === "硕士") score += 4;
    if (education === "本科") score += 3;
    if (education === "博士") score += 5;

    if (hasAny(text, ["项目", "project", "创业", "社团", "实习", "intern", "志愿", "unhcr", "iom", "unicef"])) score += 4;
    if (hasAny(text, ["没有经验", "无经验", "没有正式工作经验", "没实习"])) score -= 8;
    if (!hasAny(text, ["实习", "intern", "工作", "项目", "project", "作品", "portfolio"])) score -= 4;

    return Math.max(36, Math.min(86, Math.round(score)));
  }

  function priorityLabel(score) {
    if (score >= 76) return "优先申请";
    if (score >= 66) return "可以重点尝试";
    if (score >= 56) return "探索方向";
    return "暂缓申请";
  }

  function buildJudgements(profile, roles, risks) {
    return [
      {
        title: "主方向判断",
        text: `系统把你的主方向判断为「${profile.career}」。目前最值得优先看的岗位是「${roles[0].title}」。`
      },
      {
        title: "市场判断",
        text: `你的目标市场被识别为「${profile.market}」。如果这是你的首选地区，后续简历和关键词要围绕当地岗位要求来写。`
      },
      {
        title: "语言判断",
        text: `你的语言标签是「${profile.languages.join("、")}」。跨境岗位会把语言能力作为第一轮筛选条件之一。`
      },
      {
        title: "风险判断",
        text: risks[0] || "暂时没有明显硬伤，但仍需要把经历写得更具体。"
      }
    ];
  }

  function buildRoadmap(profile, roles, risks) {
    return [
      {
        title: "第一步：先投第一推荐岗位",
        text: `先围绕「${roles[0].title}」准备 CV 和 LinkedIn，不要一开始就海投太多方向。`
      },
      {
        title: "第二步：用第二推荐岗位做备选",
        text: `「${roles[1]?.title || "第二推荐岗位"}」可以作为备选路线，用来扩大机会池。`
      },
      {
        title: "第三步：补足最低分短板",
        text: risks[0] || "补足语言、签证、经验或作品集，让岗位匹配更有说服力。"
      },
      {
        title: "第四步：记录真实反馈",
        text: "每投 10 个岗位记录一次回复率，再根据数据调整国家、岗位关键词和简历版本。"
      }
    ];
  }

  function generateMatch(background, marketSelection, careerSelection) {
    const text = normalize(background);
    const education = inferEducation(text);
    const languages = inferLanguages(text);
    const market = inferMarket(text, marketSelection);
    const career = inferCareer(text, careerSelection);
    const risks = inferRisks(text, market, languages);

    let roles = ROLE_LIBRARY
      .map((role) => ({
        ...role,
        score: scoreRole(role, text, market, career, languages, education)
      }))
      .sort((a, b) => b.score - a.score);

    roles = roles.map((role, index) => ({
      ...role,
      score: Math.max(36, role.score - index * 4)
    })).slice(0, 3);

    return {
      background,
      education,
      languages,
      market,
      career,
      risks,
      roles,
      bestScore: roles[0]?.score || 0,
      judgements: buildJudgements({ education, languages, market, career }, roles, risks),
      roadmap: buildRoadmap({ education, languages, market, career }, roles, risks)
    };
  }

  function renderResult(result) {
    bestScoreEl.textContent = String(result.bestScore);
    summaryText.textContent = `系统已按匹配度排序。第一推荐是「${result.roles[0].title}」，第二推荐是「${result.roles[1].title}」，第三推荐是「${result.roles[2].title}」。`;

    recommendationGrid.innerHTML = result.roles.map((role, index) => `
      <article class="recommend-card">
        <div class="recommend-rank">第 ${index + 1} 推荐 · ${priorityLabel(role.score)}</div>
        <h3>${escapeHtml(role.title)}</h3>
        <div class="recommend-meta">
          <span class="meta-pill">${escapeHtml(role.titleEn)}</span>
          <span class="meta-pill">${escapeHtml(result.market)}</span>
          <span class="meta-pill">${escapeHtml(priorityLabel(role.score))}</span>
        </div>
        <p>${escapeHtml(role.reason)}</p>
        <p style="margin-top:10px;"><strong>注意：</strong>${escapeHtml(role.caution)}</p>
        <div class="recommend-score">${role.score} 分</div>
      </article>
    `).join("");

    judgementList.innerHTML = result.judgements.map((item) => `
      <div class="judgement-item">
        <strong>${escapeHtml(item.title)}</strong>
        <span>${escapeHtml(item.text)}</span>
      </div>
    `).join("");

    roadmapList.innerHTML = result.roadmap.map((step) => `
      <div class="roadmap-step">
        <strong>${escapeHtml(step.title)}</strong>
        <span>${escapeHtml(step.text)}</span>
      </div>
    `).join("");

    const tags = [
      `目标市场：${result.market}`,
      `方向：${result.career}`,
      `学历：${result.education}`,
      `语言：${result.languages.join("、")}`,
      `最高匹配：${result.bestScore} 分`
    ];

    tagGrid.innerHTML = tags.map((tag) => `<span class="tag">${escapeHtml(tag)}</span>`).join("");

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
    const anonymousId = getVisitorId();

    await supabaseInsert("page_events", {
      event_name: "ai_match_generated",
      page_path: "/match.html",
      anonymous_id: anonymousId
    });

    await supabaseInsert("report_submissions", {
      anonymous_id: anonymousId,
      lang: "zh",
      education: result.education,
      languages: result.languages.join(" / "),
      market: result.market,
      career: result.career,
      match_score: result.bestScore,
      visa_risk: result.risks[0] || null,
      language_risk: result.risks.find((risk) => risk.includes("语言") || risk.includes("日语") || risk.includes("英文")) || null,
      recommended_roles: result.roles.map((role, index) => ({
        rank: index + 1,
        title: role.title,
        title_en: role.titleEn,
        score: role.score,
        priority: priorityLabel(role.score)
      })),
      raw_input: result.background
    });
  }

  function resultToText(result) {
    return [
      "JapanOffer AI 中文岗位匹配结果",
      "",
      `最高匹配分：${result.bestScore} 分`,
      `目标市场：${result.market}`,
      `职业方向：${result.career}`,
      `学历判断：${result.education}`,
      `语言标签：${result.languages.join("、")}`,
      "",
      "岗位推荐排序：",
      ...result.roles.map((role, index) => `${index + 1}. ${role.title} / ${role.titleEn} - ${role.score} 分 - ${priorityLabel(role.score)}`),
      "",
      "系统判断：",
      ...result.judgements.map((item) => `- ${item.title}：${item.text}`),
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
