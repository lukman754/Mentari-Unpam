function addMessageToChat(sender, text) {
  const chatHistory = document.getElementById("chatHistory");

  const messageElement = document.createElement("div");
  messageElement.className = `message ${sender}-message`;

  if (sender === "user") {
    messageElement.innerHTML = `
      <div class="message-controls">
        <button class="edit-message" title="Edit">
          <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
            <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
          </svg>
        </button>
      </div>
      ${text}
    `;

    // Add edit functionality to user messages
    setTimeout(() => {
      const editBtn = messageElement.querySelector(".edit-message");
      if (editBtn) {
        editBtn.addEventListener("click", () => {
          const questionInput = document.getElementById("questionInput");
          questionInput.value = text;
          questionInput.focus();

          // Find and remove this message and all messages after it
          let currentElement = messageElement;
          let elementsToRemove = [];

          while (currentElement.nextElementSibling) {
            elementsToRemove.push(currentElement.nextElementSibling);
            currentElement = currentElement.nextElementSibling;
          }

          // Also add the current message to remove
          elementsToRemove.push(messageElement);

          // Remove all marked elements
          elementsToRemove.forEach((el) => el.remove());

          // Save updated chat history
          saveChatHistory();
        });
      }
    }, 0);
  } else {
    messageElement.innerHTML = `
      <div class="message-controls">
        <button class="copy-to-textarea" title="Copy to Textarea">
          <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect>
            <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path>
          </svg>
        </button>
        <button class="copy-to-clipboard" title="Copy to Clipboard">
          <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect>
            <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path>
          </svg>
        </button>
      </div>
      ${text}
    `;

    // Add functionality to bot message buttons
    setTimeout(() => {
      // Copy to textarea functionality
      const copyToTextareaBtn =
        messageElement.querySelector(".copy-to-textarea");
      if (copyToTextareaBtn) {
        copyToTextareaBtn.addEventListener("click", () => {
          // Find and put text to the external textarea
          const externalTextarea = document.querySelector(
            ".MuiInputBase-input.MuiOutlinedInput-input.MuiInputBase-inputMultiline:not([readonly])"
          );

          if (externalTextarea) {
            externalTextarea.value = text;
            externalTextarea.dispatchEvent(
              new Event("input", { bubbles: true })
            );

            // Show in-chat notification
            showChatNotification("Teks berhasil disalin ke textarea!");
          } else {
            showChatNotification("Textarea tidak ditemukan!");
          }

          // Visual feedback on button
          const originalText = copyToTextareaBtn.innerHTML;
          copyToTextareaBtn.innerHTML = `
            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <polyline points="20 6 9 17 4 12"></polyline>
            </svg>
          `;
          setTimeout(() => {
            copyToTextareaBtn.innerHTML = originalText;
          }, 2000);
        });
      }

      // Copy to clipboard functionality
      const copyToClipboardBtn =
        messageElement.querySelector(".copy-to-clipboard");
      if (copyToClipboardBtn) {
        copyToClipboardBtn.addEventListener("click", () => {
          // Copy text directly to clipboard
          navigator.clipboard
            .writeText(text)
            .then(() => {
              showChatNotification("Teks berhasil disalin ke clipboard!");
            })
            .catch((err) => {
              showChatNotification("Gagal menyalin teks: " + err);
            });

          // Visual feedback on button
          const originalText = copyToClipboardBtn.innerHTML;
          copyToClipboardBtn.innerHTML = `
            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <polyline points="20 6 9 17 4 12"></polyline>
            </svg>
          `;
          setTimeout(() => {
            copyToClipboardBtn.innerHTML = originalText;
          }, 2000);
        });
      }
    }, 0);
  }

  chatHistory.appendChild(messageElement);
  chatHistory.scrollTop = chatHistory.scrollHeight;
}

function showChatNotification(message) {
  const chatHistory = document.getElementById("chatHistory");

  // Create notification element
  const notificationElement = document.createElement("div");
  notificationElement.className = "chat-notification";
  notificationElement.textContent = message;

  // Add to chat
  chatHistory.appendChild(notificationElement);
  chatHistory.scrollTop = chatHistory.scrollHeight;

  // Remove after delay
  setTimeout(() => {
    notificationElement.classList.add("fade-out");
    setTimeout(() => {
      notificationElement.remove();
    }, 500);
  }, 2000);
}

