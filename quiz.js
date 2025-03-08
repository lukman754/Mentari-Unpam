// Function to create and inject the API key form into multiple choice questions
function createApiKeyForm() {
  // Check if a form already exists somewhere on the page
  if (document.getElementById("apiKeyForm")) return;

  // Find all question containers that have "Multiple Choice" text
  const questionContainers = document.querySelectorAll(
    ".MuiPaper-root.MuiPaper-outlined"
  );
  const multipleChoiceContainers = Array.from(questionContainers).filter(
    (container) => {
      return container.textContent.includes("Multiple Choice");
    }
  );

  if (multipleChoiceContainers.length === 0) return;

  // Check if we have a saved API key
  const savedApiKey = localStorage.getItem("gemini_api_key");
  const hasApiKey = savedApiKey && savedApiKey.trim() !== "";

  // Create form elements with improved structure for responsive layout
  let formHtml = `
    <div id="apiKeyForm" class="MuiStack-root">
      <div class="form-row">
        <div class="input-container">
          <label class="MuiTypography-root MuiTypography-body1">
            Gemini API Key
          </label>
          <input 
            type="password" 
            id="apiKeyInput"
            placeholder="Masukkan API key Anda"
            class="MuiInputBase-input MuiOutlinedInput-input"
          />
          <div id="apiKeyError"></div>
        </div>
        <div class="button-container">
          <button 
            id="solveButton"
            class="MuiButton-root MuiButton-contained MuiButton-containedPrimary"
          >
            Jawab Otomatis
          </button>
        </div>
      </div>`;

  // Add API Key tutorial section if user doesn't have an API key saved
  if (!hasApiKey) {
    formHtml += `
      <div class="api-key-tutorial">
        <div class="tutorial-header">
          <span>Belum punya API Key?</span>
          <a href="https://aistudio.google.com/app/apikey" target="_blank" class="get-api-key-button">
            Dapatkan API Key
          </a>
        </div>
        <div class="tutorial-content">
          <p>Cara mendapatkan API Key Gemini:</p>
          <ol>
            <li>Klik tombol "Dapatkan API Key" di atas</li>
            <li>Login dengan akun Google Anda</li>
            <li>Klik "Create API Key" dan beri nama (misal: "Quiz Helper")</li>
            <li>Copy API Key yang muncul</li>
            <li>Paste API Key tersebut ke form di atas</li>
            <li>Klik "Jawab Otomatis" untuk mulai menjawab quiz</li>
          </ol>
        </div>
      </div>`;
  }

  formHtml += `
    </div>
    <div id="apiKeyResponsePopup"></div>
  `;

  // Create the form element
  const formElement = createElementFromHTML(formHtml);

  // Insert the form into each multiple choice container
  multipleChoiceContainers.forEach((container, index) => {
    // Only insert the actual form in the first multiple choice question
    if (index === 0) {
      container.appendChild(formElement.cloneNode(true));
    }
  });

  // Add the CSS styles to the page
  addStyles();

  // Setup event listeners
  setupEventListeners();

  // Auto-trigger the solve button if we have a saved API key
  if (hasApiKey) {
    setTimeout(() => {
      const solveButton = document.getElementById("solveButton");
      if (solveButton) {
        solveButton.click();
      }
    }, 500); // Short delay to ensure everything is loaded
  }
}

