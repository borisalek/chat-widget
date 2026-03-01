(function() {

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
    color: #854fff;
    padding: 0;
    line-height: 1;
}

.chat-header-logo {
    width: 36px;
    height: 36px;
    border-radius: 50%;
    background: linear-gradient(135deg, #854fff, #6b3fd4);
    display: flex;
    align-items: center;
    justify-content: center;
    color: #fff;
    font-size: 18px;
    font-weight: 700;
}

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
    background: linear-gradient(135deg, #854fff, #6b3fd4);
    color: #fff;
    cursor: pointer;
    font-size: 15px;
    font-weight: 600;
    margin: 0 auto;
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
    background: linear-gradient(135deg, #854fff, #6b3fd4);
    color: #fff;
    align-self: flex-end;
    border-top-right-radius: 4px;
}

.quick-questions {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 10px;
    margin-top: 4px;
}

.quick-btn {
    padding: 10px 14px;
    border-radius: 50px;
    border: 1.5px solid #c4a8ff;
    background: #fff;
    cursor: pointer;
    font-size: 13px;
    text-align: center;
    color: #5a2db8;
    font-weight: 500;
    transition: all 0.15s;
    display: flex;
    align-items: center;
    gap: 6px;
    justify-content: center;
    white-space: nowrap;
}

.quick-btn:hover {
    background: #f0e8ff;
    border-color: #854fff;
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

.chat-input textarea:focus { border-color: #854fff; }

.chat-input button {
    padding: 10px 18px;
    border-radius: 10px;
    border: none;
    background: linear-gradient(135deg, #854fff, #6b3fd4);
    color: #fff;
    cursor: pointer;
    font-size: 14px;
    font-weight: 600;
    transition: opacity 0.2s;
}

.chat-input button:hover { opacity: 0.9; }

.chat-toggle {
    position: fixed;
    bottom: 24px;
    right: 24px;
    width: 56px;
    height: 56px;
    border-radius: 50%;
    background: linear-gradient(135deg, #854fff, #6b3fd4);
    color: #fff;
    border: none;
    cursor: pointer;
    font-size: 22px;
    box-shadow: 0 4px 16px rgba(133,79,255,0.4);
    z-index: 99999;
    transition: transform 0.2s;
    display: flex;
    align-items: center;
    justify-content: center;
}

.chat-toggle:hover { transform: scale(1.08); }
`;

const styleSheet = document.createElement('style');
styleSheet.textContent = styles;
document.head.appendChild(styleSheet);

if(window.N8NChatWidgetInitialized) return;
window.N8NChatWidgetInitialized = true;

let currentSessionId = "";

const widget = document.createElement('div');
widget.className = 'n8n-chat-widget';

widget.innerHTML = `
<div class="chat-container">
    <div class="chat-header">
        <div class="chat-header-left">
            <button class="chat-header-back">‹</button>
            <div class="chat-header-logo">n</div>
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
const toggle = widget.querySelector('.chat-toggle');
const newChatBtn = widget.querySelector('.new-chat-btn');
const chatInterface = widget.querySelector('.chat-interface');
const messages = widget.querySelector('.chat-messages');
const textarea = widget.querySelector('textarea');
const sendBtn = widget.querySelector('button[type="submit"]');
const closeBtn = widget.querySelector('.chat-header-close');

function uuid(){ return crypto.randomUUID(); }

function startConversation(){
    currentSessionId = uuid();
    widget.querySelector('.new-conversation').style.display = 'none';
    chatInterface.classList.add('active');
    messages.innerHTML = "";

    const bot = document.createElement('div');
    bot.className = 'chat-message bot';
    bot.innerHTML = "Hello! How can I assist you today?<br><br>Please describe your use case in as much detail as you can so I can help you effectively.";
    messages.appendChild(bot);

    const quick = document.createElement('div');
    quick.className = 'quick-questions';

    const questions = [
        { text: "What services do you offer?", emoji: "🛠️", reply: "We offer automation, AI agent development, and no-code solutions tailored to your business needs." },
        { text: "How much does it cost?", emoji: "💰", reply: "Our packages start from $500. The final price depends on the complexity of your project." },
        { text: "Build custom AI agents?", emoji: "🤖", reply: "Yes! We specialize in building custom AI agents using tools like n8n, Make, and OpenAI." },
        { text: "Book a consultation", emoji: "📅", reply: "Great! You can book a free consultation at nocodecreative.io/contact. We'd love to hear about your project." }
    ];

    questions.forEach(q => {
        const btn = document.createElement('button');
        btn.className = 'quick-btn';
        btn.innerHTML = `${q.emoji} ${q.text}`;
        btn.onclick = () => {
            quick.remove();
            sendMessage(q.text, q.reply);
        };
        quick.appendChild(btn);
    });

    messages.appendChild(quick);
}

function sendMessage(text, botReply){
    const user = document.createElement('div');
    user.className = 'chat-message user';
    user.textContent = text;
    messages.appendChild(user);

    const bot = document.createElement('div');
    bot.className = 'chat-message bot';
    bot.textContent = botReply || "Thanks for your message! We'll get back to you shortly.";
    messages.appendChild(bot);

    messages.scrollTop = messages.scrollHeight;
}

newChatBtn.onclick = startConversation;
closeBtn.onclick = () => chatContainer.classList.remove('open');

sendBtn.onclick = () => {
    const msg = textarea.value.trim();
    if(msg){ sendMessage(msg); textarea.value = ""; }
};

textarea.addEventListener('keypress', e => {
    if(e.key === 'Enter' && !e.shiftKey){
        e.preventDefault();
        const msg = textarea.value.trim();
        if(msg){ sendMessage(msg); textarea.value = ""; }
    }
});

toggle.onclick = () => chatContainer.classList.toggle('open');

})();