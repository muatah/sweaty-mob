/* global SM_CHALLENGES */
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
    var day = now.getDay();
    var diff = day === 0 ? -6 : 1 - day;
    var monday = new Date(now);
    monday.setDate(now.getDate() + diff);
    var sunday = new Date(monday);
    sunday.setDate(monday.getDate() + 6);
    var months = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];
    return months[monday.getMonth()] + " " + monday.getDate() + " \u2013 " +
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

  /* ── levels rendering helper ── */
  function renderLevelsHTML(levels) {
    if (!levels) return "";
    var html = '<div class="challenge-levels">';
    html += '<div class="challenge-levels__row challenge-levels__row--l1">';
    html += '<span class="challenge-levels__badge challenge-levels__badge--l1">1</span>';
    html += '<span class="challenge-levels__text">' + levels.l1 + '</span>';
    html += '</div>';
    html += '<div class="challenge-levels__row challenge-levels__row--l2">';
    html += '<span class="challenge-levels__badge challenge-levels__badge--l2">2</span>';
    html += '<span class="challenge-levels__text">' + levels.l2 + '</span>';
    html += '</div>';
    html += '<div class="challenge-levels__row challenge-levels__row--l3">';
    html += '<span class="challenge-levels__badge challenge-levels__badge--l3">3</span>';
    html += '<span class="challenge-levels__text">' + levels.l3 + '</span>';
    html += '</div>';
    html += '</div>';
    return html;
  }

  /* ── render active challenge ── */
  function renderActiveChallenge(containerId, challenge, periodLabel, periodValue, typeLabel) {
    var el = document.getElementById(containerId);
    if (!el || !challenge) return;

    var name = challenge.name || "Challenge";
    var cat = challenge.cat || "";
    var trigger = challenge.trigger || "";
    var time = challenge.time || "";
    var levels = challenge.levels || null;
    var image = challenge.image || "";

    var html = '<div class="active-challenge fade-in">' +
      '<div class="active-challenge__header">' +
        '<span class="active-challenge__badge">' + typeLabel + '</span>' +
      '</div>' +
      (image ? '<div class="active-challenge__image-wrap"><img src="' + image + '" alt="' + cat + ' exercise" class="active-challenge__image" loading="lazy"></div>' : '') +
      '<h3 class="active-challenge__name">' + name + '</h3>' +
      '<p class="active-challenge__period">' + periodLabel + ': ' + periodValue + '</p>' +
      '<div class="active-challenge__meta">' +
        (cat ? '<span class="active-challenge__tag">' + cat + '</span>' : '') +
        (trigger ? '<span class="active-challenge__tag">' + trigger + '</span>' : '') +
        (time ? '<span class="active-challenge__tag">\u23F1 ' + time + '</span>' : '') +
      '</div>' +
      renderLevelsHTML(levels) +
      '<div class="active-challenge__cta">' +
        '<button onclick="window.openShareModal(\'' + name.replace(/'/g, "\\'") + '\')" class="btn btn--primary" style="cursor:pointer;">I Crushed It \uD83D\uDCAA</button>' +
        '<p class="active-challenge__share">Screenshot your sweat and tag <strong>@sweatym0b</strong></p>' +
      '</div>' +
    '</div>';

    el.innerHTML = html;
  }

  /* ── render library cards ── */
  function renderLibraryCards(containerId, challenges, limit) {
    var el = document.getElementById(containerId);
    if (!el || !challenges) return;

    var count = Math.min(limit || 12, challenges.length);
    var startIdx = daysSinceEpoch();
    var html = '';
    var shareIcon = '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M4 12v8a2 2 0 002 2h12a2 2 0 002-2v-8"/><polyline points="16,6 12,2 8,6"/><line x1="12" y1="2" x2="12" y2="15"/></svg>';

    for (var i = 0; i < count; i++) {
      var c = challenges[(startIdx + i) % challenges.length];
      var cat = c.cat || c.focus || "Challenge";
      var tagClass = "challenge-card__tag--default";

      var catLower = cat.toLowerCase();
      if (catLower.indexOf("squat") >= 0 || catLower.indexOf("lunge") >= 0 || catLower.indexOf("push") >= 0)
        tagClass = "challenge-card__tag--burner";
      else if (catLower.indexOf("walk") >= 0 || catLower.indexOf("stretch") >= 0 || catLower.indexOf("yoga") >= 0 || catLower.indexOf("balance") >= 0 || catLower.indexOf("flex") >= 0)
        tagClass = "challenge-card__tag--quickie";
      else if (catLower.indexOf("hiit") >= 0 || catLower.indexOf("full") >= 0 || catLower.indexOf("strength") >= 0 || catLower.indexOf("burpee") >= 0 || catLower.indexOf("run") >= 0)
        tagClass = "challenge-card__tag--boss";
      else if (catLower.indexOf("team") >= 0 || catLower.indexOf("community") >= 0 || catLower.indexOf("group") >= 0 || catLower.indexOf("general") >= 0)
        tagClass = "challenge-card__tag--mob";

      // Image thumbnail for daily challenges (they have image field)
      var imageHTML = '';
      if (c.image) {
        imageHTML = '<div class="challenge-card__image-wrap"><img src="' + c.image + '" alt="' + cat + '" class="challenge-card__image" loading="lazy"></div>';
      }

      // Levels for daily challenges
      var levelsHTML = '';
      if (c.levels) {
        levelsHTML = '<div class="challenge-card__levels">' +
          '<div class="challenge-card__level"><span class="challenge-card__level-badge challenge-card__level-badge--l1">1</span>' + c.levels.l1 + '</div>' +
          '<div class="challenge-card__level"><span class="challenge-card__level-badge challenge-card__level-badge--l2">2</span>' + c.levels.l2 + '</div>' +
          '<div class="challenge-card__level"><span class="challenge-card__level-badge challenge-card__level-badge--l3">3</span>' + c.levels.l3 + '</div>' +
        '</div>';
      }

      // Time/trigger meta line (only show if available)
      var metaHTML = '';
      if (c.time || c.trigger) {
        metaHTML = '<p class="challenge-card__desc">';
        if (c.time) metaHTML += '\u23F1 ' + c.time;
        if (c.time && c.trigger) metaHTML += ' \u00B7 ';
        if (c.trigger) metaHTML += c.trigger;
        metaHTML += '</p>';
      } else if (c.intensity) {
        metaHTML = '<p class="challenge-card__desc">\uD83D\uDD25 ' + c.intensity + ' Intensity</p>';
      }

      html += '<div class="challenge-card fade-in">' +
        imageHTML +
        '<div class="challenge-card__top">' +
          '<span class="challenge-card__tag ' + tagClass + '">' + cat + '</span>' +
        '</div>' +
        '<h3 class="challenge-card__name">' + c.name + '</h3>' +
        metaHTML +
        levelsHTML +
        '<div class="challenge-card__footer">' +
          '<button onclick="window.openShareModal(\'' + c.name.replace(/'/g, "\\'") + '\')" class="challenge-card__share" aria-label="Share ' + c.name + '" style="cursor:pointer;background:none;border:none;">' +
            shareIcon + ' Share' +
          '</button>' +
        '</div>' +
      '</div>';
    }

    el.innerHTML = html;

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

      if (currentFilter === "daily") filtered = SM_CHALLENGES.daily;
      else if (currentFilter === "weekly") filtered = SM_CHALLENGES.weekly;
      else if (currentFilter === "thirty") filtered = SM_CHALLENGES.thirty;
      else if (currentFilter === "ninety") filtered = SM_CHALLENGES.ninety;

      if (currentSearch) {
        var q = currentSearch.toLowerCase();
        filtered = filtered.filter(function (c) {
          return (c.name && c.name.toLowerCase().indexOf(q) >= 0) ||
                 (c.cat && c.cat.toLowerCase().indexOf(q) >= 0) ||
                 (c.focus && c.focus.toLowerCase().indexOf(q) >= 0);
        });
      }

      return filtered;
    }

    function update() {
      var filtered = getFiltered();
      renderLibraryCards("library-grid", filtered, 24);

      var countEl = document.getElementById("library-count");
      if (countEl) countEl.textContent = filtered.length + " of " + allChallenges.length + " challenges";
    }

    for (var i = 0; i < filterBtns.length; i++) {
      filterBtns[i].addEventListener("click", function () {
        currentFilter = this.getAttribute("data-challenge-filter");
        for (var j = 0; j < filterBtns.length; j++) {
          filterBtns[j].classList.remove("filter-btn--active");
        }
        this.classList.add("filter-btn--active");
        update();
      });
    }

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
