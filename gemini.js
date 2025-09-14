function addMessageToChat(sender, text) {
  const chatHistory = document.getElementById("chatHistory");

  const messageElement = document.createElement("div");
  messageElement.className = `message ${sender}-message`;

  // Store original text with line breaks for copy operations
  messageElement.setAttribute("data-original-text", text);

  // Format for display while preserving line breaks
  // Handle text content properly to avoid double parsing of <p> tags
  const formattedText = text.replace(/\n/g, "<br>");

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
      <div class="user-avatar">
        <img src="https://raw.githubusercontent.com/Tarikul-Islam-Anik/Telegram-Animated-Emojis/main/Animals%20and%20Nature/Fox.webp" alt="User" width="24" height="24">
      </div>
      <div class="message-content">${formattedText}</div>
    `;

    // Add edit functionality to user messages
    // Edit functionality for user messages
    setTimeout(() => {
      const editBtn = messageElement.querySelector(".edit-message");
      if (editBtn) {
        editBtn.addEventListener("click", function (event) {
          // Prevent any default actions or event bubbling
          event.preventDefault();
          event.stopPropagation();

          // Get the text input field
          const questionInput = document.getElementById("questionInput");

          // Set the value to the original message text
          const originalText =
            messageElement.getAttribute("data-original-text");
          questionInput.value = originalText;

          // Focus the input field
          questionInput.focus();

          // Find and remove this message and all messages after it
          let currentMessage = messageElement;
          let messagesToRemove = [];

          // Add the current message to the removal list
          messagesToRemove.push(currentMessage);

          // Add all subsequent messages to the removal list
          while (currentMessage.nextElementSibling) {
            messagesToRemove.push(currentMessage.nextElementSibling);
            currentMessage = currentMessage.nextElementSibling;
          }

          // Remove all messages in the list
          messagesToRemove.forEach((msg) => msg.remove());

          // Save the updated chat history
          saveChatHistory();
        });
      }
    }, 10);
  } else {
    // Bot message with robot icon and distinct copy buttons
    messageElement.innerHTML = `
      <div class="message-controls">
        <button class="copy-to-textarea" title="Copy to Textarea">
          <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M8 3H5a2 2 0 0 0-2 2v3m18 0V5a2 2 0 0 0-2-2h-3"></path>
            <path d="M8 21H5a2 2 0 0 1-2-2v-3m18 0v3a2 2 0 0 1-2 2h-3"></path>
            <rect x="9" y="9" width="6" height="6"></rect>
          </svg>
        </button>
        <button class="copy-to-clipboard" title="Copy to Clipboard">
          <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect>
            <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path>
          </svg>
        </button>
      </div>
      <div class="bot-avatar">
        <img src="https://raw.githubusercontent.com/Tarikul-Islam-Anik/Telegram-Animated-Emojis/main/Smileys/Robot.webp" alt="Bot" width="24" height="24">
      </div>
      <div class="message-content">${formattedText}</div>
    `;

    // Add functionality to bot message buttons

    // Copy functionality for bot messages
    setTimeout(() => {
      // Copy to textarea button
      const copyToTextareaBtn =
        messageElement.querySelector(".copy-to-textarea");
      if (copyToTextareaBtn) {
        copyToTextareaBtn.addEventListener("click", function (event) {
          // Prevent any default actions or event bubbling
          event.preventDefault();
          event.stopPropagation();

          // Get the original text with line breaks
          const originalText =
            messageElement.getAttribute("data-original-text");

          // Find the external textarea
          const externalTextarea = document.querySelector(
            ".MuiInputBase-input.MuiOutlinedInput-input.MuiInputBase-inputMultiline:not([readonly])"
          );

          if (externalTextarea) {
            // Set the value and trigger input event
            externalTextarea.value = originalText;
            externalTextarea.dispatchEvent(
              new Event("input", { bubbles: true })
            );

            // Show success notification
            showChatNotification("Teks berhasil disalin ke textarea!");

            // Show visual feedback
            this.innerHTML = `
          <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <polyline points="20 6 9 17 4 12"></polyline>
          </svg>
        `;

            // Store reference to button for timeout
            const btn = this;

            // Reset icon after 2 seconds
            setTimeout(() => {
              btn.innerHTML = `
            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M8 3H5a2 2 0 0 0-2 2v3m18 0V5a2 2 0 0 0-2-2h-3"></path>
              <path d="M8 21H5a2 2 0 0 1-2-2v-3m18 0v3a2 2 0 0 1-2 2h-3"></path>
              <rect x="9" y="9" width="6" height="6"></rect>
            </svg>
          `;
            }, 2000);
          } else {
            showChatNotification("Textarea tidak ditemukan!");
          }
        });
      }

      // Copy to clipboard button
      const copyToClipboardBtn =
        messageElement.querySelector(".copy-to-clipboard");
      if (copyToClipboardBtn) {
        copyToClipboardBtn.addEventListener("click", function (event) {
          // Prevent any default actions or event bubbling
          event.preventDefault();
          event.stopPropagation();

          // Get the original text with line breaks
          const originalText =
            messageElement.getAttribute("data-original-text");

          // Use clipboard API to copy text
          navigator.clipboard
            .writeText(originalText)
            .then(() => {
              showChatNotification("Teks berhasil disalin ke clipboard!");

              // Show visual feedback
              this.innerHTML = `
            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <polyline points="20 6 9 17 4 12"></polyline>
            </svg>
          `;

              // Store reference to button for timeout
              const btn = this;

              // Reset icon after 2 seconds
              setTimeout(() => {
                btn.innerHTML = `
              <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect>
                <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path>
              </svg>
            `;
              }, 2000);
            })
            .catch((err) => {
              showChatNotification("Gagal menyalin teks: " + err);
            });
        });
      }
    }, 10);
  }
  // Memperbaiki masalah tag <p> yang tertangkap dua kali
  // Menghapus tag <p> yang terbentuk secara otomatis jika sudah ada di dalam teks
  setTimeout(() => {
    const messageContent = messageElement.querySelector(".message-content");
    if (messageContent) {
      // Jika konten dimulai dengan <p> dan diakhiri dengan </p>, tetapi teks asli tidak mengandung tag ini
      const originalText = messageElement.getAttribute("data-original-text");
      if (
        messageContent.innerHTML.trim().startsWith("<p>") &&
        messageContent.innerHTML.trim().endsWith("</p>") &&
        !originalText.includes("<p>")
      ) {
        // Hapus tag <p> yang tidak diinginkan
        messageContent.innerHTML = messageContent.innerHTML
          .replace(/^<p>/g, "")
          .replace(/<\/p>$/g, "");
      }
    }
  }, 10);

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

function addChatbotStyles() {
  const styleElement = document.createElement("style");
  styleElement.textContent = `
    /* Toggle Button */
    /* Toggle Button */
    .chatbot-toggle {
      position: fixed;
      padding-right: 10px;
      
      right: 0;
      width: 85px;
      height: 60px;
      border-radius: 50px 0 0 50px; /* Hanya buat sisi kiri membulat */
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

    .bot-message {
      display: flex;
      flex-wrap: wrap;
    }

    .bot-avatar {
      margin-right: 8px;
      align-self: flex-start;
    }

     .user-message {
      display: flex;
      flex-wrap: wrap;
      flex-direction: row-reverse;
    }
    
    .user-avatar {
      margin-left: 8px;
      align-self: flex-start;
    }

    .message-content {
      flex: 1;
      min-width: 0;
      word-break: break-word;
    }
    
    .tooltip {
      position: absolute;
      top: -10px;
      right: 70px;
      background-color: rgba(226, 226, 226, 0.82);
      backdrop-filter: blur(8px);
      color: black;
      padding: 5px 10px;
      border-radius: 20px 20px 0 20px;
      font-size: 9px;
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

    .template-buttons button.selected {
      background: #0070f3;
      color: white;
      border: 1px solid #0070f3;
    }

    .template-buttons button.selected:hover {
      background: #0060df;
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

async function getAnswerFromGemini(apiKey, question, conversationHistory = []) {
  // Build conversation context from history
  let conversationContext = "";
  if (conversationHistory.length > 0) {
    conversationContext = "Riwayat percakapan sebelumnya:\n";
    conversationHistory.forEach((msg, index) => {
      const role = msg.sender === "user" ? "User" : "Assistant";
      conversationContext += `${role}: ${msg.text}\n`;
    });
    conversationContext += "\nPertanyaan terbaru: ";
  }

  // Create prompt with conversation memory
  const prompt = `
    ${conversationContext}${question}

    jawab pertanyaan diatas, jangan menggunakan huruf tebal ataupun miring dan jangan gunakan karakter khusus seperti (*) pada jawabannya
  `;

  const response = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-lite:generateContent?key=${apiKey}`,
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

console.log("gemini.js loaded");

// Fungsi untuk mendapatkan API key dari localStorage
function getGeminiApiKey() {
  const storedKey = localStorage.getItem("geminiApiKey");
  return storedKey ? atob(storedKey) : null;
}

function setupChatbotEventListeners(encodedApiKey) {
  // Prevent duplicate event listeners by checking if already set up
  if (
    document
      .getElementById("geminiChatbot")
      ?.hasAttribute("data-listeners-attached")
  ) {
    console.log("Event listeners already attached, skipping setup");
    return;
  }

  const chatbotToggle = document.getElementById("geminiChatbotToggle");
  const chatbot = document.getElementById("geminiChatbot");
  const closeChatButton = document.getElementById("closeChatButton");
  const clearMemoryButton = document.getElementById("clearMemoryButton");
  const questionInput = document.getElementById("questionInput");
  const submitButton = document.getElementById("submitButton");
  const chatHistory = document.getElementById("chatHistory");
  const templateButtons = document.querySelectorAll(".template-buttons button");
  const copyQuestionButton = document.getElementById("copyQuestionButton");
  const apiKeyButton = document.getElementById("apiKeyButton");

  // Mark as listeners attached
  if (chatbot) {
    chatbot.setAttribute("data-listeners-attached", "true");
  }

  if (apiKeyButton) {
    apiKeyButton.addEventListener("click", () => {
      // Show the API key popup for updating
      if (typeof showApiKeyPopup === "function") {
        showApiKeyPopup();
      } else {
        console.error("showApiKeyPopup function not found!");
      }
    });
  }

  // Check if elements exist
  if (!chatbotToggle || !chatbot) {
    console.error("Chatbot toggle or container not found!");
    return;
  }

  // Make the toggle button draggable vertically
  makeDraggableVertically(chatbotToggle);

  // Toggle chatbot visibility with debugging
  chatbotToggle.addEventListener("click", (e) => {
    // Prevent click event if we're dragging
    if (chatbotToggle.getAttribute("data-dragging") === "true") {
      return;
    }
    chatbot.style.display = chatbot.style.display === "none" ? "flex" : "none";
  });

  // Close chatbot when clicking outside
  document.addEventListener("click", (e) => {
    const isClickInsideToggle = chatbotToggle.contains(e.target);
    const isClickInsideChatbot = chatbot.contains(e.target);

    // If chatbot is visible and user clicks outside both the toggle and chatbot
    if (
      chatbot.style.display !== "none" &&
      !isClickInsideToggle &&
      !isClickInsideChatbot
    ) {
      chatbot.style.display = "none";
    }
  });

  // Close chatbot
  closeChatButton.addEventListener("click", () => {
    chatbot.style.display = "none";
  });

  // Clear chat memory and history
  clearMemoryButton.addEventListener("click", () => {
    if (confirm("Hapus seluruh riwayat chat dan memori percakapan?")) {
      // Show notification first
      showChatNotification("Riwayat chat dan memori telah dihapus");

      // Clear everything after a brief delay to ensure notification is shown
      setTimeout(() => {
        // Remove any existing notifications first
        const existingNotifications =
          chatHistory.querySelectorAll(".chat-notification");
        existingNotifications.forEach((notification) => notification.remove());

        // Clear chat history and memory
        chatHistory.innerHTML = "";
        localStorage.removeItem("gemini_chat_history");
        clearChatMemory();
      }, 100);
    }
  });

  // Copy question from DOM to input
  // Copy question from DOM to input
  // Copy question from DOM to input
  copyQuestionButton.addEventListener("click", async () => {
    try {
      // Get token from localStorage for API access
      const localStorageData = localStorage.getItem("access");
      if (!localStorageData) {
        showChatNotification("Tidak dapat menemukan token akses.");
        return;
      }

      const accessData = JSON.parse(localStorageData);
      if (
        !Array.isArray(accessData) ||
        accessData.length === 0 ||
        !accessData[0].token
      ) {
        showChatNotification("Token tidak valid.");
        return;
      }

      const token = accessData[0].token;

      // Get the quiz ID from the URL
      const quizId = window.location.href.split("/").pop();
      const apiUrl = `https://mentari.unpam.ac.id/api/quiz/soal/${quizId}`;

      // Show loading notification
      showChatNotification("Sedang mengambil semua soal quiz...");

      // Fetch all quiz data
      const response = await fetch(apiUrl, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();

      // Format quiz data
      function formatQuiz(quizData) {
        if (!quizData || !quizData.data) {
          return "Data kuis tidak tersedia.";
        }

        let result = `Judul Kuis: ${quizData.judul}\nDurasi: ${quizData.duration} detik\n\n`;

        quizData.data.forEach((soal, index) => {
          // Include both title and description as they may contain question information
          result += `${index + 1}. ${soal.judul.replace(/<[^>]*>/g, "")}\n`;

          // Add description if it's different from the title
          const cleanDescription = soal.deskripsi
            .replace(/<[^>]*>/g, "")
            .trim();
          if (
            cleanDescription &&
            cleanDescription !== "Kerjakan soal dg baik ?"
          ) {
            result += `   ${cleanDescription}\n`;
          }

          result += "\n";

          if (soal.list_jawaban) {
            const pilihan = "abcdefghijklmnopqrstuvwxyz";
            soal.list_jawaban.forEach((jawaban, i) => {
              result += `${pilihan[i]}. ${jawaban.jawaban.replace(
                /<[^>]*>/g,
                ""
              )}\n`;
            });
          }

          result += "\n";
        });

        return result;
      }

      const formattedQuiz = formatQuiz(data);

      // Set the formatted quiz text directly into the input
      questionInput.value = formattedQuiz;

      // Show notification
      showChatNotification("Semua soal quiz berhasil disalin!");

      // Focus on the input
      questionInput.focus();

      // Copy to clipboard if supported
      try {
        await navigator.clipboard.writeText(formattedQuiz);
        showChatNotification("Semua soal juga disalin ke clipboard!");
      } catch (err) {
        console.error("Tidak dapat menyalin ke clipboard:", err);
      }
    } catch (error) {
      console.error("Error:", error);
      showChatNotification("Tidak ditemukan Soal Quiz");

      // Fall back to original functionality if API fetch fails
      try {
        const contentElement = document.querySelector(".ck-content");
        let questionText = "";
        let titleText = "";

        // Try to capture the h6 title
        const titleElement = document.querySelector(
          "h6.MuiTypography-subtitle1"
        );
        if (titleElement) {
          titleText = titleElement.textContent.trim();
        }

        // Try to get content from radio form controls
        const formLabels = document.querySelectorAll(
          ".MuiFormControlLabel-root"
        );
        let optionsText = [];

        if (formLabels && formLabels.length > 0) {
          formLabels.forEach((label) => {
            // Extract option information more accurately based on the DOM structure
            const optionStack = label.querySelector(".MuiStack-root");

            if (optionStack) {
              // Get the option letter (A, B, C, etc.)
              const optionLetter = optionStack
                .querySelector("p")
                .textContent.trim();

              // Get the option content directly from .ck-content
              const optionContentEl = optionStack.querySelector(".ck-content");
              const optionContent = optionContentEl
                ? optionContentEl.textContent.trim()
                : "";

              // Check if this option is selected/checked
              const isChecked = label.querySelector(".Mui-checked") !== null;

              if (optionLetter && optionContent) {
                optionsText.push(`${optionLetter}${optionContent}`);
              }
            }
          });
        }

        // Process standard content if available
        if (contentElement) {
          // Use textContent to get all text without duplicating
          questionText = contentElement.textContent.trim();
        }

        // Combine all the captured content
        let fullText = "";

        if (titleText) {
          fullText += `${titleText}\n\n`;
        }

        if (questionText) {
          fullText += `${questionText}\n\n`;
        }

        if (optionsText.length > 0) {
          fullText += optionsText.join("\n");
        }

        // Set the combined text into the input
        questionInput.value = fullText.trim();

        // Show in-chat notification
        showChatNotification("Pertanyaan berhasil disalin!");

        // Focus on the input
        questionInput.focus();

        if (!contentElement && optionsText.length === 0 && !titleText) {
          showChatNotification("Tidak dapat menemukan pertanyaan.");
        }
      } catch (fallbackError) {
        console.error("Fallback error:", fallbackError);
        showChatNotification("Tidak dapat menyalin pertanyaan.");
      }
    }
  });

  // Template prompt buttons - allow multiple selection
  templateButtons.forEach((button) => {
    button.addEventListener("click", () => {
      const template = button.getAttribute("data-prompt");
      const currentTemplates =
        questionInput.getAttribute("data-templates") || "";
      const templateArray = currentTemplates
        ? currentTemplates.split("|").filter((t) => t.trim())
        : [];

      // Toggle selection
      const index = templateArray.indexOf(template);
      if (index > -1) {
        // Remove if already selected
        templateArray.splice(index, 1);
        button.classList.remove("selected");
      } else {
        // Add if not selected
        templateArray.push(template);
        button.classList.add("selected");
      }

      // Update data attribute
      const newTemplates = templateArray.join("|");
      if (newTemplates) {
        questionInput.setAttribute("data-templates", newTemplates);
      } else {
        questionInput.removeAttribute("data-templates");
      }

      questionInput.focus();

      // Show notification
      const status = index > -1 ? "dihapus" : "ditambahkan";
      showChatNotification(`Template "${template}" ${status}`);
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

    // Get the selected templates
    const selectedTemplates =
      questionInput.getAttribute("data-templates") || "";
    const templateArray = selectedTemplates
      ? selectedTemplates.split("|").filter((t) => t.trim())
      : [];

    // Add user message to chat without showing the template
    addMessageToChat("user", question);

    // Clear input and templates
    questionInput.value = "";
    questionInput.removeAttribute("data-templates");

    // Clear selected template buttons
    document
      .querySelectorAll(".template-buttons button.selected")
      .forEach((btn) => {
        btn.classList.remove("selected");
      });

    // Add the typing indicator
    const typingIndicator = addTypingIndicator();

    try {
      // Decode the API key
      const apiKey = atob(encodedApiKey);

      // Get conversation history for memory
      const conversationHistory = getConversationHistory();

      // Build full prompt with templates
      let fullPrompt = question;
      if (templateArray.length > 0) {
        const combinedTemplates = templateArray.join(". ");
        fullPrompt = `${combinedTemplates}: ${question}`;
      }

      const answer = await getAnswerFromGemini(
        apiKey,
        fullPrompt,
        conversationHistory
      );

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
      addMessageToChat(
        "bot",
        `Maaf, terjadi kesalahan: <span style="color: red; font-weight: bold;">${error.message}</span>. Untuk mengganti API key klik icon <span style="color: yellow; font-weight: bold;">Kunci</span> yang ada di kanan atas dan masukkan API key yang benar.
`
      );

      // Save chat history
      saveChatHistory();
    }
  });
}

// Function to make an element draggable vertically
function makeDraggableVertically(element) {
  let pos1 = 0,
    pos3 = 0;
  let isDragging = false;
  let dragTimeout;

  element.onmousedown = dragMouseDown;
  element.ontouchstart = dragTouchStart;

  function dragMouseDown(e) {
    e = e || window.event;
    e.preventDefault();

    // Get the mouse cursor position at startup
    pos3 = e.clientY;

    // Set dragging flag
    isDragging = false;
    element.setAttribute("data-dragging", "false");

    document.onmouseup = closeDragElement;
    document.onmousemove = elementDrag;
  }

  function dragTouchStart(e) {
    e = e || window.event;
    if (e.touches && e.touches[0]) {
      // Get the touch position at startup
      pos3 = e.touches[0].clientY;

      // Set dragging flag
      isDragging = false;
      element.setAttribute("data-dragging", "false");

      document.ontouchend = closeDragElement;
      document.ontouchmove = elementTouchDrag;
    }
  }

  function elementDrag(e) {
    e = e || window.event;
    e.preventDefault();

    // FIXED: Instead of calculating movement, set position directly based on cursor
    const newY = e.clientY - element.offsetHeight / 2;

    // Ensure toggle stays within viewport bounds
    const maxTop = window.innerHeight - element.offsetHeight;
    const boundedTop = Math.max(0, Math.min(newY, maxTop));

    // Apply position directly
    element.style.top = boundedTop + "px";

    // Set dragging state
    isDragging = true;
    element.setAttribute("data-dragging", "true");

    // Clear any previous timeout
    if (dragTimeout) clearTimeout(dragTimeout);

    // Set timeout to reset dragging flag after dragging stops
    dragTimeout = setTimeout(() => {
      element.setAttribute("data-dragging", "false");
    }, 200);
  }

  function elementTouchDrag(e) {
    e = e || window.event;

    if (e.touches && e.touches[0]) {
      // FIXED: Instead of calculating movement, set position directly based on touch point
      const newY = e.touches[0].clientY - element.offsetHeight / 2;

      // Ensure toggle stays within viewport bounds
      const maxTop = window.innerHeight - element.offsetHeight;
      const boundedTop = Math.max(0, Math.min(newY, maxTop));

      // Apply position directly
      element.style.top = boundedTop + "px";

      // Set dragging state
      isDragging = true;
      element.setAttribute("data-dragging", "true");

      // Clear any previous timeout
      if (dragTimeout) clearTimeout(dragTimeout);

      // Set timeout to reset dragging flag after dragging stops
      dragTimeout = setTimeout(() => {
        element.setAttribute("data-dragging", "false");
      }, 200);
    }
  }

  function closeDragElement() {
    // Stop moving when mouse/touch is released
    document.onmouseup = null;
    document.onmousemove = null;
    document.ontouchend = null;
    document.ontouchmove = null;

    // Reset dragging flag immediately on release
    setTimeout(() => {
      element.setAttribute("data-dragging", "false");
      isDragging = false;
    }, 10);
  }
}

function createChatbotInterface(providedApiKey = null) {
  console.log("Creating chatbot interface...");
  // Check if chatbot already exists
  if (document.getElementById("geminiChatbot")) {
    console.log("Chatbot already exists");
    return;
  }

  // Get API key from parameter or manager
  let apiKey = providedApiKey;

  // If no API key provided, try to get it from manager
  if (!apiKey) {
    console.log("No API key provided, checking manager...");
    if (typeof getGeminiApiKey === "function") {
      apiKey = getGeminiApiKey();
    } else {
      console.error("getGeminiApiKey function not found!");
    }

    // If still no API key, show popup and return
    if (!apiKey) {
      console.log("No API key found, showing popup...");
      if (typeof showApiKeyPopup === "function") {
        showApiKeyPopup();
      } else {
        console.error("showApiKeyPopup function not found!");
      }
      return;
    }
  }

  // Encode the API key for setupChatbotEventListeners
  const encodedApiKey = btoa(apiKey);

  console.log("API key available, continuing with chatbot setup...");
  // Create chatbot elements with enhanced structure
  const chatbotHtml = `
    <div id="geminiChatbotToggle" class="chatbot-toggle" style="display: none;">
      <div class="drag-handle"></div>
      <img src="https://raw.githubusercontent.com/Tarikul-Islam-Anik/Telegram-Animated-Emojis/main/Smileys/Robot.webp" alt="Robot" width="50" height="50" />
      <div class="tooltip" id="geminiTooltip">Hai, aku Gemini Assistant!</div>
    </div>

    <div id="geminiChatbot" class="chatbot-container" style="display: none;">
      <div class="chatbot-header">
        <h3>Gemini Assistant</h3>
        <div class="chatbot-actions">
          <button id="clearMemoryButton" title="Clear Memory & Chat">
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M3 6h18"></path>
              <path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"></path>
              <path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"></path>
              <circle cx="12" cy="12" r="3"></circle>
              <path d="M9 12l2 2 4-4"></path>
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
            <button data-prompt="Jelaskan dalam 1 paragraf">1 Paragraf</button>
            <button data-prompt="Jelaskan dalam 2 paragraf">2 Paragraf</button>
            <button data-prompt="Jawab pilihan ganda berikut hanya dengan huruf dan teks misal Jawaban yang benar adalah A. ..., dan beri penjelasan singkat ">Pilihan ganda</button>
            <button data-prompt="Sebutkan 3 poin utama yang perlu diketahui secara singkat">3 Poin Utama</button>
            <button data-prompt="Jelaskan dengan cara yang mudah dimengerti dengan singkat">Sederhana</button>
            <button data-prompt="Berikan contoh nyata atau kasus penggunaan dengan singkat">Contoh Nyata</button>
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

  // Add additional CSS styles
  addDraggableStyles();

  // Add the CSS styles
  if (typeof addChatbotStyles === "function") {
    addChatbotStyles();
  } else {
    console.error("addChatbotStyles function not found!");
  }

  // Setup event listeners with the encoded API key
  setupChatbotEventListeners(encodedApiKey);

  // Load chat history from localStorage
  if (typeof loadChatHistory === "function") {
    loadChatHistory();
  } else {
    console.error("loadChatHistory function not found!");
  }

  // Start monitoring for Claude's textarea
  if (typeof monitorForClaudeTextarea === "function") {
    monitorForClaudeTextarea();
  } else {
    console.error("monitorForClaudeTextarea function not found!");
  }

  // Setup tooltips with controlled display frequency
  const tooltips = [
    "Hai, aku Gemini Assistant!",
    "Ada yang bisa kubantu?",
    "Klik aku untuk ngobrol!",
    "Punya pertanyaan? Tanyakan saja!",
    "Gemini siap membantu kamu!",
    "Butuh sesuatu? Aku di sini!",
  ];

  // Initialize tooltips after a short delay to ensure DOM is ready
  setTimeout(() => {
    initializeTooltips(tooltips);
  }, 500);
}

// Function to add styles for the draggable toggle
function addDraggableStyles() {
  const styleElement = document.createElement("style");
  styleElement.textContent = `
    .chatbot-toggle {
      cursor: move;
      position: fixed;
      bottom: 20px;
      right: 20px;
      z-index: 9998;
      transition: none; /* Remove transition for smoother dragging */
      user-select: none; /* Prevent text selection during drag */
      touch-action: none; /* Improve touch handling */
    }
    
    .drag-handle {
      display: none;
      position: absolute;
      top: -5px;
      left: 90%;
      transform: translateX(-50%);
      width: 25px;
      height: 25px;
      background-color: #333;
      border-radius: 30px;
      cursor: move;
    }
    
    .chatbot-toggle:hover .drag-handle {
      background-color: rgb(255 0 0 / 31%);
    }
    
    /* Make sure chatbot container isn't affected by pointer events when hidden */
    #geminiChatbot[style*="display: none"] {
      pointer-events: none;
    }
    
    /* Cursor styles for different states */
    .chatbot-toggle[data-dragging="true"] {
      cursor: move;
    }
    
    .chatbot-toggle[data-dragging="false"] {
      cursor: pointer;
    }
  `;

  document.head.appendChild(styleElement);
}

// Define the tooltip initialization function
function initializeTooltips(tooltips) {
  const tooltip = document.getElementById("geminiTooltip");
  const toggle = document.getElementById("geminiChatbotToggle");

  if (!tooltip || !toggle) {
    console.error("Tooltip or toggle elements not found!");
    return;
  }

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

  // Hide tooltip when mouse leaves
  toggle.addEventListener("mouseleave", function () {
    // Let the normal cycle determine visibility
  });
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

// Function to get conversation history for memory
function getConversationHistory() {
  const messages = document.querySelectorAll("#chatHistory .message");
  const history = [];

  messages.forEach((message) => {
    const isUser = message.classList.contains("user-message");
    const isBot = message.classList.contains("bot-message");

    if (isUser || isBot) {
      const text =
        message.getAttribute("data-original-text") ||
        message.textContent.trim();
      history.push({
        sender: isUser ? "user" : "bot",
        text: text,
      });
    }
  });

  return history;
}

// Function to clear chat memory
function clearChatMemory() {
  // Clear conversation history from localStorage
  localStorage.removeItem("gemini_chat_memory");
  console.log("Chat memory cleared");
}

// Initialize the chatbot
function initChatbot() {
  // Check if Gemini is enabled in settings
  const isGeminiEnabled = localStorage.getItem("gemini_enabled") === "true";
  if (!isGeminiEnabled) {
    console.log("Gemini is disabled in settings");
    return;
  }

  // Create chatbot interface if it doesn't exist
  if (!document.getElementById("geminiChatbot")) {
    createChatbotInterface();
  }

  // Set up event listeners
  setupChatbotEventListeners();

  // Show only the toggle button if Gemini is enabled
  const toggle = document.getElementById("geminiChatbotToggle");
  const chatInterface = document.getElementById("geminiChatbot");

  // Always show toggle button if Gemini is enabled in settings
  if (toggle && isGeminiEnabled) {
    toggle.style.display = "flex";
  }

  // Always hide chat interface initially
  if (chatInterface) {
    chatInterface.style.display = "none";
  }

  // Add click event to toggle button to show chat interface
  if (toggle) {
    toggle.addEventListener("click", function () {
      if (chatInterface) {
        chatInterface.style.display = "flex";
      }
    });
  }
}

// Call initChatbot immediately and also on DOMContentLoaded
(function initializeGemini() {
  // Check if Gemini is enabled in settings
  const isGeminiEnabled = localStorage.getItem("gemini_enabled") === "true";
  if (isGeminiEnabled) {
    // Try to initialize immediately
    initChatbot();

    // Also try again when DOM is ready
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", initChatbot);
    } else {
      // If DOM is already loaded, try one more time
      setTimeout(initChatbot, 100);
    }
  }
})();

// Also call initChatbot when the toggle state changes
window.addEventListener("storage", function (e) {
  if (e.key === "gemini_enabled") {
    if (e.newValue === "true") {
      initChatbot();
    } else {
      // Hide both toggle and chat interface if disabled
      const toggle = document.getElementById("geminiChatbotToggle");
      const chatInterface = document.getElementById("geminiChatbot");
      if (toggle) toggle.style.display = "none";
      if (chatInterface) chatInterface.style.display = "none";
    }
  }
});
