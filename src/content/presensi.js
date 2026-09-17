const Config = {
  APP_VERSION: "2.0 Sunset",
  STYLES: `
    @import url('https://fonts.googleapis.com/css2?family=Roboto:wght@400;500;700&display=swap');
    
    #mentari-presensi-popup {
      position: fixed; top: 0; left: 0; width: 100%; height: 100%;
      background: rgba(0,0,0,0.5); backdrop-filter: blur(5px);
      display: flex; justify-content: center; align-items: center;
      z-index: 10000; font-family: 'Roboto', sans-serif;
      animation: fadeIn 0.3s;
    }
    .presensi-content-container {
      background: #121212; color: #eee; width: 90%; max-width: 900px;
      max-height: 90vh; border-radius: 16px; border: 1px solid rgba(255,255,255,0.1);
      box-shadow: 0 15px 50px rgba(0,0,0,0.4); display: flex; flex-direction: column;
      overflow: hidden; position: relative;
    }
    
    /* Light Theme Adaptation */
    #mentari-presensi-popup.light-theme .presensi-content-container {
      background: #ffffff; color: #1a1c1e; border-color: rgba(0,0,0,0.1);
      box-shadow: 0 10px 40px rgba(0,0,0,0.1);
    }
    #mentari-presensi-popup.light-theme .popup-header { background: #f8f9fa; border-bottom-color: rgba(0,0,0,0.08); }
    #mentari-presensi-popup.light-theme .popup-title { color: #0d47a1; }
    #mentari-presensi-popup.light-theme .course-card { background: #ffffff; border-color: rgba(0,0,0,0.08); }
    #mentari-presensi-popup.light-theme .course-card-header { background: #f2f2f2; }
    #mentari-presensi-popup.light-theme .course-card-header h2 { color: #0d47a1; }
    #mentari-presensi-popup.light-theme .item-row { background: #f1f1f1; border-color: rgba(0,0,0,0.06); }
    #mentari-presensi-popup.light-theme .item-row:hover { background: #f8fafc!important; }
    #mentari-presensi-popup.light-theme .item-title { color: #334155; }
    #mentari-presensi-popup.light-theme .item-meta { color: #64748b; }
    #mentari-presensi-popup.light-theme .popup-footer { background: #f8f9fa; border-top-color: rgba(0,0,0,0.08); }
    
    .popup-header { padding: 18px 24px; background: rgba(255,255,255,0.02); border-bottom: 1px solid rgba(255,255,255,0.06); display: flex; justify-content: space-between; align-items: center; }
    .popup-title { font-weight: 700; font-size: 18px; color: #3d99e3; margin: 0; display: flex; align-items: center; gap: 8px; }
    .popup-close-btn { background: none; border: none; color: inherit; opacity: 0.5; cursor: pointer; transition: 0.2s; }
    .popup-close-btn:hover { opacity: 1; transform: rotate(90deg); }
    
    .presensi-scroll-area { flex: 1; overflow-y: auto; padding: 20px; box-sizing: border-box; }
    .popup-footer { padding: 16px 24px; background: rgba(255,255,255,0.02); border-top: 1px solid rgba(255,255,255,0.06); display: flex; justify-content: space-between; align-items: center; font-size: 12px; }
    
    .course-card { margin-bottom: 20px; border: 1px solid rgba(255,255,255,0.08); border-radius: 12px; overflow: hidden; background: rgba(255,255,255,0.01); }
    .course-card-header { padding: 14px 20px; background: rgba(255,255,255,0.04); display: flex; justify-content: space-between; align-items: center; border-bottom: 1px solid rgba(255,255,255,0.05); }
    .course-card-header h2 { margin: 0; font-size: 14px; color: #3d99e3; font-weight: 700; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; max-width: 70%; }
    .course-percentage { font-size: 12px; font-weight: 700; padding: 4px 10px; border-radius: 20px; }
    
    .item-row { display: flex; align-items: center; gap: 12px; padding: 12px 16px; border-radius: 10px; margin-bottom: 8px; background: rgba(255,255,255,0.03); border: 1px solid rgba(255,255,255,0.05); transition: all 0.2s; position: relative; }
    .item-row:hover { background: rgba(255,255,255,0.06)!important; transform: translateX(5px); }
    .item-row:hover .item-title { color: #f0872d; }
    #mentari-presensi-popup.light-theme .item-row:hover .item-title { color: #ff7b00; }
    
    .item-icon { width: 34px; height: 34px; border-radius: 8px; display: flex; align-items: center; justify-content: center; flex-shrink: 0; font-size: 16px; font-weight: 800; }
    .icon-hadir { background: rgba(121, 187, 124, 0.1); color: #79bb7c; }
    .icon-tidak-hadir { background: rgba(244, 67, 54, 0.1); color: #f44336; }
    
    .item-info { flex: 1; }
    .item-title { font-size: 13px; font-weight: 600; color: #eee; margin-bottom: 2px; display: block; }
    .item-meta { font-size: 10px; opacity: 0.5; display: flex; align-items: center; gap: 8px; }
    
    .ms { font-family: 'Material Symbols Rounded'; font-size: 20px; font-style: normal; font-weight: normal; line-height: 1; display: inline-flex; align-items: center; vertical-align: middle; }
    
    .info-bar { display: grid; grid-template-columns: repeat(auto-fit, minmax(150px, 1fr)); gap: 12px; margin-bottom: 20px; }
    .info-card { background: rgba(255,255,255,0.03); border: 1px solid rgba(255,255,255,0.06); padding: 12px; border-radius: 12px; }
    .info-label { font-size: 9px; text-transform: uppercase; opacity: 0.5; margin-bottom: 4px; font-weight: 700; letter-spacing: 0.5px; }
    .info-value { font-size: 13px; font-weight: 700; }
    
    .presensi-btn, .quick-survey-trigger { 
      background: #1e293b; color: white; border: none; border-radius: 50px; 
      width: 42px; height: 42px; display: flex; align-items: center; justify-content: center;
      cursor: pointer; transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
      box-shadow: 0 4px 15px rgba(0,0,0,0.2); position: relative;
    }
    .presensi-btn:hover, .quick-survey-trigger:hover { 
      background: #3d99e3; transform: translateY(-4px) scale(1.1); 
      box-shadow: 0 8px 25px rgba(61, 153, 227, 0.4);
    }
    
    /* Tooltip */
    .presensi-btn::after, .quick-survey-trigger::after {
      content: attr(data-title);
      position: absolute; bottom: 50px; left: 0;
      background: #1e293b; color: white; padding: 6px 12px; border-radius: 6px;
      font-size: 11px; white-space: nowrap; opacity: 0; pointer-events: none;
      transition: 0.2s; font-weight: 700;
      box-shadow: 0 4px 15px rgba(0,0,0,0.3);
    }
    .presensi-btn:hover::after, .quick-survey-trigger:hover::after { opacity: 1; bottom: 55px; }
    
    #mentari-presensi-popup.light-theme .presensi-btn, 
    #mentari-presensi-popup.light-theme .quick-survey-trigger {
      background: #ffffff; color: #1e293b; 
      box-shadow: 0 4px 15px rgba(0,0,0,0.1);
    }
    
    #presensi-loading { position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: rgba(0,0,0,0.6); backdrop-filter: blur(5px); z-index: 10001; display: flex; align-items: center; justify-content: center; }
    .loading-card { background: #1a1a1a; padding: 30px; border-radius: 20px; border: 1px solid rgba(255,255,255,0.1); text-align: center; color: white; box-shadow: 0 10px 40px rgba(0,0,0,0.5); }
    .spinner { width: 40px; height: 40px; border: 3px solid rgba(61, 153, 227, 0.1); border-top: 3px solid #3d99e3; border-radius: 50%; animation: spin 1s linear infinite; margin: 0 auto 15px; }
    .presensi-notice {
      background: rgba(255, 123, 0, 0.08); border: 1px solid rgba(255, 123, 0, 0.2);
      border-radius: 12px; padding: 12px 16px; font-size: 11px; color: #f0872d;
      margin-bottom: 20px; line-height: 1.5; display: flex; gap: 12px; align-items: flex-start;
    }
    .presensi-notice .ms { font-size: 18px; flex-shrink: 0; margin-top: 2px; }
    
    @keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }
    @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
  `
};

