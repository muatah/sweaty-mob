/**
 * Sweaty Mob AI — Floating Chat Widget
 * Drop this script into any page to add a gaming-fitness AI assistant.
 * 
 * Usage: <script src="widget.js" defer></script>
 */
(function() {
  'use strict';

  var CONFIG = {
    apiUrl: 'https://sweaty-mob-ai.mgibsonhunter.workers.dev', // Will be replaced with actual Cloudflare Worker URL after deployment
    sessionId: 'smw_' + Math.random().toString(36).substring(2, 9),
    widgetTitle: 'Sweaty Mob AI',
    widgetSubtitle: 'Gaming Fitness Assistant',
    placeholder: 'Ask about gaming workouts...',
    brandRed: '#e51a1a',
    brandDark: '#0a0a0a',
    brandDarkAlt: '#141414',
    quickPrompts: [
      { label: '⚡ Loading screen workout', prompt: 'Give me a quick 60-second workout I can do during a loading screen. I\'m a beginner with no equipment.' },
      { label: '🏋️ Beginner fitness plan', prompt: 'Create a beginner-friendly gaming fitness plan I can start today with no equipment.' },
      { label: '🤲 Wrist health routine', prompt: 'My wrists hurt after long gaming sessions. Give me a complete wrist health routine.' }
    ]
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
      z-index: 9999;\
      display: flex;\
      align-items: center;\
      justify-content: center;\
      box-shadow: 0 4px 20px rgba(229,26,26,0.4), 0 2px 8px rgba(0,0,0,0.3);\
      transition: transform 0.2s ease, box-shadow 0.2s ease;\
      animation: sm-widget-entrance 0.4s ease-out;\
      padding: 0;\
      outline: none;\
    }\
    .sm-widget-fab:hover {\
      transform: scale(1.1);\
      box-shadow: 0 6px 28px rgba(229,26,26,0.5), 0 4px 12px rgba(0,0,0,0.4);\
    }\
    .sm-widget-fab:active { transform: scale(0.95); }\
    .sm-widget-fab.sm-widget-hidden { display: none; }\
    .sm-widget-fab svg { width: 28px; height: 28px; color: #fff; fill: none; stroke: currentColor; stroke-width: 2; }\
    \
    @keyframes sm-widget-entrance {\
      from { opacity: 0; transform: scale(0.5) translateY(20px); }\
      to { opacity: 1; transform: scale(1) translateY(0); }\
    }\
    @keyframes sm-widget-pulse {\
      0%, 100% { box-shadow: 0 4px 20px rgba(229,26,26,0.4), 0 2px 8px rgba(0,0,0,0.3); }\
      50% { box-shadow: 0 4px 30px rgba(229,26,26,0.6), 0 2px 12px rgba(0,0,0,0.4); }\
    }\
    .sm-widget-fab.sm-widget-pulse { animation: sm-widget-pulse 2s ease-in-out 3; }\
    \
    .sm-widget-panel {\
      position: fixed;\
      bottom: 24px;\
      right: 24px;\
      width: 380px;\
      height: 520px;\
      border-radius: 16px;\
      background: ' + CONFIG.brandDark + ';\
      z-index: 10000;\
      display: flex;\
      flex-direction: column;\
      overflow: hidden;\
      box-shadow: 0 8px 40px rgba(0,0,0,0.5), 0 0 0 1px rgba(255,255,255,0.08);\
      opacity: 0;\
      transform: translateY(20px) scale(0.95);\
      pointer-events: none;\
      transition: opacity 0.25s ease, transform 0.25s ease;\
    }\
    .sm-widget-panel.sm-widget-open {\
      opacity: 1;\
      transform: translateY(0) scale(1);\
      pointer-events: all;\
    }\
    \
    @media (min-width: 481px) {\
      .sm-widget-panel {\
        width: 460px;\
        height: 630px;\
      }\
      .sm-widget-header-title { font-size: 16px; }\
      .sm-widget-header-subtitle { font-size: 12px; }\
      .sm-widget-msg { font-size: 14px; }\
      .sm-widget-msg-ai h1 { font-size: 16px; }\
      .sm-widget-msg-ai h2 { font-size: 15px; }\
      .sm-widget-msg-ai h3 { font-size: 14px; }\
      .sm-widget-msg-ai code { font-size: 13px; }\
      .sm-widget-prompts-title { font-size: 12px; }\
      .sm-widget-prompt-btn { font-size: 14px; }\
      .sm-widget-welcome h3 { font-size: 19px; }\
      .sm-widget-welcome p { font-size: 13px; }\
      .sm-widget-input textarea { font-size: 14px; }\
      .sm-widget-typing-text { font-size: 12px; }\
    }\
    @media (max-width: 480px) {\
      .sm-widget-panel {\
        width: calc(100vw - 16px);\
        height: calc(100vh - 100px);\
        bottom: 8px;\
        right: 8px;\
        border-radius: 12px;\
      }\
    }\
    \
    .sm-widget-header {\
      background: ' + CONFIG.brandRed + ';\
      padding: 14px 16px;\
      display: flex;\
      align-items: center;\
      justify-content: space-between;\
      flex-shrink: 0;\
    }\
    .sm-widget-header-left {\
      display: flex;\
      align-items: center;\
      gap: 10px;\
    }\
    .sm-widget-header-icon {\
      width: 32px;\
      height: 32px;\
      background: rgba(255,255,255,0.2);\
      border-radius: 8px;\
      display: flex;\
      align-items: center;\
      justify-content: center;\
    }\
    .sm-widget-header-icon svg { width: 20px; height: 20px; color: #fff; fill: none; stroke: currentColor; stroke-width: 2; }\
    .sm-widget-header-title {\
      font-family: "Clash Display", "Satoshi", system-ui, -apple-system, sans-serif;\
      font-size: 15px;\
      font-weight: 700;\
      color: #fff;\
      line-height: 1.2;\
    }\
    .sm-widget-header-subtitle {\
      font-family: "Satoshi", system-ui, -apple-system, sans-serif;\
      font-size: 11px;\
      color: rgba(255,255,255,0.8);\
      line-height: 1.2;\
    }\
    .sm-widget-close {\
      background: rgba(255,255,255,0.15);\
      border: none;\
      border-radius: 8px;\
      width: 32px;\
      height: 32px;\
      display: flex;\
      align-items: center;\
      justify-content: center;\
      cursor: pointer;\
      color: #fff;\
      font-size: 18px;\
      transition: background 0.15s;\
      padding: 0;\
      outline: none;\
    }\
    .sm-widget-close:hover { background: rgba(255,255,255,0.25); }\
    \
    .sm-widget-messages {\
      flex: 1;\
      overflow-y: auto;\
      padding: 16px;\
      display: flex;\
      flex-direction: column;\
      gap: 12px;\
      scroll-behavior: smooth;\
    }\
    .sm-widget-messages::-webkit-scrollbar { width: 4px; }\
    .sm-widget-messages::-webkit-scrollbar-track { background: transparent; }\
    .sm-widget-messages::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.15); border-radius: 2px; }\
    \
    .sm-widget-msg {\
      max-width: 85%;\
      padding: 10px 14px;\
      border-radius: 14px;\
      font-family: "Satoshi", system-ui, -apple-system, sans-serif;\
      font-size: 13px;\
      line-height: 1.5;\
      animation: sm-widget-msgIn 0.2s ease-out;\
      word-wrap: break-word;\
    }\
    @keyframes sm-widget-msgIn {\
      from { opacity: 0; transform: translateY(6px); }\
      to { opacity: 1; transform: translateY(0); }\
    }\
    .sm-widget-msg-user {\
      align-self: flex-end;\
      background: ' + CONFIG.brandRed + ';\
      color: #fff;\
    }\
    .sm-widget-msg-ai {\
      align-self: flex-start;\
      background: ' + CONFIG.brandDarkAlt + ';\
      color: rgba(255,255,255,0.9);\
      border: 1px solid rgba(255,255,255,0.08);\
    }\
    .sm-widget-msg-ai strong { color: #fff; font-weight: 600; }\
    .sm-widget-msg-ai h1, .sm-widget-msg-ai h2, .sm-widget-msg-ai h3 {\
      color: #f87171;\
      font-weight: 700;\
      margin: 8px 0 4px;\
    }\
    .sm-widget-msg-ai h1 { font-size: 15px; }\
    .sm-widget-msg-ai h2 { font-size: 14px; }\
    .sm-widget-msg-ai h3 { font-size: 13px; }\
    .sm-widget-msg-ai ul, .sm-widget-msg-ai ol { padding-left: 18px; margin: 4px 0; }\
    .sm-widget-msg-ai li { margin-bottom: 2px; }\
    .sm-widget-msg-ai p { margin: 4px 0; }\
    .sm-widget-msg-ai code {\
      background: rgba(255,255,255,0.1);\
      padding: 1px 4px;\
      border-radius: 3px;\
      font-size: 12px;\
      font-family: monospace;\
    }\
    \
    .sm-widget-typing {\
      align-self: flex-start;\
      display: flex;\
      align-items: center;\
      gap: 8px;\
      padding: 10px 14px;\
      background: ' + CONFIG.brandDarkAlt + ';\
      border: 1px solid rgba(255,255,255,0.08);\
      border-radius: 14px;\
      animation: sm-widget-msgIn 0.2s ease-out;\
    }\
    .sm-widget-typing-dots {\
      display: flex;\
      gap: 4px;\
    }\
    .sm-widget-typing-dot {\
      width: 6px;\
      height: 6px;\
      border-radius: 50%;\
      background: ' + CONFIG.brandRed + ';\
      animation: sm-widget-bounce 1.2s infinite;\
    }\
    .sm-widget-typing-dot:nth-child(2) { animation-delay: 0.15s; }\
    .sm-widget-typing-dot:nth-child(3) { animation-delay: 0.3s; }\
    @keyframes sm-widget-bounce {\
      0%, 80%, 100% { transform: translateY(0); }\
      40% { transform: translateY(-6px); }\
    }\
    .sm-widget-typing-text {\
      font-family: "Satoshi", system-ui, sans-serif;\
      font-size: 11px;\
      color: rgba(255,255,255,0.5);\
    }\
    \
    .sm-widget-prompts {\
      display: flex;\
      flex-direction: column;\
      gap: 8px;\
      padding: 16px;\
    }\
    .sm-widget-prompts-title {\
      font-family: "Satoshi", system-ui, sans-serif;\
      font-size: 11px;\
      color: rgba(255,255,255,0.4);\
      text-transform: uppercase;\
      letter-spacing: 0.05em;\
      font-weight: 600;\
    }\
    .sm-widget-prompt-btn {\
      background: rgba(255,255,255,0.05);\
      border: 1px solid rgba(255,255,255,0.1);\
      border-radius: 10px;\
      padding: 10px 12px;\
      color: rgba(255,255,255,0.7);\
      font-family: "Satoshi", system-ui, sans-serif;\
      font-size: 13px;\
      cursor: pointer;\
      text-align: left;\
      transition: all 0.15s;\
      outline: none;\
    }\
    .sm-widget-prompt-btn:hover {\
      background: rgba(255,255,255,0.1);\
      border-color: rgba(229,26,26,0.3);\
      color: rgba(255,255,255,0.9);\
    }\
    \
    .sm-widget-welcome {\
      flex: 1;\
      display: flex;\
      flex-direction: column;\
      align-items: center;\
      justify-content: center;\
      padding: 24px;\
      text-align: center;\
    }\
    .sm-widget-welcome-icon {\
      width: 56px;\
      height: 56px;\
      background: linear-gradient(135deg, ' + CONFIG.brandRed + ', #b91c1c);\
      border-radius: 14px;\
      display: flex;\
      align-items: center;\
      justify-content: center;\
      margin-bottom: 16px;\
      box-shadow: 0 4px 16px rgba(229,26,26,0.3);\
    }\
    .sm-widget-welcome-icon svg { width: 32px; height: 32px; color: #fff; fill: none; stroke: currentColor; stroke-width: 1.5; }\
    .sm-widget-welcome h3 {\
      font-family: "Clash Display", "Satoshi", system-ui, sans-serif;\
      font-size: 18px;\
      font-weight: 700;\
      color: #fff;\
      margin: 0 0 6px;\
    }\
    .sm-widget-welcome h3 span { color: ' + CONFIG.brandRed + '; }\
    .sm-widget-welcome p {\
      font-family: "Satoshi", system-ui, sans-serif;\
      font-size: 12px;\
      color: rgba(255,255,255,0.5);\
      line-height: 1.5;\
      margin: 0 0 20px;\
    }\
    \
    .sm-widget-input-area {\
      padding: 12px 16px;\
      border-top: 1px solid rgba(255,255,255,0.08);\
      display: flex;\
      gap: 8px;\
      align-items: flex-end;\
      flex-shrink: 0;\
      background: ' + CONFIG.brandDark + ';\
    }\
    .sm-widget-input {\
      flex: 1;\
      background: rgba(255,255,255,0.05);\
      border: 1px solid rgba(255,255,255,0.1);\
      border-radius: 10px;\
      padding: 10px 12px;\
      color: #fff;\
      font-family: "Satoshi", system-ui, sans-serif;\
      font-size: 13px;\
      resize: none;\
      outline: none;\
      min-height: 40px;\
      max-height: 80px;\
      line-height: 1.4;\
    }\
    .sm-widget-input::placeholder { color: rgba(255,255,255,0.4); }\
    .sm-widget-input:focus { border-color: rgba(229,26,26,0.5); }\
    .sm-widget-send {\
      background: ' + CONFIG.brandRed + ';\
      border: none;\
      border-radius: 10px;\
      width: 40px;\
      height: 40px;\
      display: flex;\
      align-items: center;\
      justify-content: center;\
      cursor: pointer;\
      transition: background 0.15s, opacity 0.15s;\
      flex-shrink: 0;\
      padding: 0;\
      outline: none;\
    }\
    .sm-widget-send:hover { background: #cc1717; }\
    .sm-widget-send:disabled { opacity: 0.3; cursor: not-allowed; }\
    .sm-widget-send svg { width: 18px; height: 18px; color: #fff; fill: none; stroke: currentColor; stroke-width: 2; }\
    \
    .sm-widget-footer {\
      padding: 6px 16px 10px;\
      text-align: center;\
      flex-shrink: 0;\
    }\
    .sm-widget-footer a {\
      font-family: "Satoshi", system-ui, sans-serif;\
      font-size: 10px;\
      color: rgba(255,255,255,0.25);\
      text-decoration: none;\
      transition: color 0.15s;\
    }\
    .sm-widget-footer a:hover { color: rgba(255,255,255,0.5); }\
  ';
  document.head.appendChild(style);

  /* ─── SVG icons ───────────────────────────────────────────── */
  var controllerSVG = '<svg viewBox="0 0 32 32"><rect x="6" y="10" width="20" height="12" rx="6"/><circle cx="12" cy="16" r="2" fill="currentColor"/><circle cx="20" cy="16" r="2" fill="currentColor"/><path d="M6 14L3 11" stroke-linecap="round"/><path d="M6 18L3 21" stroke-linecap="round"/><path d="M26 14L29 11" stroke-linecap="round"/><path d="M26 18L29 21" stroke-linecap="round"/></svg>';

  var sendSVG = '<svg viewBox="0 0 24 24"><path d="M22 2L11 13" stroke-linecap="round" stroke-linejoin="round"/><path d="M22 2L15 22L11 13L2 9L22 2Z" stroke-linecap="round" stroke-linejoin="round"/></svg>';

  var closeSVG = '<svg viewBox="0 0 24 24" width="16" height="16" stroke="currentColor" fill="none" stroke-width="2"><path d="M18 6L6 18M6 6l12 12" stroke-linecap="round"/></svg>';

  /* ─── State ───────────────────────────────────────────────── */
  var messages = [];
  var isOpen = false;
  var isLoading = false;

  /* ─── DOM Elements ────────────────────────────────────────── */
  var fab, panel, messagesContainer, inputEl, sendBtn, typingEl;

  /* ─── Simple Markdown → HTML ──────────────────────────────── */
  function renderMarkdown(text) {
    var lines = text.split('\n');
    var html = '';
    var inList = false;
    var listType = '';

    function closeList() {
      if (inList) {
        html += '</' + listType + '>';
        inList = false;
        listType = '';
      }
    }

    function inlineFormat(t) {
      return t
        .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
        .replace(/\*(.+?)\*/g, '<em>$1</em>')
        .replace(/`(.+?)`/g, '<code>$1</code>');
    }

    for (var i = 0; i < lines.length; i++) {
      var line = lines[i].trim();

      if (line.match(/^### /)) {
        closeList();
        html += '<h3>' + inlineFormat(line.slice(4)) + '</h3>';
      } else if (line.match(/^## /)) {
        closeList();
        html += '<h2>' + inlineFormat(line.slice(3)) + '</h2>';
      } else if (line.match(/^# /)) {
        closeList();
        html += '<h1>' + inlineFormat(line.slice(2)) + '</h1>';
      } else if (line.match(/^[-*] /)) {
        if (!inList || listType !== 'ul') {
          closeList();
          html += '<ul>';
          inList = true;
          listType = 'ul';
        }
        html += '<li>' + inlineFormat(line.slice(2)) + '</li>';
      } else if (line.match(/^\d+\.\s/)) {
        if (!inList || listType !== 'ol') {
          closeList();
          html += '<ol>';
          inList = true;
          listType = 'ol';
        }
        html += '<li>' + inlineFormat(line.replace(/^\d+\.\s*/, '')) + '</li>';
      } else if (line === '') {
        closeList();
      } else {
        closeList();
        html += '<p>' + inlineFormat(line) + '</p>';
      }
    }
    closeList();
    return html;
  }

  /* ─── Create FAB ──────────────────────────────────────────── */
  function createFAB() {
    fab = document.createElement('button');
    fab.className = 'sm-widget-fab sm-widget-pulse';
    fab.innerHTML = controllerSVG;
    fab.setAttribute('aria-label', 'Open Sweaty Mob AI chat');
    fab.addEventListener('click', togglePanel);
    document.body.appendChild(fab);

    // Stop pulse after 6 seconds
    setTimeout(function() {
      fab.classList.remove('sm-widget-pulse');
    }, 6000);
  }

  /* ─── Create Panel ────────────────────────────────────────── */
  function createPanel() {
    panel = document.createElement('div');
    panel.className = 'sm-widget-panel';
    panel.setAttribute('role', 'dialog');
    panel.setAttribute('aria-label', 'Sweaty Mob AI Chat');

    // Header
    var header = document.createElement('div');
    header.className = 'sm-widget-header';

    var headerLeft = document.createElement('div');
    headerLeft.className = 'sm-widget-header-left';

    var headerIcon = document.createElement('div');
    headerIcon.className = 'sm-widget-header-icon';
    headerIcon.innerHTML = controllerSVG;

    var headerText = document.createElement('div');
    var title = document.createElement('div');
    title.className = 'sm-widget-header-title';
    title.textContent = CONFIG.widgetTitle;
    var subtitle = document.createElement('div');
    subtitle.className = 'sm-widget-header-subtitle';
    subtitle.textContent = CONFIG.widgetSubtitle;
    headerText.appendChild(title);
    headerText.appendChild(subtitle);

    headerLeft.appendChild(headerIcon);
    headerLeft.appendChild(headerText);

    var closeBtn = document.createElement('button');
    closeBtn.className = 'sm-widget-close';
    closeBtn.innerHTML = closeSVG;
    closeBtn.setAttribute('aria-label', 'Close chat');
    closeBtn.addEventListener('click', togglePanel);

    header.appendChild(headerLeft);
    header.appendChild(closeBtn);

    // Messages
    messagesContainer = document.createElement('div');
    messagesContainer.className = 'sm-widget-messages';
    messagesContainer.setAttribute('role', 'log');
    messagesContainer.setAttribute('aria-live', 'polite');

    // Input area
    var inputArea = document.createElement('div');
    inputArea.className = 'sm-widget-input-area';

    inputEl = document.createElement('textarea');
    inputEl.className = 'sm-widget-input';
    inputEl.placeholder = CONFIG.placeholder;
    inputEl.rows = 1;
    inputEl.addEventListener('keydown', function(e) {
      if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        sendMessage();
      }
    });
    inputEl.addEventListener('input', function() {
      inputEl.style.height = 'auto';
      inputEl.style.height = Math.min(inputEl.scrollHeight, 80) + 'px';
    });

    sendBtn = document.createElement('button');
    sendBtn.className = 'sm-widget-send';
    sendBtn.innerHTML = sendSVG;
    sendBtn.setAttribute('aria-label', 'Send message');
    sendBtn.addEventListener('click', sendMessage);

    inputArea.appendChild(inputEl);
    inputArea.appendChild(sendBtn);

    // Footer
    var footer = document.createElement('div');
    footer.className = 'sm-widget-footer';
    var footerLink = document.createElement('a');
    footerLink.href = 'https://sweatymob.org';
    footerLink.target = '_blank';
    footerLink.rel = 'noopener noreferrer';
    footerLink.textContent = 'Powered by Sweaty Mob \u00b7 sweatymob.org';
    footer.appendChild(footerLink);

    panel.appendChild(header);
    panel.appendChild(messagesContainer);
    panel.appendChild(inputArea);
    panel.appendChild(footer);

    document.body.appendChild(panel);

    renderWelcome();
  }

  /* ─── Render Welcome State ────────────────────────────────── */
  function renderWelcome() {
    messagesContainer.innerHTML = '';

    var welcome = document.createElement('div');
    welcome.className = 'sm-widget-welcome';

    var icon = document.createElement('div');
    icon.className = 'sm-widget-welcome-icon';
    icon.innerHTML = controllerSVG;

    var h3 = document.createElement('h3');
    h3.innerHTML = 'Sweaty Mob <span>AI</span>';

    var p = document.createElement('p');
    p.textContent = 'Turn any game into a workout. Ask me about exercises, routines, or gaming fitness.';

    welcome.appendChild(icon);
    welcome.appendChild(h3);
    welcome.appendChild(p);
    messagesContainer.appendChild(welcome);

    // Quick prompts
    var prompts = document.createElement('div');
    prompts.className = 'sm-widget-prompts';

    var promptsTitle = document.createElement('div');
    promptsTitle.className = 'sm-widget-prompts-title';
    promptsTitle.textContent = 'Quick Start';
    prompts.appendChild(promptsTitle);

    CONFIG.quickPrompts.forEach(function(qp) {
      var btn = document.createElement('button');
      btn.className = 'sm-widget-prompt-btn';
      btn.textContent = qp.label;
      btn.addEventListener('click', function() {
        sendMessage(qp.prompt);
      });
      prompts.appendChild(btn);
    });

    messagesContainer.appendChild(prompts);
  }

  /* ─── Toggle Panel ────────────────────────────────────────── */
  function togglePanel() {
    isOpen = !isOpen;
    if (isOpen) {
      panel.classList.add('sm-widget-open');
      fab.classList.add('sm-widget-hidden');
      setTimeout(function() { inputEl.focus(); }, 300);
    } else {
      panel.classList.remove('sm-widget-open');
      fab.classList.remove('sm-widget-hidden');
    }
  }

  /* ─── Add Message to DOM ──────────────────────────────────── */
  function addMessageToDOM(role, content) {
    // If this is the first message, clear the welcome screen
    if (messages.length <= 1 && role === 'user') {
      messagesContainer.innerHTML = '';
    }

    var msgEl = document.createElement('div');
    msgEl.className = 'sm-widget-msg sm-widget-msg-' + (role === 'user' ? 'user' : 'ai');

    if (role === 'assistant') {
      msgEl.innerHTML = renderMarkdown(content);
    } else {
      msgEl.textContent = content;
    }

    messagesContainer.appendChild(msgEl);
    messagesContainer.scrollTop = messagesContainer.scrollHeight;
  }

  /* ─── Show/Hide Typing Indicator ──────────────────────────── */
  function showTyping() {
    typingEl = document.createElement('div');
    typingEl.className = 'sm-widget-typing';
    typingEl.innerHTML = '<div class="sm-widget-typing-dots"><div class="sm-widget-typing-dot"></div><div class="sm-widget-typing-dot"></div><div class="sm-widget-typing-dot"></div></div><span class="sm-widget-typing-text">Building your workout...</span>';
    messagesContainer.appendChild(typingEl);
    messagesContainer.scrollTop = messagesContainer.scrollHeight;
  }

  function hideTyping() {
    if (typingEl && typingEl.parentNode) {
      typingEl.parentNode.removeChild(typingEl);
      typingEl = null;
    }
  }

  /* ─── Send Message ────────────────────────────────────────── */
  function sendMessage(text) {
    var msg = text || (inputEl ? inputEl.value.trim() : '');
    if (!msg || isLoading) return;

    messages.push({ role: 'user', content: msg });
    addMessageToDOM('user', msg);

    if (inputEl) {
      inputEl.value = '';
      inputEl.style.height = 'auto';
    }

    isLoading = true;
    if (sendBtn) sendBtn.disabled = true;
    showTyping();

    var apiUrl = CONFIG.apiUrl ? CONFIG.apiUrl + '/api/chat' : '/api/chat';

    fetch(apiUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        message: msg,
        sessionId: CONFIG.sessionId
      })
    })
    .then(function(res) {
      if (!res.ok) throw new Error('API error');
      return res.json();
    })
    .then(function(data) {
      hideTyping();
      var reply = data.message || 'Sorry, I had trouble processing that. Try again!';
      messages.push({ role: 'assistant', content: reply });
      addMessageToDOM('assistant', reply);
    })
    .catch(function() {
      hideTyping();
      var errorMsg = 'Connection lost \u2014 try again. Even the best players lag sometimes. \ud83c\udfae';
      messages.push({ role: 'assistant', content: errorMsg });
      addMessageToDOM('assistant', errorMsg);
    })
    .finally(function() {
      isLoading = false;
      if (sendBtn) sendBtn.disabled = false;
    });
  }

  /* ─── Initialize ──────────────────────────────────────────── */
  function init() {
    createFAB();
    createPanel();
  }

  // Wait for DOM ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
