// JapanOffer AI language switcher
(function () {
  const KEY = "japanoffer_lang";

  const copy = {
    en: {
      brand: "Cross-border Talent Network",
      eyebrow: "AI-powered cross-border hiring network",
      h1: "Search less.",
      h1b: "Match smarter.",
      p1: "JapanOffer AI helps cross-border talent and overseas employers find better matches through structured role fit, language fit, visa risk and career direction scoring.",
      p2: "Search fewer roles. Apply with more precision. JapanOffer AI helps you decide which cross-border opportunities are truly worth applying for first.",
      jobs: "Jobs",
      network: "Network",
      report: "Report",
      companies: "Companies",
      feedback: "Feedback",
      findJobs: "Find jobs",
      findTalent: "Find talent",
      exploreCompanies: "Explore companies",
      role: "Role, skill or background",
      market: "Target market",
      searchJobs: "Search jobs",
      entry: "Entry-level",
      visa: "Visa-aware",
      lang: "English + Japanese",
      legal: "Legal / Compliance",
      reportZh: "中文版：生成 AI 匹配报告",
      reportEn: "English Auto Report",
      feedbackSurvey: "反馈问卷",
      topPlaceholder: "Search UK legal, Singapore compliance, Japan legal, Hong Kong AML..."
    },
    zh: {
      brand: "跨境人才匹配网络",
      eyebrow: "AI 驱动的跨境求职与招聘网络",
      h1: "少一点海投。",
      h1b: "多一点精准匹配。",
      p1: "JapanOffer AI 通过岗位匹配、语言匹配、签证风险和职业方向评分，帮助跨境求职者和海外雇主找到更合适的机会。",
      p2: "不只是告诉你有哪些岗位，而是帮你判断哪些跨境机会真正值得优先申请。",
      jobs: "岗位",
      network: "网络",
      report: "报告",
      companies: "企业",
      feedback: "反馈",
      findJobs: "找岗位",
      findTalent: "找人才",
      exploreCompanies: "探索企业",
      role: "岗位、技能或背景",
      market: "目标市场",
      searchJobs: "搜索岗位",
      entry: "入门级",
      visa: "签证友好",
      lang: "英语 + 日语",
      legal: "法律 / 合规",
      reportZh: "中文版：生成 AI 匹配报告",
      reportEn: "英文自动报告",
      feedbackSurvey: "反馈问卷",
      topPlaceholder: "搜索英国法律、新加坡合规、日本法务、香港 AML..."
    },
    ja: {
      brand: "クロスボーダー人材マッチングネットワーク",
      eyebrow: "AI を活用したクロスボーダー採用ネットワーク",
      h1: "探す時間を減らし、",
      h1b: "より精度の高いマッチングへ。",
      p1: "JapanOffer AI は、職種適性、語学力、ビザリスク、キャリア方向性をもとに、海外人材と企業のより良いマッチングを支援します。",
      p2: "求人を並べるだけでなく、どの海外求人に優先して応募すべきかを判断できるようにします。",
      jobs: "求人",
      network: "ネットワーク",
      report: "レポート",
      companies: "企業",
      feedback: "フィードバック",
      findJobs: "求人を探す",
      findTalent: "人材を探す",
      exploreCompanies: "企業を見る",
      role: "職種・スキル・バックグラウンド",
      market: "対象マーケット",
      searchJobs: "求人を検索",
      entry: "未経験・初級",
      visa: "ビザ考慮",
      lang: "英語 + 日本語",
      legal: "法務 / コンプライアンス",
      reportZh: "中国語版 AI マッチングレポート",
      reportEn: "英語版レポート",
      feedbackSurvey: "フィードバック",
      topPlaceholder: "英国 法務、シンガポール コンプライアンス、日本 法務、香港 AML を検索..."
    }
  };

  function setTextByCandidates(candidates, value) {
    document.querySelectorAll("a,button,span,p,label,small,strong").forEach(function (el) {
      const t = (el.textContent || "").trim();
      if (candidates.includes(t)) el.textContent = value;
    });
  }

  function apply(lang) {
    const c = copy[lang] || copy.en;
    document.documentElement.lang = lang === "zh" ? "zh-CN" : lang;

    const brandSmall = document.querySelector(".brand small, header small");
    if (brandSmall) brandSmall.textContent = c.brand;

    const eyebrow = document.querySelector("main .eyebrow, .hero .eyebrow, .premium-hero .eyebrow");
    if (eyebrow) eyebrow.textContent = c.eyebrow;

    const h1 = document.querySelector("main h1, .hero h1, .premium-hero h1");
    if (h1) h1.innerHTML = c.h1 + "<span>" + c.h1b + "</span>";

    const lead = document.querySelector(".lead");
    if (lead) lead.textContent = c.p1;

    const leadCn = document.querySelector(".lead-cn");
    if (leadCn) leadCn.textContent = c.p2;

    setTextByCandidates(["Network","网络","ネットワーク"], c.network);
    setTextByCandidates(["Jobs","岗位","求人"], c.jobs);
    setTextByCandidates(["Report","报告","レポート"], c.report);
    setTextByCandidates(["Companies","企业","企業"], c.companies);
    setTextByCandidates(["Feedback","反馈","フィードバック"], c.feedback);

    setTextByCandidates(["Find jobs","找岗位","求人を探す"], c.findJobs);
    setTextByCandidates(["Find talent","找人才","人材を探す"], c.findTalent);
    setTextByCandidates(["Explore companies","探索企业","企業を見る"], c.exploreCompanies);
    setTextByCandidates(["Role, skill or background","岗位、技能或背景","職種・スキル・バックグラウンド"], c.role);
    setTextByCandidates(["Target market","目标市场","対象マーケット"], c.market);
    setTextByCandidates(["Search jobs","搜索岗位","求人を検索"], c.searchJobs);

    setTextByCandidates(["Entry-level","入门级","未経験・初級"], c.entry);
    setTextByCandidates(["Visa-aware","签证友好","ビザ考慮"], c.visa);
    setTextByCandidates(["English + Japanese","英语 + 日语","英語 + 日本語"], c.lang);
    setTextByCandidates(["Legal / Compliance","法律 / 合规","法務 / コンプライアンス"], c.legal);
    setTextByCandidates(["中文版：生成 AI 匹配报告","中国語版 AI マッチングレポート"], c.reportZh);
    setTextByCandidates(["English Auto Report","英文自动报告","英語版レポート"], c.reportEn);
    setTextByCandidates(["反馈问卷","Feedback survey","フィードバック"], c.feedbackSurvey);

    document.querySelectorAll(".top-search input").forEach(function(input){ input.placeholder = c.topPlaceholder; });

    document.querySelectorAll("[data-lang-option]").forEach(function(btn){
      btn.classList.toggle("active", btn.dataset.langOption === lang);
    });
  }

  function create() {
    if (document.querySelector(".jo-lang-switcher")) return;

    const box = document.createElement("div");
    box.className = "jo-lang-switcher";
    box.innerHTML = '<button data-lang-option="en">EN</button><button data-lang-option="zh">中文</button><button data-lang-option="ja">日本語</button>';

    const nav = document.querySelector(".links, .nav-links, header nav");
    if (nav) nav.appendChild(box);
    else {
      document.body.appendChild(box);
      box.classList.add("floating");
    }

    box.querySelectorAll("button").forEach(function(btn){
      btn.addEventListener("click", function(){
        localStorage.setItem(KEY, btn.dataset.langOption);
        apply(btn.dataset.langOption);
      });
    });
  }

  function style() {
    if (document.getElementById("jo-lang-style")) return;
    const s = document.createElement("style");
    s.id = "jo-lang-style";
    s.textContent = ".jo-lang-switcher{display:inline-flex;align-items:center;gap:4px;padding:4px;border-radius:999px;background:rgba(255,255,255,.75);border:1px solid rgba(16,24,40,.12);box-shadow:0 10px 25px rgba(16,24,40,.08);backdrop-filter:blur(16px)}.jo-lang-switcher.floating{position:fixed;right:18px;top:18px;z-index:9999}.jo-lang-switcher button{border:0;padding:7px 9px;border-radius:999px;background:transparent;color:#344054;font-size:12px;font-weight:850;cursor:pointer;white-space:nowrap}.jo-lang-switcher button.active{background:#1f57c8;color:#fff}@media(max-width:800px){.jo-lang-switcher{order:99}}";
    document.head.appendChild(s);
  }

  function boot() {
    style();
    create();
    apply(localStorage.getItem(KEY) || "en");
  }

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", boot);
  else boot();
})();