// Function to add the CSS styles to the document
function addStyles() {
  const styleElement = document.createElement("style");
  styleElement.textContent = `
    /* API Key Form Styles */
    #apiKeyForm {
      margin: 16px 0;
      padding: 16px;
      border-top: 1px solid #333;
      background: #1e1e1e;
      border-radius: 8px;
    }

    /* Responsive layout - 2 columns on wider screens */
    @media (min-width: 768px) {
      #apiKeyForm .form-row {
        display: flex;
        gap: 16px;
        align-items: center;
      }
      
      #apiKeyForm .input-container {
        flex: 1;
        margin-bottom: 0;
      }
      
      #apiKeyForm .button-container {
        width: 200px;
        display: flex;
        flex-direction: column;
        justify-content: flex-end;
      }
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

    #apiKeyForm input:focus {
      border-color: #0070f3;
      outline: none;
    }

    /* Button styling */
    #apiKeyForm #solveButton {
      width: 100%;
      padding: 10px 16px;
      color: white;
      background-color: #0070f3;
      border: none;
      border-radius: 4px;
      cursor: pointer;
      font-weight: 500;
      text-transform: uppercase;
      font-size: 14px;
      transition: background-color 0.2s;
      margin-top: 24px;
    }

    #apiKeyForm #solveButton:hover {
      background-color: #0060df;
    }

    #apiKeyForm #solveButton:disabled {
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
    
    /* Tutorial styles */
    .api-key-tutorial {
      margin-top: 16px;
      border-top: 1px solid #333;
      padding-top: 16px;
    }
    
    .tutorial-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 12px;
    }
    
    .tutorial-header span {
      color: #eee;
      font-weight: 500;
    }
    
    .get-api-key-button {
      display: inline-block;
      padding: 6px 12px;
      background-color: #4caf50;
      color: white;
      text-decoration: none;
      border-radius: 4px;
      font-size: 12px;
      transition: background-color 0.2s;
    }
    
    .get-api-key-button:hover {
      background-color: #3d8b40;
    }
    
    .tutorial-content {
      color: #ccc;
      font-size: 13px;
    }
    
    .tutorial-content p {
      margin-bottom: 8px;
    }
    
    .tutorial-content ol {
      padding-left: 20px;
      margin-top: 0;
    }
    
    .tutorial-content li {
      margin-bottom: 4px;
    }
  `;
  document.head.appendChild(styleElement);
}

