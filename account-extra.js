// Shows locally saved roles on account page as an MVP.
(function () {
  document.addEventListener("DOMContentLoaded", function () {
    const box = document.querySelector("[data-account-box]");
    if (!box) return;

    setTimeout(() => {
      const saved = JSON.parse(localStorage.getItem("japanoffer_saved_roles") || "[]");
      if (!saved.length) return;

      const panel = document.createElement("div");
      panel.className = "saved-roles-panel";
      panel.innerHTML = `
        <p class="eyebrow">Saved roles</p>
        <h2>Your saved role list</h2>
        <div class="saved-roles-list">
          ${saved.slice(-6).reverse().map((role) => `
            <a href="${role.url}" target="_blank" rel="noopener">
              <strong>${role.title}</strong>
              <span>Open original job →</span>
            </a>
          `).join("")}
        </div>
      `;
      box.appendChild(panel);
    }, 900);
  });
})();
