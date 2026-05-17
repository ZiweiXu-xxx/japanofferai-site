// JapanOffer AI lightweight analytics capture
// Stores page views and key clicks into Supabase table: public.page_events
// Requires auth-config.js and Supabase JS CDN to be loaded on the page.

(function () {
  function getAnonId() {
    let id = localStorage.getItem("japanoffer_anon_id");
    if (!id) {
      id = "anon_" + Math.random().toString(36).slice(2) + Date.now().toString(36);
      localStorage.setItem("japanoffer_anon_id", id);
    }
    return id;
  }

  function getSessionId() {
    let id = sessionStorage.getItem("japanoffer_session_id");
    if (!id) {
      id = "session_" + Math.random().toString(36).slice(2) + Date.now().toString(36);
      sessionStorage.setItem("japanoffer_session_id", id);
    }
    return id;
  }

  function getClient() {
    if (window.japanOfferAuth) return window.japanOfferAuth;
    const ready =
      window.supabase &&
      window.JAPANOFFER_SUPABASE_URL &&
      window.JAPANOFFER_SUPABASE_ANON_KEY &&
      !window.JAPANOFFER_SUPABASE_URL.includes("PASTE_") &&
      !window.JAPANOFFER_SUPABASE_ANON_KEY.includes("PASTE_");

    if (!ready) return null;
    return window.supabase.createClient(
      window.JAPANOFFER_SUPABASE_URL,
      window.JAPANOFFER_SUPABASE_ANON_KEY
    );
  }

  async function getUser(client) {
    if (!client) return null;
    try {
      const { data } = await client.auth.getUser();
      return data && data.user ? data.user : null;
    } catch (error) {
      return null;
    }
  }

  async function track(eventName, metadata) {
    const client = getClient();
    if (!client) return;

    const user = await getUser(client);
    const payload = {
      event_name: eventName,
      page_path: window.location.pathname,
      page_url: window.location.href,
      referrer: document.referrer || null,
      anonymous_id: getAnonId(),
      session_id: getSessionId(),
      user_id: user ? user.id : null,
      user_email: user ? user.email : null,
      metadata: metadata || {},
      user_agent: navigator.userAgent
    };

    try {
      await client.from("page_events").insert(payload);
    } catch (error) {
      console.warn("JapanOffer analytics insert failed", error);
    }
  }

  window.japanOfferTrack = track;

  document.addEventListener("DOMContentLoaded", function () {
    track("page_view", { title: document.title });

    document.addEventListener("click", function (event) {
      const clickable = event.target.closest("a, button, .quick-tags span, .cinema-sidebar span, .role-row, .match-card, .studio-card");
      if (!clickable) return;

      const text = (clickable.innerText || clickable.textContent || "").trim().slice(0, 120);
      const href = clickable.getAttribute && clickable.getAttribute("href");
      track("click", {
        text,
        href: href || null,
        tag: clickable.tagName ? clickable.tagName.toLowerCase() : null
      });
    });
  });
})();
