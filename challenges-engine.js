/* global SM_CHALLENGES */
/* Sweaty Mob — Challenge Rotation Engine v2.1
   Deterministic date-based rotation so every visitor sees the same challenges on the same day.
   Daily = rotates every day
   Weekly = rotates every Monday
   30-Day = rotates on the 1st of each month
   90-Day = rotates quarterly (Jan 1, Apr 1, Jul 1, Oct 1)

   v2.1: Hover/click bullet-point previews on all active challenge cards
*/

(function () {
  "use strict";

  /* ── helpers ── */
  var MS_PER_DAY = 86400000;
  var EPOCH = new Date(2025, 0, 1);

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

  /* ── sanitize for inline HTML ── */
  function esc(str) {
    if (!str) return "";
    return str.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&#039;");
  }

  /* ── levels rendering helper ── */
  function renderLevelsHTML(levels) {
    if (!levels) return "";
    var html = '<div class="challenge-levels">';
    html += '<div class="challenge-levels__row challenge-levels__row--l1">';
    html += '<span class="challenge-levels__badge challenge-levels__badge--l1">1</span>';
    html += '<span class="challenge-levels__text">' + esc(levels.l1) + '</span>';
    html += '</div>';
    html += '<div class="challenge-levels__row challenge-levels__row--l2">';
    html += '<span class="challenge-levels__badge challenge-levels__badge--l2">2</span>';
    html += '<span class="challenge-levels__text">' + esc(levels.l2) + '</span>';
    html += '</div>';
    html += '<div class="challenge-levels__row challenge-levels__row--l3">';
    html += '<span class="challenge-levels__badge challenge-levels__badge--l3">3</span>';
    html += '<span class="challenge-levels__text">' + esc(levels.l3) + '</span>';
    html += '</div>';
    html += '</div>';
    return html;
  }

  /* ── breakdown rendering (daily or weekly plan) ── */
  function renderBreakdownHTML(items, label) {
    if (!items || items.length === 0) return "";
    var html = '<div class="challenge-breakdown">';
    html += '<p class="challenge-breakdown__label">' + esc(label) + '</p>';
    html += '<ol class="challenge-breakdown__list">';
    for (var i = 0; i < items.length; i++) {
      html += '<li class="challenge-breakdown__item">' + esc(items[i]) + '</li>';
    }
    html += '</ol>';
    html += '</div>';
    return html;
  }

  /* ── tracking + social rendering ── */
  function renderTrackingSocial(tracking, social) {
    var html = '';
    if (tracking) {
      html += '<div class="challenge-tracking">';
      html += '<div class="challenge-tracking__icon"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg></div>';
      html += '<div class="challenge-tracking__text"><strong>How to Track:</strong> ' + esc(tracking) + '</div>';
      html += '</div>';
    }
    if (social) {
      html += '<div class="challenge-social">';
      html += '<div class="challenge-social__icon"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M4 12v8a2 2 0 002 2h12a2 2 0 002-2v-8"/><polyline points="16,6 12,2 8,6"/><line x1="12" y1="2" x2="12" y2="15"/></svg></div>';
      html += '<div class="challenge-social__text">' + esc(social) + '</div>';
      html += '</div>';
    }
    return html;
  }

  /* ── unique ID generator ── */
  var _uid = 0;
  function uid() {
    _uid++;
    return "cd-" + _uid;
  }

  /* ── alternative exercises by category / muscle group ── */
  var ALTERNATIVES = {
    "Pushups": "Swap in wall push-ups, knee push-ups, or pike presses",
    "Squats": "Try chair squats, sumo squats, or wall sits instead",
    "Lunges": "Sub in reverse lunges, side lunges, or step-backs",
    "Planks": "Swap for dead bugs, bird-dogs, or hollow holds",
    "Burpees": "Scale down with squat thrusts or sprawls",
    "Jumping Jacks": "Step-jacks or seal jacks hit the same cardio goal",
    "Jump Rope": "High knees or fast feet give the same cardio burn",
    "Stretching": "Yoga flow or foam rolling targets the same flexibility",
    "Flexibility": "Try dynamic stretches or mobility drills for similar results",
    "Core": "Bicycle crunches, leg raises, or mountain climbers work too",
    "Balance": "Single-leg stands or heel-to-toe walks build the same stability",
    "Wall Sit": "Chair pose or static lunges load the same muscles",
    "Calf Raises": "Step-ups or toe walks target the same group",
    "Strength": "Bodyweight circuits or resistance band moves hit the same goal",
    "Steps": "Marching in place or pacing during load screens counts too",
    "Walking": "Treadmill walking or pacing indoors works just as well",
    "Running": "Brisk walking, stair climbing, or jogging in place as swaps",
    "Cardio": "Dancing, shadow boxing, or high knees for the same effect",
    "Mindfulness": "Swap in deep breathing, journaling, or a body scan",
    "Nutrition": "Focus on hydration or meal timing for the same health boost",
    "Community": "Rally your squad in a group chat or co-op session instead",
    "Gaming Movement": "Any standing or pacing gameplay hits the same active-gaming goal"
  };

  /* ── build 4 bullet points from challenge data ── */
  /* Order: 1) Overview  2) Exercise breakdown  3) Alternatives  4) Social tracking */
  function buildBullets(challenge) {
    var bullets = [];
    var cat = challenge.cat || "";
    var name = challenge.name || "Challenge";

    // ── Bullet 1: Overview ──
    if (challenge.overview) {
      var first = challenge.overview.split(/\.\s/)[0];
      if (first && first.length < challenge.overview.length) first += ".";
      if (first.length > 90) first = first.substring(0, 87) + "...";
      bullets.push(first || challenge.overview);
    } else if (challenge.focus) {
      bullets.push(challenge.focus);
    } else {
      var clean = name.replace(/^(90|60|30)\s*Day\s*/i, "").replace(/^Sweaty Mob:?\s*/i, "");
      bullets.push(clean + " — no equipment, just you");
    }

    // ── Bullet 2: Easy exercise breakdown ──
    if (challenge.levels && challenge.levels.l1) {
      var l1 = challenge.levels.l1;
      if (l1.length > 80) l1 = l1.substring(0, 77) + "...";
      bullets.push("Start easy: " + l1);
    } else if (challenge.daily && challenge.daily.length > 0) {
      var d1 = challenge.daily[0].replace(/^Day\s*1:?\s*/i, "");
      if (d1.length > 80) d1 = d1.substring(0, 77) + "...";
      bullets.push("Day 1: " + d1);
    } else if (challenge.weekly && challenge.weekly.length > 0) {
      var w1 = challenge.weekly[0].split(":")[1] || challenge.weekly[0];
      w1 = w1.trim();
      if (w1.length > 80) w1 = w1.substring(0, 77) + "...";
      bullets.push("Week 1: " + w1);
    } else {
      bullets.push("Progressive phases that scale to your fitness level");
    }

    // ── Bullet 3: Alternatives to hit the same goal ──
    if (cat && ALTERNATIVES[cat]) {
      bullets.push(ALTERNATIVES[cat]);
    } else {
      // Fallback: infer from name keywords
      var lname = name.toLowerCase();
      var matched = false;
      var altKeys = Object.keys(ALTERNATIVES);
      for (var a = 0; a < altKeys.length; a++) {
        if (lname.indexOf(altKeys[a].toLowerCase()) !== -1) {
          bullets.push(ALTERNATIVES[altKeys[a]]);
          matched = true;
          break;
        }
      }
      if (!matched) {
        bullets.push("Mix in any bodyweight move that targets the same goal");
      }
    }

    // ── Bullet 4: Track on social with @sweatym0b ──
    bullets.push("Track it: post your check-in and tag @sweatym0b");

    return bullets;
  }

  /* ── render active challenge (hero-style for the featured slots) ── */
  function renderActiveChallenge(containerId, challenge, periodLabel, periodValue, typeLabel) {
    var el = document.getElementById(containerId);
    if (!el || !challenge) return;

    var name = challenge.name || "Challenge";
    var cat = challenge.cat || challenge.focus || "";
    var trigger = challenge.trigger || "";
    var time = challenge.time || "";
    var levels = challenge.levels || null;
    var image = challenge.image || "";
    var overview = challenge.overview || "";
    var daily = challenge.daily || null;
    var weekly = challenge.weekly || null;
    var tracking = challenge.tracking || "";
    var social = challenge.social || "";

    var detailId = uid();
    var hasDetails = !!(overview || daily || weekly || tracking || social);

    // Build bullet points for hover/click preview
    var bullets = buildBullets(challenge);
    var bulletsHTML = '';
    if (bullets.length > 0) {
      bulletsHTML = '<ul class="active-challenge__bullets">';
      for (var b = 0; b < bullets.length; b++) {
        bulletsHTML += '<li class="active-challenge__bullet">' + esc(bullets[b]) + '</li>';
      }
      bulletsHTML += '</ul>';
    }

    var html = '<div class="active-challenge fade-in" tabindex="0">' +
      '<div class="active-challenge__header">' +
        '<span class="active-challenge__badge">' + esc(typeLabel) + '</span>' +
      '</div>' +
      (image ? '<div class="active-challenge__image-wrap"><img src="' + esc(image) + '" alt="' + esc(cat) + ' exercise" class="active-challenge__image" loading="lazy"></div>' : '') +
      '<h3 class="active-challenge__name">' + esc(name) + '</h3>' +
      '<p class="active-challenge__period">' + esc(periodLabel) + ': ' + esc(periodValue) + '</p>';

    html += '<div class="active-challenge__meta">' +
        (cat ? '<span class="active-challenge__tag">' + esc(cat) + '</span>' : '') +
        (trigger ? '<span class="active-challenge__tag">' + esc(trigger) + '</span>' : '') +
        (time ? '<span class="active-challenge__tag">\u23F1 ' + esc(time) + '</span>' : '') +
        (challenge.intensity ? '<span class="active-challenge__tag active-challenge__tag--intensity">' + esc(challenge.intensity) + '</span>' : '') +
      '</div>';

    // Bullet preview (visible on hover / click)
    html += bulletsHTML;

    html += renderLevelsHTML(levels);

    // Expandable detail section for weekly/monthly
    if (hasDetails && (daily || weekly)) {
      html += '<div class="challenge-detail-toggle">' +
        '<button class="challenge-detail-btn" aria-expanded="false" aria-controls="' + detailId + '" onclick="this.setAttribute(\'aria-expanded\', this.getAttribute(\'aria-expanded\')===\'true\'?\'false\':\'true\'); document.getElementById(\'' + detailId + '\').classList.toggle(\'is-open\');">' +
          '<span class="challenge-detail-btn__text">View Full Plan</span>' +
          '<svg class="challenge-detail-btn__icon" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="6 9 12 15 18 9"/></svg>' +
        '</button>' +
      '</div>';
      html += '<div class="challenge-detail-panel" id="' + detailId + '">';
      if (daily) {
        html += renderBreakdownHTML(daily, "Your 7-Day Plan");
      }
      if (weekly) {
        html += renderBreakdownHTML(weekly, "Your 4-Week Plan");
      }
      html += renderTrackingSocial(tracking, social);
      html += '</div>';
    }

    html += '<div class="active-challenge__cta">' +
        '<button onclick="window.openShareModal(\'' + name.replace(/'/g, "\\'") + '\')" class="btn btn--primary" style="cursor:pointer;">I Crushed It \uD83D\uDCAA</button>' +
        '<p class="active-challenge__share">Screenshot your sweat and tag <strong>@sweatym0b</strong></p>' +
      '</div>' +
    '</div>';

    el.innerHTML = html;

    // Mobile tap-to-expand bullet previews
    var card = el.querySelector(".active-challenge");
    if (card) {
      card.addEventListener("click", function (e) {
        // Don't toggle if clicking a button or link
        if (e.target.closest("button") || e.target.closest("a")) return;
        this.classList.toggle("is-expanded");
      });
    }
  }

  /* ── intensity badge class ── */
  function intensityClass(intensity) {
    if (!intensity) return "";
    var lower = intensity.toLowerCase();
    if (lower === "low") return "challenge-card__intensity--low";
    if (lower === "medium") return "challenge-card__intensity--med";
    if (lower === "high") return "challenge-card__intensity--high";
    return "";
  }

  /* ── render library cards ── */
  function renderLibraryCards(containerId, challenges, limit) {
    var el = document.getElementById(containerId);
    if (!el || !challenges) return;

    var count = Math.min(limit || 12, challenges.length);
    var startIdx = daysSinceEpoch();
    var html = '';
    var shareIcon = '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M4 12v8a2 2 0 002 2h12a2 2 0 002-2v-8"/><polyline points="16,6 12,2 8,6"/><line x1="12" y1="2" x2="12" y2="15"/></svg>';
    var chevronIcon = '<svg class="challenge-detail-btn__icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="6 9 12 15 18 9"/></svg>';

    for (var i = 0; i < count; i++) {
      var c = challenges[(startIdx + i) % challenges.length];
      var cat = c.cat || c.focus || "Challenge";
      var tagClass = "challenge-card__tag--default";

      var catLower = cat.toLowerCase();
      if (catLower.indexOf("squat") >= 0 || catLower.indexOf("lunge") >= 0 || catLower.indexOf("push") >= 0 || catLower.indexOf("strength") >= 0)
        tagClass = "challenge-card__tag--burner";
      else if (catLower.indexOf("walk") >= 0 || catLower.indexOf("stretch") >= 0 || catLower.indexOf("yoga") >= 0 || catLower.indexOf("balance") >= 0 || catLower.indexOf("flex") >= 0)
        tagClass = "challenge-card__tag--quickie";
      else if (catLower.indexOf("hiit") >= 0 || catLower.indexOf("full") >= 0 || catLower.indexOf("burpee") >= 0 || catLower.indexOf("run") >= 0 || catLower.indexOf("cardio") >= 0)
        tagClass = "challenge-card__tag--boss";
      else if (catLower.indexOf("team") >= 0 || catLower.indexOf("community") >= 0 || catLower.indexOf("group") >= 0 || catLower.indexOf("general") >= 0 || catLower.indexOf("step") >= 0)
        tagClass = "challenge-card__tag--mob";
      else if (catLower.indexOf("nutrition") >= 0 || catLower.indexOf("mindful") >= 0 || catLower.indexOf("gaming") >= 0)
        tagClass = "challenge-card__tag--special";

      // Image thumbnail for daily challenges
      var imageHTML = '';
      if (c.image) {
        imageHTML = '<div class="challenge-card__image-wrap"><img src="' + c.image + '" alt="' + esc(cat) + '" class="challenge-card__image" loading="lazy"></div>';
      }

      // Levels for all challenges
      var levelsHTML = '';
      if (c.levels) {
        levelsHTML = '<div class="challenge-card__levels">' +
          '<div class="challenge-card__level"><span class="challenge-card__level-badge challenge-card__level-badge--l1">1</span>' + esc(c.levels.l1) + '</div>' +
          '<div class="challenge-card__level"><span class="challenge-card__level-badge challenge-card__level-badge--l2">2</span>' + esc(c.levels.l2) + '</div>' +
          '<div class="challenge-card__level"><span class="challenge-card__level-badge challenge-card__level-badge--l3">3</span>' + esc(c.levels.l3) + '</div>' +
        '</div>';
      }

      // Time/trigger meta line
      var metaHTML = '';
      if (c.time || c.trigger) {
        metaHTML = '<p class="challenge-card__desc">';
        if (c.time) metaHTML += '\u23F1 ' + esc(c.time);
        if (c.time && c.trigger) metaHTML += ' \u00B7 ';
        if (c.trigger) metaHTML += esc(c.trigger);
        metaHTML += '</p>';
      } else if (c.intensity) {
        metaHTML = '<p class="challenge-card__desc"><span class="challenge-card__intensity ' + intensityClass(c.intensity) + '">' + esc(c.intensity) + '</span> Intensity</p>';
      }

      // Overview for weekly/monthly
      var overviewHTML = '';
      if (c.overview) {
        overviewHTML = '<p class="challenge-card__overview">' + esc(c.overview) + '</p>';
      }

      // Expandable detail for weekly/monthly
      var detailHTML = '';
      var hasDetail = !!(c.daily || c.weekly || c.tracking || c.social);
      var cardDetailId = uid();

      if (hasDetail) {
        detailHTML = '<div class="challenge-card__detail-toggle">' +
          '<button class="challenge-card__detail-btn" aria-expanded="false" aria-controls="' + cardDetailId + '" onclick="this.setAttribute(\'aria-expanded\', this.getAttribute(\'aria-expanded\')===\'true\'?\'false\':\'true\'); document.getElementById(\'' + cardDetailId + '\').classList.toggle(\'is-open\'); event.stopPropagation();">' +
            '<span>Full Plan</span>' + chevronIcon +
          '</button>' +
        '</div>' +
        '<div class="challenge-card__detail-panel" id="' + cardDetailId + '">';
        if (c.daily) {
          detailHTML += renderBreakdownHTML(c.daily, c.weekly ? "Weekly Plan" : "7-Day Plan");
        }
        if (c.weekly) {
          detailHTML += renderBreakdownHTML(c.weekly, "4-Week Plan");
        }
        detailHTML += renderTrackingSocial(c.tracking, c.social);
        detailHTML += '</div>';
      }

      html += '<div class="challenge-card fade-in' + (hasDetail ? ' challenge-card--has-detail' : '') + '">' +
        imageHTML +
        '<div class="challenge-card__top">' +
          '<span class="challenge-card__tag ' + tagClass + '">' + esc(cat) + '</span>' +
        '</div>' +
        '<h3 class="challenge-card__name">' + esc(c.name) + '</h3>' +
        metaHTML +
        overviewHTML +
        levelsHTML +
        detailHTML +
        '<div class="challenge-card__footer">' +
          '<button onclick="window.openShareModal(\'' + c.name.replace(/'/g, "\\'") + '\')" class="challenge-card__share" aria-label="Share ' + esc(c.name) + '" style="cursor:pointer;background:none;border:none;">' +
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
                 (c.focus && c.focus.toLowerCase().indexOf(q) >= 0) ||
                 (c.overview && c.overview.toLowerCase().indexOf(q) >= 0);
        });
      }

      return filtered;
    }

    function update() {
      var filtered = getFiltered();
      renderLibraryCards("library-grid", filtered, filtered.length <= 50 ? filtered.length : 24);

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
