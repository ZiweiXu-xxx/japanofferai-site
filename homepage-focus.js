// JapanOffer AI - Step 23 Homepage Focus
// Goal: make Chinese AI Match Entry the main product entrance,
// and turn repeated buttons into clear auxiliary routes.

(function () {
  function cleanText(value) {
    return String(value || "").replace(/\s+/g, " ").trim();
  }

  function isElementVisible(el) {
    if (!el) return false;
    const rect = el.getBoundingClientRect();
    return rect.width > 0 && rect.height > 0;
  }

  function setLink(el, href) {
    if (!el) return;

    if (el.tagName === "A") {
      el.setAttribute("href", href);
      return;
    }

    el.addEventListener("click", function (event) {
      event.preventDefault();
      window.location.href = href;
    });
  }

  function setText(el, text) {
    if (!el || !text) return;
    el.textContent = text;
  }

  function markPrimary(el) {
    if (!el) return;
    el.classList.add("jo23-primary-cta");
  }

  function markSecondary(el) {
    if (!el) return;
    el.classList.add("jo23-secondary-cta");
  }

  function textIncludes(text, words) {
    return words.some((word) => text.toLowerCase().includes(word.toLowerCase()));
  }

  function upgradeButtons() {
    const clickable = Array.from(document.querySelectorAll("a, button"));

    clickable.forEach((el) => {
      const text = cleanText(el.textContent);

      if (!text) return;

      // Main Chinese AI matching entrance
      if (
        textIncludes(text, [
          "中文版",
          "中文",
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
        markPrimary(el);
        return;
      }

      // English report is secondary
      if (
        textIncludes(text, [
          "english auto report",
          "english report",
          "英文报告"
        ])
      ) {
        setText(el, "英文报告辅助入口");
        setLink(el, "report.html");
        markSecondary(el);
        return;
      }

      // Feedback / survey
      if (
        textIncludes(text, [
          "反馈",
          "问卷",
          "survey",
          "feedback"
        ])
      ) {
        setText(el, "反馈与用户调研");
        setLink(el, "feedback.html");
        markSecondary(el);
        return;
      }

      // Jobs
      if (
        text === "Jobs" ||
        text === "岗位" ||
        textIncludes(text, ["find jobs", "找岗位", "职位"])
      ) {
        setLink(el, "jobs.html");
        return;
      }

      // Companies
      if (
        text === "Companies" ||
        text === "公司" ||
        textIncludes(text, ["explore companies", "公司库"])
      ) {
        setLink(el, "companies.html");
        return;
      }

      // Employers
      if (
        text === "Employers" ||
        text === "企业" ||
        textIncludes(text, ["employer"])
      ) {
        setLink(el, "employers.html");
        return;
      }
    });
  }

  function upgradeNavigation() {
    const navLinks = Array.from(document.querySelectorAll("nav a, header a"));

    navLinks.forEach((a) => {
      const text = cleanText(a.textContent);

      if (!text) return;

      if (text === "Network" || text === "网络") {
        a.textContent = "AI 匹配";
        a.setAttribute("href", "match.html");
      }

      if (text === "Report" || text === "AI Report" || text === "AI 报告") {
        a.textContent = "AI 匹配";
        a.setAttribute("href", "match.html");
      }

      if (text === "Jobs" || text === "岗位") {
        a.setAttribute("href", "jobs.html");
      }

      if (text === "Companies" || text === "公司") {
        a.setAttribute("href", "companies.html");
      }

      if (text === "Feedback" || text === "反馈") {
        a.setAttribute("href", "feedback.html");
      }
    });
  }

  function injectFocusBar() {
    if (document.querySelector(".jo23-focus-bar")) return;

    const main = document.querySelector("main") || document.body;
    const firstSection = main.querySelector("section") || main.firstElementChild;

    const bar = document.createElement("section");
    bar.className = "jo23-focus-bar";
    bar.innerHTML = `
      <div class="jo23-focus-inner">
        <div>
          <span class="jo23-kicker">Main product entrance</span>
          <h2>先做中文 AI 岗位匹配，再看岗位和公司。</h2>
          <p>JapanOffer AI 的主打功能不是普通问卷，而是根据用户背景直接输出岗位排序、匹配分数、目标公司和跨境申请路线。</p>
        </div>
        <div class="jo23-focus-actions">
          <a class="jo23-focus-primary" href="match.html">开始中文 AI 岗位匹配</a>
          <a class="jo23-focus-secondary" href="jobs.html">查看岗位页</a>
          <a class="jo23-focus-secondary" href="feedback.html">反馈与用户调研</a>
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
    if (document.getElementById("jo23-homepage-focus-style")) return;

    const style = document.createElement("style");
    style.id = "jo23-homepage-focus-style";
    style.textContent = `
      .jo23-primary-cta,
      .jo23-focus-primary {
        background: linear-gradient(135deg, #0a66c2, #003f88) !important;
        color: #fff !important;
        border-color: transparent !important;
        box-shadow: 0 18px 44px rgba(10,102,194,.26) !important;
      }

      .jo23-secondary-cta {
        background: rgba(255,255,255,.72) !important;
        color: #0a66c2 !important;
        border: 1px solid rgba(10,102,194,.18) !important;
      }

      .jo23-focus-bar {
        width: min(1180px, calc(100% - 44px));
        margin: 28px auto 0;
        padding: 0;
      }

      .jo23-focus-inner {
        display: grid;
        grid-template-columns: minmax(0, 1fr) auto;
        gap: 24px;
        align-items: center;
        padding: 26px;
        border-radius: 30px;
        background:
          linear-gradient(135deg, rgba(255,255,255,.86), rgba(238,246,255,.86)),
          radial-gradient(circle at right, rgba(10,102,194,.14), transparent 34%);
        border: 1px solid rgba(7,27,54,.10);
        box-shadow: 0 24px 80px rgba(10,35,68,.10);
        backdrop-filter: blur(16px);
      }

      .jo23-kicker {
        display: inline-flex;
        color: #0a66c2;
        text-transform: uppercase;
        letter-spacing: .16em;
        font-size: 11px;
        font-weight: 950;
        margin-bottom: 9px;
      }

      .jo23-focus-inner h2 {
        margin: 0;
        color: #061a33;
        font-size: clamp(26px, 3vw, 42px);
        line-height: 1.05;
        letter-spacing: -.055em;
        font-weight: 950;
      }

      .jo23-focus-inner p {
        max-width: 720px;
        margin: 12px 0 0;
        color: #53667d;
        font-size: 14px;
        line-height: 1.7;
        font-weight: 680;
      }

      .jo23-focus-actions {
        display: grid;
        gap: 10px;
        min-width: 230px;
      }

      .jo23-focus-primary,
      .jo23-focus-secondary {
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

      .jo23-focus-secondary {
        color: #0a66c2;
        background: rgba(255,255,255,.76);
        border: 1px solid rgba(10,102,194,.18);
      }

      @media (max-width: 820px) {
        .jo23-focus-inner {
          grid-template-columns: 1fr;
        }

        .jo23-focus-actions {
          min-width: 0;
        }
      }
    `;

    document.head.appendChild(style);
  }

  function run() {
    addStyles();
    upgradeNavigation();
    upgradeButtons();
    injectFocusBar();
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", run);
  } else {
    run();
  }
})();
