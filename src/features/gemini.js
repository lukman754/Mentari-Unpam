function formatBotMessage(text) {
    const escapeHtml = (unsafe) => {
        if (typeof unsafe !== 'string') return '';
        return unsafe.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&#039;");
    };
    let html = text;
    html = html.replace(/```(\w*)\n([\s\S]*?)```/g, (match, lang, code) => {
        const escapedCode = escapeHtml(code);
        let highlightedCode = escapedCode
            .replace(/\b(const|let|var|function|return|if|else|for|while|import|export|from)\b/g, '<span class="code-keyword">$1</span>')
            .replace(/(".*?"|'.*?'|`.*?`)/g, '<span class="code-string">$1</span>')
            .replace(/(\/\/.*|\/\*[\s\S]*?\*\/)/g, '<span class="code-comment">$1</span>');
        return `<pre><code class="language-${lang || 'plaintext'}">${highlightedCode}</code></pre>`;
    });
    html = '\n' + html.replace(/<pre>[\s\S]*?<\/pre>/g, '\n') + '\n';
    html = html
        .replace(/\n\s*[\*-.](.*)/g, '\n<ul><li>$1</li></ul>')
        .replace(/\n\s*\d+\.(.*)/g, '\n<ol><li>$1</li></ol>')
        .replace(/<\/ul>\n<ul>/g, '').replace(/<\/ol>\n<ol>/g, '')
        .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>').replace(/\*(.*?)\*/g, '<em>$1</em>')
        .replace(/\n/g, '<br>').replace(/<br><br>/g, '<p>').trim();
    text.match(/```(\w*)\n([\s\S]*?)```/g)?.forEach((block, i) => {
        html = html.replace(/<pre>[\s\S]*?<\/pre>/, block);
    });
    return formatBotMessageWithAllFeatures(text);
}

function formatBotMessageWithAllFeatures(text) {
    const escapeHtml = (unsafe) => unsafe.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&#039;");
    const codeBlocks = [];
    let processedText = text.replace(/```(\w*)\n([\s\S]*?)```/g, (match, lang, code) => {
        const highlightedCode = escapeHtml(code)
            .replace(/\b(const|let|var|function|return|if|else|for|while|import|export|from)\b/g, '<span class="code-keyword">$1</span>')
            .replace(/(".*?"|'.*?'|`.*?`)/g, '<span class="code-string">$1</span>')
            .replace(/(\/\/.*|\/\*[\s\S]*?\*\/)/g, '<span class="code-comment">$1</span>');
        codeBlocks.push(`<pre><code class="language-${lang || 'plaintext'}">${highlightedCode}</code></pre>`);
        return `__CODEBLOCK_${codeBlocks.length - 1}__`;
    });
    
    // Format Markdown
    processedText = processedText
        .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>').replace(/\*(.*?)\*/g, '<em>$1</em>')
        .replace(/^\s*[\*-.](.*)/gm, '<ul><li>$1</li></ul>').replace(/^\s*\d+\.(.*)/gm, '<ol><li>$1</li></ol>')
        .replace(/<\/ul>\n<ul>/g, '').replace(/<\/ol>\n<ol>/g, '')
        .replace(/\n/g, '<br>');
    // Re-insert code blocks
    codeBlocks.forEach((block, i) => {
        processedText = processedText.replace(`__CODEBLOCK_${i}__`, block);
    });
    return processedText;
}

