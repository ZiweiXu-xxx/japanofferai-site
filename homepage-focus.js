// JapanOffer AI - Step 28 Homepage Cards Fix
// Fixes homepage 01/02/03/04 cards.
// New platform routes: AI Match / Jobs / Profile CV / Network.

(function () {
  function cleanText(value) {
    return String(value || "").replace(/\s+/g, " ").trim();
  }

  function setLink(el, href) {
    if (!el) return;
    if (el.tagName === "A") {
      el.setAttribute("href", href);
      return;
    }
    if (el.dataset.jo28Bound === "1") return;
    el.dataset.jo28Bound = "1";
    el.addEventListener("click", function (event) {
      event.preventDefault();
      window.location.href = href;
    });
  }

  function includesAny(text, words) {
    const lower = String(text || "").toLowerCase();
    return words.some((word) => lower.includes(String(word).toLowerCase()));
  }

  function removeOldInjectedBlocks() {
    document.querySelectorAll(
      ".jo24-platform-nav, .jo23-focus-bar, .jo24-focus-bar, .jo25-focus-bar, .jo26-focus-bar, .jo28-platform-section"
    ).forEach((el) => el.remove());
  }

  function fixHeaderNavigation() {
    const header = document.querySelector("header");
    if (!header) return;

    Array.from(header.querySelectorAll("a, button")).forEach((el) => {
      const text = cleanText(el.textContent);
      if (!text) return;
      if (el.closest(".brand, .match-brand, .jo22-brand, .jo24-brand")) return;

      if (["Network", "Talent", "人脉", "会员", "进入人脉网络"].includes(text)) {
        el.textContent = "人脉";
        setLink(el, "network.html");
        el.classList.add("jo28-nav-link");
        return;
      }

      if (["Jobs", "岗位", "职位", "Find jobs"].includes(text)) {
        el.textContent = "职位";
        setLink(el, "jobs.html");
        el.classList.add("jo28-nav-link");
        return;
      }

      if (["Report", "AI Report", "AI 报告", "AI 匹配"].includes(text)) {
        el.textContent = "AI 匹配";
        setLink(el, "match.html");
        el.classList.add("jo28-nav-link", "jo28-nav-active");
        return;
      }

      if (["Companies", "Explore companies", "公司"].includes(text)) {
        el.textContent = "公司";
        setLink(el, "companies.html");
        el.classList.add("jo28-nav-link");
        return;
      }

      if (["Feedback", "反馈", "反馈与用户调研"].includes(text)) {
        el.textContent = "反馈";
        setLink(el, "feedback.html");
        el.classList.add("jo28-nav-link");
        return;
      }

      if (["Sign in", "Sign up", "注册", "登录", "Create account"].includes(text)) {
        el.textContent = "我的主页";
        setLink(el, "profile.html");
        el.classList.add("jo28-profile-link");
      }
    });
  }

  function fixHeroButtons() {
    Array.from(document.querySelectorAll("a, button")).forEach((el) => {
      if (el.closest("header")) return;
      const text = cleanText(el.textContent);
      if (!text) return;

      if (
        includesAny(text, [
          "中文版", "中文 ai", "中文AI", "match now", "generate report",
          "生成 ai", "生成AI", "开始匹配", "开始测评",
          "start free assessment", "free assessment"
        ])
      ) {
        el.textContent = "开始中文 AI 岗位匹配";
        setLink(el, "match.html");
        el.classList.add("jo28-primary-cta");
        return;
      }

      if (text === "Find talent" || text === "Talent" || text === "进入人脉网络") {
        el.textContent = "人脉网络";
        setLink(el, "network.html");
        el.classList.add("jo28-clean-tab");
        return;
      }

      if (text === "Explore companies" || text === "Companies") {
        el.textContent = "公司库";
        setLink(el, "companies.html");
        el.classList.add("jo28-clean-tab");
        return;
      }

      if (includesAny(text, ["english auto report", "english report", "英文报告"])) {
        el.textContent = "AI 匹配报告";
        setLink(el, "match.html");
        el.classList.add("jo28-secondary-cta");
        return;
      }

      if (text === "反馈与用户调研" || text === "反馈问卷" || text === "Feedback") {
        el.textContent = "反馈问卷";
        setLink(el, "feedback.html");
        el.classList.add("jo28-secondary-cta");
      }
    });
  }

  function findBrokenCardsSection() {
    const nodes = Array.from(document.querySelectorAll("section, main > div, .section, .cards, .features"));
    return nodes.find((node) => {
      const text = cleanText(node.textContent);
      return (
        (text.includes("Search live jobs") ||
          text.includes("Employer waitlist") ||
          text.includes("somewhere useful") ||
          text.includes("英文报告")) &&
        (text.includes("01") || text.includes("02") || text.includes("03") || text.includes("04"))
      );
    });
  }

  function replaceBrokenCards() {
    const broken = findBrokenCardsSection();
    if (broken) {
      broken.style.display = "none";
      broken.setAttribute("aria-hidden", "true");
    }

    if (document.querySelector(".jo28-platform-section")) return;

    const main = document.querySelector("main") || document.body;
    const anchor = broken || main.querySelector("section:nth-of-type(2)") || main.firstElementChild;

    const section = document.createElement("section");
    section.className = "jo28-platform-section";
    section.innerHTML = `
      <div class="jo28-platform-head">
        <span>Platform routes</span>
        <h2>不是英文报告入口，而是完整求职路径。</h2>
        <p>用户应该先完成 AI 匹配，再看职位、保存 CV、进入人脉网络。</p>
      </div>

      <div class="jo28-route-grid">
        <a class="jo28-route-card jo28-route-primary" href="match.html">
          <span class="jo28-route-num">01</span>
          <h3>中文 AI 岗位匹配</h3>
          <p>上传 CV 或输入背景，生成岗位排序、匹配分数、目标公司和申请路线。</p>
          <strong>开始匹配 →</strong>
        </a>

        <a class="jo28-route-card" href="jobs.html">
          <span class="jo28-route-num">02</span>
          <h3>职位搜索</h3>
          <p>查看跨境岗位方向，把 AI 匹配结果转化成可投递的岗位清单。</p>
          <strong>查看职位 →</strong>
        </a>

        <a class="jo28-route-card" href="profile.html">
          <span class="jo28-route-num">03</span>
          <h3>我的主页 / CV</h3>
          <p>保存个人资料和履历。之后申请岗位和生成报告时，不需要反复填写。</p>
          <strong>上传 CV →</strong>
        </a>

        <a class="jo28-route-card" href="network.html">
          <span class="jo28-route-num">04</span>
          <h3>人脉网络</h3>
          <p>发现相似背景的求职者、目标公司路线和未来可连接的招聘联系人。</p>
          <strong>进入人脉 →</strong>
        </a>
      </div>
    `;

    if (anchor && anchor.parentNode) {
      anchor.insertAdjacentElement("afterend", section);
    } else {
      main.appendChild(section);
    }
  }

  function addStyles() {
    if (document.getElementById("jo28-homepage-style")) return;

    const style = document.createElement("style");
    style.id = "jo28-homepage-style";
    style.textContent = `
      header { overflow: visible !important; }

      header nav, header .nav, header .header-nav {
        display: flex !important;
        align-items: center !important;
        gap: 18px !important;
        flex-wrap: nowrap !important;
      }

      .jo28-nav-link {
        border: 0 !important;
        outline: 0 !important;
        box-shadow: none !important;
        background: transparent !important;
        color: #243650 !important;
        text-decoration: none !important;
        font-size: 14px !important;
        font-weight: 850 !important;
        white-space: nowrap !important;
        padding: 0 !important;
        min-height: auto !important;
      }

      .jo28-nav-active { color: #0a66c2 !important; }

      .jo28-profile-link {
        color: #fff !important;
        background: linear-gradient(135deg, #0a66c2, #003f88) !important;
        border-radius: 999px !important;
        padding: 11px 16px !important;
        text-decoration: none !important;
        font-size: 14px !important;
        font-weight: 900 !important;
        box-shadow: 0 14px 30px rgba(10,102,194,.22) !important;
      }

      .jo28-primary-cta {
        background: linear-gradient(135deg, #0a66c2, #003f88) !important;
        color: #fff !important;
        border-color: transparent !important;
        box-shadow: 0 18px 44px rgba(10,102,194,.26) !important;
      }

      .jo28-secondary-cta {
        background: rgba(255,255,255,.78) !important;
        color: #0a66c2 !important;
        border: 1px solid rgba(10,102,194,.18) !important;
        box-shadow: none !important;
      }

      .jo28-clean-tab {
        border: 0 !important;
        outline: 0 !important;
        box-shadow: none !important;
        text-decoration: none !important;
        white-space: nowrap !important;
      }

      .jo28-platform-section {
        width: min(1180px, calc(100% - 44px));
        margin: 38px auto 0;
        padding: 0;
      }

      .jo28-platform-head {
        display: grid;
        grid-template-columns: minmax(0, 1fr) minmax(240px, 430px);
        gap: 22px;
        align-items: end;
        margin-bottom: 16px;
      }

      .jo28-platform-head span {
        grid-column: 1 / -1;
        display: inline-flex;
        color: #0a66c2;
        text-transform: uppercase;
        letter-spacing: .16em;
        font-size: 11px;
        font-weight: 950;
      }

      .jo28-platform-head h2 {
        margin: 0;
        color: #061a33;
        font-size: clamp(30px, 3.8vw, 50px);
        line-height: 1.02;
        letter-spacing: -.06em;
        font-weight: 950;
      }

      .jo28-platform-head p {
        margin: 0;
        color: #53667d;
        font-size: 14px;
        line-height: 1.7;
        font-weight: 680;
      }

      .jo28-route-grid {
        display: grid;
        grid-template-columns: repeat(4, minmax(0, 1fr));
        gap: 16px;
      }

      .jo28-route-card {
        min-height: 250px;
        display: flex;
        flex-direction: column;
        padding: 24px;
        border-radius: 30px;
        text-decoration: none;
        color: #061a33;
        background:
          linear-gradient(180deg, rgba(255,255,255,.88), rgba(255,255,255,.74)),
          radial-gradient(circle at top right, rgba(10,102,194,.10), transparent 34%);
        border: 1px solid rgba(7,27,54,.10);
        box-shadow: 0 24px 80px rgba(10,35,68,.10);
        backdrop-filter: blur(16px);
        transition: transform .18s ease, box-shadow .18s ease;
      }

      .jo28-route-card:hover {
        transform: translateY(-3px);
        box-shadow: 0 28px 90px rgba(10,35,68,.14);
      }

      .jo28-route-primary {
        background: linear-gradient(135deg, rgba(10,102,194,.98), rgba(0,63,136,.96));
        color: #fff;
      }

      .jo28-route-num {
        color: #0a66c2;
        font-size: 13px;
        font-weight: 950;
        letter-spacing: .12em;
      }

      .jo28-route-primary .jo28-route-num {
        color: rgba(255,255,255,.78);
      }

      .jo28-route-card h3 {
        margin: 44px 0 12px;
        font-size: 24px;
        line-height: 1.08;
        letter-spacing: -.05em;
        font-weight: 950;
      }

      .jo28-route-card p {
        margin: 0;
        color: #53667d;
        font-size: 13px;
        line-height: 1.68;
        font-weight: 650;
      }

      .jo28-route-primary p {
        color: rgba(255,255,255,.78);
      }

      .jo28-route-card strong {
        display: block;
        margin-top: auto;
        padding-top: 18px;
        color: #0a66c2;
        font-size: 14px;
        font-weight: 950;
      }

      .jo28-route-primary strong {
        color: #fff;
      }

      @media (max-width: 1000px) {
        .jo28-route-grid { grid-template-columns: repeat(2, minmax(0, 1fr)); }
        .jo28-platform-head { grid-template-columns: 1fr; }
      }

      @media (max-width: 640px) {
        header nav a:nth-child(n+5),
        header .nav a:nth-child(n+5),
        header .header-nav a:nth-child(n+5) {
          display: none !important;
        }

        .jo28-platform-section { width: min(100% - 28px, 1180px); }
        .jo28-route-grid { grid-template-columns: 1fr; }
        .jo28-route-card { min-height: auto; }
        .jo28-route-card h3 { margin-top: 28px; }
      }
    `;
    document.head.appendChild(style);
  }

  function run() {
    addStyles();
    removeOldInjectedBlocks();
    fixHeaderNavigation();
    fixHeroButtons();
    replaceBrokenCards();
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", run);
  } else {
    run();
  }
})();