function setupChatbotEventListeners(encodedApiKey) {
  const chatbotToggle = document.getElementById("geminiChatbotToggle");
  const chatbot = document.getElementById("geminiChatbot");
  const closeChatButton = document.getElementById("closeChatButton");
  const clearChatButton = document.getElementById("clearChatButton");
  const questionInput = document.getElementById("questionInput");
  const submitButton = document.getElementById("submitButton");
  const chatHistory = document.getElementById("chatHistory");
  const templateButtons = document.querySelectorAll(".template-buttons button");
  const copyQuestionButton = document.getElementById("copyQuestionButton");

  // Toggle chatbot visibility
  chatbotToggle.addEventListener("click", () => {
    chatbot.style.display = chatbot.style.display === "none" ? "flex" : "none";
  });

  // Close chatbot
  closeChatButton.addEventListener("click", () => {
    chatbot.style.display = "none";
  });

  // Clear chat history
  clearChatButton.addEventListener("click", () => {
    if (confirm("Hapus seluruh riwayat chat?")) {
      chatHistory.innerHTML = "";
      localStorage.removeItem("gemini_chat_history");
    }
  });

  // Copy question from DOM to input
  // Copy question from DOM to input
  copyQuestionButton.addEventListener("click", () => {
    const contentElement = document.querySelector(".ck-content");
    if (contentElement) {
      // Get all text content from all child elements
      const allText = [];

      // Process all child nodes recursively to extract text
      const extractText = (element) => {
        Array.from(element.childNodes).forEach((node) => {
          if (node.nodeType === Node.TEXT_NODE) {
            // Add text node content if it's not just whitespace
            const text = node.textContent.trim();
            if (text) allText.push(text);
          } else if (node.nodeType === Node.ELEMENT_NODE) {
            // For element nodes, check if it's a block element
            // If it is, add a space before adding its text
            const isBlockElement =
              window.getComputedStyle(node).display === "block";

            if (isBlockElement && allText.length > 0) {
              // Add a space between block elements
              extractText(node);
            } else {
              extractText(node);
            }
          }
        });
      };

      extractText(contentElement);

      // Join all text with proper spacing
      const questionText = allText.join(" ").trim();
      questionInput.value = questionText;

      // Show in-chat notification
      showChatNotification("Pertanyaan berhasil disalin!");

      // Focus on the input
      questionInput.focus();
    } else {
      showChatNotification("Tidak dapat menemukan pertanyaan.");
    }
  });

  // Template prompt buttons
  templateButtons.forEach((button) => {
    button.addEventListener("click", () => {
      const template = button.getAttribute("data-prompt");
      let currentText = questionInput.value.trim();

      if (currentText) {
        // Instead of prefixing the text, store the template in a data attribute
        questionInput.setAttribute("data-template", template);
        // Keep the original text in the input
        questionInput.value = currentText;
      } else {
        questionInput.value = "";
        questionInput.setAttribute("data-template", template);
      }

      questionInput.focus();

      // Show in-chat notification for template selection
      showChatNotification(`Template "${template}" dipilih`);
    });
  });

  // Submit on Enter (but allow Shift+Enter for new lines)
  questionInput.addEventListener("keydown", (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      submitButton.click();
    }
  });

  // Submit button click
  submitButton.addEventListener("click", async () => {
    const question = questionInput.value.trim();
    if (!question) return;

    // Get the selected template if any
    const template = questionInput.getAttribute("data-template") || "";

    // Add user message to chat without showing the template
    addMessageToChat("user", question);

    // Clear input and template
    questionInput.value = "";
    questionInput.removeAttribute("data-template");

    // Add the typing indicator
    const typingIndicator = addTypingIndicator();

    try {
      // Decode the API key
      const apiKey = atob(encodedApiKey);

      // Get answer from Gemini, including template in the actual request
      let fullPrompt = question;
      if (template) {
        fullPrompt = `${template}: ${question}`;
      }

      const answer = await getAnswerFromGemini(apiKey, fullPrompt);

      // Remove typing indicator
      typingIndicator.remove();

      // Add bot message to chat
      addMessageToChat("bot", answer);

      // Save chat history
      saveChatHistory();
    } catch (error) {
      // Remove typing indicator
      typingIndicator.remove();

      // Add error message
      addMessageToChat("bot", `Maaf, terjadi kesalahan: ${error.message}`);

      // Save chat history
      saveChatHistory();
    }
  });
}

