// JapanOffer AI - Step 36 Global Search Fix
// Fixes:
// 1. Search panel will NOT open automatically on page load or empty focus.
// 2. Search will not show demo role-target jobs as if they were real jobs.
// 3. Jobs / companies / network results must be verified imported public data.
// 4. Functional pages can still appear as page results.

(function () {
  let fallbackIndex = Array.isArray(window.JAPANOFFER_SEARCH_INDEX) ? window.JAPANOFFER_SEARCH_INDEX : [];
  let index = fallbackIndex;
  let loadedFromDatabase = false;
  let realJobCount = 0;

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

  function isRealPublicItem(row) {
    if (!row) return false;

    // Functional pages are real pages, even if they are not imported jobs.
    if (row.item_type === "page") return true;

    // Jobs, companies and network routes must come from a verified public source.
    return Boolean(
      row.is_verified === true &&
      (row.source_url || row.apply_url || row.source_name || row.external_id)
    );
  }

  function mapPlatformItem(row) {
    const source = row.source_name ? ` · 来源：${row.source_name}` : "";
    return {
      type: row.item_type,
      title: row.title,
      subtitle: row.subtitle || [row.company_name, row.city || row.market, row.seniority].filter(Boolean).join(" · "),
      market: row.market || "Global",
      tags: Array.from(new Set([...(row.tags || []), ...(row.skills || []), ...(row.languages || []), row.category, row.market, row.source_name].filter(Boolean))),
      href: row.apply_url || row.source_url || row.href || (row.item_type === "job" ? `jobs.html?q=${encodeURIComponent(row.title)}` : "#"),
      score: row.score || row.match_base || 60,
      description: (row.description || "") + source,
      raw: row,
      isRealPublic: isRealPublicItem(row)
    };
  }

  function cleanFallbackIndex() {
    // Fallback should not pretend demo jobs are real.
    // Keep only functional pages if DB is not available.
    return fallbackIndex.filter((item) => item.type === "page");
  }

  async function refreshIndexFromSupabase() {
    const config = getConfig();

    if (!config) {
      index = cleanFallbackIndex();
      realJobCount = 0;
      window.JAPANOFFER_SEARCH_INDEX = index;
      window.dispatchEvent(new CustomEvent("japanoffer-search-ready", { detail: { source: "pages-only", count: index.length, realJobCount } }));
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

      const mapped = (Array.isArray(data) ? data : [])
        .filter(isRealPublicItem)
        .map(mapPlatformItem);

      index = mapped.length ? mapped : cleanFallbackIndex();
      realJobCount = mapped.filter((item) => item.type === "job" && item.isRealPublic).length;
      window.JAPANOFFER_SEARCH_INDEX = index;
      loadedFromDatabase = true;
      window.dispatchEvent(new CustomEvent("japanoffer-search-ready", { detail: { source: "database-real-only", count: index.length, realJobCount } }));
    } catch (error) {
      console.warn("JapanOffer search database load failed. Pages-only fallback is used.", error);
      index = cleanFallbackIndex();
      realJobCount = 0;
      window.JAPANOFFER_SEARCH_INDEX = index;
      window.dispatchEvent(new CustomEvent("japanoffer-search-ready", { detail: { source: "pages-only", count: index.length, realJobCount, error: error.message } }));
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
    if (q.length < 2) return [];

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
    if (document.getElementById("jo36-global-search-style")) return;

    const style = document.createElement("style");
    style.id = "jo36-global-search-style";
    style.textContent = `
      .jo34-search-wrap, .jo36-search-wrap {
        position: relative !important;
        z-index: 100;
      }

      .jo34-search-panel, .jo36-search-panel {
        position: absolute;
        top: calc(100% + 10px);
        left: 0;
        width: min(540px, calc(100vw - 34px));
        max-height: min(560px, calc(100vh - 120px));
        overflow: auto;
        background: rgba(255,255,255,.95);
        border: 1px solid rgba(7,27,54,.11);
        border-radius: 26px;
        box-shadow: 0 28px 100px rgba(7,27,54,.18);
        backdrop-filter: blur(18px);
        padding: 10px;
        display: none;
      }

      .jo34-search-panel.show, .jo36-search-panel.show {
        display: block;
        animation: jo36SearchIn .18s ease-out;
      }

      .jo36-search-head {
        display: flex;
        justify-content: space-between;
        align-items: center;
        gap: 12px;
        padding: 10px 12px 8px;
        color: #607086;
        font-size: 12px;
        font-weight: 850;
      }

      .jo36-search-head strong {
        color: #061a33;
        font-size: 13px;
      }

      .jo36-result {
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

      .jo36-result:hover {
        background: rgba(10,102,194,.08);
        border-color: rgba(10,102,194,.14);
      }

      .jo36-icon {
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

      .jo36-result h4 {
        margin: 0;
        font-size: 14px;
        line-height: 1.25;
        letter-spacing: -.02em;
      }

      .jo36-result p {
        margin: 4px 0 0;
        color: #607086;
        font-size: 12px;
        line-height: 1.4;
        font-weight: 650;
      }

      .jo36-badge {
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

      .jo36-empty {
        padding: 18px;
        border-radius: 18px;
        background: rgba(247,250,255,.92);
        color: #607086;
        font-size: 13px;
        line-height: 1.6;
        font-weight: 700;
      }

      .jo36-quick {
        display: flex;
        flex-wrap: wrap;
        gap: 8px;
        padding: 8px 10px 12px;
      }

      .jo36-chip {
        border: 1px solid rgba(10,102,194,.16);
        background: rgba(255,255,255,.78);
        color: #0a66c2;
        border-radius: 999px;
        padding: 8px 10px;
        font-size: 12px;
        font-weight: 850;
        cursor: pointer;
      }

      @keyframes jo36SearchIn {
        from { opacity: 0; transform: translateY(8px) scale(.98); }
        to { opacity: 1; transform: translateY(0) scale(1); }
      }

      @media (max-width: 720px) {
        .jo34-search-panel, .jo36-search-panel {
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
    if (input.dataset.jo36SearchBound === "1") return;
    input.dataset.jo36SearchBound = "1";

    const wrap = input.parentElement;
    if (!wrap) return;

    wrap.classList.add("jo36-search-wrap");

    // Remove old panels from previous step if any.
    wrap.querySelectorAll(".jo33-search-panel, .jo34-search-panel, .jo36-search-panel").forEach((el) => el.remove());

    const panel = document.createElement("div");
    panel.className = "jo36-search-panel";
    panel.innerHTML = `
      <div class="jo36-search-head">
        <strong>Search JapanOffer AI</strong>
        <span class="jo36-source">Real jobs only</span>
      </div>
      <div class="jo36-results"></div>
      <div class="jo36-quick">
        <button class="jo36-chip" type="button" data-query="legal compliance">Legal compliance</button>
        <button class="jo36-chip" type="button" data-query="web3 compliance">Web3 compliance</button>
        <button class="jo36-chip" type="button" data-query="japan">Japan</button>
        <button class="jo36-chip" type="button" data-query="hong kong aml">Hong Kong AML</button>
      </div>
    `;
    wrap.appendChild(panel);

    const resultsBox = panel.querySelector(".jo36-results");
    const sourceLabel = panel.querySelector(".jo36-source");

    function updateSourceLabel() {
      if (loadedFromDatabase) {
        sourceLabel.textContent = realJobCount ? `Database · ${realJobCount} real jobs` : "Database · no imported jobs yet";
      } else {
        sourceLabel.textContent = "Pages only";
      }
    }

    function hideIfEmpty() {
      if (!input.value.trim()) {
        panel.classList.remove("show");
        return true;
      }
      return false;
    }

    function render() {
      updateSourceLabel();

      const query = input.value.trim();

      // Important fix: do not open dropdown on empty focus/page load.
      if (!query) {
        panel.classList.remove("show");
        return;
      }

      const results = search(query);

      if (!results.length) {
        resultsBox.innerHTML = `
          <div class="jo36-empty">
            没有找到真实公开岗位结果。可能还没有成功运行「公开岗位导入」。
            <br><br>
            去 admin-jobs.html 先用 Remotive 导入一次，然后回来搜索。
          </div>
        `;
        panel.classList.add("show");
        return;
      }

      resultsBox.innerHTML = results.map((item) => {
        const isJob = item.type === "job";
        const sourceText = isJob && item.raw?.source_name ? ` · ${item.raw.source_name}` : "";
        return `
          <a class="jo36-result" href="${escapeHtml(item.href)}" ${isJob ? 'target="_blank" rel="noopener"' : ""}>
            <span class="jo36-icon">${escapeHtml(typeLabel(item.type).slice(0, 2))}</span>
            <span>
              <h4>${escapeHtml(item.title)}</h4>
              <p>${escapeHtml(item.subtitle || item.description || "")}${escapeHtml(sourceText)}</p>
            </span>
            <span class="jo36-badge">${escapeHtml(isJob ? "真实岗位" : typeLabel(item.type))}</span>
          </a>
        `;
      }).join("");

      panel.classList.add("show");
    }

    input.addEventListener("focus", () => {
      // Keep silent on focus unless there is already text.
      if (!hideIfEmpty()) render();
    });

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

    panel.querySelectorAll(".jo36-chip").forEach((button) => {
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

    window.addEventListener("japanoffer-search-ready", () => {
      if (input.value.trim()) render();
      else panel.classList.remove("show");
    });
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
    isDatabaseLoaded: () => loadedFromDatabase,
    getRealJobCount: () => realJobCount
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
