if (window.location.href === "https://mentari.unpam.ac.id/login") {
  console.log("Ekstensi tidak aktif di halaman login.");
} else {
  (function () {
    console.log("Ekstensi berjalan di mentari.unpam.ac.id");

    // Injeksi Material Symbols dari Google Fonts (fonts.gstatic.com diizinkan CSP)
    if (!document.getElementById("material-icons-css")) {
      const link = document.createElement("link");
      link.id = "material-icons-css";
      link.rel = "stylesheet";
      link.href =
        "https://fonts.googleapis.com/css2?family=Material+Symbols+Rounded:opsz,wght,FILL,GRAD@20,400,0,0";
      document.head.appendChild(link);
    }

    // Tambahkan CSS animasi kilau inner sweep untuk tombol toggle
    const style = document.createElement("style");
    style.textContent = `
/* Soft elegant glow sweep every 3s */
@keyframes mentari-sweep {
  0% {
    opacity: 0;
    transform: translateX(-140%) scale(0.9);
  }
  8% {
    opacity: 0.25;
  }
  25% {
    opacity: 0.45;
  }
  45% {
    opacity: 0.3;
  }
  60% {
    opacity: 0;
    transform: translateX(140%) scale(1.05);
  }
  100% {
    opacity: 0;
    transform: translateX(140%) scale(1.05);
  }
}

#mentari-header-toggle {
  position: relative !important;
  overflow: hidden !important;
  isolation: isolate;
}

#mentari-header-toggle::after {
  content: '';
  position: absolute;
  inset: -20%;
  pointer-events: none;
  border-radius: 50%;

  background:
    radial-gradient(
      circle at center,
      rgba(255,255,255,0.88) 0%,
      rgba(255,255,255,0.68) 30%,
      transparent 75%
    );

  filter: blur(14px);
  mix-blend-mode: screen;

  animation: mentari-sweep 3s cubic-bezier(0.4, 0, 0.2, 1) infinite;
}

/* Light Theme Glow: Use orange instead of white */
#mentari-header-toggle.light-theme::after {
  background:
    radial-gradient(
      circle at center,
      rgba(255, 123, 0, 0.6) 0%,
      rgba(255, 123, 0, 0.3) 30%,
      transparent 75%
    );
  mix-blend-mode: multiply;
}

/* Hover = subtle breathing glow */
#mentari-header-toggle:hover::after {
  animation: mentari-hover 2.5s ease-in-out infinite;
}

@keyframes mentari-hover {
  0%, 100% {
    opacity: 0.15;
    transform: scale(1);
  }
  50% {
    opacity: 0.3;
    transform: scale(1.08);
  }
}
`;
    document.head.appendChild(style);

    function injectHeaderToggle() {
      const themeIcon = document.querySelector(
        'svg[data-testid="DarkModeIcon"], svg[data-testid="LightModeIcon"]',
      );
      if (themeIcon) {
        const themeButton = themeIcon.closest("button");
        const headerStack = themeIcon.closest(".MuiStack-root");

        if (
          headerStack &&
          themeButton &&
          !document.getElementById("mentari-header-toggle")
        ) {
          const mentariButton = document.createElement("button");
          mentariButton.id = "mentari-header-toggle";
          mentariButton.className =
            "MuiButtonBase-root MuiIconButton-root MuiIconButton-sizeMedium";
          mentariButton.style.marginRight = "8px";
          mentariButton.style.padding = "8px";
          mentariButton.style.backgroundColor = "transparent";
          mentariButton.style.border = "0";
          mentariButton.style.borderRadius = "50%";
          mentariButton.style.display = "inline-flex";
          mentariButton.style.alignItems = "center";
          mentariButton.style.justifyContent = "center";
          mentariButton.style.outline = "0";
          mentariButton.style.color = "#ff7b00ff";
          mentariButton.style.cursor = "pointer";
          mentariButton.style.transition =
            "background-color 150ms cubic-bezier(0.4, 0, 0.2, 1) 0ms";

          // Theme Detection Logic for Glow
          const applyTheme = () => {
            const isLight = document.querySelector(".css-1yxmbwk") !== null;
            if (isLight) mentariButton.classList.add("light-theme");
            else mentariButton.classList.remove("light-theme");
          };
          applyTheme();

          mentariButton.innerHTML = `
            <svg class="MuiSvgIcon-root MuiSvgIcon-fontSizeMedium" focusable="false" aria-hidden="true" viewBox="0 0 24 24" style="width: 18px; height: 18px; fill: currentColor;">
              <path d="M13.5 0.67s.74 2.65.74 4.8c0 2.06-1.35 3.73-3.41 3.73-2.07 0-3.63-1.67-3.63-3.73l.03-.36C5.21 7.51 4 10.62 4 14c0 4.42 3.58 8 8 8s8-3.58 8-8C20 8.61 17.41 3.8 13.5 0.67zM11.71 19c-1.78 0-3.22-1.4-3.22-3.14 0-1.62 1.05-2.76 2.81-3.12 1.77-.36 3.6-1.21 4.62-2.58.39 1.29.59 2.65.59 4.04 0 2.65-2.15 4.8-4.8 4.8z"/>
            </svg>
            <span class="MuiTouchRipple-root"></span>

          `;

          mentariButton.onmouseover = () => {
            mentariButton.style.backgroundColor = "rgba(212, 175, 55, 0.08)";
          };
          mentariButton.onmouseout = () => {
            mentariButton.style.backgroundColor = "transparent";
          };

          mentariButton.onclick = (e) => {
            e.preventDefault();
            clickButton();
          };

          headerStack.insertBefore(mentariButton, themeButton);
          console.log("Mentari Toggle injected to header.");
        }
      }
    }

    // MutationObserver untuk deteksi header dan course list secara instan
    const observer = new MutationObserver(() => {
      injectHeaderToggle();
      injectDummyCourseCard();
    });
    observer.observe(document.body, { childList: true, subtree: true });

    function injectDummyCourseCard() {
      if (document.getElementById("mentari-developer-changelog")) return;

      const headings = Array.from(
        document.querySelectorAll("h6, h5, h4, h3, h2, h1"),
      );
      const courseHeading = headings.find(
        (el) => el.textContent.trim() === "Courses",
      );

      if (courseHeading) {
        const courseContainer = courseHeading.parentElement.parentElement;
        if (courseContainer) {
          const changelog = document.createElement("div");
          changelog.id = "mentari-developer-changelog";
          changelog.style.cssText =
            "width:100%; margin:10px; box-sizing:border-box;";
          changelog.innerHTML = `
            <div style="width:100%; box-sizing:border-box; overflow:hidden; border-radius:16px; border:1px solid rgba(240,135,45,0.28); box-shadow:0 10px 28px rgba(0,0,0,0.12);">
              <iframe src="${chrome.runtime.getURL("pet.html")}" style="width:100%; height:360px; border:none; display:block; overflow:hidden;" title="Mentari Fox Playground"></iframe>
            </div>
          `;
          courseContainer.parentNode.insertBefore(changelog, courseContainer);
          console.log("Mentari Fox Playground injected.");
        }
      }
    }

    // Interval cadangan yang lebih cepat
    const headerCheckInterval = setInterval(injectHeaderToggle, 500);

    let scriptsLoaded = false;
    let isLoading = false;
    let loadQueue = [];

    function loadScripts(callback) {
      if (scriptsLoaded) {
        if (callback) callback();
        return;
      }
      if (callback) loadQueue.push(callback);
      if (isLoading) return;

      isLoading = true;
      let apiScript = document.createElement("script");
      apiScript.src = chrome.runtime.getURL("src/content/apiKeyManager.js");
      apiScript.onload = function () {
        let tokenScript = document.createElement("script");
        tokenScript.src = chrome.runtime.getURL("src/content/token.js");
        tokenScript.onload = function () {
          scriptsLoaded = true;
          isLoading = false;
          loadQueue.forEach((cb) => cb());
          loadQueue = [];
        };
        document.body.appendChild(tokenScript);
      };
      document.body.appendChild(apiScript);
    }

    function clickButton() {
      loadScripts(() => {
        window.dispatchEvent(new CustomEvent("mentari-toggle-popup"));
      });
    }

    // Pre-load scripts di background TANPA membuka popup
    setTimeout(() => {
      loadScripts(null); // null = jangan buka popup setelah load
    }, 300);
  })();
}
