// JapanOffer AI Step 37 - homepage focus hard fix
// This file intentionally focuses on fixing the homepage search behavior.
// It removes old broken search dropdowns and loads the strict Step 37 search.

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
    } catch (error) {
      console.warn("Homepage strict search boot failed", error);
    }
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", boot);
  } else {
    boot();
  }
})();
