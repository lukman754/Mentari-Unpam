// Injeksi CSS untuk Redesign Login Form (Dark Glassmorphism)
const style = document.createElement("style");
style.textContent = `
  /* Container Utama - Cyber Metallic Glass */
  .MuiDrawer-paperAnchorRight.MuiDrawer-paper {
    background: rgba(230,232,235, 0.9) !important;
    height: 95% !important;
    top: 4% !important; /* Menyeimbangkan tinggi 95% agar ada jarak di atas & bawah */
    backdrop-filter: blur(20px) saturate(160%) !important;
    border-left: 2px solid #d4af37 !important;
    width: 420px !important;
    box-shadow: -15px 0 40px rgba(0,0,0,0.2) !important;
    color: #1a1c1e !important;
    overflow-x: hidden !important;
    overflow-y: auto !important; /* Memastikan bisa di-scroll jika konten panjang */
    padding: 30px 10px !important; /* Tambah padding atas untuk mobile juga */
    transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1) !important;
    border-radius: 20px 0 0 20px !important;
  }

  @media (max-width: 600px) {
    .MuiDrawer-paperAnchorRight.MuiDrawer-paper {
      width: 95% !important;
      height: 92% !important;
      top: 4% !important;
      left: 2.5% !important;   /* Memberikan jarak seimbang kiri */
      right: 2.5% !important;  /* Memberikan jarak seimbang kanan */
      transform: none !important; /* Menghilangkan paksaan geser ke kanan oleh MUI */
      padding: 30px 20px !important; /* Tambah padding atas untuk mobile juga */
      background: rgba(230,232,235, 0.75) !important;
      backdrop-filter: blur(15px) !important;
      border-left: none !important;
      border-top: 3px solid #d4af37 !important;
      border-radius: 15px !important; /* Agar lebih membulat di mobile */
      margin: 10px auto !important;
    }
  }

  /* Hilangkan garis pemisah default */
  .MuiDivider-root { display: none !important; }

  /* Typography - Cyber Style */
  .MuiTypography-h4 {
    font-size: 28px !important;
    font-weight: 900 !important;
    color: #1a1c1e !important;
    letter-spacing: -1px !important;
    text-transform: uppercase !important;
    border-left: 5px solid #d4af37 !important;
    padding-left: 15px !important;
    margin-bottom: 8px !important;
  }
  .MuiTypography-subtitle1 {
    font-size: 13px !important;
    color: #4a4d51 !important;
    margin-bottom: 35px !important;
    font-weight: 500 !important;
    padding-left: 20px !important;
    opacity: 0.8 !important;
  }

  /* Input Fields - Modern Soft Metal */
  .MuiFormControl-root {
    margin-bottom: 10px !important;
  }
  .MuiOutlinedInput-root {
    background: rgba(255,255,255,0.7) !important;
    border-radius: 12px !important; /* Dibuat lebih soft/melengkung */
    border: 1px solid rgba(0,0,0,0.05) !important;
    box-shadow: 0 4px 15px rgba(0,0,0,0.03) !important;
    transition: all 0.3s ease !important;
  }
  .MuiOutlinedInput-root fieldset { border: none !important; }
  
  .MuiOutlinedInput-root:hover {
    background: #fff !important;
    box-shadow: 0 6px 20px rgba(212, 175, 55, 0.1) !important;
    transform: translateY(-1px);
  }
  
  .MuiOutlinedInput-root.Mui-focused {
    background: #fff !important;
    border: 1.5px solid #d4af37 !important;
    box-shadow: 0 0 25px rgba(212, 175, 55, 0.2) !important;
  }

  .MuiInputLabel-root {
    color: #4a4d51 !important;
    font-weight: 700 !important;
    text-transform: uppercase !important;
    font-size: 11px !important;
    letter-spacing: 1px !important;
    margin-left: 5px !important;
  }
  .MuiInputLabel-root.Mui-focused {
    color: #d4af37 !important;
  }

  /* Cloudflare Wrapper */
  div:has(> iframe[src*="cloudflare"]) {
    background: rgba(255,255,255,0.4) !important;
    border-radius: 12px !important;
    padding: 10px !important;
    margin: 20px 0 !important;
    border: 1px dashed rgba(212, 175, 55, 0.3) !important;
  }
  
  iframe {
    width: 100% !important;
    height: 100% !important;
    border: none !important;
  }

  /* Login Button - Pill Industrial */
  .MuiButton-containedPrimary {
    background: #1a1c1e !important;
    color: #fff !important;
    border-radius: 12px !important; /* Disamakan dengan input agar harmoni */
    height: 52px !important;
    font-weight: 900 !important;
    text-transform: uppercase !important;
    letter-spacing: 2px !important;
    border: none !important;
    box-shadow: 0 10px 30px rgba(0,0,0,0.15) !important;
    transition: all 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275) !important;
  }
  .MuiButton-containedPrimary:hover {
    background: #d4af37 !important;
    box-shadow: 0 15px 35px rgba(212, 175, 55, 0.4) !important;
    transform: scale(1.02) !important;
  }

  /* Link Styles */
  .MuiTypography-caption a {
    color: #d4af37 !important;
    font-weight: 800 !important;
    text-decoration: none !important;
    border-bottom: 2px solid transparent !important;
    transition: all 0.2s !important;
  }
  .MuiTypography-caption a:hover {
    border-bottom-color: #d4af37 !important;
  }
  /* Material Symbols Icon Font Definition */
  @font-face {
    font-family: 'Material Symbols Outlined';
    font-style: normal;
    src: url(https://fonts.gstatic.com/s/materialsymbolsoutlined/v161/k3kWe63dGa9rr36iUDkz1S7C8_uw.woff2) format('woff2');
  }

  .ms {
    font-family: 'Material Symbols Outlined';
    font-weight: normal;
    font-style: normal;
    font-size: 24px;
    line-height: 1;
    letter-spacing: normal;
    text-transform: none;
    display: inline-block;
    white-space: nowrap;
    word-wrap: normal;
    direction: ltr;
    -webkit-font-feature-settings: 'liga';
    -webkit-font-smoothing: antialiased;
  }
`;
document.head.appendChild(style);

