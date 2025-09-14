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

function createQuickSurveyToggle() {
  // Remove existing elements first
  const existingToggle = document.getElementById("quickSurveyToggle");
  if (existingToggle) existingToggle.remove();

  // Gunakan container yang sama dengan presensi jika ada
  let container = document.getElementById("floatingButtonContainer");
  if (!container) {
    container = document.createElement("div");
    container.id = "floatingButtonContainer";
    container.style.cssText = `
      position: fixed;
      bottom: 20px;
      left: 20px;
      display: flex;
      flex-direction: row;
      gap: 10px;
      z-index: 9999;
    `;
    document.body.appendChild(container);
  }

  // Buat tombol Quick Survey
  const toggleButton = document.createElement("button");
  toggleButton.id = "quickSurveyToggle";
  toggleButton.textContent = "Quick Survey";
  toggleButton.style.cssText = `
    padding: 8px 14px;
    background-color: #1e293b;
    color: white;
    border: none;
    border-radius: 6px;
    cursor: pointer;
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, 'Open Sans', 'Helvetica Neue', sans-serif;
    font-weight: 500;
    font-size: 13px;
    transition: background 0.2s;
    box-shadow: 0 2px 5px rgba(0, 0, 0, 0.2);
  `;
  toggleButton.onmouseover = function () {
    this.style.backgroundColor = "#334155";
  };
  toggleButton.onmouseout = function () {
    this.style.backgroundColor = "#1e293b";
  };
  // Add click handler
  toggleButton.addEventListener("click", (e) => {
    e.preventDefault();
    e.stopPropagation();

    const popup = document.getElementById("quickSurveyPopup");
    const overlay = document.getElementById("quickSurveyPopupOverlay");

    if (popup && overlay) {
      const isVisible = popup.style.display === "block";

      if (isVisible) {
        popup.style.display = "none";
        overlay.style.display = "none";
        toggleButton.style.backgroundColor = "#1e293b";
      } else {
        popup.style.display = "block";
        overlay.style.display = "block";
        toggleButton.style.backgroundColor = "#334155";
      }
    } else {
      console.log("Popup or overlay not found, creating new ones...");
      createQuickSurveyPopup();
      // Try again after creation
      setTimeout(() => {
        const newPopup = document.getElementById("quickSurveyPopup");
        const newOverlay = document.getElementById("quickSurveyPopupOverlay");
        if (newPopup && newOverlay) {
          newPopup.style.display = "block";
          newOverlay.style.display = "block";
          toggleButton.style.backgroundColor = "#059669";
        }
      }, 100);
    }
  });

  container.appendChild(toggleButton);
}

function createQuickSurveyPopup() {
  // Remove existing popup elements
  const existingPopup = document.getElementById("quickSurveyPopup");
  if (existingPopup) {
    existingPopup.remove();
  }

  const existingOverlay = document.getElementById("quickSurveyPopupOverlay");
  if (existingOverlay) {
    existingOverlay.remove();
  }

  // Create popup container
  const popupContainer = document.createElement("div");
  popupContainer.id = "quickSurveyPopup";
  popupContainer.style.cssText = `
    position: fixed;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    background-color: #1e1e1e;
    padding: 20px;
    border-radius: 10px;
    box-shadow: 0 8px 30px rgba(0, 0, 0, 0.5);
    z-index: 10000;
    width: 90%;
    max-width: 400px;
    max-height: 90vh;
    overflow-y: auto;
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, 'Open Sans', 'Helvetica Neue', sans-serif;
    color: #e0e0e0;
    display: none;
  `;

  popupContainer.innerHTML = `
    <div style="margin-bottom: 16px; border-bottom: 1px solid #333; padding-bottom: 12px;">
      <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 10px;">
        <h2 style="margin: 0; font-size: 20px; font-weight: 600; color: #fff;">Quick Survey</h2>
        <button id="close-quick-survey" style="background: none; border: none; cursor: pointer; color: #aaa; font-size: 20px;">×</button>
      </div>
      <p style="margin: 0; font-size: 13px; color: #aaa;">Pilih salah satu opsi untuk mengisi kuisioner</p>
    </div>

    <div style="display: flex; flex-direction: column; gap: 14px;">
      <div style="background-color: #2a2a2a; border-radius: 8px; padding: 14px; border: 1px solid #333;">
        <p style="margin: 0 0 10px 0; font-weight: 500; color: #ddd;">Penilaian kinerja dosen:</p>
        <div style="display: flex; justify-content: space-between; gap: 5px;">
          <button class="star-btn" data-rating="1" style="flex: 1; background-color: #7f1d1d; color: white; border: none; padding: 10px 0; border-radius: 6px; cursor: pointer; font-weight: 500; transition: all 0.2s ease;">1<br><span style="font-size: 10px;">Sangat Kurang</span></button>
          <button class="star-btn" data-rating="2" style="flex: 1; background-color: #92400e; color: white; border: none; padding: 10px 0; border-radius: 6px; cursor: pointer; font-weight: 500; transition: all 0.2s ease;">2<br><span style="font-size: 10px;">Kurang</span></button>
          <button class="star-btn" data-rating="3" style="flex: 1; background-color: #854d0e; color: white; border: none; padding: 10px 0; border-radius: 6px; cursor: pointer; font-weight: 500; transition: all 0.2s ease;">3<br><span style="font-size: 10px;">Cukup</span></button>
          <button class="star-btn" data-rating="4" style="flex: 1; background-color: #3f6212; color: white; border: none; padding: 10px 0; border-radius: 6px; cursor: pointer; font-weight: 500; transition: all 0.2s ease;">4<br><span style="font-size: 10px;">Baik</span></button>
          <button class="star-btn" data-rating="5" style="flex: 1; background-color: #065f46; color: white; border: none; padding: 10px 0; border-radius: 6px; cursor: pointer; font-weight: 500; transition: all 0.2s ease;">5<br><span style="font-size: 10px;">Sangat Baik</span></button>
        </div>
      </div>

      <div style="background-color: #2a2a2a; border-radius: 8px; padding: 14px; border: 1px solid #333;">
        <p style="margin: 0 0 10px 0; font-weight: 500; color: #ddd;">Opsi lainnya:</p>
        <div style="display: flex; flex-direction: column; gap: 8px;">
          <button id="setuju" style="background-color: #3f6212; color: white; border: none; padding: 8px 12px; border-radius: 6px; cursor: pointer; font-weight: 500; transition: all 0.2s ease;">Pilih Semua "Setuju"</button>
          <button id="random" style="background-color: #854d0e; color: white; border: none; padding: 8px 12px; border-radius: 6px; cursor: pointer; font-weight: 500; transition: all 0.2s ease;">Random (Tanpa "Sangat Tidak Setuju")</button>
          <button id="fullRandom" style="background-color: #5b21b6; color: white; border: none; padding: 8px 12px; border-radius: 6px; cursor: pointer; font-weight: 500; transition: all 0.2s ease;">Acak Total</button>
        </div>
      </div>
    </div>

    <div style="margin-top: 16px; text-align: center; font-size: 11px; color: #777;">
      &copy; 2025 Created by <a href="https://github.com/Lukman754" target="_blank" style="color: #6d9ee7; text-decoration: none;">Lukman754</a>
    </div>
  `;

  // Create overlay
  const overlay = document.createElement("div");
  overlay.id = "quickSurveyPopupOverlay";
  overlay.style.cssText = `
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background-color: rgba(0, 0, 0, 0.5);
    z-index: 9999;
    display: none;
  `;

  // Add elements to document
  document.body.appendChild(overlay);
  document.body.appendChild(popupContainer);

  // Add close functionality
  document
    .getElementById("close-quick-survey")
    .addEventListener("click", () => {
      const toggleButton = document.getElementById("quickSurveyToggle");
      if (toggleButton) {
        toggleButton.click();
      }
    });

  overlay.addEventListener("click", () => {
    const toggleButton = document.getElementById("quickSurveyToggle");
    if (toggleButton) {
      toggleButton.click();
    }
  });

  // Add hover effects to buttons
  const buttons = popupContainer.querySelectorAll(
    "button:not(#close-quick-survey)"
  );
  buttons.forEach((button) => {
    button.onmouseover = function () {
      this.style.opacity = "0.9";
      this.style.transform = "translateY(-1px)";
    };
    button.onmouseout = function () {
      this.style.opacity = "1";
      this.style.transform = "translateY(0)";
    };
  });

  // Setup event listeners immediately after creating the popup
  setupQuickSurveyEventListeners();

  console.log("Popup created and added to DOM"); // Debug log
}

