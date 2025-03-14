// apiKeyManager.js
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
  if (document.getElementById("apiKeyPopup")) {
    console.log("Popup already exists");
    return;
  }

  // Retrieve saved API key from local storage
  const savedApiKey = localStorage.getItem("geminiApiKey");
  const decodedApiKey = savedApiKey ? atob(savedApiKey) : "";

  // Create popup HTML
  const popupHtml = `
    <div id="apiKeyOverlay" class="api-key-overlay">
      <div id="apiKeyPopup" class="api-key-popup">
        <div class="popup-header">
          <h2>Gemini API Key Setup</h2>
        </div>
        
        <div class="popup-content">
          <p>Untuk menggunakan Gemini Assistant, Anda perlu memasukkan API key dari Google AI Studio.</p>
          
          <div class="tutorial-section">
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
          
          <div class="input-section">
            <label for="apiKeyInput">API Key Gemini:</label>
            <input type="password" id="apiKeyInput" placeholder="Masukkan API key Anda di sini..." value="${decodedApiKey}">
            <button id="toggleApiKeyVisibility" title="Tampilkan/Sembunyikan API Key">
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
                <circle cx="12" cy="12" r="3"></circle>
              </svg>
            </button>
          </div>
          
          <p class="security-note">API key Anda akan disimpan secara lokal dan dienkripsi (base64) di browser Anda.</p>
          
          <div class="popup-buttons">
            <button id="saveApiKeyButton" class="primary-button">Simpan API Key</button>
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
function addApiKeyPopupStyles() {
  // Create a style element
  const styleElement = document.createElement("style");

  // Add CSS for the popup
  styleElement.textContent = `
    .api-key-overlay {
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
    
    .api-key-popup {
      background-color: #292a2d;
      color: #e8eaed;
      border-radius: 8px;
      box-shadow: 0 4px 24px rgba(0, 0, 0, 0.4);
      width: 90%;
      max-width: 500px;
      max-height: 90vh;
      overflow-y: auto;
      animation: fadeIn 0.3s ease-out;
    }
    
    @keyframes fadeIn {
      from { opacity: 0; transform: translateY(-20px); }
      to { opacity: 1; transform: translateY(0); }
    }
    
    .popup-header {
      padding: 16px 20px;
      border-bottom: 1px solid #3c4043;
    }
    
    .popup-header h2 {
      margin: 0;
      font-size: 18px;
      color: #8ab4f8;
    }
    
    .popup-content {
      padding: 20px;
    }
    
    .tutorial-section {
      background-color: #202124;
      border-radius: 6px;
      padding: 15px;
      margin: 15px 0;
    }
    
    .tutorial-section h3 {
      margin-top: 0;
      color: #8ab4f8;
      font-size: 16px;
    }
    
    .tutorial-section ol {
      padding-left: 20px;
      margin-bottom: 0;
    }
    
    .tutorial-section li {
      margin-bottom: 8px;
    }
    
    .tutorial-section a {
      color: #8ab4f8;
      text-decoration: none;
    }
    
    .tutorial-section a:hover {
      text-decoration: underline;
    }
    
    .input-section {
      display: flex;
      align-items: center;
      margin: 20px 0;
    }
    
    .input-section label {
      margin-right: 10px;
      white-space: nowrap;
    }
    
    .input-section input {
      flex: 1;
      background-color: #202124;
      border: 1px solid #5f6368;
      border-radius: 4px;
      padding: 10px 12px;
      color: #e8eaed;
      font-size: 14px;
    }
    
    .input-section input:focus {
      outline: none;
      border-color: #8ab4f8;
    }
    
    .input-section button {
      background: none;
      border: none;
      color: #9aa0a6;
      cursor: pointer;
      padding: 8px;
    }
    
    .input-section button:hover {
      color: #e8eaed;
    }
    
    .security-note {
      font-size: 12px;
      color: #9aa0a6;
      margin: 10px 0;
    }
    
    .popup-buttons {
      display: flex;
      justify-content: flex-end;
      margin-top: 20px;
    }
    
    .primary-button {
      background-color: #8ab4f8;
      color: #202124;
      border: none;
      border-radius: 4px;
      padding: 10px 16px;
      font-weight: 500;
      cursor: pointer;
      transition: background-color 0.2s;
    }
    
    .primary-button:hover {
      background-color: #aecbfa;
    }
  `;

  // Append the style element to head
  document.head.appendChild(styleElement);
}

function setupApiKeyPopupEventListeners() {
  // Get elements
  const saveButton = document.getElementById("saveApiKeyButton");
  const apiKeyInput = document.getElementById("apiKeyInput");
  const toggleVisibilityButton = document.getElementById(
    "toggleApiKeyVisibility"
  );

  // Toggle API key visibility
  if (toggleVisibilityButton) {
    toggleVisibilityButton.addEventListener("click", function () {
      const input = document.getElementById("apiKeyInput");
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
        const overlay = document.getElementById("apiKeyOverlay");
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
