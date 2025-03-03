// Function to create and inject the API key form
function createApiKeyForm() {
  // Check if form already exists
  if (document.getElementById("apiKeyForm")) return;

  // Create form elements with improved structure for responsive layout
  const formHtml = `
    <div id="apiKeyForm" class="MuiStack-root">
      <div class="form-row">
        <div class="input-container">
          <label class="MuiTypography-root MuiTypography-body1">
            Gemini API Key
          </label>
          <input 
            type="password" 
            id="apiKeyInput"
            placeholder="Enter your API key"
            class="MuiInputBase-input MuiOutlinedInput-input"
          />
          <div id="apiKeyError"></div>
        </div>
        <div class="button-container">
          <label class="MuiTypography-root MuiTypography-body1">
            Jawab Otomatis
          </label>
          <button 
            id="solveButton"
            class="MuiButton-root MuiButton-contained MuiButton-containedPrimary"
          >
            Generate Answer
          </button>
        </div>
      </div>
      
      <!-- PDF Text Area Section (replaced file upload) -->
      <div class="form-row pdf-section">
        <div class="input-container">
          <label class="MuiTypography-root MuiTypography-body1">
            Paste PDF Content
          </label>
          <textarea 
            id="pdfTextInput"
            placeholder="Paste the content from your PDF here..."
            class="text-area-input"
            rows="6"
          ></textarea>
          <div class="file-input-info">Enter a document name below (optional)</div>
          <input 
            type="text" 
            id="documentNameInput"
            placeholder="Document name (optional)"
            class="MuiInputBase-input MuiOutlinedInput-input document-name-input"
          />
        </div>
        <div class="button-container">
          <label class="MuiTypography-root MuiTypography-body1">
            Analisa Teks
          </label>
          <button 
            id="analyzeTextButton"
            class="MuiButton-root MuiButton-contained MuiButton-containedSecondary"
          >
            Analyze Text
          </button>
        </div>
      </div>
      
      <div id="textLoadingIndicator" style="display: none;">
        <div class="loading-spinner"></div>
        <div class="loading-text">Analyzing text content...</div>
      </div>
      
      <div id="answerContainer" style="display: none;">
        <div class="answer-header">
          <h3>Generated Answer</h3>
          <button id="copyButton" class="copy-button">
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect>
              <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path>
            </svg>
            Copy
          </button>
        </div>
        <div id="markdownAnswer" class="markdown-content"></div>
      </div>
    </div>
    <div id="apiKeyResponsePopup"></div>
  `;

  // Find target elements - look for the question container
  const questionContainer = document.querySelector(".ck-content");

  if (questionContainer) {
    // Create the form element
    const formElement = createElementFromHTML(formHtml);

    // Insert after the question container
    questionContainer.parentNode.insertBefore(
      formElement,
      questionContainer.nextSibling
    );

    // Add the CSS styles to the page
    addStyles();

    // Setup event listeners
    setupEventListeners();

    // Restore any saved content from localStorage
    restoreSavedContent();
  }
}

