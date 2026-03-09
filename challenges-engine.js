/* Sweaty Mob — Challenge Rotation Engine
   Deterministic date-based rotation so every visitor sees the same challenges on the same day.
   Daily = rotates every day
   Weekly = rotates every Monday
   30-Day = rotates on the 1st of each month
   90-Day = rotates quarterly (Jan 1, Apr 1, Jul 1, Oct 1)
*/

(function () {
  "use strict";

  /* ── helpers ── */
  var MS_PER_DAY = 86400000;
  var EPOCH = new Date(2025, 0, 1); // Jan 1 2025 as epoch anchor

  function daysSinceEpoch() {
    var now = new Date();
    var today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    return Math.floor((today - EPOCH) / MS_PER_DAY);
  }

  function weeksSinceEpoch() {
    // Jan 1 2025 is a Wednesday. Count full weeks since then.
    return Math.floor(daysSinceEpoch() / 7);
  }

  function monthIndex() {
    var now = new Date();
    return (now.getFullYear() - 2025) * 12 + now.getMonth();
  }

  function quarterIndex() {
    var now = new Date();
    return (now.getFullYear() - 2025) * 4 + Math.floor(now.getMonth() / 3);
  }

  function pick(arr, index) {
    if (!arr || arr.length === 0) return null;
    return arr[index % arr.length];
  }

  /* ── difficulty helpers ── */
  function difficultyStars(diff) {
    if (!diff) return "";
    var d = diff.toLowerCase();
    if (d === "easy") return "\uD83D\uDD25";          // 🔥
    if (d === "medium") return "\uD83D\uDD25\uD83D\uDD25";     // 🔥🔥
    if (d === "hard") return "\uD83D\uDD25\uD83D\uDD25\uD83D\uDD25"; // 🔥🔥🔥
    return "";
  }

  function difficultyLabel(diff) {
    if (!diff) return "All Levels";
    return diff.charAt(0).toUpperCase() + diff.slice(1);
  }

  /* ── date display ── */
  function formatDate(date) {
    var months = ["January","February","March","April","May","June",
                  "July","August","September","October","November","December"];
    return months[date.getMonth()] + " " + date.getDate() + ", " + date.getFullYear();
  }

  function currentDateStr() {
    return formatDate(new Date());
  }

  function currentWeekRange() {
    var now = new Date();
    var day = now.getDay(); // 0=Sun
    var diff = day === 0 ? -6 : 1 - day; // monday
    var monday = new Date(now);
    monday.setDate(now.getDate() + diff);
    var sunday = new Date(monday);
    sunday.setDate(monday.getDate() + 6);
    var months = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];
    return months[monday.getMonth()] + " " + monday.getDate() + " – " +
           months[sunday.getMonth()] + " " + sunday.getDate();
  }

  function currentMonthYear() {
    var months = ["January","February","March","April","May","June",
                  "July","August","September","October","November","December"];
    var now = new Date();
    return months[now.getMonth()] + " " + now.getFullYear();
  }

  function currentQuarter() {
    var now = new Date();
    var q = Math.floor(now.getMonth() / 3) + 1;
    return "Q" + q + " " + now.getFullYear();
  }

  /* ── render ── */
  function renderActiveChallenge(containerId, challenge, periodLabel, periodValue, typeLabel) {
    var el = document.getElementById(containerId);
    if (!el || !challenge) return;

    var name = challenge.name || "Challenge";
    var cat = challenge.cat || "";
    var diff = challenge.diff || "";
    var trigger = challenge.trigger || "";
    var time = challenge.time || "";

    var html = '<div class="active-challenge fade-in">' +
      '<div class="active-challenge__header">' +
        '<span class="active-challenge__badge">' + typeLabel + '</span>' +
        (diff ? '<span class="active-challenge__difficulty">' + difficultyStars(diff) + ' ' + difficultyLabel(diff) + '</span>' : '') +
      '</div>' +
      '<h3 class="active-challenge__name">' + name + '</h3>' +
      '<p class="active-challenge__period">' + periodLabel + ': ' + periodValue + '</p>' +
      '<div class="active-challenge__meta">' +
        (cat ? '<span class="active-challenge__tag">' + cat + '</span>' : '') +
        (trigger ? '<span class="active-challenge__tag">' + trigger + '</span>' : '') +
        (time ? '<span class="active-challenge__tag">\u23F1 ' + time + '</span>' : '') +
      '</div>' +
      '<div class="active-challenge__cta">' +
        '<button onclick="window.openShareModal(\'' + name.replace(/'/g, "\\'") + '\')" class="btn btn--primary" style="cursor:pointer;">I Crushed It \uD83D\uDCAA</button>' +
        '<p class="active-challenge__share">Screenshot your sweat and tag <strong>@sweatym0b</strong></p>' +
      '</div>' +
    '</div>';

    el.innerHTML = html;
  }

  function renderLibraryCards(containerId, challenges, limit) {
    var el = document.getElementById(containerId);
    if (!el || !challenges) return;

    var count = Math.min(limit || 12, challenges.length);
    var startIdx = daysSinceEpoch(); // rotate which cards show each day
    var html = '';
    var shareIcon = '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M4 12v8a2 2 0 002 2h12a2 2 0 002-2v-8"/><polyline points="16,6 12,2 8,6"/><line x1="12" y1="2" x2="12" y2="15"/></svg>';

    for (var i = 0; i < count; i++) {
      var c = challenges[(startIdx + i) % challenges.length];
      var diff = c.diff || "";
      var cat = c.cat || "Challenge";
      var tagClass = "challenge-card__tag--default";

      // Map categories to tag classes
      var catLower = cat.toLowerCase();
      if (catLower.indexOf("squat") >= 0 || catLower.indexOf("lunge") >= 0 || catLower.indexOf("push") >= 0)
        tagClass = "challenge-card__tag--burner";
      else if (catLower.indexOf("walk") >= 0 || catLower.indexOf("stretch") >= 0 || catLower.indexOf("yoga") >= 0)
        tagClass = "challenge-card__tag--quickie";
      else if (catLower.indexOf("hiit") >= 0 || catLower.indexOf("full") >= 0 || catLower.indexOf("strength") >= 0)
        tagClass = "challenge-card__tag--boss";
      else if (catLower.indexOf("team") >= 0 || catLower.indexOf("community") >= 0 || catLower.indexOf("group") >= 0)
        tagClass = "challenge-card__tag--mob";

      html += '<div class="challenge-card fade-in">' +
        '<div class="challenge-card__top">' +
          '<span class="challenge-card__tag ' + tagClass + '">' + cat + '</span>' +
          (diff ? '<span class="challenge-card__difficulty">' + difficultyStars(diff) + '</span>' : '') +
        '</div>' +
        '<h3 class="challenge-card__name">' + c.name + '</h3>' +
        (c.time ? '<p class="challenge-card__desc">\u23F1 ' + c.time + (c.trigger ? ' \u00B7 ' + c.trigger : '') + '</p>' : '') +
        '<div class="challenge-card__footer">' +
          '<button onclick="window.openShareModal(\'' + c.name.replace(/'/g, "\\'") + '\')" class="challenge-card__share" aria-label="Share ' + c.name + '" style="cursor:pointer;background:none;border:none;">' +
            shareIcon + ' Share' +
          '</button>' +
        '</div>' +
      '</div>';
    }

    el.innerHTML = html;

    // Re-trigger scroll animations on new cards
    if (typeof ScrollReveal !== "undefined") {
      // If using a scroll reveal library, re-init
    }
    // Manual fade-in for freshly injected cards
    var cards = el.querySelectorAll(".fade-in");
    for (var j = 0; j < cards.length; j++) {
      cards[j].classList.add("is-visible");
    }
  }

  /* ── filter/search for library ── */
  function initLibraryFilter() {
    var filterBtns = document.querySelectorAll("[data-challenge-filter]");
    var searchInput = document.getElementById("challenge-search");
    var libraryGrid = document.getElementById("library-grid");

    if (!libraryGrid) return;

    var allChallenges = SM_CHALLENGES.daily.concat(
      SM_CHALLENGES.weekly,
      SM_CHALLENGES.thirty,
      SM_CHALLENGES.ninety
    );

    var currentFilter = "all";
    var currentSearch = "";

    function getFiltered() {
      var filtered = allChallenges;

      // Filter by type
      if (currentFilter === "daily") filtered = SM_CHALLENGES.daily;
      else if (currentFilter === "weekly") filtered = SM_CHALLENGES.weekly;
      else if (currentFilter === "thirty") filtered = SM_CHALLENGES.thirty;
      else if (currentFilter === "ninety") filtered = SM_CHALLENGES.ninety;

      // Filter by search
      if (currentSearch) {
        var q = currentSearch.toLowerCase();
        filtered = filtered.filter(function (c) {
          return (c.name && c.name.toLowerCase().indexOf(q) >= 0) ||
                 (c.cat && c.cat.toLowerCase().indexOf(q) >= 0);
        });
      }

      return filtered;
    }

    function update() {
      var filtered = getFiltered();
      renderLibraryCards("library-grid", filtered, 24);

      // Update count
      var countEl = document.getElementById("library-count");
      if (countEl) countEl.textContent = filtered.length + " of " + allChallenges.length + " challenges";
    }

    // Filter buttons
    for (var i = 0; i < filterBtns.length; i++) {
      filterBtns[i].addEventListener("click", function (e) {
        currentFilter = this.getAttribute("data-challenge-filter");
        // Update active class
        for (var j = 0; j < filterBtns.length; j++) {
          filterBtns[j].classList.remove("filter-btn--active");
        }
        this.classList.add("filter-btn--active");
        update();
      });
    }

    // Search
    if (searchInput) {
      var debounceTimer;
      searchInput.addEventListener("input", function () {
        clearTimeout(debounceTimer);
        debounceTimer = setTimeout(function () {
          currentSearch = searchInput.value.trim();
          update();
        }, 300);
      });
    }
  }

  /* ── init on DOM ready ── */
  function init() {
    if (typeof SM_CHALLENGES === "undefined") return;

    var dayIdx = daysSinceEpoch();
    var weekIdx = weeksSinceEpoch();
    var monIdx = monthIndex();
    var qIdx = quarterIndex();

    // Daily challenge
    var dailyChallenge = pick(SM_CHALLENGES.daily, dayIdx);
    renderActiveChallenge("daily-challenge", dailyChallenge, "Today", currentDateStr(), "Daily Challenge");

    // Weekly challenge
    var weeklyChallenge = pick(SM_CHALLENGES.weekly, weekIdx);
    renderActiveChallenge("weekly-challenge", weeklyChallenge, "This Week", currentWeekRange(), "Weekly Challenge");

    // 30-Day challenge
    var thirtyChallenge = pick(SM_CHALLENGES.thirty, monIdx);
    renderActiveChallenge("thirty-challenge", thirtyChallenge, "This Month", currentMonthYear(), "30-Day Challenge");

    // 90-Day challenge
    var ninetyChallenge = pick(SM_CHALLENGES.ninety, qIdx);
    renderActiveChallenge("ninety-challenge", ninetyChallenge, "This Quarter", currentQuarter(), "90-Day Challenge");

    // Library
    renderLibraryCards("library-grid", SM_CHALLENGES.daily, 12);
    initLibraryFilter();
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
