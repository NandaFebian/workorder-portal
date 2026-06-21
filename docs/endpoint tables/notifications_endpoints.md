# Notifications Endpoints

Perancangan antarmuka pemrograman aplikasi (API) pada modul *notifications* disajikan dalam bentuk daftar *endpoint*. Rincian *endpoint* tersebut dapat dilihat pada tabel berikut.

| No | Endpoint | Method | Deskripsi | Autentikasi | Role Required |
|---|---|---|---|---|---|
| 1 | `/notifications` | GET | Mengambil daftar pesan notifikasi masuk milik pengguna | Ya | Authenticated User |
| 2 | `/notifications/fcm-token` | POST | Mendaftarkan token perangkat FCM baru milik pengguna | Ya | Authenticated User |
| 3 | `/notifications/fcm-token` | DELETE | Menghapus token perangkat FCM dari profil pengguna | Ya | Authenticated User |

Pengelolaan notifikasi masuk dan registrasi token perangkat pengguna untuk pengiriman notifikasi langsung difasilitasi melalui daftar endpoint modul notifications berdasarkan tabel di atas. Mekanisme keamanan perangkat sistem untuk memastikan notifikasi hanya dikirimkan ke perangkat yang sah ditunjukkan oleh kolom Autentikasi dan Deskripsi yang mewajibkan token pada seluruh operasi FCM token. Pengalaman pengguna yang personal dan tepat sasaran dijamin melalui pengikatan token perangkat dengan sesi pengguna, sehingga notifikasi tidak lagi dikirimkan ke perangkat yang tidak aktif setelah logout.
