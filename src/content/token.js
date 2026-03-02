(function () {
  const APP_VERSION = "2.0";
  console.log("Mentari Mod Token script loaded.");

  const Config = {
    STORAGE_KEYS: {
      AUTH_TOKEN: "mentari_auth_token",
      USER_INFO: "mentari_user_info",
      COURSE_DATA: "mentari_course_data",
      LAST_UPDATE: "mentari_last_update",
      GEMINI_ENABLED: "gemini_enabled",
      AUTO_FINISH_QUIZ: "mentari_auto_finish_quiz",
      GEMINI_MODEL: "gemini_model",
      GEMINI_QUOTA: "gemini_quota",
      GEMINI_API_KEY: "geminiApiKey"
    },
    API: {
      BASE_URL: "https://mentari.unpam.ac.id/api",
      GITHUB_API: "https://api.github.com/repos/lukman754/Mentari-Unpam/releases/latest"
    },
    STYLES: `
       #token-runner-popup { 
         position: fixed; z-index: 99999; top: 70px; right: 20px; width: 500px; height: 600px; 
         background: #121212; color: #eee; backdrop-filter: blur(25px); 
         border: 1px solid rgba(255,255,255,0.1); border-radius: 12px; 
         box-shadow: 0 15px 50px rgba(0,0,0,0.4); overflow: hidden; 
         transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1); visibility: hidden; opacity: 0; 
         transform: translateY(-15px) scale(0.95); pointer-events: none; 
         font-family: 'Roboto', 'Helvetica', 'Arial', sans-serif;
       }
      #token-runner-popup.active { visibility: visible; opacity: 1; transform: translateY(0) scale(1); pointer-events: auto; }
      
      /* Light Theme Adaptation */
      #token-runner-popup.light-theme {
        background: #ffffff; 
        color: #1a1c1e;
        border: 1px solid rgba(0,0,0,0.12);
        box-shadow: 0 8px 32px rgba(0,0,0,0.08);
      }
      #token-runner-popup.light-theme .popup-header {
        background: #f8f9fa;
        border-bottom-color: rgba(0,0,0,0.08);
      }
      #token-runner-popup.light-theme .popup-title {
        color: #0d47a1;
      }
      #token-runner-popup.light-theme .token-tab {
        color: rgba(0,0,0,0.4);
      }
      #token-runner-popup.light-theme .token-tab.active {
        color: #1976d2;
        border-bottom-color: #1976d2;
        background: rgba(25, 118, 210, 0.04);
      }
      #token-runner-popup.light-theme .data-card, 
      #token-runner-popup.light-theme .course-card {
        background: #ffffff;
        border-color: rgba(0,0,0,0.08);
      }
      #token-runner-popup.light-theme .course-card-header {
        background: #f2f2f2;
        border-bottom-color: rgba(0,0,0,0.05);
      }
      #token-runner-popup.light-theme .course-card-header h2 {
        color: #0d47a1;
      }
      #token-runner-popup.light-theme .section-header {
        background: #;
        border-bottom: 1px solid rgba(0,0,0,0.03);
      }
      #token-runner-popup.light-theme .section-header:hover {
        background: #f8f9fa;
      }
      #token-runner-popup.light-theme .section-header h3 {
        color: #1e293b;
      }
      #token-runner-popup.light-theme .section-content {
        background: #ffffff;
        border-bottom: 1px solid rgba(0,0,0,0.05);
      }
      #token-runner-popup.light-theme .item-row {
        background: #f1f1f1;
        border-color: rgba(0,0,0,0.06);
      }
      #token-runner-popup.light-theme .item-row:hover {
        background: #f8fafc!important;
      }
      #token-runner-popup.light-theme .item-row:hover .item-title {
        color: #ff7b00;
      }
      #token-runner-popup.light-theme .item-title {
        color: #334155;
      }
      #token-runner-popup.light-theme .item-meta {
        color: #64748b;
      }
      #token-runner-popup.light-theme .card-title {
         color: #1e293b;
      }
      #token-runner-popup.light-theme .student-item {
        background: #ffffff;
      }
      #token-runner-popup.light-theme .student-item div {
        color: #334155;
      }
      #token-runner-popup.light-theme .settings-label {
        color: #1e293b;
      }
      #token-runner-popup.light-theme .settings-desc {
        color: #64748b;
      }
      #token-runner-popup.light-theme .settings-area {
        background: #ffffff;
        border-color: rgba(0,0,0,0.05);
      }
      #token-runner-popup.light-theme .settings-card-inner {
        background: rgba(25, 118, 210, 0.04);
        border-color: rgba(25, 118, 210, 0.08);
      }
      #token-runner-popup.light-theme select,
      #token-runner-popup.light-theme input[type="text"] {
        background: #ffffff;
        color: #1a1c1e;
        border-color: rgba(0,0,0,0.12);
      }
      #token-runner-popup.light-theme .token-button.btn-outline {
        background: #ffffff;
        color: #475569;
        border-color: rgba(0,0,0,0.06);
      }
      #token-runner-popup.light-theme .token-button.btn-outline:hover {
        background: #e2e8f0;
      }
      #token-runner-popup.light-theme .settings-footer {
        color: #94a3b8;
      }
      #token-runner-popup.light-theme .topic-badge {
        background: #f1f5f9;
        border-color: rgba(0,0,0,0.08);
        color: #1976d2!important;
      }
      #token-runner-popup.light-theme .topic-badge:hover {
        background: #e2e8f0;
        border-color: #1976d2;
      }
      #token-runner-popup.light-theme .forum-html-preview {
        color: #1a1c1e;
      }
      #token-runner-popup.light-theme .forum-toggle-btn {
        background: #f1f5f9;
        color: #f0872d;
      }
      #token-runner-popup.light-theme .icon-forum {
        background: rgba(13, 71, 161, 0.1);
        color: #0d47a1;
      }
      #token-runner-popup.light-theme .icon-quiz {
        background: rgba(46, 125, 50, 0.1);
        color: #2e7d32;
      }
      #token-runner-popup.light-theme .icon-material {
        background: rgba(230, 81, 0, 0.1);
        color: #e65100;
      }
      #token-runner-popup.light-theme .section-toggle {
        color: #1a1c1e;
        opacity: 0.5;
      }
      #token-runner-popup.light-theme .section-toggle.active {
        color: #f0872d;
        opacity: 1;
      }

      #token-runner-popup *::-webkit-scrollbar { width: 4px; }
      #token-runner-popup *::-webkit-scrollbar-thumb { background: rgba(144, 202, 249, 0.3); border-radius: 10px; }
      
      @media (max-width: 600px) { #token-runner-popup { width: 100%!important; left: 0!important; right: 0!important; border-radius: 0!important; height: 100vh!important; top: 50px!important; transform: translateX(100%)!important; } #token-runner-popup.active { transform: translateX(0)!important; } }
      .popup-content { display: flex; flex-direction: column; height: 100%; max-height: 90vh; }
      .popup-header { padding: 16px; background: rgba(255,255,255,0.02); border-bottom: 1px solid rgba(255,255,255,0.06); flex-shrink: 0; }
      .header-top { display: flex; justify-content: space-between; align-items: center; margin-bottom: 12px; }
      .popup-title { font-weight: 700; font-size: 16px; color: #f0872d; line-height: 1.2; }
      .popup-subtitle { font-size: 8px; color: rgba(197, 197, 197, 0.5); font-weight: 500; letter-spacing: 0.5px; margin-top: -2px; display: block; }
      .token-tabs { display: flex; justify-content: space-around; border-bottom: 1px solid rgba(255,255,255,0.04); padding: 0; flex-shrink: 0; }
      .token-tab { flex: 1; padding: 14px 0; font-size: 14px; color: rgba(255,255,255,0.4); border-bottom: 2px solid transparent; background: none; border: none; cursor: pointer; transition: all 0.2s; display: flex; align-items: center; justify-content: center; }
      .token-tab.active { color: #3d99e3; border-bottom-color: #3d99e3; background: rgba(144, 202, 249, 0.05); }
      .token-tab .ms { font-size: 20px; }
      .token-tab-content { display: none; padding: 16px; flex: 1; overflow-y: auto; overflow-x: hidden; box-sizing: border-box; }
      .token-tab-content.active { display: block; }
      .token-loading-bar { position: absolute; top: 0; left: 0; height: 2px; width: 0; background: #3d99e3; transition: width 0.3s; z-index: 10; }
      .token-loading-bar.active { width: 100%; }
      .toast { position:fixed;bottom:100px;left:50%;transform:translateX(-50%);background:#1a1a1a;color:#fff;padding:8px 16px;border-radius:50px;box-shadow:0 5px 15px rgba(0,0,0,0.4);z-index:10000;font-family:system-ui;border:1px solid #444;font-size:11px;animation:toastIn 0.3s; }
      @keyframes toastIn { from { transform: translate(-50%, 20px); opacity: 0; } to { transform: translate(-50%, 0); opacity: 1; } }
      .token-button { background: #3d99e3; color: white; border: none; padding: 10px 16px; border-radius: 8px; cursor: pointer; font-size: 12px; display: flex; align-items: center; justify-content: center; gap: 8px; transition: all 0.2s; font-weight: 600; text-decoration: none; border: 1px solid rgba(255,255,255,0.1); }
      .token-button:hover { background: #1976d2; transform: translateY(-1px); box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1); }
      .switch { position: relative; display: inline-block; width: 44px; height: 22px; }
      .switch input { opacity: 0; width: 0; height: 0; }
      .slider { position: absolute; cursor: pointer; top: 0; left: 0; right: 0; bottom: 0; background-color: #333; transition: .4s; border-radius: 22px; }
      .slider:before { position: absolute; content: ""; height: 16px; width: 16px; left: 3px; bottom: 3px; background-color: white; transition: .4s; border-radius: 50%; }
      input:checked + .slider { background-color: #f0872d; }
      input:checked + .slider:before { transform: translateX(22px); }
      .data-card { background: rgba(255,255,255,0.03); border-radius: 12px; padding: 16px; margin-bottom: 12px; border: 1px solid rgba(255,255,255,0.05); }
      .card-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 12px; }
      .card-title { font-size: 14px; font-weight: 700; color: #eee; margin: 0; opacity: 0.9; }
      .student-item { display: flex; align-items: center; gap: 12px; padding: 10px; background: rgba(255,255,255,0.02); border-radius: 10px; margin-bottom: 8px; transition: background 0.2s; }
      .student-item:hover { background: rgba(255,255,255,0.04); }
      .student-absen { width: 24px; height: 24px; background: #f0872d; color: white; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 10px; font-weight: 800; flex-shrink: 0; }

      /* Detailed Forum Styles */
      .course-card { margin-bottom: 15px; border: 1px solid rgba(255,255,255,0.08); border-radius: 10px; overflow: hidden; background: rgba(255,255,255,0.01); }
      .course-card-header { padding: 12px 16px; background: rgba(255,255,255,0.04); border-bottom: 1px solid rgba(255,255,255,0.05); }
      .course-card-header h2 { margin: 0; font-size: 14px; color: #3d99e3; font-weight: 700; }
      .course-card-code { font-size: 10px; opacity: 0.5; margin-top: 4px; display: block; }
      .section-card { border-bottom: 1px solid rgba(255,255,255,0.03); }
      .section-header { padding: 10px 16px; cursor: pointer; display: flex; justify-content: space-between; align-items: center; background: rgba(255,255,255,0.02); transition: background 0.2s; }
      .section-header:hover { background: rgba(255,255,255,0.04); }
      .section-header h3 { margin: 0; font-size: 13px; font-weight: 600; color: rgba(255,255,255,0.9); pointer-events: none; }
      .section-toggle { font-size: 10px; transition: transform 0.2s; opacity: 0.5; pointer-events: none; }
      .section-toggle.active { transform: rotate(180deg); opacity: 1; color: #f0872d; }
      .section-content { display: none; padding: 12px; background: rgba(0,0,0,0.2); }
      .section-content.active { display: block; }
      .section-actions { padding: 0 4px 10px; display: flex; justify-content: center; }
      .item-icon { width: 30px; height: 30px; border-radius: 6px; display: flex; align-items: center; justify-content: center; flex-shrink: 0; font-size: 13px; }
      .icon-forum { background: rgba(61, 153, 227, 0.1); color: #3d99e3; }
      .icon-quiz { background: rgba(121, 187, 124, 0.1); color: #79bb7c; }
      .icon-material { background: rgba(240, 135, 45, 0.1); color: #f0872d; }
      .item-info { flex: 1; overflow: hidden; }
      .item-title { font-size: 12px; font-weight: 600; display: block; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; transition: all 0.2s; color: #eee; }
      .item-meta { font-size: 10px; opacity: 0.5; margin-top: 2px; display: flex; align-items: center; gap: 6px; }
      .item-status { font-size: 10px; font-weight: 700; text-transform: uppercase; }
      .status-done { color: #79bb7c; }
      .status-todo { color: #f0872d; }
      .topic-badge { display: flex; align-items: center; gap: 6px; padding: 5px 8px; background: rgba(255,255,255,0.04); border-radius: 5px; font-size: 10px; margin-top: 5px; border: 1px solid rgba(255,255,255,0.06); color: #3d99e3!important; text-decoration: none!important; transition: all 0.2s; width: 100%; box-sizing: border-box; overflow: hidden; }
      .topic-badge:hover { background: rgba(144, 202, 249, 0.1); border-color: rgba(144,202,249,0.2); }
      .item-row { display: flex; align-items: center; gap: 10px; padding: 10px; border-radius: 8px; margin-bottom: 6px; background: rgba(255,255,255,0.03); border: 1px solid rgba(255,255,255,0.05); text-decoration: none; color: inherit; transition: all 0.2s; cursor: pointer; }
      .item-row:hover { background: rgba(255,255,255,0.06)!important; transform: translateX(5px); }
      .item-row:hover .item-title { color: #f0872d; }
      .ms { font-family: 'Material Symbols Rounded'; font-size: 14px; font-style: normal; font-weight: normal; line-height: 1; display: inline-flex; align-items: center; vertical-align: middle; user-select: none; letter-spacing: normal; text-transform: none; white-space: nowrap; }
      /* Forum Content Reset */
      .forum-html-preview { all: revert; font-family: inherit; color: inherit; font-size: 11px; line-height: 1.5; }
      .forum-html-preview p { margin-bottom: 8px; }
      .forum-html-preview ul, .forum-html-preview ol { padding-left: 20px; margin-bottom: 8px; }
      .forum-html-preview li { margin-bottom: 4px; }

      /* Empty State */
      .empty-state { display: flex; flex-direction: column; align-items: center; justify-content: center; padding: 60px 20px; text-align: center; }
      .empty-icon { font-size: 48px; margin-bottom: 16px; color: #3d99e3; background: rgba(144, 202, 249, 0.05); width: 80px; height: 80px; display: flex; align-items: center; justify-content: center; border-radius: 50%; border: 1px solid rgba(144, 202, 249, 0.1); }
      .empty-title { font-size: 16px; font-weight: 700; color: #eee; margin-bottom: 6px; }
      .empty-desc { font-size: 11px; color: rgba(255,255,255,0.4); line-height: 1.6; max-width: 240px; }
      
      #token-runner-popup.light-theme .empty-title { color: #1e293b; }
      #token-runner-popup.light-theme .empty-desc { color: #64748b; }
      #token-runner-popup.light-theme .empty-icon { background: rgba(25, 118, 210, 0.04); border-color: rgba(25, 118, 210, 0.08); }
    `
  };

  const State = {
    authToken: null,
    userInfo: null,
    courseDataList: [],
    lecturerNotifications: [],
    isFetching: false,
    currentTab: 'forum-tab'
  };

  const Utils = {
    save(key, data) { try { localStorage.setItem(key, JSON.stringify(data)); } catch (e) {} },
    get(key) { try { const d = localStorage.getItem(key); return d ? JSON.parse(d) : null; } catch (e) { return null; } },
    decodeToken(token) {
      try {
        if (!token) return null;
        const parts = token.split('.');
        if (parts.length < 2) return null;
        const payload = JSON.parse(atob(parts[1].replace(/-/g, "+").replace(/_/g, "/")));
        return {
          token, payload,
          userId: payload.id || payload.username,
          username: payload.username || payload.name,
          fullname: payload.fullname || payload.name,
          role: payload.role || "Student"
        };
      } catch (e) { return null; }
    },
    copy(text, msg) { navigator.clipboard.writeText(text).then(() => this.toast(msg)); },
    toast(msg) {
      const t = document.createElement("div");
      t.style = "position:fixed;bottom:50px;left:50%;transform:translateX(-50%);background:#1a1a1a;color:#f0872d;padding:8px 16px;border-radius:50px;font-size:11px;z-index:100000;box-shadow:0 5px 15px rgba(0,0,0,0.5);border:1px solid rgba(240,135,45,0.2);animation:msgIn 0.3s;white-space:nowrap;";
      t.textContent = msg; document.body.appendChild(t); setTimeout(() => t.remove(), 2500);
    },
    updateQuota(headers) {
      try {
        const quota = {
          rpm: {
            remaining: parseInt(headers.get('x-ratelimit-remaining-requests')),
            limit: parseInt(headers.get('x-ratelimit-limit-requests'))
          },
          tpm: {
            remaining: parseInt(headers.get('x-ratelimit-remaining-tokens')),
            limit: parseInt(headers.get('x-ratelimit-limit-tokens'))
          },
          updated: Date.now()
        };
        if (!isNaN(quota.rpm.limit)) {
          this.save(Config.STORAGE_KEYS.GEMINI_QUOTA, quota);
          window.dispatchEvent(new CustomEvent('gemini-quota-updated', { detail: quota }));
        }
      } catch (e) {}
    },
    formatNumber(num) {
      if (num >= 1000000) return (num / 1000000).toFixed(1) + 'M';
      if (num >= 1000) return (num / 1000).toFixed(1) + 'K';
      return num;
    },
    injectMaterialIcons() {
      if (document.getElementById("material-icons-css")) return;
      const link = document.createElement("link");
      link.id = "material-icons-css";
      link.rel = "stylesheet";
      link.href = "https://fonts.googleapis.com/css2?family=Material+Symbols+Rounded:opsz,wght,FILL,GRAD@20,400,0,0";
      document.head.appendChild(link);
    },
    applyTheme() {
      const container = document.getElementById("token-runner-popup");
      if (!container) return;
      const isLight = document.querySelector(".css-1yxmbwk") !== null;
      if (isLight) container.classList.add("light-theme");
      else container.classList.remove("light-theme");
    }
  };

  const ApiService = {
    async fetch(url, options = {}) {
      if (!State.authToken) throw new Error("No token");
      const headers = { ...options.headers, 'Authorization': `Bearer ${State.authToken}`, 'Content-Type': 'application/json' };
      const res = await fetch(url, { ...options, headers });
      if (!res.ok) throw new Error(res.status);
      return res.json();
    },
    async fetchCourses() { return this.fetch(`${Config.API.BASE_URL}/user-course?page=1&limit=50`); },
    async fetchCourseDetails(code) { return this.fetch(`${Config.API.BASE_URL}/user-course/${code}`); },
    async fetchForumTopics(id) { return this.fetch(`${Config.API.BASE_URL}/forum/topic/${id}`); },
    async fetchForumReplies(id) { return this.fetch(`${Config.API.BASE_URL}/forum/reply/${id}`); },
    async checkUpdate() {
      try { const r = await fetch(Config.API.GITHUB_API); return r.ok ? await r.json() : null; } catch (e) { return null; }
    }
  };

  const UIRenderer = {
    injectStyles() {
      if (document.getElementById("mentari-styles")) return;
      const s = document.createElement("style"); s.id = "mentari-styles";
      s.textContent = Config.STYLES; document.head.appendChild(s);
    },
    createPopup() {
      if (document.getElementById("token-runner-popup")) return;
      const p = document.createElement("div"); p.id = "token-runner-popup";
      p.innerHTML = `
        <div class="token-loading-bar"></div>
        <div class="popup-content">
          <div class="popup-header">
            <div class="header-top">
              <div style="display:flex; flex-direction:column;">
                <span class="popup-title">MENTARI MOD</span>
                <span class="popup-subtitle">mod by <a style="color: #c8ad95ff; text-decoration: none;" href="https://github.com/Lukman754">Lukman754</a></span>
              </div>
              <button id="token-refresh-btn" class="token-button" style="padding:6px 10px; border-radius:6px;"><span class="ms">refresh</span></button>
            </div>
            <div class="token-tabs">
              <button class="token-tab active" data-tab="forum-tab" title="Forum"><span class="ms">forum</span></button>
              <button class="token-tab" data-tab="mhs-tab" title="Mahasiswa"><span class="ms">groups</span></button>
              <button class="token-tab" data-tab="notif-tab" title="Notifikasi"><span class="ms">notifications</span></button>
              <button class="token-tab" data-tab="set-tab" title="Pengaturan"><span class="ms">settings</span></button>
            </div>
          </div>
          <div class="token-tab-content active" id="forum-tab-tab"></div>
          <div class="token-tab-content" id="mhs-tab-tab"></div>
          <div class="token-tab-content" id="notif-tab-tab"></div>
          <div class="token-tab-content" id="set-tab-tab"></div>
        </div>
      `;
      document.body.appendChild(p);
      this.initTabs();
      document.getElementById("token-refresh-btn").onclick = (e) => {
        e.stopPropagation();
        App.refreshData(true);
      };
    },
    initTabs() {
      const tabs = document.querySelectorAll(".token-tab");
      tabs.forEach(t => {
        t.onclick = (e) => {
          e.stopPropagation();
          document.querySelectorAll(".token-tab, .token-tab-content").forEach(el => el.classList.remove("active"));
          t.classList.add("active");
          document.getElementById(t.dataset.tab + "-tab").classList.add("active");
        };
      });
    },
    setLoading(active) {
      const bar = document.querySelector(".token-loading-bar");
      if (bar) active ? bar.classList.add("active") : bar.classList.remove("active");
    },
    updatePosition() {
      // Disabled for fixed position consistency across mod windows
    }
  };

  const ForumRenderer = {
    render(data) {
      const el = document.getElementById("forum-tab-tab");
      if (!el) return;
      
      let html = `
        <div style="margin-bottom:15px;">
          <a href="https://my.unpam.ac.id/presensi/" class="item-row" target="_blank"
             style="background: rgba(0, 165, 80, 0.05); border-color: rgba(0, 165, 80, 0.1); display:flex;">
            <div class="item-icon" style="background: rgba(0, 165, 80, 0.1); color: #00a550;"><span class="ms">fact_check</span></div>
            <div class="item-info">
              <span class="item-title" style="color: #00a550; font-weight: 700;">Halaman Presensi Mahasiswa</span>
              <div class="item-meta">
                <span class="item-status" style="color: #00a550; opacity: 0.7;"><span class="ms" style="font-size:12px;">link</span> Buka my.unpam.ac.id</span>
              </div>
            </div>
            <div style="color: #00a550; opacity: 0.5;"><span class="ms">open_in_new</span></div>
          </a>
        </div>
      `;
      
      if (!data.length) {
        html += `
          <div class="empty-state">
            <div class="empty-icon"><span class="ms" style="font-size:40px;">cloud_sync</span></div>
            <div class="empty-title">Data Kosong</div>
            <div class="empty-desc">Pilih mata kuliah di Mentari agar data forum muncul di sini.</div>
          </div>
        `;
      } else {
        const sortedData = [...data].sort((a, b) => {
          const days = ["Minggu", "Senin", "Selasa", "Rabu", "Kamis", "Jumat", "Sabtu"];
          const getDay = (name) => {
            const m = name.match(/\(([^)]+)\)/);
            return m ? days.indexOf(m[1]) : 7;
          };
          return getDay(a.coursename) - getDay(b.coursename);
        });
        
        const coursesHtml = sortedData.map(course => this.renderCourse(course)).join("");
        
        if (!coursesHtml.trim()) {
          html += `
            <div class="empty-state">
              <div class="empty-icon" style="color: #79bb7c; background: rgba(121, 187, 124, 0.05); border-color: rgba(121, 187, 124, 0.1);">
                <span class="ms" style="font-size:40px;">task_alt</span>
              </div>
              <div class="empty-title">Semua Beres!</div>
              <div class="empty-desc">Hore! Tidak ada forum diskusi yang perlu dikerjakan saat ini. Istirahatlah sejenak.</div>
            </div>
          `;
        } else {
          html += coursesHtml;
        }
      }
      
      el.innerHTML = html;
      this.initInteractions(data);
    },

    renderCourse(c) {
      const sections = (c.data || []).filter(s => {
        if (!s.sub_section) return false;
        const forum = s.sub_section.find(i => i.kode_template === "FORUM_DISKUSI" && i.id);
        if (!forum) return false;
        if (forum.warningAlert?.includes("Soal forum diskusi belum tersedia")) return false;
        const postTest = s.sub_section.find(i => i.kode_template === "POST_TEST");
        if (forum.completion === true && (!postTest || postTest.completion === true || !postTest.id)) return false;
        return true;
      });

      if (!sections.length) return "";

      return `
        <div class="course-card">
          <div class="course-card-header">
            <h2>${c.coursename}</h2>
            <span class="course-card-code">${c.kode_course}</span>
          </div>
          <div class="course-card-body">
            ${sections.map((s, idx) => this.renderSection(s, c, idx)).join("")}
          </div>
        </div>
      `;
    },

    renderSection(s, c, idx) {
      const sectionId = `sect-${c.kode_course}-${idx}`;
      const sectionUrl = `https://mentari.unpam.ac.id/u-courses/${c.kode_course}?accord_pertemuan=${s.kode_section}`;
      return `
        <div class="section-card">
          <div class="section-header" data-target="${sectionId}">
            <h3>${s.nama_section}</h3>
            <span class="section-toggle"><span class="ms">expand_more</span></span>
          </div>
          <div class="section-content" id="${sectionId}">
            <a href="${sectionUrl}" class="item-row" style="background: rgba(240,135,45,0.05); border-color: rgba(240,135,45,0.15); margin-bottom:10px;" onclick="event.stopPropagation()">
              <div class="item-icon" style="background: rgba(240,135,45,0.15); color: #f0872d;"><span class="ms">folder_open</span></div>
              <div class="item-info">
                <span class="item-title" style="color: #f0872d;">Buka Pertemuan</span>
                <div class="item-meta"><span>Halaman pertemuan ini</span></div>
              </div>
              <span class="ms" style="opacity:0.4; font-size:11px; flex-shrink:0;">chevron_right</span>
            </a>
            ${s.sub_section.map(item => this.renderItem(item, s, c)).join("")}
          </div>
        </div>
      `;
    },

    renderItem(i, s, c) {
      const isQuiz = ["PRE_TEST", "POST_TEST"].includes(i.kode_template);
      const isForum = i.kode_template === "FORUM_DISKUSI";
      const isMaterial = ["BUKU_ISBN", "VIDEO_AJAR", "POWER_POINT", "ARTIKEL_RISET", "MATERI_LAINNYA"].includes(i.kode_template);
      const isKuesioner = i.kode_template === "KUESIONER";
      const isTugas = i.kode_template === "PENUGASAN_TERSTRUKTUR";

      if (isMaterial && !i.link && !i.file) return "";
      if (isTugas && !i.link && !i.file) return "";  // Sembunyikan tugas kosong
      if (!isQuiz && !isForum && !isMaterial && !isKuesioner && !isTugas) return "";

      // cardUrl: klik seluruh card -> halaman "overview" item
      // actionUrl: klik tombol aksi -> halaman spesifik / langsung action
      let cardUrl = "#";
      let actionUrl = "#";
      let iconClass = "icon-material";
      let icon = "fa-file";
      let actionLabel = "Buka";
      let actionIcon = "fa-up-right-from-square";

      if (isQuiz) {
        cardUrl = i.id ? `https://mentari.unpam.ac.id/u-courses/${c.kode_course}/quiz/${i.id}` : "#";
        actionUrl = i.id ? `https://mentari.unpam.ac.id/u-courses/${c.kode_course}/exam/${i.id}` : "#";
        iconClass = "icon-quiz"; icon = "checklist";
        actionLabel = "Mulai Quiz"; actionIcon = "play_arrow";
      } else if (isForum) {
        cardUrl = i.id ? `https://mentari.unpam.ac.id/u-courses/${c.kode_course}/forum/${i.id}` : "#";
        actionUrl = cardUrl;
        iconClass = "icon-forum"; icon = "forum";
        actionLabel = "Buka Forum"; actionIcon = "open_in_new";
      } else if (isMaterial) {
        // Card -> halaman kursus, Action -> link/download langsung
        cardUrl = `https://mentari.unpam.ac.id/u-courses/${c.kode_course}`;
        if (i.link) {
          actionUrl = i.link;
          actionLabel = "Buka Link"; actionIcon = "open_in_new";
        } else if (i.file) {
          actionUrl = `https://mentari.unpam.ac.id/api/file/${i.file}`;
          actionLabel = "Download"; actionIcon = "download";
        }
        icon = this.getMaterialIcon(i.kode_template);
      } else if (isKuesioner) {
        cardUrl = s.kode_section ? `https://mentari.unpam.ac.id/u-courses/${c.kode_course}/kuesioner/${s.kode_section}` : "#";
        actionUrl = cardUrl;
        iconClass = "icon-quiz"; icon = "bar_chart";
        actionLabel = "Isi Kuesioner"; actionIcon = "edit";
      } else if (isTugas) {
        iconClass = "icon-material"; icon = "assignment";
        actionLabel = "Lihat Tugas";
      }

      const statusClass = i.completion ? "status-done" : "status-todo";
      const statusText = i.completion ? "Selesai" : "Belum";

      // Konten forum (HTML) untuk accordion
      const forumKonten = isForum && i.konten ? i.konten.trim() : "";
      const forumKontenId = `fk-${i.id}`;

      return `
        <div class="item-row ${i.completion ? 'completed-item' : ''}" 
             onclick="if(event.target.closest('a,button')) return; window.location.href='${cardUrl}';"
             style="flex-direction:column; align-items:stretch; padding:0; overflow:hidden; ${i.completion ? 'opacity:0.8;' : 'background: rgba(130, 130, 130, 0.13);'}" data-name="${i.judul}">
          <div style="display:flex; align-items:center; gap:10px; padding:10px;">
            <div class="item-icon ${iconClass}"><span class="ms">${icon}</span></div>
            <div class="item-info">
              <span class="item-title" style="${i.completion ? 'text-decoration: line-through; opacity: 0.6;' : ''}">${i.judul}</span>
              <div class="item-meta">
                <span class="item-status ${statusClass}"><span class="ms">${i.completion ? 'check_circle' : 'schedule'}</span> ${statusText}</span>
                ${i.setting_quiz?.duration ? `<span style="opacity:0.7;"><span class="ms">hourglass_top</span> ${i.setting_quiz.duration} min</span>` : ""}
              </div>
            </div>
            <div style="display:flex; gap:6px; flex-shrink:0;">
              ${forumKonten ? `
                <button class="token-button" title="Lihat Konten Forum" onclick="event.stopPropagation(); const el=document.getElementById('${forumKontenId}'); el.style.display=el.style.display==='none'?'block':'none';" style="width:28px; height:28px; padding:0; background: #3d99e3;  border-radius:6px;">
                  <span class="ms" style="font-size:16px;">menu_book</span>
                </button>` : ""}
              ${actionUrl !== "#" ? `
                <a href="${actionUrl}" class="token-button" title="${actionLabel}" onclick="event.stopPropagation();"
                   style="width:28px; height:28px; padding:0; background: ${actionLabel === 'Download' ? '#79bb7c' : actionLabel === 'Mulai Quiz' ? '#e05c2a' : '#f0872d'}; border-radius:6px;">
                  <span class="ms" style="font-size:16px;">${actionIcon}</span>
                </a>` : ""}
            </div>
          </div>
          ${forumKonten ? `
            <div id="${forumKontenId}" class="forum-html-preview" style="display:none; padding:12px; border-top:1px solid rgba(255,255,255,0.05); color:rgba(255,255,255,0.7); background:rgba(0,0,0,0.6);">
              ${forumKonten}
            </div>` : ""}
          ${isForum && i.id ? `<div class="topics-container" data-forum-id="${i.id}" data-course-code="${c.kode_course}" style="padding:0 12px 10px;"></div>` : ""}
        </div>
      `;
    },

    getMaterialIcon(type) {
      const map = { 
        "BUKU_ISBN": "book", 
        "VIDEO_AJAR": "play_circle", 
        "POWER_POINT": "slideshow", 
        "ARTIKEL_RISET": "article",
        "MATERI_LAINNYA": "folder_open"
      };
      return map[type] || "description";
    },

    initInteractions(data) {
      document.querySelectorAll(".section-header").forEach(header => {
        header.onclick = (e) => {
          e.stopPropagation();
          const target = document.getElementById(header.dataset.target);
          const toggle = header.querySelector(".section-toggle");
          if (target) {
            const isVisible = target.classList.contains("active");
            if (isVisible) { target.classList.remove("active"); toggle.classList.remove("active"); }
            else { target.classList.add("active"); toggle.classList.add("active"); }
          }
        };
      });

      this.loadTopics();
    },

    loadTopics() {
      document.querySelectorAll(".topics-container").forEach(async container => {
        const id = container.dataset.forumId;
        const courseCode = container.dataset.courseCode;
        try {
          const res = await ApiService.fetchForumTopics(id);
          const topics = res.topics?.filter(t => t.id_trx_course_sub_section === id) || [];
          if (topics.length) {
            container.innerHTML = topics.map(t => `
              <a href="https://mentari.unpam.ac.id/u-courses/${courseCode}/forum/${id}/topics/${t.id}" 
                 class="topic-badge" 
                 onclick="event.stopPropagation();">
                <span class="ms" style="flex-shrink:0;">chat</span>
                <span style="white-space:nowrap; overflow:hidden; text-overflow:ellipsis; display:block;">${t.judul}</span>
              </a>
            `).join("");
          }
        } catch (e) {}
      });
    }
  };

  const Renderers = {
    forum(data) { ForumRenderer.render(data); },
    mhs(data) {
      const el = document.getElementById("mhs-tab-tab"); if (!el) return;
      const all = []; const map = new Map();
      data.forEach(c => c.peserta?.forEach(p => { if (!map.has(p.nim)) { map.set(p.nim, p); all.push(p); } }));
      if (!all.length) { el.innerHTML = `<div style="text-align:center; padding:40px 20px; opacity:0.3;">Tidak ada data mahasiswa</div>`; return; }
      all.sort((a,b) => a.nama_mahasiswa.localeCompare(b.nama_mahasiswa));
      el.innerHTML = `<div class="data-card">
        <div class="card-header"><h3 class="card-title">Daftar Mahasiswa (${all.length})</h3> <button id="copy-mhs" class="token-button" style="padding:6px 10px;"><span class="ms">content_copy</span></button></div>
        <div style="max-height: 600px; overflow-y:auto;">${all.map((p, i) => `<div class="student-item"><span class="student-absen">${i+1}</span><div style="flex:1; font-size:12px;">${p.nama_mahasiswa}</div><span style="opacity:0.3; font-size:10px; font-family:monospace;">${p.nim}</span></div>`).join("")}</div>
      </div>`;
      document.getElementById("copy-mhs").onclick = (e) => { e.stopPropagation(); const txt = all.map((p, i) => `${i+1}. ${p.nama_mahasiswa} (${p.nim})`).join("\n"); Utils.copy(txt, "Daftar mahasiswa disalin"); };
    },
    notif(data) {
      const el = document.getElementById("notif-tab-tab"); if (!el) return;
      el.innerHTML = data.length ? data.map(n => `
      <div class="data-card" style="border-left:3px solid #f0872d; background:rgba(240,135,45,0.03); position:relative;">
        <div style="display:flex; justify-content:space-between; align-items:flex-start; margin-bottom:6px;">
          <div style="font-weight:700; font-size:13px; color:#f0872d;">${n.lecturerName}</div>
          <div style="font-size:10px; opacity:0.4; display:flex; align-items:center; gap:3px;">
            <span class="ms" style="font-size:12px;">schedule</span> ${n.date ? new Date(n.date).toLocaleDateString('id-ID', {day:'2-digit', month:'short', hour:'2-digit', minute:'2-digit'}) : '-'}
          </div>
        </div>
        <div style="font-size:12px; color:rgba(255,255,255,0.8); line-height:1.4;">${n.content}</div>
        <a href="${n.url}" target="_blank" class="token-button" style="margin-top:12px; height:28px; font-size:11px; background:rgba(255,255,255,0.05); gap:6px;">
          <span class="ms" style="font-size:14px;">visibility</span> Lihat Diskusi
        </a>
      </div>`).join("") : `<div style="text-align:center; padding:40px 20px; opacity:0.3;">Belum ada balasan dari dosen.</div>`;
    },
    settings(info) {
      const el = document.getElementById("set-tab-tab"); if (!el || !info) return;
      const currentModel = Utils.get(Config.STORAGE_KEYS.GEMINI_MODEL) || 'gemini-2.5-flash-lite';
      const isCustom = !['gemini-2.5-flash', 'gemini-2.5-flash-lite', 'gemini-3-flash-preview'].includes(currentModel);

      el.innerHTML = `
        <div class="data-card" style="padding:15px; border-radius:15px;">
          <!-- Profile Section -->
          <div class="settings-card-inner" style="display:flex; align-items:center; gap:12px; margin-bottom:18px; padding:10px; border-radius:10px; border:1px solid rgba(255,179,107,0.08);">
            <div style="width:34px; height:34px; background:linear-gradient(135deg, #f0872d, #ffb36b); border-radius:50%; display:flex; align-items:center; justify-content:center; font-weight:900; font-size:16px; color:#fff;">${info.fullname.charAt(0)}</div>
            <div>
              <div style="font-weight:700; font-size:13px; color:#f0872d;">${info.fullname}</div>
              <div class="settings-desc" style="font-size:10px; opacity:0.6;">${info.username} • ${info.role}</div>
            </div>
          </div>

          <!-- Tools Grid Section -->
          <div style="display:grid; grid-template-columns: 1fr 1fr; gap:8px; margin-bottom:18px;">
            <a href="https://aistudio.google.com/app/api-keys" target="_blank" class="token-button btn-outline" style="height:34px; background:rgba(255,255,255,0.03); font-size:11px; gap:6px; border-radius:8px; box-shadow:none;">
              <span class="ms" style="font-size:18px; color:#f0872d;">vpn_key</span> API Key
            </a>
            <a href="https://aistudio.google.com/app/rate-limit" target="_blank" class="token-button btn-outline" style="height:34px; background:rgba(255,255,255,0.03); font-size:11px; gap:6px; border-radius:8px; box-shadow:none;">
              <span class="ms" style="font-size:18px; color:#f0872d;">speed</span> Rate Limit
            </a>
            <a href="https://ai.google.dev/gemini-api/docs/models" target="_blank" class="token-button btn-outline" style="height:34px; background:rgba(255,255,255,0.03); font-size:11px; gap:6px; grid-column: span 2; border-radius:8px; justify-content: center; box-shadow:none;">
              <span class="ms" style="font-size:18px; color:#f0872d;">travel_explore</span> Cari Model Gemini Terbaru
            </a>
          </div>

          <!-- Settings Area -->
          <div class="settings-area" style="display:flex; flex-direction:column; gap:14px; padding:14px; border-radius:12px; border:1px solid rgba(255,255,255,0.05);">
            <div style="display:flex; justify-content:space-between; align-items:center;">
              <div style="display:flex; align-items:center; gap:8px;"><span class="ms" style="color:#f0872d; font-size:18px;">auto_awesome</span><span class="settings-label" style="font-size:12px; font-weight:500;">Gemini AI Chatbot</span></div>
              <label class="switch"><input type="checkbox" id="set-gemini" ${Utils.get(Config.STORAGE_KEYS.GEMINI_ENABLED) ? 'checked' : ''}><span class="slider"></span></label>
            </div>
            <div style="display:flex; justify-content:space-between; align-items:center;">
              <div style="display:flex; align-items:center; gap:8px;"><span class="ms" style="color:#f0872d; font-size:18px;">quiz</span><span class="settings-label" style="font-size:12px; font-weight:500;">Auto Finish Quiz</span></div>
              <label class="switch"><input type="checkbox" id="set-quiz" ${Utils.get(Config.STORAGE_KEYS.AUTO_FINISH_QUIZ) ? 'checked' : ''}><span class="slider"></span></label>
            </div>

            <!-- Model Dropdown -->
            <div style="margin-top:5px;">
              <span style="font-size:10px; font-weight:700; color:rgba(128,128,128,0.5); text-transform:uppercase; margin-bottom:5px; display:block; letter-spacing:0.5px;">Konfigurasi Model</span>
              <select id="set-gemini-model" style="width:100%; background:#1a1a1a; color:#fff; border:1px solid #333; border-radius:6px; padding:6px; font-size:12px; outline:none; cursor:pointer;">
                <option value="gemini-2.5-flash" ${currentModel === 'gemini-2.5-flash' ? 'selected' : ''}>Gemini 2.5 Flash</option>
                <option value="gemini-2.5-flash-lite" ${currentModel === 'gemini-2.5-flash-lite' ? 'selected' : ''}>Gemini 2.5 Flash Lite</option>
                <option value="gemini-3-flash-preview" ${currentModel === 'gemini-3-flash-preview' ? 'selected' : ''}>Gemini 3 Flash Preview</option>
                <option value="custom" ${isCustom ? 'selected' : ''}>Custom Model...</option>
              </select>
              <input type="text" id="set-gemini-custom" placeholder="Ketik model kustom..." value="${isCustom ? currentModel : ''}" 
                style="display:${isCustom ? 'block' : 'none'}; width:100%; background:#1a1a1a; color:#fff; border:1px solid #444; border-radius:6px; padding:7px; font-size:12px; outline:none; margin-top:6px;">
              
              <!-- AI Disclaimer Warning -->
              <div style="margin-top:10px; padding:8px 10px; background:rgba(240,135,45,0.05); border-left:2px solid #f0872d; border-radius:4px;">
                <div style="display:flex; align-items:center; gap:6px; margin-bottom:4px;">
                  <span class="ms" style="font-size:14px; color:#f0872d;">warning</span>
                  <span style="font-size:10px; font-weight:700; color:#f0872d; text-transform:uppercase; letter-spacing:0.5px;">Peringatan Penting</span>
                </div>
                <p class="settings-desc" style="font-size:10px; color:rgba(128,128,128,0.7); line-height:1.5; margin:0;">
                  Jika terjadi error saat mencari jawaban, silakan coba ganti model. Harap diingat bahwa jawaban AI tidak selalu 100% akurat dan dapat membuat kesalahan. Selalu lakukan verifikasi data secara berkala.
                </p>
              </div>
            </div>

            <button id="set-api-btn" class="token-button" style="width:100%; background:#f0872d; color:#fff; font-weight:700; border-radius:8px; height:34px; margin-top:5px; gap:8px; box-shadow:none;">
              <span class="ms" style="font-size:18px;">vpn_key</span> Update API Key
            </button>
          </div>

          <!-- Footer -->
          <div class="settings-footer" style="display:flex; justify-content:space-between; align-items:center; margin-top:18px; opacity:0.6; font-size:10px;">
            <span style="display:flex; align-items:center; gap:5px;">v${APP_VERSION} <span style="opacity:0.8;">• by <a href="https://github.com/Lukman754" style="color:#f0872d; text-decoration:none;" target="_blank">Lukman754</a></span></span>
            <button id="set-update-btn" style="background:none; border:none; color:inherit; font-size:inherit; cursor:pointer; text-decoration:underline;">Cek Update</button>
          </div>
        </div>
      `;

      const modelSelect = document.getElementById("set-gemini-model");
      const customInput = document.getElementById("set-gemini-custom");

      document.getElementById("set-gemini").onchange = (e) => {
        Utils.save(Config.STORAGE_KEYS.GEMINI_ENABLED, e.target.checked);
        location.reload();
      };
      document.getElementById("set-quiz").onchange = (e) => Utils.save(Config.STORAGE_KEYS.AUTO_FINISH_QUIZ, e.target.checked);
      
      modelSelect.onchange = (e) => {
        const val = e.target.value;
        if (val === "custom") {
          customInput.style.display = "block";
          customInput.focus();
        } else {
          customInput.style.display = "none";
          Utils.save(Config.STORAGE_KEYS.GEMINI_MODEL, val);
          Utils.toast("Model diperbarui: " + val);
          setTimeout(() => location.reload(), 800);
        }
      };

      customInput.onchange = (e) => {
        const val = e.target.value.trim();
        if (val) {
          Utils.save(Config.STORAGE_KEYS.GEMINI_MODEL, val);
          Utils.toast("Model kustom aktif: " + val);
          setTimeout(() => location.reload(), 800);
        }
      };

      document.getElementById("set-api-btn").onclick = (e) => { e.stopPropagation(); window.dispatchEvent(new CustomEvent("mentari-update-api-key")); };
      document.getElementById("set-update-btn").onclick = async (e) => { e.stopPropagation(); const v = await ApiService.checkUpdate(); if (v && v.tag_name !== "v" + APP_VERSION) Utils.toast("Update tersedia: " + v.tag_name); else Utils.toast("Versi terbaru sudah terpasang."); };
    }
  };

  const App = {
    async init() {
      Utils.injectMaterialIcons(); UIRenderer.injectStyles(); UIRenderer.createPopup(); this.intercept();
      const t = Utils.get(Config.STORAGE_KEYS.AUTH_TOKEN); if (t) this.handleToken(t); else this.render();
      window.addEventListener('mentari-toggle-popup', () => window.toggleTokenPopup()); window.addEventListener('resize', () => UIRenderer.updatePosition());
      
      setInterval(() => Utils.applyTheme(), 1000);
    },
    intercept() {
      const self = this;
      const origSetHeader = XMLHttpRequest.prototype.setRequestHeader;
      XMLHttpRequest.prototype.setRequestHeader = function(header, value) {
        if (!this._requestHeaders) this._requestHeaders = {}; this._requestHeaders[header] = value;
        if (header.toLowerCase() === 'authorization' && value.includes('Bearer ')) self.handleToken(value);
        return origSetHeader.apply(this, arguments);
      };
      const origXHR = XMLHttpRequest.prototype.open;
      XMLHttpRequest.prototype.open = function() {
        this.addEventListener('load', function() {
          const auth = this.getResponseHeader?.('Authorization') || this._requestHeaders?.['Authorization'];
          if (auth) self.handleToken(auth);
        });
        return origXHR.apply(this, arguments);
      };
      const origFetch = window.fetch;
      window.fetch = async function(resource, init) {
        if (init?.headers) {
          const headers = new Headers(init.headers);
          if (headers.get('Authorization')) self.handleToken(headers.get('Authorization'));
        }
        const res = await origFetch.apply(this, arguments);
        if (res.headers.get('Authorization')) self.handleToken(res.headers.get('Authorization'));
        return res;
      };
    },
    handleToken(token) {
      if (token.startsWith("Bearer ")) token = token.substring(7);
      const info = Utils.decodeToken(token); if (!info || State.authToken === token) return;
      State.authToken = token; State.userInfo = info;
      Utils.save(Config.STORAGE_KEYS.AUTH_TOKEN, token); Utils.save(Config.STORAGE_KEYS.USER_INFO, info);
      Renderers.settings(info); this.refreshData();
    },
    async refreshData(force = false) {
      if (State.isFetching || !State.authToken) return;
      if (!force) { const cached = Utils.get(Config.STORAGE_KEYS.COURSE_DATA); if (cached) { State.courseDataList = cached; this.render(); return; } }
      try {
        State.isFetching = true; UIRenderer.setLoading(true);
        const list = await ApiService.fetchCourses(); State.courseDataList = []; State.lecturerNotifications = [];
        for (const c of (list.data || [])) {
          const det = await ApiService.fetchCourseDetails(c.kode_course); if (!det) continue;
          State.courseDataList.push(det);
          for (const s of (det.data || [])) {
            const f = s.sub_section?.find(i => i.kode_template === "FORUM_DISKUSI"); if (!f) continue;
            try {
              const res = await ApiService.fetchForumTopics(f.id);
              for (const t of (res.topics || []).filter(t => t.id_trx_course_sub_section === f.id)) {
                const reps = await ApiService.fetchForumReplies(t.id);
                const lNotifs = (reps.replies || []).filter(r => r.role === "Lecturer").map(r => {
                  const raw = r.konten?.replace(/<[^>]*>/g, '') || "";
                  const preview = raw.length > 100 ? raw.substring(0, 100) + "..." : raw;
                  return {
                    lecturerName: r.fullname, 
                    content: preview, 
                    url: `https://mentari.unpam.ac.id/u-courses/${c.kode_course}/forum/${f.id}/topics/${t.id}`, 
                    date: r.created_at
                  };
                });
                State.lecturerNotifications.push(...lNotifs);
              }
            } catch (e) {}
          }
        }
        
        // Sorting: Terbaru paling atas
        State.lecturerNotifications.sort((a,b) => new Date(b.date) - new Date(a.date));
        Utils.save(Config.STORAGE_KEYS.COURSE_DATA, State.courseDataList); this.render();
      } catch (e) {} finally { State.isFetching = false; UIRenderer.setLoading(false); }
    },
    render() {
      Renderers.forum(State.courseDataList); Renderers.mhs(State.courseDataList); Renderers.notif(State.lecturerNotifications);
      if (State.userInfo) Renderers.settings(State.userInfo);
    }
  };

  window.toggleTokenPopup = () => {
    const p = document.getElementById("token-runner-popup"); if (!p) { UIRenderer.createPopup(); return; }
    if (!p.classList.contains("active")) {
      // Close other popups for consistency
      document.getElementById("gemini-chat-container")?.classList.remove("active");
      document.getElementById("mentari-guide-container")?.classList.remove("active");

      UIRenderer.updatePosition(); p.classList.add("active");
      const close = (e) => {
        if (!p.contains(e.target) && !document.getElementById("mentari-header-toggle")?.contains(e.target) && !e.target.closest(".toast")) {
          p.classList.remove("active"); document.removeEventListener('mousedown', close);
        }
      };
      document.addEventListener('mousedown', close);
    } else p.classList.remove("active");
  };

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', () => App.init());
  else App.init();
})();
