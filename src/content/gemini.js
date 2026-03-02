/**
 * MENTARI MOD - Gemini Chatbot Module
 * Redesigned & Refactored to Modular Structure (MUI-Style)
 */

(function () {
  const Config = {
    GEMINI: {
      MODEL: "gemini-2.5-flash-lite", // Stable & Moderate rate limit
      ENDPOINT: "https://generativelanguage.googleapis.com/v1beta/models",
      SYSTEM_PROMPT: `Kamu adalah asisten akademik UNPAM. 
Aturan Jawab:
- LANGSUNG KE INTI JAWABAN. Jangan bertele-tele atau terlalu banyak basa-basi di awal.
- Gunakan bahasa profesional tapi kasual.
- Jika soal pilihan ganda, berikan jawaban tepat (huruf) dan alasan 1-2 kalimat saja.
- Jangan gunakan markdown tebal/miring (** atau __).
- Gunakan angka (1. 2.) untuk daftar.`,
    },
    STORAGE_KEYS: {
      CHAT_HISTORY: "gemini_chat_history_v2",
      GEMINI_ENABLED: "gemini_enabled",
      API_KEY: "gemini_api_key",
    },
    TEMPLATES: [
      { label: "Analisis Soal", text: "Tolong analisis soal ini dan berikan jawaban yang paling tepat beserta penjelasannya:\n\n" },
      { label: "Ringkas Materi", text: "Tolong ringkas materi berikut agar lebih mudah dipahami:\n\n" },
      { label: "Buat Forum", text: "Buatlah jawaban forum yang berbobot dan sopan untuk topik berikut:\n\n" },
      { label: "Sapa", text: "Halo Gemini! Bantu saya belajar hari ini ya." }
    ],
    STYLES: `
      #gemini-chat-container {
        position: fixed; bottom: 20px; right: 20px; width: 400px; height: 600px;
        background: rgba(18, 18, 18, 0.95); backdrop-filter: blur(20px);
        border: 1px solid rgba(255,255,255,0.1); border-radius: 16px;
        box-shadow: 0 10px 40px rgba(0,0,0,0.5); display: flex; flex-direction: column;
        z-index: 99999; overflow: hidden; transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
        display: none; font-family: 'Roboto', 'Inter', sans-serif;
      }
      #gemini-chat-container.active { display: flex; transform: translateY(0); opacity: 1; }
      
      .chat-header {
        padding: 12px 16px; background: rgba(255,255,255,0.03);
        border-bottom: 1px solid rgba(255,255,255,0.08);
        display: flex; justify-content: space-between; align-items: center; cursor: move;
      }
      .chat-title { display: flex; align-items: center; gap: 8px; font-weight: 700; color: #f0872d; font-size: 14px; }
      .chat-actions { display: flex; gap: 4px; }
      .chat-action-btn { 
        background: none; border: none; color: #777; cursor: pointer; padding: 4px; 
        border-radius: 50%; transition: all 0.2s; display: flex;
      }
      .chat-action-btn:hover { background: rgba(255,255,255,0.1); color: #fff; }

      .chat-history {
        flex: 1; overflow-y: auto; padding: 16px; display: flex; flex-direction: column; gap: 16px;
      }
      .chat-history::-webkit-scrollbar { width: 2px; }
      .chat-history::-webkit-scrollbar-thumb { background: rgba(240, 135, 45, 0.3); border-radius: 10px; }

      .msg-bubble {
        max-width: 85%; padding: 10px 14px; border-radius: 12px; font-size: 13px; line-height: 1.6;
        position: relative; animation: msgIn 0.3s ease-out;
      }
      @keyframes msgIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
      
      .msg-user { align-self: flex-end; background: #f0872d; color: #fff; border-radius: 12px 12px 0 12px; }
      .msg-bot { align-self: flex-start; background: rgba(255,255,255,0.05); color: #eee; border-radius: 12px 12px 12px 0; border: 1px solid rgba(255,255,255,0.08); }
      
      .msg-controls {
        position: absolute; top: -10px; right: 0; display: flex; gap: 4px; opacity: 0; transition: opacity 0.2s;
      }
      .msg-bubble:hover .msg-controls { opacity: 1; }
      .msg-control-btn {
        background: #1a1a1a; border: 1px solid #333; color: #aaa; border-radius: 4px; padding: 2px;
        cursor: pointer; display: flex;
      }
      .msg-control-btn:hover { background: #333; color: #fff; }

      .template-area {
        padding: 8px 12px; display: flex; gap: 6px; overflow-x: auto; flex-shrink: 0;
        border-top: 1px solid rgba(255,255,255,0.05); background: rgba(0,0,0,0.1);
      }
      .template-area::-webkit-scrollbar { height: 0; }
      .chip {
        padding: 4px 10px; background: rgba(255,255,255,0.05); border: 1px solid rgba(255,255,255,0.1);
        border-radius: 14px; font-size: 11px; color: #aaa; cursor: pointer; white-space: nowrap; transition: all 0.2s;
      }
      .chip:hover { background: rgba(240, 135, 45, 0.15); border-color: #f0872d; color: #f0872d; }

      .chat-input-area {
        padding: 12px; background: rgba(255,255,255,0.03); border-top: 1px solid rgba(255,255,255,0.08);
        display: flex; gap: 10px; align-items: flex-end;
      }
      .chat-textarea {
        flex: 1; background: rgba(255,255,255,0.05); border: 1px solid rgba(255,255,255,0.1);
        border-radius: 10px; padding: 10px; color: #fff; font-size: 13px; resize: none;
        max-height: 250px; transition: border-color 0.2s;
      }
      .chat-textarea::-webkit-scrollbar { width: 2px; }
      .chat-textarea::-webkit-scrollbar-thumb { background: rgba(240, 135, 45, 0.2); }
      .chat-textarea:focus { outline: none; border-color: #f0872d; }
      .send-btn {
        width: 36px; height: 36px; border-radius: 10px; background: #f0872d; border: none;
        color: white; cursor: pointer; display: flex; align-items: center; justify-content: center;
        transition: transform 0.2s;
      }
      .send-btn:hover { transform: scale(1.05); background: #e0761d; }
      .send-btn:disabled { background: #444; cursor: not-allowed; }

      /* Toggle Button */
      #gemini-chat-container {
        position: fixed; top: 70px; right: 20px; width: 420px; height: 600px;
        background: rgba(18, 18, 18, 0.98); backdrop-filter: blur(25px);
        border: 1px solid rgba(255,255,255,0.1); border-radius: 12px;
        box-shadow: 0 15px 50px rgba(0,0,0,0.6); display: flex; flex-direction: column;
        z-index: 99999; overflow: hidden; transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
        visibility: hidden; opacity: 0; transform: translateY(-15px) scale(0.95);
        pointer-events: none; font-family: 'Roboto', 'Inter', sans-serif;
      }
      #gemini-chat-container.active { visibility: visible; opacity: 1; transform: translateY(0) scale(1); pointer-events: auto; }
      
      /* Header Toggle (MUI Style) */
      #gemini-toggle {
        display: inline-flex; align-items: center; justify-content: center;
        width: 40px; height: 40px; border-radius: 50%; border: none;
        background: transparent; color: #f0872d; cursor: pointer;
        transition: background-color 150ms cubic-bezier(0.4, 0, 0.2, 1);
        outline: none; margin-right: 4px;
      }
      #gemini-toggle:hover { background-color: rgba(240, 135, 45, 0.08); }
      #gemini-toggle .ms { font-size: 24px; }

      @media (max-width: 600px) {
        #gemini-chat-container { width: 100%!important; left: 0!important; right: 0!important; border-radius: 0!important; height: 90vh!important; top: 50px!important; transform: translateX(100%)!important; }
        #gemini-chat-container.active { transform: translateX(0)!important; }
      }
      
      .typing { display: flex; gap: 4px; padding: 8px 0; }
      .dot { width: 6px; height: 6px; background: #f0872d; border-radius: 50%; animation: bounce 1.4s infinite ease-in-out; }
      .dot:nth-child(2) { animation-delay: 0.2s; }
      .dot:nth-child(3) { animation-delay: 0.4s; }
      @keyframes bounce { 0%, 80%, 100% { transform: scale(0); } 40% { transform: scale(1.0); } }
      
      .ms { font-family: 'Material Symbols Rounded'; font-size: 18px; font-style: normal; font-weight: normal; line-height: 1; display: inline-flex; align-items: center; vertical-align: middle; }
    `
  };

  const Utils = {
    save(key, val) { try { localStorage.setItem(key, JSON.stringify(val)); } catch (e) {} },
    get(key) { try { const v = localStorage.getItem(key); return v ? JSON.parse(v) : null; } catch (e) { return null; } },
    formatText(t) { return t.replace(/\n/g, "<br>").replace(/<(?!br\s*\/?>)[^>]+>/g, ""); },
    showToast(msg) {
      const t = document.createElement("div");
      t.style = "position:fixed;bottom:80px;right:20px;background:#f0872d;color:#fff;padding:8px 16px;border-radius:8px;font-size:12px;z-index:100000;animation:msgIn 0.3s;";
      t.textContent = msg; document.body.appendChild(t); setTimeout(() => t.remove(), 2500);
    },
    injectMaterialIcons() {
      if (document.getElementById("ms-chat-icons")) return;
      const l = document.createElement("link"); l.id = "ms-chat-icons";
      l.rel = "stylesheet"; l.href = "https://fonts.googleapis.com/css2?family=Material+Symbols+Rounded:opsz,wght,FILL,GRAD@20,400,1,0";
      document.head.appendChild(l);
    }
  };

  const ApiService = {
    async askGemini(question, history = []) {
      let apiKey = localStorage.getItem("geminiApiKey");
      if (apiKey) apiKey = atob(apiKey);
      
      if (!apiKey) throw new Error("API Key belum diset. Selesaikan di menu Setting.");

      let model = localStorage.getItem("gemini_model") || "gemini-2.5-flash-lite";
      if (model.includes('"')) model = JSON.parse(model);
      
      let context = history.map(h => `${h.sender === "user" ? "User" : "Gemini"}: ${h.text}`).join("\n");
      const fullPrompt = `${Config.GEMINI.SYSTEM_PROMPT}\n\nRiwayat Percakapan:\n${context}\n\nUser: ${question}`;

      const res = await fetch(`${Config.GEMINI.ENDPOINT}/${model}:generateContent?key=${apiKey}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [{ parts: [{ text: fullPrompt }] }],
          generationConfig: { temperature: 0.3, maxOutputTokens: 2048, topP: 0.8 },
          safetySettings: [
            { category: "HARM_CATEGORY_HARASSMENT", threshold: "BLOCK_MEDIUM_AND_ABOVE" },
            { category: "HARM_CATEGORY_HATE_SPEECH", threshold: "BLOCK_MEDIUM_AND_ABOVE" },
            { category: "HARM_CATEGORY_SEXUALLY_EXPLICIT", threshold: "BLOCK_MEDIUM_AND_ABOVE" },
            { category: "HARM_CATEGORY_DANGEROUS_CONTENT", threshold: "BLOCK_MEDIUM_AND_ABOVE" }
          ]
        })
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error?.message || "Gagal menghubungi Gemini");
      }

      const data = await res.json();
      return data.candidates?.[0]?.content?.parts?.[0]?.text || "Maaf, saya tidak bisa mejawab itu.";
    }
  };

  const UIRenderer = {
    injectStyles() {
      const s = document.createElement("style");
      s.textContent = Config.STYLES; document.head.appendChild(s);
    },

    createInterface() {
      if (document.getElementById("gemini-chat-container")) return;

      // Container Popup (Chat Interface)
      const container = document.createElement("div");
      container.id = "gemini-chat-container";
      container.innerHTML = `
        <div class="chat-header" style="background: rgba(255,255,255,0.02); border-bottom: 1px solid rgba(255,255,255,0.06); padding: 16px;">
          <div class="chat-title" style="background: linear-gradient(90deg, #f0872d, #ffb36b); -webkit-background-clip: text; -webkit-text-fill-color: transparent; font-weight: 800; font-size: 16px;">
            <span class="ms" style="color:#f0872d; -webkit-text-fill-color: #f0872d;">auto_awesome</span> Gemini Assistant
          </div>
          <div class="chat-actions">
            <button class="chat-action-btn" id="chat-grab-btn" title="Ambil Soal"><span class="ms">content_paste_search</span></button>
            <button class="chat-action-btn" id="chat-clear-btn" title="Hapus Chat"><span class="ms">delete_sweep</span></button>
            <button class="chat-action-btn" id="chat-close-btn"><span class="ms">close</span></button>
          </div>
        </div>
        <div class="chat-history" id="gemini-chat-history"></div>
        <div class="template-area" id="template-area">
          ${Config.TEMPLATES.map(t => `<div class="chip" data-text="${t.text}">${t.label}</div>`).join('')}
        </div>
        <div class="chat-input-area" style="background: rgba(255,255,255,0.02);">
          <textarea class="chat-textarea" placeholder="Tanya apa saja..." rows="1"></textarea>
          <button class="send-btn" id="gemini-send-btn"><span class="ms">send</span></button>
        </div>
      `;
      document.body.appendChild(container);

      // Function to inject button into header
      const injectToggleButton = () => {
        if (document.getElementById("gemini-toggle")) return;
        const mentariToggle = document.getElementById("mentari-header-toggle");
        if (mentariToggle && mentariToggle.parentNode) {
          const toggle = document.createElement("button");
          toggle.id = "gemini-toggle";
          toggle.title = "Buka Gemini AI Assistant";
          toggle.innerHTML = `<span class="ms">auto_awesome</span><span class="MuiTouchRipple-root"></span>`;
          mentariToggle.parentNode.insertBefore(toggle, mentariToggle);
          this.initEvents(toggle, container);
        }
      };

      // Periodic check for header
      setInterval(injectToggleButton, 1000);
      injectToggleButton();
    },

    initEvents(toggle, container) {
      toggle.onclick = (e) => {
        e.stopPropagation();
        container.classList.toggle("active");
        if (container.classList.contains("active")) {
          setTimeout(() => container.querySelector(".chat-textarea").focus(), 300);
        }
      };
      
      document.getElementById("chat-close-btn").onclick = (e) => {
        e.stopPropagation();
        container.classList.remove("active");
      };
      
      const textarea = container.querySelector(".chat-textarea");
      textarea.addEventListener("input", function() {
        this.style.height = 'auto';
        this.style.height = (this.scrollHeight) + 'px';
      });

      document.getElementById("gemini-send-btn").onclick = (e) => { e.stopPropagation(); App.handleSend(); };
      document.getElementById("chat-grab-btn").onclick = (e) => { e.stopPropagation(); App.grabPageContent(); };
      
      textarea.onkeydown = (e) => {
        if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); App.handleSend(); }
      };

      document.getElementById("chat-clear-btn").onclick = (e) => { e.stopPropagation(); App.clearHistory(); };

      // Templates
      container.querySelectorAll(".chip").forEach(chip => {
        chip.onclick = (e) => {
          e.stopPropagation();
          textarea.value = chip.dataset.text;
          textarea.focus();
          textarea.style.height = (textarea.scrollHeight) + 'px';
        };
      });

      // Prevent closing when clicking inside popup
      container.onclick = (e) => e.stopPropagation();
    },

    makeDraggable(el, handle) {
      let isDragging = false, ox, oy;
      handle.onmousedown = (e) => {
        if (e.target.closest('button')) return;
        isDragging = true;
        ox = e.clientX - el.offsetLeft; oy = e.clientY - el.offsetTop;
        document.onmousemove = drag;
        document.onmouseup = () => { isDragging = false; document.onmousemove = null; };
      };
      function drag(e) {
        if (!isDragging) return;
        el.style.left = (e.clientX - ox) + "px";
        el.style.top = (e.clientY - oy) + "px";
        el.style.bottom = "auto"; el.style.right = "auto";
      }
    },

    renderMessage(sender, text, history) {
      const chatHistory = document.getElementById("gemini-chat-history");
      const bubble = document.createElement("div");
      bubble.className = `msg-bubble msg-${sender}`;
      bubble.innerHTML = `
        <div class="msg-content">${Utils.formatText(text)}</div>
        <div class="msg-controls">
          <button class="msg-control-btn copy-clip" title="Salin Clipboard"><span class="ms">content_copy</span></button>
          ${sender === "bot" ? '<button class="msg-control-btn copy-input" title="Salin ke Textarea Mentari"><span class="ms">input</span></button>' : '<button class="msg-control-btn edit-msg" title="Edit"><span class="ms">edit</span></button>'}
        </div>
      `;

      // Copy Clip
      bubble.querySelector(".copy-clip").onclick = () => {
        navigator.clipboard.writeText(text).then(() => Utils.showToast("Berhasil disalin!"));
      };

      // Copy Input (Mentari Textarea)
      if (sender === "bot") {
        bubble.querySelector(".copy-input").onclick = () => {
          const mentariInput = document.querySelector(".MuiInputBase-input.MuiOutlinedInput-input.MuiInputBase-inputMultiline:not([readonly])");
          if (mentariInput) {
            mentariInput.value = text;
            mentariInput.dispatchEvent(new Event("input", { bubbles: true }));
            Utils.showToast("Berhasil disalin ke Mentari!");
          } else {
            Utils.showToast("Textarea e-learning tidak ditemukan.");
          }
        };
      } else {
        // Edit User Msg
        bubble.querySelector(".edit-msg").onclick = () => {
          const textarea = document.querySelector(".chat-textarea");
          textarea.value = text;
          textarea.focus();
          // Remove this message and all after it
          let current = bubble;
          while (current) {
            let next = current.nextElementSibling;
            current.remove();
            current = next;
          }
          App.syncHistoryFromDOM();
        };
      }

      chatHistory.appendChild(bubble);
      chatHistory.scrollTop = chatHistory.scrollHeight;
    },

    showTyping() {
      const chatHistory = document.getElementById("gemini-chat-history");
      const t = document.createElement("div");
      t.id = "gemini-typing-indicator";
      t.className = "typing";
      t.innerHTML = `<div class="dot"></div><div class="dot"></div><div class="dot"></div>`;
      chatHistory.appendChild(t);
      chatHistory.scrollTop = chatHistory.scrollHeight;
      return t;
    }
  };

  const App = {
    history: [],

    init() {
      const enabled = localStorage.getItem(Config.STORAGE_KEYS.GEMINI_ENABLED) === "true";
      if (!enabled) return;

      Utils.injectMaterialIcons();
      UIRenderer.injectStyles();
      UIRenderer.createInterface();
      this.loadHistory();
    },

    loadHistory() {
      const saved = Utils.get(Config.STORAGE_KEYS.CHAT_HISTORY);
      if (saved && Array.isArray(saved)) {
        this.history = saved;
        this.history.forEach(h => UIRenderer.renderMessage(h.sender, h.text));
      }
    },

    saveHistory() {
      Utils.save(Config.STORAGE_KEYS.CHAT_HISTORY, this.history);
    },

    syncHistoryFromDOM() {
      const messages = document.querySelectorAll(".msg-bubble");
      this.history = Array.from(messages).map(m => ({
        sender: m.classList.contains("msg-user") ? "user" : "bot",
        text: m.querySelector(".msg-content").innerText.replace(/<br>/g, "\n")
      }));
      this.saveHistory();
    },

    async handleSend() {
      const textarea = document.querySelector(".chat-textarea");
      const btn = document.getElementById("gemini-send-btn");
      const question = textarea.value.trim();
      
      if (!question || btn.disabled) return;

      textarea.value = "";
      textarea.style.height = "auto";
      
      // Render User
      UIRenderer.renderMessage("user", question);
      this.history.push({ sender: "user", text: question });
      this.saveHistory();

      // Loading
      btn.disabled = true;
      const loader = UIRenderer.showTyping();

      try {
        const answer = await ApiService.askGemini(question, this.history.slice(0, -1));
        loader.remove();
        UIRenderer.renderMessage("bot", answer);
        this.history.push({ sender: "bot", text: answer });
        this.saveHistory();
      } catch (err) {
        loader.remove();
        UIRenderer.renderMessage("bot", "⚠️ Error: " + err.message);
      } finally {
        btn.disabled = false;
      }
    },

    grabPageContent() {
      // Prioritas 1: Forum/Diskusi Dosen (Mentari selectors)
      const forumContent = document.querySelector(".MuiBox-root.css-19kzrtu, .css-19kzrtu");
      // Prioritas 2: Soal Quiz/Tugas yang sedang tampil
      const quizContent = document.querySelector(".MuiTypography-root.css-1vscvve");
      
      let text = "";
      if (forumContent) text = forumContent.innerText;
      else if (quizContent) text = quizContent.innerText;
      else {
        // Fallback: cari area teks besar di MuiPaper yang paling mungkin adalah soal
        const boxes = document.querySelectorAll(".MuiPaper-root");
        for (const box of boxes) {
          if (box.innerText.trim().length > 30 && box.innerText.length < 3000) {
            // Jika ada MuiBox di dalamnya (konten inti), ambil itu saja
            const inner = box.querySelector(".MuiBox-root");
            text = inner ? inner.innerText : box.innerText;
            if (text.length > 50) break; 
          }
        }
      }

      if (text) {
        const lines = text.split('\n').map(l => l.trim()).filter(l => l.length > 0);
        
        // Pembersihan metadata (Nama, Tanggal, Jam, Label)
        const cleanedLines = lines.filter((line, idx) => {
          const lower = line.toLowerCase();
          // Skip info pengirim di 3 baris pertama (biasanya Nama Dosen)
          if (idx < 3 && line.split(' ').length <= 4 && !line.includes('?')) return false;

          const isInfo = lower.includes("dosen :") || 
                         lower.includes("mahasiswa :") || 
                         lower.includes("terakhir diubah") ||
                         /\d{2}:\d{2}/.test(line) || // Jam
                         /\d{2}\s+(jan|feb|mar|apr|mei|jun|jul|agu|sep|okt|nov|des)/i.test(line); // Tanggal
          return !isInfo;
        });

        const cleaned = cleanedLines.join('\n').trim();
        const textarea = document.querySelector(".chat-textarea");
        textarea.value = `Jawab soal ini dengan singkat:\n\n${cleaned}`;
        textarea.focus();
        textarea.style.height = 'auto';
        textarea.style.height = (textarea.scrollHeight) + 'px';
        Utils.showToast("Soal berhasil diambil!");
      } else {
        Utils.showToast("Gagal mendeteksi soal.");
      }
    },

    clearHistory() {
      if (confirm("Hapus semua riwayat percakapan?")) {
        this.history = [];
        this.saveHistory();
        document.getElementById("gemini-chat-history").innerHTML = "";
      }
    }
  };

  // Run
  App.init();

  // Listen for settings change
  window.addEventListener("storage", (e) => {
    if (e.key === Config.STORAGE_KEYS.GEMINI_ENABLED) {
      if (e.newValue === "true") location.reload();
      else {
        document.getElementById("gemini-toggle")?.remove();
        document.getElementById("gemini-chat-container")?.remove();
      }
    }
  });

})();
