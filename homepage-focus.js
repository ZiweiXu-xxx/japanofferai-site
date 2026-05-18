// JapanOffer AI - homepage focus + real job search bridge
// Keeps the existing strict homepage search boot, then connects homepage search actions to jobs-search.html.

(function () {
  function loadScript(src) {
    return new Promise((resolve, reject) => {
      const existing = document.querySelector(`script[src="${src}"]`);
      if (existing) return resolve();

      const script = document.createElement("script");
      script.src = src;
      script.onload = resolve;
      script.onerror = reject;
      document.head.appendChild(script);
    });
  }

  function removeOldPanels() {
    document
      .querySelectorAll(".jo33-search-panel, .jo34-search-panel, .jo36-search-panel")
      .forEach((el) => el.remove());
  }

  function normalisePlaceholderValue(value) {
    const text = String(value || "").trim();

    if (!text) return "";

    const placeholderValues = [
      "Search roles, talent or companies",
      "Legal, compliance, business, technology",
      "Japan, Singapore, Hong Kong"
    ];

    return placeholderValues.includes(text) ? "" : text;
  }

  function buildHeroQuery() {
    const roleInput = document.querySelector(".premium-search-row label:nth-child(1) input");
    const marketInput = document.querySelector(".premium-search-row label:nth-child(2) input");

    const role = normalisePlaceholderValue(roleInput?.value) || "legal compliance";
    const market = normalisePlaceholderValue(marketInput?.value) || "";

    return [market, role].filter(Boolean).join(" ").trim();
  }

  function goToRealJobSearch(query) {
    const q = String(query || "").trim() || buildHeroQuery() || "legal compliance";
    window.location.href = "jobs-search.html?q=" + encodeURIComponent(q);
  }

  function connectHomepageToRealSearch() {
    // Top navigation Jobs
    document.querySelectorAll('a').forEach((link) => {
      const text = String(link.textContent || "").trim().toLowerCase();

      if (text === "jobs" || text === "find jobs") {
        link.href = "jobs-search.html";
      }

      if (text.includes("search live jobs")) {
        link.href = "jobs-search.html?q=" + encodeURIComponent("legal compliance visa sponsorship");
      }
    });

    // Top search bar
    const topSearchInput = document.querySelector(".top-search input");

    if (topSearchInput) {
      topSearchInput.removeAttribute("value");
      topSearchInput.placeholder = "Search UK legal, Singapore compliance, Japan legal, Hong Kong AML...";

      topSearchInput.addEventListener("keydown", (event) => {
        if (event.key === "Enter") {
          event.preventDefault();
          goToRealJobSearch(topSearchInput.value);
        }
      });
    }

    const topSearchBox = document.querySelector(".top-search");
    if (topSearchBox) {
      topSearchBox.addEventListener("click", () => {
        topSearchInput?.focus();
      });
    }

    // Main hero search button
    const heroButton = document.querySelector(".premium-search-button");

    if (heroButton) {
      heroButton.textContent = "Search jobs";
      heroButton.href = "jobs-search.html";

      heroButton.addEventListener("click", (event) => {
        event.preventDefault();
        goToRealJobSearch(buildHeroQuery());
      });
    }

    // Hero inputs press Enter
    document.querySelectorAll(".premium-search-row input").forEach((input) => {
      input.addEventListener("keydown", (event) => {
        if (event.key === "Enter") {
          event.preventDefault();
          goToRealJobSearch(buildHeroQuery());
        }
      });
    });

    // Quick tags
    const tagQueries = {
      "entry-level": "UK entry level legal compliance",
      "visa-aware": "visa sponsorship analyst",
      "english + japanese": "Japanese English legal compliance",
      "legal / compliance": "legal compliance AML"
    };

    document.querySelectorAll(".quick-tags span").forEach((tag) => {
      const text = String(tag.textContent || "").trim().toLowerCase();
      tag.style.cursor = "pointer";
      tag.setAttribute("role", "button");
      tag.setAttribute("tabindex", "0");

      const run = () => goToRealJobSearch(tagQueries[text] || text);

      tag.addEventListener("click", run);
      tag.addEventListener("keydown", (event) => {
        if (event.key === "Enter" || event.key === " ") {
          event.preventDefault();
          run();
        }
      });
    });

    // Beta / final CTA copy stays report/account unless it explicitly says jobs.
    document.querySelectorAll(".studio-card").forEach((card) => {
      const text = String(card.textContent || "").toLowerCase();

      if (text.includes("search live jobs")) {
        card.href = "jobs-search.html?q=" + encodeURIComponent("legal compliance");
      }
    });
  }

  async function boot() {
    try {
      removeOldPanels();

      await loadScript("auth-config.js");
      await loadScript("https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2");
      await loadScript("global-search.js");

      removeOldPanels();

      if (window.JAPANOFFER_SEARCH?.init) {
        window.JAPANOFFER_SEARCH.init();
      }

      connectHomepageToRealSearch();
    } catch (error) {
      console.warn("Homepage search boot failed", error);
      connectHomepageToRealSearch();
    }
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", boot);
  } else {
    boot();
  }
})();
