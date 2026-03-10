(function () {

  /* ─── Config helpers ─────────────────────────────────────────── */
  const cfg = () => window.ChatWidgetConfig || {};
  const primary   = () => cfg().style?.primaryColor   || '#10b981';
  const secondary = () => cfg().style?.secondaryColor || '#059669';
  const brandName = () => cfg().branding?.name        || 'AI Assistant';
  const logoUrl   = () => cfg().branding?.logo        || '';
  const welcome   = () => cfg().branding?.welcomeText || 'Hello, please let me know if I can help you. You can ask me anything you want.';

  /* ─── Styles ─────────────────────────────────────────────────── */
  const css = `
@import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600&display=swap');

.zc-widget * { box-sizing: border-box; font-family: 'DM Sans', sans-serif; margin: 0; padding: 0; }

/* ── Toggle bar ── */
.zc-toggle {
  position: fixed;
  bottom: 24px;
  left: 50%;
  transform: translateX(-50%);
  display: flex;
  align-items: center;
  gap: 10px;
  background: #fff;
  border: 1px solid #e8e8e8;
  border-radius: 999px;
  padding: 12px 20px;
  cursor: pointer;
  box-shadow: 0 4px 24px rgba(0,0,0,0.10);
  z-index: 99998;
  min-width: 200px;
  transition: box-shadow 0.2s, transform 0.2s;
}
.zc-toggle:hover { box-shadow: 0 6px 32px rgba(0,0,0,0.14); transform: translateX(-50%) translateY(-1px); }
.zc-toggle-icon {
  width: 28px; height: 28px; border-radius: 8px;
  overflow: hidden; flex-shrink: 0;
  display: flex; align-items: center; justify-content: center;
  background: var(--zc-primary);
}
.zc-toggle-icon img { width: 100%; height: 100%; object-fit: cover; }
.zc-toggle-icon-default { font-size: 15px; color: #fff; }
.zc-toggle-text { font-size: 14px; font-weight: 500; color: #555; flex: 1; }
.zc-toggle-send {
  width: 32px; height: 32px; border-radius: 50%;
  background: var(--zc-primary);
  border: none; cursor: pointer;
  display: flex; align-items: center; justify-content: center;
  flex-shrink: 0; transition: opacity 0.2s;
}
.zc-toggle-send:hover { opacity: 0.85; }
.zc-toggle-send svg { width: 14px; height: 14px; fill: #fff; }

/* ── Chat panel ── */
.zc-panel {
  position: fixed;
  bottom: 90px;
  left: 50%;
  transform: translateX(-50%) translateY(10px);
  width: 420px;
  max-width: calc(100vw - 32px);
  max-height: calc(100vh - 140px);
  background: #fff;
  border-radius: 24px;
  box-shadow: 0 8px 48px rgba(0,0,0,0.13);
  display: flex;
  flex-direction: column;
  overflow: hidden;
  z-index: 99999;
  opacity: 0;
  pointer-events: none;
  transition: opacity 0.22s ease, transform 0.22s ease;
}
.zc-panel.open {
  opacity: 1;
  pointer-events: all;
  transform: translateX(-50%) translateY(0);
}

/* ── Messages area ── */
.zc-msgs {
  flex: 1;
  overflow-y: auto;
  padding: 24px 20px 16px;
  display: flex;
  flex-direction: column;
  gap: 16px;
  background: #fff;
  min-height: 200px;
}
.zc-msgs::-webkit-scrollbar { width: 4px; }
.zc-msgs::-webkit-scrollbar-thumb { background: #e0e0e0; border-radius: 4px; }

/* ── Bot message row ── */
.zc-row { display: flex; gap: 10px; align-items: flex-start; }
.zc-row.user { flex-direction: row-reverse; }

.zc-avatar {
  width: 32px; height: 32px; border-radius: 10px;
  background: var(--zc-primary);
  flex-shrink: 0; overflow: hidden;
  display: flex; align-items: center; justify-content: center;
  font-size: 14px; color: #fff; font-weight: 600;
}
.zc-avatar img { width: 100%; height: 100%; object-fit: cover; }

.zc-bubble {
  padding: 13px 15px;
  border-radius: 16px;
  font-size: 14px;
  line-height: 1.6;
  max-width: 78%;
  word-break: break-word;
}
.zc-bubble.bot {
  background: #f5f5f5;
  color: #1a1a1a;
  border-top-left-radius: 4px;
}
.zc-bubble.user {
  background: var(--zc-primary);
  color: #fff;
  border-top-right-radius: 4px;
}
.zc-bubble.typing { color: #aaa; font-style: italic; }

.zc-sender {
  font-size: 11px;
  color: #999;
  margin-top: 5px;
  padding-left: 42px;
}

/* ── Quick replies ── */
.zc-quick {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  padding: 0 20px 4px;
}
.zc-qbtn {
  padding: 9px 20px;
  border-radius: 999px;
  border: 1.5px solid #e0e0e0;
  background: #fff;
  font-size: 13px;
  font-weight: 500;
  color: #333;
  cursor: pointer;
  transition: border-color 0.15s, background 0.15s;
  width: fit-content;
}
.zc-qbtn:hover { border-color: var(--zc-primary); background: #f9fffe; }

/* ── Divider ── */
.zc-divider { height: 1px; background: #f0f0f0; margin: 0; }

/* ── Input area ── */
.zc-input-wrap {
  padding: 14px 16px 10px;
  background: #fff;
}
.zc-input-row {
  display: flex;
  align-items: center;
  gap: 10px;
  border: 1px solid #e8e8e8;
  border-radius: 14px;
  padding: 10px 12px;
  transition: border-color 0.2s;
}
.zc-input-row:focus-within { border-color: var(--zc-primary); }
.zc-input-row textarea {
  flex: 1; resize: none; border: none; outline: none;
  font-size: 14px; font-family: inherit; line-height: 1.4;
  color: #333; background: transparent;
  max-height: 100px; overflow-y: auto;
}
.zc-input-row textarea::placeholder { color: #bbb; }
.zc-send-btn {
  width: 34px; height: 34px; border-radius: 50%;
  background: var(--zc-primary); border: none;
  cursor: pointer; flex-shrink: 0;
  display: flex; align-items: center; justify-content: center;
  transition: opacity 0.2s;
}
.zc-send-btn:hover { opacity: 0.85; }
.zc-send-btn:disabled { opacity: 0.4; cursor: not-allowed; }
.zc-send-btn svg { width: 14px; height: 14px; fill: #fff; }

/* ── Powered by ── */
.zc-powered {
  text-align: center;
  padding: 8px 0 12px;
  font-size: 11px;
  color: #bbb;
  font-weight: 500;
  letter-spacing: 0.01em;
}
.zc-powered span { color: #999; }

/* ── Close circle ── */
.zc-close-btn {
  position: fixed;
  bottom: 24px;
  left: 50%;
  transform: translateX(-50%);
  width: 48px; height: 48px;
  border-radius: 50%;
  background: #fff;
  border: 1px solid #e8e8e8;
  box-shadow: 0 4px 16px rgba(0,0,0,0.10);
  cursor: pointer;
  z-index: 99998;
  display: none;
  align-items: center; justify-content: center;
  font-size: 18px; color: #888;
  transition: box-shadow 0.2s;
}
.zc-close-btn:hover { box-shadow: 0 6px 24px rgba(0,0,0,0.14); color: #333; }
.zc-close-btn.visible { display: flex; }
`;

  /* ─── Inject styles ──────────────────────────────────────────── */
  if (window._ZCWidgetLoaded) return;
  window._ZCWidgetLoaded = true;

  const style = document.createElement('style');
  style.textContent = css;
  document.head.appendChild(style);

  /* ─── Build DOM ──────────────────────────────────────────────── */
  const root = document.createElement('div');
  root.className = 'zc-widget';
  root.style.setProperty('--zc-primary', primary());

  const arrowSVG = `<svg viewBox="0 0 16 16" xmlns="http://www.w3.org/2000/svg"><path d="M8 1l7 7-7 7M15 8H1" stroke="#fff" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" fill="none"/></svg>`;

  root.innerHTML = `
    <!-- Toggle bar -->
    <button class="zc-toggle">
      <div class="zc-toggle-icon">
        ${logoUrl() ? `<img src="${logoUrl()}" alt="">` : `<span class="zc-toggle-icon-default">✦</span>`}
      </div>
      <span class="zc-toggle-text">Ask AI...</span>
      <button class="zc-toggle-send" tabindex="-1">${arrowSVG}</button>
    </button>

    <!-- Chat panel -->
    <div class="zc-panel">
      <div class="zc-msgs"></div>
      <div class="zc-quick"></div>
      <div class="zc-divider"></div>
      <div class="zc-input-wrap">
        <div class="zc-input-row">
          <textarea placeholder="Ask AI..." rows="1"></textarea>
          <button class="zc-send-btn" disabled>${arrowSVG}</button>
        </div>
      </div>
      <div class="zc-powered">Powered by <span>${brandName()}</span></div>
    </div>

    <!-- Close button -->
    <button class="zc-close-btn">✕</button>
  `;

  document.body.appendChild(root);

  /* ─── Element refs ───────────────────────────────────────────── */
  const toggleBar = root.querySelector('.zc-toggle');
  const panel     = root.querySelector('.zc-panel');
  const msgsArea  = root.querySelector('.zc-msgs');
  const quickArea = root.querySelector('.zc-quick');
  const textarea  = root.querySelector('textarea');
  const sendBtn   = root.querySelector('.zc-send-btn');
  const closeBtn  = root.querySelector('.zc-close-btn');

  /* ─── State ──────────────────────────────────────────────────── */
  let sessionId   = '';
  let isOpen      = false;
  let started     = false;

  /* ─── Persistence helpers ────────────────────────────────────── */
  const STORAGE_KEY = 'zc_chat_history';
  const SESSION_KEY = 'zc_chat_session';

  function saveHistory() {
    const msgs = [];
    msgsArea.querySelectorAll('.zc-row, .zc-sender').forEach(el => {
      msgs.push({ html: el.outerHTML, cls: el.className });
    });
    localStorage.setItem(STORAGE_KEY, JSON.stringify(msgs));
    localStorage.setItem(SESSION_KEY, sessionId);
  }

  function loadHistory() {
    const saved = localStorage.getItem(STORAGE_KEY);
    const savedSession = localStorage.getItem(SESSION_KEY);
    if (!saved || !savedSession) return false;
    try {
      const msgs = JSON.parse(saved);
      if (!msgs.length) return false;
      sessionId = savedSession;
      msgsArea.innerHTML = '';
      msgs.forEach(m => {
        const tmp = document.createElement('div');
        tmp.innerHTML = m.html;
        msgsArea.appendChild(tmp.firstChild);
      });
      scroll();
      return true;
    } catch { return false; }
  }

  function clearHistory() {
    localStorage.removeItem(STORAGE_KEY);
    localStorage.removeItem(SESSION_KEY);
  }

  /* ─── Open / Close ───────────────────────────────────────────── */
  function openPanel() {
    isOpen = true;
    panel.classList.add('open');
    toggleBar.style.display = 'none';
    closeBtn.classList.add('visible');
    if (!started) { started = true; initConversation(); }
    textarea.focus();
  }

  function closePanel() {
    isOpen = false;
    panel.classList.remove('open');
    toggleBar.style.display = 'flex';
    closeBtn.classList.remove('visible');
  }

  toggleBar.addEventListener('click', openPanel);
  closeBtn.addEventListener('click', closePanel);

  /* ─── Avatar helper ──────────────────────────────────────────── */
  function botAvatar() {
    const el = document.createElement('div');
    el.className = 'zc-avatar';
    if (logoUrl()) {
      el.innerHTML = `<img src="${logoUrl()}" alt="">`;
    } else {
      el.textContent = brandName().charAt(0).toUpperCase();
    }
    return el;
  }

  /* ─── Add bot message ────────────────────────────────────────── */
  function addBotMsg(text, typing = false) {
    const row = document.createElement('div');
    row.className = 'zc-row';

    const avatar = botAvatar();
    const bubble = document.createElement('div');
    bubble.className = 'zc-bubble bot' + (typing ? ' typing' : '');
    bubble.innerHTML = text;

    row.appendChild(avatar);
    row.appendChild(bubble);
    msgsArea.appendChild(row);

    const sender = document.createElement('div');
    sender.className = 'zc-sender';
    sender.textContent = brandName() + ' · AI';
    msgsArea.appendChild(sender);

    scroll();
    saveHistory();
    return bubble;
  }

  /* ─── Add user message ───────────────────────────────────────── */
  function addUserMsg(text) {
    const row = document.createElement('div');
    row.className = 'zc-row user';
    const bubble = document.createElement('div');
    bubble.className = 'zc-bubble user';
    bubble.textContent = text;
    row.appendChild(bubble);
    msgsArea.appendChild(row);
    scroll();
    saveHistory();
  }

  function scroll() {
    msgsArea.scrollTop = msgsArea.scrollHeight;
  }

  /* ─── Init conversation ──────────────────────────────────────── */
  function initConversation() {
    msgsArea.innerHTML = '';
    quickArea.innerHTML = '';

    // Try to restore previous session
    if (loadHistory()) return;

    // Fresh start
    sessionId = crypto.randomUUID();
    addBotMsg(welcome());

    const questions = [
      {
        text: "What services do you offer?",
        reply: `Here's what we offer:<br><br>🔄 <b>Workflow Automation</b> – Automate repetitive tasks using n8n, Make & Zapier<br>🤖 <b>Custom AI Agents</b> – Intelligent bots tailored to your business<br>🔗 <b>System Integrations</b> – Connect your tools & platforms seamlessly<br>🌐 <b>No-Code Development</b> – Build apps & dashboards without writing code<br><br><a href="https://borisaleksicwebdesigner.framer.website/#services1" style="display:inline-block;margin-top:6px;padding:10px 18px;border-radius:999px;border:1.5px solid #e0e0e0;background:#fff;color:#333;font-weight:600;font-size:13px;text-decoration:none;" onmouseover="this.style.borderColor='var(--zc-primary)'" onmouseout="this.style.borderColor='#e0e0e0'">🔗 View all services →</a>`
      },
      {
        text: "How much does it cost?",
        reply: "Our packages start from $500. The final price depends on the complexity of your project."
      },
      {
        text: "Build custom AI agents?",
        reply: "Yes! We specialize in building custom AI agents using tools like n8n, Make, and OpenAI."
      },
      {
        text: "Book a consultation",
        reply: "Great! You can book a free consultation at <a href='https://nocodecreative.io/contact' style='color:var(--zc-primary);font-weight:600;text-decoration:none;'>nocodecreative.io/contact</a>. We'd love to hear about your project."
      }
    ];

    questions.forEach(q => {
      const btn = document.createElement('button');
      btn.className = 'zc-qbtn';
      btn.innerHTML = q.emoji ? q.emoji + " " + q.text : q.text;
      btn.onclick = () => {
        quickArea.innerHTML = '';
        sendMessage(q.text, q.reply);
      };
      quickArea.appendChild(btn);
    });
  }

  /* ─── Send message ───────────────────────────────────────────── */
  async function sendMessage(text, hardReply) {
    quickArea.innerHTML = '';
    addUserMsg(text);

    if (hardReply) {
      addBotMsg(hardReply);
      return;
    }

    const bubble = addBotMsg('...', true);

    sendBtn.disabled = true;
    textarea.disabled = true;

    try {
      const url   = cfg().webhook?.url;
      const route = cfg().webhook?.route || 'general';

      const res  = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify({ chatInput: text, sessionId: sessionId, route: route })
      });

      const data = await res.json();
      bubble.classList.remove('typing');
      bubble.textContent = data.output || "Sorry, I couldn't process your request.";
      saveHistory();

      // Ako je pitanje o uslugama, dodaj CTA ispod odgovora
      const serviceKeywords = ['service', 'services', 'offer', 'what do you do', 'usluga', 'usluge'];
      const isServiceQ = serviceKeywords.some(kw => text.toLowerCase().includes(kw));
      if (isServiceQ) {
        const cta = document.createElement('a');
        cta.href = 'https://borisaleksicwebdesigner.framer.website/#services1';
        cta.className = 'zc-qbtn';
        cta.style.cssText = 'text-decoration:none;margin-top:-8px;';
        cta.innerHTML = '🔗 View all services →';
        msgsArea.appendChild(cta);
        scroll();
      }

    } catch {
      bubble.classList.remove('typing');
      bubble.textContent = "Connection error. Please try again.";
    }

    sendBtn.disabled = false;
    textarea.disabled = false;
    textarea.focus();
    scroll();
  }

  /* ─── Input events ───────────────────────────────────────────── */
  textarea.addEventListener('input', () => {
    textarea.style.height = 'auto';
    textarea.style.height = Math.min(textarea.scrollHeight, 100) + 'px';
    sendBtn.disabled = !textarea.value.trim();
  });

  textarea.addEventListener('keydown', e => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      submit();
    }
  });

  sendBtn.addEventListener('click', submit);

  function submit() {
    const msg = textarea.value.trim();
    if (!msg) return;
    textarea.value = '';
    textarea.style.height = 'auto';
    sendBtn.disabled = true;
    sendMessage(msg);
  }

})();
