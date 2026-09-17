function automateFlow(mode) {
  function clickRadios(mode) {
    if (mode === "Setuju") {
      // Pilih "Sering" (index 2) untuk semua pertanyaan
      document.querySelectorAll('[role="radiogroup"]').forEach((group) => {
        const radios = Array.from(group.querySelectorAll('[role="radio"]'));
        if (radios.length >= 3) {
          radios[2].click(); // Index 2 = "Sering"
        }
      });
    } else if (mode === "Random") {
      // Random tanpa "Tidak Pernah" - pilih dari index 1, 2, 3
      document.querySelectorAll('[role="radiogroup"]').forEach((group) => {
        const radios = Array.from(group.querySelectorAll('[role="radio"]'));
        if (radios.length >= 4) {
          // Buat array dengan weight: index 1 = 1x, index 2 = 2x, index 3 = 2x
          const weightedChoices = [];
          weightedChoices.push(1); // "Kadang-kadang" 1x
          weightedChoices.push(2, 2); // "Sering" 2x
          weightedChoices.push(3, 3); // "Selalu" 2x

          const randomChoice =
            weightedChoices[Math.floor(Math.random() * weightedChoices.length)];
          radios[randomChoice].click();
        }
      });
    } else if (mode.startsWith("star")) {
      const rating = parseInt(mode.slice(4));
      document.querySelectorAll('[role="radiogroup"]').forEach((group) => {
        const radios = Array.from(group.querySelectorAll('[role="radio"]'));

        // Urutan radio: [0="Tidak Pernah", 1="Kadang-kadang", 2="Sering", 3="Selalu"]
        let weights;
        switch (rating) {
          case 1: // ⭐ - Buruk
            weights = [0.7, 0.3, 0, 0]; // Lebih banyak "Tidak Pernah"
            break;
          case 2: // ⭐⭐ - Kurang
            weights = [0.3, 0.7, 0, 0]; // Lebih banyak "Kadang-kadang"
            break;
          case 3: // ⭐⭐⭐ - Cukup
            weights = [0, 0.4, 0.6, 0]; // Campuran "Kadang-kadang" dan "Sering"
            break;
          case 4: // ⭐⭐⭐⭐ - Baik
            weights = [0, 0, 0.7, 0.3]; // Lebih banyak "Sering"
            break;
          case 5: // ⭐⭐⭐⭐⭐ - Sangat Baik
            weights = [0, 0, 0.3, 0.7]; // Lebih banyak "Selalu"
            break;
        }

        const random = Math.random();
        let sum = 0;
        let selectedIndex = 0;
        for (let i = 0; i < weights.length; i++) {
          sum += weights[i];
          if (random < sum) {
            selectedIndex = i;
            break;
          }
        }

        if (radios[selectedIndex]) {
          radios[selectedIndex].click();
        }
      });
    } else {
      // FullRandom - pilih semua opsi termasuk "Tidak Pernah"
      document.querySelectorAll('[role="radiogroup"]').forEach((group) => {
        const radios = Array.from(group.querySelectorAll('[role="radio"]'));
        if (radios.length > 0) {
          const randomIndex = Math.floor(Math.random() * radios.length);
          radios[randomIndex].click();
        }
      });
    }
  }

  function clickNextButton() {
    function findAndClickButtons() {
      // Klik radio button terlebih dahulu
      clickRadios(mode);

      // Tunggu sebentar untuk memastikan radio button terpilih
      setTimeout(() => {
        const buttons = document.querySelectorAll(
          "button.q-btn.bg-blue-6.text-white"
        );
        let foundNextButton = false;

        buttons.forEach((button) => {
          const spanContent = button.querySelector(".block");
          if (spanContent) {
            if (spanContent.textContent === "SELANJUTNYA") {
              foundNextButton = true;
              button.click();
              // Setelah klik next, tunggu sebentar lalu cari tombol lagi
              setTimeout(findAndClickButtons, 500);
              return;
            }
          }
        });

        // Jika tidak ada tombol SELANJUTNYA, cari tombol SIMPAN
        if (!foundNextButton) {
          buttons.forEach((button) => {
            const spanContent = button.querySelector(".block");
            if (spanContent && spanContent.textContent === "SIMPAN") {
              button.click();
              return;
            }
          });
        }
      }, 500);
    }

    // Mulai proses
    findAndClickButtons();
  }
  clickRadios(mode);
  setTimeout(clickNextButton, 500);
}

