// Fungsi utama untuk mendapatkan data presensi dari semua jadwal kuliah
async function fetchAllPresensiData() {
  // Dapatkan token autentikasi terlebih dahulu
  const token = await getAuthToken();

  if (!token) {
    console.error("Token tidak ditemukan. Tidak dapat melanjutkan.");
    showPopupMessage("Error: Token tidak ditemukan", "error");
    return;
  }

  console.log("Token ditemukan:", token);

  try {
    // 1. Fetch jadwal kuliah terlebih dahulu
    console.log("Mengambil data jadwal kuliah...");
    const jadwalKuliah = await fetchJadwalKuliah(token);

    if (!jadwalKuliah || !jadwalKuliah.length) {
      console.error("Tidak ada jadwal kuliah yang ditemukan.");
      showPopupMessage("Tidak ada jadwal kuliah yang ditemukan", "error");
      return;
    }

    console.log(`Ditemukan ${jadwalKuliah.length} mata kuliah`);

    // Extract student information from the first item in jadwal kuliah
    const mahasiswaInfo = {
      nim: jadwalKuliah[0].nim,
      nama_mahasiswa: jadwalKuliah[0].nama_mahasiswa,
      id_semester_registrasi: jadwalKuliah[0].id_semester_registrasi,
      nama_semester_registrasi: jadwalKuliah[0].nama_semester_registrasi,
    };

    // 2. Untuk setiap mata kuliah, ambil data presensi
    const allPresensiData = [];

    for (const jadwal of jadwalKuliah) {
      const { id_kelas, id_mata_kuliah, nama_mata_kuliah, sks } = jadwal;

      console.log(
        `Mengambil data presensi untuk: ${nama_mata_kuliah} (${id_mata_kuliah})`
      );

      try {
        const presensiData = await fetchPresensiPertemuan(
          token,
          id_kelas,
          id_mata_kuliah
        );

        // Tambahkan nama mata kuliah dan SKS ke data presensi
        const enrichedData = {
          nama_mata_kuliah,
          id_mata_kuliah,
          id_kelas,
          sks,
          pertemuan: presensiData,
        };

        allPresensiData.push(enrichedData);

        console.log(
          `Berhasil mengambil data presensi untuk: ${nama_mata_kuliah}`
        );
      } catch (error) {
        console.error(
          `Gagal mengambil data presensi untuk ${nama_mata_kuliah}:`,
          error
        );
      }
    }

    // 3. Tambahkan data mahasiswa ke presensi data
    allPresensiData.mahasiswa = mahasiswaInfo;

    // 4. Tampilkan ringkasan data presensi sebagai popup
    showPresensiTable(allPresensiData);
    return allPresensiData;
  } catch (error) {
    console.error("Terjadi kesalahan saat mengambil data:", error);
    showPopupMessage("Terjadi kesalahan saat mengambil data", "error");
  }
}