// Buat interval yang terus memeriksa dan mengganti elemen dekoratif
const intervalId = setInterval(() => {
  // Ganti gambar PersonLearn (Sembunyikan)
  const personLearnImage = document.querySelector('img[src*="PersonLearn-DbY26Ht3.png"]');
  if (personLearnImage) {
    personLearnImage.style.display = "none";
  }

  // Ganti Konten "Selamat Datang" & "Panduan" dengan Info Mentari Mod
  const welcomeText = document.querySelector(".MuiTypography-h4");
  if (welcomeText && welcomeText.innerText.includes("Selamat Datang")) {
    welcomeText.innerHTML = "Mentari Mod v2.0 Sunset <span style='font-size:14px; font-weight:500; display:block; margin-top:5px; color:#d4af37;'>The Ultimate Learning Assistant</span>";
  }

  const welcomeSub = document.querySelector(".MuiTypography-subtitle1");
  if (welcomeSub && welcomeSub.innerText.includes("Silakan masuk")) {
    welcomeSub.innerHTML = `Ekstensi ini dirancang untuk meningkatkan pengalaman belajar Anda di portal MENTARI UNPAM dengan fitur cerdas dan antarmuka premium.`;
  }

  // Sembunyikan panduan bawaan agar tidak berantakan
  const guideLinks = document.querySelectorAll(".MuiTypography-caption");
  guideLinks.forEach(link => {
    if (link && (link.innerText.includes("Panduan Penggunaan") || link.innerText.includes("Mahasiswa login") || link.innerText.includes("Dosen login"))) {
      link.style.display = "none";
    }
  });

  // Ganti logo Mentari
  const mentariLogo = document.querySelector('img[src*="MentariLogo-DfuWb4z9.png"]');
  if (mentariLogo) {
    mentariLogo.src = "https://github.com/user-attachments/assets/bc206a62-4b37-4064-a1af-872e7a157463";
    mentariLogo.style.width = "auto";
  }

  // Ganti background
  const bgImage = document.querySelector('img[src*="Background-Dt75uuh7.jpg"]');
  if (bgImage) {
    bgImage.src = chrome.runtime.getURL("src/assets/background.png");
    bgImage.style.width = "100%";
    bgImage.style.height = "100%";
    bgImage.style.objectFit = "cover";
    bgImage.style.objectPosition = "center";
  }

  // Tambahkan Info Author & Sosmed - Posisi Floating Kiri Bawah
  const loginForm = document.querySelector('form');
  if (loginForm && !document.getElementById('mentari-info-floating')) {
    const infoFloating = document.createElement('div');
    infoFloating.id = 'mentari-info-floating';
    infoFloating.style.cssText = `
      position: fixed;
      bottom: 25px;
      left: 25px;
      width: 280px;
      padding: 18px;
      background: rgba(230, 232, 235, 0.8);
      backdrop-filter: blur(15px);
      border-radius: 12px;
      border: 1px solid rgba(212, 175, 55, 0.3);
      box-shadow: 0 10px 30px rgba(0,0,0,0.1);
      z-index: 9999;
      transition: all 0.3s ease;
    `;
    infoFloating.innerHTML = `
      <div style="font-size:11px; color:#4a4d51; display:flex; flex-direction:column; gap:10px;">
        <div style="display:flex; justify-content:space-between; align-items:center;">
          <span style="opacity:0.6; font-weight:700; text-transform:uppercase; letter-spacing:1px;">Project</span>
          <span style="color:#1a1c1e; font-weight:800;">Mentari Mod v2.0 Sunset</span>
        </div>
        <div style="display:flex; justify-content:space-between; align-items:center;">
          <span style="opacity:0.6; font-weight:700; text-transform:uppercase; letter-spacing:1px;">Author</span>
          <span style="color:#d4af37; font-weight:800;"> <a href="https://github.com/Lukman754" target="_blank" style="color:#d4af37; text-decoration:none;">Lukman754</a></span>
        </div>
        <div style="display:flex; justify-content:space-between; align-items:center;">
          <span style="opacity:0.6; font-weight:700; text-transform:uppercase; letter-spacing:1px;">Connect</span>
          <div style="display:flex; gap:14px;">
            <a href="https://instagram.com/_.chopin" target="_blank" style="color:#d4af37; text-decoration:none;">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M7.8 2h8.4C19.4 2 22 4.6 22 7.8v8.4a5.8 5.8 0 0 1-5.8 5.8H7.8C4.6 22 2 19.4 2 16.2V7.8A5.8 5.8 0 0 1 7.8 2m-.2 2A3.6 3.6 0 0 0 4 7.6v8.8A3.6 3.6 0 0 0 7.6 20h8.8a3.6 3.6 0 0 0 3.6-3.6V7.6A3.6 3.6 0 0 0 16.4 4H7.6m4.4 3.5a4.5 4.5 0 1 1 0 9 4.5 4.5 0 0 1 0-9m0 2a2.5 2.5 0 1 0 0 5 2.5 2.5 0 0 0 0-5m5.2-2.15c.41 0 .75.34.75.75s-.34.75-.75.75-.75-.34-.75-.75.34-.75.75-.75Z"/></svg>
            </a>
            <a href="https://facebook.com/lukmanmauludin754" target="_blank" style="color:#d4af37; text-decoration:none;">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2.04c-5.5 0-10 4.49-10 10.02 0 5 3.66 9.15 8.44 9.9v-7h-2.54v-2.9h2.54V9.82c0-2.5 1.49-3.89 3.77-3.89 1.09 0 2.23.19 2.23.19v2.47h-1.26c-1.24 0-1.63.77-1.63 1.56v1.88h2.78l-.45 2.9h-2.33v7a10 10 0 0 0 8.44-9.9c0-5.53-4.5-10.02-10-10.02Z"/></svg>
            </a>
            <a href="https://github.com/Lukman754" target="_blank" style="color:#d4af37; text-decoration:none;">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2A10 10 0 0 0 2 12c0 4.42 2.87 8.17 6.84 9.5.5.08.66-.23.66-.5v-1.69c-2.77.6-3.36-1.34-3.36-1.34-.46-1.16-1.11-1.47-1.11-1.47-.91-.62.07-.6.07-.6 1 .07 1.53 1.03 1.53 1.03.87 1.52 2.34 1.07 2.91.83.09-.65.35-1.09.63-1.34-2.22-.25-4.55-1.11-4.55-4.92 0-1.11.38-2 1.03-2.71-.1-.25-.45-1.29.1-2.64 0 0 .84-.27 2.75 1.02.79-.22 1.65-.33 2.5-.33.85 0 1.71.11 2.5.33 1.91-1.29 2.75-1.02 2.75-1.02.55 1.35.2 2.39.1 2.64.65.71 1.03 1.6 1.03 2.71 0 3.82-2.34 4.66-4.57 4.91.36.31.69.92.69 1.85V21c0 .27.16.59.67.5C19.14 20.16 22 16.42 22 12A10 10 0 0 0 12 2Z"/></svg>
            </a>
          </div>
        </div>
      </div>
      <style>
        @media (max-width: 900px) {
          #mentari-info-floating { display: none !important; }
        }
      </style>
    `;
    document.body.appendChild(infoFloating);
  }

  // Hapus info top lama (jika ada) saat memindahkan posisi
  const oldTop = document.getElementById('mentari-info-top');
  if (oldTop) oldTop.remove();

  // Hapus footer info lama jika masih ada agar tidak duplikat
  const oldFooter = document.getElementById('mentari-info-footer');
  if (oldFooter) oldFooter.remove();

  // Fix line height pada teks info
  const h5Element = document.querySelector(".MuiTypography-root.MuiTypography-h5");
  if (h5Element) {
    h5Element.style.lineHeight = "0.334";
  }
}, 100);

console.log("Mentari Mod Home Redesign Active");

console.log("Mentari Mod Home Redesign Active");
