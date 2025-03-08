// Function to create and inject the Q&A form
function createQAForm() {
  // Check if form already exists
  if (document.getElementById("geminiQAForm")) return;

  // Create form elements with simple structure
  const formHtml = `
    <div id="geminiQAForm" class="form-container">
      <div class="input-row">
        <label>API Key</label>
        <input 
          type="password" 
          id="apiKeyInput"
          placeholder="Enter your Gemini API key"
        />
      </div>
      
      <div class="input-row">
        <label>Question/Input</label>
        <textarea 
          id="questionInput"
          placeholder="Enter your question or paste content here..."
          rows="5"
        ></textarea>
      </div>
      
      <div class="button-row">
        <button id="submitButton">Get Answer</button>
        <button id="usePageQuestionButton">Use Page Question</button>
      </div>
      
      <div id="loadingIndicator" style="display: none;">
        Processing...
      </div>
      
      <div id="errorMessage" style="display: none;"></div>
      
      <div id="answerContainer" style="display: none;">
        <div class="answer-header">
          <h3>Answer</h3>
          <button id="copyButton">Copy</button>
        </div>
        <div id="answerText"></div>
      </div>
    </div>
  `;

  // Find target element - look for the question container
  const questionContainer = document.querySelector(".ck-content");

  if (questionContainer) {
    // Create the form element
    const formElement = document.createElement("div");
    formElement.innerHTML = formHtml;

    // Insert after the question container
    questionContainer.parentNode.insertBefore(
      formElement,
      questionContainer.nextSibling
    );

    // Add the CSS styles to the page
    addStyles();

    // Setup event listeners
    setupEventListeners();

    // Restore any saved API key
    const savedApiKey = localStorage.getItem("gemini_api_key");
    if (savedApiKey) {
      document.getElementById("apiKeyInput").value = savedApiKey;
    }
  }
}