const SurveyConfig = {
  APP_VERSION: "2.0 Sunset",
  STYLES: `
    @import url('https://fonts.googleapis.com/css2?family=Roboto:wght@400;500;700&display=swap');
    
    #quick-survey-popup-root {
      position: fixed; top: 0; left: 0; width: 100%; height: 100%;
      background: rgba(0,0,0,0.5); backdrop-filter: blur(5px);
      display: flex; justify-content: center; align-items: center;
      z-index: 10000; font-family: 'Roboto', sans-serif;
      animation: fadeIn 0.3s;
    }
    .survey-container {
      background: #121212; color: #eee; width: 90%; max-width: 450px;
      border-radius: 16px; border: 1px solid rgba(255,255,255,0.1);
      box-shadow: 0 15px 50px rgba(0,0,0,0.4); display: flex; flex-direction: column;
      overflow: hidden;
    }
    
    /* Light Theme Adaptation */
    #quick-survey-popup-root.light-theme .survey-container {
      background: #ffffff; color: #1a1c1e; border-color: rgba(0,0,0,0.1);
      box-shadow: 0 10px 40px rgba(0,0,0,0.1);
    }
    #quick-survey-popup-root.light-theme .popup-header { background: #f8f9fa; border-bottom-color: rgba(0,0,0,0.08); }
    #quick-survey-popup-root.light-theme .popup-title { color: #0d47a1; }
    #quick-survey-popup-root.light-theme .survey-card { background: #f8fafc; border-color: rgba(0,0,0,0.06); }
    #quick-survey-popup-root.light-theme .card-label { color: #64748b; }
    #quick-survey-popup-root.light-theme .survey-footer { background: #f8f9fa; border-top-color: rgba(0,0,0,0.08); }
    
    .popup-header { padding: 18px 24px; background: rgba(255,255,255,0.02); border-bottom: 1px solid rgba(255,255,255,0.06); display: flex; justify-content: space-between; align-items: center; }
    .popup-title { font-weight: 700; font-size: 18px; color: #3d99e3; margin: 0; display: flex; align-items: center; gap: 8px; }
    .popup-close-btn { background: none; border: none; color: inherit; opacity: 0.5; cursor: pointer; transition: 0.2s; }
    .popup-close-btn:hover { opacity: 1; transform: rotate(90deg); }
    
    .survey-body { padding: 20px; display: flex; flex-direction: column; gap: 16px; }
    .survey-card { background: rgba(255,255,255,0.02); border: 1px solid rgba(255,255,255,0.05); border-radius: 12px; padding: 16px; }
    .card-label { font-size: 11px; font-weight: 700; text-transform: uppercase; opacity: 0.6; margin-bottom: 12px; letter-spacing: 0.5px; }
    
    .star-grid { display: grid; grid-template-columns: repeat(5, 1fr); gap: 8px; }
    .rating-btn { 
      padding: 10px 0; border-radius: 8px; border: 1px solid transparent; 
      font-weight: 700; cursor: pointer; transition: all 0.2s; 
      display: flex; flex-direction: column; align-items: center; gap: 4px;
    }
    .rating-btn span { font-size: 9px; opacity: 0.8; font-weight: 500; text-align: center; }
    
    .btn-r1 { background: rgba(244, 67, 54, 0.1); color: #f44336; }
    .btn-r2 { background: rgba(255, 152, 0, 0.1); color: #ff9800; }
    .btn-r3 { background: rgba(255, 193, 7, 0.1); color: #ffc107; }
    .btn-r4 { background: rgba(139, 195, 74, 0.1); color: #8bc34a; }
    .btn-r5 { background: rgba(76, 175, 80, 0.1); color: #4caf50; }
    
    .rating-btn:hover { transform: translateY(-3px); box-shadow: 0 4px 12px rgba(0,0,0,0.2); border-color: currentColor; }
    
    .option-btn { 
      width: 100%; padding: 12px; border-radius: 8px; border: 1px solid rgba(255,255,255,0.05);
      background: rgba(255,255,255,0.02); color: inherit; font-weight: 600;
      cursor: pointer; transition: 0.2s; text-align: left; display: flex; align-items: center; gap: 10px; margin-bottom: 8px;
    }
    .option-btn:hover { background: rgba(61, 153, 227, 0.1); border-color: #3d99e3; color: #3d99e3; padding-left: 20px; }
    
    .survey-warning {
      background: rgba(250, 204, 21, 0.08); border: 1px solid rgba(250, 204, 21, 0.2);
      border-radius: 10px; padding: 12px; font-size: 11px; color: #facc15;
      line-height: 1.5; display: flex; gap: 10px; margin-bottom: 5px;
    }
    .survey-warning .ms { color: #facc15; font-size: 18px; flex-shrink: 0; }
    
    .survey-guide {
      background: rgba(61, 153, 227, 0.08); border: 1px solid rgba(61, 153, 227, 0.2);
      border-radius: 10px; padding: 12px; font-size: 11px; color: #3d99e3;
      line-height: 1.5; display: flex; gap: 10px; margin-bottom: 8px;
    }
    .survey-guide .ms { color: #3d99e3; font-size: 18px; flex-shrink: 0; }
    
    .survey-footer { padding: 16px 24px; background: rgba(255,255,255,0.02); border-top: 1px solid rgba(255,255,255,0.06); font-size: 11px; text-align: center; opacity: 0.6; }
    
    .quick-survey-trigger { 
      background: #1e293b; color: white; border: none; border-radius: 50px; 
      width: 42px; height: 42px; display: flex; align-items: center; justify-content: center;
      cursor: pointer; transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
      box-shadow: 0 4px 15px rgba(0,0,0,0.2); position: relative;
      overflow: hidden; isolation: isolate;
    }
    
    /* Animation Glow Purple */
    .quick-survey-trigger::after {
      content: '';
      position: absolute;
      inset: -20%;
      background: radial-gradient(circle at center, rgba(168, 85, 247, 0.9) 0%, rgba(181, 102, 255, 0.52) 40%, transparent 75%);
      border-radius: 50%;
      filter: blur(10px);
      z-index: 1;
      animation: survey-glow 2.5s ease-in-out infinite;
      pointer-events: none;
      mix-blend-mode: screen;
    }
    
    @keyframes survey-glow {
      0%, 100% { opacity: 0.4; transform: scale(0.9); }
      50% { opacity: 0.9; transform: scale(1.1); }
    }
    
    .quick-survey-trigger:hover { 
      background: #3d99e3; transform: translateY(-4px) scale(1.1); 
      box-shadow: 0 8px 25px rgba(61, 153, 227, 0.4);
    }
    .quick-survey-trigger:hover::after {
      background: radial-gradient(circle at center, rgba(181, 102, 255, 1) 0%, rgba(181, 102, 255, 0.5) 40%, transparent 75%);
      animation-duration: 1.2s;
    }
    
    /* Tooltip override - need higher z-index than after */
    .quick-survey-trigger::before {
      content: attr(data-title);
      position: absolute; bottom: 50px; left: 0;
      background: #1e293b; color: white; padding: 6px 12px; border-radius: 6px;
      font-size: 11px; white-space: nowrap; opacity: 0; pointer-events: none;
      transition: 0.2s; font-weight: 700;
      box-shadow: 0 4px 10px rgba(0,0,0,0.3);
      z-index: 10;
    }
    .quick-survey-trigger:hover::before { opacity: 1; bottom: 55px; }

    #quick-survey-popup-root.light-theme .quick-survey-trigger {
      background: #ffffff; color: #1e293b; 
      box-shadow: 0 4px 15px rgba(0,0,0,0.1);
    }
    
    .ms { font-family: 'Material Symbols Rounded'; font-size: 20px; font-style: normal; font-weight: normal; line-height: 1; display: inline-flex; align-items: center; vertical-align: middle; }
    @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
  `
};

