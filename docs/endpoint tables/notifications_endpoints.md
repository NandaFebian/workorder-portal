# Notifications Endpoints

Perancangan antarmuka pemrograman aplikasi (API) pada modul *notifications* disajikan dalam bentuk daftar *endpoint*. Rincian *endpoint* tersebut dapat dilihat pada tabel berikut.

| No | Endpoint | Method | Deskripsi | Autentikasi | Role Required |
|---|---|---|---|---|---|
| 1 | `/notifications` | GET | Mengambil daftar pesan notifikasi masuk milik pengguna | Ya | Authenticated User |
| 2 | `/notifications/fcm-token` | POST | Mendaftarkan token perangkat FCM baru milik pengguna | Ya | Authenticated User |
| 3 | `/notifications/fcm-token` | DELETE | Menghapus token perangkat FCM dari profil pengguna | Ya | Authenticated User |

Modul *notifications* digunakan untuk mengelola kotak masuk notifikasi dan pendaftaran token perangkat pengguna guna mendukung pengiriman notifikasi langsung (*push notifications*). Token perangkat Firebase Cloud Messaging (FCM) disimpan ke dalam sistem ketika pengguna melakukan proses masuk melalui perangkat mobile. Token tersebut akan dihapus saat pengguna melakukan keluar sistem agar notifikasi tidak lagi dikirimkan ke perangkat terkait. Akses masuk kotak notifikasi dibatasi agar setiap pengguna hanya dapat melihat pesan pemberitahuan yang ditujukan untuk dirinya sendiri.
