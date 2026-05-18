// JapanOffer AI multilingual switcher v2
(function () {
  const KEY = "japanoffer_lang";

  const dictionary = {
    en: {
      brandSub: "Cross-border Talent Network",
      eyebrow: "AI-powered cross-border hiring network",
      title: "Search less.",
      titleAccent: "Match smarter.",
      lead1: "JapanOffer AI helps cross-border talent and overseas employers find better matches through structured role fit, language fit, visa risk and career direction scoring.",
      lead2: "Search fewer roles. Apply with more precision. JapanOffer AI helps you decide which cross-border opportunities are truly worth applying for first.",
      navNetwork: "Network",
      navJobs: "Jobs",
      navReport: "Report",
      navCompanies: "Companies",
      navFeedback: "Feedback",
      tabJobs: "Find jobs",
      tabTalent: "Find talent",
      tabCompanies: "Explore companies",
      roleLabel: "Role, skill or background",
      marketLabel: "Target market",
      searchButton: "Search jobs",
      chipEntry: "Entry-level",
      chipVisa: "Visa-aware",
      chipLanguage: "English + Japanese",
      chipLegal: "Legal / Compliance",
      reportZh: "Chinese AI Match Report",
      reportEn: "English Auto Report",
      feedback: "Feedback",
      talentMatch: "Talent Match OS",
      liveBeta: "Live beta",
      matches: "Matches",
      talent: "Talent",
      roles: "Roles",
      companiesSide: "Companies",
      card1Title: "Legal Compliance Analyst",
      card1Meta: "Tokyo · Entry level · English and Japanese preferred",
      strongFit: "Strong education fit",
      mediumRisk: "Medium visa risk",
      applyFirst: "Apply first",
      card2Title: "Cross-border Business Associate",
      card2Meta: "Singapore · International team · Mandarin useful",
      goodLang: "Good language fit",
      lowerRisk: "Lower visa risk",
      candidateTitle: "Candidate profile",
      candidateMeta: "LLB · English / Japanese / Mandarin · Compliance target",
      viewProfile: "View profile",
      topPlaceholder: "Search UK legal, Singapore compliance, Japan legal, Hong Kong AML..."
    },
    zh: {
      brandSub: "跨境人才匹配网络",
      eyebrow: "AI 驱动的跨境求职与招聘网络",
      title: "少一点海投。",
      titleAccent: "多一点精准匹配。",
      lead1: "JapanOffer AI 通过岗位匹配、语言匹配、签证风险和职业方向评分，帮助跨境求职者和海外雇主找到更合适的机会。",
      lead2: "它不只是告诉你有哪些岗位，而是帮你判断哪些跨境机会真正值得优先申请。",
      navNetwork: "网络",
      navJobs: "岗位",
      navReport: "报告",
      navCompanies: "企业",
      navFeedback: "反馈",
      tabJobs: "找岗位",
      tabTalent: "找人才",
      tabCompanies: "探索企业",
      roleLabel: "岗位、技能或背景",
      marketLabel: "目标市场",
      searchButton: "搜索岗位",
      chipEntry: "入门级",
      chipVisa: "签证友好",
      chipLanguage: "英语 + 日语",
      chipLegal: "法律 / 合规",
      reportZh: "中文版：生成 AI 匹配报告",
      reportEn: "英文自动报告",
      feedback: "反馈问卷",
      talentMatch: "人才匹配系统",
      liveBeta: "测试版",
      matches: "匹配",
      talent: "人才",
      roles: "岗位",
      companiesSide: "企业",
      card1Title: "法务合规分析师",
      card1Meta: "东京 · 入门级 · 英语和日语优先",
      strongFit: "教育背景匹配度高",
      mediumRisk: "中等签证风险",
      applyFirst: "优先申请",
      card2Title: "跨境商务助理",
      card2Meta: "新加坡 · 国际团队 · 中文有优势",
      goodLang: "语言匹配较好",
      lowerRisk: "签证风险较低",
      candidateTitle: "候选人档案",
      candidateMeta: "LLB · 英语 / 日语 / 中文 · 合规方向",
      viewProfile: "查看档案",
      topPlaceholder: "搜索英国法律、新加坡合规、日本法务、香港 AML..."
    },
    ja: {
      brandSub: "クロスボーダー人材マッチングネットワーク",
      eyebrow: "AI を活用したクロスボーダー採用ネットワーク",
      title: "探す時間を減らし、",
      titleAccent: "より精度の高いマッチングへ。",
      lead1: "JapanOffer AI は、職種適性、語学力、ビザリスク、キャリア方向性をもとに、海外人材と企業のより良いマッチングを支援します。",
      lead2: "求人を並べるだけでなく、どの海外求人に優先して応募すべきかを判断できるようにします。",
      navNetwork: "ネットワーク",
      navJobs: "求人",
      navReport: "レポート",
      navCompanies: "企業",
      navFeedback: "フィードバック",
      tabJobs: "求人を探す",
      tabTalent: "人材を探す",
      tabCompanies: "企業を見る",
      roleLabel: "職種・スキル・バックグラウンド",
      marketLabel: "対象マーケット",
      searchButton: "求人を検索",
      chipEntry: "未経験・初級",
      chipVisa: "ビザ考慮",
      chipLanguage: "英語 + 日本語",
      chipLegal: "法務 / コンプライアンス",
      reportZh: "中国語版 AI マッチングレポート",
      reportEn: "英語版レポート",
      feedback: "フィードバック",
      talentMatch: "Talent Match OS",
      liveBeta: "ベータ版",
      matches: "マッチ",
      talent: "人材",
      roles: "求人",
      companiesSide: "企業",
      card1Title: "法務コンプライアンスアナリスト",
      card1Meta: "東京 · エントリーレベル · 英語・日本語歓迎",
      strongFit: "学歴との相性が高い",
      mediumRisk: "中程度のビザリスク",
      applyFirst: "優先応募",
      card2Title: "クロスボーダービジネスアソシエイト",
      card2Meta: "シンガポール · 国際チーム · 中国語歓迎",
      goodLang: "語学力との相性が良い",
      lowerRisk: "ビザリスク低め",
      candidateTitle: "候補者プロフィール",
      candidateMeta: "LLB · 英語 / 日本語 / 中国語 · コンプライアンス志向",
      viewProfile: "プロフィールを見る",
      topPlaceholder: "英国 法務、シンガポール コンプライアンス、日本 法務、香港 AML を検索..."
    }
  };

  const textGroups = [
    ["Network", "网络", "ネットワーク", "navNetwork"],
    ["Jobs", "岗位", "求人", "navJobs"],
    ["Report", "报告", "レポート", "navReport"],
    ["Companies", "企业", "企業", "navCompanies"],
    ["Feedback", "反馈", "フィードバック", "navFeedback"],
    ["Find jobs", "找岗位", "求人を探す", "tabJobs"],
    ["Find talent", "找人才", "人材を探す", "tabTalent"],
    ["Explore companies", "探索企业", "企業を見る", "tabCompanies"],
    ["Role, skill or background", "岗位、技能或背景", "職種・スキル・バックグラウンド", "roleLabel"],
    ["Target market", "目标市场", "対象マーケット", "marketLabel"],
    ["Search jobs", "搜索岗位", "求人を検索", "searchButton"],
    ["Entry-level", "入门级", "未経験・初級", "chipEntry"],
    ["Visa-aware", "签证友好", "ビザ考慮", "chipVisa"],
    ["English + Japanese", "英语 + 日语", "英語 + 日本語", "chipLanguage"],
    ["Legal / Compliance", "法律 / 合规", "法務 / コンプライアンス", "chipLegal"],
    ["中文版：生成 AI 匹配报告", "Chinese AI Match Report", "中国語版 AI マッチングレポート", "reportZh"],
    ["English Auto Report", "英文自动报告", "英語版レポート", "reportEn"],
    ["反馈问卷", "Feedback", "Feedback survey", "フィードバック", "feedback"],
    ["Talent Match OS", "人才匹配系统", "talentMatch"],
    ["Live beta", "测试版", "ベータ版", "liveBeta"],
    ["Matches", "匹配", "マッチ", "matches"],
    ["Talent", "人才", "人材", "talent"],
    ["Roles", "岗位", "求人", "roles"],
    ["Legal Compliance Analyst", "法务合规分析师", "法務コンプライアンスアナリスト", "card1Title"],
    ["Tokyo · Entry level · English and Japanese preferred", "东京 · 入门级 · 英语和日语优先", "東京 · エントリーレベル · 英語・日本語歓迎", "card1Meta"],
    ["Strong education fit", "教育背景匹配度高", "学歴との相性が高い", "strongFit"],
    ["Medium visa risk", "中等签证风险", "中程度のビザリスク", "mediumRisk"],
    ["Apply first", "优先申请", "優先応募", "applyFirst"],
    ["Cross-border Business Associate", "跨境商务助理", "クロスボーダービジネスアソシエイト", "card2Title"],
    ["Singapore · International team · Mandarin useful", "新加坡 · 国际团队 · 中文有优势", "シンガポール · 国際チーム · 中国語歓迎", "card2Meta"],
    ["Good language fit", "语言匹配较好", "語学力との相性が良い", "goodLang"],
    ["Lower visa risk", "签证风险较低", "ビザリスク低め", "lowerRisk"],
    ["Candidate profile", "候选人档案", "候補者プロフィール", "candidateTitle"],
    ["LLB · English / Japanese / Mandarin · Compliance target", "LLB · 英语 / 日语 / 中文 · 合规方向", "LLB · 英語 / 日本語 / 中国語 · コンプライアンス志向", "candidateMeta"],
    ["View profile", "查看档案", "プロフィールを見る", "viewProfile"]
  ];

  function getLang() {
    return localStorage.getItem(KEY) || "en";
  }

  function saveLang(lang) {
    localStorage.setItem(KEY, lang);
  }

  function setExactText(candidates, value) {
    const nodes = document.querySelectorAll("a, button, span, p, label, small, strong, h2, h3");
    nodes.forEach((el) => {
      const current = (el.textContent || "").trim();
      if (candidates.includes(current)) {
        el.textContent = value;
      }
    });
  }

  function applyLang(lang) {
    const c = dictionary[lang] || dictionary.en;
    document.documentElement.lang = lang === "zh" ? "zh-CN" : lang;

    const brandSmall = document.querySelector(".brand small, header small");
    if (brandSmall) brandSmall.textContent = c.brandSub;

    const eyebrow = document.querySelector("main .eyebrow, .hero .eyebrow, .premium-hero .eyebrow");
    if (eyebrow) eyebrow.textContent = c.eyebrow;

    const h1 = document.querySelector("main h1, .hero h1, .premium-hero h1");
    if (h1) h1.innerHTML = `${c.title}<span>${c.titleAccent}</span>`;

    const paragraphs = Array.from(document.querySelectorAll("main p, .hero p, .premium-hero p"));
    paragraphs.forEach((p) => {
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
        t.includes("求人を並べるだけでなく")
      ) {
        p.textContent = c.lead2;
      }
    });

    textGroups.forEach((group) => {
      const key = group[group.length - 1];
      const candidates = group.slice(0, -1);
      setExactText(candidates, c[key]);
    });

    document.querySelectorAll(".top-search input").forEach((input) => {
      input.placeholder = c.topPlaceholder;
    });

    document.querySelectorAll("[data-lang-option]").forEach((btn) => {
      btn.classList.toggle("active", btn.dataset.langOption === lang);
    });
  }

  function addStyle() {
    if (document.getElementById("jo-lang-style")) return;

    const style = document.createElement("style");
    style.id = "jo-lang-style";
    style.textContent = `
      .jo-lang-switcher {
        display: inline-flex;
        align-items: center;
        gap: 4px;
        padding: 4px;
        border-radius: 999px;
        background: rgba(255, 255, 255, 0.75);
        border: 1px solid rgba(16, 24, 40, 0.12);
        box-shadow: 0 10px 25px rgba(16, 24, 40, 0.08);
        backdrop-filter: blur(16px);
      }

      .jo-lang-switcher.floating {
        position: fixed;
        right: 18px;
        top: 18px;
        z-index: 9999;
      }

      .jo-lang-switcher button {
        border: 0;
        padding: 7px 9px;
        border-radius: 999px;
        background: transparent;
        color: #344054;
        font-size: 12px;
        font-weight: 850;
        cursor: pointer;
        white-space: nowrap;
      }

      .jo-lang-switcher button.active {
        background: #1f57c8;
        color: #fff;
      }

      @media (max-width: 800px) {
        .jo-lang-switcher {
          order: 99;
        }
      }
    `;

    document.head.appendChild(style);
  }

  function createSwitcher() {
    if (document.querySelector(".jo-lang-switcher")) return;

    const box = document.createElement("div");
    box.className = "jo-lang-switcher";
    box.innerHTML = `
      <button type="button" data-lang-option="en">EN</button>
      <button type="button" data-lang-option="zh">中文</button>
      <button type="button" data-lang-option="ja">日本語</button>
    `;

    const nav = document.querySelector(".links, .nav-links, header nav");
    if (nav) {
      nav.appendChild(box);
    } else {
      document.body.appendChild(box);
      box.classList.add("floating");
    }

    box.querySelectorAll("[data-lang-option]").forEach((btn) => {
      btn.addEventListener("click", () => {
        const lang = btn.dataset.langOption;
        saveLang(lang);
        applyLang(lang);
      });
    });
  }

  function boot() {
    addStyle();
    createSwitcher();
    applyLang(getLang());
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", boot);
  } else {
    boot();
  }
})();
