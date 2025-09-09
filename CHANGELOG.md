# Changelog

## [3.4] - 10 September 2025

### Fitur Baru
- **Notifikasi Pembaruan**: Menambahkan sistem pengecekan versi otomatis di dalam ekstensi. Sekarang, notifikasi akan muncul di tab "Forum" jika ada versi baru yang tersedia di GitHub, lengkap dengan tautan untuk mengunduh.

### Perbaikan Bug
- **Konteks Eksekusi**: Memperbaiki error `Cannot read properties of undefined (reading 'getManifest')` yang terjadi karena pemanggilan API `chrome.runtime` dari konteks halaman web. Versi ekstensi kini diteruskan dengan aman dari *content script* ke skrip yang diinjeksi.