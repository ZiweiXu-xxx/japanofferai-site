// JapanOffer AI homepage focus bridge + UI repair
// Safe patch: fixes blank CTA text/color and keeps homepage search connected to jobs-search.html.

(function () {
  const LANG_KEY = "japanoffer_lang";

  function lang() {
    return localStorage.getItem(LANG_KEY) || document.documentElement.lang || "en";
  }

  function copy(key) {
    const l = lang().toLowerCase();
    const table = {
      signUp: {
        en: "Sign up",
        zh: "注册",
        ja: "登録"
      },
      searchDefault: {
        en: "legal compliance",
        zh: "法律 合规",
        ja: "法務 コンプライアンス"
      }
    };

    if (l.startsWith("zh")) return table[key].zh;
    if (l.startsWith("ja")) return table[key].ja;
    return table[key].en;
  }

  function injectStyle() {
    if (document.getElementById("jo-home-ui-fix-style")) return;

    const style = document.createElement("style");
    style.id = "jo-home-ui-fix-style";
    style.textContent = `
      .final .btn,
      .final-card .btn,
      .center-actions .btn,
      .hero-actions.center-actions .btn {
        color: #101828 !important;
      }

      .final .btn.primary,
      .final-card .btn.primary,
      .center-actions .btn.primary,
      .hero-actions.center-actions .btn.primary {
        color: #ffffff !important;
      }

      .final .btn.secondary,
      .final-card .btn.secondary,
      .center-actions .btn.secondary,
      .hero-actions.center-actions .btn.secondary,
      .final .btn:not(.primary),
      .final-card .btn:not(.primary),
      .center-actions .btn:not(.primary),
      .hero-actions.center-actions .btn:not(.primary) {
        min-width: 112px;
        color: #101828 !important;
        background: #ffffff !important;
      }

      .auth-shell,
      .signup-shell {
        min-height: calc(100vh - 80px);
      }
    `;

    document.head.appendChild(style);
  }

  function repairBlankButtons() {
    const candidates = document.querySelectorAll(
      'a[href*="signup"], button[data-signup], .final a, .final-card a, .center-actions a, .hero-actions.center-actions a'
    );

    candidates.forEach((el) => {
      const text = (el.textContent || "").trim();
      const href = (el.getAttribute("href") || "").toLowerCase();

      if (!text && href.includes("signup")) {
        el.textContent = copy("signUp");
      }

      if (href.includes("signup") && (text === "Sign up" || text === "注册" || text === "登録")) {
        // keep visible language-aware copy
        el.textContent = copy("signUp");
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

    return [market, role].filter(Boolean).join(" ").trim() || copy("searchDefault");
  }

  function goToJobSearch(query) {
    const q = String(query || "").trim() || buildHeroQuery() || copy("searchDefault");
    window.location.href = "jobs-search.html?q=" + encodeURIComponent(q);
  }

  function connectSearch() {
    document.querySelectorAll("a").forEach((link) => {
      const text = String(link.textContent || "").trim().toLowerCase();

      if (text === "jobs" || text === "岗位" || text === "求人" || text === "find jobs" || text === "找岗位" || text === "求人を探す") {
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

    const heroButtons = document.querySelectorAll(".premium-search-button, .search-btn, a[href='jobs-search.html']");
    heroButtons.forEach((button) => {
      const text = String(button.textContent || "").trim().toLowerCase();

      if (
        text.includes("search") ||
        text.includes("岗位") ||
        text.includes("求人") ||
        text.includes("find jobs")
      ) {
        button.addEventListener("click", (event) => {
          event.preventDefault();
          goToJobSearch(buildHeroQuery());
        });
      }
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
    repairBlankButtons();
    connectSearch();

    setTimeout(repairBlankButtons, 300);
    setTimeout(repairBlankButtons, 1000);

    window.addEventListener("japanoffer:languagechange", repairBlankButtons);
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", boot);
  } else {
    boot();
  }
})();
