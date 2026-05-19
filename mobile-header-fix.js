// JapanOffer AI universal mobile header fix
// This makes the mobile header compact and stops it covering every page.

(function () {
  if (window.__japanofferMobileHeaderFixLoaded) return;
  window.__japanofferMobileHeaderFixLoaded = true;

  var css = `
    @media (max-width: 760px) {
      html,
      body {
        overflow-x: hidden !important;
      }

      body {
        padding-top: 0 !important;
      }

      .topbar,
      header.topbar {
        position: relative !important;
        top: auto !important;
        left: auto !important;
        right: auto !important;
        z-index: 50 !important;
        padding: 0 !important;
        margin: 0 !important;
        background: rgba(248, 251, 255, 0.82) !important;
        backdrop-filter: blur(14px) !important;
        -webkit-backdrop-filter: blur(14px) !important;
      }

      .topbar .shell,
      header.topbar .shell,
      .topbar > .shell {
        width: 100% !important;
        max-width: none !important;
        margin: 0 !important;
        padding: 0 !important;
      }

      .topbar-inner {
        width: 100% !important;
        max-width: none !important;
        min-height: 0 !important;
        margin: 0 !important;
        padding: 10px 14px 12px !important;
        border-radius: 0 !important;
        border-top: 0 !important;
        border-left: 0 !important;
        border-right: 0 !important;
        border-bottom: 1px solid rgba(16, 24, 40, 0.08) !important;
        background: rgba(255, 255, 255, 0.78) !important;
        box-shadow: 0 8px 24px rgba(16, 24, 40, 0.055) !important;
        display: grid !important;
        grid-template-columns: minmax(0, 1fr) auto !important;
        gap: 9px 10px !important;
        align-items: center !important;
      }

      .brand {
        grid-column: 1 !important;
        grid-row: 1 !important;
        min-width: 0 !important;
        display: flex !important;
        align-items: center !important;
        gap: 9px !important;
      }

      .brand-mark,
      .mark {
        width: 38px !important;
        height: 38px !important;
        min-width: 38px !important;
        border-radius: 13px !important;
        font-size: 16px !important;
      }

      .brand strong {
        font-size: 15px !important;
        line-height: 1.05 !important;
        letter-spacing: -0.04em !important;
        white-space: nowrap !important;
      }

      .brand small {
        display: none !important;
      }

      .lang-select,
      .lang {
        grid-column: 2 !important;
        grid-row: 1 !important;
        justify-self: end !important;
        width: 68px !important;
        height: 34px !important;
        min-height: 34px !important;
        border-radius: 999px !important;
        font-size: 12px !important;
        padding: 0 8px !important;
        background: rgba(255, 255, 255, 0.94) !important;
      }

      .top-search {
        display: none !important;
      }

      .nav {
        grid-column: 1 / -1 !important;
        grid-row: 2 !important;
        display: flex !important;
        flex-wrap: nowrap !important;
        align-items: center !important;
        justify-content: flex-start !important;
        gap: 7px !important;
        margin: 0 !important;
        padding: 0 2px 2px !important;
        overflow-x: auto !important;
        overflow-y: hidden !important;
        white-space: nowrap !important;
        scrollbar-width: none !important;
        -webkit-overflow-scrolling: touch !important;
      }

      .nav::-webkit-scrollbar {
        display: none !important;
      }

      .nav a {
        flex: 0 0 auto !important;
        padding: 8px 11px !important;
        min-height: 32px !important;
        border-radius: 999px !important;
        border: 1px solid rgba(16, 24, 40, 0.08) !important;
        background: rgba(255, 255, 255, 0.86) !important;
        box-shadow: none !important;
        color: #27364a !important;
        font-size: 12px !important;
        font-weight: 900 !important;
        line-height: 1 !important;
      }

      .auth-links {
        grid-column: 1 / -1 !important;
        grid-row: 3 !important;
        display: flex !important;
        flex-wrap: nowrap !important;
        justify-content: flex-start !important;
        align-items: center !important;
        gap: 8px !important;
        margin: 0 !important;
        padding: 0 !important;
        min-height: 0 !important;
      }

      .auth-links a,
      .auth-links button {
        width: auto !important;
        min-width: 0 !important;
        min-height: 32px !important;
        padding: 8px 12px !important;
        border-radius: 999px !important;
        font-size: 12px !important;
        line-height: 1 !important;
        font-weight: 900 !important;
        box-shadow: none !important;
      }

      .auth-links a:first-child,
      .auth-links button:first-child {
        background: transparent !important;
        color: #27364a !important;
        border: 0 !important;
      }

      .auth-links a:last-child {
        background: #1f57c8 !important;
        color: #fff !important;
        border: 1px solid #1f57c8 !important;
      }

      main,
      .hero,
      .page,
      .section {
        scroll-margin-top: 0 !important;
      }

      .hero,
      .network-hero,
      .report-hero,
      .jobs-hero {
        padding-top: 28px !important;
      }
    }

    @media (max-width: 420px) {
      .topbar-inner {
        padding: 9px 12px 11px !important;
      }

      .nav a {
        padding: 8px 10px !important;
        font-size: 11.5px !important;
      }

      .auth-links a,
      .auth-links button {
        font-size: 11.5px !important;
      }
    }
  `;

  var style = document.createElement("style");
  style.id = "japanoffer-mobile-header-fix";
  style.textContent = css;
  document.head.appendChild(style);
})();
