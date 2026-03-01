if (window.location.href === "https://mentari.unpam.ac.id/login") {
  console.log("Ekstensi tidak aktif di halaman login.");
} else {
  (function () {
    console.log("Ekstensi berjalan di mentari.unpam.ac.id");

    // Fungsi untuk menyuntikkan tombol ke header (MUI)
    function injectHeaderToggle() {
      // Cari icon dark mode atau light mode sebagai anchor
      const themeIcon = document.querySelector('svg[data-testid="DarkModeIcon"], svg[data-testid="LightModeIcon"]');
      if (themeIcon) {
        const themeButton = themeIcon.closest('button');
        const headerStack = themeIcon.closest('.MuiStack-root');
        
        // Cek jika sudah ada agar tidak duplikat
        if (headerStack && themeButton && !document.getElementById("mentari-header-toggle")) {
          const mentariButton = document.createElement("button");
          mentariButton.id = "mentari-header-toggle";
          
          // Gunakan class dasar MUI dari tombol sebelah tanpa hash random
          mentariButton.className = "MuiButtonBase-root MuiIconButton-root MuiIconButton-sizeMedium";
          mentariButton.style.marginRight = "8px"; // Beri sedikit jarak
          mentariButton.style.padding = "8px";
          mentariButton.style.transition = "background-color 150ms cubic-bezier(0.4, 0, 0.2, 1) 0ms";
          
          // Reset styling agar tidak terlihat seperti "tombol kuno"
          mentariButton.style.backgroundColor = "transparent";
          mentariButton.style.border = "0";
          mentariButton.style.borderRadius = "50%";
          mentariButton.style.display = "inline-flex";
          mentariButton.style.alignItems = "center";
          mentariButton.style.justifyContent = "center";
          mentariButton.style.outline = "0";
          mentariButton.style.color = "#f0872d"; // Warna primer Mentari
          mentariButton.style.padding = "8px";
          mentariButton.style.cursor = "pointer";
          mentariButton.style.transition = "background-color 150ms cubic-bezier(0.4, 0, 0.2, 1) 0ms";

          // Icon Bolt menggunakan SVG agar pasti muncul tanpa load external script (FontAwesome style)
          mentariButton.innerHTML = `
            <svg class="MuiSvgIcon-root MuiSvgIcon-fontSizeMedium" focusable="false" aria-hidden="true" viewBox="0 0 24 24" style="width: 24px; height: 24px; fill: currentColor;">
              <path d="M11 21h-1l1-7H7.5c-.58 0-.57-.32-.38-.66.19-.34.05-.08.07-.12C8.48 11.06 10.42 7.71 13 3h1l-1 7h3.5c.49 0 .56.33.47.51l-.07.15C12.96 17.55 11 21 11 21z"></path>
            </svg>
            <span class="MuiTouchRipple-root"></span>
          `;

          // Efek hover persis MUI
          mentariButton.onmouseover = () => { mentariButton.style.backgroundColor = "rgba(240, 135, 45, 0.08)"; };
          mentariButton.onmouseout = () => { mentariButton.style.backgroundColor = "transparent"; };

          mentariButton.onclick = (e) => {
            e.preventDefault();
            clickButton();
          };

          // Masukkan sebelum tombol tema
          headerStack.insertBefore(mentariButton, themeButton);
          console.log("Mentari Toggle injected to header.");
        }
      }
    }

    // Jalankan pengecekan secara berkala karena MUI sering re-render (SPA)
    const headerCheckInterval = setInterval(injectHeaderToggle, 2000);

    // State untuk menghindari load script berulang
    let scriptsLoaded = false;

    // Fungsi untuk mengklik tombol
    function clickButton() {
      // Selalu kirim event toggle, jika sudah ada popup maka akan terbuka/tertutup
      window.dispatchEvent(new CustomEvent('mentari-toggle-popup'));
      
      // Jika belum pernah load, maka load script utama
      if (!scriptsLoaded) {
        // First load apiKeyManager.js
        let apiKeyManagerScript = document.createElement("script");
        apiKeyManagerScript.src = chrome.runtime.getURL("src/content/apiKeyManager.js");
        apiKeyManagerScript.onload = function () {
          // Then load token.js after apiKeyManager.js is loaded
          let tokenScript = document.createElement("script");
          tokenScript.src = chrome.runtime.getURL("src/content/token.js");
          tokenScript.onload = function () {
            scriptsLoaded = true;
            // Picu toggle pertama kali setelah script siap
            window.dispatchEvent(new CustomEvent('mentari-toggle-popup'));
          };
          document.body.appendChild(tokenScript);
        };
        document.body.appendChild(apiKeyManagerScript);
      }
    }

    // Auto-click dengan delay 1 detik untuk inisialisasi awal (jika diperlukan)
    setTimeout(function () {
      console.log("Initializing Mentari Mod in background...");
      // Kita panggil clickButton tanpa membuka UI hanya untuk load scripts
      // atau biarkan user klik manual untuk pertama kali
    }, 1000);
  })();
}
