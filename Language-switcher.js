(function () {
  const LANG_KEY = "japanoffer_lang";

  const labels = {
    en: "EN",
    zh: "中文",
    ja: "日本語"
  };

  function getCurrentLang() {
    return localStorage.getItem(LANG_KEY) || "en";
  }

  function setLang(lang) {
    localStorage.setItem(LANG_KEY, lang);
    document.documentElement.setAttribute("lang", lang);
    updateActiveButton(lang);
  }

  function updateActiveButton(lang) {
    document.querySelectorAll("[data-lang-option]").forEach((btn) => {
      btn.classList.toggle("active", btn.dataset.langOption === lang);
    });
  }

  function createSwitcher() {
    if (document.querySelector(".language-switcher")) return;

    const switcher = document.createElement("div");
    switcher.className = "language-switcher";

    switcher.innerHTML = `
      <button data-lang-option="en">EN</button>
      <button data-lang-option="zh">中文</button>
      <button data-lang-option="ja">日本語</button>
    `;

    document.body.appendChild(switcher);

    document.querySelectorAll("[data-lang-option]").forEach((btn) => {
      btn.addEventListener("click", function () {
        setLang(btn.dataset.langOption);
      });
    });

    setLang(getCurrentLang());
  }

  function addStyle() {
    const style = document.createElement("style");

    style.textContent = `
      .language-switcher {
        position: fixed;
        right: 22px;
        bottom: 22px;
        z-index: 9999;
        display: flex;
        gap: 6px;
        padding: 7px;
        border-radius: 999px;
        background: rgba(255, 255, 255, 0.88);
        border: 1px solid rgba(16, 24, 40, 0.12);
        box-shadow: 0 18px 45px rgba(16, 24, 40, 0.16);
        backdrop-filter: blur(18px);
      }

      .language-switcher button {
        border: 0;
        padding: 8px 11px;
        border-radius: 999px;
        background: transparent;
        color: #344054;
        font-size: 13px;
        font-weight: 800;
        cursor: pointer;
      }

      .language-switcher button.active {
        background: #1f57c8;
        color: white;
      }

      @media (max-width: 640px) {
        .language-switcher {
          right: 12px;
          bottom: 12px;
        }
      }
    `;

    document.head.appendChild(style);
  }

  document.addEventListener("DOMContentLoaded", function () {
    addStyle();
    createSwitcher();
  });
})();