// Function to add the CSS styles to the document
function addStyles() {
  const styleElement = document.createElement("style");
  styleElement.textContent = `
    /* API Key Form Styles */
    #apiKeyForm {
      margin: 16px 0;
      padding: 8px;
      border-top: 1px solid #333;
      background: #1e1e1e;
      border-radius: 8px;
    }

    /* Responsive layout - 2 columns on wider screens */
    @media (min-width: 768px) {
      #apiKeyForm .form-row {
        display: flex;
        gap: 16px;
      }
      
      #apiKeyForm .input-container {
        flex: 1;
        margin-bottom: 0;
      }
      
      #apiKeyForm .button-container {
        width: 200px;
      }
    }

    /* Input container */
    #apiKeyForm .input-container {
      margin-bottom: 16px;
    }

    #apiKeyForm label {
      display: block;
      margin-bottom: 8px;
      color: #eee;
      font-size: 14px;
    }

    #apiKeyForm input {
      width: 100%;
      padding: 8px 12px;
      border: 1px solid #333;
      border-radius: 4px;
      font-size: 14px;
      background: #252525;
      color: #eee;
      box-sizing: border-box;
    }
    
    /* Document name input specific styles */
    #apiKeyForm .document-name-input {
      margin-top: 8px;
    }

    #apiKeyForm input:focus {
      border-color: #0070f3;
      outline: none;
    }

    /* PDF Section Styles (now for text area) */
    #apiKeyForm .pdf-section {
      margin-top: 16px;
      padding-top: 16px;
      border-top: 1px solid #333;
    }

    #apiKeyForm .text-area-input {
      width: 100%;
      padding: 8px;
      background: #252525;
      color: #eee;
      border: 1px solid #333;
      border-radius: 4px;
      font-family: inherit;
      font-size: 14px;
      resize: vertical;
      min-height: 120px;
    }

    #apiKeyForm .text-area-input:focus {
      border-color: #0070f3;
      outline: none;
    }

    #apiKeyForm .file-input-info {
      font-size: 12px;
      color: #888;
      margin-top: 4px;
    }

    /* Loading indicator */
    #textLoadingIndicator {
      display: flex;
      align-items: center;
      margin: 16px 0;
      padding: 12px;
      background: #252525;
      border-radius: 4px;
      border: 1px solid #333;
    }

    .loading-spinner {
      width: 20px;
      height: 20px;
      border: 3px solid #333;
      border-top: 3px solid #0070f3;
      border-radius: 50%;
      animation: spin 1s linear infinite;
      margin-right: 12px;
    }

    .loading-text {
      color: #eee;
      font-size: 14px;
    }

    @keyframes spin {
      0% { transform: rotate(0deg); }
      100% { transform: rotate(360deg); }
    }

    /* Button styling */
    #apiKeyForm #solveButton,
    #apiKeyForm #analyzeTextButton {
      width: 100%;
      padding: 8px 16px;
      color: white;
      border: none;
      border-radius: 4px;
      cursor: pointer;
      font-weight: 500;
      text-transform: uppercase;
      font-size: 14px;
      transition: background-color 0.2s;
    }

    #apiKeyForm #solveButton {
      background-color: #0070f3;
    }

    #apiKeyForm #analyzeTextButton {
      background-color: #2dbf6b;
    }

    #apiKeyForm #solveButton:hover {
      background-color: #0060df;
    }

    #apiKeyForm #analyzeTextButton:hover {
      background-color: #25a65b;
    }

    #apiKeyForm #solveButton:disabled,
    #apiKeyForm #analyzeTextButton:disabled {
      background-color: #333;
      color: #777;
      cursor: not-allowed;
    }

    /* Error message */
    #apiKeyForm #apiKeyError {
      color: #ff4d4f;
      font-size: 12px;
      margin-top: 8px;
      display: none;
    }

    /* Popup response message */
    #apiKeyResponsePopup {
      position: fixed;
      top: 20px;
      left: 50%;
      transform: translateX(-50%);
      padding: 12px 16px;
      background-color: #2dbf6b;
      color: #000;
      border-radius: 4px;
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
      z-index: 1000;
      display: none;
      text-align: center;
      max-width: 300px;
      font-size: 14px;
      animation: fadeInOut 3s forwards;
    }

    @keyframes fadeInOut {
      0% { opacity: 0; }
      10% { opacity: 1; }
      80% { opacity: 1; }
      100% { opacity: 0; }
    }

    /* Error popup */
    #apiKeyResponsePopup.error {
      background-color: #ff4d4f;
      color: white;
    }

    /* Answer container styling */
    #answerContainer {
      margin-top: 20px;
      border-top: 1px solid #333;
      padding-top: 16px;
    }

    .answer-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 12px;
    }

    .answer-header h3 {
      margin: 0;
      color: #eee;
      font-size: 16px;
    }

    .copy-button {
      display: flex;
      align-items: center;
      gap: 6px;
      padding: 6px 12px;
      background-color: #252525;
      color: #eee;
      border: 1px solid #333;
      border-radius: 4px;
      cursor: pointer;
      font-size: 12px;
      transition: all 0.2s;
    }

    .copy-button:hover {
      background-color: #333;
    }

    .copy-button.copied {
      background-color: #2dbf6b;
      color: #000;
    }

    .markdown-content {
      background-color: #252525;
      border: 1px solid #333;
      border-radius: 4px;
      padding: 16px;
      color: #eee;
      font-family: monospace;
      white-space: pre-wrap;
      max-height: 500px;
      overflow-y: auto;
      line-height: 1.5;
    }

    /* Add scrollbar styling */
    .markdown-content::-webkit-scrollbar {
      width: 8px;
      height: 8px;
    }

    .markdown-content::-webkit-scrollbar-track {
      background: #1e1e1e;
    }

    .markdown-content::-webkit-scrollbar-thumb {
      background: #444;
      border-radius: 4px;
    }

    .markdown-content::-webkit-scrollbar-thumb:hover {
      background: #555;
    }
  `;
  document.head.appendChild(styleElement);
}

