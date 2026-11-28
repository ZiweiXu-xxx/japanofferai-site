// JapanOffer AI billing frontend helper (shared by pricing / report /
// match / account pages). No framework, no new dependencies.
//
// What it does:
// - [data-credits-box]  — shows the signed-in user's remaining report
//   allowance (free report, paid credits, Premium monthly allowance) by
//   calling GET /api/credits.js. When signed out it shows a sign-in prompt.
//   The server decides the numbers; this script only displays them.
// - [data-plan-box]     — account page: current plan, remaining credits,
//   Premium renewal date and a cancel button (POST /api/cancel-subscription).
// - [data-checkout-button] + data-product="single|pack|premium" — starts a
//   Stripe Checkout Session via POST /api/create-checkout and redirects
//   the browser to Stripe. 401 redirects to login.html.
// - [data-price="<key>"] / [data-product-credits="<key>"] — filled from
//   GET /api/pricing so displayed prices always follow config/pricing.js.
// - [data-checkout-banner] — shows the success / cancelled message after
//   Stripe redirects back to pricing.html?checkout=success|cancelled.
//
// The Supabase client comes from window.japanOfferAuth (created by auth.js
// on pages that load it). On pages without auth.js (e.g. match.html) the
// helper builds its own client from auth-config.js + the Supabase CDN.
(function () {
  function getClient() {
    if (window.japanOfferAuth) return window.japanOfferAuth;
    if (
      window.supabase &&
      window.JAPANOFFER_SUPABASE_URL &&
      window.JAPANOFFER_SUPABASE_ANON_KEY
    ) {
      var client = window.supabase.createClient(
        window.JAPANOFFER_SUPABASE_URL,
        window.JAPANOFFER_SUPABASE_ANON_KEY
      );
      window.japanOfferAuth = client;
      return client;
    }
    return null;
  }

  async function getAccessToken() {
    var client = getClient();
    if (!client) return null;
    try {
      var result = await client.auth.getSession();
      return (result && result.data && result.data.session && result.data.session.access_token) || null;
    } catch (e) {
      return null;
    }
  }

  function escapeHtml(value) {
    return String(value == null ? "" : value)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;");
  }

  function formatDate(iso) {
    if (!iso) return "";
    var d = new Date(iso);
    if (Number.isNaN(d.getTime())) return "";
    return d.toLocaleDateString(undefined, { year: "numeric", month: "short", day: "numeric" });
  }

  async function fetchCredits(token) {
    var res = await fetch("/api/credits.js", {
      headers: { Authorization: "Bearer " + token },
    });
    if (!res.ok) return null;
    try {
      return await res.json();
    } catch (e) {
      return null;
    }
  }

  function creditsLine(data) {
    if (data.plan === "premium") {
      var reset = data.premium.reset_at ? " · resets " + formatDate(data.premium.reset_at) : "";
      return (
        "Premium active · " +
        data.premium.credits_remaining +
        " of " +
        data.premium.credits_per_month +
        " reports left this month" +
        reset
      );
    }
    var parts = [];
    if (data.free_remaining > 0) parts.push("Free report: " + data.free_remaining + " left");
    parts.push("Paid credits: " + data.paid_credits);
    if (data.total_remaining <= 0) parts.push("No reports left");
    return parts.join(" · ");
  }

  async function renderCreditsBoxes() {
    var boxes = document.querySelectorAll("[data-credits-box]");
    if (!boxes.length) return;
    var token = await getAccessToken();
    boxes.forEach(function (box) {
      if (!token) {
        box.innerHTML =
          'Sign in to see your free report and credits. <a href="login.html">Sign in</a>';
        return;
      }
      box.textContent = "Checking your report credits…";
    });
    if (!token) return;
    var data = await fetchCredits(token);
    boxes.forEach(function (box) {
      if (!data) {
        box.innerHTML =
          'Could not load your credits. <a href="pricing.html">View pricing</a>';
        return;
      }
      var line = escapeHtml(creditsLine(data));
      var extra =
        data.total_remaining <= 0
          ? ' <a href="pricing.html">Get more reports →</a>'
          : ' <a href="pricing.html">View pricing</a>';
      box.innerHTML = line + extra;
    });
  }

  async function renderPlanBox() {
    var box = document.querySelector("[data-plan-box]");
    if (!box) return;
    var token = await getAccessToken();
    if (!token) {
      box.innerHTML =
        '<p class="eyebrow">Billing</p><h2>Your plan</h2>' +
        '<p>Sign in to see your plan and remaining reports. <a href="login.html">Sign in</a></p>';
      return;
    }
    box.innerHTML = "<p>Loading your plan…</p>";
    var data = await fetchCredits(token);
    if (!data) {
      box.innerHTML =
        "<p>Could not load your plan. Please refresh the page or try again later.</p>";
      return;
    }
    var planName =
      data.plan === "premium" ? "Premium" : data.plan === "paid" ? "Pay as you go" : "Free";
    var html =
      '<p class="eyebrow">Billing</p><h2>Your plan: ' +
      escapeHtml(planName) +
      "</h2><p>" +
      escapeHtml(creditsLine(data)) +
      "</p>";
    if (data.plan === "premium") {
      html +=
        '<p>Your Premium subscription renews monthly. Cancelling keeps Premium until ' +
        escapeHtml(formatDate(data.premium.reset_at) || "the end of the current period") +
        '.</p><p><button class="btn secondary" type="button" data-cancel-subscription>Cancel Premium</button> ' +
        '<span data-cancel-message></span></p>';
    } else {
      html += '<p><a class="btn primary" href="pricing.html">See plans and pricing</a></p>';
    }
    box.innerHTML = html;

    var cancelBtn = box.querySelector("[data-cancel-subscription]");
    if (cancelBtn) {
      cancelBtn.addEventListener("click", async function () {
        if (!window.confirm("Cancel Premium? You keep Premium until the end of the current billing period.")) return;
        cancelBtn.disabled = true;
        var msg = box.querySelector("[data-cancel-message]");
        try {
          var res = await fetch("/api/cancel-subscription.js", {
            method: "POST",
            headers: { Authorization: "Bearer " + token },
          });
          if (res.ok) {
            if (msg) msg.textContent = "Cancelled. Premium stays active until the end of the current period.";
            renderPlanBox();
          } else {
            var err = null;
            try {
              err = await res.json();
            } catch (e) {
              err = null;
            }
            if (msg) msg.textContent = (err && err.error) || "Could not cancel. Please try again.";
            cancelBtn.disabled = false;
          }
        } catch (e) {
          if (msg) msg.textContent = "Could not cancel. Please try again.";
          cancelBtn.disabled = false;
        }
      });
    }
  }

  async function fillPricing() {
    var priceEls = document.querySelectorAll("[data-price]");
    var creditEls = document.querySelectorAll("[data-product-credits]");
    if (!priceEls.length && !creditEls.length) return;
    try {
      var res = await fetch("/api/pricing.js");
      if (!res.ok) return;
      var data = await res.json();
      (data.products || []).forEach(function (p) {
        priceEls.forEach(function (el) {
          if (el.getAttribute("data-price") === p.key) el.textContent = p.price_display;
        });
        creditEls.forEach(function (el) {
          if (el.getAttribute("data-product-credits") !== p.key) return;
          el.textContent =
            p.mode === "subscription"
              ? p.credits_per_month + " reports / month"
              : p.credits + (p.credits === 1 ? " report" : " reports");
        });
      });
    } catch (e) {
      // Prices stay blank rather than showing a wrong hard-coded amount.
    }
  }

  function showCheckoutBanner() {
    var banner = document.querySelector("[data-checkout-banner]");
    if (!banner) return;
    var params = new URLSearchParams(window.location.search);
    var result = params.get("checkout");
    if (result === "success") {
      banner.textContent =
        "Payment successful. Your reports or Premium access are being activated — this usually takes a few seconds. Check your account page for your updated balance.";
      banner.className = "auth-message info";
      banner.hidden = false;
    } else if (result === "cancelled") {
      banner.textContent = "Checkout was cancelled. No payment was taken.";
      banner.className = "auth-message info";
      banner.hidden = false;
    }
  }

  function bindCheckoutButtons() {
    document.querySelectorAll("[data-checkout-button]").forEach(function (btn) {
      btn.addEventListener("click", async function () {
        var product = btn.getAttribute("data-product");
        var errorBox = document.querySelector("[data-checkout-error]");
        btn.disabled = true;
        var originalText = btn.textContent;
        btn.textContent = "Redirecting to secure checkout…";
        try {
          var token = await getAccessToken();
          if (!token) {
            window.location.href = "login.html";
            return;
          }
          var res = await fetch("/api/create-checkout.js", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: "Bearer " + token,
            },
            body: JSON.stringify({ product: product }),
          });
          if (res.status === 401) {
            window.location.href = "login.html";
            return;
          }
          var data = null;
          try {
            data = await res.json();
          } catch (e) {
            data = null;
          }
          if (res.ok && data && data.url) {
            window.location.href = data.url;
            return;
          }
          if (errorBox) {
            errorBox.textContent =
              (data && data.error) || "Could not start checkout. Please try again.";
            errorBox.hidden = false;
          }
          btn.disabled = false;
          btn.textContent = originalText;
        } catch (e) {
          if (errorBox) {
            errorBox.textContent = "Could not start checkout. Please try again.";
            errorBox.hidden = false;
          }
          btn.disabled = false;
          btn.textContent = originalText;
        }
      });
    });
  }

  // Exposed so report / match pages can refresh the credits display after
  // generating a report (the box otherwise only renders once on page load).
  window.JOBillingRefresh = renderCreditsBoxes;

  document.addEventListener("DOMContentLoaded", function () {
    fillPricing();
    showCheckoutBanner();
    renderCreditsBoxes();
    renderPlanBox();
    bindCheckoutButtons();
  });
})();
