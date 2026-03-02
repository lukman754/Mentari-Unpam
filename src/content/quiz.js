// quiz.js — Quiz Helper Extension for MENTARI UNPAM
// Refactored: modular structure (Config, Utils, ApiService, UIRenderer, QuizEngine, App)

(async () => {
  // ─── CONFIG ──────────────────────────────────────────────────────────────────
  const Config = {
    GEMINI: {
      MODEL: "gemini-2.5-flash-lite",
      ENDPOINT: "https://generativelanguage.googleapis.com/v1beta/models",
      TEMPERATURE: 0.2,
      TOP_P: 0.85,
      TOP_K: 20,
      MAX_TOKENS: 2048,
      SYSTEM_PROMPT: `Kamu adalah asisten akademik ahli untuk menjawab soal quiz mahasiswa Universitas Pamulang (UNPAM).

Cara menjawab:
1. Baca pertanyaan dengan teliti
2. Analisis setiap pilihan jawaban satu per satu
3. Gunakan penalaran logis dan pengetahuan akademik untuk menentukan jawaban yang paling benar
4. Pada BARIS TERAKHIR, tulis HANYA: "Jawaban: [huruf]"

Penting:
- Jangan gunakan karakter markdown atau simbol khusus
- Tulis penjelasan singkat mengapa pilihan tersebut benar
- Format wajib baris terakhir: "Jawaban: a" atau "Jawaban: b" dst`,
    },
    API: {
      BASE_URL: "https://mentari.unpam.ac.id/api",
      QUIZ_ENDPOINT: (quizId) => `https://mentari.unpam.ac.id/api/quiz/soal/${quizId}`,
    },
    POLL_INTERVAL_MS: 1000,
    SELECTORS: {
      START_BUTTON: "button.MuiButtonBase-root.MuiButton-root.MuiButton-contained.MuiButton-containedPrimary",
      CONFIRM_BUTTON: 'button.MuiButtonBase-root.MuiButton-root.MuiButton-outlined.MuiButton-outlinedPrimary svg[data-testid="ThumbUpOffAltRoundedIcon"]',
      AUTO_FINISH_QUIZ_BUTTONS: [
        'button.MuiButtonBase-root:has(span:contains("Selesai Quiz"))',
        'button.MuiButton-contained:has(span:contains("Selesai Quiz"))',
        'button:has(svg[data-testid="DoneAllIcon"])',
      ],
    },
  };

  // ─── UTILS ───────────────────────────────────────────────────────────────────
  const Utils = {
    delay: (ms) => new Promise((resolve) => setTimeout(resolve, ms)),

    getGeminiApiKey() {
      const stored = localStorage.getItem("geminiApiKey");
      if (stored) return atob(stored);

      const errorEl = document.createElement("div");
      errorEl.style = "position:fixed;top:20px;left:50%;transform:translateX(-50%);background:#f44336;color:white;padding:12px 20px;border-radius:6px;box-shadow:0 3px 15px rgba(0,0,0,0.3);z-index:10000;font-family:system-ui;";
      errorEl.innerHTML = `<div style="display:flex;align-items:center;gap:10px;"><span>❌</span><span>API Key tidak ditemukan. Pastikan Anda telah mengatur API Key di Settings.</span></div>`;
      document.body.appendChild(errorEl);
      setTimeout(() => { errorEl.style.opacity = "0"; errorEl.style.transition = "opacity 0.5s"; setTimeout(() => errorEl.remove(), 500); }, 5000);
      throw new Error("Gemini API Key not found in localStorage");
    },

    getToken() {
      const raw = localStorage.getItem("access");
      if (!raw) throw new Error("Token akses tidak ditemukan");
      const data = JSON.parse(raw);
      if (!Array.isArray(data) || !data[0]?.token) throw new Error("Struktur token tidak valid");
      return data[0].token;
    },

    getQuizId() {
      return window.location.href.split("/").pop();
    },

    cleanText(html) {
      if (!html) return "";
      const div = document.createElement("div");
      div.innerHTML = html;

      // Preserve table content
      div.querySelectorAll("table").forEach((table) => {
        let text = "\n==TABLE==\n";
        table.querySelectorAll("tr").forEach((row, idx) => {
          const cells = Array.from(row.querySelectorAll("td, th")).map((c) => c.textContent.trim()).join(" | ");
          text += cells + "\n";
          if (idx === 0 && row.querySelectorAll("th").length > 0) text += "-".repeat(cells.length) + "\n";
        });
        text += "==END TABLE==\n";
        const pre = document.createElement("pre");
        pre.textContent = text;
        table.parentNode.replaceChild(pre, table);
      });

      return div.innerHTML
        .replace(/<h[1-6][^>]*>(.*?)<\/h[1-6]>/gi, "\n=== $1 ===\n\n")
        .replace(/<strong>(.*?)<\/strong>/gi, "*$1*")
        .replace(/<em>(.*?)<\/em>/gi, "_$1_")
        .replace(/<\/p>/g, "\n\n")
        .replace(/<br\s*\/?>/g, "\n")
        .replace(/<ul[^>]*>/g, "\n").replace(/<\/ul>/g, "\n")
        .replace(/<ol[^>]*>/g, "\n").replace(/<\/ol>/g, "\n")
        .replace(/<li>/g, "• ").replace(/<\/li>/g, "\n")
        .replace(/<img[^>]*alt="([^"]*)"[^>]*>/gi, "[IMG: $1]")
        .replace(/<img[^>]*>/gi, "[IMG]")
        .replace(/<[^>]*>/g, "")
        .replace(/&nbsp;/g, " ").replace(/&amp;/g, "&")
        .replace(/&lt;/g, "<").replace(/&gt;/g, ">").replace(/&quot;/g, '"')
        .replace(/\n\s*\n\s*\n/g, "\n\n")
        .trim();
    },

    showError(message) {
      const el = document.createElement("div");
      el.style = "position:fixed;bottom:100px;left:50%;transform:translateX(-50%);background:#1a1a1a;color:#fff;padding:8px 16px;border-radius:50px;box-shadow:0 5px 15px rgba(0,0,0,0.4);z-index:10000;font-family:system-ui;border:1px solid #444;font-size:11px;animation:toastIn 0.3s;";
      el.innerHTML = `<div style="display:flex;align-items:center;gap:10px;"><span style="color:#f44336;">❌</span><span>${message}</span></div>`;
      document.body.appendChild(el);
      setTimeout(() => { el.style.opacity = "0"; el.style.transition = "opacity 0.5s"; setTimeout(() => el.remove(), 500); }, 5000);
    },

    updateQuota(headers) {
      try {
        const quota = {
          rpm: { remaining: parseInt(headers.get('x-ratelimit-remaining-requests')), limit: parseInt(headers.get('x-ratelimit-limit-requests')) },
          tpm: { remaining: parseInt(headers.get('x-ratelimit-remaining-tokens')), limit: parseInt(headers.get('x-ratelimit-limit-tokens')) },
          updated: Date.now()
        };
        if (!isNaN(quota.rpm.limit)) localStorage.setItem("gemini_quota", JSON.stringify(quota));
      } catch (e) {}
    },
  };

  // ─── API SERVICE ─────────────────────────────────────────────────────────────
  const ApiService = {
    async fetchQuiz(token, quizId) {
      const res = await fetch(Config.API.QUIZ_ENDPOINT(quizId), {
        method: "GET",
        headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
        cache: "no-store",
      });
      if (!res.ok) return null;
      const data = await res.json();
      return data?.data ? data : null;
    },

    // Proses soal dalam kelompok kecil (5 soal per request) untuk akurasi maksimal
    async askGeminiBatch(apiKey, questions) {
      const CHUNK_SIZE = 5;
      const results = [];
      const modelRaw = localStorage.getItem("gemini_model") || Config.GEMINI.MODEL;
      const model = modelRaw.replace(/"/g, '');

      for (let i = 0; i < questions.length; i += CHUNK_SIZE) {
        const chunk = questions.slice(i, i + CHUNK_SIZE);
        const startIndex = i + 1;
        
        console.log(`[Batch] Memproses chunk ${Math.floor(i/CHUNK_SIZE) + 1} (${chunk.length} soal)...`);
        
        const chunkBlock = chunk.map((q, j) => {
          const opts = q.options.map((o, k) => `  ${String.fromCharCode(65+k)}. ${o}`).join("\n");
          return `### SOAL ${startIndex + j}\n${q.question}\n\nPilihan:\n${opts}`;
        }).join("\n\n---\n\n");

        const prompt = `Kamu adalah pakar akademik yang sangat teliti. Jawab soal-soal berikut dengan akurasi 100%. 
Langkah kerja:
1. Analisis soal dan semua pilihan jawaban dengan mendalam.
2. Identifikasi konsep kunci dan singkirkan pilihan yang salah.
3. Pilih jawaban yang paling tepat secara akademis.

DAFTAR SOAL:
${chunkBlock}

Wajib tulis REKAP JAWABAN di baris paling akhir dengan format persis seperti ini:
${chunk.map((_, j) => `JAWABAN_${startIndex+j}: [HURUF]`).join("\n")}

Berikan penjelasan ringkas per soal sebelum rekap.`;

        let retries = 2;
        let chunkSuccess = false;

        while (retries >= 0 && !chunkSuccess) {
          try {
            const res = await fetch(`${Config.GEMINI.ENDPOINT}/${model}:generateContent?key=${apiKey}`, {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                contents: [{ parts: [{ text: prompt }] }],
                generationConfig: {
                  temperature: 0.1, // Sangat rendah untuk akurasi maksimal/deterministik
                  topP: 0.1,
                  maxOutputTokens: 2048
                }
              })
            });

            if (!res.ok) throw new Error(`API Error ${res.status}`);
            Utils.updateQuota(res.headers);
            const data = await res.json();
            const text = data?.candidates?.[0]?.content?.parts?.[0]?.text || "";
            
            // Ekstrak jawaban dari chunk ini
            chunk.forEach((_, j) => {
              const idx = startIndex + j;
              const reg = new RegExp(`JAWABAN_${idx}\\s*:\\s*([A-E])`, "i");
              const match = text.match(reg);
              results.push({
                letter: match ? match[1].toLowerCase() : this.fallbackAnswer(chunk[j].question, chunk[j].options).letter,
                explanation: text
              });
            });
            
            chunkSuccess = true;
          } catch (err) {
            console.error(`[Batch] Error pada chunk ${startIndex}:`, err);
            if (retries === 0) {
              // Failback chunk ini
              chunk.forEach(q => results.push(this.fallbackAnswer(q.question, q.options)));
            }
            retries--;
            await new Promise(r => setTimeout(r, 2000));
          }
        }
      }
      return results;
    },

    // Fallback: keyword matching jika Gemini gagal
    fallbackAnswer(question, options) {
      const keywords = question.toLowerCase().replace(/[.,?!;:()]/g, "").split(/\s+/).filter((w) => w.length > 3);
      let bestIdx = 0, bestScore = 0;
      options.forEach((opt, idx) => {
        const score = keywords.filter((kw) => opt.toLowerCase().includes(kw)).length;
        if (score > bestScore) { bestScore = score; bestIdx = idx; }
      });
      return {
        letter: String.fromCharCode(97 + (bestScore > 0 ? bestIdx : 0)),
        explanation: "Analisis otomatis (Akurasi terbatas).",
      };
    },
  };

  // ─── UI RENDERER ─────────────────────────────────────────────────────────────
  const UIRenderer = {
    popup: null,
    content: null,

    createPopup() {
      const popup = document.createElement("div");
      popup.style = "position:fixed;z-index:10000;min-width:300px;max-width:450px;width:auto;top:20px;right:20px;background:#1e1e1e;color:#fff;border-radius:8px;box-shadow:0 4px 12px rgba(0,0,0,0.5);font-family:system-ui;font-size:13px;border:1px solid #333;overflow:hidden;";

      const header = document.createElement("div");
      header.style = "padding:10px 14px;background:#2a2a2a;color:#fff;cursor:move;user-select:none;display:flex;justify-content:space-between;align-items:center;font-weight:500;border-bottom:1px solid #333;";
      header.innerHTML = `
        <div>Quiz Helper</div>
        <div style="display:flex;gap:8px;">
          <button id="toggle-popup" style="background:none;border:none;color:#999;cursor:pointer;padding:0;width:24px;height:24px;display:flex;align-items:center;justify-content:center;font-size:16px;transition:color 0.2s;">−</button>
          <button id="close-popup" style="background:none;border:none;color:#999;cursor:pointer;padding:0;width:24px;height:24px;display:flex;align-items:center;justify-content:center;font-size:16px;transition:color 0.2s;">×</button>
        </div>
      `;

      const content = document.createElement("div");
      content.id = "popup-content";
      content.style = "padding:12px;max-height:500px;overflow-y:auto;";

      // Hover & scrollbar styles
      const style = document.createElement("style");
      style.textContent = `
        #toggle-popup:hover, #close-popup:hover { color: #fff !important; }
        .q-tooltip { background: #1e1e1e !important; border-color: #444 !important; }
        ::-webkit-scrollbar { width: 2px; height: 2px; }
        ::-webkit-scrollbar-track { background: transparent; }
        ::-webkit-scrollbar-thumb { background: rgba(76,175,80,0.2); border-radius: 10px; }
        ::-webkit-scrollbar-thumb:hover { background: rgba(76,175,80,0.5); }
        .mode-btn { padding: 4px 8px; border-radius: 4px; border: 1px solid #444; background: #2a2a2a; color: #888; font-size: 10px; cursor: pointer; transition: all 0.2s; }
        .mode-btn.active { background: rgba(76,175,80,0.2); border-color: #4CAF50; color: #4CAF50; font-weight: bold; }
      `;
      document.head.appendChild(style);

      popup.appendChild(header);
      popup.appendChild(content);
      document.body.appendChild(popup);

      this._makeDraggable(popup, header);
      this._initToggle(popup, content);
      this.popup = popup;
      this.content = content;
      return { element: popup, content, remove: () => popup.remove() };
    },

    _makeDraggable(popup, handle) {
      let dragging = false, ox, oy;
      handle.addEventListener("mousedown", (e) => { dragging = true; ox = e.clientX - popup.getBoundingClientRect().left; oy = e.clientY - popup.getBoundingClientRect().top; });
      document.addEventListener("mousemove", (e) => { if (!dragging) return; popup.style.left = e.clientX - ox + "px"; popup.style.top = e.clientY - oy + "px"; popup.style.right = "auto"; });
      document.addEventListener("mouseup", () => (dragging = false));
    },

    _initToggle(popup, content) {
      let open = true;
      document.getElementById("toggle-popup").addEventListener("click", () => {
        open = !open;
        content.style.display = open ? "block" : "none";
        popup.style.height = open ? "auto" : undefined;
        document.getElementById("toggle-popup").textContent = open ? "−" : "+";
      });
      document.getElementById("close-popup").addEventListener("click", () => popup.remove());
    },

    showLoading(content) {
      content.innerHTML = `
        <div style="text-align:center;padding:20px;">
          <div style="width:60px;height:60px;margin:0 auto 15px;background:#2a2a2a;border-radius:50%;display:flex;align-items:center;justify-content:center;border:2px solid #333;">
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#4CAF50" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M12 2v8M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h8M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83"/>
            </svg>
          </div>
          <div style="font-size:16px;font-weight:500;color:#4CAF50;margin-bottom:8px;">Memuat Quiz</div>
          <div style="color:#999;font-size:13px;">Mohon tunggu sebentar...</div>
          <div style="width:100%;height:4px;background:#2a2a2a;border-radius:2px;overflow:hidden;margin-top:12px;position:relative;">
            <div style="position:absolute;top:0;left:0;width:30%;height:100%;background:#4CAF50;animation:quiz-pulse 1.5s ease-in-out infinite;"></div>
          </div>
          <style>@keyframes quiz-pulse { 0% { transform: translateX(-100%); } 100% { transform: translateX(400%); } }</style>
        </div>`;
    },

    showScanning(content) {
      content.innerHTML = `
        <div style="text-align:center;padding:20px;">
          <div style="font-size:16px;font-weight:500;color:#4CAF50;margin-bottom:8px;">Memeriksa Quiz...</div>
          <div style="color:#999;font-size:13px;">Mencari tombol "Mulai Quiz"</div>
          <div style="width:100%;height:4px;background:#2a2a2a;border-radius:2px;overflow:hidden;margin-top:12px;position:relative;">
            <div style="position:absolute;top:0;left:0;width:30%;height:100%;background:#4CAF50;animation:quiz-pulse 0.8s ease-in-out infinite;"></div>
          </div>
        </div>`;
    },

    initAnswerContainer(content) {
      content.innerHTML = `
        <div style="margin-bottom:10px;">
          <div id="progress-text" style="font-size:12px;margin-bottom:6px;color:#999;font-weight:500;">Mencari jawaban...</div>
          <div style="width:100%;height:4px;background-color:#2a2a2a;border-radius:2px;overflow:hidden;">
            <div id="progress-bar" style="height:100%;width:0%;background-color:#4CAF50;transition:width 0.2s ease;"></div>
          </div>
        </div>

        <!-- Disclaimer -->
        <div style="background:rgba(240,173,78,0.08);border:1px solid rgba(240,173,78,0.25);border-radius:6px;padding:8px 10px;margin-bottom:10px;font-size:11px;color:#f0ad4e;line-height:1.5;">
          ⚠️ <strong>Catatan:</strong> Jawaban AI bisa saja kurang tepat. Gunakan sebagai referensi, bukan patokan utama — tetap baca soal dan cek jawabannya sendiri ya!
        </div>

        <!-- Tombol Copy All -->
        <div style="display:flex;gap:6px;margin-bottom:10px;">
          <button id="copy-all-questions" style="flex:1;padding:7px;background:#2a2a2a;border:1px solid #444;border-radius:6px;color:#ccc;font-size:11px;cursor:pointer;display:flex;align-items:center;justify-content:center;gap:6px;transition:background 0.2s;">
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="9" y="9" width="13" height="13" rx="2"/><path d="M5 15H4a2 2 0 01-2-2V4a2 2 0 012-2h9a2 2 0 012 2v1"/></svg>
            Salin
          </button>
          
          <div style="display:flex;gap:2px;background:#2a2a2a;padding:2px;border-radius:6px;border:1px solid #444;">
            <button class="mode-btn ${App.viewMode === 1 ? 'active' : ''}" data-mode="1" title="Mode Ringkas">R</button>
            <button class="mode-btn ${App.viewMode === 2 ? 'active' : ''}" data-mode="2" title="Mode Standar">S</button>
            <button class="mode-btn ${App.viewMode === 3 ? 'active' : ''}" data-mode="3" title="Mode Detail">D</button>
          </div>
        </div>

        <div id="answers-container" style="max-height:420px;overflow-y:auto;padding-right:4px;"></div>
        <div style="display:none;justify-content:space-between;margin-top:10px;">
          <label style="display:flex;align-items:center;font-size:12px;color:#999;"><input type="checkbox" id="auto-answer" checked style="margin-right:5px;"> Auto-jawab</label>
          <label style="display:flex;align-items:center;font-size:12px;color:#999;"><input type="checkbox" id="auto-next" checked style="margin-right:5px;"> Auto-next</label>
        </div>`;

      // Event Copy All
      document.getElementById("copy-all-questions").addEventListener("click", () => App.copyAllQuestions());

      // Event Switch Mode
      content.querySelectorAll(".mode-btn").forEach(btn => {
        btn.addEventListener("click", () => {
          const mode = parseInt(btn.dataset.mode);
          if (App.viewMode === mode) return;
          App.viewMode = mode;
          
          // Toggle active class
          content.querySelectorAll(".mode-btn").forEach(b => b.classList.remove("active"));
          btn.classList.add("active");
          
          // Re-render all questions
          App.renderAllQuestions();
        });
      });
    },

    createQuestionItem(index, questionId, statusHtml) {
      const el = document.createElement("div");
      el.dataset.questionId = questionId;
      el.style = "padding:8px 12px;margin-bottom:8px;border-radius:6px;background-color:#2a2a2a;position:relative;border-left:3px solid #333;transition:all 0.2s ease;";
      el.innerHTML = `<small>${index + 1}. <span style="color:#ffcc5c;">${statusHtml}</span></small>`;
      return el;
    },

    updateQuestionItem(element, data) {
      const { answer, number, options, question, explanation, index } = data;
      const viewMode = App.viewMode;

      if (answer) {
        const answerIndex = answer.charCodeAt(0) - 97;
        const answerText = options[answerIndex] || "";
        
        element.style.borderLeftColor = "#4CAF50";
        element.style.padding = viewMode === 1 ? "6px 12px" : "10px 12px";

        let html = "";
        
        if (viewMode === 1) {
          // MODE 1: Ringkas (Nomor, Jawaban, Tombol Set)
          html = `
            <div style="display:flex;justify-content:space-between;align-items:center;gap:8px;">
              <div style="flex:1;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;font-size:12px;">
                <span style="color:#888;margin-right:4px;">${number}.</span>
                <span style="background:#4CAF50;color:#fff;font-size:10px;font-weight:700;padding:1px 6px;border-radius:4px;margin-right:6px;">${answer.toUpperCase()}</span>
                <span style="color:#ddd;">${answerText}</span>
              </div>
              <button class="apply-answer" data-index="${index}" data-letter="${answer}" style="padding:2px 8px;background:#4CAF50;border:none;border-radius:4px;color:white;font-size:9px;cursor:pointer;">Set</button>
            </div>`;
        } else {
          // MODE 2 & 3: Standar / Detail
          html = `
            <div style="display:flex;justify-content:space-between;align-items:flex-start;margin-bottom:8px;">
              <div style="flex:1;">
                <span style="font-size:11px;color:#4CAF50;font-weight:700;text-transform:uppercase;letter-spacing:0.5px;">Soal ${number}</span>
                <span style="margin-left:8px;background:#4CAF50;color:#fff;font-size:11px;font-weight:700;padding:1px 7px;border-radius:10px;">${answer.toUpperCase()}</span>
              </div>
              <div style="display:flex;gap:5px;flex-shrink:0;">
                <button class="apply-answer" data-index="${index}" data-letter="${answer}" title="Pilih jawaban ini" style="padding:3px 8px;background:#4CAF50;border:none;border-radius:4px;color:white;font-size:10px;cursor:pointer;">Pilih</button>
                <div class="info-button" title="Lihat penjelasan AI" style="width:22px;height:22px;border-radius:50%;background:#333;color:#aaa;display:flex;align-items:center;justify-content:center;cursor:pointer;font-size:11px;font-weight:700;transition:all 0.2s;">i</div>
              </div>
            </div>

            <div style="font-size:12px;color:#ddd;line-height:1.5;margin-bottom:8px;white-space:pre-wrap;word-break:break-word;">${question.replace(/</g,'&lt;').replace(/>/g,'&gt;')}</div>

            <div style="display:flex;flex-direction:column;gap:4px;margin-bottom:${viewMode === 3 ? '10px' : '0'};">
              ${options.map((opt, idx) => {
                const letter = String.fromCharCode(97 + idx);
                const isAnswer = letter === answer;
                return `<div style="display:flex;align-items:flex-start;gap:6px;padding:4px 7px;border-radius:5px;font-size:11px;background:${isAnswer ? 'rgba(76,175,80,0.12)' : 'rgba(255,255,255,0.03)'};border:1px solid ${isAnswer ? 'rgba(76,175,80,0.3)' : 'rgba(255,255,255,0.05)'};">
                  <span style="font-weight:700;color:${isAnswer ? '#4CAF50' : '#777'};flex-shrink:0;min-width:14px;">${letter}.</span>
                  <span style="color:${isAnswer ? '#c8f0c9' : '#aaa'};line-height:1.4;">${opt.replace(/</g,'&lt;').replace(/>/g,'&gt;')}</span>
                </div>`;
              }).join('')}
            </div>`;

          if (viewMode === 3) {
            html += `
              <div style="padding:8px 10px;background:rgba(255,255,255,0.02);border:1px solid rgba(255,255,255,0.05);border-radius:6px;font-size:11px;color:#999;line-height:1.5;">
                <div style="font-weight:600;color:#4CAF50;margin-bottom:4px;font-size:10px;display:flex;align-items:center;gap:4px;">
                  <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><circle cx="12" cy="12" r="10"/><path d="M12 16v-4"/><path d="M12 8h.01"/></svg>
                  PENJELASAN AI
                </div>
                ${explanation.replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/\n/g, '<br>')}
              </div>`;
          }
        }

        element.innerHTML = html;

        element.querySelector(".apply-answer").addEventListener("click", () => {
          if (QuizEngine.selectRadioAnswer(index, answer) && document.getElementById("auto-next")?.checked) {
            setTimeout(() => QuizEngine.clickNextButton(), 500);
          }
        });

        const infoBtn = element.querySelector(".info-button");
        if (infoBtn) {
          infoBtn.addEventListener("mouseenter", () => {
            infoBtn.style.backgroundColor = "#4CAF50";
            infoBtn.style.color = "#fff";
            const tooltip = document.createElement("div");
            tooltip.className = "q-tooltip explanation-tooltip";
            tooltip.style = "position:fixed;width:320px;padding:12px;background:#1e1e1e;border:1px solid #444;border-radius:8px;box-shadow:0 4px 16px rgba(0,0,0,0.5);z-index:10001;font-size:12px;white-space:pre-wrap;max-height:350px;overflow-y:auto;line-height:1.5;";
            tooltip.innerHTML = `
              <div style="font-weight:600;color:#4CAF50;margin-bottom:6px;">💡 Penjelasan AI:</div>
              <div style="color:#ccc;">${explanation.replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/\n/g, '<br>')}</div>
              <div style="margin-top:8px;padding-top:8px;border-top:1px solid #333;font-size:10px;color:#666;">⚠️ Jawaban AI mungkin tidak selalu tepat.</div>`;
            document.body.appendChild(tooltip);

            const btnRect = infoBtn.getBoundingClientRect();
            tooltip.style.top = Math.min(btnRect.bottom + 6, window.innerHeight - 360) + "px";
            tooltip.style.left = Math.max(10, Math.min(btnRect.left - 280, window.innerWidth - 340)) + "px";
          });
          infoBtn.addEventListener("mouseleave", () => {
            infoBtn.style.backgroundColor = "#333";
            infoBtn.style.color = "#aaa";
            document.querySelector(".explanation-tooltip")?.remove();
          });
        }
      } else {
        element.style.borderLeftColor = "#f44336";
        element.innerHTML = `<div style="color:#fff;font-size:12px;padding:4px 0;">${number}. <span style="color:#f44336;font-weight:500;">Gagal mendapatkan jawaban</span></div>`;
      }
    },
  };

  // ─── QUIZ ENGINE ─────────────────────────────────────────────────────────────
  const QuizEngine = {
    selectRadioAnswer(questionIndex, answerLetter) {
      const answerIndex = answerLetter.charCodeAt(0) - 97;
      const selectors = [
        `.MuiStack-root.css-1kic1uf .MuiFormControlLabel-root:nth-child(${answerIndex + 1}) .MuiRadio-root`,
        `input[type="radio"][name="jawaban[${questionIndex}]"][value="${answerIndex}"]`,
        `input[type="radio"][name="soal_${questionIndex + 1}"][value="${answerIndex}"]`,
        `input[type="radio"][value="${answerIndex}"][data-question-id="${questionIndex + 1}"]`,
        `.question-container:nth-child(${questionIndex + 1}) input[type="radio"]:nth-child(${answerIndex + 1})`,
        `#question-${questionIndex + 1} input[type="radio"][value="${answerIndex}"]`,
        `form .MuiRadio-root:nth-of-type(${answerIndex + 1})`,
        `.css-1675apn .MuiFormControlLabel-root:nth-child(${answerIndex + 1}) input`,
        `[name^="jawaban"][value="${answerIndex}"]`,
      ];

      for (const sel of selectors) {
        try {
          const radio = document.querySelector(sel);
          if (radio) {
            radio.checked = true;
            radio.dispatchEvent(new Event("change", { bubbles: true }));
            radio.dispatchEvent(new MouseEvent("click", { bubbles: true, cancelable: true, view: window }));
            return true;
          }
        } catch (_) {}
      }
      return false;
    },

    clickNextButton() {
      const nextSelectors = [
        'button:has(svg[data-testid="KeyboardTabIcon"])',
        'button.MuiButton-contained:has(span:contains("Next"))',
        'button.MuiButton-contained:has(span:contains("Selanjutnya"))',
        "button.next-button",
        'button[type="submit"]',
        'input[type="button"][value="Next"]',
        "button.btn-primary:not(:disabled)",
        "button.css-1hw9j7s",
        '[aria-label="next"]',
      ];

      for (const sel of nextSelectors) {
        try {
          const buttons = document.querySelectorAll(sel);
          for (const btn of buttons) {
            if (btn && !btn.disabled && btn.offsetParent !== null) { btn.click(); return true; }
          }
        } catch (_) {}
      }

      // Cek auto_finish_quiz
      const autoFinish = localStorage.getItem("auto_finish_quiz") === "true";
      if (!autoFinish) {
        const delay = Math.floor(Math.random() * 60000) + 120000;
        console.log(`Auto finish tidak aktif, menunggu ${Math.round(delay / 1000)}s untuk humanize...`);
        setTimeout(() => this.clickNextButton(), delay);
        return false;
      }

      for (const sel of Config.SELECTORS.AUTO_FINISH_QUIZ_BUTTONS) {
        try {
          const buttons = document.querySelectorAll(sel);
          for (const btn of buttons) {
            if (btn && !btn.disabled && btn.offsetParent !== null) {
              btn.click();
              this._watchConfirmDialog();
              return true;
            }
          }
        } catch (_) {}
      }
      return false;
    },

    _watchConfirmDialog() {
      setTimeout(() => {
        const selector = Config.SELECTORS.CONFIRM_BUTTON;
        const check = () => document.querySelector(selector)?.closest("button");

        const obs = new MutationObserver((_, o) => {
          const btn = check();
          if (btn) { btn.click(); o.disconnect(); }
        });
        obs.observe(document.body, { childList: true, subtree: true });
        const btn = check();
        if (btn) { btn.click(); obs.disconnect(); }
      }, 500);
    },

    sequentiallyAnswerAllQuestions(questionData) {
      if (!document.getElementById("auto-answer")?.checked) return;
      const questions = Array.from(questionData.values()).sort((a, b) => a.index - b.index);
      let i = 0, noNextCount = 0;

      const processNext = () => {
        if (i >= questions.length) return;
        const q = questions[i];
        const selected = this.selectRadioAnswer(q.index, q.answer);
        if (selected) {
          if (document.getElementById("auto-next")?.checked) {
            setTimeout(() => {
              if (this.clickNextButton()) { noNextCount = 0; i++; setTimeout(processNext, 100); }
              else {
                noNextCount++;
                if (noNextCount >= 2) { for (let j = 0; j < 3; j++) setTimeout(() => this.clickNextButton(), j * 50); }
                else setTimeout(processNext, 100);
              }
            }, 100);
          } else { i++; setTimeout(processNext, 100); }
        } else { setTimeout(processNext, 100); }
      };

      processNext();
    },
  };

  // ─── APP ─────────────────────────────────────────────────────────────────────
  const App = {
    apiKey: null,
    token: null,
    quizId: null,
    popup: null,
    processedQuestions: new Set(),
    questionData: new Map(),
    viewMode: 2, // 1: Ringkas, 2: Standar, 3: Detail
    allAnswered: false,

    renderAllQuestions() {
      const answersContainer = document.getElementById("answers-container");
      if (!answersContainer) return;

      this.questionData.forEach((data, questionId) => {
        let el = document.querySelector(`[data-question-id="${questionId}"]`);
        if (el) {
          UIRenderer.updateQuestionItem(el, data);
        }
      });
    },

    copyAllQuestions() {
      if (this.questionData.size === 0) {
        Utils.showError("Belum ada soal yang diproses.");
        return;
      }

      const lines = [];
      const sorted = Array.from(this.questionData.values()).sort((a, b) => a.index - b.index);

      sorted.forEach((data) => {
        lines.push(`Soal ${data.number}:`);
        lines.push(data.question);
        lines.push("");
        data.options.forEach((opt, idx) => {
          const letter = String.fromCharCode(97 + idx);
          const mark = letter === data.answer ? " ✓ (Jawaban AI)" : "";
          lines.push(`${letter}. ${opt}${mark}`);
        });
        lines.push(`→ Jawaban AI: ${data.answer?.toUpperCase() ?? "Tidak diketahui"}`);
        lines.push("─".repeat(50));
        lines.push("");
      });

      lines.push("⚠️ Catatan: Jawaban di atas dihasilkan oleh AI dan mungkin tidak selalu tepat.");
      lines.push("Tetap baca soal dan verifikasi jawabannya sendiri ya!");

      const text = lines.join("\n");
      navigator.clipboard.writeText(text).then(() => {
        const btn = document.getElementById("copy-all-questions");
        if (btn) {
          const orig = btn.innerHTML;
          btn.innerHTML = `<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#4CAF50" stroke-width="2"><polyline points="20 6 9 17 4 12"/></svg> Tersalin!`;
          btn.style.color = "#4CAF50";
          btn.style.borderColor = "#4CAF50";
          setTimeout(() => { btn.innerHTML = orig; btn.style.color = "#ccc"; btn.style.borderColor = "#444"; }, 2000);
        }
      }).catch(() => Utils.showError("Gagal menyalin ke clipboard."));
    },
    async init() {
      this.apiKey = Utils.getGeminiApiKey();
      this.token = Utils.getToken();
      this.quizId = Utils.getQuizId();
      this.popup = UIRenderer.createPopup();
      UIRenderer.showLoading(this.popup.content);

      await this.fetchAndProcess();
      setInterval(() => this.fetchAndProcess(), Config.POLL_INTERVAL_MS);
      this.autoStartQuiz();
      this.setupAutoConfirm();
    },

    async fetchAndProcess() {
      // Jika popup sudah di-close, hentikan
      if (!this.popup?.element?.isConnected) return;
      const data = await ApiService.fetchQuiz(this.token, this.quizId);
      if (!data) {
        // Hanya tampilkan scanning jika answers-container belum ada (belum ada data)
        if (!this.popup.content.querySelector("#answers-container")) {
          UIRenderer.showScanning(this.popup.content);
        }
        return;
      }
      await this.processQuiz(data);
    },

    async processQuiz(quizData) {
      const isFirstRun = !this.popup.content.querySelector("#answers-container");
      if (isFirstRun) UIRenderer.initAnswerContainer(this.popup.content);


      // Restore already-answered questions on re-render
      const answersContainer = document.getElementById("answers-container");
      if (!answersContainer) return; // Popup hilang dari DOM, abort

      if (!isFirstRun) {
        this.questionData.forEach((data, questionId) => {
          if (!document.querySelector(`[data-question-id="${questionId}"]`)) {
            const item = UIRenderer.createQuestionItem(data.index, questionId, "...");
            answersContainer.appendChild(item);
            UIRenderer.updateQuestionItem(
              document.querySelector(`[data-question-id="${questionId}"]`),
              data
            );
          }
        });
      }

      let answeredCount = 0;
      let newFound = false;
      const pending = [];

      for (let i = 0; i < quizData.data.length; i++) {
        const q = quizData.data[i];

        if (this.processedQuestions.has(q.id)) {
          if (this.questionData.get(q.id)?.answer) answeredCount++;
          continue;
        }

        newFound = true;
        this.processedQuestions.add(q.id);

        const pBar = document.getElementById("progress-bar");
        const pText = document.getElementById("progress-text");
        if (pBar) pBar.style.width = `${Math.round(((i + 1) / quizData.data.length) * 100)}%`;
        if (pText) pText.textContent = `Mencari jawaban ${i + 1} dari ${quizData.data.length}`;

        const questionItem = UIRenderer.createQuestionItem(i, q.id, "Mencari jawaban...");
        answersContainer.appendChild(questionItem);

        const title = Utils.cleanText(q.judul || "");
        const desc = Utils.cleanText(q.deskripsi || "");
        const fullQuestion = [title, desc].filter(Boolean).join("\n\n");
        const options = (q.list_jawaban || []).map((j) => Utils.cleanText(j.jawaban));

        if (options.length === 0) {
          questionItem.innerHTML = `<small>${i + 1}. <span style="color:#ff6b6b;">Tidak ada pilihan</span></small>`;
          continue;
        }

        pending.push({ question: fullQuestion, options, questionId: q.id, index: i, questionItem });
      }

      // ── BATCH REQUEST: 1 request untuk semua soal sekaligus ──
      if (pending.length > 0) {
        const pText = document.getElementById("progress-text");
        const pBar = document.getElementById("progress-bar");
        if (pText) pText.textContent = `Memproses ${pending.length} soal dalam 1 request...`;
        if (pBar) pBar.style.width = "50%";

        const batchResults = await ApiService.askGeminiBatch(this.apiKey, pending);

        if (pBar) pBar.style.width = "100%";

        batchResults.forEach((result, batchIdx) => {
          const { question, options, questionId, index, questionItem } = pending[batchIdx];
          const data = {
            id: questionId,
            number: index + 1,
            question,
            options,
            answer: result.letter,
            explanation: result.explanation,
            index,
          };
          this.questionData.set(questionId, data);
          UIRenderer.updateQuestionItem(questionItem, data);
          if (result.letter) answeredCount++;
        });
      }

      // Update progress
      const progressText = document.getElementById("progress-text");
      const progressBar = document.getElementById("progress-bar");
      if (!progressText || !progressBar) return; // Popup sudah ditutup

      if (answeredCount === quizData.data.length && !this.allAnswered) {
        this.allAnswered = true;
        progressText.textContent = "✅ Semua jawaban ditemukan! Mulai menjawab...";
        progressText.style.color = "#4CAF50";
        if (document.getElementById("auto-answer")?.checked) {
          setTimeout(() => QuizEngine.sequentiallyAnswerAllQuestions(this.questionData), 100);
        }
      } else {
        progressBar.style.width = "100%";
        const pct = Math.round((answeredCount / quizData.data.length) * 100);
        progressText.textContent = `${pct}% (${answeredCount}/${quizData.data.length}) jawaban ditemukan`;
        progressText.style.color = newFound ? "#4CAF50" : "#aaa";
      }
    },

    autoStartQuiz() {
      const SELECTOR = Config.SELECTORS.START_BUTTON;
      const tryClick = (obs) => {
        const btn = document.querySelector(SELECTOR);
        if (btn && btn.textContent.includes("Mulai Quiz")) {
          btn.click();
          obs?.disconnect();
          setTimeout(() => window.location.reload(), 50000);
          return true;
        }
        return false;
      };

      if (!tryClick(null)) {
        const obs = new MutationObserver((_, o) => tryClick(o));
        obs.observe(document.body, { childList: true, subtree: true, attributes: true, characterData: true });
      }
    },

    setupAutoConfirm() {
      let clicked = false;
      const SELECTOR = Config.SELECTORS.CONFIRM_BUTTON;
      const tryClick = (obs) => {
        const btn = document.querySelector(SELECTOR)?.closest("button");
        if (btn && !clicked) {
          btn.click();
          clicked = true;
          obs?.disconnect();
        }
      };

      const obs = new MutationObserver((_, o) => tryClick(o));
      obs.observe(document.body, { childList: true, subtree: true });
      tryClick(null);
    },
  };

  // ─── BOOTSTRAP ───────────────────────────────────────────────────────────────
  try {
    await App.init();
  } catch (error) {
    Utils.showError(error.message);
  }
})();
