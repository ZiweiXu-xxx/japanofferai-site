// JapanOffer AI cinematic interactions
// Lightweight, no external library.

(function () {
  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  document.documentElement.classList.add("js-ready");

  if (reduceMotion) {
    document.documentElement.classList.add("reduce-motion");
    return;
  }

  const revealTargets = document.querySelectorAll(
    ".hero-left, .hero-product, .section-head, .network-grid > *, .compare > *, .two-sides > *, .business-grid > *, .engine-grid > *, .wide-panel, .page-card, .live-job-card, .cta-card"
  );

  revealTargets.forEach((el, index) => {
    el.classList.add("reveal");
    el.style.setProperty("--reveal-delay", `${Math.min(index % 8, 6) * 70}ms`);
  });

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-visible");
          observer.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.14, rootMargin: "0px 0px -8% 0px" }
  );

  revealTargets.forEach((el) => observer.observe(el));

  const tiltCards = document.querySelectorAll(".hero-product, .profile-panel, .feed-panel, .employer-panel, .page-card, .live-job-card, .side-card");

  tiltCards.forEach((card) => {
    card.addEventListener("pointermove", (event) => {
      const rect = card.getBoundingClientRect();
      const x = (event.clientX - rect.left) / rect.width - 0.5;
      const y = (event.clientY - rect.top) / rect.height - 0.5;
      card.style.setProperty("--tilt-x", `${(-y * 3.5).toFixed(2)}deg`);
      card.style.setProperty("--tilt-y", `${(x * 4.5).toFixed(2)}deg`);
      card.style.setProperty("--glow-x", `${event.clientX - rect.left}px`);
      card.style.setProperty("--glow-y", `${event.clientY - rect.top}px`);
      card.classList.add("is-tilting");
    });

    card.addEventListener("pointerleave", () => {
      card.style.setProperty("--tilt-x", "0deg");
      card.style.setProperty("--tilt-y", "0deg");
      card.classList.remove("is-tilting");
    });
  });

  const scoreEls = document.querySelectorAll(".match-score strong, .role-row strong, .live-score strong");
  const scoreObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;

        const el = entry.target;
        const raw = el.textContent.trim();
        const target = parseInt(raw.replace("%", ""), 10);

        if (!Number.isFinite(target)) {
          scoreObserver.unobserve(el);
          return;
        }

        let current = 0;
        const duration = 900;
        const start = performance.now();

        function tick(now) {
          const progress = Math.min((now - start) / duration, 1);
          const eased = 1 - Math.pow(1 - progress, 3);
          current = Math.round(target * eased);
          el.textContent = `${current}%`;
          if (progress < 1) requestAnimationFrame(tick);
        }

        requestAnimationFrame(tick);
        scoreObserver.unobserve(el);
      });
    },
    { threshold: 0.6 }
  );

  scoreEls.forEach((el) => scoreObserver.observe(el));
})();