function setupQuickSurveyEventListeners() {
  // Check if we're in a Chrome extension context
  const isExtension =
    typeof chrome !== "undefined" && chrome.tabs && chrome.scripting;

  // Event listeners for star rating buttons
  document.querySelectorAll(".star-btn").forEach((button) => {
    button.addEventListener("click", () => {
      const rating = button.getAttribute("data-rating");
      console.log(`Star ${rating} button clicked`); // Debug log

      if (isExtension) {
        chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
          chrome.scripting.executeScript({
            target: { tabId: tabs[0].id },
            function: automateFlow,
            args: [`star${rating}`],
          });
        });
      } else {
        // If not in extension context, run directly
        automateFlow(`star${rating}`);
      }

      // Hide popup
      const popup = document.getElementById("quickSurveyPopup");
      const overlay = document.getElementById("quickSurveyPopupOverlay");
      if (popup && overlay) {
        popup.style.display = "none";
        overlay.style.display = "none";
        const toggleButton = document.getElementById("quickSurveyToggle");
        if (toggleButton) {
          toggleButton.style.backgroundColor = "#1e293b";
        }
      }
    });
  });

  // Other button event listeners
  const buttons = [
    { id: "setuju", mode: "Setuju" },
    { id: "random", mode: "Random" },
    { id: "fullRandom", mode: "FullRandom" },
  ];

  buttons.forEach(({ id, mode }) => {
    const button = document.getElementById(id);
    if (button) {
      button.addEventListener("click", () => {
        console.log(`${id} button clicked`); // Debug log

        if (isExtension) {
          chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
            chrome.scripting.executeScript({
              target: { tabId: tabs[0].id },
              function: automateFlow,
              args: [mode],
            });
          });
        } else {
          // If not in extension context, run directly
          automateFlow(mode);
        }

        // Hide popup
        const popup = document.getElementById("quickSurveyPopup");
        const overlay = document.getElementById("quickSurveyPopupOverlay");
        if (popup && overlay) {
          popup.style.display = "none";
          overlay.style.display = "none";
          const toggleButton = document.getElementById("quickSurveyToggle");
          if (toggleButton) {
            toggleButton.style.backgroundColor = "#1e293b";
        }
        }
      });
    }
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

  // Buat elemen baru
  createQuickSurveyToggle();
  createQuickSurveyPopup();
}

// Jalankan observasi URL saat script dimuat
console.log("=== SCRIPT UNTUK QUICK SURVEY UNPAM ===");
console.log("Memulai observasi perubahan URL...");
observeUrlChanges();

// Pastikan tombol langsung muncul jika URL cocok saat script pertama kali dijalankan
checkUrlAndInitialize();
