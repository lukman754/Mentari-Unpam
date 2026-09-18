(function () {
  const APP_VERSION = "2.0 Sunset";
  console.log("Mentari Mod Token script loaded.");

  const Config = {
    STORAGE_KEYS: {
      AUTH_TOKEN: "mentari_auth_token",
      USER_INFO: "mentari_user_info",
      COURSE_DATA: "mentari_course_data",
      LAST_UPDATE: "mentari_last_update",
      GEMINI_ENABLED: "gemini_enabled",
      QUIZ_DELAY: "mentari_quiz_delay",
      GEMINI_MODEL: "gemini_model",
      GEMINI_QUOTA: "gemini_quota",
      GEMINI_API_KEY: "geminiApiKey",
      GEMINI_MODEL_STATS: "gemini_model_stats",
    },
    API: {
      BASE_URL: "https://mentari.unpam.ac.id/api",
      GITHUB_API:
        "https://api.github.com/repos/lukman754/Mentari-Unpam/releases/latest",
    },
    STYLES: `
       #token-runner-popup { 
         position: fixed; z-index: 99999; top: 70px; right: 20px; width: 500px; 
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
        color: #17202a;
        border: 1px solid #cbd5e1;
        box-shadow: 0 8px 32px rgba(0,0,0,0.08);
      }
      #token-runner-popup.light-theme .popup-header {
        background: linear-gradient(180deg, #f8fafc 0%, #e2e8f0 100%);
        border-bottom-color: #cbd5e1;
      }
      #token-runner-popup.light-theme .popup-title {
        color: #0d47a1;
      }
      #token-runner-popup.light-theme .token-tabs {
        background: #cbd5e1;
        border-color: #94a3b8;
      }
      #token-runner-popup.light-theme .token-tab {
        color: #475569;
      }
      #token-runner-popup.light-theme .token-tab:hover {
        color: #0f172a;
        background: rgba(255, 255, 255, 0.5);
      }
      #token-runner-popup.light-theme .token-tab.active {
        color: #075985;
        background: #ffffff;
        border-color: #93c5fd;
        box-shadow: 0 2px 6px rgba(0,0,0,0.08);
      }
      #token-runner-popup.light-theme .data-card, 
      #token-runner-popup.light-theme .course-card {
        background: #ffffff;
        border-color: #cbd5e1;
      }
      #token-runner-popup.light-theme .course-card-header {
        background: #e2e8f0;
        border-bottom-color: #cbd5e1;
      }
      #token-runner-popup.light-theme .course-progress-track {
        background: rgba(0, 0, 0, 0.1);
      }
      #token-runner-popup.light-theme .course-card-header h2 {
        color: #0d47a1;
      }
      #token-runner-popup.light-theme .course-card {
        background: #ffffff;
        border-color: #cbd5e1;
        box-shadow: 0 2px 10px rgba(15,23,42,0.05);
      }
      #token-runner-popup.light-theme .course-card-header {
        background: linear-gradient(180deg, #ffffff 0%, #f8fafc 100%);
      }
      #token-runner-popup.light-theme .course-title,
      #token-runner-popup.light-theme .course-meeting-label {
        color: inherit;
      }
      #token-runner-popup.light-theme .course-code,
      #token-runner-popup.light-theme .course-progress-label {
        color: #64748b;
      }
      #token-runner-popup.light-theme .course-progress-value {
        color: #166534;
      }
      #token-runner-popup.light-theme .course-chip {
        border: 1px solid transparent;
      }
      #token-runner-popup.light-theme .course-chip-sks {
        background: #e0f2fe !important;
        border-color: #7dd3fc !important;
        color: #075985 !important;
      }
      #token-runner-popup.light-theme .course-chip-day {
        background: #dcfce7 !important;
        border-color: #86efac !important;
        color: #166534 !important;
      }
      #token-runner-popup.light-theme .course-chip-class {
        background: #ffedd5 !important;
        border-color: #fdba74 !important;
        color: #c2410c !important;
      }
      #token-runner-popup.light-theme .course-card-body {
        background: #f8fafc;
        border-top-color: #e2e8f0 !important;
      }
      #token-runner-popup.light-theme .section-card {
        background: #ffffff;
        border-color: #e2e8f0;
        box-shadow: 0 2px 10px rgba(0, 0, 0, 0.04);
      }
      #token-runner-popup.light-theme .section-header {
        background: linear-gradient(90deg, #f8fafc, #f1f5f9);
      }
      #token-runner-popup.light-theme .section-header:hover {
        background: linear-gradient(90deg, #e0f2fe, #f1f5f9);
      }
      #token-runner-popup.light-theme .section-header h3 {
        color: #0f172a;
      }
      #token-runner-popup.light-theme .section-badge-pill {
        background: #e2e8f0;
        color: #475569;
        border-color: #cbd5e1;
      }
      #token-runner-popup.light-theme .section-content {
        background: #f8fafc;
        border-top-color: #e2e8f0;
      }
      #token-runner-popup.light-theme .item-row {
        background: #ffffff;
        border-color: #e2e8f0;
      }
      #token-runner-popup.light-theme .item-row:hover {
        background: #f1f5f9 !important;
        border-color: #38bdf8;
      }
      #token-runner-popup.light-theme .item-row:hover .item-title {
        color: #ff7b00;
      }
      #token-runner-popup.light-theme .item-title {
        color: #1e293b;
      }
      #token-runner-popup.light-theme .item-meta {
        color: #475569;
        opacity: 1;
      }
      #token-runner-popup.light-theme .card-title {
         color: #1e293b;
      }
      #token-runner-popup.light-theme .student-item {
        background: #ffffff;
      }
      #token-runner-popup.light-theme .student-list-card,
      #token-runner-popup.light-theme .settings-section,
      #token-runner-popup.light-theme .settings-profile {
        background: #ffffff;
        border-color: #cbd5e1;
      }
      #token-runner-popup.light-theme .student-list-header,
      #token-runner-popup.light-theme .settings-section-header {
        background: #e2e8f0;
        border-color: #cbd5e1;
      }
      #token-runner-popup.light-theme .student-row:hover,
      #token-runner-popup.light-theme .settings-row:hover {
        background: #f1f5f9;
        border-color: rgba(0, 0, 0, 0.12);
      }
      #token-runner-popup.light-theme .student-row {
        background: rgba(0, 0, 0, 0.02);
        border-color: rgba(0, 0, 0, 0.06);
      }
      #token-runner-popup.light-theme .student-avatar {
        background: #e0f2fe;
        color: #0284c7;
        border-color: #7dd3fc;
      }
      #token-runner-popup.light-theme .student-name,
      #token-runner-popup.light-theme .settings-row-title {
        color: #1e293b;
      }
      #token-runner-popup.light-theme .student-count,
      #token-runner-popup.light-theme .student-nim,
      #token-runner-popup.light-theme .student-list-title .ms,
      #token-runner-popup.light-theme .settings-section-title .ms {
        color: #075985;
      }
      #token-runner-popup.light-theme .student-count {
        background: #e0f2fe;
        border-color: #7dd3fc;
      }
      #token-runner-popup.light-theme .student-meta,
      #token-runner-popup.light-theme .settings-row-desc {
        color: #475569;
        opacity: 0.85;
      }
      #token-runner-popup.light-theme .student-rank,
      #token-runner-popup.light-theme .settings-section-label {
        color: #64748b;
        background: #f1f5f9;
        border-color: #cbd5e1;
      }
      #token-runner-popup.light-theme .settings-section-title {
        color: #0f172a;
      }
      #token-runner-popup.light-theme .settings-disclaimer {
        background: #fff7ed;
        border-color: #fdba74;
      }
      #token-runner-popup.light-theme .student-item div {
        color: #334155;
      }
      #token-runner-popup.light-theme .settings-label {
        color: #1e293b;
      }
      #token-runner-popup.light-theme .settings-desc {
        color: #475569;
      }
      #token-runner-popup.light-theme .settings-area {
        background: #f8fafc;
        border-color: #cbd5e1;
      }
      #token-runner-popup.light-theme .settings-card-inner {
        background: #e0f2fe;
        border-color: #7dd3fc;
      }
      #token-runner-popup.light-theme select,
      #token-runner-popup.light-theme input[type="text"] {
        background: #ffffff !important;
        color: #0f172a !important;
        border-color: #64748b !important;
      }
      #token-runner-popup.light-theme #set-quiz-delay {
        background: #f1f5f9 !important;
        color: #0f172a !important;
        border: 1px solid #64748b !important;
        font-weight: 600;
      }
      #token-runner-popup.light-theme input[type="text"]::placeholder,
      #token-runner-popup.light-theme #set-quiz-delay::placeholder {
        color: #64748b;
      }
      #token-runner-popup.light-theme .token-button.btn-outline {
        background: #ffffff !important;
        border-color: #cbd5e1 !important;
        color: #1e293b !important;
      }
      #token-runner-popup.light-theme .token-button.btn-outline:hover {
        background: #f1f5f9 !important;
      }
      #token-runner-popup.light-theme .settings-footer {
        color: #64748b;
      }
      #token-runner-popup.light-theme .mentari-model-item {
        background: #ffffff;
        border-color: #cbd5e1;
        color: #1e293b;
      }
      #token-runner-popup.light-theme .mentari-model-item:hover {
        background: #f1f5f9;
      }
      #token-runner-popup.light-theme .mentari-model-item.is-active {
        background: #e0f2fe;
        border-color: #0284c7;
        color: #0284c7;
      }
      #token-runner-popup.light-theme .mentari-model-item .model-id-sub {
        color: #475569;
      }
      #token-runner-popup.light-theme #set-model-status {
        color: #475569;
      }
      #token-runner-popup.light-theme .topic-badge {
        background: #e0f2fe;
        border-color: #7dd3fc;
        color: #075985!important;
      }
      #token-runner-popup.light-theme .topic-badge:hover {
        background: #e2e8f0;
        border-color: #0284c7;
      }
      #token-runner-popup.light-theme .forum-html-preview {
        color: #17202a;
      }
      #token-runner-popup.light-theme .forum-toggle-btn {
        background: #e2e8f0;
        color: #c2410c;
      }
      #token-runner-popup.light-theme .icon-forum {
        background: #dbeafe;
        color: #1d4ed8;
      }
      #token-runner-popup.light-theme .icon-quiz {
        background: #dcfce7;
        color: #166534;
      }
      #token-runner-popup.light-theme .icon-material {
        background: #ffedd5;
        color: #c2410c;
      }
      #token-runner-popup.light-theme .section-toggle {
        color: #334155;
        opacity: 0.85;
      }
      #token-runner-popup.light-theme .section-toggle.active {
        color: #f0872d;
        opacity: 1;
      }

      #token-runner-popup *::-webkit-scrollbar { width: 4px; }
      #token-runner-popup *::-webkit-scrollbar-thumb { background: rgba(249, 224, 144, 0.3); border-radius: 10px; }
      
      @media (max-width: 600px) { #token-runner-popup { width: 100%!important; left: 0!important; right: 0!important; border-radius: 0!important; height: 100vh!important; top: 50px!important; transform: translateX(100%)!important; } #token-runner-popup.active { transform: translateX(0)!important; } }
      .popup-content { display: flex; flex-direction: column; height: 100%; max-height: 90vh; }
      .popup-header {
        padding: 12px 14px;
        background: rgba(255, 255, 255, 0.04);
        border-bottom: 1px solid rgba(255, 255, 255, 0.07);
        flex-shrink: 0;
      }
      .header-top {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 10px;
      }
      .popup-title {
        font-weight: 800;
        font-size: 15px;
        color: #f0872d;
        line-height: 1.2;
        letter-spacing: 0.5px;
      }
      .popup-subtitle {
        font-size: 9px;
        color: rgba(148, 163, 184, 0.8);
        font-weight: 500;
        letter-spacing: 0.3px;
        margin-top: 1px;
        display: block;
      }
      .token-tabs {
        display: flex;
        gap: 4px;
        background: rgba(0, 0, 0, 0.35);
        padding: 2px;
        border-radius: 8px;
        flex-shrink: 0;
      }
      .token-tab {
        flex: 1;
        padding: 12px 10px;
        font-size: 11px;
        font-weight: 600;
        color: #94a3b8;
        background: transparent;
        border: 1px solid transparent;
        border-radius: 6px;
        cursor: pointer;
        transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
        display: flex;
        align-items: center;
        justify-content: center;
        gap: 5px;
        position: relative;
      }
      .token-tab:hover {
        color: #f1f5f9;
        background: rgba(255, 255, 255, 0.05);
      }
      .token-tab.active {
        color: #f0872d;
        background: rgba(240, 135, 45, 0.16);
        border-color: rgba(240, 135, 45, 0.3);
        font-weight: 700;
        box-shadow: 0 2px 8px rgba(0, 0, 0, 0.2);
      }
      .token-tab .ms { font-size: 15px; }
      .token-tab-badge { min-width:14px; height:14px; margin-left:3px; padding:0 4px; display:none; align-items:center; justify-content:center; border-radius:10px; background:#ef4444; color:#fff; font-size:9px; font-weight:800; line-height:1; }
      .token-tab-content { display: none; padding: 16px; flex: 1; overflow-y: auto; overflow-x: hidden; box-sizing: border-box; }
      .token-tab-content.active { display: block; }
      .token-loading-bar { position: absolute; top: 0; left: 0; height: 2px; width: 0; background: #3d99e3; transition: width 0.3s; z-index: 10; }
      .token-loading-bar.active { width: 100%; }
      .toast { position:fixed;bottom:100px;left:50%;transform:translateX(-50%);background:#1a1a1a;color:#fff;padding:8px 16px;border-radius:50px;box-shadow:0 5px 15px rgba(0,0,0,0.4);z-index:10000;font-family:system-ui;border:1px solid #444;font-size:11px;animation:toastIn 0.3s; }
      @keyframes toastIn { from { transform: translate(-50%, 20px); opacity: 0; } to { transform: translate(-50%, 0); opacity: 1; } }
      .token-button { background: #3d99e3; color: white; border: none; padding: 10px 16px; border-radius: 8px; cursor: pointer; font-size: 12px; display: flex; align-items: center; justify-content: center; gap: 8px; transition: all 0.2s; font-weight: 600; text-decoration: none; border: 1px solid rgba(255,255,255,0.1); }
      .token-button:hover { background: #1976d2; transform: translateY(-1px); box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1); }
      #token-runner-popup .forum-reply-parent,
      #token-runner-popup .forum-reply-input { background: #242b35 !important; color: #f1f5f9 !important; border-color: #64748b !important; }
      #token-runner-popup .forum-reply-parent option { background: #242b35; color: #f1f5f9; }
      #token-runner-popup.light-theme .forum-reply-parent,
      #token-runner-popup.light-theme .forum-reply-input { background: #ffffff !important; color: #17202a !important; border-color: #94a3b8 !important; }
      #token-runner-popup.light-theme .forum-reply-parent option { background: #ffffff; color: #17202a; }
      .mentari-spin { display: inline-flex; animation: mentari-spin 0.9s linear infinite; }
      @keyframes mentari-spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
      .switch { position: relative; display: inline-block; width: 44px; height: 22px; }
      .switch input { opacity: 0; width: 0; height: 0; }
      .slider { position: absolute; cursor: pointer; top: 0; left: 0; right: 0; bottom: 0; background-color: #333; transition: .4s; border-radius: 22px; }
      .slider:before { position: absolute; content: ""; height: 16px; width: 16px; left: 3px; bottom: 3px; background-color: white; transition: .4s; border-radius: 50%; }
      input:checked + .slider { background-color: #f0872d; }
      input:checked + .slider:before { transform: translateX(22px); }
      .data-card { background: rgba(255,255,255,0.03); border-radius: 12px; padding: 16px; margin-bottom: 12px; border: 1px solid rgba(255,255,255,0.05); }
      .card {
  -webkit-tap-highlight-color: transparent;
}
  figure.image {
    margin-inline-start: 0px;
    margin-inline-end: 0px;
}
      .card-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 12px; }
      .card-title { font-size: 14px; font-weight: 700; color: #eee; margin: 0; opacity: 0.9; }
      .student-item { display: flex; align-items: center; gap: 12px; padding: 10px; background: rgba(255,255,255,0.02); border-radius: 10px; margin-bottom: 8px; transition: background 0.2s; }
      .student-item:hover { background: rgba(255,255,255,0.04); }
      .student-absen { width: 24px; height: 24px; background: #f0872d; color: white; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 10px; font-weight: 800; flex-shrink: 0; }
      .student-list-card, .settings-section, .settings-profile { border: 1px solid rgba(255,255,255,0.08); border-radius: 10px; overflow: hidden; background: rgba(255,255,255,0.02); margin-bottom: 12px; }
      .student-list-header, .settings-section-header { display: flex; align-items: center; justify-content: space-between; gap: 10px; padding: 11px 12px; background: rgba(255,255,255,0.04); border-bottom: 1px solid rgba(255,255,255,0.06); }
      .student-list-title, .settings-section-title { display: flex; align-items: center; gap: 7px; font-size: 13px; font-weight: 700; }
      .student-list-title .ms, .settings-section-title .ms { color: #3d99e3; font-size: 17px; }
      .student-count { min-width: 20px; padding: 2px 7px; border: 1px solid rgba(61,153,227,0.2); border-radius: 5px; background: rgba(61,153,227,0.12); color: #38bdf8; font-size: 10px; font-weight: 800; line-height: 1.2; text-align: center; }
      .student-model-list { display: flex; flex-direction: column; gap: 5px; max-height: 580px; overflow-y: auto; padding: 8px; }
      .student-row { display: flex; align-items: center; gap: 10px; padding: 8px 10px; border-radius: 8px; border: 1px solid rgba(255,255,255,0.06); background: rgba(255,255,255,0.02); transition: all 0.15s; }
      .student-row:hover { background: rgba(255,255,255,0.05); border-color: rgba(255,255,255,0.12); }
      .student-avatar { width: 26px; height: 26px; flex-shrink: 0; border-radius: 6px; background: rgba(61,153,227,0.12); color: #38bdf8; display: flex; align-items: center; justify-content: center; font-size: 11px; font-weight: 700; border: 1px solid rgba(61,153,227,0.2); }
      .student-info { flex: 1; min-width: 0; }
      .student-name { color: #f1f5f9; font-size: 12px; font-weight: 600; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
      .student-meta { display: flex; align-items: center; gap: 6px; flex-wrap: wrap; margin-top: 1px; color: #94a3b8; font-size: 10px; opacity: 0.6; }
      .student-nim { font-family: monospace; color: #3d99e3; font-weight: 500; opacity: 1; }
      .student-rank { display: inline-flex; align-items: center; justify-content: center; min-width: 20px; height: 20px; padding: 0 6px; border: 1px solid rgba(255,255,255,0.08); border-radius: 5px; background: rgba(255,255,255,0.04); color: #94a3b8; font-size: 9px; font-weight: 700; flex-shrink: 0; text-align: center; }
      .settings-profile { display: flex; align-items: center; gap: 12px; padding: 11px 12px; border-color: rgba(240,135,45,0.18); background: rgba(240,135,45,0.06); }
      .settings-avatar { width: 38px; height: 38px; flex-shrink: 0; border-radius: 8px; background: linear-gradient(135deg, #f0872d, #ffb36b); color: #fff; display: flex; align-items: center; justify-content: center; font-size: 17px; font-weight: 900; }
      .settings-profile-info { min-width: 0; }
      .settings-label { color: #f0872d; font-size: 13px; font-weight: 700; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
      .settings-desc { color: #94a3b8; font-size: 10px; line-height: 1.5; }
      .settings-section { overflow: hidden; }
      .settings-section-header { padding: 9px 12px; }
      .settings-section-label { color: #94a3b8; font-size: 9px; font-weight: 700; letter-spacing: 0.8px; text-transform: uppercase; }
      .settings-row { display: flex; align-items: center; justify-content: space-between; gap: 12px; padding: 10px 12px; border-bottom: 1px solid rgba(255,255,255,0.05); transition: background 0.15s; }
      .settings-row:last-child { border-bottom: 0; }
      .settings-row-main { min-width: 0; }
      .settings-row-title { display: flex; align-items: center; gap: 7px; color: #f1f5f9; font-size: 12px; font-weight: 600; }
      .settings-row-title .ms { color: #f0872d; font-size: 16px; }
      .settings-row-desc { margin: 2px 0 0 23px; color: #94a3b8; font-size: 10px; }
      .settings-quick-links { display: grid; grid-template-columns: 1fr 1fr; gap: 6px; margin-bottom: 12px; }
      .settings-model-list { display: flex; flex-direction: column; gap: 5px; max-height: 200px; overflow-y: auto; padding: 8px; }
      .settings-disclaimer { padding: 8px 10px; margin-bottom: 12px; border-left: 2px solid rgba(240,135,45,0.45); border-radius: 4px; background: rgba(240,135,45,0.05); }
      .settings-status-badge { display: inline-flex; align-items: center; padding: 2px 6px; border: 1px solid rgba(74,222,128,0.2); border-radius: 5px; background: rgba(74,222,128,0.12); color: #4ade80; font-size: 9px; font-weight: 700; line-height: 1.2; }
      .settings-status-badge.is-error { border-color: rgba(251,146,60,0.2); background: rgba(251,146,60,0.12); color: #fb923c; }
      .mentari-model-item { display: flex; align-items: center; gap: 10px; padding: 8px 10px; border-radius: 8px; cursor: pointer; border: 1px solid rgba(255,255,255,0.06); background: rgba(255,255,255,0.02); transition: all 0.15s; }
      .mentari-model-item:hover { background: rgba(255,255,255,0.06); }
      .mentari-model-item.is-active { border-color: rgba(61,153,227,0.5); background: rgba(61,153,227,0.08); }
      .mentari-model-item .model-state-dot { width: 8px; height: 8px; border-radius: 50%; flex-shrink: 0; background: rgba(255,255,255,0.2); }
      .mentari-model-item.is-active .model-state-dot { background: #3d99e3; box-shadow: 0 0 6px rgba(61,153,227,0.7); }
      .mentari-model-item.is-limited .model-state-dot { background: #fb923c; }
      .model-limit-badge { display: inline-flex; align-items: center; margin-left: 6px; padding: 2px 6px; border: 1px solid rgba(251,146,60,0.2); border-radius: 5px; background: rgba(251,146,60,0.12); color: #fb923c; font-size: 9px; font-weight: 700; line-height: 1.2; vertical-align: middle; }

      /* Detailed Forum Styles */
      .course-card { margin-bottom: 15px; border: 1px solid rgba(255,255,255,0.08); border-radius: 10px; overflow: hidden; background: rgba(255,255,255,0.01); }
      .course-card-header { padding: 12px 16px; background: rgba(255,255,255,0.04); border-bottom: 1px solid rgba(255,255,255,0.05); }
      .course-card-header h2 { margin: 0; font-size: 14px; color: #3d99e3; font-weight: 700; }
      .course-card-code { font-size: 10px; opacity: 0.5; margin-top: 4px; display: block; }
      .course-chip-sks { background: rgba(61,153,227,0.15); color: #3d99e3; }
      .course-chip-day { background: rgba(121,187,124,0.15); color: #79bb7c; }
      .course-chip-class { background: rgba(240,135,45,0.15); color: #f0872d; }
      .course-progress-value { color: #79bb7c; }
      .course-progress-track { width: 100%; height: 4px; background: rgba(255, 255, 255, 0.08); border-radius: 4px; overflow: hidden; position: relative; }
      .course-progress-bar { height: 100%; background: linear-gradient(90deg, #3d99e3, #79bb7c); border-radius: 4px; transition: width 0.4s cubic-bezier(0.4, 0, 0.2, 1); }
      /* Clean LMS Section Cards */
      .section-card {
        margin-bottom: 8px;
        border: 1px solid rgba(255, 255, 255, 0.08);
        border-radius: 8px;
        overflow: hidden;
        background: rgba(255, 255, 255, 0.02);
        transition: border-color 0.2s ease;
      }
      .section-card:hover {
        border-color: rgba(255, 255, 255, 0.14);
      }
      .section-card.active,
      .section-card:has(.section-content.active) {
        border-color: #3d99e3 !important;
      }
      .section-header {
        padding: 8px 12px;
        cursor: pointer;
        display: flex;
        justify-content: space-between;
        align-items: center;
        background: rgba(255, 255, 255, 0.03);
        transition: background 0.2s ease;
      }
      .section-header:hover {
        background: rgba(255, 255, 255, 0.06);
      }
      .section-header-left {
        display: flex;
        align-items: center;
        gap: 8px;
      }
      .section-header-icon {
        width: 24px;
        height: 24px;
        border-radius: 6px;
        background: rgba(61, 153, 227, 0.12);
        color: #3d99e3;
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 12px;
      }
      .section-header h3 {
        margin: 0;
        font-size: 12px;
        font-weight: 700;
        color: #f1f5f9;
        pointer-events: none;
      }
      .section-toggle {
        width: 20px;
        height: 20px;
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 11px;
        transition: transform 0.25s ease, background 0.2s, color 0.2s;
        opacity: 0.7;
        pointer-events: none;
        background: rgba(255, 255, 255, 0.04);
      }
      .section-toggle.active {
        transform: rotate(180deg);
        opacity: 1;
        color: #3d99e3;
        background: rgba(61, 153, 227, 0.15);
      }
      .section-content {
        display: none;
        padding: 8px;
        background: rgba(0, 0, 0, 0.15);
        border-top: 1px solid rgba(255, 255, 255, 0.04);
        gap: 6px;
      }
      .section-content.active {
        display: flex;
        flex-direction: column;
      }
      .section-actions { padding: 0 4px 8px; display: flex; justify-content: center; }
      
      .item-row {
        display: flex;
        align-items: center;
        gap: 8px;
        padding: 8px 10px;
        border-radius: 8px;
        background: rgba(255, 255, 255, 0.03);
        border: 1px solid rgba(255, 255, 255, 0.06);
        text-decoration: none;
        color: inherit;
        transition: background 0.2s ease;
        cursor: pointer;
        position: relative;
      }
      .item-row:hover {
        background: rgba(255, 255, 255, 0.07) !important;
      }
      .item-row:hover .item-title { color: #3d99e3; }
      .item-icon {
        width: 28px;
        height: 28px;
        border-radius: 6px;
        display: flex;
        align-items: center;
        justify-content: center;
        flex-shrink: 0;
        font-size: 13px;
      }
      .icon-forum { background: rgba(61, 153, 227, 0.15); color: #38bdf8; }
      .icon-quiz { background: rgba(121, 187, 124, 0.15); color: #4ade80; }
      .icon-material { background: rgba(240, 135, 45, 0.15); color: #fb923c; }
      .item-info { flex: 1; overflow: hidden; }
      .item-title { font-size: 12px; font-weight: 600; display: block; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; transition: all 0.2s; color: #eee; }
      .item-meta { font-size: 10px; opacity: 0.7; margin-top: 2px; display: flex; align-items: center; gap: 6px; }
      .item-status {
        display: inline-flex;
        align-items: center;
        gap: 3px;
        padding: 1px 6px;
        border-radius: 5px;
        font-size: 9px;
        font-weight: 700;
        letter-spacing: 0.02em;
        text-transform: uppercase;
        line-height: 1.2;
      }
      .status-done { background: rgba(74, 222, 128, 0.12); color: #4ade80; border: 1px solid rgba(74, 222, 128, 0.2); }
      .status-todo { background: rgba(251, 146, 60, 0.12); color: #fb923c; border: 1px solid rgba(251, 146, 60, 0.2); }
      .topic-badge { display: flex; align-items: center; gap: 6px; padding: 5px 8px; background: rgba(255,255,255,0.04); border-radius: 5px; font-size: 10px; border: 1px solid rgba(255,255,255,0.06); color: #3d99e3!important; text-decoration: none!important; transition: all 0.2s; width: 100%; box-sizing: border-box; overflow: hidden; }
      .topic-badge:hover { background: rgba(144, 202, 249, 0.1); border-color: rgba(144,202,249,0.2); }
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

    `,
  };

  const State = {
    authToken: null,
    userInfo: null,
    courseDataList: [],
    isFetching: false,
    currentTab: "forum-tab",
  };

  const Utils = {
    save(key, data) {
      try {
        localStorage.setItem(key, JSON.stringify(data));
      } catch (e) {}
    },
    get(key) {
      try {
        const d = localStorage.getItem(key);
        return d ? JSON.parse(d) : null;
      } catch (e) {
        return null;
      }
    },
    remove(key) {
      try {
        localStorage.removeItem(key);
      } catch (e) {}
    },
    extractJwt(raw) {
      if (!raw) return null;
      try {
        const parsed = JSON.parse(raw);
        // Format: [{role, token}, ...] — format Mentari
        if (Array.isArray(parsed)) {
          for (const item of parsed) {
            if (item && item.token && this.decodeToken(item.token)) return item.token;
          }
        }
        // Format: {token: "eyJ..."} atau {access: "eyJ..."}
        if (typeof parsed === "object" && parsed !== null) {
          const val = parsed.token || parsed.access || parsed.jwt;
          if (val && this.decodeToken(val)) return val;
        }
        // Format: plain string yang di-stringify
        if (typeof parsed === "string") {
          const cleaned = parsed.replace(/^Bearer\s+/i, "");
          if (this.decodeToken(cleaned)) return cleaned;
        }
      } catch (_) {
        // Bukan JSON, coba langsung sebagai plain JWT
        const cleaned = raw.replace(/^"|"$/g, "").replace(/^Bearer\s+/i, "");
        if (this.decodeToken(cleaned)) return cleaned;
      }
      return null;
    },
    findTokenFromStorage() {
      try {
        // Coba key utama Mentari lebih dulu
        for (const key of ["access", "token"]) {
          const raw = localStorage.getItem(key);
          if (raw) {
            const jwt = this.extractJwt(raw);
            if (jwt) return jwt;
          }
        }
        // Scan semua key, skip key milik Mentari mod agar tidak pakai cache lama
        for (let i = 0; i < localStorage.length; i++) {
          const k = localStorage.key(i);
          if (!k || k.startsWith("mentari_")) continue;
          const v = localStorage.getItem(k);
          if (
            v &&
            (k.toLowerCase().includes("token") ||
              k.toLowerCase().includes("access") ||
              v.includes("eyJ"))
          ) {
            const jwt = this.extractJwt(v);
            if (jwt) return jwt;
          }
        }
      } catch (e) {}
      return null;
    },
    decodeToken(token) {
      try {
        if (!token) return null;
        const parts = token.split(".");
        if (parts.length < 2) return null;
        const payload = JSON.parse(
          atob(parts[1].replace(/-/g, "+").replace(/_/g, "/")),
        );
        return {
          token,
          payload,
          userId: payload.id || payload.username,
          username: payload.username || payload.name,
          fullname: payload.fullname || payload.name,
          role: payload.role || "Student",
        };
      } catch (e) {
        return null;
      }
    },
    copy(text, msg) {
      navigator.clipboard.writeText(text).then(() => this.toast(msg));
    },
    toast(msg) {
      const t = document.createElement("div");
      t.style =
        "position:fixed;bottom:50px;left:50%;transform:translateX(-50%);background:#1a1a1a;color:#f0872d;padding:8px 16px;border-radius:50px;font-size:11px;z-index:100000;box-shadow:0 5px 15px rgba(0,0,0,0.5);border:1px solid rgba(240,135,45,0.2);animation:msgIn 0.3s;white-space:nowrap;";
      t.textContent = msg;
      document.body.appendChild(t);
      setTimeout(() => t.remove(), 2500);
    },
    progressToast(msg) {
      const id = "mentari-progress-toast";
      let t = document.getElementById(id);
      if (!t) {
        t = document.createElement("div");
        t.id = id;
        t.style =
          "position:fixed;bottom:50px;left:50%;transform:translateX(-50%);background:#1a1a1a;color:#f0872d;padding:9px 16px;border-radius:8px;font-size:11px;font-weight:600;z-index:100000;box-shadow:0 5px 15px rgba(0,0,0,0.5);border:1px solid rgba(240,135,45,0.3);animation:msgIn 0.3s;white-space:nowrap;";
        document.body.appendChild(t);
      }
      t.innerHTML = `<span class="ms" style="font-size:15px;vertical-align:middle;margin-right:6px;">sync</span>${msg}`;
    },
    closeProgressToast() {
      document.getElementById("mentari-progress-toast")?.remove();
    },
    successToast(msg) {
      const t = document.createElement("div");
      t.style =
        "position:fixed;bottom:50px;left:50%;transform:translateX(-50%);background:#153b2a;color:#8ee6b0;padding:10px 16px;border-radius:8px;font-size:12px;font-weight:600;z-index:100000;box-shadow:0 5px 18px rgba(0,0,0,0.5);border:1px solid rgba(142,230,176,0.35);animation:msgIn 0.3s;white-space:nowrap;";
      t.innerHTML = `<span class="ms" style="font-size:15px;vertical-align:middle;margin-right:5px;">check_circle</span>${msg}`;
      document.body.appendChild(t);
      setTimeout(() => t.remove(), 3000);
    },
    updateQuota(headers) {
      try {
        const quota = {
          rpm: {
            remaining: parseInt(headers.get("x-ratelimit-remaining-requests")),
            limit: parseInt(headers.get("x-ratelimit-limit-requests")),
          },
          tpm: {
            remaining: parseInt(headers.get("x-ratelimit-remaining-tokens")),
            limit: parseInt(headers.get("x-ratelimit-limit-tokens")),
          },
          updated: Date.now(),
        };
        if (!isNaN(quota.rpm.limit)) {
          this.save(Config.STORAGE_KEYS.GEMINI_QUOTA, quota);
          window.dispatchEvent(
            new CustomEvent("gemini-quota-updated", { detail: quota }),
          );
        }
      } catch (e) {}
    },
    formatNumber(num) {
      if (num >= 1000000) return (num / 1000000).toFixed(1) + "M";
      if (num >= 1000) return (num / 1000).toFixed(1) + "K";
      return num;
    },
    injectMaterialIcons() {
      if (document.getElementById("material-icons-css")) return;
      const link = document.createElement("link");
      link.id = "material-icons-css";
      link.rel = "stylesheet";
      link.href =
        "https://fonts.googleapis.com/css2?family=Material+Symbols+Rounded:opsz,wght,FILL,GRAD@20,400,0,0";
      document.head.appendChild(link);
    },
    parseMinutesToMs(val) {
      if (!val) return 0;
      const numStr = String(val).trim();
      const num = parseFloat(numStr);
      if (isNaN(num) || num <= 0) return 0;

      if (numStr.includes(".")) {
        const parts = numStr.split(".");
        const mins = parseInt(parts[0], 10) || 0;
        const secsStr = parts[1].padEnd(2, "0").slice(0, 2);
        const secs = parseInt(secsStr, 10) || 0;
        return (mins * 60 + secs) * 1000;
      } else {
        return Math.round(num * 60 * 1000);
      }
    },
    async countdownDelay(ms, onTick) {
      let remaining = Math.ceil(ms / 1000);
      while (remaining > 0) {
        const m = Math.floor(remaining / 60);
        const s = remaining % 60;
        const formatted = `${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
        if (onTick) onTick(formatted, remaining);
        await new Promise((r) => setTimeout(r, 1000));
        remaining--;
      }
    },
    applyTheme() {
      const container = document.getElementById("token-runner-popup");
      if (!container) return;
      const isLight = document.querySelector(".css-1yxmbwk") !== null;
      if (isLight) container.classList.add("light-theme");
      else container.classList.remove("light-theme");
    },
  };

  const ApiService = {
    async fetch(url, options = {}) {
      if (!State.authToken) throw new Error("No token");
      const headers = {
        ...options.headers,
        Authorization: `Bearer ${State.authToken}`,
        "Content-Type": "application/json",
      };
      const res = await fetch(url, { ...options, headers });
      if (!res.ok) {
        let message = `HTTP ${res.status}`;
        try {
          const errorBody = await res.json();
          message = errorBody.message || errorBody.error || message;
        } catch (error) {}
        throw new Error(`${res.status}: ${message}`);
      }
      return res.json();
    },
    async fetchCourses() {
      return this.fetch(`${Config.API.BASE_URL}/user-course?page=1&limit=50`);
    },
    async fetchCourseDetails(code) {
      return this.fetch(`${Config.API.BASE_URL}/user-course/${code}`);
    },
    getGeminiApiKey() {
      const rawKey = localStorage.getItem("geminiApiKey");
      if (!rawKey) throw new Error("API Key Gemini belum diset");
      try {
        return atob(rawKey);
      } catch (error) {
        return rawKey;
      }
    },
    async startQuiz(quizId) {
      return this.fetch(`${Config.API.BASE_URL}/quiz/start/${quizId}`, {
        method: "PUT",
        body: JSON.stringify({
          id_trx_course_sub_section: quizId,
          reset: true,
        }),
      });
    },
    async fetchQuizQuestions(quizId) {
      return this.fetch(`${Config.API.BASE_URL}/quiz/soal/${quizId}`, {
        method: "GET",
        cache: "no-store",
      });
    },
    async fetchQuizParticipant(quizId) {
      return this.fetch(`${Config.API.BASE_URL}/quiz/peserta/${quizId}`, {
        method: "GET",
        cache: "no-store",
      });
    },
    async submitQuizAnswer(answer) {
      return this.fetch(`${Config.API.BASE_URL}/quiz/jawab`, {
        method: "PUT",
        body: JSON.stringify(answer),
      });
    },
    async endQuiz(quizId) {
      return this.fetch(`${Config.API.BASE_URL}/quiz/end`, {
        method: "PUT",
        body: JSON.stringify({
          id_trx_course_sub_section: quizId,
        }),
      });
    },
    async askGeminiQuiz(apiKey, questions) {
      const model = (
        localStorage.getItem("gemini_model") || "gemini-2.5-flash-lite"
      ).replace(/"/g, "");
      const questionText = questions
        .map((question, index) => {
          const isEssay = question.jenis_soal?.toUpperCase() === "ESSAY";
          const options = (question.list_jawaban || [])
            .map(
              (option, optionIndex) => `${optionIndex + 1}. ${option.jawaban}`,
            )
            .join("\n");
          return isEssay
            ? `SOAL ${index + 1} (ESSAY)\nID: ${question.id}\n${question.deskripsi}\nJawab dengan uraian akademik yang langsung menjawab pertanyaan.`
            : `SOAL ${index + 1} (PILIHAN GANDA)\nID: ${question.id}\n${question.deskripsi}\n${options}`;
        })
        .join("\n\n");
      const prompt = `Kamu adalah AI akademik yang menjawab soal secara langsung dan efisien.
    Aturan wajib:
    - Jawab hanya isi soal yang ditanyakan.
    - Jangan menulis salam, sapaan, pembuka, penutup, basa-basi, atau kalimat tambahan yang tidak diperlukan.
    - Jangan menyapa user dan jangan saling bercakap-cakap.
    - Jangan menulis penjelasan di luar jawaban yang diminta.
    - Balas HANYA JSON array valid tanpa markdown dengan format:
[{"question_id":"ID_SOAL","answer_index":1,"answer_text":"Jawaban essay"}]
Untuk PILIHAN GANDA, isi answer_index sesuai urutan pilihan dan jangan isi answer_text.
Untuk ESSAY, isi answer_text dengan jawaban teks lengkap dan jangan isi answer_index.

${questionText}`;
      const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            contents: [{ parts: [{ text: prompt }] }],
            generationConfig: {
              temperature: 0.1,
              maxOutputTokens: 4096,
              responseMimeType: "application/json",
            },
          }),
        },
      );
      if (!response.ok) throw new Error(`Gemini API ${response.status}`);
      const result = await response.json();
      const text = result.candidates?.[0]?.content?.parts?.[0]?.text || "";
      const cleaned = text
        .replace(/^```(?:json)?\s*/i, "")
        .replace(/\s*```$/i, "")
        .trim();
      const candidates = [cleaned];
      const arrayStart = cleaned.indexOf("[");
      const arrayEnd = cleaned.lastIndexOf("]");
      if (arrayStart >= 0 && arrayEnd > arrayStart)
        candidates.push(cleaned.slice(arrayStart, arrayEnd + 1));
      const objectStart = cleaned.indexOf("{");
      const objectEnd = cleaned.lastIndexOf("}");
      if (objectStart >= 0 && objectEnd > objectStart)
        candidates.push(cleaned.slice(objectStart, objectEnd + 1));

      for (const candidate of candidates) {
        try {
          const parsed = JSON.parse(candidate);
          if (Array.isArray(parsed)) return parsed;
          if (Array.isArray(parsed.answers)) return parsed.answers;
          if (Array.isArray(parsed.results)) return parsed.results;
        } catch (error) {}
      }

      console.error("[Mentari] Respons mentah AI quiz bukan JSON", text);
      throw new Error("Respons AI bukan JSON");
    },
    async fetchForumTopics(id) {
      return this.fetch(`${Config.API.BASE_URL}/forum/topic/${id}`);
    },
    async fetchForumReplies(id) {
      return this.fetch(`${Config.API.BASE_URL}/forum/reply/${id}`);
    },
    async submitForumReply(payload) {
      return this.fetch(`${Config.API.BASE_URL}/forum/reply`, {
        method: "POST",
        body: JSON.stringify(payload),
      });
    },
    async fetchKuesioner(courseCode, sectionCode) {
      return this.fetch(
        `${Config.API.BASE_URL}/kuesioner/${courseCode}/${sectionCode}`,
      );
    },
    async submitKuesioner(courseCode, sectionCode, questions) {
      return this.fetch(`${Config.API.BASE_URL}/kuesioner/submit`, {
        method: "POST",
        body: JSON.stringify({
          kode_section: sectionCode,
          kode_course: courseCode,
          kuesioner: questions.map((question) => ({
            id_kuesioner: question.id,
            jawaban: 1,
          })),
        }),
      });
    },
    async checkUpdate() {
      try {
        const r = await fetch(Config.API.GITHUB_API);
        return r.ok ? await r.json() : null;
      } catch (e) {
        return null;
      }
    },
    async fetchGeminiModels(apiKey) {
      try {
        const r = await fetch(
          `https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`,
        );
        if (!r.ok) return null;
        return r.json();
      } catch (e) {
        return null;
      }
    },
  };

  const UIRenderer = {
    injectStyles() {
      if (document.getElementById("mentari-styles")) return;
      const s = document.createElement("style");
      s.id = "mentari-styles";
      s.textContent = Config.STYLES;
      document.head.appendChild(s);
    },
    createPopup() {
      if (document.getElementById("token-runner-popup")) return;
      const p = document.createElement("div");
      p.id = "token-runner-popup";
      p.innerHTML = `
        <div class="token-loading-bar"></div>
        <div class="popup-content">
          <div class="popup-header">
            <div class="header-top">
              <div style="display:flex; flex-direction:column;">
                <span class="popup-title">MENTARI MOD</span>
                <span class="popup-subtitle">mod by <a style="color: #c8ad95ff; text-decoration: none;" href="https://github.com/Lukman754">Lukman754</a></span>
              </div>
              <button id="token-refresh-btn" class="token-button" title="Refresh status" style="padding:6px 10px; border-radius:8px;"><span class="ms">refresh</span></button>
            </div>
            <div class="token-tabs">
              <button class="token-tab active" data-tab="forum-tab" title="Forum"><span class="ms">forum</span><span id="forum-tab-badge" class="token-tab-badge"></span></button>
              <button class="token-tab" data-tab="mhs-tab" title="Mahasiswa"><span class="ms">groups</span></button>
              <button class="token-tab" data-tab="set-tab" title="Pengaturan"><span class="ms">settings</span></button>
            </div>
          </div>
          <div class="token-tab-content active" id="forum-tab-tab"></div>
          <div class="token-tab-content" id="mhs-tab-tab"></div>
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
      tabs.forEach((t) => {
        t.onclick = (e) => {
          e.stopPropagation();
          document
            .querySelectorAll(".token-tab, .token-tab-content")
            .forEach((el) => el.classList.remove("active"));
          t.classList.add("active");
          document
            .getElementById(t.dataset.tab + "-tab")
            .classList.add("active");
        };
      });
    },
    setLoading(active) {
      const bar = document.querySelector(".token-loading-bar");
      if (bar)
        active ? bar.classList.add("active") : bar.classList.remove("active");
    },
    updatePosition() {
      // Disabled for fixed position consistency across mod windows
    },
  };

  const ForumRenderer = {
    render(data) {
      const el = document.getElementById("forum-tab-tab");
      if (!el) return;

      let html = `
        <div style="margin-bottom:14px;">
          <a href="https://my.unpam.ac.id/presensi/" target="_blank" style="
            display:flex; align-items:center; gap:12px;
            padding:12px 14px;
            background: rgba(0, 165, 80, 0.08);
            border: 1px solid rgba(0, 165, 80, 0.2);
            border-radius:10px;
            text-decoration:none;
            transition: background 0.2s, border-color 0.2s;
          " onmouseover="this.style.background='rgba(0,165,80,0.14)'; this.style.borderColor='rgba(0,165,80,0.35)'"
             onmouseout="this.style.background='rgba(0,165,80,0.08)'; this.style.borderColor='rgba(0,165,80,0.2)'">
            <div style="width:36px; height:36px; flex-shrink:0; background:rgba(0,165,80,0.15); border-radius:8px; display:flex; align-items:center; justify-content:center; color:#00a550;">
              <span class="ms" style="font-size:20px;">fact_check</span>
            </div>
            <div style="flex:1; min-width:0;">
              <div style="font-size:12px; font-weight:700; color:#00a550; margin-bottom:2px;">Halaman Presensi Mahasiswa</div>
              <div style="font-size:10px; color:#00a550; opacity:0.65; display:flex; align-items:center; gap:4px;">
                <span class="ms" style="font-size:11px;">link</span> my.unpam.ac.id/presensi
              </div>
            </div>
            <span class="ms" style="font-size:16px; color:#00a550; opacity:0.5; flex-shrink:0;">open_in_new</span>
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
          const days = [
            "Minggu",
            "Senin",
            "Selasa",
            "Rabu",
            "Kamis",
            "Jumat",
            "Sabtu",
          ];
          const getDay = (name) => {
            const m = name.match(/\(([^)]+)\)/);
            return m ? days.indexOf(m[1]) : 7;
          };
          return getDay(a.coursename) - getDay(b.coursename);
        });

        const coursesHtml = sortedData
          .map((course) => this.renderCourse(course))
          .join("");

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
      this.updateForumBadge();
    },

    updateForumBadge() {
      const badge = document.getElementById("forum-tab-badge");
      const forum = document.getElementById("forum-tab-tab");
      if (!badge || !forum) return;

      const incompleteMeetings = Array.from(
        forum.querySelectorAll(".section-card"),
      ).filter((section) => section.querySelector(".status-todo"));

      const count = incompleteMeetings.length;
      badge.textContent = count ? String(count) : "";
      badge.style.display = count ? "inline-flex" : "none";
    },

    renderCourse(c) {
      const allSections = c.data || [];
      let lastCompletedSort = 0;
      let maxSort = 0;

      allSections.forEach((s, idx) => {
        const sortVal = typeof s.sort === "number" ? s.sort : idx + 1;
        if (sortVal > maxSort) maxSort = sortVal;

        const hasCompletedKuisioner = (s.sub_section || []).some(
          (i) =>
            (i.kode_template === "KUESIONER" || i.tipe === "QUESIONER") &&
            i.completion === true,
        );
        if (hasCompletedKuisioner && sortVal > lastCompletedSort) {
          lastCompletedSort = sortVal;
        }
      });

      const totalSorts = maxSort || allSections.length || 0;
      const progressPercent =
        totalSorts > 0 ? Math.round((lastCompletedSort / totalSorts) * 100) : 0;

      const sections = allSections.filter((s) => {
        if (!s.sub_section) return false;
        const forum = s.sub_section.find(
          (i) => i.kode_template === "FORUM_DISKUSI" && i.id,
        );
        const kuesioner = s.sub_section.find(
          (i) => i.kode_template === "KUESIONER" || i.tipe === "QUESIONER",
        );
        if (!forum && !kuesioner) return false;
        if (kuesioner?.completion === true) return false;
        if (forum?.warningAlert?.includes("Soal forum diskusi belum tersedia"))
          return false;
        const postTest = s.sub_section.find(
          (i) => i.kode_template === "POST_TEST",
        );
        if (
          forum &&
          forum.completion === true &&
          !kuesioner &&
          (!postTest || postTest.completion === true || !postTest.id)
        )
          return false;
        return true;
      });

      // Parse coursename details (e.g. "[2] STATISTIK NON PARAMETRIK # 05MATP002 (Senin) [P-1]")
      const rawName = c.coursename || "";
      const sksMatch = rawName.match(/^\[(\d+)\]/);
      const sks = sksMatch ? sksMatch[1] : null;

      const hariMatch = rawName.match(/\(([^)]+)\)/);
      const hari = hariMatch ? hariMatch[1] : null;

      const kelasMatch = rawName.match(/#\s*([^\s(]+)/);
      const kelas = kelasMatch ? kelasMatch[1] : null;

      let courseTitle = rawName
        .split("#")[0]
        .replace(/^\[\d+\]\s*/, "")
        .replace(/\([^)]+\)/g, "")
        .replace(/\[[^\]]+\]/g, "")
        .trim();

      if (!courseTitle) courseTitle = rawName;

      const validSectionsHtml = sections
        .map((s, idx) => this.renderSection(s, c, idx))
        .filter((html) => html && html.trim() !== "")
        .join("");

      if (!validSectionsHtml.trim()) return "";

      return `
        <div class="course-card" style="margin-bottom: 14px;">
          <div class="course-card-header" style="padding: 12px 14px; display: flex; flex-direction: column; gap: 8px;">
            <div style="display: flex; flex-direction: row; justify-content: space-between; align-items: flex-start; gap: 10px; width: 100%;">
              <div style="flex: 1; display: flex; flex-direction: column; gap: 4px;">
                <p class="course-title" style="margin: 0; font-weight: 700; font-size: 0.95rem; line-height: 1.35;">${courseTitle}</p>
                <div style="display: flex; flex-direction: row; align-items: center; gap: 6px; flex-wrap: wrap;">
                  ${sks ? `<span class="course-chip course-chip-sks" style="display: inline-flex; align-items: center; gap: 4px; padding: 2px 7px; border-radius: 6px; font-size: 0.7rem; font-weight: 400;"><span class="ms" style="font-size:11px;">auto_stories</span> ${sks} SKS</span>` : ""}
                  ${hari ? `<span class="course-chip course-chip-day" style="display: inline-flex; align-items: center; gap: 4px; padding: 2px 7px; border-radius: 6px; font-size: 0.7rem; font-weight: 400;"><span class="ms" style="font-size:11px;">calendar_month</span> ${hari}</span>` : ""}
                  ${kelas ? `<span class="course-chip course-chip-class" style="display: inline-flex; align-items: center; gap: 4px; padding: 2px 7px; border-radius: 6px; font-size: 0.7rem; font-weight: 400;"><span class="ms" style="font-size:11px;">school</span> Kelas ${kelas}</span>` : ""}
                </div>
                <span class="course-code" style="opacity: 0.5; font-size: 0.68rem; margin-top: 1px;">Kode Course: ${c.kode_course}</span>
              </div>
              <div style="display: flex; flex-direction: column; align-items: flex-end; gap: 2px; flex-shrink: 0;">
                <span class="course-progress-value" style="font-size: 0.9rem; font-weight: 800; font-family: monospace;">${progressPercent}%</span>
                <span class="course-progress-label" style="font-size: 0.68rem; opacity: 0.6;">Pertemuan ${lastCompletedSort} / ${totalSorts}</span>
              </div>
            </div>
            <div style="width: 100%; display: flex; flex-direction: column; gap: 4px;">
              <div class="course-progress-track">
                <div class="course-progress-bar" style="width: ${progressPercent}%;"></div>
              </div>
            </div>
          </div>
          <div class="course-card-body" style="padding: 10px; padding-bottom: 0px; border-top: 1px solid rgba(255,255,255,0.05); width: 100%; box-sizing: border-box;">
            ${validSectionsHtml}
          </div>
        </div>
      `;
    },

    renderSection(s, c, idx) {
      const itemsHtml = (s.sub_section || [])
        .map((item) => this.renderItem(item, s, c))
        .filter((html) => html && html.trim() !== "")
        .join("");

      if (!itemsHtml.trim()) return "";

      const sectionId = `sect-${c.kode_course}-${idx}`;
      const sectionUrl = `https://mentari.unpam.ac.id/u-courses/${c.kode_course}?accord_pertemuan=${s.kode_section}`;
      return `
        <div class="section-card">
          <div class="section-header" data-target="${sectionId}">
            <div class="section-header-left">
              <div class="section-header-icon"><span class="ms">import_contacts</span></div>
              <h3>${s.nama_section}</h3>
            </div>
            <div style="display: flex; align-items: center; gap: 8px;">
              <span class="section-toggle"><span class="ms">expand_more</span></span>
            </div>
          </div>
          <div class="section-content" id="${sectionId}">
            <a href="${sectionUrl}" class="item-row" style="background: rgba(240,135,45,0.06); border-color: rgba(240,135,45,0.2);" onclick="event.stopPropagation()">
              <div class="item-icon" style="background: rgba(240,135,45,0.15); color: #f0872d;">
                <span class="ms">folder_open</span>
              </div>
              <div class="item-info">
                <span class="item-title" style="color: #f0872d;">Buka Pertemuan</span>
                <div class="item-meta"><span>Buka langsung di Mentari UNPAM</span></div>
              </div>
              <span class="ms" style="opacity:0.6; font-size:14px; flex-shrink:0; color:#f0872d;">chevron_right</span>
            </a>
            ${itemsHtml}
          </div>
        </div>
      `;
    },

    renderItem(i, s, c) {
      const isQuiz = ["PRE_TEST", "POST_TEST"].includes(i.kode_template);
      const isForum = i.kode_template === "FORUM_DISKUSI";
      const isMaterial = [
        "BUKU_ISBN",
        "VIDEO_AJAR",
        "POWER_POINT",
        "ARTIKEL_RISET",
        "MATERI_LAINNYA",
      ].includes(i.kode_template);
      const isKuesioner =
        i.kode_template === "KUESIONER" || i.tipe === "QUESIONER";
      const isTugas = i.kode_template === "PENUGASAN_TERSTRUKTUR";

      if (isMaterial && !i.link && !i.file) return "";
      if (isTugas && !i.link && !i.file) return ""; // Sembunyikan tugas kosong
      if (!isQuiz && !isForum && !isMaterial && !isKuesioner && !isTugas)
        return "";

      // cardUrl: klik seluruh card -> halaman "overview" item
      // actionUrl: klik tombol aksi -> halaman spesifik / langsung action
      let cardUrl = "#";
      let actionUrl = "#";
      let iconClass = "icon-material";
      let icon = "fa-file";
      let actionLabel = "Buka";
      let actionIcon = "fa-up-right-from-square";

      if (isQuiz) {
        cardUrl = i.id
          ? `https://mentari.unpam.ac.id/u-courses/${c.kode_course}/quiz/${i.id}`
          : "#";
        actionUrl = i.id
          ? `https://mentari.unpam.ac.id/u-courses/${c.kode_course}/exam/${i.id}`
          : "#";
        iconClass = "icon-quiz";
        icon = "checklist";
        actionLabel = "Mulai Quiz";
        actionIcon = "play_arrow";
      } else if (isForum) {
        cardUrl = i.id
          ? `https://mentari.unpam.ac.id/u-courses/${c.kode_course}/forum/${i.id}`
          : "#";
        actionUrl = cardUrl;
        iconClass = "icon-forum";
        icon = "forum";
        actionLabel = "Buka Forum";
        actionIcon = "open_in_new";
      } else if (isMaterial) {
        // Card -> halaman kursus, Action -> link/download langsung
        cardUrl = `https://mentari.unpam.ac.id/u-courses/${c.kode_course}`;
        if (i.link) {
          actionUrl = i.link;
          actionLabel = "Buka Link";
          actionIcon = "open_in_new";
        } else if (i.file) {
          actionUrl = `https://mentari.unpam.ac.id/api/file/${i.file}`;
          actionLabel = "Download";
          actionIcon = "download";
        }
        icon = this.getMaterialIcon(i.kode_template);
      } else if (isKuesioner) {
        actionUrl = "#";
        iconClass = "icon-quiz";
        icon = "bar_chart";
        actionLabel = "Isi Kuesioner";
        actionIcon = "play_arrow";
      } else if (isTugas) {
        iconClass = "icon-material";
        icon = "assignment";
        actionLabel = "Lihat Tugas";
      }

      const statusClass = i.completion ? "status-done" : "status-todo";
      const statusText = i.completion ? "Selesai" : "Belum";
      const isFinished = i.completion === true;

      const btnIcon = isFinished ? "lock" : actionIcon;
      const btnTitle = isFinished ? "Sudah Selesai" : actionLabel;
      const btnStyle = isFinished
        ? "width:28px; height:28px; padding:0; background:rgba(255,255,255,0.08); color:rgba(255,255,255,0.3); border-radius:6px; cursor:not-allowed;"
        : `width:28px; height:28px; padding:0; background: ${actionLabel === "Download" ? "#79bb7c" : actionLabel === "Mulai Quiz" || isQuiz || isKuesioner ? "#e05c2a" : "#f0872d"}; border-radius:6px;`;

      // Konten forum (HTML) untuk accordion
      const forumKonten = isForum && i.konten ? i.konten.trim() : "";
      const forumKontenId = `fk-${i.id}`;

      return `
           <div class="item-row ${i.completion ? "completed-item" : ""}" 
             onclick="if(event.target.closest('a,button,input,select,textarea,form')) return; window.location.href='${cardUrl}';"
             style="flex-direction:column; align-items:stretch; padding:0; overflow:hidden; ${i.completion ? "opacity:0.8;" : "background: rgba(130, 130, 130, 0.13);"}" data-name="${i.judul}">
          <div style="display:flex; align-items:center; gap:10px; padding:10px;">
            <div class="item-icon ${iconClass}"><span class="ms">${icon}</span></div>
            <div class="item-info">
              <span class="item-title" style="${i.completion ? "text-decoration: line-through; opacity: 0.6;" : ""}">${i.judul}</span>
              <div class="item-meta">
                <span class="item-status ${statusClass}"><span class="ms" style="font-size:10px;">${i.completion ? "check_circle" : "schedule"}</span> ${statusText}</span>
                ${i.setting_quiz?.duration ? `<span style="opacity:0.7;"><span class="ms">hourglass_top</span> ${i.setting_quiz.duration} min</span>` : ""}
                ${isQuiz ? `<span class="quiz-participant-status" data-quiz-id="${i.id}" style="opacity:0.7;">Memuat hasil...</span>` : ""}
              </div>
            </div>
            <div style="display:flex; gap:6px; flex-shrink:0;">
              ${
                forumKonten
                  ? `
                <button class="token-button" title="Lihat Konten Forum" onclick="event.stopPropagation(); const el=document.getElementById('${forumKontenId}'); el.style.display=el.style.display==='none'?'block':'none';" style="height:26px; padding:0 8px; background: #3d99e3; color: #000; border-radius:6px; font-size:11px; display:inline-flex; align-items:center; gap:4px;">
                  <span class="ms" style="font-size:14px;">menu_book</span> Konten
                </button>`
                  : ""
              }
              ${
                isForum && i.id
                  ? `<button type="button" class="token-button forum-reply-btn" title="Balas Forum" data-forum-id="${i.id}" onclick="event.stopPropagation();" style="height:26px; padding:0 10px; background:#79bb7c; color: black; border-radius:6px; font-size:11px; font-weight:600; display:inline-flex; align-items:center; gap:4px;"><span class="ms" style="font-size:13px;">reply</span> Balas</button>`
                  : ""
              }
              ${
                isQuiz || isKuesioner
                  ? `<button type="button" class="token-button ${isQuiz ? "quiz-ai-submit-btn" : "kuesioner-submit-btn"}" title="${btnTitle}" ${isFinished ? 'disabled="disabled"' : ""} data-course-code="${c.kode_course}" data-section-code="${s.kode_section}" data-quiz-id="${isQuiz ? i.id : ""}" data-quiz-title="${isQuiz ? i.judul : ""}" onclick="event.stopPropagation();" style="${btnStyle}"><span class="ms" style="font-size:15px;">${btnIcon}</span></button>`
                  : actionUrl !== "#"
                    ? `<a href="${isFinished ? "#" : actionUrl}" class="token-button" title="${btnTitle}" ${isFinished ? 'onclick="event.preventDefault(); event.stopPropagation();"' : 'onclick="event.stopPropagation();"'} style="${btnStyle}"><span class="ms" style="font-size:15px;">${btnIcon}</span></a>`
                    : ""
              }
            </div>
          </div>
          ${
            forumKonten
              ? `
            <div id="${forumKontenId}" class="forum-html-preview" style="display:none; padding:10px; border-top:1px solid rgba(255,255,255,0.05); color:rgba(255,255,255,0.7); background:rgba(0,0,0,0.6);">
              ${forumKonten}
            </div>`
              : ""
          }
          ${
            isForum && i.id
              ? `
            <div style="display:flex; justify-content:flex-end; padding:4px 10px 0 10px;">
              <span class="forum-reply-count" data-forum-id="${i.id}" style="font-size:11px; opacity:0.8; font-weight:600; color:#f0872d; display:inline-flex; align-items:center; gap:3px;"><span class="ms" style="font-size:12px;">reply</span> Reply Kamu: -</span>
            </div>
            <div class="topics-container" data-forum-id="${i.id}" data-course-code="${c.kode_course}" style="padding:0 8px 8px;"></div>`
              : ""
          }
        </div>
      `;
    },

    getMaterialIcon(type) {
      const map = {
        BUKU_ISBN: "book",
        VIDEO_AJAR: "play_circle",
        POWER_POINT: "slideshow",
        ARTIKEL_RISET: "article",
        MATERI_LAINNYA: "folder_open",
      };
      return map[type] || "description";
    },

    initInteractions(data) {
      document.querySelectorAll(".section-header").forEach((header) => {
        header.onclick = (e) => {
          e.stopPropagation();
          const target = document.getElementById(header.dataset.target);
          const toggle = header.querySelector(".section-toggle");
          if (target) {
            const isVisible = target.classList.contains("active");
            if (isVisible) {
              target.classList.remove("active");
              toggle.classList.remove("active");
            } else {
              document
                .querySelectorAll(".section-content.active")
                .forEach((openSection) => {
                  openSection.classList.remove("active");
                  openSection
                    .closest(".section-card")
                    ?.querySelector(".section-toggle")
                    ?.classList.remove("active");
                });
              target.classList.add("active");
              toggle.classList.add("active");
            }
          }
        };
      });

      document.querySelectorAll(".forum-reply-btn").forEach((button) => {
        button.onclick = (e) => {
          e.stopPropagation();
          const container = document.querySelector(
            `.topics-container[data-forum-id="${button.dataset.forumId}"]`,
          );
          if (container) this.toggleForumReplyForm(container);
        };
      });

      document.querySelectorAll(".kuesioner-submit-btn").forEach((button) => {
        button.onclick = async (e) => {
          e.stopPropagation();
          if (button.disabled) return;

          const courseCode = button.dataset.courseCode;
          const sectionCode = button.dataset.sectionCode;
          const originalContent = button.innerHTML;
          button.disabled = true;
          button.innerHTML = `<span class="ms mentari-spin" style="font-size:16px;">sync</span>`;

          try {
            Utils.progressToast("Sedang mengambil pertanyaan kuisioner...");
            const detail = await ApiService.fetchKuesioner(
              courseCode,
              sectionCode,
            );
            const questions = detail?.kuesioner || [];
            if (!questions.length)
              throw new Error("Pertanyaan kuisioner kosong");

            Utils.progressToast("Sedang mengirim jawaban kuisioner...");
            await ApiService.submitKuesioner(
              courseCode,
              sectionCode,
              questions,
            );
            Utils.closeProgressToast();
            Utils.successToast("Kuisioner berhasil dikirim");
            setTimeout(() => App.refreshData(true), 700);
          } catch (error) {
            console.error("[Mentari] Gagal submit kuisioner", {
              kode_course: courseCode,
              kode_section: sectionCode,
              error,
            });
            Utils.closeProgressToast();
            Utils.toast("Kuisioner gagal dikirim");
            button.disabled = false;
            button.innerHTML = originalContent;
          }
        };
      });

      document.querySelectorAll(".quiz-ai-submit-btn").forEach((button) => {
        button.onclick = async (e) => {
          e.stopPropagation();
          if (button.disabled) return;

          const quizId = button.dataset.quizId;
          const quizTitle = button.dataset.quizTitle;
          const originalContent = button.innerHTML;
          button.disabled = true;
          button.innerHTML = `<span class="ms mentari-spin" style="font-size:16px;">sync</span>`;

          try {
            Utils.progressToast("Sedang memulai quiz...");
            await ApiService.startQuiz(quizId);
            Utils.progressToast("Sedang mencari soal quiz...");
            const questions =
              (await ApiService.fetchQuizQuestions(quizId))?.data || [];
            if (!questions.length) throw new Error("Soal quiz kosong");

            Utils.progressToast("AI sedang menjawab quiz...");
            const answers = await ApiService.askGeminiQuiz(
              ApiService.getGeminiApiKey(),
              questions,
            );
            const answersByQuestion = new Map(
              answers.map((answer) => [answer.question_id, answer]),
            );

            for (const question of questions) {
              const aiAnswer = answersByQuestion.get(question.id);
              const isEssay = question.jenis_soal?.toUpperCase() === "ESSAY";
              let payload;

              if (isEssay) {
                const answerText = String(aiAnswer?.answer_text || "").trim();
                if (!answerText)
                  throw new Error(
                    `Jawaban essay AI kosong untuk ${question.id}`,
                  );
                payload = {
                  id_trx_quiz_user_soal: question.id,
                  id_jawaban: null,
                  jawaban: answerText,
                };
              } else {
                const answerIndex = aiAnswer?.answer_index;
                const selectedAnswer =
                  question.list_jawaban?.[Number(answerIndex) - 1];
                if (!selectedAnswer?.id)
                  throw new Error(
                    `Jawaban AI tidak valid untuk ${question.id}`,
                  );
                payload = {
                  id_trx_quiz_user_soal: question.id,
                  id_jawaban: selectedAnswer.id,
                  jawaban: null,
                };
              }

              Utils.progressToast("Sedang mengirim jawaban quiz...");
              await ApiService.submitQuizAnswer(payload);
            }

            const quizDelaySetting =
              Utils.get(Config.STORAGE_KEYS.QUIZ_DELAY) || "0";
            const delayMs = Utils.parseMinutesToMs(quizDelaySetting);
            if (delayMs > 0) {
              await Utils.countdownDelay(delayMs, (formattedTime) => {
                Utils.progressToast(
                  `Menunggu ${formattedTime} sebelum menyelesaikan quiz...`,
                );
              });
            }

            Utils.progressToast("Sedang menyelesaikan quiz...");
            await ApiService.endQuiz(quizId);
            Utils.closeProgressToast();
            Utils.successToast("Jawaban quiz berhasil diisi AI & diselesaikan");
            setTimeout(() => App.refreshData(true), 700);
          } catch (error) {
            console.error("[Mentari] Gagal mengisi quiz dengan AI", {
              quizId,
              quizTitle,
              error,
            });
            Utils.closeProgressToast();
            Utils.toast(`AI quiz gagal: ${error.message}`);
          } finally {
            button.disabled = false;
            button.innerHTML = originalContent;
          }
        };
      });

      this.loadKuesioner(data);
      this.loadQuizParticipants();
      this.loadTopics();
    },

    loadQuizParticipants() {
      document
        .querySelectorAll(".quiz-participant-status[data-quiz-id]")
        .forEach(async (statusEl) => {
          try {
            const result = await ApiService.fetchQuizParticipant(
              statusEl.dataset.quizId,
            );
            const quiz = result?.quiz;
            if (!quiz) {
              statusEl.textContent = "Belum dikerjakan";
              return;
            }

            const endInSecond = quiz.end_in_second ?? null;
            const grade = quiz.grade ?? "-";
            const timeDisplay =
              endInSecond !== null
                ? (() => {
                    const totalSec = Number(endInSecond);
                    const m = Math.floor(totalSec / 60);
                    const s = totalSec % 60;
                    return s > 0 ? `${m}m ${s}s` : `${m} menit`;
                  })()
                : "-";
            statusEl.innerHTML = `<span class="ms" style="font-size:12px;">timer</span> ${timeDisplay} <span style="margin-left:4px;">Nilai: ${grade}</span>`;
          } catch (error) {
            statusEl.textContent = "Status tidak tersedia";
          }
        });
    },

    loadKuesioner(data) {
      data.forEach((course) => {
        (course.data || []).forEach((section) => {
          const hasKuesioner = (section.sub_section || []).some(
            (item) =>
              item.kode_template === "KUESIONER" || item.tipe === "QUESIONER",
          );
          if (!hasKuesioner || !course.kode_course || !section.kode_section)
            return;

          ApiService.fetchKuesioner(course.kode_course, section.kode_section)
            .then((result) => {
              console.log("[Mentari] Isi kuisioner", {
                kode_course: course.kode_course,
                kode_section: section.kode_section,
                kuesioner: result?.kuesioner || [],
                response: result,
              });
            })
            .catch((error) => {
              console.error("[Mentari] Gagal mengambil kuisioner", {
                kode_course: course.kode_course,
                kode_section: section.kode_section,
                error,
              });
            });
        });
      });
    },

    loadTopics() {
      document
        .querySelectorAll(".topics-container")
        .forEach(async (container) => {
          const id = container.dataset.forumId;
          const courseCode = container.dataset.courseCode;
          // Guard: skip if id is missing or null
          if (!id || id === "null" || id === "undefined") return;
          container.onclick = (event) => event.stopPropagation();
          try {
            const res = await ApiService.fetchForumTopics(id);
            const topics =
              res.topics?.filter((t) => t.id_trx_course_sub_section === id) ||
              [];
            if (topics.length) {
              container.innerHTML = "";
              await this.loadForumReplies(container, topics);
            }
          } catch (e) {}
        });
    },

    async loadForumReplies(container, topics) {
      const currentNim = String(
        State.userInfo?.username || State.userInfo?.userId || "",
      ).trim();
      if (!currentNim) return;
      const courseCode = container.dataset.courseCode;
      const sectionId = container.dataset.forumId;

      const replyGroups = await Promise.all(
        topics.map(async (topic) => {
          try {
            const result = await ApiService.fetchForumReplies(topic.id);
            const root = result?.id === topic.id ? result : null;
            const replies = root?.data || result?.data || [];
            const studentReplies = replies.filter((reply) => {
              const nim = String(
                reply.nim || reply.mahasiswa?.nim || "",
              ).trim();
              return (
                Number(reply.reply_level) > 0 &&
                reply.id_dosen == null &&
                Boolean(nim)
              );
            });
            const ownLevelOne = replies.filter(
              (reply) =>
                Number(reply.reply_level) === 1 &&
                String(reply.nim || reply.mahasiswa?.nim || "").trim() ===
                  currentNim,
            );
            const ownLevelOneIds = new Set(
              ownLevelOne.map((reply) => reply.id),
            );
            const ownLevelTwo = replies.filter(
              (reply) =>
                Number(reply.reply_level) === 2 &&
                ownLevelOneIds.has(reply.id_parent),
            );

            return {
              topic,
              root,
              studentReplyCount: studentReplies.length,
              ownReplies: [...ownLevelOne, ...ownLevelTwo],
            };
          } catch (error) {
            return null;
          }
        }),
      );

      const visibleGroups = replyGroups.filter(Boolean);
      container._forumReplyTargets = visibleGroups.map(
        ({ topic, root, ownReplies }) => ({
          id: topic.id,
          topicId: topic.id,
          judul: `RE ${root?.judul || topic.judul || "Forum Diskusi"}`,
          label: `Topik: ${root?.judul || topic.judul || "Forum Diskusi"}`,
          own: false,
          replies: ownReplies.map((reply) => ({
            ...reply,
            topicId: topic.id,
          })),
        }),
      );
      const totalReplies = visibleGroups.reduce(
        (total, group) => total + group.ownReplies.length,
        0,
      );

      const countEl = container
        .closest(".item-row")
        ?.querySelector(`.forum-reply-count[data-forum-id="${sectionId}"]`);
      if (countEl)
        countEl.innerHTML = `<span class="ms" style="font-size:12px;">reply</span> Reply Kamu: ${totalReplies}`;

      visibleGroups.forEach(
        ({ topic, root, ownReplies, studentReplyCount }) => {
          const topicEl = document.createElement("div");
          topicEl.style.cssText =
            "margin-top:8px; padding:10px 12px; border:1px solid rgba(61,153,227,0.15); border-radius:8px; font-size:11px; line-height:1.5;";

          const title = document.createElement("a");
          title.href = `https://mentari.unpam.ac.id/u-courses/${courseCode}/forum/${sectionId}/topics/${topic.id}`;
          title.className = "topic-badge";
          title.style.cssText =
            "font-weight:700; color:#3d99e3; display:flex; align-items:center; gap:6px;";
          title.innerHTML = `<span class="ms" style="font-size:14px; flex-shrink:0;">chat</span><span style="flex:1; min-width:0;">${topic.judul || "Forum Diskusi"}</span><span class="item-status status-done" style="flex-shrink:0;"><span class="ms" style="font-size:10px;">reply</span> ${studentReplyCount}</span>`;
          title.onclick = (event) => event.stopPropagation();
          topicEl.appendChild(title);

          const rootContent = document.createElement("div");
          rootContent.style.cssText =
            "margin-top:6px; opacity:0.85; padding:4px 0;";
          rootContent.innerHTML = this.sanitizeForumHtml(
            root?.konten || topic.konten || "",
          );
          topicEl.appendChild(rootContent);
          this.appendForumFiles(topicEl, root?.files || topic.files);

          ownReplies.forEach((reply) => {
            const replyEl = document.createElement("div");
            replyEl.style.cssText =
              "margin-top:6px; padding:8px 10px; border-radius:6px; background:rgba(240,135,45,0.08); border-left:3px solid #f0872d; font-size:11px;";
            replyEl.innerHTML = `${Number(reply.reply_level) === 2 ? "<span style='opacity:0.6; margin-right:4px;'>↳ Balasan:</span>" : ""}${this.sanitizeForumHtml(reply.konten || "")}`;
            this.appendForumFiles(replyEl, reply.files);
            topicEl.appendChild(replyEl);
          });

          container.appendChild(topicEl);
        },
      );
    },

    appendForumFiles(parent, files) {
      if (!Array.isArray(files) || !files.length) return;

      const filesEl = document.createElement("div");
      filesEl.style.cssText =
        "display:flex; flex-wrap:wrap; gap:6px; margin-top:8px;";
      files.forEach((fileId) => {
        if (!fileId) return;
        const link = document.createElement("a");
        link.href = `https://mentari.unpam.ac.id/api/file/${encodeURIComponent(fileId)}`;
        link.target = "_blank";
        link.rel = "noopener noreferrer";
        link.className = "token-button";
        link.title = "Download lampiran";
        link.style.cssText =
          "padding:5px 8px; border-radius:6px; background:#3d99e3; font-size:10px;";
        link.innerHTML = `<span class="ms" style="font-size:14px;">download</span> Lampiran`;
        link.onclick = (event) => event.stopPropagation();
        filesEl.appendChild(link);
      });
      parent.appendChild(filesEl);
    },

    toggleForumReplyForm(container) {
      const existing = container.querySelector(".forum-reply-form");
      if (existing) {
        existing.remove();
        return;
      }

      const targets = container._forumReplyTargets || [];
      const form = document.createElement("div");
      form.className = "forum-reply-form";
      form.style.cssText =
        "margin-top:8px; margin-bottom:8px; padding:10px 12px; border:1px solid rgba(61,153,227,0.2); border-radius:8px; background:rgba(0,0,0,0.3); display:flex; flex-direction:column; gap:8px;";
      form.onclick = (event) => event.stopPropagation();
      form.innerHTML = `
        <div style="display:flex; align-items:center; justify-content:space-between;">
          <div style="font-size:11px; font-weight:700; color:#3d99e3; display:flex; align-items:center; gap:5px;">
            <span class="ms" style="font-size:14px;">edit_note</span> Tulis Balasan Forum
          </div>
          <button type="button" class="token-button forum-reply-cancel" style="background:transparent; padding:2px; color:rgba(255,255,255,0.5);" title="Tutup">
            <span class="ms" style="font-size:14px;">close</span>
          </button>
        </div>
        <div style="display:flex; flex-direction:column; gap:4px; max-width:100%; position:relative;">
          <label style="font-size:10px; opacity:0.7; font-weight:600;">Sasaran Balasan:</label>
          <input type="hidden" class="forum-reply-parent-val" value="" />
          <button type="button" class="custom-reply-select-btn" style="width:100%; max-width:100%; box-sizing:border-box; padding:7px 10px; border:1px solid rgba(255,255,255,0.15); border-radius:6px; background:rgba(0,0,0,0.4); color:#f1f5f9; font-size:11px; text-align:left; cursor:pointer; display:flex; align-items:center; justify-content:space-between; gap:6px; line-height:1.4;">
            <span class="custom-reply-select-label" style="flex:1; min-width:0; white-space:normal; word-break:break-word; overflow-wrap:anywhere;">Pilih sasaran balasan...</span>
            <span class="ms" style="font-size:14px; opacity:0.6; flex-shrink:0;">expand_more</span>
          </button>
          <div class="custom-reply-options-list" style="display:none; position:absolute; top:100%; left:0; right:0; margin-top:4px; max-height:180px; overflow-y:auto; background:#1e293b; border:1px solid rgba(61,153,227,0.3); border-radius:6px; z-index:100; box-shadow:0 6px 20px rgba(0,0,0,0.5); box-sizing:border-box;">
          </div>
        </div>
        <div style="display:flex; flex-direction:column; gap:4px;">
          <label style="font-size:10px; opacity:0.7; font-weight:600;">Isi Pesan Balasan:</label>
          <textarea class="forum-reply-input" rows="3" placeholder="Tuliskan argumen / jawaban forum kamu secara lengkap..." style="width:100%; box-sizing:border-box; resize:vertical; padding:8px; border:1px solid rgba(255,255,255,0.12); border-radius:6px; background:rgba(0,0,0,0.4); color:#f1f5f9; font-family:inherit; font-size:11px; min-height:65px; outline:none;"></textarea>
        </div>
        <div style="display:flex; justify-content:flex-end; gap:8px; margin-top:2px;">
          <button type="button" class="token-button forum-reply-cancel-btn" style="padding:4px 10px; background:rgba(255,255,255,0.08); color:rgba(255,255,255,0.7); border-radius:6px; font-size:11px; font-weight:600;">Batal</button>
          <button type="button" class="token-button forum-reply-send" style="padding:4px 14px; background:#3d99e3; color:#fff; border-radius:6px; font-size:11px; font-weight:600; display:inline-flex; align-items:center; gap:4px;">
            <span class="ms" style="font-size:13px;">send</span> Kirim Balasan
          </button>
        </div>
      `;

      const hiddenInput = form.querySelector(".forum-reply-parent-val");
      const selectBtn = form.querySelector(".custom-reply-select-btn");
      const selectLabel = form.querySelector(".custom-reply-select-label");
      const optionsList = form.querySelector(".custom-reply-options-list");

      selectBtn.onclick = (e) => {
        e.stopPropagation();
        optionsList.style.display =
          optionsList.style.display === "none" ? "block" : "none";
      };

      const selectOption = (id, text) => {
        hiddenInput.value = id;
        selectLabel.textContent = text;
        optionsList.style.display = "none";
      };

      let isFirst = true;

      targets.forEach((target) => {
        const item = document.createElement("div");
        item.style.cssText =
          "padding:8px 10px; border-bottom:1px solid rgba(255,255,255,0.06); font-size:11px; line-height:1.4; white-space:normal; word-break:break-word; overflow-wrap:anywhere; cursor:pointer; color:#f1f5f9; transition:background 0.15s; box-sizing:border-box;";
        item.textContent = target.label;
        item.onmouseenter = () =>
          (item.style.background = "rgba(61,153,227,0.25)");
        item.onmouseleave = () => (item.style.background = "transparent");
        item.onclick = (e) => {
          e.stopPropagation();
          selectOption(target.id, target.label);
        };
        optionsList.appendChild(item);

        if (isFirst) {
          selectOption(target.id, target.label);
          isFirst = false;
        }

        target.replies
          .filter((reply) => Number(reply.reply_level) === 1)
          .forEach((reply) => {
            const replyItem = document.createElement("div");
            replyItem.style.cssText =
              "padding:8px 10px 8px 20px; border-bottom:1px solid rgba(255,255,255,0.06); font-size:11px; line-height:1.4; white-space:normal; word-break:break-word; overflow-wrap:anywhere; cursor:pointer; color:#94a3b8; transition:background 0.15s; box-sizing:border-box;";
            const cleanedText = this.cleanForumText(reply.konten);
            const fullText = `↳ Reply kamu: ${cleanedText}`;
            replyItem.textContent = fullText;
            replyItem.onmouseenter = () => {
              replyItem.style.background = "rgba(61,153,227,0.25)";
              replyItem.style.color = "#f1f5f9";
            };
            replyItem.onmouseleave = () => {
              replyItem.style.background = "transparent";
              replyItem.style.color = "#94a3b8";
            };
            replyItem.onclick = (e) => {
              e.stopPropagation();
              selectOption(reply.id, fullText);
            };
            optionsList.appendChild(replyItem);
          });
      });

      const closeForm = () => form.remove();
      form.querySelector(".forum-reply-cancel").onclick = closeForm;
      const cancelBtn = form.querySelector(".forum-reply-cancel-btn");
      if (cancelBtn) cancelBtn.onclick = closeForm;

      form.querySelector(".forum-reply-send").onclick = async () => {
        const sendButton = form.querySelector(".forum-reply-send");
        const content = form.querySelector(".forum-reply-input").value.trim();
        const parentId = hiddenInput.value;
        const parentTarget = targets
          .flatMap((target) => [
            { id: target.id, topicId: target.topicId, judul: target.judul },
            ...target.replies.map((reply) => ({
              id: reply.id,
              topicId: reply.topicId,
              judul: target.judul,
            })),
          ])
          .find((target) => target.id === parentId);
        if (!content || !parentId || !parentTarget) {
          Utils.toast("Pilih parent dan isi jawaban terlebih dahulu");
          return;
        }

        sendButton.disabled = true;
        sendButton.innerHTML = `<span class="ms mentari-spin">sync</span>`;
        try {
          await ApiService.submitForumReply({
            id_topic: parentTarget.topicId,
            id_post: parentId,
            konten: content,
            judul: parentTarget.judul,
          });
          Utils.successToast("Reply forum berhasil dikirim");
          form.remove();
          await this.loadTopics();
        } catch (error) {
          Utils.toast(`Reply forum gagal: ${error.message}`);
          sendButton.disabled = false;
          sendButton.innerHTML = `<span class="ms">send</span> Kirim Balasan`;
        }
      };

      container.prepend(form);
    },

    cleanForumText(value) {
      const div = document.createElement("div");
      div.innerHTML = value || "";
      return (div.textContent || "").replace(/\s+/g, " ").trim();
    },
    sanitizeForumHtml(value) {
      const wrapper = document.createElement("div");
      wrapper.innerHTML = value || "";
      wrapper
        .querySelectorAll("script, style, iframe, object, embed")
        .forEach((element) => element.remove());
      wrapper.querySelectorAll("*").forEach((element) => {
        Array.from(element.attributes).forEach((attribute) => {
          if (attribute.name.toLowerCase().startsWith("on"))
            element.removeAttribute(attribute.name);
        });

        if (element.hasAttribute("style")) {
          const styles = document.createElement("span").style;
          styles.cssText = element.getAttribute("style");
          const keptStyles = [];
          for (let index = 0; index < styles.length; index += 1) {
            const property = styles[index];
            if (/^(color|background(?:-color|-image)?)$/i.test(property))
              continue;
            keptStyles.push(`${property}:${styles.getPropertyValue(property)}`);
          }
          if (keptStyles.length)
            element.setAttribute("style", keptStyles.join(";"));
          else element.removeAttribute("style");
        }

        element.removeAttribute("color");
        element.removeAttribute("bgcolor");

        if (element.tagName === "IMG") {
          element.removeAttribute("width");
          element.removeAttribute("height");
          element.style.width = "100%";
          element.style.height = "auto";
          element.style.maxWidth = "100%";
          element.style.boxSizing = "border-box";
        }

        if (element.tagName === "FIGURE") {
          element.style.maxWidth = "100%";
          element.style.boxSizing = "border-box";
        }
      });
      return wrapper.innerHTML;
    },
  };

  const Renderers = {
    forum(data) {
      ForumRenderer.render(data);
    },
    mhs(data) {
      const el = document.getElementById("mhs-tab-tab");
      if (!el) return;
      const all = [];
      const map = new Map();
      data.forEach((c) => {
        if (
          String(c.kode_course || "")
            .toUpperCase()
            .includes("PKKMB")
        )
          return;
        c.peserta?.forEach((p) => {
          if (p.nim && !map.has(p.nim)) {
            map.set(p.nim, p);
            all.push(p);
          }
        });
      });
      if (!all.length) {
        el.innerHTML = `
          <div class="empty-state">
            <span class="ms" style="font-size:36px; display:block; margin-bottom:10px;">groups</span>
            <div style="font-size:12px;">Tidak ada data mahasiswa</div>
          </div>`;
        return;
      }
      all.sort((a, b) => a.nama_mahasiswa.localeCompare(b.nama_mahasiswa));

      const rows = all
        .map((p, i) => {
          const initial = (p.nama_mahasiswa || "?").charAt(0).toUpperCase();
          const email =
            p.alamat_email && p.alamat_email !== "-" ? p.alamat_email : null;
          const hp =
            p.no_hp_mahasiswa && p.no_hp_mahasiswa !== "-"
              ? p.no_hp_mahasiswa
              : null;
          return `
          <div class="student-row">
            <div class="student-avatar">${initial}</div>
            <div class="student-info">
              <div class="student-name">${p.nama_mahasiswa}</div>
              <div class="student-meta">
                <span class="student-nim">${p.nim}</span>
                ${email ? `<span style="white-space:nowrap; overflow:hidden; text-overflow:ellipsis; max-width:130px;" title="${email}">${email}</span>` : ""}
                ${hp ? `<span>${hp}</span>` : ""}
              </div>
            </div>
            <span class="student-rank">${i + 1}</span>
          </div>`;
        })
        .join("");

      el.innerHTML = `
        <div class="student-list-card">
          <div class="student-list-header">
            <div class="student-list-title"><span class="ms">groups</span> Daftar Mahasiswa <span class="student-count">${all.length}</span></div>
          <button id="copy-mhs" class="token-button" style="padding:5px 10px; height:28px; font-size:10px; gap:4px; border-radius:6px;">
            <span class="ms" style="font-size:14px;">content_copy</span> Salin
          </button>
          </div>
          <div class="student-model-list">${rows}</div>
        </div>`;

      document.getElementById("copy-mhs").onclick = (e) => {
        e.stopPropagation();
        const txt = all
          .map((p, i) => `${i + 1}. ${p.nama_mahasiswa} (${p.nim})`)
          .join("\n");
        Utils.copy(txt, "Daftar mahasiswa disalin");
      };
    },

    settings(info) {
      const el = document.getElementById("set-tab-tab");
      if (!el || !info) return;
      const currentModel =
        Utils.get(Config.STORAGE_KEYS.GEMINI_MODEL) || "gemini-2.5-flash-lite";

      el.innerHTML = `
        <div class="settings-profile">
          <div class="settings-avatar">${info.fullname.charAt(0)}</div>
          <div class="settings-profile-info">
            <div class="settings-label">${info.fullname}</div>
            <div class="settings-desc">${info.username} &bull; ${info.role}</div>
          </div>
        </div>

        <div class="settings-quick-links">
          <a href="https://aistudio.google.com/app/api-keys" target="_blank" class="token-button btn-outline" style="height:32px; font-size:11px; gap:5px; border-radius:7px; box-shadow:none; text-decoration:none;">
            <span class="ms" style="font-size:16px; color:#f0872d;">vpn_key</span> Ambil API Key
          </a>
          <a href="https://aistudio.google.com/app/rate-limit" target="_blank" class="token-button btn-outline" style="height:32px; font-size:11px; gap:5px; border-radius:7px; box-shadow:none; text-decoration:none;">
            <span class="ms" style="font-size:16px; color:#f0872d;">speed</span> Rate Limit
          </a>
        </div>

        <div class="settings-section">
          <div class="settings-section-header"><span class="settings-section-title"><span class="ms">timer</span> Auto Finish Quiz</span></div>
          <div class="settings-row" style="flex-direction:column; align-items:flex-start; gap:8px; padding:12px;">
            <div class="settings-row-main" style="width:100%;">
              <div class="settings-row-title"><span class="ms">hourglass_top</span> Waktu Penyelesaian Quiz (Menit)</div>
              <div class="settings-row-desc" style="margin-left:0; margin-top:4px; line-height:1.4;">
                Durasi Pengerjaan Quiz, Contoh: <strong>3.21</strong> (3 mnt 21 dtk), atau <strong>0</strong> untuk langsung selesai.
              </div>
            </div>
            <div style="display:flex; align-items:center; gap:8px; width:100%; margin-top:4px;">
              <input type="text" id="set-quiz-delay" placeholder="0 (Default)" value="${Utils.get(Config.STORAGE_KEYS.QUIZ_DELAY) || "0"}"
                style="flex:1; height:32px; background:rgba(255,255,255,0.06); border:1px solid rgba(255,255,255,0.3); border-radius:6px; padding:0 10px; color:#ffffff; font-weight:600; font-size:12px; font-family:monospace; outline:none;" />
              <button id="save-quiz-delay" class="token-button" style="height:32px; padding:0 12px; font-size:11px; border-radius:6px; flex-shrink:0;">Simpan</button>
            </div>
          </div>
        </div>

        <div class="settings-section">
          <div class="settings-section-header">
            <span class="settings-section-title"><span class="ms">auto_awesome</span> Model Gemini</span>
            <span id="set-model-status" style="font-size:9px; opacity:0.55;">Memuat model...</span>
          </div>
          <div id="set-model-list" class="settings-model-list">
              <div style="text-align:center; padding:18px; opacity:0.4; font-size:11px;">Memuat daftar model...</div>
          </div>
        </div>

        <button id="set-api-btn" class="token-button" style="width:100%; background:#f0872d; color:#fff; font-weight:700; border-radius:8px; height:34px; margin-bottom:10px; gap:8px; box-shadow:none; border-color:transparent;">
          <span class="ms" style="font-size:16px;">vpn_key</span> Update API Key
        </button>

        <div class="settings-disclaimer">
          <div style="display:flex; align-items:center; gap:5px; margin-bottom:3px;">
            <span class="ms" style="font-size:13px; color:#f0872d;">warning</span>
            <span style="font-size:10px; font-weight:700; color:#f0872d; text-transform:uppercase; letter-spacing:0.4px;">Peringatan</span>
          </div>
          <p class="settings-desc" style="font-size:10px; opacity:0.6; line-height:1.5; margin:0;">Jawaban AI tidak selalu 100% akurat. Ganti model jika terjadi error. Selalu verifikasi jawaban secara mandiri.</p>
        </div>

        <!-- Footer -->
        <div class="settings-footer" style="display:flex; justify-content:space-between; align-items:center; opacity:0.5; font-size:10px;">
          <span>v${APP_VERSION} &bull; by <a href="https://github.com/Lukman754" style="color:#f0872d; text-decoration:none;" target="_blank">Lukman754</a></span>
          <button id="set-update-btn" style="background:none; border:none; color:inherit; font-size:inherit; cursor:pointer; text-decoration:underline; padding:0;">Cek Update</button>
        </div>
      `;

      document.getElementById("save-quiz-delay").onclick = () => {
        const val = document.getElementById("set-quiz-delay").value.trim();
        Utils.save(Config.STORAGE_KEYS.QUIZ_DELAY, val);
        Utils.toast(
          "Waktu penundaan quiz disimpan: " + (val || "0") + " menit",
        );
      };

      document.getElementById("set-api-btn").onclick = (e) => {
        e.stopPropagation();
        window.dispatchEvent(new CustomEvent("mentari-update-api-key"));
      };
      document.getElementById("set-update-btn").onclick = (e) => {
        e.stopPropagation();
        Utils.toast("Adminnya dah lulus, ga bakal update lagi!");
      };

      // Load model list from Gemini API
      this._loadModelList(currentModel);
    },

    async _loadModelList(currentModel) {
      const listEl = document.getElementById("set-model-list");
      const statusEl = document.getElementById("set-model-status");
      if (!listEl) return;

      // Get API key
      let rawKey = localStorage.getItem("geminiApiKey");
      let apiKey = rawKey
        ? (() => {
            try {
              return atob(rawKey);
            } catch (e) {
              return rawKey;
            }
          })()
        : null;

      if (!apiKey) {
        listEl.innerHTML = `<div style="text-align:center; padding:16px; opacity:0.4; font-size:11px;">API Key belum diset. Klik "Update API Key" dulu.</div>`;
        if (statusEl) statusEl.textContent = "";
        return;
      }

      // Excluded non-text model keywords
      const excluded = [
        "image",
        "tts",
        "transcribe",
        "embedding",
        "audio",
        "veo",
        "lyria",
        "robotics",
        "computer-use",
        "gemini-2",
        "gemini-flash",
      ];

      // Fetch from API
      const data = await ApiService.fetchGeminiModels(apiKey);
      if (!data || !data.models) {
        listEl.innerHTML = `<div style="text-align:center; padding:16px; color:#f87171; font-size:11px;">Gagal memuat model. Cek API Key.</div>`;
        if (statusEl) statusEl.textContent = "Error";
        return;
      }

      // Filter: only generateContent capable, exclude non-text
      const models = data.models.filter((m) => {
        const name = m.name.toLowerCase();
        if (!name.includes("-flash")) return false;
        if (excluded.some((kw) => name.includes(kw))) return false;
        if (!m.supportedGenerationMethods?.includes("generateContent"))
          return false;
        return true;
      });

      if (statusEl) statusEl.textContent = `${models.length} model tersedia`;

      if (!models.length) {
        listEl.innerHTML = `<div style="text-align:center; padding:16px; opacity:0.4; font-size:11px;">Tidak ada model yang tersedia.</div>`;
        return;
      }

      // Load limit stats
      const stats = Utils.get(Config.STORAGE_KEYS.GEMINI_MODEL_STATS) || {};

      listEl.innerHTML = models
        .map((m) => {
          const modelId = m.name.replace("models/", "");
          const isActive = currentModel === modelId;
          const modelStats = stats[modelId] || {};
          const isLimited = modelStats.limited === true;

          return `
          <div class="mentari-model-item ${isActive ? "is-active" : ""} ${isLimited ? "is-limited" : ""}" data-model="${modelId}">
            <div class="model-state-dot"></div>
            <div style="flex:1; min-width:0;">
              <div class="model-title" style="font-size:12px; font-weight:${isActive ? "700" : "500"};
                          white-space:nowrap; overflow:hidden; text-overflow:ellipsis;">
                ${m.displayName}
                ${isLimited ? "<span class='model-limit-badge'>LIMIT</span>" : ""}
              </div>
              <div class="model-id-sub" style="font-size:10px; opacity:0.55; margin-top:1px;">models/${modelId}</div>
            </div>
            ${isActive ? `<span class="ms" style="color:#3d99e3; font-size:16px; flex-shrink:0;">check_circle</span>` : ""}
          </div>
        `;
        })
        .join("");

      // Click to select model
      listEl.querySelectorAll(".mentari-model-item").forEach((item) => {
        item.onclick = () => {
          const val = item.dataset.model;
          Utils.save(Config.STORAGE_KEYS.GEMINI_MODEL, val);
          Utils.toast("Model diperbarui: " + val);
          setTimeout(() => location.reload(), 600);
        };
      });

      // Scroll active model into view
      const activeEl = listEl.querySelector(`[data-model="${currentModel}"]`);
      if (activeEl) activeEl.scrollIntoView({ block: "nearest" });
    },
  };

  const App = {
    async init() {
      Utils.injectMaterialIcons();
      UIRenderer.injectStyles();
      UIRenderer.createPopup();
      this.intercept();

      // Cek apakah token tersimpan masih sesuai dengan sesi aktif Mentari
      const savedToken = Utils.get(Config.STORAGE_KEYS.AUTH_TOKEN);
      const liveToken = Utils.findTokenFromStorage(); // baca dari localStorage["access"] dll

      // Jika ada token aktif dari Mentari, decode untuk perbandingan
      const savedInfo = savedToken ? Utils.decodeToken(savedToken) : null;
      const liveInfo = liveToken ? Utils.decodeToken(liveToken) : null;

      // Jika user yang aktif berbeda → hapus cache akun lama
      if (
        savedInfo &&
        liveInfo &&
        (savedInfo.userId !== liveInfo.userId ||
          savedInfo.username !== liveInfo.username)
      ) {
        Utils.remove(Config.STORAGE_KEYS.AUTH_TOKEN);
        Utils.remove(Config.STORAGE_KEYS.USER_INFO);
        Utils.remove(Config.STORAGE_KEYS.COURSE_DATA);
      }

      const t = liveToken || savedToken;
      if (t) this.handleToken(t);
      else this.render();
      window.addEventListener("mentari-toggle-popup", () =>
        window.toggleTokenPopup(),
      );
      window.addEventListener("resize", () => UIRenderer.updatePosition());

      setInterval(() => Utils.applyTheme(), 1000);
    },
    intercept() {
      const self = this;
      const origSetHeader = XMLHttpRequest.prototype.setRequestHeader;
      XMLHttpRequest.prototype.setRequestHeader = function (header, value) {
        if (!this._requestHeaders) this._requestHeaders = {};
        this._requestHeaders[header] = value;
        if (
          header.toLowerCase() === "authorization" &&
          value.includes("Bearer ")
        )
          self.handleToken(value);
        return origSetHeader.apply(this, arguments);
      };
      const origXHR = XMLHttpRequest.prototype.open;
      XMLHttpRequest.prototype.open = function () {
        this.addEventListener("load", function () {
          const auth =
            this.getResponseHeader?.("Authorization") ||
            this._requestHeaders?.["Authorization"];
          if (auth) self.handleToken(auth);
        });
        return origXHR.apply(this, arguments);
      };
      const origFetch = window.fetch;
      window.fetch = async function (resource, init) {
        if (init?.headers) {
          const headers = new Headers(init.headers);
          if (headers.get("Authorization"))
            self.handleToken(headers.get("Authorization"));
        }
        const res = await origFetch.apply(this, arguments);
        if (res.headers.get("Authorization"))
          self.handleToken(res.headers.get("Authorization"));
        return res;
      };
    },
    handleToken(token) {
      if (token.startsWith("Bearer ")) token = token.substring(7);
      const info = Utils.decodeToken(token);
      if (!info || State.authToken === token) return;
      const isNewUser =
        !State.userInfo ||
        State.userInfo.username !== info.username ||
        State.userInfo.userId !== info.userId;
      State.authToken = token;
      State.userInfo = info;
      Utils.save(Config.STORAGE_KEYS.AUTH_TOKEN, token);
      Utils.save(Config.STORAGE_KEYS.USER_INFO, info);
      if (isNewUser) {
        Utils.remove(Config.STORAGE_KEYS.COURSE_DATA);
        State.courseDataList = [];
      }
      Renderers.settings(info);
      this.refreshData(isNewUser);
    },
    async refreshData(force = false) {
      if (State.isFetching || !State.authToken) return;
      const forumUiState = force ? this.captureForumUiState() : null;
      if (!force) {
        const cached = Utils.get(Config.STORAGE_KEYS.COURSE_DATA);
        if (cached) {
          State.courseDataList = cached;
          this.render();
          return;
        }
      }
      try {
        State.isFetching = true;
        UIRenderer.setLoading(true);
        const list = await ApiService.fetchCourses();
        State.courseDataList = [];
        // Fetch all course details in parallel
        const courseDetails = await Promise.all(
          (list.data || []).map(async (c) => {
            const det = await ApiService.fetchCourseDetails(c.kode_course);
            return det ? { course: c, det } : null;
          }),
        );

        for (const item of courseDetails) {
          if (!item) continue;
          State.courseDataList.push(item.det);
        }

        Utils.save(Config.STORAGE_KEYS.COURSE_DATA, State.courseDataList);
        this.render();
        this.restoreForumUiState(forumUiState);
      } catch (e) {
      } finally {
        State.isFetching = false;
        UIRenderer.setLoading(false);
      }
    },
    captureForumUiState() {
      const forum = document.getElementById("forum-tab-tab");
      if (!forum) return null;

      const forumRect = forum.getBoundingClientRect();
      const anchor = Array.from(forum.querySelectorAll(".section-header"))
        .map((header) => ({
          header,
          rect: header.getBoundingClientRect(),
        }))
        .find(
          ({ rect }) =>
            rect.bottom > forumRect.top && rect.top < forumRect.bottom,
        );

      return {
        scrollTop: forum.scrollTop,
        anchor: anchor
          ? {
              id: anchor.header.dataset.target,
              offset: anchor.rect.top - forumRect.top,
            }
          : null,
        openSections: Array.from(
          forum.querySelectorAll(".section-content.active"),
        ).map((section) => ({
          id: section.id,
          scrollTop: section.scrollTop,
        })),
      };
    },
    restoreForumUiState(uiState) {
      if (!uiState) return;
      const forum = document.getElementById("forum-tab-tab");
      if (!forum) return;

      uiState.openSections.forEach(({ id, scrollTop }) => {
        const section = document.getElementById(id);
        if (!section) return;
        section.classList.add("active");
        section
          .closest(".section-card")
          ?.querySelector(".section-toggle")
          ?.classList.add("active");
        section.scrollTop = scrollTop;
      });

      const restoreScroll = () => {
        if (uiState.anchor?.id) {
          const section = document.getElementById(uiState.anchor.id);
          const header = section
            ?.closest(".section-card")
            ?.querySelector(
              `.section-header[data-target="${uiState.anchor.id}"]`,
            );
          if (header) {
            const forumRect = forum.getBoundingClientRect();
            const headerRect = header.getBoundingClientRect();
            forum.scrollTop +=
              headerRect.top - forumRect.top - uiState.anchor.offset;
            return;
          }
        }
        forum.scrollTop = uiState.scrollTop;
      };

      requestAnimationFrame(() => requestAnimationFrame(restoreScroll));
    },
    render() {
      Renderers.forum(State.courseDataList);
      Renderers.mhs(State.courseDataList);
      if (State.userInfo) Renderers.settings(State.userInfo);
    },
  };

  window.toggleTokenPopup = () => {
    let p = document.getElementById("token-runner-popup");
    if (!p) {
      UIRenderer.injectStyles();
      UIRenderer.createPopup();
      p = document.getElementById("token-runner-popup");
    }
    if (!p) return;

    if (!p.classList.contains("active")) {
      UIRenderer.updatePosition();
      p.classList.add("active");
      const close = (e) => {
        if (
          !p.contains(e.target) &&
          !document
            .getElementById("mentari-header-toggle")
            ?.contains(e.target) &&
          !e.target.closest(".toast")
        ) {
          p.classList.remove("active");
          document.removeEventListener("mousedown", close);
        }
      };
      setTimeout(() => {
        document.addEventListener("mousedown", close);
      }, 50);
    } else {
      p.classList.remove("active");
    }
  };

  window.addEventListener("mentari-toggle-popup", () => {
    if (typeof window.toggleTokenPopup === "function") {
      window.toggleTokenPopup();
    }
  });
  document.addEventListener("mentari-toggle-popup", () => {
    if (typeof window.toggleTokenPopup === "function") {
      window.toggleTokenPopup();
    }
  });

  if (document.readyState === "loading")
    document.addEventListener("DOMContentLoaded", () => App.init());
  else App.init();
})();
