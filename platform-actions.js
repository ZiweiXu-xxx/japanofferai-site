// JapanOffer AI - platform action router
// Makes homepage/search/product-preview elements behave like real platform entries.

(function () {
  function go(url) {
    window.location.href = url;
  }

  function encode(value) {
    return encodeURIComponent(String(value || "").trim());
  }

  function getHeroQuery() {
    const inputs = document.querySelectorAll(".search-row input");
    return {
      query: inputs[0] ? inputs[0].value : "legal compliance business",
      market: inputs[1] ? inputs[1].value : "Japan Singapore Hong Kong"
    };
  }

  function routeToJobs(query, market) {
    const q = encode(query || "legal compliance business");
    const m = encode(market || "Japan Singapore Hong Kong Remote");
    go(`jobs.html?query=${q}&market=${m}`);
  }

  document.addEventListener("DOMContentLoaded", function () {
    // Top search bar: pressing Enter searches jobs.
    document.querySelectorAll(".top-search input").forEach((input) => {
      input.addEventListener("focus", () => {
        if (input.value === "Search roles, talent or companies") input.value = "";
      });

      input.addEventListener("keydown", (event) => {
        if (event.key === "Enter") {
          routeToJobs(input.value || "cross-border roles", "Japan Singapore Hong Kong Remote");
        }
      });
    });

    // Hero search button goes to live jobs with current values, not only assessment.
    document.querySelectorAll(".search-row a").forEach((btn) => {
      if (btn.textContent.trim().toLowerCase().includes("match now")) {
        btn.addEventListener("click", (event) => {
          event.preventDefault();
          const { query, market } = getHeroQuery();
          routeToJobs(query, market);
        });
      }
    });

    // Make quick tags searchable.
    document.querySelectorAll(".quick-tags span").forEach((tag) => {
      tag.setAttribute("role", "button");
      tag.setAttribute("tabindex", "0");
      tag.classList.add("clickable-tag");

      const action = () => {
        const text = tag.textContent.trim();
        if (text.includes("Visa")) routeToJobs("visa sponsorship international", "Japan Singapore Hong Kong Remote");
        else if (text.includes("Japanese")) routeToJobs("Japanese English bilingual", "Japan Singapore Hong Kong");
        else if (text.includes("Legal")) routeToJobs("legal compliance", "Japan Singapore Hong Kong");
        else routeToJobs("entry level graduate associate intern", "Japan Singapore Hong Kong Remote");
      };

      tag.addEventListener("click", action);
      tag.addEventListener("keydown", (event) => {
        if (event.key === "Enter") action();
      });
    });

    // Product preview sidebar.
    document.querySelectorAll(".mini-sidebar span").forEach((item) => {
      const text = item.textContent.trim().toLowerCase();
      item.setAttribute("role", "button");
      item.setAttribute("tabindex", "0");
      item.classList.add("sidebar-link");

      const action = () => {
        if (text.includes("match")) go("assessment.html");
        else if (text.includes("talent")) go("talent.html");
        else if (text.includes("role")) go("jobs.html");
        else if (text.includes("compan")) go("companies.html");
      };

      item.addEventListener("click", action);
      item.addEventListener("keydown", (event) => {
        if (event.key === "Enter") action();
      });
    });

    // Match cards in hero dashboard.
    document.querySelectorAll(".match-card").forEach((card) => {
      const title = card.querySelector("h3")?.textContent || "legal compliance business";
      const location = card.querySelector("p")?.textContent || "Japan Singapore Hong Kong";
      card.setAttribute("role", "button");
      card.setAttribute("tabindex", "0");
      card.classList.add("clickable-card");

      const action = () => routeToJobs(title, location);
      card.addEventListener("click", action);
      card.addEventListener("keydown", (event) => {
        if (event.key === "Enter") action();
      });
    });

    // Candidate strip goes to account if signed in, otherwise signup.
    document.querySelectorAll(".candidate-strip").forEach((strip) => {
      strip.classList.add("clickable-card");
      strip.addEventListener("click", (event) => {
        if (event.target.tagName.toLowerCase() === "a") return;
        go("signup.html");
      });
    });

    // Network profile panel: account/profile entry.
    document.querySelectorAll(".profile-panel").forEach((panel) => {
      panel.classList.add("clickable-card");
      panel.addEventListener("click", () => go("account.html"));
    });

    // Recommended role rows.
    document.querySelectorAll(".role-row").forEach((row) => {
      const title = row.querySelector("h4")?.textContent || "role";
      const meta = row.querySelector("p")?.textContent || "Japan Singapore Hong Kong";
      row.setAttribute("role", "button");
      row.setAttribute("tabindex", "0");
      row.classList.add("clickable-row");
      const action = () => routeToJobs(title, meta);
      row.addEventListener("click", action);
      row.addEventListener("keydown", (event) => {
        if (event.key === "Enter") action();
      });
    });

    // Employer shortlist area routes to employer page.
    document.querySelectorAll(".employer-panel, .shortlist-row").forEach((el) => {
      el.classList.add("clickable-card");
      el.addEventListener("click", () => go("employers.html"));
    });

    // Comparison cards route to matching/jobs.
    document.querySelectorAll(".compare article").forEach((card, index) => {
      card.classList.add("clickable-card");
      card.addEventListener("click", () => {
        if (index === 0) go("jobs.html");
        else go("assessment.html");
      });
    });

    // Matching engine chips.
    document.querySelectorAll(".engine-grid span").forEach((chip) => {
      chip.setAttribute("role", "button");
      chip.setAttribute("tabindex", "0");
      chip.classList.add("clickable-tag");
      const text = chip.textContent.trim();
      const action = () => routeToJobs(text, "Japan Singapore Hong Kong Remote");
      chip.addEventListener("click", action);
      chip.addEventListener("keydown", (event) => {
        if (event.key === "Enter") action();
      });
    });

    // Business cards route to the relevant product path.
    document.querySelectorAll(".business-grid article").forEach((card, index) => {
      card.classList.add("clickable-card");
      card.addEventListener("click", () => {
        if (index === 0) go("assessment.html");
        else if (index === 1) go("signup.html");
        else go("employers.html");
      });
    });
  });
})();
