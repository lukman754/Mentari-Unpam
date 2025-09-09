console.log('Token.js sedang dijalankan!')

// Inisialisasi UI dan logic token
;(function () {
  let authToken = null
  let isHandlingCourseApiRequest = false
  let courseDataList = []
  let userInfo = null
  let studentDataList = []

  // Nama kunci untuk localStorage
  const STORAGE_KEYS = {
    AUTH_TOKEN: 'mentari_auth_token',
    USER_INFO: 'mentari_user_info',
    COURSE_DATA: 'mentari_course_data',
    LAST_UPDATE: 'mentari_last_update',
    STUDENT_GROUPS: 'mentari_student_groups',
  }

async function checkForUpdates() {
  try {
    const manifestUrl = 'https://raw.githubusercontent.com/AnandaAnugrahHandyanto/mentari_unpam-mod/main/manifest.json?_=' + new Date().getTime();

    const response = await fetch(manifestUrl);
    if (!response.ok) {
      console.error('Gagal mengambil manifest dari GitHub.');
      return null;
    }

    const remoteManifest = await response.json();
    const remoteVersion = remoteManifest.version;
    const tokenScriptElement = document.getElementById('mentari-mod-token-script');
    const localVersion = tokenScriptElement.dataset.version;

    // Bandingkan Versi
    const compareVersions = (v1, v2) => {
        const parts1 = v1.split('.').map(Number);
        const parts2 = v2.split('.').map(Number);
        const len = Math.max(parts1.length, parts2.length);
        for (let i = 0; i < len; i++) {
            const p1 = parts1[i] || 0;
            const p2 = parts2[i] || 0;
            if (p1 > p2) return 1;
            if (p2 > p1) return -1;
        }
        return 0;
    };

    // Jika versi remote lebih baru
    if (compareVersions(remoteVersion, localVersion) > 0) {
      return {
        isUpdateAvailable: true,
        newVersion: remoteVersion,
        releaseUrl: 'https://github.com/AnandaAnugrahHandyanto/mentari_unpam-mod/releases/latest'
      };
    }

    return { isUpdateAvailable: false };
  } catch (error) {
    console.error('Error saat memeriksa pembaruan:', error);
    return null;
  }
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

  // Fungsi untuk menghapus cache data
  window.clearCacheData = function () {
    localStorage.removeItem(STORAGE_KEYS.COURSE_DATA)
    localStorage.removeItem(STORAGE_KEYS.LAST_UPDATE)
    localStorage.removeItem(STORAGE_KEYS.STUDENT_GROUPS)
    console.log(
      'Cache data berhasil dihapus. Refresh halaman untuk mengambil data baru.'
    )
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
    padding: 0 12px;
    margin-top: 8px;
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
  `;
    document.head.appendChild(style)
    document.body.appendChild(popup)

    // EVENT LISTENER BARU UNTUK TOMBOL CATATAN
    document
      .getElementById('add-notes-section-btn')
      .addEventListener('click', injectNotesUI)

    // Enhanced refresh function with loading animation
    function refreshAndTrackWithLoading() {
      // Show loading animation
      const loadingBar = document.querySelector('.token-loading-bar')
      loadingBar.classList.add('active')

      // Call the original function if it exists
      if (typeof window.refreshAndTrack === 'function') {
        // Call the original function
        const result = window.refreshAndTrack()

        // If it returns a promise, handle it
        if (result && typeof result.then === 'function') {
          result
            .then(() => {
              setTimeout(() => loadingBar.classList.remove('active'), 500)
            })
            .catch(() => {
              setTimeout(() => loadingBar.classList.remove('active'), 500)
            })
        } else {
          // If not a promise, hide loading after a delay
          setTimeout(() => loadingBar.classList.remove('active'), 1500)
        }

        return result
      } else {
        // If original function doesn't exist, just show animation for visual feedback
        setTimeout(() => loadingBar.classList.remove('active'), 1500)
      }
    }

    // Toggle popup state
    function toggleCollapse() {
      popup.classList.toggle('collapsed')
    }

    // Make popup draggable with touch/mouse
    let isDragging = false
    let offsetX = 0
    let offsetY = 0

    // Mouse drag initialization
    popup.querySelector('.popup-header').addEventListener('mousedown', (e) => {
      if (e.target.closest('button') || e.target.closest('a')) {
        return
      }

      isDragging = true
      offsetX = e.clientX - popup.getBoundingClientRect().left
      offsetY = e.clientY - popup.getBoundingClientRect().top
      e.preventDefault()
    })

    // Mouse drag movement
    document.addEventListener('mousemove', (e) => {
      if (!isDragging) return

      const x = e.clientX - offsetX
      const y = e.clientY - offsetY

      // Limit dragging to keep popup on screen
      if (
        x > 0 &&
        x < window.innerWidth - popup.offsetWidth &&
        y > 0 &&
        y < window.innerHeight - popup.offsetHeight
      ) {
        popup.style.left = x + 'px'
        popup.style.top = y + 'px'
        popup.style.right = 'auto'
        popup.style.bottom = 'auto'
      }
    })

    // Mouse drag end
    document.addEventListener('mouseup', () => {
      isDragging = false
    })

    // Touch drag initialization - only on header and toggle
    const dragHandles = [
      popup.querySelector('.popup-header'),
      popup.querySelector('.popup-toggle'),
    ]

    dragHandles.forEach((handle) => {
      handle.addEventListener(
        'touchstart',
        (e) => {
          if (e.target.closest('button') || e.target.closest('a')) {
            return
          }

          isDragging = true
          offsetX = e.touches[0].clientX - popup.getBoundingClientRect().left
          offsetY = e.touches[0].clientY - popup.getBoundingClientRect().top
        },
        { passive: true }
      )
    })

    // Touch drag movement - applied globally but only acts when dragging
    document.addEventListener(
      'touchmove',
      (e) => {
        if (!isDragging) return

        // Only prevent default if actually dragging the popup
        e.preventDefault()

        const x = e.touches[0].clientX - offsetX
        const y = e.touches[0].clientY - offsetY

        // Limit dragging to keep popup on screen
        if (
          x > 0 &&
          x < window.innerWidth - popup.offsetWidth &&
          y > 0 &&
          y < window.innerHeight - popup.offsetHeight
        ) {
          popup.style.left = x + 'px'
          popup.style.top = y + 'px'
          popup.style.right = 'auto'
          popup.style.bottom = 'auto'
        }
      },
      { passive: false }
    )

    // Touch drag end
    document.addEventListener('touchend', () => {
      isDragging = false
    })

    // Special handling for toggle which is always draggable
    const toggle = popup.querySelector('.popup-toggle')

    toggle.addEventListener(
      'touchstart',
      (e) => {
        if (popup.classList.contains('collapsed')) {
          isDragging = true
          offsetX = e.touches[0].clientX - popup.getBoundingClientRect().left
          offsetY = e.touches[0].clientY - popup.getBoundingClientRect().top
        }
      },
      { passive: true }
    )

    toggle.addEventListener('click', (e) => {
      if (!isDragging || popup.classList.contains('collapsed')) {
        toggleCollapse()
      }
      // Reset dragging to avoid unwanted behavior
      isDragging = false
    })

    // Handle event listeners
    document
      .getElementById('token-reset-btn')
      .addEventListener('click', refreshAndTrackWithLoading)

    // Tab switching
    document.querySelectorAll('.token-tab').forEach((tab) => {
      tab.addEventListener('click', () => {
        document
          .querySelectorAll('.token-tab')
          .forEach((t) => t.classList.remove('active'))
        document
          .querySelectorAll('.token-tab-content')
          .forEach((c) => c.classList.remove('active'))

        tab.classList.add('active')
        const tabId = tab.dataset.tab + '-tab'
        document.getElementById(tabId).classList.add('active')
      })
    })

    // Initialize the position for when page loads
    applyDefaultPosition()

    // Apply default position from localStorage
    function applyDefaultPosition() {
      // Define possible positions
      const positions = [
        {
          bottom: '20px',
          right: '20px',
          top: 'auto',
          left: 'auto',
          isRight: true,
        }, // Bottom Right
        {
          bottom: '20px',
          right: 'auto',
          top: 'auto',
          left: '20px',
          isRight: false,
        }, // Bottom Left
        {
          bottom: 'auto',
          right: 'auto',
          top: '20px',
          left: '20px',
          isRight: false,
        }, // Top Left
        {
          bottom: 'auto',
          right: '20px',
          top: '20px',
          left: 'auto',
          isRight: true,
        }, // Top Right
      ]

      // Get current position or set default (0 for bottom-right)
      let currentPosition = parseInt(
        localStorage.getItem('tokenRunnerPosition') || '0'
      )

      const pos = positions[currentPosition]

      // Apply positioning properties
      popup.style.bottom = pos.bottom
      popup.style.right = pos.right
      popup.style.top = pos.top
      popup.style.left = pos.left
    }
  }

  // Modified position toggle function that hides the button
  function addPositionToggleToPopup() {
    // Check if popup exists
    const popup = document.getElementById('token-runner-popup')
    if (!popup) return

    // Create position toggle button (hidden)
    const positionBtn = document.createElement('button')
    positionBtn.id = 'token-position-btn'
    positionBtn.style.display = 'none'
    positionBtn.innerHTML =
      '<i class="fa-solid fa-arrows-up-down-left-right fa-fw"></i>'

    // Add the button to the header actions
    const actionsDiv = document.querySelector('.token-popup-actions')
    if (actionsDiv) {
      actionsDiv.insertBefore(positionBtn, actionsDiv.firstChild)
    }

    // Define possible positions with proper object syntax
    const positions = [
      {
        bottom: '20px',
        right: '20px',
        top: 'auto',
        left: 'auto',
        isRight: true,
      }, // Bottom Right
      {
        bottom: '20px',
        right: 'auto',
        top: 'auto',
        left: '20px',
        isRight: false,
      }, // Bottom Left
      {
        bottom: 'auto',
        right: 'auto',
        top: '20px',
        left: '20px',
        isRight: false,
      }, // Top Left
      {
        bottom: 'auto',
        right: '20px',
        top: '20px',
        left: 'auto',
        isRight: true,
      }, // Top Right
    ]

    // Get current position or set default (0 for bottom-right)
    let currentPosition = parseInt(
      localStorage.getItem('tokenRunnerPosition') || '0'
    )

    // Apply the stored position when the page loads
    applyPosition(currentPosition)

    // Function to apply position
    function applyPosition(posIndex) {
      const pos = positions[posIndex]

      // Apply positioning properties
      popup.style.bottom = pos.bottom
      popup.style.right = pos.right
      popup.style.top = pos.top
      popup.style.left = pos.left
    }
  }

  // Modify the original createPopupUI function to call our new function
  const originalCreatePopupUI = createPopupUI
  createPopupUI = function () {
    originalCreatePopupUI()
    addPositionToggleToPopup()
  }

  // If the popup is already created, add the toggle immediately
  if (document.getElementById('token-runner-popup')) {
    addPositionToggleToPopup()
  }

  // Toggle collapse
  function toggleCollapse() {
    const popup = document.getElementById('token-runner-popup')
    if (popup) {
      if (popup.classList.contains('collapsed')) {
        popup.style.width = '' // Lebar lebih kecil
      } else {
        popup.style.width = '300px'
      }
      popup.classList.toggle('collapsed')
    }
  }

  // Decode JWT token
  function decodeToken(token) {
    try {
      if (!token) return null
      if (token.startsWith('Bearer ')) token = token.substring(7)

      const base64Url = token.split('.')[1]
      const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/')
      const payload = JSON.parse(atob(base64))

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
      }
    } catch (e) {
      console.error('Error decoding token:', e)
      return null
    }
  }

  // Extract course code from URL
  function extractCourseCodeFromUrl(url) {
    const courseCodeRegex =
      /\/api\/user-course\/([0-9]{5}-[0-9A-Z]+(?:-[0-9A-Z]+)?)/
    const match = url.match(courseCodeRegex)
    if (match && match[1]) return match[1]

    const pageUrlRegex = /\/u-courses\/([0-9]{5}-[0-9A-Z]+(?:-[0-9A-Z]+)?)/
    const pageMatch = url.match(pageUrlRegex)
    if (pageMatch && pageMatch[1]) return pageMatch[1]

    return null
  }

  // Create custom URL
  function createCustomUrl(courseCode) {
    return courseCode
      ? `https://mentari.unpam.ac.id/u-courses/${courseCode}`
      : null
  }

  // Update token tab UI
  function updateTokenUI(token, tokenInfo) {
    const tokenTab = document.getElementById('token-data-tab')
    if (!tokenTab) return

    let tokenDisplay = token
    // Jika token panjang, buat versi disingkat
    if (tokenDisplay && tokenDisplay.length > 40) {
      tokenDisplay =
        tokenDisplay.substring(0, 15) +
        '...' +
        tokenDisplay.substring(tokenDisplay.length - 15)
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
    `

    // Add copy functionality
    tokenTab.querySelectorAll('.token-copy-btn').forEach((btn) => {
      btn.addEventListener('click', () => {
        const textToCopy = btn.getAttribute('data-copy')
        navigator.clipboard.writeText(textToCopy).then(() => {
          const originalText = btn.innerText
          btn.innerText = 'Copied!'
          setTimeout(() => {
            btn.innerText = originalText
          }, 1500)
        })
      })
    })
  }

  // Update user info UI
  function updateUserInfoUI(tokenInfo) {
    const userInfoTab = document.getElementById('user-info-tab')
    if (!userInfoTab || !tokenInfo) return

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
              <div style="display: flex; justify-content: space-between; align-items: center;">
                <p><span class="token-key">Gemini AI :</span></p>
                <label class="switch">
                  <input type="checkbox" id="gemini-toggle" ${
                    localStorage.getItem('gemini_enabled') === 'true'
                      ? 'checked'
                      : ''
                  }>
                  <span class="slider round"></span>
                </label>
              </div>
            </div>
          </div>

          <div class="token-data-item">
            <div class="token-info-section">
              <div style="display: flex; justify-content: space-between; align-items: center;">
                <p><span class="token-key">Auto Selesai Quiz :</span></p>
                <label class="switch">
                  <input type="checkbox" id="auto-finish-quiz-toggle" ${
                    localStorage.getItem('auto_finish_quiz') === 'true'
                      ? 'checked'
                      : ''
                  }>
                  <span class="slider round"></span>
                </label>
              </div>
            </div>
          </div>

          <div class="token-data-item">
            <div class="token-info-section">
              <button id="update-api-key" class="token-button" style="width: 100%;">
                <i class="fas fa-key"></i> Update API Key
              </button>
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
      <img src="https://img.icons8.com/?size=100&id=118467&format=png&color=ffffff" width=18" alt="Facebook" />
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
    `

    // Add event listeners for new buttons
    const geminiToggle = document.getElementById('gemini-toggle')
    if (geminiToggle) {
      // Load initial state from localStorage
      const savedGeminiState = localStorage.getItem('gemini_enabled') === 'true'
      geminiToggle.checked = savedGeminiState

      // Set initial visibility based on saved state
      const geminiPopup = document.getElementById('geminiChatbot')
      const geminiToggleBtn = document.getElementById('geminiChatbotToggle')

      if (savedGeminiState) {
        // If Gemini was enabled, show only the toggle button
        if (geminiToggleBtn) {
          geminiToggleBtn.style.display = 'flex'
        }
        if (geminiPopup) {
          geminiPopup.style.display = 'none'
        }
      } else {
        // If Gemini was disabled, hide both
        if (geminiToggleBtn) {
          geminiToggleBtn.style.display = 'none'
        }
        if (geminiPopup) {
          geminiPopup.style.display = 'none'
        }
      }

      geminiToggle.addEventListener('change', function () {
        const isEnabled = this.checked
        localStorage.setItem('gemini_enabled', isEnabled)

        // When toggle is enabled, only show the toggle button
        const geminiToggleBtn = document.getElementById('geminiChatbotToggle')
        if (geminiToggleBtn) {
          geminiToggleBtn.style.display = isEnabled ? 'flex' : 'none'
        }

        // Always keep the chat interface hidden when toggle state changes
        const geminiPopup = document.getElementById('geminiChatbot')
        if (geminiPopup) {
          geminiPopup.style.display = 'none'
        }
      })
    }

    // Toggle Auto Selesai Quiz
    const autoFinishQuizToggle = document.getElementById(
      'auto-finish-quiz-toggle'
    )
    if (autoFinishQuizToggle) {
      autoFinishQuizToggle.checked =
        localStorage.getItem('auto_finish_quiz') === 'true'
      autoFinishQuizToggle.addEventListener('change', function () {
        localStorage.setItem('auto_finish_quiz', this.checked)
      })
    }

    // Add click event to toggle button to show chat interface
    const geminiToggleBtn = document.getElementById('geminiChatbotToggle')
    if (geminiToggleBtn) {
      geminiToggleBtn.addEventListener('click', function () {
        const geminiPopup = document.getElementById('geminiChatbot')
        if (geminiPopup) {
          geminiPopup.style.display = 'flex'
        }
      })
    }

    const updateApiKeyBtn = document.getElementById('update-api-key')
    if (updateApiKeyBtn) {
      updateApiKeyBtn.addEventListener('click', function () {
        // Call showApiKeyPopup from apiKeyManager.js
        if (typeof showApiKeyPopup === 'function') {
          showApiKeyPopup()
        } else {
          console.error(
            'showApiKeyPopup function not found. Make sure apiKeyManager.js is loaded.'
          )
        }
      })
    }
  }

  // Update forum data UI
  async function updateForumUI(courseDataList) {
    const forumTab = document.getElementById('forum-data-tab')
    if (!forumTab) return

    const forumList = document.getElementById('forum-list')
    if (!forumList) return
    
    const updateStatus = await checkForUpdates();
    let updateHtml = '';

  if (updateStatus && updateStatus.isUpdateAvailable) {
    updateHtml = `
      <div id="update-notification" style="background-color: #2e2e2e; border: 1px solid #4CAF50; border-radius: 8px; padding: 15px; margin-bottom: 12px; text-align: center;">
        <h4 style="margin: 0 0 8px 0; color: #4CAF50;">🚀 Pembaruan Tersedia! (v${updateStatus.newVersion})</h4>
        <p style="margin: 0 0 12px 0; font-size: 13px; color: #ccc;">Versi baru Mentari Mod telah dirilis dengan fitur dan perbaikan terbaru.</p>
        <a href="${updateStatus.releaseUrl}" target="_blank" style="background-color: #4CAF50; color: white; padding: 8px 16px; border-radius: 5px; text-decoration: none; font-weight: 500;">
          Update Sekarang
        </a>
      </div>
    `;
  }

  let html = ''
  html += updateHtml;

    // Add presensi button at the top
    html += `
  <div class="copy-links-container">
    <a href="https://my.unpam.ac.id/presensi/" target="_blank" id="presensi" class="presensi-button">
      <i class="fas fa-clipboard-list"></i> Lihat Presensi
    </a>
  </div>
  `

    // Extract day of week from course names and prepare for sorting
    const processedCourses = courseDataList
      .map((courseData) => {
        if (!courseData || !courseData.data) return null

        // Extract day of week from course name if it exists
        const courseName = courseData.coursename || ''
        const dayMatch = courseName.match(/\(([^)]+)\)/)
        const dayOfWeek = dayMatch ? dayMatch[1] : ''

        // Determine day order (for sorting)
        let dayOrder = 7 // Default value for courses without day
        if (dayOfWeek === 'Senin') dayOrder = 1
        else if (dayOfWeek === 'Selasa') dayOrder = 2
        else if (dayOfWeek === 'Rabu') dayOrder = 3
        else if (dayOfWeek === 'Kamis') dayOrder = 4
        else if (dayOfWeek === 'Jumat') dayOrder = 5
        else if (dayOfWeek === 'Sabtu') dayOrder = 6
        else if (dayOfWeek === 'Minggu') dayOrder = 0

        return {
          ...courseData,
          dayOfWeek,
          dayOrder,
        }
      })
      .filter((course) => course !== null)

    // Sort by day of week
    processedCourses.sort((a, b) => {
      // First sort by day order
      return a.dayOrder - b.dayOrder
    })

    // Process and filter courses
    processedCourses.forEach((courseData) => {
      if (!courseData || !courseData.data) return

      const kode_course = courseData.kode_course
      const courseName = courseData.coursename

      // Filter sections that have forum discussions with IDs
      const validSections = courseData.data.filter((section) => {
        if (!section.sub_section) return false

        // Check if any sub-section is a forum discussion with an ID
        const forumWithId = section.sub_section.find(
          (sub) => sub.kode_template === 'FORUM_DISKUSI' && sub.id
        )

        // Skip if no forum with ID exists
        if (!forumWithId) return false

        // Find POST_TEST in the section
        const postTest = section.sub_section.find(
          (sub) => sub.kode_template === 'POST_TEST'
        )

        // HIDE CRITERIA 1: Both FORUM_DISKUSI and POST_TEST are completed (true)
        if (
          forumWithId.completion === true &&
          postTest &&
          postTest.completion === true
        ) {
          return false
        }

        // HIDE CRITERIA 2: FORUM_DISKUSI with ID is completed (true) and POST_TEST exists but has no ID
        if (forumWithId.completion === true && postTest && !postTest.id) {
          return false
        }

        // HIDE CRITERIA 3: FORUM_DISKUSI has a warningAlert about unavailable forum discussions
        if (
          forumWithId.warningAlert &&
          forumWithId.warningAlert.includes('Soal forum diskusi belum tersedia')
        ) {
          return false
        }

        return true
      })

      // Skip this course if there are no valid sections with forum discussions
      if (validSections.length === 0) return

      // Create a unique ID for this course card
      const courseId = `course-${kode_course}`

      // Course URL
      const courseUrl = `https://mentari.unpam.ac.id/u-courses/${kode_course}`

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
  `

      // Process each valid section
      validSections.forEach((section, sectionIndex) => {
        if (!section.sub_section) return

        // Create a unique ID for this section
        const sectionId = `section-${kode_course}-${sectionIndex}`

        // Get the section code for direct section URL
        const kode_section = section.kode_section
        const sectionUrl = `https://mentari.unpam.ac.id/u-courses/${kode_course}?accord_pertemuan=${kode_section}`

        html += `
    <div class="section-card">
      <div class="section-header" onclick="toggleSection('${sectionId}', '${courseId}')">
        <h3>${section.nama_section}</h3>
        <span class="section-toggle" id="toggle-${sectionId}">
          <i class="fas fa-chevron-down"></i>
        </span>
      </div>
      <div class="section-content" id="${sectionId}">
        <div class="section-direct-link">
          <a href="${sectionUrl}" class="section-link-button">
            <i class="fas fa-external-link-alt"></i> Buka Pertemuan
          </a>
        </div>
    `

        // Group learning materials (buku, video, ppt, etc.)
        const learningMaterials = section.sub_section.filter((sub) =>
          [
            'BUKU_ISBN',
            'VIDEO_AJAR',
            'POWER_POINT',
            'ARTIKEL_RISET',
            'MATERI_LAINNYA',
          ].includes(sub.kode_template)
        )

        // Filter out learning materials without a valid URL
        const availableLearningMaterials = learningMaterials.filter(
          (material) => material.link
        )

        // Other items
        const otherItems = section.sub_section.filter(
          (sub) =>
            ![
              'BUKU_ISBN',
              'VIDEO_AJAR',
              'POWER_POINT',
              'ARTIKEL_RISET',
              'MATERI_LAINNYA',
            ].includes(sub.kode_template)
        )

        // Display learning materials grouped in one card ONLY if there are available materials
        if (availableLearningMaterials.length > 0) {
          html += `
    <div class="materials-card">
      <h4>Materi Pembelajaran</h4>
      <div class="materials-list">
    `

          availableLearningMaterials.forEach((material) => {
            let url = material.link
            let completionStatus = material.completion
              ? 'completed'
              : 'incomplete'

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
                : ''
            }
          </div>
        </a>
      `
          })

          html += `
        </div>
    </div>
    `
        }

        // Display other items individually
        otherItems.forEach((item) => {
          // Show all items since we're already filtering at the section level
          let url = ''
          let warningMessage = item.warningAlert || ''
          let completionStatus = item.completion ? 'completed' : 'incomplete'
          let validUrl = false
          let itemType = getItemTypeText(item.kode_template)

          // Get duration for quiz items (PRE_TEST, POST_TEST)
          let durationText = ''
          if (
            (item.kode_template === 'PRE_TEST' ||
              item.kode_template === 'POST_TEST') &&
            item.setting_quiz &&
            item.setting_quiz.duration &&
            !item.completion
          ) {
            durationText = `<span class="duration-badge">${item.setting_quiz.duration} menit</span>`
          }

          // Generate URL based on item type
          switch (item.kode_template) {
            case 'PRE_TEST':
            case 'POST_TEST':
              url = item.id
                ? `https://mentari.unpam.ac.id/u-courses/${kode_course}/exam/${item.id}`
                : ''
              validUrl = !!item.id
              break
            case 'FORUM_DISKUSI':
              url = item.id
                ? `https://mentari.unpam.ac.id/u-courses/${kode_course}/forum/${item.id}`
                : ''
              validUrl = !!item.id
              break
            case 'PENUGASAN_TERSTRUKTUR':
              url = '' // URL not specified yet
              validUrl = false
              break
            case 'KUESIONER':
              url = `https://mentari.unpam.ac.id/u-courses/${kode_course}/kuesioner/${section.kode_section}`
              validUrl = !!section.kode_section
              break
          }

          // Add data attributes for the copy function
          let dataAttrs = ''
          if (validUrl) {
            dataAttrs = `data-item-name="${item.judul}" data-item-url="${url}" data-item-type="${itemType}"`
          }

          html += `
    <div class="item-card ${completionStatus} ${
            warningMessage ? 'has-warning' : ''
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
              : ''
          }
        </div>
      </div>

      ${
        item.konten && item.kode_template === 'FORUM_DISKUSI'
          ? `
          <div class="item-content responsive-content">${item.konten}</div>
          <div class="forum-topics" id="forum-topics-${
            item.id_trx_course_sub_section || item.id
          }">
            <div class="loading-topics">Loading topics...</div>
          </div>
          ${(() => {
            // Fetch topics when rendering forum items
            const forumId = item.id_trx_course_sub_section || item.id
            if (forumId) {
              fetchForumTopics(forumId)
                .then((topics) => {
                  const topicsContainer = document.getElementById(
                    `forum-topics-${forumId}`
                  )
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
                        .join('')
                    } else {
                      topicsContainer.innerHTML =
                        '<div class="no-topics">No topics available</div>'
                    }
                  }
                })
                .catch((error) => {
                  console.error(
                    'Error loading topics for forum:',
                    forumId,
                    error
                  )
                  const topicsContainer = document.getElementById(
                    `forum-topics-${forumId}`
                  )
                  if (topicsContainer) {
                    topicsContainer.innerHTML =
                      '<div class="error-topics">Failed to load topics</div>'
                  }
                })
            }
            return ''
          })()}
          `
          : item.konten
          ? `<div class="item-content responsive-content">${item.konten}</div>`
          : ''
      }

      ${
        warningMessage
          ? `<div class="warning-message">${warningMessage}</div>`
          : ''
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
          : ''
      }

      ${
        validUrl && !warningMessage
          ? `
        <div class="item-action">
          <a href="${url}" class="action-button" ${
              item.kode_template === 'PRE_TEST' ||
              item.kode_template === 'POST_TEST'
                ? ''
                : item.completion
                ? 'disabled'
                : ''
            }>
            ${getActionText(item.kode_template)}
          </a>
        </div>
      `
          : validUrl && warningMessage
          ? `
        <div class="item-action">
          <a href="${url}" class="action-button" ${
              item.kode_template === 'PRE_TEST' ||
              item.kode_template === 'POST_TEST'
                ? ''
                : 'disabled'
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
  `
        })

        html += `
      </div>
    </div>
    `
      })

      // Close the course card
      html += `
    </div>
  </div>
  `
    })

    // Check if there's any content
    if (html === '') {
      forumList.innerHTML = `<div class="forum-no-data">Tidak ada forum diskusi yang tersedia</div>`
      return
    }

    forumList.innerHTML = html

    // Add toggle function to window scope that closes other sections
    window.toggleSection = function (sectionId, courseId) {
      const sectionContent = document.getElementById(sectionId)
      const toggleIcon = document.getElementById(`toggle-${sectionId}`)

      // Get all section contents within this course
      const allSections = document.querySelectorAll(
        `#${courseId} .section-content`
      )
      const allToggles = document.querySelectorAll(
        `#${courseId} .section-toggle`
      )

      // If this section is already active, just close it
      if (sectionContent.classList.contains('active')) {
        sectionContent.classList.remove('active')
        toggleIcon.classList.add('collapsed')
        return
      }

      // Otherwise, close all sections and open this one
      allSections.forEach((section) => {
        section.classList.remove('active')
      })

      allToggles.forEach((toggle) => {
        toggle.classList.add('collapsed')
      })

      // Open this section
      sectionContent.classList.add('active')
      toggleIcon.classList.remove('collapsed')
    }

    // Add Copy Links functionality
    const copyButton = document.getElementById('copy-all-links')
    if (copyButton) {
      copyButton.addEventListener('click', function () {
        // Collect all course and item links
        let linkText = ''

        // Get all course cards
        const courseCards = document.querySelectorAll('.course-card')

        courseCards.forEach((course) => {
          const courseName = course.getAttribute('data-course-name')
          const courseUrl = course.getAttribute('data-course-url')

          // Add course name and URL
          linkText += `${courseName} : ${courseUrl}\n`

          // Get all items with URLs
          const items = course.querySelectorAll(
            '[data-item-name][data-item-url]'
          )

          items.forEach((item) => {
            const itemName = item.getAttribute('data-item-name')
            const itemUrl = item.getAttribute('data-item-url')
            const itemType = item.getAttribute('data-item-type') || ''

            // Add item name and URL
            if (itemType) {
              linkText += `${itemType} - ${itemName} : ${itemUrl}\n`
            } else {
              linkText += `${itemName} : ${itemUrl}\n`
            }
          })

          // Add a separator between courses
          linkText += '\n'
        })

        // Copy to clipboard
        navigator.clipboard
          .writeText(linkText)
          .then(() => {
            // Show success message
            copyButton.innerHTML = '<i class="fas fa-check"></i> Copied!'
            copyButton.classList.add('copied')

            // Reset button after 2 seconds
            setTimeout(() => {
              copyButton.innerHTML =
                '<i class="fas fa-copy"></i> Copy All Links'
              copyButton.classList.remove('copied')
            }, 2000)
          })
          .catch((err) => {
            console.error('Failed to copy links: ', err)
            copyButton.innerHTML = '<i class="fas fa-times"></i> Failed!'

            // Reset button after 2 seconds
            setTimeout(() => {
              copyButton.innerHTML =
                '<i class="fas fa-copy"></i> Copy All Links'
            }, 2000)
          })
      })
    }

    // Add styles - this function needs to be defined elsewhere
    if (typeof addStyles === 'function') {
      addStyles()
    }

    // Helper functions
    function getMaterialIcon(templateType) {
      switch (templateType) {
        case 'BUKU_ISBN':
          return '<i class="fas fa-book"></i>'
        case 'VIDEO_AJAR':
          return '<i class="fas fa-video"></i>'
        case 'POWER_POINT':
          return '<i class="fas fa-file-powerpoint"></i>'
        case 'ARTIKEL_RISET':
          return '<i class="fas fa-file-alt"></i>'
        case 'MATERI_LAINNYA':
          return '<i class="fas fa-folder-open"></i>'
        default:
          return '<i class="fas fa-file"></i>'
      }
    }

    function getItemIcon(templateType) {
      switch (templateType) {
        case 'PRE_TEST':
        case 'POST_TEST':
          return '<i class="fas fa-tasks"></i>'
        case 'FORUM_DISKUSI':
          return '<i class="fas fa-comments"></i>'
        case 'PENUGASAN_TERSTRUKTUR':
          return '<i class="fas fa-clipboard-list"></i>'
        case 'KUESIONER':
          return '<i class="fas fa-poll"></i>'
        default:
          return '<i class="fas fa-file"></i>'
      }
    }

    function getActionText(templateType) {
      switch (templateType) {
        case 'PRE_TEST':
        case 'POST_TEST':
          return 'Mulai Quiz' // Always show "Mulai Quiz" for PRE_TEST and POST_TEST
        case 'FORUM_DISKUSI':
          return 'Buka Forum'
        case 'PENUGASAN_TERSTRUKTUR':
          return 'Lihat Tugas'
        case 'KUESIONER':
          return 'Isi Kuesioner'
        default:
          return 'Buka'
      }
    }

    function getItemTypeText(templateType) {
      switch (templateType) {
        case 'PRE_TEST':
          return 'Pretest'
        case 'POST_TEST':
          return 'Posttest'
        case 'FORUM_DISKUSI':
          return 'Forum Diskusi'
        case 'PENUGASAN_TERSTRUKTUR':
          return 'Penugasan Terstruktur'
        case 'KUESIONER':
          return 'Kuesioner'
        default:
          return ''
      }
    }

    function addStyles() {
      // Check if styles are already added
      if (document.getElementById('forum-ui-styles')) return

      const styleElement = document.createElement('style')
      styleElement.id = 'forum-ui-styles'
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
        background: rgba(255, 255, 255, 0.71);
        color: #252525;
        padding: 4px 8px;

        border-radius: 5px;
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
        background: rgba(56, 56, 56, 0.65);
        transform: translateY(-1px);
        color:rgb(255, 255, 255);
        text-decoration: none;
        box-shadow: 0 2px 4px rgba(255, 255, 255, 0.2);
      }
    `

      document.head.appendChild(styleElement)
    }
  }

  // Fungsi baru untuk menampilkan grup dan menambahkan event listener
  function displayGroups(groups) {
    const groupResultsDiv = document.getElementById('group-results')
    const groupResultsCard = document.getElementById('group-results-card')
    const groupTotalInfoEl = document.getElementById('group-total-info')
    if (!groupResultsDiv || !groupResultsCard) return

    const groupCount = groups.length

    // Tampilkan jumlah total kelompok di judul
    if (groupTotalInfoEl) {
      groupTotalInfoEl.textContent = `- ${groupCount} Kelompok`
    }

    // Generate HTML
    let html = ''
    groups.forEach((group, index) => {
      html += `
        <div class="group-container">
          <div class="group-header">
            <div>Kelompok ${index + 1}</div>
            <div class="group-count">${group.length} mahasiswa</div>
          </div>
          <div class="group-members">
      `
      group.forEach((student) => {
        html += `
          <div class="group-member">
            <div class="member-absen">${student.absen}</div>
            <div class="member-name">${student.nama_mahasiswa}</div>
            <div class="member-nim">${student.nim}</div>
          </div>
        `
      })
      html += `
          </div>
        </div>
      `
    })

    groupResultsDiv.innerHTML = html
    groupResultsCard.style.display = 'block'

    // Event listener untuk menyalin data semua kelompok
    document
      .getElementById('copy-all-groups-btn')
      .addEventListener('click', () => {
        let groupsData = ''
        groups.forEach((group, index) => {
          groupsData += `KELOMPOK ${index + 1} (${group.length} mahasiswa)\n`
          group.forEach((student) => {
            groupsData += `${student.absen}. ${student.nama_mahasiswa} (${student.nim})\n`
          })
          groupsData += '\n'
        })
        copyToClipboard(groupsData, 'Data kelompok berhasil disalin')
      })

    // Event listener untuk menghapus kelompok dengan konfirmasi custom modal
    document
      .getElementById('delete-groups-btn')
      .addEventListener('click', () => {
        const confirmationMessage = `Anda akan menghapus <br><b>${groupCount} kelompok</b> yang sudah dibuat. <br>Apakah Anda yakin?`

        showConfirmationDialog(confirmationMessage, () => {
          // Hapus dari local storage
          localStorage.removeItem(STORAGE_KEYS.STUDENT_GROUPS)

          // Sembunyikan card dan hapus isinya
          groupResultsCard.style.display = 'none'
          groupResultsDiv.innerHTML = ''
          if (groupTotalInfoEl) {
            groupTotalInfoEl.textContent = '' // Hapus info jumlah
          }

          showToast('Data kelompok berhasil dihapus')
        })
      })
  }

  // Update student data UI
  function updateStudentUI(courseDataList) {
    const studentTab = document.getElementById('student-data-tab')
    if (!studentTab) return

    const studentList = document.getElementById('student-list')
    if (!studentList) return

    // Extract unique students from all courses
    const allUniqueStudents = []
    const studentMap = new Map() // Use Map to track unique students by NIM

    courseDataList.forEach((course) => {
      if (course && course.peserta && course.peserta.length > 0) {
        course.peserta.forEach((student) => {
          if (!studentMap.has(student.nim)) {
            studentMap.set(student.nim, {
              ...student,
              absen: allUniqueStudents.length + 1, // Add sequential absen number
            })
            allUniqueStudents.push(studentMap.get(student.nim))
          }
        })
      }
    })

    // Check if we have students
    if (allUniqueStudents.length === 0) {
      studentList.innerHTML = `<div class="student-no-data">Tidak ada data mahasiswa</div>`
      return
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
  `

    // Group results card (hidden initially, moved above student list)
    const groupResultsCard = `
    <div class="data-card" id="group-results-card" style="display: none;">
      <div class="card-header">
        <h3 class="card-title">Hasil Pengelompokan <span id="group-total-info" class="group-total-info"></span></h3>
        <div class="card-actions">
          <button id="copy-all-groups-btn" class="secondary-btn">
            <i class="fas fa-copy"></i> Copy Data
          </button>
          <button id="delete-groups-btn" class="danger-btn">
            <i class="fas fa-trash-alt"></i> Hapus Kelompok
          </button>
        </div>
      </div>
      <div id="group-results"></div>
    </div>
  `

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
  `

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
    `
    })

    studentsHtml += `
      </div>
    </div>
  `

    studentList.innerHTML = studentsHtml

    // Cek local storage untuk data kelompok yang sudah ada
    const savedGroups = getFromLocalStorage(STORAGE_KEYS.STUDENT_GROUPS)
    if (savedGroups && savedGroups.length > 0) {
      displayGroups(savedGroups)
    }

    // Add event listener to the create groups button
    document
      .getElementById('create-groups-btn')
      .addEventListener('click', () => {
        const groupCount = parseInt(
          document.getElementById('group-count').value,
          10
        )
        const groupingMethod = document.querySelector(
          'input[name="grouping-method"]:checked'
        ).value

        if (groupCount < 1 || groupCount > allUniqueStudents.length) {
          alert(
            `Jumlah kelompok harus antara 1 dan ${allUniqueStudents.length}`
          )
          return
        }

        createGroups(allUniqueStudents, groupCount, groupingMethod)
      })

    // Add copy functionality for student data
    document
      .getElementById('copy-all-students-btn')
      .addEventListener('click', () => {
        const studentData = allUniqueStudents
          .map(
            (student) =>
              `${student.absen}. ${student.nama_mahasiswa} (${student.nim})`
          )
          .join('\n')

        copyToClipboard(studentData, 'Data mahasiswa berhasil disalin')
      })

    // Add CSS for the new elements
    if (!document.getElementById('enhanced-styles')) {
      const style = document.createElement('style')
      style.id = 'enhanced-styles'
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
        margin-bottom: 1rem;
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
        margin: 0;
        display: flex;
        align-items: center;
        gap: 8px;
      }

      .group-total-info {
        font-size: 14px;
        font-weight: 500;
        color: #888;
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

      .danger-btn {
        background-color: #e74c3c;
        color: white;
        border: none;
        padding: 8px 16px;
        border-radius: 4px;
        cursor: pointer;
        font-weight: 500;
        transition: background-color 0.2s;
        display: flex;
        align-items: center;
        gap: 6px;
      }

      .danger-btn:hover {
        background-color: #c0392b;
      }

      /* Grouping Form */
      .grouping-form {
        margin-bottom: 1rem;
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
      
      .toast i { color: #2ecc71; }

      @keyframes fadeIn {
        from { opacity: 0; transform: translateY(20px); }
        to { opacity: 1; transform: translateY(0); }
      }

      @keyframes fadeOut {
        from { opacity: 1; transform: translateY(0); }
        to { opacity: 0; transform: translateY(20px); }
      }

      /* Custom Confirmation Modal */
      #custom-confirm-modal {
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        z-index: 10005;
        display: none;
        align-items: center;
        justify-content: center;
      }
      #custom-confirm-modal.visible {
        display: flex;
      }
      .custom-confirm-overlay {
        position: absolute;
        width: 100%;
        height: 100%;
        background-color: rgba(0, 0, 0, 0.7);
        backdrop-filter: blur(5px);
        animation: fadeIn 0.2s ease-out forwards;
      }
      .custom-confirm-box {
        background-color: #2a2a2a;
        color: #f0f0f0;
        border-radius: 12px;
        box-shadow: 0 10px 30px rgba(0,0,0,0.5);
        border: 1px solid #444;
        width: 90%;
        max-width: 400px;
        z-index: 1;
        transform: scale(0.95);
        opacity: 0;
        animation: zoomIn 0.2s ease-out forwards;
      }
      #custom-confirm-modal.visible .custom-confirm-box {
        opacity: 1;
        transform: scale(1);
      }
      .custom-confirm-header {
        padding: 16px 20px;
        border-bottom: 1px solid #444;
      }
      .custom-confirm-header h3 {
        margin: 0;
        font-size: 18px;
        color: #fff;
      }
      .custom-confirm-content {
        padding: 20px;
        font-size: 15px;
        line-height: 1.6;
        color: #ccc;
      }
      .custom-confirm-content p {
        margin: 0;
      }
      .custom-confirm-actions {
        padding: 16px 20px;
        background-color: #252525;
        display: flex;
        justify-content: flex-end;
        gap: 12px;
        border-bottom-left-radius: 12px;
        border-bottom-right-radius: 12px;
      }
      .custom-confirm-btn {
        border: none;
        border-radius: 6px;
        padding: 10px 20px;
        font-size: 14px;
        font-weight: 600;
        cursor: pointer;
        transition: all 0.2s ease;
      }
      .custom-confirm-btn-cancel {
        background-color: #444;
        color: #f0f0f0;
      }
      .custom-confirm-btn-cancel:hover {
        background-color: #555;
      }
      .custom-confirm-btn-ok {
        background-color: #e74c3c;
        color: #fff;
      }
      .custom-confirm-btn-ok:hover {
        background-color: #c0392b;
      }
      @keyframes zoomIn {
        from { transform: scale(0.9); opacity: 0; }
        to { transform: scale(1); opacity: 1; }
      }

      /* Responsive adjustments */
      @media (max-width: 768px) {
        .students-container,
        #group-results {
          grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
        }

        .card-header {
          flex-direction: column;
          align-items: flex-start;
        }

        .card-actions {
          margin-top: 12px;
          width: 100%;
        }

        .card-actions button {
            flex-grow: 1;
            justify-content: center;
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
    `
      document.head.appendChild(style)
    }
  }

  // Function to create and display groups with improved distribution logic
  function createGroups(students, groupCount, method) {
    // Make a copy of the students array to avoid modifying the original
    let studentsToDivide = [...students]

    // Randomize if needed
    if (method === 'random') {
      for (let i = studentsToDivide.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1))
        ;[studentsToDivide[i], studentsToDivide[j]] = [
          studentsToDivide[j],
          studentsToDivide[i],
        ]
      }
    }

    // Calculate base size and remainder
    const totalStudents = studentsToDivide.length
    const baseSize = Math.floor(totalStudents / groupCount)
    const remainder = totalStudents % groupCount

    // Create groups with improved distribution
    const groups = []
    let currentIndex = 0

    for (let i = 0; i < groupCount; i++) {
      // Calculate group size: if i < remainder, add 1 extra student
      const groupSize = baseSize + (i < remainder ? 1 : 0)

      // Skip creating empty groups
      if (groupSize > 0) {
        const groupMembers = studentsToDivide.slice(
          currentIndex,
          currentIndex + groupSize
        )
        groups.push(groupMembers)
        currentIndex += groupSize
      }
    }

    // Simpan hasil ke local storage
    saveToLocalStorage(STORAGE_KEYS.STUDENT_GROUPS, groups)

    // Panggil fungsi untuk menampilkan grup di UI
    displayGroups(groups)
  }

  // Function to copy text to clipboard and show notification
  function copyToClipboard(text, message) {
    navigator.clipboard
      .writeText(text)
      .then(() => {
        showToast(message)
      })
      .catch((err) => {
        showToast('Gagal menyalin: ' + err)
      })
  }

  // Function to show toast notification
  function showToast(message) {
    // Remove existing toast if any
    const existingToast = document.querySelector('.toast')
    if (existingToast) {
      existingToast.remove()
    }

    // Create new toast
    const toast = document.createElement('div')
    toast.className = 'toast'
    toast.innerHTML = `
    <i class="fas fa-check-circle"></i>
    <span>${message}</span>
  `

    document.body.appendChild(toast)

    // Remove toast after 3 seconds
    setTimeout(() => {
      toast.remove()
    }, 3000)
  }

  // Save token and display user info
  function saveToken(token, source) {
    if (!token) return
    if (token.startsWith('Bearer ')) token = token.substring(7)

    const tokenInfo = decodeToken(`Bearer ${token}`)
    if (!tokenInfo) return

    if (authToken !== token) {
      authToken = token
      userInfo = tokenInfo

      console.log('Token: ' + token)
      console.log('Info Pengguna:')
      console.log(`- Nama: ${tokenInfo.fullname}`)
      console.log(`- Username: ${tokenInfo.username}`)
      console.log(`- Role: ${tokenInfo.role}`)
      console.log(`- Expired: ${tokenInfo.expires}`)

      // Simpan token dan userInfo ke localStorage
      saveToLocalStorage(STORAGE_KEYS.AUTH_TOKEN, token)
      saveToLocalStorage(STORAGE_KEYS.USER_INFO, tokenInfo)

      // Update UI
      updateTokenUI(token, tokenInfo)
      updateUserInfoUI(tokenInfo)

      // Fetch courses data after token is captured (if belum ada data)
      const cachedCourseData = getFromLocalStorage(STORAGE_KEYS.COURSE_DATA)
      if (!cachedCourseData || cachedCourseData.length === 0) {
        setTimeout(() => fetchCoursesListAndDetails(), 1000)
      }
    }
  }

  // Fetch individual course data
  async function fetchAndDisplayIndividualCourseData(courseCode) {
    if (!authToken) return null

    try {
      const apiUrl = `https://mentari.unpam.ac.id/api/user-course/${courseCode}`

      const response = await fetch(apiUrl, {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${authToken}`,
          'Content-Type': 'application/json',
        },
        cache: 'no-store',
      })

      if (!response.ok) throw new Error(`API error: ${response.status}`)

      const data = await response.json()

      console.log(`URL: /api/user-course/${courseCode}`)
      console.log(`Kode Course: ${courseCode}`)
      console.log(`Custom URL: ${createCustomUrl(courseCode)}`)
      console.log(`Response:`, data)
      console.log('---')

      return data
    } catch (error) {
      console.error(`Error fetching course ${courseCode}:`, error)
      return null
    }
  }

  // Fetch all courses
  async function fetchCoursesListAndDetails(forceRefresh = false) {
    // Cek apakah sudah ada data tersimpan dan tidak dipaksa refresh
    if (!forceRefresh) {
      const cachedCourseData = getFromLocalStorage(STORAGE_KEYS.COURSE_DATA)
      if (cachedCourseData && cachedCourseData.length > 0) {
        console.log(
          'Menggunakan data course dari cache:',
          cachedCourseData.length,
          'courses'
        )
        courseDataList = cachedCourseData
        await updateForumUI(courseDataList)
        updateStudentUI(courseDataList)
        return cachedCourseData
      }
    }

    if (isHandlingCourseApiRequest || !authToken) return

    try {
      isHandlingCourseApiRequest = true
      const apiUrl = `https://mentari.unpam.ac.id/api/user-course?page=1&limit=50`

      const response = await fetch(apiUrl, {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${authToken}`,
          'Content-Type': 'application/json',
        },
        cache: 'no-store',
      })

      if (!response.ok) throw new Error(`API error: ${response.status}`)

      const data = await response.json()

      console.log('Total courses: ' + data.data.length)

      courseDataList = []
      for (const course of data.data) {
        const courseData = await fetchAndDisplayIndividualCourseData(
          course.kode_course
        )
        if (courseData) {
          courseDataList.push(courseData)
        }
      }

      // Simpan courseDataList ke localStorage
      saveToLocalStorage(STORAGE_KEYS.COURSE_DATA, courseDataList)
      saveToLocalStorage(STORAGE_KEYS.LAST_UPDATE, new Date().toLocaleString())

      // Update forum UI after fetching all courses
      await updateForumUI(courseDataList)

      // Update student UI after fetching all courses
      updateStudentUI(courseDataList)

      return data
    } catch (error) {
      console.error(`Error fetching courses:`, error)
    } finally {
      isHandlingCourseApiRequest = false
    }
  }

  // Check storages for tokens
  async function checkStorages() {
    // Cek apakah ada token yang tersimpan di localStorage
    const savedToken = getFromLocalStorage(STORAGE_KEYS.AUTH_TOKEN)
    const savedUserInfo = getFromLocalStorage(STORAGE_KEYS.USER_INFO)

    if (savedToken && savedUserInfo) {
      authToken = savedToken
      userInfo = savedUserInfo

      // Update UI dengan data yang tersimpan
      updateTokenUI(savedToken, savedUserInfo)
      updateUserInfoUI(savedUserInfo)

      // Load course data jika tersedia
      const cachedCourseData = getFromLocalStorage(STORAGE_KEYS.COURSE_DATA)
      if (cachedCourseData && cachedCourseData.length > 0) {
        courseDataList = cachedCourseData
        await updateForumUI(courseDataList)
        updateStudentUI(courseDataList)
      }

      return true
    }

    // Jika tidak ada token tersimpan, lakukan pengecekan seperti biasa
    const possibleKeys = [
      'token',
      'auth_token',
      'authToken',
      'access_token',
      'accessToken',
      'jwt',
      'idToken',
      'id_token',
    ]

    // Check localStorage and sessionStorage for common token keys
    for (const key of possibleKeys) {
      const localValue = localStorage.getItem(key)
      if (localValue) saveToken(localValue, `localStorage.${key}`)

      const sessionValue = sessionStorage.getItem(key)
      if (sessionValue) saveToken(sessionValue, `sessionStorage.${key}`)
    }

    // Check all storage items for JWT format
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i)
      const value = localStorage.getItem(key)
      if (typeof value === 'string' && value.startsWith('eyJ')) {
        saveToken(value, `localStorage.${key}`)
      }
    }

    for (let i = 0; i < sessionStorage.length; i++) {
      const key = sessionStorage.key(i)
      const value = sessionStorage.getItem(key)
      if (typeof value === 'string' && value.startsWith('eyJ')) {
        saveToken(value, `sessionStorage.${key}`)
      }
    }

    return false
  }

  // Intercept XHR requests
  function interceptXHR() {
    const originalOpen = XMLHttpRequest.prototype.open
    const originalSetRequestHeader = XMLHttpRequest.prototype.setRequestHeader

    XMLHttpRequest.prototype.open = function () {
      this._method = arguments[0]
      this._url = arguments[1]
      this._headers = {}
      return originalOpen.apply(this, arguments)
    }

    XMLHttpRequest.prototype.setRequestHeader = function (header, value) {
      this._headers = this._headers || {}
      this._headers[header] = value

      if (header.toLowerCase() === 'authorization' && value) {
        saveToken(value, `XHR Request`)
      }

      return originalSetRequestHeader.apply(this, arguments)
    }
  }

  // Intercept Fetch API
  function interceptFetch() {
    const originalFetch = window.fetch

    window.fetch = function (resource, init = {}) {
      const url = typeof resource === 'string' ? resource : resource.url

      if (init && init.headers) {
        let authHeader = null

        if (init.headers instanceof Headers) {
          authHeader =
            init.headers.get('authorization') ||
            init.headers.get('Authorization')
        } else if (typeof init.headers === 'object') {
          authHeader = init.headers.authorization || init.headers.Authorization
        }

        if (authHeader) {
          saveToken(authHeader, `Fetch Request`)
        }
      }

      return originalFetch.apply(this, arguments)
    }
  }

  // Auto click the Dashboard button (hanya jika data belum ada)
  function clickDashboardButton() {
    // Cek apakah sudah ada data tersimpan
    const cachedCourseData = getFromLocalStorage(STORAGE_KEYS.COURSE_DATA)
    if (cachedCourseData && cachedCourseData.length > 0) {
      console.log(
        'Data course sudah tersedia, tidak perlu klik dashboard otomatis'
      )
      return
    }

    // Find and click the Dashboard button
    const dashboardButtons = Array.from(document.querySelectorAll('button'))
    const dashboardButton = dashboardButtons.find((button) => {
      const spanElement = button.querySelector('span.MuiTypography-root')
      return spanElement && spanElement.textContent === 'Dashboard'
    })

    if (dashboardButton) {
      console.log('Dashboard button ditemukan! Mengklik...')
      dashboardButton.click()
    } else {
      console.warn('Dashboard button tidak ditemukan!')
    }
  }

  // Expose functions to window
  window.toggleTokenPopup = function () {
    const popup = document.getElementById('token-runner-popup')
    if (!popup) {
      createPopupUI()
    } else {
      toggleCollapse()
    }
  }

  window.getAuthToken = function () {
    if (authToken) {
      console.log('Token: ' + authToken)
      return authToken
    } else {
      console.log('Belum ada token yang terdeteksi')
      return null
    }
  }

  window.checkCourse = function () {
    const courseCode = extractCourseCodeFromUrl(window.location.href)

    if (courseCode) {
      console.log(`Kode Course: ${courseCode}`)
      console.log(`Custom URL: ${createCustomUrl(courseCode)}`)
    } else {
      console.log('Tidak ada kode course pada URL ini')
    }
  }

  window.fetchCourse = function (courseCode) {
    if (!courseCode) {
      console.log(
        "Masukkan kode course. Contoh: fetchCourse('20242-06SIFM003-22SIF0352')"
      )
      return
    }

    if (!authToken) {
      console.log('Tidak ada token yang terdeteksi')
      return
    }

    return fetchAndDisplayIndividualCourseData(courseCode)
  }

  window.fetchCoursesList = fetchCoursesListAndDetails

  // Fungsi untuk menghapus cache data
  window.clearCacheData = function () {
    localStorage.removeItem(STORAGE_KEYS.COURSE_DATA)
    localStorage.removeItem(STORAGE_KEYS.LAST_UPDATE)
    console.log(
      'Cache data berhasil dihapus. Refresh halaman untuk mengambil data baru.'
    )
  }

  // Initialize
  async function init() {
    createPopupUI()
    createConfirmationModal()
    interceptXHR()
    interceptFetch()

    // Cek apakah ada data di localStorage
    const hasExistingData = await checkStorages()

    // Jika tidak ada data, coba klik card
    if (!hasExistingData) {
      setTimeout(() => {
        // Temukan elemen dengan kelas "card MuiBox-root"
        let card = document.querySelector('.card.MuiBox-root')

        // Jika ditemukan, klik elemen tersebut
        if (card) {
          console.log('Card ditemukan! Mengklik...')
          card.click()
        } else {
          console.warn('Card tidak ditemukan!')
        }

        // Attempt to click the Dashboard button after a short delay
        setTimeout(() => {
          clickDashboardButton()
        }, 1000)
      }, 1000)
    }
  }

  init()

  function extractTopicsFromContent(content) {
    if (!content) return []
    const tempDiv = document.createElement('div')
    tempDiv.innerHTML = content

    // Extract topics with their IDs
    const topics = []

    // Look for topic elements with IDs
    const topicElements = tempDiv.querySelectorAll('[id^="topic-"]')
    topicElements.forEach((element) => {
      const id = element.id.replace('topic-', '')
      const text = element.textContent.trim()
      if (text && text.length > 0 && text.length < 100) {
        topics.push({ id, text })
      }
    })

    // If no topic elements found, try to extract from headings/paragraphs
    if (topics.length === 0) {
      const headings = tempDiv.querySelectorAll('h1, h2, h3, h4, h5, h6, p')
      headings.forEach((element) => {
        const text = element.textContent.trim()
        if (text && text.length > 0 && text.length < 100) {
          // Generate a unique ID for the topic
          const id = crypto.randomUUID()
          topics.push({ id, text })
        }
      })
    }

    return topics.slice(0, 3)
  }

  // Add this function to fetch topics from API
  async function fetchForumTopics(forumId) {
    try {
      console.log('Fetching topics for forum:', forumId)
      const response = await fetch(
        `https://mentari.unpam.ac.id/api/forum/topic/${forumId}`,
        {
          headers: {
            Authorization: `Bearer ${authToken}`,
            'Content-Type': 'application/json',
          },
        }
      )

      if (!response.ok) {
        console.error(
          'Failed to fetch topics:',
          response.status,
          response.statusText
        )
        throw new Error('Failed to fetch topics')
      }

      const data = await response.json()
      console.log('Topics API response:', data)

      if (!data.topics) {
        console.warn('No topics data in response:', data)
        return []
      }

      // Filter topics that match the forum's id_trx_course_sub_section
      const matchingTopics = data.topics.filter(
        (topic) => topic.id_trx_course_sub_section === forumId
      )

      console.log('Matching topics:', matchingTopics)
      return matchingTopics
    } catch (error) {
      console.error('Error fetching forum topics:', error)
      return []
    }
  }
})()