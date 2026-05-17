// JapanOffer AI - Step 34 Database-backed Global Search
// Loads search data from Supabase platform_items when available.
// Falls back to search-data.js static index if database is not ready.

(function () {
  let index = Array.isArray(window.JAPANOFFER_SEARCH_INDEX) ? window.JAPANOFFER_SEARCH_INDEX : [];
  let loadedFromDatabase = false;

  function clean(value) {
    return String(value || "").replace(/\s+/g, " ").trim();
  }

  function norm(value) {
    return clean(value).toLowerCase();
  }

  function typeLabel(type) {
    return {
      job: "职位",
      company: "公司",
      network: "人脉",
      page: "页面"
    }[type] || "结果";
  }

  function escapeHtml(value) {
    return String(value ?? "")
      .replaceAll("&", "&amp;")
      .replaceAll("<", "&lt;")
      .replaceAll(">", "&gt;")
      .replaceAll('"', "&quot;")
      .replaceAll("'", "&#039;");
  }

  function getConfig() {
    const url = String(window.JAPANOFFER_SUPABASE_URL || window.SUPABASE_URL || "").replace(/\/+$/, "");
    const key = String(
      window.JAPANOFFER_SUPABASE_ANON_KEY ||
      window.JAPANOFFER_SUPABASE_PUBLISHABLE_KEY ||
      window.SUPABASE_ANON_KEY ||
      window.SUPABASE_PUBLISHABLE_KEY ||
      ""
    ).trim();

    if (!url || !key || !window.supabase?.createClient) return null;
    return { url, key };
  }

  function mapPlatformItem(row) {
    return {
      type: row.item_type,
      title: row.title,
      subtitle: row.subtitle || [row.company_name, row.city || row.market, row.seniority].filter(Boolean).join(" · "),
      market: row.market || "Global",
      tags: Array.from(new Set([...(row.tags || []), ...(row.skills || []), ...(row.languages || []), row.category, row.market].filter(Boolean))),
      href: row.href || (row.item_type === "job" ? `jobs.html?q=${encodeURIComponent(row.title)}` : "#"),
      score: row.score || row.match_base || 60,
      description: row.description || "",
      raw: row
    };
  }

  async function refreshIndexFromSupabase() {
    const config = getConfig();
    if (!config) {
      window.dispatchEvent(new CustomEvent("japanoffer-search-ready", { detail: { source: "static", count: index.length } }));
      return index;
    }

    try {
      const client = window.supabase.createClient(config.url, config.key);
      const { data, error } = await client
        .from("platform_items")
        .select("*")
        .eq("is_active", true)
        .order("sort_order", { ascending: true })
        .order("score", { ascending: false });

      if (error) throw error;

      if (Array.isArray(data) && data.length) {
        index = data.map(mapPlatformItem);
        window.JAPANOFFER_SEARCH_INDEX = index;
        loadedFromDatabase = true;
        window.dispatchEvent(new CustomEvent("japanoffer-search-ready", { detail: { source: "database", count: index.length } }));
      } else {
        window.dispatchEvent(new CustomEvent("japanoffer-search-ready", { detail: { source: "static", count: index.length } }));
      }
    } catch (error) {
      console.warn("JapanOffer search database load failed. Static fallback is used.", error);
      window.dispatchEvent(new CustomEvent("japanoffer-search-ready", { detail: { source: "static", count: index.length, error: error.message } }));
    }

    return index;
  }

  function scoreItem(item, query) {
    const q = norm(query);
    if (!q) return item.score || 0;

    const title = norm(item.title);
    const subtitle = norm(item.subtitle);
    const market = norm(item.market);
    const desc = norm(item.description);
    const tags = (item.tags || []).map(norm);

    let score = item.score || 0;

    if (title.includes(q)) score += 80;
    if (title.startsWith(q)) score += 30;
    if (subtitle.includes(q)) score += 35;
    if (market.includes(q)) score += 25;
    if (desc.includes(q)) score += 20;
    if (tags.some((tag) => tag.includes(q))) score += 45;

    q.split(/\s+/).filter(Boolean).forEach((part) => {
      if (title.includes(part)) score += 16;
      if (subtitle.includes(part)) score += 9;
      if (desc.includes(part)) score += 7;
      if (tags.some((tag) => tag.includes(part))) score += 12;
    });

    return score;
  }

  function search(query, limit = 8) {
    const q = norm(query);
    if (!q) return [];

    return index
      .map((item) => ({ ...item, _score: scoreItem(item, q) }))
      .filter((item) => item._score > (item.score || 0) + 5 || norm(item.title).includes(q) || norm(item.subtitle).includes(q))
      .sort((a, b) => b._score - a._score)
      .slice(0, limit);
  }

  function findSearchInputs() {
    const inputs = Array.from(document.querySelectorAll("input"));
    return inputs.filter((input) => {
      const ph = norm(input.getAttribute("placeholder"));
      const aria = norm(input.getAttribute("aria-label"));
      const id = norm(input.id);
      return (
        ph.includes("search") ||
        ph.includes("搜索") ||
        ph.includes("role") ||
        ph.includes("company") ||
        ph.includes("talent") ||
        aria.includes("search") ||
        id.includes("search")
      );
    });
  }

  function addStyle() {
    if (document.getElementById("jo34-global-search-style")) return;

    const style = document.createElement("style");
    style.id = "jo34-global-search-style";
    style.textContent = `
      .jo33-search-wrap, .jo34-search-wrap {
        position: relative !important;
        z-index: 100;
      }

      .jo33-search-panel, .jo34-search-panel {
        position: absolute;
        top: calc(100% + 10px);
        left: 0;
        width: min(540px, calc(100vw - 34px));
        max-height: min(560px, calc(100vh - 120px));
        overflow: auto;
        background: rgba(255,255,255,.94);
        border: 1px solid rgba(7,27,54,.11);
        border-radius: 26px;
        box-shadow: 0 28px 100px rgba(7,27,54,.18);
        backdrop-filter: blur(18px);
        padding: 10px;
        display: none;
      }

      .jo33-search-panel.show, .jo34-search-panel.show {
        display: block;
        animation: jo34SearchIn .18s ease-out;
      }

      .jo34-search-head {
        display: flex;
        justify-content: space-between;
        align-items: center;
        gap: 12px;
        padding: 10px 12px 8px;
        color: #607086;
        font-size: 12px;
        font-weight: 850;
      }

      .jo34-search-head strong {
        color: #061a33;
        font-size: 13px;
      }

      .jo34-result {
        display: grid;
        grid-template-columns: 42px minmax(0, 1fr) auto;
        gap: 12px;
        align-items: center;
        padding: 13px;
        border-radius: 18px;
        color: #061a33;
        text-decoration: none;
        border: 1px solid transparent;
      }

      .jo34-result:hover,
      .jo34-result.active {
        background: rgba(10,102,194,.08);
        border-color: rgba(10,102,194,.14);
      }

      .jo34-icon {
        width: 42px;
        height: 42px;
        border-radius: 14px;
        display: grid;
        place-items: center;
        color: #fff;
        font-size: 12px;
        font-weight: 950;
        background: linear-gradient(135deg, #0a66c2, #003f88);
      }

      .jo34-result h4 {
        margin: 0;
        font-size: 14px;
        line-height: 1.25;
        letter-spacing: -.02em;
      }

      .jo34-result p {
        margin: 4px 0 0;
        color: #607086;
        font-size: 12px;
        line-height: 1.4;
        font-weight: 650;
      }

      .jo34-badge {
        display: inline-flex;
        min-height: 26px;
        align-items: center;
        padding: 0 9px;
        border-radius: 999px;
        color: #064b93;
        background: rgba(10,102,194,.09);
        font-size: 11px;
        font-weight: 900;
        white-space: nowrap;
      }

      .jo34-empty {
        padding: 18px;
        border-radius: 18px;
        background: rgba(247,250,255,.92);
        color: #607086;
        font-size: 13px;
        line-height: 1.6;
        font-weight: 700;
      }

      .jo34-quick {
        display: flex;
        flex-wrap: wrap;
        gap: 8px;
        padding: 8px 10px 12px;
      }

      .jo34-chip {
        border: 1px solid rgba(10,102,194,.16);
        background: rgba(255,255,255,.78);
        color: #0a66c2;
        border-radius: 999px;
        padding: 8px 10px;
        font-size: 12px;
        font-weight: 850;
        cursor: pointer;
      }

      @keyframes jo34SearchIn {
        from { opacity: 0; transform: translateY(8px) scale(.98); }
        to { opacity: 1; transform: translateY(0) scale(1); }
      }

      @media (max-width: 720px) {
        .jo33-search-panel, .jo34-search-panel {
          position: fixed;
          left: 14px;
          right: 14px;
          top: 82px;
          width: auto;
        }
      }
    `;
    document.head.appendChild(style);
  }

  function wrapInput(input) {
    if (input.dataset.jo34SearchBound === "1") return;
    input.dataset.jo34SearchBound = "1";

    const originalParent = input.parentElement;
    if (!originalParent) return;

    const wrap = originalParent;
    wrap.classList.add("jo34-search-wrap");

    const panel = document.createElement("div");
    panel.className = "jo34-search-panel";
    panel.innerHTML = `
      <div class="jo34-search-head">
        <strong>Search JapanOffer AI</strong>
        <span class="jo34-source">Loading data...</span>
      </div>
      <div class="jo34-results"></div>
      <div class="jo34-quick">
        <button class="jo34-chip" type="button" data-query="legal compliance">Legal compliance</button>
        <button class="jo34-chip" type="button" data-query="web3 compliance">Web3 compliance</button>
        <button class="jo34-chip" type="button" data-query="japan">Japan</button>
        <button class="jo34-chip" type="button" data-query="hong kong aml">Hong Kong AML</button>
      </div>
    `;
    wrap.appendChild(panel);

    const resultsBox = panel.querySelector(".jo34-results");
    const sourceLabel = panel.querySelector(".jo34-source");

    function updateSourceLabel() {
      sourceLabel.textContent = loadedFromDatabase ? "Database search" : "MVP search";
    }

    function render() {
      updateSourceLabel();
      const query = input.value.trim();
      const results = search(query);

      if (!query) {
        resultsBox.innerHTML = `
          <div class="jo34-empty">
            试试搜索：legal compliance、web3、Japan、Hong Kong AML、CV、申请中心。
          </div>
        `;
        panel.classList.add("show");
        return;
      }

      if (!results.length) {
        resultsBox.innerHTML = `
          <div class="jo34-empty">
            暂时没有找到「${escapeHtml(query)}」。可以换成岗位方向、国家、公司类型或技能关键词。
          </div>
        `;
        panel.classList.add("show");
        return;
      }

      resultsBox.innerHTML = results.map((item) => `
        <a class="jo34-result" href="${escapeHtml(item.href)}">
          <span class="jo34-icon">${escapeHtml(typeLabel(item.type).slice(0, 2))}</span>
          <span>
            <h4>${escapeHtml(item.title)}</h4>
            <p>${escapeHtml(item.subtitle || item.description || "")}</p>
          </span>
          <span class="jo34-badge">${escapeHtml(typeLabel(item.type))}</span>
        </a>
      `).join("");

      panel.classList.add("show");
    }

    input.addEventListener("focus", render);
    input.addEventListener("input", render);

    input.addEventListener("keydown", (event) => {
      if (event.key === "Enter") {
        event.preventDefault();
        const q = input.value.trim();
        if (q) window.location.href = `search.html?q=${encodeURIComponent(q)}`;
      }

      if (event.key === "Escape") {
        panel.classList.remove("show");
        input.blur();
      }
    });

    panel.querySelectorAll(".jo34-chip").forEach((button) => {
      button.addEventListener("click", () => {
        input.value = button.dataset.query || "";
        render();
        input.focus();
      });
    });

    document.addEventListener("click", (event) => {
      if (!wrap.contains(event.target)) {
        panel.classList.remove("show");
      }
    });

    window.addEventListener("japanoffer-search-ready", render);
  }

  function init() {
    addStyle();
    findSearchInputs().forEach(wrapInput);
  }

  window.JAPANOFFER_SEARCH = {
    search,
    init,
    refreshIndexFromSupabase,
    getIndex: () => index,
    isDatabaseLoaded: () => loadedFromDatabase
  };

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", () => {
      init();
      refreshIndexFromSupabase();
    });
  } else {
    init();
    refreshIndexFromSupabase();
  }
})();