// Function to wait for page load and elements
async function waitForElements() {
  return new Promise((resolve) => {
    const checkElements = () => {
      const questionContainer = document.querySelector(".ck-content");
      if (questionContainer) {
        setTimeout(() => {
          resolve();
        }, 1000); // 1 second delay
      } else {
        setTimeout(checkElements, 100);
      }
    };
    checkElements();
  });
}

// Function to initialize the form
async function initializeForm() {
  await waitForElements();
  createApiKeyForm();
}

// Monitor URL changes
let lastUrl = location.href;
new MutationObserver(() => {
  const url = location.href;
  if (url !== lastUrl) {
    lastUrl = url;
    console.log("URL changed, reinitializing...");

    // Save current page data before navigating
    saveCurrentPageData();

    // Initialize form on new page
    initializeForm();
  }
}).observe(document, { subtree: true, childList: true });

// Helper function to create element from HTML string
function createElementFromHTML(htmlString) {
  const div = document.createElement("div");
  div.innerHTML = htmlString.trim();
  return div.firstChild;
}

// Show popup message
function showPopup(message, isError = false) {
  const popup = document.getElementById("apiKeyResponsePopup");

  if (!popup) return;

  // Set message and styling
  popup.textContent = message;
  popup.style.display = "block";

  if (isError) {
    popup.classList.add("error");
  } else {
    popup.classList.remove("error");
  }

  // Auto-hide after 3 seconds
  setTimeout(() => {
    popup.style.display = "none";
  }, 3000);
}

// Function to save data to localStorage
function saveDataToLocalStorage(key, data) {
  try {
    localStorage.setItem(key, JSON.stringify(data));
  } catch (error) {
    console.error(`Error saving data to localStorage for key ${key}:`, error);
  }
}

// Function to get data from localStorage
function getDataFromLocalStorage(key) {
  try {
    const data = localStorage.getItem(key);
    return data ? JSON.parse(data) : null;
  } catch (error) {
    console.error(
      `Error getting data from localStorage for key ${key}:`,
      error
    );
    return null;
  }
}

// Function to save current page data
function saveCurrentPageData() {
  const currentUrl = window.location.href;
  const urlKey = getUrlStorageKey(currentUrl);

  const pdfTextInput = document.getElementById("pdfTextInput");
  const documentNameInput = document.getElementById("documentNameInput");
  const markdownAnswer = document.getElementById("markdownAnswer");
  const answerContainer = document.getElementById("answerContainer");

  if (pdfTextInput && documentNameInput && markdownAnswer) {
    const pageData = {
      pdfText: pdfTextInput.value,
      documentName: documentNameInput.value,
      markdownAnswer: markdownAnswer.textContent,
      answerVisible: answerContainer.style.display !== "none",
    };

    saveDataToLocalStorage(urlKey, pageData);
    console.log(`Saved data for page: ${currentUrl}`);
  }
}

// Function to restore saved content
function restoreSavedContent() {
  const currentUrl = window.location.href;
  const urlKey = getUrlStorageKey(currentUrl);
  const pageData = getDataFromLocalStorage(urlKey);

  if (pageData) {
    console.log(`Restoring data for page: ${currentUrl}`);

    const pdfTextInput = document.getElementById("pdfTextInput");
    const documentNameInput = document.getElementById("documentNameInput");
    const markdownAnswer = document.getElementById("markdownAnswer");
    const answerContainer = document.getElementById("answerContainer");

    if (pdfTextInput && pageData.pdfText) {
      pdfTextInput.value = pageData.pdfText;
    }

    if (documentNameInput && pageData.documentName) {
      documentNameInput.value = pageData.documentName;
    }

    if (markdownAnswer && pageData.markdownAnswer) {
      markdownAnswer.textContent = pageData.markdownAnswer;

      if (pageData.answerVisible && answerContainer) {
        answerContainer.style.display = "block";
      }
    }
  }
}

