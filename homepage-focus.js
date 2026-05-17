// JapanOffer AI - Step 29 Waseda-inspired Premium Motion
// Keeps Step 28 homepage fixes and adds Waseda-style editorial motion:
// large calm sections, reveal-on-scroll, floating feature panels, progress rail, premium route cards.

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
    if (el.dataset.jo29Bound === "1") return;
    el.dataset.jo29Bound = "1";
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
      ".jo24-platform-nav, .jo23-focus-bar, .jo24-focus-bar, .jo25-focus-bar, .jo26-focus-bar, .jo28-platform-section, .jo29-platform-section, .jo29-motion-rail"
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
        el.classList.add("jo29-nav-link");
        return;
      }

      if (["Jobs", "岗位", "职位", "Find jobs"].includes(text)) {
        el.textContent = "职位";
        setLink(el, "jobs.html");
        el.classList.add("jo29-nav-link");
        return;
      }

      if (["Report", "AI Report", "AI 报告", "AI 匹配"].includes(text)) {
        el.textContent = "AI 匹配";
        setLink(el, "match.html");
        el.classList.add("jo29-nav-link", "jo29-nav-active");
        return;
      }

      if (["Companies", "Explore companies", "公司"].includes(text)) {
        el.textContent = "公司";
        setLink(el, "companies.html");
        el.classList.add("jo29-nav-link");
        return;
      }

      if (["Feedback", "反馈", "反馈与用户调研"].includes(text)) {
        el.textContent = "反馈";
        setLink(el, "feedback.html");
        el.classList.add("jo29-nav-link");
        return;
      }

      if (["Sign in", "Sign up", "注册", "登录", "Create account"].includes(text)) {
        el.textContent = "我的主页";
        setLink(el, "profile.html");
        el.classList.add("jo29-profile-link");
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
        el.classList.add("jo29-primary-cta");
        return;
      }

      if (text === "Find talent" || text === "Talent" || text === "进入人脉网络") {
        el.textContent = "人脉网络";
        setLink(el, "network.html");
        el.classList.add("jo29-clean-tab");
        return;
      }

      if (text === "Explore companies" || text === "Companies") {
        el.textContent = "公司库";
        setLink(el, "companies.html");
        el.classList.add("jo29-clean-tab");
        return;
      }

      if (includesAny(text, ["english auto report", "english report", "英文报告"])) {
        el.textContent = "AI 匹配报告";
        setLink(el, "match.html");
        el.classList.add("jo29-secondary-cta");
        return;
      }

      if (text === "反馈与用户调研" || text === "反馈问卷" || text === "Feedback") {
        el.textContent = "反馈问卷";
        setLink(el, "feedback.html");
        el.classList.add("jo29-secondary-cta");
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

    if (document.querySelector(".jo29-platform-section")) return;

    const main = document.querySelector("main") || document.body;
    const anchor = broken || main.querySelector("section:nth-of-type(2)") || main.firstElementChild;

    const section = document.createElement("section");
    section.className = "jo29-platform-section jo29-reveal";
    section.innerHTML = `
      <div class="jo29-platform-head">
        <span>Platform routes</span>
        <h2>不是一个 AI 中转站，而是一条完整求职路径。</h2>
        <p>先匹配方向，再看职位，保存 CV，进入人脉网络。首页要像真正的平台，而不是功能按钮堆叠。</p>
      </div>

      <div class="jo29-route-grid">
        <a class="jo29-route-card jo29-route-primary" href="match.html">
          <span class="jo29-route-num">01</span>
          <h3>中文 AI 岗位匹配</h3>
          <p>上传 CV 或输入背景，生成岗位排序、匹配分数、目标公司和申请路线。</p>
          <strong>开始匹配 →</strong>
        </a>

        <a class="jo29-route-card" href="jobs.html">
          <span class="jo29-route-num">02</span>
          <h3>职位搜索</h3>
          <p>查看跨境岗位方向，把 AI 匹配结果转化成可投递的岗位清单。</p>
          <strong>查看职位 →</strong>
        </a>

        <a class="jo29-route-card" href="profile.html">
          <span class="jo29-route-num">03</span>
          <h3>我的主页 / CV</h3>
          <p>保存个人资料和履历。之后申请岗位和生成报告时，不需要反复填写。</p>
          <strong>上传 CV →</strong>
        </a>

        <a class="jo29-route-card" href="network.html">
          <span class="jo29-route-num">04</span>
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

  function injectMotionRail() {
    if (document.querySelector(".jo29-motion-rail")) return;

    const rail = document.createElement("div");
    rail.className = "jo29-motion-rail";
    rail.innerHTML = `
      <div class="jo29-rail-track">
        <span class="jo29-rail-progress"></span>
      </div>
      <span class="jo29-rail-label">JapanOffer AI</span>
    `;

    document.body.appendChild(rail);
  }

  function addHeroMotionLayer() {
    const main = document.querySelector("main");
    const hero = main?.querySelector("section");
    if (!hero || hero.querySelector(".jo29-hero-orbit")) return;

    hero.classList.add("jo29-hero-motion", "jo29-reveal");

    const orbit = document.createElement("div");
    orbit.className = "jo29-hero-orbit";
    orbit.innerHTML = `
      <span class="jo29-orbit-dot jo29-dot-one"></span>
      <span class="jo29-orbit-dot jo29-dot-two"></span>
      <span class="jo29-orbit-dot jo29-dot-three"></span>
    `;
    hero.appendChild(orbit);
  }

  function prepareRevealAnimation() {
    const targets = Array.from(document.querySelectorAll(
      "main section, .jo29-route-card, article, .card, .panel, .feature-card"
    ));

    targets.forEach((el, index) => {
      if (el.classList.contains("jo29-reveal-ready")) return;
      el.classList.add("jo29-reveal-ready");
      el.style.setProperty("--jo29-delay", `${Math.min(index * 45, 360)}ms`);
    });

    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("jo29-visible");
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.14 });

    targets.forEach((el) => observer.observe(el));
  }

  function updateScrollProgress() {
    const progress = document.querySelector(".jo29-rail-progress");
    if (!progress) return;
    const scrollTop = window.scrollY || document.documentElement.scrollTop;
    const max = Math.max(1, document.documentElement.scrollHeight - window.innerHeight);
    const pct = Math.min(100, Math.max(0, (scrollTop / max) * 100));
    progress.style.height = `${pct}%`;
  }

  function addPremiumCursorTilt() {
    if (window.matchMedia("(pointer: coarse)").matches) return;

    const cards = Array.from(document.querySelectorAll(".jo29-route-card"));
    cards.forEach((card) => {
      card.addEventListener("mousemove", (event) => {
        const rect = card.getBoundingClientRect();
        const x = (event.clientX - rect.left) / rect.width - 0.5;
        const y = (event.clientY - rect.top) / rect.height - 0.5;
        card.style.setProperty("--tilt-x", `${(-y * 4).toFixed(2)}deg`);
        card.style.setProperty("--tilt-y", `${(x * 5).toFixed(2)}deg`);
      });

      card.addEventListener("mouseleave", () => {
        card.style.setProperty("--tilt-x", "0deg");
        card.style.setProperty("--tilt-y", "0deg");
      });
    });
  }

  function addStyles() {
    if (document.getElementById("jo29-waseda-motion-style")) return;

    const style = document.createElement("style");
    style.id = "jo29-waseda-motion-style";
    style.textContent = `
      :root {
        --jo-blue: #0a66c2;
        --jo-blue-dark: #003f88;
        --jo-ink: #061a33;
        --jo-muted: #53667d;
      }

      body {
        background:
          radial-gradient(circle at 10% 8%, rgba(10,102,194,.12), transparent 30%),
          radial-gradient(circle at 88% 2%, rgba(10,102,194,.10), transparent 28%),
          linear-gradient(135deg, #f6fbff 0%, #ffffff 44%, #edf5ff 100%) !important;
      }

      header {
        overflow: visible !important;
        backdrop-filter: blur(18px) !important;
      }

      header nav, header .nav, header .header-nav {
        display: flex !important;
        align-items: center !important;
        gap: 18px !important;
        flex-wrap: nowrap !important;
      }

      .jo29-nav-link {
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

      .jo29-nav-active { color: var(--jo-blue) !important; }

      .jo29-profile-link {
        color: #fff !important;
        background: linear-gradient(135deg, var(--jo-blue), var(--jo-blue-dark)) !important;
        border-radius: 999px !important;
        padding: 11px 16px !important;
        text-decoration: none !important;
        font-size: 14px !important;
        font-weight: 900 !important;
        box-shadow: 0 14px 30px rgba(10,102,194,.22) !important;
      }

      .jo29-primary-cta {
        background: linear-gradient(135deg, var(--jo-blue), var(--jo-blue-dark)) !important;
        color: #fff !important;
        border-color: transparent !important;
        box-shadow: 0 18px 44px rgba(10,102,194,.26) !important;
      }

      .jo29-secondary-cta {
        background: rgba(255,255,255,.78) !important;
        color: var(--jo-blue) !important;
        border: 1px solid rgba(10,102,194,.18) !important;
        box-shadow: none !important;
      }

      .jo29-clean-tab {
        border: 0 !important;
        outline: 0 !important;
        box-shadow: none !important;
        text-decoration: none !important;
        white-space: nowrap !important;
      }

      .jo29-hero-motion {
        position: relative !important;
        overflow: hidden !important;
        isolation: isolate !important;
      }

      .jo29-hero-motion::before {
        content: "";
        position: absolute;
        inset: -25%;
        z-index: -2;
        background:
          radial-gradient(circle at 20% 20%, rgba(10,102,194,.15), transparent 26%),
          radial-gradient(circle at 75% 28%, rgba(255,255,255,.88), transparent 28%),
          radial-gradient(circle at 58% 82%, rgba(10,102,194,.10), transparent 26%);
        animation: jo29Breath 11s ease-in-out infinite alternate;
      }

      .jo29-hero-motion::after {
        content: "";
        position: absolute;
        inset: 0;
        z-index: -1;
        background:
          linear-gradient(90deg, rgba(255,255,255,.0), rgba(255,255,255,.28), rgba(255,255,255,.0));
        transform: translateX(-110%);
        animation: jo29LightSweep 8s cubic-bezier(.19,1,.22,1) infinite;
        pointer-events: none;
      }

      .jo29-hero-orbit {
        position: absolute;
        right: min(7vw, 80px);
        top: min(8vw, 80px);
        width: 190px;
        height: 190px;
        border: 1px solid rgba(10,102,194,.14);
        border-radius: 999px;
        opacity: .75;
        pointer-events: none;
        animation: jo29OrbitRotate 22s linear infinite;
      }

      .jo29-orbit-dot {
        position: absolute;
        width: 11px;
        height: 11px;
        border-radius: 999px;
        background: var(--jo-blue);
        box-shadow: 0 0 0 10px rgba(10,102,194,.08);
      }

      .jo29-dot-one { top: -5px; left: 84px; }
      .jo29-dot-two { right: 16px; bottom: 25px; opacity: .68; }
      .jo29-dot-three { left: 18px; bottom: 34px; opacity: .46; }

      .jo29-motion-rail {
        position: fixed;
        left: 22px;
        top: 50%;
        transform: translateY(-50%);
        z-index: 60;
        display: grid;
        place-items: center;
        gap: 10px;
        pointer-events: none;
      }

      .jo29-rail-track {
        width: 2px;
        height: 130px;
        background: rgba(7,27,54,.10);
        border-radius: 999px;
        overflow: hidden;
      }

      .jo29-rail-progress {
        display: block;
        width: 100%;
        height: 0%;
        background: linear-gradient(180deg, var(--jo-blue), var(--jo-blue-dark));
        border-radius: 999px;
        transition: height .18s ease-out;
      }

      .jo29-rail-label {
        writing-mode: vertical-rl;
        transform: rotate(180deg);
        color: rgba(7,27,54,.38);
        text-transform: uppercase;
        letter-spacing: .18em;
        font-size: 9px;
        font-weight: 950;
      }

      .jo29-platform-section {
        width: min(1180px, calc(100% - 44px));
        margin: 46px auto 0;
        padding: 0;
      }

      .jo29-platform-head {
        display: grid;
        grid-template-columns: minmax(0, 1fr) minmax(240px, 430px);
        gap: 22px;
        align-items: end;
        margin-bottom: 18px;
      }

      .jo29-platform-head span {
        grid-column: 1 / -1;
        display: inline-flex;
        color: var(--jo-blue);
        text-transform: uppercase;
        letter-spacing: .16em;
        font-size: 11px;
        font-weight: 950;
      }

      .jo29-platform-head h2 {
        margin: 0;
        color: var(--jo-ink);
        font-size: clamp(32px, 4vw, 54px);
        line-height: .98;
        letter-spacing: -.065em;
        font-weight: 950;
      }

      .jo29-platform-head p {
        margin: 0;
        color: var(--jo-muted);
        font-size: 14px;
        line-height: 1.7;
        font-weight: 680;
      }

      .jo29-route-grid {
        display: grid;
        grid-template-columns: repeat(4, minmax(0, 1fr));
        gap: 16px;
        perspective: 1200px;
      }

      .jo29-route-card {
        min-height: 264px;
        display: flex;
        flex-direction: column;
        padding: 24px;
        border-radius: 32px;
        text-decoration: none;
        color: var(--jo-ink);
        background:
          linear-gradient(180deg, rgba(255,255,255,.88), rgba(255,255,255,.72)),
          radial-gradient(circle at top right, rgba(10,102,194,.10), transparent 34%);
        border: 1px solid rgba(7,27,54,.10);
        box-shadow: 0 24px 80px rgba(10,35,68,.10);
        backdrop-filter: blur(16px);
        transform: rotateX(var(--tilt-x, 0deg)) rotateY(var(--tilt-y, 0deg)) translateY(0);
        transition: transform .22s cubic-bezier(.19,1,.22,1), box-shadow .22s cubic-bezier(.19,1,.22,1);
        overflow: hidden;
        position: relative;
      }

      .jo29-route-card::after {
        content: "";
        position: absolute;
        inset: 0;
        background: linear-gradient(120deg, transparent, rgba(255,255,255,.42), transparent);
        transform: translateX(-140%);
        transition: transform .7s cubic-bezier(.19,1,.22,1);
      }

      .jo29-route-card:hover {
        transform: rotateX(var(--tilt-x, 0deg)) rotateY(var(--tilt-y, 0deg)) translateY(-5px);
        box-shadow: 0 34px 100px rgba(10,35,68,.16);
      }

      .jo29-route-card:hover::after {
        transform: translateX(140%);
      }

      .jo29-route-primary {
        background: linear-gradient(135deg, rgba(10,102,194,.98), rgba(0,63,136,.96));
        color: #fff;
      }

      .jo29-route-num {
        color: var(--jo-blue);
        font-size: 13px;
        font-weight: 950;
        letter-spacing: .12em;
      }

      .jo29-route-primary .jo29-route-num {
        color: rgba(255,255,255,.78);
      }

      .jo29-route-card h3 {
        margin: 48px 0 12px;
        font-size: 24px;
        line-height: 1.08;
        letter-spacing: -.05em;
        font-weight: 950;
      }

      .jo29-route-card p {
        margin: 0;
        color: var(--jo-muted);
        font-size: 13px;
        line-height: 1.68;
        font-weight: 650;
      }

      .jo29-route-primary p {
        color: rgba(255,255,255,.78);
      }

      .jo29-route-card strong {
        display: block;
        margin-top: auto;
        padding-top: 18px;
        color: var(--jo-blue);
        font-size: 14px;
        font-weight: 950;
      }

      .jo29-route-primary strong {
        color: #fff;
      }

      .jo29-reveal-ready {
        opacity: 0;
        transform: translateY(36px);
        transition:
          opacity .72s cubic-bezier(.19,1,.22,1) var(--jo29-delay, 0ms),
          transform .72s cubic-bezier(.19,1,.22,1) var(--jo29-delay, 0ms);
      }

      .jo29-reveal-ready.jo29-visible {
        opacity: 1;
        transform: translateY(0);
      }

      @keyframes jo29Breath {
        0% { transform: translate3d(-1%, -1%, 0) scale(1); filter: blur(0); }
        100% { transform: translate3d(1.2%, 1.1%, 0) scale(1.04); filter: blur(1px); }
      }

      @keyframes jo29LightSweep {
        0%, 52% { transform: translateX(-120%); opacity: 0; }
        58% { opacity: 1; }
        74%, 100% { transform: translateX(120%); opacity: 0; }
      }

      @keyframes jo29OrbitRotate {
        from { transform: rotate(0deg); }
        to { transform: rotate(360deg); }
      }

      @media (max-width: 1000px) {
        .jo29-route-grid { grid-template-columns: repeat(2, minmax(0, 1fr)); }
        .jo29-platform-head { grid-template-columns: 1fr; }
        .jo29-motion-rail { display: none; }
      }

      @media (max-width: 640px) {
        header nav a:nth-child(n+5),
        header .nav a:nth-child(n+5),
        header .header-nav a:nth-child(n+5) {
          display: none !important;
        }

        .jo29-platform-section { width: min(100% - 28px, 1180px); }
        .jo29-route-grid { grid-template-columns: 1fr; }
        .jo29-route-card { min-height: auto; }
        .jo29-route-card h3 { margin-top: 28px; }
        .jo29-hero-orbit { display: none; }
      }

      @media (prefers-reduced-motion: reduce) {
        *,
        *::before,
        *::after {
          animation: none !important;
          transition: none !important;
          scroll-behavior: auto !important;
        }

        .jo29-reveal-ready {
          opacity: 1 !important;
          transform: none !important;
        }
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
    injectMotionRail();
    addHeroMotionLayer();
    prepareRevealAnimation();
    addPremiumCursorTilt();
    updateScrollProgress();
    window.addEventListener("scroll", updateScrollProgress, { passive: true });
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", run);
  } else {
    run();
  }
})();
