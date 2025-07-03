if (window.location.href === "https://mentari.unpam.ac.id/login") {
  console.log("Ekstensi tidak aktif di halaman login.");
} else {
  (function () {
    console.log("Ekstensi berjalan di mentari.unpam.ac.id");

    // Buat tombol baru
    let button = document.createElement("button");
    button.innerText = "Start Tracking";
    button.id = "runTokenButton";
    button.style.position = "fixed";
    button.style.display = "none";
    button.style.bottom = "20px";
    button.style.right = "20px";
    button.style.background = "#0070f3";
    button.style.color = "white";
    button.style.border = "none";
    button.style.padding = "10px 20px";
    button.style.fontSize = "14px";
    button.style.cursor = "pointer";
    button.style.borderRadius = "5px";
    button.style.zIndex = "10000";
    button.style.boxShadow = "0 4px 14px rgba(0, 118, 255, 0.3)";
    button.style.fontFamily =
      "-apple-system, system-ui, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif";
    button.style.fontWeight = "500";

    // Hover effect
    button.addEventListener("mouseover", function () {
      this.style.background = "#0056b3";
    });

    button.addEventListener("mouseout", function () {
      this.style.background = "#0070f3";
    });

    // Tambahkan tombol ke halaman
    document.body.appendChild(button);

    // Fungsi untuk mengklik tombol
    function clickButton() {
      // Check if token.js has already been loaded
      if (window.toggleTokenPopup) {
        window.toggleTokenPopup();
      } else {
        // First load apiKeyManager.js
        let apiKeyManagerScript = document.createElement("script");
        apiKeyManagerScript.src = chrome.runtime.getURL("apiKeyManager.js");
        apiKeyManagerScript.onload = function () {
          // Then load token.js after apiKeyManager.js is loaded
          let tokenScript = document.createElement("script");
          tokenScript.src = chrome.runtime.getURL("token.js");
          tokenScript.onload = function () {
            // Call the toggle function after script loads
            if (window.toggleTokenPopup) {
              window.toggleTokenPopup();
            }
          };
          document.body.appendChild(tokenScript);
        };
        document.body.appendChild(apiKeyManagerScript);
      }
    }

    // Tambahkan event listener untuk menjalankan token.js
    button.addEventListener("click", clickButton);

    // Auto-click dengan delay 1 detik
    setTimeout(function () {
      console.log("Auto-clicking Start Tracking button after 1 second delay");
      clickButton();
    }, 1000);
  })();
}
