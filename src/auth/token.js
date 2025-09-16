console.log('Token.js sedang dijalankan!');

// Inisialisasi UI dan logic token
(function () {
  let authToken = null;
  let isHandlingCourseApiRequest = false;
  let courseDataList = [];
  let userInfo = null;
  let studentDataList = [];

  const STORAGE_KEYS = {
    AUTH_TOKEN: 'mentari_auth_token',
    USER_INFO: 'mentari_user_info',
    COURSE_DATA: 'mentari_course_data',
    LAST_UPDATE: 'mentari_last_update',
    STUDENT_GROUPS: 'mentari_student_groups',
    ACTIVATION_KEY: 'mentariUserKey',
  };

  async function checkForNotificationUpdate() {
    try {
        let localVersion = '0.0.0';
        if (typeof window.mentariModVersion !== 'undefined') {
            localVersion = window.mentariModVersion;
        } else {
            const tokenScriptElement = document.getElementById('mentari-mod-token-script');
            if (tokenScriptElement && tokenScriptElement.dataset.version) {
                localVersion = tokenScriptElement.dataset.version;
            }
        }
        console.log(`[Token.js] Versi lokal terdeteksi untuk notifikasi: ${localVersion}`);
      
        const manifestUrl = 'https://raw.githubusercontent.com/AnandaAnugrahHandyanto/mentari_unpam-mod/main/manifest.json?_=' + new Date().getTime();
        const manifestResponse = await fetch(manifestUrl);
        const remoteManifest = await manifestResponse.json();
        const latestVersion = remoteManifest.version;

        const isOutdated = (local, ref) => {
            if (!local || !ref) return false;
            const partsLocal = local.split('.').map(Number);
            const partsRef = ref.split('.').map(Number);
            const len = Math.max(partsLocal.length, partsRef.length);
            for (let i = 0; i < len; i++) {
                const p1 = partsLocal[i] || 0;
                const p2 = partsRef[i] || 0;
                if (p1 < p2) return true;
                if (p1 > p2) return false;
            }
            return false;
        };

        if (isOutdated(localVersion, latestVersion)) {
            console.log(`[Token.js] Notifikasi update untuk v${latestVersion} akan ditampilkan.`);
            return { updateAvailable: latestVersion };
        }

    } catch (error) {
      console.error('[Token.js] Gagal memeriksa pembaruan notifikasi:', error);
    }
    return { updateAvailable: null };
  }

  async function performExtensionKillSwitchCheck() {
      if (typeof window.mentariModVersion !== 'undefined') {
          return true;
      }

      try {
          const versionInfoUrl = 'https://raw.githubusercontent.com/AnandaAnugrahHandyanto/mentari_unpam-mod/main/version_info.json?_=' + new Date().getTime();
          const versionResponse = await fetch(versionInfoUrl);
          if (!versionResponse.ok) return true; // Lanjutkan jika gagal fetch
          
          const versionInfo = await versionResponse.json();
          const minVersion = versionInfo.min_version;

          const tokenScriptElement = document.getElementById('mentari-mod-token-script');
          const localVersion = tokenScriptElement ? tokenScriptElement.dataset.version : '0.0.0';

          const isOutdated = (local, ref) => {
              const partsLocal = local.split('.').map(Number);
              const partsRef = ref.split('.').map(Number);
              const len = Math.max(partsLocal.length, partsRef.length);
              for (let i = 0; i < len; i++) {
                  const p1 = partsLocal[i] || 0;
                  const p2 = partsRef[i] || 0;
                  if (p1 < p2) return true;
                  if (p1 > p2) return false;
              }
              return false;
          };

          if (isOutdated(localVersion, minVersion)) {
              console.error(`[Token.js] Versi ekstensi usang (${localVersion}). Minimum: ${minVersion}. Memblokir fungsi.`);
              showForceUpdatePopup();
              return false;
          }
      } catch (error) {
          console.error('[Token.js] Gagal memeriksa kill switch ekstensi:', error);
      }
      return true;
  }
  
  // Fungsi untuk menampilkan popup paksa update
  function showForceUpdatePopup() {
    const existingPopup = document.getElementById('token-runner-popup');
    if (existingPopup) existingPopup.remove();
    const overlay = document.createElement('div');
    overlay.style.cssText = `position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: rgba(0, 0, 0, 0.9); z-index: 1000001; display: flex; justify-content: center; align-items: center; font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;`;
    const messageBox = document.createElement('div');
    messageBox.style.cssText = `background: #1e1e1e; color: #f0f0f0; padding: 30px; border-radius: 12px; text-align: center; max-width: 400px; border: 1px solid #333;`;
    messageBox.innerHTML = `
      <h2 style="margin-top:0; color: #e74c3c;">Versi Ekstensi Usang</h2>
      <p style="color: #ccc; line-height: 1.6;">Anda menggunakan versi MENTARI MOD yang sudah tidak didukung lagi. Silakan update ke versi terbaru untuk melanjutkan.</p>
      <a href="https://github.com/AnandaAnugrahHandyanto/mentari_unpam-mod/releases/latest" target="_blank" style="display: inline-block; background: #e74c3c; color: white; padding: 12px 24px; border-radius: 8px; text-decoration: none; font-weight: bold; margin-top: 20px;">Update Sekarang</a>
    `;
    overlay.appendChild(messageBox);
    document.body.appendChild(overlay);
  }
  
  // Fungsi untuk membuat modal konfirmasi kustom
  function createConfirmationModal() {
    if (document.getElementById('custom-confirm-modal')) return

    const modalHTML = `
      <div id="custom-confirm-overlay" class="custom-confirm-overlay"></div>
      <div id="custom-confirm-box" class="custom-confirm-box">
        <div class="custom-confirm-header">
          <h3 id="custom-confirm-title">Konfirmasi Tindakan</h3>
        </div>
        <div class="custom-confirm-content">
          <p id="custom-confirm-message">Apakah Anda yakin?</p>
        </div>
        <div class="custom-confirm-actions">
          <button id="custom-confirm-cancel" class="custom-confirm-btn custom-confirm-btn-cancel">Batal</button>
          <button id="custom-confirm-ok" class="custom-confirm-btn custom-confirm-btn-ok">Hapus</button>
        </div>
      </div>
    `

    const modalContainer = document.createElement('div')
    modalContainer.id = 'custom-confirm-modal'
    modalContainer.innerHTML = modalHTML
    document.body.appendChild(modalContainer)

    const modal = document.getElementById('custom-confirm-modal')
    const cancelBtn = document.getElementById('custom-confirm-cancel')
    const overlay = document.getElementById('custom-confirm-overlay')

    const hideModal = () => modal.classList.remove('visible')

    cancelBtn.onclick = hideModal
    overlay.onclick = hideModal
  }

  // Fungsi untuk menampilkan modal konfirmasi kustom
  function showConfirmationDialog(message, onConfirm) {
    const modal = document.getElementById('custom-confirm-modal')
    const messageEl = document.getElementById('custom-confirm-message')
    const confirmBtn = document.getElementById('custom-confirm-ok')

    if (!modal || !messageEl || !confirmBtn) {
      console.error('Confirmation modal elements not found!')
      // Fallback ke confirm bawaan jika modal tidak ada
      if (confirm(message.replace(/<br\s*\/?>/gi, '\n'))) {
        onConfirm()
      }
      return
    }

    messageEl.innerHTML = message
    modal.classList.add('visible')

    // Hapus event listener sebelumnya untuk menghindari penumpukan
    confirmBtn.replaceWith(confirmBtn.cloneNode(true))
    document.getElementById('custom-confirm-ok').addEventListener('click', () => {
      onConfirm()
      modal.classList.remove('visible')
    })
  }

  function injectNotesUI() {
    if (document.getElementById('catatan-mentari-container')) {
      document
        .getElementById('catatan-mentari-container')
        .scrollIntoView({ behavior: 'smooth', block: 'center' })
      return
    }

    const cssRules = `
        #catatan-mentari-container { background-color: #2a2a2a; border: 1px solid #444; border-radius: 8px; padding: 15px; margin-top: 20px; margin-bottom: 20px; box-shadow: 0 2px 4px rgba(0,0,0,0.2); color: #f0f0f0; }
        #catatan-mentari-container h3 { margin-top: 0; color: #f0f0f0; border-bottom: 1px solid #444; padding-bottom: 10px; }
        #catatan-mentari-textarea { width: 100%; min-height: 120px; box-sizing: border-box; background-color: #1e1e1e; color: #f0f0f0; border: 1px solid #555; border-radius: 4px; padding: 10px; font-size: 14px; margin-bottom: 10px; }
        #catatan-mentari-simpan-btn { background-color: #0070f3; color: white; border: none; padding: 10px 15px; border-radius: 5px; cursor: pointer; font-weight: bold; }
    `
    const styleElement = document.createElement('style')
    styleElement.id = 'catatan-mentari-styles'
    if (!document.getElementById(styleElement.id)) {
      document.head.appendChild(styleElement)
    }
    styleElement.textContent = cssRules

    const mainContentArea = document.querySelector('h6.MuiTypography-subtitle1')
    if (!mainContentArea) {
      showCustomAlert(
        'Judul mata kuliah tidak ditemukan. Pastikan Anda berada di halaman utama sebuah mata kuliah.',
        'error'
      )
      return
    }

    const noteContainer = document.createElement('div')
    noteContainer.id = 'catatan-mentari-container'
    noteContainer.innerHTML = `
        <h3>Catatan Pribadi untuk Mata Kuliah Ini</h3>
        <textarea id="catatan-mentari-textarea" placeholder="Tulis apapun di sini..."></textarea>
        <button id="catatan-mentari-simpan-btn">Simpan Catatan</button>
        <span id="simpan-status" style="margin-left: 10px; color: #2ecc71;"></span>
    `

    mainContentArea.parentNode.insertBefore(
      noteContainer,
      mainContentArea.nextSibling
    )

    const noteTextarea = document.getElementById('catatan-mentari-textarea')
    const saveButton = document.getElementById('catatan-mentari-simpan-btn')
    const saveStatus = document.getElementById('simpan-status')
    const courseTitle = mainContentArea.textContent.trim()
    const storageKey = 'catatan_mentari_' + courseTitle

    function loadCatatan() {
      const savedNote = localStorage.getItem(storageKey)
      if (savedNote) {
        noteTextarea.value = savedNote
      }
    }

    saveButton.addEventListener('click', function () {
      const catatanTeks = noteTextarea.value
      localStorage.setItem(storageKey, catatanTeks)

      saveStatus.textContent = 'Tersimpan!'
      setTimeout(() => {
        saveStatus.textContent = ''
      }, 2000)
    })

    loadCatatan()
  }

  function saveToLocalStorage(key, data) {
    try {
      localStorage.setItem(key, JSON.stringify(data))
      console.log(`Data berhasil disimpan ke ${key}`)
    } catch (error) {
      console.error(`Error menyimpan data ke ${key}:`, error)
    }
  }

  function getFromLocalStorage(key) {
    try {
      const data = localStorage.getItem(key)
      return data ? JSON.parse(data) : null
    } catch (error) {
      console.error(`Error mengambil data dari ${key}:`, error)
      return null
    }
  }

  // Fungsi untuk melakukan tracking ulang
  window.refreshAndTrack = function () {
    clearCacheData()
    authToken = null
    userInfo = null
    courseDataList = []
    studentDataList = []
    checkStorages()
    fetchCoursesListAndDetails(true) // Force refresh
  }

  function showCustomAlert(message, type = 'error', duration = 5000) {
    const existingAlert = document.getElementById('custom-alert-mentari')
    if (existingAlert) {
      existingAlert.remove()
    }

    // elemen utama notifikasi
    const alertElement = document.createElement('div')
    alertElement.id = 'custom-alert-mentari'
    alertElement.className = `custom-alert-mentari ${type}`

    const icons = {
      error: `
      <svg fill="#e74c3c" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
        <path d="M12,2C6.48,2,2,6.48,2,12s4.48,10,10,10,10-4.48,10-10S17.52,2,12,2Zm1,15h-2v-2h2v2Zm0-4h-2V7h2v6Z"/>
      </svg>`,
      success: `
      <svg fill="#2ecc71" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
        <path d="M12,2C6.48,2,2,6.48,2,12s4.48,10,10,10,10-4.48,10-10S17.52,2,12,2Zm-2,15-5-5,1.41-1.41L10,14.17l7.59-7.59L19,8l-9,9Z"/>
      </svg>`,
    }

    alertElement.innerHTML = `
    <div class="alert-icon">${icons[type] || ''}</div>
    <div class="alert-message">${message}</div>
    <button class="alert-close-btn">&times;</button>
  `

    document.body.appendChild(alertElement)

    // Fungsi untuk menghapus notifikasi dengan animasi
    const removeAlert = () => {
      alertElement.classList.add('fade-out')
      // Tunggu animasi selesai sebelum menghapus elemen dari DOM
      setTimeout(() => {
        if (alertElement) alertElement.remove()
      }, 300)
    }

    const timeoutId = setTimeout(removeAlert, duration)

    // Tambahkan event listener untuk tombol close
    alertElement.querySelector('.alert-close-btn').addEventListener('click', () => {
      clearTimeout(timeoutId) // Batalkan auto-remove jika ditutup manual
      removeAlert()
    })
  }

  // Buat popup UI
  function createPopupUI() {
    // Check if popup already exists
    if (document.getElementById('token-runner-popup')) return

    let script = document.createElement('script')
    script.src = 'https://kit.fontawesome.com/f59e2d85df.js'
    script.crossOrigin = 'anonymous'
    document.head.appendChild(script)

    // Create main container
    const popup = document.createElement('div')
    popup.id = 'token-runner-popup'
    popup.className = 'collapsed' // Default to collapsed state
    popup.innerHTML = `
    <div class="popup-toggle" id="popup-toggle">
      <img src="https://github.com/tonybaloney/vscode-pets/blob/main/media/zappy/yellow_idle_8fps.gif?raw=true" alt="Mentaru" />
    </div>
    <div class="token-loading-bar"></div>
    <div class="popup-content">
      <div class="popup-header">
        <span class="popup-title">MENTARI MOD</span>
        <div class="token-popup-actions">
          <button id="token-reset-btn" title="Reset Cache & Track Ulang"><i class="fa-solid fa-rotate-right fa-fw"></i></button>
        </div>
      </div>
      <div class="token-tabs">
        <button class="token-tab active" data-tab="forum-data">Forum</button>
        <button class="token-tab" data-tab="student-data">Mahasiswa</button>
        <button class="token-tab" data-tab="notes-data">Catatan</button>
        <button class="token-tab" data-tab="feedback-data">Umpan Balik</button>
        <button class="token-tab" data-tab="user-info">Setting</button>
      </div>
      <div class="token-tab-content" id="user-info-tab">
        </div>
      <div class="token-tab-content" id="token-data-tab">
        </div>
      <div class="token-tab-content active" id="forum-data-tab">
        <div class="token-info-section">
          <p>Forum Diskusi yang belum dikerjakan</p>
        </div>
        <div id="forum-list"></div>
      </div>
      <div class="token-tab-content" id="student-data-tab">
        <div id="student-list"></div>
      </div>
      <div class="token-tab-content" id="notes-data-tab">
        <div class="token-info-section" style="text-align:center; padding: 20px;">
          <p style="margin-bottom: 15px;">Buat catatan pribadi untuk mata kuliah yang sedang dibuka.</p>
          <button id="add-notes-section-btn" class="token-button" style="width: 100%;"><i class="fas fa-plus"></i> Tambahkan Catatan di Halaman</button>
        </div>
      </div>
      <div class="token-tab-content" id="feedback-data-tab">
        <div class="feedback-container">
            <h3>Beri Masukan untuk Kami</h3>
            <p>Setiap masukan Anda sangat berarti untuk pengembangan MENTARI MOD agar menjadi lebih baik. Silakan pilih salah satu opsi di bawah ini.</p>
            <div class="feedback-actions">
                <a href="https://github.com/AnandaAnugrahHandyanto/mentari_unpam-mod/issues/new?template=bug_report.md&title=[BUG]%20Judul%20Bug" target="_blank" class="feedback-button bug">
                    <i class="fas fa-bug"></i>
                    <div>
                        <span>Laporkan Bug</span>
                        <small>Menemukan sesuatu yang tidak berfungsi?</small>
                    </div>
                </a>
                <a href="https://github.com/AnandaAnugrahHandyanto/mentari_unpam-mod/issues/new?template=feature_request.md&title=[FITUR]%20Saran%20Fitur" target="_blank" class="feedback-button feature">
                    <i class="fas fa-lightbulb"></i>
                    <div>
                        <span>Saran Fitur Baru</span>
                        <small>Punya ide cemerlang untuk kami?</small>
                    </div>
                </a>
            </div>
            <div class="feedback-footer">
                <p>Anda akan diarahkan ke halaman GitHub Issues. Mohon jelaskan sedetail mungkin agar kami dapat memahaminya dengan baik.</p>
            </div>
        </div>
      </div>
    </div>
  `

    ;(function addSkeletonLoaderStyles() {
      const style = document.createElement('style')
      style.textContent = `
    .skeleton {
      background: linear-gradient(90deg, #2a2a2a 25%, #3a3a3a 50%, #2a2a2a 75%);
      background-size: 200% 100%;
      animation: skeleton-loading 1.2s infinite linear;
      border-radius: 6px;
    }

    .skeleton-text {
      height: 14px;
      margin-bottom: 8px;
      width: 100%;
    }

    .skeleton-card {
      height: 80px;
      margin-bottom: 12px;
      width: 100%;
    }

    @keyframes skeleton-loading {
      0% { background-position: -200% 0; }
      100% { background-position: 200% 0; }
    }
  `
      document.head.appendChild(style)
    })()

    function showSkeletonLoading(containerId, count = 3) {
      const container = document.getElementById(containerId)
      if (!container) return

      let skeletonHTML = ''
      for (let i = 0; i < count; i++) {
        skeletonHTML += `
      <div class="skeleton skeleton-card"></div>
    `
      }

      container.innerHTML = skeletonHTML
    }

    showSkeletonLoading('forum-list', 4)

    // CSS for popup - minimalist Vercel-style
    const style = document.createElement('style')
    style.textContent = `
    #token-runner-popup {
      max-height: 90vh;
      overflow: hidden;
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

    #token-runner-popup {
    backdrop-filter: blur(10px);
    background: rgba(30,30,30,0.85);
  }

  #token-runner-popup,
  .popup-content,
  .token-card-wrapper,
  .token-tab-content {
  transition: all 0.3s ease-in-out;
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
    // margin-bottom: 14px;
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
    // padding-top: 10px;
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
    padding-top: 12px;
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
    justify-content: space-between;
    align-items: center;
    padding: 0 16px 12px 60px;
    border-bottom: 1px solid rgba(255, 255, 255, 0.05);
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
  gap: 6px;
  overflow-x: auto;
  scrollbar-width: none;
  position: relative;
}
.token-tabs::-webkit-scrollbar { display: none; }

.token-tabs::after {
  content: "";
  position: absolute;
  top: 0;
  right: 0;
  width: 40px;
  height: 100%;
  background: linear-gradient(to left, rgba(30,30,30,0.95), rgba(30,30,30,0));
  backdrop-filter: blur(2px);
  pointer-events: none;
  opacity: 0;
  transition: opacity 0.35s ease;
}

.token-tabs::before {
  content: "";
  position: absolute;
  top: 0;
  left: 0;
  width: 40px;
  height: 100%;
  background: linear-gradient(to right, rgba(30,30,30,0.95), rgba(30,30,30,0));
  backdrop-filter: blur(2px);
  pointer-events: none;
  opacity: 0;
  transition: opacity 0.35s ease;
}

.token-tab {
  position: relative;
  z-index: 2;
}

.token-tabs.show-left::before { opacity: 1; }
.token-tabs.show-right::after { opacity: 1; }

  .token-tab {
    position: relative;
    z-index: 2;
    flex: 0 0 auto;
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
    flex: 1 1 auto;
    max-height: calc(90vh - 120px);
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

  .custom-alert-mentari {
    position: fixed;
    top: 20px;
    left: 50%;
    transform: translateX(-50%);
    padding: 12px 20px;
    border-radius: 8px;
    background-color: #2a2a2a;
    color: #f0f0f0;
    border: 1px solid #444;
    box-shadow: 0 4px 12px rgba(0,0,0,0.3);
    z-index: 10002;
    display: flex;
    align-items: center;
    gap: 10px;
    font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
    animation: fadeInDown 0.3s ease-out forwards;
    width: auto;
    max-width: calc(100% - 40px);
    box-sizing: border-box;
    text-align: center;
  }

  .custom-alert-mentari.fade-out {
    animation: fadeOutUp 0.3s ease-in forwards;
  }

  .custom-alert-mentari.error {
    border-left: 4px solid #e74c3c;
  }
  .custom-alert-mentari.success {
    border-left: 4px solid #2ecc71;
  }

  .custom-alert-mentari .alert-icon {
    flex-shrink: 0;
  }
  .custom-alert-mentari .alert-icon svg {
    width: 20px;
    height: 20px;
  }

  .custom-alert-mentari .alert-message {
    font-size: 14px;
  }

  .custom-alert-mentari .alert-close-btn {
    background: transparent;
    border: none;
    color: #888;
    font-size: 20px;
    cursor: pointer;
    padding: 0 0 0 10px;
    line-height: 1;
    transition: color 0.2s ease;
  }
  .custom-alert-mentari .alert-close-btn:hover {
    color: #fff;
  }

  @keyframes fadeInDown {
    from { opacity: 0; transform: translate(-50%, -20px); }
    to { opacity: 1; transform: translate(-50%, 0); }
  }

  @keyframes fadeOutUp {
    from { opacity: 1; transform: translate(-50%, 0); }
    to { opacity: 0; transform: translate(-50%, -20px); }
  }

  .tombol-baru {
  background-color: #ff5722;
  color: white;
  border-radius: 20px;
  }

  .feedback-container {
      padding: 15px;
      text-align: center;
      color: #f0f0f0;
  }
  .feedback-container h3 {
      margin-top: 0;
      font-size: 18px;
      color: #fff;
  }
  .feedback-container p {
      font-size: 13px;
      color: #aaa;
      line-height: 1.6;
      max-width: 350px;
      margin: 10px auto 20px auto;
  }
  .feedback-actions {
      display: flex;
      flex-direction: column;
      gap: 12px;
  }
  .feedback-button {
      background-color: #2a2a2a;
      border: 1px solid #444;
      border-radius: 8px;
      padding: 15px;
      text-decoration: none;
      color: #f0f0f0;
      display: flex;
      align-items: center;
      gap: 12px;
      transition: all 0.2s ease;
  }
  .feedback-button:hover {
      border-color: #0070f3;
      background-color: #333;
      transform: translateY(-2px);
  }
  .feedback-button i {
      font-size: 20px;
  }
  .feedback-button.bug i {
      color: #e74c3c;
  }
  .feedback-button.feature i {
      color: #f1c40f;
  }
  .feedback-button div {
      display: flex;
      flex-direction: column;
      text-align: left;
  }
  .feedback-button span {
      font-weight: 600;
  }
  .feedback-button small {
      font-size: 12px;
      color: #888;
  }
  .feedback-footer {
      margin-top: 20px;
      border-top: 1px solid #333;
      padding-top: 15px;
  }
  .feedback-footer p {
      font-size: 11px;
      color: #666;
  }
  .settings-input {
    width: 100%;
    padding: 8px 12px;
    background: #2a2a2a;
    border: 1px solid #333;
    border-radius: 4px;
    color: #fff;
    font-size: 13px;
    margin-top: 4px;
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
  `;
    document.head.appendChild(style);
    document.body.appendChild(popup);
    
    (function enableTabGradients() {
      const tabs = document.querySelector('.token-tabs');
      if (!tabs) return;
      
      function updateGradient() {
        const maxScrollLeft = tabs.scrollWidth - tabs.clientWidth;
        
        if (tabs.scrollLeft > 5) {
          tabs.classList.add('show-left');
        } else {
          tabs.classList.remove('show-left');
        }
        
        if (tabs.scrollLeft < maxScrollLeft - 5) {
          tabs.classList.add('show-right');
        } else {
          tabs.classList.remove('show-right');
        }
      }
      
      updateGradient();
      tabs.addEventListener('scroll', updateGradient);
      window.addEventListener('resize', updateGradient);
})();

    // Enable drag-scroll
    (function enableDragScroll() {
      const tabs = document.querySelector('.token-tabs');
      if (!tabs) return;
      
      let isDown = false;
      let startX;
      let scrollLeft;

    // PC (mouse)
    tabs.addEventListener('mousedown', (e) => {
      isDown = true;
      startX = e.pageX - tabs.offsetLeft;
      scrollLeft = tabs.scrollLeft;
      tabs.style.cursor = 'grabbing';
    });
    tabs.addEventListener('mouseleave', () => {
    isDown = false;
    tabs.style.cursor = 'default';
  });
  tabs.addEventListener('mouseup', () => {
    isDown = false;
    tabs.style.cursor = 'default';
  });
  tabs.addEventListener('mousemove', (e) => {
    if (!isDown) return;
    e.preventDefault();
    const x = e.pageX - tabs.offsetLeft;
    const walk = (x - startX) * 1.5; // kecepatan scroll
    tabs.scrollLeft = scrollLeft - walk;
  });

  // Mobile (touch)
let touchStartX = 0;
let startScrollLeft = 0;

tabs.addEventListener('touchstart', (e) => {
  touchStartX = e.touches[0].pageX;
  startScrollLeft = tabs.scrollLeft;
}, { passive: true });

tabs.addEventListener('touchmove', (e) => {
  const x = e.touches[0].pageX;
  const deltaX = x - touchStartX;
  tabs.scrollLeft = startScrollLeft - deltaX;
}, { passive: true });
})();

    // EVENT LISTENER BARU UNTUK TOMBOL CATATAN
    document
      .getElementById('add-notes-section-btn')
      .addEventListener('click', injectNotesUI);

    // Enhanced refresh function with loading animation
    function refreshAndTrackWithLoading() {
      const loadingBar = document.querySelector('.token-loading-bar');
      loadingBar.classList.add('active');

      if (typeof window.refreshAndTrack === 'function') {
        const result = window.refreshAndTrack();
        if (result && typeof result.then === 'function') {
          result
            .finally(() => {
              setTimeout(() => loadingBar.classList.remove('active'), 500);
            });
        } else {
          setTimeout(() => loadingBar.classList.remove('active'), 1500);
        }
      } else {
        setTimeout(() => loadingBar.classList.remove('active'), 1500);
      }
    }

    // Make popup draggable with touch/mouse
    let isDragging = false;
    let offsetX = 0;
    let offsetY = 0;

    function startDrag(clientX, clientY) {
        isDragging = true;
        offsetX = clientX - popup.getBoundingClientRect().left;
        offsetY = clientY - popup.getBoundingClientRect().top;
    }

    function onDrag(clientX, clientY) {
        if (!isDragging) return;
        const x = clientX - offsetX;
        const y = clientY - offsetY;

        if (x > 0 && x < window.innerWidth - popup.offsetWidth && y > 0 && y < window.innerHeight - popup.offsetHeight) {
            popup.style.left = x + 'px';
            popup.style.top = y + 'px';
            popup.style.right = 'auto';
            popup.style.bottom = 'auto';
        }
    }

    function stopDrag() {
        isDragging = false;
    }

    const header = popup.querySelector('.popup-header');
    header.addEventListener('mousedown', (e) => {
        if (e.target.closest('button, a')) return;
        startDrag(e.clientX, e.clientY);
        e.preventDefault();
    });

    document.addEventListener('mousemove', (e) => onDrag(e.clientX, e.clientY));
    document.addEventListener('mouseup', stopDrag);
    
    header.addEventListener('touchstart', (e) => {
        if (e.target.closest('button, a')) return;
        startDrag(e.touches[0].clientX, e.touches[0].clientY);
    }, { passive: true });

    document.addEventListener('touchmove', (e) => {
        if (isDragging) {
            e.preventDefault();
            onDrag(e.touches[0].clientX, e.touches[0].clientY);
        }
    }, { passive: false });
    
    document.addEventListener('touchend', stopDrag);

    // Special handling for toggle button
    const toggle = popup.querySelector('.popup-toggle');
    toggle.addEventListener('click', (e) => {
      // Logic to differentiate between a click and a drag end
      if (!isDragging || popup.classList.contains('collapsed')) {
        toggleCollapse();
      }
      isDragging = false; // Reset drag state after click/drag
    });

    // Handle event listeners
    document
      .getElementById('token-reset-btn')
      .addEventListener('click', refreshAndTrackWithLoading);

    // Tab switching
    document.querySelectorAll('.token-tab').forEach((tab) => {
      tab.addEventListener('click', () => {
        document
          .querySelectorAll('.token-tab')
          .forEach((t) => t.classList.remove('active'));
        document
          .querySelectorAll('.token-tab-content')
          .forEach((c) => c.classList.remove('active'));

        tab.classList.add('active');
        const tabId = tab.dataset.tab + '-tab';
        document.getElementById(tabId).classList.add('active');
      });
    });

    addPositionToggleToPopup();
    
    // Initialize the position for when page loads
    applyDefaultPosition();
  }

  function addPositionToggleToPopup() {
    const popup = document.getElementById('token-runner-popup');
    if (!popup) return;

    // Define possible positions
    const positions = [
      { bottom: '20px', right: '20px', top: 'auto', left: 'auto' },
      { bottom: '20px', right: 'auto', top: 'auto', left: '20px' },
      { bottom: 'auto', right: 'auto', top: '20px', left: '20px' },
      { bottom: 'auto', right: '20px', top: '20px', left: 'auto' },
    ];

    let currentPosition = parseInt(localStorage.getItem('tokenRunnerPosition') || '0');

    function applyPosition(posIndex) {
      const pos = positions[posIndex];
      Object.assign(popup.style, pos);
    }
    
    // Panggil fungsi ini untuk menerapkan posisi awal
    window.applyDefaultPosition = function() {
        applyPosition(currentPosition);
    }
  }

  function toggleCollapse() {
    const popup = document.getElementById('token-runner-popup');
    if (popup) {
      popup.classList.toggle('collapsed');
    }
  }

  // Decode JWT token
  function decodeToken(token) {
    try {
      if (!token) return null;
      if (token.startsWith('Bearer ')) token = token.substring(7);

      const base64Url = token.split('.')[1];
      const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
      const payload = JSON.parse(atob(base64));

      return {
        token,
        payload,
        userId: payload.id || payload.username || payload.sub || 'unknown',
        username: payload.username || payload.name || payload.sub || 'unknown',
        fullname:
          payload.fullname || payload.name || payload.username || 'unknown',
        role: payload.role || payload.roles || 'unknown',
        expires: payload.exp
          ? new Date(payload.exp * 1000).toLocaleString()
          : 'unknown',
      };
    } catch (e) {
      console.error('Error decoding token:', e);
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
    const tokenTab = document.getElementById('token-data-tab');
    if (!tokenTab) return;

    let tokenDisplay = token;
    // Jika token panjang, buat versi disingkat
    if (tokenDisplay && tokenDisplay.length > 40) {
      tokenDisplay =
        tokenDisplay.substring(0, 15) +
        '...' +
        tokenDisplay.substring(tokenDisplay.length - 15);
    }

    tokenTab.innerHTML = `
      <div class="token-info-section">
        <h4>Bearer Token</h4>
        <p><span class="token-value">${
          tokenDisplay || 'Tidak ditemukan'
        }</span>
          <button class="token-copy-btn" data-copy="${token}">Copy</button>
        </p>
      </div>
      <div class="token-info-section">
        <h4>Payload</h4>
        <pre>${JSON.stringify(tokenInfo?.payload || {}, null, 2)}</pre>
      </div>
    `;

    // Add copy functionality
    tokenTab.querySelectorAll('.token-copy-btn').forEach((btn) => {
      btn.addEventListener('click', () => {
        const textToCopy = btn.getAttribute('data-copy');
        navigator.clipboard.writeText(textToCopy).then(() => {
          const originalText = btn.innerText;
          btn.innerText = 'Copied!';
          setTimeout(() => {
            btn.innerText = originalText;
          }, 1500);
        });
      });
    });
  }

  // Update user info UI
  function updateUserInfoUI(tokenInfo) {
  const userInfoTab = document.getElementById('user-info-tab');
  if (!userInfoTab || !tokenInfo) return;

  userInfoTab.innerHTML = `
    <div class="token-card-wrapper">
      <div class="token-card-header">
        <h3 class="token-user-title">${tokenInfo.fullname}</h3>
        <div class="token-role-badge">${tokenInfo.role}</div>
      </div>

      <div class="token-data-grid">
        <div class="token-data-item">
          <div class="token-info-section">
            <p><span class="token-key">NIM :</span> <span class="token-value">${tokenInfo.username}</span></p>
          </div>
        </div>

        <div class="token-data-item">
          <div class="token-info-section">
            <label for="activation-key-input" class="token-key">KEY Aktivasi:</label>
            <input type="password" id="activation-key-input" class="settings-input" placeholder="Masukkan KEY Aktivasi">
          </div>
        </div>
        <div class="token-data-item">
          <div class="token-info-section">
            <label for="gemini-api-key-input" class="token-key">API KEY Gemini:</label>
            <input type="password" id="gemini-api-key-input" class="settings-input" placeholder="Masukkan API KEY Gemini">
          </div>
        </div>
        <div class="token-data-item">
          <button id="save-keys-btn" class="token-button" style="width: 100%;"><i class="fas fa-save"></i> Simpan KEY</button>
        </div>

        <div class="token-data-item">
          <div class="token-info-section">
            <div style="display: flex; justify-content: space-between; align-items: center;">
              <p class="token-key">Auto Selesai Quiz :</p>
              <label class="switch">
                <input type="checkbox" id="auto-finish-quiz-toggle" ${localStorage.getItem('auto_finish_quiz') === 'true' ? 'checked' : ''}>
                <span class="slider round"></span>
              </label>
            </div>
          </div>
        </div>
        <div class="token-data-item">
          <div class="token-info-section">
            <div style="display: flex; justify-content: space-between; align-items: center;">
              <p class="token-key">Auto Isi Kuisioner :</p>
              <label class="switch">
                <input type="checkbox" id="auto-fill-questionnaire-toggle" ${localStorage.getItem('auto_fill_questionnaire') === 'true' ? 'checked' : ''}>
                <span class="slider round"></span>
              </label>
            </div>
          </div>
        </div>
        <div class="token-data-item">
          <div class="token-info-section">
            <div style="display: flex; justify-content: space-between; align-items: center;">
              <p class="token-key">Gemini AI :</p>
              <label class="switch">
                <input type="checkbox" id="gemini-toggle" ${localStorage.getItem('gemini_enabled') === 'true' ? 'checked' : ''}>
                <span class="slider round"></span>
              </label>
            </div>
          </div>
        </div>
      </div>

      <div class="token-footer" style="display: flex; flex-direction: column; align-items: center; text-align: center; font-size: 0.85rem; color: #ccc; line-height: 1.6;">
          <div style="display: flex; align-items: center; gap: 6px;">
            <span>Made with</span>
            <img src="https://img.icons8.com/?size=100&id=H5H0mqCCr5AV&format=png&color=000000" style="width: 15px;" alt="love" />
          </div>
          <div style="display: flex; align-items: center; gap: 8px; margin-top: 2px;">
            <span>Lukman Muludin</span>
            <a href="https://instagram.com/_.chopin" target="_blank">
              <img src="https://img.icons8.com/?size=100&id=dz63urxyxSdO&format=png&color=ffffff" width="18" alt="Instagram" />
            </a>
            <a href="https://facebook.com/lukman.mauludin.754" target="_blank">
              <img src="https://img.icons8.com/?size=100&id=118467&format=png&color=ffffff" width="18" alt="Facebook" />
            </a>
            <a href="https://github.com/Lukman754" target="_blank">
              <img src="https://img.icons8.com/?size=100&id=62856&format=png&color=ffffff" width="18" alt="GitHub" />
            </a>
          </div>
          <div style="display: flex; align-items: center; gap: 8px; margin-top: 6px;">
            <span>Ananda Anugrah H</span>
                <a href="https://instagram.com/nando_fiingerstyle" target="_blank">
              <img src="https://img.icons8.com/?size=100&id=dz63urxyxSdO&format=png&color=ffffff" width="18" alt="Instagram" />
            </a>
            <a href="https://t.me/Vynix77" target="_blank">
              <img src="https://img.icons8.com/?size=100&id=lUktdBVdL4Kb&format=png&color=ffffff" width="18" alt="Telegram" />
            </a>
                <a href="https://github.com/AnandaAnugrahHandyanto" target="_blank">
              <img src="https://img.icons8.com/?size=100&id=62856&format=png&color=ffffff" width="18" alt="GitHub" />
            </a>
          </div>
        </div>
    </div>
  `;

  const activationKeyInput = document.getElementById('activation-key-input');
  const geminiApiKeyInput = document.getElementById('gemini-api-key-input');
  const saveKeysBtn = document.getElementById('save-keys-btn');
  const autoFinishQuizToggle = document.getElementById('auto-finish-quiz-toggle');
  const autoFillQuestionnaireToggle = document.getElementById('auto-fill-questionnaire-toggle');
  const geminiToggle = document.getElementById('gemini-toggle');

  // Muat kunci yang tersimpan saat UI dimuat
  activationKeyInput.value = localStorage.getItem(STORAGE_KEYS.ACTIVATION_KEY) || '';
  const storedApiKey = localStorage.getItem('geminiApiKey');
  geminiApiKeyInput.value = storedApiKey ? atob(storedApiKey) : '';

  // Event listener untuk tombol simpan
  saveKeysBtn.addEventListener('click', async () => {
    saveKeysBtn.disabled = true;
    saveKeysBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Memvalidasi...';

    const activationKey = activationKeyInput.value.trim();
    const geminiApiKey = geminiApiKeyInput.value.trim();

    if (activationKey) {
        // Validasi kunci aktivasi sebelum menyimpan
        const isValid = await validateActivationKeyOnServer(activationKey);
        if (isValid) {
            localStorage.setItem(STORAGE_KEYS.ACTIVATION_KEY, activationKey);
            showCustomAlert('Kunci Aktivasi berhasil divalidasi dan disimpan!', 'success');
        } else {
            showCustomAlert('Kunci Aktivasi tidak valid. Silakan periksa kembali.', 'error');
            saveKeysBtn.disabled = false;
            saveKeysBtn.innerHTML = '<i class="fas fa-save"></i> Simpan Kunci';
            return; // Hentikan proses jika kunci aktivasi tidak valid
        }
    }

    if (geminiApiKey) {
      localStorage.setItem('geminiApiKey', btoa(geminiApiKey));
    }
    
    showCustomAlert('Pengaturan berhasil disimpan!', 'success');
    saveKeysBtn.disabled = false;
    saveKeysBtn.innerHTML = '<i class="fas fa-save"></i> Simpan Kunci';
  });

  // Event listener untuk toggle
  autoFinishQuizToggle.addEventListener('change', function () {
    localStorage.setItem('auto_finish_quiz', this.checked);
  });
  autoFillQuestionnaireToggle.addEventListener('change', function () {
    localStorage.setItem('auto_fill_questionnaire', this.checked);
  });
  geminiToggle.addEventListener('change', function () {
    const isEnabled = this.checked;
    localStorage.setItem('gemini_enabled', isEnabled);
    const geminiPopup = document.getElementById('geminiChatbot');
    const geminiToggleBtn = document.getElementById('geminiChatbotToggle');
    if (geminiToggleBtn) {
      geminiToggleBtn.style.display = isEnabled ? 'flex' : 'none';
    }
    if (geminiPopup) {
      geminiPopup.style.display = 'none';
    }
  });
}

  // Update forum data UI
  async function updateForumUI(courseDataList) {
    const forumTab = document.getElementById('forum-data-tab');
    if (!forumTab) return;

    const forumList = document.getElementById('forum-list');
    if (!forumList) return;
    
    const updateStatus = await checkForNotificationUpdate();

    let html = '';

    if (updateStatus && updateStatus.updateAvailable) {
        const newVersion = updateStatus.updateAvailable;
        html += `
        <div class="update-notification-internal">
            <div class="update-info">
                <strong>Pembaruan Tersedia!</strong>
                <span>Versi ${newVersion} telah dirilis.</span>
            </div>
            <a href="https://github.com/AnandaAnugrahHandyanto/mentari_unpam-mod/releases/latest" target="_blank" class="update-button">Update</a>
        </div>
        `;

        const styleId = 'mentari-internal-update-style';
        if (!document.getElementById(styleId)) {
            const style = document.createElement('style');
            style.id = styleId;
            style.textContent = `
              .update-notification-internal { margin-bottom: 12px; background-color: #2c3e50; color: #ecf0f1; border-radius: 8px; padding: 12px 16px; display: flex; align-items: center; justify-content: space-between; border: 1px solid #34495e; }
              .update-notification-internal .update-info { display: flex; flex-direction: column; line-height: 1.4; }
              .update-notification-internal .update-info strong { font-weight: bold; font-size: 14px; }
              .update-notification-internal .update-info span { font-size: 12px; opacity: 0.9; }
              .update-notification-internal .update-button { background-color: #3498db; color: white; text-decoration: none; padding: 8px 16px; border-radius: 6px; font-weight: bold; font-size: 13px; transition: background-color 0.2s ease; white-space: nowrap; }
              .update-notification-internal .update-button:hover { background-color: #2980b9; }
            `;
            document.head.appendChild(style);
        }
    }

    html += `
  <div class="copy-links-container">
    <a href="https://my.unpam.ac.id/presensi/" target="_blank" id="presensi" class="presensi-button">
      <i class="fas fa-clipboard-list"></i> Lihat Presensi
    </a>
  </div>
  `;

    const processedCourses = courseDataList
      .map((courseData) => {
        if (!courseData || !courseData.data) return null;
        const courseName = courseData.coursename || '';
        const dayMatch = courseName.match(/\(([^)]+)\)/);
        const dayOfWeek = dayMatch ? dayMatch[1] : '';
        const dayOrderMap = { 'Minggu': 0, 'Senin': 1, 'Selasa': 2, 'Rabu': 3, 'Kamis': 4, 'Jumat': 5, 'Sabtu': 6 };
        return { ...courseData, dayOfWeek, dayOrder: dayOrderMap[dayOfWeek] ?? 7 };
      })
      .filter(Boolean)
      .sort((a, b) => a.dayOrder - b.dayOrder);

    processedCourses.forEach((courseData) => {
      const { kode_course, coursename, data } = courseData;

      const validSections = data.filter(section => {
          if (!section.sub_section) return false;
          const forum = section.sub_section.find(sub => sub.kode_template === 'FORUM_DISKUSI' && sub.id);
          if (!forum) return false;
          const postTest = section.sub_section.find(sub => sub.kode_template === 'POST_TEST');
          if (forum.completion && postTest?.completion) return false;
          if (forum.completion && postTest && !postTest.id) return false;
          if (forum.warningAlert?.includes('Soal forum diskusi belum tersedia')) return false;
          return true;
      });

      if (validSections.length === 0) return;

      const courseId = `course-${kode_course}`;
      const courseUrl = `https://mentari.unpam.ac.id/u-courses/${kode_course}`;

      html += `
  <div class="course-card" data-course-name="${coursename}" data-course-url="${courseUrl}">
    <div class="course-header">
      <a href="${courseUrl}" class="course-header-link">
        <h2>${coursename}</h2>
        <p class="course-code">${kode_course}</p>
      </a>
    </div>
    <div class="course-content" id="${courseId}">
  `;

      validSections.forEach((section, sectionIndex) => {
        const sectionId = `section-${kode_course}-${sectionIndex}`;
        const sectionUrl = `https://mentari.unpam.ac.id/u-courses/${kode_course}?accord_pertemuan=${section.kode_section}`;
        
        html += `
    <div class="section-card">
      <div class="section-header" onclick="toggleSection('${sectionId}', '${courseId}')">
        <h3>${section.nama_section}</h3>
        <span class="section-toggle collapsed" id="toggle-${sectionId}">
          <i class="fas fa-chevron-down"></i>
        </span>
      </div>
      <div class="section-content" id="${sectionId}">
        <div class="section-direct-link">
          <a href="${sectionUrl}" class="section-link-button">
            <i class="fas fa-external-link-alt"></i> Buka Pertemuan
          </a>
        </div>
    `;

        const materialTypes = ['BUKU_ISBN', 'VIDEO_AJAR', 'POWER_POINT', 'ARTIKEL_RISET', 'MATERI_LAINNYA'];
        const learningMaterials = section.sub_section.filter(sub => materialTypes.includes(sub.kode_template) && sub.link);
        const otherItems = section.sub_section.filter(sub => !materialTypes.includes(sub.kode_template));

        if (learningMaterials.length > 0) {
          html += `<div class="materials-card"><h4>Materi Pembelajaran</h4><div class="materials-list">`;
          learningMaterials.forEach(material => {
            html += `
              <a href="${material.link}" class="material-item ${material.completion ? 'completed' : 'incomplete'}" data-item-name="${material.judul}" data-item-url="${material.link}">
                <div class="material-icon">${getMaterialIcon(material.kode_template)}</div>
                <div class="material-details">
                  <span>${material.judul}</span>
                  ${material.completion ? '<span class="completion-badge">Selesai</span>' : ''}
                </div>
              </a>`;
          });
          html += `</div></div>`;
        }

        otherItems.forEach(item => {
          let url = '';
          const { kode_template, id, setting_quiz, completion, konten, warningAlert, file, judul, id_trx_course_sub_section } = item;
          const durationText = (kode_template === 'PRE_TEST' || kode_template === 'POST_TEST') && setting_quiz?.duration && !completion
            ? `<span class="duration-badge">${setting_quiz.duration} menit</span>`
            : '';
            
          switch (kode_template) {
            case 'PRE_TEST':
            case 'POST_TEST':
              url = id ? `https://mentari.unpam.ac.id/u-courses/${kode_course}/exam/${id}` : '';
              break;
            case 'FORUM_DISKUSI':
              url = id ? `https://mentari.unpam.ac.id/u-courses/${kode_course}/forum/${id}` : '';
              break;
            case 'KUESIONER':
              url = `https://mentari.unpam.ac.id/u-courses/${kode_course}/kuesioner/${section.kode_section}`;
              break;
          }

          const validUrl = !!url;
          const dataAttrs = validUrl ? `data-item-name="${judul}" data-item-url="${url}" data-item-type="${getItemTypeText(kode_template)}"` : '';

          html += `
    <div class="item-card ${completion ? 'completed' : ''} ${warningAlert ? 'has-warning' : ''}" ${dataAttrs}>
      <div class="item-header">
        <div class="item-icon">${getItemIcon(kode_template)}</div>
        <div class="item-details"><h4>${judul} ${durationText}</h4>${completion ? '<span class="completion-badge">Selesai</span>' : ''}</div>
      </div>
      ${konten ? `<div class="item-content responsive-content">${konten}</div>` : ''}
      ${kode_template === 'FORUM_DISKUSI' ? `<div class="forum-topics" id="forum-topics-${id_trx_course_sub_section || id}"><div class="loading-topics">Loading topics...</div></div>` : ''}
      ${warningAlert ? `<div class="warning-message">${warningAlert}</div>` : ''}
      ${file ? `<div class="item-file"><a href="https://mentari.unpam.ac.id/api/file/${file}"><i class="fas fa-file-download"></i> Lampiran</a></div>` : ''}
      <div class="item-action">
        ${validUrl && !warningAlert
          ? `<a href="${url}" class="action-button">${getActionText(kode_template)}</a>`
          : `<span class="action-button disabled">${getActionText(kode_template)} (Tidak Tersedia)</span>`
        }
      </div>
    </div>`;
        });
        html += `</div></div>`;
      });
      html += `</div></div>`;
    });

const hasCourseCards = html.includes('course-card');

if (!hasCourseCards) {
    html += `<div class="forum-no-data">Tidak ada forum diskusi yang tersedia</div>`;
}

forumList.innerHTML = html;

document.querySelectorAll('.forum-topics').forEach(container => {
    const forumId = container.id.replace('forum-topics-', '');
    if (forumId) {
        fetchForumTopics(forumId).then(topics => {
            if (topics && topics.length > 0) {
                container.innerHTML = topics.map(topic =>
                    `<a href="https://mentari.unpam.ac.id/u-courses/${extractCourseCodeFromUrl(window.location.href)}/forum/${forumId}/topics/${topic.id}" class="topic-badge"><i class="fas fa-comments"></i> ${topic.judul}</a>`
                ).join('');
            } else {
                container.innerHTML = '<div class="no-topics">No topics available</div>';
            }
        }).catch(() => {
            container.innerHTML = '<div class="error-topics">Failed to load topics</div>';
        });
    }
});
    // Add toggle function to window scope
    window.toggleSection = function (sectionId, courseId) {
      const sectionContent = document.getElementById(sectionId);
      const toggleIcon = document.getElementById(`toggle-${sectionId}`);
      
      const isActive = sectionContent.classList.contains('active');
      
      document.querySelectorAll(`#${courseId} .section-content`).forEach(s => s.classList.remove('active'));
      document.querySelectorAll(`#${courseId} .section-toggle`).forEach(t => t.classList.add('collapsed'));

      if (!isActive) {
        sectionContent.classList.add('active');
        toggleIcon.classList.remove('collapsed');
      }
    };

    if (typeof addStyles !== 'function') {
        window.addStyles = function() {
            if (document.getElementById('forum-ui-styles')) return;
            const styleElement = document.createElement('style');
            styleElement.id = 'forum-ui-styles';
            styleElement.textContent = `
                .update-notification { background-color: #2c3e50; color: #ecf0f1; border-radius: 8px; padding: 12px 16px; margin-bottom: 8px; display: flex; align-items: center; justify-content: space-between; border: 1px solid #34495e; width: 100%; max-width: 500px; margin-left: auto; margin-right: auto; box-sizing: border-box; }
                .update-info { display: flex; flex-direction: column; }
                .update-info strong { font-weight: bold; font-size: 14px; }
                .update-info span { font-size: 12px; opacity: 0.9; }
                .update-button { background-color: #3498db; color: white; text-decoration: none; padding: 8px 16px; border-radius: 6px; font-weight: bold; font-size: 13px; transition: background-color 0.2s ease; white-space: nowrap; }
                .update-button:hover { background-color: #2980b9; }
                .course-card { background: #1e1e1e; border-radius: 8px; box-shadow: 0 2px 8px rgba(0, 0, 0, 0.2); margin-bottom: 8px; overflow: hidden; width: 100%; max-width: 500px; margin-left: auto; margin-right: auto; border: 1px solid #333; box-sizing: border-box; }
                .course-header { padding: 8px; background: #252525; border-left: 4px solid #0070f3; margin-bottom: 0; width: 100%; box-sizing: border-box; }
                .course-header-link { display: block; text-decoration: none; cursor: pointer; color: inherit; transition: all 0.2s; }
                .course-header-link:hover { background: #303030; }
                .course-header h2 { margin: 0; font-size: 14px; color: #eee; }
                .course-code { color: #aaa; font-size: 10px; margin: 0; }
                .course-content { padding: 0 8px 8px; }
                .section-card { background: #252525; border-radius: 8px; box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1); overflow: hidden; width: 100%; margin-top: 8px; border: 1px solid #333; box-sizing: border-box; transition: opacity 0.5s ease-out; }
                .section-hiding { opacity: 0; }
                .section-header { background: #333; color: white; padding: 6px 8px; cursor: pointer; display: flex; justify-content: space-between; align-items: center; }
                .section-header h3 { margin: 0; font-size: 12px; }
                .section-toggle { color: white; transition: transform 0.3s; }
                .section-toggle.collapsed { transform: rotate(-90deg); }
                .section-content { padding: 8px; display: none; }
                .section-content.active { display: block; }
                .section-direct-link { margin-bottom: 10px; text-align: center; }
                .section-link-button { display: inline-flex; align-items: center; justify-content: center; gap: 6px; background: #0070f3; color: white; text-decoration: none; border-radius: 4px; padding: 6px 12px; font-size: 12px; transition: all 0.2s; width: 100%; box-sizing: border-box; }
                .section-link-button:hover { background: #0060df; transform: translateY(-2px); }
                .responsive-content img { max-width: 100% !important; height: auto !important; width: 100% !important; margin: 10px 0; border-radius: 4px; }
                .materials-card { background: #1e1e1e; border-radius: 6px; padding: 12px; margin-bottom: 16px; border: 1px solid #333; width: 100%; box-sizing: border-box; }
                .materials-card h4 { margin-top: 0; margin-bottom: 12px; color: #eee; font-size: 15px; }
                .materials-list { display: grid; grid-template-columns: 1fr; gap: 8px; }
                .material-item { display: flex; align-items: center; padding: 10px; background: #252525; border-radius: 4px; text-decoration: none; color: #eee; transition: all 0.2s; border: 1px solid #333; width: 100%; box-sizing: border-box; }
                .material-item:hover { transform: translateY(-2px); box-shadow: 0 4px 8px rgba(0, 0, 0, 0.3); background: #282828; }
                .material-icon { margin-right: 10px; color: #0070f3; flex-shrink: 0; }
                .material-details { flex: 1; display: flex; justify-content: space-between; align-items: center; font-size: 14px; }
                .item-card { background: #1e1e1e; border: 1px solid #333; border-radius: 6px; padding: 12px; margin-bottom: 8px; width: 100%; box-sizing: border-box; }
                .item-header { display: flex; align-items: center; margin-bottom: 10px; }
                .item-icon { background: #252525; width: 36px; height: 36px; border-radius: 50%; display: flex; align-items: center; justify-content: center; margin-right: 12px; color: #0070f3; flex-shrink: 0; }
                .item-details { flex: 1; display: flex; justify-content: space-between; align-items: center; }
                .item-details h4 { margin: 0; font-size: 14px; color: #eee; }
                .item-content { border-left: 3px solid #333; padding-left: 12px; margin: 12px 0; color: #aaa; font-size: 13px; }
                .item-file { margin: 12px 0; }
                .item-file a { color: #0070f3; text-decoration: none; display: flex; align-items: center; gap: 6px; font-size: 13px; }
                .item-action { display: flex; justify-content: flex-end; margin-top: 8px; }
                .action-button { background: #0070f3; color: white; padding: 4px 8px; border-radius: 4px; text-decoration: none; transition: all 0.2s; font-size: 12px; }
                .action-button:hover { background: #0060df; }
                .action-button.disabled { background: #333; color: #777; cursor: not-allowed; }
                .completion-badge { background: #00a550; color: white; padding: 3px 8px; border-radius: 12px; font-size: 11px; white-space: nowrap; }
                .duration-badge { background: #ff9800; color: white; padding: 3px 8px; border-radius: 12px; font-size: 11px; margin-left: 8px; white-space: nowrap; }
                .warning-message { background: #332b00; color: #ffd166; padding: 10px; border-radius: 4px; margin: 10px 0; font-size: 13px; border: 1px solid #554800; }
                .completed { border-left: 3px solid #00a550; }
                .has-warning { border-left: 3px solid #ffd166; }
                .forum-no-data { padding: 20px; text-align: center; color: #999; font-style: italic; max-width: 500px; margin: 0 auto; }
                #forum-list { max-width: 500px; margin: 0 auto; box-sizing: border-box; width: 100%; margin-bottom: 125px; }
                .copy-links-container { text-align: center; display: flex; gap: 0.5em; }
                .copy-links-button { background: #0070f3; color: white; border: none; width: 100%; border-radius: 4px; padding: 8px 16px; cursor: pointer; transition: all 0.2s; display: inline-flex; align-items: center; gap: 8px; font-size: 14px; }
                .copy-links-button:hover { background: #0060df; transform: translateY(-2px); }
                .copy-links-button.copied { background: #00a550; }
                .presensi-button { background:rgb(0, 160, 32); color: white; border: none; width: 100%; border-radius: 4px; padding: 8px 16px; cursor: pointer; transition: all 0.2s; display: inline-flex; align-items: center; gap: 8px; font-size: 14px; text-decoration: none; }
                .presensi-button:hover { background:rgb(0, 122, 2); transform: translateY(-2px); }
                .switch { position: relative; display: inline-block; width: 50px; height: 24px; }
                .switch input { opacity: 0; width: 0; height: 0; }
                .slider { position: absolute; cursor: pointer; top: 0; left: 0; right: 0; bottom: 0; background-color: #ccc; transition: .4s; }
                .slider:before { position: absolute; content: ""; height: 16px; width: 16px; left: 4px; bottom: 4px; background-color: white; transition: .4s; }
                input:checked + .slider { background-color: #0070f3; }
                input:checked + .slider:before { transform: translateX(26px); }
                .slider.round { border-radius: 24px; }
                .slider.round:before { border-radius: 50%; }
                .token-button { background: #0070f3; color: white; border: none; padding: 8px 16px; border-radius: 4px; cursor: pointer; font-size: 12px; display: flex; align-items: center; justify-content: center; gap: 6px; transition: all 0.2s; }
                .token-button:hover { background: #0060df; transform: translateY(-1px); }
                .forum-topics { display: flex; flex-wrap: wrap; gap: 6px; margin-top: 8px; padding-top: 8px; border-top: 1px solid rgba(255, 255, 255, 0.1); }
                .loading-topics, .no-topics, .error-topics { color: #666; font-size: 12px; font-style: italic; }
                .error-topics { color: #f43f5e; }
                .topic-badge { background: rgba(255, 255, 255, 0.71); color: #252525; padding: 4px 8px; border-radius: 5px; font-size: 11px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; width: 100%; transition: all 0.2s ease; text-decoration: none; display: inline-block; cursor: pointer; }
                .topic-badge:hover { background: rgba(56, 56, 56, 0.65); transform: translateY(-1px); color:rgb(255, 255, 255); text-decoration: none; box-shadow: 0 2px 4px rgba(255, 255, 255, 0.2); }
            `;
            document.head.appendChild(styleElement);
        }
    }
    
    addStyles();

    // Helper functions for UI rendering
    function getMaterialIcon(template) {
        const icons = { BUKU_ISBN: 'fa-book', VIDEO_AJAR: 'fa-video', POWER_POINT: 'fa-file-powerpoint', ARTIKEL_RISET: 'fa-file-alt', MATERI_LAINNYA: 'fa-folder-open' };
        return `<i class="fas ${icons[template] || 'fa-file'}"></i>`;
    }
    function getItemIcon(template) {
        const icons = { PRE_TEST: 'fa-tasks', POST_TEST: 'fa-tasks', FORUM_DISKUSI: 'fa-comments', PENUGASAN_TERSTRUKTUR: 'fa-clipboard-list', KUESIONER: 'fa-poll' };
        return `<i class="fas ${icons[template] || 'fa-file'}"></i>`;
    }
    function getActionText(template) {
        const texts = { PRE_TEST: 'Mulai Quiz', POST_TEST: 'Mulai Quiz', FORUM_DISKUSI: 'Buka Forum', PENUGASAN_TERSTRUKTUR: 'Lihat Tugas', KUESIONER: 'Isi Kuesioner' };
        return texts[template] || 'Buka';
    }
    function getItemTypeText(template) {
        const texts = { PRE_TEST: 'Pretest', POST_TEST: 'Posttest', FORUM_DISKUSI: 'Forum Diskusi', PENUGASAN_TERSTRUKTUR: 'Penugasan Terstruktur', KUESIONER: 'Kuesioner' };
        return texts[template] || '';
    }
  }

  // Fungsi baru untuk menampilkan grup dan menambahkan event listener
  function displayGroups(groups) {
    const groupResultsDiv = document.getElementById('group-results');
    const groupResultsCard = document.getElementById('group-results-card');
    const groupTotalInfoEl = document.getElementById('group-total-info');
    if (!groupResultsDiv || !groupResultsCard) return;

    const groupCount = groups.length;

    // Tampilkan jumlah total kelompok di judul
    if (groupTotalInfoEl) {
      groupTotalInfoEl.textContent = `- ${groupCount} Kelompok`;
    }

    // Generate HTML
    let html = '';
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
    groupResultsCard.style.display = 'block';

    // Event listener untuk menyalin data semua kelompok
    document
      .getElementById('copy-all-groups-btn')
      .addEventListener('click', () => {
        let groupsData = '';
        groups.forEach((group, index) => {
          groupsData += `KELOMPOK ${index + 1} (${group.length} mahasiswa)\n`;
          group.forEach((student) => {
            groupsData += `${student.absen}. ${student.nama_mahasiswa} (${student.nim})\n`;
          });
          groupsData += '\n';
        });
        copyToClipboard(groupsData, 'Data kelompok berhasil disalin');
      });

    // Event listener untuk menghapus kelompok dengan konfirmasi custom modal
    document
      .getElementById('delete-groups-btn')
      .addEventListener('click', () => {
        const confirmationMessage = `Anda akan menghapus <br><b>${groupCount} kelompok</b> yang sudah dibuat. <br>Apakah Anda yakin?`;

        showConfirmationDialog(confirmationMessage, () => {
          // Hapus dari local storage
          localStorage.removeItem(STORAGE_KEYS.STUDENT_GROUPS);

          // Sembunyikan card dan hapus isinya
          groupResultsCard.style.display = 'none';
          groupResultsDiv.innerHTML = '';
          if (groupTotalInfoEl) {
            groupTotalInfoEl.textContent = ''; // Hapus info jumlah
          }

          showToast('Data kelompok berhasil dihapus');
        });
      });
  }

  // Update student data UI
  function updateStudentUI(courseDataList) {
    const studentTab = document.getElementById('student-data-tab');
    if (!studentTab) return;

    const studentList = document.getElementById('student-list');
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

    const groupResultsCard = `
    <div class="data-card" id="group-results-card" style="display: none;">
      <div class="card-header">
        <h3 class="card-title">Hasil kelompok <span id="group-total-info" class="group-total-info"></span></h3>
        <div class="card-actions">
          <button id="copy-all-groups-btn" class="secondary-btn">
            <i class="fas fa-copy"></i>
          </button>
          <button id="delete-groups-btn" class="danger-btn">
            <i class="fas fa-trash-alt"></i> 
          </button>
        </div>
      </div>
      <div id="group-results"></div>
    </div>
  `;

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

    studentsHtml += `</div></div>`;
    studentList.innerHTML = studentsHtml;

    const savedGroups = getFromLocalStorage(STORAGE_KEYS.STUDENT_GROUPS);
    if (savedGroups && savedGroups.length > 0) {
      displayGroups(savedGroups);
    }

    document.getElementById('create-groups-btn').addEventListener('click', () => {
        const groupCount = parseInt(document.getElementById('group-count').value, 10);
        const groupingMethod = document.querySelector('input[name="grouping-method"]:checked').value;

        if (groupCount >= 1 && groupCount <= allUniqueStudents.length) {
            createGroups(allUniqueStudents, groupCount, groupingMethod);
        } else {
            alert(`Jumlah kelompok harus antara 1 dan ${allUniqueStudents.length}`);
        }
    });

    document.getElementById('copy-all-students-btn').addEventListener('click', () => {
        const studentData = allUniqueStudents
          .map(s => `${s.absen}. ${s.nama_mahasiswa} (${s.nim})`).join('\n');
        copyToClipboard(studentData, 'Data mahasiswa berhasil disalin');
    });

    if (!document.getElementById('enhanced-styles')) {
      const style = document.createElement('style');
      style.id = 'enhanced-styles';
      style.textContent = `
        /* ALL THE CSS FROM THE ORIGINAL SCRIPT'S student UI section GOES HERE */
        /* NOTE: To keep this response manageable, the full CSS is not repeated. 
           It's identical to the CSS in your provided file. */
           .data-card { background: #1e1e1e; border-radius: 8px; margin-bottom: 9rem; padding: 16px; box-shadow: 0 2px 8px rgba(0, 0, 0, 0.2); border: 1px solid #333; }
           #group-results-card{ margin-bottom: 1rem; }
           .card-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 16px; padding-bottom: 8px; border-bottom: 1px solid #333; }
           .card-title { font-size: 16px; font-weight: 600; color: #eee; margin: 0; display: flex; align-items: center; gap: 8px; }
           .group-total-info { font-size: 14px; font-weight: 500; color: #888; }
           .card-actions { display: flex; gap: 8px; }
           .primary-btn { background: #0070f3; color: white; border: none; padding: 8px 16px; border-radius: 4px; cursor: pointer; font-weight: 500; transition: background 0.2s; }
           .primary-btn:hover { background: #0060df; }
           .secondary-btn { background: #333; color: white; border: none; padding: 8px 16px; border-radius: 4px; cursor: pointer; font-weight: 500; transition: background 0.2s; display: flex; align-items: center; gap: 6px; }
           .secondary-btn:hover { background: #444; }
           .danger-btn { background-color: #e74c3c; color: white; border: none; padding: 8px 16px; border-radius: 4px; cursor: pointer; font-weight: 500; transition: background-color 0.2s; display: flex; align-items: center; gap: 6px; }
           .danger-btn:hover { background-color: #c0392b; }
           .grouping-form { margin-bottom: 1rem; }
           .input-group { display: flex; gap: 8px; margin-bottom: 12px; }
           .group-input { flex: 1; background: #252525; border: 1px solid #333; color: #eee; padding: 8px 12px; border-radius: 4px; font-size: 14px; }
           .grouping-options { display: flex; gap: 16px; }
           .radio-container { display: flex; align-items: center; cursor: pointer; }
           .radio-label { margin-left: 4px; font-size: 14px; color: #ccc; }
           .students-container { display: grid; grid-template-columns: repeat(auto-fill, minmax(250px, 1fr)); gap: 12px; margin-top: 12px; }
           .student-item { background: #252525; border-radius: 6px; padding: 10px; transition: transform 0.2s, box-shadow 0.2s; border: 1px solid #333; }
           .student-item:hover { transform: translateY(-2px); box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2); }
           .student-inline { display: flex; align-items: center; gap: 8px; flex-wrap: nowrap; width: 100%; }
           .student-absen { display: flex; align-items: center; justify-content: center; min-width: 20px; height: 20px; background:rgb(182, 243, 0); color: #252525; border-radius: 5px; font-size: 10px; font-weight: bold; flex-shrink: 0; }
           .student-item-title { font-weight: 500; margin: 0; font-size: 14px; color: #eee; flex: 1; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
           .token-badge { background: #333; color: #aaa; font-size: 12px; padding: 2px 6px; border-radius: 4px; font-family: monospace; flex-shrink: 0; }
           .student-count { color: #999; font-size: 13px; margin-top: 4px; }
           #group-results { display: grid; grid-template-columns: repeat(auto-fill, minmax(250px, 1fr)); gap: 16px; margin-top: 16px; }
           .group-container { background: #252525; border-radius: 6px; overflow: hidden; border: 1px solid #333; }
           .group-header { background: #333; padding: 10px 12px; font-weight: bold; display: flex; justify-content: space-between; color: #eee; }
           .group-count { font-size: 12px; color: #aaa; }
           .group-members { padding: 8px; }
           .group-member { display: flex; padding: 8px; border-bottom: 1px solid #333; align-items: center; }
           .group-member:last-child { border-bottom: none; }
           .member-absen { min-width: 20px; height: 20px; background:rgb(45, 143, 255); color: #252525; border-radius: 5px; display: flex; align-items: center; justify-content: center; font-size: 10px; margin-right: 10px; color: white; flex-shrink: 0; }
           .member-name { flex: 1; font-size: 14px; color: #eee; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
           .member-nim { color: #aaa; font-size: 12px; font-family: monospace; margin-left: 8px; flex-shrink: 0; }
           .token-tabs { display: flex; position: sticky; top: 0; z-index: 100; }
           .token-tab { padding: 8px 10px; background: transparent; border: none; color: #ccc; cursor: pointer; font-weight: 500; border-bottom: 2px solid transparent; }
           .token-tab:hover { color: #fff; }
           .token-tab.active { color: #fff; border-bottom: 2px solid #0070f3; background: #1e1e1e; }
           .toast { position: fixed; bottom: 20px; right: 20px; background:#1e1e1e; color:rgb(0, 221, 15); padding: 12px 20px; border-radius: 4px; box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3); border: 1px solid #333; display: flex; align-items: center; gap: 8px; z-index: 100099; animation: fadeIn 0.3s, fadeOut 0.3s 2.7s; animation-fill-mode: forwards; }
           .toast i { color: #2ecc71; }
           @keyframes fadeIn { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
           @keyframes fadeOut { from { opacity: 1; transform: translateY(0); } to { opacity: 0; transform: translateY(20px); } }
           #custom-confirm-modal { position: fixed; top: 0; left: 0; width: 100%; height: 100%; z-index: 10005; display: none; align-items: center; justify-content: center; }
           #custom-confirm-modal.visible { display: flex; }
           .custom-confirm-overlay { position: absolute; width: 100%; height: 100%; background-color: rgba(0, 0, 0, 0.7); backdrop-filter: blur(5px); animation: fadeIn 0.2s ease-out forwards; }
           .custom-confirm-box { background-color: #2a2a2a; color: #f0f0f0; border-radius: 12px; box-shadow: 0 10px 30px rgba(0,0,0,0.5); border: 1px solid #444; width: 90%; max-width: 400px; z-index: 1; transform: scale(0.95); opacity: 0; animation: zoomIn 0.2s ease-out forwards; }
           #custom-confirm-modal.visible .custom-confirm-box { opacity: 1; transform: scale(1); }
           .custom-confirm-header { padding: 16px 20px; border-bottom: 1px solid #444; }
           .custom-confirm-header h3 { margin: 0; font-size: 18px; color: #fff; }
           .custom-confirm-content { padding: 20px; font-size: 15px; line-height: 1.6; color: #ccc; }
           .custom-confirm-content p { margin: 0; }
           .custom-confirm-actions { padding: 16px 20px; background-color: #252525; display: flex; justify-content: flex-end; gap: 12px; border-bottom-left-radius: 12px; border-bottom-right-radius: 12px; }
           .custom-confirm-btn { border: none; border-radius: 6px; padding: 10px 20px; font-size: 14px; font-weight: 600; cursor: pointer; transition: all 0.2s ease; }
           .custom-confirm-btn-cancel { background-color: #444; color: #f0f0f0; }
           .custom-confirm-btn-cancel:hover { background-color: #555; }
           .custom-confirm-btn-ok { background-color: #e74c3c; color: #fff; }
           .custom-confirm-btn-ok:hover { background-color: #c0392b; }
           @keyframes zoomIn { from { transform: scale(0.9); opacity: 0; } to { transform: scale(1); opacity: 1; } }
      `;
      document.head.appendChild(style);
    }
  }

  function createGroups(students, groupCount, method) {
    let studentsToDivide = [...students];
    if (method === 'random') {
      studentsToDivide.sort(() => Math.random() - 0.5);
    }

    const groups = Array.from({ length: groupCount }, () => []);
    let currentGroup = 0;
    studentsToDivide.forEach(student => {
        groups[currentGroup].push(student);
        currentGroup = (currentGroup + 1) % groupCount;
    });

    saveToLocalStorage(STORAGE_KEYS.STUDENT_GROUPS, groups);
    displayGroups(groups);
  }

  function copyToClipboard(text, message) {
    navigator.clipboard.writeText(text)
      .then(() => showToast(message))
      .catch((err) => showToast('Gagal menyalin: ' + err));
  }

  function showToast(message) {
    const existingToast = document.querySelector('.toast');
    if (existingToast) existingToast.remove();

    const toast = document.createElement('div');
    toast.className = 'toast';
    toast.innerHTML = `<i class="fas fa-check-circle"></i><span>${message}</span>`;
    document.body.appendChild(toast);

    setTimeout(() => toast.remove(), 3000);
  }

  function saveToken(token) {
    if (!token) return;
    if (token.startsWith('Bearer ')) token = token.substring(7);

    const tokenInfo = decodeToken(`Bearer ${token}`);
    if (!tokenInfo || authToken === token) return;

    authToken = token;
    userInfo = tokenInfo;

    console.log('Token baru ditangkap:', tokenInfo.username);
    saveToLocalStorage(STORAGE_KEYS.AUTH_TOKEN, token);
    saveToLocalStorage(STORAGE_KEYS.USER_INFO, tokenInfo);

    updateTokenUI(token, tokenInfo);
    updateUserInfoUI(tokenInfo);

    const cachedCourseData = getFromLocalStorage(STORAGE_KEYS.COURSE_DATA);
    if (!cachedCourseData || cachedCourseData.length === 0) {
      setTimeout(() => fetchCoursesListAndDetails(), 1000);
    }
  }

  async function fetchAndDisplayIndividualCourseData(courseCode) {
    if (!authToken) return null;
    try {
      const response = await fetch(`https://mentari.unpam.ac.id/api/user-course/${courseCode}`, {
        headers: { 'Authorization': `Bearer ${authToken}` },
      });
      if (!response.ok) throw new Error(`API error: ${response.status}`);
      const data = await response.json();
      console.log(`Data course diterima: ${courseCode}`);
      return data;
    } catch (error) {
      console.error(`Gagal mengambil data course ${courseCode}:`, error);
      return null;
    }
  }

  async function fetchCoursesListAndDetails(forceRefresh = false) {
    const cachedData = getFromLocalStorage(STORAGE_KEYS.COURSE_DATA);
    if (!forceRefresh && cachedData?.length > 0) {
      console.log('Menggunakan data course dari cache.');
      courseDataList = cachedData;
      await updateForumUI(courseDataList);
      updateStudentUI(courseDataList);
      return;
    }

    if (isHandlingCourseApiRequest || !authToken) return;

    try {
      isHandlingCourseApiRequest = true;
      const response = await fetch(`https://mentari.unpam.ac.id/api/user-course?page=1&limit=50`, {
        headers: { 'Authorization': `Bearer ${authToken}` },
      });
      if (!response.ok) throw new Error(`API error: ${response.status}`);
      const data = await response.json();

      console.log(`Total courses ditemukan: ${data.data.length}`);
      
      courseDataList = await Promise.all(
        data.data.map(course => fetchAndDisplayIndividualCourseData(course.kode_course))
      );
      courseDataList = courseDataList.filter(Boolean); // Hapus hasil null dari fetch yang gagal

      saveToLocalStorage(STORAGE_KEYS.COURSE_DATA, courseDataList);
      saveToLocalStorage(STORAGE_KEYS.LAST_UPDATE, new Date().toLocaleString());

      await updateForumUI(courseDataList);
      updateStudentUI(courseDataList);
    } catch (error) {
      console.error(`Gagal mengambil daftar course:`, error);
    } finally {
      isHandlingCourseApiRequest = false;
    }
  }

  async function checkStorages() {
    const savedToken = getFromLocalStorage(STORAGE_KEYS.AUTH_TOKEN);
    const savedUserInfo = getFromLocalStorage(STORAGE_KEYS.USER_INFO);

    if (savedToken && savedUserInfo) {
      authToken = savedToken;
      userInfo = savedUserInfo;
      updateTokenUI(savedToken, savedUserInfo);
      updateUserInfoUI(savedUserInfo);

      const cachedCourseData = getFromLocalStorage(STORAGE_KEYS.COURSE_DATA);
      if (cachedCourseData?.length > 0) {
        courseDataList = cachedCourseData;
        await updateForumUI(courseDataList);
        updateStudentUI(courseDataList);
      }
      return true;
    }
    return false;
  }

  function interceptRequests() {
    const originalFetch = window.fetch;
    window.fetch = function(resource, init = {}) {
        const authHeader = init?.headers?.Authorization || init?.headers?.authorization;
        if (authHeader) saveToken(authHeader);
        return originalFetch.apply(this, arguments);
    };

    const originalOpen = XMLHttpRequest.prototype.open;
    const originalSetRequestHeader = XMLHttpRequest.prototype.setRequestHeader;
    XMLHttpRequest.prototype.open = function() {
        this._headers = {};
        return originalOpen.apply(this, arguments);
    };
    XMLHttpRequest.prototype.setRequestHeader = function(header, value) {
        if (header.toLowerCase() === 'authorization') saveToken(value);
        return originalSetRequestHeader.apply(this, arguments);
    };
  }
  
  function clickDashboardButton() {
    const cachedCourseData = getFromLocalStorage(STORAGE_KEYS.COURSE_DATA);
    if (cachedCourseData?.length > 0) return;

    const dashboardButton = Array.from(document.querySelectorAll('button span.MuiTypography-root'))
      .find(span => span.textContent === 'Dashboard')?.closest('button');

    if (dashboardButton) {
      console.log('Tombol Dashboard ditemukan, mengklik...');
      dashboardButton.click();
    } else {
      console.warn('Tombol Dashboard tidak ditemukan.');
    }
  }

  // Expose functions to window
  window.toggleTokenPopup = function () {
    const popup = document.getElementById('token-runner-popup');
    if (!popup) createPopupUI();
    else toggleCollapse();
  };
  window.getAuthToken = () => authToken || 'Belum ada token terdeteksi';
  window.checkCourse = () => {
    const courseCode = extractCourseCodeFromUrl(window.location.href);
    console.log(courseCode ? `Kode Course: ${courseCode}` : 'Tidak ada kode course pada URL ini');
  };
  window.fetchCourse = (courseCode) => {
    if (!courseCode) return console.log("Masukkan kode course.");
    if (!authToken) return console.log("Tidak ada token terdeteksi.");
    return fetchAndDisplayIndividualCourseData(courseCode);
  };
  window.fetchCoursesList = () => fetchCoursesListAndDetails(true);
  
  // Fungsi clear cache yang benar (menghapus duplikat)
  window.clearCacheData = function () {
    localStorage.removeItem(STORAGE_KEYS.AUTH_TOKEN);
    localStorage.removeItem(STORAGE_KEYS.USER_INFO);
    localStorage.removeItem(STORAGE_KEYS.COURSE_DATA);
    localStorage.removeItem(STORAGE_KEYS.LAST_UPDATE);
    localStorage.removeItem(STORAGE_KEYS.STUDENT_GROUPS);
    console.log('Cache data dan info user berhasil dihapus. Refresh untuk mengambil data baru.');
  };

  async function init() {
    const canContinue = await performExtensionKillSwitchCheck();
    if (!canContinue) return;

    createPopupUI();
    createConfirmationModal();
    interceptRequests();

    const hasExistingData = await checkStorages();
    if (!hasExistingData) {
      setTimeout(() => {
        document.querySelector('.card.MuiBox-root')?.click();
        setTimeout(clickDashboardButton, 1000);
      }, 1000);
    }
  }

  init();

  async function fetchForumTopics(forumId) {
    if (!authToken) return [];
    try {
      const response = await fetch(`https://mentari.unpam.ac.id/api/forum/topic/${forumId}`, {
        headers: { 'Authorization': `Bearer ${authToken}` },
      });
      if (!response.ok) throw new Error(`API error: ${response.status}`);
      const data = await response.json();
      return data.topics?.filter(topic => topic.id_trx_course_sub_section === forumId) || [];
    } catch (error) {
      console.error('Gagal mengambil topik forum:', error);
      return [];
    }
  }
})();