function addChatbotStyles() {
  const styleElement = document.createElement("style");
  styleElement.textContent = `
    /* Toggle Button */
    /* Toggle Button */
    .chatbot-toggle {
      position: fixed;
      bottom: 70px;
      right: 20px;
      width: 60px;
      height: 60px;
      border-radius: 50%;
      background-color: rgba(48, 48, 48, 0.7);
      backdrop-filter: blur(8px);
      -webkit-backdrop-filter: blur(8px);
      display: flex;
      align-items: center;
      justify-content: center;
      cursor: pointer;
      box-shadow: 0 4px 10px rgba(0, 0, 0, 0.2);
      z-index: 99998;
      transition: all 0.3s ease;
    }

    .chatbot-toggle:hover {
      transform: scale(1.1);
    }


    
    .tooltip {
      position: absolute;
      top: -25px;
      right: 50px;
      background-color: rgba(226, 226, 226, 0.82);
      backdrop-filter: blur(8px);
      color: black;
      padding: 5px 10px;
      border-radius: 20px 20px 0 20px;
      font-size: 14px;
      white-space: nowrap;
      opacity: 0;
      transition: opacity 0.3s;
      pointer-events: none;
    }
    
    /* Remove the hover requirement for tooltip display */
    /* .chatbot-toggle:hover .tooltip {
      opacity: 1;
    } */
    
    /* Add animation for tooltip */
    @keyframes tooltipPulse {
      0% { transform: scale(1); }
      50% { transform: scale(1.05); }
      100% { transform: scale(1); }
    }
    
    .tooltip {
      animation: tooltipPulse 2s infinite;
    }

    /* Chatbot Container */
    .chatbot-container {
      position: fixed;
      bottom: 20px;
      right: 20px;
      width: 90%;
      max-width: 600px;
      height: 80vh;
      max-height: 650px;
      background-color: rgba(48, 48, 48, 0.5);
      backdrop-filter: blur(8px);
      -webkit-backdrop-filter: blur(8px);
      border-radius: 12px;
      box-shadow: 0 5px 20px rgba(0, 0, 0, 0.3);
      display: flex;
      flex-direction: column;
      z-index: 99999;
      overflow: hidden;
      border: 1px solid #333;
      color: #eee;
      font-family: Arial, sans-serif;
    }

    /* Chatbot Header */
    .chatbot-header {
      padding: 12px;
      background: #252525;
      border-bottom: 1px solid #333;
      display: flex;
      justify-content: space-between;
      align-items: center;
    }

    .chatbot-header h3 {
      margin: 0;
      font-size: 14px;
      color: #eee;
    }

    .chatbot-actions {
      display: flex;
      gap: 6px;
    }

    .chatbot-actions button {
      background: transparent;
      border: none;
      color: #aaa;
      cursor: pointer;
      padding: 3px;
      border-radius: 4px;
      display: flex;
      align-items: center;
      justify-content: center;
    }

    .chatbot-actions button:hover {
      background: rgba(255,255,255,0.1);
      color: #fff;
    }

    /* Chat History */
    .chat-history {
      flex: 1;
      overflow-y: auto;
      padding: 12px;
      display: flex;
      flex-direction: column;
      gap: 12px;
    }

    .message {
      max-width: 90%;
      padding: 10px 14px;
      border-radius: 12px;
      line-height: 1.5;
      font-size: 14px;
      position: relative;
      word-wrap: break-word;
    }

    .user-message {
      align-self: flex-end;
      background: #0070f3;
      color: white;
      border-radius: 12px 12px 0 12px;
    }

    .bot-message {
      align-self: flex-start;
      background: #252525;
      color: #eee;
      border-radius: 12px 12px 12px 0;
      border: 1px solid #333;
    }

    .message-controls {
      display: flex;
      gap: 6px;
      position: absolute;
      right: 8px;
      bottom: -5px;
      opacity: 0;
      z-index: 999;
      transition: opacity 0.2s;
    }

    .message:hover .message-controls {
      opacity: 1;
    }

    .message-controls button {
      background: #252525;
      border: 1px solid #333;
      color: #aaa;
      border-radius: 4px;
      padding: 2px 4px;
      font-size: 11px;
      cursor: pointer;
      display: flex;
      align-items: center;
    }

    .message-controls button:hover {
      background: #333;
      color: #fff;
    }

    .message-controls button svg {
      width: 12px;
      height: 12px;
    }

    .typing-indicator {
      display: flex;
      align-items: center;
      gap: 4px;
      margin-left: 10px;
    }

    .typing-dot {
      width: 6px;
      height: 6px;
      background: #aaa;
      border-radius: 50%;
      animation: typing-animation 1.5s infinite ease-in-out;
    }

    .typing-dot:nth-child(2) {
      animation-delay: 0.2s;
    }

    .typing-dot:nth-child(3) {
      animation-delay: 0.4s;
    }

    @keyframes typing-animation {
      0%, 100% { opacity: 0.3; transform: scale(0.8); }
      50% { opacity: 1; transform: scale(1); }
    }

    /* Template Prompts */
    .template-prompts {
      padding: 8px 12px;
      border-top: 1px solid #333;
      background: #25252582;
    }

    .template-label {
      font-size: 11px;
      color: #aaa;
      margin-bottom: 4px;
    }

    .template-buttons {
      display: flex;
      flex-wrap: wrap;
      gap: 6px;
    }

    .template-buttons button {
      padding: 4px 8px;
      background: #333;
      border: none;
      border-radius: 16px;
      font-size: 11px;
      color: #eee;
      cursor: pointer;
      white-space: nowrap;
    }

    .template-buttons button:hover {
      background: #444;
    }

    /* Input Area */
    .chatbot-input-area {
      padding: 12px;
      border-top: 1px solid #333;
      display: flex;
      background: #1e1e1e;
      gap: 8px;
    }

    .chatbot-input-area textarea {
      flex: 1;
      padding: 8px;
      border: 1px solid #333;
      border-radius: 8px;
      background: #252525;
      color: #eee;
      font-size: 14px;
      resize: none;
      min-height: 40px;
      max-height: 80px;
      overflow-y: auto;
    }

    .chatbot-input-area textarea:focus {
      outline: none;
      border-color: #0070f3;
    }

    .chatbot-input-area button {
      width: 36px;
      height: 36px;
      background: #0070f3;
      color: white;
      border: none;
      border-radius: 8px;
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      align-self: flex-end;
    }

    .chatbot-input-area button:hover {
      background: #0060df;
    }

    .chatbot-input-area button:disabled {
      background: #333;
      cursor: not-allowed;
    }
    
    /* Chat notification */
    .chat-notification {
      align-self: center;
      background: rgba(0, 112, 243, 0.8);
      color: white;
      padding: 6px 10px;
      border-radius: 16px;
      font-size: 11px;
      margin: 6px 0;
      animation: fadeIn 0.3s ease-in-out;
      opacity: 1;
      transition: opacity 0.5s;
    }
    
    .chat-notification.fade-out {
      opacity: 0;
    }
    
    @keyframes fadeIn {
      0% { opacity: 0; transform: translateY(10px); }
      100% { opacity: 1; transform: translateY(0); }
    }

    /* Media Queries for Responsive Design */
    @media (max-width: 768px) {
      .chatbot-container {
        width: 98%;
        height: 85vh;
        right: 5px;
        bottom: 5px;
      }
    }

    @media (max-width: 480px) {
      .chatbot-container {
        width: 98%;
        height: 75vh;
        right: 4px;
        bottom: 5px;
        border-radius: 5px;
      }
      
      .message {
        max-width: 95%;
        padding: 8px 12px;
        font-size: 13px;
      }

      .template-buttons button {
        padding: 3px 6px;
        font-size: 10px;
      }

      .chatbot-input-area {
        padding: 8px;
      }

      .chatbot-input-area textarea {
        padding: 6px;
        font-size: 13px;
      }
    }
  `;
  document.head.appendChild(styleElement);
}

