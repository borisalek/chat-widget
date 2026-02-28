(function() {

const styles = `
.n8n-chat-widget { font-family: Arial, sans-serif; }

.chat-container {
    position: fixed;
    bottom: 20px;
    right: 20px;
    width: 380px;
    height: 600px;
    background: #fff;
    border-radius: 12px;
    box-shadow: 0 8px 32px rgba(0,0,0,0.1);
    display: none;
    flex-direction: column;
    overflow: hidden;
}

.chat-container.open { display: flex; }

.chat-header {
    padding: 16px;
    font-weight: bold;
    border-bottom: 1px solid #eee;
}

.new-conversation {
    margin: auto;
    text-align: center;
}

.new-chat-btn {
    padding: 14px 20px;
    border-radius: 8px;
    border: none;
    background: linear-gradient(135deg,#854fff,#6b3fd4);
    color: #fff;
    cursor: pointer;
}

.chat-interface {
    display: none;
    flex-direction: column;
    height: 100%;
}

.chat-interface.active { display: flex; }

.chat-messages {
    flex: 1;
    overflow-y: auto;
    padding: 20px;
    display: flex;
    flex-direction: column;
}

.chat-message {
    padding: 10px 14px;
    border-radius: 10px;
    margin: 6px 0;
    max-width: 80%;
    font-size: 14px;
}

.chat-message.bot {
    background: #f3f3f3;
}

.chat-message.user {
    background: linear-gradient(135deg,#854fff,#6b3fd4);
    color: #fff;
    align-self: flex-end;
}

.quick-questions {
    margin-top: 10px;
    display: flex;
    flex-direction: column;
    gap: 6px;
}

.quick-btn {
    padding: 8px 10px;
    border-radius: 8px;
    border: 1px solid #ddd;
    background: #fafafa;
    cursor: pointer;
    font-size: 13px;
    text-align: left;
}

.chat-input {
    padding: 12px;
    display: flex;
    gap: 8px;
    border-top: 1px solid #eee;
}

.chat-input textarea {
    flex: 1;
    resize: none;
    padding: 8px;
    border-radius: 8px;
    border: 1px solid #ddd;
}

.chat-input button {
    padding: 0 16px;
    border-radius: 8px;
    border: none;
    background: linear-gradient(135deg,#854fff,#6b3fd4);
    color: #fff;
    cursor: pointer;
}

.chat-toggle {
    position: fixed;
    bottom: 20px;
    right: 20px;
    width: 60px;
    height: 60px;
    border-radius: 50%;
    background: linear-gradient(135deg,#854fff,#6b3fd4);
    color: #fff;
    border: none;
    cursor: pointer;
}
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
    <div class="chat-header">nocodecreative.io</div>

    <div class="new-conversation">
        <button class="new-chat-btn">Hello, how can we help you?</button>
    </div>

    <div class="chat-interface">
        <div class="chat-messages"></div>

        <div class="chat-input">
            <textarea placeholder="Type your message here..." rows="1"></textarea>
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

function uuid(){ return crypto.randomUUID(); }

function startConversation(){
    currentSessionId = uuid();

    widget.querySelector('.new-conversation').style.display = 'none';
    chatInterface.classList.add('active');
    messages.innerHTML = "";

    const bot = document.createElement('div');
    bot.className = 'chat-message bot';
    bot.textContent = "Hi, how can I help you today?";
    messages.appendChild(bot);

    const quick = document.createElement('div');
    quick.className = 'quick-questions';

    const questions = [
        {
            text: "What services do you offer?",
            reply: "We offer automation, AI agent development, and no-code solutions tailored to your business needs."
        },
        {
            text: "How much does automation cost?",
            reply: "Our automation packages start from $500. The final price depends on the complexity of your workflow."
        },
        {
            text: "Can you build custom AI agents?",
            reply: "Yes! We specialize in building custom AI agents using tools like n8n, Make, and OpenAI. Let's discuss your use case."
        }
    ];

    questions.forEach(q => {
        const btn = document.createElement('button');
        btn.className = 'quick-btn';
        btn.textContent = q.text;
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

sendBtn.onclick = () => {
    const msg = textarea.value.trim();
    if(msg){
        sendMessage(msg);
        textarea.value = "";
    }
};

textarea.addEventListener('keypress', e=>{
    if(e.key === 'Enter' && !e.shiftKey){
        e.preventDefault();
        const msg = textarea.value.trim();
        if(msg){
            sendMessage(msg);
            textarea.value="";
        }
    }
});

toggle.onclick = ()=> chatContainer.classList.toggle('open');

})();
