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

    if (cvText) {
      showProfileNotice("已读取你的个人主页和 DOCX 简历内容，正在自动生成匹配结果。", "success");
    } else if (profile.cv_file_name) {
      showProfileNotice("已读取你的个人主页和 CV 文件记录。当前浏览器版本会优先使用个人资料字段生成匹配，DOCX 可读取更多内容。", "success");
    } else {
      showProfileNotice("已读取你的个人主页资料，正在自动生成匹配结果。", "success");
    }

    setTimeout(() => {
      form.requestSubmit ? form.requestSubmit() : form.dispatchEvent(new Event("submit", { cancelable: true, bubbles: true }));
    }, 350);
  }


  const ROLE_LIBRARY = [
    {
      title: "金融合规分析师",
      titleEn: "Financial Compliance Analyst",
      base: 44,
      markets: ["日本", "香港", "新加坡"],
      careers: ["金融 / 合规", "Web3 / 金融合规", "法律 / 合规"],
      keywords: ["金融", "finance", "合规", "compliance", "监管", "kyc", "aml", "风控", "银行", "证券", "投行", "审计", "风险"],
      reason: "适合有金融、法律、合规、风控或监管兴趣的候选人，可以优先看金融机构、支付公司、虚拟资产平台的合规岗位。",
      caution: "如果缺少正式实习，需要用课程项目、案例分析或证书补足可信度。"
    },
    {
      title: "法律合规分析师",
      titleEn: "Legal Compliance Analyst",
      base: 43,
      markets: ["日本", "香港", "新加坡"],
      careers: ["法律 / 合规", "金融 / 合规", "Web3 / 金融合规"],
      keywords: ["法律", "法学", "llb", "llm", "合规", "合同", "监管", "法律研究", "法务", "kyc", "aml"],
      reason: "适合有法律背景和跨境语言能力的人，尤其适合 legal operations、KYC/AML、合同支持和初级合规岗位。",
      caution: "如果没有当地法律资格，应该先强调研究能力、语言能力和跨境业务理解。"
    },
    {
      title: "Web3 / 虚拟资产合规助理",
      titleEn: "Web3 Compliance Associate",
      base: 42,
      markets: ["香港", "新加坡", "日本"],
      careers: ["Web3 / 金融合规", "金融 / 合规", "法律 / 合规"],
      keywords: ["web3", "crypto", "加密", "虚拟资产", "交易所", "defi", "区块链", "kyc", "aml", "合规", "金融"],
      reason: "适合对虚拟资产、交易所、KYC/AML 和金融监管感兴趣的人。",
      caution: "这个方向要讲清楚监管和风险控制，不然容易显得只是兴趣。"
    },
    {
      title: "跨境商务发展助理",
      titleEn: "Cross-border Business Associate",
      base: 40,
      markets: ["日本", "香港", "新加坡"],
      careers: ["国际业务", "市场 / 运营", "金融 / 合规"],
      keywords: ["商务", "business", "bd", "销售", "客户", "项目", "运营", "市场", "国际", "跨境", "沟通", "合作"],
      reason: "适合语言能力强、愿意做国际沟通、客户拓展和企业合作的人。",
      caution: "如果没有销售或商业项目经历，需要先把沟通、项目和市场理解写得更具体。"
    },
    {
      title: "数据 / 商业分析助理",
      titleEn: "Business / Data Analyst Assistant",
      base: 39,
      markets: ["日本", "香港", "新加坡", "英国"],
      careers: ["数据 / 分析", "金融 / 合规", "国际业务"],
      keywords: ["数据", "分析", "excel", "sql", "python", "tableau", "power bi", "金融分析", "商业分析", "建模", "研究"],
      reason: "适合有数据、金融分析、商业研究或工具能力的人。",
      caution: "需要用作品集、数据项目或实习任务证明你不是只会写关键词。"
    },
    {
      title: "国际人才匹配 / 招聘助理",
      titleEn: "International Talent Matching Associate",
      base: 37,
      markets: ["日本", "香港", "新加坡"],
      careers: ["国际业务", "市场 / 运营"],
      keywords: ["人力", "招聘", "hr", "人才", "求职", "学生", "社群", "沟通", "咨询", "教育", "留学"],
      reason: "适合理解留学生求职痛点、语言能力强、愿意做候选人沟通和企业匹配的人。",
      caution: "这个方向相对容易进入，但长期上限取决于企业端资源和商业化能力。"
    }
  ];

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

  function countMatches(text, keywords) {
    return keywords.reduce((count, keyword) => count + (text.includes(String(keyword).toLowerCase()) ? 1 : 0), 0);
  }

  function inferEducation(text) {
    if (hasAny(text, ["博士", "phd"])) return "博士";
    if (hasAny(text, ["硕士", "研究生", "master", "llm", "msc"])) return "硕士";
    if (hasAny(text, ["本科", "bachelor", "undergraduate", "llb"])) return "本科";
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
    if (hasAny(text, ["香港", "hong kong", "hk"])) return "香港";
    if (hasAny(text, ["新加坡", "singapore"])) return "新加坡";
    if (hasAny(text, ["英国", "伦敦", "uk", "london"])) return "英国";
    return "新加坡";
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

  function inferRisks(text, market, languages) {
    const risks = [];

    if (market === "日本" && !languages.includes("日语")) {
      risks.push("日本岗位通常更看重日语。没有日语时，应优先搜索英文岗位、外企岗位或跨境业务岗位。");
    }

    if ((market === "新加坡" || market === "香港") && !languages.includes("英文")) {
      risks.push("新加坡和香港岗位通常更看重英文工作能力，需要补强英文 CV 和面试表达。");
    }

    if (hasAny(text, ["没有经验", "无经验", "没有正式工作经验", "没实习"])) {
      risks.push("正式工作经验不足会拉低筛选通过率，需要用课程项目、案例分析或作品集补足。");
    }

    if (!hasAny(text, ["签证", "工签", "visa", "永居", "pr"])) {
      risks.push("你没有说明签证情况。跨境求职里，签证路径会影响申请优先级。");
    }

    return risks.length ? risks : ["暂时没有明显硬伤，但还需要把经历、技能和目标岗位写得更具体。"];
  }

  function scoreRole(role, text, market, career, languages, education) {
    let score = role.base;
    score += Math.min(countMatches(text, role.keywords) * 3.3, 18);

    if (role.markets.includes(market)) score += 4;
    if (role.careers.includes(career)) score += 8;

    if (languages.includes("英文")) score += 4;
    if (languages.includes("中文")) score += 2;
    if (languages.includes("日语") && market === "日本") score += 5;

    if (education === "本科") score += 3;
    if (education === "硕士") score += 4;
    if (education === "博士") score += 5;

    if (hasAny(text, ["项目", "project", "课程项目", "创业", "社团", "实习", "intern", "作品", "portfolio"])) score += 4;
    if (hasAny(text, ["没有经验", "无经验", "没有正式工作经验", "没实习"])) score -= 8;
    if (!hasAny(text, ["实习", "intern", "工作", "项目", "project", "作品", "portfolio"])) score -= 3;

    return Math.max(38, Math.min(84, Math.round(score)));
  }

  function priorityLabel(score) {
    if (score >= 74) return "优先申请";
    if (score >= 64) return "重点尝试";
    if (score >= 55) return "探索方向";
    return "暂缓申请";
  }

  function buildJudgements(profile, roles, risks) {
    return [
      {
        title: "主方向判断",
        text: `系统把你的主方向判断为「${profile.career}」。第一推荐岗位是「${roles[0].title}」，因为它最能承接你的背景和目标。`
      },
      {
        title: "市场判断",
        text: `当前目标市场优先级为「${profile.market}」。同时建议保留香港和新加坡作为平行申请市场。`
      },
      {
        title: "语言判断",
        text: `你的语言标签是「${profile.languages.join("、")}」。语言能力是跨境岗位最直接的筛选条件之一。`
      },
      {
        title: "风险判断",
        text: risks[0]
      }
    ];
  }

  function buildRoadmap(roles, risks) {
    return [
      {
        title: "先投第一推荐",
        text: `先围绕「${roles[0].title}」准备 CV、LinkedIn 和面试故事线。`
      },
      {
        title: "第二推荐做备选",
        text: `「${roles[1]?.title || "第二推荐岗位"}」适合作为备选路线，用来扩大机会池。`
      },
      {
        title: "补足短板",
        text: risks[0]
      },
      {
        title: "用真实反馈调整",
        text: "每投 10 个岗位记录一次回复率，再调整国家、公司类型和岗位关键词。"
      }
    ];
  }

  function getRoutes(career) {
    return COMPANY_ROUTES[career] || COMPANY_ROUTES["国际业务"];
  }

  function generateMatch(background, marketSelection, careerSelection) {
    const text = normalize(background);
    const education = inferEducation(text);
    const languages = inferLanguages(text);
    const market = inferMarket(text, marketSelection);
    const career = inferCareer(text, careerSelection);
    const risks = inferRisks(text, market, languages);

    let roles = ROLE_LIBRARY
      .map((role) => ({ ...role, score: scoreRole(role, text, market, career, languages, education) }))
      .sort((a, b) => b.score - a.score)
      .slice(0, 3)
      .map((role, index) => ({ ...role, score: Math.max(38, role.score - index * 4) }));

    const routes = getRoutes(career);

    return {
      background,
      education,
      languages,
      market,
      career,
      risks,
      roles,
      routes,
      bestScore: roles[0]?.score || 0,
      judgements: buildJudgements({ education, languages, market, career }, roles, risks),
      roadmap: buildRoadmap(roles, risks)
    };
  }

  function renderResult(result) {
    bestScoreEl.textContent = String(result.bestScore);
    summaryText.textContent = `系统建议你先看「${result.roles[0].title}」，再用「${result.roles[1].title}」和「${result.roles[2].title}」作为备选路线。`;

    roleGrid.innerHTML = result.roles.map((role, index) => `
      <article class="jo22-role-card">
        <div class="jo22-rank">第 ${index + 1} 推荐 · ${priorityLabel(role.score)}</div>
        <h4>${escapeHtml(role.title)}</h4>
        <div class="jo22-role-meta">
          <span class="jo22-pill">${escapeHtml(role.titleEn)}</span>
          <span class="jo22-pill">${escapeHtml(priorityLabel(role.score))}</span>
          <span class="jo22-pill">${escapeHtml(result.market)}</span>
        </div>
        <p>${escapeHtml(role.reason)}</p>
        <p style="margin-top:10px;"><strong>注意：</strong>${escapeHtml(role.caution)}</p>
        <div class="jo22-score">${role.score} 分</div>
      </article>
    `).join("");

    routeGrid.innerHTML = result.routes.map((route, index) => {
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

    judgementList.innerHTML = result.judgements.map((item) => `
      <div class="jo22-info-item">
        <strong>${escapeHtml(item.title)}</strong>
        <span>${escapeHtml(item.text)}</span>
      </div>
    `).join("");

    roadmapList.innerHTML = result.roadmap.map((step) => `
      <div class="jo22-info-item">
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
      "具体公司与岗位搜索路线：",
      ...result.routes.map((route, index) => `${index + 1}. ${route.market}：${route.company} - ${route.role}`),
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

    statusMessage.classList.add("jo22-show");
    setTimeout(() => statusMessage.classList.remove("jo22-show"), 2200);
  });

  loadProfileAndAutoMatch();
})();
