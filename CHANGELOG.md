# Changelog

## [3.9] - 11 September 2025

### Keamanan
- **Menambahkan Mekanisme Paksa Update (Kill Switch)**: Ekstensi kini akan memeriksa versi minimum yang diizinkan untuk berjalan dari server. Jika pengguna menggunakan versi yang lebih lama dari versi minimum yang ditetapkan, fungsionalitas ekstensi akan diblokir dan pengguna akan diminta untuk melakukan update ke versi terbaru.
- **Peningkatan Keamanan**: Fitur ini memastikan bahwa pengguna tidak dapat lagi menggunakan versi lama yang tidak memiliki sistem Kunci Aktivasi, sehingga menutup celah keamanan.

### Ditambahkan
- **File Kontrol Versi**: Membuat file `version_info.json` di server untuk mengelola versi minimum yang diizinkan dari jarak jauh.
- **Popup Paksa Update**: Menambahkan antarmuka popup yang akan menutupi layar dan mengarahkan pengguna untuk mengunduh versi terbaru jika versi mereka sudah usang.