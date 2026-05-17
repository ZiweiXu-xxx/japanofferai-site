// JapanOffer AI Step 35 - Admin public jobs importer

(function () {
  const password = document.getElementById("password");
  const keywords = document.getElementById("keywords");
  const adzunaCountries = document.getElementById("adzunaCountries");
  const greenhouseBoards = document.getElementById("greenhouseBoards");
  const leverCompanies = document.getElementById("leverCompanies");
  const useRemotive = document.getElementById("useRemotive");
  const useAdzuna = document.getElementById("useAdzuna");
  const useGreenhouse = document.getElementById("useGreenhouse");
  const useLever = document.getElementById("useLever");
  const importButton = document.getElementById("importButton");
  const status = document.getElementById("status");
  const errorBox = document.getElementById("errorBox");
  const results = document.getElementById("results");
  const rawCount = document.getElementById("rawCount");
  const relevantCount = document.getElementById("relevantCount");
  const importedCount = document.getElementById("importedCount");

  function lines(value) {
    return String(value || "")
      .split(/[\n,]+/g)
      .map((item) => item.trim())
      .filter(Boolean);
  }

  function escapeHtml(value) {
    return String(value ?? "")
      .replaceAll("&", "&amp;")
      .replaceAll("<", "&lt;")
      .replaceAll(">", "&gt;")
      .replaceAll('"', "&quot;")
      .replaceAll("'", "&#039;");
  }

  function showStatus(message, type = "info") {
    status.textContent = message;
    status.className = `status show ${type}`;
  }

  function showErrors(errors) {
    if (!errors || !errors.length) {
      errorBox.className = "status";
      errorBox.textContent = "";
      return;
    }

    errorBox.className = "status show warn";
    errorBox.textContent = errors
      .slice(0, 5)
      .map((error) => `${error.source || "Source"}: ${error.message || JSON.stringify(error)}`)
      .join(" | ");
  }

  function renderJobs(jobs) {
    if (!jobs || !jobs.length) {
      results.innerHTML = `<div class="status show info">没有返回岗位。可以换关键词，或者检查 API key / board slug。</div>`;
      return;
    }

    results.innerHTML = jobs.map((job) => `
      <div class="job">
        <div>
          <h3>${escapeHtml(job.title)}</h3>
          <p>${escapeHtml(job.company)} · ${escapeHtml(job.market)} · ${escapeHtml(job.category)} · ${escapeHtml(job.source)}</p>
          ${job.url ? `<p><a href="${escapeHtml(job.url)}" target="_blank" rel="noopener">打开来源岗位</a></p>` : ""}
        </div>
        <span class="badge">${escapeHtml(job.score)} match</span>
      </div>
    `).join("");
  }

  async function runImport() {
    const adminPassword = password.value.trim();

    if (!adminPassword) {
      showStatus("请先输入 Admin password。", "error");
      return;
    }

    importButton.disabled = true;
    showStatus("正在导入公开岗位，可能需要 20-60 秒...", "info");
    errorBox.className = "status";
    results.innerHTML = "";
    rawCount.textContent = "--";
    relevantCount.textContent = "--";
    importedCount.textContent = "--";

    try {
      const payload = {
        password: adminPassword,
        keywords: lines(keywords.value),
        adzunaCountries: lines(adzunaCountries.value),
        greenhouseBoards: lines(greenhouseBoards.value),
        leverCompanies: lines(leverCompanies.value),
        sources: {
          remotive: useRemotive.checked,
          adzuna: useAdzuna.checked,
          greenhouse: useGreenhouse.checked,
          lever: useLever.checked
        },
        maxPerKeyword: 8,
        maxPerBoard: 30
      };

      const response = await fetch("/api/import-public-jobs", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });

      const data = await response.json();

      if (!response.ok || !data.ok) {
        throw new Error(data.error || `Import failed with HTTP ${response.status}`);
      }

      rawCount.textContent = data.rawCount ?? 0;
      relevantCount.textContent = data.relevantCount ?? 0;
      importedCount.textContent = data.imported ?? 0;

      showErrors(data.errors || []);
      renderJobs(data.jobs || []);
      showStatus(`导入完成：已写入 ${data.imported || 0} 个真实公开岗位。`, "success");
    } catch (error) {
      showStatus(error.message, "error");
    } finally {
      importButton.disabled = false;
    }
  }

  importButton.addEventListener("click", runImport);
})();
