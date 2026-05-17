// JapanOffer AI authentication logic using Supabase Auth.
// Works on static HTML pages hosted on Vercel/GitHub.
// Requires auth-config.js to contain your Supabase Project URL and anon public key.

(function () {
  const configReady =
    window.JAPANOFFER_SUPABASE_URL &&
    window.JAPANOFFER_SUPABASE_ANON_KEY &&
    !window.JAPANOFFER_SUPABASE_URL.includes("PASTE_") &&
    !window.JAPANOFFER_SUPABASE_ANON_KEY.includes("PASTE_");

  let client = null;

  function showMessage(text, type = "info") {
    const box = document.querySelector("[data-auth-message]");
    if (!box) return;
    box.textContent = text;
    box.className = "auth-message " + type;
  }

  function getRedirectUrl(path = "account.html") {
    const base = window.location.origin + window.location.pathname.replace(/[^/]*$/, "");
    return base + path;
  }

  if (configReady && window.supabase) {
    client = window.supabase.createClient(
      window.JAPANOFFER_SUPABASE_URL,
      window.JAPANOFFER_SUPABASE_ANON_KEY
    );
    window.japanOfferAuth = client;
  } else {
    window.japanOfferAuth = null;
  }

  async function updateNav() {
    const authLinks = document.querySelectorAll(".auth-links");
    if (!authLinks.length) return;

    if (!client) {
      authLinks.forEach((el) => {
        el.innerHTML = '<a class="signin-link" href="login.html">Sign in</a><a class="nav-cta" href="signup.html">Sign up</a>';
      });
      return;
    }

    const { data } = await client.auth.getUser();
    const user = data && data.user;

    authLinks.forEach((el) => {
      if (user) {
        const email = user.email || "Account";
        el.innerHTML = '<a class="signin-link" href="account.html">' + email.split("@")[0] + '</a><button class="nav-cta button-reset" data-logout>Log out</button>';
      } else {
        el.innerHTML = '<a class="signin-link" href="login.html">Sign in</a><a class="nav-cta" href="signup.html">Sign up</a>';
      }
    });

    document.querySelectorAll("[data-logout]").forEach((btn) => {
      btn.addEventListener("click", async () => {
        await client.auth.signOut();
        window.location.href = "index.html";
      });
    });
  }

  async function handleSignup(event) {
    event.preventDefault();
    if (!client) {
      showMessage("Auth is not connected yet. Please add your Supabase URL and anon key in auth-config.js.", "error");
      return;
    }

    const form = event.currentTarget;
    const email = form.email.value.trim();
    const password = form.password.value;
    const fullName = form.fullName.value.trim();
    const role = form.role.value;

    showMessage("Creating your account...", "info");

    const { data, error } = await client.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: getRedirectUrl("account.html"),
        data: {
          full_name: fullName,
          user_type: role
        }
      }
    });

    if (error) {
      showMessage(error.message, "error");
      return;
    }

    showMessage("Account created. Please check your email to confirm your account, then sign in.", "success");
  }

  async function handleLogin(event) {
    event.preventDefault();
    if (!client) {
      showMessage("Auth is not connected yet. Please add your Supabase URL and anon key in auth-config.js.", "error");
      return;
    }

    const form = event.currentTarget;
    const email = form.email.value.trim();
    const password = form.password.value;

    showMessage("Signing in...", "info");

    const { error } = await client.auth.signInWithPassword({
      email,
      password
    });

    if (error) {
      showMessage(error.message, "error");
      return;
    }

    window.location.href = "account.html";
  }

  async function handleReset(event) {
    event.preventDefault();
    if (!client) {
      showMessage("Auth is not connected yet. Please add your Supabase URL and anon key in auth-config.js.", "error");
      return;
    }

    const email = event.currentTarget.email.value.trim();
    const { error } = await client.auth.resetPasswordForEmail(email, {
      redirectTo: getRedirectUrl("account.html")
    });

    if (error) {
      showMessage(error.message, "error");
      return;
    }

    showMessage("Password reset email sent.", "success");
  }

  async function renderAccount() {
    const accountBox = document.querySelector("[data-account-box]");
    if (!accountBox) return;

    if (!client) {
      accountBox.innerHTML = `
        <div class="auth-message error">Auth is not connected yet. Add your Supabase URL and anon key in auth-config.js.</div>
        <a class="btn primary" href="signup.html">Go to sign up</a>
      `;
      return;
    }

    const { data } = await client.auth.getUser();
    const user = data && data.user;

    if (!user) {
      accountBox.innerHTML = `
        <p class="auth-message info">You are not signed in yet.</p>
        <div class="hero-actions">
          <a class="btn primary" href="login.html">Sign in</a>
          <a class="btn secondary" href="signup.html">Create account</a>
        </div>
      `;
      return;
    }

    const meta = user.user_metadata || {};
    accountBox.innerHTML = `
      <div class="account-card">
        <span class="account-avatar">${(user.email || "U").slice(0, 1).toUpperCase()}</span>
        <div>
          <h2>${meta.full_name || "JapanOffer AI user"}</h2>
          <p>${user.email || ""}</p>
          <p>Account type: ${meta.user_type || "Job seeker"}</p>
        </div>
      </div>

      <div class="page-grid account-actions-grid">
        <article class="page-card featured">
          <span class="kicker">Next step</span>
          <h2>Generate AI match report</h2>
          <p>Fill in your education, languages, target countries and career direction.</p>
          <a class="btn primary" href="report.html">Generate report</a>
        </article>

        <article class="page-card">
          <span class="kicker">Jobs</span>
          <h2>Search matched roles</h2>
          <p>Use public job feeds and JapanOffer AI match score to compare roles.</p>
          <a class="btn secondary" href="jobs.html">Open jobs</a>
        </article>

        <article class="page-card">
          <span class="kicker">Employer</span>
          <h2>Company-side beta</h2>
          <p>Join the future employer side of the cross-border talent network.</p>
          <a class="btn secondary" href="employers.html">Employer waitlist</a>
        </article>
      </div>
    `;
  }

  document.addEventListener("DOMContentLoaded", () => {
    updateNav();
    renderAccount();

    const signupForm = document.querySelector("[data-signup-form]");
    if (signupForm) signupForm.addEventListener("submit", handleSignup);

    const loginForm = document.querySelector("[data-login-form]");
    if (loginForm) loginForm.addEventListener("submit", handleLogin);

    const resetForm = document.querySelector("[data-reset-form]");
    if (resetForm) resetForm.addEventListener("submit", handleReset);
  });
})();
