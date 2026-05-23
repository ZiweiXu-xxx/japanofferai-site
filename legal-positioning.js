// JapanOffer AI legal-aware positioning layer
// This adds the "realistic application" / visa / qualification layer without making the site look like a legal advice website.

(function () {
  if (window.__japanofferLegalPositioningLoaded) return;
  window.__japanofferLegalPositioningLoaded = true;

  const LANG_KEY = "japanoffer_lang";

  const copy = {
    en: {
      nav: "Fit Check",
      bannerTitle: "Before you apply, check if the role is realistic for you.",
      bannerText: "JapanOffer AI looks beyond the job title: visa risk, qualification barriers, language fit and role direction.",
      bannerButton: "Run Fit Check",
      sectionKicker: "Realistic application layer",
      sectionTitle: "Not every job is equally worth applying for.",
      sectionCopy: "A normal job board shows available roles. JapanOffer AI helps international candidates understand whether a role is realistically suitable based on background, visa/work-right risk, qualification barriers and language match.",
      c1Title: "Can I apply?",
      c1Copy: "Understand whether the role is realistic for your current background, not just whether it appears in search results.",
      c2Title: "Qualification barrier",
      c2Copy: "Identify whether a role may require local licence, professional qualification or regulated experience.",
      c3Title: "Visa and work-right risk",
      c3Copy: "Flag roles where sponsorship, work authorisation or local hiring preference may create friction.",
      c4Title: "Application priority",
      c4Copy: "Focus on opportunities that are worth your time and avoid wasting effort on low-probability applications.",
      disclaimer: "JapanOffer AI provides career information and application planning support. It does not provide formal legal advice."
    },
    zh: {
      nav: "适配检查",
      bannerTitle: "申请前，先判断这个岗位对你是否现实。",
      bannerText: "JapanOffer AI 不只看岗位标题，还会考虑签证风险、资格门槛、语言匹配和职业方向。",
      bannerButton: "开始适配检查",
      sectionKicker: "真实可申请性判断",
      sectionTitle: "不是每个岗位都同样值得投。",
      sectionCopy: "普通招聘网站告诉你有哪些岗位。JapanOffer AI 帮跨境候选人判断这个岗位是否真正适合自己，包括背景匹配、签证/工作许可风险、资格门槛和语言要求。",
      c1Title: "我能不能投？",
      c1Copy: "判断这个岗位对你当前背景是否现实，而不是只看它是否出现在搜索结果里。",
      c2Title: "资格门槛",
      c2Copy: "识别岗位是否可能要求本地执照、职业资格或受监管行业经验。",
      c3Title: "签证与工作许可风险",
      c3Copy: "提示哪些岗位可能因为签证担保、工作权利或本地招聘偏好而存在阻力。",
      c4Title: "申请优先级",
      c4Copy: "把时间集中在更值得投的机会，减少低概率海投。",
      disclaimer: "JapanOffer AI 提供职业信息和申请规划支持，不构成正式法律意见。"
    },
    ja: {
      nav: "適性チェック",
      bannerTitle: "応募前に、その求人が現実的か確認しましょう。",
      bannerText: "JapanOffer AI は職種名だけでなく、ビザリスク、資格要件、語学力、キャリア方向性を確認します。",
      bannerButton: "適性チェック",
      sectionKicker: "現実的な応募判断",
      sectionTitle: "すべての求人が同じように応募価値があるわけではありません。",
      sectionCopy: "通常の求人サイトは求人を表示します。JapanOffer AI は、背景、就労資格リスク、資格要件、言語要件から、その求人が現実的に合うかを判断します。",
      c1Title: "応募できるか",
      c1Copy: "検索結果に出てくるかではなく、現在の背景で現実的に応募できるかを確認します。",
      c2Title: "資格要件",
      c2Copy: "現地資格、専門資格、規制業界経験が必要となる可能性を確認します。",
      c3Title: "ビザ・就労リスク",
      c3Copy: "スポンサーシップ、就労資格、現地採用優先によるリスクを把握します。",
      c4Title: "応募優先度",
      c4Copy: "可能性の高い求人に集中し、低確率の応募を減らします。",
      disclaimer: "JapanOffer AI はキャリア情報と応募計画を支援するもので、正式な法律助言ではありません。"
    }
  };

  function lang() {
    const value = localStorage.getItem(LANG_KEY) || document.documentElement.lang || "en";
    if (value.toLowerCase().startsWith("zh")) return "zh";
    if (value.toLowerCase().startsWith("ja")) return "ja";
    return "en";
  }

  function t(key) {
    return (copy[lang()] || copy.en)[key] || copy.en[key] || key;
  }

  function ensureStyle() {
    if (document.getElementById("jo-legal-positioning-style")) return;
    const style = document.createElement("style");
    style.id = "jo-legal-positioning-style";
    style.textContent = `
      .jo-legal-banner,
      .jo-legal-section {
        width: min(1240px, calc(100% - 32px));
        margin: 18px auto;
      }

      .jo-legal-banner-inner {
        display: grid;
        grid-template-columns: 1fr auto;
        gap: 18px;
        align-items: center;
        padding: 20px 22px;
        border-radius: 26px;
        background: linear-gradient(135deg, rgba(31,87,200,.10), rgba(255,255,255,.86));
        border: 1px solid rgba(16,24,40,.10);
        box-shadow: 0 18px 54px rgba(16,24,40,.08);
        backdrop-filter: blur(18px);
      }

      .jo-legal-banner h2,
      .jo-legal-section h2 {
        margin: 0;
        letter-spacing: -0.055em;
        color: #07111f;
      }

      .jo-legal-banner h2 {
        font-size: 24px;
      }

      .jo-legal-banner p {
        margin: 6px 0 0;
        color: #5c6b82;
        line-height: 1.6;
      }

      .jo-legal-button {
        display: inline-flex;
        align-items: center;
        justify-content: center;
        min-height: 46px;
        padding: 0 17px;
        border-radius: 999px;
        background: #1f57c8;
        color: white !important;
        font-size: 14px;
        font-weight: 950;
        text-decoration: none;
        white-space: nowrap;
        box-shadow: 0 16px 38px rgba(31,87,200,.22);
      }

      .jo-legal-section {
        padding: 72px 0 40px;
      }

      .jo-legal-head {
        max-width: 820px;
        margin: 0 auto 24px;
        text-align: center;
      }

      .jo-legal-kicker {
        margin: 0 0 12px;
        color: #1f57c8;
        text-transform: uppercase;
        letter-spacing: .16em;
        font-size: 12px;
        font-weight: 950;
      }

      .jo-legal-section h2 {
        font-size: clamp(34px, 5.2vw, 60px);
        line-height: 1.04;
      }

      .jo-legal-head p {
        color: #5c6b82;
        line-height: 1.7;
        font-size: 17px;
      }

      .jo-legal-grid {
        display: grid;
        grid-template-columns: repeat(4, 1fr);
        gap: 14px;
      }

      .jo-legal-card {
        padding: 22px;
        border-radius: 28px;
        background: rgba(255,255,255,.82);
        border: 1px solid rgba(16,24,40,.10);
        box-shadow: 0 18px 54px rgba(16,24,40,.07);
      }

      .jo-legal-card span {
        color: #1f57c8;
        font-weight: 950;
      }

      .jo-legal-card h3 {
        margin: 12px 0 9px;
        font-size: 20px;
        letter-spacing: -0.045em;
      }

      .jo-legal-card p {
        margin: 0;
        color: #5c6b82;
        font-size: 14px;
        line-height: 1.65;
      }

      .jo-legal-disclaimer {
        margin-top: 16px;
        text-align: center;
        color: #7b8798;
        font-size: 12px;
        line-height: 1.6;
      }

      @media (max-width: 900px) {
        .jo-legal-grid {
          grid-template-columns: 1fr 1fr;
        }
      }

      @media (max-width: 760px) {
        .jo-legal-banner,
        .jo-legal-section {
          width: min(100% - 22px, 520px);
        }

        .jo-legal-banner-inner {
          grid-template-columns: 1fr;
          padding: 18px;
          border-radius: 22px;
        }

        .jo-legal-grid {
          grid-template-columns: 1fr;
        }

        .jo-legal-section {
          padding: 46px 0 24px;
        }

        .jo-legal-section h2 {
          font-size: clamp(30px, 9vw, 42px);
          line-height: 1.08;
        }
      }
    `;
    document.head.appendChild(style);
  }

  function addNavLink() {
    const navs = document.querySelectorAll(".nav");
    navs.forEach(nav => {
      if (nav.querySelector('a[href="legal-fit.html"]')) return;
      const a = document.createElement("a");
      a.href = "legal-fit.html";
      a.textContent = t("nav");
      const network = nav.querySelector('a[href="network.html"]');
      if (network) nav.insertBefore(a, network);
      else nav.appendChild(a);
    });
  }

  function addBanner() {
    if (document.getElementById("joLegalBanner")) return;
    const path = location.pathname.toLowerCase();
    const isSearchOrReport = path.includes("jobs-search") || path.includes("report");
    if (!isSearchOrReport) return;

    const banner = document.createElement("section");
    banner.id = "joLegalBanner";
    banner.className = "jo-legal-banner";
    banner.innerHTML = `
      <div class="jo-legal-banner-inner">
        <div>
          <h2>${t("bannerTitle")}</h2>
          <p>${t("bannerText")}</p>
        </div>
        <a class="jo-legal-button" href="legal-fit.html">${t("bannerButton")}</a>
      </div>
    `;

    const topbar = document.querySelector(".topbar");
    if (topbar && topbar.parentNode) topbar.parentNode.insertBefore(banner, topbar.nextSibling);
    else document.body.insertBefore(banner, document.body.firstChild);
  }

  function addHomeSection() {
    if (document.getElementById("joLegalSection")) return;
    const path = location.pathname.toLowerCase();
    const isHome = path.endsWith("/") || path.endsWith("/index.html") || path === "";
    if (!isHome) return;

    const section = document.createElement("section");
    section.id = "joLegalSection";
    section.className = "jo-legal-section reveal show";
    section.innerHTML = `
      <div class="jo-legal-head">
        <p class="jo-legal-kicker">${t("sectionKicker")}</p>
        <h2>${t("sectionTitle")}</h2>
        <p>${t("sectionCopy")}</p>
      </div>

      <div class="jo-legal-grid">
        <article class="jo-legal-card">
          <span>01</span>
          <h3>${t("c1Title")}</h3>
          <p>${t("c1Copy")}</p>
        </article>
        <article class="jo-legal-card">
          <span>02</span>
          <h3>${t("c2Title")}</h3>
          <p>${t("c2Copy")}</p>
        </article>
        <article class="jo-legal-card">
          <span>03</span>
          <h3>${t("c3Title")}</h3>
          <p>${t("c3Copy")}</p>
        </article>
        <article class="jo-legal-card">
          <span>04</span>
          <h3>${t("c4Title")}</h3>
          <p>${t("c4Copy")}</p>
        </article>
      </div>

      <p class="jo-legal-disclaimer">${t("disclaimer")}</p>
    `;

    const black = document.querySelector(".black-section");
    if (black && black.parentNode) black.parentNode.insertBefore(section, black);
    else {
      const main = document.querySelector("main") || document.body;
      main.appendChild(section);
    }
  }

  function run() {
    ensureStyle();
    addNavLink();
    addBanner();
    addHomeSection();
  }

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", run);
  else run();

  window.addEventListener("japanoffer:languagechange", run);
})();
