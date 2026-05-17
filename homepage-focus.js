// JapanOffer AI - Step 25 Homepage Navigation Fix
// Fixes the duplicate/ugly navigation created in Step 24.
// Keeps the homepage clean and makes AI Match the main CTA.

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

    if (el.dataset.jo25Bound === "1") return;
    el.dataset.jo25Bound = "1";

    el.addEventListener("click", function (event) {
      event.preventDefault();
      window.location.href = href;
    });
  }

  function setText(el, text) {
    if (!el || !text) return;
    el.textContent = text;
  }

  function includesAny(text, words) {
    const lower = text.toLowerCase();
    return words.some((word) => lower.includes(String(word).toLowerCase()));
  }

  function isInsideHeader(el) {
    return Boolean(el.closest("header"));
  }

  function removeOldInjectedNav() {
    // Remove the Step 24 injected nav that caused duplicate top navigation.
    document.querySelectorAll(".jo24-platform-nav, .jo23-focus-bar, .jo24-focus-bar").forEach((el) => {
      el.remove();
    });
  }

  function fixHeaderNavigation() {
    const header = document.querySelector("header");
    if (!header) return;

    const links = Array.from(header.querySelectorAll("a, button"));

    links.forEach((el) => {
      const text = cleanText(el.textContent);
      if (!text) return;

      // Keep brand/logo untouched
      if (el.closest(".brand, .match-brand, .jo22-brand, .jo24-brand")) return;

      if (text === "Network" || text === "Talent" || text === "人脉" || text === "会员" || text === "进入人脉网络") {
        setText(el, "人脉");
        setLink(el, "network.html");
        el.classList.add("jo25-nav-link");
        return;
      }

      if (text === "Jobs" || text === "岗位" || text === "职位" || text === "Find jobs") {
        setText(el, "职位");
        setLink(el, "jobs.html");
        el.classList.add("jo25-nav-link");
        return;
      }

      if (text === "Report" || text === "AI Report" || text === "AI 报告" || text === "AI 匹配") {
        setText(el, "AI 匹配");
        setLink(el, "match.html");
        el.classList.add("jo25-nav-link", "jo25-nav-active");
        return;
      }

      if (text === "Companies" || text === "Explore companies" || text === "公司") {
        setText(el, "公司");
        setLink(el, "companies.html");
        el.classList.add("jo25-nav-link");
        return;
      }

      if (text === "Feedback" || text === "反馈" || text === "反馈与用户调研") {
        setText(el, "反馈");
        setLink(el, "feedback.html");
        el.classList.add("jo25-nav-link");
        return;
      }
    });
  }

  function fixHeroButtons() {
    const clickable = Array.from(document.querySelectorAll("a, button"));

    clickable.forEach((el) => {
      if (isInsideHeader(el)) return;

      const text = cleanText(el.textContent);
      if (!text) return;

      if (
        includesAny(text, [
          "中文版",
          "中文 ai",
          "中文AI",
          "match now",
          "generate report",
          "生成 ai",
          "生成AI",
          "开始匹配",
          "开始测评",
          "start free assessment",
          "free assessment"
        ])
      ) {
        setText(el, "开始中文 AI 岗位匹配");
        setLink(el, "match.html");
        el.classList.add("jo25-primary-cta");
        return;
      }

      // Do not create long text like “进入人脉网络” inside small tab buttons.
      if (text === "Find talent" || text === "Talent" || text === "进入人脉网络") {
        setText(el, "人脉网络");
        setLink(el, "network.html");
        el.classList.add("jo25-clean-tab");
        return;
      }

      if (text === "Explore companies" || text === "Companies") {
        setText(el, "公司库");
        setLink(el, "companies.html");
        el.classList.add("jo25-clean-tab");
        return;
      }

      if (includesAny(text, ["english auto report", "english report", "英文报告"])) {
        setText(el, "英文报告");
        setLink(el, "report.html");
        el.classList.add("jo25-secondary-cta");
        return;
      }

      if (text === "反馈与用户调研" || text === "反馈问卷" || text === "Feedback") {
        setText(el, "反馈问卷");
        setLink(el, "feedback.html");
        el.classList.add("jo25-secondary-cta");
      }
    });
  }

  function injectCleanFocusBar() {
    if (document.querySelector(".jo25-focus-bar")) return;

    const main = document.querySelector("main") || document.body;
    const firstSection = main.querySelector("section") || main.firstElementChild;

    const bar = document.createElement("section");
    bar.className = "jo25-focus-bar";
    bar.innerHTML = `
      <div class="jo25-focus-inner">
        <div>
          <span class="jo25-kicker">Main product entrance</span>
          <h2>先 AI 匹配，再看职位、人脉和公司。</h2>
          <p>JapanOffer AI 的主入口是中文 AI 岗位匹配。用户先输入背景，获得岗位排序、目标公司和跨境申请路线，再进入职位、人脉和公司页面。</p>
        </div>
        <div class="jo25-focus-actions">
          <a class="jo25-focus-primary" href="match.html">开始中文 AI 岗位匹配</a>
          <a class="jo25-focus-secondary" href="network.html">浏览人脉网络</a>
          <a class="jo25-focus-secondary" href="jobs.html">查看职位</a>
        </div>
      </div>
    `;

    if (firstSection && firstSection.parentNode) {
      firstSection.insertAdjacentElement("afterend", bar);
    } else {
      main.appendChild(bar);
    }
  }

  function addStyles() {
    if (document.getElementById("jo25-homepage-fix-style")) return;

    const style = document.createElement("style");
    style.id = "jo25-homepage-fix-style";
    style.textContent = `
      header {
        overflow: visible !important;
      }

      header nav,
      header .nav,
      header .header-nav {
        display: flex !important;
        align-items: center !important;
        gap: 18px !important;
        flex-wrap: nowrap !important;
      }

      .jo25-nav-link {
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

      .jo25-nav-active {
        color: #0a66c2 !important;
      }

      .jo25-primary-cta,
      .jo25-focus-primary {
        background: linear-gradient(135deg, #0a66c2, #003f88) !important;
        color: #fff !important;
        border-color: transparent !important;
        box-shadow: 0 18px 44px rgba(10,102,194,.26) !important;
      }

      .jo25-secondary-cta {
        background: rgba(255,255,255,.78) !important;
        color: #0a66c2 !important;
        border: 1px solid rgba(10,102,194,.18) !important;
        box-shadow: none !important;
      }

      .jo25-clean-tab {
        border: 0 !important;
        outline: 0 !important;
        box-shadow: none !important;
        text-decoration: none !important;
        white-space: nowrap !important;
      }

      .jo25-clean-tab:focus,
      .jo25-clean-tab:active {
        outline: none !important;
        box-shadow: none !important;
      }

      .jo25-focus-bar {
        width: min(1180px, calc(100% - 44px));
        margin: 28px auto 0;
        padding: 0;
      }

      .jo25-focus-inner {
        display: grid;
        grid-template-columns: minmax(0, 1fr) auto;
        gap: 24px;
        align-items: center;
        padding: 26px;
        border-radius: 30px;
        background:
          linear-gradient(135deg, rgba(255,255,255,.88), rgba(238,246,255,.88)),
          radial-gradient(circle at right, rgba(10,102,194,.14), transparent 34%);
        border: 1px solid rgba(7,27,54,.10);
        box-shadow: 0 24px 80px rgba(10,35,68,.10);
        backdrop-filter: blur(16px);
      }

      .jo25-kicker {
        display: inline-flex;
        color: #0a66c2;
        text-transform: uppercase;
        letter-spacing: .16em;
        font-size: 11px;
        font-weight: 950;
        margin-bottom: 9px;
      }

      .jo25-focus-inner h2 {
        margin: 0;
        color: #061a33;
        font-size: clamp(26px, 3vw, 42px);
        line-height: 1.05;
        letter-spacing: -.055em;
        font-weight: 950;
      }

      .jo25-focus-inner p {
        max-width: 720px;
        margin: 12px 0 0;
        color: #53667d;
        font-size: 14px;
        line-height: 1.7;
        font-weight: 680;
      }

      .jo25-focus-actions {
        display: grid;
        gap: 10px;
        min-width: 230px;
      }

      .jo25-focus-primary,
      .jo25-focus-secondary {
        min-height: 44px;
        display: inline-flex;
        align-items: center;
        justify-content: center;
        border-radius: 999px;
        padding: 0 16px;
        text-decoration: none;
        font-weight: 950;
        font-size: 14px;
        white-space: nowrap;
      }

      .jo25-focus-secondary {
        color: #0a66c2;
        background: rgba(255,255,255,.76);
        border: 1px solid rgba(10,102,194,.18);
      }

      @media (max-width: 900px) {
        .jo25-focus-inner {
          grid-template-columns: 1fr;
        }

        .jo25-focus-actions {
          min-width: 0;
        }
      }

      @media (max-width: 640px) {
        header nav a:nth-child(n+5),
        header .nav a:nth-child(n+5),
        header .header-nav a:nth-child(n+5) {
          display: none !important;
        }
      }
    `;

    document.head.appendChild(style);
  }

  function run() {
    addStyles();
    removeOldInjectedNav();
    fixHeaderNavigation();
    fixHeroButtons();
    injectCleanFocusBar();
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", run);
  } else {
    run();
  }
})();
