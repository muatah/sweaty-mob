/* Sweaty Mob — Social Share Modal
   Lets users quickly share challenge results to any platform
   with #SweatyMob hashtag and challenge name pre-filled.
*/

(function () {
  "use strict";

  var currentChallengeName = "";
  var siteUrl = "https://sweatymob.org/challenges";
  var toast = null;

  function getShareText(challengeName) {
    return "I just crushed the " + challengeName + " challenge with @sweatym0b! " +
      "#SweatyMob #ExergamingFitness #GamerWorkout\n\n" +
      "Try it: " + siteUrl;
  }

  function getShortShareText(challengeName) {
    return "I just crushed the " + challengeName + " challenge with @sweatym0b! " +
      "#SweatyMob #ExergamingFitness #GamerWorkout";
  }

  /* ── Open / Close ── */
  window.openShareModal = function (challengeName) {
    currentChallengeName = challengeName || "Sweaty Mob Challenge";
    var modal = document.getElementById("share-modal");
    var nameEl = document.getElementById("share-challenge-name");
    var previewEl = document.getElementById("share-preview-text");

    if (nameEl) nameEl.textContent = currentChallengeName;
    if (previewEl) previewEl.textContent = getShareText(currentChallengeName);
    if (modal) {
      modal.classList.add("open");
      modal.setAttribute("aria-hidden", "false");
      document.body.style.overflow = "hidden";
    }
  };

  window.closeShareModal = function () {
    var modal = document.getElementById("share-modal");
    if (modal) {
      modal.classList.remove("open");
      modal.setAttribute("aria-hidden", "true");
      document.body.style.overflow = "";
    }
  };

  /* ── Platform Share Handlers ── */

  // X (Twitter) — opens compose with pre-filled text
  window.shareToX = function () {
    var text = getShortShareText(currentChallengeName);
    var url = "https://x.com/intent/post?text=" + encodeURIComponent(text) +
      "&url=" + encodeURIComponent(siteUrl);
    window.open(url, "_blank", "noopener,noreferrer,width=600,height=500");
    window.closeShareModal();
  };

  /* ── Detect mobile for deep links ── */
  function isMobile() {
    return /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
  }

  /* ── Try app deep link, fall back to web URL ── */
  function tryDeepLink(appUrl, webUrl, delay) {
    if (isMobile()) {
      var start = Date.now();
      window.location.href = appUrl;
      setTimeout(function () {
        // If we're still here after the delay, app didn't open — go to web
        if (Date.now() - start < (delay || 2500) + 500) {
          window.open(webUrl, "_blank", "noopener,noreferrer");
        }
      }, delay || 2500);
    } else {
      window.open(webUrl, "_blank", "noopener,noreferrer");
    }
  }

  // Instagram — copy caption, open story camera on mobile or IG web on desktop
  window.shareToInstagram = function () {
    var text = getShareText(currentChallengeName);
    copyToClipboard(text);
    showToast("Caption copied! Paste it into your Story \u2728");
    setTimeout(function () {
      tryDeepLink(
        "instagram://story-camera",
        "https://instagram.com/sweatym0b"
      );
      window.closeShareModal();
    }, 1400);
  };

  // Snapchat — copy caption, open Snapchat camera on mobile or Snap web on desktop
  window.shareToSnapchat = function () {
    var text = getShareText(currentChallengeName);
    copyToClipboard(text);
    showToast("Caption copied! Paste it into your Snap \u2728");
    setTimeout(function () {
      tryDeepLink(
        "snapchat://",
        "https://snapchat.com/add/sweatym0b"
      );
      window.closeShareModal();
    }, 1400);
  };

  // TikTok — copy caption, open TikTok camera on mobile or TikTok web on desktop
  window.shareToTikTok = function () {
    var text = getShareText(currentChallengeName);
    copyToClipboard(text);
    showToast("Caption copied! Paste it into your TikTok \u2728");
    setTimeout(function () {
      tryDeepLink(
        "snssdk1233://",
        "https://tiktok.com/@sweatym0b"
      );
      window.closeShareModal();
    }, 1400);
  };

  // Facebook — share dialog
  window.shareToFacebook = function () {
    var text = getShortShareText(currentChallengeName);
    var url = "https://www.facebook.com/sharer/sharer.php?u=" + encodeURIComponent(siteUrl) +
      "&quote=" + encodeURIComponent(text);
    window.open(url, "_blank", "noopener,noreferrer,width=600,height=500");
    window.closeShareModal();
  };

  // Threads — opens Threads web compose
  window.shareToThreads = function () {
    var text = getShareText(currentChallengeName);
    var url = "https://www.threads.net/intent/post?text=" + encodeURIComponent(text);
    window.open(url, "_blank", "noopener,noreferrer,width=600,height=600");
    window.closeShareModal();
  };

  // Copy to clipboard
  window.copyShareText = function () {
    var text = getShareText(currentChallengeName);
    copyToClipboard(text);
    showToast("Copied to clipboard!");
    setTimeout(function () {
      window.closeShareModal();
    }, 1500);
  };

  /* ── Utilities ── */
  function copyToClipboard(text) {
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(text);
    } else {
      // Fallback for older browsers
      var ta = document.createElement("textarea");
      ta.value = text;
      ta.style.position = "fixed";
      ta.style.left = "-9999px";
      document.body.appendChild(ta);
      ta.select();
      try { document.execCommand("copy"); } catch (e) { /* noop */ }
      document.body.removeChild(ta);
    }
  }

  function showToast(message) {
    if (!toast) {
      toast = document.createElement("div");
      toast.className = "share-toast";
      document.body.appendChild(toast);
    }
    toast.textContent = message;
    toast.classList.add("visible");
    setTimeout(function () {
      toast.classList.remove("visible");
    }, 2500);
  }

  /* ── Close on Escape ── */
  document.addEventListener("keydown", function (e) {
    if (e.key === "Escape") {
      window.closeShareModal();
    }
  });
})();