function injectSurveyStyles() {
  if (document.getElementById("mentari-survey-styles")) return;
  const s = document.createElement("style"); s.id = "mentari-survey-styles";
  s.textContent = SurveyConfig.STYLES; document.head.appendChild(s);
  
  if (!document.getElementById("ms-presensi-icons")) {
    const l = document.createElement("link"); l.id = "ms-presensi-icons"; l.rel = "stylesheet";
    l.href = "https://fonts.googleapis.com/css2?family=Material+Symbols+Rounded:opsz,wght,FILL,GRAD@20,400,0,0";
    document.head.appendChild(l);
  }
}

function createQuickSurveyToggle() {
  injectSurveyStyles();
  let container = document.getElementById("floatingButtonContainer");
  if (!container) {
    container = document.createElement("div");
    container.id = "floatingButtonContainer";
    container.style.cssText = "position:fixed; bottom:20px; left:20px; display:flex; flex-direction:row; gap:12px; z-index:9999; align-items:flex-end;";
    document.body.appendChild(container);
  }

  if (document.getElementById("quickSurveyToggle")) return;
  const btn = document.createElement("button");
  btn.id = "quickSurveyToggle";
  btn.className = "quick-survey-trigger";
  btn.setAttribute("data-title", "Quick Survey Otomatis");
  btn.innerHTML = `<span class="ms">auto_awesome</span>`;
  btn.onclick = () => createQuickSurveyPopup();
  container.appendChild(btn);
}