// Function to wait for page load and elements
async function waitForElements() {
  return new Promise((resolve) => {
    const checkElements = () => {
      const questions = document.querySelectorAll(
        ".MuiPaper-root.MuiPaper-outlined"
      );
      if (questions.length > 0) {
        setTimeout(() => {
          resolve();
        }, 500); // 0.5 second delay - reduced for faster auto-solving
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

function setupEventListeners() {
  const apiKeyInput = document.getElementById("apiKeyInput");
  const solveButton = document.getElementById("solveButton");
  const errorDiv = document.getElementById("apiKeyError");

  if (!apiKeyInput || !solveButton || !errorDiv) return;

  // Load saved API key
  const savedApiKey = localStorage.getItem("gemini_api_key");
  if (savedApiKey) {
    apiKeyInput.value = savedApiKey;
  }

  solveButton.addEventListener("click", async () => {
    const apiKey = apiKeyInput.value.trim();

    if (!apiKey) {
      errorDiv.textContent = "Silahkan masukkan API key";
      errorDiv.style.display = "block";
      return;
    }

    // Save API key
    localStorage.setItem("gemini_api_key", apiKey);

    // Show loading state
    solveButton.disabled = true;
    solveButton.textContent = "Memproses...";
    errorDiv.style.display = "none";

    try {
      // Process all unanswered questions
      const results = await jawabSemuaQuiz(apiKey);
      showPopup(
        `Berhasil menjawab ${results.success} pertanyaan! (${results.failed} gagal)`
      );
    } catch (error) {
      errorDiv.textContent = error.message || "Gagal memproses jawaban";
      errorDiv.style.display = "block";
      showPopup(error.message || "Gagal memproses jawaban", true);
    } finally {
      solveButton.disabled = false;
      solveButton.textContent = "Jawab Otomatis";
    }
  });
}

// Function to process all quiz questions
async function jawabSemuaQuiz(apiKey) {
  const questionContainers = document.querySelectorAll(
    ".MuiPaper-root.MuiPaper-outlined"
  );
  let results = { success: 0, failed: 0 };

  // Check if we have any questions
  if (questionContainers.length === 0) {
    throw new Error(
      "Tidak ada pertanyaan quiz yang ditemukan pada halaman ini."
    );
  }

  // Process each question that hasn't been answered yet
  for (const container of questionContainers) {
    // Check if this question has already been answered
    const alreadyAnswered =
      container.querySelector(".MuiChip-outlinedSuccess") !== null;

    if (!alreadyAnswered) {
      try {
        await jawabQuiz(apiKey, container);
        results.success++;
      } catch (error) {
        console.error("Error processing question:", error);
        results.failed++;
      }

      // Add a small delay between questions to avoid rate limiting
      await new Promise((resolve) => setTimeout(resolve, 1000)); // Reduced delay to 1 second
    }
  }

  return results;
}

async function jawabQuiz(apiKey, questionContainer) {
  // Get the question from the h6 element within the provided container
  const questionElement = questionContainer.querySelector(
    "h6.MuiTypography-subtitle1"
  );
  const pertanyaanElement = questionContainer.querySelector(".ck-content > p");
  const opsiElements = questionContainer.querySelectorAll(
    ".MuiFormControlLabel-root"
  );

  if (!questionElement || opsiElements.length === 0) {
    throw new Error("Pertanyaan atau pilihan jawaban tidak ditemukan.");
  }

  const questionText = questionElement.textContent.trim();
  const additionalInfo = pertanyaanElement
    ? pertanyaanElement.textContent.trim()
    : "";
  let opsi = [];

  opsiElements.forEach((el, index) => {
    // Get the text content from the option
    const optionDiv = el.querySelector(".ck-content");
    const teksOpsi = optionDiv
      ? optionDiv.textContent.trim()
      : el.textContent.trim();
    opsi.push({ huruf: String.fromCharCode(65 + index), teks: teksOpsi });
  });

  // Enhanced prompt for better accuracy
  const prompt = `
    Jawab soal berikut dengan SANGAT TELITI dan AKURAT. Berikan jawabannya dengan format 'Jawabannya adalah (X)' di mana X adalah huruf pilihan yang benar (A, B, C, D, atau E).
    
    Pertanyaan: ${questionText}
    ${additionalInfo ? `Keterangan tambahan: ${additionalInfo}` : ""}
    
    Pilihan jawaban:
    ${opsi.map((o) => `${o.huruf}. ${o.teks}`).join("\n")}
    
    PENTING: 
    1. Periksa setiap pilihan jawaban dengan SANGAT TELITI.
    2. Analisis dengan mendalam makna dari setiap kata dalam pertanyaan dan pilihan jawaban.
    3. Gunakan pengetahuan umum dan spesifik yang relevan.
    4. Pertimbangkan konteks dan topik yang sedang dibahas.
    5. Periksa apakah ada petunjuk dalam pertanyaan yang mengarah ke jawaban tertentu.
    6. Pastikan jawaban konsisten dengan fakta yang diketahui.
    
    Berikan jawaban yang PALING TEPAT dan penjelasan singkat namun komprehensif mengapa jawaban tersebut benar.
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
    throw new Error("Tidak ada jawaban yang diterima dari API");
  }

  const jawaban = result.candidates[0].content.parts[0].text;
  console.log("Gemini response:", jawaban);

  // Extract the answer letter (A, B, C, D, or E) from the response
  const answerMatch = jawaban.match(/Jawabannya adalah \(([A-E])\)/i);
  if (!answerMatch) {
    throw new Error(
      "Tidak dapat menentukan jawaban yang benar dari respons AI"
    );
  }

  const correctAnswer = answerMatch[1]; // This will be A, B, C, D, or E
  console.log("Correct answer determined to be:", correctAnswer);

  // Insert answer into ck-content for reference
  const ckContent = questionContainer.querySelector(".ck-content");
  if (ckContent) {
    const pJawaban = document.createElement("p");
    pJawaban.textContent = jawaban;
    pJawaban.style.borderTop = "1px solid #e0e0e0";
    pJawaban.style.paddingTop = "10px";
    pJawaban.style.marginTop = "10px";
    pJawaban.style.backgroundColor = "#212121";
    pJawaban.style.padding = "12px";
    pJawaban.style.borderRadius = "4px";
    ckContent.appendChild(pJawaban);
  }

  // Auto-select the correct answer
  const correctIndex = correctAnswer.charCodeAt(0) - 65; // Convert A->0, B->1, etc.
  if (correctIndex >= 0 && correctIndex < opsiElements.length) {
    const radioButton = opsiElements[correctIndex].querySelector(
      "input[type='radio']"
    );
    if (radioButton) {
      radioButton.click(); // Programmatically click the radio button

      // Highlight the selected answer
      opsiElements[correctIndex].style.backgroundColor = "rgb(18, 18, 18)";
      opsiElements[correctIndex].style.border = "1px solid rgb(30, 30, 30)";
      opsiElements[correctIndex].style.color = "#fff";
      opsiElements[correctIndex].style.fontWeight = "bold";
      opsiElements[correctIndex].style.borderRadius = "4px";
      opsiElements[correctIndex].style.margin = "10px 0";
    } else {
      throw new Error("Tidak dapat menemukan radio button untuk dipilih");
    }
  } else {
    throw new Error("Indeks jawaban yang ditentukan tidak valid");
  }

  return jawaban;
}

// Start the initial load
initializeForm();