function addMessageToChat(sender, text) {
    const chatHistory = document.getElementById('chatHistory');
    const messageElement = document.createElement('div');
    messageElement.className = `message ${sender}-message`;
    messageElement.setAttribute('data-original-text', text);
    let formattedContent = (sender === 'user') ? text.replace(/\n/g, '<br>') : formatBotMessageWithAllFeatures(text);

    if (sender === 'user') {
        messageElement.innerHTML = `
            <div class="message-controls"><button class="edit-message" title="Edit"><svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24"><path fill="currentColor" d="M20.71 7.04c.39-.39.39-1.02 0-1.41l-2.34-2.34c-.39-.39-1.02-.39-1.41 0l-1.83 1.83l3.75 3.75M3 17.25V21h3.75L17.81 9.94l-3.75-3.75z"/></svg></button></div>
            <div class="message-content">${formattedContent}</div>`;
        setTimeout(() => {
            const editBtn = messageElement.querySelector('.edit-message');
            if (editBtn) {
                editBtn.addEventListener('click', (e) => {
                    e.stopPropagation();
                    const input = document.getElementById('questionInput');
                    input.value = messageElement.getAttribute('data-original-text');
                    input.focus();
                    let current = messageElement;
                    while (current) { let next = current.nextElementSibling; current.remove(); current = next; }
                    saveChatHistory();
                });
            }
        }, 10);
    } else {
        messageElement.innerHTML = `
            <div class="message-controls"><button class="copy-to-clipboard" title="Copy to Clipboard"><svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24"><path fill="currentColor" d="M19 21H8V7h11m0-2H8c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h11c1.1 0 2-.9 2-2V7c0-1.1-.9-2-2-2m-3-4H4c-1.1 0-2 .9-2 2v14h2V3h12z"/></svg></button></div>
            <div class="message-content">${formattedContent}</div>`;
        setTimeout(() => {
            const copyBtn = messageElement.querySelector('.copy-to-clipboard');
            if (copyBtn) {
                copyBtn.addEventListener('click', (e) => {
                    e.stopPropagation();
                    navigator.clipboard.writeText(messageElement.getAttribute('data-original-text')).then(() => {
                        showChatNotification('Teks berhasil disalin!');
                        copyBtn.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24"><path fill="currentColor" d="M21 7L9 19l-5.5-5.5l1.41-1.41L9 16.17L19.59 5.59z"/></svg>`;
                        setTimeout(() => { copyBtn.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24"><path fill="currentColor" d="M19 21H8V7h11m0-2H8c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h11c1.1 0 2-.9 2-2V7c0-1.1-.9-2-2-2m-3-4H4c-1.1 0-2 .9-2 2v14h2V3h12z"/></svg>`; }, 2000);
                    });
                });
            }
        }, 10);
    }
    chatHistory.appendChild(messageElement);
    chatHistory.scrollTop = chatHistory.scrollHeight;
}

function showChatNotification(message) {
  const existingNotif = document.querySelector('.chat-notification');
  if (existingNotif) existingNotif.remove();
  const notificationElement = document.createElement('div');
  notificationElement.className = 'chat-notification';
  notificationElement.textContent = message;
  const chatHistory = document.getElementById('chatHistory');
  chatHistory.appendChild(notificationElement);
  chatHistory.scrollTop = chatHistory.scrollHeight;
  setTimeout(() => {
    notificationElement.classList.add('fade-out');
    setTimeout(() => notificationElement.remove(), 500);
  }, 2500);
}

function addChatbotStyles() {
  const styleElement = document.createElement('style');
  styleElement.innerHTML = `
    :root {
      --chatbot-bg: rgba(18, 18, 18, 0.8);
      --glass-bg: rgba(35, 35, 40, 0.7);
      --border-color: rgba(255, 255, 255, 0.1);
      --text-primary: #f0f0f0;
      --text-secondary: #a0a0a5;
      --accent-purple: #9333ea;
      --accent-cyan: #0891b2;
      --font-primary: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
      --font-mono: 'SF Mono', 'Fira Code', 'Fira Mono', 'Roboto Mono', monospace;
    }
    .chatbot-toggle {
        position: fixed; bottom: 24px; right: 20px; left: auto;
        width: 50px; height: 50px;
        background: linear-gradient(135deg, var(--accent-purple), var(--accent-cyan));
        border-radius: 50%; display: flex; align-items: center; justify-content: center;
        cursor: pointer; z-index: 9998;
        box-shadow: 0 0 25px var(--accent-purple);
        transition: all 0.3s ease;
    }
    .chatbot-toggle:hover { transform: scale(1.15) rotate(15deg); box-shadow: 0 0 40px var(--accent-cyan); }
    .chatbot-toggle img { width: 30px; height: 30px; }
    .chatbot-container {
        position: fixed; z-index: 9999; right: 20px; bottom: 85px; left: auto;
        width: 450px; height: 75vh; max-height: 700px;
        background: var(--chatbot-bg);
        border: 1px solid var(--border-color);
        backdrop-filter: blur(24px) saturate(180%);
        border-radius: 24px; overflow: hidden;
        box-shadow: 0 20px 60px rgba(0,0,0,0.5);
        display: flex; flex-direction: column;
        transition: all 0.4s cubic-bezier(0.25, 1, 0.5, 1);
        transform: none;
    }
    .chatbot-container.hidden { opacity: 0; transform: translateY(30px) scale(0.98); pointer-events: none; }
    .chatbot-header {
        padding: 16px 20px; background: rgba(0,0,0,0.25);
        display: flex; justify-content: space-between; align-items: center; flex-shrink: 0;
        border-bottom: 1px solid var(--border-color);
    }
    .chatbot-header h3 { margin: 0; font-size: 16px; font-weight: 600; color: var(--text-primary); }
    .chatbot-actions button { background: none; border: none; color: var(--text-secondary); cursor: pointer; padding: 4px; transition: all 0.2s; }
    .chatbot-actions button:hover { color: var(--accent-cyan); transform: scale(1.2); }
    .chat-history { flex: 1 1 auto; overflow-y: auto; padding: 20px; display: flex; flex-direction: column; gap: 16px; transition: height 0.2s ease-out; }
    .message { padding: 14px 20px; border-radius: 18px; line-height: 1.6; font-size: 14px; max-width: 85%; box-shadow: 0 4px 12px rgba(0,0,0,0.25); animation: messagePop 0.5s cubic-bezier(0.25, 1, 0.5, 1); position: relative; font-family: var(--font-primary); }
    @keyframes messagePop { from { transform: translateY(15px); opacity: 0; } to { transform: translateY(0); opacity: 1; } }
    .user-message { align-self: flex-end; background: linear-gradient(135deg, #4f46e5, #7c3aed); color: #fff; border-radius: 18px 4px 18px 18px; }
    .bot-message { align-self: flex-start; background: #27272a; color: var(--text-primary); border-radius: 4px 18px 18px 18px; }
    .message-controls { position: absolute; top: 50%; transform: translateY(-50%); display: flex; gap: 6px; opacity: 0; transition: opacity 0.2s; z-index: 10; }
    .message:hover .message-controls { opacity: 1; }
    .user-message .message-controls { left: -40px; }
    .bot-message .message-controls { right: -40px; }
    .message-controls button { background: rgba(50, 50, 50, 0.8); backdrop-filter: blur(5px); border: 1px solid var(--border-color); color: white; border-radius: 50%; width: 28px; height: 28px; cursor: pointer; display: flex; align-items: center; justify-content: center; transition: all 0.2s; }
    .message-controls button:hover { background: var(--accent-cyan); transform: scale(1.1); }
    .bot-message .message-content strong { color: var(--accent-cyan); font-weight: 600; }
    .bot-message .message-content ul, .bot-message .message-content ol { padding-left: 20px; }
    .bot-message pre { background-color: #111827; border-radius: 8px; padding: 12px; margin: 1em 0; overflow-x: auto; border: 1px solid var(--border-color); }
    .bot-message code { font-family: var(--font-mono); font-size: 13px; color: #d1d5db; }
    .bot-message .code-keyword { color: #c084fc; }
    .bot-message .code-string { color: #a5b4fc; }
    .bot-message .code-comment { color: #6b7280; font-style: italic; }
    .typing { padding: 18px 20px; }
    .typing-indicator { display: flex; align-items: center; gap: 5px; }
    .typing-indicator .typing-dot { width: 8px; height: 8px; border-radius: 50%; background-color: var(--text-secondary); animation: typing-bounce 1.4s infinite ease-in-out both; }
    .typing-dot:nth-child(1) { animation-delay: -0.32s; } .typing-dot:nth-child(2) { animation-delay: -0.16s; }
    @keyframes typing-bounce { 0%, 80%, 100% { transform: scale(0); } 40% { transform: scale(1.0); background-color: var(--accent-cyan); } }
    .chatbot-input-area-wrapper { flex-shrink: 0; padding: 10px 20px 20px 20px; border-top: 1px solid var(--border-color); background: rgba(0,0,0,0.25); }
    .template-buttons { display: flex; flex-wrap: wrap; gap: 6px; margin-bottom: 10px; }
    .template-buttons button { background: var(--glass-bg); border: 1px solid var(--border-color); color: var(--text-secondary); font-size: 11px; font-family: var(--font-primary); padding: 4px 10px; border-radius: 12px; cursor: pointer; transition: all 0.2s; }
    .template-buttons button:hover { background: var(--accent-purple); color: white; border-color: var(--accent-purple); }
    .chatbot-input-area { display: flex; gap: 10px; align-items: flex-end; }
    .chatbot-input-area textarea { flex-grow: 1; background: var(--glass-bg); border-radius: 16px; padding: 12px 16px; border: 1px solid var(--border-color); color: var(--text-primary); resize: none; font-family: var(--font-primary); font-size: 14px; transition: all 0.3s ease; max-height: 150px; }
    .chatbot-input-area textarea:focus { outline: none; border-color: var(--accent-cyan); box-shadow: 0 0 0 3px rgba(8, 145, 178, 0.4); }
    .input-buttons { display: flex; gap: 8px; align-items: center; }
    .input-buttons button { width: 44px; height: 44px; border-radius: 50%; border: none; cursor: pointer; display: flex; align-items: center; justify-content: center; background: linear-gradient(135deg, var(--accent-purple), var(--accent-cyan)); color: white; flex-shrink: 0; box-shadow: 0 4px 12px rgba(0,0,0,0.3); transition: all 0.2s; }
    .input-buttons button:hover { transform: scale(1.1); box-shadow: 0 6px 18px rgba(0,0,0,0.4); }
    .chat-notification { background: linear-gradient(135deg, var(--accent-purple), var(--accent-cyan)); color: white; padding: 10px 16px; border-radius: 8px; font-size: 13px; font-weight: 500; align-self: center; margin-bottom: 10px; animation: fadeInOut 3s ease forwards; }
    @keyframes fadeInOut { 0% { opacity: 0; transform: translateY(10px); } 10%, 90% { opacity: 1; transform: translateY(0); } 100% { opacity: 0; transform: translateY(-10px); } }

    @media (max-width: 600px) {
        .chatbot-container {
            width: 100%; height: 100%;
            top: 0; left: 0; right: 0; bottom: 0;
            border-radius: 0; max-height: 100%;
        }
        .chatbot-container.hidden { transform: translateY(100%); opacity: 1; }
        .chatbot-container.keyboard-mode {
             height: calc(100% - var(--keyboard-height, 0px));
        }
        .chatbot-toggle { bottom: 20px; right: 15px; }
    }
  `;
  document.head.appendChild(styleElement);
}

function createChatbotInterface(providedApiKey = null) {
  if (document.getElementById('geminiChatbot')) return;
  let apiKey = providedApiKey || (typeof getGeminiApiKey === 'function' ? getGeminiApiKey() : null);
  if (!apiKey) {
      if (typeof showApiKeyPopup === 'function') showApiKeyPopup();
      return;
  }
  const encodedApiKey = btoa(apiKey);
  const chatbotHtml = `
    <div id="geminiChatbotToggle" class="chatbot-toggle">
      <img src="https://raw.githubusercontent.com/Tarikul-Islam-Anik/Telegram-Animated-Emojis/main/Smileys/Robot.webp" alt="Robot" />
    </div>
    <div id="geminiChatbot" class="chatbot-container hidden">
      <div class="chatbot-header">
        <h3>Gemini Assistant</h3>
        <div class="chatbot-actions">
           <button id="refreshChatButton" title="Refresh Chat"><svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24"><path fill="currentColor" d="M17.65 6.35A7.958 7.958 0 0 0 12 4c-4.42 0-7.99 3.58-7.99 8s3.57 8 7.99 8c3.73 0 6.84-2.55 7.73-6h-2.08A5.99 5.99 0 0 1 12 18c-3.31 0-6-2.69-6-6s2.69-6 6-6c1.66 0 3.14.69 4.22 1.78L13 11h7V4z"/></svg></button>
          <button id="clearChatButton" title="Clear Chat"><svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24"><path fill="currentColor" d="M6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7H6zM19 4h-3.5l-1-1h-5l-1 1H5v2h14z"/></svg></button>
          <button id="closeChatButton" title="Close"><svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24"><path fill="currentColor" d="M19 6.41L17.59 5L12 10.59L6.41 5L5 6.41L10.59 12L5 17.59L6.41 19L12 13.41L17.59 19L19 17.59L13.41 12z"/></svg></button>
        </div>
      </div>
      <div id="chatHistory" class="chat-history"></div>
      <div class="chatbot-input-area-wrapper">
         <div class="template-buttons">
            <button data-prompt="Jelaskan secara singkat dan jelas">Singkat & Jelas</button>
            <button data-prompt="Jelaskan dalam 1 paragraf">1 Paragraf</button>
            <button data-prompt="Jawab pilihan ganda berikut hanya dengan huruf dan teks misal Jawaban yang benar adalah A. ..., dan beri penjelasan singkat ">Pilihan Ganda</button>
            <button data-prompt="Sebutkan 3 poin utama">3 Poin Utama</button>
        </div>
        <div class="chatbot-input-area">
          <textarea id="questionInput" placeholder="Tanyakan pada Gemini..." rows="1"></textarea>
          <div class="input-buttons">
              <button id="submitButton" title="Kirim"><svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24"><path fill="currentColor" d="M2.01 21L23 12L2.01 3L2 10l15 2l-15 2z"/></svg></button>
          </div>
        </div>
      </div>
    </div>`;
  const chatbotElement = document.createElement('div');
  chatbotElement.innerHTML = chatbotHtml;
  document.body.appendChild(chatbotElement);
  addChatbotStyles();
  setupChatbotEventListeners(encodedApiKey);
  loadChatHistory();
  const textarea = document.getElementById('questionInput');
  textarea.addEventListener('input', () => {
      textarea.style.height = 'auto';
      textarea.style.height = `${textarea.scrollHeight}px`;
  });
}

function addTypingIndicator() {
  const chatHistory = document.getElementById('chatHistory');
  const typingElement = document.createElement('div');
  typingElement.className = 'message bot-message typing';
  typingElement.innerHTML = `<div class="typing-indicator"><div class="typing-dot"></div><div class="typing-dot"></div><div class="typing-dot"></div></div>`;
  chatHistory.appendChild(typingElement);
  chatHistory.scrollTop = chatHistory.scrollHeight;
  return typingElement;
}

function loadChatHistory() {
  try {
    const chatHistory = document.getElementById('chatHistory');
    const savedHistory = localStorage.getItem('gemini_chat_history');
    if (savedHistory) {
      chatHistory.innerHTML = savedHistory;
      chatHistory.querySelectorAll('.message').forEach(message => {
        if (message.classList.contains('user-message')) {
            const editBtn = message.querySelector('.edit-message');
            if(editBtn) editBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                const input = document.getElementById('questionInput');
                input.value = message.getAttribute('data-original-text');
                input.focus();
                let current = message;
                while (current) { let next = current.nextElementSibling; current.remove(); current = next; }
                saveChatHistory();
            });
        } else {
            const copyBtn = message.querySelector('.copy-to-clipboard');
            if(copyBtn) copyBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                navigator.clipboard.writeText(message.getAttribute('data-original-text')).then(() => {
                    showChatNotification('Teks berhasil disalin!');
                    copyBtn.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24"><path fill="currentColor" d="M21 7L9 19l-5.5-5.5l1.41-1.41L9 16.17L19.59 5.59z"/></svg>`;
                    setTimeout(() => { copyBtn.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24"><path fill="currentColor" d="M19 21H8V7h11m0-2H8c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h11c1.1 0 2-.9 2-2V7c0-1.1-.9-2-2-2m-3-4H4c-1.1 0-2 .9-2 2v14h2V3h12z"/></svg>`; }, 2000);
                });
            });
        }
      });
    }
  } catch (e) { console.warn('Gagal memuat riwayat chat, localStorage mungkin tidak tersedia.'); }
}

