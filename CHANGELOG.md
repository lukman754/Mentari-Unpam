# Changelog

## [3.0] - 2025-09-08

### Added
- **Notifikasi Toast Kustom:** Menerapkan sistem notifikasi toast kustom non-pemblokiran untuk menggantikan `alert()` bawaan browser. Ini memberikan pengalaman pengguna yang lebih baik untuk pesan kesalahan dan pesan sukses.
- **UI Catatan Modern:** Memperkenalkan UI yang sepenuhnya didesain ulang untuk fitur "Tambahkan Catatan" di halaman kursus, menampilkan desain glassmorphism modern, tipografi yang ditingkatkan, dan elemen interaktif.

### Changed
- Tombol "Tambahkan Catatan" di jendela pop-up kini memicu antarmuka catatan baru yang didesain ulang.
- Pesan kesalahan (misalnya, saat tidak berada di halaman kursus) kini ditampilkan menggunakan sistem notifikasi khusus yang baru.

### Fixed
- **Kesalahan Sintaks Kritis:** Mengatasi `SyntaxError: Unexpected token 'function'` dengan menghapus kode lama yang redundan yang menyebabkan skrip gagal.
- **Gaya Peringatan Hilang:** Memperbaiki bug di mana peringatan khusus dibuat secara fungsional tetapi tetap tidak terlihat karena aturan CSS yang hilang.
- **Responsivitas Mobile:** Memperbaiki gaya peringatan khusus pada perangkat Mobile dengan menggunakan `calc()` untuk `max-width`, memastikan margin yang tepat dan mencegah elemen menjadi terlalu lebar pada layar yang lebih kecil.