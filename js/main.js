(() => {
  const header = document.getElementById("site-header");
  const toggle = document.querySelector(".nav-toggle");
  const nav = document.getElementById("site-nav");
  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
  const mobileQuery = window.matchMedia("(max-width: 900px)");

  /* -------------------------------------------------------------------------- */
  /* Lenis smooth scroll                                                        */
  /* -------------------------------------------------------------------------- */

  let lenis = null;

  const initLenis = () => {
    if (reduceMotion.matches || typeof Lenis === "undefined") return;

    lenis = new Lenis({
      duration: 1.15,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      smoothWheel: true,
    });

    const raf = (time) => {
      lenis.raf(time);
      requestAnimationFrame(raf);
    };
    requestAnimationFrame(raf);

    lenis.on("scroll", () => {
      onScroll();
      requestParallax();
      requestMemoryScroll();
    });
  };

  /* -------------------------------------------------------------------------- */
  /* Header                                                                     */
  /* -------------------------------------------------------------------------- */

  const onScroll = () => {
    if (!header) return;
    header.classList.toggle("is-scrolled", window.scrollY > 8);
  };

  window.addEventListener("scroll", onScroll, { passive: true });
  onScroll();

  if (toggle && nav) {
    toggle.addEventListener("click", () => {
      const open = toggle.getAttribute("aria-expanded") === "true";
      toggle.setAttribute("aria-expanded", String(!open));
      nav.classList.toggle("is-open", !open);
    });

    nav.querySelectorAll("a").forEach((link) => {
      link.addEventListener("click", () => {
        toggle.setAttribute("aria-expanded", "false");
        nav.classList.remove("is-open");
      });
    });
  }

  /* -------------------------------------------------------------------------- */
  /* Footer reveal — content overlays fixed footer                              */
  /* -------------------------------------------------------------------------- */

  const footer = document.querySelector(".site-footer");
  const main = document.getElementById("main");

  const syncFooterSpace = () => {
    if (!footer || !main) return;
    if (mobileQuery.matches) {
      main.style.marginBottom = "";
      return;
    }
    main.style.marginBottom = `${footer.offsetHeight}px`;
  };

  syncFooterSpace();
  window.addEventListener("resize", syncFooterSpace, { passive: true });
  if (window.ResizeObserver && footer) {
    new ResizeObserver(syncFooterSpace).observe(footer);
  }

  /* -------------------------------------------------------------------------- */
  /* Section fade reveals (existing)                                            */
  /* -------------------------------------------------------------------------- */

  const revealTargets = document.querySelectorAll(
    ".about-hero__intro, .about-hero__photos, .story__row, .quote-banner, .story__after, .team__inner, .mission__inner, .activities__intro, .activity-card, .culture__inner"
  );

  revealTargets.forEach((el) => el.classList.add("reveal"));

  document
    .querySelectorAll(".about-hero__intro, .about-hero__photos")
    .forEach((el) => el.classList.add("is-visible"));

  if ("IntersectionObserver" in window) {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-visible");
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.08, rootMargin: "0px 0px -5% 0px" }
    );

    revealTargets.forEach((el) => observer.observe(el));
  } else {
    revealTargets.forEach((el) => el.classList.add("is-visible"));
  }

  /* -------------------------------------------------------------------------- */
  /* Heading line reveal + quote visual-line reveal + mission fade              */
  /* -------------------------------------------------------------------------- */

  const escapeHtml = (str) =>
    str
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;");

  const wrapLineReveal = (el, { delay = 0 } = {}) => {
    if (!el || el.dataset.lineReady) return;
    const text = el.textContent.trim();
    if (!text) return;
    el.dataset.lineReady = "true";
    el.setAttribute("aria-label", text);
    el.innerHTML = `<span class="line-reveal" style="--reveal-delay:${delay}s"><span class="line-reveal__inner">${escapeHtml(
      text
    )}</span></span>`;
  };

  const splitQuoteIntoVisualLines = (el) => {
    if (!el) return;
    const source = el.dataset.sourceText || el.textContent.trim();
    if (!source) return;

    el.dataset.sourceText = source;
    el.setAttribute("aria-label", source);
    const wasInview = el.classList.contains("is-inview");

    // Measure word tops first
    el.innerHTML = source
      .split(/\s+/)
      .map((word) => `<span class="js-word">${escapeHtml(word)}</span>`)
      .join(" ");

    const wordEls = [...el.querySelectorAll(".js-word")];
    if (!wordEls.length) return;

    const lines = [];
    let currentTop = null;
    let bucket = [];

    wordEls.forEach((word) => {
      const top = word.offsetTop;
      if (currentTop === null || Math.abs(top - currentTop) <= 2) {
        bucket.push(word.textContent);
        currentTop = top;
      } else {
        lines.push(bucket);
        bucket = [word.textContent];
        currentTop = top;
      }
    });
    if (bucket.length) lines.push(bucket);

    el.innerHTML = lines
      .map(
        (words, index) =>
          `<span class="line-reveal" style="--reveal-delay:${(index * 0.09).toFixed(
            2
          )}s"><span class="line-reveal__inner">${escapeHtml(
            words.join(" ")
          )}</span></span>`
      )
      .join("");

    el.dataset.lineReady = "true";
    if (wasInview || reduceMotion.matches) el.classList.add("is-inview");
  };

  document
    .querySelectorAll(".section-title, .mission__label, .memory-lives__lead")
    .forEach((el) => wrapLineReveal(el));

  const missionHeadline = document.querySelector(".mission__headline");
  if (missionHeadline) missionHeadline.classList.add("fade-rise");

  const quoteText = document.querySelector(".quote-banner__text");

  let lineObserver = null;
  const observeRevealRoots = () => {
    const roots = document.querySelectorAll(
      ".section-title, .mission__label, .mission__headline, .memory-lives__lead, .quote-banner__text"
    );

    if (reduceMotion.matches) {
      roots.forEach((el) => el.classList.add("is-inview"));
      return;
    }

    if (!("IntersectionObserver" in window)) {
      roots.forEach((el) => el.classList.add("is-inview"));
      return;
    }

    if (lineObserver) lineObserver.disconnect();
    lineObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-inview");
            lineObserver.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.35, rootMargin: "0px 0px -8% 0px" }
    );

    roots.forEach((el) => {
      if (!el.classList.contains("is-inview")) lineObserver.observe(el);
    });
  };

  const refreshQuoteLines = () => {
    splitQuoteIntoVisualLines(quoteText);
    observeRevealRoots();
  };

  const bootQuote = () => {
    refreshQuoteLines();
    if (document.fonts && document.fonts.ready) {
      document.fonts.ready.then(refreshQuoteLines);
    }
  };

  bootQuote();

  let quoteResizeTimer = null;
  window.addEventListener(
    "resize",
    () => {
      clearTimeout(quoteResizeTimer);
      quoteResizeTimer = setTimeout(refreshQuoteLines, 150);
    },
    { passive: true }
  );

  observeRevealRoots();

  /* -------------------------------------------------------------------------- */
  /* Parallax + scale banners                                                   */
  /* -------------------------------------------------------------------------- */

  const parallaxSections = document.querySelectorAll(".slogan-banner, .vision-banner");
  let parallaxTicking = false;

  const resetParallax = () => {
    parallaxSections.forEach((section) => {
      const media = section.querySelector(".slogan-banner__media, .vision-banner__media");
      if (media) media.style.transform = "";
    });
  };

  const updateParallax = () => {
    if (reduceMotion.matches || mobileQuery.matches) {
      resetParallax();
      return;
    }

    const vh = window.innerHeight;

    parallaxSections.forEach((section) => {
      const media = section.querySelector(".slogan-banner__media, .vision-banner__media");
      if (!media) return;

      const rect = section.getBoundingClientRect();
      const visible = rect.bottom > 0 && rect.top < vh;
      if (!visible) return;

      const progress = (vh - rect.top) / (vh + rect.height);
      const clamped = Math.min(1, Math.max(0, progress));
      const offset = (clamped - 0.5) * rect.height * 0.28;
      // Gentle Ken Burns: scale eases from 1.12 → 1.04 while scrolling through
      const scale = 1.12 - clamped * 0.08;
      media.style.transform = `translate3d(0, ${offset.toFixed(2)}px, 0) scale(${scale.toFixed(4)})`;
    });
  };

  const requestParallax = () => {
    if (parallaxTicking) return;
    parallaxTicking = true;
    requestAnimationFrame(() => {
      updateParallax();
      parallaxTicking = false;
    });
  };

  window.addEventListener("scroll", requestParallax, { passive: true });
  window.addEventListener("resize", requestParallax, { passive: true });
  updateParallax();

  /* -------------------------------------------------------------------------- */
  /* Memory lives — iPhone-style line scroll                                    */
  /* -------------------------------------------------------------------------- */

  const memorySection = document.querySelector(".memory-lives");
  const memoryTrack = document.querySelector(".memory-lives__track");
  const memoryViewport = document.querySelector(".memory-lives__viewport");
  let memoryTicking = false;

  const updateMemoryScroll = () => {
    if (!memorySection || !memoryTrack || !memoryViewport) return;

    const lines = [...memoryTrack.querySelectorAll(".memory-lives__line")];
    const firstLine = lines[0];
    const alignTarget = memoryTrack.querySelector("[data-memory-align]");

    if (reduceMotion.matches || mobileQuery.matches) {
      memoryTrack.style.transform = "";
      lines.forEach((line) => {
        line.style.opacity = "";
        line.style.transform = "";
      });
      return;
    }

    if (!lines.length || !firstLine || !alignTarget) return;

    const headerH =
      parseFloat(
        getComputedStyle(document.documentElement).getPropertyValue("--header-h")
      ) || 80;
    const rect = memorySection.getBoundingClientRect();
    const pinHeight = window.innerHeight - headerH;
    const scrollable = Math.max(1, memorySection.offsetHeight - pinHeight);
    const progress = Math.min(1, Math.max(0, (headerH - rect.top) / scrollable));

    memoryTrack.style.transform = "none";
    lines.forEach((line) => {
      line.style.transform = "none";
    });

    const viewportCenter = memoryViewport.clientHeight / 2;
    const firstCenter = firstLine.offsetTop + firstLine.offsetHeight / 2;
    const targetCenter = alignTarget.offsetTop + alignTarget.offsetHeight / 2;
    const metrics = lines.map((line) => ({
      center: line.offsetTop + line.offsetHeight / 2,
      height: line.offsetHeight || 80,
    }));

    const startY = viewportCenter - firstCenter;
    const endY = viewportCenter - targetCenter;
    const y = startY + (endY - startY) * progress;

    memoryTrack.style.transform = `translate3d(0, ${y.toFixed(2)}px, 0)`;

    lines.forEach((line, index) => {
      const lineCenter = y + metrics[index].center;
      const distance = Math.abs(lineCenter - viewportCenter);
      const focus = Math.max(0, 1 - distance / (metrics[index].height * 1.6));
      line.style.opacity = (0.22 + focus * 0.78).toFixed(3);
      line.style.transform = `scale(${(0.97 + focus * 0.03).toFixed(3)})`;
    });
  };

  const requestMemoryScroll = () => {
    if (memoryTicking) return;
    memoryTicking = true;
    requestAnimationFrame(() => {
      updateMemoryScroll();
      memoryTicking = false;
    });
  };

  window.addEventListener("scroll", requestMemoryScroll, { passive: true });
  window.addEventListener("resize", requestMemoryScroll, { passive: true });
  updateMemoryScroll();

  initLenis();
})();
