// JapanOffer AI - Network MVP
(function () {
  const grid = document.getElementById("membersGrid");
  const tabs = Array.from(document.querySelectorAll(".tab"));
  const status = document.getElementById("networkStatus");

  const members = [
    {
      id: "m1",
      type: "candidate",
      tags: ["candidate", "legal", "japan"],
      initials: "LX",
      name: "法律合规方向候选人",
      subtitle: "LLB · 中文 / 英文 / 日语 · 目标日本",
      score: 86,
      desc: "适合连接想走日本 legal operations、KYC/AML 和合规分析路线的人。背景相近，适合互相交换申请策略。",
      pills: ["日本", "法律合规", "Entry-level"]
    },
    {
      id: "m2",
      type: "candidate",
      tags: ["candidate", "finance", "hongkong"],
      initials: "FA",
      name: "金融合规申请者",
      subtitle: "Finance · AML / Risk · 目标香港",
      score: 82,
      desc: "适合关注香港金融、银行、AML、risk operations 和虚拟资产合规的人。",
      pills: ["香港", "金融合规", "AML"]
    },
    {
      id: "m3",
      type: "candidate",
      tags: ["candidate", "finance", "singapore"],
      initials: "SG",
      name: "新加坡 FinTech 候选人",
      subtitle: "Business / Data · FinTech · 目标新加坡",
      score: 78,
      desc: "适合想投新加坡支付、金融科技、风控运营和 business analyst 路线的人。",
      pills: ["新加坡", "FinTech", "Business Analyst"]
    },
    {
      id: "m4",
      type: "employer",
      tags: ["employer", "legal", "japan"],
      initials: "JP",
      name: "日本合规招聘方向",
      subtitle: "Employer route · Compliance / Risk · Japan",
      score: 75,
      desc: "适合搜索 PayPay、Rakuten、Mercari、Coincheck 等公司的合规、风控和跨境业务岗位。",
      pills: ["日本公司", "招聘方向", "Compliance"]
    },
    {
      id: "m5",
      type: "employer",
      tags: ["employer", "finance", "hongkong"],
      initials: "HK",
      name: "香港 Web3 / 金融合规路线",
      subtitle: "Employer route · Virtual Assets · Hong Kong",
      score: 79,
      desc: "适合关注 HashKey、OKX、Animoca、HSBC 等香港金融和虚拟资产公司的用户。",
      pills: ["香港公司", "Web3", "AML / KYC"]
    },
    {
      id: "m6",
      type: "employer",
      tags: ["employer", "finance", "singapore"],
      initials: "DB",
      name: "新加坡金融科技路线",
      subtitle: "Employer route · Singapore · Payments / Banking",
      score: 77,
      desc: "适合搜索 Wise、DBS、Crypto.com、Grab Financial 等方向的合规运营和风险分析岗位。",
      pills: ["新加坡公司", "Payments", "Risk"]
    }
  ];

  function escapeHtml(value) {
    return String(value ?? "")
      .replaceAll("&", "&amp;")
      .replaceAll("<", "&lt;")
      .replaceAll(">", "&gt;")
      .replaceAll('"', "&quot;")
      .replaceAll("'", "&#039;");
  }

  function render(filter = "all") {
    const visible = filter === "all"
      ? members
      : members.filter((member) => member.tags.includes(filter));

    grid.innerHTML = visible.map((member) => `
      <article class="member-card">
        <div class="member-top">
          <div class="avatar">${escapeHtml(member.initials)}</div>
          <div>
            <h3>${escapeHtml(member.name)}</h3>
            <div class="subtitle">${escapeHtml(member.subtitle)}</div>
          </div>
          <div class="match-score">${member.score}</div>
        </div>

        <p class="member-desc">${escapeHtml(member.desc)}</p>

        <div class="pills">
          ${member.pills.map((pill) => `<span class="pill">${escapeHtml(pill)}</span>`).join("")}
        </div>

        <div class="member-actions">
          <button class="connect-btn" data-id="${escapeHtml(member.id)}">Connect</button>
          <a class="view-btn" href="match.html">匹配类似路线</a>
        </div>
      </article>
    `).join("");

    bindConnectButtons();
  }

  function bindTabs() {
    tabs.forEach((tab) => {
      tab.addEventListener("click", () => {
        tabs.forEach((item) => item.classList.remove("active"));
        tab.classList.add("active");
        render(tab.dataset.filter || "all");
      });
    });
  }

  function getSupabaseConfig() {
    const url = String(window.JAPANOFFER_SUPABASE_URL || "").replace(/\/+$/, "");
    const key = String(
      window.JAPANOFFER_SUPABASE_ANON_KEY ||
      window.JAPANOFFER_SUPABASE_PUBLISHABLE_KEY ||
      window.SUPABASE_ANON_KEY ||
      ""
    ).trim();

    if (!url || !key) return null;
    return { url, key };
  }

  async function logEvent(eventName, pagePath) {
    const config = getSupabaseConfig();
    if (!config) return;

    try {
      await fetch(`${config.url}/rest/v1/page_events`, {
        method: "POST",
        headers: {
          "apikey": config.key,
          "Authorization": `Bearer ${config.key}`,
          "Content-Type": "application/json",
          "Prefer": "return=minimal"
        },
        body: JSON.stringify({
          event_name: eventName,
          page_path: pagePath
        })
      });
    } catch (error) {
      console.warn("Failed to log network event", error);
    }
  }

  function bindConnectButtons() {
    Array.from(document.querySelectorAll(".connect-btn")).forEach((button) => {
      button.addEventListener("click", () => {
        button.classList.add("connected");
        button.textContent = "Requested";
        if (status) {
          status.classList.add("show");
          setTimeout(() => status.classList.remove("show"), 2200);
        }
        logEvent("network_connect_clicked", "/network.html");
      });
    });
  }

  bindTabs();
  render("all");
  logEvent("page_view", "/network.html");
})();
