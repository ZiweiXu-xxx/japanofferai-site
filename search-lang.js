// JapanOffer AI search page language.
// The search page used to be hardcoded Chinese while the homepage opened in
// English. It now follows the shared language (window.JOLang) and translates
// its own chrome via data-i18n attributes, plus the dynamic strings in the
// page's inline render() via window.JOSearchLang.t().
// Job titles, company names and the search index itself stay as authored.
(function () {
  var dict = {
    en: {
      "brand.small": "Global Search",
      "search.ph": "Search real jobs or site features",
      "nav.home": "Home",
      "nav.jobs": "Jobs",
      "nav.applications": "Applications",
      "nav.network": "Network",
      "nav.profile": "My profile",
      "hero.eyebrow": "Search real public jobs",
      "hero.title": "Search real public jobs,<span>not demo data.</span>",
      "tabs.all": "All",
      "tabs.job": "Real jobs",
      "tabs.page": "Pages",
      "result.open": "Open →",
      "result.realJob": "Real job",
      "result.page": "Page",
      "search.summaryEmpty": "Real public jobs right now: {count}. Enter a keyword to search.",
      "search.emptyNoImport": "Demo jobs are no longer shown. If this shows 0 real jobs, run the Remotive import from admin-jobs.html first.",
      "search.summaryResults": "Search “{q}”: {count} results found. Real public jobs right now: {total}.",
      "search.emptyNone": "No real public jobs found. Import jobs from admin-jobs.html first, or try a different keyword."
    },
    zh: {
      "brand.small": "全球搜索",
      "search.ph": "搜索真实岗位或站内功能",
      "nav.home": "首页",
      "nav.jobs": "职位",
      "nav.applications": "申请",
      "nav.network": "人脉",
      "nav.profile": "我的主页",
      "hero.eyebrow": "搜索真实公开岗位",
      "hero.title": "搜索真实公开岗位，<span>不是 demo 数据。</span>",
      "tabs.all": "全部",
      "tabs.job": "真实岗位",
      "tabs.page": "页面",
      "result.open": "打开 →",
      "result.realJob": "真实岗位",
      "result.page": "页面",
      "search.summaryEmpty": "当前真实公开岗位：{count} 个。请输入关键词搜索。",
      "search.emptyNoImport": "不会再展示 demo 岗位。如果这里显示 0 个真实岗位，先去 admin-jobs.html 运行 Remotive 导入。",
      "search.summaryResults": "搜索「{q}」：找到 {count} 个结果。当前真实公开岗位：{total} 个。",
      "search.emptyNone": "没有找到真实公开岗位。先去 admin-jobs.html 导入岗位，或者换关键词搜索。"
    },
    ja: {
      "brand.small": "グローバル検索",
      "search.ph": "実際の求人やサイト機能を検索",
      "nav.home": "ホーム",
      "nav.jobs": "求人",
      "nav.applications": "応募",
      "nav.network": "人脈",
      "nav.profile": "マイページ",
      "hero.eyebrow": "実際の公開求人を検索",
      "hero.title": "実際の公開求人を検索、<span>デモデータではありません。</span>",
      "tabs.all": "すべて",
      "tabs.job": "実際の求人",
      "tabs.page": "ページ",
      "result.open": "開く →",
      "result.realJob": "実際の求人",
      "result.page": "ページ",
      "search.summaryEmpty": "現在の実際の公開求人：{count} 件。キーワードを入力して検索してください。",
      "search.emptyNoImport": "デモ求人は表示されなくなりました。0 件と表示される場合は、先に admin-jobs.html から Remotive インポートを実行してください。",
      "search.summaryResults": "「{q}」の検索：{count} 件見つかりました。現在の実際の公開求人：{total} 件。",
      "search.emptyNone": "実際の公開求人が見つかりませんでした。先に admin-jobs.html から求人をインポートするか、別のキーワードで検索してください。"
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

  window.JOSearchLang = { apply: apply, t: t };

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
