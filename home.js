console.log("Interval aktif - gambar mobile dan desktop akan disesuaikan otomatis");

const intervalId = setInterval(() => {
  // Ganti logo Mentari
  const mentariLogo = document.querySelector(
    'img[src*="MentariLogo-DfuWb4z9.png"]'
  );
  if (mentariLogo) {
    mentariLogo.src =
      "https://github.com/user-attachments/assets/bc206a62-4b37-4064-a1af-872e7a157463";
    mentariLogo.style.width = "auto";
  }

  // Ganti background image
  const bgImage = document.querySelector(
    'img[src*="Background-Dt75uuh7.jpg"]'
  );
  if (bgImage) {
    const isMobile = window.innerWidth <= 768;
    const newSrc = isMobile
      ? "https://raw.githubusercontent.com/AnandaAnugrahHandyanto/mentari_unpam-mod/main/img/crDroid-logo-mobile.png"
      : "https://raw.githubusercontent.com/AnandaAnugrahHandyanto/mentari_unpam-mod/main/img/crDroid-logo.png";

    bgImage.src = newSrc;

    // Styling gambar
    bgImage.style.width = "100%";
    bgImage.style.height = "100%";
    bgImage.style.objectFit = "cover";
    bgImage.style.objectPosition = "center";

    console.log(`Background diganti (${isMobile ? "Mobile" : "Desktop"}):`, newSrc);
  }

  // Atur style teks judul
  const h5Element = document.querySelector(
    ".MuiTypography-root.MuiTypography-h5"
  );
  if (h5Element) {
    h5Element.style.lineHeight = "0.334";
  }
}, 500);
