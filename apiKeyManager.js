// apiKeyManager.js
function initializeApiKeyManager() {
  console.log("API Key Manager initializing...");
  // Check if API key already exists in localStorage
  const storedApiKey = localStorage.getItem("geminiApiKey");

  if (!storedApiKey) {
    console.log("No API key found, showing popup...");
    // Tunggu sebentar untuk memastikan DOM sudah siap
    setTimeout(() => {
      showApiKeyPopup();
    }, 1000);
    return null;
  }

  console.log("API key found, returning...");
  return atob(storedApiKey);
}

// Fungsi untuk memastikan API Key Manager diinisialisasi saat halaman dimuat
(function () {
  // Jalankan setelah DOM loaded dalam konteks ekstensi
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", onDOMReady);
  } else {
    onDOMReady();
  }

  function onDOMReady() {
    // Menunggu sedikit untuk memastikan semua elemen halaman telah dimuat
    setTimeout(() => {
      const apiKey = initializeApiKeyManager();
      // Jika API key sudah ada, langsung inisialisasi chatbot
      if (apiKey) {
        if (typeof createChatbotInterface === "function") {
          createChatbotInterface(apiKey);
        }
      }
    }, 1500);
  }
})();

function setupApiKeyPopupEventListeners() {
  // Get elements
  const saveButton = document.getElementById("gemini_saveApiKeyButton");
  const apiKeyInput = document.getElementById("gemini_apiKeyInput");
  const toggleVisibilityButton = document.getElementById(
    "gemini_toggleApiKeyVisibility"
  );

  // Toggle API key visibility
  if (toggleVisibilityButton) {
    toggleVisibilityButton.addEventListener("click", function () {
      const input = document.getElementById("gemini_apiKeyInput");
      if (input.type === "password") {
        input.type = "text";
      } else {
        input.type = "password";
      }
    });
  }

  // Save API key
  if (saveButton && apiKeyInput) {
    saveButton.addEventListener("click", function () {
      const apiKey = apiKeyInput.value.trim();

      if (apiKey) {
        // Encode and save API key to localStorage
        localStorage.setItem("geminiApiKey", btoa(apiKey));

        // Remove popup
        const overlay = document.getElementById("gemini_apiKeyOverlay");
        if (overlay) {
          overlay.remove();
        }

        // Reinitialize chatbot with new API key
        loadChatbotWithApiKey(apiKey);
      } else {
        alert("Silakan masukkan API key yang valid");
      }
    });
  }
}

function validateApiKey(apiKey) {
  // Langkah 1: Mengecek format API key menggunakan regex
  const apiKeyRegex = /^AIza[a-zA-Z0-9_-]{30,}$/;

  if (!apiKeyRegex.test(apiKey)) {
    return {
      valid: false,
      message:
        "Format API key tidak valid. API key harus dimulai dengan 'AIza' diikuti minimal 30 karakter",
    };
  }

  // Periksa panjang minimal 30 karakter
  if (apiKey.length < 35) {
    // AIza + minimal 31 karakter
    return {
      valid: false,
      message: "API key harus minimal 35 karakter",
    };
  }

  // Periksa mengandung huruf besar
  if (!/[A-Z]/.test(apiKey)) {
    return {
      valid: false,
      message: "API key harus mengandung minimal 1 huruf besar",
    };
  }

  // Periksa mengandung huruf kecil
  if (!/[a-z]/.test(apiKey)) {
    return {
      valid: false,
      message: "API key harus mengandung minimal 1 huruf kecil",
    };
  }

  // Periksa mengandung angka
  if (!/[0-9]/.test(apiKey)) {
    return {
      valid: false,
      message: "API key harus mengandung minimal 1 angka",
    };
  }

  return {
    valid: true,
    message: "Format API key valid",
  };
}

// Langkah 2: Melakukan request ke Google AI API untuk memverifikasi API key

