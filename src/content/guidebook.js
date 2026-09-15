/**
 * MENTARI MOD - Guidebook Module
 * Provides a quick reference and tutorial for users.
 */

(function () {
  const Config = {
    STYLES: `
      #mentari-guide-container {
        position: fixed; top: 70px; right: 20px; width: 500px; height: 600px;
        background: #121212; backdrop-filter: blur(25px);
        border: 1px solid rgba(255,255,255,0.1); border-radius: 12px;
        box-shadow: 0 15px 50px rgba(0,0,0,0.4); display: flex; flex-direction: column;
        z-index: 100000; overflow: hidden; transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
        visibility: hidden; opacity: 0; transform: translateY(-15px) scale(0.95);
        pointer-events: none; font-family: 'Roboto', 'Helvetica', 'Arial', sans-serif; color: #eee;
      }
      #mentari-guide-container.active { visibility: visible; opacity: 1; transform: translateY(0) scale(1); pointer-events: auto; }
      
      /* Light Theme Adaptation */
      #mentari-guide-container.light-theme {
        background: #ffffff; 
        color: #1a1c1e;
        border: 1px solid rgba(0,0,0,0.12);
        box-shadow: 0 8px 32px rgba(0,0,0,0.08);
      }
      #mentari-guide-container.light-theme .guide-title {
        color: #f0872d;
      }
      #mentari-guide-container.light-theme .guide-header {
        background: linear-gradient(180deg, #f8fafc 0%, #e2e8f0 100%);
        border-bottom-color: #cbd5e1;
      }
      #mentari-guide-container.light-theme .guide-section {
        background: #ffffff;
        border-color: #e2e8f0;
      }
      #mentari-guide-container.light-theme .guide-section h3 {
        color: #0f172a;
      }
      #mentari-guide-container.light-theme .guide-section p {
        color: #475569;
      }
      #mentari-guide-container.light-theme .guide-card {
        background: #f8fafc;
        border-color: #e2e8f0;
        color: #475569;
      }
      #mentari-guide-container.light-theme .tip-badge {
        background: #e0f2fe;
        border-color: #7dd3fc;
        color: #075985;
      }
      #mentari-guide-container.light-theme .guide-icon {
        background: #e0f2fe;
        color: #075985;
      }
      #mentari-guide-container.light-theme .guide-footer {
        color: #64748b;
      }
      #mentari-guide-container.light-theme .guide-close:hover {
        background: rgba(0,0,0,0.04);
        color: #000;
      }

      @media (max-width: 600px) {
        #mentari-guide-container { 
          width: 100%!important; left: 0!important; right: 0!important; 
          border-radius: 0!important; height: 100vh!important; top: 50px!important; 
          transform: translateX(100%)!important; 
        }
        #mentari-guide-container.active { transform: translateX(0)!important; }
      }
      
      .guide-header {
        padding: 12px 14px; background: rgba(255,255,255,0.04); 
        border-bottom: 1px solid rgba(255,255,255,0.06);
        display: flex; justify-content: space-between; align-items: center;
      }
      .guide-title {
        display: flex; align-items: center; gap: 7px;
        font-weight: 800; font-size: 15px; color: #f0872d;
      }
      .guide-content {
        flex: 1; overflow-y: auto; padding: 16px;
        display: flex; flex-direction: column; gap: 8px;
      }
      .guide-content::-webkit-scrollbar { width: 4px; }
      .guide-content::-webkit-scrollbar-thumb { background: rgba(144, 202, 249, 0.3); border-radius: 10px; }
      
      .guide-section {
        background: rgba(255,255,255,0.02); border-radius: 8px; padding: 12px;
        border: 1px solid rgba(255,255,255,0.08);
        transition: border-color 0.2s ease, background 0.2s ease;
      }
      .guide-section:hover {
        border-color: rgba(61,153,227,0.35);
        background: rgba(255,255,255,0.04);
      }
      .guide-section h3 {
        margin: 0 0 8px 0; color: #f1f5f9; font-size: 13px; font-weight: 700;
        display: flex; align-items: center; gap: 8px;
      }
      .guide-section h3 .ms { color: #3d99e3; font-size: 17px; }
      .guide-section p {
        margin: 0; font-size: 11px; line-height: 1.6; color: #94a3b8;
      }
      .guide-card {
        margin-top: 9px; background: rgba(0,0,0,0.15); border-radius: 6px; padding: 9px 10px;
        font-size: 10px; border: 1px solid rgba(255,255,255,0.06); line-height: 1.6; color: #cbd5e1;
      }
      
      #guide-toggle {
        display: inline-flex; align-items: center; justify-content: center;
        width: 40px; height: 40px; border-radius: 50%; border: none;
        background: transparent; color: #1976d2; cursor: pointer;
        transition: background-color 150ms cubic-bezier(0.4, 0, 0.2, 1);
        outline: none; margin-right: 4px;
      }
      #guide-toggle:hover { background-color: rgba(25, 118, 210, 0.08); }
      
      .guide-close {
        background: none; border: none; color: #777; cursor: pointer;
        padding: 4px; border-radius: 50%; transition: all 0.2s;
      }
      .guide-close:hover { color: #fff; background: rgba(255,255,255,0.1); }
      
      .tip-badge {
        display: inline-flex; align-items: center; padding: 2px 6px; border-radius: 5px;
        background: rgba(61,153,227,0.12); border: 1px solid rgba(61,153,227,0.2); color: #38bdf8;
        font-size: 9px; font-weight: 700; text-transform: uppercase;
        margin-bottom: 7px; letter-spacing: 0.04em; line-height: 1.2;
      }
      .guide-icon { width: 26px; height: 26px; display: inline-flex; align-items: center; justify-content: center; border-radius: 6px; background: rgba(61,153,227,0.12); color: #38bdf8; }
      .guide-footer { text-align:center; color:#64748b; opacity:0.75; font-size:9px; padding:4px 0 2px; }
      
      .guide-title .ms { font-size: 22px; margin-right: 4px; }
      #guide-toggle .ms { font-size: 18px; }
      
      .ms { 
        font-family: 'Material Symbols Rounded'; font-size: 18px; font-style: normal; 
        font-weight: normal; line-height: 1; display: inline-flex; 
        align-items: center; vertical-align: middle; 
      }
    `,
  };

  const UIRenderer = {
    injectStyles() {
      const s = document.createElement("style");
      s.textContent = Config.STYLES;
      document.head.appendChild(s);
    },

    applyTheme(container) {
      const isLight = document.querySelector(".css-1yxmbwk") !== null;
      if (isLight) {
        container.classList.add("light-theme");
      } else {
        container.classList.remove("light-theme");
      }
    },

    createInterface() {
      if (document.getElementById("mentari-guide-container")) return;

      const container = document.createElement("div");
      container.id = "mentari-guide-container";
      container.innerHTML = `
        <div class="guide-header">
          <div class="guide-title">
            <span class="ms" style="font-size:22px; margin-right:6px;">auto_stories</span> Guidebook Mentari Mod
          </div>
          <button class="guide-close" id="guide-close-btn"><span class="ms">close</span></button>
        </div>
        <div class="guide-content">
          <div class="guide-section">
            <span class="tip-badge">Langkah Awal</span>
            <h3><span class="guide-icon"><span class="ms">sync</span></span> Sinkronisasi Data Akun</h3>
            <p>Saat baru memasang mod atau pertama kali login, pastikan profil di <b>Pengaturan</b> sudah sesuai. Jika data pertemuan belum muncul:</p>
            <div class="guide-card">
              • <b>Update Data:</b> Silakan buka salah satu Forum atau Mata Kuliah, lalu klik tombol <b>refresh</b> pada tab Forum untuk sinkronisasi data secara otomatis.
            </div>
          </div>

          <div class="guide-section">
            <span class="tip-badge">Tutorial 01</span>
            <h3><span class="guide-icon"><span class="ms">auto_awesome</span></span> Gemini AI Assistant</h3>
            <p>Gunakan asisten AI untuk membantu meringkas diskusi atau menjawab soal. Klik ikon <b>auto_awesome</b> (Oranye) di header.</p>
            <div class="guide-card">
              • <b>Ambil Soal:</b> Gunakan ikon 'paste search' untuk mendeteksi soal di halaman secara otomatis.<br>
              • <b>Quick Commands:</b> Klik pill (Pilih multi) untuk mengatur gaya jawaban (Ringkas, Natural, dll).
            </div>
          </div>

          <div class="guide-section">
            <span class="tip-badge">Tutorial 02</span>
            <h3><span class="guide-icon"><span class="ms">quiz</span></span> Auto Finish Quiz</h3>
            <p>Fitur ini membantu Anda menyelesaikan kuis dengan lebih cepat. Dapat diaktifkan melalui tab <b>Pengaturan</b>.</p>
            <div class="guide-card">
              • Gunakan dengan bijak. Selalu pastikan jawaban yang dihasilkan AI sudah sesuai sebelum melakukan submit final.
            </div>
          </div>

          <div class="guide-section">
            <span class="tip-badge">Tips API</span>
            <h3><span class="guide-icon"><span class="ms">vpn_key</span></span> Mengatasi Error 429</h3>
            <p>Jika muncul pesan <i>"Rate Limit Tercapai"</i>, berarti kuota harian model tersebut sudah habis.</p>
            <div class="guide-card">
              • <b>Solusi:</b> Buka Pengaturan, lalu ganti Model ke versi lain (misal dari Flash 2.0 ke Flash 1.5) atau gunakan API Key cadangan.
            </div>
          </div>

          <div class="guide-footer">
            Dibuat dengan ❤️ untuk mahasiswa UNPAM • v1.9.1
          </div>
        </div>
      `;
      document.body.appendChild(container);

      const injectToggleButton = () => {
        if (document.getElementById("guide-toggle")) return;

        // Find anchor: prioritize gemini-toggle for ordering, fallback to mentari-header-toggle
        const geminiToggle = document.getElementById("gemini-toggle");
        const mentariToggle = document.getElementById("mentari-header-toggle");
        const anchor = geminiToggle || mentariToggle;

        if (anchor && anchor.parentNode) {
          const toggle = document.createElement("button");
          toggle.id = "guide-toggle";
          toggle.title = "Buka Buku Panduan Mentari Mod";
          toggle.innerHTML = `<span class="ms">auto_stories</span><span class="MuiTouchRipple-root"></span>`;
          anchor.parentNode.insertBefore(toggle, anchor);

          toggle.onclick = (e) => {
            e.stopPropagation();
            const isActive = container.classList.contains("active");

            if (!isActive) {
              // Apply theme before showing
              this.applyTheme(container);

              // Close other popups for focus
              document
                .getElementById("token-runner-popup")
                ?.classList.remove("active");
              document
                .getElementById("gemini-chat-container")
                ?.classList.remove("active");

              container.classList.add("active");
            } else {
              container.classList.remove("active");
            }
          };
        }
      };

      setInterval(() => {
        injectToggleButton();
        if (container.classList.contains("active")) this.applyTheme(container);
      }, 100);
      injectToggleButton();

      document.getElementById("guide-close-btn").onclick = () =>
        container.classList.remove("active");
      container.onclick = (e) => e.stopPropagation();
      document.addEventListener("click", () =>
        container.classList.remove("active"),
      );
    },
  };

  UIRenderer.injectStyles();
  UIRenderer.createInterface();
})();
