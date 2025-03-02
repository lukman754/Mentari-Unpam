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

// Function to click the Reply button
function clickReplyButton() {
  const replyButton = document.querySelector(
    "button.MuiButton-containedSuccess"
  );
  if (replyButton) {
    console.log("Clicking Reply button...");
    replyButton.click();
    return true;
  }
  return false;
}

// Function to check if textarea exists
function checkTextarea() {
  return (
    document.querySelector("textarea.MuiInputBase-inputMultiline") !== null
  );
}

// Function to wait for textarea to appear
async function waitForTextarea(maxWaitTime = 5000) {
  return new Promise((resolve) => {
    const startTime = Date.now();

    const checkForTextarea = () => {
      if (checkTextarea()) {
        resolve(true);
        return;
      }

      const elapsedTime = Date.now() - startTime;
      if (elapsedTime > maxWaitTime) {
        resolve(false);
        return;
      }

      setTimeout(checkForTextarea, 100);
    };

    checkForTextarea();
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
  const copyButton = document.getElementById("copyButton");
  const answerContainer = document.getElementById("answerContainer");
  const markdownAnswer = document.getElementById("markdownAnswer");

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
    answerContainer.style.display = "none";

    try {
      // Check if textarea exists or try to make it appear
      let textareaExists = checkTextarea();

      if (!textareaExists) {
        // Try to click Reply button
        const clickedReply = clickReplyButton();

        if (clickedReply) {
          // Wait for textarea to appear
          textareaExists = await waitForTextarea();
        }
      }

      const answer = await generateEssayAnswer(apiKey);

      // If textarea exists, fill it with the answer
      if (textareaExists) {
        const textarea = document.querySelector(
          "textarea.MuiInputBase-inputMultiline"
        );
        textarea.value = answer;

        // Trigger input event to update any react/virtual DOM state
        const inputEvent = new Event("input", { bubbles: true });
        textarea.dispatchEvent(inputEvent);

        showPopup("Answer inserted into textarea!");
      } else {
        // Show answer in the container as before if textarea not found
        markdownAnswer.textContent = answer;
        answerContainer.style.display = "block";
        showPopup("Textarea not found. Answer generated in preview.");
      }
    } catch (error) {
      errorDiv.textContent = error.message || "Failed to generate answer";
      errorDiv.style.display = "block";
      showPopup(error.message || "Failed to generate answer", true);
    } finally {
      solveButton.disabled = false;
      solveButton.textContent = "Generate Answer";
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
    berikan jawaban yang jelas dan unik seperti seorang mahasiswa jangan terlalu baku namun sopan, jawabannya dibuat menjadi paragraf saja jika terdapat point maka point itu diringkas saja dan jangan gunakan huruf spesial seperti (# *) dll, gunakan itu jika memang digunakan, dan jangan terlalu banyak point untuk pertanyaan berikut ini:
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

// Start the initial load
initializeForm();
