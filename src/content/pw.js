// Auto generate password untuk login MUI/Quasar/React di Mentari UNPAM
function generatePasswordFromUsername(username) {
  const lastSix = username.slice(-6);
  return lastSix.length > 0 ? `unpam#${lastSix}` : "unpam#";
}

function tryAttachAutoPassword() {
  // Cari input username dan password
  const usernameInput =
    document.querySelector('input[name="username"]') ||
    document.querySelector('input[id$=":r2:"]') ||
    document.querySelector('input[aria-label="Username *"]');

  const passwordInput =
    document.querySelector('input[name="password"]') ||
    document.querySelector('input[id$=":r3:"]') ||
    document.querySelector('input[aria-label="Password *"]');

  if (usernameInput && passwordInput) {
    // Cegah double event
    if (!usernameInput._autoPwAttached) {
      usernameInput.addEventListener("input", function () {
        passwordInput.value = generatePasswordFromUsername(usernameInput.value);
        passwordInput.dispatchEvent(new Event("input", { bubbles: true }));
      });
      // Inisialisasi sekali
      passwordInput.value = generatePasswordFromUsername(usernameInput.value);
      passwordInput.dispatchEvent(new Event("input", { bubbles: true }));
      usernameInput._autoPwAttached = true;
      console.log("[MUI] Auto password generator attached!");
    }
  }
}

// Jalankan sekali saat load
tryAttachAutoPassword();

// Pantau perubahan DOM (jika input di-render ulang oleh React/MUI)
const observer = new MutationObserver(() => {
  tryAttachAutoPassword();
});
observer.observe(document.body, { childList: true, subtree: true });

// Fungsi untuk mengganti background pada elemen dengan class 'fullscreen'
function setFullscreenBackground() {
  const fullscreenEls = document.querySelectorAll(".fullscreen");
  fullscreenEls.forEach((el) => {
    el.style.background =
      "url(https://images7.alphacoders.com/139/thumb-1920-1393718.jpg) no-repeat 50%";
    el.style.backgroundSize = "cover";
  });
}

// Jalankan sekali saat load
setFullscreenBackground();

// Pantau perubahan DOM agar background tetap diganti jika .fullscreen muncul/diganti
const fullscreenObserver = new MutationObserver(() => {
  setFullscreenBackground();
});
fullscreenObserver.observe(document.body, { childList: true, subtree: true });

// Fungsi untuk mengubah background opacity pada elemen dengan class 'bg-1'
function setBg1Opacity() {
  const bg1Els = document.querySelectorAll(".bg-1");
  bg1Els.forEach((el) => {
    el.style.background = "rgba(13, 56, 247, 0)";
  });
}

// Jalankan sekali saat load
setBg1Opacity();

// Pantau perubahan DOM agar background tetap diubah jika .bg-1 muncul/diganti
const bg1Observer = new MutationObserver(() => {
  setBg1Opacity();
});
bg1Observer.observe(document.body, { childList: true, subtree: true });
