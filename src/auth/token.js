console.log('Token.js sedang dijalankan!');

// Inisialisasi UI dan logic token
(function () {
  let authToken = null;
  let isHandlingCourseApiRequest = false;
  let courseDataList = [];
  let userInfo = null;
  let lecturerNotifications = getFromLocalStorage('mentari_lecturer_notifications') || [];


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
          if (!versionResponse.ok) return true;
          
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
              showForceUpdatePopup();
              return false;
          }
      } catch (error) {
          console.error('[Token.js] Gagal memeriksa kill switch ekstensi:', error);
      }
      return true;
  }
  
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

  function showConfirmationDialog(message, onConfirm) {
    const modal = document.getElementById('custom-confirm-modal')
    const messageEl = document.getElementById('custom-confirm-message')
    const confirmBtn = document.getElementById('custom-confirm-ok')

    if (!modal || !messageEl || !confirmBtn) {
      if (confirm(message.replace(/<br\s*\/?>/gi, '\n'))) {
        onConfirm()
      }
      return
    }

    messageEl.innerHTML = message
    modal.classList.add('visible')

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

  window.refreshAndTrack = function () {
    clearCacheData()
    authToken = null
    userInfo = null
    courseDataList = []
    checkStorages()
    fetchCoursesListAndDetails(true)
  }

  function showCustomAlert(message, type = 'error', duration = 5000) {
    const existingAlert = document.getElementById('custom-alert-mentari')
    if (existingAlert) {
      existingAlert.remove()
    }

    const alertElement = document.createElement('div')
    alertElement.id = 'custom-alert-mentari'
    alertElement.className = `custom-alert-mentari ${type}`

    const icons = {
      error: `<svg fill="#e74c3c" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path d="M12,2C6.48,2,2,6.48,2,12s4.48,10,10,10,10-4.48,10-10S17.52,2,12,2Zm1,15h-2v-2h2v2Zm0-4h-2V7h2v6Z"/></svg>`,
      success: `<svg fill="#2ecc71" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path d="M12,2C6.48,2,2,6.48,2,12s4.48,10,10,10,10-4.48,10-10S17.52,2,12,2Zm-2,15-5-5,1.41-1.41L10,14.17l7.59-7.59L19,8l-9,9Z"/></svg>`,
    }

    alertElement.innerHTML = `
    <div class="alert-icon">${icons[type] || ''}</div>
    <div class="alert-message">${message}</div>
    <button class="alert-close-btn">&times;</button>
  `

    document.body.appendChild(alertElement)

    const removeAlert = () => {
      alertElement.classList.add('fade-out')
      setTimeout(() => {
        if (alertElement) alertElement.remove()
      }, 300)
    }

    const timeoutId = setTimeout(removeAlert, duration)

    alertElement.querySelector('.alert-close-btn').addEventListener('click', () => {
      clearTimeout(timeoutId)
      removeAlert()
    })
  }

  function createPopupUI() {
    if (document.getElementById('token-runner-popup')) return
    const fontLink = document.createElement('link');
    fontLink.href = 'https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap';
    fontLink.rel = 'stylesheet';
    document.head.appendChild(fontLink);

    let script = document.createElement('script')
    script.src = 'https://kit.fontawesome.com/f59e2d85df.js'
    script.crossOrigin = 'anonymous'
    document.head.appendChild(script)

    const popup = document.createElement('div')
    popup.id = 'token-runner-popup'
    popup.className = 'collapsed'
    popup.innerHTML = `
    <div class="popup-toggle" id="popup-toggle">
      <img src="https://github.com/tonybaloney/vscode-pets/blob/main/media/zappy/yellow_idle_8fps.gif?raw=true" alt="Mentaru" />
      <div class="glow-point"></div>
    </div>
    <div class="token-loading-bar"></div>
    <div class="popup-content">
      <div class="popup-header">
        <span class="popup-title">MENTARI <strong>MOD</strong></span>
        <div class="token-popup-actions">
          <button id="token-reset-btn" title="Reset Cache & Track Ulang"><i class="fa-solid fa-rotate-right fa-fw"></i></button>
        </div>
      </div>
      <div class="token-tabs">
        <button class="token-tab active" data-tab="forum-data"><i class="fas fa-comments fa-fw"></i><span>Forum</span></button>
        <button class="token-tab" data-tab="student-data"><i class="fas fa-users fa-fw"></i><span>Mahasiswa</span></button>
        <button class="token-tab" data-tab="notifications"><i class="fas fa-bell fa-fw"></i><span>Notifikasi</span></button>
        <button class="token-tab" data-tab="notes-data"><i class="fas fa-book-open fa-fw"></i><span>Catatan</span></button>
        <button class="token-tab" data-tab="feedback-data"><i class="fas fa-paper-plane fa-fw"></i><span>Umpan Balik</span></button>
        <button class="token-tab" data-tab="user-info"><i class="fas fa-cog fa-fw"></i><span>Setting</span></button>
      </div>
      <div class="tab-content-wrapper">
        <div class="token-tab-content" id="user-info-tab"></div>
        <div class="token-tab-content" id="token-data-tab"></div>
        <div class="token-tab-content active" id="forum-data-tab">
          <div id="forum-list"></div>
        </div>
        <div class="token-tab-content" id="notifications-tab">
          <div class="token-info-section"><p>Balasan Dosen Terbaru</p></div>
          <div id="notifications-list"></div>
        </div>
        <div class="token-tab-content" id="student-data-tab"></div>
        <div class="token-tab-content" id="notes-data-tab">
          <div class="token-info-section centered-box">
            <i class="fas fa-feather-alt big-icon"></i>
            <p>Buat catatan pribadi untuk mata kuliah yang sedang dibuka.</p>
            <button id="add-notes-section-btn" class="token-button"><i class="fas fa-plus"></i> Tambahkan Catatan</button>
          </div>
        </div>
        <div class="token-tab-content" id="feedback-data-tab">
          <div class="feedback-container">
            <h3>Beri Masukan untuk Kami</h3>
            <p>Setiap masukan Anda sangat berarti untuk pengembangan MENTARI MOD.</p>
            <div class="feedback-actions">
                <a href="https://github.com/AnandaAnugrahHandyanto/mentari_unpam-mod/issues/new?template=bug_report.md&title=[BUG]%20Judul%20Bug" target="_blank" class="feedback-button bug">
                    <i class="fas fa-bug"></i>
                    <div><span>Laporkan Bug</span><small>Menemukan sesuatu yang tidak berfungsi?</small></div>
                </a>
                <a href="https://github.com/AnandaAnugrahHandyanto/mentari_unpam-mod/issues/new?template=feature_request.md&title=[FITUR]%20Saran%20Fitur" target="_blank" class="feedback-button feature">
                    <i class="fas fa-lightbulb"></i>
                    <div><span>Saran Fitur Baru</span><small>Punya ide cemerlang untuk kami?</small></div>
                </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  `;

    (function addSkeletonLoaderStyles() {
      const style = document.createElement('style');
      style.textContent = `
        .skeleton {
          background: linear-gradient(110deg, rgba(255, 255, 255, 0.05) 8%, rgba(255, 255, 255, 0.1) 18%, rgba(255, 255, 255, 0.05) 33%);
          background-size: 200% 100%;
          animation: 1.5s skeleton-loading-shine infinite linear;
          border-radius: 12px;
        }
        .skeleton-card { height: 80px; margin-bottom: 12px; width: 100%; }
        @keyframes skeleton-loading-shine { to { background-position-x: -200%; } }
      `;
      document.head.appendChild(style);
    })();

    function showSkeletonLoading(containerId, count = 4) {
      const container = document.getElementById(containerId);
      if (!container) return;
      container.innerHTML = Array.from({ length: count }, () => `<div class="skeleton skeleton-card"></div>`).join('');
    }

    showSkeletonLoading('forum-list');

    const commonStyles = `
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
        .tombol-baru { background-color: #ff5722; color: white; border-radius: 20px; }
        .switch { position: relative; display: inline-block; width: 50px; height: 24px; }
        .switch input { opacity: 0; width: 0; height: 0; }
        .slider { position: absolute; cursor: pointer; top: 0; left: 0; right: 0; bottom: 0; background-color: rgba(255,255,255,0.2); transition: .4s; }
        .slider:before { position: absolute; content: ""; height: 16px; width: 16px; left: 4px; bottom: 4px; background-color: white; transition: .4s; }
        input:checked + .slider { background: linear-gradient(90deg, #3498db, #9b59b6, #3498db); background-size: 300% 300%; animation: sliderGradient 3s linear infinite; }
        @keyframes sliderGradient { 0%   { background-position: 0% 50%; } 50%  { background-position: 100% 50%; } 100% { background-position: 0% 50%; } }
        input:checked + .slider:before { transform: translateX(26px); }
        .slider.round { border-radius: 24px; }
        .slider.round:before { border-radius: 50%; }
    `;

    const style = document.createElement('style');
    style.textContent = `
        #token-runner-popup {
            position: fixed;
            left: 15px !important;
            font-family: 'Inter', -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
            z-index: 9999;
            width: 480px;
            max-width: 95%;
            border-radius: 18px;
            overflow: hidden;
            cursor: move;
            background: rgba(18, 18, 18, 0.85);
            backdrop-filter: blur(24px) saturate(180%);
            -webkit-backdrop-filter: blur(24px) saturate(180%);
            border: 1px solid rgba(255, 255, 255, 0.1);
            box-shadow: 0 16px 40px rgba(0, 0, 0, 0.5);
            transition: all 0.4s cubic-bezier(0.25, 1, 0.5, 1);
        }

        #token-runner-popup.collapsed {
            width: 60px;
            height: 60px;
            border-radius: 50%;
            box-shadow: 0 8px 20px rgba(0, 0, 0, 0.4);
        }
        
        .popup-toggle {
            width: 60px;
            height: 60px;
            border-radius: 50%;
            background: #121212;
            position: absolute;
            top: 0; left: 0;
            display: flex;
            align-items: center;
            justify-content: center;
            cursor: pointer;
            z-index: 9998;
            transition: transform 0.3s ease;
        }
        .popup-toggle:hover { transform: scale(1.1) rotate(5deg); }
        .popup-toggle img { width: 35px; height: 35px; }
        .glow-point {
            width: 12px; height: 12px;
            background: #2ecc71;
            border-radius: 50%;
            position: absolute;
            top: 6px; right: 6px;
            border: 2px solid #121212;
            box-shadow: 0 0 10px #2ecc71, 0 0 20px #2ecc71;
        }

        .popup-content {
            display: flex;
            flex-direction: column;
            opacity: 0;
            pointer-events: none;
            height: 600px;
            max-height: 85vh;
            transition: opacity 0.3s ease;
        }
        #token-runner-popup:not(.collapsed) .popup-content {
            opacity: 1;
            pointer-events: all;
        }
        
        .popup-header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            padding: 19px 20px 12px 75px;
            border-bottom: 1px solid rgba(255, 255, 255, 0.08);
            flex-shrink: 0;
        }
        .popup-title {
            font-size: 16px;
            font-weight: 600;
            color: #f0f0f0;
        }
        .popup-title strong {
            font-weight: 700;
            background: linear-gradient(90deg, #3498db, #9b59b6, #3498db);
            background-size: 300% 300%;
            background-clip: text;
            -webkit-background-clip: text;
            color: transparent;
            -webkit-text-fill-color: transparent;
            animation: popupGradient 4s linear infinite;
        }
        @keyframes popupGradient {
            0%   { background-position: 0% 50%; }
            50%  { background-position: 100% 50%; }
            100% { background-position: 0% 50%; }
        }

        #token-reset-btn {
            background: rgba(255, 255, 255, 0.1);
            border: 1px solid rgba(255, 255, 255, 0.1);
            cursor: pointer;
            color: #3bff05ff;
            width: 32px;
            height: 32px;
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 14px;
            transition: all 0.2s ease;
        }
        #token-reset-btn:hover {
            background: rgba(255, 255, 255, 0.15);
            color: #fff;
            transform: rotate(180deg);
        }
        
        .token-loading-bar {
            position: absolute;
            top: 0; left: 0;
            height: 2px;
            width: 0%;
            background: rgba(0, 255, 55, 1);
            z-index: 10003;
            display: none;
        }
        .token-loading-bar.active { display: block; animation: loading-progress 1.5s ease-in-out infinite; }
        @keyframes loading-progress { 0%{left:0;width:0} 50%{left:25%;width:75%} 100%{left:100%;width:0} }

        .token-tabs {
            display: flex;
            padding: 8px 16px;
            gap: 8px;
            overflow-x: auto;
            scrollbar-width: none;
            border-bottom: 1px solid rgba(255, 255, 255, 0.08);
            flex-shrink: 0;
        }
        .token-tabs::-webkit-scrollbar { display: none; }
        .token-tab {
            display: flex;
            align-items: center;
            gap: 8px;
            padding: 8px 14px;
            background: transparent;
            border: none;
            border-radius: 8px;
            color: #888;
            cursor: pointer;
            font-size: 13px;
            font-weight: 500;
            white-space: nowrap;
            transition: all 0.2s ease;
        }
        .token-tab:hover { background: rgba(255, 255, 255, 0.05); color: #ccc; }
        .token-tab.active {
            background: rgba(255, 255, 255, 0.1);
            color: #fff;
        }
        .token-tab.active i {
          background: linear-gradient(90deg, #3498db, #9b59b6, #3498db);
          background-size: 300% 300%;
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          animation: iconGradient 3s linear infinite;
        }

        @keyframes iconGradient {
          0%   { background-position: 0% 50%; }
          50%  { background-position: 100% 50%; }
          100% { background-position: 0% 50%; }
        }

        .tab-content-wrapper {
            flex: 1;
            overflow: hidden;
            position: relative;
        }
        .token-tab-content {
            position: absolute;
            top:0; left:0; right:0; bottom:0;
            padding: 16px;
            overflow-y: auto;
            visibility: hidden;
            opacity: 0;
            transform: translateY(10px);
            transition: opacity 0.3s ease, transform 0.3s ease, visibility 0.3s;
        }
        .token-tab-content.active {
            visibility: visible;
            opacity: 1;
            transform: translateY(0);
        }
        .token-tab-content::-webkit-scrollbar { width: 6px; }
        .token-tab-content::-webkit-scrollbar-track { background: transparent; }
        .token-tab-content::-webkit-scrollbar-thumb { background-color: rgba(255, 255, 255, 0.15); border-radius: 6px; }

        .token-info-section {
            margin-bottom: 15px;
            font-size: 13px;
            color: #aaa;
        }
        .centered-box {
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            text-align: center;
            height: 100%;
            color: #888;
        }
        .big-icon { font-size: 48px; margin-bottom: 16px; color: rgba(255, 255, 255, 0.1); }
        .token-button {
          background: linear-gradient(90deg, #3498db, #8e44ad, #3498db);
          background-size: 300% 300%;
          color: #fff;
          border: none;
          padding: 12px 24px;
          border-radius: 8px;
          cursor: pointer;
          font-weight: 600;
          font-size: 14px;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          transition: all 0.3s ease;
          box-shadow: 0 4px 15px rgba(0,0,0,0.2);
          animation: gradientMove 6s ease infinite;
        }

      .token-button:hover {
        animation-duration: 3s;
        transform: translateY(-2px);
        box-shadow: 0 6px 20px rgba(0,0,0,0.3);
        }

      .token-button:active {
        animation-play-state: paused;
        transform: translateY(1px);
        box-shadow: 0 3px 10px rgba(0,0,0,0.25);
      }

      @keyframes gradientMove {
        0%   { background-position: 0% 50%; }
        50%  { background-position: 100% 50%; }
        100% { background-position: 0% 50%; }
      }

        #forum-list, #notifications-list {
            display: flex;
            flex-direction: column;
            gap: 12px;
        }
        .course-card, .notification-item, .student-item-card {
            background: rgba(255, 255, 255, 0.04);
            border: 1px solid rgba(255, 255, 255, 0.08);
            border-radius: 12px;
            padding: 16px;
            transition: all 0.25s ease;
            position: relative;
        }
        .course-card:hover, .notification-item.clickable:hover {
            transform: translateY(-3px);
            background: rgba(255, 255, 255, 0.07);
            border-color: rgba(255, 255, 255, 0.15);
            box-shadow: 0 8px 25px rgba(0, 0, 0, 0.2);
        }
        .course-header h2 { font-size: 15px; font-weight: 600; color: #eee; margin:0 0 4px 0; }
        .course-code { font-size: 12px; color: #888; font-family: monospace; }
        .section-card { margin-top: 16px; background: rgba(0,0,0,0.2); border-radius: 10px; overflow:hidden; }
        .section-header { padding: 12px; cursor: pointer; display: flex; justify-content: space-between; align-items: center; }
        .section-header h3 { font-size: 13px; font-weight: 500; margin: 0; color: #ccc; }
        .section-toggle { transition: transform 0.3s; }
        .section-toggle.collapsed { transform: rotate(-90deg); }
        .section-content { padding: 0 12px 12px; display: none; }
        .section-content.active { display: block; animation: fadeIn 0.5s; }
        
        .item-card {
            background: rgba(0, 0, 0, 0.3);
            border: 1px solid rgba(255, 255, 255, 0.1);
            border-radius: 8px; padding: 12px; margin-top: 8px;
        }
        .item-icon {
            background: linear-gradient(145deg, #3498db, #8e44ad);
            width: 36px; height: 36px; border-radius: 50%; display: flex;
            align-items: center; justify-content: center; margin-right: 12px;
            color: white; flex-shrink: 0;
        }

        .feedback-container { padding: 15px; text-align: center; }
        .feedback-container h3 { font-size: 18px; color: #fff; }
        .feedback-container p { font-size: 13px; color: #aaa; max-width: 350px; margin: 10px auto 20px auto; }
        .feedback-actions { display: flex; flex-direction: column; gap: 12px; }
        .feedback-button {
            position: relative;
            background: rgba(255, 255, 255, 0.05);
            border: 1px solid rgba(255, 255, 255, 0.1);
            border-radius: 10px;
            padding: 15px;
            text-decoration: none;
            color: #f0f0f0;
            display: flex;
            align-items: center;
            gap: 15px;
            transition: color 0.3s ease;
            overflow: hidden;
            z-index: 1;
        }
        .feedback-button::before {
            content: "";
            position: absolute;
            inset: 0;
            border-radius: 10px;
            padding: 2px;
            background: linear-gradient(90deg, #3498db, #9b59b6, #3498db);
            background-size: 300% 300%;
            animation: none;
            -webkit-mask: linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0);
            -webkit-mask-composite: xor;
            mask-composite: exclude;
            z-index: -1;
        }
        .feedback-button:hover::before {
            animation: borderGradient 3s linear infinite;
        }
        @keyframes borderGradient {
            0%   { background-position: 0% 50%; }
            50%  { background-position: 100% 50%; }
            100% { background-position: 0% 50%; }
        }
        .feedback-button i { font-size: 24px; width: 30px; text-align: center; }
        .feedback-button.bug i { color: #e74c3c; }
        .feedback-button.feature i { color: #f1c40f; }
        .feedback-button div { display: flex; flex-direction: column; text-align: left; }
        .feedback-button span { font-weight: 600; }
        .feedback-button small { font-size: 12px; color: #888; }
        
        .settings-grid {
            display: flex;
            flex-direction: column;
            gap: 16px;
        }
        .setting-card {
            background: rgba(255, 255, 255, 0.04);
            border: 1px solid rgba(255, 255, 255, 0.08);
            border-radius: 12px;
            overflow: hidden;
        }
        .animated-card {
            opacity: 0;
            transform: translateY(20px);
            animation: fadeInUp 0.5s ease-out forwards;
        }
        @keyframes fadeInUp {
            to {
                opacity: 1;
                transform: translateY(0);
            }
        }
        .user-card {
            text-align: center;
            padding: 0;
        }
        .user-card-header {
            background: linear-gradient(135deg, #3a3a3a 0%, #1e1e1e 100%);
            height: 80px;
            display: flex;
            justify-content: center;
            align-items: flex-end;
            position: relative;
        }
        .user-card-header .user-initial, .user-card-header img {
            width: 80px;
            height: 80px;
            border-radius: 50%;
            border: 4px solid #1a1a1a;
            background: linear-gradient(145deg, #3498db, #8e44ad);
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 36px;
            font-weight: 600;
            color: white;
            transform: translateY(50%);
        }
        .user-card-header img { object-fit: cover; }
        .user-card-body {
            padding: 50px 20px 20px 20px;
        }
        .user-name { margin: 0; font-size: 18px; color: #f0f0f0; }
        .user-nim { margin: 4px 0 8px 0; font-size: 14px; color: #888; }
        .user-role-badge { background: rgba(255, 255, 255, 0.1); background-clip: padding-box; color: transparent; background-image: linear-gradient(90deg, #3498db, #9b59b6); -webkit-background-clip: text; -webkit-text-fill-color: transparent; padding: 4px 10px; border-radius: 12px; font-size: 12px; font-weight: 600; text-transform: capitalize; }
        .card-header-title {
            display: flex;
            align-items: center;
            gap: 12px;
            padding: 14px;
            background: rgba(255, 255, 255, 0.02);
            border-bottom: 1px solid rgba(255, 255, 255, 0.08);
        }
        .card-header-title h3 {
            margin: 0;
            font-size: 15px;
            font-weight: 600;
            color: #eee;
        }
        .card-icon {
            background: linear-gradient(90deg, #3498db, #9b59b6, #3498db);
            background-size: 300% 300%;
            -webkit-background-clip: text;
            -webkit-text-fill-color: transparent;
            animation: textGradient 3s linear infinite;
        }
        @keyframes textGradient {
            0%   { background-position: 0% 50%; }
            50%  { background-position: 100% 50%; }
            100% { background-position: 0% 50%; }
        }
        .card-body {
            padding: 16px;
            display: flex;
            flex-direction: column;
            gap: 16px;
        }
        .input-field {
            display: flex;
            flex-direction: column;
            gap: 6px;
        }
        .input-field label {
            font-size: 13px;
            font-weight: 500;
            color: #aaa;
            display: flex;
            align-items: center;
            gap: 6px;
        }
        .settings-input {
            background: rgba(0,0,0,0.3);
            border: 1px solid rgba(255, 255, 255, 0.1);
            border-radius: 8px;
            color: #fff; font-size: 14px;
            padding: 10px 14px;
            transition: all 0.2s ease;
        }
        .settings-input:focus {
            border-color: #3498db;
            background: rgba(0,0,0,0.4);
            box-shadow: 0 0 0 3px rgba(52, 152, 219, 0.3);
        }
        .save-button {
            width: 100%;
            margin-top: 8px;
        }
        .toggle-item {
            display: flex;
            justify-content: space-between;
            align-items: center;
            padding-bottom: 12px;
            border-bottom: 1px solid rgba(255, 255, 255, 0.05);
        }
        .toggle-item:last-child {
            border-bottom: none;
            padding-bottom: 0;
        }
        .toggle-info {
            display: flex;
            align-items: center;
            gap: 12px;
        }
        .toggle-icon {
            font-size: 16px;
            color: #888;
            width: 20px;
            text-align: center;
        }
        .toggle-info h4 {
            margin: 0;
            font-size: 14px;
            font-weight: 500;
            color: #eee;
        }
        .toggle-info p {
            margin: 2px 0 0 0;
            font-size: 12px;
            color: #888;
        }
        .credits-section .developer {
            display: flex;
            justify-content: space-between;
            align-items: center;
        }
        .dev-info h4 { margin: 0; font-size: 14px; color: #eee; }
        .dev-info span { font-size: 12px; color: #888; }
        .dev-links a {
            color: #aaa;
            text-decoration: none;
            margin-left: 12px;
            transition: color 0.2s ease;
        }
        .dev-links a:hover { color: #3498db; }
        .love-footer {
            text-align: center;
            font-size: 13px;
            color: #888;
            padding-top: 12px;
            margin-top: 12px;
            border-top: 1px solid rgba(255, 255, 255, 0.05);
        }
        .love-footer .fa-heart {
            color: #e74c3c;
            animation: pulse 1.5s infinite ease-in-out;
        }
        @keyframes pulse {
            0%, 100% { transform: scale(1); }
            50% { transform: scale(1.2); }
        }
        #student-dashboard-container {
            display: flex;
            flex-direction: column;
            gap: 16px;
        }
        .stats-header {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(120px, 1fr));
            gap: 12px;
        }
        .stat-card {
            background: rgba(255, 255, 255, 0.04);
            border: 1px solid rgba(255, 255, 255, 0.08);
            border-radius: 12px;
            padding: 12px;
            display: flex;
            flex-direction: column;
            align-items: center;
            gap: 4px;
            animation: fadeInUp 0.5s ease-out forwards;
        }
        .stat-icon {
          font-size: 20px;
          margin-bottom: 4px;
          background: linear-gradient(90deg, #3498db, #9b59b6, #3498db);
          background-size: 300% 300%;
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          animation: statGradient 3s linear infinite;
        }

        @keyframes statGradient {
          0%   { background-position: 0% 50%; }
          50%  { background-position: 100% 50%; }
          100% { background-position: 0% 50%; }
        }

        .stat-value { font-size: 24px; font-weight: 700; color: #fff; }
        .stat-label { font-size: 11px; color: #888; text-transform: uppercase; }
        .control-card, .results-card, .student-list-card {
            background: rgba(255, 255, 255, 0.04);
            border: 1px solid rgba(255, 255, 255, 0.08);
            border-radius: 12px;
        }
        .input-group { display: flex; gap: 8px; margin-bottom: 12px; }
        .group-input { flex-grow: 1; }
        .grouping-options { display: flex; gap: 16px; align-items: center; }
        .radio-container { display: flex; align-items: center; cursor: pointer; color: #ccc; font-size: 13px; }
        .radio-label { margin-left: 6px; }
        .results-hidden, .actions-hidden { display: none !important; opacity: 0; transform: translateY(10px); transition: all 0.3s ease; }
        #group-results-container, #floating-actions { transition: all 0.3s ease; }
        .groups-grid {
            display: grid;
            grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
            gap: 12px;
        }
        .group-card {
            background: rgba(0,0,0,0.2);
            border-radius: 8px;
            overflow: hidden;
            border: 1px solid rgba(255, 255, 255, 0.1);
        }
        .group-card-header { color: white; padding: 8px 12px; display: flex; justify-content: space-between; align-items: center; }
        .group-card-header h4 { margin: 0; font-size: 14px; }
        .group-card-header span { font-size: 12px; opacity: 0.8; }
        .group-card-body { padding: 4px; max-height: 200px; overflow-y: auto; }
        .group-card-body::-webkit-scrollbar { width: 4px; }
        .group-card-body::-webkit-scrollbar-thumb { background-color: rgba(255, 255, 255, 0.2); border-radius: 4px; }
        .group-member { display: flex; align-items: center; gap: 8px; padding: 6px 8px; border-radius: 4px; }
        .member-name { font-size: 13px; color: #ddd; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
        .student-absen-small { display: flex; align-items: center; justify-content: center; width: 20px; height: 20px; font-size: 10px; font-weight: 600; border-radius: 50%; background: rgba(255, 255, 255, 0.1); color: #ccc; flex-shrink: 0; }
        .students-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
            gap: 8px;
        }
        .student-card {
            background: rgba(0,0,0,0.2);
            border-radius: 6px;
            padding: 10px;
            display: flex;
            align-items: center;
            gap: 10px;
            border: 1px solid rgba(255, 255, 255, 0.1);
        }
        .student-absen {
            display: flex; align-items: center; justify-content: center;
            width: 28px; height: 28px; border-radius: 50%;
            background: linear-gradient(145deg, #3498db, #8e44ad);
            color: white; font-size: 12px; font-weight: 700; flex-shrink: 0;
        }
        .student-details { flex-grow: 1; }
        .student-name { margin: 0; font-size: 13px; font-weight: 500; color: #eee; }
        .student-nim { margin: 2px 0 0 0; font-size: 11px; color: #888; font-family: monospace; }
        #floating-actions {
            position: absolute;
            bottom: 20px;
            right: 20px;
            display: flex;
            flex-direction: column;
            gap: 12px;
            z-index: 10;
        }
        .fab-button {
            width: 50px; height: 50px;
            border-radius: 50%;
            border: none;
            background: linear-gradient(145deg, #3498db, #8e44ad);
            color: white;
            font-size: 18px;
            cursor: pointer;
            display: flex;
            align-items: center;
            justify-content: center;
            box-shadow: 0 4px 12px rgba(0,0,0,0.3);
            transition: all 0.2s ease;
        }
        .fab-button:hover {
            transform: scale(1.1) rotate(5deg);
            box-shadow: 0 6px 16px rgba(0,0,0,0.4);
        }
        .fab-button.danger {
            background: #e74c3c;
        }
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

        .forum-no-data {
            text-align: center; padding: 40px; color: #888; font-style: italic;
        }
        @keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
        ${commonStyles}
    `;

    document.head.appendChild(style);
    document.body.appendChild(popup);

    (function enableTabGradients() {
      const tabs = document.querySelector('.token-tabs');
      if (!tabs) return;
      
      function updateGradient() {
        const maxScrollLeft = tabs.scrollWidth - tabs.clientWidth;
        tabs.classList.toggle('show-left', tabs.scrollLeft > 5);
        tabs.classList.toggle('show-right', tabs.scrollLeft < maxScrollLeft - 5);
      }
      
      updateGradient();
      tabs.addEventListener('scroll', updateGradient);
      window.addEventListener('resize', updateGradient);
    })();

    (function enableDragScroll() {
      const tabs = document.querySelector('.token-tabs');
      if (!tabs) return;
      
      let isDown = false;
      let startX;
      let scrollLeft;

      tabs.addEventListener('mousedown', (e) => {
        isDown = true;
        startX = e.pageX - tabs.offsetLeft;
        scrollLeft = tabs.scrollLeft;
        tabs.style.cursor = 'grabbing';
      });
      tabs.addEventListener('mouseleave', () => { isDown = false; tabs.style.cursor = 'grab'; });
      tabs.addEventListener('mouseup', () => { isDown = false; tabs.style.cursor = 'grab'; });
      tabs.addEventListener('mousemove', (e) => {
        if (!isDown) return;
        e.preventDefault();
        const x = e.pageX - tabs.offsetLeft;
        const walk = (x - startX) * 1.5;
        tabs.scrollLeft = scrollLeft - walk;
      });
    })();

    document.getElementById('add-notes-section-btn').addEventListener('click', injectNotesUI);
    
    function refreshAndTrackWithLoading() {
      const loadingBar = document.querySelector('.token-loading-bar');
      loadingBar.classList.add('active');

      if (typeof window.refreshAndTrack === 'function') {
        const result = window.refreshAndTrack();
        if (result && typeof result.then === 'function') {
          result.finally(() => {
            setTimeout(() => loadingBar.classList.remove('active'), 500);
          });
        } else {
          setTimeout(() => loadingBar.classList.remove('active'), 1500);
        }
      } else {
        setTimeout(() => loadingBar.classList.remove('active'), 1500);
      }
    }

    let isDragging = false, offsetX = 0, offsetY = 0;
    const header = popup.querySelector('.popup-header');

    function startDrag(clientX, clientY) {
      if (popup.classList.contains('collapsed')) return;
      isDragging = true;
      offsetX = clientX - popup.getBoundingClientRect().left;
      offsetY = clientY - popup.getBoundingClientRect().top;
      popup.style.transition = 'none';
    }

    function onDrag(clientX, clientY) {
      if (!isDragging) return;
      const x = clientX - offsetX;
      const y = clientY - offsetY;
      popup.style.left = `${Math.max(0, Math.min(x, window.innerWidth - popup.offsetWidth))}px`;
      popup.style.top = `${Math.max(0, Math.min(y, window.innerHeight - popup.offsetHeight))}px`;
    }

    function stopDrag() {
      if (!isDragging) return;
      isDragging = false;
      popup.style.transition = '';
    }

    header.addEventListener('mousedown', (e) => { if (!e.target.closest('button, a')) startDrag(e.clientX, e.clientY); });
    document.addEventListener('mousemove', (e) => onDrag(e.clientX, e.clientY));
    document.addEventListener('mouseup', stopDrag);
    
    header.addEventListener('touchstart', (e) => { if (!e.target.closest('button, a')) startDrag(e.touches[0].clientX, e.touches[0].clientY); }, { passive: true });
    document.addEventListener('touchmove', (e) => { if (isDragging) onDrag(e.touches[0].clientX, e.touches[0].clientY); }, { passive: true });
    document.addEventListener('touchend', stopDrag);
    
    const toggle = popup.querySelector('.popup-toggle');
      toggle.addEventListener('click', (e) => {
        e.stopPropagation();
        
        const isOpeningMod = popup.classList.contains('collapsed');
        const geminiToggle = document.getElementById('geminiChatbotToggle');
        
        if (isOpeningMod) {
          if (geminiToggle) {
            geminiToggle.style.display = 'none';
          }
          const geminiPopup = document.getElementById('geminiChatbot');
          if (geminiPopup && !geminiPopup.classList.contains('hidden')) {
            geminiPopup.classList.add('hidden');
        }
        } else {
          if (geminiToggle) {
            geminiToggle.style.display = 'flex';
        }
    }

    popup.classList.toggle('collapsed');
  });

    document.getElementById('token-reset-btn').addEventListener('click', refreshAndTrackWithLoading);

    document.querySelectorAll('.token-tab').forEach((tab) => {
      tab.addEventListener('click', () => {
        document.querySelectorAll('.token-tab').forEach((t) => t.classList.remove('active'));
        document.querySelectorAll('.token-tab-content').forEach((c) => c.classList.remove('active'));

        tab.classList.add('active');
        const tabId = tab.dataset.tab + '-tab';
        document.getElementById(tabId).classList.add('active');
      });
    });

    addPositionToggleToPopup();
  applyDefaultPosition();
  }

  function addPositionToggleToPopup() {
    const popup = document.getElementById('token-runner-popup');
    if (!popup) return;

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

  function createCustomUrl(courseCode) {
    return courseCode
      ? `https://mentari.unpam.ac.id/u-courses/${courseCode}`
      : null;
  }

  function updateTokenUI(token, tokenInfo) {
    const tokenTab = document.getElementById('token-data-tab');
    if (!tokenTab) return;

    let tokenDisplay = token;
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

  function updateUserInfoUI(tokenInfo) {
    const userInfoTab = document.getElementById('user-info-tab');
    if (!userInfoTab || !tokenInfo) return;

    const userInitial = tokenInfo.fullname.charAt(0).toUpperCase();
    const userImage = tokenInfo.foto_profil ? `<img src="${tokenInfo.foto_profil}" alt="Profile Picture">` : `<div class="user-initial">${userInitial}</div>`;

    userInfoTab.innerHTML = `
      <div class="settings-grid">
        <div class="setting-card user-card animated-card">
          <div class="user-card-header">
            ${userImage}
          </div>
          <div class="user-card-body">
            <h3 class="user-name">${tokenInfo.fullname}</h3>
            <p class="user-nim">${tokenInfo.username}</p>
            <span class="user-role-badge">${tokenInfo.role}</span>
          </div>
        </div>
        <div class="setting-card animated-card" style="animation-delay: 0.1s;">
          <div class="card-header-title">
            <i class="fas fa-key card-icon"></i>
            <h3>Kunci & Integrasi</h3>
          </div>
          <div class="card-body">
            <div class="input-field">
              <label for="activation-key-input">
                <i class="fas fa-shield-alt"></i> Kunci Aktivasi
              </label>
              <input type="password" id="activation-key-input" class="settings-input" placeholder="Masukkan Kunci Aktivasi Anda">
            </div>
            <div class="input-field">
              <label for="gemini-api-key-input">
                <i class="fab fa-google"></i> Kunci API Gemini
              </label>
              <input type="password" id="gemini-api-key-input" class="settings-input" placeholder="Opsional: Masukkan Kunci API Gemini">
            </div>
            <button id="save-keys-btn" class="token-button save-button"><i class="fas fa-save"></i> Simpan Kunci</button>
          </div>
        </div>
        <div class="setting-card animated-card" style="animation-delay: 0.2s;">
          <div class="card-header-title">
            <i class="fas fa-toggle-on card-icon"></i>
            <h3>Pengaturan Fitur</h3>
          </div>
          <div class="card-body">
            <div class="toggle-item">
              <div class="toggle-info">
                <i class="fas fa-tasks toggle-icon"></i>
                <div>
                  <h4>Auto Selesai Kuis</h4>
                  <p>Otomatis menyelesaikan kuis.</p>
                </div>
              </div>
              <label class="switch">
                <input type="checkbox" id="auto-finish-quiz-toggle" ${localStorage.getItem('auto_finish_quiz') === 'true' ? 'checked' : ''}>
                <span class="slider round"></span>
              </label>
            </div>
            <div class="toggle-item">
              <div class="toggle-info">
                <i class="fas fa-poll-h toggle-icon"></i>
                <div>
                  <h4>Auto Isi Kuesioner</h4>
                  <p>Otomatis mengisi kuesioner.</p>
                </div>
              </div>
              <label class="switch">
                <input type="checkbox" id="auto-fill-questionnaire-toggle" ${localStorage.getItem('auto_fill_questionnaire') === 'true' ? 'checked' : ''}>
                <span class="slider round"></span>
              </label>
            </div>
            <div class="toggle-item">
              <div class="toggle-info">
                <i class="fas fa-robot toggle-icon"></i>
                <div>
                  <h4>Asisten AI Gemini</h4>
                  <p>Aktifkan chatbot AI di halaman.</p>
                </div>
              </div>
              <label class="switch">
                <input type="checkbox" id="gemini-toggle" ${localStorage.getItem('gemini_enabled') === 'true' ? 'checked' : ''}>
                <span class="slider round"></span>
              </label>
            </div>
          </div>
        </div>
        <div class="setting-card animated-card" style="animation-delay: 0.3s;">
          <div class="card-header-title">
            <i class="fas fa-code card-icon"></i>
            <h3>Kredit & Pengembang</h3>
          </div>
          <div class="card-body credits-section">
              <div class="developer">
                  <div class="dev-info">
                      <h4>Lukman Muludin</h4>
                      <span>Lead Dev</span>
                  </div>
                  <div class="dev-links">
                      <a href="https://instagram.com/_.chopin" target="_blank" title="Instagram"><i class="fab fa-instagram"></i></a>
                      <a href="https://facebook.com/lukman.mauludin.754" target="_blank" title="Facebook"><i class="fab fa-facebook"></i></a>
                      <a href="https://github.com/Lukman754" target="_blank" title="GitHub"><i class="fab fa-github"></i></a>
                  </div>
              </div>
              <div class="developer">
                  <div class="dev-info">
                      <h4>Ananda Anugrah H</h4>
                      <span>Backend & Logic Dev</span>
                  </div>
                  <div class="dev-links">
                      <a href="https://instagram.com/nando_fiingerstyle" target="_blank" title="Instagram"><i class="fab fa-instagram"></i></a>
                      <a href="https://t.me/Vynix77" target="_blank" title="Telegram"><i class="fab fa-telegram"></i></a>
                      <a href="https://github.com/AnandaAnugrahHandyanto" target="_blank" title="GitHub"><i class="fab fa-github"></i></a>
                  </div>
              </div>
              <div class="love-footer">
                  Dibuat dengan <i class="fas fa-heart"></i> untuk mahasiswa UNPAM
              </div>
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

    activationKeyInput.value = localStorage.getItem(STORAGE_KEYS.ACTIVATION_KEY) || '';
    const storedApiKey = localStorage.getItem('geminiApiKey');
    geminiApiKeyInput.value = storedApiKey ? atob(storedApiKey) : '';

    saveKeysBtn.addEventListener('click', async () => {
      saveKeysBtn.disabled = true;
      saveKeysBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Memvalidasi...';

      const activationKey = activationKeyInput.value.trim();
      const geminiApiKey = geminiApiKeyInput.value.trim();

      if (activationKey) {
          const isValid = await validateActivationKeyOnServer(activationKey);
          if (isValid) {
              localStorage.setItem(STORAGE_KEYS.ACTIVATION_KEY, activationKey);
              showCustomAlert('Kunci Aktivasi berhasil divalidasi dan disimpan!', 'success');
          } else {
              showCustomAlert('Kunci Aktivasi tidak valid. Silakan periksa kembali.', 'error');
              saveKeysBtn.disabled = false;
              saveKeysBtn.innerHTML = '<i class="fas fa-save"></i> Simpan Kunci';
              return;
          }
      }

      if (geminiApiKey) {
        localStorage.setItem('geminiApiKey', btoa(geminiApiKey));
      }
      
      showCustomAlert('Pengaturan berhasil disimpan!', 'success');
      saveKeysBtn.disabled = false;
      saveKeysBtn.innerHTML = '<i class="fas fa-save"></i> Simpan Kunci';
    });

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

  function updateNotificationsUI() {
    const notificationsTab = document.getElementById("notifications-tab");
    if (!notificationsTab) return;

    const notificationsList = document.getElementById("notifications-list");
    if (!notificationsList) return;

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
    recentNotifications.forEach((notification) => {
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

      const courseCode = notification.kode_course || "unknown-course";
      const forumId =
        notification.forumId ||
        notification.id_trx_course_sub_section ||
        "unknown-forum";
      const topicId =
        notification.topicId || notification.id || "unknown-topic";
      const topicUrl = `https://mentari.unpam.ac.id/u-courses/${courseCode}/forum/${forumId}/topics/${topicId}`;
      
      const notificationId = `notification-${notification.id}`;
      
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
    });

    notificationsList.innerHTML = html;

    document
      .querySelectorAll(".notification-item.clickable")
      .forEach((item) => {
        item.addEventListener("click", function (e) {
          if (e.target.closest("a.notification-link")) {
            e.preventDefault();
            const href = e.target
              .closest("a.notification-link")
              .getAttribute("href");

            const notificationId = item.id.replace("notification-", "");
            sessionStorage.setItem("scrollToNotificationId", notificationId);

            window.location.href = href;
          }
        });
      });

    function scrollToElement() {
      const notificationId = sessionStorage.getItem("scrollToNotificationId");
      if (!notificationId) return;
      sessionStorage.removeItem("scrollToNotificationId");
      const element = document.getElementById(`notification-${notificationId}`);

      if (element) {
        setTimeout(() => {
          element.scrollIntoView({
            behavior: "smooth",
            block: "center",
          });
          element.style.transition = "background-color 1s ease";
          element.style.backgroundColor = "rgba(255, 221, 0, 0.3)";
          setTimeout(() => {
            element.style.backgroundColor = "";
          }, 2000);
        }, 100);
      }
    }

    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", scrollToElement);
    } else {
      setTimeout(scrollToElement, 0);
    }
  }

  function processAndSortCourses(courseList) {
    const dayOrderMap = { 'Minggu': 0, 'Senin': 1, 'Selasa': 2, 'Rabu': 3, 'Kamis': 4, 'Jumat': 5, 'Sabtu': 6 };
    return courseList
      .map(course => {
        if (!course || !course.data) return null;
        const courseName = course.coursename || '';
        const dayMatch = courseName.match(/\(([^)]+)\)/);
        const dayOfWeek = dayMatch ? dayMatch[1] : '';
        return { ...course, dayOfWeek, dayOrder: dayOrderMap[dayOfWeek] ?? 7 };
      })
      .filter(Boolean)
      .sort((a, b) => a.dayOrder - b.dayOrder);
  }

  async function updateForumUI(courseDataList) {
    const processedCourses = processAndSortCourses(courseDataList);
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
                    const currentCourseCode = extractCourseCodeFromUrl(window.location.href) || 'default-course';
                    container.innerHTML = topics.map(topic =>
                        `<a href="https://mentari.unpam.ac.id/u-courses/${topic.kode_course || currentCourseCode}/forum/${forumId}/topics/${topic.id}" class="topic-badge"><i class="fas fa-comments"></i> ${topic.judul}</a>`
                    ).join('');
                } else {
                    container.innerHTML = '<div class="no-topics">No topics available</div>';
                }
            }).catch(() => {
                container.innerHTML = '<div class="error-topics">Failed to load topics</div>';
            });
        }
    });

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
                .course-card { background: #1e1e1e; border-radius: 8px; box-shadow: 0 2px 8px rgba(0, 0, 0, 0.2); margin-bottom: 8px; overflow: hidden; width: 100%; max-width: 500px; margin-left: auto; margin-right: auto; border: 1px solid #333; box-sizing: border-box; }
                .course-header { padding: 8px; background: #252525; border-left: 4px solid #0070f3; margin-bottom: 0; width: 100%; box-sizing: border-box; }
                .course-header-link { display: block; text-decoration: none; cursor: pointer; color: inherit; transition: all 0.2s; }
                .course-header-link:hover { background: #303030; }
                .course-header h2 { margin: 0; font-size: 14px; color: #eee; }
                .course-code { color: #aaa; font-size: 10px; margin: 0; }
                .course-content { padding: 0 8px 8px; }
                .section-card { background: #252525; border-radius: 8px; box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1); overflow: hidden; width: 100%; margin-top: 8px; border: 1px solid #333; box-sizing: border-box; transition: opacity 0.5s ease-out; }
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
                #forum-list { max-width: 500px; margin: 0 auto; box-sizing: border-box; width: 100%; margin-bottom: 125px; }
                .copy-links-container { text-align: center; display: flex; gap: 0.5em; }
                .presensi-button {
                  background: linear-gradient(90deg, rgb(0,160,32), rgb(0,200,100), rgb(0,160,32));
                  background-size: 300% 300%;
                  color: #fff;
                  border: none;
                  width: 100%;
                  border-radius: 4px;
                  padding: 8px 16px;
                  cursor: pointer;
                  display: inline-flex;
                  align-items: center;
                  justify-content: center;
                  gap: 8px;
                  font-size: 14px;
                  text-decoration: none;
                  transition: all 0.3s ease;
                  animation: presensiGradient 6s ease infinite;
                }

                  .presensi-button:hover {
                    animation-duration: 3s;
                    transform: translateY(-2px);
                    box-shadow: 0 6px 16px rgba(0, 160, 32, 0.4);
                }

                  .presensi-button:active {
                  animation-play-state: paused;
                  transform: translateY(1px);
                  box-shadow: 0 3px 8px rgba(0, 160, 32, 0.4);
                }

                  @keyframes presensiGradient {
                  0%   { background-position: 0% 50%; }
                  50%  { background-position: 100% 50%; }
                  100% { background-position: 0% 50%; }
                }

                .forum-topics { display: flex; flex-wrap: wrap; gap: 6px; margin-top: 8px; padding-top: 8px; border-top: 1px solid rgba(255, 255, 255, 0.1); }
                .loading-topics, .no-topics, .error-topics { color: #666; font-size: 12px; font-style: italic; }
                .error-topics { color: #f43f5e; }
                .topic-badge { background:rgb(0, 51, 0); color:rgb(163, 255, 163); padding: 10px; border-radius: 4px; font-size: 13px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; width: 100%; transition: all 0.2s ease; text-decoration: none; display: inline-block; cursor: pointer; margin: 10px 0; border: 1px solid rgb(0, 85, 4); }
                .topic-badge:hover { background: rgba(80, 129, 0, 0.48); transform: translateY(-1px); color:rgb(157, 255, 0); text-decoration: none; box-shadow: 0 2px 4px rgba(255, 255, 255, 0.2); }
                .notification-item.clickable:hover { background: rgba(0, 112, 243, 0.1); border-color: rgba(0, 112, 243, 0.3); transform: translateY(-1px); box-shadow: 0 4px 12px rgba(0, 112, 243, 0.2); }
                .notification-header { display: flex; align-items: center; margin-bottom: 8px; }
                .notification-icon { background: rgba(0, 112, 243, 0.1); color: #0070f3; width: 32px; height: 32px; border-radius: 50%; display: flex; align-items: center; justify-content: center; margin-right: 10px; font-size: 14px; flex-shrink: 0; }
                .notification-meta { flex: 1; }
                .notification-lecturer { font-weight: 600; color: #fff; font-size: 14px; margin-bottom: 2px; }
                .notification-time { font-size: 11px; color: rgba(255, 255, 255, 0.6); }
                .notification-title { font-weight: 500; color: #eee; font-size: 13px; margin-bottom: 4px; line-height: 1.4; }
                .notification-text { font-size: 12px; color: rgba(255, 255, 255, 0.8); line-height: 1.4; }
                .no-notifications { text-align: left; padding: 20px; background: rgba(255, 255, 255, 0.02); border: 1px solid rgba(255, 255, 255, 0.03); border-radius: 8px; }
                .no-notifications p { margin: 0; color: rgba(255, 255, 255, 0.7); font-size: 14px; }
                .no-notifications small { color: rgba(255, 255, 255, 0.5); font-size: 12px; }
            `;
            document.head.appendChild(styleElement);
        }
    }
    
    addStyles();

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

  function showToast(message) {
    const existingToast = document.querySelector('.toast');
    if (existingToast) existingToast.remove();

    const toast = document.createElement('div');
    toast.className = 'toast';
    toast.innerHTML = `<style>
        .toast { position: fixed; bottom: 20px; right: 20px; background:#1e1e1e; color:rgb(0, 221, 15); padding: 12px 20px; border-radius: 4px; box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3); border: 1px solid #333; display: flex; align-items: center; gap: 8px; z-index: 100099; animation: fadeIn 0.3s, fadeOut 0.3s 2.7s; animation-fill-mode: forwards; }
        .toast i { color: #2ecc71; }
        @keyframes fadeIn { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes fadeOut { from { opacity: 1; transform: translateY(0); } to { opacity: 0; transform: translateY(20px); } }
    </style>
    <i class="fas fa-check-circle"></i><span>${message}</span>`;
    document.body.appendChild(toast);

    setTimeout(() => toast.remove(), 3000);
  }

  function copyToClipboard(text, message) {
    navigator.clipboard.writeText(text)
      .then(() => showToast(message))
      .catch((err) => showToast('Gagal menyalin: ' + err));
  }

  function displayGroups(groups) {
    const groupResultsContainer = document.getElementById('group-results-container');
    const floatingActions = document.getElementById('floating-actions');
    if (!groupResultsContainer || !floatingActions) return;

    const groupCount = groups.length;
    const totalStudents = groups.reduce((acc, group) => acc + group.length, 0);
    const avgMembers = totalStudents > 0 ? (totalStudents / groupCount).toFixed(1) : 0;

    document.getElementById('total-groups-stat').textContent = groupCount;
    document.getElementById('avg-members-stat').textContent = avgMembers;

    const groupColors = ['#3498db', '#9b59b6', '#e74c3c', '#2ecc71', '#f1c40f', '#1abc9c'];
    let html = `
      <div class="results-card animated-card">
        <div class="card-header-title">
          <i class="fas fa-layer-group card-icon"></i>
          <h3>Hasil Pengelompokan</h3>
        </div>
        <div class="card-body">
          <div class="groups-grid">
            ${groups.map((group, index) => `
              <div class="group-card">
                <div class="group-card-header" style="background-color: ${groupColors[index % groupColors.length]};">
                  <h4>Kelompok ${index + 1}</h4>
                  <span>${group.length} Anggota</span>
                </div>
                <div class="group-card-body">
                  ${group.map(student => `
                    <div class="group-member">
                      <span class="student-absen-small">${student.absen}</span>
                      <p class="member-name">${student.nama_mahasiswa}</p>
                    </div>
                  `).join('')}
                </div>
              </div>
            `).join('')}
          </div>
        </div>
      </div>
    `;

    groupResultsContainer.innerHTML = html;
    groupResultsContainer.classList.remove('results-hidden');
    floatingActions.classList.remove('actions-hidden');

    document.getElementById('copy-all-groups-btn').addEventListener('click', () => {
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

    document.getElementById('delete-groups-btn').addEventListener('click', () => {
        const confirmationMessage = `Anda akan menghapus <b>${groupCount} kelompok</b>. <br>Tindakan ini tidak dapat diurungkan.`;
        showConfirmationDialog(confirmationMessage, () => {
          localStorage.removeItem(STORAGE_KEYS.STUDENT_GROUPS);
          groupResultsContainer.classList.add('results-hidden');
          floatingActions.classList.add('actions-hidden');
          document.getElementById('total-groups-stat').textContent = '0';
          document.getElementById('avg-members-stat').textContent = '0';
          setTimeout(() => { groupResultsContainer.innerHTML = ''; }, 300);
          showToast('Data kelompok berhasil dihapus');
        });
      });
  }

  function updateStudentUI(courseDataList) {
    const studentTab = document.getElementById('student-data-tab');
    if (!studentTab) return;

    const allUniqueStudents = [];
    const studentMap = new Map();

    courseDataList.forEach((course) => {
      if (course && course.peserta && course.peserta.length > 0) {
        course.peserta.forEach((student) => {
          if (!studentMap.has(student.nim)) {
            studentMap.set(student.nim, {
              ...student,
              absen: allUniqueStudents.length + 1,
            });
            allUniqueStudents.push(studentMap.get(student.nim));
          }
        });
      }
    });

    if (allUniqueStudents.length === 0) {
      studentTab.innerHTML = `<div class="student-no-data">Tidak ada data mahasiswa yang ditemukan.</div>`;
      return;
    }

    studentTab.innerHTML = `
      <div id="student-dashboard-container">
        <div class="stats-header">
          <div class="stat-card">
            <i class="fas fa-users stat-icon"></i>
            <div class="stat-value" id="total-students-stat">${allUniqueStudents.length}</div>
            <div class="stat-label">Total Mahasiswa</div>
          </div>
          <div class="stat-card">
            <i class="fas fa-layer-group stat-icon"></i>
            <div class="stat-value" id="total-groups-stat">0</div>
            <div class="stat-label">Jumlah Kelompok</div>
          </div>
          <div class="stat-card">
            <i class="fas fa-user-friends stat-icon"></i>
            <div class="stat-value" id="avg-members-stat">0</div>
            <div class="stat-label">Anggota/Kelompok</div>
          </div>
        </div>

        <div class="control-card animated-card">
          <div class="card-header-title">
            <i class="fas fa-cogs card-icon"></i>
            <h3>Buat Kelompok</h3>
          </div>
          <div class="card-body">
            <div class="input-group">
              <input type="number" id="group-count" min="1" max="${allUniqueStudents.length}" value="1" class="group-input" placeholder="Jumlah Kelompok">
              <button id="create-groups-btn" class="token-button"><i class="fas fa-play"></i> Buat</button>
            </div>
            <div class="grouping-options">
              <label class="radio-container">
                <input type="radio" name="grouping-method" value="sequential" checked> <span class="radio-label">Berurutan</span>
              </label>
              <label class="radio-container">
                <input type="radio" name="grouping-method" value="random"> <span class="radio-label">Acak</span>
              </label>
            </div>
          </div>
        </div>
        
        <div id="group-results-container" class="results-hidden"></div>

        <div class="student-list-card animated-card">
           <div class="card-header-title">
            <i class="fas fa-list-ul card-icon"></i>
            <h3>Daftar Semua Mahasiswa</h3>
          </div>
          <div class="card-body">
            <div class="students-grid">
              ${allUniqueStudents.map(student => `
                <div class="student-card">
                  <span class="student-absen">${student.absen}</span>
                  <div class="student-details">
                    <p class="student-name">${student.nama_mahasiswa}</p>
                    <p class="student-nim">${student.nim}</p>
                  </div>
                </div>
              `).join('')}
            </div>
          </div>
        </div>
        
        <div id="floating-actions" class="actions-hidden">
          <button id="copy-all-groups-btn" class="fab-button" title="Salin Semua Data Kelompok">
            <i class="fas fa-copy"></i>
          </button>
          <button id="delete-groups-btn" class="fab-button danger" title="Hapus Kelompok">
            <i class="fas fa-trash-alt"></i>
          </button>
        </div>
      </div>
    `;

    const savedGroups = getFromLocalStorage(STORAGE_KEYS.STUDENT_GROUPS);
    if (savedGroups && savedGroups.length > 0) {
      displayGroups(savedGroups);
    }

    document.getElementById('create-groups-btn').addEventListener('click', () => {
        const groupCount = parseInt(document.getElementById('group-count').value, 10);
        const groupingMethod = document.querySelector('input[name="grouping-method"]:checked').value;

        if (isNaN(groupCount) || groupCount < 1 || groupCount > allUniqueStudents.length) {
            showCustomAlert(`Jumlah kelompok harus antara 1 dan ${allUniqueStudents.length}`, 'error');
            return;
        }
        createGroups(allUniqueStudents, groupCount, groupingMethod);
    });
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

  function saveToken(token) {
    if (!token) return;
    if (token.startsWith('Bearer ')) token = token.substring(7);

    const tokenInfo = decodeToken(`Bearer ${token}`);
    if (!tokenInfo || authToken === token) return;

    authToken = token;
    userInfo = tokenInfo;

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
      return data;
    } catch (error) {
      console.error(`Gagal mengambil data course ${courseCode}:`, error);
      return null;
    }
  }

  async function fetchCoursesListAndDetails(forceRefresh = false) {
    const cachedData = getFromLocalStorage(STORAGE_KEYS.COURSE_DATA);
    if (!forceRefresh && cachedData?.length > 0) {
      courseDataList = cachedData;
      await updateForumUI(courseDataList);
      updateStudentUI(courseDataList);
      await fetchAllForumReplies(courseDataList);
      saveToLocalStorage('mentari_lecturer_notifications', lecturerNotifications);
      updateNotificationsUI();
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
      
      courseDataList = await Promise.all(
        data.data.map(course => fetchAndDisplayIndividualCourseData(course.kode_course))
      );
      courseDataList = courseDataList.filter(Boolean);

      await fetchAllForumReplies(courseDataList);
      saveToLocalStorage('mentari_lecturer_notifications', lecturerNotifications);
      
      saveToLocalStorage(STORAGE_KEYS.COURSE_DATA, courseDataList);
      saveToLocalStorage(STORAGE_KEYS.LAST_UPDATE, new Date().toLocaleString());

      await updateForumUI(courseDataList);
      updateStudentUI(courseDataList);
      updateNotificationsUI();
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
        await fetchAllForumReplies(courseDataList);
        saveToLocalStorage('mentari_lecturer_notifications', lecturerNotifications);
        await updateForumUI(courseDataList);
        updateStudentUI(courseDataList);
        updateNotificationsUI();
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
      dashboardButton.click();
    }
  }

  window.toggleTokenPopup = function () {
    const popup = document.getElementById('token-runner-popup');
    if (!popup) createPopupUI();
    else toggleCollapse();
  };
  window.getAuthToken = () => authToken || 'Belum ada token terdeteksi';
  window.checkCourse = () => {
    const courseCode = extractCourseCodeFromUrl(window.location.href);
  };
  window.fetchCourse = (courseCode) => {
    if (!courseCode) return console.log("Masukkan kode course.");
    if (!authToken) return console.log("Tidak ada token terdeteksi.");
    return fetchAndDisplayIndividualCourseData(courseCode);
  };
  window.fetchCoursesList = () => fetchCoursesListAndDetails(true);
  window.fetchForumReplies = fetchForumReplies;
  
  window.clearCacheData = function () {
    localStorage.removeItem(STORAGE_KEYS.AUTH_TOKEN);
    localStorage.removeItem(STORAGE_KEYS.USER_INFO);
    localStorage.removeItem(STORAGE_KEYS.COURSE_DATA);
    localStorage.removeItem(STORAGE_KEYS.LAST_UPDATE);
    localStorage.removeItem(STORAGE_KEYS.STUDENT_GROUPS);
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
        throw new Error("Failed to fetch replies");
      }

      const data = await response.json();
      const currentUserNIM = userInfo?.username;
      let allReplies = [];
      let mainTopic = null;

      if (Array.isArray(data)) {
        allReplies = data;
      } else if (data.data && Array.isArray(data.data)) {
        allReplies = data.data;
        if (data.id && data.post_type === "TOPIC") {
          mainTopic = data;
        }
      }

      if (allReplies.length > 0 && currentUserNIM) {
        const mainTopicId = mainTopic?.id || topicId;
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
            forumId: mainTopic?.id_trx_course_sub_section || topicId,
            content: reply.konten
              ? reply.konten.substring(0, 150) +
                (reply.konten.length > 150 ? "..." : "")
              : "Tidak ada konten",
          };

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
          }
        });
        if (lecturerNotifications.length > 50) {
          lecturerNotifications = lecturerNotifications.slice(0, 50);
        }
      }
    } catch (error) {
      console.error("Error in fetchForumReplies:", error);
    }
  }

  async function fetchAllForumReplies(courses) {
      const topicPromises = [];
      
      courses.forEach(course => {
          if (!course || !course.data) return;
          course.data.forEach(section => {
              if (!section.sub_section) return;
              section.sub_section.forEach(sub => {
                  if (sub.kode_template === 'FORUM_DISKUSI' && sub.id) {
                      const topicPromise = fetchForumTopics(sub.id).then(topics => {
                          if (topics && topics.length > 0) {
                              const replyPromises = topics.map(topic => fetchForumReplies(topic.id));
                              return Promise.all(replyPromises);
                          }
                          return Promise.resolve();
                      });
                      topicPromises.push(topicPromise);
                  }
              });
          });
      });

        try {
          await Promise.all(topicPromises);
      } catch (error) {
          console.error("Terjadi error saat mengambil balasan forum secara massal:", error);
      }
  }
})();