// Chat Widget Script
(function() {

    const styles = `
        .n8n-chat-widget {
            --chat--color-primary: var(--n8n-chat-primary-color, #854fff);
            --chat--color-secondary: var(--n8n-chat-secondary-color, #6b3fd4);
            --chat--color-background: var(--n8n-chat-background-color, #ffffff);
            --chat--color-font: var(--n8n-chat-font-color, #333333);
            font-family: 'Geist Sans', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
        }

        .n8n-chat-widget .chat-container {
            position: fixed;
            bottom: 20px;
            right: 20px;
            z-index: 1000;
            display: none;
            width: 380px;
            height: 600px;
            background: var(--chat--color-background);
            border-radius: 12px;
            box-shadow: 0 8px 32px rgba(133,79,255,0.15);
            border: 1px solid rgba(133,79,255,0.2);
            overflow: hidden;
        }

        .n8n-chat-widget .chat-container.open {
            display: flex;
            flex-direction: column;
        }

        .brand-header {
            padding:16px;
            display:flex;
            align-items:center;
            gap:12px;
            border-bottom:1px solid rgba(133,79,255,0.1);
        }

        .brand-header img {
            width:32px;
            height:32px;
        }

        .brand-header span {
            font-size:18px;
            font-weight:500;
        }

        .new-conversation {
            position:absolute;
            top:50%;
            left:50%;
            transform:translate(-50%,-50%);
            text-align:center;
            width:100%;
            max-width:300px;
        }

        .new-chat-btn {
            width:100%;
            padding:16px 24px;
            background:linear-gradient(135deg,var(--chat--color-primary),var(--chat--color-secondary));
            color:#fff;
            border:none;
            border-radius:8px;
            cursor:pointer;
            font-size:16px;
        }

        .chat-interface {
            display:none;
            flex-direction:column;
            height:100%;
        }

        .chat-interface.active {
            display:flex;
        }

        .chat-messages {
            flex:1;
            overflow-y:auto;
            padding:20px;
            display:flex;
            flex-direction:column;
        }

        .chat-message {
            padding:12px 16px;
            margin:8px 0;
            border-radius:12px;
            max-width:80%;
            font-size:14px;
        }

        .chat-message.user {
            background:linear-gradient(135deg,var(--chat--color-primary),var(--chat--color-secondary));
            color:white;
            align-self:flex-end;
        }

        .chat-message.bot {
            background:#f7f7f7;
            border:1px solid rgba(133,79,255,0.2);
        }

        .quick-questions {
            display:flex;
            flex-direction:column;
            gap:8px;
            margin-top:10px;
        }

        .quick-btn {
            background:rgba(133,79,255,0.1);
            border:1px solid rgba(133,79,255,0.3);
            border-radius:8px;
            padding:10px;
            cursor:pointer;
            font-size:13px;
            text-align:left;
        }

        .chat-input {
            padding:16px;
            display:flex;
            gap:8px;
            border-top:1px solid rgba(133,79,255,0.1);
        }

        .chat-input textarea {
            flex:1;
            padding:12px;
            border-radius:8px;
            border:1px solid rgba(133,79,255,0.2);
            resize:none;
        }

        .chat-input button {
            background:linear-gradient(135deg,var(--chat--color-primary),var(--chat--color-secondary));
            color:white;
            border:none;
            border-radius:8px;
            padding:0 20px;
            cursor:pointer;
        }

        .chat-toggle {
            position:fixed;
            bottom:20px;
            right:20px;
            width:60px;
            height:60px;
            border-radius:30px;
            background:linear-gradient(135deg,var(--chat--color-primary),var(--chat--color-secondary));
            color:white;
            border:none;
            cursor:pointer;
            z-index:999;
        }
    `;

    const styleSheet = document.createElement('style');
    styleSheet.textContent = styles;
    document.head.appendChild(styleSheet);

    const config = window.ChatWidgetConfig || {
        webhook:{ url:"", route:"" },
        branding:{ logo:"", name:"nocodecreative.io", welcomeText:"Hi 👋, how can we help?", responseTimeText:"We typically respond right away" }
    };

    if(window.N8NChatWidgetInitialized) return;
    window.N8NChatWidgetInitialized=true;

    let currentSessionId="";

    const widget=document.createElement('div');
    widget.className='n8n-chat-widget';

    const chatContainer=document.createElement('div');
    chatContainer.className='chat-container';

    chatContainer.innerHTML=`
        <div class="brand-header">
            <img src="${config.branding.logo}" />
            <span>${config.branding.name}</span>
        </div>
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
    `;

    const toggle=document.createElement('button');
    toggle.className='chat-toggle';
    toggle.textContent='💬';

    widget.appendChild(chatContainer);
    widget.appendChild(toggle);
    document.body.appendChild(widget);

    const newChatBtn=chatContainer.querySelector('.new-chat-btn');
    const chatInterface=chatContainer.querySelector('.chat-interface');
    const messages=chatContainer.querySelector('.chat-messages');
    const textarea=chatContainer.querySelector('textarea');
    const sendBtn=chatContainer.querySelector('button[type="submit"]');

    function uuid(){ return crypto.randomUUID(); }

    async function startConversation(){
        currentSessionId=uuid();
        chatContainer.querySelector('.new-conversation').style.display='none';
        chatInterface.classList.add('active');

        const bot=document.createElement('div');
        bot.className='chat-message bot';
        bot.textContent="Hi, how can I help you today?";
        messages.appendChild(bot);

        const quick=document.createElement('div');
        quick.className='quick-questions';

        const questions=[
            "What services do you offer?",
            "How much does automation cost?",
            "Can you build custom AI agents?"
        ];

        questions.forEach(q=>{
            const btn=document.createElement('button');
            btn.className='quick-btn';
            btn.textContent=q;
            btn.onclick=()=>{
                quick.remove();
                sendMessage(q);
            };
            quick.appendChild(btn);
        });

        messages.appendChild(quick);
    }

    async function sendMessage(text){
        const user=document.createElement('div');
        user.className='chat-message user';
        user.textContent=text;
        messages.appendChild(user);

        try{
            const res=await fetch(config.webhook.url,{
                method:'POST',
                headers:{'Content-Type':'application/json'},
                body:JSON.stringify({
                    action:"sendMessage",
                    sessionId:currentSessionId,
                    route:config.webhook.route,
                    chatInput:text
                })
            });
            const data=await res.json();
            const bot=document.createElement('div');
            bot.className='chat-message bot';
            bot.textContent=Array.isArray(data)?data[0].output:data.output;
            messages.appendChild(bot);
        }catch(e){
            console.error(e);
        }
    }

    newChatBtn.onclick=startConversation;

    sendBtn.onclick=()=>{
        const msg=textarea.value.trim();
        if(msg){
            sendMessage(msg);
            textarea.value="";
        }
    };

    textarea.addEventListener('keypress',e=>{
        if(e.key==='Enter'&&!e.shiftKey){
            e.preventDefault();
            const msg=textarea.value.trim();
            if(msg){
                sendMessage(msg);
                textarea.value="";
            }
        }
    });

    toggle.onclick=()=>chatContainer.classList.toggle('open');

})();