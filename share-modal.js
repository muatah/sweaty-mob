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

  // Instagram — can't pre-fill, so copy text + open IG
  window.shareToInstagram = function () {
    var text = getShareText(currentChallengeName);
    copyToClipboard(text);
    showToast("Caption copied! Opening Instagram...");
    setTimeout(function () {
      window.open("https://instagram.com/sweatym0b", "_blank", "noopener,noreferrer");
      window.closeShareModal();
    }, 1200);
  };

  // TikTok — same approach as Instagram
  window.shareToTikTok = function () {
    var text = getShareText(currentChallengeName);
    copyToClipboard(text);
    showToast("Caption copied! Opening TikTok...");
    setTimeout(function () {
      window.open("https://tiktok.com/@sweatym0b", "_blank", "noopener,noreferrer");
      window.closeShareModal();
    }, 1200);
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
