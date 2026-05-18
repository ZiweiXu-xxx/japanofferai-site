// JapanOffer AI professional i18n system
// data-i18n based. No text sniffing. No mixed-language homepage.

(function () {
  const STORAGE_KEY = "japanoffer_lang";
  const DEFAULT_LANG = "en";

  const translations = {
    en: {
      meta: {
        title: "JapanOffer AI | Cross-border Talent Matching Network",
        description:
          "JapanOffer AI is a cross-border talent matching network that helps international job seekers and employers find better matches through AI match scores."
      },
      brand: { subtitle: "Cross-border Talent Network" },
      nav: {
        network: "Network",
        jobs: "Jobs",
        report: "Report",
        companies: "Companies",
        feedback: "Feedback"
      },
      auth: {
        signIn: "Sign in",
        signUp: "Sign up",
        logOut: "Log out"
      },
      search: {
        topPlaceholder: "Search UK legal, Singapore compliance, Japan legal, Hong Kong AML...",
        findJobs: "Find jobs",
        findTalent: "Find talent",
        exploreCompanies: "Explore companies",
        roleLabel: "Role, skill or background",
        roleValue: "Legal, compliance, business, technology",
        marketLabel: "Target market",
        marketValue: "UK, Singapore, Japan",
        button: "Search jobs"
      },
      hero: {
        eyebrow: "AI-powered cross-border hiring network",
        title: "Search less.<span>Match smarter.</span>",
        lead:
          "JapanOffer AI helps cross-border talent and overseas employers find better matches through structured role fit, language fit, visa risk and career direction scoring.",
        sublead:
          "Search fewer roles. Apply with more precision. JapanOffer AI helps you decide which cross-border opportunities are truly worth applying for first."
      },
      tags: {
        entry: "Entry-level",
        visa: "Visa-aware",
        language: "English + Japanese",
        legal: "Legal / Compliance"
      },
      actions: {
        zhReport: "Chinese AI Match Report",
        enReport: "English Auto Report",
        feedback: "Feedback"
      },
      preview: {
        title: "Talent Match OS",
        live: "Live beta",
        matches: "Matches",
        talent: "Talent",
        roles: "Roles",
        companies: "Companies",
        legalTitle: "Legal Compliance Analyst",
        legalMeta: "Tokyo · Entry level · English and Japanese preferred",
        educationFit: "Strong education fit",
        visaRisk: "Medium visa risk",
        applyFirst: "Apply first",
        businessTitle: "Cross-border Business Associate",
        businessMeta: "Singapore · International team · Mandarin useful",
        languageFit: "Good language fit",
        lowerRisk: "Lower visa risk",
        candidateTitle: "Candidate profile",
        candidateMeta: "LLB · English / Japanese / Mandarin · Compliance target",
        viewProfile: "View profile"
      },
      proof: {
        matchScore: "Match score",
        visaRisk: "Visa risk",
        medium: "Medium"
      },
      marquee: {
        roleMatching: "Role matching",
        visaScoring: "Visa-aware scoring",
        languageFit: "Language fit",
        employerShortlist: "Employer shortlist",
        aiReport: "AI report",
        network: "Cross-border talent network"
      },
      network: {
        kicker: "From search to match",
        title: "The job board era shows information. The next era decides fit.",
        copy:
          "LinkedIn and job boards are built around search. JapanOffer AI adds a cross-border matching layer: candidate profile, role requirements, market rules and risk signals become one practical score.",
        link: "Generate your match report →"
      },
      steps: {
        profileTitle: "Talent profile",
        profileCopy: "Education, language, visa status and direction.",
        roleTitle: "Role intelligence",
        roleCopy: "Job requirements, market reality and sponsor risk.",
        employerTitle: "Employer shortlist",
        employerCopy: "Better candidate discovery with less manual screening."
      },
      report: {
        kicker: "AI Match Report",
        title: "A product flow that feels real, not a survey redirect.",
        copy:
          "The core user action is now real job search and report generation. Feedback research is separated into its own page, so users feel they are using a product, not filling an external questionnaire.",
        generate: "Generate report",
        feedback: "Give feedback",
        overall: "Overall match",
        routeTitle: "Recommended route",
        routeCopy: "Legal Compliance Analyst · KYC / AML Analyst · Contract Assistant",
        market: "Market",
        marketValue: "Japan",
        risk: "Risk",
        priority: "Priority",
        language: "Language"
      },
      routes: {
        kicker: "Platform routes",
        title: "Every part of the homepage now leads somewhere useful.",
        copy: "Search roles, generate reports, save jobs, build a profile, or enter the employer-side waitlist.",
        jobsTitle: "Search live jobs",
        jobsCopy: "Public ATS job feeds plus JapanOffer AI match scoring.",
        reportTitle: "Generate AI report",
        reportCopy: "Chinese, English or Japanese reports generated directly on-site.",
        accountTitle: "Create account",
        accountCopy: "Build toward saved roles, reports and profile history.",
        employerTitle: "Employer waitlist",
        employerCopy: "Open the company-side matching route."
      },
      final: {
        kicker: "Beta access",
        title: "Build your cross-border match profile.",
        copy:
          "Start with one real job search. Then compare roles, save opportunities and move toward a structured international career route.",
        searchJobs: "Search jobs"
      },
      footer: { copy: "Cross-border talent matching network." }
    },

    zh: {
      meta: {
        title: "JapanOffer AI | 跨境人才匹配网络",
        description:
          "JapanOffer AI 是一个跨境人才匹配平台，帮助国际求职者和海外雇主通过 AI 匹配分数找到更合适的机会。"
      },
      brand: { subtitle: "跨境人才匹配网络" },
      nav: {
        network: "网络",
        jobs: "岗位",
        report: "报告",
        companies: "企业",
        feedback: "反馈"
      },
      auth: {
        signIn: "登录",
        signUp: "注册",
        logOut: "退出登录"
      },
      search: {
        topPlaceholder: "搜索英国法律、新加坡合规、日本法务、香港 AML...",
        findJobs: "找岗位",
        findTalent: "找人才",
        exploreCompanies: "探索企业",
        roleLabel: "岗位、技能或背景",
        roleValue: "法律、合规、AML、金融",
        marketLabel: "目标市场",
        marketValue: "英国、新加坡、日本",
        button: "搜索岗位"
      },
      hero: {
        eyebrow: "AI 驱动的跨境求职与招聘网络",
        title: "少一点海投。<span>多一点精准匹配。</span>",
        lead:
          "JapanOffer AI 通过岗位匹配、语言匹配、签证风险和职业方向评分，帮助跨境求职者和海外雇主找到更合适的机会。",
        sublead:
          "它不只是告诉你有哪些岗位，而是帮你判断哪些跨境机会真正值得优先申请。"
      },
      tags: {
        entry: "入门级",
        visa: "签证友好",
        language: "英语 + 日语",
        legal: "法律 / 合规"
      },
      actions: {
        zhReport: "中文版 AI 匹配报告",
        enReport: "英文自动报告",
        feedback: "反馈"
      },
      preview: {
        title: "人才匹配系统",
        live: "测试版",
        matches: "匹配",
        talent: "人才",
        roles: "岗位",
        companies: "企业",
        legalTitle: "法务合规分析师",
        legalMeta: "东京 · 入门级 · 英语和日语优先",
        educationFit: "教育背景匹配度高",
        visaRisk: "中等签证风险",
        applyFirst: "优先申请",
        businessTitle: "跨境商务助理",
        businessMeta: "新加坡 · 国际团队 · 中文有优势",
        languageFit: "语言匹配较好",
        lowerRisk: "签证风险较低",
        candidateTitle: "候选人档案",
        candidateMeta: "LLB · 英语 / 日语 / 中文 · 合规方向",
        viewProfile: "查看档案"
      },
      proof: {
        matchScore: "匹配分数",
        visaRisk: "签证风险",
        medium: "中等"
      },
      marquee: {
        roleMatching: "岗位匹配",
        visaScoring: "签证风险评分",
        languageFit: "语言匹配",
        employerShortlist: "雇主筛选",
        aiReport: "AI 报告",
        network: "跨境人才网络"
      },
      network: {
        kicker: "从搜索到匹配",
        title: "传统招聘网站只展示信息，下一代平台应该判断适配度。",
        copy:
          "LinkedIn 和传统招聘网站围绕搜索展开。JapanOffer AI 增加了跨境匹配层，把候选人背景、岗位要求、市场规则和风险信号整合成一个可执行的匹配分数。",
        link: "生成你的匹配报告 →"
      },
      steps: {
        profileTitle: "人才档案",
        profileCopy: "教育背景、语言能力、签证状态和职业方向。",
        roleTitle: "岗位智能分析",
        roleCopy: "岗位要求、市场现实和雇主担保风险。",
        employerTitle: "雇主筛选",
        employerCopy: "减少人工筛选，让候选人发现更精准。"
      },
      report: {
        kicker: "AI 匹配报告",
        title: "产品流程应该像真实工具，而不是问卷跳转。",
        copy:
          "核心动作现在是真实岗位搜索和报告生成。反馈研究被分离到独立页面，所以用户会感觉自己在使用一个产品，而不是填写外部问卷。",
        generate: "生成报告",
        feedback: "提交反馈",
        overall: "综合匹配",
        routeTitle: "推荐方向",
        routeCopy: "法务合规分析师 · KYC / AML 分析师 · 合同助理",
        market: "市场",
        marketValue: "日本",
        risk: "风险",
        priority: "优先级",
        language: "语言"
      },
      routes: {
        kicker: "平台入口",
        title: "首页的每一个入口都应该真正有用。",
        copy: "搜索岗位、生成报告、保存机会、建立档案，或者进入雇主侧候补名单。",
        jobsTitle: "搜索真实岗位",
        jobsCopy: "公开 ATS 岗位源，加上 JapanOffer AI 匹配评分。",
        reportTitle: "生成 AI 报告",
        reportCopy: "中文、英文或日文报告，直接在网站内生成。",
        accountTitle: "创建账户",
        accountCopy: "逐步支持保存岗位、报告和个人档案记录。",
        employerTitle: "雇主候补名单",
        employerCopy: "打开企业侧人才匹配入口。"
      },
      final: {
        kicker: "测试版入口",
        title: "建立你的跨境求职匹配档案。",
        copy:
          "从一次真实岗位搜索开始，比较岗位、保存机会，并逐步形成清晰的国际职业路径。",
        searchJobs: "搜索岗位"
      },
      footer: { copy: "跨境人才匹配网络。" }
    },

    ja: {
      meta: {
        title: "JapanOffer AI | クロスボーダー人材マッチングネットワーク",
        description:
          "JapanOffer AI は、AI マッチスコアを通じて国際的な求職者と海外企業のより良いマッチングを支援するクロスボーダー人材プラットフォームです。"
      },
      brand: { subtitle: "クロスボーダー人材ネットワーク" },
      nav: {
        network: "ネットワーク",
        jobs: "求人",
        report: "レポート",
        companies: "企業",
        feedback: "フィードバック"
      },
      auth: {
        signIn: "ログイン",
        signUp: "登録",
        logOut: "ログアウト"
      },
      search: {
        topPlaceholder: "英国 法務、シンガポール コンプライアンス、日本 法務、香港 AML を検索...",
        findJobs: "求人を探す",
        findTalent: "人材を探す",
        exploreCompanies: "企業を見る",
        roleLabel: "職種・スキル・バックグラウンド",
        roleValue: "法務、コンプライアンス、AML、金融",
        marketLabel: "対象マーケット",
        marketValue: "英国、シンガポール、日本",
        button: "求人を検索"
      },
      hero: {
        eyebrow: "AI を活用したクロスボーダー採用ネットワーク",
        title: "探す時間を減らし、<span>より精度の高いマッチングへ。</span>",
        lead:
          "JapanOffer AI は、職種適性、語学力、ビザリスク、キャリア方向性をもとに、海外人材と企業のより良いマッチングを支援します。",
        sublead:
          "求人を並べるだけでなく、どの海外求人に優先して応募すべきかを判断できるようにします。"
      },
      tags: {
        entry: "未経験・初級",
        visa: "ビザ考慮",
        language: "英語 + 日本語",
        legal: "法務 / コンプライアンス"
      },
      actions: {
        zhReport: "中国語版 AI マッチングレポート",
        enReport: "英語版レポート",
        feedback: "フィードバック"
      },
      preview: {
        title: "Talent Match OS",
        live: "ベータ版",
        matches: "マッチ",
        talent: "人材",
        roles: "求人",
        companies: "企業",
        legalTitle: "法務コンプライアンスアナリスト",
        legalMeta: "東京 · エントリーレベル · 英語・日本語歓迎",
        educationFit: "学歴との相性が高い",
        visaRisk: "中程度のビザリスク",
        applyFirst: "優先応募",
        businessTitle: "クロスボーダービジネスアソシエイト",
        businessMeta: "シンガポール · 国際チーム · 中国語歓迎",
        languageFit: "語学力との相性が良い",
        lowerRisk: "ビザリスク低め",
        candidateTitle: "候補者プロフィール",
        candidateMeta: "LLB · 英語 / 日本語 / 中国語 · コンプライアンス志向",
        viewProfile: "プロフィールを見る"
      },
      proof: {
        matchScore: "マッチスコア",
        visaRisk: "ビザリスク",
        medium: "中程度"
      },
      marquee: {
        roleMatching: "求人マッチング",
        visaScoring: "ビザリスク評価",
        languageFit: "語学力マッチ",
        employerShortlist: "企業候補リスト",
        aiReport: "AI レポート",
        network: "クロスボーダー人材ネットワーク"
      },
      network: {
        kicker: "検索からマッチングへ",
        title: "求人サイトは情報を見せるだけ。次の時代は適性を判断する。",
        copy:
          "LinkedIn や従来の求人サイトは検索を中心に設計されています。JapanOffer AI は、候補者プロフィール、求人要件、市場ルール、リスクシグナルを一つの実用的なスコアに統合します。",
        link: "マッチングレポートを生成 →"
      },
      steps: {
        profileTitle: "人材プロフィール",
        profileCopy: "学歴、語学力、ビザ状況、キャリア方向性。",
        roleTitle: "求人インテリジェンス",
        roleCopy: "求人要件、市場の現実、スポンサーリスク。",
        employerTitle: "企業候補リスト",
        employerCopy: "手作業のスクリーニングを減らし、より良い候補者発見へ。"
      },
      report: {
        kicker: "AI マッチングレポート",
        title: "アンケートではなく、本物のプロダクト体験へ。",
        copy:
          "主要なユーザー行動は、実際の求人検索とレポート生成です。フィードバック調査は独立ページに分け、ユーザーが外部フォームではなくプロダクトを使っていると感じられる設計にしています。",
        generate: "レポート生成",
        feedback: "フィードバック",
        overall: "総合マッチ",
        routeTitle: "おすすめルート",
        routeCopy: "法務コンプライアンスアナリスト · KYC / AML アナリスト · 契約アシスタント",
        market: "市場",
        marketValue: "日本",
        risk: "リスク",
        priority: "優先度",
        language: "言語"
      },
      routes: {
        kicker: "プラットフォーム導線",
        title: "ホームページのすべての導線に意味を持たせる。",
        copy: "求人検索、レポート生成、求人保存、プロフィール作成、企業側の候補リストへ。",
        jobsTitle: "実際の求人を検索",
        jobsCopy: "公開 ATS 求人フィードに JapanOffer AI のマッチスコアを追加。",
        reportTitle: "AI レポート生成",
        reportCopy: "中国語、英語、日本語のレポートをサイト内で直接生成。",
        accountTitle: "アカウント作成",
        accountCopy: "保存求人、レポート、プロフィール履歴へ展開。",
        employerTitle: "企業向けウェイトリスト",
        employerCopy: "企業側の人材マッチング導線を開く。"
      },
      final: {
        kicker: "ベータ版アクセス",
        title: "クロスボーダー向けのマッチングプロフィールを作成。",
        copy:
          "まずは実際の求人検索から始め、求人を比較し、機会を保存しながら国際的なキャリアルートを整理できます。",
        searchJobs: "求人を検索"
      },
      footer: { copy: "クロスボーダー人材マッチングネットワーク。" }
    }
  };

  const languageNames = {
    en: "EN",
    zh: "中文",
    ja: "日本語"
  };

  function getNestedValue(obj, path) {
    return path.split(".").reduce((acc, key) => (acc ? acc[key] : undefined), obj);
  }

  function getLanguage() {
    const params = new URLSearchParams(window.location.search);
    const urlLang = params.get("lang");

    if (urlLang && translations[urlLang]) {
      localStorage.setItem(STORAGE_KEY, urlLang);
      return urlLang;
    }

    return localStorage.getItem(STORAGE_KEY) || DEFAULT_LANG;
  }

  function setLanguage(lang) {
    if (!translations[lang]) return;

    localStorage.setItem(STORAGE_KEY, lang);
    applyTranslations(lang);
  }

  function applyTranslations(lang) {
    const t = translations[lang] || translations[DEFAULT_LANG];

    document.documentElement.lang = lang === "zh" ? "zh-CN" : lang;

    document.querySelectorAll("[data-i18n]").forEach((el) => {
      const value = getNestedValue(t, el.dataset.i18n);
      if (value !== undefined) el.textContent = value;
    });

    document.querySelectorAll("[data-i18n-html]").forEach((el) => {
      const value = getNestedValue(t, el.dataset.i18nHtml);
      if (value !== undefined) el.innerHTML = value;
    });

    document.querySelectorAll("[data-i18n-placeholder]").forEach((el) => {
      const value = getNestedValue(t, el.dataset.i18nPlaceholder);
      if (value !== undefined) el.setAttribute("placeholder", value);
    });

    document.querySelectorAll("[data-i18n-value]").forEach((el) => {
      const value = getNestedValue(t, el.dataset.i18nValue);
      if (value !== undefined) el.value = value;
    });

    document.querySelectorAll("[data-i18n-content]").forEach((el) => {
      const value = getNestedValue(t, el.dataset.i18nContent);
      if (value !== undefined) el.setAttribute("content", value);
    });

    document.querySelectorAll("[data-i18n-title]").forEach((el) => {
      const value = getNestedValue(t, el.dataset.i18nTitle);
      if (value !== undefined) {
        el.textContent = value;
        document.title = value;
      }
    });

    const select = document.getElementById("languageSelect");
    if (select) select.value = lang;

    document.body.dataset.lang = lang;

    const event = new CustomEvent("japanoffer:languagechange", {
      detail: { lang, label: languageNames[lang] }
    });

    window.dispatchEvent(event);
  }

  function injectStyles() {
    if (document.getElementById("japanoffer-i18n-style")) return;

    const style = document.createElement("style");
    style.id = "japanoffer-i18n-style";
    style.textContent = `
      .locale-picker {
        flex: 0 0 auto;
        display: inline-flex;
        align-items: center;
        margin-left: 8px;
      }

      .locale-picker select {
        width: 82px;
        height: 34px;
        border-radius: 999px;
        border: 1px solid rgba(16, 24, 40, 0.12);
        background: rgba(255, 255, 255, 0.86);
        color: #344054;
        font-size: 12px;
        font-weight: 850;
        padding: 0 8px;
        outline: none;
        cursor: pointer;
        box-shadow: 0 10px 25px rgba(16, 24, 40, 0.08);
      }

      body[data-lang="ja"] .hero-lede,
      body[data-lang="zh"] .hero-lede {
        letter-spacing: normal;
      }

      @media (max-width: 920px) {
        .locale-picker {
          order: 9;
          margin-left: 0;
        }

        .locale-picker select {
          width: 78px;
        }
      }
    `;
    document.head.appendChild(style);
  }

  function setupLanguageSelector() {
    const select = document.getElementById("languageSelect");

    if (!select) return;

    select.addEventListener("change", () => {
      setLanguage(select.value);
    });
  }

  function setupSearchBridge() {
    function goToSearch(query) {
      const q = String(query || "").trim() || "legal compliance";
      window.location.href = "jobs-search.html?q=" + encodeURIComponent(q);
    }

    const topSearchForm = document.getElementById("topSearchForm");
    const topInput = topSearchForm ? topSearchForm.querySelector("input") : null;

    if (topSearchForm && topInput) {
      topSearchForm.addEventListener("submit", (event) => {
        event.preventDefault();
        goToSearch(topInput.value);
      });
    }

    const heroButton = document.querySelector(".premium-search-button");
    const heroInputs = document.querySelectorAll(".premium-search-row input");

    function buildHeroQuery() {
      const values = Array.from(heroInputs).map((input) => input.value.trim()).filter(Boolean);
      return values.join(" ");
    }

    if (heroButton) {
      heroButton.addEventListener("click", (event) => {
        event.preventDefault();
        goToSearch(buildHeroQuery());
      });
    }

    heroInputs.forEach((input) => {
      input.addEventListener("keydown", (event) => {
        if (event.key === "Enter") {
          event.preventDefault();
          goToSearch(buildHeroQuery());
        }
      });
    });

    document.querySelectorAll(".quick-tags [data-query]").forEach((tag) => {
      tag.style.cursor = "pointer";
      tag.addEventListener("click", () => goToSearch(tag.dataset.query));
    });
  }

  function setupAuthLanguageSync() {
    const observer = new MutationObserver(() => {
      const lang = getLanguage();
      const t = translations[lang] || translations[DEFAULT_LANG];

      document.querySelectorAll("a, button").forEach((el) => {
        const text = (el.textContent || "").trim();

        if (["Sign in", "登录", "ログイン"].includes(text)) el.textContent = t.auth.signIn;
        if (["Sign up", "注册", "登録"].includes(text)) el.textContent = t.auth.signUp;
        if (["Log out", "退出登录", "ログアウト"].includes(text)) el.textContent = t.auth.logOut;
      });
    });

    observer.observe(document.body, { childList: true, subtree: true });
  }

  function boot() {
    injectStyles();
    setupLanguageSelector();
    setupSearchBridge();
    setupAuthLanguageSync();
    applyTranslations(getLanguage());
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", boot);
  } else {
    boot();
  }
})();