function loadChatHistory() {
  const chatHistory = document.getElementById("chatHistory");
  const savedHistory = localStorage.getItem("gemini_chat_history");

  if (savedHistory) {
    chatHistory.innerHTML = savedHistory;

    // Re-attach event listeners to buttons
    setTimeout(() => {
      // Re-attach edit buttons
      const editBtns = document.querySelectorAll(".edit-message");
      editBtns.forEach((btn) => {
        btn.addEventListener("click", () => {
          const questionInput = document.getElementById("questionInput");
          const messageText = btn.closest(".message").textContent.trim();
          questionInput.value = messageText;
          questionInput.focus();

          // Find and remove this message and all messages after it
          let currentElement = btn.closest(".message");
          let elementsToRemove = [];

          while (currentElement.nextElementSibling) {
            elementsToRemove.push(currentElement.nextElementSibling);
            currentElement = currentElement.nextElementSibling;
          }

          // Also add the current message to remove
          elementsToRemove.push(btn.closest(".message"));

          // Remove all marked elements
          elementsToRemove.forEach((el) => el.remove());

          // Save updated chat history
          saveChatHistory();
        });
      });

      // Re-attach copy buttons with the new functionality
      const copyBtns = document.querySelectorAll(".copy-message");
      copyBtns.forEach((btn) => {
        btn.addEventListener("click", () => {
          const messageText = btn.closest(".message").textContent.trim();

          // Try to find Claude's textarea
          const externalTextarea = document.querySelector(
            ".MuiInputBase-input.MuiOutlinedInput-input.MuiInputBase-inputMultiline:not([readonly])"
          );

          if (externalTextarea) {
            externalTextarea.value = messageText;
            externalTextarea.dispatchEvent(
              new Event("input", { bubbles: true })
            );

            // Show in-chat notification
            showChatNotification("Teks berhasil disalin ke textarea!");
          } else {
            // Fallback to clipboard if textarea not found
            navigator.clipboard.writeText(messageText).then(() => {
              showChatNotification("Teks berhasil disalin ke clipboard!");
            });
          }

          // Visual feedback for button
          const originalText = btn.innerHTML;
          btn.innerHTML = `
            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <polyline points="20 6 9 17 4 12"></polyline>
            </svg>
          `;
          setTimeout(() => {
            btn.innerHTML = originalText;
          }, 2000);
        });
      });
    }, 0);
  }
}

