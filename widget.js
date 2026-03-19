/**
 * Sweaty Mob AI — Floating Chat Widget
 * Opens the Sweaty Mob AI assistant in a popup window.
 * 
 * Usage: <script src="widget.js" defer></script>
 */
(function() {
  'use strict';

  var CONFIG = {
    appUrl: 'https://www.perplexity.ai/computer/a/sweaty-mob-ai-94XJOG07QxmNHF5QHGthFw',
    brandRed: '#e51a1a',
    brandDark: '#0a0a0a',
    popupWidth: 420,
    popupHeight: 640
  };

  /* ─── Inject CSS ──────────────────────────────────────────── */
  var style = document.createElement('style');
  style.textContent = '\
    .sm-widget-fab {\
      position: fixed;\
      bottom: 24px;\
      right: 24px;\
      width: 60px;\
      height: 60px;\
      border-radius: 50%;\
      background: ' + CONFIG.brandRed + ';\
      border: none;\
      cursor: pointer;\
      box-shadow: 0 4px 16px rgba(229,26,26,0.35), 0 2px 6px rgba(0,0,0,0.2);\
      z-index: 999999;\
      display: flex;\
      align-items: center;\
      justify-content: center;\
      transition: transform 0.2s ease, box-shadow 0.2s ease;\
      -webkit-tap-highlight-color: transparent;\
    }\
    .sm-widget-fab:hover {\
      transform: scale(1.08);\
      box-shadow: 0 6px 24px rgba(229,26,26,0.45), 0 3px 10px rgba(0,0,0,0.25);\
    }\
    .sm-widget-fab:active {\
      transform: scale(0.96);\
    }\
    .sm-widget-fab svg {\
      width: 28px;\
      height: 28px;\
      fill: #fff;\
    }\
    .sm-widget-tooltip {\
      position: fixed;\
      bottom: 92px;\
      right: 24px;\
      background: ' + CONFIG.brandDark + ';\
      color: #fff;\
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;\
      font-size: 13px;\
      font-weight: 500;\
      padding: 8px 14px;\
      border-radius: 8px;\
      box-shadow: 0 4px 12px rgba(0,0,0,0.3);\
      z-index: 999998;\
      white-space: nowrap;\
      opacity: 0;\
      transform: translateY(8px);\
      transition: opacity 0.3s ease, transform 0.3s ease;\
      pointer-events: none;\
    }\
    .sm-widget-tooltip.sm-visible {\
      opacity: 1;\
      transform: translateY(0);\
    }\
    .sm-widget-tooltip::after {\
      content: "";\
      position: absolute;\
      bottom: -6px;\
      right: 24px;\
      width: 12px;\
      height: 12px;\
      background: ' + CONFIG.brandDark + ';\
      transform: rotate(45deg);\
    }\
    .sm-widget-pulse {\
      position: absolute;\
      top: -3px;\
      right: -3px;\
      width: 14px;\
      height: 14px;\
      background: #22c55e;\
      border-radius: 50%;\
      border: 2px solid #fff;\
    }\
    .sm-widget-pulse::after {\
      content: "";\
      position: absolute;\
      top: -2px;\
      left: -2px;\
      width: 14px;\
      height: 14px;\
      background: #22c55e;\
      border-radius: 50%;\
      animation: sm-pulse 2s infinite;\
    }\
    @keyframes sm-pulse {\
      0% { transform: scale(1); opacity: 0.7; }\
      70% { transform: scale(2.2); opacity: 0; }\
      100% { transform: scale(2.2); opacity: 0; }\
    }\
    @media (max-width: 480px) {\
      .sm-widget-fab { bottom: 16px; right: 16px; width: 54px; height: 54px; }\
      .sm-widget-fab svg { width: 24px; height: 24px; }\
      .sm-widget-tooltip { bottom: 78px; right: 16px; }\
    }\
  ';
  document.head.appendChild(style);

  /* ─── Dumbbell SVG Icon ──────────────────────────────────── */
  var dumbbellSVG = '<svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">' +
    '<path d="M6.5 2a1.5 1.5 0 0 0-1.5 1.5v2H3.5a1.5 1.5 0 0 0-1.5 1.5v10a1.5 1.5 0 0 0 1.5 1.5H5v2a1.5 1.5 0 0 0 3 0v-2h8v2a1.5 1.5 0 0 0 3 0v-2h1.5a1.5 1.5 0 0 0 1.5-1.5V7a1.5 1.5 0 0 0-1.5-1.5H19v-2a1.5 1.5 0 0 0-3 0v2H8v-2A1.5 1.5 0 0 0 6.5 2zM5 7.5h14v9H5v-9z"/>' +
    '</svg>';

  /* ─── Controller SVG Icon ────────────────────────────────── */
  var controllerSVG = '<svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">' +
    '<path d="M17.5 7h-11A6.5 6.5 0 0 0 2.625 17.75a1.5 1.5 0 0 0 2.1.4L7.5 16h9l2.775 2.15a1.5 1.5 0 0 0 2.1-.4A6.5 6.5 0 0 0 17.5 7zM9 12H7.5v1.5a.75.75 0 0 1-1.5 0V12H4.5a.75.75 0 0 1 0-1.5H6V9a.75.75 0 0 1 1.5 0v1.5H9a.75.75 0 0 1 0 1.5zm5.25 1.5a1.125 1.125 0 1 1 0-2.25 1.125 1.125 0 0 1 0 2.25zm3-2.25a1.125 1.125 0 1 1 0-2.25 1.125 1.125 0 0 1 0 2.25z"/>' +
    '</svg>';

  /* ─── Build FAB Button ───────────────────────────────────── */
  var fab = document.createElement('button');
  fab.className = 'sm-widget-fab';
  fab.setAttribute('aria-label', 'Open Sweaty Mob AI — Gaming Fitness Assistant');
  fab.setAttribute('title', 'Sweaty Mob AI');
  fab.innerHTML = controllerSVG + '<span class="sm-widget-pulse"></span>';
  document.body.appendChild(fab);

  /* ─── Tooltip ────────────────────────────────────────────── */
  var tooltip = document.createElement('div');
  tooltip.className = 'sm-widget-tooltip';
  tooltip.textContent = 'Need a gaming workout? 💪🎮';
  document.body.appendChild(tooltip);

  // Show tooltip after 2 seconds, hide after 6
  setTimeout(function() {
    tooltip.classList.add('sm-visible');
    setTimeout(function() {
      tooltip.classList.remove('sm-visible');
    }, 4000);
  }, 2000);

  /* ─── Open Popup ─────────────────────────────────────────── */
  fab.addEventListener('click', function() {
    var w = CONFIG.popupWidth;
    var h = CONFIG.popupHeight;
    var left = window.screenX + (window.outerWidth - w) / 2;
    var top = window.screenY + (window.outerHeight - h) / 2;

    window.open(
      CONFIG.appUrl,
      'SweatyMobAI',
      'width=' + w + ',height=' + h + ',left=' + left + ',top=' + top +
      ',menubar=no,toolbar=no,location=no,status=no,scrollbars=yes,resizable=yes'
    );
  });

})();
