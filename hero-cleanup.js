// JapanOffer AI hero cleanup v2
// Correct logic: keep the lower hero CTA button, remove the upper search-form button.

(function () {
  if (window.__japanofferHeroCleanupV2Loaded) return;
  window.__japanofferHeroCleanupV2Loaded = true;

  const LANG_KEY = "japanoffer_lang";

  const copy = {
    en: {
      titleTop: "Search globally.",
      titleBottom: "Apply smarter.",
      body1: "JapanOffer AI helps international candidates find realistic cross-border roles, compare fit and risk, and prepare stronger applications.",
      body2: "Search real jobs, generate fit reports and enter a member network built for cross-border careers.",
      search: "Search jobs",
      report: "Generate AI report",
      network: "Enter member network"
    },
    zh: {
      titleTop: "全球搜索。",
      titleBottom: "精准申请。",
      body1: "JapanOffer AI 帮跨境候选人搜索真实岗位、比较匹配度和风险，并准备更有方向的申请。",
      body2: "你可以搜索岗位、生成适配报告，并进入为跨境职业发展设计的会员网络。",
      search: "搜索岗位",
      report: "生成 AI 报告",
      network: "进入会员网络"
    },
    ja: {
      titleTop: "世界で探す。",
      titleBottom: "賢く応募する。",
      body1: "JapanOffer AI は、海外求人の検索、適性とリスクの比較、応募準備を一つの流れで支援します。",
      body2: "実際の求人検索、適性レポート、クロスボーダーキャリア向けのメンバーネットワークを利用できます。",
      search: "求人を検索",
      report: "AI レポートを作成",
      network: "ネットワークに入る"
    }
  };

  function currentLang() {
    const select = document.querySelector("#languageSelect, .lang-select, .lang");
    const selected = select && select.value ? String(select.value).toLowerCase() : "";
    const stored = String(localStorage.getItem(LANG_KEY) || "").toLowerCase();
    const html = String(document.documentElement.lang || "").toLowerCase();
    const value = selected || stored || html || "en";
    if (value.startsWith("zh") || value.includes("中文")) return "zh";
    if (value.startsWith("ja") || value.includes("日本")) return "ja";
    return "en";
  }

  function ensureStyle() {
    if (document.getElementById("jo-hero-cleanup-v2-style")) return;

    const style = document.createElement("style");
    style.id = "jo-hero-cleanup-v2-style";
    style.textContent = `
      /* Hero headline spacing */
      @media (min-width: 761px) {
        .hero h1,
        .hero-title,
        .mega-title,
        main h1:first-of-type {
          font-size: clamp(48px, 5.55vw, 72px) !important;
          line-height: 1.08 !important;
          letter-spacing: -0.065em !important;
          white-space: normal !important;
          max-width: 760px !important;
          overflow: visible !important;
        }

        .hero h1 span,
        .hero-title span,
        .mega-title span,
        main h1:first-of-type span {
          display: block !important;
          margin-top: 10px !important;
          line-height: 1.08 !important;
        }
      }

      @media (max-width: 760px) {
        .hero h1,
        .hero-title,
        .mega-title,
        main h1:first-of-type {
          font-size: clamp(38px, 10.8vw, 52px) !important;
          line-height: 1.08 !important;
          letter-spacing: -0.055em !important;
          white-space: normal !important;
          max-width: 100% !important;
          overflow: visible !important;
        }

        .hero h1 span,
        .hero-title span,
        .mega-title span,
        main h1:first-of-type span {
          display: block !important;
          margin-top: 5px !important;
          line-height: 1.08 !important;
        }
      }

      /* IMPORTANT: remove the upper Search jobs button inside the search form */
      .hero-search .search-button,
      .hero-search button[type="submit"],
      .hero-search a.search-button,
      .hero-search-row > button,
      .hero-search-row > a.search-button {
        display: none !important;
      }

      /* Let the two input boxes use the space after upper button is removed */
      .hero-search-row {
        grid-template-columns: minmax(0, 1fr) minmax(0, 1fr) !important;
      }

      /* Keep the lower CTA area clean */
      .hero-actions,
      .cta-row,
      .hero-cta {
        display: flex !important;
        gap: 12px !important;
        flex-wrap: wrap !important;
        margin-top: 22px !important;
      }

      .hero-actions .btn,
      .cta-row .btn,
      .hero-cta .btn {
        min-width: 210px !important;
        justify-content: center !important;
      }

      .hero-actions .btn.primary,
      .cta-row .btn.primary,
      .hero-cta .btn.primary {
        display: inline-flex !important;
      }

      .jo-hidden-upper-search {
        display: none !important;
      }

      @media (max-width: 760px) {
        .hero-search-row {
          grid-template-columns: 1fr !important;
        }

        .hero-actions .btn,
        .cta-row .btn,
        .hero-cta .btn {
          width: 100% !important;
          min-width: 0 !important;
        }
      }
    `;
    document.head.appendChild(style);
  }

  function cleanTitle() {
    const lang = currentLang();
    const c = copy[lang];

    const candidates = Array.from(document.querySelectorAll("h1, .hero-title, .mega-title"));
    const h1 =
      candidates.find(el => /Search globally|Belong professionally|Apply smarter|全球搜索|精准申请|专业归属|世界で探す|賢く応募|グローバル|プロとして/i.test(el.textContent || "")) ||
      document.querySelector(".hero h1") ||
      document.querySelector("main h1");

    if (!h1) return;
    h1.innerHTML = `${c.titleTop}<span>${c.titleBottom}</span>`;
  }

  function cleanHeroCopy() {
    const lang = currentLang();
    const c = copy[lang];

    const hero = document.querySelector(".hero") || document.querySelector("main");
    if (!hero) return;

    const ps = Array.from(hero.querySelectorAll("p")).filter(p => {
      const text = (p.textContent || "").trim();
      if (!text) return false;
      if (p.classList.contains("eyebrow")) return false;
      return text.length > 45;
    });

    if (ps[0]) ps[0].textContent = c.body1;
    if (ps[1]) ps[1].textContent = c.body2;
  }

  function removeUpperSearchButton() {
    const upperButtons = document.querySelectorAll(
      '.hero-search .search-button, .hero-search button[type="submit"], .hero-search a.search-button, .hero-search-row > button, .hero-search-row > a.search-button'
    );

    upperButtons.forEach(el => {
      el.classList.add("jo-hidden-upper-search");
      el.setAttribute("aria-hidden", "true");
      el.setAttribute("tabindex", "-1");
    });
  }

  function ensureLowerSearchButton() {
    const lang = currentLang();
    const c = copy[lang];

    let actions = document.querySelector(".hero-actions") || document.querySelector(".cta-row") || document.querySelector(".hero-cta");

    if (!actions) {
      const heroSearch = document.querySelector(".hero-search");
      if (!heroSearch) return;
      actions = document.createElement("div");
      actions.className = "hero-actions";
      heroSearch.insertAdjacentElement("afterend", actions);
    }

    let search = Array.from(actions.querySelectorAll('a, button')).find(el => {
      const href = (el.getAttribute("href") || "").toLowerCase();
      const text = (el.textContent || "").toLowerCase();
      return href.includes("jobs-search") || /start job|search job|搜索岗位|求人/.test(text);
    });

    if (!search) {
      search = document.createElement("a");
      search.className = "btn primary";
      search.href = "jobs-search.html";
      actions.insertBefore(search, actions.firstChild);
    }

    search.classList.remove("jo-hidden-upper-search");
    search.style.display = "";
    search.textContent = c.search;
    if (search.tagName.toLowerCase() === "a") search.href = "jobs-search.html";

    // Fix other lower buttons text if present.
    Array.from(actions.querySelectorAll('a, button')).forEach(el => {
      const href = (el.getAttribute("href") || "").toLowerCase();
      const text = (el.textContent || "").toLowerCase();

      if (href.includes("report") || /report|报告|レポート/.test(text)) {
        el.textContent = c.report;
        if (el.tagName.toLowerCase() === "a") el.href = "report.html";
      }

      if (href.includes("network") || /network|会员|ネットワーク/.test(text)) {
        el.textContent = c.network;
        if (el.tagName.toLowerCase() === "a") el.href = "network.html";
      }
    });
  }

  function run() {
    ensureStyle();
    cleanTitle();
    cleanHeroCopy();
    removeUpperSearchButton();
    ensureLowerSearchButton();
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", run);
  } else {
    run();
  }

  document.addEventListener("change", event => {
    if (event.target && (event.target.id === "languageSelect" || event.target.classList.contains("lang-select") || event.target.classList.contains("lang"))) {
      setTimeout(run, 80);
      setTimeout(run, 400);
    }
  });

  window.addEventListener("storage", run);
  window.addEventListener("japanoffer:languagechange", run);

  setTimeout(run, 250);
  setTimeout(run, 900);
  setTimeout(run, 1800);
})();