function createQuickSurveyPopup() {
  const isLight = document.querySelector(".css-1yxmbwk") !== null;
  let root = document.getElementById("quick-survey-popup-root");
  if (root) root.remove();

  root = document.createElement("div");
  root.id = "quick-survey-popup-root";
  if (isLight) root.classList.add("light-theme");

  root.innerHTML = `
    <div class="survey-container">
      <div class="popup-header">
        <div class="popup-title"><span class="ms" style="color:#f0872d; font-size:24px;">bolt</span> Quick Survey</div>
        <button class="popup-close-btn" id="s-close-btn"><span class="ms">close</span></button>
      </div>
      
      <div class="survey-body">
        <div class="survey-guide">
          <span class="ms">info</span>
          <div>
            <strong>Cara Penggunaan:</strong> Klik "Isi Kuesioner" pada mata kuliah yang diinginkan di halaman KHS, lalu gunakan tombol di bawah ini untuk pengisian otomatis.
          </div>
        </div>

        <div class="survey-warning">
          <span class="ms">report</span>
          <div>
            <strong>Peringatan:</strong> Gunakan fitur ini dengan bijak. Quick Survey bekerja dengan mengisi penilaian secara otomatis berdasarkan rata-rata statistik dari rentang yang Anda pilih, bukan berdasarkan penilaian manual per poin.
          </div>
        </div>

        <div class="survey-card">
          <div class="card-label">Penilaian Kinerja Dosen</div>
          <div class="star-grid">
            <button class="rating-btn btn-r1" data-v="star1">1<span>Buruk</span></button>
            <button class="rating-btn btn-r2" data-v="star2">2<span>Kurang</span></button>
            <button class="rating-btn btn-r3" data-v="star3">3<span>Cukup</span></button>
            <button class="rating-btn btn-r4" data-v="star4">4<span>Baik</span></button>
            <button class="rating-btn btn-r5" data-v="star5">5<span>Sangat Baik</span></button>
          </div>
        </div>
        
        <div class="survey-card" style="padding:10px;">
          <div class="card-label" style="margin-bottom:8px;">Opsi Otomasi</div>
          <button class="option-btn" id="opt-all-good"><span class="ms">done_all</span> Pilih Semua "Setuju"</button>
          <button class="option-btn" id="opt-random-safe"><span class="ms">shuffle</span> Random (Aman)</button>
          <button class="option-btn" id="opt-chaos"><span class="ms">warning</span> Acak Total</button>
        </div>
      </div>
      
      <div class="survey-footer">
        Mod by Lukman754 • v${SurveyConfig.APP_VERSION}
      </div>
    </div>
  `;

  document.body.appendChild(root);
  root.onclick = (e) => { if (e.target === root) root.remove(); };
  document.getElementById("s-close-btn").onclick = () => root.remove();

  // Setup Event Listeners
  document.querySelectorAll(".rating-btn").forEach(btn => {
    btn.onclick = () => { automateFlow(btn.dataset.v); root.remove(); };
  });

  const actions = {
    "opt-all-good": "Setuju",
    "opt-random-safe": "Random",
    "opt-chaos": "FullRandom"
  };

  Object.entries(actions).forEach(([id, mode]) => {
    document.getElementById(id).onclick = () => { automateFlow(mode); root.remove(); };
  });
}


