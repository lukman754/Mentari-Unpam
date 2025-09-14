(async () => {
  const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

  // Replace the hardcoded API key with this function
  function getGeminiApiKey() {
    // First try to get the API key from apiKeyManager
    const storedApiKey = localStorage.getItem("geminiApiKey");

    if (storedApiKey) {
      return atob(storedApiKey);
    }

    // If not found in localStorage, show an error
    const errorMsg = document.createElement("div");
    errorMsg.style =
      "position:fixed;top:20px;left:50%;transform:translateX(-50%);background:#f44336;color:white;padding:12px 20px;border-radius:6px;box-shadow:0 3px 15px rgba(0,0,0,0.3);z-index:10000;font-family:system-ui;";
    errorMsg.innerHTML = `<div style="display:flex;align-items:center;gap:10px;">
    <span>❌</span>
    <span>API Key tidak ditemukan. Pastikan Anda telah mengatur API Key di ApiKeyManager.</span>
  </div>`;
    document.body.appendChild(errorMsg);

    setTimeout(() => {
      errorMsg.style.opacity = "0";
      errorMsg.style.transition = "opacity 0.5s ease";
      setTimeout(() => errorMsg.remove(), 500);
    }, 5000);

    throw new Error("Gemini API Key not found in localStorage");
  }

  try {
    const GEMINI_API_KEY = getGeminiApiKey();

    function createPopup() {
      const popup = document.createElement("div");
      popup.style =
        "position:fixed;z-index:10000;min-width:300px;max-width:450px;width:auto;top:20px;right:20px;background:#1e1e1e;color:#fff;border-radius:8px;box-shadow:0 4px 12px rgba(0,0,0,0.5);font-family:system-ui;font-size:13px;border:1px solid #333;overflow:hidden;";

      const header = document.createElement("div");
      header.style =
        "padding:10px 14px;background:#2a2a2a;color:#fff;cursor:move;user-select:none;display:flex;justify-content:space-between;align-items:center;font-weight:500;border-bottom:1px solid #333;";
      header.innerHTML = `
        <div>Quiz Helper</div>
        <div style="display:flex;gap:8px;">
          <button id="toggle-popup" style="background:none;border:none;color:#999;cursor:pointer;padding:0;width:24px;height:24px;display:flex;align-items:center;justify-content:center;font-size:16px;transition:color 0.2s;">−</button>
          <button id="close-popup" style="background:none;border:none;color:#999;cursor:pointer;padding:0;width:24px;height:24px;display:flex;align-items:center;justify-content:center;font-size:16px;transition:color 0.2s;">×</button>
        </div>
      `;

      const content = document.createElement("div");
      content.id = "popup-content";
      content.style = "padding:12px;max-height:500px;overflow-y:auto;";

      // Add hover effects for buttons
      const style = document.createElement("style");
      style.textContent = `
        #toggle-popup:hover, #close-popup:hover { color: #fff !important; }
        .q-tooltip { background: #2a2a2a !important; border-color: #333 !important; }
        .explanation-tooltip { background: #2a2a2a !important; border-color: #333 !important; }
      `;
      document.head.appendChild(style);

      popup.appendChild(header);
      popup.appendChild(content);
      document.body.appendChild(popup);

      let isDragging = false;
      let offsetX, offsetY;

      header.addEventListener("mousedown", (e) => {
        isDragging = true;
        offsetX = e.clientX - popup.getBoundingClientRect().left;
        offsetY = e.clientY - popup.getBoundingClientRect().top;
      });

      document.addEventListener("mousemove", (e) => {
        if (!isDragging) return;
        popup.style.left = e.clientX - offsetX + "px";
        popup.style.top = e.clientY - offsetY + "px";
        popup.style.right = "auto";
      });

      document.addEventListener("mouseup", () => (isDragging = false));

      let isOpen = true;
      let contentHeight = null;

      document.getElementById("toggle-popup").addEventListener("click", () => {
        if (isOpen) {
          contentHeight = content.scrollHeight;
          content.style.display = "none";
          document.getElementById("toggle-popup").textContent = "+";
        } else {
          content.style.display = "block";
          popup.style.height = "auto";
          document.getElementById("toggle-popup").textContent = "−";
        }
        isOpen = !isOpen;
      });

      document
        .getElementById("close-popup")
        .addEventListener("click", () => popup.remove());

      return {
        element: popup,
        content: content,
        remove: () => popup.remove(),
      };
    }

    document.getElementById("auto-answer")?.addEventListener("change", () => {
      if (document.getElementById("auto-answer").checked) {
        sequentiallyAnswerAllQuestions();
      } else if (autoAnswerTimer) {
        clearInterval(autoAnswerTimer);
        autoAnswerTimer = null;
      }
    });

    function cleanText(html) {
      if (!html) return "";

      const div = document.createElement("div");
      div.innerHTML = html;

      const tables = div.querySelectorAll("table");
      tables.forEach((table) => {
        let tableText = "\n==TABLE==\n";
        const rows = table.querySelectorAll("tr");

        rows.forEach((row, idx) => {
          const cells = row.querySelectorAll("td, th");
          const rowText = Array.from(cells)
            .map((cell) => cell.textContent.trim())
            .join(" | ");
          tableText += rowText + "\n";
          if (idx === 0 && row.querySelectorAll("th").length > 0) {
            tableText += "-".repeat(rowText.length) + "\n";
          }
        });

        tableText += "==END TABLE==\n";
        const pre = document.createElement("pre");
        pre.textContent = tableText;
        table.parentNode.replaceChild(pre, table);
      });

      return div.innerHTML
        .replace(/<h[1-6][^>]*>(.*?)<\/h[1-6]>/gi, "\n=== $1 ===\n\n")
        .replace(/<strong>(.*?)<\/strong>/gi, "*$1*")
        .replace(/<em>(.*?)<\/em>/gi, "_$1_")
        .replace(/<\/p>/g, "\n\n")
        .replace(/<br\s*\/?>/g, "\n")
        .replace(/<ul[^>]*>/g, "\n")
        .replace(/<\/ul>/g, "\n")
        .replace(/<ol[^>]*>/g, "\n")
        .replace(/<\/ol>/g, "\n")
        .replace(/<li>/g, "• ")
        .replace(/<\/li>/g, "\n")
        .replace(/<img[^>]*alt="([^"]*)"[^>]*>/gi, "[IMG: $1]")
        .replace(/<img[^>]*>/gi, "[IMG]")
        .replace(/<[^>]*>/g, "")
        .replace(/&nbsp;/g, " ")
        .replace(/&amp;/g, "&")
        .replace(/&lt;/g, "<")
        .replace(/&gt;/g, ">")
        .replace(/&quot;/g, '"')
        .replace(/\n\s*\n\s*\n/g, "\n\n")
        .trim();
    }

    // Modify the askGemini function to immediately apply answer after generation
    async function askGemini(question, options, questionId, questionIndex) {
      console.log(
        `Processing question #${questionIndex}: "${question.substring(
          0,
          100
        )}..."`
      );

      // Format pilihan jawaban
      const optionsText = options
        .map((opt, i) => `${String.fromCharCode(97 + i)}. ${opt}`)
        .join("\n");

      // Prompt yang lebih ketat untuk meningkatkan akurasi
      const prompt = `
Pertanyaan:
"""
${question}
"""

Pilihan jawaban:
"""
${optionsText}
"""
Berikan jawaban akhir HANYA dengan huruf (a, b, c, d, atau e) pada baris terakhir
Format jawaban akhir sebagai: "Jawaban: [huruf]"`;

      try {
        let retries = 3;
        let geminiResult = null;

        const startTime = performance.now();

        while (retries > 0 && !geminiResult) {
          try {
            const response = await fetch(
              `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${GEMINI_API_KEY}`,
              {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                  contents: [{ parts: [{ text: prompt }] }],
                  generationConfig: {
                    temperature: 0.9, // Lebih deterministik
                    maxOutputTokens: 1536,
                    topP: 0.95,
                    topK: 40,
                  },
                }),
              }
            );

            if (!response.ok) {
              console.error(`API error: ${response.status}`);
              throw new Error(`API error: ${response.status}`);
            }

            const data = await response.json();
            geminiResult = data;
          } catch (error) {
            console.warn(`Retry ${4 - retries}/3: ${error.message}`);
            retries--;
            if (retries === 0) throw error;
            await new Promise((resolve) =>
              setTimeout(resolve, 1500 * (4 - retries))
            );
          }
        }

        const processingTime = ((performance.now() - startTime) / 1000).toFixed(
          2
        );
        const answerText =
          geminiResult?.candidates?.[0]?.content?.parts?.[0]?.text || "";

        // Mencari jawaban dengan regex yang lebih ketat
        let answerLetter = null;
        const answerPatterns = [
          /Jawaban\s*:\s*([a-e])/i, // Format utama
          /\b([a-e])\b\s*$/, // Huruf tunggal di akhir teks
          /.*(Pilihan [a-e] yang benar adalah|Maka jawabannya adalah)\s*([a-e])/i, // Variasi lainnya
        ];

        for (const pattern of answerPatterns) {
          const match = answerText.match(pattern);
          if (match) {
            answerLetter = match[1].toLowerCase();
            break;
          }
        }

        if (!answerLetter) {
          console.warn(
            "AI response did not contain a clear answer. Logging full response:"
          );
          console.warn(answerText);
        }

        const result = {
          letter: answerLetter,
          explanation: answerText.trim(),
        };

        console.log(
          `Question #${questionIndex} processed in ${processingTime}s`
        );
        console.log(`Answer: ${result.letter || "Unable to determine"}`);

        return result;
      } catch (error) {
        console.error(`Error processing question #${questionIndex}:`, error);
        return { letter: null, explanation: `Error: ${error.message}` };
      }
    }

    // Modify the fallbackAnswerExtractor to immediately apply answer
    async function fallbackAnswerExtractor(
      question,
      options,
      questionId,
      questionIndex
    ) {
      try {
        const keywords = question
          .toLowerCase()
          .replace(/[.,?!;:()]/g, "")
          .split(/\s+/)
          .filter((word) => word.length > 3);

        let bestMatchIndex = 0;
        let bestMatchScore = 0;

        options.forEach((option, index) => {
          const optionText = option.toLowerCase();
          let score = 0;

          keywords.forEach((keyword) => {
            if (optionText.includes(keyword)) {
              score += 1;
            }
          });

          if (score > bestMatchScore) {
            bestMatchScore = score;
            bestMatchIndex = index;
          }
        });

        if (bestMatchScore === 0 && options.length > 1) {
          bestMatchIndex = 1;
        }

        const letter = String.fromCharCode(97 + bestMatchIndex);

        const result = {
          letter: letter,
          explanation:
            "Maaf, analisis mendalam tidak tersedia. Jawaban ini adalah perkiraan berdasarkan kata kunci dalam pertanyaan dan pilihan.",
        };

        return result;
      } catch (e) {
        return {
          letter: options.length > 0 ? "a" : null,
          explanation:
            "Tidak dapat menganalisis. Memilih opsi pertama sebagai default.",
        };
      }
    }

    // Improved selectRadioAnswer function for better reliability
    function selectRadioAnswer(questionIndex, answerLetter) {
      const answerIndex = answerLetter.charCodeAt(0) - 97;

      // Expanded list of selectors to find radio buttons across different quiz platforms
      const radioSelectors = [
        `.MuiStack-root.css-1kic1uf .MuiFormControlLabel-root:nth-child(${
          answerIndex + 1
        }) .MuiRadio-root`,
        `input[type="radio"][name="jawaban[${questionIndex}]"][value="${answerIndex}"]`,
        `input[type="radio"][name="soal_${
          questionIndex + 1
        }"][value="${answerIndex}"]`,
        `input[type="radio"][value="${answerIndex}"][data-question-id="${
          questionIndex + 1
        }"]`,
        // More generic selectors
        `.question-container:nth-child(${
          questionIndex + 1
        }) input[type="radio"]:nth-child(${answerIndex + 1})`,
        `#question-${
          questionIndex + 1
        } input[type="radio"][value="${answerIndex}"]`,
        // Additional selectors for better compatibility
        `form .MuiRadio-root:nth-of-type(${answerIndex + 1})`,
        `.css-1675apn .MuiFormControlLabel-root:nth-child(${
          answerIndex + 1
        }) input`,
        `[name^="jawaban"][value="${answerIndex}"]`,
      ];

      let radioButton = null;
      for (const selector of radioSelectors) {
        try {
          radioButton = document.querySelector(selector);
          if (radioButton) break;
        } catch (e) {
          continue;
        }
      }

      if (radioButton) {
        // Create and dispatch both change and click events for better compatibility
        radioButton.checked = true;

        // Dispatch change event
        const changeEvent = new Event("change", { bubbles: true });
        radioButton.dispatchEvent(changeEvent);

        // Dispatch click event
        const clickEvent = new MouseEvent("click", {
          bubbles: true,
          cancelable: true,
          view: window,
        });
        radioButton.dispatchEvent(clickEvent);

        return true;
      }

      return false;
    }
    // Improve the next button clicking function
    // Optimized clickNextButton function
    function clickNextButton() {
      const nextButtons = [
        'button:has(svg[data-testid="KeyboardTabIcon"])',
        'button.MuiButton-contained:has(span:contains("Next"))',
        'button.MuiButton-contained:has(span:contains("Selanjutnya"))',
        "button.next-button",
        'button[type="submit"]',
        'input[type="button"][value="Next"]',
        // More generic selectors
        "button.btn-primary:not(:disabled)",
        'button:contains("Next"):not(:disabled)',
        'button:contains("Selanjutnya"):not(:disabled)',
        // Additional selectors
        "button.css-1hw9j7s",
        '[aria-label="next"]',
        '.MuiButtonBase-root:contains("Next")',
      ];

      for (const selector of nextButtons) {
        try {
          const buttons = document.querySelectorAll(selector);
          for (const nextButton of buttons) {
            if (
              nextButton &&
              !nextButton.disabled &&
              nextButton.offsetParent !== null
            ) {
              nextButton.click();
              return true;
            }
          }
        } catch (e) {
          continue;
        }
      }

      // If no next button is found, try to click Selesai Quiz button
      const selesaiButtons = [
        'button.MuiButtonBase-root:has(span:contains("Selesai Quiz"))',
        'button.MuiButton-contained:has(span:contains("Selesai Quiz"))',
        'button:has(svg[data-testid="DoneAllIcon"])',
        'button.MuiButtonBase-root.MuiButton-root.MuiButton-contained.MuiButton-containedPrimary:has(span:contains("Selesai Quiz"))',
        // More specific selector based on the provided HTML
        'button.MuiButtonBase-root.MuiButton-root.MuiButton-contained.MuiButton-containedPrimary.MuiButton-sizeSmall.MuiButton-containedSizeSmall:has(span:contains("Selesai Quiz"))',
      ];

      // Cek toggle auto_finish_quiz sebelum klik otomatis tombol Selesai Quiz
      const autoFinishEnabled =
        localStorage.getItem("auto_finish_quiz") === "true";

      if (!autoFinishEnabled) {
        // Jika toggle tidak aktif, tambahkan delay random 2-3 menit untuk humanize
        const randomDelay = Math.floor(Math.random() * 60000) + 120000; // 2-3 menit dalam milidetik
        console.log(
          `Auto finish quiz tidak aktif, menunggu ${Math.round(
            randomDelay / 1000
          )} detik untuk humanize...`
        );

        setTimeout(() => {
          console.log("Delay selesai, melanjutkan auto finish quiz...");
          // Panggil fungsi ini lagi setelah delay
          clickNextButton();
        }, randomDelay);

        return false;
      }

      for (const selector of selesaiButtons) {
        try {
          const buttons = document.querySelectorAll(selector);
          for (const selesaiButton of buttons) {
            if (
              selesaiButton &&
              !selesaiButton.disabled &&
              selesaiButton.offsetParent !== null
            ) {
              console.log("Found Selesai Quiz button, clicking...");
              selesaiButton.click();

              // Start watching for the second "Ya" button after clicking Selesai Quiz
              setTimeout(() => {
                const observer = new MutationObserver((mutations, obs) => {
                  try {
                    const confirmButton = document
                      .querySelector(
                        'button.MuiButtonBase-root.MuiButton-root.MuiButton-outlined.MuiButton-outlinedPrimary svg[data-testid="ThumbUpOffAltRoundedIcon"]'
                      )
                      ?.closest("button");

                    if (confirmButton) {
                      console.log(
                        "Found second confirmation dialog after Selesai Quiz, clicking 'Ya'..."
                      );
                      confirmButton.click();
                      obs.disconnect();
                    }
                  } catch (error) {
                    console.debug("Selector check in progress...");
                  }
                });

                observer.observe(document.body, {
                  childList: true,
                  subtree: true,
                  attributes: false,
                  characterData: false,
                });

                // Also check immediately in case the button is already present
                try {
                  const confirmButton = document
                    .querySelector(
                      'button.MuiButtonBase-root.MuiButton-root.MuiButton-outlined.MuiButton-outlinedPrimary svg[data-testid="ThumbUpOffAltRoundedIcon"]'
                    )
                    ?.closest("button");

                  if (confirmButton) {
                    console.log(
                      "Second confirmation dialog already present, clicking 'Ya'..."
                    );
                    confirmButton.click();
                    observer.disconnect();
                  }
                } catch (error) {
                  console.debug("Initial selector check in progress...");
                }
              }, 500); // Small delay to ensure the confirmation dialog has time to appear

              return true;
            }
          }
        } catch (e) {
          continue;
        }
      }

      return false;
    }

    // Check if all answers are ready and answer questions sequentially
    function sequentiallyAnswerAllQuestions() {
      if (
        !document.getElementById("auto-answer")?.checked ||
        !allQuestionsAnswered
      )
        return;

      // Clear any existing timer
      if (autoAnswerTimer) {
        clearInterval(autoAnswerTimer);
      }

      // Get all questions in order
      const questions = Array.from(questionData.values()).sort(
        (a, b) => a.index - b.index
      );
      let currentQuestionIndex = 0;
      let noNextButtonCount = 0; // Counter for consecutive no-next-button situations

      // Function to process next question
      function processNextQuestion() {
        if (currentQuestionIndex >= questions.length) {
          clearInterval(autoAnswerTimer);
          return;
        }

        const question = questions[currentQuestionIndex];
        const selected = selectRadioAnswer(question.index, question.answer);

        if (selected) {
          // If auto-next is enabled, click next button after a short delay
          if (document.getElementById("auto-next")?.checked) {
            setTimeout(() => {
              if (clickNextButton()) {
                // Reset no-next-button counter if next button was found
                noNextButtonCount = 0;
                // Move to next question after clicking next
                currentQuestionIndex++;
                // Wait a bit before processing next question
                setTimeout(processNextQuestion, 100);
              } else {
                // Increment counter if no next button was found
                noNextButtonCount++;
                if (noNextButtonCount >= 2) {
                  // If no next button found twice in a row
                  console.log(
                    "No next button found twice, trying to finish quiz..."
                  );
                  // Try to click Selesai Quiz button multiple times to ensure it's clicked
                  for (let i = 0; i < 3; i++) {
                    setTimeout(() => clickNextButton(), i * 50);
                  }
                  clearInterval(autoAnswerTimer);
                } else {
                  // Retry after a short delay
                  setTimeout(processNextQuestion, 100);
                }
              }
            }, 100);
          } else {
            currentQuestionIndex++;
            setTimeout(processNextQuestion, 100);
          }
        } else {
          // If failed to select answer, retry after a short delay
          setTimeout(processNextQuestion, 100);
        }
      }

      // Start processing questions
      processNextQuestion();
    }

    const localStorageData = localStorage.getItem("access");
    if (!localStorageData) throw new Error("Token akses tidak ditemukan");

    let accessData;
    try {
      accessData = JSON.parse(localStorageData);
    } catch (e) {
      throw new Error("Error parsing data token");
    }

    if (
      !Array.isArray(accessData) ||
      accessData.length === 0 ||
      !accessData[0].token
    ) {
      throw new Error("Struktur token tidak valid");
    }

    const token = accessData[0].token;
    const quizId = window.location.href.split("/").pop();
    const apiUrl = `https://mentari.unpam.ac.id/api/quiz/soal/${quizId}`;

    const popup = createPopup();
    popup.content.innerHTML =
      '<div style="text-align:center;padding:20px;">' +
      '<div style="margin-bottom:15px;position:relative;">' +
      '<div style="width:60px;height:60px;margin:0 auto 15px;background:#2a2a2a;border-radius:50%;display:flex;align-items:center;justify-content:center;border:2px solid #333;">' +
      '<svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#4CAF50" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">' +
      '<path d="M12 2v8M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h8M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83"/>' +
      "</svg>" +
      "</div>" +
      '<div style="font-size:16px;font-weight:500;color:#4CAF50;margin-bottom:8px;text-shadow:0 2px 4px rgba(0,0,0,0.2);">Memuat Quiz</div>' +
      '<div style="color:#999;font-size:13px;line-height:1.4;max-width:280px;margin:0 auto;">Mohon tunggu sebentar...</div>' +
      "</div>" +
      '<div style="width:100%;height:4px;background:#2a2a2a;border-radius:2px;overflow:hidden;position:relative;">' +
      '<div id="load-progress" style="position:absolute;top:0;left:0;width:30%;height:100%;background:#4CAF50;animation:pulse 1.5s ease-in-out infinite;"></div>' +
      "</div>" +
      "<style>" +
      "@keyframes pulse {" +
      "0% { transform: translateX(-100%); }" +
      "100% { transform: translateX(400%); }" +
      "}" +
      "</style>" +
      "</div>";

    const processedQuestions = new Set();
    const questionData = new Map();
    let allQuestionsAnswered = false;
    let autoAnswerTimer = null;

    // Modify the fetchAndProcess function to be more aggressive in checking
    async function fetchAndProcess() {
      try {
        const response = await fetch(apiUrl, {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          // Add cache control to prevent caching
          cache: "no-store",
        });

        if (!response.ok) {
          // Instead of throwing error, show friendly message
          popup.content.innerHTML = `
            <div style="text-align:center;padding:20px;">
              <div style="margin-bottom:15px;position:relative;">
                <div style="width:60px;height:60px;margin:0 auto 15px;background:#2a2a2a;border-radius:50%;display:flex;align-items:center;justify-content:center;border:2px solid #333;animation:spin 1s linear infinite;">
                  <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#4CAF50" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="animation:spin 1s linear infinite;">
                    <path d="M12 2v8M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h8M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83"/>
                  </svg>
                </div>
                <div style="font-size:16px;font-weight:500;color:#4CAF50;margin-bottom:8px;text-shadow:0 2px 4px rgba(0,0,0,0.2);">Memeriksa Quiz...</div>
                <div style="color:#999;font-size:13px;line-height:1.4;max-width:280px;margin:0 auto;">Mencari tombol "Mulai Quiz"</div>
              </div>
              <div style="width:100%;height:4px;background:#2a2a2a;border-radius:2px;overflow:hidden;position:relative;">
                <div style="position:absolute;top:0;left:0;width:30%;height:100%;background:#4CAF50;animation:pulse 0.8s ease-in-out infinite;"></div>
              </div>
              <style>
                @keyframes pulse {
                  0% { transform: translateX(-100%); }
                  100% { transform: translateX(400%); }
                }
                @keyframes spin {
                  0% { transform: rotate(0deg); }
                  100% { transform: rotate(360deg); }
                }
              </style>
            </div>
          `;
          return;
        }

        const data = await response.json();
        if (!data || !data.data) {
          popup.content.innerHTML = `
            <div style="text-align:center;padding:20px;">
              <div style="margin-bottom:15px;position:relative;">
                <div style="width:60px;height:60px;margin:0 auto 15px;background:#2a2a2a;border-radius:50%;display:flex;align-items:center;justify-content:center;border:2px solid #333;animation:spin 1s linear infinite;">
                  <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#4CAF50" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="animation:spin 1s linear infinite;">
                    <path d="M12 2v8M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h8M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83"/>
                  </svg>
                </div>
                <div style="font-size:16px;font-weight:500;color:#4CAF50;margin-bottom:8px;text-shadow:0 2px 4px rgba(0,0,0,0.2);">Memeriksa Quiz...</div>
                <div style="color:#999;font-size:13px;line-height:1.4;max-width:280px;margin:0 auto;">Mencari tombol "Mulai Quiz"</div>
              </div>
              <div style="width:100%;height:4px;background:#2a2a2a;border-radius:2px;overflow:hidden;position:relative;">
                <div style="position:absolute;top:0;left:0;width:30%;height:100%;background:#4CAF50;animation:pulse 0.8s ease-in-out infinite;"></div>
              </div>
              <style>
                @keyframes pulse {
                  0% { transform: translateX(-100%); }
                  100% { transform: translateX(400%); }
                }
                @keyframes spin {
                  0% { transform: rotate(0deg); }
                  100% { transform: rotate(360deg); }
                }
              </style>
            </div>
          `;
          return;
        }

        await processQuiz(data);
      } catch (error) {
        console.error("Error:", error);
        popup.content.innerHTML = `
          <div style="text-align:center;padding:20px;">
            <div style="margin-bottom:15px;position:relative;">
              <div style="width:60px;height:60px;margin:0 auto 15px;background:#2a2a2a;border-radius:50%;display:flex;align-items:center;justify-content:center;border:2px solid #333;animation:spin 1s linear infinite;">
                <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#4CAF50" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="animation:spin 1s linear infinite;">
                  <path d="M12 2v8M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h8M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83"/>
                </svg>
              </div>
              <div style="font-size:16px;font-weight:500;color:#4CAF50;margin-bottom:8px;text-shadow:0 2px 4px rgba(0,0,0,0.2);">Memeriksa Quiz...</div>
              <div style="color:#999;font-size:13px;line-height:1.4;max-width:280px;margin:0 auto;">Mencari tombol "Mulai Quiz"</div>
            </div>
            <div style="width:100%;height:4px;background:#2a2a2a;border-radius:2px;overflow:hidden;position:relative;">
              <div style="position:absolute;top:0;left:0;width:30%;height:100%;background:#4CAF50;animation:pulse 0.8s ease-in-out infinite;"></div>
            </div>
            <style>
              @keyframes pulse {
                0% { transform: translateX(-100%); }
                100% { transform: translateX(400%); }
              }
              @keyframes spin {
                0% { transform: rotate(0deg); }
                100% { transform: rotate(360deg); }
              }
            </style>
          </div>
        `;
      }
    }

    // Modify the processQuiz function to gather all answers first
    async function processQuiz(quizData) {
      const isFirstRun = !popup.content.querySelector("#answers-container");

      if (isFirstRun) {
        popup.content.innerHTML = `
      <div style="margin-bottom:15px;">
            <div id="progress-text" style="font-size:12px;margin-bottom:8px;color:#999;font-weight:500;">Mencari jawaban...</div>
            <div style="width:100%;height:4px;background-color:#2a2a2a;border-radius:2px;overflow:hidden;">
              <div id="progress-bar" style="height:100%;width:0%;background-color:#4CAF50;transition:width 0.2s ease;"></div>
        </div>
      </div>
      <div id="answers-container" style="max-height:350px;overflow-y:auto;padding-right:5px;"></div>
      <div style="display:none;justify-content:space-between;margin-top:10px;">
            <label style="display:flex;align-items:center;font-size:12px;color:#999;">
          <input type="checkbox" id="auto-answer" checked style="margin-right:5px;"> Auto-jawab
        </label>
            <label style="display:flex;align-items:center;font-size:12px;color:#999;">
          <input type="checkbox" id="auto-next" checked style="margin-right:5px;"> Auto-next
        </label>
      </div>
    `;
      }

      const progressText = document.getElementById("progress-text");
      const progressBar = document.getElementById("progress-bar");
      const answersContainer = document.getElementById("answers-container");

      if (!isFirstRun) {
        questionData.forEach((data, questionId) => {
          if (!document.querySelector(`[data-question-id="${questionId}"]`)) {
            const questionItem = createQuestionElement(data);
            answersContainer.appendChild(questionItem);
          }
        });
      }

      let newQuestionsFound = false;
      let answeredQuestions = 0;

      // Gather all answers in parallel
      const pendingQuestions = [];
      for (let i = 0; i < quizData.data.length; i++) {
        const question = quizData.data[i];
        if (processedQuestions.has(question.id)) {
          if (
            questionData.has(question.id) &&
            questionData.get(question.id).answer
          ) {
            answeredQuestions++;
          }
          continue;
        }

        newQuestionsFound = true;
        processedQuestions.add(question.id);

        const progress = Math.round(((i + 1) / quizData.data.length) * 100);
        progressBar.style.width = `${progress}%`;
        progressText.textContent = `Mencari jawaban ${i + 1} dari ${
          quizData.data.length
        }`;

        const questionItem = document.createElement("div");
        questionItem.dataset.questionId = question.id;
        questionItem.style =
          "padding:8px 12px;margin-bottom:8px;border-radius:6px;background-color:#2a2a2a;position:relative;border-left:3px solid #333;transition:all 0.2s ease;";
        questionItem.innerHTML = `<small>${
          i + 1
        }. <span style="color:#ffcc5c;">Mencari jawaban...</span></small>`;
        answersContainer.appendChild(questionItem);

        const title = cleanText(question.judul || "");
        const desc = cleanText(question.deskripsi || "");
        let fullQuestion = title ? `${title}\n\n` : "";
        fullQuestion += desc ? `${desc}` : "";

        const options = (question.list_jawaban || []).map((j) =>
          cleanText(j.jawaban)
        );

        if (options.length === 0) {
          questionItem.innerHTML = `<small>${
            i + 1
          }. <span style="color:#ff6b6b;">Tidak ada pilihan</span></small>`;
          continue;
        }

        pendingQuestions.push({
          question: fullQuestion,
          options: options,
          questionId: question.id,
          index: i,
          questionItem: questionItem,
        });
      }

      // Process all pending questions in parallel
      if (pendingQuestions.length > 0) {
        const results = await Promise.all(
          pendingQuestions.map(
            async ({ question, options, questionId, index, questionItem }) => {
              let result = await askGemini(
                question,
                options,
                questionId,
                index
              );
              if (!result.letter) {
                result = await fallbackAnswerExtractor(
                  question,
                  options,
                  questionId,
                  index
                );
              }
              return { ...result, questionId, index, questionItem };
            }
          )
        );

        // Update UI with all results
        results.forEach(
          ({ letter, explanation, questionId, index, questionItem }) => {
            questionData.set(questionId, {
              id: questionId,
              number: index + 1,
              question: pendingQuestions.find(
                (q) => q.questionId === questionId
              ).question,
              options: pendingQuestions.find((q) => q.questionId === questionId)
                .options,
              answer: letter,
              explanation: explanation,
              index: index,
            });

            updateQuestionElement(questionItem, questionData.get(questionId));
            if (letter) answeredQuestions++;
          }
        );
      }

      // Update progress and start answering if all answers are found
      if (answeredQuestions === quizData.data.length && !allQuestionsAnswered) {
        allQuestionsAnswered = true;
        progressText.textContent =
          "✅ Semua jawaban ditemukan! Mulai menjawab...";
        progressText.style.color = "#4CAF50";

        // Automatically start answering questions
        if (document.getElementById("auto-answer")?.checked) {
          setTimeout(() => sequentiallyAnswerAllQuestions(), 100);
        }
      } else {
        progressBar.style.width = "100%";
        const progressPercent = Math.round(
          (answeredQuestions / quizData.data.length) * 100
        );
        progressText.textContent = `${progressPercent}% (${answeredQuestions}/${quizData.data.length}) jawaban ditemukan`;
        progressText.style.color = newQuestionsFound ? "#4CAF50" : "#aaa";
      }
    }

    function createQuestionElement(data) {
      const questionItem = document.createElement("div");
      questionItem.dataset.questionId = data.id;
      questionItem.style =
        "padding:8px 12px;margin-bottom:8px;border-radius:6px;background-color:#2a2a2a;position:relative;border-left:3px solid #333;transition:all 0.2s ease;";

      updateQuestionElement(questionItem, data);
      return questionItem;
    }

    function updateQuestionElement(element, data) {
      const answer = data.answer;

      if (answer) {
        const answerIndex = answer.charCodeAt(0) - 97;
        const answerText = data.options[answerIndex] || "Opsi tidak valid";

        element.style.borderLeftColor = "#4CAF50";
        element.innerHTML = `
          <div style="display:flex;justify-content:space-between;align-items:center;">
            <div style="flex-grow:1;overflow:hidden;">
              <span style="font-weight:500;color:#fff;">${
                data.number
              }. <span style="color:#4CAF50;font-weight:bold;">${answer.toUpperCase()}</span></span>
              <span style="color:#999;margin-left:6px;overflow:hidden;text-overflow:ellipsis;max-width:100%;display:inline-block;vertical-align:middle;">${answerText.substring(
                0,
                40
              )}${answerText.length > 40 ? "..." : ""}</span>
            </div>
            <div style="display:none;align-items:center;">
              <button class="apply-answer" data-index="${
                data.index
              }" data-letter="${answer}" style="margin-right:5px;padding:2px 5px;background:#4CAF50;border:none;border-radius:3px;color:white;font-size:10px;cursor:pointer;">Pilih</button>
              <div class="info-button" style="width:18px;height:18px;border-radius:50%;background:#333;color:#999;display:flex;align-items:center;justify-content:center;cursor:pointer;font-size:10px;transition:all 0.2s;">i</div>
            </div>
          </div>
        `;

        const applyButton = element.querySelector(".apply-answer");
        applyButton.addEventListener("click", () => {
          const index = parseInt(applyButton.dataset.index);
          const letter = applyButton.dataset.letter;
          if (
            selectRadioAnswer(index, letter) &&
            document.getElementById("auto-next")?.checked
          ) {
            setTimeout(() => clickNextButton(), 500);
          }
        });

        const infoButton = element.querySelector(".info-button");
        infoButton.addEventListener("mouseenter", () => {
          element.style.backgroundColor = "#333";
          element.querySelector(".info-button").style.backgroundColor =
            "#4CAF50";
          element.querySelector(".info-button").style.color = "#fff";

          const tooltip = document.createElement("div");
          tooltip.className = "q-tooltip explanation-tooltip";
          tooltip.style =
            "position:absolute;left:105%;top:0;transform:translateX(0);width:350px;padding:12px;background:#2a2a2a;border:1px solid #333;border-radius:6px;box-shadow:0 3px 8px rgba(0,0,0,0.3);z-index:10001;font-size:12px;white-space:pre-wrap;max-height:400px;overflow-y:auto;line-height:1.4;";

          tooltip.innerHTML = `
            <div style="margin-bottom:8px;font-weight:500;color:#4CAF50;">Pertanyaan:</div>
            <div style="margin-bottom:10px;color:#fff;">${data.question}</div>
            <div style="margin-bottom:8px;font-weight:500;color:#4CAF50;">Pilihan:</div>
            <div style="margin-bottom:10px;color:#fff;">
              ${data.options
                .map(
                  (opt, idx) =>
                    `<div style="${
                      answer === String.fromCharCode(97 + idx)
                        ? "color:#4CAF50;font-weight:500;"
                        : "color:#999;"
                    }">${String.fromCharCode(97 + idx)}. ${opt}</div>`
                )
                .join("")}
            </div>
            <div style="margin-bottom:8px;font-weight:500;color:#4CAF50;">Penjelasan:</div>
            <div style="color:#999;">${data.explanation.replace(
              /\n/g,
              "<br>"
            )}</div>
          `;

          document.body.appendChild(tooltip);

          const rect = tooltip.getBoundingClientRect();
          if (rect.right > window.innerWidth) {
            tooltip.style.left = "auto";
            tooltip.style.right = "105%";
            tooltip.style.transform = "translateX(0)";
          }

          if (rect.bottom > window.innerHeight) {
            const overflow = rect.bottom - window.innerHeight;
            tooltip.style.top = `${Math.max(0, rect.top - overflow - 20)}px`;
            tooltip.style.transform = "translateX(0)";
          }
        });

        infoButton.addEventListener("mouseleave", () => {
          element.style.backgroundColor = "#2a2a2a";
          element.querySelector(".info-button").style.backgroundColor = "#333";
          element.querySelector(".info-button").style.color = "#999";
          const tooltip = document.querySelector(".explanation-tooltip");
          if (tooltip) tooltip.remove();
        });
      } else {
        element.style.borderLeftColor = "#f44336";
        element.innerHTML = `<div style="color:#fff;">${data.number}. <span style="color:#f44336;font-weight:500;">Error</span></div>`;
      }
    }

    await fetchAndProcess();

    // Set a faster check interval for updates (reduced from 4000ms to 1000ms)
    setInterval(fetchAndProcess, 1000);

    // Modify autoStartQuiz to be more aggressive
    async function autoStartQuiz() {
      // Reduce initial wait time
      await new Promise((resolve) => setTimeout(resolve, 100));

      // Create a more aggressive observer for the start button
      const startObserver = new MutationObserver((mutations, obs) => {
        const startButton = document.querySelector(
          "button.MuiButtonBase-root.MuiButton-root.MuiButton-contained.MuiButton-containedPrimary"
        );

        if (startButton && startButton.textContent.includes("Mulai Quiz")) {
          console.log("Found Mulai Quiz button, clicking...");
          startButton.click();
          obs.disconnect();

          // Wait a moment and refresh the page
          setTimeout(() => {
            window.location.reload();
          }, 50000);
        }
      });

      // Start observing immediately with a more aggressive configuration
      startObserver.observe(document.body, {
        childList: true,
        subtree: true,
        attributes: true, // Also watch for attribute changes
        characterData: true, // Also watch for text content changes
      });

      // Also check immediately
      const startButton = document.querySelector(
        "button.MuiButtonBase-root.MuiButton-root.MuiButton-contained.MuiButton-containedPrimary"
      );

      if (startButton && startButton.textContent.includes("Mulai Quiz")) {
        console.log("Mulai Quiz button already present, clicking...");
        startButton.click();
        startObserver.disconnect();

        setTimeout(() => {
          window.location.reload();
        }, 50000);
      }
    }

    // Add function to auto-click the "Ya" button (now only for the first appearance)
    function setupAutoConfirm() {
      let hasClickedFirst = false;

      // Create a MutationObserver to watch for the confirmation dialog
      const observer = new MutationObserver((mutations, obs) => {
        try {
          // Look for the "Ya" button using a more reliable selector
          const confirmButton = document
            .querySelector(
              'button.MuiButtonBase-root.MuiButton-root.MuiButton-outlined.MuiButton-outlinedPrimary svg[data-testid="ThumbUpOffAltRoundedIcon"]'
            )
            ?.closest("button");

          if (confirmButton && !hasClickedFirst) {
            // First appearance only
            console.log("Found first confirmation dialog, clicking 'Ya'...");
            confirmButton.click();
            hasClickedFirst = true;
            obs.disconnect(); // Disconnect after first click since second click is handled by clickNextButton
          }
        } catch (error) {
          // Silently handle any selector errors
          console.debug("Selector check in progress...");
        }
      });

      // Start observing the document with the configured parameters
      observer.observe(document.body, {
        childList: true,
        subtree: true,
        attributes: false,
        characterData: false,
      });

      // Also check immediately in case the button is already present
      try {
        const confirmButton = document
          .querySelector(
            'button.MuiButtonBase-root.MuiButton-root.MuiButton-outlined.MuiButton-outlinedPrimary svg[data-testid="ThumbUpOffAltRoundedIcon"]'
          )
          ?.closest("button");

        if (confirmButton && !hasClickedFirst) {
          console.log(
            "First confirmation dialog already present, clicking 'Ya'..."
          );
          confirmButton.click();
          hasClickedFirst = true;
          observer.disconnect();
        }
      } catch (error) {
        // Silently handle any selector errors
        console.debug("Initial selector check in progress...");
      }
    }

    // Start both auto-start and auto-confirm processes
    autoStartQuiz();
    setupAutoConfirm();
  } catch (error) {
    const errorMsg = document.createElement("div");
    errorMsg.style =
      "position:fixed;top:20px;left:50%;transform:translateX(-50%);background:#2a2a2a;color:#fff;padding:12px 20px;border-radius:6px;box-shadow:0 3px 15px rgba(0,0,0,0.3);z-index:10000;font-family:system-ui;border:1px solid #333;";
    errorMsg.innerHTML = `<div style="display:flex;align-items:center;gap:10px;"><span style="color:#f44336;">❌</span><span>${error.message}</span></div>`;
    document.body.appendChild(errorMsg);

    setTimeout(() => {
      errorMsg.style.opacity = "0";
      errorMsg.style.transition = "opacity 0.5s ease";
      setTimeout(() => errorMsg.remove(), 500);
    }, 5000);
  }
})();
