// Script untuk mengklik otomatis radio button "Ya" dan scroll ke bawah setelah delay
(function () {
  // Fungsi utama yang akan dijalankan setelah delay
  function executeAfterDelay() {
    try {
      // Scroll ke bawah terlebih dahulu
      window.scrollTo({ top: document.body.scrollHeight, behavior: "smooth" });

      // Mencari semua radio button yang memiliki value="1"
      const radioButtons = document.querySelectorAll(
        'input[type="radio"][value="1"]'
      );
      console.log("Menemukan", radioButtons.length, "radio buttons");

      if (radioButtons.length === 0) {
        console.error("Radio button tidak ditemukan! Coba selector lain");
        return;
      }

      // Loop melalui setiap radio button dan klik
      radioButtons.forEach((radio, index) => {
        // Menggunakan setTimeout dengan delay bertahap untuk memastikan klik berjalan secara berurutan
        setTimeout(() => {
          // Metode 1: Klik langsung
          radio.click();

          // Metode 2: Trigger event secara manual jika metode 1 tidak bekerja
          if (!radio.checked) {
            radio.checked = true;
            radio.dispatchEvent(new Event("change", { bubbles: true }));
          }
        }, index * 100); // tambahkan delay 100ms antar klik
      });
    } catch (error) {
      console.error("Error dalam script:", error);
    }
  }

  // Menunggu halaman terload, baru jalankan fungsi dengan delay 1200ms
  if (document.readyState === "complete") {
    setTimeout(executeAfterDelay, 1200);
  } else {
    console.log("Menunggu halaman terload sepenuhnya");
    window.addEventListener("load", function () {
      setTimeout(executeAfterDelay, 1200);
    });
  }
})();
