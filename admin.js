// JapanOffer AI Admin Dashboard
// Step 19: direct browser-to-Supabase RPC using the existing auth-config.js.
// This completely avoids Vercel environment API key issues.

(function () {
  const form = document.getElementById("adminForm");
  const passwordInput = document.getElementById("adminPassword");
  const errorBox = document.getElementById("adminError");

  const metrics = document.getElementById("metrics");
  const charts = document.getElementById("charts");
  const tables = document.getElementById("tables");

  function clean(value) {
    return String(value || "").trim().replace(/\/+$/, "");
  }

  function getConfig() {
    const url = clean(window.JAPANOFFER_SUPABASE_URL);
    const key = clean(
      window.JAPANOFFER_SUPABASE_ANON_KEY ||
      window.JAPANOFFER_SUPABASE_PUBLISHABLE_KEY ||
      window.SUPABASE_ANON_KEY
    );

    if (!url || !key) {
      throw new Error(
        "Missing Supabase browser config. Check auth-config.js has window.JAPANOFFER_SUPABASE_URL and window.JAPANOFFER_SUPABASE_ANON_KEY."
      );
    }

    return { url, key };
  }

  function showError(message) {
    errorBox.style.display = "block";
    errorBox.textContent = message;
  }

  function clearError() {
    errorBox.style.display = "none";
    errorBox.textContent = "";
  }

  function setText(id, value) {
    const el = document.getElementById(id);
    if (el) el.textContent = value ?? 0;
  }

  function formatDate(value) {
    if (!value) return "—";
    try {
      return new Date(value).toLocaleString();
    } catch {
      return String(value);
    }
  }

  function renderBars(targetId, rows) {
    const container = document.getElementById(targetId);
    const data = Array.isArray(rows) ? rows : [];
    const max = Math.max(...data.map((item) => Number(item.count) || 0), 1);

    if (!data.length) {
      container.innerHTML = '<p class="admin-muted">No data yet.</p>';
      return;
    }

    container.innerHTML = data.slice(0, 8).map((item) => {
      const name = item.name || "Unknown";
      const count = Number(item.count) || 0;
      const width = Math.max(6, Math.round((count / max) * 100));
      return `
        <div class="bar-row">
          <span>${escapeHtml(name)}</span>
          <div class="bar"><i style="width:${width}%"></i></div>
          <strong>${count}</strong>
        </div>
      `;
    }).join("");
  }

  function escapeHtml(value) {
    return String(value ?? "")
      .replaceAll("&", "&amp;")
      .replaceAll("<", "&lt;")
      .replaceAll(">", "&gt;")
      .replaceAll('"', "&quot;")
      .replaceAll("'", "&#039;");
  }

  function renderReports(rows) {
    const tbody = document.getElementById("recentReports");
    const data = Array.isArray(rows) ? rows : [];

    if (!data.length) {
      tbody.innerHTML = '<tr><td colspan="4" class="admin-muted">No reports yet.</td></tr>';
      return;
    }

    tbody.innerHTML = data.slice(0, 20).map((row) => `
      <tr>
        <td>${escapeHtml(formatDate(row.created_at))}</td>
        <td>${escapeHtml(row.market || row.target_market || "—")}</td>
        <td>${escapeHtml(row.career || row.career_direction || "—")}</td>
        <td>${escapeHtml(row.match_score ?? row.score ?? "—")}</td>
      </tr>
    `).join("");
  }

  function renderEvents(rows) {
    const tbody = document.getElementById("recentEvents");
    const data = Array.isArray(rows) ? rows : [];

    if (!data.length) {
      tbody.innerHTML = '<tr><td colspan="3" class="admin-muted">No events yet.</td></tr>';
      return;
    }

    tbody.innerHTML = data.slice(0, 30).map((row) => `
      <tr>
        <td>${escapeHtml(formatDate(row.created_at))}</td>
        <td>${escapeHtml(row.event_name || "—")}</td>
        <td>${escapeHtml(row.page_path || row.path || "—")}</td>
      </tr>
    `).join("");
  }

  async function loadDashboard(password) {
    const { url, key } = getConfig();

    const response = await fetch(`${url}/rest/v1/rpc/japanoffer_admin_summary`, {
      method: "POST",
      headers: {
        "apikey": key,
        "Authorization": `Bearer ${key}`,
        "Content-Type": "application/json",
        "Accept": "application/json"
      },
      body: JSON.stringify({
        p_password: password
      })
    });

    const text = await response.text();
    let data = null;
    try {
      data = text ? JSON.parse(text) : null;
    } catch {
      data = text;
    }

    if (!response.ok) {
      const keyType = key.startsWith("sb_publishable_")
        ? "sb_publishable"
        : key.startsWith("eyJ")
          ? "legacy_anon_jwt"
          : "unknown";

      throw new Error(
        `Supabase RPC error ${response.status}: ${typeof data === "string" ? data : JSON.stringify(data)}\nkeyType=${keyType}, keyLength=${key.length}`
      );
    }

    return data || {};
  }

  function render(data) {
    setText("totalReports", data.totalReports || 0);
    setText("totalEvents", data.totalEvents || 0);
    setText("uniqueVisitors", data.uniqueVisitors || 0);
    setText("averageScore", data.averageScore || 0);

    renderBars("marketBars", data.markets);
    renderBars("careerBars", data.careers);
    renderReports(data.recentReports);
    renderEvents(data.recentEvents);

    metrics.hidden = false;
    charts.hidden = false;
    tables.hidden = false;
  }

  form.addEventListener("submit", async (event) => {
    event.preventDefault();
    clearError();

    const password = passwordInput.value.trim();
    if (!password) {
      showError("Please enter the admin password.");
      return;
    }

    form.classList.add("loading");

    try {
      const data = await loadDashboard(password);
      render(data);
    } catch (error) {
      showError(error.message || "Failed to load dashboard.");
    } finally {
      form.classList.remove("loading");
    }
  });
})();
