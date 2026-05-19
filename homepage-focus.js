// JapanOffer AI homepage-focus.js
// Final clean patch: remove the unnecessary blank white CTA in the final black section,
// and keep homepage search connected to jobs-search.html.

(function () {
  const LANG_KEY = "japanoffer_lang";

  function getLang() {
    return (localStorage.getItem(LANG_KEY) || document.documentElement.lang || "en").toLowerCase();
  }

  function defaultSearch() {
    const lang = getLang();
    if (lang.startsWith("zh")) return "法律 合规";
    if (lang.startsWith("ja")) return "法務 コンプライアンス";
    return "legal compliance";
  }

  function injectStyle() {
    if (document.getElementById("jo-final-blank-cta-remove")) return;

    const style = document.createElement("style");
    style.id = "jo-final-blank-cta-remove";
    style.textContent = `
      /* Hide the second white CTA in the final black section.
         It was the Sign up/Register button, but the top nav already has account entry,
         so keeping only the blue job-search CTA is cleaner and avoids the blank pill. */
      .final-card .hero-actions a:nth-child(2),
      .final-card .center-actions a:nth-child(2),
      .final-card .actions a:nth-child(2),
      .final .hero-actions a:nth-child(2),
      .final .center-actions a:nth-child(2),
      .final .actions a:nth-child(2),
      section.final-cta .hero-actions a:nth-child(2),
      section.final-cta .center-actions a:nth-child(2),
      section.final-cta .actions a:nth-child(2) {
        display: none !important;
      }

      .final-card .hero-actions,
      .final-card .center-actions,
      .final-card .actions,
      .final .hero-actions,
      .final .center-actions,
      .final .actions,
      section.final-cta .hero-actions,
      section.final-cta .center-actions,
      section.final-cta .actions {
        justify-content: center !important;
      }
    `;

    document.head.appendChild(style);
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
    connectSearch();

    // Re-inject in case another script mutates the page after load.
    setTimeout(injectStyle, 300);
    setTimeout(injectStyle, 1000);
    window.addEventListener("japanoffer:languagechange", injectStyle);
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", boot);
  } else {
    boot();
  }
})();
