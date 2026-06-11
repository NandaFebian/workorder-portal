# Skenario Pengujian Modul Notifications

Pengujian dilakukan untuk memastikan bahwa operasional pada modul Notifications dapat dilaksanakan sesuai dengan kebutuhan sistem. Modul *notifications* digunakan untuk mengelola kotak masuk notifikasi dan pendaftaran token perangkat pengguna guna mendukung pengiriman notifikasi langsung (*push notifications*). Token perangkat Firebase Cloud Messaging (FCM) disimpan ke dalam sistem ketika pengguna melakukan proses masuk melalui perangkat mobile. Token tersebut akan dihapus saat pengguna melakukan keluar sistem agar notifikasi tidak lagi dikirimkan ke perangkat terkait. Akses masuk kotak notifikasi dibatasi agar setiap pengguna hanya dapat melihat pesan pemberitahuan yang ditujukan untuk dirinya sendiri. Fokus pengujian diletakkan pada fungsionalitas utama, validasi input, serta kepatuhan terhadap batasan hak akses (role-based access control).

### Tabel Skenario Pengujian Modul Notifications

| ID Test | Route Name | HTTP Method | Endpoint | Request Body | Response Yang Diharapkan |
|---|---|---|---|---|---|
| TC-NOTIF-001 | Mengambil daftar pesan notifikasi masuk milik pengguna | GET | `/notifications` | - | Status 200/201 OK dengan data |
| TC-NOTIF-002 | Mendaftarkan token perangkat FCM baru milik pengguna | POST | `/notifications/fcm-token` | Data JSON sesuai skema request | Status 200/201 OK dengan data |
| TC-NOTIF-003 | Menghapus token perangkat FCM dari profil pengguna | DELETE | `/notifications/fcm-token` | - | Status 200/204 Success |


Verifikasi terhadap kemampuan sistem diharapkan dapat dicapai melalui skenario pengujian di atas. Seluruh pengujian harus dipastikan telah mencakup penegakan hak akses pada tiap endpoint, serta pengembalian respons yang sesuai baik untuk skenario sukses maupun skenario penanganan kesalahan (error handling).


### Tabel Skenario Pengujian Graybox Modul Notifications

| ID Test | Endpoint | HTTP Method | Skenario Uji (Graybox) | Pengecekan Internal (Sistem/DB) | Expected Output |
|---|---|---|---|---|---|
| TC-GB-NOTIF-001 | `/notifications` | GET | Menguji keberhasilan operasi: Mengambil daftar pesan notifikasi masuk milik pengguna (Valid/Authorized) | Verifikasi query yang dieksekusi database menggunakan parameter yang benar dan mengembalikan relasi data dengan tepat. | Status 200/201 OK |
| TC-GB-NOTIF-002 | `/notifications` | GET | Menguji penolakan operasi: Mengambil daftar pesan notifikasi masuk milik pengguna dengan akses yang tidak sah atau data invalid | Mengecek penjagaan sistem pada level middleware/controller untuk memastikan transaksi database di-rollback atau tidak dipanggil sama sekali. | Status 400/401/403/404 Error |
| TC-GB-NOTIF-003 | `/notifications/fcm-token` | POST | Menguji keberhasilan operasi: Mendaftarkan token perangkat FCM baru milik pengguna (Valid/Authorized) | Verifikasi perubahan state (Insert/Update) pada database tabel terkait; cek log aktivitas. | Status 200/201 OK |
| TC-GB-NOTIF-004 | `/notifications/fcm-token` | POST | Menguji penolakan operasi: Mendaftarkan token perangkat FCM baru milik pengguna dengan akses yang tidak sah atau data invalid | Mengecek penjagaan sistem pada level middleware/controller untuk memastikan transaksi database di-rollback atau tidak dipanggil sama sekali. | Status 400/401/403/404 Error |
| TC-GB-NOTIF-005 | `/notifications/fcm-token` | DELETE | Menguji keberhasilan operasi: Menghapus token perangkat FCM dari profil pengguna (Valid/Authorized) | Verifikasi flag soft-delete (deleted_at) atau hard-delete pada database tabel terkait. | Status 200/204 Success |
| TC-GB-NOTIF-006 | `/notifications/fcm-token` | DELETE | Menguji penolakan operasi: Menghapus token perangkat FCM dari profil pengguna dengan akses yang tidak sah atau data invalid | Mengecek penjagaan sistem pada level middleware/controller untuk memastikan transaksi database di-rollback atau tidak dipanggil sama sekali. | Status 400/401/403/404 Error |
