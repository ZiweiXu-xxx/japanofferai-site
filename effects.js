// JapanOffer AI ultra premium motion system
(function () {
  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  document.documentElement.classList.add("js-ready");
  if (reduceMotion) {
    document.documentElement.classList.add("reduce-motion");
    return;
  }

  const revealTargets = document.querySelectorAll(
    ".premium-reveal, .page-card, .wide-panel, .live-job-card, .auth-panel, .auth-copy"
  );

  revealTargets.forEach((el, index) => {
    el.classList.add("reveal");
    el.style.setProperty("--reveal-delay", `${Math.min(index % 7, 6) * 80}ms`);
  });

  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      entry.target.classList.add("is-visible");
      observer.unobserve(entry.target);
    });
  }, { threshold: 0.16, rootMargin: "0px 0px -10% 0px" });

  revealTargets.forEach((el) => observer.observe(el));

  const tiltTargets = document.querySelectorAll(
    ".product-cinema, .cinema-card, .candidate-glass, .studio-card, .report-preview, .final-card, .page-card, .live-job-card, .auth-panel"
  );

  tiltTargets.forEach((card) => {
    card.addEventListener("pointermove", (event) => {
      const rect = card.getBoundingClientRect();
      const x = (event.clientX - rect.left) / rect.width - 0.5;
      const y = (event.clientY - rect.top) / rect.height - 0.5;
      card.style.setProperty("--tilt-x", `${(-y * 4).toFixed(2)}deg`);
      card.style.setProperty("--tilt-y", `${(x * 5).toFixed(2)}deg`);
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

  const scores = document.querySelectorAll(".cinema-card strong, .report-score strong, .match-score strong, .live-score strong");
  const scoreObserver = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      const el = entry.target;
      const raw = el.textContent.trim();
      const target = parseInt(raw.replace("%", ""), 10);
      if (!Number.isFinite(target)) {
        scoreObserver.unobserve(el);
        return;
      }

      const start = performance.now();
      const duration = 950;
      function tick(now) {
        const p = Math.min((now - start) / duration, 1);
        const eased = 1 - Math.pow(1 - p, 3);
        el.textContent = `${Math.round(target * eased)}%`;
        if (p < 1) requestAnimationFrame(tick);
      }
      el.textContent = "0%";
      requestAnimationFrame(tick);
      scoreObserver.unobserve(el);
    });
  }, { threshold: 0.65 });

  scores.forEach((el) => scoreObserver.observe(el));

  // Subtle parallax only on the premium hero
  const hero = document.querySelector(".premium-hero");
  const product = document.querySelector(".product-cinema");
  if (hero && product) {
    window.addEventListener("scroll", () => {
      const y = Math.min(window.scrollY, 700);
      product.style.setProperty("--hero-parallax", `${y * -0.025}px`);
    }, { passive: true });
  }
})();