function showApiKeyPopup() {
  console.log("Showing API Key popup...");
  if (document.getElementById("gemini_apiKeyPopup")) {
    console.log("Popup already exists");
    return;
  }

  const savedApiKey = localStorage.getItem("geminiApiKey");
  const decodedApiKey = savedApiKey ? atob(savedApiKey) : "";

  const popupHtml = `
    <div id="gemini_apiKeyOverlay" class="gemini_api-key-overlay">
      <div id="gemini_apiKeyPopup" class="gemini_api-key-popup">
        <div class="gemini_popup-header">
          <div style="font-weight:500;color:#fff;">Gemini API Key</div>
        </div>
        
        <div class="gemini_popup-content">
          <div style="margin-bottom:15px;color:#999;font-size:13px;line-height:1.4;">
            Masukkan API key dari Google AI Studio untuk menggunakan Gemini Assistant.
          </div>

          <div class="gemini_tutorial-section">
            <div style="color:#4CAF50;font-weight:500;margin-bottom:8px;font-size:13px;">Tutorial Mendapatkan API Key:</div>
            <ol style="margin:0;padding-left:20px;color:#999;font-size:12px;line-height:1.6;">
              <li>Kunjungi <a href="https://aistudio.google.com/apikey" target="_blank" style="color:#4CAF50;text-decoration:none;">Google AI Studio</a></li>
              <li>Login dengan akun Google Anda</li>
              <li>Klik <strong>"Create API Key"</strong></li>
              <li>Copy API key yang diberikan</li>
              <li>Paste API key tersebut di form di bawah ini</li>
            </ol>
          </div>
          
          <div class="gemini_input-section">
            <div style="position:relative;width:100%;">
              <input type="password" id="gemini_apiKeyInput" placeholder="Masukkan API key Anda..." value="${decodedApiKey}" style="width:100%;padding:8px 36px 8px 12px;background:#2a2a2a;border:1px solid #333;border-radius:4px;color:#fff;font-size:13px;transition:all 0.2s;">
              <button id="gemini_toggleApiKeyVisibility" style="position:absolute;right:32px;top:50%;transform:translateY(-50%);background:none;border:none;color:#999;cursor:pointer;padding:4px;transition:color 0.2s;">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
                  <circle cx="12" cy="12" r="3"></circle>
                </svg>
              </button>
              <button id="gemini_pasteApiKey" title="Tempel API key" style="position:absolute;right:8px;top:50%;transform:translateY(-50%);background:none;border:none;color:#999;cursor:pointer;padding:4px;transition:color 0.2s;">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect>
                  <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path>
                </svg>
              </button>
            </div>
          </div>
          
          <div id="gemini_validationMessage" class="gemini_validation-message"></div>
          
          <div style="margin-top:15px;display:flex;justify-content:space-between;align-items:center;">
            <div style="color:#999;font-size:12px;">API key akan disimpan secara lokal dan dienkripsi.</div>
            <button id="gemini_saveApiKeyButton" style="background:#4CAF50;color:#fff;border:none;border-radius:4px;padding:8px 16px;font-size:13px;font-weight:500;cursor:pointer;transition:background 0.2s;">Simpan</button>
          </div>
        </div>
      </div>
    </div>
  `;

  const popupElement = document.createElement("div");
  popupElement.innerHTML = popupHtml;

  if (document.body) {
    document.body.appendChild(popupElement);
    console.log("Popup element appended to body");
    addApiKeyPopupStyles();
    setupApiKeyPopupEventListeners();
  } else {
    console.error("Document body not found!");
  }
}

async function verifyApiKeyWithGoogle(apiKey) {
  try {
    const response = await fetch(
      "https://generativelanguage.googleapis.com/v1beta/models?key=" + apiKey
    );

    if (response.ok) {
      return {
        valid: true,
        message: "API key valid dan aktif",
      };
    } else {
      const errorData = await response.json();
      return {
        valid: false,
        message: `API key tidak valid atau expired: ${
          errorData.error?.message || "Unknown error"
        }`,
      };
    }
  } catch (error) {
    return {
      valid: false,
      message: `Tidak dapat memverifikasi API key: ${error.message}`,
    };
  }
}

