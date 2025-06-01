// Script untuk auto-generate password "unpam#" + 6 digit terakhir username

// Fungsi untuk auto-fill password berdasarkan username
function updatePassword() {
  // Ambil input username dan password menggunakan querySelector untuk MUI/Quasar
  const usernameInput =
    document.querySelector('input[aria-label="Username *"]') ||
    document.querySelector('.q-field input[type="text"]:first-of-type') ||
    document.querySelector("label:first-of-type input");

  const passwordInput =
    document.querySelector('input[aria-label="Password *"]') ||
    document.querySelector('.q-field input[type="text"]:nth-of-type(2)') ||
    document.querySelector("label:nth-of-type(2) input");

  if (usernameInput && passwordInput) {
    const username = usernameInput.value;

    // Ambil 6 digit/karakter terakhir
    const lastSix = username.slice(-6);

    // Format password: unpam# + 6 digit terakhir
    const generatedPassword =
      lastSix.length > 0 ? `unpam#${lastSix}` : "unpam#";

    // Auto-fill password field
    passwordInput.value = generatedPassword;

    // Trigger input event untuk memastikan MUI/Quasar mendeteksi perubahan
    const inputEvent = new Event("input", { bubbles: true });
    passwordInput.dispatchEvent(inputEvent);

    // Console log untuk debugging
    console.log(`Username: ${username} → Password: ${generatedPassword}`);
  }
}

// Tunggu sampai DOM loaded
document.addEventListener("DOMContentLoaded", function () {
  const usernameInput =
    document.querySelector('input[aria-label="Username *"]') ||
    document.querySelector('.q-field input[type="text"]:first-of-type') ||
    document.querySelector("label:first-of-type input");

  if (usernameInput) {
    // Event listener untuk auto-generate password realtime
    usernameInput.addEventListener("input", updatePassword);

    // Panggil sekali untuk inisialisasi
    updatePassword();

    console.log("Auto password generator loaded successfully!");
    console.log(
      'Ketik username untuk auto-generate password format "unpam#" + 6 digit terakhir'
    );
  } else {
    console.error("Username input field not found!");
  }
});

// Jika DOM sudah loaded, jalankan langsung
if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", arguments.callee);
} else {
  // DOM sudah ready, jalankan script
  const usernameInput =
    document.querySelector('input[aria-label="Username *"]') ||
    document.querySelector('.q-field input[type="text"]:first-of-type') ||
    document.querySelector("label:first-of-type input");

  if (usernameInput) {
    usernameInput.addEventListener("input", updatePassword);
    updatePassword();
    console.log("Auto password generator loaded successfully!");
    console.log(
      'Ketik username untuk auto-generate password format "unpam#" + 6 digit terakhir'
    );
  } else {
    console.error("Username input field not found!");
  }
}
