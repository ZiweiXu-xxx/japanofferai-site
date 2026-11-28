// JapanOffer AI profile page language.
// The profile page used to be hardcoded Chinese while the homepage opened in
// English. It now follows the shared language (window.JOLang) and translates
// its own chrome via data-i18n attributes, plus the dynamic strings in
// profile.js via window.JOProfileLang.t().
// Values stored in the database (market / direction) stay in Chinese; only
// their display text is translated.
(function () {
  var dict = {
    en: {
      "brand.small": "Personal Career Profile",
      "search.placeholder": "Search jobs, companies, people or markets",
      "nav.home": "Home",
      "nav.network": "Network",
      "nav.jobs": "Jobs",
      "nav.match": "AI Match",
      "nav.companies": "Companies",
      "nav.profile": "My profile",
      "hero.eyebrow": "Personal profile",
      "hero.title": "Save your profile.<span>Use it for every application.</span>",
      "hero.copy": "Once you sign up, you can save your profile, target markets, career direction and CV here. Later, when you apply for roles, generate AI match reports or contact employers, you can reuse this same profile.",
      "hero.match": "Match jobs with my profile",
      "hero.jobs": "Browse jobs",
      "upload.title": "Upload CV / Resume",
      "upload.copy": "PDF, DOC and DOCX supported. Once you sign in, the file is saved to your account and will not disappear when you refresh the page.",
      "auth.checking": "Checking your sign-in status…",
      "auth.checkingCopy": "If you are not signed in, please sign up or sign in first, then upload your CV.",
      "drop.title": "Click here to choose a file",
      "drop.copy": "Suggested maximum 5MB. The file is saved to Supabase Storage.",
      "cv.empty": "No CV uploaded yet",
      "cv.emptyMeta": "The file name and upload time will show here after uploading.",
      "cv.open": "Open CV",
      "cv.delete": "Delete CV",
      "panel.profile": "Your profile",
      "panel.profileCopy": "This becomes the base of your personal profile. Save it as an MVP now; it can later become a public or private profile.",
      "field.name": "Full name",
      "field.namePh": "Example: Ziwei Xu",
      "field.headline": "Current status",
      "field.headlinePh": "Example: LLB student · Legal / Compliance target",
      "field.market": "Target market",
      "field.marketSelect": "Please select",
      "market.japan": "Japan",
      "market.hongkong": "Hong Kong",
      "market.singapore": "Singapore",
      "market.uk": "United Kingdom",
      "market.multi": "Multiple markets",
      "field.career": "Career direction",
      "career.legal": "Legal / Compliance",
      "career.finance": "Finance / Compliance",
      "career.web3": "Web3 / Finance Compliance",
      "career.business": "International business",
      "career.data": "Data / Analytics",
      "career.marketing": "Marketing / Operations",
      "field.languages": "Languages",
      "field.languagesPh": "Example: Chinese / English / Japanese",
      "field.bio": "About me",
      "field.bioPh": "Write a short note about your background, strengths and target roles.",
      "form.save": "Save profile",
      "panel.overview": "Application materials overview",
      "panel.overviewCopy": "When you apply for roles later, you can use the profile and CV saved here directly.",
      "summary.auth": "Account status",
      "summary.name": "Name",
      "summary.career": "Direction",
      "summary.market": "Market",
      "summary.languages": "Languages",
      "summary.cv": "CV",
      "summary.loggedIn": "Signed in",
      "summary.notLoggedIn": "Not signed in",
      "summary.empty": "Not filled in",
      "summary.notSelected": "Not selected",
      "summary.noCv": "Not uploaded",
      "summary.savedAt": "Saved to your account · {date}",
      "summary.justNow": "Just now",
      "overview.match": "Generate match report",
      "overview.network": "Enter the network",
      "overview.apply": "Apply with my profile",
      "status.readFail": "Failed to read your profile: {error}",
      "status.createFail": "Failed to create your profile: {error}",
      "status.needLoginSave": "Please sign in first, then save your profile.",
      "status.saving": "Saving…",
      "status.saveFail": "Save failed: {error}",
      "status.saved": "Your profile has been saved.",
      "status.needLoginUpload": "Please sign in first, then upload your CV.",
      "status.badFile": "The file format or size is not supported. Please upload a PDF, DOC or DOCX, ideally under 5MB.",
      "status.uploading": "Uploading your CV…",
      "status.uploadFail": "Upload failed: {error}",
      "status.uploadSavedFail": "Your CV was uploaded, but saving your profile failed: {error}",
      "status.uploaded": "Your CV has been uploaded and saved to your account.",
      "status.noCvOpen": "There is no CV to open yet.",
      "status.openFail": "Failed to open: {error}",
      "status.noCvDelete": "There is no CV to delete yet.",
      "status.deleteFail": "Failed to delete the record: {error}",
      "status.deleted": "Your CV has been deleted.",
      "status.cannotGenerateLink": "cannot generate a link",
      "confirm.deleteCv": "Are you sure you want to delete this CV?",
      "auth.configMissing": "Supabase configuration not found",
      "auth.configMissingCopy": "Please check that auth-config.js exists and contains the project URL and anon / publishable key.",
      "auth.notLoggedIn": "You are not signed in yet",
      "auth.notLoggedInCopy": "Please sign up or sign in first. After signing in, your CV and profile are saved to your account permanently.",
      "auth.signupLogin": "Sign up / Sign in",
      "auth.loggedIn": "Signed in",
      "auth.loggedInCopy": "{email} · Your CV is saved to this account.",
      "auth.currentAccount": "Current account",
      "auth.configMissingSummary": "Configuration missing"
    },
    zh: {
      "brand.small": "个人职业档案",
      "search.placeholder": "搜索职位、公司、人脉或目标市场",
      "nav.home": "首页",
      "nav.network": "人脉",
      "nav.jobs": "职位",
      "nav.match": "AI 匹配",
      "nav.companies": "公司",
      "nav.profile": "我的主页",
      "hero.eyebrow": "个人档案",
      "hero.title": "保存你的履历。<span>一键用于申请。</span>",
      "hero.copy": "用户注册后，可以在这里保存个人主页、目标市场、职业方向和 CV。之后申请岗位、生成 AI 匹配报告、联系企业时，都可以直接调用这份资料。",
      "hero.match": "用我的资料做 AI 匹配",
      "hero.jobs": "查看职位",
      "upload.title": "上传 CV / Resume",
      "upload.copy": "支持 PDF、DOC、DOCX。登录后文件会保存到你的账号下，不会因为刷新页面消失。",
      "auth.checking": "正在检查登录状态...",
      "auth.checkingCopy": "如果没有登录，请先注册或登录，再上传 CV。",
      "drop.title": "点击这里选择文件",
      "drop.copy": "最大建议 5MB。文件会保存到 Supabase Storage。",
      "cv.empty": "还没有上传 CV",
      "cv.emptyMeta": "上传后会显示文件名和保存时间。",
      "cv.open": "打开 CV",
      "cv.delete": "删除 CV",
      "panel.profile": "个人资料",
      "panel.profileCopy": "这里会成为用户的个人主页基础资料。先做 MVP 保存，之后可以升级成公开/私密 Profile。",
      "field.name": "姓名",
      "field.namePh": "例如：Ziwei Xu",
      "field.headline": "当前身份",
      "field.headlinePh": "例如：LLB student · Legal / Compliance target",
      "field.market": "目标市场",
      "field.marketSelect": "请选择",
      "market.japan": "日本",
      "market.hongkong": "香港",
      "market.singapore": "新加坡",
      "market.uk": "英国",
      "market.multi": "多个市场",
      "field.career": "职业方向",
      "career.legal": "法律 / 合规",
      "career.finance": "金融 / 合规",
      "career.web3": "Web3 / 金融合规",
      "career.business": "国际业务",
      "career.data": "数据 / 分析",
      "career.marketing": "市场 / 运营",
      "field.languages": "语言能力",
      "field.languagesPh": "例如：中文 / English / 日本語",
      "field.bio": "个人简介",
      "field.bioPh": "简单写一下你的背景、优势和目标岗位。",
      "form.save": "保存个人资料",
      "panel.overview": "申请资料概览",
      "panel.overviewCopy": "之后用户申请岗位时，就可以直接用这里保存的资料和 CV。",
      "summary.auth": "账号状态",
      "summary.name": "姓名",
      "summary.career": "方向",
      "summary.market": "市场",
      "summary.languages": "语言",
      "summary.cv": "CV",
      "summary.loggedIn": "已登录",
      "summary.notLoggedIn": "未登录",
      "summary.empty": "未填写",
      "summary.notSelected": "未选择",
      "summary.noCv": "未上传",
      "summary.savedAt": "已保存到你的账号 · {date}",
      "summary.justNow": "刚刚",
      "overview.match": "生成匹配报告",
      "overview.network": "进入人脉网络",
      "overview.apply": "用资料申请岗位",
      "status.readFail": "读取个人资料失败：{error}",
      "status.createFail": "创建个人资料失败：{error}",
      "status.needLoginSave": "请先登录，再保存个人资料。",
      "status.saving": "正在保存...",
      "status.saveFail": "保存失败：{error}",
      "status.saved": "个人资料已保存。",
      "status.needLoginUpload": "请先登录，再上传 CV。",
      "status.badFile": "文件格式或大小不符合要求。请上传 PDF、DOC 或 DOCX，建议不超过 5MB。",
      "status.uploading": "正在上传 CV...",
      "status.uploadFail": "上传失败：{error}",
      "status.uploadSavedFail": "CV 已上传，但保存资料失败：{error}",
      "status.uploaded": "CV 已上传并保存到你的账号。",
      "status.noCvOpen": "还没有可打开的 CV。",
      "status.openFail": "打开失败：{error}",
      "status.noCvDelete": "还没有可删除的 CV。",
      "status.deleteFail": "删除记录失败：{error}",
      "status.deleted": "CV 已删除。",
      "status.cannotGenerateLink": "无法生成链接",
      "confirm.deleteCv": "确定要删除这份 CV 吗？",
      "auth.configMissing": "Supabase 配置未读取到",
      "auth.configMissingCopy": "请检查 auth-config.js 是否存在，并且里面有项目 URL 和 anon / publishable key。",
      "auth.notLoggedIn": "你还没有登录",
      "auth.notLoggedInCopy": "请先注册或登录。登录后，CV 和个人资料才会永久保存到你的账号下。",
      "auth.signupLogin": "注册 / 登录",
      "auth.loggedIn": "已登录",
      "auth.loggedInCopy": "{email} · 你的 CV 会保存到这个账号。",
      "auth.currentAccount": "当前账号",
      "auth.configMissingSummary": "配置缺失"
    },
    ja: {
      "brand.small": "キャリアプロフィール",
      "search.placeholder": "求人、企業、人脈、市場を検索",
      "nav.home": "ホーム",
      "nav.network": "人脈",
      "nav.jobs": "求人",
      "nav.match": "AIマッチング",
      "nav.companies": "企業",
      "nav.profile": "マイページ",
      "hero.eyebrow": "プロフィール",
      "hero.title": "履歴書を保存。<span>応募にワンクリックで活用。</span>",
      "hero.copy": "登録後、プロフィール、希望する市場、職種の方向性、CV をここに保存できます。その後、求人への応募、AI マッチングレポートの作成、企業への連絡の際に、この資料をそのまま使えます。",
      "hero.match": "プロフィールで AI マッチング",
      "hero.jobs": "求人を見る",
      "upload.title": "CV / 履歴書をアップロード",
      "upload.copy": "PDF、DOC、DOCX に対応。ログイン後、ファイルはあなたのアカウントに保存され、ページを更新しても消えません。",
      "auth.checking": "ログイン状態を確認しています…",
      "auth.checkingCopy": "ログインしていない場合は、先に登録またはログインしてから CV をアップロードしてください。",
      "drop.title": "ここをクリックしてファイルを選択",
      "drop.copy": "推奨最大 5MB。ファイルは Supabase Storage に保存されます。",
      "cv.empty": "まだ CV がアップロードされていません",
      "cv.emptyMeta": "アップロード後、ファイル名と保存日時がここに表示されます。",
      "cv.open": "CV を開く",
      "cv.delete": "CV を削除",
      "panel.profile": "個人情報",
      "panel.profileCopy": "これがあなたのプロフィールの基本情報になります。まずは MVP として保存し、後で公開 / 非公開プロフィールにアップグレードできます。",
      "field.name": "氏名",
      "field.namePh": "例：Ziwei Xu",
      "field.headline": "現在のステータス",
      "field.headlinePh": "例：LLB student · Legal / Compliance target",
      "field.market": "希望する市場",
      "field.marketSelect": "選択してください",
      "market.japan": "日本",
      "market.hongkong": "香港",
      "market.singapore": "シンガポール",
      "market.uk": "英国",
      "market.multi": "複数の市場",
      "field.career": "職種の方向性",
      "career.legal": "法務 / コンプライアンス",
      "career.finance": "金融 / コンプライアンス",
      "career.web3": "Web3 / 金融コンプライアンス",
      "career.business": "国際ビジネス",
      "career.data": "データ / 分析",
      "career.marketing": "マーケティング / 運営",
      "field.languages": "言語能力",
      "field.languagesPh": "例：中国語 / English / 日本語",
      "field.bio": "自己紹介",
      "field.bioPh": "あなたの経歴、強み、希望する職種を簡単に書いてください。",
      "form.save": "プロフィールを保存",
      "panel.overview": "応募資料の概要",
      "panel.overviewCopy": "後で求人に応募する際、ここに保存した資料と CV をそのまま使えます。",
      "summary.auth": "アカウント状態",
      "summary.name": "氏名",
      "summary.career": "方向性",
      "summary.market": "市場",
      "summary.languages": "言語",
      "summary.cv": "CV",
      "summary.loggedIn": "ログイン済み",
      "summary.notLoggedIn": "未ログイン",
      "summary.empty": "未入力",
      "summary.notSelected": "未選択",
      "summary.noCv": "未アップロード",
      "summary.savedAt": "あなたのアカウントに保存済み · {date}",
      "summary.justNow": "たった今",
      "overview.match": "マッチングレポートを作成",
      "overview.network": "ネットワークに入る",
      "overview.apply": "プロフィールで応募する",
      "status.readFail": "プロフィールの読み込みに失敗しました：{error}",
      "status.createFail": "プロフィールの作成に失敗しました：{error}",
      "status.needLoginSave": "先にログインしてから、プロフィールを保存してください。",
      "status.saving": "保存しています…",
      "status.saveFail": "保存に失敗しました：{error}",
      "status.saved": "プロフィールを保存しました。",
      "status.needLoginUpload": "先にログインしてから、CV をアップロードしてください。",
      "status.badFile": "ファイル形式またはサイズが対応していません。PDF、DOC、DOCX をアップロードしてください（推奨 5MB 以下）。",
      "status.uploading": "CV をアップロードしています…",
      "status.uploadFail": "アップロードに失敗しました：{error}",
      "status.uploadSavedFail": "CV はアップロードされましたが、プロフィールの保存に失敗しました：{error}",
      "status.uploaded": "CV をアップロードし、あなたのアカウントに保存しました。",
      "status.noCvOpen": "開ける CV がまだありません。",
      "status.openFail": "開けませんでした：{error}",
      "status.noCvDelete": "削除できる CV がまだありません。",
      "status.deleteFail": "記録の削除に失敗しました：{error}",
      "status.deleted": "CV を削除しました。",
      "status.cannotGenerateLink": "リンクを生成できません",
      "confirm.deleteCv": "この CV を削除してもよろしいですか？",
      "auth.configMissing": "Supabase の設定が読み込めていません",
      "auth.configMissingCopy": "auth-config.js が存在し、プロジェクト URL と anon / publishable key が含まれているか確認してください。",
      "auth.notLoggedIn": "まだログインしていません",
      "auth.notLoggedInCopy": "先に登録またはログインしてください。ログイン後、CV とプロフィールはあなたのアカウントに永続保存されます。",
      "auth.signupLogin": "登録 / ログイン",
      "auth.loggedIn": "ログイン済み",
      "auth.loggedInCopy": "{email} · あなたの CV はこのアカウントに保存されます。",
      "auth.currentAccount": "現在のアカウント",
      "auth.configMissingSummary": "設定がありません"
    }
  };

  // Stored DB values (Chinese) -> dict key suffix, for display only.
  var MARKET_KEYS = { "日本": "japan", "香港": "hongkong", "新加坡": "singapore", "英国": "uk", "多个市场": "multi" };
  var CAREER_KEYS = { "法律 / 合规": "legal", "金融 / 合规": "finance", "Web3 / 金融合规": "web3", "国际业务": "business", "数据 / 分析": "data", "市场 / 运营": "marketing" };

  function lang() {
    if (window.JOLang) return window.JOLang.get();
    return localStorage.getItem("japanoffer_lang") || "en";
  }

  function t(key, vars) {
    var l = lang();
    var str = (dict[l] && dict[l][key]) || dict.en[key] || dict.zh[key] || key;
    if (vars) {
      Object.keys(vars).forEach(function (k) {
        str = str.split("{" + k + "}").join(String(vars[k]));
      });
    }
    return str;
  }

  function displayMarket(value) {
    var k = MARKET_KEYS[value];
    return k ? t("market." + k) : value;
  }

  function displayCareer(value) {
    var k = CAREER_KEYS[value];
    return k ? t("career." + k) : value;
  }

  function wireSelector() {
    var sel = document.getElementById("languageSelect");
    if (sel && !sel.__joWired) {
      sel.__joWired = true;
      sel.addEventListener("change", function () {
        if (window.JOLang) window.JOLang.set(sel.value);
        else {
          try { localStorage.setItem("japanoffer_lang", sel.value); } catch (e) {}
          apply();
        }
      });
    }
  }

  function apply() {
    var l = lang();
    var t = dict[l] || dict.en;
    document.documentElement.lang = l === "zh" ? "zh-CN" : l;
    var sel = document.getElementById("languageSelect");
    if (sel) sel.value = l;
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
    wireSelector();
  }

  window.JOProfileLang = { apply: apply, t: t, displayMarket: displayMarket, displayCareer: displayCareer };

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