const Utils = {
  formatDate(d) { if (!d) return "-"; try { return new Date(d).toLocaleString("id-ID", { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' }); } catch(e) { return d; } },
  formatDateSimple(d) { if (!d) return "-"; try { return new Date(d).toLocaleString("id-ID", { day: 'numeric', month: 'short', year: 'numeric' }); } catch(e) { return d; } },
  injectMaterialIcons() {
    if (document.getElementById("ms-presensi-icons")) return;
    const l = document.createElement("link"); l.id = "ms-presensi-icons"; l.rel = "stylesheet";
    l.href = "https://fonts.googleapis.com/css2?family=Material+Symbols+Rounded:opsz,wght,FILL,GRAD@20,400,0,0";
    document.head.appendChild(l);
  }
};

const UIRenderer = {
  injectStyles() {
    const s = document.createElement("style"); s.id = "mentari-presensi-styles";
    s.textContent = Config.STYLES; document.head.appendChild(s);
  },
  
  showMainPopup(data) {
    const m = data.mahasiswa;
    const isLight = document.querySelector(".css-1yxmbwk") !== null;
    
    let popup = document.getElementById("mentari-presensi-popup");
    if (popup) popup.remove();
    
    popup = document.createElement("div");
    popup.id = "mentari-presensi-popup";
    if (isLight) popup.classList.add("light-theme");
    
    let totalPertemuan = 0, totalHadir = 0;
    data.forEach(d => {
      totalPertemuan += (d.pertemuan || []).length;
      totalHadir += (d.pertemuan || []).filter(p => p.presensi_status === "hadir").length;
    });
    const avgPercent = totalPertemuan > 0 ? ((totalHadir / totalPertemuan) * 100).toFixed(1) : 0;
    
    popup.innerHTML = `
      <div class="presensi-content-container">
        <div class="popup-header">
          <div class="popup-title"><span class="ms" style="color:#f0872d; font-size:24px;">fact_check</span> Ringkasan Presensi</div>
          <button class="popup-close-btn" id="p-close-btn"><span class="ms">close</span></button>
        </div>
        
        <div class="presensi-scroll-area">
          <div class="presensi-notice">
            <span class="ms">campaign</span>
            <div>
              <strong>Info Transparansi:</strong> Jika ada mata kuliah yang tidak muncul, ini berarti data presensi mata kuliah tersebut belum diterbitkan atau memang tidak dibuka oleh dosen yang bersangkutan melalui sistem My Unpam.
            </div>
          </div>
          
          <div class="info-bar">
            <div class="info-card"><div class="info-label">MAHASISWA</div><div class="info-value">${m.nama_mahasiswa}</div></div>
            <div class="info-card"><div class="info-label">NIM</div><div class="info-value">${m.nim}</div></div>
            <div class="info-card"><div class="info-label">SEMESTER</div><div class="info-value">${m.nama_semester_registrasi}</div></div>
            <div class="info-card" style="background: rgba(61,153,227,0.05); border-color:#3d99e3;">
              <div class="info-label" style="color:#3d99e3;">TOTAL KEHADIRAN</div>
              <div class="info-value" style="color:#3d99e3; font-size:16px;">${avgPercent}%</div>
            </div>
          </div>
          
          <div id="p-course-list">
            ${data.map((c, i) => this.renderCourseCard(c, i)).join("")}
          </div>
        </div>
        
        <div class="popup-footer">
          <div style="opacity:0.6;">v${Config.APP_VERSION} • Data real-time My Unpam</div>
          <div style="font-weight:700; color:#3d99e3;">${data.length} Mata Kuliah</div>
        </div>
      </div>
    `;
    
    document.body.appendChild(popup);
    document.getElementById("p-close-btn").onclick = () => popup.remove();
    popup.onclick = (e) => { if (e.target === popup) popup.remove(); };
    
    // Add detail click events
    data.forEach((c, i) => {
      document.getElementById(`p-course-${i}`).onclick = () => this.showDetailPopup(c);
    });
  },
  
  renderCourseCard(c, idx) {
    const total = (c.pertemuan || []).length;
    const hadir = (c.pertemuan || []).filter(p => p.presensi_status === "hadir").length;
    const percent = total > 0 ? ((hadir / total) * 100).toFixed(0) : 0;
    
    let color = "#f44336", bg = "rgba(244,67,54,0.1)";
    if (percent >= 85) { color = "#79bb7c"; bg = "rgba(121,187,124,0.1)"; }
    else if (percent >= 75) { color = "#3d99e3"; bg = "rgba(61,153,227,0.1)"; }
    else if (percent >= 50) { color = "#f0872d"; bg = "rgba(240,135,45,0.1)"; }
    
    return `
      <div class="course-card" id="p-course-${idx}" style="cursor:pointer;">
        <div class="course-card-header">
          <h2>${c.nama_mata_kuliah}</h2>
          <div class="course-percentage" style="color:${color}; background:${bg};">${percent}%</div>
        </div>
        <div style="padding:12px 20px; display:flex; gap:20px; font-size:11px; opacity:0.8;">
          <div><span style="opacity:0.6;">SKS:</span> <b>${c.sks || 3}</b></div>
          <div><span style="opacity:0.6;">Hadir:</span> <b style="color:#79bb7c;">${hadir}</b></div>
          <div><span style="opacity:0.6;">Mangkir:</span> <b style="color:#f44336;">${total - hadir}</b></div>
          <div style="margin-left:auto; display:flex; align-items:center; color:#3d99e3;">Lihat Detail <span class="ms" style="font-size:14px;">chevron_right</span></div>
        </div>
      </div>
    `;
  },
  
  showDetailPopup(c) {
    const isLight = document.querySelector(".css-1yxmbwk") !== null;
    const container = document.createElement("div");
    container.id = "p-detail-subpopup";
    container.style.cssText = "position:absolute; top:0; left:0; width:100%; height:100%; background:inherit; z-index:10; display:flex; flex-direction:column; animation:slideIn 0.3s cubic-bezier(0.4, 0, 0.2, 1);";
    
    if (isLight) container.classList.add("light-theme");
    
    container.innerHTML = `
      <div class="popup-header" style="background:transparent; border:none;">
        <button class="popup-close-btn" id="pd-back-btn" style="opacity:1; display:flex; align-items:center; gap:4px; font-weight:700; color:#3d99e3;">
          <span class="ms">arrow_back</span> Kembali
        </button>
        <div class="popup-title" style="font-size:14px; opacity:0.8;">${c.nama_mata_kuliah}</div>
        <div style="width:50px;"></div>
      </div>
      
      <div class="presensi-scroll-area">
        ${(c.pertemuan || []).reverse().map((p, i) => `
          <div class="item-row">
            <div class="item-icon ${p.presensi_status === 'hadir' ? 'icon-hadir' : 'icon-tidak-hadir'}">
              <span class="ms">${p.presensi_status === 'hadir' ? 'check_circle' : 'cancel'}</span>
            </div>
            <div class="item-info">
              <span class="item-title">Pertemuan ${c.pertemuan.length - i} - ${p.jenis_perkuliahan || 'Perkuliahan'}</span>
              <div class="item-meta">
                <span><span class="ms" style="font-size:12px;">event</span> ${Utils.formatDateSimple(p.tanggal_mulai)}</span>
                ${p.presensi_date ? `<span><span class="ms" style="font-size:12px;">history</span> ${Utils.formatDate(p.presensi_date)}</span>` : ""}
              </div>
            </div>
            <div style="font-size:10px; font-weight:700; text-transform:uppercase; color:${p.presensi_status === 'hadir' ? '#79bb7c' : '#f44336'}">
              ${p.presensi_status || 'Tidak Hadir'}
            </div>
          </div>
        `).join("")}
      </div>
      
      <style>
        @keyframes slideIn { from { transform: translateX(30px); opacity: 0; } to { transform: translateX(0); opacity: 1; } }
      </style>
    `;
    
    const root = document.querySelector(".presensi-content-container");
    root.appendChild(container);
    document.getElementById("pd-back-btn").onclick = () => container.remove();
  },
  
  showLoading() {
    const l = document.createElement("div"); l.id = "presensi-loading";
    l.innerHTML = `
      <div class="loading-card">
        <div class="spinner"></div>
        <div style="font-weight:700; font-size:16px; margin-bottom:4px;">Sinkronisasi Presensi</div>
        <div style="opacity:0.5; font-size:12px;">Menghubungkan ke portal akademik...</div>
      </div>
    `;
    document.body.appendChild(l);
    return l;
  },
  
  hideLoading() { document.getElementById("presensi-loading")?.remove(); },
  
  addTrigger() {
    if (document.getElementById("p-trigger-btn")) return;
    const b = document.createElement("button");
    b.id = "p-trigger-btn";
    b.className = "presensi-btn";
    b.setAttribute("data-title", "Lihat Presensi Keseluruhan");
    b.style.cssText = "position:fixed; bottom:20px; left:20px; z-index:9999;";
    b.innerHTML = `<span class="ms">fact_check</span>`;
    b.onclick = async () => {
      b.disabled = true;
      b.innerHTML = `<div class="spinner" style="width:14px; height:14px; border-width:2px; margin:0;"></div> Memuat...`;
      this.showLoading();
      try {
        await fetchAllPresensiData();
      } catch (e) {
        console.error(e);
        alert("Gagal memuat data presensi.");
      } finally {
        this.hideLoading();
        b.disabled = false;
        b.innerHTML = `<span class="ms">fact_check</span>`;
      }
    };
    document.body.appendChild(b);
  }
};

// Update existing functions to use new UIRenderer
function showPresensiTable(data) { UIRenderer.showMainPopup(data); }
function showLoadingSpinner() { return UIRenderer.showLoading(); }
function hideLoadingSpinner() { UIRenderer.hideLoading(); }
function addFloatingButton() { UIRenderer.addTrigger(); }

// Initialize styles
Utils.injectMaterialIcons();
UIRenderer.injectStyles();

// Original core logic follows...
async function fetchAllPresensiData() {
  const token = await getAuthToken();
  if (!token) {
    console.error("Token tidak ditemukan.");
    showPopupMessage("Error: Token tidak ditemukan", "error");
    return null;
  }

  try {
    const jadwalKuliah = await fetchJadwalKuliah(token);
    if (!jadwalKuliah || !jadwalKuliah.length) {
      showPopupMessage("Tidak ada jadwal kuliah yang ditemukan", "error");
      return null;
    }

    const mahasiswaInfo = {
      nim: jadwalKuliah[0].nim,
      nama_mahasiswa: jadwalKuliah[0].nama_mahasiswa,
      id_semester_registrasi: jadwalKuliah[0].id_semester_registrasi,
      nama_semester_registrasi: jadwalKuliah[0].nama_semester_registrasi,
    };

    const allPresensiData = [];
    for (const jadwal of jadwalKuliah) {
      const { id_kelas, id_mata_kuliah, nama_mata_kuliah, sks } = jadwal;
      try {
        const presensiData = await fetchPresensiPertemuan(token, id_kelas, id_mata_kuliah);
        allPresensiData.push({
          nama_mata_kuliah,
          id_mata_kuliah,
          id_kelas,
          sks,
          pertemuan: presensiData,
        });
      } catch (error) {
        console.error(`Gagal mengambil data untuk ${nama_mata_kuliah}`);
      }
    }

    allPresensiData.mahasiswa = mahasiswaInfo;
    showPresensiTable(allPresensiData);
    return allPresensiData;
  } catch (error) {
    console.error("Kesalahan fetch:", error);
    showPopupMessage("Terjadi kesalahan saat mengambil data", "error");
    return null;
  }
}


// Fungsi untuk menampilkan pesan popup
function showPopupMessage(message, type = "info") {
  const popup = document.createElement("div");
  popup.style.cssText = `
    position: fixed;
    top: 20px;
    right: 20px;
    padding: 15px 20px;
    border-radius: 5px;
    font-size: 14px;
    z-index: 10000;
    box-shadow: 0 2px 10px rgba(0, 0, 0, 0.2);
    background-color: ${type === "error" ? "#f44336" : "#4CAF50"};
    color: white;
  `;

  popup.textContent = message;
  document.body.appendChild(popup);

  setTimeout(() => {
    document.body.removeChild(popup);
  }, 5000);
}

// Fungsi untuk membersihkan token dari prefix yang tidak diperlukan
function cleanToken(token) {
  // Hapus prefix "__q_strn|" jika ada
  if (token && token.includes("__q_strn|")) {
    return token.split("__q_strn|")[1];
  }
  return token;
}

// Fungsi untuk mendapatkan token autentikasi
async function getAuthToken() {
  // Cek token di localStorage dan sessionStorage
  const localStorageKeys = Object.keys(localStorage);
  const sessionStorageKeys = Object.keys(sessionStorage);

  // Array untuk menyimpan kemungkinan token
  let possibleTokens = [];

  // Periksa localStorage
  for (const key of localStorageKeys) {
    let value = localStorage.getItem(key);
    if (
      value &&
      (value.includes("eyJ") ||
        key.toLowerCase().includes("token") ||
        key.toLowerCase().includes("auth"))
    ) {
      value = cleanToken(value);
      possibleTokens.push({ source: "localStorage", key: key, value: value });
    }
  }

  // Periksa sessionStorage
  for (const key of sessionStorageKeys) {
    let value = sessionStorage.getItem(key);
    if (
      value &&
      (value.includes("eyJ") ||
        key.toLowerCase().includes("token") ||
        key.toLowerCase().includes("auth"))
    ) {
      value = cleanToken(value);
      possibleTokens.push({ source: "sessionStorage", key: key, value: value });
    }
  }

  // Periksa cookies
  const cookies = document.cookie.split(";");
  for (const cookie of cookies) {
    const [key, value] = cookie.trim().split("=");
    if (
      value &&
      (value.includes("eyJ") ||
        key.toLowerCase().includes("token") ||
        key.toLowerCase().includes("auth"))
    ) {
      const cleanedValue = cleanToken(decodeURIComponent(value));
      possibleTokens.push({
        source: "cookie",
        key: key,
        value: cleanedValue,
      });
    }
  }

  // Cek jika ada global token dari monitor network requests
  if (window.lastAuthToken) {
    const cleanedToken = cleanToken(window.lastAuthToken);
    possibleTokens.push({
      source: "networkMonitor",
      key: "lastAuthToken",
      value: cleanedToken,
    });
  }

  if (possibleTokens.length > 0) {
    console.log("Token ditemukan");
    return possibleTokens[0].value;
  } else {
    console.log("Tidak ada token ditemukan. Mengaktifkan monitoring...");
    monitorNetworkRequests();
    return null;
  }
}

// Fungsi untuk memonitor network requests
function monitorNetworkRequests() {
  console.log("Mengaktifkan monitoring network requests...");

  // Monitor fetch requests
  const originalFetch = window.fetch;
  window.fetch = function (...args) {
    const request = args[0];
    if (args[1] && args[1].headers) {
      const headers = args[1].headers;
      // Periksa jika headers adalah Headers object atau plain object
      if (headers instanceof Headers) {
        if (headers.has("authorization") || headers.has("Authorization")) {
          const authHeader =
            headers.get("authorization") || headers.get("Authorization");
          if (authHeader.startsWith("Bearer ")) {
            const token = authHeader.substring(7);
            window.lastAuthToken = cleanToken(token);
          }
        }
      } else {
        // Plain object
        if (headers.authorization || headers.Authorization) {
          const authHeader = headers.authorization || headers.Authorization;
          if (
            typeof authHeader === "string" &&
            authHeader.startsWith("Bearer ")
          ) {
            const token = authHeader.substring(7);
            window.lastAuthToken = cleanToken(token);
          }
        }
      }
    }
    return originalFetch.apply(this, args);
  };
}

// Fungsi untuk fetch data jadwal kuliah
async function fetchJadwalKuliah(token) {
  try {
    // Dapatkan XSRF token jika ada
    let xsrfToken = "";
    const xsrfCookie = document.cookie
      .split(";")
      .find((c) => c.trim().startsWith("XSRF-TOKEN="));
    if (xsrfCookie) {
      xsrfToken = decodeURIComponent(xsrfCookie.split("=")[1]);
    }

    // Fetch data jadwal kuliah
    const response = await fetch(
      "https://my.unpam.ac.id/api/presensi/mahasiswa/jadwal-kuliah",
      {
        method: "GET",
        headers: {
          accept: "application/json, text/plain, */*",
          authorization: `Bearer ${token}`,
          "x-xsrf-token": xsrfToken,
        },
        credentials: "include",
      }
    );

    // Periksa apakah response berhasil
    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}`);
    }

    // Parse response menjadi JSON
    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Error fetching jadwal kuliah:", error);
    throw error;
  }
}

// Fungsi untuk fetch data presensi pertemuan
async function fetchPresensiPertemuan(token, idKelas, idMataKuliah) {
  try {
    // Dapatkan XSRF token jika ada
    let xsrfToken = "";
    const xsrfCookie = document.cookie
      .split(";")
      .find((c) => c.trim().startsWith("XSRF-TOKEN="));
    if (xsrfCookie) {
      xsrfToken = decodeURIComponent(xsrfCookie.split("=")[1]);
    }

    // URL untuk mengambil data presensi
    const url = `https://my.unpam.ac.id/api/presensi/mahasiswa/jadwal-pertemuan/${idKelas}/${idMataKuliah}`;

    // Fetch data presensi
    const response = await fetch(url, {
      method: "GET",
      headers: {
        accept: "application/json, text/plain, */*",
        authorization: `Bearer ${token}`,
        "x-xsrf-token": xsrfToken,
      },
      credentials: "include",
    });

    // Periksa apakah response berhasil
    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}`);
    }

    // Parse response menjadi JSON
    const data = await response.json();
    return data;
  } catch (error) {
    console.error(
      `Error fetching data presensi untuk kelas ${idKelas}, mata kuliah ${idMataKuliah}:`,
      error
    );
    throw error;
  }
}

// Jalankan fungsi utama
console.log("=== SCRIPT UNTUK MENDAPATKAN DATA PRESENSI UNPAM ===");
console.log("Memulai proses pengambilan data...");

// Tambahkan tombol floating untuk menjalankan script
addFloatingButton();
monitorNetworkRequests();

// Tambahkan event listener untuk auto-restart script saat token ditemukan
window.addEventListener("storage", function (e) {
  if (
    e.key.toLowerCase().includes("token") ||
    e.key.toLowerCase().includes("auth")
  ) {
    console.log("Token storage berubah, mencoba menjalankan script kembali");
    fetchAllPresensiData();
  }
});
