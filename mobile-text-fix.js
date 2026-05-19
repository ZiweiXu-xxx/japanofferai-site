// JapanOffer AI mobile typography fix
// Fixes mobile headings being cut off or overflowing the screen.

(function () {
  if (window.__japanofferMobileTextFixLoaded) return;
  window.__japanofferMobileTextFixLoaded = true;

  var css = `
    @media (max-width: 760px) {
      html,
      body {
        width: 100% !important;
        max-width: 100% !important;
        overflow-x: hidden !important;
      }

      main,
      section,
      article,
      header,
      footer,
      .shell,
      .page,
      .hero,
      .section,
      .story-card,
      .feature-card,
      .institution-card,
      .final-card,
      .black-section,
      .timeline-item {
        max-width: 100% !important;
        overflow-wrap: anywhere !important;
      }

      h1,
      h2,
      h3,
      .hero h1,
      .section h2,
      .black-section h2,
      .final-card h2,
      .story-card.large h2,
      .page-title,
      .hero-title,
      .headline,
      .mega-title {
        max-width: 100% !important;
        width: 100% !important;
        white-space: normal !important;
        word-break: normal !important;
        overflow-wrap: anywhere !important;
        line-break: auto !important;
        text-wrap: balance !important;
        overflow: visible !important;
      }

      h1,
      .hero h1,
      .page-title,
      .hero-title,
      .mega-title {
        font-size: clamp(38px, 11.5vw, 52px) !important;
        line-height: 1.02 !important;
        letter-spacing: -0.055em !important;
      }

      h2,
      .section h2,
      .black-section h2,
      .final-card h2,
      .story-card.large h2,
      .headline {
        font-size: clamp(30px, 9.2vw, 42px) !important;
        line-height: 1.08 !important;
        letter-spacing: -0.045em !important;
      }

      h3,
      .feature-card h3,
      .story-card h3,
      .institution-card h3,
      .timeline-item h3 {
        font-size: clamp(22px, 7vw, 30px) !important;
        line-height: 1.18 !important;
        letter-spacing: -0.035em !important;
      }

      p,
      li,
      .lede,
      .section p,
      .story-card p,
      .feature-card p,
      .institution-card p,
      .timeline-item p {
        max-width: 100% !important;
        white-space: normal !important;
        overflow-wrap: break-word !important;
        word-break: normal !important;
      }

      .section-head.center,
      .section-head {
        max-width: 100% !important;
        padding-left: 0 !important;
        padding-right: 0 !important;
      }

      .section-head.center h2,
      .section-head.center p {
        max-width: 100% !important;
      }

      .story-card.large,
      .final-card,
      .black-section {
        overflow: hidden !important;
      }

      .story-card.large h2,
      .final-card h2,
      .black-section h2 {
        padding-right: 0 !important;
      }

      .eyebrow {
        white-space: normal !important;
        overflow-wrap: anywhere !important;
        font-size: 12px !important;
        line-height: 1.35 !important;
      }
    }

    @media (max-width: 390px) {
      h1,
      .hero h1,
      .page-title,
      .hero-title,
      .mega-title {
        font-size: clamp(34px, 10.5vw, 45px) !important;
      }

      h2,
      .section h2,
      .black-section h2,
      .final-card h2,
      .story-card.large h2,
      .headline {
        font-size: clamp(28px, 8.6vw, 38px) !important;
      }
    }
  `;

  var style = document.createElement("style");
  style.id = "japanoffer-mobile-text-fix";
  style.textContent = css;
  document.head.appendChild(style);
})();
