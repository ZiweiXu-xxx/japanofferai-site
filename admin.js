(function () {
  const form = document.getElementById("adminLogin");
  const output = document.getElementById("adminOutput");

  function barRows(items) {
    if (!items || !items.length) return "<p>No data yet.</p>";
    const max = Math.max(...items.map((x) => x.count), 1);
    return items.map((item) => `
      <div class="bar-row">
        <strong>${item.label || "Unknown"}</strong><span>${item.count}</span>
        <div class="bar"><i style="width:${Math.max(6, (item.count / max) * 100)}%"></i></div>
      </div>
    `).join("");
  }

  function recentRows(items) {
    if (!items || !items.length) return "<p>No reports yet.</p>";
    return `<div class="recent-list">${items.map((item) => `
      <div class="recent-item">
        <strong>${item.career || "Unknown career"} · ${item.market || "Unknown market"} · ${item.score || "-"}%</strong>
        <span>${item.user_email || item.anonymous_id || "anonymous"} · ${new Date(item.created_at).toLocaleString()}</span>
      </div>
    `).join("")}</div>`;
  }

  function render(data) {
    output.innerHTML = `
      <section class="admin-grid">
        <article class="admin-card"><span>Total reports</span><strong>${data.totalReports}</strong></article>
        <article class="admin-card"><span>Unique visitors</span><strong>${data.uniqueVisitors}</strong></article>
        <article class="admin-card"><span>Page views</span><strong>${data.pageViews}</strong></article>
        <article class="admin-card"><span>Avg score</span><strong>${data.averageScore}%</strong></article>
      </section>

      <section class="admin-panels">
        <article class="admin-panel"><h2>Target markets</h2>${barRows(data.marketBreakdown)}</article>
        <article class="admin-panel"><h2>Career directions</h2>${barRows(data.careerBreakdown)}</article>
        <article class="admin-panel"><h2>Languages mentioned</h2>${barRows(data.languageBreakdown)}</article>
        <article class="admin-panel"><h2>Recent reports</h2>${recentRows(data.recentReports)}</article>
      </section>
    `;
  }

  form.addEventListener("submit", async function (event) {
    event.preventDefault();
    output.innerHTML = '<div class="admin-panel"><h2>Loading...</h2><p>Reading Supabase summary.</p></div>';

    try {
      const response = await fetch("/api/admin-summary", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password: document.getElementById("adminPassword").value })
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Unable to load dashboard");
      render(data);
    } catch (error) {
      output.innerHTML = `<div class="admin-error">${error.message}</div>`;
    }
  });
})();
