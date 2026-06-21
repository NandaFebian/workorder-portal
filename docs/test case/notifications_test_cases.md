# Skenario Pengujian Modul Notifications

Pengujian dilakukan untuk memastikan bahwa operasional pada modul Notifications dapat dilaksanakan sesuai dengan kebutuhan sistem. Daftar *endpoint* pada modul *notifications* digunakan untuk mengelola mekanisme pemberitahuan berbasis push notification kepada pengguna. Proses pendaftaran dan penghapusan FCM token memungkinkan perangkat pengguna terhubung dan terputus dari layanan notifikasi. Endpoint pengambilan daftar notifikasi menyajikan riwayat pemberitahuan yang relevan bagi pengguna yang terautentikasi. Seluruh endpoint pada modul ini memerlukan token otorisasi guna memastikan hanya pengguna yang sah yang dapat mengelola dan mengakses data notifikasi miliknya. Fokus pengujian diletakkan pada fungsionalitas utama, validasi input, serta kepatuhan terhadap batasan hak akses.

### Tabel Skenario Pengujian Modul Notifications

| ID Test | Route Name | HTTP Method | Endpoint | Request Body | Response Yang Diharapkan |
|---|---|---|---|---|---|
| TC-NOTIF-001 | Mendaftarkan FCM token untuk push notification | POST | `/notifications/fcm-token` | Data JSON sesuai skema request | Status 200/201 OK dengan data |
| TC-NOTIF-002 | Menghapus FCM token | DELETE | `/notifications/fcm-token` | Data JSON sesuai skema request | Status 200/201 OK dengan data |
| TC-NOTIF-003 | Mengambil daftar notifikasi pengguna | GET | `/notifications` | - | Status 200/201 OK dengan data |


Verifikasi terhadap kemampuan sistem diharapkan dapat dicapai melalui skenario pengujian di atas. Seluruh pengujian harus dipastikan telah mencakup penegakan hak akses pada tiap endpoint, serta pengembalian respons yang sesuai baik untuk skenario sukses maupun skenario penanganan kesalahan (error handling).


### Tabel Skenario Pengujian Graybox Modul Notifications

| ID Test | Endpoint | HTTP Method | Skenario Uji (Graybox) | Pengecekan Internal (Sistem/DB) | Expected Output |
|---|---|---|---|---|---|
| TC-GB-NOTIF-001 | `/notifications/fcm-token` | POST | Menguji keberhasilan operasi: Mendaftarkan FCM token untuk push notification (Valid/Authorized) | Verifikasi perubahan state (Insert/Update) pada database tabel terkait; cek log aktivitas. | Status 200/201 OK |
| TC-GB-NOTIF-002 | `/notifications/fcm-token` | POST | Menguji penolakan operasi: Mendaftarkan FCM token untuk push notification dengan akses yang tidak sah atau data invalid | Mengecek penjagaan sistem pada level middleware/controller untuk memastikan transaksi database di-rollback atau tidak dipanggil sama sekali. | Status 400/401/403/404 Error |
| TC-GB-NOTIF-003 | `/notifications/fcm-token` | DELETE | Menguji keberhasilan operasi: Menghapus FCM token (Valid/Authorized) | Verifikasi perubahan state (Delete) pada database tabel terkait; cek log aktivitas. | Status 200/201 OK |
| TC-GB-NOTIF-004 | `/notifications/fcm-token` | DELETE | Menguji penolakan operasi: Menghapus FCM token dengan akses yang tidak sah atau data invalid | Mengecek penjagaan sistem pada level middleware/controller untuk memastikan transaksi database di-rollback atau tidak dipanggil sama sekali. | Status 400/401/403/404 Error |
| TC-GB-NOTIF-005 | `/notifications` | GET | Menguji keberhasilan operasi: Mengambil daftar notifikasi pengguna (Valid/Authorized) | Verifikasi query yang dieksekusi database menggunakan parameter yang benar dan mengembalikan relasi data dengan tepat. | Status 200/201 OK |
| TC-GB-NOTIF-006 | `/notifications` | GET | Menguji penolakan operasi: Mengambil daftar notifikasi pengguna dengan akses yang tidak sah atau data invalid | Mengecek penjagaan sistem pada level middleware/controller untuk memastikan transaksi database di-rollback atau tidak dipanggil sama sekali. | Status 400/401/403/404 Error |
