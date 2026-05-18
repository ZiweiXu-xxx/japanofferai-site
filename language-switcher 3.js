// JapanOffer AI language switcher v3
// Purpose: keep one clean language per page and use a compact selector that does not block the username.

(function () {
  const KEY = "japanoffer_lang";

  const COPY = {
    en: {
      langLabel: "EN",
      brandSub: "Cross-border Talent Network",
      eyebrow: "AI-powered cross-border hiring network",
      titleA: "Search less.",
      titleB: "Match smarter.",
      lead1: "JapanOffer AI helps cross-border talent and overseas employers find better matches through structured role fit, language fit, visa risk and career direction scoring.",
      lead2: "Search fewer roles. Apply with more precision. JapanOffer AI helps you decide which cross-border opportunities are truly worth applying for first.",
      network: "Network",
      jobs: "Jobs",
      report: "Report",
      companies: "Companies",
      feedback: "Feedback",
      logout: "Log out",
      login: "Log in",
      findJobs: "Find jobs",
      findTalent: "Find talent",
      exploreCompanies: "Explore companies",
      roleLabel: "Role, skill or background",
      marketLabel: "Target market",
      searchJobs: "Search jobs",
      entryLevel: "Entry-level",
      visaAware: "Visa-aware",
      englishJapanese: "English + Japanese",
      legalCompliance: "Legal / Compliance",
      zhReport: "Chinese AI Match Report",
      enReport: "English Auto Report",
      feedbackSurvey: "Feedback",
      talentMatchOS: "Talent Match OS",
      liveBeta: "Live beta",
      matches: "Matches",
      talent: "Talent",
      roles: "Roles",
      cardLegalTitle: "Legal Compliance Analyst",
      cardLegalMeta: "Tokyo · Entry level · English and Japanese preferred",
      strongEducationFit: "Strong education fit",
      mediumVisaRisk: "Medium visa risk",
      applyFirst: "Apply first",
      cardBusinessTitle: "Cross-border Business Associate",
      cardBusinessMeta: "Singapore · International team · Mandarin useful",
      goodLanguageFit: "Good language fit",
      lowerVisaRisk: "Lower visa risk",
      candidateProfile: "Candidate profile",
      candidateMeta: "LLB · English / Japanese / Mandarin · Compliance target",
      viewProfile: "View profile",
      betaAccess: "Beta access",
      finalTitle: "Build your cross-border match profile.",
      finalText: "Start with one real job search. Then compare roles, save opportunities and move toward a structured international career route.",
      createAccount: "Create account",
      footer: "Cross-border talent matching network.",
      topSearchPlaceholder: "Search UK legal, Singapore compliance, Japan legal, Hong Kong AML...",
      rolePlaceholder: "Legal, compliance, AML, finance...",
      marketPlaceholder: "UK, Singapore, Japan..."
    },

    zh: {
      langLabel: "中文",
      brandSub: "跨境人才匹配网络",
      eyebrow: "AI 驱动的跨境求职与招聘网络",
      titleA: "少一点海投。",
      titleB: "多一点精准匹配。",
      lead1: "JapanOffer AI 通过岗位匹配、语言匹配、签证风险和职业方向评分，帮助跨境求职者和海外雇主找到更合适的机会。",
      lead2: "它不只是告诉你有哪些岗位，而是帮你判断哪些跨境机会真正值得优先申请。",
      network: "网络",
      jobs: "岗位",
      report: "报告",
      companies: "企业",
      feedback: "反馈",
      logout: "退出登录",
      login: "登录",
      findJobs: "找岗位",
      findTalent: "找人才",
      exploreCompanies: "探索企业",
      roleLabel: "岗位、技能或背景",
      marketLabel: "目标市场",
      searchJobs: "搜索岗位",
      entryLevel: "入门级",
      visaAware: "签证友好",
      englishJapanese: "英语 + 日语",
      legalCompliance: "法律 / 合规",
      zhReport: "中文版：生成 AI 匹配报告",
      enReport: "英文自动报告",
      feedbackSurvey: "反馈问卷",
      talentMatchOS: "人才匹配系统",
      liveBeta: "测试版",
      matches: "匹配",
      talent: "人才",
      roles: "岗位",
      cardLegalTitle: "法务合规分析师",
      cardLegalMeta: "东京 · 入门级 · 英语和日语优先",
      strongEducationFit: "教育背景匹配度高",
      mediumVisaRisk: "中等签证风险",
      applyFirst: "优先申请",
      cardBusinessTitle: "跨境商务助理",
      cardBusinessMeta: "新加坡 · 国际团队 · 中文有优势",
      goodLanguageFit: "语言匹配较好",
      lowerVisaRisk: "签证风险较低",
      candidateProfile: "候选人档案",
      candidateMeta: "LLB · 英语 / 日语 / 中文 · 合规方向",
      viewProfile: "查看档案",
      betaAccess: "测试版入口",
      finalTitle: "建立你的跨境求职匹配档案。",
      finalText: "从一次真实岗位搜索开始，比较岗位、保存机会，并逐步形成清晰的国际职业路径。",
      createAccount: "创建账户",
      footer: "跨境人才匹配网络。",
      topSearchPlaceholder: "搜索英国法律、新加坡合规、日本法务、香港 AML...",
      rolePlaceholder: "法律、合规、AML、金融...",
      marketPlaceholder: "英国、新加坡、日本..."
    },

    ja: {
      langLabel: "日本語",
      brandSub: "クロスボーダー人材マッチングネットワーク",
      eyebrow: "AI を活用したクロスボーダー採用ネットワーク",
      titleA: "探す時間を減らし、",
      titleB: "より精度の高いマッチングへ。",
      lead1: "JapanOffer AI は、職種適性、語学力、ビザリスク、キャリア方向性をもとに、海外人材と企業のより良いマッチングを支援します。",
      lead2: "求人を並べるだけでなく、どの海外求人に優先して応募すべきかを判断できるようにします。",
      network: "ネットワーク",
      jobs: "求人",
      report: "レポート",
      companies: "企業",
      feedback: "フィードバック",
      logout: "ログアウト",
      login: "ログイン",
      findJobs: "求人を探す",
      findTalent: "人材を探す",
      exploreCompanies: "企業を見る",
      roleLabel: "職種・スキル・バックグラウンド",
      marketLabel: "対象マーケット",
      searchJobs: "求人を検索",
      entryLevel: "未経験・初級",
      visaAware: "ビザ考慮",
      englishJapanese: "英語 + 日本語",
      legalCompliance: "法務 / コンプライアンス",
      zhReport: "中国語版 AI マッチングレポート",
      enReport: "英語版レポート",
      feedbackSurvey: "フィードバック",
      talentMatchOS: "Talent Match OS",
      liveBeta: "ベータ版",
      matches: "マッチ",
      talent: "人材",
      roles: "求人",
      cardLegalTitle: "法務コンプライアンスアナリスト",
      cardLegalMeta: "東京 · エントリーレベル · 英語・日本語歓迎",
      strongEducationFit: "学歴との相性が高い",
      mediumVisaRisk: "中程度のビザリスク",
      applyFirst: "優先応募",
      cardBusinessTitle: "クロスボーダービジネスアソシエイト",
      cardBusinessMeta: "シンガポール · 国際チーム · 中国語歓迎",
      goodLanguageFit: "語学力との相性が良い",
      lowerVisaRisk: "ビザリスク低め",
      candidateProfile: "候補者プロフィール",
      candidateMeta: "LLB · 英語 / 日本語 / 中国語 · コンプライアンス志向",
      viewProfile: "プロフィールを見る",
      betaAccess: "ベータ版アクセス",
      finalTitle: "クロスボーダー向けのマッチングプロフィールを作成。",
      finalText: "まずは実際の求人検索から始め、求人を比較し、機会を保存しながら国際的なキャリアルートを整理できます。",
      createAccount: "アカウント作成",
      footer: "クロスボーダー人材マッチングネットワーク。",
      topSearchPlaceholder: "英国 法務、シンガポール コンプライアンス、日本 法務、香港 AML を検索...",
      rolePlaceholder: "法務、コンプライアンス、AML、金融...",
      marketPlaceholder: "英国、シンガポール、日本..."
    }
  };

  const TEXT_GROUPS = [
    ["Network", "网络", "ネットワーク", "network"],
    ["Jobs", "岗位", "求人", "jobs"],
    ["Report", "报告", "レポート", "report"],
    ["Companies", "企业", "企業", "companies"],
    ["Feedback", "反馈", "フィードバック", "feedback"],
    ["Log out", "退出登录", "ログアウト", "logout"],
    ["Log in", "登录", "ログイン", "login"],
    ["Find jobs", "找岗位", "求人を探す", "findJobs"],
    ["Find talent", "找人才", "人材を探す", "findTalent"],
    ["Explore companies", "探索企业", "企業を見る", "exploreCompanies"],
    ["Role, skill or background", "岗位、技能或背景", "職種・スキル・バックグラウンド", "roleLabel"],
    ["Target market", "目标市场", "対象マーケット", "marketLabel"],
    ["Search jobs", "搜索岗位", "求人を検索", "searchJobs"],
    ["Entry-level", "入门级", "未経験・初級", "entryLevel"],
    ["Visa-aware", "签证友好", "ビザ考慮", "visaAware"],
    ["English + Japanese", "英语 + 日语", "英語 + 日本語", "englishJapanese"],
    ["Legal / Compliance", "法律 / 合规", "法務 / コンプライアンス", "legalCompliance"],
    ["中文版：生成 AI 匹配报告", "Chinese AI Match Report", "中国語版 AI マッチングレポート", "zhReport"],
    ["English Auto Report", "英文自动报告", "英語版レポート", "enReport"],
    ["反馈问卷", "Feedback survey", "feedbackSurvey"],
    ["Talent Match OS", "人才匹配系统", "talentMatchOS"],
    ["Live beta", "测试版", "ベータ版", "liveBeta"],
    ["Matches", "匹配", "マッチ", "matches"],
    ["Talent", "人才", "人材", "talent"],
    ["Roles", "岗位", "求人", "roles"],
    ["Legal Compliance Analyst", "法务合规分析师", "法務コンプライアンスアナリスト", "cardLegalTitle"],
    ["Tokyo · Entry level · English and Japanese preferred", "东京 · 入门级 · 英语和日语优先", "東京 · エントリーレベル · 英語・日本語歓迎", "cardLegalMeta"],
    ["Strong education fit", "教育背景匹配度高", "学歴との相性が高い", "strongEducationFit"],
    ["Medium visa risk", "中等签证风险", "中程度のビザリスク", "mediumVisaRisk"],
    ["Apply first", "优先申请", "優先応募", "applyFirst"],
    ["Cross-border Business Associate", "跨境商务助理", "クロスボーダービジネスアソシエイト", "cardBusinessTitle"],
    ["Singapore · International team · Mandarin useful", "新加坡 · 国际团队 · 中文有优势", "シンガポール · 国際チーム · 中国語歓迎", "cardBusinessMeta"],
    ["Good language fit", "语言匹配较好", "語学力との相性が良い", "goodLanguageFit"],
    ["Lower visa risk", "签证风险较低", "ビザリスク低め", "lowerVisaRisk"],
    ["Candidate profile", "候选人档案", "候補者プロフィール", "candidateProfile"],
    ["LLB · English / Japanese / Mandarin · Compliance target", "LLB · 英语 / 日语 / 中文 · 合规方向", "LLB · 英語 / 日本語 / 中国語 · コンプライアンス志向", "candidateMeta"],
    ["View profile", "查看档案", "プロフィールを見る", "viewProfile"],
    ["Beta access", "测试版入口", "ベータ版アクセス", "betaAccess"],
    ["Build your cross-border match profile.", "建立你的跨境求职匹配档案。", "クロスボーダー向けのマッチングプロフィールを作成。", "finalTitle"],
    ["Start with one AI report. Then compare roles, save opportunities and move toward a structured international career route.", "Start with one real job search. Then compare roles, save opportunities and move toward a structured international career route.", "从一次真实岗位搜索开始，比较岗位、保存机会，并逐步形成清晰的国际职业路径。", "まずは実際の求人検索から始め、求人を比較し、機会を保存しながら国際的なキャリアルートを整理できます。", "finalText"],
    ["Create account", "创建账户", "アカウント作成", "createAccount"],
    ["Cross-border talent matching network.", "跨境人才匹配网络。", "クロスボーダー人材マッチングネットワーク。", "footer"]
  ];

  let applying = false;

  function getLang() {
    return localStorage.getItem(KEY) || "en";
  }

  function saveLang(lang) {
    localStorage.setItem(KEY, lang);
  }

  function currentCopy() {
    return COPY[getLang()] || COPY.en;
  }

  function setTextByCandidates(candidates, value) {
    const nodes = document.querySelectorAll("a, button, span, p, label, small, strong, h2, h3");
    nodes.forEach((el) => {
      if (el.closest(".jo-lang-switcher")) return;

      const current = (el.textContent || "").trim();
      if (candidates.includes(current)) {
        el.textContent = value;
      }
    });
  }

  function replaceHero(c) {
    const eyebrow = document.querySelector("main .eyebrow, .hero .eyebrow, .premium-hero .eyebrow");
    if (eyebrow) eyebrow.textContent = c.eyebrow;

    const h1 = document.querySelector("main h1, .hero h1, .premium-hero h1");
    if (h1) {
      h1.innerHTML = `${c.titleA}<span>${c.titleB}</span>`;
    }

    const paragraphs = Array.from(document.querySelectorAll("main p, .hero p, .premium-hero p"));
    paragraphs.forEach((p) => {
      if (p.closest(".jo-lang-switcher")) return;

      const t = (p.textContent || "").trim();

      if (
        t.includes("JapanOffer AI helps cross-border talent") ||
        t.includes("JapanOffer AI 通过岗位匹配") ||
        t.includes("JapanOffer AI は、職種適性")
      ) {
        p.textContent = c.lead1;
      }

      if (
        t.includes("少一点海投") ||
        t.includes("Search fewer roles") ||
        t.includes("它不只是告诉你") ||
        t.includes("求人を並べるだけでなく")
      ) {
        p.textContent = c.lead2;
      }
    });
  }

  function replacePlaceholders(c) {
    document.querySelectorAll(".top-search input").forEach((input) => {
      input.placeholder = c.topSearchPlaceholder;
    });

    document.querySelectorAll("input").forEach((input) => {
      const ph = input.placeholder || "";

      if (
        ph.includes("Legal") ||
        ph.includes("法律") ||
        ph.includes("法務") ||
        ph.includes("compliance") ||
        ph.includes("AML")
      ) {
        input.placeholder = c.rolePlaceholder;
      }

      if (
        ph.includes("Japan") ||
        ph.includes("Singapore") ||
        ph.includes("UK") ||
        ph.includes("英国") ||
        ph.includes("シンガポール")
      ) {
        input.placeholder = c.marketPlaceholder;
      }
    });
  }

  function applyLanguage() {
    if (applying) return;

    applying = true;

    const lang = getLang();
    const c = currentCopy();

    document.documentElement.lang = lang === "zh" ? "zh-CN" : lang;
    document.body.setAttribute("data-current-lang", lang);

    const brandSmall = document.querySelector(".brand small, header small");
    if (brandSmall) brandSmall.textContent = c.brandSub;

    replaceHero(c);

    TEXT_GROUPS.forEach((group) => {
      const key = group[group.length - 1];
      const candidates = group.slice(0, -1);
      setTextByCandidates(candidates, c[key]);
    });

    replacePlaceholders(c);

    document.querySelectorAll("[data-lang-option]").forEach((btn) => {
      btn.classList.toggle("active", btn.dataset.langOption === lang);
    });

    const select = document.querySelector(".jo-lang-switcher select");
    if (select) select.value = lang;

    setTimeout(() => {
      applying = false;
    }, 0);
  }

  function addStyle() {
    if (document.getElementById("jo-lang-style")) return;

    const style = document.createElement("style");
    style.id = "jo-lang-style";
    style.textContent = `
      .jo-lang-switcher {
        display: inline-flex;
        align-items: center;
        flex-shrink: 0;
        margin-left: 4px;
      }

      .jo-lang-switcher select {
        width: 82px;
        height: 34px;
        border: 1px solid rgba(16, 24, 40, 0.12);
        border-radius: 999px;
        background: rgba(255, 255, 255, 0.82);
        color: #344054;
        font-size: 12px;
        font-weight: 850;
        padding: 0 8px;
        outline: none;
        box-shadow: 0 10px 25px rgba(16, 24, 40, 0.08);
        cursor: pointer;
      }

      .jo-lang-switcher.floating {
        position: fixed;
        right: 18px;
        top: 18px;
        z-index: 9999;
      }

      @media (max-width: 900px) {
        .jo-lang-switcher select {
          width: 76px;
        }
      }
    `;

    document.head.appendChild(style);
  }

  function createSwitcher() {
    document.querySelectorAll(".jo-lang-switcher").forEach((old) => old.remove());

    const box = document.createElement("div");
    box.className = "jo-lang-switcher";
    box.innerHTML = `
      <select aria-label="Language">
        <option value="en">EN</option>
        <option value="zh">中文</option>
        <option value="ja">日本語</option>
      </select>
    `;

    const nav = document.querySelector(".links, .nav-links, header nav");

    if (nav) {
      const accountLike = Array.from(nav.children).find((el) => {
        const text = (el.textContent || "").toLowerCase();
        return text.includes("log") || text.includes("@") || text.includes("xuziwei") || text.includes("ziwei");
      });

      if (accountLike) {
        nav.insertBefore(box, accountLike);
      } else {
        nav.appendChild(box);
      }
    } else {
      document.body.appendChild(box);
      box.classList.add("floating");
    }

    const select = box.querySelector("select");
    select.value = getLang();

    select.addEventListener("change", () => {
      saveLang(select.value);
      applyLanguage();
    });
  }

  function boot() {
    addStyle();
    createSwitcher();
    applyLanguage();

    setTimeout(applyLanguage, 300);
    setTimeout(applyLanguage, 1000);

    const observer = new MutationObserver(() => {
      if (!applying) {
        applyLanguage();
      }
    });

    observer.observe(document.body, {
      childList: true,
      subtree: true,
      characterData: true
    });
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", boot);
  } else {
    boot();
  }
})();
