// JapanOffer AI account pages mobile fix
// Fixes signup/login pages where the old large header card still covers the form on mobile.

(function () {
  if (window.__japanofferAccountMobileFixLoaded) return;
  window.__japanofferAccountMobileFixLoaded = true;

  var css = `
    @media (max-width: 760px) {
      html,
      body {
        width: 100% !important;
        max-width: 100% !important;
        overflow-x: hidden !important;
      }

      body {
        padding: 0 !important;
        margin: 0 !important;
      }

      .topbar,
      header.topbar,
      .site-header,
      header.site-header,
      .app-header,
      header.app-header {
        position: relative !important;
        top: auto !important;
        left: auto !important;
        right: auto !important;
        z-index: 20 !important;
        padding: 0 !important;
        margin: 0 !important;
        background: rgba(248, 251, 255, .84) !important;
        backdrop-filter: blur(14px) !important;
        -webkit-backdrop-filter: blur(14px) !important;
      }

      .topbar .shell,
      .site-header .shell,
      .app-header .shell,
      .topbar > .shell,
      .site-header > .shell,
      .app-header > .shell {
        width: 100% !important;
        max-width: none !important;
        padding: 0 !important;
        margin: 0 !important;
      }

      .topbar-inner,
      .header-inner,
      .nav-shell,
      .site-nav,
      .app-nav {
        width: 100% !important;
        max-width: none !important;
        min-height: 0 !important;
        margin: 0 !important;
        padding: 10px 14px 12px !important;
        border-radius: 0 !important;
        border-top: 0 !important;
        border-left: 0 !important;
        border-right: 0 !important;
        border-bottom: 1px solid rgba(16,24,40,.08) !important;
        background: rgba(255,255,255,.78) !important;
        box-shadow: 0 8px 24px rgba(16,24,40,.055) !important;
        display: grid !important;
        grid-template-columns: minmax(0,1fr) auto !important;
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
      .mark,
      .logo-mark {
        width: 38px !important;
        height: 38px !important;
        min-width: 38px !important;
        border-radius: 13px !important;
        font-size: 16px !important;
      }

      .brand strong,
      .brand-title {
        font-size: 15px !important;
        line-height: 1.05 !important;
        letter-spacing: -0.04em !important;
        white-space: nowrap !important;
      }

      .brand small,
      .brand-subtitle {
        display: none !important;
      }

      .lang-select,
      .lang,
      select[aria-label="Language"] {
        grid-column: 2 !important;
        grid-row: 1 !important;
        justify-self: end !important;
        width: 68px !important;
        height: 34px !important;
        min-height: 34px !important;
        border-radius: 999px !important;
        font-size: 12px !important;
        padding: 0 8px !important;
        background: rgba(255,255,255,.94) !important;
      }

      .top-search,
      .header-search,
      .global-search {
        display: none !important;
      }

      .nav,
      .header-links,
      .main-nav {
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

      .nav::-webkit-scrollbar,
      .header-links::-webkit-scrollbar,
      .main-nav::-webkit-scrollbar {
        display: none !important;
      }

      .nav a,
      .header-links a,
      .main-nav a {
        flex: 0 0 auto !important;
        padding: 8px 11px !important;
        min-height: 32px !important;
        border-radius: 999px !important;
        border: 1px solid rgba(16,24,40,.08) !important;
        background: rgba(255,255,255,.86) !important;
        box-shadow: none !important;
        color: #27364a !important;
        font-size: 12px !important;
        font-weight: 900 !important;
        line-height: 1 !important;
      }

      .auth-links,
      .auth-actions {
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
      .auth-actions a,
      .auth-links button,
      .auth-actions button {
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
      .auth-actions a:first-child {
        background: transparent !important;
        color: #27364a !important;
        border: 0 !important;
      }

      .auth-links a:last-child,
      .auth-actions a:last-child {
        background: #1f57c8 !important;
        color: #fff !important;
        border: 1px solid #1f57c8 !important;
      }

      .wrap,
      .page-shell,
      .auth-shell,
      .signup-shell,
      .login-shell,
      main {
        width: 100% !important;
        max-width: 100% !important;
        padding-left: 14px !important;
        padding-right: 14px !important;
        padding-top: 24px !important;
        margin: 0 auto !important;
        overflow-x: hidden !important;
      }

      .auth-hero,
      .signup-hero,
      .login-hero,
      .hero,
      .left,
      .right,
      .panel {
        max-width: 100% !important;
        overflow: hidden !important;
      }

      h1,
      h2,
      h3,
      .page-title,
      .hero-title {
        white-space: normal !important;
        overflow: visible !important;
        overflow-wrap: anywhere !important;
        word-break: normal !important;
      }

      h1,
      .page-title,
      .hero-title {
        font-size: clamp(34px, 10vw, 48px) !important;
        line-height: 1.06 !important;
        letter-spacing: -0.055em !important;
      }

      h2 {
        font-size: clamp(28px, 8.6vw, 38px) !important;
        line-height: 1.08 !important;
      }

      form,
      .form,
      .signup-form,
      .login-form {
        width: 100% !important;
        max-width: 100% !important;
      }

      input,
      select,
      textarea,
      button {
        max-width: 100% !important;
      }
    }
  `;

  var style = document.createElement("style");
  style.id = "japanoffer-account-mobile-fix";
  style.textContent = css;
  document.head.appendChild(style);
})();
