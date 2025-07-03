// Script untuk mengklik otomatis radio button "Ya" dan scroll ke bawah setelah delay
(function () {
  // Fungsi untuk menunggu elemen muncul di DOM
  function waitForElement(selector, timeout = 10000) {
    return new Promise((resolve, reject) => {
      if (document.querySelector(selector)) {
        return resolve(document.querySelectorAll(selector));
      }

      const observer = new MutationObserver((mutations) => {
        if (document.querySelector(selector)) {
          observer.disconnect();
          resolve(document.querySelectorAll(selector));
        }
      });

      observer.observe(document.body, {
        childList: true,
        subtree: true,
      });

      setTimeout(() => {
        observer.disconnect();
        reject(new Error(`Timeout waiting for element: ${selector}`));
      }, timeout);
    });
  }

  // Fungsi untuk mengklik radio button dan trigger events
  function clickRadioButton(radio) {
    // Trigger semua event yang diperlukan untuk MUI
    radio.click();
    radio.checked = true;

    // Trigger events untuk MUI
    ["change", "click", "input"].forEach((eventType) => {
      radio.dispatchEvent(
        new Event(eventType, {
          bubbles: true,
          cancelable: true,
        })
      );
    });

    // Trigger event pada parent MUI FormControlLabel
    const formLabel = radio.closest(".MuiFormControlLabel-root");
    if (formLabel) {
      formLabel.click();
    }
  }

  // Fungsi untuk mengklik tombol submit
  function clickSubmitButton() {
    // Coba berbagai selector untuk menemukan tombol submit
    const submitSelectors = [
      // Selector spesifik berdasarkan class yang diberikan
      "button.MuiButtonBase-root.MuiButton-root.MuiButton-contained.MuiButton-containedPrimary.MuiButton-sizeSmall.MuiButton-containedSizeSmall",
      // Selector berdasarkan text content
      'button:has(span:contains("Submit Kuesioner"))',
      // Selector berdasarkan class dan type
      'button.MuiButton-containedPrimary[type="button"]',
      // Selector berdasarkan class dan role
      'button.MuiButtonBase-root[role="button"]',
      // Selector berdasarkan class dan tabindex
      'button.MuiButtonBase-root[tabindex="0"]',
      // Selector berdasarkan class dan style
      "button.MuiButton-contained.MuiButton-containedPrimary",
      // Selector berdasarkan class dan parent
      ".MuiButtonBase-root.MuiButton-root.MuiButton-contained",
      // Selector berdasarkan class dan child
      "button:has(.MuiTouchRipple-root)",
      // Selector berdasarkan class dan attribute
      'button[class*="MuiButton-containedPrimary"]',
    ];

    // Coba setiap selector
    for (const selector of submitSelectors) {
      const buttons = document.querySelectorAll(selector);
      for (const button of buttons) {
        // Periksa apakah button memiliki text "Submit Kuesioner"
        if (
          button.textContent.includes("Submit Kuesioner") &&
          !button.disabled
        ) {
          // Scroll ke button untuk memastikan terlihat
          button.scrollIntoView({ behavior: "smooth", block: "center" });

          // Trigger multiple events untuk memastikan click terdeteksi
          ["mousedown", "mouseup", "click"].forEach((eventType) => {
            button.dispatchEvent(
              new MouseEvent(eventType, {
                view: window,
                bubbles: true,
                cancelable: true,
                buttons: 1,
              })
            );
          });

          // Trigger click langsung
          button.click();

          console.log("Tombol submit ditemukan dan diklik");
          return true;
        }
      }
    }

    // Jika tidak ditemukan dengan selector, coba cari berdasarkan text content
    const allButtons = document.querySelectorAll("button");
    for (const button of allButtons) {
      if (button.textContent.includes("Submit Kuesioner") && !button.disabled) {
        button.scrollIntoView({ behavior: "smooth", block: "center" });
        button.click();
        console.log("Tombol submit ditemukan melalui text content");
        return true;
      }
    }

    console.log("Tombol submit tidak ditemukan");
    return false;
  }

  // Fungsi utama yang akan dijalankan setelah delay
  async function executeAfterDelay() {
    try {
      // Tunggu sampai radio buttons muncul
      const radioButtons = await waitForElement(
        'input[type="radio"][value="1"]'
      );

      if (radioButtons.length === 0) {
        console.log("Tidak ada radio button ditemukan");
        return;
      }

      // Scroll ke bawah secara instan
      window.scrollTo(0, document.body.scrollHeight);

      // Klik semua radio button secara bersamaan
      radioButtons.forEach((radio) => {
        if (radio.offsetParent !== null) {
          clickRadioButton(radio);
        }
      });

      console.log('Semua radio button "Ya" telah diklik');

      // Tunggu lebih lama untuk memastikan semua radio button sudah diproses
      setTimeout(() => {
        // Coba klik tombol submit beberapa kali
        let attempts = 0;
        const maxAttempts = 3;

        function trySubmit() {
          if (attempts >= maxAttempts) {
            console.log("Mencapai batas percobaan klik submit");
            return;
          }

          if (!clickSubmitButton()) {
            attempts++;
            console.log(
              `Mencoba klik submit lagi... (${attempts}/${maxAttempts})`
            );
            setTimeout(trySubmit, 500);
          }
        }

        trySubmit();
      }, 300);
    } catch (error) {
      console.log("Menunggu radio button muncul...");
      setTimeout(executeAfterDelay, 500);
    }
  }

  // Fungsi untuk memastikan DOM sudah siap
  function ensureDOMReady() {
    return new Promise((resolve) => {
      if (document.readyState === "loading") {
        document.addEventListener("DOMContentLoaded", resolve);
      } else {
        resolve();
      }
    });
  }

  // Jalankan script setelah DOM siap
  ensureDOMReady().then(() => {
    // Tunggu sebentar untuk memastikan MUI sudah diinisialisasi
    setTimeout(executeAfterDelay, 300);
  });
})();
