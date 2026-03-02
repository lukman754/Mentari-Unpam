// apiKeyManager.js
function initializeApiKeyManager() {
  console.log("API Key Manager initializing...");
  const storedApiKey = localStorage.getItem("geminiApiKey");
  if (!storedApiKey) {
    console.log("No API key found, showing popup...");
    setTimeout(() => { showApiKeyPopup(); }, 1000);
    return null;
  }
  return atob(storedApiKey);
}

(function () {
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", onDOMReady);
  } else {
    onDOMReady();
  }

  function onDOMReady() {
    setTimeout(() => {
      const apiKey = initializeApiKeyManager();
      if (apiKey && typeof createChatbotInterface === "function") {
        createChatbotInterface(apiKey);
      }
    }, 1500);
  }
  
  window.addEventListener('mentari-update-api-key', () => showApiKeyPopup());
})();

async function verifyApiKeyOnServer(apiKey) {
  try {
    const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`);
    if (res.ok) return { valid: true };
    const err = await res.json();
    return { valid: false, message: err.error?.message || "API key tidak valid atau expired." };
  } catch (e) {
    return { valid: false, message: "Gagal menghubungi server Google. Periksa koneksi internet." };
  }
}

function validateApiKeyFormat(apiKey) {
  const apiKeyRegex = /^AIza[a-zA-Z0-9_-]{30,}$/;
  if (!apiKeyRegex.test(apiKey)) return { valid: false, message: "Format API key tidak valid (Harus diawali AIza...)" };
  return { valid: true };
}

function showApiKeyPopup() {
  if (document.getElementById("gemini_apiKeyPopup")) return;
  const savedApiKey = localStorage.getItem("geminiApiKey");
  const decodedApiKey = savedApiKey ? atob(savedApiKey) : "";

  const overlay = document.createElement("div");
  overlay.id = "gemini_apiKeyOverlay";
  overlay.className = "gemini_api-key-overlay";
  overlay.innerHTML = `
    <div id="gemini_apiKeyPopup" class="gemini_api-key-popup">
      <div class="gemini_popup-header">
        <div style="font-weight:600; color:#fff; display:flex; align-items:center; gap:8px;">
          <span class="ms" style="color:#f0872d">vpn_key</span> Gemini API Key
        </div>
      </div>
      <div class="gemini_popup-content">
        <div style="margin-bottom:12px; color:#aaa; font-size:12px; line-height:1.4;">
           Dapatkan API key gratis di Google AI Studio:<br>
           <a href="https://aistudio.google.com/api-keys" target="_blank" style="color:#f0872d; text-decoration:none; word-break:break-all;">https://aistudio.google.com/api-keys</a>
        </div>
        
        <div style="position:relative; width:100%; margin-bottom:12px; display:flex; align-items:center;">
          <input type="password" id="gemini_apiKeyInput" placeholder="Masukkan AIza..." value="${decodedApiKey}" 
            style="width:100%; padding:10px 40px 10px 10px; background:#1a1a1a; border:1px solid #333; border-radius:8px; color:#fff; font-size:13px; outline:none; transition:border-color 0.2s;">
          <button id="gemini_toggleVis" style="position:absolute; right:8px; background:none; border:none; color:#555; cursor:pointer; display:flex; align-items:center;">
             <span class="ms" id="gemini_visIcon">visibility</span>
          </button>
        </div>
        
        <div id="gemini_validationMessage" style="font-size:11px; margin-bottom:15px; display:none; padding:8px; border-radius:4px;"></div>
        
        <div style="display:flex; justify-content:flex-end; gap:10px;">
          <button id="gemini_closePopup" style="background:transparent; color:#999; border:none; cursor:pointer; font-size:12px; font-weight:500;">Batal</button>
          <button id="gemini_saveApiKeyButton" style="background:#f0872d; color:#fff; border:none; border-radius:8px; padding:8px 20px; font-size:13px; font-weight:600; cursor:pointer; transition:all 0.2s; display:flex; align-items:center; gap:6px;">
            <span id="gemini_btnText">Simpan</span>
          </button>
        </div>
      </div>
    </div>
  `;
  document.body.appendChild(overlay);
  addApiKeyPopupStyles();
  setupApiKeyPopupEventListeners();
}

function setupApiKeyPopupEventListeners() {
  const saveBtn = document.getElementById("gemini_saveApiKeyButton");
  const closeBtn = document.getElementById("gemini_closePopup");
  const input = document.getElementById("gemini_apiKeyInput");
  const msg = document.getElementById("gemini_validationMessage");
  const toggleVis = document.getElementById("gemini_toggleVis");
  const visIcon = document.getElementById("gemini_visIcon");
  const btnText = document.getElementById("gemini_btnText");

  if (closeBtn) closeBtn.onclick = () => document.getElementById("gemini_apiKeyOverlay")?.remove();
  
  if (toggleVis) {
    toggleVis.onclick = (e) => {
      e.preventDefault();
      const isPass = input.type === "password";
      input.type = isPass ? "text" : "password";
      visIcon.textContent = isPass ? "visibility_off" : "visibility";
    };
  }

  if (saveBtn && input) {
    saveBtn.onclick = async () => {
      const key = input.value.trim();
      
      // 1. Validasi Format
      const valFormat = validateApiKeyFormat(key);
      if (!valFormat.valid) {
        msg.style.display = "block"; 
        msg.style.background = "rgba(244, 67, 54, 0.1)";
        msg.style.color = "#f44336"; 
        msg.innerText = valFormat.message;
        input.style.borderColor = "#f44336";
        return;
      }

      // 2. Validasi Server (Asli)
      saveBtn.disabled = true;
      btnText.innerHTML = `<span style="display:flex; gap:4px;"><span class="ms-spin" style="animation:spin 1s linear infinite;">sync</span> Cek...</span>`;
      msg.style.display = "none";
      input.style.borderColor = "#333";

      const valServer = await verifyApiKeyOnServer(key);
      
      if (!valServer.valid) {
        saveBtn.disabled = false;
        btnText.innerText = "Simpan";
        msg.style.display = "block"; 
        msg.style.background = "rgba(244, 67, 54, 0.1)";
        msg.style.color = "#f44336"; 
        msg.innerText = valServer.message;
        input.style.borderColor = "#f44336";
        return;
      }

      // Valid - Simpan
      localStorage.setItem("geminiApiKey", btoa(key));
      msg.style.display = "block";
      msg.style.background = "rgba(76, 175, 80, 0.1)";
      msg.style.color = "#4caf50";
      msg.innerText = "API key valid dan berhasil disimpan!";
      
      setTimeout(() => {
        document.getElementById("gemini_apiKeyOverlay")?.remove();
        if (typeof createChatbotInterface === "function") createChatbotInterface(key);
        // Dispatch event for other scripts
        window.dispatchEvent(new CustomEvent('gemini-api-key-updated', { detail: { key } }));
      }, 1500);
    };
  }
}

function addApiKeyPopupStyles() {
  if (document.getElementById("gemini_api_styles")) return;
  const s = document.createElement("style");
  s.id = "gemini_api_styles";
  s.textContent = `
    .gemini_api-key-overlay { position: fixed; top:0; left:0; width:100%; height:100%; background:rgba(0,0,0,0.85); backdrop-filter:blur(5px); z-index: 100000; display:flex; align-items:center; justify-content:center; font-family: 'Roboto', 'Inter', sans-serif; }
    .gemini_api-key-popup { background:#121212; width:380px; border-radius:16px; border:1px solid rgba(255,255,255,0.1); overflow:hidden; box-shadow:0 15px 50px rgba(0,0,0,0.8); }
    .gemini_popup-header { padding:16px; background:rgba(255,255,255,0.03); border-bottom:1px solid rgba(255,255,255,0.08); }
    .gemini_popup-content { padding:20px; }
    #gemini_apiKeyInput:focus { border-color: #f0872d!important; }
    .ms-spin { font-family: 'Material Symbols Rounded'; font-size: 16px; font-style: normal; display: inline-block; line-height: 1; }
    @keyframes spin { from {transform:rotate(0deg);} to {transform:rotate(360deg);} }
  `;
  document.head.appendChild(s);
}

function getGeminiApiKey() {
  const k = localStorage.getItem("geminiApiKey");
  return k ? atob(k) : null;
}
