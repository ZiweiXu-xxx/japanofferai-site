// JapanOffer AI refined premium motion system
// Step 13: smoother motion, no distracting score counter.

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
    el.style.setProperty("--reveal-delay", `${Math.min(index % 6, 5) * 65}ms`);
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
      card.style.setProperty("--tilt-x", `${(-y * 2.2).toFixed(2)}deg`);
      card.style.setProperty("--tilt-y", `${(x * 2.8).toFixed(2)}deg`);
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

  // Very subtle hero parallax only. No animated score numbers.
  const product = document.querySelector(".product-cinema");
  if (product) {
    let ticking = false;
    window.addEventListener("scroll", () => {
      if (ticking) return;
      ticking = true;
      requestAnimationFrame(() => {
        const y = Math.min(window.scrollY, 700);
        product.style.setProperty("--hero-parallax", `${y * -0.018}px`);
        ticking = false;
      });
    }, { passive: true });
  }
})();