// Function to get a storage key based on URL
function getUrlStorageKey(url) {
  // Create a simplified key from the URL
  // Remove protocol and common prefixes, focus on path
  const simplifiedUrl = url
    .replace(/^https?:\/\//, "")
    .replace(/www\./, "")
    .split("?")[0]; // Remove query parameters

  return `page_data_${simplifiedUrl}`;
}

// Auto-save feature - periodically save data
function setupAutoSave() {
  // Save data every 10 seconds
  setInterval(() => {
    saveCurrentPageData();
  }, 10000);

  // Also save when window is about to unload
  window.addEventListener("beforeunload", () => {
    saveCurrentPageData();
  });
}

function setupEventListeners() {
  const apiKeyInput = document.getElementById("apiKeyInput");
  const solveButton = document.getElementById("solveButton");
  const analyzeTextButton = document.getElementById("analyzeTextButton");
  const pdfTextInput = document.getElementById("pdfTextInput");
  const documentNameInput = document.getElementById("documentNameInput");
  const textLoadingIndicator = document.getElementById("textLoadingIndicator");
  const errorDiv = document.getElementById("apiKeyError");
  const copyButton = document.getElementById("copyButton");
  const answerContainer = document.getElementById("answerContainer");
  const markdownAnswer = document.getElementById("markdownAnswer");

  // Load saved API key
  const savedApiKey = localStorage.getItem("gemini_api_key");
  if (savedApiKey) {
    apiKeyInput.value = savedApiKey;
  }

  // Setup input change listeners to save data
  pdfTextInput.addEventListener("input", () => {
    saveCurrentPageData();
  });

  documentNameInput.addEventListener("input", () => {
    saveCurrentPageData();
  });

  solveButton.addEventListener("click", async () => {
    const apiKey = apiKeyInput.value.trim();

    if (!apiKey) {
      errorDiv.textContent = "Please enter an API key";
      errorDiv.style.display = "block";
      return;
    }

    // Save API key
    localStorage.setItem("gemini_api_key", apiKey);

    // Show loading state
    solveButton.disabled = true;
    solveButton.textContent = "Processing...";
    errorDiv.style.display = "none";
    answerContainer.style.display = "none";

    try {
      const answer = await generateEssayAnswer(apiKey);
      markdownAnswer.textContent = answer;
      answerContainer.style.display = "block";
      showPopup("Answer generated successfully!");

      // Save the generated answer
      saveCurrentPageData();
    } catch (error) {
      errorDiv.textContent = error.message || "Failed to generate answer";
      errorDiv.style.display = "block";
      showPopup(error.message || "Failed to generate answer", true);
    } finally {
      solveButton.disabled = false;
      solveButton.textContent = "Generate Answer";
    }
  });

  // Text Analysis button event listener (replaced PDF analysis)
  analyzeTextButton.addEventListener("click", async () => {
    const apiKey = apiKeyInput.value.trim();
    const textContent = pdfTextInput.value.trim();
    const documentName = documentNameInput.value.trim() || "Document";

    if (!apiKey) {
      errorDiv.textContent = "Please enter an API key";
      errorDiv.style.display = "block";
      return;
    }

    if (!textContent) {
      errorDiv.textContent = "Please paste some text content to analyze";
      errorDiv.style.display = "block";
      return;
    }

    // Save API key
    localStorage.setItem("gemini_api_key", apiKey);

    // Show loading state
    analyzeTextButton.disabled = true;
    analyzeTextButton.textContent = "Analyzing...";
    textLoadingIndicator.style.display = "flex";
    errorDiv.style.display = "none";
    answerContainer.style.display = "none";

    try {
      // Generate summary and answers from text content
      const answer = await analyzeTextContent(
        apiKey,
        textContent,
        documentName
      );

      markdownAnswer.textContent = answer;
      answerContainer.style.display = "block";
      showPopup("Text analysis completed successfully!");

      // Save the generated answer
      saveCurrentPageData();
    } catch (error) {
      console.error("Text analysis error:", error);
      errorDiv.textContent = error.message || "Failed to analyze text";
      errorDiv.style.display = "block";
      showPopup(error.message || "Failed to analyze text", true);
    } finally {
      analyzeTextButton.disabled = false;
      analyzeTextButton.textContent = "Analyze Text";
      textLoadingIndicator.style.display = "none";
    }
  });

  if (copyButton) {
    copyButton.addEventListener("click", () => {
      const text = markdownAnswer.textContent;
      navigator.clipboard.writeText(text).then(() => {
        copyButton.classList.add("copied");
        copyButton.textContent = "Copied!";

        setTimeout(() => {
          copyButton.classList.remove("copied");
          copyButton.innerHTML = `
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect>
              <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path>
            </svg>
            Copy
          `;
        }, 2000);
      });
    });
  }

  // Set up auto-save
  setupAutoSave();
}

async function generateEssayAnswer(apiKey) {
  // Get the question from the page
  const questionElement = document.querySelector(".ck-content > p");

  if (!questionElement) {
    throw new Error("Question not found on the page.");
  }

  const questionText = questionElement.textContent.trim();

  // Create a prompt for the essay question
  const prompt = `
    berikan jawaban yang jelas dan unik seperti seorang mahasiswa jangan terlalu baku namun sopan, jawabannya dibuat menjadi 3 paragraf yang saling berhubungan, berikan enter 2x tiap akhir paragraf jika terdapat point maka point itu diringkas saja dan jangan gunakan huruf spesial seperti (# *) dll, gunakan itu jika memang digunakan, dan jangan terlalu banyak point untuk pertanyaan berikut ini:
    Pertanyaan: ${questionText}
  `;

  const response = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ contents: [{ parts: [{ text: prompt }] }] }),
    }
  );

  const result = await response.json();

  if (!result.candidates?.[0]?.content?.parts?.[0]?.text) {
    throw new Error("No answer received from API");
  }

  const answer = result.candidates[0].content.parts[0].text;
  console.log("Gemini response received for essay question");

  return answer;
}