// Fungsi untuk mengecek URL dan menampilkan popup jika sesuai
function checkUrlAndInitialize() {
  const currentUrl = window.location.href;
  // Toleran: abaikan query string/hash
  const targetPrefix = "https://my.unpam.ac.id/data-akademik/khs";
  if (currentUrl.startsWith(targetPrefix)) {
    console.log(
      "URL matches target (with tolerance), initializing QuickSurvey..."
    );
    initializeQuickSurvey();
  } else {
    console.log("URL does not match target, removing QuickSurvey if exists...");
    // Remove existing elements if they exist
    const existingToggle = document.getElementById("quickSurveyToggle");
    if (existingToggle) existingToggle.remove();
    const existingPopup = document.getElementById("quickSurveyPopup");
    if (existingPopup) existingPopup.remove();
    const existingOverlay = document.getElementById("quickSurveyPopupOverlay");
    if (existingOverlay) existingOverlay.remove();
  }
}

// Fungsi untuk memantau perubahan URL
function observeUrlChanges() {
  let lastUrl = window.location.href;

  // Fungsi untuk mengecek perubahan URL
  function checkUrlChange() {
    const currentUrl = window.location.href;
    if (currentUrl !== lastUrl) {
      console.log("URL changed from", lastUrl, "to", currentUrl);
      lastUrl = currentUrl;
      checkUrlAndInitialize();
    }
  }

  // Menggunakan MutationObserver untuk memantau perubahan pada history
  const observer = new MutationObserver(() => {
    checkUrlChange();
  });

  // Mulai observasi
  observer.observe(document.body, {
    childList: true,
    subtree: true,
  });

  // Tambahkan event listener untuk popstate (untuk navigasi browser)
  window.addEventListener("popstate", checkUrlChange);

  // Tambahkan event listener untuk pushState dan replaceState
  const originalPushState = history.pushState;
  const originalReplaceState = history.replaceState;

  history.pushState = function () {
    originalPushState.apply(this, arguments);
    checkUrlChange();
  };

  history.replaceState = function () {
    originalReplaceState.apply(this, arguments);
    checkUrlChange();
  };

  // Cek URL saat script pertama kali dijalankan
  checkUrlAndInitialize();
}

// Modifikasi fungsi initializeQuickSurvey
function initializeQuickSurvey() {
  console.log("Initializing QuickSurvey..."); // Debug log

  // Hapus elemen yang ada terlebih dahulu
  const existingToggle = document.getElementById("quickSurveyToggle");
  if (existingToggle) {
    existingToggle.remove();
  }
  const existingPopup = document.getElementById("quickSurveyPopup");
  if (existingPopup) {
    existingPopup.remove();
  }
  const existingOverlay = document.getElementById("quickSurveyPopupOverlay");
  if (existingOverlay) {
    existingOverlay.remove();
  }

  // Buat elemen baru (Hanya toggle, popup dibuat saat diklik)
  createQuickSurveyToggle();
}

// Jalankan observasi URL saat script dimuat
console.log("=== SCRIPT UNTUK QUICK SURVEY UNPAM ===");
console.log("Memulai observasi perubahan URL...");
observeUrlChanges();

// Pastikan tombol langsung muncul jika URL cocok saat script pertama kali dijalankan
checkUrlAndInitialize();
