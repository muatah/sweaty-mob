/* Sweaty Mob — app.js
   Mobile menu, dark mode toggle, header scroll, counter animations */

(function () {
  "use strict";

  /* ========================
     DARK MODE TOGGLE
     ======================== */
  var toggle = document.querySelector("[data-theme-toggle]");
  var root = document.documentElement;
  var theme = window.matchMedia("(prefers-color-scheme: dark)").matches
    ? "dark"
    : "light";

  root.setAttribute("data-theme", theme);
  updateToggleIcon();

  if (toggle) {
    toggle.addEventListener("click", function () {
      theme = theme === "dark" ? "light" : "dark";
      root.setAttribute("data-theme", theme);
      toggle.setAttribute(
        "aria-label",
        "Switch to " + (theme === "dark" ? "light" : "dark") + " mode"
      );
      updateToggleIcon();
    });
  }

  function updateToggleIcon() {
    if (!toggle) return;
    toggle.innerHTML =
      theme === "dark"
        ? '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="5"/><path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42"/></svg>'
        : '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/></svg>';
  }

  /* ========================
     MOBILE MENU
     ======================== */
  var hamburger = document.querySelector(".hamburger");
  var mobileNav = document.querySelector(".mobile-nav");

  if (hamburger && mobileNav) {
    hamburger.addEventListener("click", function () {
      var isOpen = hamburger.classList.toggle("active");
      mobileNav.classList.toggle("open");
      hamburger.setAttribute("aria-expanded", String(isOpen));
      document.body.style.overflow = isOpen ? "hidden" : "";
    });

    // Close on link click
    var mobileLinks = mobileNav.querySelectorAll(".mobile-nav__link");
    mobileLinks.forEach(function (link) {
      link.addEventListener("click", function () {
        hamburger.classList.remove("active");
        mobileNav.classList.remove("open");
        hamburger.setAttribute("aria-expanded", "false");
        document.body.style.overflow = "";
      });
    });
  }

  /* ========================
     HEADER SCROLL BEHAVIOR
     ======================== */
  var header = document.getElementById("header");
  var lastScrollY = 0;

  if (header) {
    window.addEventListener(
      "scroll",
      function () {
        var currentScrollY = window.scrollY;
        if (currentScrollY > 60) {
          header.classList.add("header--scrolled");
        } else {
          header.classList.remove("header--scrolled");
        }
        lastScrollY = currentScrollY;
      },
      { passive: true }
    );
  }

  /* ========================
     COUNTER ANIMATION
     ======================== */
  function animateCounters() {
    var counters = document.querySelectorAll("[data-count]");
    counters.forEach(function (el) {
      if (el.dataset.animated) return;

      var target = parseInt(el.dataset.count, 10);
      var suffix = el.textContent.replace(/[\d,]/g, "");
      var duration = 1200;
      var start = 0;
      var startTime = null;

      function step(timestamp) {
        if (!startTime) startTime = timestamp;
        var progress = Math.min((timestamp - startTime) / duration, 1);
        // Ease out cubic
        var eased = 1 - Math.pow(1 - progress, 3);
        var current = Math.round(start + (target - start) * eased);
        el.textContent = current + suffix;
        if (progress < 1) {
          requestAnimationFrame(step);
        }
      }

      el.dataset.animated = "true";
      requestAnimationFrame(step);
    });
  }

  // Trigger counters when stats bar enters viewport
  var statsBar = document.querySelector(".stats-bar");
  if (statsBar) {
    var statsObserver = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            animateCounters();
            statsObserver.disconnect();
          }
        });
      },
      { threshold: 0.3 }
    );
    statsObserver.observe(statsBar);
  }

  /* ========================
     FALLBACK SCROLL REVEAL
     (for browsers without animation-timeline)
     ======================== */
  if (!CSS.supports("animation-timeline: scroll()")) {
    var fadeElements = document.querySelectorAll(".fade-in, .reveal-up");

    if (fadeElements.length > 0) {
      var revealObserver = new IntersectionObserver(
        function (entries) {
          entries.forEach(function (entry) {
            if (entry.isIntersecting) {
              entry.target.style.opacity = "1";
              entry.target.style.clipPath = "none";
              revealObserver.unobserve(entry.target);
            }
          });
        },
        { threshold: 0.1, rootMargin: "0px 0px -40px 0px" }
      );

      fadeElements.forEach(function (el) {
        el.style.opacity = "0";
        el.style.transition =
          "opacity 0.6s cubic-bezier(0.16, 1, 0.3, 1), clip-path 0.6s cubic-bezier(0.16, 1, 0.3, 1)";
        if (el.classList.contains("reveal-up")) {
          el.style.clipPath = "inset(20% 0 0 0)";
        }
        revealObserver.observe(el);
      });
    }
  }

  /* ========================
     SMOOTH SCROLL FOR ANCHORS
     ======================== */
  document.querySelectorAll('a[href^="#"]').forEach(function (anchor) {
    anchor.addEventListener("click", function (e) {
      var targetId = this.getAttribute("href");
      if (targetId === "#") return;
      var targetEl = document.querySelector(targetId);
      if (targetEl) {
        e.preventDefault();
        targetEl.scrollIntoView({ behavior: "smooth", block: "start" });
      }
    });
  });
})();
