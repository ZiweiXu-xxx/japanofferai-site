// JapanOffer AI match page language.
// The match page used to be hardcoded Chinese while the homepage opened in
// English. It now follows the shared language (window.JOLang) and translates
// its own chrome via data-i18n attributes, plus the dynamic strings in
// ai-match.js via window.JOMatchLang.t().
// The AI-generated report content itself (roles, risks, advice) stays in
// the language the AI produced it in; only the UI chrome around it is
// translated. Job/company names in the static route cards stay as authored.
(function () {
  var dict = {
    en: {
      "brand.small": "Chinese AI Job Match",
      "nav.home": "Home",
      "nav.jobs": "Jobs",
      "nav.report": "Match report",
      "nav.signup": "Sign up",
      "hero.title": "Describe your background.<span>Match jobs automatically.</span>",
      "hero.subtitle": "Describe your education, major, languages, skills, projects and target countries in Chinese. The system returns a ranked list of roles, match scores, and specific companies and search directions across Japan, Hong Kong and Singapore.",
      "sample.title": "Example input",
      "sample.text": "I am a UK law undergraduate. I speak Chinese, English and Japanese, and I want to find legal compliance, international business or Web3 compliance work in Japan or Singapore. I have no formal work experience, but I have project experience and a legal background.",
      "form.background": "Your background",
      "form.backgroundHint": "Chinese input is fine",
      "form.backgroundPh": "Example: I am a Chinese finance undergraduate. I speak Chinese and English, and I want to find finance, compliance, analytics or cross-border business work abroad. I have no formal work experience, but I have course projects and internship preparation.",
      "form.market": "Target market",
      "form.marketAuto": "Let the system decide",
      "form.marketJapan": "Japan",
      "form.marketHongKong": "Hong Kong",
      "form.marketSingapore": "Singapore",
      "form.marketUK": "United Kingdom",
      "form.career": "Career direction",
      "form.careerAuto": "Let the system decide",
      "form.careerFinance": "Finance / Compliance",
      "form.careerLegal": "Legal / Compliance",
      "form.careerWeb3": "Web3 / Finance Compliance",
      "form.careerBusiness": "International business",
      "form.careerData": "Data / Analytics",
      "form.careerMarketing": "Marketing / Operations",
      "form.jobTitle": "Target job title (optional)",
      "form.jobTitleHint": "Adding the title makes it clearer",
      "form.jobTitlePh": "Example: Legal Compliance Analyst",
      "form.jobDesc": "Target job description",
      "form.jobDescHint": "Required — the AI compares against it",
      "form.jobDescPh": "Paste the full description of the role you want to apply for (at least 50 characters). The AI compares your background against this role, and works out a match score, risks and next steps.",
      "form.generate": "Generate my job match",
      "form.note": "The match score is the AI's assessment of your background against the job description — not an admission probability. 85+ is a very strong match, 70–84 is worth applying to first, 55–69 is worth trying, and below 55 is a lower priority.",
      "result.title": "Your ranked job recommendations",
      "result.rankTitle": "Top three recommended roles",
      "result.rankCopy": "This answers which role to apply to first — no more abstract directions.",
      "result.routeTitle": "Companies and search routes",
      "result.routeCopy": "This is not a live job board. It shows the companies and keywords you should search first, based on your background. A live job API can be connected later.",
      "result.judgement": "System assessment",
      "result.roadmap": "Next steps",
      "result.copy": "Copy result",
      "result.fullReport": "Generate full report",
      "result.viewJobs": "Browse jobs",
      "result.copied": "Result copied.",
      "result.copyFailed": "Copy failed. You can select the result on the page and copy it manually.",
      "result.rank": "No. {n}",
      "result.routeMarket": "Market {n}",
      "result.matchScore": "Match {score}",
      "result.scoreValue": "{score} pts",
      "result.mainRisk": "Main risk:",
      "result.nextStep": "Next step:",
      "result.searchJobs": "Search public jobs",
      "result.altCompanies": "Alternatives:",
      "result.searchKeywords": "Search keywords:",
      "result.judgementCandidate": "Candidate snapshot",
      "result.judgementAdvice": "Overall advice",
      "result.judgementNote": "Note",
      "result.tagMarket": "Target market: {v}",
      "result.tagCareer": "Direction: {v}",
      "result.tagBest": "Best match: {score}",
      "result.tagUsed": "Used: {label}",
      "result.copyTitle": "JapanOffer AI job match result",
      "result.copyBest": "Best match score: {score}",
      "result.copyMarket": "Target market: {v}",
      "result.copyCareer": "Career direction: {v}",
      "result.copySection": "Role assessment:",
      "result.copyRisk": "Main risk: {v}",
      "result.copyReason": "Why it matches: {v}",
      "result.copyNext": "Next step: {v}",
      "result.copyAdvice": "Overall advice:",
      "result.copyNote": "Note: {v}",
      "priority.first": "Apply first",
      "priority.try": "Worth trying",
      "priority.explore": "Explore",
      "priority.hold": "Hold for now",
      "consumed.free": "Free report",
      "consumed.premium": "Premium report",
      "consumed.paid": "Paid credits",
      "status.noConfig": "Supabase is not configured, so your profile cannot be loaded automatically yet.",
      "status.loadingProfile": "Reading your profile and uploaded CV…",
      "status.notLoggedIn": "You are not signed in yet. Please sign in first, then use your profile for an AI match.",
      "status.profileLoadFail": "Failed to read your profile: {error}",
      "status.noProfile": "No profile found yet. Please save your details or upload a CV on My profile first.",
      "status.profileTooThin": "We found your account, but your profile is too thin. Please add a target market, direction and bio on My profile first.",
      "status.needJobDesc": "Your profile and CV are loaded. Please paste a target job description, then click “Generate my job match”.",
      "status.autoDocx": "Your profile and DOCX CV are loaded. Generating your match result automatically.",
      "status.autoCv": "Your profile and CV file are loaded. Generating your match result automatically.",
      "status.autoProfile": "Your profile is loaded. Generating your match result automatically.",
      "status.needBackground": "Please enter a more complete background in Chinese (about 20 characters or more).",
      "status.needJobDesc2": "Please paste the full description of the target role (at least 50 characters). The AI needs a real role to compare against.",
      "status.generating": "Generating your AI match…",
      "status.generatingWait": "Generating your AI match, please wait…",
      "status.generated": "Your AI match result is ready.",
      "status.noCredits": "No report credits left. <a href=\"pricing.html\">Get more reports →</a>",
      "status.rateLimited": "Too many requests. Please try again shortly.",
      "status.generateFailed": "Generation failed. Please try again.",
      "status.noNetwork": "Cannot reach the server. Please check your connection and retry."
    },
    zh: {
      "brand.small": "中文 AI 岗位匹配",
      "nav.home": "首页",
      "nav.jobs": "岗位",
      "nav.report": "匹配报告",
      "nav.signup": "注册",
      "hero.title": "输入你的背景。<span>自动匹配岗位。</span>",
      "hero.subtitle": "用中文描述你的学历、专业、语言、技能、项目经历和目标国家。系统会输出岗位排序、匹配分数，以及日本、香港、新加坡三个市场的具体公司与搜索方向。",
      "sample.title": "示例输入",
      "sample.text": "我是英国法律本科学生，会中文、英文和日语，想去日本或新加坡找法律合规、国际业务或 Web3 合规相关工作。我没有正式工作经验，但有项目经历和法律背景。",
      "form.background": "你的个人背景",
      "form.backgroundHint": "中文输入即可",
      "form.backgroundPh": "例如：我是中国金融本科学生，会中文、英文，想去国外找金融、合规、分析或跨境业务相关工作。我没有正式工作经验，但有课程项目和实习准备。",
      "form.market": "目标市场",
      "form.marketAuto": "让系统判断",
      "form.marketJapan": "日本",
      "form.marketHongKong": "香港",
      "form.marketSingapore": "新加坡",
      "form.marketUK": "英国",
      "form.career": "职业方向",
      "form.careerAuto": "让系统判断",
      "form.careerFinance": "金融 / 合规",
      "form.careerLegal": "法律 / 合规",
      "form.careerWeb3": "Web3 / 金融合规",
      "form.careerBusiness": "国际业务",
      "form.careerData": "数据 / 分析",
      "form.careerMarketing": "市场 / 运营",
      "form.jobTitle": "目标岗位标题（可选）",
      "form.jobTitleHint": "写上岗位名更清楚",
      "form.jobTitlePh": "例如：法务合规分析师",
      "form.jobDesc": "目标岗位描述",
      "form.jobDescHint": "必填，AI 用它来对比",
      "form.jobDescPh": "粘贴你想申请的岗位完整描述（至少 50 个字）。AI 会把你的背景和这个岗位逐一对比，算出匹配分数、风险和下一步建议。",
      "form.generate": "生成我的岗位匹配",
      "form.note": "匹配分数由 AI 根据你的背景和岗位描述评估，不是录取概率。85 分以上非常匹配、70–84 分值得优先投递、55–69 分可以尝试、55 分以下优先级较低。",
      "result.title": "你的岗位推荐排序",
      "result.rankTitle": "第一、第二、第三推荐岗位",
      "result.rankCopy": "这部分解决“我到底先投什么岗位”的问题，不再只给抽象方向。",
      "result.routeTitle": "具体公司与岗位搜索路线",
      "result.routeCopy": "这里不是实时招聘库，而是根据你的背景给出最应该优先搜索的公司和岗位关键词。下一步可以接入公开岗位 API。",
      "result.judgement": "系统判断",
      "result.roadmap": "下一步建议",
      "result.copy": "复制结果",
      "result.fullReport": "生成完整报告",
      "result.viewJobs": "查看岗位页",
      "result.copied": "结果已复制。",
      "result.copyFailed": "复制失败，你可以手动选中页面结果复制。",
      "result.rank": "第 {n} 位",
      "result.routeMarket": "第 {n} 市场",
      "result.matchScore": "匹配 {score} 分",
      "result.scoreValue": "{score} 分",
      "result.mainRisk": "主要风险：",
      "result.nextStep": "下一步：",
      "result.searchJobs": "搜索公开岗位",
      "result.altCompanies": "备选公司：",
      "result.searchKeywords": "搜索关键词：",
      "result.judgementCandidate": "候选人概况",
      "result.judgementAdvice": "总体建议",
      "result.judgementNote": "说明",
      "result.tagMarket": "目标市场：{v}",
      "result.tagCareer": "方向：{v}",
      "result.tagBest": "最高匹配：{score} 分",
      "result.tagUsed": "本次使用：{label}",
      "result.copyTitle": "JapanOffer AI 岗位匹配结果",
      "result.copyBest": "最高匹配分：{score} 分",
      "result.copyMarket": "目标市场：{v}",
      "result.copyCareer": "职业方向：{v}",
      "result.copySection": "岗位评估：",
      "result.copyRisk": "主要风险：{v}",
      "result.copyReason": "匹配原因：{v}",
      "result.copyNext": "下一步：{v}",
      "result.copyAdvice": "总体建议：",
      "result.copyNote": "说明：{v}",
      "priority.first": "优先申请",
      "priority.try": "重点尝试",
      "priority.explore": "探索方向",
      "priority.hold": "暂缓申请",
      "consumed.free": "免费报告",
      "consumed.premium": "Premium 报告",
      "consumed.paid": "付费点数",
      "status.noConfig": "没有读取到 Supabase 配置，所以暂时不能自动调用你的个人主页资料。",
      "status.loadingProfile": "正在读取你的个人主页和已上传 CV...",
      "status.notLoggedIn": "你还没有登录。请先登录后再用个人资料做 AI 匹配。",
      "status.profileLoadFail": "读取个人主页失败：{error}",
      "status.noProfile": "还没有找到你的个人主页资料。请先在「我的主页」保存资料或上传 CV。",
      "status.profileTooThin": "已找到你的账号，但个人资料内容太少。请先在「我的主页」补充目标市场、方向和简介。",
      "status.needJobDesc": "已读取你的个人主页和 CV 内容。请再粘贴一个目标岗位描述，然后点击「生成我的岗位匹配」。",
      "status.autoDocx": "已读取你的个人主页和 DOCX 简历内容，正在自动生成匹配结果。",
      "status.autoCv": "已读取你的个人主页和 CV 文件记录。正在自动生成匹配结果。",
      "status.autoProfile": "已读取你的个人主页资料，正在自动生成匹配结果。",
      "status.needBackground": "先输入一段更完整的中文背景，至少写 20 个字左右。",
      "status.needJobDesc2": "请粘贴目标岗位的完整描述（至少 50 个字），AI 需要一个真实岗位来对比。",
      "status.generating": "正在生成 AI 匹配结果...",
      "status.generatingWait": "正在生成 AI 匹配结果，请稍等…",
      "status.generated": "AI 匹配结果已生成。",
      "status.noCredits": "报告次数已用完。<a href=\"pricing.html\">获取更多报告 →</a>",
      "status.rateLimited": "生成太频繁，请稍后再试。",
      "status.generateFailed": "生成失败，请稍后再试。",
      "status.noNetwork": "无法连接服务器，请检查网络后重试。"
    },
    ja: {
      "brand.small": "中国語 AI 求人マッチング",
      "nav.home": "ホーム",
      "nav.jobs": "求人",
      "nav.report": "マッチングレポート",
      "nav.signup": "登録",
      "hero.title": "あなたの経歴を入力。<span>求人を自動でマッチング。</span>",
      "hero.subtitle": "学歴、専攻、言語、スキル、プロジェクト経験、希望する国を中国語で入力してください。日本・香港・シンガポールの3市場について、求人の順位、マッチングスコア、具体的な企業と検索の方向性を出力します。",
      "sample.title": "入力例",
      "sample.text": "私は英国の法学部生です。中国語、英語、日本語が話せます。日本またはシンガポールで法務コンプライアンス、国際ビジネス、Web3コンプライアンスの仕事を探したいです。正式な職務経験はありませんが、プロジェクト経験と法律のバックグラウンドがあります。",
      "form.background": "あなたの経歴",
      "form.backgroundHint": "中国語で入力できます",
      "form.backgroundPh": "例：私は中国の金融学部の学生です。中国語と英語が話せます。海外で金融、コンプライアンス、分析、越境ビジネス関連の仕事を探したいです。正式な職務経験はありませんが、授業のプロジェクトやインターンの準備があります。",
      "form.market": "希望する市場",
      "form.marketAuto": "システムにおまかせ",
      "form.marketJapan": "日本",
      "form.marketHongKong": "香港",
      "form.marketSingapore": "シンガポール",
      "form.marketUK": "英国",
      "form.career": "職種の方向性",
      "form.careerAuto": "システムにおまかせ",
      "form.careerFinance": "金融 / コンプライアンス",
      "form.careerLegal": "法務 / コンプライアンス",
      "form.careerWeb3": "Web3 / 金融コンプライアンス",
      "form.careerBusiness": "国際ビジネス",
      "form.careerData": "データ / 分析",
      "form.careerMarketing": "マーケティング / 運営",
      "form.jobTitle": "希望する職種（任意）",
      "form.jobTitleHint": "職種名を入れるとより明確になります",
      "form.jobTitlePh": "例：法務コンプライアンスアナリスト",
      "form.jobDesc": "希望する求人の説明",
      "form.jobDescHint": "必須。AI がこれと比較します",
      "form.jobDescPh": "応募したい求人の説明全文を貼り付けてください（50文字以上）。AI があなたの経歴とこの求人を一つずつ比較し、マッチングスコア、リスク、次のステップを算出します。",
      "form.generate": "求人マッチングを生成",
      "form.note": "マッチングスコアは、AI があなたの経歴と求人の説明を比較した評価であり、内定確率ではありません。85点以上は非常にマッチ、70〜84点はまず応募する価値あり、55〜69点は試す価値あり、55点未満は優先度が低めです。",
      "result.title": "おすすめ求人の順位",
      "result.rankTitle": "おすすめ求人トップ3",
      "result.rankCopy": "「まず何に応募するか」を具体的に示します。抽象的な方向性だけではありません。",
      "result.routeTitle": "具体的な企業と検索ルート",
      "result.routeCopy": "ここはリアルタイムの求人データベースではありません。あなたの経歴に基づき、まず検索すべき企業とキーワードを示します。公開求人 API は今後接続できます。",
      "result.judgement": "システムの判断",
      "result.roadmap": "次のステップ",
      "result.copy": "結果をコピー",
      "result.fullReport": "フルレポートを作成",
      "result.viewJobs": "求人を見る",
      "result.copied": "結果をコピーしました。",
      "result.copyFailed": "コピーに失敗しました。ページの結果を選択して手動でコピーしてください。",
      "result.rank": "第{n}位",
      "result.routeMarket": "市場{n}",
      "result.matchScore": "マッチ度 {score}点",
      "result.scoreValue": "{score}点",
      "result.mainRisk": "主なリスク：",
      "result.nextStep": "次のステップ：",
      "result.searchJobs": "公開求人を検索",
      "result.altCompanies": "候補企業：",
      "result.searchKeywords": "検索キーワード：",
      "result.judgementCandidate": "候補者の概要",
      "result.judgementAdvice": "全体的なアドバイス",
      "result.judgementNote": "説明",
      "result.tagMarket": "希望する市場：{v}",
      "result.tagCareer": "方向性：{v}",
      "result.tagBest": "最高マッチ：{score}点",
      "result.tagUsed": "今回の使用：{label}",
      "result.copyTitle": "JapanOffer AI 求人マッチング結果",
      "result.copyBest": "最高マッチスコア：{score}点",
      "result.copyMarket": "希望する市場：{v}",
      "result.copyCareer": "職種の方向性：{v}",
      "result.copySection": "求人評価：",
      "result.copyRisk": "主なリスク：{v}",
      "result.copyReason": "マッチする理由：{v}",
      "result.copyNext": "次のステップ：{v}",
      "result.copyAdvice": "全体的なアドバイス：",
      "result.copyNote": "説明：{v}",
      "priority.first": "優先応募",
      "priority.try": "積極的に検討",
      "priority.explore": "探索対象",
      "priority.hold": "一旦保留",
      "consumed.free": "無料レポート",
      "consumed.premium": "Premium レポート",
      "consumed.paid": "有料クレジット",
      "status.noConfig": "Supabase の設定が読み込めていないため、プロフィールを自動で呼び出せません。",
      "status.loadingProfile": "プロフィールとアップロード済みの CV を読み込んでいます…",
      "status.notLoggedIn": "まだログインしていません。先にログインしてから、プロフィールで AI マッチングをご利用ください。",
      "status.profileLoadFail": "プロフィールの読み込みに失敗しました：{error}",
      "status.noProfile": "プロフィールがまだ見つかりません。先に「マイページ」で情報を保存するか、CV をアップロードしてください。",
      "status.profileTooThin": "アカウントは見つかりましたが、プロフィールの内容が少なすぎます。先に「マイページ」で希望する市場、方向性、自己紹介を補充してください。",
      "status.needJobDesc": "プロフィールと CV を読み込みました。希望する求人の説明を貼り付けてから「求人マッチングを生成」をクリックしてください。",
      "status.autoDocx": "プロフィールと DOCX 履歴書を読み込みました。マッチング結果を自動で生成しています。",
      "status.autoCv": "プロフィールと CV ファイルを読み込みました。マッチング結果を自動で生成しています。",
      "status.autoProfile": "プロフィールを読み込みました。マッチング結果を自動で生成しています。",
      "status.needBackground": "中国語でもう少し詳しい経歴を入力してください（20文字程度以上）。",
      "status.needJobDesc2": "希望する求人の説明全文を貼り付けてください（50文字以上）。AI が比較するには実際の求人が必要です。",
      "status.generating": "AI マッチングを生成しています…",
      "status.generatingWait": "AI マッチングを生成しています。少々お待ちください…",
      "status.generated": "AI マッチング結果ができました。",
      "status.noCredits": "レポートの回数を使い切りました。<a href=\"pricing.html\">レポートを追加 →</a>",
      "status.rateLimited": "リクエストが多すぎます。少し待ってからもう一度お試しください。",
      "status.generateFailed": "生成に失敗しました。もう一度お試しください。",
      "status.noNetwork": "サーバーに接続できません。ネットワークを確認してからもう一度お試しください。"
    }
  };

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

  window.JOMatchLang = { apply: apply, t: t };

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
