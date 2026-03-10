(function() {

// ── Guard against double init ────────────────────────────────
if (window.N8NChatWidgetInitialized) return;
window.N8NChatWidgetInitialized = true;

// ── Read config ──────────────────────────────────────────────
const cfg          = window.ChatWidgetConfig || {};
const webhookUrl   = cfg.webhook?.url   || '';
const webhookRoute = cfg.webhook?.route || 'general';
const welcomeText  = cfg.branding?.welcomeText || 'Hello! How can I assist you today?';
const agentName    = cfg.branding?.name || 'Assistant';
const logoUrl      = cfg.branding?.logo || '';
const primaryColor = cfg.style?.primaryColor || '#854fff';

// Build ctaList — supports plain strings OR objects: { text, cta: { label, url } }
const ctaList = (cfg.branding?.quickQuestions || []).map(q =>
    typeof q === 'string' ? { text: q, cta: null } : { text: q.text, cta: q.cta || null }
);

// Darken a hex color by ~20% for gradients
function darken(hex) {
    const n = parseInt(hex.replace('#', ''), 16);
    const ch = v => Math.max(0, Math.min(255, v + Math.round(2.55 * -20)));
    const r = ch(n >> 16);
    const g = ch((n >> 8) & 0xff);
    const b = ch(n & 0xff);
    return '#' + [r, g, b].map(x => x.toString(16).padStart(2, '0')).join('');
}
const primaryDark = darken(primaryColor);

// ── Styles ───────────────────────────────────────────────────
const styles = `
.n8n-chat-widget { font-family: 'Segoe UI', Arial, sans-serif; }

.chat-container {
    position: fixed;
    bottom: 90px;
    right: 24px;
    width: 380px;
    max-width: calc(100vw - 40px);
    height: 580px;
    max-height: calc(100vh - 120px);
    background: #f4f0ff;
    border-radius: 20px;
    box-shadow: 0 12px 40px rgba(0,0,0,0.15);
    display: none;
    flex-direction: column;
    overflow: hidden;
    z-index: 99999;
}
.chat-container.open { display: flex; }

.chat-header {
    padding: 16px 20px;
    display: flex;
    align-items: center;
    justify-content: space-between;
    background: #f4f0ff;
}
.chat-header-left {
    display: flex;
    align-items: center;
    gap: 10px;
}
.chat-header-back {
    background: none;
    border: none;
    font-size: 20px;
    cursor: pointer;
    color: VAR_PRIMARY;
    padding: 0;
    line-height: 1;
}
.chat-header-logo {
    width: 36px;
    height: 36px;
    border-radius: 50%;
    background: linear-gradient(135deg, VAR_PRIMARY, VAR_DARK);
    display: flex;
    align-items: center;
    justify-content: center;
    overflow: hidden;
}
.chat-header-logo img { width: 100%; height: 100%; object-fit: cover; }
.chat-header-logo span { color: #fff; font-size: 16px; font-weight: 700; }
.chat-header-close {
    background: none;
    border: none;
    font-size: 20px;
    cursor: pointer;
    color: #999;
    padding: 0;
    line-height: 1;
}

.new-conversation {
    margin: auto;
    text-align: center;
    padding: 30px 24px;
}
.new-conversation h2 {
    font-size: 22px;
    font-weight: 700;
    color: #1a1a1a;
    margin: 0 0 8px 0;
}
.new-conversation p {
    font-size: 14px;
    color: #888;
    margin: 0 0 24px 0;
}
.new-chat-btn {
    padding: 14px 24px;
    border-radius: 10px;
    border: none;
    background: linear-gradient(135deg, VAR_PRIMARY, VAR_DARK);
    color: #fff;
    cursor: pointer;
    font-size: 15px;
    font-weight: 600;
    transition: opacity 0.2s;
}
.new-chat-btn:hover { opacity: 0.9; }

.chat-interface {
    display: none;
    flex-direction: column;
    height: 100%;
}
.chat-interface.active { display: flex; }

.chat-messages {
    flex: 1;
    overflow-y: auto;
    padding: 16px;
    display: flex;
    flex-direction: column;
    gap: 12px;
    background: #f4f0ff;
}
.chat-messages::-webkit-scrollbar { width: 4px; }
.chat-messages::-webkit-scrollbar-thumb { background: #ddd; border-radius: 4px; }

.chat-message {
    padding: 14px 16px;
    border-radius: 18px;
    max-width: 85%;
    font-size: 15px;
    line-height: 1.55;
    word-break: break-word;
}
.chat-message.bot {
    background: #fff;
    color: #1a1a1a;
    align-self: flex-start;
    border-top-left-radius: 4px;
    box-shadow: 0 2px 8px rgba(0,0,0,0.06);
}
.chat-message.user {
    background: linear-gradient(135deg, VAR_PRIMARY, VAR_DARK);
    color: #fff;
    align-self: flex-end;
    border-top-right-radius: 4px;
}
.chat-message.bot.typing {
    color: #aaa;
    font-style: italic;
}

.quick-questions {
    display: flex;
    flex-direction: column;
    gap: 8px;
    margin-top: 4px;
    width: 100%;
}
.quick-btn {
    padding: 10px 14px;
    border-radius: 50px;
    border: 1.5px solid VAR_PRIMARY_55;
    background: #fff;
    cursor: pointer;
    font-size: 13px;
    text-align: center;
    color: VAR_PRIMARY;
    font-weight: 500;
    transition: all 0.15s;
    display: flex;
    align-items: center;
    justify-content: center;
    white-space: nowrap;
}
.quick-btn:hover {
    background: VAR_PRIMARY_11;
    border-color: VAR_PRIMARY;
}

.chat-input {
    padding: 12px 14px;
    display: flex;
    gap: 8px;
    border-top: 1px solid #e5dcff;
    background: #fff;
    align-items: flex-end;
}
.chat-input textarea {
    flex: 1;
    resize: none;
    padding: 10px 12px;
    border-radius: 10px;
    border: 1.5px solid #e5e5e5;
    font-size: 14px;
    font-family: inherit;
    outline: none;
    transition: border 0.2s;
    line-height: 1.4;
}
.chat-input textarea:focus { border-color: VAR_PRIMARY; }
.chat-input button {
    padding: 10px 18px;
    border-radius: 10px;
    border: none;
    background: linear-gradient(135deg, VAR_PRIMARY, VAR_DARK);
    color: #fff;
    cursor: pointer;
    font-size: 14px;
    font-weight: 600;
    transition: opacity 0.2s;
}
.chat-input button:hover { opacity: 0.9; }
.chat-input button:disabled { opacity: 0.5; cursor: not-allowed; }

.chat-toggle {
    position: fixed;
    bottom: 24px;
    right: 24px;
    width: 56px;
    height: 56px;
    border-radius: 50%;
    background: linear-gradient(135deg, VAR_PRIMARY, VAR_DARK);
    color: #fff;
    border: none;
    cursor: pointer;
    font-size: 22px;
    box-shadow: 0 4px 16px VAR_PRIMARY_40;
    z-index: 99999;
    transition: transform 0.2s;
    display: flex;
    align-items: center;
    justify-content: center;
}
.chat-toggle:hover { transform: scale(1.08); }
.cta-link {
    display: inline-block;
    margin-top: 10px;
    padding: 9px 18px;
    border-radius: 50px;
    border: 1.5px solid VAR_PRIMARY_55;
    background: #fff;
    color: VAR_PRIMARY;
    font-size: 13px;
    font-weight: 600;
    text-decoration: none;
    transition: all 0.15s;
    align-self: flex-start;
}
.cta-link:hover {
    background: VAR_PRIMARY_11;
    border-color: VAR_PRIMARY;
}
`
.replaceAll('VAR_PRIMARY',    primaryColor)
.replaceAll('VAR_DARK',       primaryDark)
.replaceAll('VAR_PRIMARY_55', primaryColor + '55')
.replaceAll('VAR_PRIMARY_11', primaryColor + '11')
.replaceAll('VAR_PRIMARY_40', primaryColor + '40');

const styleSheet = document.createElement('style');
styleSheet.textContent = styles;
document.head.appendChild(styleSheet);

// ── DOM ──────────────────────────────────────────────────────
const logoHtml = logoUrl
    ? `<img src="${logoUrl}" alt="${agentName}">`
    : `<span>${agentName.charAt(0).toUpperCase()}</span>`;

const widget = document.createElement('div');
widget.className = 'n8n-chat-widget';
widget.innerHTML = `
<div class="chat-container">
    <div class="chat-header">
        <div class="chat-header-left">
            <button class="chat-header-back">‹</button>
            <div class="chat-header-logo">${logoHtml}</div>
        </div>
        <button class="chat-header-close">✕</button>
    </div>

    <div class="new-conversation">
        <h2>Hi 👋, how can we help?</h2>
        <p>We typically respond right away</p>
        <button class="new-chat-btn">💬 Start a conversation</button>
    </div>

    <div class="chat-interface">
        <div class="chat-messages"></div>
        <div class="chat-input">
            <textarea placeholder="Type your message..." rows="1"></textarea>
            <button type="submit">Send</button>
        </div>
    </div>
</div>
<button class="chat-toggle">💬</button>
`;
document.body.appendChild(widget);

const chatContainer = widget.querySelector('.chat-container');
const toggle        = widget.querySelector('.chat-toggle');
const newChatBtn    = widget.querySelector('.new-chat-btn');
const chatInterface = widget.querySelector('.chat-interface');
const messages      = widget.querySelector('.chat-messages');
const textarea      = widget.querySelector('textarea');
const sendBtn       = widget.querySelector('button[type="submit"]');
const closeBtn      = widget.querySelector('.chat-header-close');

let currentSessionId = '';
function uuid() { return crypto.randomUUID(); }

// ── CTA helpers ──────────────────────────────────────────────
function norm(s) { return s.trim().toLowerCase().replace(/[?!.,]/g, ''); }
function matchCta(input) {
    return ctaList.find(c => norm(c.text) === norm(input)) || null;
}

function appendCtaButtons() {
    if (!ctaList.length) return;
    const wrap = document.createElement('div');
    wrap.className = 'quick-questions';
    ctaList.forEach(q => {
        const btn = document.createElement('button');
        btn.className = 'quick-btn';
        btn.textContent = q.text;
        btn.onclick = () => { wrap.remove(); sendMessage(q.text); };
        wrap.appendChild(btn);
    });
    messages.appendChild(wrap);
    messages.scrollTop = messages.scrollHeight;
}

// ── Conversation ─────────────────────────────────────────────
function startConversation() {
    currentSessionId = uuid();
    widget.querySelector('.new-conversation').style.display = 'none';
    chatInterface.classList.add('active');
    messages.innerHTML = '';

    const bot = document.createElement('div');
    bot.className = 'chat-message bot';
    bot.textContent = welcomeText;
    messages.appendChild(bot);

    appendCtaButtons();
}

async function sendMessage(text) {
    const matched  = matchCta(text);
    const sendText = matched ? matched.text : text;

    // User bubble
    const userEl = document.createElement('div');
    userEl.className = 'chat-message user';
    userEl.textContent = sendText;
    messages.appendChild(userEl);

    // Typing indicator
    const botEl = document.createElement('div');
    botEl.className = 'chat-message bot typing';
    botEl.textContent = '...';
    messages.appendChild(botEl);
    messages.scrollTop = messages.scrollHeight;

    sendBtn.disabled  = true;
    textarea.disabled = true;

    try {
        const res  = await fetch(webhookUrl, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                chatInput: sendText,
                sessionId: currentSessionId,
                route:     webhookRoute
            })
        });
        const data = await res.json();
        botEl.className   = 'chat-message bot';
        botEl.textContent = data.output || "Sorry, I couldn't process your request.";
    } catch (e) {
        botEl.className   = 'chat-message bot';
        botEl.textContent = 'Connection error. Please try again.';
    }

    sendBtn.disabled  = false;
    textarea.disabled = false;
    textarea.focus();

    // If this message matched a CTA that has a link, append it below bot reply
    if (matched && matched.cta) {
        const link = document.createElement('a');
        link.className = 'cta-link';
        link.href      = matched.cta.url;
        link.target    = '_blank';
        link.rel       = 'noopener';
        link.textContent = matched.cta.label;
        messages.appendChild(link);
    }

    // Always show CTAs after every bot response
    appendCtaButtons();
}

// ── Event listeners ──────────────────────────────────────────
newChatBtn.onclick = startConversation;
closeBtn.onclick   = () => chatContainer.classList.remove('open');
toggle.onclick     = () => chatContainer.classList.toggle('open');

sendBtn.onclick = () => {
    const msg = textarea.value.trim();
    if (msg) { sendMessage(msg); textarea.value = ''; }
};

textarea.addEventListener('keypress', e => {
    if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        const msg = textarea.value.trim();
        if (msg) { sendMessage(msg); textarea.value = ''; }
    }
});

})();
