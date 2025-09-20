<div align="center">
  <img src="https://raw.githubusercontent.com/AnandaAnugrahHandyanto/mentari_unpam-mod/main/assets/icons/icon.png" width="200" alt="MENTARI MOD Logo">

# MENTARI MOD

### Manajemen Terpadu Pembelajaran Daring

[![GitHub issues](https://img.shields.io/github/issues/AnandaAnugrahHandyanto/mentari_unpam-mod?color=green&style=for-the-badge)](https://github.com/AnandaAnugrahHandyanto/mentari_unpam-mod/issues)
[![GitHub stars](https://img.shields.io/github/stars/AnandaAnugrahHandyanto/mentari_unpam-mod?style=for-the-badge)](https://github.com/AnandaAnugrahHandyanto/mentari_unpam-mod/stargazers)
[![GitHub license](https://img.shields.io/github/license/AnandaAnugrahHandyanto/mentari_unpam-mod?style=for-the-badge)](https://github.com/AnandaAnugrahHandyanto/mentari_unpam-mod/blob/main/LICENSE)
[![Version](https://img.shields.io/badge/version-5.3-blue?style=for-the-badge)](https://github.com/AnandaAnugrahHandyanto/mentari_unpam-mod/blob/main/manifest.json)

</div>

## 🚀 Tentang MENTARI MOD

**MENTARI MOD** adalah ekstensi browser yang dirancang untuk meningkatkan dan memaksimalkan pengalaman belajar pada platform MENTARI (_Manajemen Terpadu Pembelajaran Daring_) Universitas Pamulang. Ekstensi ini menambahkan serangkaian fitur canggih yang tidak tersedia secara default, menjadikan pembelajaran daring lebih efisien, interaktif, dan modern.

Dengan antarmuka _glassmorphism_ yang elegan dan fungsionalitas yang kaya, MENTARI MOD mengubah cara mahasiswa berinteraksi dengan portal akademik mereka.

<div align="center">
  <img src="https://github.com/user-attachments/assets/13180860-d3fd-4a38-8043-9171dc8d4a17" width="85%" alt="Mentari Mod Preview">
</div>

## 💎 Fitur Unggulan

### 🧩 Dasbor MENTARI MOD

- **🎨 Antarmuka Modern**: UI mengambang (_floating_) dengan efek _glassmorphism_ yang dapat digeser dan diciutkan, memberikan akses cepat tanpa mengganggu halaman.
- **💬 Pelacakan Forum Cerdas**: Secara otomatis mengidentifikasi dan menampilkan forum diskusi yang masih aktif (belum terjawab atau belum melewati post-test), serta mengurutkan mata kuliah berdasarkan hari.
- **🔔 Notifikasi Dosen**: Menerima pemberitahuan _real-time_ ketika dosen membalas diskusi Anda, langsung di dalam dasbor.
- **👥 Dasbor Mahasiswa & Kelompok**: Mengubah daftar nama sederhana menjadi dasbor interaktif yang menampilkan statistik kelas dan alat untuk membuat kelompok belajar (berurutan atau acak) dengan mudah.
- **📝 Catatan Pribadi**: Fitur untuk menambahkan dan menyimpan catatan pribadi langsung di halaman mata kuliah terkait.
- **⚙️ Pengaturan Terpusat**: Mengelola Kunci Aktivasi, API Key Gemini, dan mengaktifkan/menonaktifkan fitur-fitur automasi melalui satu tab pengaturan yang rapi.

### 🤖 Asisten AI Gemini

- **⚡ Akses Cepat**: Terintegrasi sebagai chatbot mengambang yang dapat diakses di semua halaman Mentari.
- **🧠 Bantuan Kontekstual**: Mampu menyalin pertanyaan dari forum diskusi dan kuis secara otomatis untuk dianalisis.
- **📝 Prompt Cerdas**: Dilengkapi dengan berbagai _template prompt_ (misalnya, "Jelaskan secara singkat", "Beri 3 poin utama") untuk mendapatkan jawaban yang sesuai kebutuhan.
- **📋 Salin & Tempel Cerdas**: Jawaban dari AI dapat langsung disalin ke _clipboard_ atau ke _textarea_ balasan forum dengan sekali klik.

### ⚡ Fitur Otomatisasi & Bantuan

- **🤖 Auto-Login**: Mengisi _password_ secara otomatis berdasarkan NIM pada halaman login Mentari & MyUNPAM.
- **✅ Auto-Kuesioner**: Secara otomatis mengisi dan mengirim kuesioner dosen dengan satu klik.
- **💯 Quiz Helper**: (Fitur opsional) Memberikan bantuan jawaban pada halaman kuis, lengkap dengan penjelasan dari AI.
- **🗓️ Presensi Terpadu**: Terintegrasi dengan `my.unpam.ac.id` untuk menampilkan rekapitulasi presensi semua mata kuliah dalam satu tabel ringkas.

## 📦 Instalasi

### 💻 Windows/macOS (Browser Berbasis Chromium)

1.  **Unduh** file `MentariEnhancer_v5.3.zip` dari halaman [Releases](https://github.com/AnandaAnugrahHandyanto/mentari_unpam-mod/releases/latest).
2.  **Ekstrak** file zip tersebut ke dalam sebuah folder.
3.  Buka browser Anda (Chrome, Edge, Brave) dan navigasi ke `chrome://extensions/`.
4.  Aktifkan **"Mode Pengembang"** (Developer Mode) yang biasanya terletak di pojok kanan atas.
5.  Klik tombol **"Load unpacked"** dan pilih folder tempat Anda mengekstrak file tadi.
6.  Ekstensi MENTARI MOD siap digunakan! Buka halaman [Mentari](https://mentari.unpam.ac.id/) dan nikmati fitur-fiturnya.

## ❓ FAQ (Tanya Jawab)

<details>
<summary><b>🔒 Apakah ekstensi ini aman?</b></summary>
<div style="padding: 10px;">
  Ya. Ekstensi ini dirancang dengan prinsip privasi. Kunci Aktivasi dan API Key Gemini Anda disimpan secara aman di penyimpanan lokal browser dan tidak pernah dikirim ke server lain selain ke server validasi resmi dan Google AI.
</div>
</details>

<details>
<summary><b>🔑 Mengapa saya butuh Kunci Aktivasi & API Key Gemini?</b></summary>
<div style="padding: 10px;">
  - Kunci Aktivasi diperlukan untuk verifikasi dan mengaktifkan fungsionalitas premium dari MOD ini.
  - API Key Gemini diperlukan agar Anda dapat berkomunikasi dengan model AI Google untuk fitur asisten dan bantuan kuis. Anda bisa mendapatkannya secara gratis di <a href="https://aistudio.google.com/apikey" target="_blank">Google AI Studio</a>.
</div>
</details>

<details>
<summary><b>🔄 Bagaimana cara memperbarui ekstensi?</b></summary>
<div style="padding: 10px;">
  Cukup hapus folder ekstensi yang lama, lalu ulangi proses instalasi dengan versi terbaru yang diunduh dari halaman [Releases](https://github.com/AnandaAnugrahHandyanto/mentari_unpam-mod/releases/latest).
</div>
</details>

## 📄 Lisensi

Proyek ini dilisensikan di bawah [MIT License](https://github.com/AnandaAnugrahHandyanto/mentari_unpam-mod/blob/main/LICENSE).

---

<div align="center">
  <p>Dibuat dengan ❤️ untuk mahasiswa UNPAM</p>

| **Lukman Muludin** | **Ananda Anugrah H** |
| :---: | :---: |
| _Lead Dev_ | _Backend & Logic Dev_ |
| [![GitHub](https://img.shields.io/badge/GitHub-Lukman754-181717?style=for-the-badge&logo=github)](https://github.com/Lukman754) | [![GitHub](https://img.shields.io/badge/GitHub-AnandaAnugrah-181717?style=for-the-badge&logo=github)](https://github.com/AnandaAnugrahHandyanto) |
| [![Instagram](https://img.shields.io/badge/Instagram-_.chopin-E4405F?style=for-the-badge&logo=instagram)](https://instagram.com/_.chopin) | [![Instagram](https://img.shields.io/badge/Instagram-nando_fiingerstyle-E4405F?style=for-the-badge&logo=instagram)](https://instagram.com/nando_fiingerstyle) |
</div>