// Fungsi untuk membuat popup table dengan desain Vercel
// Function to show attendance details when a row is clicked
function showAttendanceDetails(pertemuan, mataKuliah) {
  // Create modal container
  const modalContainer = document.createElement("div");
  modalContainer.style.cssText = `
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background-color: rgba(0, 0, 0, 0.5);
    display: flex;
    justify-content: center;
    align-items: center;
    z-index: 10002;
  `;

  // Create modal content
  const modalContent = document.createElement("div");
  modalContent.style.cssText = `
    background-color: white;
    border-radius: 12px;
    box-shadow: 0 8px 30px rgba(0, 0, 0, 0.12);
    width: 90%;
    max-width: 1200px;
    max-height: 90vh;
    overflow-y: auto;
    padding: 24px;
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, 'Helvetica Neue', sans-serif;
    display: flex;
    flex-direction: column;
  `;

  // Create header (STICKY)
  const header = document.createElement("div");
  header.style.cssText = `
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 16px;
    border-bottom: 1px solid #eaeaea;
    color: black;
    padding-bottom: 16px;
    position: sticky;
    top: 0;
    z-index: 2;
    background: white;
  `;

  header.innerHTML = `
    <h3 style="margin: 0; font-size: 18px; font-weight: 600;">${mataKuliah} - Detail Presensi</h3>
    <button id="close-detail-modal" style="background: none; border: none; cursor: pointer; color: #666; font-size: 20px;">×</button>
  `;

  // Create table container (for horizontal scroll)
  const tableContainer = document.createElement("div");
  tableContainer.style.cssText = `
    width: 100%;
    overflow-x: auto;
  `;

  // Create table
  const table = document.createElement("table");
  table.style.cssText = `
    width: 100%;
    border-collapse: collapse;
    font-size: 14px;
    color: black;
  `;

  table.innerHTML = `
    <thead>
      <tr style="background-color: #fafafa;">
        <th style="padding: 12px 16px; text-align: left; font-weight: 600; border-bottom: 1px solid #eaeaea;">Pertemuan</th>
        <th style="padding: 12px 16px; text-align: left; font-weight: 600; border-bottom: 1px solid #eaeaea;">Jenis</th>
        <th style="padding: 12px 16px; text-align: center; font-weight: 600; border-bottom: 1px solid #eaeaea;">Status</th>
        <th style="padding: 12px 16px; text-align: left; font-weight: 600; border-bottom: 1px solid #eaeaea;">Tanggal Mulai</th>
        <th style="padding: 12px 16px; text-align: left; font-weight: 600; border-bottom: 1px solid #eaeaea;">Tanggal Hadir</th>
        <th style="padding: 12px 16px; text-align: left; font-weight: 600; border-bottom: 1px solid #eaeaea;">Oleh</th>
      </tr>
    </thead>
    <tbody id="detail-table-body">
    </tbody>
  `;

  // Assemble modal
  modalContent.appendChild(header);
  tableContainer.appendChild(table);
  modalContent.appendChild(tableContainer);
  modalContainer.appendChild(modalContent);
  document.body.appendChild(modalContainer);

  // Add event listener to close button
  document
    .getElementById("close-detail-modal")
    .addEventListener("click", () => {
      document.body.removeChild(modalContainer);
    });

  // Fill table with data
  const tableBody = document.getElementById("detail-table-body");

  pertemuan.forEach((p, index) => {
    const row = document.createElement("tr");
    row.style.cssText = `transition: background-color 0.15s ease;`;

    row.onmouseover = function () {
      this.style.backgroundColor = "#f9fafb";
    };

    row.onmouseout = function () {
      this.style.backgroundColor = "";
    };

    // Status styling
    let statusColor, statusBg;
    if (p.presensi_status === "hadir") {
      statusColor = "#10b981"; // green
      statusBg = "rgba(16, 185, 129, 0.1)";
    } else {
      statusColor = "#f43f5e"; // red
      statusBg = "rgba(244, 63, 94, 0.1)";
    }

    // Format date
    const dateStr = p.presensi_date ? formatDate(p.presensi_date) : "-";
    const TglMulai = p.tanggal_mulai ? formatDateStart(p.tanggal_mulai) : "-";

    row.innerHTML = `
      <td style="padding: 12px 16px; border-bottom: 1px solid #eaeaea;">${
        index + 1
      }</td>
      <td style="padding: 12px 16px; border-bottom: 1px solid #eaeaea;">${
        p.jenis_perkuliahan || "-"
      }</td>
      <td style="padding: 12px 16px; border-bottom: 1px solid #eaeaea; text-align: center;">
        <div style="display: inline-flex; align-items: center; background-color: ${statusBg}; color: ${statusColor}; padding: 4px 10px; border-radius: 12px; font-weight: 500; font-size: 13px;">
          ${p.presensi_status || "tidak hadir"}
        </div>
      </td>
      <td style="padding: 12px 16px; border-bottom: 1px solid #eaeaea;">${TglMulai}</td>
      <td style="padding: 12px 16px; border-bottom: 1px solid #eaeaea;">${dateStr}</td>
      <td style="padding: 12px 16px; border-bottom: 1px solid #eaeaea;">${
        p.presensi_by || "-"
      }</td>
    `;

    tableBody.appendChild(row);
  });
}

