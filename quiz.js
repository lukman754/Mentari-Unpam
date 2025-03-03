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
            Solve Quiz
          </button>
        </div>
      </div>
    </div>
    <div id="apiKeyResponsePopup"></div>
  `;

  // Find target elements using more reliable selectors
  const optionsContainer = Array.from(
    document.querySelectorAll(".MuiFormControlLabel-root")
  ).at(-1)?.parentElement;

  if (optionsContainer) {
    // Create the form element
    const formElement = createElementFromHTML(formHtml);

    // Insert after the options container
    optionsContainer.parentNode.insertBefore(
      formElement,
      optionsContainer.nextSibling
    );

    // Add the CSS styles to the page
    addStyles();

    // Setup event listeners
    setupEventListeners();
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
        align-items: center;
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
      padding: 8px 16px;
      color: white;
      background-color: #0070f3;
      border: none;
      border-radius: 4px;
      cursor: pointer;
      font-weight: 500;
      text-transform: uppercase;
      font-size: 14px;
      transition: background-color 0.2s;
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
  `;
  document.head.appendChild(styleElement);
}

// Function to wait for page load and elements
async function waitForElements() {
  return new Promise((resolve) => {
    const checkElements = () => {
      const options = document.querySelectorAll(".MuiFormControlLabel-root");
      if (options.length > 0) {
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

  // Load saved API key
  const savedApiKey = localStorage.getItem("gemini_api_key");
  if (savedApiKey) {
    apiKeyInput.value = savedApiKey;
  }

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

    try {
      await jawabQuiz(apiKey);
      showPopup("Answer processed successfully!");
    } catch (error) {
      errorDiv.textContent = error.message || "Failed to process answer";
      errorDiv.style.display = "block";
      showPopup(error.message || "Failed to process answer", true);
    } finally {
      solveButton.disabled = false;
      solveButton.textContent = "Solve Quiz";
    }
  });
}

async function jawabQuiz(apiKey) {
  // Get the question from the h6 element
  const questionElement = document.querySelector("h6.MuiTypography-subtitle1");
  const pertanyaanElement = document.querySelector(".ck-content > p");
  const opsiElements = document.querySelectorAll(".MuiFormControlLabel-root");

  if (!questionElement || opsiElements.length === 0) {
    throw new Error("Question or options not found.");
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

  const prompt = `
    Jawab soal berikut dengan benar dan berikan jawabannya dengan format 'Jawabannya adalah (X)' di mana X adalah huruf pilihan yang benar (A, B, C, atau D).
    
    Pertanyaan: ${questionText}
    ${additionalInfo ? `Keterangan tambahan: ${additionalInfo}` : ""}
    
    Pilihan jawaban:
    ${opsi.map((o) => `${o.huruf}. ${o.teks}`).join("\n")}
    
    Berikan jawaban yang paling tepat dan penjelasan singkat mengapa jawaban tersebut benar.
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

  const jawaban = result.candidates[0].content.parts[0].text;
  console.log("Gemini response:", jawaban);

  // Extract the answer letter (A, B, C, or D) from the response
  const answerMatch = jawaban.match(/Jawabannya adalah \(([A-D])\)/i);
  if (!answerMatch) {
    throw new Error("Could not determine the correct answer from AI response");
  }

  const correctAnswer = answerMatch[1]; // This will be A, B, C, or D
  console.log("Correct answer determined to be:", correctAnswer);

  // Insert answer into ck-content for reference
  const ckContent = document.querySelector(".ck-content");
  if (ckContent) {
    const pJawaban = document.createElement("p");
    pJawaban.textContent = jawaban;
    pJawaban.style.borderTop = "1px solid #e0e0e0";
    pJawaban.style.paddingTop = "10px";
    pJawaban.style.marginTop = "10px";
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
      opsiElements[correctIndex].style.backgroundColor = "#ffd166";
      opsiElements[correctIndex].style.border = "1px solid #554800";
      opsiElements[correctIndex].style.color = "#000";
      opsiElements[correctIndex].style.fontWeight = "bold";
      opsiElements[correctIndex].style.borderRadius = "4px";
      // margin left & right is 0
      opsiElements[correctIndex].style.margin = "10px 0";
    } else {
      throw new Error("Could not find radio button to select");
    }
  } else {
    throw new Error("Invalid answer index determined");
  }

  return jawaban;
}

// Start the initial load
initializeForm();
