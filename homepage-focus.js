// JapanOffer AI homepage focus bridge + final CTA hard repair

(function () {
  const LANG_KEY = "japanoffer_lang";

  function getLang() {
    return (localStorage.getItem(LANG_KEY) || document.documentElement.lang || "en").toLowerCase();
  }

  function signupText() {
    const lang = getLang();
    if (lang.startsWith("zh")) return "注册";
    if (lang.startsWith("ja")) return "登録";
    return "Sign up";
  }

  function defaultSearch() {
    const lang = getLang();
    if (lang.startsWith("zh")) return "法律 合规";
    if (lang.startsWith("ja")) return "法務 コンプライアンス";
    return "legal compliance";
  }

  function injectStyle() {
    if (document.getElementById("jo-home-hard-fix-style")) return;

    const style = document.createElement("style");
    style.id = "jo-home-hard-fix-style";
    style.textContent = `
      a[href*="signup"].btn,
      .final a[href*="signup"],
      .final-card a[href*="signup"],
      .center-actions a[href*="signup"],
      .hero-actions.center-actions a[href*="signup"] {
        display: inline-flex !important;
        align-items: center !important;
        justify-content: center !important;
        min-width: 118px !important;
        min-height: 46px !important;
        padding: 13px 18px !important;
        border-radius: 999px !important;
        background: #ffffff !important;
        color: #101828 !important;
        font-weight: 900 !important;
        opacity: 1 !important;
        visibility: visible !important;
        text-shadow: none !important;
      }
    `;

    document.head.appendChild(style);
  }

  function repairSignupCta() {
    document.querySelectorAll('a[href*="signup"]').forEach((el) => {
      if (!el.closest(".auth-links")) {
        el.textContent = signupText();
      } else if (!el.textContent.trim()) {
        el.textContent = signupText();
      }
    });
  }

  function buildHeroQuery() {
    const roleInput =
      document.querySelector("#roleInput") ||
      document.querySelector(".premium-search-row label:nth-child(1) input") ||
      document.querySelector(".search-row input");

    const marketInput =
      document.querySelector("#marketInput") ||
      document.querySelector(".premium-search-row label:nth-child(2) input") ||
      document.querySelectorAll(".search-row input")[1];

    const role = roleInput && roleInput.value ? roleInput.value.trim() : "";
    const market = marketInput && marketInput.value ? marketInput.value.trim() : "";

    return [market, role].filter(Boolean).join(" ").trim() || defaultSearch();
  }

  function goToJobSearch(query) {
    const q = String(query || "").trim() || buildHeroQuery() || defaultSearch();
    window.location.href = "jobs-search.html?q=" + encodeURIComponent(q);
  }

  function connectSearch() {
    document.querySelectorAll("a").forEach((link) => {
      const text = String(link.textContent || "").trim().toLowerCase();

      if (
        text === "jobs" ||
        text === "岗位" ||
        text === "求人" ||
        text === "find jobs" ||
        text === "找岗位" ||
        text === "求人を探す"
      ) {
        if (!link.href.includes("jobs-search.html")) link.href = "jobs-search.html";
      }
    });

    const topSearchInput = document.querySelector(".top-search input");
    const topSearchForm = document.querySelector(".top-search");

    if (topSearchInput) {
      topSearchInput.addEventListener("keydown", (event) => {
        if (event.key === "Enter") {
          event.preventDefault();
          goToJobSearch(topSearchInput.value);
        }
      });
    }

    if (topSearchForm && topSearchForm.tagName === "FORM") {
      topSearchForm.addEventListener("submit", (event) => {
        event.preventDefault();
        goToJobSearch(topSearchInput ? topSearchInput.value : "");
      });
    }

    document.querySelectorAll(".premium-search-button, .search-btn").forEach((button) => {
      button.addEventListener("click", (event) => {
        event.preventDefault();
        goToJobSearch(buildHeroQuery());
      });
    });

    document.querySelectorAll(".quick-tags span, .premium-tags span, .tags button, [data-query]").forEach((tag) => {
      tag.style.cursor = "pointer";
      tag.addEventListener("click", () => {
        goToJobSearch(tag.getAttribute("data-query") || tag.textContent || "");
      });
    });
  }

  function boot() {
    injectStyle();
    repairSignupCta();
    connectSearch();

    setTimeout(repairSignupCta, 100);
    setTimeout(repairSignupCta, 500);
    setTimeout(repairSignupCta, 1200);

    window.addEventListener("japanoffer:languagechange", repairSignupCta);
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", boot);
  } else {
    boot();
  }
})();