async function getAnswerFromGemini(apiKey, question) {
  // Create a simple prompt
  const prompt = `
    ${question}

    jawab pertanyaan diatas dengan jelas, jangan menggunakan huruf tebal ataupun miring dan jangan gunakan karakter khusus seperti (*) pada jawabannya
  `;

  const response = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-thinking-exp-01-21:generateContent?key=${apiKey}`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: {
          temperature: 0.9,
          maxOutputTokens: 4536,
          topP: 0.95,
          topK: 40,
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

function monitorForClaudeTextarea() {
  // This will try to find Claude's textarea every 2 seconds
  setInterval(() => {
    const claudeTextarea = document.querySelector(
      ".MuiInputBase-input.MuiOutlinedInput-input.MuiInputBase-inputMultiline:not([readonly])"
    );
    if (claudeTextarea) {
      // Store the reference globally so it can be used by the copy buttons
      window.claudeTextarea = claudeTextarea;
    }
  }, 2000);
}

function createChatbotInterface() {
  // Check if chatbot already exists
  if (document.getElementById("geminiChatbot")) return;

  // Encode API key (simple base64 encoding)
  const encodedApiKey = btoa("AIzaSyDmt6Gw6wG0JwwrLvmnCkUSnog4IejHNu0");

  // Create chatbot elements with enhanced structure
  const chatbotHtml = `
   <div id="geminiChatbotToggle" class="chatbot-toggle">
    <img src="https://raw.githubusercontent.com/Tarikul-Islam-Anik/Telegram-Animated-Emojis/main/Smileys/Robot.webp" alt="Robot" width="50" height="50" />
    <div class="tooltip" id="geminiTooltip">Hai, aku Gemini Assistant!</div>
  </div>


    <div id="geminiChatbot" class="chatbot-container" style="display: none;">
      <div class="chatbot-header">
        <h3>Gemini Assistant</h3>
        <div class="chatbot-actions">
          <button id="clearChatButton" title="Clear Chat">
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M3 6h18"></path>
              <path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"></path>
              <path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"></path>
            </svg>
          </button>
          <button id="closeChatButton" title="Close">
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <line x1="18" y1="6" x2="6" y2="18"></line>
              <line x1="6" y1="6" x2="18" y2="18"></line>
            </svg>
          </button>
        </div>
      </div>
      
      <div id="chatHistory" class="chat-history"></div>
      
      <div class="template-prompts">
        <div class="template-label">Template Prompts:</div>
        <div class="template-buttons">
            <button data-prompt="Jelaskan secara singkat dan jelas">Singkat & Jelas</button>
            <button data-prompt="Buat dalam 1 paragraf tanpa pemisah">1 Paragraf</button>
            <button data-prompt="Buat dalam 2 paragraf tanpa pemisah">2 Paragraf</button>
            <button data-prompt="Sebutkan 3 poin utama yang perlu diketahui">3 Poin Utama</button>
            <button data-prompt="Jelaskan dengan cara yang mudah dimengerti anak 10 tahun">Sederhana</button>
            <button data-prompt="Berikan contoh nyata atau kasus penggunaan">Contoh Nyata</button>
            <button data-prompt="Beri langkah-langkah atau panduan praktis">Panduan Langkah</button>
            <button data-prompt="Jelaskan dengan bahasa yang lebih teknis">Teknis</button>
            <button data-prompt="Sederhanakan dalam bentuk analogi yang mudah dibayangkan">Analogi</button>
            <button data-prompt="Beri penjelasan secara mendalam dan detail">Mendalam</button>
        </div>
      </div>
      
      <div class="chatbot-input-area">
        <textarea 
          id="questionInput"
          placeholder="Tulis pertanyaan Anda di sini..."
          rows="3"
        ></textarea>
        <div>
        <button id="copyQuestionButton" style="margin-bottom: 10px; background-color:rgb(89, 89, 89)" title="Copy Question">
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect>
              <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path>
            </svg>
        </button>
        <button id="submitButton">
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <line x1="22" y1="2" x2="11" y2="13"></line>
            <polygon points="22 2 15 22 11 13 2 9 22 2"></polygon>
          </svg>
        </button>
        </div>
      </div>
    </div>
  `;

  // Create the chatbot element
  const chatbotElement = document.createElement("div");
  chatbotElement.innerHTML = chatbotHtml;
  document.body.appendChild(chatbotElement);

  // Setup tooltips with controlled display frequency
  const tooltips = [
    "Hai, aku Gemini Assistant!",
    "Ada yang bisa kubantu?",
    "Klik aku untuk ngobrol!",
    "Punya pertanyaan? Tanyakan saja!",
    "Gemini siap membantu kamu!",
    "Butuh sesuatu? Aku di sini!",
  ];

  // Function to manage tooltip display with less frequency
  function initializeTooltips() {
    const tooltip = document.getElementById("geminiTooltip");
    const toggle = document.getElementById("geminiChatbotToggle");

    if (!tooltip || !toggle) return;

    // Set tooltip to initially invisible
    tooltip.style.opacity = "0";

    let tooltipIndex = 0;

    // Main cycle function: show tooltip briefly then hide for longer period
    function tooltipCycle() {
      // Show tooltip for 3 seconds
      tooltipIndex = (tooltipIndex + 1) % tooltips.length;
      tooltip.textContent = tooltips[tooltipIndex];
      tooltip.style.opacity = "1";

      // Hide after 3 seconds and wait longer before showing next one
      setTimeout(() => {
        // Fade out tooltip
        tooltip.style.opacity = "0";

        // Wait longer before showing next tooltip (15 seconds hidden)
        setTimeout(tooltipCycle, 15000);
      }, 3000);
    }

    // Start the first cycle after a short delay
    setTimeout(tooltipCycle, 1000);

    // Also change tooltip on mouse enter and keep visible while hovering
    toggle.addEventListener("mouseenter", function () {
      const randomIndex = Math.floor(Math.random() * tooltips.length);
      tooltip.textContent = tooltips[randomIndex];
      tooltip.style.opacity = "1";
    });

    // Hide tooltip when mouse leaves, unless during the 3-second display period
    toggle.addEventListener("mouseleave", function () {
      // Let the normal cycle determine visibility
    });
  }

  // Add the CSS styles
  addChatbotStyles();

  // Setup event listeners
  setupChatbotEventListeners(encodedApiKey);

  // Load chat history from localStorage
  loadChatHistory();

  // Start monitoring for Claude's textarea
  monitorForClaudeTextarea();

  // Initialize tooltips after a short delay to ensure DOM is ready
  setTimeout(initializeTooltips, 500);
}

// Function to add typing indicator
function addTypingIndicator() {
  const chatHistory = document.getElementById("chatHistory");

  const typingElement = document.createElement("div");
  typingElement.className = "message bot-message typing";
  typingElement.innerHTML = `
    <div class="typing-indicator">
      <div class="typing-dot"></div>
      <div class="typing-dot"></div>
      <div class="typing-dot"></div>
    </div>
  `;

  chatHistory.appendChild(typingElement);
  chatHistory.scrollTop = chatHistory.scrollHeight;

  return typingElement;
}

// Function to save chat history to localStorage
function saveChatHistory() {
  const chatHistory = document.getElementById("chatHistory");
  localStorage.setItem("gemini_chat_history", chatHistory.innerHTML);
}

// Initialize the chatbot
createChatbotInterface();