function setupApiKeyPopupEventListeners() {
  // Get elements
  const saveButton = document.getElementById("gemini_saveApiKeyButton");
  const apiKeyInput = document.getElementById("gemini_apiKeyInput");
  const toggleVisibilityButton = document.getElementById(
    "gemini_toggleApiKeyVisibility"
  );
  const validationMessageElement = document.getElementById(
    "gemini_validationMessage"
  );

  // Tambahkan styling untuk tampilan pesan validasi yang lebih profesional
  if (validationMessageElement) {
    validationMessageElement.style.padding = "10px 15px";
    validationMessageElement.style.borderRadius = "2px";
    validationMessageElement.style.margin = "10px 0";
    validationMessageElement.style.fontSize = "12px";
    validationMessageElement.style.fontWeight = "500";
    validationMessageElement.style.display = "none";
    validationMessageElement.style.transition = "all 0.3s ease";
  }

  // Toggle API key visibility
  if (toggleVisibilityButton) {
    toggleVisibilityButton.addEventListener("click", function () {
      const input = document.getElementById("gemini_apiKeyInput");
      if (input.type === "password") {
        input.type = "text";
        toggleVisibilityButton.innerHTML = '<i class="fas fa-eye-slash"></i>';
      } else {
        input.type = "password";
        toggleVisibilityButton.innerHTML = '<i class="fas fa-eye"></i>';
      }
    });
  }

  // Handle paste API key button
  const pasteApiKeyButton = document.getElementById("gemini_pasteApiKey");
  if (pasteApiKeyButton && apiKeyInput) {
    pasteApiKeyButton.addEventListener("click", async function() {
      try {
        const text = await navigator.clipboard.readText();
        if (text) {
          apiKeyInput.value = text.trim();
          // Beri umpan balik visual
          const originalColor = pasteApiKeyButton.style.color;
          pasteApiKeyButton.style.color = '#4CAF50';
          setTimeout(() => {
            pasteApiKeyButton.style.color = originalColor;
          }, 500);
        }
      } catch (err) {
        console.error('Gagal membaca clipboard:', err);
        // Tampilkan pesan error jika akses clipboard ditolak
        if (validationMessageElement) {
          validationMessageElement.textContent = 'Tidak dapat mengakses clipboard. Silakan paste manual (Ctrl+V).';
          validationMessageElement.style.display = 'block';
          validationMessageElement.style.backgroundColor = '#ffebee';
          validationMessageElement.style.color = '#c62828';
        }
      }
    });
  }

  // Save API key
  if (saveButton && apiKeyInput) {
    saveButton.addEventListener("click", async function () {
      saveButton.disabled = true;
      saveButton.innerHTML =
        '<i class="fas fa-spinner fa-spin"></i> Verifikasi...';

      const apiKey = apiKeyInput.value.trim();

      // Tampilkan pesan validasi dengan animasi
      showValidationMessage("Memverifikasi API key...", "info");

      // Validasi format API key
      const formatValidation = validateApiKey(apiKey);
      if (!formatValidation.valid) {
        showValidationMessage(formatValidation.message, "error");
        resetSaveButton();
        return;
      }

      // Verifikasi API key dengan Google AI API
      const apiValidation = await verifyApiKeyWithGoogle(apiKey);
      if (apiValidation.valid) {
        showValidationMessage(apiValidation.message, "success");

        // Encode and save API key to localStorage
        localStorage.setItem("geminiApiKey", btoa(apiKey));

        // Tampilkan pesan sukses dan tutup popup setelah 2 detik
        setTimeout(() => {
          // Remove popup
          const overlay = document.getElementById("gemini_apiKeyOverlay");
          if (overlay) {
            overlay.remove();
          }

          // Reinitialize chatbot with new API key
          loadChatbotWithApiKey(apiKey);
        }, 2000);
      } else {
        showValidationMessage(apiValidation.message, "error");
        resetSaveButton();
      }
    });

    // Validasi real-time format saat input berubah
    apiKeyInput.addEventListener("input", function () {
      const apiKey = apiKeyInput.value.trim();

      if (apiKey.length === 0) {
        hideValidationMessage();
        return;
      }

      const formatValidation = validateApiKey(apiKey);

      if (formatValidation.valid) {
        showValidationMessage(
          formatValidation.message +
            " (akan diverifikasi saat tombol Simpan ditekan)",
          "info"
        );
      } else {
        showValidationMessage(formatValidation.message, "error");
      }
    });
  }

  // Fungsi untuk menampilkan pesan validasi dengan styling yang lebih profesional
  function showValidationMessage(message, type) {
    if (!validationMessageElement) return;

    validationMessageElement.style.display = "block";
    validationMessageElement.style.opacity = "0";

    // Set warna dan ikon berdasarkan tipe pesan
    switch (type) {
      case "success":
        validationMessageElement.style.backgroundColor = "#e6f7e6";
        validationMessageElement.style.color = "#2e7d32";
        validationMessageElement.style.border = "1px solid #b4e6b4";
        message = '<i class="fas fa-check-circle"></i> ' + message;
        break;
      case "error":
        validationMessageElement.style.backgroundColor = "#fdeded";
        validationMessageElement.style.color = "#d32f2f";
        validationMessageElement.style.border = "1px solid #f5c6cb";
        message = '<i class="fas fa-exclamation-circle"></i> ' + message;
        break;
      case "info":
      default:
        validationMessageElement.style.backgroundColor = "#e6f0fd";
        validationMessageElement.style.color = "#1565c0";
        validationMessageElement.style.border = "1px solid #b3d7ff";
        message = '<i class="fas fa-info-circle"></i> ' + message;
        break;
    }

    validationMessageElement.innerHTML = message;

    // Animasi fade in
    setTimeout(() => {
      validationMessageElement.style.opacity = "1";
    }, 10);
  }

  // Fungsi untuk menyembunyikan pesan validasi
  function hideValidationMessage() {
    if (!validationMessageElement) return;
    validationMessageElement.style.opacity = "0";
    setTimeout(() => {
      validationMessageElement.style.display = "none";
    }, 300);
  }

  // Reset tombol simpan ke kondisi awal
  function resetSaveButton() {
    if (!saveButton) return;
    saveButton.disabled = false;
    saveButton.innerHTML = "Simpan";
  }
}

