// JapanOffer AI - Step 33 Global Search
// Makes the header search actually searchable.

(function () {
  const index = window.JAPANOFFER_SEARCH_INDEX || [];

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
    if (document.getElementById("jo33-global-search-style")) return;

    const style = document.createElement("style");
    style.id = "jo33-global-search-style";
    style.textContent = `
      .jo33-search-wrap {
        position: relative !important;
        z-index: 100;
      }

      .jo33-search-panel {
        position: absolute;
        top: calc(100% + 10px);
        left: 0;
        width: min(520px, calc(100vw - 34px));
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

      .jo33-search-panel.show {
        display: block;
        animation: jo33SearchIn .18s ease-out;
      }

      .jo33-search-head {
        display: flex;
        justify-content: space-between;
        align-items: center;
        gap: 12px;
        padding: 10px 12px 8px;
        color: #607086;
        font-size: 12px;
        font-weight: 850;
      }

      .jo33-search-head strong {
        color: #061a33;
        font-size: 13px;
      }

      .jo33-result {
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

      .jo33-result:hover,
      .jo33-result.active {
        background: rgba(10,102,194,.08);
        border-color: rgba(10,102,194,.14);
      }

      .jo33-icon {
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

      .jo33-result h4 {
        margin: 0;
        font-size: 14px;
        line-height: 1.25;
        letter-spacing: -.02em;
      }

      .jo33-result p {
        margin: 4px 0 0;
        color: #607086;
        font-size: 12px;
        line-height: 1.4;
        font-weight: 650;
      }

      .jo33-badge {
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

      .jo33-empty {
        padding: 18px;
        border-radius: 18px;
        background: rgba(247,250,255,.92);
        color: #607086;
        font-size: 13px;
        line-height: 1.6;
        font-weight: 700;
      }

      .jo33-quick {
        display: flex;
        flex-wrap: wrap;
        gap: 8px;
        padding: 8px 10px 12px;
      }

      .jo33-chip {
        border: 1px solid rgba(10,102,194,.16);
        background: rgba(255,255,255,.78);
        color: #0a66c2;
        border-radius: 999px;
        padding: 8px 10px;
        font-size: 12px;
        font-weight: 850;
        cursor: pointer;
      }

      @keyframes jo33SearchIn {
        from { opacity: 0; transform: translateY(8px) scale(.98); }
        to { opacity: 1; transform: translateY(0) scale(1); }
      }

      @media (max-width: 720px) {
        .jo33-search-panel {
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
    if (input.dataset.jo33SearchBound === "1") return;
    input.dataset.jo33SearchBound = "1";

    const originalParent = input.parentElement;
    if (!originalParent) return;

    let wrap = originalParent;
    wrap.classList.add("jo33-search-wrap");

    const panel = document.createElement("div");
    panel.className = "jo33-search-panel";
    panel.innerHTML = `
      <div class="jo33-search-head">
        <strong>Search JapanOffer AI</strong>
        <span>Enter 查看全部</span>
      </div>
      <div class="jo33-results"></div>
      <div class="jo33-quick">
        <button class="jo33-chip" type="button" data-query="legal compliance">Legal compliance</button>
        <button class="jo33-chip" type="button" data-query="web3 compliance">Web3 compliance</button>
        <button class="jo33-chip" type="button" data-query="japan">Japan</button>
        <button class="jo33-chip" type="button" data-query="hong kong aml">Hong Kong AML</button>
      </div>
    `;
    wrap.appendChild(panel);

    const resultsBox = panel.querySelector(".jo33-results");

    function render() {
      const query = input.value.trim();
      const results = search(query);

      if (!query) {
        resultsBox.innerHTML = `
          <div class="jo33-empty">
            试试搜索：legal compliance、web3、Japan、Hong Kong AML、CV、申请中心。
          </div>
        `;
        panel.classList.add("show");
        return;
      }

      if (!results.length) {
        resultsBox.innerHTML = `
          <div class="jo33-empty">
            暂时没有找到「${escapeHtml(query)}」。可以换成岗位方向、国家、公司类型或技能关键词。
          </div>
        `;
        panel.classList.add("show");
        return;
      }

      resultsBox.innerHTML = results.map((item) => `
        <a class="jo33-result" href="${escapeHtml(item.href)}">
          <span class="jo33-icon">${escapeHtml(typeLabel(item.type).slice(0, 2))}</span>
          <span>
            <h4>${escapeHtml(item.title)}</h4>
            <p>${escapeHtml(item.subtitle || item.description || "")}</p>
          </span>
          <span class="jo33-badge">${escapeHtml(typeLabel(item.type))}</span>
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

    panel.querySelectorAll(".jo33-chip").forEach((button) => {
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
  }

  function init() {
    addStyle();
    findSearchInputs().forEach(wrapInput);
  }

  window.JAPANOFFER_SEARCH = { search, init };

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