// Function to add the CSS styles to the document
function addStyles() {
  const styleElement = document.createElement("style");
  styleElement.textContent = `
    /* Form Container */
    #geminiQAForm {
      margin: 16px 0;
      padding: 16px;
      background: #1e1e1e;
      border-radius: 8px;
      border: 1px solid #333;
      color: #eee;
      font-family: Arial, sans-serif;
    }

    /* Input Rows */
    #geminiQAForm .input-row {
      margin-bottom: 16px;
    }

    #geminiQAForm label {
      display: block;
      margin-bottom: 8px;
      font-size: 14px;
    }

    #geminiQAForm input,
    #geminiQAForm textarea {
      width: 100%;
      padding: 8px 12px;
      border: 1px solid #333;
      border-radius: 4px;
      background: #252525;
      color: #eee;
      font-size: 14px;
      box-sizing: border-box;
    }

    #geminiQAForm textarea {
      resize: vertical;
      min-height: 100px;
    }

    #geminiQAForm input:focus,
    #geminiQAForm textarea:focus {
      border-color: #0070f3;
      outline: none;
    }

    /* Button Row */
    #geminiQAForm .button-row {
      display: flex;
      gap: 10px;
    }

    #geminiQAForm button {
      padding: 8px 16px;
      border: none;
      border-radius: 4px;
      cursor: pointer;
      font-size: 14px;
      transition: background-color 0.2s;
    }

    #geminiQAForm #submitButton {
      background-color: #0070f3;
      color: white;
      flex: 1;
    }

    #geminiQAForm #usePageQuestionButton {
      background-color: #444;
      color: white;
    }

    #geminiQAForm button:hover {
      opacity: 0.9;
    }

    #geminiQAForm button:disabled {
      background-color: #333;
      color: #777;
      cursor: not-allowed;
    }

    /* Loading Indicator */
    #geminiQAForm #loadingIndicator {
      margin: 16px 0;
      padding: 8px;
      background: #252525;
      border-radius: 4px;
      text-align: center;
      color: #eee;
    }

    /* Error Message */
    #geminiQAForm #errorMessage {
      margin: 16px 0;
      padding: 8px;
      background: #ff4d4f;
      color: white;
      border-radius: 4px;
      font-size: 14px;
    }

    /* Answer Container */
    #geminiQAForm #answerContainer {
      margin-top: 20px;
      border-top: 1px solid #333;
      padding-top: 16px;
    }

    #geminiQAForm .answer-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 12px;
    }

    #geminiQAForm .answer-header h3 {
      margin: 0;
      font-size: 16px;
    }

    #geminiQAForm #copyButton {
      padding: 4px 10px;
      background-color: #252525;
      color: #eee;
      border: 1px solid #333;
    }

    #geminiQAForm #answerText {
      background-color: #252525;
      border: 1px solid #333;
      border-radius: 4px;
      padding: 16px;
      white-space: pre-wrap;
      max-height: 500px;
      overflow-y: auto;
      line-height: 1.5;
      font-size: 14px;
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
  createQAForm();
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

// Setup event listeners for form interaction
function setupEventListeners() {
  const apiKeyInput = document.getElementById("apiKeyInput");
  const questionInput = document.getElementById("questionInput");
  const submitButton = document.getElementById("submitButton");
  const usePageQuestionButton = document.getElementById(
    "usePageQuestionButton"
  );
  const loadingIndicator = document.getElementById("loadingIndicator");
  const errorMessage = document.getElementById("errorMessage");
  const copyButton = document.getElementById("copyButton");
  const answerContainer = document.getElementById("answerContainer");
  const answerText = document.getElementById("answerText");

  // Submit button event
  submitButton.addEventListener("click", async () => {
    const apiKey = apiKeyInput.value.trim();
    const question = questionInput.value.trim();

    if (!apiKey) {
      showError("Please enter an API key");
      return;
    }

    if (!question) {
      showError("Please enter a question");
      return;
    }

    // Save API key
    localStorage.setItem("gemini_api_key", apiKey);

    // Show loading, hide error
    loadingIndicator.style.display = "block";
    errorMessage.style.display = "none";
    answerContainer.style.display = "none";
    submitButton.disabled = true;
    usePageQuestionButton.disabled = true;

    try {
      const answer = await getAnswerFromGemini(apiKey, question);
      answerText.textContent = answer;
      answerContainer.style.display = "block";
    } catch (error) {
      showError(error.message || "Failed to get answer");
    } finally {
      loadingIndicator.style.display = "none";
      submitButton.disabled = false;
      usePageQuestionButton.disabled = false;
    }
  });

  // Use page question button event
  usePageQuestionButton.addEventListener("click", () => {
    const questionElement = document.querySelector(".ck-content > p");
    if (questionElement) {
      questionInput.value = questionElement.textContent.trim();
    } else {
      showError("No question found on the page");
    }
  });

  // Copy button event
  copyButton.addEventListener("click", () => {
    const text = answerText.textContent;
    navigator.clipboard.writeText(text).then(() => {
      const originalText = copyButton.textContent;
      copyButton.textContent = "Copied!";
      setTimeout(() => {
        copyButton.textContent = originalText;
      }, 2000);
    });
  });

  // Helper to show error
  function showError(message) {
    errorMessage.textContent = message;
    errorMessage.style.display = "block";
  }
}

// Function to get answer from Gemini API
async function getAnswerFromGemini(apiKey, question) {
  // Create a simple prompt
  const prompt = `
    Berikut adalah pertanyaan atau teks yang perlu dijawab:
    
    ${question}
    
    Berikan jawaban yang jelas, dibagi menjadi beberapa paragraf yang saling berhubungan.
    Jangan gunakan karakter spesial seperti # atau * atau formatting apapun seperti huruf bold atau miring.
    Jangan terlalu banyak point. Gunakan bahasa yang tidak terlalu baku namun tetap sopan seperti seorang mahasiswa.
  `;

  const response = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: {
          temperature: 0.7,
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
    throw new Error("Failed to generate answer");
  }

  return result.candidates[0].content.parts[0].text;
}

// Start the initial load
initializeForm();
