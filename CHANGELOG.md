# Changelog

## [4.0] - 12 September 2025

### Fitur Baru
- **Halaman-Pengaturan-Terpusat**: Tab "Setting" di dalam popup utama telah dirombak menjadi pusat kontrol. Pengguna kini dapat mengelola Kunci-Aktivasi, API-Key-Gemini, serta mengaktifkan atau menonaktifkan fitur "Auto-Selesai-Quiz" dan "Auto-Isi-Kuisioner".
- **Tombol-Reset-Aktivasi**: Pengguna sekarang dapat menghapus status aktivasi mereka langsung dari halaman pengaturan untuk memulai ulang proses aktivasi jika diperlukan.

### Keamanan
- **Sistem-Kunci-Aktivasi**: Ekstensi kini memerlukan "Kunci-Aktivasi" yang unik untuk setiap pengguna, yang harus disetujui dan diberikan langsung oleh developer untuk mencegah penggunaan yang tidak sah.
- **Pembaruan-Wajib-(Force-Update)**: Mekanisme "Kill-Switch" telah diimplementasikan. Ekstensi akan memeriksa versi minimum yang diizinkan dari server. Jika versi yang digunakan pengguna sudah usang, fungsionalitas akan diblokir total dan pengguna akan diminta untuk melakukan update, memastikan semua pengguna berada di versi yang paling aman.

### Peningkatan
- **Logika-Fitur-Terkontrol**: Fitur "Auto-Isi-Kuisioner" sekarang hanya akan aktif jika toggle-nya dihidupkan di Halaman-Pengaturan-Terpusat.
- **UI-Pengaturan**: Antarmuka halaman pengaturan didesain ulang agar lebih bersih, informatif, dan mudah digunakan oleh pengguna.