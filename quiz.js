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
        "position:fixed;z-index:10000;min-width:300px;max-width:450px;width:auto;top:20px;right:20px;background:#1e1e1e;color:#fff;border-radius:8px;box-shadow:0 4px 12px rgba(0,0,0,0.5);font-family:system-ui;font-size:13px;border:2px solid #8c59d1;overflow:hidden;";

      const header = document.createElement("div");
      header.style =
        "padding:10px 14px;background:#8c59d1;color:#fff;cursor:move;user-select:none;display:flex;justify-content:space-between;align-items:center;font-weight:bold;";
      header.innerHTML = `
        <div>Quiz Helper</div>
        <div style="display:flex;gap:8px;">
          <button id="toggle-popup" style="background:none;border:none;color:inherit;cursor:pointer;padding:0;width:24px;height:24px;display:flex;align-items:center;justify-content:center;font-size:16px;">−</button>
          <button id="close-popup" style="background:none;border:none;color:inherit;cursor:pointer;padding:0;width:24px;height:24px;display:flex;align-items:center;justify-content:center;font-size:16px;">×</button>
        </div>
      `;

      const content = document.createElement("div");
      content.id = "popup-content";
      content.style = "padding:12px;max-height:500px;overflow-y:auto;";

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

        // Auto-answer jika diaktifkan
        if (document.getElementById("auto-answer")?.checked && result.letter) {
          const selected = selectRadioAnswer(questionIndex, result.letter);
          if (selected) {
            console.log(
              `Auto-selected answer ${result.letter} for question #${questionIndex}`
            );
            if (document.getElementById("auto-next")?.checked) {
              console.log("Auto-advancing to next question...");
              setTimeout(() => clickNextButton(), 300);
            }
          } else {
            console.warn(
              `Failed to auto-select answer ${result.letter} for question #${questionIndex}`
            );
          }
        }

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

        // Immediately apply answer if auto-answer is enabled
        if (document.getElementById("auto-answer")?.checked && result.letter) {
          const selected = selectRadioAnswer(questionIndex, result.letter);
          if (selected && document.getElementById("auto-next")?.checked) {
            setTimeout(() => clickNextButton(), 300);
          }
        }

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
      return false;
    }

    // Check if all answers are ready and answer questions sequentially
    function sequentiallyAnswerAllQuestions() {
      if (!document.getElementById("auto-answer")?.checked) return;

      // Clear any existing timer to avoid multiple instances
      if (autoAnswerTimer) {
        clearInterval(autoAnswerTimer);
      }

      // Set a timer to check for new answers every 500ms
      autoAnswerTimer = setInterval(() => {
        // Find the first unanswered question that has an answer ready
        const answerButtons = Array.from(
          document.querySelectorAll(".apply-answer")
        );

        if (answerButtons.length > 0) {
          const nextToAnswer = answerButtons[0];
          const index = parseInt(nextToAnswer.dataset.index);
          const letter = nextToAnswer.dataset.letter;

          // Apply the answer
          const selected = selectRadioAnswer(index, letter);

          if (selected) {
            // Remove the apply button after successfully applying the answer
            nextToAnswer
              .closest("[data-question-id]")
              .querySelector(".apply-answer")
              .remove();

            // If auto-next is enabled, click next button after a short delay
            if (document.getElementById("auto-next")?.checked) {
              setTimeout(() => {
                clickNextButton();
              }, 300); // Reduced delay for faster navigation
            }
          }
        }
      }, 500);
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
      '<div style="text-align:center;padding:10px"><p>Memuat kuis...</p><div style="width:100%;height:6px;background-color:#333;border-radius:3px;overflow:hidden;"><div id="load-progress" style="width:0%;height:100%;background-color:#8c59d1;transition:width 0.3s;"></div></div></div>';

    const processedQuestions = new Set();
    const questionData = new Map();
    let allQuestionsAnswered = false;
    let autoAnswerTimer = null;

    async function fetchAndProcess() {
      try {
        const response = await fetch(apiUrl, {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        });

        if (!response.ok) throw new Error(`Error: ${response.status}`);

        const data = await response.json();
        if (!data || !data.data) throw new Error("Data kuis tidak valid");

        await processQuiz(data);
      } catch (error) {
        console.error("Error:", error);
        popup.content.innerHTML = `<div style="color:#ff6b6b;padding:15px;text-align:center;background:#2a2a2a;border-radius:6px;margin:5px;">Error: ${error.message}</div>`;
      }
    }

    // Modify the processQuiz function to pass the question ID and index to askGemini
    async function processQuiz(quizData) {
      const isFirstRun = !popup.content.querySelector("#answers-container");

      if (isFirstRun) {
        popup.content.innerHTML = `
      <div style="margin-bottom:15px;">
        <div id="progress-text" style="font-size:12px;margin-bottom:8px;font-weight:500;">Memproses pertanyaan...</div>
        <div style="width:100%;height:5px;background-color:#333;border-radius:3px;overflow:hidden;">
          <div id="progress-bar" style="height:100%;width:0%;background-color:#8c59d1;transition:width 0.3s ease;"></div>
        </div>
      </div>
      <div id="answers-container" style="max-height:350px;overflow-y:auto;padding-right:5px;"></div>
      <div style="display:none;justify-content:space-between;margin-top:10px;">
        <label style="display:flex;align-items:center;font-size:12px;">
          <input type="checkbox" id="auto-answer" checked style="margin-right:5px;"> Auto-jawab
        </label>
        <label style="display:flex;align-items:center;font-size:12px;">
          <input type="checkbox" id="auto-next" checked style="margin-right:5px;"> Auto-next
        </label>
        <button id="answer-all-btn" style="background:#8c59d1;border:none;border-radius:4px;color:white;padding:3px 8px;font-size:11px;cursor:pointer;">Jawab Semua</button>
      </div>
    `;

        // Add event listener for the "Jawab Semua" button after ensuring it exists
        setTimeout(() => {
          const answerAllBtn = document.getElementById("answer-all-btn");
          if (answerAllBtn) {
            answerAllBtn.addEventListener("click", () => {
              sequentiallyAnswerAllQuestions();
            });
          }
        }, 100);
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

      for (let i = 0; i < quizData.data.length; i++) {
        const question = quizData.data[i];

        if (processedQuestions.has(question.id)) {
          // Count already processed questions with answers
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
        progressText.textContent = `Memproses ${i + 1} dari ${
          quizData.data.length
        }`;

        const questionItem = document.createElement("div");
        questionItem.dataset.questionId = question.id;
        questionItem.style =
          "padding:8px 12px;margin-bottom:8px;border-radius:6px;background-color:rgba(255,255,255,0.08);position:relative;border-left:4px solid #555;transition:background-color 0.2s ease;";
        questionItem.innerHTML = `<small>${
          i + 1
        }. <span style="color:#ffcc5c;">Memproses...</span></small>`;
        answersContainer.appendChild(questionItem);

        const title = cleanText(question.judul || "");
        const desc = cleanText(question.deskripsi || "");

        let fullQuestion = "";
        if (title) fullQuestion += `${title}\n\n`;
        if (desc) fullQuestion += `${desc}`;

        const options = (question.list_jawaban || []).map((j) =>
          cleanText(j.jawaban)
        );

        if (options.length === 0) {
          questionItem.innerHTML = `<small>${
            i + 1
          }. <span style="color:#ff6b6b;">Tidak ada pilihan</span></small>`;
          continue;
        }

        // Pass question ID and index to askGemini
        let result = await askGemini(fullQuestion, options, question.id, i);

        if (!result.letter) {
          result = await fallbackAnswerExtractor(
            fullQuestion,
            options,
            question.id,
            i
          );
        }

        const answer = result.letter;
        const explanation = result.explanation;

        questionData.set(question.id, {
          id: question.id,
          number: i + 1,
          question: fullQuestion,
          options: options,
          answer: answer,
          explanation: explanation,
          index: i,
        });

        updateQuestionElement(questionItem, questionData.get(question.id));

        // Count this question if it has an answer
        if (answer) {
          answeredQuestions++;
        }

        await delay(300);
      }

      // Check if all questions have been processed and have answers
      if (answeredQuestions === quizData.data.length && !allQuestionsAnswered) {
        allQuestionsAnswered = true;
        progressText.textContent = "✅ Semua jawaban siap!";
        progressText.style.color = "#4CAF50";
      } else {
        progressBar.style.width = "100%";
        progressText.textContent = newQuestionsFound
          ? "✅ Pertanyaan baru diproses!"
          : "✓ Tidak ada pertanyaan baru";
        progressText.style.color = newQuestionsFound ? "#4CAF50" : "#aaa";

        // Update progress text to show how many questions have answers
        const progressPercent = Math.round(
          (answeredQuestions / quizData.data.length) * 100
        );
        progressText.textContent = `${progressPercent}% (${answeredQuestions}/${quizData.data.length}) pertanyaan memiliki jawaban`;
      }
    }
    function createQuestionElement(data) {
      const questionItem = document.createElement("div");
      questionItem.dataset.questionId = data.id;
      questionItem.style =
        "padding:8px 12px;margin-bottom:8px;border-radius:6px;background-color:rgba(255,255,255,0.08);position:relative;border-left:4px solid #555;transition:background-color 0.2s ease;";

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
              <span style="font-weight:500;">${
                data.number
              }. <span style="color:#8c59d1;font-weight:bold;">${answer.toUpperCase()}</span></span>
              <span style="opacity:0.9;margin-left:6px;overflow:hidden;text-overflow:ellipsis;max-width:100%;display:inline-block;vertical-align:middle;">${answerText.substring(
                0,
                40
              )}${answerText.length > 40 ? "..." : ""}</span>
            </div>
            <div style="display:none;align-items:center;">
              <button class="apply-answer" data-index="${
                data.index
              }" data-letter="${answer}" style="margin-right:5px;padding:2px 5px;background:#4CAF50;border:none;border-radius:3px;color:white;font-size:10px;cursor:pointer;">Pilih</button>
              <div class="info-button" style="width:18px;height:18px;border-radius:50%;background:#8c59d1;color:white;display:flex;align-items:center;justify-content:center;cursor:pointer;font-size:10px;">i</div>
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
          element.style.backgroundColor = "rgba(255,255,255,0.12)";

          const tooltip = document.createElement("div");
          tooltip.className = "q-tooltip explanation-tooltip";
          tooltip.style =
            "position:absolute;left:105%;top:0;transform:translateX(0);width:350px;padding:10px;background:#2a2a2a;border:1px solid #555;border-radius:6px;box-shadow:0 3px 8px rgba(0,0,0,0.3);z-index:10001;font-size:12px;white-space:pre-wrap;max-height:400px;overflow-y:auto;line-height:1.4;";

          tooltip.innerHTML = `
            <div style="margin-bottom:8px;font-weight:bold;color:#8c59d1;">Pertanyaan:</div>
            <div style="margin-bottom:10px;">${data.question}</div>
            <div style="margin-bottom:8px;font-weight:bold;color:#8c59d1;">Pilihan:</div>
            <div style="margin-bottom:10px;">
              ${data.options
                .map(
                  (opt, idx) =>
                    `<div style="${
                      answer === String.fromCharCode(97 + idx)
                        ? "color:#4CAF50;font-weight:bold;"
                        : ""
                    }">${String.fromCharCode(97 + idx)}. ${opt}</div>`
                )
                .join("")}
            </div>
            <div style="margin-bottom:8px;font-weight:bold;color:#8c59d1;">Penjelasan:</div>
            <div>${data.explanation.replace(/\n/g, "<br>")}</div>
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
          element.style.backgroundColor = "rgba(255,255,255,0.08);";
          const tooltip = document.querySelector(".explanation-tooltip");
          if (tooltip) tooltip.remove();
        });
      } else {
        element.style.borderLeftColor = "#f44336";
        element.innerHTML = `<div>${data.number}. <span style="color:#f44336;font-weight:500;">Error</span></div>`;
      }
    }

    await fetchAndProcess();

    // Set regular check interval
    setInterval(fetchAndProcess, 8000);
  } catch (error) {
    const errorMsg = document.createElement("div");
    errorMsg.style =
      "position:fixed;top:20px;left:50%;transform:translateX(-50%);background:#f44336;color:white;padding:12px 20px;border-radius:6px;box-shadow:0 3px 15px rgba(0,0,0,0.3);z-index:10000;font-family:system-ui;";
    errorMsg.innerHTML = `<div style="display:flex;align-items:center;gap:10px;"><span>❌</span><span>${error.message}</span></div>`;
    document.body.appendChild(errorMsg);

    setTimeout(() => {
      errorMsg.style.opacity = "0";
      errorMsg.style.transition = "opacity 0.5s ease";
      setTimeout(() => errorMsg.remove(), 500);
    }, 5000);
  }
})();