function getPreviousMessages(limit = 6) {
  const chatHistory = document.getElementById('chatHistory');
  const messages = Array.from(chatHistory.querySelectorAll('.message:not(.typing)'));
  const history = [];
  for (let i = Math.max(0, messages.length - limit); i < messages.length; i++) {
    const el = messages[i];
    const role = el.classList.contains('user-message') ? 'user' : 'model';
    const content = el.getAttribute('data-original-text') || '';
    if (content) history.push({ role: role, parts: [{ text: content }] });
  }
  return history;
}

async function getAnswerFromGemini(apiKey, question) {
  const contents = [...getPreviousMessages(), { role: 'user', parts: [{ text: question }] }];
  const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash-latest:generateContent?key=${apiKey}`, {
    method: 'POST', headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ contents: contents, generationConfig: { temperature: 0.7, maxOutputTokens: 2048, topP: 0.95, topK: 40, } }),
  });
  const result = await response.json();
  if (result.error) throw new Error(`API error: ${result.error.message}`);
  return result.candidates[0].content.parts[0].text;
}

function saveChatHistory() {
  try {
    const chatHistory = document.getElementById('chatHistory');
    if (chatHistory) localStorage.setItem('gemini_chat_history', chatHistory.innerHTML);
  } catch (e) { console.warn('Gagal menyimpan riwayat chat, localStorage mungkin tidak tersedia.'); }
}

function setupChatbotEventListeners(encodedApiKey) {
    const chatbotToggle = document.getElementById('geminiChatbotToggle');
    const chatbot = document.getElementById('geminiChatbot');
    const closeChatButton = document.getElementById('closeChatButton');
    const clearChatButton = document.getElementById('clearChatButton');
    const refreshChatButton = document.getElementById('refreshChatButton');
    const questionInput = document.getElementById('questionInput');
    const submitButton = document.getElementById('submitButton');
    const templateButtons = document.querySelectorAll('.template-buttons button');
    if (!chatbotToggle || !chatbot) return;

    chatbotToggle.addEventListener('click', () => {
        const isOpeningGemini = chatbot.classList.contains('hidden');
        const tokenRunnerPopup = document.getElementById('token-runner-popup');
        if (isOpeningGemini) {
            if (tokenRunnerPopup) { tokenRunnerPopup.style.display = 'none'; tokenRunnerPopup.classList.add('collapsed'); }
        } else {
            if (tokenRunnerPopup) { tokenRunnerPopup.style.display = 'block'; }
        }
        chatbot.classList.toggle('hidden');
    });

    closeChatButton.addEventListener('click', () => {
        chatbot.classList.add('hidden');
        const tokenRunnerPopup = document.getElementById('token-runner-popup');
        if (tokenRunnerPopup) { tokenRunnerPopup.style.display = 'block'; }
    });

    clearChatButton.addEventListener('click', () => { document.getElementById('chatHistory').innerHTML = ''; saveChatHistory(); showChatNotification('Riwayat chat dihapus!'); });
    refreshChatButton.addEventListener('click', () => { document.getElementById('chatHistory').innerHTML = ''; saveChatHistory(); showChatNotification('Chat dimulai ulang!'); });
    
    templateButtons.forEach(button => {
        button.addEventListener('click', () => {
            const template = button.getAttribute('data-prompt');
            questionInput.value = `${template}:\n`;
            questionInput.focus();
        });
    });

    const submitFunction = async () => {
        const question = questionInput.value.trim();
        if (!question) return;
        addMessageToChat('user', question);
        questionInput.value = '';
        questionInput.style.height = 'auto';
        const typingIndicator = addTypingIndicator();
        try {
            const apiKey = atob(encodedApiKey);
            const answer = await getAnswerFromGemini(apiKey, question);
            typingIndicator.remove();
            addMessageToChat('bot', answer);
        } catch (error) {
            typingIndicator.remove();
            addMessageToChat('bot', `Maaf, terjadi kesalahan: ${error.message}`);
        }
        saveChatHistory();
    };

    submitButton.addEventListener('click', submitFunction);
    questionInput.addEventListener('keydown', (e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); submitFunction(); } });
    questionInput.addEventListener('focus', () => {
        if (window.innerWidth <= 600) {
            document.documentElement.style.setProperty('--keyboard-height', '50vh'); // Asumsi tinggi keyboard
            chatbot.classList.add('keyboard-mode');
        }
    });

    questionInput.addEventListener('blur', () => {
        if (window.innerWidth <= 600) {
            document.documentElement.style.setProperty('--keyboard-height', '0px');
            chatbot.classList.remove('keyboard-mode');
        }
    });
}

function initChatbot() {
  let isGeminiEnabled = true;
  try {
    const enabled = localStorage.getItem('gemini_enabled');
    if (enabled === null) localStorage.setItem('gemini_enabled', 'true');
    else isGeminiEnabled = enabled === 'true';
  } catch (e) { console.warn('Gagal mengakses localStorage.'); }
  
  if (!isGeminiEnabled) {
    const existingUI = document.getElementById('geminiChatbotToggle')?.parentElement;
    if (existingUI) existingUI.remove();
    return;
  }
  if (!document.getElementById('geminiChatbot')) {
    createChatbotInterface();
  }
}

(function initializeGemini() {
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initChatbot);
  } else {
    initChatbot();
  }
})();

window.addEventListener('storage', (e) => { if (e.key === 'gemini_enabled') initChatbot(); });