// New function to analyze text content (replaced PDF analysis)
async function analyzeTextContent(apiKey, textContent, documentName) {
  // Limit text length to prevent exceeding API limits
  const truncatedText = textContent.slice(0, 30000); // Limiting to ~30k chars

  // Create a prompt for text analysis
  const prompt = `
    Saya memiliki dokumen dengan nama "${documentName}" yang berisi teks berikut:
    
    ${truncatedText}
    
    Berdasarkan konten tersebut, mohon:
    1. Ringkas konten utama dari dokumen ini dalam satu paragraf tanpa perlu menyebutkan bahwa itu dokumen.
    2. Identifikasi 3-5 topik diskusi utama yang muncul dalam teks, dan jadikan teks diskusi seperti dialog dengan paragraf yang agak panjang dan berbobot.
    3. Jika ada pertanyaan atau soal dalam teks, berikan jawaban yang lengkap dan terstruktur untuk setiap pertanyaan tersebut.
    4. Rekomendasikan 2-3 poin diskusi tambahan yang relevan dengan konten dokumen.
    5. Jangan gunakan huruf spesial seperti (# dan *), jangan kebanyakan point.
    6. jangan gunakan huruf bold, italic atau apapun, huruf biasa saja.
    
    Format jawabanmu dengan rapi dan mudah dibaca, dengan pembagian bagian yang jelas. Gunakan bahasa yang jelas dan sopan seperti seorang mahasiswa, tidak terlalu baku namun tetap profesional.
  `;

  const response = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: {
          temperature: 0.2,
          maxOutputTokens: 4096,
        },
      }),
    }
  );

  const result = await response.json();

  if (!result.candidates?.[0]?.content?.parts?.[0]?.text) {
    if (result.error) {
      console.error("API error:", result.error);
      throw new Error(`API error: ${result.error.message || "Unknown error"}`);
    }
    throw new Error("Failed to generate text analysis");
  }

  const analysis = result.candidates[0].content.parts[0].text;
  console.log("Gemini response received for text analysis");

  return analysis;
}

// Start the initial load
initializeForm();
