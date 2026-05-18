// JapanOffer AI Step 37 - Hard search UX fix
// Strict rules:
// - Never open dropdown on page load.
// - Never open dropdown just because the input is focused.
// - Never show demo jobs.
// - On homepage, if no real job results, keep quiet instead of showing an ugly warning box.
// - Press Enter to open search.html.

(function () {
  let index = [];
  let loaded = false;
  let realJobCount = 0;

  function clean(value) {
    return String(value || "").replace(/\s+/g, " ").trim();
  }

  function norm(value) {
    return clean(value).toLowerCase();
  }

  function escapeHtml(value) {
    return String(value ?? "")
      .replaceAll("&", "&amp;")
      .replaceAll("<", "&lt;")
      .replaceAll(">", "&gt;")
      .replaceAll('"', "&quot;")
      .replaceAll("'", "&#039;");
  }

  function typeLabel(type) {
    return { job: "职位", company: "公司", network: "人脉", page: "页面" }[type] || "结果";
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
    if (row.item_type === "page") return true;

    return Boolean(
      row.is_verified === true &&
      (row.source_url || row.apply_url || row.source_name || row.external_id)
    );
  }

  function mapItem(row) {
    return {
      type: row.item_type,
      title: row.title,
      subtitle: row.subtitle || [row.company_name, row.city || row.market, row.seniority].filter(Boolean).join(" · "),
      market: row.market || "Global",
      tags: Array.from(new Set([...(row.tags || []), ...(row.skills || []), ...(row.languages || []), row.category, row.market, row.source_name].filter(Boolean))),
      href: row.apply_url || row.source_url || row.href || (row.item_type === "job" ? `jobs.html?q=${encodeURIComponent(row.title)}` : "#"),
      score: row.score || row.match_base || 60,
      description: row.description || "",
      raw: row
    };
  }

  function pageFallbackItems() {
    return [
      {
        type: "page",
        title: "中文 AI 岗位匹配",
        subtitle: "输入背景或调用 Profile / CV，生成岗位方向和目标公司",
        market: "Global",
        tags: ["ai match", "match", "中文", "岗位匹配", "report"],
        href: "match.html",
        score: 90,
        description: "用中文描述背景，系统自动输出岗位推荐和方向判断。"
      },
      {
        type: "page",
        title: "职位页",
        subtitle: "查看导入后的公开岗位",
        market: "Global",
        tags: ["jobs", "职位", "岗位"],
        href: "jobs.html",
        score: 88,
        description: "查看真实公开岗位。"
      },
      {
        type: "page",
        title: "我的主页 / CV",
        subtitle: "上传和保存个人履历",
        market: "Global",
        tags: ["profile", "cv", "resume", "履历"],
        href: "profile.html",
        score: 84,
        description: "保存个人资料和 CV。"
      }
    ];
  }

  async function refreshIndexFromSupabase() {
    const config = getConfig();

    if (!config) {
      index = pageFallbackItems();
      realJobCount = 0;
      loaded = true;
      window.dispatchEvent(new CustomEvent("japanoffer-search-ready", { detail: { source: "fallback", realJobCount } }));
      return index;
    }

    try {
      const client = window.supabase.createClient(config.url, config.key);
      const { data, error } = await client
        .from("platform_items")
        .select("*")
        .eq("is_active", true)
        .order("last_seen_at", { ascending: false })
        .order("score", { ascending: false });

      if (error) throw error;

      const mapped = (Array.isArray(data) ? data : [])
        .filter(isRealPublicItem)
        .map(mapItem);

      const realJobs = mapped.filter((item) => item.type === "job" && item.raw?.is_verified === true);
      realJobCount = realJobs.length;

      const pages = pageFallbackItems();

      // Keep functional pages searchable, but jobs/companies/network only if real imported.
      index = [
        ...realJobs,
        ...mapped.filter((item) => item.type !== "job" && item.type !== "company" && item.type !== "network"),
        ...pages
      ];

      // Remove duplicates by href + title.
      const seen = new Set();
      index = index.filter((item) => {
        const key = `${item.type}:${item.title}:${item.href}`;
        if (seen.has(key)) return false;
        seen.add(key);
        return true;
      });

      loaded = true;
      window.dispatchEvent(new CustomEvent("japanoffer-search-ready", { detail: { source: "database", realJobCount } }));
    } catch (error) {
      console.warn("Search DB load failed", error);
      index = pageFallbackItems();
      realJobCount = 0;
      loaded = true;
      window.dispatchEvent(new CustomEvent("japanoffer-search-ready", { detail: { source: "fallback", realJobCount, error: error.message } }));
    }

    return index;
  }

  function scoreItem(item, query) {
    const q = norm(query);
    if (!q || q.length < 2) return 0;

    const title = norm(item.title);
    const subtitle = norm(item.subtitle);
    const market = norm(item.market);
    const desc = norm(item.description);
    const tags = (item.tags || []).map(norm);

    let score = item.score || 0;

    if (title.includes(q)) score += 80;
    if (title.startsWith(q)) score += 25;
    if (subtitle.includes(q)) score += 35;
    if (market.includes(q)) score += 25;
    if (desc.includes(q)) score += 18;
    if (tags.some((tag) => tag.includes(q))) score += 45;

    q.split(/\s+/).filter(Boolean).forEach((part) => {
      if (part.length < 2) return;
      if (title.includes(part)) score += 15;
      if (subtitle.includes(part)) score += 9;
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
    return Array.from(document.querySelectorAll("input")).filter((input) => {
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
    if (document.getElementById("jo37-search-style")) return;

    const style = document.createElement("style");
    style.id = "jo37-search-style";
    style.textContent = `
      .jo33-search-panel,
      .jo34-search-panel,
      .jo36-search-panel {
        display: none !important;
      }

      .jo37-search-wrap {
        position: relative !important;
        z-index: 100;
      }

      .jo37-search-panel {
        position: absolute;
        top: calc(100% + 10px);
        left: 0;
        width: min(540px, calc(100vw - 34px));
        max-height: min(560px, calc(100vh - 120px));
        overflow: auto;
        background: rgba(255,255,255,.96);
        border: 1px solid rgba(7,27,54,.11);
        border-radius: 26px;
        box-shadow: 0 28px 100px rgba(7,27,54,.18);
        backdrop-filter: blur(18px);
        padding: 10px;
        display: none;
      }

      .jo37-search-panel.show {
        display: block;
        animation: jo37SearchIn .18s ease-out;
      }

      .jo37-search-head {
        display: flex;
        justify-content: space-between;
        align-items: center;
        gap: 12px;
        padding: 10px 12px 8px;
        color: #607086;
        font-size: 12px;
        font-weight: 850;
      }

      .jo37-search-head strong {
        color: #061a33;
        font-size: 13px;
      }

      .jo37-result {
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

      .jo37-result:hover {
        background: rgba(10,102,194,.08);
        border-color: rgba(10,102,194,.14);
      }

      .jo37-icon {
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

      .jo37-result h4 {
        margin: 0;
        font-size: 14px;
        line-height: 1.25;
        letter-spacing: -.02em;
      }

      .jo37-result p {
        margin: 4px 0 0;
        color: #607086;
        font-size: 12px;
        line-height: 1.4;
        font-weight: 650;
      }

      .jo37-badge {
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

      @keyframes jo37SearchIn {
        from { opacity: 0; transform: translateY(8px) scale(.98); }
        to { opacity: 1; transform: translateY(0) scale(1); }
      }

      @media (max-width: 720px) {
        .jo37-search-panel {
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

  function rebuildInput(input) {
    if (input.dataset.jo37SearchBound === "1") return input;

    // Hard reset: clone input to remove old focus/input listeners from previous broken versions.
    const clone = input.cloneNode(true);
    clone.dataset.jo37SearchBound = "1";
    clone.value = "";
    input.replaceWith(clone);
    return clone;
  }

  function bindInput(originalInput) {
    const input = rebuildInput(originalInput);
    const wrap = input.parentElement;
    if (!wrap) return;

    wrap.classList.add("jo37-search-wrap");
    wrap.querySelectorAll(".jo33-search-panel, .jo34-search-panel, .jo36-search-panel, .jo37-search-panel").forEach((el) => el.remove());

    const panel = document.createElement("div");
    panel.className = "jo37-search-panel";
    panel.innerHTML = `
      <div class="jo37-search-head">
        <strong>Search JapanOffer AI</strong>
        <span class="jo37-source">Type to search</span>
      </div>
      <div class="jo37-results"></div>
    `;
    wrap.appendChild(panel);

    const resultsBox = panel.querySelector(".jo37-results");
    const sourceLabel = panel.querySelector(".jo37-source");

    function hide() {
      panel.classList.remove("show");
      resultsBox.innerHTML = "";
    }

    function render() {
      const query = input.value.trim();

      if (query.length < 2) {
        hide();
        return;
      }

      const results = search(query, 8);

      // On homepage, if there are no results, stay quiet. Do not show ugly warning dropdown.
      if (!results.length) {
        hide();
        return;
      }

      sourceLabel.textContent = realJobCount ? `Database · ${realJobCount} real jobs` : "Pages only";

      resultsBox.innerHTML = results.map((item) => {
        const isJob = item.type === "job";
        const source = isJob && item.raw?.source_name ? ` · ${item.raw.source_name}` : "";
        return `
          <a class="jo37-result" href="${escapeHtml(item.href)}" ${isJob ? 'target="_blank" rel="noopener"' : ""}>
            <span class="jo37-icon">${escapeHtml(typeLabel(item.type).slice(0, 2))}</span>
            <span>
              <h4>${escapeHtml(item.title)}</h4>
              <p>${escapeHtml(item.subtitle || item.description || "")}${escapeHtml(source)}</p>
            </span>
            <span class="jo37-badge">${escapeHtml(isJob ? "真实岗位" : typeLabel(item.type))}</span>
          </a>
        `;
      }).join("");

      panel.classList.add("show");
    }

    // No focus popup. Only typing triggers search.
    input.addEventListener("focus", hide);
    input.addEventListener("click", () => {
      if (input.value.trim().length < 2) hide();
    });
    input.addEventListener("input", render);

    input.addEventListener("keydown", (event) => {
      if (event.key === "Enter") {
        event.preventDefault();
        const q = input.value.trim();
        if (q) window.location.href = `search.html?q=${encodeURIComponent(q)}`;
      }

      if (event.key === "Escape") {
        hide();
        input.blur();
      }
    });

    document.addEventListener("click", (event) => {
      if (!wrap.contains(event.target)) hide();
    });

    window.addEventListener("japanoffer-search-ready", () => {
      if (input.value.trim().length >= 2) render();
      else hide();
    });
  }

  function init() {
    addStyle();
    findSearchInputs().forEach(bindInput);
  }

  window.JAPANOFFER_SEARCH = {
    search,
    init,
    refreshIndexFromSupabase,
    getIndex: () => index,
    getRealJobCount: () => realJobCount,
    isDatabaseLoaded: () => loaded
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