// Helper function to format date
function formatDate(dateString) {
  if (!dateString) return "-";

  try {
    const date = new Date(dateString);
    return date.toLocaleString("id-ID", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  } catch (e) {
    return dateString;
  }
}

function formatDateStart(dateString) {
  if (!dateString) return "-";

  try {
    const date = new Date(dateString);
    return date.toLocaleString("id-ID", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  } catch (e) {
    return dateString;
  }
}

// Modify the showPresensiTable function to make rows clickable
function showPresensiTable(presensiData) {
  // Get student info
  const mahasiswaInfo = presensiData.mahasiswa;

  // Create popup container
  const popupContainer = document.createElement("div");
  popupContainer.id = "presensi-popup";
  popupContainer.style.cssText = `
    position: fixed;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    background-color: white;
    padding: 24px;
    border-radius: 12px;
    box-shadow: 0 8px 30px rgba(0, 0, 0, 0.12);
    z-index: 10000;
    width: 90%;
    max-width: 1200px;
    max-height: 90vh;
    overflow-y: auto;
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, 'Open Sans', 'Helvetica Neue', sans-serif;
    color: black;
  `;

  // Create header with student info
  const header = document.createElement("div");
  header.style.cssText = `
    margin-bottom: 24px;
    border-bottom: 1px solid #eaeaea;
    padding-bottom: 16px;
  `;

  header.innerHTML = `
    <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 16px; flex-wrap: wrap;">
      <h2 style="margin: 0; font-size: 24px; font-weight: 600; color: #000;">Ringkasan Presensi</h2>
      <span style="background-color: #0070f3; color: white; padding: 6px 10px; border-radius: 20px; font-size: 12px; font-weight: 500; margin-top: 8px;">
        ${presensiData.length} Mata Kuliah
      </span>
    </div>
    
    <div style="display: flex; flex-wrap: wrap; gap: 16px;">
      <div style="flex: 1; min-width: 200px;">
        <div style="font-size: 12px; color: #666; margin-bottom: 4px;">Nama Mahasiswa</div>
        <div style="font-weight: 500;">${mahasiswaInfo.nama_mahasiswa}</div>
      </div>
      <div style="flex: 1; min-width: 100px;">
        <div style="font-size: 12px; color: #666; margin-bottom: 4px;">NIM</div>
        <div style="font-weight: 500;">${mahasiswaInfo.nim}</div>
      </div>
      <div style="flex: 1; min-width: 200px;">
        <div style="font-size: 12px; color: #666; margin-bottom: 4px;">Semester</div>
        <div style="font-weight: 500;">${mahasiswaInfo.nama_semester_registrasi}</div>
      </div>
    </div>
  `;

  // Create table container
  const tableContainer = document.createElement("div");
  tableContainer.style.cssText = `
    border-radius: 8px;
    overflow-x: auto;
    border: 1px solid #eaeaea;
  `;

  // Create table
  const table = document.createElement("table");
  table.style.cssText = `
    width: 100%;
    border-collapse: collapse;
    font-size: 14px;
    background-color: #fff;
    min-width: 650px;
  `;

  // Table header
  table.innerHTML = `
    <thead>
      <tr style="background-color: #fafafa;">
        <th style="padding: 12px 16px; text-align: left; font-weight: 600; border-bottom: 1px solid #eaeaea;">No</th>
        <th style="padding: 12px 16px; text-align: left; font-weight: 600; border-bottom: 1px solid #eaeaea;">Mata Kuliah</th>
        <th style="padding: 12px 16px; text-align: center; font-weight: 600; border-bottom: 1px solid #eaeaea;">Kode</th>
        <th style="padding: 12px 16px; text-align: center; font-weight: 600; border-bottom: 1px solid #eaeaea;">SKS</th>
        <th style="padding: 12px 16px; text-align: center; font-weight: 600; border-bottom: 1px solid #eaeaea;">Total Pertemuan</th>
        <th style="padding: 12px 16px; text-align: center; font-weight: 600; border-bottom: 1px solid #eaeaea;">Hadir</th>
        <th style="padding: 12px 16px; text-align: center; font-weight: 600; border-bottom: 1px solid #eaeaea;">Tidak Hadir</th>
        <th style="padding: 12px 16px; text-align: center; font-weight: 600; border-bottom: 1px solid #eaeaea;">Persentase</th>
      </tr>
    </thead>
    <tbody id="presensi-table-body">
    </tbody>
  `;

  // Footer with close button
  const footer = document.createElement("div");
  footer.style.cssText = `
    margin-top: 24px;
    display: flex;
    justify-content: space-between;
    align-items: center;
    flex-wrap: wrap;
  `;

  // Add overall attendance status
  const overallStatus = document.createElement("div");

  // Calculate overall attendance
  let totalPertemuanKeseluruhan = 0;
  let totalHadirKeseluruhan = 0;

  presensiData.forEach((data) => {
    const hadir = data.pertemuan.filter(
      (p) => p.presensi_status === "hadir"
    ).length;
    const totalPertemuan = data.pertemuan.length;

    totalPertemuanKeseluruhan += totalPertemuan;
    totalHadirKeseluruhan += hadir;
  });

  const persentaseKeseluruhan =
    totalPertemuanKeseluruhan > 0
      ? ((totalHadirKeseluruhan / totalPertemuanKeseluruhan) * 100).toFixed(1)
      : 0;

  const statusColor = persentaseKeseluruhan >= 75 ? "#0070f3" : "#f5a623";
  const statusBackground =
    persentaseKeseluruhan >= 75
      ? "rgba(0, 112, 243, 0.1)"
      : "rgba(245, 166, 35, 0.1)";

  overallStatus.innerHTML = `
    <div style="display: flex; align-items: center; gap: 8px; margin-bottom: 12px;">
      <div style="font-size: 14px; color: #666;">Status Kehadiran:</div>
      <div style="background-color: ${statusBackground}; color: ${statusColor}; padding: 4px 12px; border-radius: 16px; font-weight: 500;">
        ${persentaseKeseluruhan}% Keseluruhan
      </div>
    </div>
  `;

  // Close button
  const closeButton = document.createElement("button");
  closeButton.textContent = "Tutup";
  closeButton.style.cssText = `
    padding: 8px 16px;
    background-color: #0070f3;
    color: white;
    border: none;
    border-radius: 5px;
    cursor: pointer;
    font-size: 14px;
    font-weight: 500;
    transition: all 0.2s ease;
    margin-left: auto;
  `;
  closeButton.onmouseover = function () {
    this.style.backgroundColor = "#0060df";
  };
  closeButton.onmouseout = function () {
    this.style.backgroundColor = "#0070f3";
  };
  closeButton.onclick = function () {
    document.body.removeChild(popupContainer);
  };

  footer.appendChild(overallStatus);
  footer.appendChild(closeButton);

  // Assemble all elements
  tableContainer.appendChild(table);
  popupContainer.appendChild(header);
  popupContainer.appendChild(tableContainer);
  popupContainer.appendChild(footer);

  // Add to body
  document.body.appendChild(popupContainer);

  // Fill table with data
  const tableBody = document.getElementById("presensi-table-body");

  presensiData.forEach((data, index) => {
    const hadir = data.pertemuan.filter(
      (p) => p.presensi_status === "hadir"
    ).length;
    const totalPertemuan = data.pertemuan.length;
    const persentase =
      totalPertemuan > 0 ? ((hadir / totalPertemuan) * 100).toFixed(1) : 0;

    // Determine percentage color
    let statusColor, statusBg;
    if (persentase >= 85) {
      statusColor = "#10b981"; // green
      statusBg = "rgba(16, 185, 129, 0.1)";
    } else if (persentase >= 75) {
      statusColor = "#0070f3"; // blue
      statusBg = "rgba(0, 112, 243, 0.1)";
    } else if (persentase >= 50) {
      statusColor = "#f5a623"; // orange
      statusBg = "rgba(245, 166, 35, 0.1)";
    } else {
      statusColor = "#f43f5e"; // red
      statusBg = "rgba(244, 63, 94, 0.1)";
    }

    const row = document.createElement("tr");
    row.style.cssText = `
      transition: background-color 0.15s ease;
      cursor: pointer;
    `;

    row.onmouseover = function () {
      this.style.backgroundColor = "#f9fafb";
    };
    row.onmouseout = function () {
      this.style.backgroundColor = "";
    };

    // Add click event to show detailed attendance
    row.onclick = function () {
      showAttendanceDetails(data.pertemuan, data.nama_mata_kuliah);
    };

    // Add SKS (if missing, use default)
    const sks = data.sks || "3";

    row.innerHTML = `
      <td style="padding: 12px 16px; border-bottom: 1px solid #eaeaea;">${
        index + 1
      }</td>
      <td style="padding: 12px 16px; border-bottom: 1px solid #eaeaea; font-weight: 500;">${
        data.nama_mata_kuliah
      }</td>
      <td style="padding: 12px 16px; border-bottom: 1px solid #eaeaea; text-align: center;">${
        data.id_mata_kuliah
      }</td>
      <td style="padding: 12px 16px; border-bottom: 1px solid #eaeaea; text-align: center; font-weight: bold;">${sks}</td>
      <td style="padding: 12px 16px; border-bottom: 1px solid #eaeaea; text-align: center;">${totalPertemuan}</td>
      <td style="padding: 12px 16px; border-bottom: 1px solid #eaeaea; text-align: center; color: #10b981;">${hadir}</td>
      <td style="padding: 12px 16px; border-bottom: 1px solid #eaeaea; text-align: center; color: #f43f5e;">${
        totalPertemuan - hadir
      }</td>
      <td style="padding: 12px 16px; border-bottom: 1px solid #eaeaea; text-align: center;">
        <div style="display: inline-flex; align-items: center; gap: 6px; background-color: ${statusBg}; color: ${statusColor}; padding: 4px 10px; border-radius: 12px; font-weight: 500; font-size: 13px;">
          ${persentase}%
        </div>
      </td>
    `;

    tableBody.appendChild(row);
  });
}

// Rest of the original script remains the same

// Fungsi untuk menampilkan loading spinner
function showLoadingSpinner() {
  const spinnerContainer = document.createElement("div");
  spinnerContainer.id = "loading-spinner";
  spinnerContainer.style.cssText = `
      position: fixed;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      background-color: rgba(255, 255, 255, 0.8);
      display: flex;
      justify-content: center;
      align-items: center;
      z-index: 10001;
    `;

  const spinner = document.createElement("div");
  spinner.style.cssText = `
      width: 50px;
      height: 50px;
      border: 5px solid #f3f3f3;
      border-top: 5px solid #0070f3;
      border-radius: 50%;
      animation: spin 1s linear infinite;
      margin-right: 15px;
    `;

  const messageContainer = document.createElement("div");
  messageContainer.style.cssText = `
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, 'Open Sans', 'Helvetica Neue', sans-serif;
      font-size: 16px;
      color: #333;
    `;
  messageContainer.innerHTML = `
      <div style="font-weight: 500; margin-bottom: 5px;">Memuat Data Presensi</div>
      <div style="font-size: 14px; color: #666;">Mohon tunggu sebentar...</div>
    `;

  const loadingContent = document.createElement("div");
  loadingContent.style.cssText = `
      display: flex;
      align-items: center;
      padding: 20px;
      background-color: white;
      border-radius: 8px;
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
    `;

  loadingContent.appendChild(spinner);
  loadingContent.appendChild(messageContainer);
  spinnerContainer.appendChild(loadingContent);

  // Tambahkan style untuk animasi
  const styleElement = document.createElement("style");
  styleElement.textContent = `
      @keyframes spin {
        0% { transform: rotate(0deg); }
        100% { transform: rotate(360deg); }
      }
    `;
  document.head.appendChild(styleElement);

  // Tambahkan ke body
  document.body.appendChild(spinnerContainer);

  return spinnerContainer;
}

// Fungsi untuk hide loading spinner
function hideLoadingSpinner() {
  const spinner = document.getElementById("loading-spinner");
  if (spinner) {
    document.body.removeChild(spinner);
  }
}

// Modifikasi tombol floating
function addFloatingButton() {
  // Cek apakah sudah ada container
  let container = document.getElementById("floatingButtonContainer");
  if (!container) {
    container = document.createElement("div");
    container.id = "floatingButtonContainer";
    container.style.cssText = `
      position: fixed;
      bottom: 20px;
      left: 20px;
      display: flex;
      flex-direction: row;
      gap: 10px;
      z-index: 9999;
    `;
    document.body.appendChild(container);
  }

  // Tambahkan tombol presensi
  let button = document.getElementById("presensiButton");
  if (!button) {
    button = document.createElement("button");
    button.id = "presensiButton";
    button.textContent = "Lihat Presensi";
    button.style.cssText = `
      padding: 10px 16px;
      background-color: #0070f3;
      color: white;
      border: none;
      border-radius: 7px;
      cursor: pointer;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, 'Open Sans', 'Helvetica Neue', sans-serif;
      font-weight: 500;
      font-size: 14px;
      transition: background 0.2s;
      box-shadow: none;
    `;
    button.onmouseover = function () {
      this.style.backgroundColor = "#0059b2";
    };
    button.onmouseout = function () {
      this.style.backgroundColor = "#0070f3";
    };
    button.onclick = function () {
      this.disabled = true;
      this.textContent = "Memuat...";
      const spinner = showLoadingSpinner();
      fetchAllPresensiData()
        .then(() => {
          this.disabled = false;
          this.textContent = "Lihat Presensi";
          hideLoadingSpinner();
        })
        .catch((error) => {
          console.error("Error:", error);
          this.disabled = false;
          this.textContent = "Lihat Presensi";
          hideLoadingSpinner();
        });
    };
    container.appendChild(button);
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
