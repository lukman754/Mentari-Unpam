console.log("Token.js sedang dijalankan!");

// Versi aplikasi - Diperbarui secara manual saat rilis baru
const APP_VERSION = "1.9";

// Inisialisasi UI dan logic token
(function () {
  // Nama kunci untuk localStorage
  const STORAGE_KEYS = {
    AUTH_TOKEN: "mentari_auth_token",
    USER_INFO: "mentari_user_info",
    COURSE_DATA: "mentari_course_data",
    LAST_UPDATE: "mentari_last_update",
    VERSION_CHECK: "mentari_version_check",
    LAST_VERSION_CHECK: "mentari_last_version_check",
    VERSION_STATUS: "mentari_version_status",
  };

  // Hapus cache status versi untuk memastikan pemeriksaan versi baru
  localStorage.removeItem(STORAGE_KEYS.VERSION_STATUS);
  localStorage.removeItem(STORAGE_KEYS.LAST_VERSION_CHECK);
  console.log("Cache status versi dihapus untuk memastikan pemeriksaan baru");

  let authToken = null;
  let isHandlingCourseApiRequest = false;
  let courseDataList = [];
  let userInfo = null;
  let studentDataList = [];
  let lecturerNotifications = [];

  // Fungsi untuk menyimpan data ke localStorage
  function saveToLocalStorage(key, data) {
    try {
      localStorage.setItem(key, JSON.stringify(data));
      console.log(`Data berhasil disimpan ke ${key}`);
    } catch (error) {
      console.error(`Error menyimpan data ke ${key}:`, error);
    }
  }

  // Fungsi untuk mengambil data dari localStorage
  function getFromLocalStorage(key) {
    try {
      const data = localStorage.getItem(key);
      return data ? JSON.parse(data) : null;
    } catch (error) {
      console.error(`Error mengambil data dari ${key}:`, error);
      return null;
    }
  }

  // Fungsi untuk menghapus cache data
  window.clearCacheData = function () {
    localStorage.removeItem(STORAGE_KEYS.COURSE_DATA);
    localStorage.removeItem(STORAGE_KEYS.LAST_UPDATE);
    console.log(
      "Cache data berhasil dihapus. Refresh halaman untuk mengambil data baru."
    );
  };

  // Fungsi untuk mendapatkan versi saat ini
  function getCurrentVersion() {
    console.log("Current app version:", APP_VERSION);
    return APP_VERSION;
  }

  // Fungsi untuk kompatibilitas (async version)
  async function fetchManifestVersionAsync() {
    return APP_VERSION;
  }

  // Fungsi untuk memeriksa versi terbaru dari GitHub
  async function checkLatestVersion() {
    try {
      const response = await fetch(
        "https://api.github.com/repos/lukman754/Mentari-Unpam/releases/latest"
      );
      if (!response.ok)
        throw new Error(`HTTP error! status: ${response.status}`);

      const data = await response.json();
      return {
        version: data.tag_name.replace("v", ""), // Remove 'v' prefix
        html_url: data.html_url,
        published_at: data.published_at,
      };
    } catch (error) {
      console.error("Error checking latest version:", error);
      return null;
    }
  }

  // Fungsi untuk membandingkan versi
  function compareVersions(currentVersion, latestVersion) {
    console.log(
      "compareVersions dipanggil dengan:",
      currentVersion,
      latestVersion
    );

    // Pastikan versi dengan 2 angka ditambahkan 0 di belakangnya
    let currentNormalized = currentVersion;
    let latestNormalized = latestVersion;

    // Jika hanya ada 2 angka (1 titik), tambahkan .0 di belakangnya
    if ((currentVersion.match(/\./g) || []).length === 1) {
      currentNormalized = currentVersion + ".0";
      console.log("currentVersion dinormalisasi menjadi:", currentNormalized);
    }
    if ((latestVersion.match(/\./g) || []).length === 1) {
      latestNormalized = latestVersion + ".0";
      console.log("latestVersion dinormalisasi menjadi:", latestNormalized);
    }

    // Hapus titik dan gabungkan angka
    const currentNum = parseInt(currentNormalized.replace(/\./g, ""));
    const latestNum = parseInt(latestNormalized.replace(/\./g, ""));

    console.log("Nilai numerik setelah konversi:", currentNum, latestNum);

    // Bandingkan angka gabungan
    if (currentNum < latestNum) {
      console.log("Hasil: Current is older (-1)");
      return -1; // Current is older
    }
    if (currentNum > latestNum) {
      console.log("Hasil: Current is newer (1)");
      return 1; // Current is newer
    }

    console.log("Hasil: Versions are equal (0)");
    return 0; // Versions are equal
  }

  // Fungsi untuk menampilkan notifikasi status versi
  function showVersionStatusNotification(status, latestVersion = null) {
    // Don't show notification if there's no update available
    if (status !== "update-available" || !latestVersion) {
      console.log("Tidak ada pembaruan tersedia atau versi tidak valid");
      return;
    }

    const notification = document.createElement("div");
    notification.id = "version-status-notification";

    let message = `Update tersedia! Versi terbaru: v${latestVersion}`;
    let icon = "fas fa-sync-alt";
    let bgColor = "rgba(121, 187, 124, 0.9)";

    notification.innerHTML = `
      <div class="version-status-content">
        <div class="update-header">
          <div class="header-left">
            <div class="status-icon">
              <i class="${icon}"></i>
            </div>
            <div class="update-title">Pembaruan Tersedia</div>
          </div>
          <button class="close-status" title="Tutup">×</button>
        </div>
        <div class="update-body">
          <p>Versi terbaru <strong>Mentari Mod v${latestVersion}</strong> sudah tersedia! Pembaruan ini berisi perbaikan bug dan peningkatan performa.</p>
          ${
            status === "update-available"
              ? `
            <div class="update-actions">
              <a href="https://github.com/lukman754/Mentari-Unpam/releases/latest" target="_blank" class="download-btn">
                <i class="fas fa-download"></i> Unduh Pembaruan
              </a>
              <button class="later-btn">
                Nanti Saja
              </button>
            </div>
          `
              : ""
          }
        </div>
      </div>
    `;

    // Add event listeners
    notification
      .querySelector(".close-status")
      .addEventListener("click", function () {
        notification.remove();
      });

    const laterBtn = notification.querySelector(".later-btn");
    if (laterBtn) {
      laterBtn.addEventListener("click", function () {
        notification.remove();
      });
    }

    // Add styles for status notification
    if (!document.getElementById("version-status-styles")) {
      const style = document.createElement("style");
      style.id = "version-status-styles";
      style.textContent = `

        #version-status-notification {
          position: fixed;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
          width: 500px;
          max-width: 90%;
          z-index: 10001;
          animation: fadeIn 0.3s ease-out;
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, 'Open Sans', 'Helvetica Neue', sans-serif;
          border-radius: 12px;
          overflow: hidden;
          box-shadow: 0 10px 40px rgba(0, 0, 0, 0.3);
        }
        
        .version-status-content {
          display: flex;
          flex-direction: column;
          background: #1e1e1e;
          color: #ffffff;
        }
        
        .update-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 20px;
          background: #2a2a2a;
          border-bottom: 1px solid #3a3a3a;
        }

        .header-left {
          display: flex;
          align-items: center;
          gap: 12px;
        }
        
        .status-icon {
          width: 36px;
          height: 36px;
          border-radius: 8px;
          background: rgba(121, 187, 124, 0.15);
          display: flex;
          align-items: center;
          justify-content: center;
        }
        
        .status-icon i {
          color: #79bb7c;
          font-size: 16px;
        }
        
        .update-title {
          font-size: 18px;
          font-weight: 600;
          color: #fff;
        }
        
        .update-body {
          padding: 20px;
          background: #1e1e1e;
        }
        
        .update-body p {
          margin: 0 0 24px 0;
          color: #e0e0e0;
          font-size: 15px;
          line-height: 1.6;
        }
        
        .update-actions {
          display: flex;
          gap: 12px;
          justify-content: flex-end;
        }
        
        .download-btn, .later-btn {
          padding: 10px 20px;
          border-radius: 6px;
          font-size: 14px;
          font-weight: 500;
          cursor: pointer;
          transition: all 0.2s ease;
          text-decoration: none;
          border: none;
          display: inline-flex;
          align-items: center;
          gap: 8px;
        }
        
        .download-btn {
          background: #79bb7c;
          color: #1e1e1e;
        }
        
        .download-btn:hover {
          background: #6aaa6d;
          transform: translateY(-1px);
        }
        
        .later-btn {
          background: #2a2a2a;
          color: #e0e0e0;
          border: 1px solid #3a3a3a;
        }
        
        .later-btn:hover {
          background: #333;
        }
        
        .close-status {
          background: none;
          border: none;
          color: #999;
          font-size: 24px;
          line-height: 1;
          cursor: pointer;
          padding: 4px;
          width: 32px;
          height: 32px;
          display: flex;
          align-items: center;
          justify-content: center;
          border-radius: 6px;
          transition: all 0.2s ease;
        }
        
        .close-status:hover {
          background: rgba(255, 255, 255, 0.1);
          color: #fff;
        }
      `;
      document.head.appendChild(style);
    }

    document.body.appendChild(notification);
  }

  // Fungsi untuk auto check update setiap 6 jam
  async function autoCheckUpdate() {
    try {
      const lastCheck = localStorage.getItem(STORAGE_KEYS.LAST_VERSION_CHECK);
      const now = Date.now();
      const sixHours = 6 * 60 * 60 * 1000; // 6 jam dalam milliseconds

      // Check if 6 hours have passed since last check
      if (lastCheck && now - parseInt(lastCheck) < sixHours) {
        return; // Not time to check yet
      }

      console.log("Auto checking for updates...");
      const latestVersionInfo = await checkLatestVersion();

      if (latestVersionInfo) {
        const currentVersion = getCurrentVersion();
        if (typeof currentVersion === "string") {
          // Debug log untuk melihat versi yang dibandingkan
          console.log("Debug - Versi yang dibandingkan:");
          console.log("APP_VERSION:", currentVersion);
          console.log("GitHub Version:", latestVersionInfo.version);

          const comparison = compareVersions(
            currentVersion,
            latestVersionInfo.version
          );

          // Debug log untuk hasil perbandingan
          console.log("Hasil perbandingan:", comparison);
          console.log(
            "Nilai numerik APP_VERSION:",
            parseInt(currentVersion.replace(/\./g, ""))
          );
          console.log(
            "Nilai numerik GitHub Version:",
            parseInt(latestVersionInfo.version.replace(/\./g, ""))
          );

          // Save check time
          localStorage.setItem(STORAGE_KEYS.LAST_VERSION_CHECK, now.toString());

          if (
            comparison < 0 &&
            latestVersionInfo &&
            latestVersionInfo.version
          ) {
            // Update available and version is valid
            showVersionStatusNotification(
              "update-available",
              latestVersionInfo.version
            );
            // Save version status
            saveToLocalStorage(STORAGE_KEYS.VERSION_STATUS, {
              status: "update-available",
              latestVersion: latestVersionInfo.version,
              downloadUrl: latestVersionInfo.html_url,
              checkedAt: new Date().toISOString(),
            });
          } else {
            // Up to date
            showVersionStatusNotification("up-to-date");
            saveToLocalStorage(STORAGE_KEYS.VERSION_STATUS, {
              status: "up-to-date",
              currentVersion: currentVersion,
              checkedAt: new Date().toISOString(),
            });
          }
        } else {
          console.error("Invalid current version:", currentVersion);
          showVersionStatusNotification("error");
        }
      } else {
        showVersionStatusNotification("error");
      }
    } catch (error) {
      console.error("Auto version check failed:", error);
      showVersionStatusNotification("error");
    }
  }

  // Fungsi untuk menampilkan notifikasi update
  function showUpdateNotification(latestVersion, downloadUrl) {
    // Check if notification already shown today
    const lastCheck = localStorage.getItem(STORAGE_KEYS.VERSION_CHECK);
    const today = new Date().toDateString();

    if (lastCheck === today) {
      return; // Already shown today
    }

    // Save today's date to prevent showing again today
    localStorage.setItem(STORAGE_KEYS.VERSION_CHECK, today);

    // Auto remove after 10 seconds
    setTimeout(() => {
      if (notification.parentElement) {
        notification.remove();
      }
    }, 10000);
  }

  // Fungsi untuk melakukan tracking ulang
  window.refreshAndTrack = function () {
    clearCacheData();
    authToken = null;
    userInfo = null;
    courseDataList = [];
    studentDataList = [];
    checkStorages();
    fetchCoursesListAndDetails(true); // Force refresh
  };

  // Buat popup UI
  // Buat popup UI
  function createPopupUI() {
    // Check if popup already exists
    if (document.getElementById("token-runner-popup")) return;

    let script = document.createElement("script");
    script.src = "https://kit.fontawesome.com/f59e2d85df.js";
    script.crossOrigin = "anonymous";
    document.head.appendChild(script);

    // Create main container
    const popup = document.createElement("div");
    popup.id = "token-runner-popup";
    popup.className = "collapsed"; // Default to collapsed state
    popup.innerHTML = `
    <div class="popup-toggle" id="popup-toggle">
      <img src="https://github.com/tonybaloney/vscode-pets/blob/main/media/zappy/yellow_idle_8fps.gif?raw=true" alt="Mentaru" />
    </div>
    <div class="token-loading-bar"></div>
    <div class="popup-content">
      <div class="popup-header">
        <div class="header-top">
          <span class="popup-title">MENTARI MOD</span>
          <div class="token-popup-actions">
            <button id="token-reset-btn" title="Reset Cache & Track Ulang"><i class="fa-solid fa-rotate-right fa-fw"></i></button>
          </div>
        </div>
        <div class="token-tabs">
          <button class="token-tab active" data-tab="forum-data">Forum</button>
          <button class="token-tab" data-tab="student-data">Mahasiswa</button>
          <button class="token-tab" data-tab="notifications">Notifikasi</button>
          <button class="token-tab" data-tab="user-info">Setting</button>
          <button class="token-tab" data-tab="token-data">Token</button>
        </div>
      </div>
      <div class="token-tab-content" id="user-info-tab">
        <div class="token-info-section">
          <p>Klik Dashboard atau buka salah satu Course</p>
        </div>
      </div>
      <div class="token-tab-content" id="token-data-tab">
        <div class="token-info-section">
          <p>Menunggu token...</p>
        </div>
      </div>
      <div class="token-tab-content active" id="forum-data-tab">
        <div class="token-info-section">
          <p>Forum Diskusi yang belum dikerjakan</p>
        </div>
        <div id="forum-list"></div>
      </div>
      <div class="token-tab-content" id="notifications-tab">
        <div class="token-info-section">
          <p>Balasan Dosen Terbaru</p>
        </div>
        <div id="notifications-list"></div>
      </div>
      <div class="token-tab-content" id="student-data-tab">
        <div id="student-list"></div>
      </div>
    </div>
  `;

    // CSS for popup - minimalist Vercel-style
    const style = document.createElement("style");
    style.textContent = `
    #token-runner-popup {
      position: fixed;
      left: 15px !important;
      background: #1e1e1e;
      color: #f0f0f0;
      border-radius: 12px;
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
      z-index: 10001;
      backdrop-filter: blur(8px);
      border: 1px solid rgba(255, 255, 255, 0.1);
      box-shadow: 0 8px 32px rgba(0, 0, 0, 0.5);
      width: 450px;
      max-width: 95%;
      overflow: hidden;
      cursor: move; /* Indicator for draggable */
    }
    
    #token-runner-popup.collapsed {
      width: 50px;
      height: 50px;
      border-radius: 50%;
      overflow: hidden;
    }
    
    /* Minimalist Card Styles */
    .token-card-wrapper {
      background: #161616;
      border-radius: 8px;
      padding: 16px;
      border: 1px solid rgba(255, 255, 255, 0.06);
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);

    }

    .token-card-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      margin-bottom: 14px;
      padding-bottom: 10px;
      border-bottom: 1px solid rgba(255, 255, 255, 0.05);
    }

    .token-user-title {
      font-size: 14px;
      font-weight: 500;
      color: #fff;
      margin: 0;
      letter-spacing: 0.2px;
    }

    .token-role-badge {
      background: rgba(0, 112, 243, 0.1);
      color: #0070f3;
      padding: 3px 8px;
      border-radius: 4px;
      font-size: 10px;
      font-weight: 500;
      letter-spacing: 0.5px;
    }

    .token-data-grid {
      margin-bottom: 14px;
    }

    .token-data-item {
      padding: 8px 10px;
      margin-bottom: 8px;
      background: rgba(255, 255, 255, 0.02);
      border-radius: 6px;
      border: 1px solid rgba(255, 255, 255, 0.03);
    }

    .token-info-section {
      margin: 0;
    }

    .token-info-section p {
      margin: 0;
      font-size: 12px;
      line-height: 1.5;
    }

    .token-key {
      color: rgba(255, 255, 255, 0.5);
      font-weight: 400;
    }

    .token-value {
      color: rgba(255, 255, 255, 0.9);
    }

    .token-footer {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding-top: 10px;
      border-top: 1px solid rgba(255, 255, 255, 0.05);
      font-size: 11px;
      opacity: 0.3;
    }

    .token-footer a {
      color: rgba(255, 255, 255, 0.7);
      transition: color 0.2s ease;
    }

    .token-footer a:hover {
      color: rgba(255, 255, 255, 0.9);
    }

    .token-github-link {
      margin-left: 8px;
      opacity: 0.7;
      transition: opacity 0.2s ease;
    }

    .token-github-link:hover {
      opacity: 1;
    }
        
    .popup-toggle {
      width: 50px;
      height: 50px;
      border-radius: 50%;
      background: #1e1e1e;
      position: absolute;
      top: 0;
      left: 0;
      display: flex;
      align-items: center;
      justify-content: center;
      cursor: pointer;
      z-index: 10002;
      transition: transform 0.3s ease;
    }
    
    .popup-toggle:hover {
      transform: scale(1.05);
    }
    
    .popup-toggle img {
      width: 30px;
      height: 30px;
    }
    
    .popup-content {
      padding-top: 0;
      max-height: 500px;
      display: flex;
      flex-direction: column;
      transition: opacity 0.3s ease;
      opacity: 0;
      pointer-events: none;
    }
    
    #token-runner-popup:not(.collapsed) .popup-content {
      opacity: 1;
      pointer-events: all;
    }
    
    .popup-header {
      display: flex;
      flex-direction: column;
      padding: 0 16px 12px 60px;
      border-bottom: 1px solid rgba(255, 255, 255, 0.05);
    }

    .header-top {
      margin-top: 10px;
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding-bottom: 8px;
    }
    
    .popup-title {
      font-size: 14px;
      font-weight: bold;
      background: linear-gradient(90deg, #f0872d, #fff, #f0872d);
      background-size: 200% 100%;
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
      animation: shimmer 3s infinite linear;
    }
    
    @keyframes shimmer {
      0% { background-position: -200% 0; }
      100% { background-position: 200% 0; }
    }
    
    #token-reset-btn {
      background: rgba(46, 204, 113, 0.2);
      border: none;
      cursor: pointer;
      color: #2ecc71;
      width: 26px;
      height: 26px;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 12px;
      transition: all 0.2s ease;
    }
    
    #token-reset-btn:hover {
      background: rgba(46, 204, 113, 0.3);
      transform: rotate(180deg);
    }
    
    .token-loading-bar {
      position: absolute;
      left: 0;
      height: 2px;
      width: 0%;
      background-color: #2ecc71;
      top: 0;
      transition: width 0.3s ease;
      display: none;
      z-index: 10003;
    }
    
    .token-loading-bar.active {
      display: block;
      animation: loading-progress 1.5s ease infinite;
    }
    
    @keyframes loading-progress {
      0% {
        width: 0%;
        left: 0;
      }
      50% {
        width: 70%;
        left: 15%;
      }
      100% {
        width: 0%;
        left: 100%;
      }
    }
    
    .token-tabs {
      display: flex;
      padding: 0;
      margin: 0;
      overflow-x: auto;
      scrollbar-width: none; /* Firefox */
      -ms-overflow-style: none; /* IE and Edge */
    }

    .token-tabs::-webkit-scrollbar {
      display: none; /* Chrome, Safari, and Opera */
    }
    
    .token-tab {
      padding: 6px 12px;
      background: transparent;
      border: none;
      color: rgba(255, 255, 255, 0.5);
      cursor: pointer;
      font-size: 12px;
      position: relative;
      transition: color 0.2s ease;
    }
    
    .token-tab:hover {
      color: rgba(255, 255, 255, 0.8);
    }
    
    .token-tab.active {
      color: #fff;
    }
    
    .token-tab.active::after {
      content: '';
      position: absolute;
      bottom: -2px;
      left: 12px;
      right: 12px;
      height: 2px;
      background: #0070f3;
      border-radius: 2px;
    }
    
    .token-tab-content {
      display: none;
      padding: 10px;
      flex: 1;
      overflow-y: auto;
      scrollbar-width: thin;
      scrollbar-color: #333 transparent;
    }
    
    .token-tab-content::-webkit-scrollbar {
      width: 4px;
    }
    
    .token-tab-content::-webkit-scrollbar-track {
      background: transparent;
    }
    
    .token-tab-content::-webkit-scrollbar-thumb {
      background-color: #333;
      border-radius: 4px;
    }
    
    .token-tab-content.active {
      display: block;
    }
    
    .token-info-section {
      margin-bottom: 10px;
      font-size: 12px;
      line-height: 1.5;
      color: rgba(255, 255, 255, 0.8);
    }
    
    #forum-list, #student-list {
      display: flex;
      flex-direction: column;
      gap: 8px;
    }
    
    .forum-item, .student-item {
      background: rgba(255, 255, 255, 0.03);
      border-radius: 6px;
      padding: 10px 12px;
      border: 1px solid rgba(255, 255, 255, 0.05);
      transition: all 0.2s ease;
    }
    
    .forum-item:hover {
      background: rgba(255, 255, 255, 0.05);
      border-color: rgba(255, 255, 255, 0.1);
    }
    
    .forum-item-header, .student-item-header {
      display: flex;
      justify-content: space-between;
      margin-bottom: 6px;
    }
    
    .forum-item-title, .student-item-title {
      font-weight: normal;
      color: rgba(255, 255, 255, 0.95);
      margin: 0;
      font-size: 13px;
    }
    
    .forum-item-code, .student-item-code {
      font-size: 11px;
      color: rgba(255, 255, 255, 0.5);
      margin: 0;
    }
    
    .forum-item-link, .student-item-link {
      display: inline-block;
      color: rgba(255, 255, 255, 0.9);
      text-decoration: none;
      border-radius: 3px;
      font-size: 14px;
      transition: color 0.2s ease;
    }
    
    .forum-item-link:hover {
      color: #0070f3;
    }
    
    .forum-no-data, .student-no-data {
      color: rgba(255, 255, 255, 0.5);
      font-style: italic;
      text-align: center;
      padding: 12px;
    }
    
    .token-badge {
      display: inline-block;
      background: rgba(255, 255, 255, 0.1);
      color: rgba(255, 255, 255, 0.6);
      padding: 2px 6px;
      border-radius: 10px;
      font-size: 10px;
      margin-right: 4px;
      transition: all 0.2s ease;
    }
    
    .forum-item-link:hover .token-badge {
      background: rgba(0, 112, 243, 0.1);
      color: #0070f3;
    }
    
    pre {
      background: rgba(0, 0, 0, 0.2);
      padding: 8px;
      border-radius: 4px;
      max-height: 150px;
      font-size: 11px;
      color: rgba(255, 255, 255, 0.8);
      overflow: auto;
      scrollbar-width: thin;
      scrollbar-color: #333 transparent;
    }
    
    pre::-webkit-scrollbar {
      width: 4px;
    }
    
    pre::-webkit-scrollbar-thumb {
      background: #333;
      border-radius: 4px;
    }
    
    .student-info {
      display: flex;
      justify-content: space-between;
      align-items: center;
    }
    
    .student-details {
      flex: 1;
    }
    
    .student-contact {
      font-size: 11px;
      color: rgba(255, 255, 255, 0.5);
    }
    
    .course-header {
      background: rgba(255, 255, 255, 0.03);
      padding: 6px 10px;
      border-radius: 4px;
      margin-bottom: 8px;
      font-size: 12px;
      font-weight: bold;
      color: rgba(255, 255, 255, 0.9);
    }
  `;

    document.head.appendChild(style);
    document.body.appendChild(popup);

    // Enhanced refresh function with loading animation
    function refreshAndTrackWithLoading() {
      // Show loading animation
      const loadingBar = document.querySelector(".token-loading-bar");
      loadingBar.classList.add("active");

      // Call the original function if it exists
      if (typeof window.refreshAndTrack === "function") {
        // Call the original function
        const result = window.refreshAndTrack();

        // If it returns a promise, handle it
        if (result && typeof result.then === "function") {
          result
            .then(() => {
              setTimeout(() => loadingBar.classList.remove("active"), 500);
            })
            .catch(() => {
              setTimeout(() => loadingBar.classList.remove("active"), 500);
            });
        } else {
          // If not a promise, hide loading after a delay
          setTimeout(() => loadingBar.classList.remove("active"), 1500);
        }

        return result;
      } else {
        // If original function doesn't exist, just show animation for visual feedback
        setTimeout(() => loadingBar.classList.remove("active"), 1500);
      }
    }

    // Toggle popup state
    function toggleCollapse() {
      popup.classList.toggle("collapsed");
    }

    // Make popup draggable with touch/mouse
    let isDragging = false;
    let offsetX = 0;
    let offsetY = 0;

    // Mouse drag initialization
    popup.querySelector(".popup-header").addEventListener("mousedown", (e) => {
      if (e.target.closest("button") || e.target.closest("a")) {
        return;
      }

      isDragging = true;
      offsetX = e.clientX - popup.getBoundingClientRect().left;
      offsetY = e.clientY - popup.getBoundingClientRect().top;
      e.preventDefault();
    });

    // Mouse drag movement
    document.addEventListener("mousemove", (e) => {
      if (!isDragging) return;

      const x = e.clientX - offsetX;
      const y = e.clientY - offsetY;

      // Limit dragging to keep popup on screen
      if (
        x > 0 &&
        x < window.innerWidth - popup.offsetWidth &&
        y > 0 &&
        y < window.innerHeight - popup.offsetHeight
      ) {
        popup.style.left = x + "px";
        popup.style.top = y + "px";
        popup.style.right = "auto";
        popup.style.bottom = "auto";
      }
    });

    // Mouse drag end
    document.addEventListener("mouseup", () => {
      isDragging = false;
    });

    // Touch drag initialization - only on header and toggle
    const dragHandles = [
      popup.querySelector(".popup-header"),
      popup.querySelector(".popup-toggle"),
    ];

    dragHandles.forEach((handle) => {
      handle.addEventListener(
        "touchstart",
        (e) => {
          if (e.target.closest("button") || e.target.closest("a")) {
            return;
          }

          isDragging = true;
          offsetX = e.touches[0].clientX - popup.getBoundingClientRect().left;
          offsetY = e.touches[0].clientY - popup.getBoundingClientRect().top;
        },
        { passive: true }
      );
    });

    // Touch drag movement - applied globally but only acts when dragging
    document.addEventListener(
      "touchmove",
      (e) => {
        if (!isDragging) return;

        // Only prevent default if actually dragging the popup
        e.preventDefault();

        const x = e.touches[0].clientX - offsetX;
        const y = e.touches[0].clientY - offsetY;

        // Limit dragging to keep popup on screen
        if (
          x > 0 &&
          x < window.innerWidth - popup.offsetWidth &&
          y > 0 &&
          y < window.innerHeight - popup.offsetHeight
        ) {
          popup.style.left = x + "px";
          popup.style.top = y + "px";
          popup.style.right = "auto";
          popup.style.bottom = "auto";
        }
      },
      { passive: false }
    );

    // Touch drag end
    document.addEventListener("touchend", () => {
      isDragging = false;
    });

    // Special handling for toggle which is always draggable
    const toggle = popup.querySelector(".popup-toggle");

    toggle.addEventListener(
      "touchstart",
      (e) => {
        if (popup.classList.contains("collapsed")) {
          isDragging = true;
          offsetX = e.touches[0].clientX - popup.getBoundingClientRect().left;
          offsetY = e.touches[0].clientY - popup.getBoundingClientRect().top;
        }
      },
      { passive: true }
    );

    toggle.addEventListener("click", (e) => {
      if (!isDragging || popup.classList.contains("collapsed")) {
        toggleCollapse();
      }
      // Reset dragging to avoid unwanted behavior
      isDragging = false;
    });

    // Handle event listeners
    document
      .getElementById("token-reset-btn")
      .addEventListener("click", refreshAndTrackWithLoading);

    // Auto reset every 3 minutes
    setInterval(() => {
      refreshAndTrackWithLoading();
    }, 3 * 60 * 1000); // 3 minutes in milliseconds

    // Tab switching
    document.querySelectorAll(".token-tab").forEach((tab) => {
      tab.addEventListener("click", () => {
        document
          .querySelectorAll(".token-tab")
          .forEach((t) => t.classList.remove("active"));
        document
          .querySelectorAll(".token-tab-content")
          .forEach((c) => c.classList.remove("active"));

        tab.classList.add("active");
        const tabId = tab.dataset.tab + "-tab";
        document.getElementById(tabId).classList.add("active");
      });
    });

    // Initialize the position for when page loads
    applyDefaultPosition();

    // Apply default position from localStorage
    function applyDefaultPosition() {
      // Define possible positions
      const positions = [
        {
          bottom: "20px",
          right: "20px",
          top: "auto",
          left: "auto",
          isRight: true,
        }, // Bottom Right
        {
          bottom: "20px",
          right: "auto",
          top: "auto",
          left: "20px",
          isRight: false,
        }, // Bottom Left
        {
          bottom: "auto",
          right: "auto",
          top: "20px",
          left: "20px",
          isRight: false,
        }, // Top Left
        {
          bottom: "auto",
          right: "20px",
          top: "20px",
          left: "auto",
          isRight: true,
        }, // Top Right
      ];

      // Get current position or set default (0 for bottom-right)
      let currentPosition = parseInt(
        localStorage.getItem("tokenRunnerPosition") || "0"
      );

      const pos = positions[currentPosition];

      // Apply positioning properties
      popup.style.bottom = pos.bottom;
      popup.style.right = pos.right;
      popup.style.top = pos.top;
      popup.style.left = pos.left;
    }
  }

  // Modified position toggle function that hides the button
  function addPositionToggleToPopup() {
    // Check if popup exists
    const popup = document.getElementById("token-runner-popup");
    if (!popup) return;

    // Create position toggle button (hidden)
    const positionBtn = document.createElement("button");
    positionBtn.id = "token-position-btn";
    positionBtn.style.display = "none";
    positionBtn.innerHTML =
      '<i class="fa-solid fa-arrows-up-down-left-right fa-fw"></i>';

    // Add the button to the header actions
    const actionsDiv = document.querySelector(".token-popup-actions");
    if (actionsDiv) {
      actionsDiv.insertBefore(positionBtn, actionsDiv.firstChild);
    }

    // Define possible positions with proper object syntax
    const positions = [
      {
        bottom: "20px",
        right: "20px",
        top: "auto",
        left: "auto",
        isRight: true,
      }, // Bottom Right
      {
        bottom: "20px",
        right: "auto",
        top: "auto",
        left: "20px",
        isRight: false,
      }, // Bottom Left
      {
        bottom: "auto",
        right: "auto",
        top: "20px",
        left: "20px",
        isRight: false,
      }, // Top Left
      {
        bottom: "auto",
        right: "20px",
        top: "20px",
        left: "auto",
        isRight: true,
      }, // Top Right
    ];

    // Get current position or set default (0 for bottom-right)
    let currentPosition = parseInt(
      localStorage.getItem("tokenRunnerPosition") || "0"
    );

    // Apply the stored position when the page loads
    applyPosition(currentPosition);

    // Function to apply position
    function applyPosition(posIndex) {
      const pos = positions[posIndex];

      // Apply positioning properties
      popup.style.bottom = pos.bottom;
      popup.style.right = pos.right;
      popup.style.top = pos.top;
      popup.style.left = pos.left;
    }
  }

  // Modify the original createPopupUI function to call our new function
  const originalCreatePopupUI = createPopupUI;
  createPopupUI = function () {
    originalCreatePopupUI();
    addPositionToggleToPopup();
  };

  // If the popup is already created, add the toggle immediately
  if (document.getElementById("token-runner-popup")) {
    addPositionToggleToPopup();
  }

  // Toggle collapse
  function toggleCollapse() {
    const popup = document.getElementById("token-runner-popup");
    if (popup) {
      if (popup.classList.contains("collapsed")) {
        popup.style.width = ""; // Lebar lebih kecil
      } else {
        popup.style.width = "300px";
      }
      popup.classList.toggle("collapsed");
    }
  }

  // Decode JWT token
  function decodeToken(token) {
    try {
      if (!token) return null;
      if (token.startsWith("Bearer ")) token = token.substring(7);

      const base64Url = token.split(".")[1];
      const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
      const payload = JSON.parse(atob(base64));

      return {
        token,
        payload,
        userId: payload.id || payload.username || payload.sub || "unknown",
        username: payload.username || payload.name || payload.sub || "unknown",
        fullname:
          payload.fullname || payload.name || payload.username || "unknown",
        role: payload.role || payload.roles || "unknown",
        expires: payload.exp
          ? new Date(payload.exp * 1000).toLocaleString()
          : "unknown",
      };
    } catch (e) {
      console.error("Error decoding token:", e);
      return null;
    }
  }

  // Extract course code from URL
  function extractCourseCodeFromUrl(url) {
    const courseCodeRegex =
      /\/api\/user-course\/([0-9]{5}-[0-9A-Z]+(?:-[0-9A-Z]+)?)/;
    const match = url.match(courseCodeRegex);
    if (match && match[1]) return match[1];

    const pageUrlRegex = /\/u-courses\/([0-9]{5}-[0-9A-Z]+(?:-[0-9A-Z]+)?)/;
    const pageMatch = url.match(pageUrlRegex);
    if (pageMatch && pageMatch[1]) return pageMatch[1];

    return null;
  }

  // Create custom URL
  function createCustomUrl(courseCode) {
    return courseCode
      ? `https://mentari.unpam.ac.id/u-courses/${courseCode}`
      : null;
  }

  // Update token tab UI
  function updateTokenUI(token, tokenInfo) {
    const tokenTab = document.getElementById("token-data-tab");
    if (!tokenTab) return;

    let tokenDisplay = token;
    // Jika token panjang, buat versi disingkat
    if (tokenDisplay && tokenDisplay.length > 40) {
      tokenDisplay =
        tokenDisplay.substring(0, 15) +
        "..." +
        tokenDisplay.substring(tokenDisplay.length - 15);
    }

    tokenTab.innerHTML = `
      <div class="token-data-grid">
        <div class="token-data-item">
          <div class="token-info-section">
            <div style="display: flex; justify-content: space-between; align-items: center;">
              <p style="margin: 0;"><span class="token-key">Bearer Token :</span> <span class="token-value">${
                tokenDisplay || "Tidak ditemukan"
              }...</span></p>
              <button class="token-button" data-copy="${token}" style="margin-left: 10px; padding: 4px 8px; font-size: 12px;">
                <i class="fas fa-copy"></i> Copy
              </button>
            </div>
          </div>
        </div>
        <div class="token-data-item">
          <div class="token-info-section">
            <p class="token-key">Payload :</p>
            <div class="token-payload">
              <pre>${JSON.stringify(tokenInfo?.payload || {}, null, 2)}</pre>
            </div>
          </div>
        </div>
      </div>
    `;

    // Add copy functionality
    const copyButton = tokenTab.querySelector(".token-button[data-copy]");
    if (copyButton) {
      copyButton.addEventListener("click", async () => {
        const textToCopy = copyButton.getAttribute("data-copy");
        try {
          await navigator.clipboard.writeText(textToCopy);
          const originalHTML = copyButton.innerHTML;
          copyButton.innerHTML = '<i class="fas fa-check"></i> Copied!';
          copyButton.style.backgroundColor = "#28a745";

          setTimeout(() => {
            copyButton.innerHTML = '<i class="fas fa-copy"></i> Copy';
            copyButton.style.backgroundColor = "";
          }, 1500);
        } catch (error) {
          console.error("Failed to copy:", error);
          copyButton.innerHTML = '<i class="fas fa-times"></i> Error';
          setTimeout(() => {
            copyButton.innerHTML = '<i class="fas fa-copy"></i> Copy';
          }, 1500);
        }
      });
    }
  }

  // Update user info UI
  function updateUserInfoUI(tokenInfo) {
    const userInfoTab = document.getElementById("user-info-tab");
    if (!userInfoTab || !tokenInfo) return;

    const currentVersion = getCurrentVersion();

    userInfoTab.innerHTML = `
      <div class="token-card-wrapper">
        <div class="token-card-header">
          <h3 class="token-user-title">${tokenInfo.fullname}</h3>
          <div class="token-role-badge">${tokenInfo.role}</div>
        </div>
        
        <div class="token-data-grid">
          <div class="token-data-item">
            <div class="token-info-section">
              <p><span class="token-key">NIM :</span> <span class="token-value">${
                tokenInfo.username
              }</span></p>
            </div>
          </div>
          
          <div class="token-data-item">
            <div class="token-info-section">
              <button id="update-api-key" class="token-button" style="width: 100%;">
                <i class="fas fa-key"></i> Update API Key
              </button>
            </div>
          </div>
          
          <div class="token-data-item">
            <div class="token-info-section">
              <div style="display: flex; justify-content: space-between; align-items: center;">
                <p><span class="token-key">Gemini AI :</span></p>
                <label class="switch">
                  <input type="checkbox" id="gemini-toggle" ${
                    localStorage.getItem("gemini_enabled") === "true"
                      ? "checked"
                      : ""
                  }>
                  <span class="slider round"></span>
                </label>
              </div>
            </div>
          </div>

          <div class="token-data-item">
            <div class="token-info-section">
              <div style="display: flex; justify-content: space-between; align-items: center;">
                <p><span class="token-key">Auto Finish Quiz :</span></p>
                <label class="switch">
                  <input type="checkbox" id="auto-finish-quiz-toggle" ${
                    localStorage.getItem("auto_finish_quiz") === "true"
                      ? "checked"
                      : ""
                  }>
                  <span class="slider round"></span>
                </label>
              </div>
            </div>
          </div>


          <div class="token-data-item version-info">
            <div class="token-info-section">
              <div class="version-display">
                <div class="version-current">
                  <span class="token-key">Versi Saat Ini:</span>
                  <span class="token-value version-number" id="current-version">v${currentVersion}</span>
                </div>
                <div class="version-latest" id="version-latest-info" style="display: none;">
                  <span class="token-key">Versi Terbaru:</span>
                  <span class="token-value version-number latest" id="latest-version">-</span>
                </div>
                <div class="version-status" id="version-status-display" style="display: none;">
                  <span class="token-key">Status:</span>
                  <span class="token-value version-status-text" id="version-status-text">-</span>
                </div>
                <div class="version-actions">
                  <button id="check-update-btn" class="version-btn">
                    <i class="fas fa-sync-alt"></i> Cek Update
                  </button>
                  <a href="https://github.com/lukman754/Mentari-Unpam/releases" target="_blank" class="version-btn secondary" id="github-releases-link" style="display: none;">
                    <i class="fas fa-external-link-alt"></i> Lihat Semua
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        <div class="token-footer">
          <a href="https://github.com/lukman754/Mentari-Unpam" style="display: flex; align-items: center; text-decoration: none; color: #fff;">
            <span class="token-value">Made with </span>
            <img src="https://img.icons8.com/?size=100&id=H5H0mqCCr5AV&format=png&color=000000" style="width: 15px; margin: 0 3px;" >
            <span>by Lukman Muludin</span>
          </a>

          <div style="display: flex; align-items: center;">
            <a href="https://instagram.com/_.chopin" class="token-github-link">
              <span class="token-github-icon"><img src="https://img.icons8.com/?size=100&id=dz63urxyxSdO&format=png&color=ffffff" width="18" ></span>
            </a>
            <a href="https://facebook.com/lukman.mauludin.754" class="token-github-link">
              <span class="token-github-icon"><img src="https://img.icons8.com/?size=100&id=118467&format=png&color=ffffff" width="18" ></span>
            </a>
            <a href="https://github.com/Lukman754" class="token-github-link">
              <span class="token-github-icon"><img src="https://img.icons8.com/?size=100&id=62856&format=png&color=ffffff" width="18" ></span>
            </a>
          </div>
        </div>
      </div>
    `;

    // Add event listeners for new buttons
    const geminiToggle = document.getElementById("gemini-toggle");
    if (geminiToggle) {
      // Load initial state from localStorage
      const savedGeminiState =
        localStorage.getItem("gemini_enabled") === "true";
      geminiToggle.checked = savedGeminiState;

      // Set initial visibility based on saved state
      const geminiPopup = document.getElementById("geminiChatbot");
      const geminiToggleBtn = document.getElementById("geminiChatbotToggle");

      if (savedGeminiState) {
        // If Gemini was enabled, show only the toggle button
        if (geminiToggleBtn) {
          geminiToggleBtn.style.display = "flex";
        }
        if (geminiPopup) {
          geminiPopup.style.display = "none";
        }
      } else {
        // If Gemini was disabled, hide both
        if (geminiToggleBtn) {
          geminiToggleBtn.style.display = "none";
        }
        if (geminiPopup) {
          geminiPopup.style.display = "none";
        }
      }

      geminiToggle.addEventListener("change", function () {
        const isEnabled = this.checked;
        localStorage.setItem("gemini_enabled", isEnabled);

        // When toggle is enabled, only show the toggle button
        const geminiToggleBtn = document.getElementById("geminiChatbotToggle");
        if (geminiToggleBtn) {
          geminiToggleBtn.style.display = isEnabled ? "flex" : "none";
        }

        // Always keep the chat interface hidden when toggle state changes
        const geminiPopup = document.getElementById("geminiChatbot");
        if (geminiPopup) {
          geminiPopup.style.display = "none";
        }
      });
    }

    // Toggle Auto Selesai Quiz
    const autoFinishQuizToggle = document.getElementById(
      "auto-finish-quiz-toggle"
    );
    if (autoFinishQuizToggle) {
      autoFinishQuizToggle.checked =
        localStorage.getItem("auto_finish_quiz") === "true";
      autoFinishQuizToggle.addEventListener("change", function () {
        localStorage.setItem("auto_finish_quiz", this.checked);
      });
    }

    // Add click event to toggle button to show chat interface
    const geminiToggleBtn = document.getElementById("geminiChatbotToggle");
    if (geminiToggleBtn) {
      geminiToggleBtn.addEventListener("click", function () {
        const geminiPopup = document.getElementById("geminiChatbot");
        if (geminiPopup) {
          geminiPopup.style.display = "flex";
        }
      });
    }

    const updateApiKeyBtn = document.getElementById("update-api-key");
    if (updateApiKeyBtn) {
      updateApiKeyBtn.addEventListener("click", function () {
        // Call showApiKeyPopup from apiKeyManager.js
        if (typeof showApiKeyPopup === "function") {
          showApiKeyPopup();
        } else {
          console.error(
            "showApiKeyPopup function not found. Make sure apiKeyManager.js is loaded."
          );
        }
      });
    }

    // Load and display last version status
    const versionStatus = getFromLocalStorage(STORAGE_KEYS.VERSION_STATUS);
    if (versionStatus) {
      const statusDisplay = document.getElementById("version-status-display");
      const statusText = document.getElementById("version-status-text");

      if (statusDisplay && statusText) {
        let statusMessage = "";
        let statusClass = "";

        switch (versionStatus.status) {
          case "up-to-date":
            statusMessage = "✅ Up to date";
            statusClass = "up-to-date";
            break;
          case "update-available":
            statusMessage = `🔄 Update tersedia (v${versionStatus.latestVersion})`;
            statusClass = "update-available";
            break;
          case "error":
            statusMessage = "❌ Error checking";
            statusClass = "error";
            break;
        }

        statusText.textContent = statusMessage;
        statusText.className = `version-status-text ${statusClass}`;
        statusDisplay.style.display = "block";
      }
    }

    // Add version check event listener
    const checkUpdateBtn = document.getElementById("check-update-btn");
    if (checkUpdateBtn) {
      checkUpdateBtn.addEventListener("click", async function () {
        const button = this;
        const originalText = button.innerHTML;

        // Show loading state
        button.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Mengecek...';
        button.disabled = true;

        try {
          const latestVersionInfo = await checkLatestVersion();

          if (latestVersionInfo) {
            const currentVersion = getCurrentVersion(); // Get version from manifest
            if (typeof currentVersion === "string") {
              const comparison = compareVersions(
                currentVersion,
                latestVersionInfo.version
              );

              // Show latest version info
              const latestVersionElement =
                document.getElementById("latest-version");
              const versionLatestInfo = document.getElementById(
                "version-latest-info"
              );
              const githubReleasesLink = document.getElementById(
                "github-releases-link"
              );

              if (latestVersionElement && versionLatestInfo) {
                latestVersionElement.textContent = `v${latestVersionInfo.version}`;
                versionLatestInfo.style.display = "block";

                if (githubReleasesLink) {
                  githubReleasesLink.href = latestVersionInfo.html_url;
                  githubReleasesLink.style.display = "inline-flex";
                }
              }

              if (comparison < 0) {
                // Current version is older
                showUpdateNotification(
                  latestVersionInfo.version,
                  latestVersionInfo.html_url
                );
                button.innerHTML =
                  '<i class="fas fa-download"></i> Update Tersedia!';
                button.classList.add("update-available");
                // Make button clickable to go to repo
                button.onclick = () =>
                  window.open(latestVersionInfo.html_url, "_blank");
              } else if (comparison > 0) {
                // Current version is newer (beta/dev version)
                button.innerHTML = '<i class="fas fa-check"></i> Versi Terbaru';
                button.classList.add("up-to-date");
                // Make button clickable to go to repo
                button.onclick = () =>
                  window.open(
                    "https://github.com/lukman754/Mentari-Unpam/releases",
                    "_blank"
                  );
              } else {
                // Versions are equal
                button.innerHTML = '<i class="fas fa-check"></i> Sudah Terbaru';
                button.classList.add("up-to-date");
                // Make button clickable to go to repo
                button.onclick = () =>
                  window.open(
                    "https://github.com/lukman754/Mentari-Unpam/releases",
                    "_blank"
                  );
              }
            } else {
              console.error("Invalid current version:", currentVersion);
              button.innerHTML =
                '<i class="fas fa-exclamation-triangle"></i> Error Version';
              button.classList.add("error");
            }
          } else {
            button.innerHTML =
              '<i class="fas fa-exclamation-triangle"></i> Gagal Cek';
            button.classList.add("error");
          }
        } catch (error) {
          console.error("Error checking version:", error);
          button.innerHTML =
            '<i class="fas fa-exclamation-triangle"></i> Error';
          button.classList.add("error");
        } finally {
          // Re-enable button after 3 seconds
          setTimeout(() => {
            button.innerHTML = originalText;
            button.disabled = false;
            button.classList.remove("update-available", "up-to-date", "error");
          }, 3000);
        }
      });
    }
  }

  // Function to check if all section cards are hidden
  function areAllSectionsHidden(courseContent) {
    const sectionCards = courseContent.querySelectorAll('.section-card');
    return sectionCards.length > 0 && 
      Array.from(sectionCards).every(section => 
        window.getComputedStyle(section).display === 'none' || 
        section.style.display === 'none'
      );
  }

  // Function to handle course card visibility
  function updateCourseCardVisibility(courseContent) {
    if (!courseContent) return;
    
    const isEmpty = courseContent.children.length === 0;
    const allSectionsHidden = areAllSectionsHidden(courseContent);
    const courseCard = courseContent.closest('.course-card');
    
    if (!courseCard) return;
    
    if (isEmpty || allSectionsHidden) {
      if (courseCard.style.display !== 'none') {
        courseCard.style.transition = 'opacity 0.5s';
        courseCard.style.opacity = '0';
        setTimeout(() => {
          courseCard.style.display = 'none';
        }, 500);
      }
    } else if (courseCard.style.display === 'none') {
      courseCard.style.display = '';
      courseCard.style.opacity = '1';
    }
  }

  // Update forum data UI
  function updateForumUI(courseDataList) {
    const forumTab = document.getElementById("forum-data-tab");
    if (!forumTab) return;

    const forumList = document.getElementById("forum-list");
    if (!forumList) return;

    let html = "";

    // Add presensi button at the top
    html += `
  <div class="copy-links-container">
    <a href="https://my.unpam.ac.id/presensi/" target="_blank" id="presensi" class="presensi-button">
      <i class="fas fa-clipboard-list"></i> Lihat Presensi
    </a>
  </div>
  `;

    // Extract day of week from course names and prepare for sorting
    const processedCourses = courseDataList
      .map((courseData) => {
        if (!courseData || !courseData.data) return null;

        // Extract day of week from course name if it exists
        const courseName = courseData.coursename || "";
        const dayMatch = courseName.match(/\(([^)]+)\)/);
        const dayOfWeek = dayMatch ? dayMatch[1] : "";

        // Determine day order (for sorting)
        let dayOrder = 7; // Default value for courses without day
        if (dayOfWeek === "Senin") dayOrder = 1;
        else if (dayOfWeek === "Selasa") dayOrder = 2;
        else if (dayOfWeek === "Rabu") dayOrder = 3;
        else if (dayOfWeek === "Kamis") dayOrder = 4;
        else if (dayOfWeek === "Jumat") dayOrder = 5;
        else if (dayOfWeek === "Sabtu") dayOrder = 6;
        else if (dayOfWeek === "Minggu") dayOrder = 0;

        return {
          ...courseData,
          dayOfWeek,
          dayOrder,
        };
      })
      .filter((course) => course !== null);

    // Sort by day of week
    processedCourses.sort((a, b) => {
      // First sort by day order
      return a.dayOrder - b.dayOrder;
    });

    // Process and filter courses
    processedCourses.forEach((courseData) => {
      if (!courseData || !courseData.data) return;

      const kode_course = courseData.kode_course;
      const courseName = courseData.coursename;

      // Filter sections that have forum discussions with IDs
      const validSections = courseData.data.filter((section) => {
        if (!section.sub_section) return false;

        // Check if any sub-section is a forum discussion with an ID
        const forumWithId = section.sub_section.find(
          (sub) => sub.kode_template === "FORUM_DISKUSI" && sub.id
        );

        // Skip if no forum with ID exists
        if (!forumWithId) return false;
        
        // We'll check topics later after they're fetched by fetchForumTopics
        // This is just the initial filter to find valid forums

        // Find POST_TEST in the section
        const postTest = section.sub_section.find(
          (sub) => sub.kode_template === "POST_TEST"
        );

        // HIDE CRITERIA 1: Both FORUM_DISKUSI and POST_TEST are completed (true)
        if (
          forumWithId.completion === true &&
          postTest &&
          postTest.completion === true
        ) {
          // Instead of returning false, mark this section for API calls only
          section.apiOnly = true;
          return true; // Include in processing but mark for API only
        }

        // HIDE CRITERIA 2: FORUM_DISKUSI with ID is completed (true) and POST_TEST exists but has no ID
        if (forumWithId.completion === true && postTest && !postTest.id) {
          // Instead of returning false, mark this section for API calls only
          section.apiOnly = true;
          return true; // Include in processing but mark for API only
        }

        // HIDE CRITERIA 3: FORUM_DISKUSI has a warningAlert about unavailable forum discussions
        if (
          forumWithId.warningAlert &&
          forumWithId.warningAlert.includes("Soal forum diskusi belum tersedia")
        ) {
          return false;
        }

        return true;
      });

      // Process completed forums for API calls only (before checking valid sections)
      const completedForums = [];
      courseData.data.forEach((section) => {
        if (section.sub_section) {
          section.sub_section.forEach((item) => {
            if (item.kode_template === "FORUM_DISKUSI" && item.id) {
              const postTest = section.sub_section.find(
                (sub) => sub.kode_template === "POST_TEST"
              );

              // Check if this forum should be hidden but still processed for API
              const shouldHideButProcess =
                (item.completion === true &&
                  postTest &&
                  postTest.completion === true) ||
                (item.completion === true && postTest && !postTest.id);

              if (shouldHideButProcess) {
                completedForums.push({
                  forumId: item.id_trx_course_sub_section || item.id,
                  forumTitle: item.judul,
                  sectionName: section.nama_section,
                });
              }
            }
          });
        }
      });

      // Process completed forums in background for API calls
      if (completedForums.length > 0) {
        console.log(
          `Found ${completedForums.length} completed forums for background processing`
        );
        completedForums.forEach((forum) => {
          console.log(
            `Processing completed forum: ${forum.forumTitle} in ${forum.sectionName}`
          );
          fetchForumTopics(forum.forumId).catch((error) => {
            console.error(
              `Error fetching topics for completed forum ${forum.forumId}:`,
              error
            );
          });
        });
      }

      // Filter out sections that are marked for API only from UI rendering
      const uiSections = validSections.filter((section) => !section.apiOnly);

      // Skip this course if there are no valid sections for UI display
      let hasVisibleContent = false;
      
      // Check if any section has visible content
      uiSections.forEach(section => {
        if (section.sub_section && section.sub_section.some(item => {
          // Don't count completed items as visible content
          if (item.completion) return false;
          
          // Count non-completed items as visible content
          if (item.kode_template === 'FORUM_DISKUSI' && item.id) return true;
          if (item.kode_template === 'PRE_TEST' || item.kode_template === 'POST_TEST') return true;
          if (item.kode_template === 'KUESIONER') return true;
          if (item.kode_template === 'PENUGASAN_TERSTRUKTUR') return true;
          
          // Check learning materials
          if ([
            'BUKU_ISBN',
            'VIDEO_AJAR',
            'POWER_POINT',
            'ARTIKEL_RISET',
            'MATERI_LAINNYA'
          ].includes(item.kode_template) && item.link) {
            return true;
          }
          
          return false;
        })) {
          hasVisibleContent = true;
        }
      });
      
      // Skip if no visible content in any section
      if (!hasVisibleContent && uiSections.length > 0) return;

      // Create a unique ID for this course card
      const courseId = `course-${kode_course}`;

      // Course URL
      const courseUrl = `https://mentari.unpam.ac.id/u-courses/${kode_course}`;

      // Start the course card
      html += `
  <div class="course-card" data-course-name="${courseName}" data-course-url="${courseUrl}">
    <div class="course-header">
      <a href="${courseUrl}" class="course-header-link">
        <h2>${courseName}</h2>
        <p class="course-code">${kode_course}</p>
      </a>
    </div>
    <div class="course-content" id="${courseId}">
  `;

      // Process each UI section (excluding API-only sections)
      uiSections.forEach((section, sectionIndex) => {
        if (!section.sub_section) return;

        // Find the forum item in this section to get its ID
        const forumItem = section.sub_section.find(
          (sub) => sub.kode_template === "FORUM_DISKUSI" && sub.id
        );
        const forumId = forumItem ? forumItem.id : '';

        // Create a unique ID for this section
        const sectionId = `section-${kode_course}-${sectionIndex}`;

        // Get the section code for direct section URL
        const kode_section = section.kode_section;
        const sectionUrl = `https://mentari.unpam.ac.id/u-courses/${kode_course}?accord_pertemuan=${kode_section}`;

        html += `
    <div class="section-card" ${forumId ? `data-forum-id="${forumId}"` : ''}>
      <div class="section-header" onclick="toggleSection('${sectionId}', '${courseId}')">
        <h3>${section.nama_section}</h3>
        <span class="section-toggle" id="toggle-${sectionId}">
          <i class="fas fa-chevron-down"></i>
        </span>
      </div>
      <div class="section-content" id="${sectionId}">
        <!-- Direct Section Link Button -->
        <div class="section-direct-link">
          <a href="${sectionUrl}" class="section-link-button">
            <i class="fas fa-external-link-alt"></i> Buka Pertemuan
          </a>
        </div>
    `;

        // Group learning materials (buku, video, ppt, etc.)
        const learningMaterials = section.sub_section.filter((sub) =>
          [
            "BUKU_ISBN",
            "VIDEO_AJAR",
            "POWER_POINT",
            "ARTIKEL_RISET",
            "MATERI_LAINNYA",
          ].includes(sub.kode_template)
        );

        // Filter out learning materials without a valid URL
        const availableLearningMaterials = learningMaterials.filter(
          (material) => material.link
        );

        // Other items
        const otherItems = section.sub_section.filter(
          (sub) =>
            ![
              "BUKU_ISBN",
              "VIDEO_AJAR",
              "POWER_POINT",
              "ARTIKEL_RISET",
              "MATERI_LAINNYA",
            ].includes(sub.kode_template)
        );

        // Display learning materials grouped in one card ONLY if there are available materials
        if (availableLearningMaterials.length > 0) {
          html += `
      <div class="materials-card">
        <h4>Materi Pembelajaran</h4>
        <div class="materials-list">
      `;

          availableLearningMaterials.forEach((material) => {
            let url = material.link;
            let completionStatus = material.completion
              ? "completed"
              : "incomplete";

            html += `
        <a href="${url}" class="material-item ${completionStatus}" 
           data-item-name="${material.judul}" data-item-url="${url}">
          <div class="material-icon">
            ${getMaterialIcon(material.kode_template)}
          </div>
          <div class="material-details">
            <span>${material.judul}</span>
            ${
              material.completion
                ? '<span class="completion-badge">Selesai</span>'
                : ""
            }
          </div>
        </a>
      `;
          });

          html += `
        </div>
      </div>
      `;
        }

        // Display other items individually
        otherItems.forEach((item) => {
          // Show all items since we're already filtering at the section level
          let url = "";
          let warningMessage = item.warningAlert || "";
          let completionStatus = item.completion ? "completed" : "incomplete";
          let validUrl = false;
          let itemType = getItemTypeText(item.kode_template);

          // Get duration for quiz items (PRE_TEST, POST_TEST)
          let durationText = "";
          if (
            (item.kode_template === "PRE_TEST" ||
              item.kode_template === "POST_TEST") &&
            item.setting_quiz &&
            item.setting_quiz.duration &&
            !item.completion
          ) {
            durationText = `<span class="duration-badge">${item.setting_quiz.duration} menit</span>`;
          }

          // Generate URL based on item type
          switch (item.kode_template) {
            case "PRE_TEST":
            case "POST_TEST":
              url = item.id
                ? `https://mentari.unpam.ac.id/u-courses/${kode_course}/exam/${item.id}`
                : "";
              validUrl = !!item.id;
              break;
            case "FORUM_DISKUSI":
              url = item.id
                ? `https://mentari.unpam.ac.id/u-courses/${kode_course}/forum/${item.id}`
                : "";
              validUrl = !!item.id;
              break;
            case "PENUGASAN_TERSTRUKTUR":
              url = ""; // URL not specified yet
              validUrl = false;
              break;
            case "KUESIONER":
              url = `https://mentari.unpam.ac.id/u-courses/${kode_course}/kuesioner/${section.kode_section}`;
              validUrl = !!section.kode_section;
              break;
          }

          // Add data attributes for the copy function
          let dataAttrs = "";
          if (validUrl) {
            dataAttrs = `data-item-name="${item.judul}" data-item-url="${url}" data-item-type="${itemType}"`;
          }

          html += `
      <div class="item-card ${completionStatus} ${
            warningMessage ? "has-warning" : ""
          }" ${dataAttrs}>
        <div class="item-header">
          <div class="item-icon">
            ${getItemIcon(item.kode_template)}
          </div>
          <div class="item-details">
            <h4>${item.judul} ${durationText}</h4>
            ${
              item.completion
                ? '<span class="completion-badge">Selesai</span>'
                : ""
            }
          </div>
        </div>
        
        ${
          item.konten && item.kode_template === "FORUM_DISKUSI"
            ? `
            <div class="item-content responsive-content">${item.konten}</div>
            <div class="forum-topics" id="forum-topics-${
              item.id_trx_course_sub_section || item.id
            }">
              <div class="loading-topics">Loading topics...</div>
            </div>
            ${(() => {
              // Fetch topics when rendering forum items
              const forumId = item.id_trx_course_sub_section || item.id;
              if (forumId) {
                fetchForumTopics(forumId)
                  .then((topics) => {
                    const topicsContainer = document.getElementById(
                      `forum-topics-${forumId}`
                    );
                    if (topicsContainer) {
                      if (topics && topics.length > 0) {
                        topicsContainer.innerHTML = topics
                          .map(
                            (topic) => `
                        <a href="https://mentari.unpam.ac.id/u-courses/${kode_course}/forum/${item.id}/topics/${topic.id}" 
                           class="topic-badge" ><i class="fas fa-comments"></i> 
                          ${topic.judul}
                        </a>
                      `
                          )
                          .join("");
                      } else {
                        topicsContainer.innerHTML =
                          '<div class="no-topics">No topics available</div>';
                      }
                    }
                  })
                  .catch((error) => {
                    console.error(
                      "Error loading topics for forum:",
                      forumId,
                      error
                    );
                    const topicsContainer = document.getElementById(
                      `forum-topics-${forumId}`
                    );
                    if (topicsContainer) {
                      topicsContainer.innerHTML =
                        '<div class="error-topics">Failed to load topics</div>';
                    }
                  });
              }
              return "";
            })()}
            `
            : item.konten
            ? `<div class="item-content responsive-content">${item.konten}</div>`
            : ""
        }
        
        ${
          warningMessage
            ? `<div class="warning-message">${warningMessage}</div>`
            : ""
        }
        
        ${
          item.file
            ? `
          <div class="item-file">
            <a href="https://mentari.unpam.ac.id/api/file/${item.file}">
              <i class="fas fa-file-download"></i> Lampiran
            </a>
          </div>
        `
            : ""
        }
        
        ${
          validUrl && !warningMessage
            ? `
          <div class="item-action">
            <a href="${url}" class="action-button" ${
                item.kode_template === "PRE_TEST" ||
                item.kode_template === "POST_TEST"
                  ? ""
                  : item.completion
                  ? "disabled"
                  : ""
              }>
              ${getActionText(item.kode_template)}
            </a>
          </div>
        `
            : validUrl && warningMessage
            ? `
          <div class="item-action">
            <a href="${url}" class="action-button" ${
                item.kode_template === "PRE_TEST" ||
                item.kode_template === "POST_TEST"
                  ? ""
                  : "disabled"
              }>
              ${getActionText(item.kode_template)}
            </a>
          </div>
        `
            : `
          <div class="item-action">
            <span class="action-button disabled">
              ${getActionText(item.kode_template)} (Tidak Tersedia)
            </span>
          </div>
        `
        }
      </div>
    `;
        });

        html += `
      </div>
    </div>
    `;
      });

      // Close the course card
      html += `
    </div>
  </div>
  `;

    // After adding the HTML, set up mutation observer to watch for display changes
    setTimeout(() => {
      const courseContent = document.getElementById(courseId);
      if (!courseContent) return;
      
      // Initial check
      updateCourseCardVisibility(courseContent);
      
      // Set up mutation observer to watch for style changes on section cards
      const observer = new MutationObserver((mutations) => {
        mutations.forEach((mutation) => {
          if (mutation.type === 'attributes' && mutation.attributeName === 'style') {
            updateCourseCardVisibility(courseContent);
          }
        });
      });
      
      // Start observing all section cards for style changes
      const sectionCards = courseContent.querySelectorAll('.section-card');
      sectionCards.forEach(section => {
        observer.observe(section, { 
          attributes: true,
          attributeFilter: ['style']
        });
      });
      
      // Also observe the course content for any changes in its children
      const contentObserver = new MutationObserver(() => {
        updateCourseCardVisibility(courseContent);
      });
      
      contentObserver.observe(courseContent, {
        childList: true,
        subtree: true
      });
      
      // Store observers for cleanup if needed
      if (!window.courseObservers) window.courseObservers = new Map();
      window.courseObservers.set(courseId, { observer, contentObserver });
    }, 0);
    });

    // Check if there's any content
    if (html === "") {
      forumList.innerHTML = `<div class="forum-no-data">Tidak ada forum diskusi yang tersedia</div>`;
      return;
    }

    forumList.innerHTML = html;

    // Add toggle function to window scope that closes other sections
    window.toggleSection = function (sectionId, courseId) {
      const sectionContent = document.getElementById(sectionId);
      const toggleIcon = document.getElementById(`toggle-${sectionId}`);

      // Get all section contents within this course
      const allSections = document.querySelectorAll(
        `#${courseId} .section-content`
      );
      const allToggles = document.querySelectorAll(
        `#${courseId} .section-toggle`
      );

      // If this section is already active, just close it
      if (sectionContent.classList.contains("active")) {
        sectionContent.classList.remove("active");
        toggleIcon.classList.add("collapsed");
        return;
      }

      // Otherwise, close all sections and open this one
      allSections.forEach((section) => {
        section.classList.remove("active");
      });

      allToggles.forEach((toggle) => {
        toggle.classList.add("collapsed");
      });

      // Open this section
      sectionContent.classList.add("active");
      toggleIcon.classList.remove("collapsed");
    };

    // Add Copy Links functionality
    const copyButton = document.getElementById("copy-all-links");
    if (copyButton) {
      copyButton.addEventListener("click", function () {
        // Collect all course and item links
        let linkText = "";

        // Get all course cards
        const courseCards = document.querySelectorAll(".course-card");

        courseCards.forEach((course) => {
          const courseName = course.getAttribute("data-course-name");
          const courseUrl = course.getAttribute("data-course-url");

          // Add course name and URL
          linkText += `${courseName} : ${courseUrl}\n`;

          // Get all items with URLs
          const items = course.querySelectorAll(
            "[data-item-name][data-item-url]"
          );

          items.forEach((item) => {
            const itemName = item.getAttribute("data-item-name");
            const itemUrl = item.getAttribute("data-item-url");
            const itemType = item.getAttribute("data-item-type") || "";

            // Add item name and URL
            if (itemType) {
              linkText += `${itemType} - ${itemName} : ${itemUrl}\n`;
            } else {
              linkText += `${itemName} : ${itemUrl}\n`;
            }
          });

          // Add a separator between courses
          linkText += "\n";
        });

        // Copy to clipboard
        navigator.clipboard
          .writeText(linkText)
          .then(() => {
            // Show success message
            copyButton.innerHTML = '<i class="fas fa-check"></i> Copied!';
            copyButton.classList.add("copied");

            // Reset button after 2 seconds
            setTimeout(() => {
              copyButton.innerHTML =
                '<i class="fas fa-copy"></i> Copy All Links';
              copyButton.classList.remove("copied");
            }, 2000);
          })
          .catch((err) => {
            console.error("Failed to copy links: ", err);
            copyButton.innerHTML = '<i class="fas fa-times"></i> Failed!';

            // Reset button after 2 seconds
            setTimeout(() => {
              copyButton.innerHTML =
                '<i class="fas fa-copy"></i> Copy All Links';
            }, 2000);
          });
      });
    }

    // Add styles - this function needs to be defined elsewhere
    if (typeof addStyles === "function") {
      addStyles();
    }

    // Helper functions
    function getMaterialIcon(templateType) {
      switch (templateType) {
        case "BUKU_ISBN":
          return '<i class="fas fa-book"></i>';
        case "VIDEO_AJAR":
          return '<i class="fas fa-video"></i>';
        case "POWER_POINT":
          return '<i class="fas fa-file-powerpoint"></i>';
        case "ARTIKEL_RISET":
          return '<i class="fas fa-file-alt"></i>';
        case "MATERI_LAINNYA":
          return '<i class="fas fa-folder-open"></i>';
        default:
          return '<i class="fas fa-file"></i>';
      }
    }

    function getItemIcon(templateType) {
      switch (templateType) {
        case "PRE_TEST":
        case "POST_TEST":
          return '<i class="fas fa-tasks"></i>';
        case "FORUM_DISKUSI":
          return '<i class="fas fa-comments"></i>';
        case "PENUGASAN_TERSTRUKTUR":
          return '<i class="fas fa-clipboard-list"></i>';
        case "KUESIONER":
          return '<i class="fas fa-poll"></i>';
        default:
          return '<i class="fas fa-file"></i>';
      }
    }

    function getActionText(templateType) {
      switch (templateType) {
        case "PRE_TEST":
        case "POST_TEST":
          return "Mulai Quiz"; // Always show "Mulai Quiz" for PRE_TEST and POST_TEST
        case "FORUM_DISKUSI":
          return "Buka Forum";
        case "PENUGASAN_TERSTRUKTUR":
          return "Lihat Tugas";
        case "KUESIONER":
          return "Isi Kuesioner";
        default:
          return "Buka";
      }
    }

    function getItemTypeText(templateType) {
      switch (templateType) {
        case "PRE_TEST":
          return "Pretest";
        case "POST_TEST":
          return "Posttest";
        case "FORUM_DISKUSI":
          return "Forum Diskusi";
        case "PENUGASAN_TERSTRUKTUR":
          return "Penugasan Terstruktur";
        case "KUESIONER":
          return "Kuesioner";
        default:
          return "";
      }
    }

    function addStyles() {
      // Check if styles are already added
      if (document.getElementById("forum-ui-styles")) return;

      const styleElement = document.createElement("style");
      styleElement.id = "forum-ui-styles";
      styleElement.textContent = `
      /* Forum UI Dark Theme - Max width 500px with Collapsible Sections */
      /* Course Card Styles */
      .course-card {
        background: #1e1e1e;
        border-radius: 8px;
        box-shadow: 0 2px 8px rgba(0, 0, 0, 0.2);
        margin-bottom: 8px;
        overflow: hidden;
        width: 100%;
        max-width: 500px;
        margin-left: auto;
        margin-right: auto;
        border: 1px solid #333;
        box-sizing: border-box;
      }
      
      .course-header {
        padding: 8px;
        background: #252525;
        border-left: 4px solid #0070f3;
        margin-bottom: 0;
        width: 100%;
        box-sizing: border-box;
      }
      
      .course-header-link {
        display: block;
        text-decoration: none;
        cursor: pointer;
        color: inherit;
        transition: all 0.2s;
      }
      
      .course-header-link:hover {
        background: #303030;
      }
      
      .course-header h2 {
        margin: 0;
        font-size: 14px;
        color: #eee;
      }
      
      .course-code {
        color: #aaa;
        font-size: 10px;
        margin: 0;
      }
      
      .course-content {
        padding: 0 8px 8px;
      }
      
      .section-card {
        background: #252525;
        border-radius: 8px;
        box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
        overflow: hidden;
        width: 100%;
        margin-top: 8px;
        border: 1px solid #333;
        box-sizing: border-box;
        transition: opacity 0.5s ease-out;
      }
      
      .section-hiding {
        opacity: 0;
      }
      
      .section-header {
        background: #333;
        color: white;
        padding: 6px 8px;
        cursor: pointer;
        display: flex;
        justify-content: space-between;
        align-items: center;
      }
      
      .section-header h3 {
        margin: 0;
        font-size: 12px;
      }
      
      .section-toggle {
        color: white;
        transition: transform 0.3s;
      }
      
      .section-toggle.collapsed {
        transform: rotate(-90deg);
      }
      
      .section-content {
        padding: 8px;
        display: none;
      }
      
      .section-content.active {
        display: block;
      }
      
      /* Section direct link button */
      .section-direct-link {
        margin-bottom: 10px;
        text-align: center;
      }
      
      .section-link-button {
        display: inline-flex;
        align-items: center;
        justify-content: center;
        gap: 6px;
        background: #0070f3;
        color: white;
        text-decoration: none;
        border-radius: 4px;
        padding: 6px 12px;
        font-size: 12px;
        transition: all 0.2s;
        width: 100%;
        box-sizing: border-box;
      }
      
      .section-link-button:hover {
        background: #0060df;
        transform: translateY(-2px);
      }
      
      /* Make images in forum content responsive */
      .responsive-content img {
        max-width: 100% !important;
        height: auto !important;
        width: 100% !important;
        margin: 10px 0;
        border-radius: 4px;
      }
      
      .materials-card {
        background: #1e1e1e;
        border-radius: 6px;
        padding: 12px;
        margin-bottom: 16px;
        border: 1px solid #333;
        width: 100%;
        box-sizing: border-box;
      }
      
      .materials-card h4 {
        margin-top: 0;
        margin-bottom: 12px;
        color: #eee;
        font-size: 15px;
      }
      
      .materials-list {
        display: grid;
        grid-template-columns: 1fr;
        gap: 8px;
      }
      
      .material-item {
        display: flex;
        align-items: center;
        padding: 10px;
        background: #252525;
        border-radius: 4px;
        text-decoration: none;
        color: #eee;
        transition: all 0.2s;
        border: 1px solid #333;
        width: 100%;
        box-sizing: border-box;
      }
      
      .material-item:hover {
        transform: translateY(-2px);
        box-shadow: 0 4px 8px rgba(0, 0, 0, 0.3);
        background: #282828;
      }
      
      .material-icon {
        margin-right: 10px;
        color: #0070f3;
        flex-shrink: 0;
      }
      
      .material-details {
        flex: 1;
        display: flex;
        justify-content: space-between;
        align-items: center;
        font-size: 14px;
      }
      
      .item-card {
        background: #1e1e1e;
        border: 1px solid #333;
        border-radius: 6px;
        padding: 12px;
        margin-bottom: 8px;
        width: 100%;
        box-sizing: border-box;
      }
      
      .item-header {
        display: flex;
        align-items: center;
        margin-bottom: 10px;
      }
      
      .item-icon {
        background: #252525;
        width: 36px;
        height: 36px;
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
        margin-right: 12px;
        color: #0070f3;
        flex-shrink: 0;
      }
      
      .item-details {
        flex: 1;
        display: flex;
        justify-content: space-between;
        align-items: center;
      }
      
      .item-details h4 {
        margin: 0;
        font-size: 14px;
        color: #eee;
      }
      
      .item-content {
        border-left: 3px solid #333;
        padding-left: 12px;
        
        margin: 12px 0;
        color: #aaa;
        font-size: 13px;
      }
      
      .item-file {
        margin: 12px 0;
      }
      
      .item-file a {
        color: #0070f3;
        text-decoration: none;
        display: flex;
        align-items: center;
        gap: 6px;
        font-size: 13px;
      }
      
      .item-action {
        display: flex;
        justify-content: flex-end;
        margin-top: 8px;
      }
      
      .action-button {
        background: #0070f3;
        color: white;
        padding: 4px 8px;
        border-radius: 4px;
        text-decoration: none;
        transition: all 0.2s;
        font-size: 12px;
      }
      
      .action-button:hover {
        background: #0060df;
      }
      
      .action-button.disabled {
        background: #333;
        color: #777;
        cursor: not-allowed;
      }
      
      .completion-badge {
        background: #00a550;
        color: white;
        padding: 3px 8px;
        border-radius: 12px;
        font-size: 11px;
        white-space: nowrap;
      }
      
      .duration-badge {
        background: #ff9800;
        color: white;
        padding: 3px 8px;
        border-radius: 12px;
        font-size: 11px;
        margin-left: 8px;
        white-space: nowrap;
      }
      
      .warning-message {
        background: #332b00;
        color: #ffd166;
        padding: 10px;
        border-radius: 4px;
        margin: 10px 0;
        font-size: 13px;
        border: 1px solid #554800;
      }
      
      .completed {
        border-left: 3px solid #00a550;
      }
      
      .has-warning {
        border-left: 3px solid #ffd166;
      }
      
      .forum-no-data {
        padding: 20px;
        text-align: center;
        color: #999;
        font-style: italic;
        max-width: 500px;
        margin: 0 auto;
      }
      
      /* Container for the entire forum */
      #forum-list {
        max-width: 500px;
        margin: 0 auto;
        box-sizing: border-box;
        width: 100%;
        margin-bottom: 125px;
      }
      
      /* Copy links button */
      .copy-links-container {
        text-align: center;
        display: flex;
        gap: 0.5em;
      }
      
      .copy-links-button {
        background: #0070f3;
        color: white;
        border: none;
        width: 100%;
        border-radius: 4px;
        padding: 8px 16px;
        cursor: pointer;
        transition: all 0.2s;
        display: inline-flex;
        align-items: center;
        gap: 8px;
        font-size: 14px;
      }
      
      .copy-links-button:hover {
        background: #0060df;
        transform: translateY(-2px);
      }
      
      .copy-links-button.copied {
        background: #00a550;
      }

      .presensi-button {
        background:rgb(0, 160, 32);
        color: white;
        border: none;
        width: 100%;
        border-radius: 4px;
        padding: 8px 16px;
        cursor: pointer;
        transition: all 0.2s;
        display: inline-flex;
        align-items: center;
        gap: 8px;
        font-size: 14px;
        text-decoration: none;
      }
      
      .presensi-button:hover {
        background:rgb(0, 122, 2);
        transform: translateY(-2px);
      }
      
      /* Responsive adjustments */
      @media (max-width: 480px) {
        .course-header h2 {
          font-size: 12px;
        }
        
        .section-header h3 {
          font-size: 12px;
        }
        
        .materials-card h4 {
          font-size: 12px;
        }
        
        .item-details h4 {
          font-size: 12px;
        }
        
        .action-button {
          padding: 6px 12px;
          font-size: 12px;
        }
      }

      /* Switch styles */
      .switch {
        position: relative;
        display: inline-block;
        width: 50px;
        height: 24px;
      }

      .switch input {
        opacity: 0;
        width: 0;
        height: 0;
      }

      .slider {
        position: absolute;
        cursor: pointer;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        background-color: #ccc;
        transition: .4s;
      }

      .slider:before {
        position: absolute;
        content: "";
        height: 16px;
        width: 16px;
        left: 4px;
        bottom: 4px;
        background-color: white;
        transition: .4s;
      }

      input:checked + .slider {
        background-color: #0070f3;
      }

      input:checked + .slider:before {
        transform: translateX(26px);
      }

      .slider.round {
        border-radius: 24px;
      }

      .slider.round:before {
        border-radius: 50%;
      }

      .token-button {
        background: #0070f3;
        color: white;
        border: none;
        padding: 8px 16px;
        border-radius: 4px;
        cursor: pointer;
        font-size: 12px;
        display: flex;
        align-items: center;
        justify-content: center;
        gap: 6px;
        transition: all 0.2s;
      }

      .token-button:hover {
        background: #0060df;
        transform: translateY(-1px);
      }

      /* Version Info Styles */
      .version-info {
        background: rgba(0, 112, 243, 0.05);
        border: 1px solid rgba(0, 112, 243, 0.1);
      }

      .version-display {
        display: flex;
        flex-direction: column;
        gap: 8px;
      }

      .version-current, .version-latest {
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: 4px 0;
      }

      .version-number {
        font-family: monospace;
        font-weight: bold;
        font-size: 13px;
      }

      .version-number.latest {
        color: #00a550;
      }

      .version-status {
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: 4px 0;
      }

      .version-status-text {
        font-size: 12px;
        font-weight: 500;
      }

      .version-status-text.up-to-date {
        color: #00a550;
      }

      .version-status-text.update-available {
        color: #0070f3;
      }

      .version-status-text.error {
        color: #f43f5e;
      }

      .version-actions {
        display: flex;
        gap: 8px;
        margin-top: 8px;
      }

      .version-btn {
        background: #0070f3;
        color: white;
        border: none;
        padding: 6px 12px;
        border-radius: 4px;
        cursor: pointer;
        font-size: 11px;
        display: flex;
        align-items: center;
        justify-content: center;
        gap: 4px;
        transition: all 0.2s;
        text-decoration: none;
        flex: 1;
      }

      .version-btn:hover {
        background: #0060df;
        transform: translateY(-1px);
      }

      .version-btn.secondary {
        background: #333;
        color: #ccc;
      }

      .version-btn.secondary:hover {
        background: #444;
        color: #fff;
      }

      .version-btn.update-available {
        background: #00a550;
        animation: pulse 2s infinite;
      }

      .version-btn.update-available:hover {
        background: #008f47;
      }

      .version-btn.up-to-date {
        background: #0070f3;
      }

      .version-btn.error {
        background: #f43f5e;
      }

      .version-btn.error:hover {
        background: #e11d48;
      }

      @keyframes pulse {
        0% { box-shadow: 0 0 0 0 rgba(0, 165, 80, 0.4); }
        70% { box-shadow: 0 0 0 10px rgba(0, 165, 80, 0); }
        100% { box-shadow: 0 0 0 0 rgba(0, 165, 80, 0); }
      }
      
      /* Forum Topics Styles */
      .forum-topics {
        display: flex;
        flex-wrap: wrap;
        gap: 6px;
        margin-top: 8px;
        padding-top: 8px;
        border-top: 1px solid rgba(255, 255, 255, 0.1);
      }
      
      .loading-topics,
      .no-topics,
      .error-topics {
        color: #666;
        font-size: 12px;
        font-style: italic;
      }
      
      .error-topics {
        color: #f43f5e;
      }
      
      .topic-badge {
        background:rgb(0, 51, 0);
        color:rgb(163, 255, 163);
        padding: 10px;
        border-radius: 4px;
        margin: 10px 0;
        font-size: 13px;
        border: 1px solid rgb(0, 85, 4);
       
        font-size: 11px;
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
        width: 100%;
        transition: all 0.2s ease;
        text-decoration: none;
        display: inline-block;
        cursor: pointer;
      }
      
      .topic-badge:hover {
        background: rgba(80, 129, 0, 0.48);
        transform: translateY(-1px);
        color:rgb(157, 255, 0);
        text-decoration: none;
        border: 1px solid rgb(157, 255, 0);
      }

      /* Notification Styles */
      #notifications-list {
        display: flex;
        flex-direction: column;
        gap: 8px;
      }

      .notification-item {
        background: rgba(255, 255, 255, 0.03);
        border-radius: 8px;
        padding: 12px;
        border: 1px solid rgba(255, 255, 255, 0.05);
        transition: all 0.2s ease;
      }

      .notification-item:hover {
        background: rgba(255, 255, 255, 0.05);
        border-color: rgba(255, 255, 255, 0.1);
      }

      .notification-item.clickable:hover {
        background: rgba(0, 112, 243, 0.1);
        border-color: rgba(0, 112, 243, 0.3);
        transform: translateY(-1px);
        box-shadow: 0 4px 12px rgba(0, 112, 243, 0.2);
      }

      .notification-item.clickable:hover {
        background: rgba(0, 112, 243, 0.1);
        border-color: rgba(0, 112, 243, 0.3);
        transform: translateY(-1px);
        box-shadow: 0 4px 12px rgba(0, 112, 243, 0.2);
      }

      .notification-header {
        display: flex;
        align-items: center;
        margin-bottom: 8px;
      }

      .notification-icon {
        background: rgba(0, 112, 243, 0.1);
        color: #0070f3;
        width: 32px;
        height: 32px;
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
        margin-right: 10px;
        font-size: 14px;
        flex-shrink: 0;
      }

      .notification-meta {
        flex: 1;
      }

      .notification-lecturer {
        font-weight: 600;
        color: #fff;
        font-size: 14px;
        margin-bottom: 2px;
      }

      .notification-time {
        font-size: 11px;
        color: rgba(255, 255, 255, 0.6);
      }


      .notification-title {
        font-weight: 500;
        color: #eee;
        font-size: 13px;
        margin-bottom: 4px;
        line-height: 1.4;
      }

      .notification-text {
        font-size: 12px;
        color: rgba(255, 255, 255, 0.8);
        line-height: 1.4;
      }

      .no-notifications {
        text-align: left;
        padding: 20px;
        background: rgba(255, 255, 255, 0.02);
        border: 1px solid rgba(255, 255, 255, 0.03);
        border-radius: 8px;
      }

      .no-notifications p {
        margin: 0;
        color: rgba(255, 255, 255, 0.7);
        font-size: 14px;
      }

      .no-notifications small {
        color: rgba(255, 255, 255, 0.5);
        font-size: 12px;
      }
    `;

      document.head.appendChild(styleElement);
    }
  }

  // Update notifications UI
  function updateNotificationsUI() {
    const notificationsTab = document.getElementById("notifications-tab");
    if (!notificationsTab) return;

    const notificationsList = document.getElementById("notifications-list");
    if (!notificationsList) return;

    // Filter notifications that are less than 5 days old
    const fiveDaysAgo = new Date();
    fiveDaysAgo.setDate(fiveDaysAgo.getDate() - 5);

    const recentNotifications = lecturerNotifications.filter((notification) => {
      const notificationDate = new Date(notification.createdAt);
      return notificationDate >= fiveDaysAgo;
    });

    if (recentNotifications.length === 0) {
      notificationsList.innerHTML = `
        <div class="notification-item no-notifications">
          <div class="notification-content">
            <p>Belum ada balasan dosen</p>
            <small>Ketika dosen membalas postingan Anda, notifikasi akan muncul di sini</small>
          </div>
        </div>
      `;
      return;
    }

    let html = "";
    recentNotifications.forEach((notification, index) => {
      const createdDate = new Date(notification.createdAt).toLocaleString(
        "id-ID",
        {
          year: "numeric",
          month: "short",
          day: "numeric",
          hour: "2-digit",
          minute: "2-digit",
        }
      );

      // Create topic URL if we have the necessary information

      const courseCode = notification.kode_course || "unknown-course";
      const forumId =
        notification.forumId ||
        notification.id_trx_course_sub_section ||
        "unknown-forum";
      const topicId =
        notification.topicId || notification.id || "unknown-topic";
      const topicUrl = `https://mentari.unpam.ac.id/u-courses/${courseCode}/forum/${forumId}/topics/${topicId}`;
      const isClickable = true;

      const notificationId = `notification-${notification.id}`;

      if (isClickable) {
        html += `
        <div class="notification-item clickable" id="${notificationId}" style="cursor: pointer; position: relative;">
          <a href="${topicUrl}" class="notification-link" style="position: absolute; top: 0; left: 0; right: 0; bottom: 0; z-index: 1; text-decoration: none;"></a>
          <div style="position: relative; z-index: 2; pointer-events: none;">
            <div class="notification-header">
              <div class="notification-icon">
                <i class="fas fa-user-graduate"></i>
              </div>
              <div class="notification-meta">
                <div class="notification-lecturer">${notification.lecturerName}</div>
                <div class="notification-time">${createdDate}</div>
              </div>
            </div>
            <div class="notification-content">
              <div class="notification-text">${notification.content}</div>
            </div>
          </div>
        </div>`;
      } else {
        html += `
        <div class="notification-item" id="${notificationId}">
          <div class="notification-header">
            <div class="notification-icon">
              <i class="fas fa-user-graduate"></i>
            </div>
            <div class="notification-meta">
              <div class="notification-lecturer">${notification.lecturerName}</div>
              <div class="notification-time">${createdDate}</div>
            </div>
          </div>
          <div class="notification-content">
            <div class="notification-text">${notification.content}</div>
          </div>
        </div>`;
      }
    });

    notificationsList.innerHTML = html;

    // Add click event listeners to notification items
    document
      .querySelectorAll(".notification-item.clickable")
      .forEach((item, index) => {
        item.addEventListener("click", function (e) {
          if (e.target.closest("a.notification-link")) {
            e.preventDefault();
            const href = e.target
              .closest("a.notification-link")
              .getAttribute("href");

            // Simpan ID elemen yang akan discroll ke
            const notificationId = item.id.replace("notification-", "");
            sessionStorage.setItem("scrollToNotificationId", notificationId);

            // Navigate to the URL
            window.location.href = href;
          }
        });
      });

    // Function to scroll to element
    function scrollToElement() {
      console.log("Memulai fungsi scrollToElement");
      const notificationId = sessionStorage.getItem("scrollToNotificationId");

      if (!notificationId) {
        console.log("Tidak ada ID notifikasi yang tersimpan");
        return;
      }

      // Hapus ID setelah digunakan
      sessionStorage.removeItem("scrollToNotificationId");

      console.log(
        'Mencari elemen dengan ID yang dimulai dengan "notification-"'
      );

      // Cari elemen dengan ID yang sesuai
      const element = document.getElementById(`${notificationId}`);
      console.log("Mencari elemen dengan ID:", `${notificationId}`);
      console.log("Elemen ditemukan:", element);

      if (element) {
        console.log("Elemen ditemukan:", element);
        console.log("Posisi elemen:", element.getBoundingClientRect());

        // Tambahkan delay 3 detik sebelum scroll
        console.log("Menunggu 3 detik sebelum scroll...");

        setTimeout(() => {
          console.log("Memulai scroll ke elemen...");

          // Scroll ke elemen
          element.scrollIntoView({
            behavior: "smooth",
            block: "center",
            inline: "nearest",
          });

          console.log("Scroll selesai");

          // Efek highlight
          console.log("Menambahkan efek highlight");
          element.style.transition = "background-color 1s ease";
          element.style.backgroundColor = "rgba(255, 221, 0, 0.3)";

          // Hapus highlight setelah 2 detik
          setTimeout(() => {
            console.log("Menghapus highlight");
            element.style.backgroundColor = "";
          }, 2000);
        }, 100); // Delay 3 detik
      } else {
        console.error("Elemen tidak ditemukan dengan ID:", elementId);
        console.log("Isi dokumen:", document.body.innerHTML);
      }
    }

    // Try scrolling when DOM is ready
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", scrollToElement);
    } else {
      setTimeout(scrollToElement, 0);
    }

    // Also try scrolling when window loads (as a fallback)
    window.addEventListener("load", scrollToElement);
  }

  // Update student data UI
  function updateStudentUI(courseDataList) {
    const studentTab = document.getElementById("student-data-tab");
    if (!studentTab) return;

    const studentList = document.getElementById("student-list");
    if (!studentList) return;

    // Extract unique students from all courses
    const allUniqueStudents = [];
    const studentMap = new Map(); // Use Map to track unique students by NIM

    courseDataList.forEach((course) => {
      if (course && course.peserta && course.peserta.length > 0) {
        course.peserta.forEach((student) => {
          if (!studentMap.has(student.nim)) {
            studentMap.set(student.nim, {
              ...student,
              absen: allUniqueStudents.length + 1, // Add sequential absen number
            });
            allUniqueStudents.push(studentMap.get(student.nim));
          }
        });
      }
    });

    // Check if we have students
    if (allUniqueStudents.length === 0) {
      studentList.innerHTML = `<div class="student-no-data">Tidak ada data mahasiswa</div>`;
      return;
    }

    // Create grouping interface
    const groupingForm = `
    <div class="data-card grouping-form">
      <h3 class="card-title">Pengelompokan Mahasiswa</h3>
      <div class="input-group">
        <input type="number" id="group-count" min="1" max="${allUniqueStudents.length}" value="1" class="group-input" placeholder="Jumlah Kelompok">
        <button id="create-groups-btn" class="primary-btn">Buat Kelompok</button>
      </div>
      <div class="grouping-options">
        <label class="radio-container">
          <input type="radio" name="grouping-method" value="sequential" checked>
          <span class="radio-label">Berurutan</span>
        </label>
        <label class="radio-container">
          <input type="radio" name="grouping-method" value="random">
          <span class="radio-label">Acak</span>
        </label>
      </div>
    </div>
  `;

    // Group results card (hidden initially, moved above student list)
    const groupResultsCard = `
    <div class="data-card" id="group-results-card" style="display: none;">
      <div class="card-header">
        <h3 class="card-title">Hasil Pengelompokan</h3>
        <div class="card-actions">
          <button id="copy-all-groups-btn" class="secondary-btn">
            <i class="fas fa-copy"></i> Copy Data
          </button>
        </div>
      </div>
      <div id="group-results"></div>
    </div>
  `;

    // Student list with copy button
    let studentsHtml = `
    ${groupingForm}
    ${groupResultsCard}
    <div class="data-card">
      <div class="card-header">
        <h3 class="card-title">Daftar Mahasiswa</h3>
        <div class="card-actions">
          <button id="copy-all-students-btn" class="secondary-btn">
            <i class="fas fa-copy"></i> Copy Data
          </button>
        </div>
      </div>
      <div class="student-count">Total Mahasiswa: ${allUniqueStudents.length}</div>
      <div class="students-container">
  `;

    allUniqueStudents.forEach((student) => {
      studentsHtml += `
      <div class="student-item" data-nim="${student.nim}">
        <div class="student-info">
          <div class="student-inline">
            <span class="student-absen">${student.absen}</span>
            <p class="student-item-title">${student.nama_mahasiswa}</p>
            <span class="token-badge">${student.nim}</span>
          </div>
        </div>
      </div>
    `;
    });

    studentsHtml += `
      </div>
    </div>
  `;

    studentList.innerHTML = studentsHtml;

    // Add event listener to the create groups button
    document
      .getElementById("create-groups-btn")
      .addEventListener("click", () => {
        const groupCount = parseInt(
          document.getElementById("group-count").value,
          10
        );
        const groupingMethod = document.querySelector(
          'input[name="grouping-method"]:checked'
        ).value;

        if (groupCount < 1 || groupCount > allUniqueStudents.length) {
          alert(
            `Jumlah kelompok harus antara 1 dan ${allUniqueStudents.length}`
          );
          return;
        }

        createGroups(allUniqueStudents, groupCount, groupingMethod);
        document.getElementById("group-results-card").style.display = "block";

        // Scroll to group results with an offset to keep tabs visible
        const tabsHeight =
          document.querySelector(".token-tabs")?.offsetHeight || 50;
        const scrollPosition =
          document.getElementById("group-results-card").offsetTop -
          tabsHeight -
          10;

        window.scrollTo({
          top: scrollPosition,
          behavior: "smooth",
        });
      });

    // Add copy functionality for student data
    document
      .getElementById("copy-all-students-btn")
      .addEventListener("click", () => {
        const studentData = allUniqueStudents
          .map(
            (student) =>
              `${student.absen}. ${student.nama_mahasiswa} (${student.nim})`
          )
          .join("\n");

        copyToClipboard(studentData, "Data mahasiswa berhasil disalin");
      });

    // Add CSS for the new elements
    if (!document.getElementById("enhanced-styles")) {
      const style = document.createElement("style");
      style.id = "enhanced-styles";
      style.textContent = `
      /* Card Styles */
      .data-card {
        background: #1e1e1e;
        border-radius: 8px;
        margin-bottom: 9rem;
        padding: 16px;
        box-shadow: 0 2px 8px rgba(0, 0, 0, 0.2);
        border: 1px solid #333;
      }

      #group-results-card{
        margin-bottom: 0;
      }
      
      .card-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 16px;
        padding-bottom: 8px;
        border-bottom: 1px solid #333;
      }
      
      .card-title {
        font-size: 16px;
        font-weight: 600;
        color: #eee;
        margin: 0 0 12px 0;
      }
      
      .card-actions {
        display: flex;
        gap: 8px;
      }
      
      /* Button Styles */
      .primary-btn {
        background: #0070f3;
        color: white;
        border: none;
        padding: 8px 16px;
        border-radius: 4px;
        cursor: pointer;
        font-weight: 500;
        transition: background 0.2s;
      }
      
      .primary-btn:hover {
        background: #0060df;
      }
      
      .secondary-btn {
        background: #333;
        color: white;
        border: none;
        padding: 8px 16px;
        border-radius: 4px;
        cursor: pointer;
        font-weight: 500;
        transition: background 0.2s;
        display: flex;
        align-items: center;
        gap: 6px;
      }
      
      .secondary-btn:hover {
        background: #444;
      }
      
      /* Grouping Form */
      .grouping-form {
        margin-bottom: 0px;
      }
      
      .input-group {
        display: flex;
        gap: 8px;
        margin-bottom: 12px;
      }
      
      .group-input {
        flex: 1;
        background: #252525;
        border: 1px solid #333;
        color: #eee;
        padding: 8px 12px;
        border-radius: 4px;
        font-size: 14px;
      }
      
      .grouping-options {
        display: flex;
        gap: 16px;
      }
      
      .radio-container {
        display: flex;
        align-items: center;
        cursor: pointer;
      }
      
      .radio-label {
        margin-left: 4px;
        font-size: 14px;
        color: #ccc;
      }
      
      /* Student List */
      .students-container {
        display: grid;
        grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
        gap: 12px;
        margin-top: 12px;
      }
      
      .student-item {
        background: #252525;
        border-radius: 6px;
        padding: 10px;
        transition: transform 0.2s, box-shadow 0.2s;
        border: 1px solid #333;
      }
      
      .student-item:hover {
        transform: translateY(-2px);
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
      }
      
      /* New inline student info style */
      .student-inline {
        display: flex;
        align-items: center;
        gap: 8px;
        flex-wrap: nowrap;
        width: 100%;
      }
      
      .student-absen {
        display: flex;
        align-items: center;
        justify-content: center;
        min-width: 20px;
        height: 20px;
        background:rgb(182, 243, 0);
        color: #252525;
        border-radius: 5px;
        font-size: 10px;
        font-weight: bold;
        flex-shrink: 0;
      }
      
      .student-item-title {
        font-weight: 500;
        margin: 0;
        font-size: 14px;
        color: #eee;
        flex: 1;
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
      }
      
      .token-badge {
        background: #333;
        color: #aaa;
        font-size: 12px;
        padding: 2px 6px;
        border-radius: 4px;
        font-family: monospace;
        flex-shrink: 0;
      }
      
      .student-count {
        color: #999;
        font-size: 13px;
        margin-top: 4px;
      }
      
      /* Group Results */
      #group-results {
        display: grid;
        grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
        gap: 16px;
        margin-top: 16px;
      }
      
      .group-container {
        background: #252525;
        border-radius: 6px;
        overflow: hidden;
        border: 1px solid #333;
      }
      
      .group-header {
        background: #333;
        padding: 10px 12px;
        font-weight: bold;
        display: flex;
        justify-content: space-between;
        color: #eee;
      }
      
      .group-count {
        font-size: 12px;
        color: #aaa;
      }
      
      .group-members {
        padding: 8px;
      }
      
      .group-member {
        display: flex;
        padding: 8px;
        border-bottom: 1px solid #333;
        align-items: center;
      }
      
      .group-member:last-child {
        border-bottom: none;
      }
      
      .member-absen {
        min-width: 20px;
        height: 20px;
        background:rgb(45, 143, 255);
        color: #252525;
        border-radius: 5px;
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 10px;
        margin-right: 10px;
        color: white;
        flex-shrink: 0;
      }
      
      .member-name {
        flex: 1;
        font-size: 14px;
        color: #eee;
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
      }
      
      .member-nim {
        color: #aaa;
        font-size: 12px;
        font-family: monospace;
        margin-left: 8px;
        flex-shrink: 0;
      }
      
      /* Tab styles - added to ensure tabs stay visible */
      .token-tabs {
        display: flex;
        position: sticky;
        top: 0;
        z-index: 100;
      }
      
      .token-tab {
        padding: 8px 16px;
        background: transparent;
        border: none;
        color: #ccc;
        cursor: pointer;
        font-weight: 500;
        border-bottom: 2px solid transparent;
      }
      
      .token-tab:hover {
        color: #fff;
      }
      
      .token-tab.active {
        color: #fff;
        border-bottom: 2px solid #0070f3;
        background: #1e1e1e;
      }
      
      /* Toast notification */
      .toast {
        position: fixed;
        bottom: 20px;
        right: 20px;
        background:#1e1e1e;
        color:rgb(0, 221, 15);
        padding: 12px 20px;
        border-radius: 4px;
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
        border: 1px solid #333;
        display: flex;
        align-items: center;
        gap: 8px;
        z-index: 100099;
        animation: fadeIn 0.3s, fadeOut 0.3s 2.7s;
        animation-fill-mode: forwards;
      }
      
      @keyframes fadeIn {
        from { opacity: 0; transform: translateY(20px); }
        to { opacity: 1; transform: translateY(0); }
      }
      
      @keyframes fadeOut {
        from { opacity: 1; transform: translateY(0); }
        to { opacity: 0; transform: translateY(20px); }
      }
      
      /* Responsive adjustments */
      @media (max-width: 768px) {
        .students-container, 
        #group-results {
          grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
        }
        
        
        .card-header {
          align-items: flex-start;
        }
        
        .card-actions {
          margin-top: 8px;
        }
      }
      
      @media (max-width: 480px) {
        /*
        .students-container,
        #group-results {
          grid-template-columns: 1fr;
        }
        */
        
        
      }
    `;
      document.head.appendChild(style);
    }
  }

  // Function to create and display groups with improved distribution logic
  function createGroups(students, groupCount, method) {
    const groupResultsDiv = document.getElementById("group-results");

    // Make a copy of the students array to avoid modifying the original
    let studentsToDivide = [...students];

    // Randomize if needed
    if (method === "random") {
      for (let i = studentsToDivide.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [studentsToDivide[i], studentsToDivide[j]] = [
          studentsToDivide[j],
          studentsToDivide[i],
        ];
      }
    }

    // Calculate base size and remainder
    const totalStudents = studentsToDivide.length;
    const baseSize = Math.floor(totalStudents / groupCount);
    const remainder = totalStudents % groupCount;

    // Create groups with improved distribution
    const groups = [];
    let currentIndex = 0;

    for (let i = 0; i < groupCount; i++) {
      // Calculate group size: if i < remainder, add 1 extra student
      // This ensures the extra students are distributed evenly among the first 'remainder' groups
      const groupSize = baseSize + (i < remainder ? 1 : 0);

      // Skip creating empty groups
      if (groupSize > 0) {
        const groupMembers = studentsToDivide.slice(
          currentIndex,
          currentIndex + groupSize
        );
        groups.push(groupMembers);
        currentIndex += groupSize;
      }
    }

    // Alternative distribution logic for special cases
    const lastGroupIndex = groups.length - 1;

    // If the last group has significantly fewer members (less than half of average)
    if (
      groups.length > 1 &&
      groups[lastGroupIndex].length < baseSize / 2 &&
      groups[lastGroupIndex].length <= 2
    ) {
      const lastGroup = groups.pop(); // Remove the last group

      // Distribute these students to other groups
      lastGroup.forEach((student, index) => {
        // Add each student to a different group, cycling through all groups
        const targetGroupIndex = index % groups.length;
        groups[targetGroupIndex].push(student);
      });
    }

    // Generate HTML
    let html = "";
    groups.forEach((group, index) => {
      html += `
      <div class="group-container">
        <div class="group-header">
          <div>Kelompok ${index + 1}</div>
          <div class="group-count">${group.length} mahasiswa</div>
        </div>
        <div class="group-members">
    `;

      group.forEach((student) => {
        html += `
        <div class="group-member">
          <div class="member-absen">${student.absen}</div>
          <div class="member-name">${student.nama_mahasiswa}</div>
          <div class="member-nim">${student.nim}</div>
        </div>
      `;
      });

      html += `
        </div>
      </div>
    `;
    });

    groupResultsDiv.innerHTML = html;

    // Add event listener for copying all groups data
    document
      .getElementById("copy-all-groups-btn")
      .addEventListener("click", () => {
        let groupsData = "";

        groups.forEach((group, index) => {
          groupsData += `KELOMPOK ${index + 1} (${group.length} mahasiswa)\n`;

          group.forEach((student) => {
            groupsData += `${student.absen}. ${student.nama_mahasiswa} (${student.nim})\n`;
          });

          groupsData += "\n";
        });

        copyToClipboard(groupsData, "Data kelompok berhasil disalin");
      });
  }

  // Function to copy text to clipboard and show notification
  function copyToClipboard(text, message) {
    navigator.clipboard
      .writeText(text)
      .then(() => {
        showToast(message);
      })
      .catch((err) => {
        showToast("Gagal menyalin: " + err);
      });
  }

  // Function to show toast notification
  function showToast(message) {
    // Remove existing toast if any
    const existingToast = document.querySelector(".toast");
    if (existingToast) {
      existingToast.remove();
    }

    // Create new toast
    const toast = document.createElement("div");
    toast.className = "toast";
    toast.innerHTML = `
    <i class="fas fa-check-circle"></i>
    <span>${message}</span>
  `;

    document.body.appendChild(toast);

    // Remove toast after 3 seconds
    setTimeout(() => {
      toast.remove();
    }, 3000);
  }

  // Function to copy text to clipboard and show notification
  function copyToClipboard(text, message) {
    navigator.clipboard
      .writeText(text)
      .then(() => {
        showToast(message);
      })
      .catch((err) => {
        showToast("Gagal menyalin: " + err);
      });
  }

  // Function to show toast notification
  function showToast(message) {
    // Remove existing toast if any
    const existingToast = document.querySelector(".toast");
    if (existingToast) {
      existingToast.remove();
    }

    // Create new toast
    const toast = document.createElement("div");
    toast.className = "toast";
    toast.innerHTML = `
    <i class="fas fa-check-circle"></i>
    <span>${message}</span>
  `;

    document.body.appendChild(toast);

    // Remove toast after 3 seconds
    setTimeout(() => {
      toast.remove();
    }, 3000);
  }

  // Save token and display user info
  function saveToken(token, source) {
    if (!token) return;
    if (token.startsWith("Bearer ")) token = token.substring(7);

    const tokenInfo = decodeToken(`Bearer ${token}`);
    if (!tokenInfo) return;

    if (authToken !== token) {
      authToken = token;
      userInfo = tokenInfo;

      console.log("Token: " + token);
      console.log("Info Pengguna:");
      console.log(`- Nama: ${tokenInfo.fullname}`);
      console.log(`- Username: ${tokenInfo.username}`);
      console.log(`- Role: ${tokenInfo.role}`);
      console.log(`- Expired: ${tokenInfo.expires}`);

      // Simpan token dan userInfo ke localStorage
      saveToLocalStorage(STORAGE_KEYS.AUTH_TOKEN, token);
      saveToLocalStorage(STORAGE_KEYS.USER_INFO, tokenInfo);

      // Update UI
      updateTokenUI(token, tokenInfo);
      updateUserInfoUI(tokenInfo);

      // Fetch courses data after token is captured (if belum ada data)
      const cachedCourseData = getFromLocalStorage(STORAGE_KEYS.COURSE_DATA);
      if (!cachedCourseData || cachedCourseData.length === 0) {
        setTimeout(() => fetchCoursesListAndDetails(), 1000);
      }
    }
  }

  // Fetch individual course data
  async function fetchAndDisplayIndividualCourseData(courseCode) {
    if (!authToken) return null;

    try {
      const apiUrl = `https://mentari.unpam.ac.id/api/user-course/${courseCode}`;

      const response = await fetch(apiUrl, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${authToken}`,
          "Content-Type": "application/json",
        },
        cache: "no-store",
      });

      if (!response.ok) throw new Error(`API error: ${response.status}`);

      const data = await response.json();

      console.log(`URL: /api/user-course/${courseCode}`);
      console.log(`Kode Course: ${courseCode}`);
      console.log(`Custom URL: ${createCustomUrl(courseCode)}`);
      console.log(`Response:`, data);
      console.log("---");

      return data;
    } catch (error) {
      console.error(`Error fetching course ${courseCode}:`, error);
      return null;
    }
  }

  // Fetch all courses
  async function fetchCoursesListAndDetails(forceRefresh = false) {
    // Cek apakah sudah ada data tersimpan dan tidak dipaksa refresh
    if (!forceRefresh) {
      const cachedCourseData = getFromLocalStorage(STORAGE_KEYS.COURSE_DATA);
      if (cachedCourseData && cachedCourseData.length > 0) {
        console.log(
          "Menggunakan data course dari cache:",
          cachedCourseData.length,
          "courses"
        );
        courseDataList = cachedCourseData;
        updateForumUI(courseDataList);
        updateStudentUI(courseDataList);
        return cachedCourseData;
      }
    }

    if (isHandlingCourseApiRequest || !authToken) return;

    try {
      isHandlingCourseApiRequest = true;
      const apiUrl = `https://mentari.unpam.ac.id/api/user-course?page=1&limit=50`;

      const response = await fetch(apiUrl, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${authToken}`,
          "Content-Type": "application/json",
        },
        cache: "no-store",
      });

      if (!response.ok) throw new Error(`API error: ${response.status}`);

      const data = await response.json();

      console.log("Total courses: " + data.data.length);

      courseDataList = [];
      for (const course of data.data) {
        const courseData = await fetchAndDisplayIndividualCourseData(
          course.kode_course
        );
        if (courseData) {
          courseDataList.push(courseData);
        }
      }

      // Simpan courseDataList ke localStorage
      saveToLocalStorage(STORAGE_KEYS.COURSE_DATA, courseDataList);
      saveToLocalStorage(STORAGE_KEYS.LAST_UPDATE, new Date().toLocaleString());

      // Update forum UI after fetching all courses
      updateForumUI(courseDataList);

      // Update student UI after fetching all courses
      updateStudentUI(courseDataList);

      // Update notifications UI
      updateNotificationsUI();

      return data;
    } catch (error) {
      console.error(`Error fetching courses:`, error);
    } finally {
      isHandlingCourseApiRequest = false;
    }
  }

  // Check storages for tokens
  function checkStorages() {
    // Cek apakah ada token yang tersimpan di localStorage
    const savedToken = getFromLocalStorage(STORAGE_KEYS.AUTH_TOKEN);
    const savedUserInfo = getFromLocalStorage(STORAGE_KEYS.USER_INFO);

    if (savedToken && savedUserInfo) {
      authToken = savedToken;
      userInfo = savedUserInfo;

      // Update UI dengan data yang tersimpan
      updateTokenUI(savedToken, savedUserInfo);
      updateUserInfoUI(savedUserInfo);

      // Load course data jika tersedia
      const cachedCourseData = getFromLocalStorage(STORAGE_KEYS.COURSE_DATA);
      if (cachedCourseData && cachedCourseData.length > 0) {
        courseDataList = cachedCourseData;
        updateForumUI(courseDataList);
        updateStudentUI(courseDataList);
        updateNotificationsUI();
      }

      return true;
    }

    // Jika tidak ada token tersimpan, lakukan pengecekan seperti biasa
    const possibleKeys = [
      "token",
      "auth_token",
      "authToken",
      "access_token",
      "accessToken",
      "jwt",
      "idToken",
      "id_token",
    ];

    // Check localStorage and sessionStorage for common token keys
    for (const key of possibleKeys) {
      const localValue = localStorage.getItem(key);
      if (localValue) saveToken(localValue, `localStorage.${key}`);

      const sessionValue = sessionStorage.getItem(key);
      if (sessionValue) saveToken(sessionValue, `sessionStorage.${key}`);
    }

    // Check all storage items for JWT format
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      const value = localStorage.getItem(key);
      if (typeof value === "string" && value.startsWith("eyJ")) {
        saveToken(value, `localStorage.${key}`);
      }
    }

    for (let i = 0; i < sessionStorage.length; i++) {
      const key = sessionStorage.key(i);
      const value = sessionStorage.getItem(key);
      if (typeof value === "string" && value.startsWith("eyJ")) {
        saveToken(value, `sessionStorage.${key}`);
      }
    }

    return false;
  }

  // Intercept XHR requests
  function interceptXHR() {
    const originalOpen = XMLHttpRequest.prototype.open;
    const originalSetRequestHeader = XMLHttpRequest.prototype.setRequestHeader;

    XMLHttpRequest.prototype.open = function () {
      this._method = arguments[0];
      this._url = arguments[1];
      this._headers = {};
      return originalOpen.apply(this, arguments);
    };

    XMLHttpRequest.prototype.setRequestHeader = function (header, value) {
      this._headers = this._headers || {};
      this._headers[header] = value;

      if (header.toLowerCase() === "authorization" && value) {
        saveToken(value, `XHR Request`);
      }

      return originalSetRequestHeader.apply(this, arguments);
    };
  }

  // Intercept Fetch API
  function interceptFetch() {
    const originalFetch = window.fetch;

    window.fetch = function (resource, init = {}) {
      const url = typeof resource === "string" ? resource : resource.url;

      if (init && init.headers) {
        let authHeader = null;

        if (init.headers instanceof Headers) {
          authHeader =
            init.headers.get("authorization") ||
            init.headers.get("Authorization");
        } else if (typeof init.headers === "object") {
          authHeader = init.headers.authorization || init.headers.Authorization;
        }

        if (authHeader) {
          saveToken(authHeader, `Fetch Request`);
        }
      }

      return originalFetch.apply(this, arguments);
    };
  }

  // Auto click the Dashboard button (hanya jika data belum ada)
  function clickDashboardButton() {
    // Cek apakah sudah ada data tersimpan
    const cachedCourseData = getFromLocalStorage(STORAGE_KEYS.COURSE_DATA);
    if (cachedCourseData && cachedCourseData.length > 0) {
      console.log(
        "Data course sudah tersedia, tidak perlu klik dashboard otomatis"
      );
      return;
    }

    // Find and click the Dashboard button
    const dashboardButtons = Array.from(document.querySelectorAll("button"));
    const dashboardButton = dashboardButtons.find((button) => {
      const spanElement = button.querySelector("span.MuiTypography-root");
      return spanElement && spanElement.textContent === "Dashboard";
    });

    if (dashboardButton) {
      console.log("Dashboard button ditemukan! Mengklik...");
      dashboardButton.click();
    } else {
      console.warn("Dashboard button tidak ditemukan!");
    }
  }

  // Expose functions to window
  window.toggleTokenPopup = function () {
    const popup = document.getElementById("token-runner-popup");
    if (!popup) {
      createPopupUI();
    } else {
      toggleCollapse();
    }
  };

  window.getAuthToken = function () {
    if (authToken) {
      console.log("Token: " + authToken);
      return authToken;
    } else {
      console.log("Belum ada token yang terdeteksi");
      return null;
    }
  };

  window.checkCourse = function () {
    const courseCode = extractCourseCodeFromUrl(window.location.href);

    if (courseCode) {
      console.log(`Kode Course: ${courseCode}`);
      console.log(`Custom URL: ${createCustomUrl(courseCode)}`);
    } else {
      console.log("Tidak ada kode course pada URL ini");
    }
  };

  window.fetchCourse = function (courseCode) {
    if (!courseCode) {
      console.log(
        "Masukkan kode course. Contoh: fetchCourse('20242-06SIFM003-22SIF0352')"
      );
      return;
    }

    if (!authToken) {
      console.log("Tidak ada token yang terdeteksi");
      return;
    }

    return fetchAndDisplayIndividualCourseData(courseCode);
  };

  window.fetchCoursesList = fetchCoursesListAndDetails;

  // Expose fetchForumReplies function
  window.fetchForumReplies = fetchForumReplies;

  // Fungsi untuk menghapus cache data
  window.clearCacheData = function () {
    localStorage.removeItem(STORAGE_KEYS.COURSE_DATA);
    localStorage.removeItem(STORAGE_KEYS.LAST_UPDATE);
    console.log(
      "Cache data berhasil dihapus. Refresh halaman untuk mengambil data baru."
    );
  };

  // Initialize
  function init() {
    createPopupUI();
    interceptXHR();
    interceptFetch();

    // Cek apakah ada data di localStorage
    const hasExistingData = checkStorages();

    // Auto check for updates every 6 hours
    setTimeout(() => {
      autoCheckUpdate();
    }, 2000); // Initial check after 2 seconds

    // Set up interval for checking every 6 hours
    setInterval(() => {
      autoCheckUpdate();
    }, 6 * 60 * 60 * 1000); // 6 hours in milliseconds

    // Jika tidak ada data, coba klik card
    if (!hasExistingData) {
      setTimeout(() => {
        // Temukan elemen dengan kelas "card MuiBox-root"
        let card = document.querySelector(".card.MuiBox-root");

        // Jika ditemukan, klik elemen tersebut
        if (card) {
          console.log("Card ditemukan! Mengklik...");
          card.click();
        } else {
          console.warn("Card tidak ditemukan!");
        }

        // Attempt to click the Dashboard button after a short delay
        setTimeout(() => {
          clickDashboardButton();
        }, 1000);
      }, 1000);
    }
  }

  init();

  function extractTopicsFromContent(content) {
    if (!content) return [];
    const tempDiv = document.createElement("div");
    tempDiv.innerHTML = content;

    // Extract topics with their IDs
    const topics = [];

    // Look for topic elements with IDs
    const topicElements = tempDiv.querySelectorAll('[id^="topic-"]');
    topicElements.forEach((element) => {
      const id = element.id.replace("topic-", "");
      const text = element.textContent.trim();
      if (text && text.length > 0 && text.length < 100) {
        topics.push({ id, text });
      }
    });

    // If no topic elements found, try to extract from headings/paragraphs
    if (topics.length === 0) {
      const headings = tempDiv.querySelectorAll("h1, h2, h3, h4, h5, h6, p");
      headings.forEach((element) => {
        const text = element.textContent.trim();
        if (text && text.length > 0 && text.length < 100) {
          // Generate a unique ID for the topic
          const id = crypto.randomUUID();
          topics.push({ id, text });
        }
      });
    }

    return topics.slice(0, 3);
  }

  // Add this function to fetch topics from API
  async function fetchForumTopics(forumId) {
    try {
      console.log("Fetching topics for forum:", forumId);
      const response = await fetch(
        `https://mentari.unpam.ac.id/api/forum/topic/${forumId}`,
        {
          headers: {
            Authorization: `Bearer ${authToken}`,
            "Content-Type": "application/json",
          },
        }
      );

      if (!response.ok) {
        console.error(
          "Failed to fetch topics:",
          response.status,
          response.statusText
        );
        throw new Error("Failed to fetch topics");
      }

      const data = await response.json();
      console.log("Topics API response:", data);

      if (!data.topics) {
        console.warn("No topics data in response:", data);
        return [];
      }

      // Filter topics that match the forum's id_trx_course_sub_section
      const matchingTopics = data.topics.filter(
        (topic) => topic.id_trx_course_sub_section === forumId
      );

      console.log("Matching topics:", matchingTopics);

      // If no matching topics, hide the forum section
      if (matchingTopics.length === 0) {
        const forumElement = document.querySelector(`[data-forum-id="${forumId}"]`);
        if (forumElement) {
          forumElement.style.display = 'none';
        }
        return [];
      }

      // Fetch replies for each topic
      for (const topic of matchingTopics) {
        if (topic.id) {
          await fetchForumReplies(topic.id);
        }
      }

      return matchingTopics;
    } catch (error) {
      console.error("Error fetching forum topics:", error);
      return [];
    }
  }

  // Add this function to fetch replies from API
  async function fetchForumReplies(topicId) {
    try {
      const response = await fetch(
        `https://mentari.unpam.ac.id/api/forum/reply/${topicId}`,
        {
          headers: {
            Authorization: `Bearer ${authToken}`,
            "Content-Type": "application/json",
          },
        }
      );

      if (!response.ok) {
        console.error(
          "Failed to fetch replies:",
          response.status,
          response.statusText
        );
        throw new Error("Failed to fetch replies");
      }

      const data = await response.json();
      const currentUserNIM = userInfo?.username;
      let allReplies = [];
      let mainTopic = null;

      // Handle different response structures
      if (Array.isArray(data)) {
        allReplies = data;
      } else if (data.data && Array.isArray(data.data)) {
        allReplies = data.data;
        if (data.id && data.post_type === "TOPIC") {
          mainTopic = data;
          console.log("Main Topic:", {
            id: mainTopic.id,
            kode_course: mainTopic.kode_course,
            id_trx_course_sub_section: mainTopic.id_trx_course_sub_section,
            judul: mainTopic.judul,
            dosen: mainTopic.dosen?.nama_gelar || mainTopic.dosen?.nama_dosen,
          });
        }
      }

      if (allReplies.length > 0 && currentUserNIM) {
        const mainTopicId = mainTopic?.id || topicId;

        // Find student's own posts and related lecturer replies
        const studentPosts = allReplies.filter(
          (reply) =>
            reply.nim === currentUserNIM &&
            reply.post_type === "REPLY" &&
            reply.id_parent === mainTopicId
        );

        const lecturerReplies = allReplies.filter(
          (reply) =>
            reply.id_dosen &&
            reply.post_type === "REPLY" &&
            studentPosts.some((post) => post.id === reply.id_parent)
        );

        // Create notification data
        const notificationData = [];

        // Add main topic info if exists
        if (mainTopic) {
          notificationData.push({
            id: mainTopic.id,
            kode_course: mainTopic.kode_course,
            id_trx_course_sub_section: mainTopic.id_trx_course_sub_section,
            judul: mainTopic.judul,
            post_type: mainTopic.post_type,
            createdAt: mainTopic.createdAt,
            lecturerName:
              mainTopic.dosen?.nama_gelar ||
              mainTopic.dosen?.nama_dosen ||
              "Dosen",
          });
        }

        // Add student posts
        studentPosts.forEach((post) => {
          notificationData.push({
            id: post.id,
            kode_course: post.kode_course,
            id_trx_course_sub_section: post.id_trx_course_sub_section,
            judul: post.judul || `Balasan dari ${userInfo?.name || "Anda"}`,
            post_type: post.post_type,
            createdAt: post.createdAt,
            isMyPost: true,
          });
        });

        // Add lecturer replies
        lecturerReplies.forEach((reply) => {
          const notification = {
            id: reply.id,
            kode_course: reply.kode_course,
            id_trx_course_sub_section: reply.id_trx_course_sub_section,
            judul: reply.judul || "Balasan Dosen",
            post_type: reply.post_type,
            createdAt: reply.createdAt,
            lecturerName:
              reply.dosen?.nama_gelar || reply.dosen?.nama_dosen || "Dosen",
            topicId: topicId,
            forumId: topicId,
            content: reply.konten
              ? reply.konten.substring(0, 150) +
                (reply.konten.length > 150 ? "..." : "")
              : "Tidak ada konten",
          };

          // Add to notification data
          notificationData.push(notification);

          // Also add to lecturer notifications if not exists
          const existingIndex = lecturerNotifications.findIndex(
            (n) => n.id === reply.id
          );
          if (existingIndex === -1) {
            lecturerNotifications.unshift({
              ...notification,
              type: "lecturer_reply",
              title: notification.judul,
              parentId: reply.id_parent,
              courseCode: reply.kode_course,
            });

            // Keep only latest 50 notifications
            if (lecturerNotifications.length > 50) {
              lecturerNotifications = lecturerNotifications.slice(0, 50);
            }
          }
        });

        // Update notifications UI
        updateNotificationsUI();

        console.log("Notification Data:", notificationData);
        return notificationData;
      }

      return [];
    } catch (error) {
      console.error("Error in fetchForumReplies:", error);
      return [];
    }
  }

  // Jalankan pengujian compareVersions
  testCompareVersions();

  // Jalankan pemeriksaan versi secara manual
  console.log("Menjalankan pemeriksaan versi secara manual...");
  setTimeout(() => {
    autoCheckUpdate();
  }, 1000); // Tunggu 1 detik untuk memastikan semua fungsi sudah dimuat
})();
