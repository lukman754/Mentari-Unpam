console.log("Token.js sedang dijalankan!");

// Inisialisasi UI dan logic token
(function () {
  let authToken = null;
  let isHandlingCourseApiRequest = false;
  let courseDataList = [];
  let userInfo = null;
  let studentDataList = [];

  // Nama kunci untuk localStorage
  const STORAGE_KEYS = {
    AUTH_TOKEN: "mentari_auth_token",
    USER_INFO: "mentari_user_info",
    COURSE_DATA: "mentari_course_data",
    LAST_UPDATE: "mentari_last_update",
  };

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
    // Cek jika popup sudah ada
    if (document.getElementById("token-runner-popup")) return;

    let script = document.createElement("script");
    script.src = "https://kit.fontawesome.com/f59e2d85df.js";
    script.crossOrigin = "anonymous";
    document.head.appendChild(script);

    // Buat container utama
    const popup = document.createElement("div");
    popup.id = "token-runner-popup";
    popup.innerHTML = `
    <div class="token-popup-header">
      <b style="align-items: center;"><img src="https://github.com/tonybaloney/vscode-pets/blob/main/media/zappy/yellow_idle_8fps.gif?raw=true" alt="Mentaru" height="15" />  <span class="shimmer-text">MENTARI MOD</span></b>
      <div class="token-popup-actions">
        
        <button id="token-reset-btn" title="Reset Cache & Track Ulang"><i class="fa-solid fa-rotate-right fa-fw"></i></button>
        <button id="token-toggle-btn" title="Toggle"><i class='fa-solid fa-chevron-down fa-fw'></i></button>

        <!-- <button id="token-refresh-btn" title="Refresh Data">↻</button> -->
        <!-- <button id="token-clear-btn" title="Clear Cache"><i class="fa-solid fa-trash"></i></button> -->
      </div>
    </div>
    <div class="token-loading-bar"></div>
    <div class="token-popup-content">
      <div class="token-tabs">
        <button class="token-tab active" data-tab="user-info">Info</button>
        <!-- <button class="token-tab" data-tab="token-data">Token</button> -->
        <button class="token-tab" data-tab="forum-data">Forum Diskusi</button>
        <button class="token-tab" data-tab="student-data">Mahasiswa</button>
      </div>
      <div class="token-tab-content active" id="user-info-tab">
        <div class="token-info-section">
          <p>Klik Dashboard atau buka salah satu Course</p>
        </div>
      </div>
      <div class="token-tab-content" id="token-data-tab">
        <div class="token-info-section">
          <p>Menunggu token...</p>
        </div>
      </div>
      <div class="token-tab-content" id="forum-data-tab">
        <div class="token-info-section">
          <p>Forum Diskusi yang belum dikerjakan</p>
        </div>
        <div id="forum-list"></div>
      </div>
      <div class="token-tab-content" id="student-data-tab">
        <div class="token-info-section">
          <p>Daftar Mahasiswa</p>
        </div>
        <div id="student-list"></div>
      </div>
    </div>
  `;

    // CSS untuk popup - lebih minimalis
    const style = document.createElement("style");
    style.textContent = `
    #token-runner-popup {
      position: fixed;
      bottom: 20px; /* Increased to avoid covering bottom buttons */
      right: 20px;
      margin-left: 20px;
      max-height: 600px;
      background: rgba(17, 17, 17, 0.7); /* Semi-transparent background */
      color: #eee;
      border-radius: 6px;
      box-shadow: 0 4px 8px rgba(0, 0, 0, 0.5);
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
      z-index: 10001;
      overflow: hidden;
      transition: height 0.3s ease;
      border: 1px solid rgba(51, 51, 51, 0.8);
      backdrop-filter: blur(8px); /* Add blur effect */
      -webkit-backdrop-filter: blur(8px); /* For Safari support */
    }

    
    #token-runner-popup.collapsed {
      height: 40px;
    }

    .token-popup-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 8px 12px;
      background: #1e1e1e;
      border-bottom: 1px solid #222;
    }

    .token-popup-header b {
      font-size: 15px;
      color: #f0872d;
    }

    .shimmer-text {
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


    .token-popup-actions {
      display: flex;
      gap: 6px;
    }

    .token-popup-actions button {
      background: transparent;
      border: none;
      cursor: pointer;
      color: #1e1e1e;
      background-color: red;
      font-weight: bold;
      border-radius: 30px;
      width: 16px;
      height: 16px;
      padding: 2px;
      font-size: 10px;
    }

    .token-popup-actions button:hover {
      transform: rotate(180deg);
      transition: transform 0.3s ease;
    }

    .token-loading-bar {
      position: absolute;
      left: 0;
      height: 2px;
      width: 0%;
      background-color: #2ecc71;
      top: 40px; /* Position it just below the header */
      transition: width 0.3s ease;
      display: none;
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

    .token-popup-content {
      max-height: 500px;
      overflow: hidden;
    }

    .token-tabs {
      display: flex;
      border-bottom: 1px solid #222;
      background: #1a1a1a;
    }

    .token-tab {
      padding: 6px 12px;
      background: transparent;
      border: none;
      color: #777;
      cursor: pointer;
      font-size: 12px;
      border-bottom: 2px solid transparent;
    }

    .token-tab:hover {
      color: #fff;
    }

    .token-tab.active {
      color: #fff;
      border-bottom: 2px solid #0070f3;
    }

    .token-tab-content {
      display: none;
      padding: 12px;
      max-height: 600px;
      overflow-y: auto;
      scrollbar-width: none;
    }

    .token-tab-content::-webkit-scrollbar {
      display: none;
    }

    .token-tab-content.active {
      display: block;
    }

    .token-info-section {
      margin-bottom: 10px;
      font-size: 12px;
      line-height: 1.4;
    }

    .token-info-section h4 {
      margin: 0 0 6px 0;
      font-size: 12px;
      color: #777;
      font-weight: normal;
    }

    .token-info-section p {
      margin: 0 0 6px 0;
    }

    .token-key {
      color: #777;
    }

    .token-value {
      color: #eee;
      word-break: break-all;
    }

    .token-copy-btn {
      background: #333;
      border: none;
      color: #eee;
      padding: 2px 6px;
      border-radius: 3px;
      font-size: 11px;
      cursor: pointer;
      margin-left: 5px;
    }

    .token-copy-btn:hover {
      background: #0070f3;
    }

    #forum-list, #student-list {
      display: flex;
      flex-direction: column;
      gap: 8px;
    }

    .forum-item, .student-item {
      background: #191919;
      border-radius: 4px;
      padding: 8px 10px;
      border: 1px solid #222;
    }

    .forum-item:hover {
      background: #222;
    }

    .forum-item-header, .student-item-header {
      display: flex;
      justify-content: space-between;
      margin-bottom: 6px;
    }

    .forum-item-title, .student-item-title {
      font-weight: normal;
      color: #eee;
      margin: 0;
      font-size: 13px;
    }

    .forum-item-code, .student-item-code {
      font-size: 11px;
      color: #777;
      margin: 0;
    }

    .forum-item-link, .student-item-link {
      display: inline-block;
      color: white;
      text-decoration: none;
      border-radius: 3px;
      font-size: 14px;
    }


    .forum-no-data, .student-no-data {
      color: #777;
      font-style: italic;
      text-align: center;
      padding: 12px;
    }

    .token-badge {
      display: inline-block;
      background: #222;
      color: #999;
      padding: 1px 4px;
      border-radius: 3px;
      font-size: 10px;
      margin-right: 4px;
    }

    .forum-item-link:hover {
      .token-badge{
          background: #253949;
          color: #41a3f2;
        }
      }

    pre {
      background: #191919; 
      padding: 8px; 
      border-radius: 4px; 
      max-height: 150px; 
      font-size: 11px; 
      color: #ccc;
      overflow: auto;
      scrollbar-width: none;
    }

    pre::-webkit-scrollbar {
      display: none;
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
      color: #999;
    }
    
    .course-header {
      background: #222;
      padding: 6px 10px;
      border-radius: 4px;
      margin-bottom: 8px;
      font-size: 12px;
      font-weight: bold;
    }

    /* New card wrapper styles */
    .token-card-wrapper {
      background: linear-gradient(145deg, #232323, #1a1a1a);
      border-radius: 8px;
      padding: 16px;
    }

    .token-card-header {
      display: flex;
      align-items: center;
      margin-bottom: 12px;
      padding-bottom: 8px;
      border-bottom: 1px solid rgba(255, 255, 255, 0.1);
    }

    .token-avatar {
      width: 36px;
      height: 36px;
      background: #41a3f2;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      margin-right: 10px;
      color: #fff;
      font-weight: bold;
      font-size: 14px;
    }

    .token-user-title {
      font-size: 16px;
      font-weight: 500;
      color: #fff;
      margin: 0;
    }

    .token-role-badge {
      margin-left: auto;
      background: rgba(65, 163, 242, 0.15);
      color: #41a3f2;
      padding: 3px 8px;
      border-radius: 12px;
      font-size: 11px;
      font-weight: 500;
      text-transform: uppercase;
    }

    .token-data-grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 10px;
    }

    .token-data-item {
      padding: 8px;
      background: rgba(30, 30, 30, 0.5);
      border-radius: 6px;
    }

    .token-footer {
      display: flex;
      align-items: center;
      justify-content: space-between;
      margin-top: 12px;
      padding-top: 8px;
      border-top: 1px solid rgba(255, 255, 255, 0.1);
      font-size: 11px;
    }

    .token-github-link {
      display: flex;
      align-items: center;
      color: #999;
      text-decoration: none;
      transition: color 0.2s;
    }

    .token-github-link:hover {
      color: #41a3f2;
    }

    .token-github-icon {
      margin-right: 5px;
      font-size: 14px;
    }

    .token-date-info {
      color: #777;
    }

    /* Add some subtle hover effects */
    .token-card-wrapper:hover {
      border-color: rgba(65, 163, 242, 0.4);
      box-shadow: 0 6px 16px rgba(0, 0, 0, 0.4);
    }
    .token-popup-actions button#token-reset-btn,
    .token-popup-actions button#token-clear-btn {
      background: transparent;
      border: none;
      cursor: pointer;
      color: #1e1e1e;
      background-color: #2ecc71;
      font-weight: bold;
      border-radius: 30px;
      width: 16px;
      height: 16px;
      padding: 2px;
      font-size: 10px;
    }

    .token-popup-actions button#token-reset-btn:hover,
    .token-popup-actions button#token-clear-btn:hover {
      transform: rotate(180deg);
      transition: transform 0.3s;
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

    // Toggle collapse function
    function toggleCollapse() {
      const popup = document.getElementById("token-runner-popup");
      popup.classList.toggle("collapsed");

      const toggleBtn = document.getElementById("token-toggle-btn");
      if (popup.classList.contains("collapsed")) {
        toggleBtn.innerHTML = "<i class='fa-solid fa-chevron-up fa-fw'></i>";
      } else {
        toggleBtn.innerHTML = "<i class='fa-solid fa-chevron-down fa-fw'></i>";
      }
    }

    // Handle event listeners
    document
      .getElementById("token-toggle-btn")
      .addEventListener("click", toggleCollapse);
    document
      .getElementById("token-reset-btn")
      .addEventListener("click", refreshAndTrackWithLoading);
    // document
    //   .getElementById("token-refresh-btn")
    //   .addEventListener("click", refreshAllData);

    // document
    //   .getElementById("token-clear-btn")
    //   .addEventListener("click", clearCacheData);

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
  }

  // Toggle collapse
  function toggleCollapse() {
    const popup = document.getElementById("token-runner-popup");
    if (popup) {
      popup.classList.toggle("collapsed");

      // Change button icon
      const btn = document.getElementById("token-toggle-btn");
      if (popup.classList.contains("collapsed")) {
        btn.innerHTML = "<i class='fa-solid fa-chevron-up'></i>";
        btn.title = "Expand";
      } else {
        btn.innerHTML = "<i class='fa-solid fa-chevron-down'></i>";
        btn.title = "Collapse";
      }
    }
  }

  // Refresh all data
  function refreshAllData() {
    checkStorages();
    if (authToken) {
      fetchCoursesListAndDetails(true); // Force refresh
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
      <div class="token-info-section">
        <h4>Bearer Token</h4>
        <p><span class="token-value">${tokenDisplay || "Tidak ditemukan"}</span>
          <button class="token-copy-btn" data-copy="${token}">Copy</button>
        </p>
      </div>
      <div class="token-info-section">
        <h4>Payload</h4>
        <pre>${JSON.stringify(tokenInfo?.payload || {}, null, 2)}</pre>
      </div>
    `;

    // Add copy functionality
    tokenTab.querySelectorAll(".token-copy-btn").forEach((btn) => {
      btn.addEventListener("click", () => {
        const textToCopy = btn.getAttribute("data-copy");
        navigator.clipboard.writeText(textToCopy).then(() => {
          const originalText = btn.innerText;
          btn.innerText = "Copied!";
          setTimeout(() => {
            btn.innerText = originalText;
          }, 1500);
        });
      });
    });
  }

  // Update user info UI
  function updateUserInfoUI(tokenInfo) {
    const userInfoTab = document.getElementById("user-info-tab");
    if (!userInfoTab || !tokenInfo) return;

    userInfoTab.innerHTML = `
      <div class="token-card-wrapper">
        <div class="token-card-header">
          <div class="token-avatar">${tokenInfo.fullname.charAt(0)}</div>
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
              <p><span class="token-key">Token Exp:</span> <span class="token-value">${
                tokenInfo.expires
              }</span></p>
            </div>
          </div>
        </div>
        
        <div class="token-footer">
          <div style="display: flex; align-items: center;">
            <span class="token-value">Made with </span>
            <img src="https://img.icons8.com/?size=100&id=H5H0mqCCr5AV&format=png&color=000000" style="width: 15px; margin: 0 3px;" >
            <span>by Lukman Muludin</span>
          </div>

          <div style="display: flex; align-items: center;">
            <a href="https://instagram.com/_.chopin" target="_blank" class="token-github-link">
              <span class="token-github-icon"><img src="https://img.icons8.com/?size=100&id=dz63urxyxSdO&format=png&color=ffffff" width="18" ></span>
            </a>
            <a href="https://facebook.com/lukman.mauludin.754" target="_blank" class="token-github-link">
              <span class="token-github-icon"><img src="https://img.icons8.com/?size=100&id=118467&format=png&color=ffffff" width="18" ></span>
            </a>
            <a href="https://github.com/Lukman754" target="_blank" class="token-github-link">
              <span class="token-github-icon"><img src="https://img.icons8.com/?size=100&id=62856&format=png&color=ffffff" width="18" ></span>
            </a>
          </div>
        </div>
      </div>
    `;
  }

  // Update forum data UI
  function updateForumUI(courseDataList) {
    const forumTab = document.getElementById("forum-data-tab");
    if (!forumTab) return;

    const forumList = document.getElementById("forum-list");
    if (!forumList) return;

    // Filter forums
    const forums = [];

    courseDataList.forEach((courseData) => {
      if (!courseData || !courseData.data) return;

      const course = {
        kode_course: courseData.kode_course,
        coursename: courseData.coursename,
        forums: [],
      };

      courseData.data.forEach((section) => {
        if (!section.sub_section) return;

        section.sub_section.forEach((subsection) => {
          if (subsection.kode_template === "FORUM_DISKUSI") {
            course.forums.push({
              section: section.nama_section,
              kode_section: section.kode_section,
              ...subsection,
            });
          }
        });
      });

      if (course.forums.length > 0) {
        forums.push(course);
      }
    });

    // Update UI
    if (forums.length === 0) {
      forumList.innerHTML = `<div class="forum-no-data">Tidak ada forum diskusi</div>`;
      return;
    }

    let html = "";
    forums.forEach((course) => {
      course.forums.forEach((forum) => {
        const courseUrl = createCustomUrl(course.kode_course);

        html += `
        ${
          courseUrl
            ? `<a href="${courseUrl}" class="forum-item-link">
                <div class="forum-item">
                  <div class="forum-item-header">
                    <div>
                      <p class="forum-item-code">
                        <span class="token-badge">${forum.section}</span>
                        <span class="token-badge">${course.kode_course}</span>
                      </p>
                    </div>
                  </div>
                  <div>
                    <p>${course.coursename}</p>
                    
                  </div>
                </div>
              </a>`
            : ""
        }
        `;
      });
    });

    forumList.innerHTML = html;
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
        min-width: 24px;
        height: 24px;
        background: #0070f3;
        color: #fff;
        border-radius: 50%;
        font-size: 12px;
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
        min-width: 24px;
        height: 24px;
        background: #0070f3;
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 12px;
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
        background: #1a1a1a;
        border-bottom: 1px solid #333;
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
        background: #333;
        color: white;
        padding: 12px 20px;
        border-radius: 4px;
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
        display: flex;
        align-items: center;
        gap: 8px;
        z-index: 1000;
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
        
        .input-group {
          flex-direction: column;
        }
        
        .card-header {
          flex-direction: column;
          align-items: flex-start;
        }
        
        .card-actions {
          margin-top: 8px;
        }
      }
      
      @media (max-width: 480px) {
        .students-container, 
        #group-results {
          grid-template-columns: 1fr;
        }
        
        .grouping-options {
          flex-direction: column;
          gap: 8px;
        }
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
})();
