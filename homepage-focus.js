// JapanOffer AI homepage focus placeholder


// Step 33: enable real global search on homepage search bar
(function () {
  function loadScript(src) {
    return new Promise((resolve, reject) => {
      if (document.querySelector(`script[src="${src}"]`)) return resolve();
      const script = document.createElement("script");
      script.src = src;
      script.onload = resolve;
      script.onerror = reject;
      document.head.appendChild(script);
    });
  }

  async function enableJapanOfferSearch() {
    try {
      await loadScript("search-data.js");
      await loadScript("global-search.js");
      if (window.JAPANOFFER_SEARCH?.init) window.JAPANOFFER_SEARCH.init();
    } catch (error) {
      console.warn("JapanOffer search failed to load", error);
    }
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", enableJapanOfferSearch);
  } else {
    enableJapanOfferSearch();
  }
})();
