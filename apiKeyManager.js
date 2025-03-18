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
    console.log("DOM ready, checking for API key...");
    // Menunggu sedikit untuk memastikan semua elemen halaman telah dimuat
    setTimeout(() => {
      const apiKey = initializeApiKeyManager();
      // Jika API key sudah ada, langsung inisialisasi chatbot
      if (apiKey) {
        console.log("Initializing chatbot with existing API key");
        if (typeof createChatbotInterface === "function") {
          createChatbotInterface(apiKey);
        } else {
          console.error("createChatbotInterface function not found!");
        }
      }
    }, 1500);
  }
})();

function showApiKeyPopup() {
  console.log("Showing API Key popup...");
  // Check if popup already exists
  if (document.getElementById("gemini_apiKeyPopup")) {
    console.log("Popup already exists");
    return;
  }

  // Retrieve saved API key from local storage
  const savedApiKey = localStorage.getItem("geminiApiKey");
  const decodedApiKey = savedApiKey ? atob(savedApiKey) : "";

  // Create popup HTML
  const popupHtml = `
    <div id="gemini_apiKeyOverlay" class="gemini_api-key-overlay">
      <div id="gemini_apiKeyPopup" class="gemini_api-key-popup">
        <div class="gemini_popup-header">
          <h2>Gemini API Key Setup</h2>
        </div>
        
        <div class="gemini_popup-content">
          <p>Untuk menggunakan Gemini Assistant, Anda perlu memasukkan API key dari Google AI Studio.</p>
          
          <div class="gemini_tutorial-section">
            <h3>Tutorial Mendapatkan API Key:</h3>
            <ol>
                <li>Kunjungi <a href="https://aistudio.google.com/apikey" target="_blank">Google AI Studio</a></li>
                <li>Login dengan akun Google Anda</li>
                <li>Klik <strong>"Create API Key"</strong></li>
                <li>Copy API key yang diberikan, contohnya:  
                    <pre>AIzaSyD-..............defgHIJKLM</pre>
                </li>
                <li>Paste API key tersebut di form di bawah ini</li>
            </ol>
          </div>
          
          <div class="gemini_input-section">
            <label for="gemini_apiKeyInput">API Key Gemini:</label>
            <input type="password" id="gemini_apiKeyInput" placeholder="Masukkan API key Anda di sini..." value="${decodedApiKey}">
            <button id="gemini_toggleApiKeyVisibility" title="Tampilkan/Sembunyikan API Key">
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
                <circle cx="12" cy="12" r="3"></circle>
              </svg>
            </button>
          </div>
          
          <p class="gemini_security-note">API key Anda akan disimpan secara lokal dan dienkripsi (base64) di browser Anda.</p>
          
          <div class="gemini_popup-buttons">
            <button id="gemini_saveApiKeyButton" class="gemini_primary-button">Simpan API Key</button>
          </div>
        </div>
      </div>
    </div>
  `;

  const popupElement = document.createElement("div");
  popupElement.innerHTML = popupHtml;

  // Pastikan elemen popup ditambahkan dengan benar
  if (document.body) {
    document.body.appendChild(popupElement);
    console.log("Popup element appended to body");

    // Tambahkan styles dan event listeners
    addApiKeyPopupStyles();
    setupApiKeyPopupEventListeners();
  } else {
    console.error("Document body not found!");
  }
}

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
  // Check if popup already exists
  if (document.getElementById("gemini_apiKeyPopup")) {
    console.log("Popup already exists");
    return;
  }

  // Retrieve saved API key from local storage
  const savedApiKey = localStorage.getItem("geminiApiKey");
  const decodedApiKey = savedApiKey ? atob(savedApiKey) : "";

  // Create popup HTML
  const popupHtml = `
    <div id="gemini_apiKeyOverlay" class="gemini_api-key-overlay">
      <div id="gemini_apiKeyPopup" class="gemini_api-key-popup">
        <div class="gemini_popup-header">
          <h2>Gemini API Key Setup</h2>
        </div>
        
        <div class="gemini_popup-content">
          <p>Untuk menggunakan Gemini Assistant, Anda perlu memasukkan API key dari Google AI Studio.</p>
          
          <div class="gemini_tutorial-section">
            <h3>Tutorial Mendapatkan API Key:</h3>
            <ol>
                <li>Kunjungi <a href="https://aistudio.google.com/apikey" target="_blank">Google AI Studio</a></li>
                <li>Login dengan akun Google Anda</li>
                <li>Klik <strong>"Get API key"</strong> di pojok kiri atas</li>
                <li>Buat project baru atau pilih project yang sudah ada</li>
                <li>Copy API key yang diberikan, contohnya:  
                    <pre>AIzaSyD-..............defgHIJKLM</pre>
                </li>
                <li>Paste API key tersebut di form di bawah ini</li>
            </ol>
          </div>
          
          <div class="gemini_input-section">
            <label for="gemini_apiKeyInput">API Key Gemini:</label>
            <input type="password" id="gemini_apiKeyInput" placeholder="Masukkan API key Anda di sini..." value="${decodedApiKey}">
            <button id="gemini_toggleApiKeyVisibility" title="Tampilkan/Sembunyikan API Key">
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
                <circle cx="12" cy="12" r="3"></circle>
              </svg>
            </button>
          </div>
          
          <div id="gemini_validationMessage" class="gemini_validation-message"></div>
          
          
          <p class="gemini_security-note">API key Anda akan disimpan secara lokal dan dienkripsi (base64) di browser Anda.</p>
          
          <div class="gemini_popup-buttons">
            <button id="gemini_saveApiKeyButton" class="gemini_primary-button">Simpan API Key</button>
          </div>
        </div>
      </div>
    </div>
  `;

  const popupElement = document.createElement("div");
  popupElement.innerHTML = popupHtml;

  // Pastikan elemen popup ditambahkan dengan benar
  if (document.body) {
    document.body.appendChild(popupElement);
    console.log("Popup element appended to body");

    // Tambahkan styles dan event listeners
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
  // Create a style element
  const styleElement = document.createElement("style");

  // Add CSS for the popup with unique class names
  styleElement.textContent = `
    .gemini_api-key-overlay {
      position: fixed;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      background-color: rgba(0, 0, 0, 0.7);
      display: flex;
      justify-content: center;
      align-items: center;
      z-index: 1000000;
    }
    
    .gemini_api-key-popup {
      background-color: #292a2d;
      color: #e8eaed;
      border-radius: 8px;
      box-shadow: 0 4px 24px rgba(0, 0, 0, 0.4);
      width: 90%;
      max-width: 500px;
      max-height: 90vh;
      overflow-y: auto;
      animation: gemini_fadeIn 0.3s ease-out;
    }
    
    @keyframes gemini_fadeIn {
      from { opacity: 0; transform: translateY(-20px); }
      to { opacity: 1; transform: translateY(0); }
    }
    
    .gemini_popup-header {
      padding: 16px 20px;
      border-bottom: 1px solid #3c4043;
    }
    
    .gemini_popup-header h2 {
      margin: 0;
      font-size: 18px;
      color: #8ab4f8;
    }
    
    .gemini_popup-content {
      padding: 20px;
    }
    
    .gemini_tutorial-section {
      background-color: #202124;
      border-radius: 6px;
      padding: 15px;
      margin: 15px 0;
    }
    
    .gemini_tutorial-section h3 {
      margin-top: 0;
      color: #8ab4f8;
      font-size: 16px;
    }
    
    .gemini_tutorial-section ol {
      padding-left: 20px;
      margin-bottom: 0;
    }
    
    .gemini_tutorial-section li {
      margin-bottom: 8px;
    }
    
    .gemini_tutorial-section a {
      color: #8ab4f8;
      text-decoration: none;
    }
    
    .gemini_tutorial-section a:hover {
      text-decoration: underline;
    }
    
    .gemini_input-section {
      display: flex;
      align-items: center;
      margin: 20px 0;
    }
    
    .gemini_input-section label {
      margin-right: 10px;
      white-space: nowrap;
    }
    
    .gemini_input-section input {
      flex: 1;
      background-color: #202124;
      border: 1px solid #5f6368;
      border-radius: 4px;
      padding: 10px 12px;
      color: #e8eaed;
      font-size: 14px;
    }
    
    .gemini_input-section input:focus {
      outline: none;
      border-color: #8ab4f8;
    }
    
    .gemini_input-section button {
      background: none;
      border: none;
      color: #9aa0a6;
      cursor: pointer;
      padding: 8px;
    }
    
    .gemini_input-section button:hover {
      color: #e8eaed;
    }
    
    .gemini_security-note {
      font-size: 12px;
      color: #9aa0a6;
      margin: 10px 0;
    }
    
    .gemini_popup-buttons {
      display: flex;
      justify-content: flex-end;
      margin-top: 20px;
    }
    
    .gemini_primary-button {
      background-color: #8ab4f8;
      color: #202124;
      border: none;
      border-radius: 4px;
      padding: 10px 16px;
      font-weight: 500;
      cursor: pointer;
      transition: background-color 0.2s;
    }
    
    .gemini_primary-button:hover {
      background-color: #aecbfa;
    }
  `;

  // Append the style element to head
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
