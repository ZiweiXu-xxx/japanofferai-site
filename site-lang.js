// JapanOffer AI shared language module.
// One default, one storage key, one selector — so every page opens in the
// same language and switching once sticks everywhere.
//
// Rules:
//   1. `?lang=en|zh|ja` wins and is remembered.
//   2. Otherwise the remembered choice wins.
//   3. Otherwise the default is English — the homepage has always opened
//      in English, and the bug was other pages opening in Chinese instead.
//      (No browser-language detection: the user expects the site to start
//      in English, and can switch to Chinese once; the choice then sticks.)
//   4. Pages without a language selector get one injected into the header.
//
// Pages with their own inline applyLang keep working unchanged: they read
// the same localStorage key, and this file seeds it before their scripts
// run, so load it in <head> (or before any page language script).

(function () {
  var KEY = "japanoffer_lang";
  var LANGS = ["en", "zh", "ja"];
  var DEFAULT_LANG = "en";

  function valid(lang) {
    return LANGS.indexOf(lang) !== -1 ? lang : null;
  }

  function get() {
    try {
      var param = valid(new URLSearchParams(window.location.search).get("lang"));
      if (param) {
        localStorage.setItem(KEY, param);
        return param;
      }
      var stored = valid(localStorage.getItem(KEY));
      if (stored) return stored;
      localStorage.setItem(KEY, DEFAULT_LANG);
      return DEFAULT_LANG;
    } catch (e) {
      return DEFAULT_LANG;
    }
  }

  function syncSelectors(lang) {
    document.querySelectorAll("#languageSelect, .lang-select, .jo-shared-lang").forEach(function (el) {
      if (el.value !== lang) el.value = lang;
    });
    document.querySelectorAll("[data-lang-option]").forEach(function (btn) {
      btn.classList.toggle("active", btn.dataset.langOption === lang);
    });
  }

  function set(lang) {
    if (!valid(lang)) return;
    try {
      localStorage.setItem(KEY, lang);
    } catch (e) {}
    syncSelectors(lang);
    window.dispatchEvent(new CustomEvent("japanoffer:languagechange", { detail: { lang: lang } }));
  }

  function injectSelector() {
    if (
      document.getElementById("languageSelect") ||
      document.querySelector(".lang-select") ||
      document.querySelector(".jo-shared-lang")
    ) {
      return;
    }
    var header = document.querySelector("header.topbar, header");
    if (!header) return;

    if (!document.getElementById("jo-shared-lang-style")) {
      var style = document.createElement("style");
      style.id = "jo-shared-lang-style";
      style.textContent =
        ".jo-shared-lang{height:36px;min-width:84px;border-radius:999px;border:1px solid rgba(16,24,40,.12);background:rgba(255,255,255,.92);color:#27364a;padding:0 9px;font-size:12px;font-weight:900;cursor:pointer;outline:none;flex:0 0 auto}" +
        "@media(max-width:760px){.jo-shared-lang{height:34px;min-width:68px}}";
      document.head.appendChild(style);
    }

    var sel = document.createElement("select");
    sel.className = "lang-select jo-shared-lang";
    sel.setAttribute("aria-label", "Language");
    sel.innerHTML =
      '<option value="en">EN</option><option value="zh">中文</option><option value="ja">日本語</option>';
    sel.value = get();
    sel.addEventListener("change", function () {
      set(sel.value);
    });

    var nav = header.querySelector(".nav");
    if (nav) nav.appendChild(sel);
    else header.appendChild(sel);
  }

  window.JOLang = { get: get, set: set, key: KEY };

  // Seed the first-visit default before any page script reads the key.
  get();

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", injectSelector);
  } else {
    injectSelector();
  }
})();
