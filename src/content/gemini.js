/**
 * MENTARI MOD - Gemini Chatbot Module
 * Redesigned & Refactored to Modular Structure (MUI-Style)
 */

(function () {
  const Config = {
    GEMINI: {
      MODEL: "gemini-2.0-flash", // Default model
      ENDPOINT: "https://generativelanguage.googleapis.com/v1beta/models",
      generationConfig: { temperature: 0.3, maxOutputTokens: 2048, topP: 0.8 },
      SYSTEM_PROMPT: `Kamu adalah asisten akademik UNPAM. 
Aturan Jawab Dasar:
- LANGSUNG KE INTI JAWABAN. Jangan bertele-tele.
- Gunakan bahasa profesional tapi kasual.
- Jika soal pilihan ganda, berikan jawaban tepat (huruf) dan alasan ringkas.
- DILARANG MENGGUNAKAN SIMBOL MARKDOWN: Jangan gunakan tanda seperti **, #, ##, atau \`\`\`.
- DILARANG BOLD/TEBAL: Jangan gunakan format teks tebal (bold) dalam bentuk apapun.
- Berikan jawaban dalam bentuk teks polos (plain text) yang bersih.`,
      COMMANDS: {
        "ringkas": "Jawab dengan sangat singkat, padat, dan langsung ke inti (to the point).",
        "natural": "Gunakan gaya bahasa yang sangat natural, luwes, dan tidak kaku seperti robot.",
        "point": "Sajikan jawaban dalam bentuk poin-poin (bullet-points) agar mudah dipahami.",
        "jelas": "Berikan penjelasan yang sangat detail, komprehensif, dan mendalam.",
        "tidak baku": "Gunakan gaya bahasa santai dan non-formal (seperti bahasa sehari-hari yang sopan).",
        "human": "Pastikan gaya tulisan terasa seperti ditulis oleh manusia asli (hindari pola AI standar)."
      }
    },
    STORAGE_KEYS: {
      CHAT_HISTORY: "gemini_chat_history_v2",
      GEMINI_ENABLED: "gemini_enabled",
      API_KEY: "gemini_api_key",
    },
    QUICK_COMMANDS: [
      { id: "ringkas", label: "Ringkas" },
      { id: "natural", label: "Natural" },
      { id: "point", label: "Point" },
      { id: "jelas", label: "Jelas" },
      { id: "tidak baku", label: "Tidak Baku" },
      { id: "human", label: "Human" }
    ],
    STYLES: `
      #gemini-chat-container {
        position: fixed; top: 70px; right: 20px; width: 500px; height: 600px;
        background: #121212; backdrop-filter: blur(25px);
        border: 1px solid rgba(255,255,255,0.1); border-radius: 12px;
        box-shadow: 0 15px 50px rgba(0,0,0,0.4); display: flex; flex-direction: column;
        z-index: 99999; overflow: hidden; transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
        visibility: hidden; opacity: 0; transform: translateY(-15px) scale(0.95);
        pointer-events: none; font-family: 'Roboto', 'Helvetica', 'Arial', sans-serif;
      }
      #gemini-chat-container.active { visibility: visible; opacity: 1; transform: translateY(0) scale(1); pointer-events: auto; }
      
      /* Light Theme Adaptation */
      #gemini-chat-container.light-theme {
        background: #ffffff; 
        border: 1px solid rgba(0,0,0,0.12);
        box-shadow: 0 8px 32px rgba(0,0,0,0.08);
      }
      #gemini-chat-container.light-theme .chat-header {
        background: #f8f9fa;
        border-bottom-color: rgba(0,0,0,0.08);
      }
      #gemini-chat-container.light-theme .chat-title {
        color: #0d47a1;
      }
      #gemini-chat-container.light-theme .msg-bot {
        background: #f1f5f9;
        border-color: rgba(0,0,0,0.05);
        color: #1a1c1e;
      }
      #gemini-chat-container.light-theme .msg-user {
        background: #1976d2;
      }
      #gemini-chat-container.light-theme .template-area {
        background: #f8f9fa;
        border-top-color: rgba(0,0,0,0.05);
      }
      #gemini-chat-container.light-theme .chip {
        background: #fff;
        border-color: rgba(0,0,0,0.1);
        color: #4a5568;
      }
      #gemini-chat-container.light-theme .chip.active {
        background: rgba(25, 118, 210, 0.1);
        border-color: #1976d2;
        color: #1976d2;
      }
      #gemini-chat-container.light-theme .chat-input-area {
        background: #f8f9fa;
        border-top-color: rgba(0,0,0,0.08);
      }
      #gemini-chat-container.light-theme .chat-textarea {
        background: #fff;
        border-color: rgba(0,0,0,0.1);
        color: #1a1c1e;
      }

      .chat-header {
        padding: 16px; background: rgba(255,255,255,0.02);
        border-bottom: 1px solid rgba(255,255,255,0.06);
        display: flex; justify-content: space-between; align-items: center; cursor: move;
      }
      .chat-title { display: flex; align-items: center; gap: 8px; font-weight: 700; color: #3d99e3; font-size: 14px; }
      .chat-actions { display: flex; gap: 4px; }
      .chat-action-btn { 
        background: none; border: none; color: #777; cursor: pointer; padding: 4px; 
        border-radius: 50%; transition: all 0.2s; display: flex;
      }
      .chat-action-btn:hover { background: rgba(255,255,255,0.1); color: #fff; }
      #chat-grab-btn { color: #f0872d; }
      #chat-grab-btn:hover { background: rgba(240, 135, 45, 0.1); }

      .chat-history {
        flex: 1; overflow-y: auto; padding: 16px; display: flex; flex-direction: column; gap: 16px;
      }
      .chat-history::-webkit-scrollbar { width: 4px; }
      .chat-history::-webkit-scrollbar-thumb { background: rgba(144, 202, 249, 0.3); border-radius: 10px; }

      .msg-bubble {
        max-width: 85%; padding: 10px 14px; border-radius: 12px; font-size: 13px; line-height: 1.6;
        position: relative; animation: msgIn 0.3s ease-out;
        word-break: break-word; overflow-wrap: break-word;
      }
      @keyframes msgIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
      
      .msg-user { align-self: flex-end; background: #3d99e3; color: #fff; border-radius: 12px 12px 0 12px; }
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
        padding: 8px 12px; display: flex; flex-wrap: wrap; gap: 6px; flex-shrink: 0;
        border-top: 1px solid rgba(255,255,255,0.05); background: rgba(0,0,0,0.1);
      }
      .template-area::-webkit-scrollbar { height: 0; }
      .chip {
        padding: 4px 12px; background: rgba(255,255,255,0.03); border: 1px solid rgba(255,255,255,0.08);
        border-radius: 14px; font-size: 11px; color: #888; cursor: pointer; white-space: nowrap; transition: all 0.2s;
        display: flex; align-items: center; gap: 5px;
      }
      .chip:hover { border-color: rgba(144, 202, 249, 0.4); color: #ccc; }
      .chip.active { background: rgba(144, 202, 249, 0.15); border-color: #3d99e3; color: #3d99e3; font-weight: 700; }
      .chip.active::before { content: '✓'; font-size: 10px; }

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
      .chat-textarea::-webkit-scrollbar-thumb { background: rgba(144, 202, 249, 0.2); }
      .chat-textarea:focus { outline: none; border-color: #3d99e3; }
      .send-btn {
        width: 36px; height: 36px; border-radius: 10px; background: #3d99e3; border: none;
        color: white; cursor: pointer; display: flex; align-items: center; justify-content: center;
        transition: transform 0.2s;
      }
      .send-btn:hover { transform: scale(1.05); background: #1976d2; }
      .send-btn:disabled { background: #444; cursor: not-allowed; }

      #gemini-toggle {
        display: inline-flex; align-items: center; justify-content: center;
        width: 40px; height: 40px; border-radius: 50%; border: none;
        background: transparent; cursor: pointer;
        transition: background-color 150ms cubic-bezier(0.4, 0, 0.2, 1);
        outline: none; margin-right: 4px;
      }
      #gemini-toggle .ms { 
        font-size: 20px;
        background: linear-gradient(135deg, rgba(211, 113, 250, 1) 0%, #00b7ffff 100%);
        -webkit-background-clip: text;
        -webkit-text-fill-color: transparent;
      }
      #gemini-toggle:hover { background-color: rgba(37, 117, 252, 0.08); }

      .glow-ai {
        background: linear-gradient(135deg, rgba(211, 113, 250, 1) 0%, #00b7ffff 100%);
        -webkit-background-clip: text;
        -webkit-text-fill-color: transparent;
      }

      @media (max-width: 600px) {
        #gemini-chat-container { width: 100%!important; left: 0!important; right: 0!important; border-radius: 0!important; height: 90vh!important; top: 50px!important; transform: translateX(100%)!important; }
        #gemini-chat-container.active { transform: translateX(0)!important; }
      }
      
      .typing { display: flex; gap: 4px; padding: 8px 0; }
      .dot { width: 6px; height: 6px; background: #3d99e3; border-radius: 50%; animation: bounce 1.4s infinite ease-in-out; }
      .dot:nth-child(2) { animation-delay: 0.2s; }
      .dot:nth-child(3) { animation-delay: 0.4s; }
      @keyframes bounce { 0%, 80%, 100% { transform: scale(0); } 40% { transform: scale(1.0); } }
      
      .ms { font-family: 'Material Symbols Rounded'; font-size: 18px; font-style: normal; font-weight: normal; line-height: 1; display: inline-flex; align-items: center; vertical-align: middle; }
    `
  };

  const Utils = {
    save(key, val) { try { localStorage.setItem(key, JSON.stringify(val)); } catch (e) {} },
    get(key) { try { const v = localStorage.getItem(key); return v ? JSON.parse(v) : null; } catch (e) { return null; } },
    updateQuota(headers) {
      if (!headers) return;
      try {
        const getH = (key) => headers.get(key) || headers.get(key.toLowerCase());
        const quota = {
          rpm: { 
            remaining: parseInt(getH('x-ratelimit-remaining-requests')), 
            limit: parseInt(getH('x-ratelimit-limit-requests')) 
          },
          tpm: { 
            remaining: parseInt(getH('x-ratelimit-remaining-tokens')), 
            limit: parseInt(getH('x-ratelimit-limit-tokens')) 
          },
          updated: Date.now()
        };
        // Jika header ditemukan, simpan. Jika tidak, jangan timpa data lama dengan NaN
        if (!isNaN(quota.rpm.limit) && !isNaN(quota.rpm.remaining)) {
          localStorage.setItem("gemini_quota", JSON.stringify(quota));
          window.dispatchEvent(new CustomEvent('gemini-quota-updated'));
        }
      } catch (e) { console.warn("[Gemini] Gagal update quota:", e); }
    },
    formatText(t) { 
      // Hapus simbol markdown agar benar-benar plain text sesuai request user
      return t.replace(/\*\*/g, "") // Hapus bold (**)
              .replace(/#/g, "")   // Hapus hashtag header
              .replace(/`/g, "")   // Hapus backticks
              .replace(/\n/g, "<br>")
              .replace(/<(?!br\s*\/?>)[^>]+>/g, ""); 
    },
    showToast(msg) {
      const t = document.createElement("div");
      t.style = "position:fixed;bottom:50px;left:50%;transform:translateX(-50%);background:#1a1a1a;color:#3d99e3;padding:8px 16px;border-radius:50px;font-size:11px;z-index:100000;box-shadow:0 5px 15px rgba(0,0,0,0.5);border:1px solid rgba(144, 202, 249,0.2);animation:msgIn 0.3s;white-space:nowrap;";
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

      let modelRaw = localStorage.getItem("gemini_model") || Config.GEMINI.MODEL;
      let model = modelRaw.replace(/"/g, '');
      
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

      Utils.updateQuota(res.headers); // Added this line

      if (!res.ok) {
        if (res.status === 429) {
          throw new Error("Rate Limit Tercapai! Kuota API model ini sudah habis. Silakan ganti Model atau API Key lain di menu Pengaturan (Mentari Mod).");
        }
        const err = await res.json();
        throw new Error(err.error?.message || "Gagal menghubungi Gemini (Cek Koneksi atau API Key)");
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
        <div class="chat-header">
          <div class="chat-title" style="display:flex; flex-direction:column; font-weight:700; font-size:16px; line-height: 1.2;">
            <div style="display:flex; align-items:center; gap:6px;">
              <span class="ms glow-ai" style="font-size:22px;">auto_awesome</span> 
              <span class="glow-ai">Gemini Assistant</span>
            </div>
            <span style="font-size:9px; color:rgba(135, 135, 135, 0.5); font-weight:500; text-transform:uppercase; letter-spacing:0.5px;">
              Model: ${(localStorage.getItem("gemini_model") || Config.GEMINI.MODEL).replace(/"/g, '').split('-').join(' ')}
            </span>
          </div>
          <div class="chat-actions">
            <button class="chat-action-btn" id="chat-grab-btn" title="Ambil Soal"><span class="ms">content_paste_search</span></button>
            <button class="chat-action-btn" id="chat-clear-btn" title="Hapus Chat"><span class="ms">delete_sweep</span></button>
            <button class="chat-action-btn" id="chat-close-btn"><span class="ms">close</span></button>
          </div>
        </div>
        <div class="chat-history" id="gemini-chat-history"></div>
        <div class="template-area" id="template-area">
          ${Config.QUICK_COMMANDS.map(c => `<div class="chip" data-cmd="${c.id}">${c.label}</div>`).join('')}
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

      // Periodic check for header & theme
      setInterval(() => {
        injectToggleButton();
        if (container.classList.contains("active")) this.applyTheme(container);
      }, 100);
      injectToggleButton();
    },

    applyTheme(container) {
      const isLight = document.querySelector(".css-1yxmbwk") !== null;
      if (isLight) {
        container.classList.add("light-theme");
      } else {
        container.classList.remove("light-theme");
      }
    },

    initEvents(toggle, container) {
    toggle.onclick = (e) => {
      e.stopPropagation();
      const isActive = container.classList.contains("active");
      
      if (!isActive) {
        // Apply theme before showing
        this.applyTheme(container);
        
        // Close other popups
        document.getElementById("token-runner-popup")?.classList.remove("active");
        document.getElementById("mentari-guide-container")?.classList.remove("active");
        
        container.classList.add("active");
        setTimeout(() => container.querySelector(".chat-textarea").focus(), 300);
      } else {
        container.classList.remove("active");
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

      // Quick Commands Toggle
      container.querySelectorAll(".chip").forEach(chip => {
        chip.onclick = (e) => {
          e.stopPropagation();
          chip.classList.toggle("active");
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
      let rawText = textarea.value.trim();
      
      if (!rawText && document.querySelectorAll(".chip.active").length === 0) return;
      if (btn.disabled) return;

      // Logic Command Extraction dari chips yang aktif
      const activeInstructions = [];
      document.querySelectorAll(".chip.active").forEach(chip => {
        const cmdId = chip.dataset.cmd;
        if (Config.GEMINI.COMMANDS[cmdId]) {
          activeInstructions.push(Config.GEMINI.COMMANDS[cmdId]);
        }
      });

      const finalPrompt = activeInstructions.length > 0 
        ? `[INSTRUKSI KHUSUS: ${activeInstructions.join(" ")}]\n\nPERTANYAAN: ${rawText || "Lanjutkan sesuai instruksi"}`
        : rawText;

      textarea.value = "";
      textarea.style.height = "auto";
      
      // Render User
      UIRenderer.renderMessage("user", rawText || "Menjalankan perintah...");
      this.history.push({ sender: "user", text: rawText || "Menjalankan perintah..." });
      this.saveHistory();

      // Loading
      btn.disabled = true;
      const loader = UIRenderer.showTyping();

      try {
        const answer = await ApiService.askGemini(finalPrompt, this.history.slice(0, -1));
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
        textarea.value = cleaned;
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
