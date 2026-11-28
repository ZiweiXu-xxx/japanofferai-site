// JapanOffer AI jobs page language.
// The jobs page used to be hardcoded Chinese while the homepage opened in
// English. It now follows the shared language (window.JOLang) and translates
// its own chrome via data-i18n attributes. Job descriptions themselves stay
// in their authored language (Chinese) — translating the job library is a
// separate content task.

(function () {
  var dict = {
    en: {
      "nav.home": "Home",
      "nav.network": "Network",
      "nav.jobs": "Jobs",
      "nav.applications": "Applications",
      "nav.match": "Match",
      "nav.companies": "Companies",
      "nav.profile": "My profile",
      "search.placeholder": "Search jobs, companies, countries or skills",
      "hero.title": "Not just browsing jobs.<span>Know which one to apply to first.</span>",
      "hero.copy": "JapanOffer AI reads your profile and CV, then re-ranks the job library by fit. Save roles and generate application reasons, cover letter direction and CV suggestions.",
      "hero.rank": "Re-rank with my Profile / CV",
      "hero.upload": "Upload or update CV",
      "hero.note": "The current job library is an MVP set of curated role targets, used to validate matching logic and user behaviour. Real ATS / API / manual job publishing can be added later.",
      "profile.title": "Your match profile",
      "profile.copy": "After you sign in, the system reads your profile and CV records. The more complete your profile, the more accurate the ranking.",
      "profile.auth": "Sign-in status",
      "profile.career": "Direction",
      "profile.market": "Target market",
      "profile.languages": "Languages",
      "profile.cv": "CV",
      "profile.checking": "Checking your account…",
      "filter.market": "Target market",
      "filter.allMarkets": "All markets",
      "filter.category": "Direction",
      "filter.allCategories": "All directions",
      "filter.catLegal": "Legal / Compliance",
      "filter.catFinance": "Finance / AML",
      "filter.catWeb3": "Web3 / Risk",
      "filter.catBusiness": "Business / Strategy",
      "filter.catData": "Data / Operations",
      "filter.language": "Language",
      "filter.allLanguages": "All languages",
      "filter.sort": "Sort by",
      "filter.sortMatch": "Best match",
      "filter.sortVisa": "Visa-friendly first",
      "filter.sortEntry": "Entry-level first",
      "filter.sortMarket": "Target market first",
      "filter.remote": "Remote",
      "filter.allRemote": "All roles",
      "filter.remoteOnly": "Remote-friendly only",
      "filter.onSiteOnly": "On-site only",
      "filter.visaRisk": "Visa risk",
      "filter.allVisa": "Any visa risk",
      "filter.visaFriendly": "Lower visa risk (score 70+)",
      "filter.visaHigher": "Higher visa risk (score under 60)",
      "section.recommended": "Recommended jobs",
      "section.recommendedCopy": "The score is not an offer probability — it is an application priority. 70+ is worth researching first; around 60 is a direction to explore.",
      "section.saved": "Saved jobs",
      "section.savedCopy": "Saved jobs go into your account records after you sign in, so you can keep working on application materials later.",
      "section.savedEmpty": "No saved jobs yet.",
      "section.apply": "Application hub",
      "section.applyCopy": "This page only recommends and saves jobs. Real cover letters, CV direction and application tracking all live in the application hub, keeping this page clean.",
      "section.applyCenter": "Open application hub",
      "section.applyHint": "Click “Apply” on a job: the system saves it first, then takes you to the application hub."
    },
    zh: {
      "nav.home": "首页",
      "nav.network": "人脉",
      "nav.jobs": "职位",
      "nav.applications": "申请",
      "nav.match": "匹配",
      "nav.companies": "公司",
      "nav.profile": "我的主页",
      "search.placeholder": "搜索岗位、公司、国家或技能",
      "hero.title": "不只是看岗位。<span>而是知道先投哪一个。</span>",
      "hero.copy": "JapanOffer AI 会读取你的个人主页和 CV 记录，把职位库里的岗位按适配度重新排序。用户可以保存岗位，并生成申请理由、Cover Letter 方向和 CV 修改建议。",
      "hero.rank": "用我的 Profile / CV 重新排序",
      "hero.upload": "上传或更新 CV",
      "hero.note": "当前职位库是 MVP curated role targets，用来验证匹配逻辑和用户行为。之后可以接入真实 ATS / API / 手动后台职位发布。",
      "profile.title": "你的匹配资料",
      "profile.copy": "登录后系统会读取你的个人主页和 CV 文件记录。资料越完整，推荐排序越准确。",
      "profile.auth": "登录状态",
      "profile.career": "方向",
      "profile.market": "目标市场",
      "profile.languages": "语言",
      "profile.cv": "CV",
      "profile.checking": "正在检查你的账号资料...",
      "filter.market": "目标市场",
      "filter.allMarkets": "全部市场",
      "filter.category": "职业方向",
      "filter.allCategories": "全部方向",
      "filter.catLegal": "法律 / 合规",
      "filter.catFinance": "金融 / AML",
      "filter.catWeb3": "Web3 / 风控",
      "filter.catBusiness": "商务 / 战略",
      "filter.catData": "数据 / 运营",
      "filter.language": "语言要求",
      "filter.allLanguages": "全部语言",
      "filter.sort": "排序方式",
      "filter.sortMatch": "按匹配度",
      "filter.sortVisa": "签证友好优先",
      "filter.sortEntry": "Entry-level 优先",
      "filter.sortMarket": "目标市场优先",
      "filter.remote": "远程",
      "filter.allRemote": "全部",
      "filter.remoteOnly": "仅支持远程",
      "filter.onSiteOnly": "仅线下办公",
      "filter.visaRisk": "签证风险",
      "filter.allVisa": "不限签证风险",
      "filter.visaFriendly": "签证风险较低（70 分以上）",
      "filter.visaHigher": "签证风险较高（60 分以下）",
      "section.recommended": "推荐岗位",
      "section.recommendedCopy": "分数不是录取概率，而是申请优先级。70+ 可以优先研究，60 左右适合作为探索方向。",
      "section.saved": "已保存岗位",
      "section.savedCopy": "登录后保存的岗位会进入账号记录，之后可以继续做申请材料。",
      "section.savedEmpty": "还没有保存岗位。",
      "section.apply": "申请中心",
      "section.applyCopy": "职位页只负责推荐和保存岗位。真正的 Cover Letter、CV 修改方向和申请状态追踪，全部放到申请中心，页面会更清爽。",
      "section.applyCenter": "进入申请中心",
      "section.applyHint": "点击某个岗位的“进入申请”，系统会先保存岗位，然后跳转到申请中心。"
    },
    ja: {
      "nav.home": "ホーム",
      "nav.network": "ネットワーク",
      "nav.jobs": "求人",
      "nav.applications": "応募",
      "nav.match": "マッチ",
      "nav.companies": "企業",
      "nav.profile": "マイページ",
      "search.placeholder": "求人、企業、国、スキルを検索",
      "hero.title": "求人を見るだけじゃない。<span>まず応募すべき求人がわかる。</span>",
      "hero.copy": "JapanOffer AI はプロフィールと CV を読み、求人ライブラリを適性順に並べ替えます。求人を保存し、応募理由、カバーレターの方向性、CV の改善提案を生成できます。",
      "hero.rank": "Profile / CV で並べ替え",
      "hero.upload": "CV をアップロード・更新",
      "hero.note": "現在の求人ライブラリは、検証用の厳選された求人セットです。後で実際の ATS / API / 手動掲載を追加できます。",
      "profile.title": "あなたのマッチング情報",
      "profile.copy": "ログイン後、プロフィールと CV を読み取ります。情報が充実するほど、並べ替えの精度が上がります。",
      "profile.auth": "ログイン状態",
      "profile.career": "志望方向",
      "profile.market": "対象市場",
      "profile.languages": "言語",
      "profile.cv": "CV",
      "profile.checking": "アカウント情報を確認中…",
      "filter.market": "対象市場",
      "filter.allMarkets": "すべての市場",
      "filter.category": "職種",
      "filter.allCategories": "すべて",
      "filter.catLegal": "法務 / コンプライアンス",
      "filter.catFinance": "金融 / AML",
      "filter.catWeb3": "Web3 / リスク",
      "filter.catBusiness": "ビジネス / 戦略",
      "filter.catData": "データ / オペレーション",
      "filter.language": "言語",
      "filter.allLanguages": "すべての言語",
      "filter.sort": "並べ替え",
      "filter.sortMatch": "マッチ度順",
      "filter.sortVisa": "ビザ配慮優先",
      "filter.sortEntry": "未経験歓迎優先",
      "filter.sortMarket": "対象市場優先",
      "filter.remote": "リモート",
      "filter.allRemote": "すべて",
      "filter.remoteOnly": "リモート可のみ",
      "filter.onSiteOnly": "出社のみ",
      "filter.visaRisk": "ビザリスク",
      "filter.allVisa": "すべて",
      "filter.visaFriendly": "ビザリスク低め（70点以上）",
      "filter.visaHigher": "ビザリスク高め（60点未満）",
      "section.recommended": "おすすめ求人",
      "section.recommendedCopy": "スコアは内定確率ではなく応募の優先度です。70以上は優先的に検討し、60前後は探索対象です。",
      "section.saved": "保存した求人",
      "section.savedCopy": "ログイン後に保存した求人はアカウントに記録され、後で応募書類の準備を続けられます。",
      "section.savedEmpty": "まだ保存した求人はありません。",
      "section.apply": "応募ハブ",
      "section.applyCopy": "このページは求人の推薦と保存のみを行います。カバーレターや CV の方向性、応募状況は応募ハブで管理します。",
      "section.applyCenter": "応募ハブを開く",
      "section.applyHint": "求人の「応募する」をクリックすると、まず保存してから応募ハブへ移動します。"
    }
  };

  function lang() {
    if (window.JOLang) return window.JOLang.get();
    return localStorage.getItem("japanoffer_lang") || "en";
  }

  function apply() {
    var l = lang();
    var t = dict[l] || dict.en;
    document.documentElement.lang = l === "zh" ? "zh-CN" : l;
    document.querySelectorAll("[data-i18n]").forEach(function (el) {
      var v = t[el.dataset.i18n];
      if (v !== undefined) el.textContent = v;
    });
    document.querySelectorAll("[data-i18n-html]").forEach(function (el) {
      var v = t[el.dataset.i18nHtml];
      if (v !== undefined) el.innerHTML = v;
    });
    document.querySelectorAll("[data-i18n-placeholder]").forEach(function (el) {
      var v = t[el.dataset.i18nPlaceholder];
      if (v !== undefined) el.setAttribute("placeholder", v);
    });
  }

  window.JOJobsLang = { apply: apply };

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", apply);
  } else {
    apply();
  }
  window.addEventListener("japanoffer:languagechange", apply);
  window.addEventListener("storage", apply);
  setTimeout(apply, 300);
  setTimeout(apply, 1000);
})();
