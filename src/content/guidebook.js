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
        color: #0d47a1;
      }
      #mentari-guide-container.light-theme .guide-header {
        background: #f8f9fa;
        border-bottom-color: rgba(0,0,0,0.08);
      }
      #mentari-guide-container.light-theme .guide-section {
        background: #ffffff;
        border-color: rgba(0,0,0,0.08);
      }
      #mentari-guide-container.light-theme .guide-section h3 {
        color: #1976d2;
      }
      #mentari-guide-container.light-theme .guide-section p {
        color: #4a5568;
      }
      #mentari-guide-container.light-theme .guide-card {
        background: #f1f5f9;
        border-color: rgba(25, 118, 210, 0.2);
        color: #475569;
      }
      #mentari-guide-container.light-theme .tip-badge {
        background: rgba(25, 118, 210, 0.1);
        color: #1976d2;
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
        padding: 16px; background: rgba(255,255,255,0.02); 
        border-bottom: 1px solid rgba(255,255,255,0.06);
        display: flex; justify-content: space-between; align-items: center;
      }
      .guide-title {
        font-weight: 700; font-size: 16px; color: #3d99e3;
      }
      .guide-content {
        flex: 1; overflow-y: auto; padding: 20px;
        display: flex; flex-direction: column; gap: 20px;
      }
      .guide-content::-webkit-scrollbar { width: 4px; }
      .guide-content::-webkit-scrollbar-thumb { background: rgba(144, 202, 249, 0.3); border-radius: 10px; }
      
      .guide-section {
        background: #1e1e1e; border-radius: 8px; padding: 15px;
        border: 1px solid rgba(255,255,255,0.06);
      }
      .guide-section h3 {
        margin: 0 0 10px 0; color: #3d99e3; font-size: 14px; font-weight: 700;
        display: flex; align-items: center; gap: 8px;
      }
      .guide-section p {
        margin: 0; font-size: 13px; line-height: 1.6; color: rgba(255,255,255,0.7);
      }
      .guide-card {
        margin-top: 10px; background: rgba(0,0,0,0.2); border-radius: 6px; padding: 12px;
        font-size: 12px; border: 1px dashed rgba(144, 202, 249, 0.2); line-height: 1.5;
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
        display: inline-block; padding: 2px 8px; border-radius: 4px;
        background: rgba(144, 202, 249, 0.1); color: #3d99e3;
        font-size: 10px; font-weight: 700; text-transform: uppercase;
        margin-bottom: 8px; letter-spacing: 0.5px;
      }
      
      .guide-title .ms { font-size: 22px; margin-right: 4px; }
      #guide-toggle .ms { font-size: 18px; }
      
      .ms { 
        font-family: 'Material Symbols Rounded'; font-size: 18px; font-style: normal; 
        font-weight: normal; line-height: 1; display: inline-flex; 
        align-items: center; vertical-align: middle; 
      }
    `
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
            <h3><span class="ms" style="font-size:18px;">sync</span> Sinkronisasi Data Akun</h3>
            <p>Saat baru memasang mod atau pertama kali login, pastikan profil di <b>Pengaturan</b> sudah sesuai. Jika data pertemuan belum muncul:</p>
            <div class="guide-card">
              • <b>Update Data:</b> Silakan buka salah satu Forum atau Mata Kuliah, lalu klik tombol <b>refresh</b> pada tab Forum untuk sinkronisasi data secara otomatis.
            </div>
          </div>

          <div class="guide-section">
            <span class="tip-badge">Tutorial 01</span>
            <h3><span class="ms" style="font-size:18px;">auto_awesome</span> Gemini AI Assistant</h3>
            <p>Gunakan asisten AI untuk membantu meringkas diskusi atau menjawab soal. Klik ikon <b>auto_awesome</b> (Oranye) di header.</p>
            <div class="guide-card">
              • <b>Ambil Soal:</b> Gunakan ikon 'paste search' untuk mendeteksi soal di halaman secara otomatis.<br>
              • <b>Quick Commands:</b> Klik pill (Pilih multi) untuk mengatur gaya jawaban (Ringkas, Natural, dll).
            </div>
          </div>

          <div class="guide-section">
            <span class="tip-badge">Tutorial 02</span>
            <h3><span class="ms" style="font-size:18px;">quiz</span> Auto Finish Quiz</h3>
            <p>Fitur ini membantu Anda menyelesaikan kuis dengan lebih cepat. Dapat diaktifkan melalui tab <b>Pengaturan</b>.</p>
            <div class="guide-card">
              • Gunakan dengan bijak. Selalu pastikan jawaban yang dihasilkan AI sudah sesuai sebelum melakukan submit final.
            </div>
          </div>

          <div class="guide-section">
            <span class="tip-badge">Tips API</span>
            <h3><span class="ms" style="font-size:18px;">vpn_key</span> Mengatasi Error 429</h3>
            <p>Jika muncul pesan <i>"Rate Limit Tercapai"</i>, berarti kuota harian model tersebut sudah habis.</p>
            <div class="guide-card">
              • <b>Solusi:</b> Buka Pengaturan, lalu ganti Model ke versi lain (misal dari Flash 2.0 ke Flash 1.5) atau gunakan API Key cadangan.
            </div>
          </div>

          <div class="guide-section">
            <span class="tip-badge">Fitur Forum</span>
            <h3><span class="ms" style="font-size:18px;">forum</span> Pantau Balasan Dosen</h3>
            <p>Tidak perlu cek forum satu per satu. Cukup buka popup Mentari Mod (Ikon Api) dan cek tab <b>Notifikasi</b>.</p>
            <div class="guide-card">
              • Seluruh balasan terbaru dari Dosen akan dikumpulkan di satu tempat lengkap dengan link menuju diskusinya.
            </div>
          </div>

          <div style="text-align:center; opacity:0.3; font-size:10px; padding-bottom:10px;">
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
              document.getElementById("token-runner-popup")?.classList.remove("active");
              document.getElementById("gemini-chat-container")?.classList.remove("active");
              
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

      document.getElementById("guide-close-btn").onclick = () => container.classList.remove("active");
      container.onclick = (e) => e.stopPropagation();
      document.addEventListener("click", () => container.classList.remove("active"));
    }
  };

  UIRenderer.injectStyles();
  UIRenderer.createInterface();

})();
