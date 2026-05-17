// JapanOffer AI - Step 24 Homepage + Navigation Focus
// Main product: Chinese AI matching.
// Platform structure: Home / Network / Jobs / AI Match / Companies / Feedback.

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

    el.addEventListener("click", function (event) {
      event.preventDefault();
      window.location.href = href;
    });
  }

  function setText(el, text) {
    if (!el || !text) return;
    el.textContent = text;
  }

  function textIncludes(text, words) {
    return words.some((word) => text.toLowerCase().includes(word.toLowerCase()));
  }

  function upgradeButtons() {
    const clickable = Array.from(document.querySelectorAll("a, button"));

    clickable.forEach((el) => {
      const text = cleanText(el.textContent);
      if (!text) return;

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
        el.classList.add("jo24-primary-cta");
        return;
      }

      if (textIncludes(text, ["find talent", "talent", "人脉", "会员", "network"])) {
        setText(el, "进入人脉网络");
        setLink(el, "network.html");
        el.classList.add("jo24-secondary-cta");
        return;
      }

      if (textIncludes(text, ["english auto report", "english report", "英文报告"])) {
        setText(el, "英文报告辅助入口");
        setLink(el, "report.html");
        el.classList.add("jo24-secondary-cta");
        return;
      }

      if (textIncludes(text, ["反馈", "问卷", "survey", "feedback"])) {
        setText(el, "反馈与用户调研");
        setLink(el, "feedback.html");
        el.classList.add("jo24-secondary-cta");
        return;
      }

      if (text === "Jobs" || text === "岗位" || textIncludes(text, ["find jobs", "找岗位", "职位"])) {
        setLink(el, "jobs.html");
        return;
      }

      if (text === "Companies" || text === "公司" || textIncludes(text, ["explore companies", "公司库"])) {
        setLink(el, "companies.html");
        return;
      }

      if (text === "Employers" || text === "企业" || textIncludes(text, ["employer"])) {
        setLink(el, "employers.html");
      }
    });
  }

  function upgradeNavigation() {
    const existingHeader = document.querySelector("header");
    if (!existingHeader || existingHeader.querySelector(".jo24-platform-nav")) return;

    const nav = document.createElement("nav");
    nav.className = "jo24-platform-nav";
    nav.innerHTML = `
      <a href="index.html">首页</a>
      <a href="network.html">人脉</a>
      <a href="jobs.html">职位</a>
      <a href="match.html">AI 匹配</a>
      <a href="companies.html">公司</a>
      <a href="feedback.html">反馈</a>
    `;

    existingHeader.appendChild(nav);

    const oldLinks = Array.from(existingHeader.querySelectorAll("a"))
      .filter((a) => !a.closest(".jo24-platform-nav"));

    oldLinks.forEach((a) => {
      const text = cleanText(a.textContent);
      if (text === "Network") a.style.display = "none";
      if (text === "AI Report" || text === "Report") a.style.display = "none";
      if (text === "Talent") a.style.display = "none";
    });
  }

  function injectFocusBar() {
    if (document.querySelector(".jo24-focus-bar")) return;

    const main = document.querySelector("main") || document.body;
    const firstSection = main.querySelector("section") || main.firstElementChild;

    const bar = document.createElement("section");
    bar.className = "jo24-focus-bar";
    bar.innerHTML = `
      <div class="jo24-focus-inner">
        <div>
          <span class="jo24-kicker">Platform structure</span>
          <h2>先 AI 匹配，再看职位、人脉和公司。</h2>
          <p>JapanOffer AI 不只是报告工具。它正在成为一个跨境求职网络：用户输入背景，获得岗位排序，然后进入人脉、职位和公司路径。</p>
        </div>
        <div class="jo24-focus-actions">
          <a class="jo24-focus-primary" href="match.html">开始中文 AI 岗位匹配</a>
          <a class="jo24-focus-secondary" href="network.html">进入人脉网络</a>
          <a class="jo24-focus-secondary" href="jobs.html">查看职位</a>
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
    if (document.getElementById("jo24-platform-style")) return;

    const style = document.createElement("style");
    style.id = "jo24-platform-style";
    style.textContent = `
      .jo24-platform-nav {
        display: flex;
        align-items: center;
        justify-content: flex-end;
        gap: 18px;
        margin-left: auto;
      }

      .jo24-platform-nav a {
        color: #243650 !important;
        text-decoration: none !important;
        font-size: 14px !important;
        font-weight: 850 !important;
        white-space: nowrap;
      }

      .jo24-platform-nav a:nth-child(4) {
        color: #0a66c2 !important;
      }

      .jo24-primary-cta,
      .jo24-focus-primary {
        background: linear-gradient(135deg, #0a66c2, #003f88) !important;
        color: #fff !important;
        border-color: transparent !important;
        box-shadow: 0 18px 44px rgba(10,102,194,.26) !important;
      }

      .jo24-secondary-cta {
        background: rgba(255,255,255,.72) !important;
        color: #0a66c2 !important;
        border: 1px solid rgba(10,102,194,.18) !important;
      }

      .jo24-focus-bar {
        width: min(1180px, calc(100% - 44px));
        margin: 28px auto 0;
        padding: 0;
      }

      .jo24-focus-inner {
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

      .jo24-kicker {
        display: inline-flex;
        color: #0a66c2;
        text-transform: uppercase;
        letter-spacing: .16em;
        font-size: 11px;
        font-weight: 950;
        margin-bottom: 9px;
      }

      .jo24-focus-inner h2 {
        margin: 0;
        color: #061a33;
        font-size: clamp(26px, 3vw, 42px);
        line-height: 1.05;
        letter-spacing: -.055em;
        font-weight: 950;
      }

      .jo24-focus-inner p {
        max-width: 720px;
        margin: 12px 0 0;
        color: #53667d;
        font-size: 14px;
        line-height: 1.7;
        font-weight: 680;
      }

      .jo24-focus-actions {
        display: grid;
        gap: 10px;
        min-width: 230px;
      }

      .jo24-focus-primary,
      .jo24-focus-secondary {
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

      .jo24-focus-secondary {
        color: #0a66c2;
        background: rgba(255,255,255,.76);
        border: 1px solid rgba(10,102,194,.18);
      }

      @media (max-width: 920px) {
        .jo24-platform-nav a:nth-child(n+5) {
          display: none;
        }

        .jo24-focus-inner {
          grid-template-columns: 1fr;
        }

        .jo24-focus-actions {
          min-width: 0;
        }
      }

      @media (max-width: 640px) {
        .jo24-platform-nav {
          gap: 12px;
        }

        .jo24-platform-nav a {
          font-size: 13px !important;
        }

        .jo24-platform-nav a:nth-child(n+4) {
          display: none;
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