function addApiKeyPopupStyles() {
  const styleElement = document.createElement("style");
  styleElement.textContent = `
    .gemini_api-key-overlay {
      position: fixed;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      background: rgba(0, 0, 0, 0.7);
      display: flex;
      justify-content: center;
      align-items: center;
      z-index: 1000000;
    }
    
    .gemini_api-key-popup {
      position: fixed;
      z-index: 10000;
      min-width: 300px;
      max-width: 400px;
      width: auto;
      top: 20px;
      right: 20px;
      background: #1e1e1e;
      color: #fff;
      border-radius: 8px;
      box-shadow: 0 4px 12px rgba(0,0,0,0.5);
      font-family: system-ui;
      font-size: 13px;
      border: 1px solid #333;
      overflow: hidden;
      animation: gemini_fadeIn 0.2s ease-out;
    }
    
    @keyframes gemini_fadeIn {
      from { opacity: 0; transform: translateY(-10px); }
      to { opacity: 1; transform: translateY(0); }
    }
    
    .gemini_popup-header {
      padding: 10px 14px;
      background: #2a2a2a;
      border-bottom: 1px solid #333;
    }
    
    .gemini_popup-content {
      padding: 15px;
    }

    .gemini_tutorial-section {
      background: #2a2a2a;
      border-radius: 4px;
      padding: 12px;
      margin: 15px 0;
      border: 1px solid #333;
    }
    
    .gemini_input-section {
      margin: 15px 0;
    }
    
    .gemini_input-section input:focus {
      outline: none;
      border-color: #4CAF50;
    }
    
    .gemini_input-section button:hover {
      color: #fff;
    }
    
    .gemini_validation-message {
      margin: 10px 0;
      padding: 8px 12px;
      border-radius: 4px;
      font-size: 12px;
      display: none;
      transition: all 0.3s ease;
    }
    
    .gemini_validation-message.success {
      background: rgba(76, 175, 80, 0.1);
      border: 1px solid rgba(76, 175, 80, 0.2);
      color: #4CAF50;
    }
    
    .gemini_validation-message.error {
      background: rgba(244, 67, 54, 0.1);
      border: 1px solid rgba(244, 67, 54, 0.2);
      color: #f44336;
    }
    
    .gemini_validation-message.info {
      background: rgba(33, 150, 243, 0.1);
      border: 1px solid rgba(33, 150, 243, 0.2);
      color: #2196f3;
    }
    
    #gemini_saveApiKeyButton:hover {
      background: #45a049;
    }

    .gemini_tutorial-section a:hover {
      text-decoration: underline;
    }
  `;

  document.head.appendChild(styleElement);
}

function loadChatbotWithApiKey(apiKey) {
  // Check if chatbot exists and remove if needed
  const existingChatbot = document.getElementById("geminiChatbot");
  if (existingChatbot) {
    const parentElement = existingChatbot.parentElement;
    if (parentElement) {
      parentElement.remove();
    }
  }

  // Call the original chatbot initialization function with the new API key
  createChatbotInterface(apiKey);
}

// Function to get API key whenever needed in the application
function getGeminiApiKey() {
  const storedKey = localStorage.getItem("geminiApiKey");
  return storedKey ? atob(storedKey) : null;
}

document.addEventListener("DOMContentLoaded", function () {
  // Cek apakah sudah ada API key
  const storedApiKey = localStorage.getItem("geminiApiKey");
  if (!storedApiKey) {
    // Jika belum ada API key, tampilkan popup
    showApiKeyPopup();
  } else {
    // Jika sudah ada API key, inisialisasi chatbot dengan API key yang ada
    const apiKey = atob(storedApiKey);
    createChatbotInterface(apiKey);
  }
});
