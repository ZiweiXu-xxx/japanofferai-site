// JapanOffer AI - Step 30 Jobs + Saved Jobs + AI Recommendation MVP
(function () {

  // UI strings follow the shared language (window.JOLang). Job descriptions
  // stay in their authored language; only chrome and status text translate.
  const JO_STR = {
    en: {
      "reason.market": "Market match: your target market includes {market}.",
      "reason.direction": "Direction match: a legal / compliance background transfers directly to this role.",
      "reason.language": "Language match: your languages cover part of the role requirements.",
      "reason.interest": "Interest match: your Web3 / crypto interest lines up with this role.",
      "reason.entry": "Entry-friendly: a good early-career entry point.",
      "reason.good": "A good overall match — worth researching first.",
      "reason.explore": "Worth exploring, but you would need more specific experience.",
      "jobs.empty": "No jobs match these filters. Try widening the market, direction, language, remote or visa filter.",
      "filter.remote": "Remote",
      "filter.allRemote": "All roles",
      "filter.remoteOnly": "Remote-friendly only",
      "filter.onSiteOnly": "On-site only",
      "filter.visaRisk": "Visa risk",
      "filter.allVisa": "Any visa risk",
      "filter.visaFriendly": "Lower visa risk (score 70+)",
      "filter.visaHigher": "Higher visa risk (score under 60)",
      "job.sourceLink": "View public source / Apply link",
      "job.source": "Source: ",
      "job.verified": "Public job",
      "job.saved": "Saved",
      "job.save": "Save job",
      "job.unsave": "Unsave",
      "job.unsaveHint": "Saved — click to remove from your saved jobs",
      "job.apply": "Apply",
      "saved.empty": "No saved jobs yet.",
      "saved.openHub": "Open in application hub",
      "saved.remove": "Remove",
      "saved.removed": "Removed from your saved jobs.",
      "saved.removeFail": "Could not remove the saved job: {error}",
      "profile.missing": "Not configured",
      "profile.noConfig": "Supabase is not configured. You can still browse jobs, but you cannot save them.",
      "profile.notSignedIn": "Not signed in",
      "profile.browseOnly": "You can browse jobs without signing in, but saving jobs and personalised ranking need an account.",
      "profile.signedIn": "Signed in",
      "profile.loadFail": "Could not load your profile: {error}",
      "profile.empty": "Not set",
      "profile.uploaded": "Uploaded",
      "profile.notUploaded": "Not uploaded",
      "profile.loaded": "Your Profile / CV has been read and jobs re-ranked by your background.",
      "profile.noProfile": "You are signed in but have no profile yet. Upload your CV from My profile.",
      "saved.loadFail": "Could not load saved jobs: {error}",
      "saved.needLogin": "Sign in first, then save jobs.",
      "saved.fail": "Save failed: {error}",
      "saved.done": "Job saved to your account.",
      "apply.needLogin": "Sign in first, then open the application hub.",
      "apply.saving": "Saving the job, then opening the application hub...",
      "apply.fail": "Could not save the job: {error}",
      "profile.reread": "Your Profile / CV has been re-read and the ranking refreshed.",
      "profile.none": "No profile found yet."
    },
    zh: {
      "reason.market": "目标市场匹配：你的目标市场包含 {market}。",
      "reason.direction": "方向匹配：法律 / 合规背景可以直接转化为岗位优势。",
      "reason.language": "语言匹配：你的语言能力覆盖岗位要求的一部分。",
      "reason.interest": "兴趣匹配：你的 Web3 / crypto 兴趣与岗位方向相关。",
      "reason.entry": "入门友好：该方向更适合作为早期职业切入点。",
      "reason.good": "整体匹配较好，可以优先研究岗位要求。",
      "reason.explore": "可以作为探索方向，但需要补充更具体经历。",
      "jobs.empty": "没有找到符合筛选条件的岗位。可以放宽市场、方向、语言、远程或签证筛选。",
      "filter.remote": "远程",
      "filter.allRemote": "全部",
      "filter.remoteOnly": "仅支持远程",
      "filter.onSiteOnly": "仅线下办公",
      "filter.visaRisk": "签证风险",
      "filter.allVisa": "不限签证风险",
      "filter.visaFriendly": "签证风险较低（70 分以上）",
      "filter.visaHigher": "签证风险较高（60 分以下）",
      "job.sourceLink": "查看公开来源 / 申请链接",
      "job.source": "来源：",
      "job.verified": "公开岗位",
      "job.saved": "已保存",
      "job.save": "保存岗位",
      "job.unsave": "取消保存",
      "job.unsaveHint": "已保存 — 点击取消保存",
      "job.apply": "进入申请",
      "saved.empty": "还没有保存岗位。",
      "saved.openHub": "在申请中心打开",
      "saved.remove": "移除",
      "saved.removed": "已从保存列表移除。",
      "saved.removeFail": "取消保存失败：{error}",
      "profile.missing": "配置缺失",
      "profile.noConfig": "没有读取到 Supabase 配置。职位库仍可浏览，但不能保存岗位。",
      "profile.notSignedIn": "未登录",
      "profile.browseOnly": "未登录状态下可以浏览职位，但保存岗位和个性化排序需要先登录。",
      "profile.signedIn": "已登录",
      "profile.loadFail": "读取个人主页失败：{error}",
      "profile.empty": "未填写",
      "profile.uploaded": "已上传",
      "profile.notUploaded": "未上传",
      "profile.loaded": "已读取你的 Profile / CV 记录，岗位已经按你的背景重新排序。",
      "profile.noProfile": "你已登录，但还没有保存个人主页。建议先去我的主页上传 CV。",
      "saved.loadFail": "读取已保存岗位失败：{error}",
      "saved.needLogin": "请先登录，再保存岗位。",
      "saved.fail": "保存失败：{error}",
      "saved.done": "岗位已保存到你的账号。",
      "apply.needLogin": "请先登录，再进入申请中心。",
      "apply.saving": "正在保存岗位，并跳转到申请中心...",
      "apply.fail": "保存岗位失败：{error}",
      "profile.reread": "已重新读取你的 Profile / CV，并刷新岗位排序。",
      "profile.none": "还没有读取到个人主页资料。"
    },
    ja: {
      "reason.market": "市場マッチ：対象市場に {market} が含まれています。",
      "reason.direction": "方向性マッチ：法務 / コンプライアンスの背景が直接活かせます。",
      "reason.language": "言語マッチ：あなたの語学力が求人の一部をカバーしています。",
      "reason.interest": "興味マッチ：Web3 / crypto への関心と方向性が合っています。",
      "reason.entry": "未経験歓迎：キャリアの入口として適しています。",
      "reason.good": "全体的に良いマッチです。まず求人要件を調べましょう。",
      "reason.explore": "探索する価値はありますが、より具体的な経験が必要です。",
      "jobs.empty": "条件に合う求人がありません。市場、職種、言語、リモート、ビザの条件を緩めてみてください。",
      "filter.remote": "リモート",
      "filter.allRemote": "すべて",
      "filter.remoteOnly": "リモート可のみ",
      "filter.onSiteOnly": "出社のみ",
      "filter.visaRisk": "ビザリスク",
      "filter.allVisa": "すべて",
      "filter.visaFriendly": "ビザリスク低め（70点以上）",
      "filter.visaHigher": "ビザリスク高め（60点未満）",
      "job.sourceLink": "公開情報 / 応募リンクを見る",
      "job.source": "出典：",
      "job.verified": "公開求人",
      "job.saved": "保存済み",
      "job.save": "求人を保存",
      "job.unsave": "保存を解除",
      "job.unsaveHint": "保存済み — クリックで解除",
      "job.apply": "応募する",
      "saved.empty": "まだ保存した求人はありません。",
      "saved.openHub": "応募ハブで開く",
      "saved.remove": "削除",
      "saved.removed": "保存リストから削除しました。",
      "saved.removeFail": "保存の解除に失敗しました：{error}",
      "profile.missing": "未設定",
      "profile.noConfig": "Supabase が設定されていません。求人の閲覧はできますが、保存はできません。",
      "profile.notSignedIn": "未ログイン",
      "profile.browseOnly": "ログインなしでも求人を閲覧できますが、保存とパーソナライズにはログインが必要です。",
      "profile.signedIn": "ログイン済み",
      "profile.loadFail": "プロフィールを読み込めませんでした：{error}",
      "profile.empty": "未設定",
      "profile.uploaded": "アップロード済み",
      "profile.notUploaded": "未アップロード",
      "profile.loaded": "Profile / CV を読み取り、背景に合わせて求人を並べ替えました。",
      "profile.noProfile": "ログイン済みですが、プロフィールがまだありません。マイページから CV をアップロードしてください。",
      "saved.loadFail": "保存した求人を読み込めませんでした：{error}",
      "saved.needLogin": "まずログインしてから求人を保存してください。",
      "saved.fail": "保存できませんでした：{error}",
      "saved.done": "求人をアカウントに保存しました。",
      "apply.needLogin": "まずログインしてから応募ハブを開いてください。",
      "apply.saving": "求人を保存して応募ハブへ移動しています…",
      "apply.fail": "求人を保存できませんでした：{error}",
      "profile.reread": "Profile / CV を再読込し、並べ替えを更新しました。",
      "profile.none": "プロフィールがまだ見つかりません。"
    }
  };

  function joLang() {
    if (window.JOLang) return window.JOLang.get();
    return localStorage.getItem("japanoffer_lang") || "en";
  }

  function t(key, vars) {
    var lang = joLang();
    var str = (JO_STR[lang] && JO_STR[lang][key]) || JO_STR.en[key] || key;
    if (vars) {
      Object.keys(vars).forEach(function (k) {
        str = str.replace("{" + k + "}", vars[k]);
      });
    }
    return str;
  }
  const jobsGrid = document.getElementById("jobsGrid");
  const savedList = document.getElementById("savedList");
  const searchInput = document.getElementById("searchInput");
  const marketFilter = document.getElementById("marketFilter");
  const categoryFilter = document.getElementById("categoryFilter");
  const languageFilter = document.getElementById("languageFilter");
  const sortFilter = document.getElementById("sortFilter");
  const remoteFilter = document.getElementById("remoteFilter");
  const visaFilter = document.getElementById("visaFilter");
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
      description_en: "For candidates with a legal background and English ability who want a compliance role at a Japanese fintech, payments or platform company.",
      description_ja: "法務のバックグラウンドと英語力があり、日本のフィンテック、決済、プラットフォーム企業でコンプライアンス職に就きたい方に適しています。",
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
      description_en: "For candidates who want to combine a legal background, crypto interest and compliance operations.",
      description_ja: "法務のバックグラウンド、暗号資産への関心、コンプライアンス業務を組み合わせたい方に適しています。",
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
      description_en: "For candidates with strong Chinese and English who want to move into Hong Kong financial compliance or virtual-asset compliance.",
      description_ja: "中国語と英語に強く、香港の金融コンプライアンスや仮想資産コンプライアンスに進みたい方に適しています。",
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
      description_en: "For candidates strongly interested in virtual assets, exchanges, compliance and risk management.",
      description_ja: "仮想資産、取引所、コンプライアンス、リスク管理に強い関心がある方に適しています。",
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
      description_en: "For candidates with strong language skills who want to move into international business, client development or corporate partnerships.",
      description_ja: "語学力に優れ、国際ビジネス、顧客開拓、企業提携の分野に進みたい方に適しています。",
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
      description_en: "For candidates who want to enter Singapore fintech through operations, risk review or payments compliance.",
      description_ja: "オペレーション、リスク審査、決済コンプライアンスからシンガポールのフィンテックに入りたい方に適しています。",
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
      description_en: "For law students building UK experience in legal operations, document management and client support.",
      description_ja: "英国でリーガルオペレーション、文書管理、クライアントサポートの経験を積みたい法学部生に適しています。",
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
      description_en: "For candidates interested in cross-border recruitment, talent matching, HR tech and international business.",
      description_ja: "クロスボーダー採用、人材マッチング、HRテック、国際ビジネスに興味がある方に適しています。",
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

  // --- Pillar 3 filters: remote + visa risk, from real job fields only ---
  // Remote: a job counts as remote-friendly when its city, title or
  // description mentions remote working (e.g. "Tokyo / Remote hybrid",
  // Remotive rows whose city is "Remote"). There is no dedicated remote
  // boolean in platform_items, so this is keyword-based on real data.
  // Visa: there is NO sponsorship flag anywhere in the data (neither
  // platform_items nor /api/search-real-jobs returns one), so the filter
  // uses the real visaScore instead: >= 70 is lower risk, under 60 is
  // higher risk. It is a risk band, not a sponsorship promise.
  // Salary: deliberately NOT added — no salary field exists in
  // platform_items, the importer or the demo jobs, so a salary filter
  // would be fake. (Adzuna returns salary_min/max, but jobs.html never
  // calls /api/search-real-jobs; a salary filter belongs on the search
  // pages, not here.)
  function jobDescription(job) {
    var lang = joLang();
    if (lang === "ja" && job.description_ja) return job.description_ja;
    if (lang === "zh") return job.description || "";
    if (job.description_en) return job.description_en;
    return job.description || "";
  }

  function isRemoteJob(job) {
    var text = normalize([
      job.city,
      job.title,
      job.description,
      job.description_en,
      job.description_ja
    ].join(" "));
    return text.includes("remote") || text.includes("远程") || text.includes("リモート");
  }

  function visaBand(job) {
    var score = Number(job.visaScore);
    if (!Number.isFinite(score)) return "medium";
    if (score >= 70) return "friendly";
    if (score < 60) return "higher";
    return "medium";
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
      reasons.push(t("reason.market", { market: job.market }));
    }

    if (currentProfile?.career_direction && (
      normalize(currentProfile.career_direction).includes("合规") ||
      normalize(currentProfile.career_direction).includes("法律")
    ) && (job.category.includes("Legal") || job.skills.includes("Compliance"))) {
      reasons.push(t("reason.direction"));
    }

    if (job.languages.some((lang) => normalize(currentProfile?.languages).includes(normalize(lang)))) {
      reasons.push(t("reason.language"));
    }

    if (text.includes("web3") && job.category.includes("Web3")) {
      reasons.push(t("reason.interest"));
    }

    if (job.entryScore >= 75) {
      reasons.push(t("reason.entry"));
    }

    if (!reasons.length) {
      reasons.push(score >= 70 ? t("reason.good") : t("reason.explore"));
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
      description_en: row.description_en || "",
      description_ja: row.description_ja || "",
      sourceName: row.source_name || "",
      sourceUrl: row.source_url || row.apply_url || "",
      externalId: row.external_id || "",
      isVerified: !!row.is_verified,
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
        .eq("is_verified", true)
        .order("last_seen_at", { ascending: false })
        .order("score", { ascending: false });

      if (error) throw error;

      const realRows = (Array.isArray(data) ? data : []).filter((row) => {
        return row.is_verified === true && (row.source_url || row.apply_url || row.source_name || row.external_id);
      });

      if (realRows.length) {
        jobs = realRows.map(mapPlatformJob);
        return true;
      }

      // Important: do not fall back to demo jobs here.
      // If importer has not run yet, show an empty jobs page rather than fake roles.
      jobs = [];
      return false;
    } catch (error) {
      console.warn("Could not load real public jobs from platform_items.", error);
      jobs = [];
    }

    return false;
  }

  function filteredJobs() {
    const q = normalize(searchInput.value);
    const market = marketFilter.value;
    const category = categoryFilter.value;
    const language = languageFilter.value;
    const remote = remoteFilter ? remoteFilter.value : "all";
    const visa = visaFilter ? visaFilter.value : "all";

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
        job.description,
        job.description_en,
        job.description_ja
      ].join(" "));

      if (q && !text.includes(q)) return false;
      if (market !== "all" && job.market !== market) return false;
      if (category !== "all" && job.category !== category) return false;
      if (language !== "all" && !job.languages.includes(language)) return false;
      if (remote === "remote" && !isRemoteJob(job)) return false;
      if (remote === "onsite" && isRemoteJob(job)) return false;
      if (visa !== "all" && visaBand(job) !== visa) return false;
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
      jobsGrid.innerHTML = `<div class="empty">${t("jobs.empty")}</div>`;
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

          <p class="job-desc">${escapeHtml(jobDescription(job))}</p>
          ${job.sourceUrl ? `<p class="job-desc"><a href="${escapeHtml(job.sourceUrl)}" target="_blank" rel="noopener">${t("job.sourceLink")}</a></p>` : ""}

          <div class="pills">
            <span class="pill">${escapeHtml(job.market)}</span>
            <span class="pill">${escapeHtml(job.category)}</span>
            <span class="pill">${escapeHtml(job.visa)}</span>
            ${job.languages.map((lang) => `<span class="pill">${escapeHtml(lang)}</span>`).join("")}
            ${job.sourceName ? `<span class="pill">${t("job.source")}${escapeHtml(job.sourceName)}</span>` : ""}
            ${job.isVerified ? `<span class="pill">${t("job.verified")}</span>` : ""}
          </div>

          <div class="job-reasons">
            ${reasons.map((reason) => `<div class="reason">${escapeHtml(reason)}</div>`).join("")}
          </div>

          <div class="job-actions">
            <button class="btn ${saved ? "green" : ""}" data-action="save" data-id="${escapeHtml(job.id)}" aria-pressed="${saved}" ${saved ? `title="${escapeHtml(t("job.unsaveHint"))}"` : ""}>
              ${saved ? "✓ " + t("job.saved") : t("job.save")}
            </button>
            <button class="btn primary" data-action="apply" data-id="${escapeHtml(job.id)}">${t("job.apply")}</button>
          </div>
        </article>
      `;
    }).join("");

    bindJobButtons();
  }

  function bindJobButtons() {
    Array.from(document.querySelectorAll("[data-action='save']")).forEach((button) => {
      button.addEventListener("click", () => toggleSaveJob(button.dataset.id));
    });

    Array.from(document.querySelectorAll("[data-action='apply']")).forEach((button) => {
      button.addEventListener("click", () => generateApplicationAdvice(button.dataset.id));
    });
  }

  function renderSavedJobs() {
    const saved = jobs.filter((job) => savedJobIds.has(job.id));

    if (!saved.length) {
      savedList.innerHTML = `<div class="empty">${t("saved.empty")}</div>`;
      return;
    }

    savedList.innerHTML = saved.map((job) => `
      <div class="saved-item">
        <strong>${escapeHtml(job.title)}</strong>
        <span>${escapeHtml(job.company)} · ${escapeHtml(job.market)} · ${calculateScore(job)} match</span>
        <div class="saved-item-actions">
          <a class="saved-link" href="applications.html?job=${encodeURIComponent(job.id)}">${escapeHtml(t("saved.openHub"))}</a>
          <button class="saved-remove-btn" type="button" data-action="unsave" data-id="${escapeHtml(job.id)}">${escapeHtml(t("saved.remove"))}</button>
        </div>
      </div>
    `).join("");

    Array.from(savedList.querySelectorAll("[data-action='unsave']")).forEach((button) => {
      button.addEventListener("click", () => unsaveJob(button.dataset.id));
    });
  }

  async function loadUserAndProfile() {
    const config = getConfig();

    if (!config) {
      profileAuth.textContent = t("profile.missing");
      showStatus(profileStatus, t("profile.noConfig"), "error");
      renderJobs();
      return;
    }

    supabaseClient = window.supabase.createClient(config.url, config.key);

    await loadJobsFromDatabase();

    const { data, error } = await supabaseClient.auth.getUser();

    if (error || !data?.user) {
      currentUser = null;
      currentProfile = null;
      profileAuth.textContent = t("profile.notSignedIn");
      profileCareer.textContent = t("profile.notSignedIn");
      profileMarket.textContent = t("profile.notSignedIn");
      profileLanguages.textContent = t("profile.notSignedIn");
      profileCv.textContent = t("profile.notSignedIn");
      showStatus(profileStatus, t("profile.browseOnly"), "info");
      renderJobs();
      return;
    }

    currentUser = data.user;
    profileAuth.textContent = t("profile.signedIn");

    const { data: profile, error: profileError } = await supabaseClient
      .from("user_profiles")
      .select("*")
      .eq("user_id", currentUser.id)
      .maybeSingle();

    if (profileError) {
      showStatus(profileStatus, t("profile.loadFail", { error: profileError.message }), "error");
    } else {
      currentProfile = profile || null;
    }

    profileCareer.textContent = currentProfile?.career_direction || t("profile.empty");
    profileMarket.textContent = currentProfile?.target_market || t("profile.empty");
    profileLanguages.textContent = currentProfile?.languages || t("profile.empty");
    profileCv.textContent = currentProfile?.cv_file_name ? t("profile.uploaded") : t("profile.notUploaded");

    if (currentProfile) {
      showStatus(profileStatus, t("profile.loaded"), "success");
    } else {
      showStatus(profileStatus, t("profile.noProfile"), "info");
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
      showStatus(saveStatus, t("saved.loadFail", { error: error.message }), "error");
      return;
    }

    (data || []).forEach((row) => savedJobIds.add(row.job_id));
  }

  async function saveJob(jobId) {
    const job = jobs.find((item) => item.id === jobId);
    if (!job) return;

    if (!supabaseClient || !currentUser) {
      showStatus(saveStatus, t("saved.needLogin"), "error");
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
      showStatus(saveStatus, t("saved.fail", { error: error.message }), "error");
      return;
    }

    savedJobIds.add(job.id);
    showStatus(saveStatus, t("saved.done"), "success");
    renderJobs();
    renderSavedJobs();
    logEvent("job_saved", job.id);
  }

  // Save button toggles: a second click removes the job again, so the
  // saved state on each card always reflects Supabase.
  async function toggleSaveJob(jobId) {
    if (savedJobIds.has(jobId)) {
      await unsaveJob(jobId);
      return;
    }
    await saveJob(jobId);
  }

  async function unsaveJob(jobId) {
    const job = jobs.find((item) => item.id === jobId);

    if (!supabaseClient || !currentUser) {
      showStatus(saveStatus, t("saved.needLogin"), "error");
      return;
    }

    const { error } = await supabaseClient
      .from("saved_jobs")
      .delete()
      .eq("user_id", currentUser.id)
      .eq("job_id", jobId);

    if (error) {
      showStatus(saveStatus, t("saved.removeFail", { error: error.message }), "error");
      return;
    }

    savedJobIds.delete(jobId);
    showStatus(saveStatus, t("saved.removed"), "success");
    renderJobs();
    renderSavedJobs();
    if (job) logEvent("job_unsaved", job.id);
  }

  async function generateApplicationAdvice(jobId) {
    const job = jobs.find((item) => item.id === jobId);
    if (!job) return;

    if (!supabaseClient || !currentUser) {
      showStatus(applyStatus, t("apply.needLogin"), "error");
      return;
    }

    showStatus(applyStatus, t("apply.saving"), "info");

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
      showStatus(applyStatus, t("apply.fail", { error: error.message }), "error");
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

  [searchInput, marketFilter, categoryFilter, languageFilter, sortFilter, remoteFilter, visaFilter].filter(Boolean).forEach((el) => {
    el.addEventListener("input", renderJobs);
    el.addEventListener("change", renderJobs);
  });

  rankWithProfileButton.addEventListener("click", async () => {
    await loadUserAndProfile();
    showStatus(profileStatus, currentProfile ? t("profile.reread") : t("profile.none"), currentProfile ? "success" : "info");
  });


  // Re-render when the language changes so rendered buttons and reasons
  // follow the new language.
  window.addEventListener("japanoffer:languagechange", function () {
    if (typeof renderJobs === "function") renderJobs();
    if (typeof renderSavedJobs === "function") renderSavedJobs();
    if (typeof loadUserAndProfile === "function") loadUserAndProfile();
  });

  // Test hook (also handy for debugging): pure filter helpers, no DOM
  // beyond the filter inputs that filteredJobs already reads.
  window.JOJobsFilters = { isRemoteJob, visaBand, jobDescription, filteredJobs, renderJobs };

  loadUserAndProfile();
})();
