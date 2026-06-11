# Skenario Pengujian Modul Authentication

Pengujian dilakukan untuk memastikan bahwa operasional pada modul Authentication dapat dilaksanakan sesuai dengan kebutuhan sistem. Daftar *endpoint* pada modul *authentication* digunakan untuk mengelola akses pengguna ke dalam sistem secara aman. Proses registrasi akun pengguna baru dan pendaftaran perusahaan dilakukan secara terbuka tanpa memerlukan token otorisasi. Proses masuk sistem diverifikasi melalui kredensial pengguna untuk menghasilkan token akses. Pengguna yang telah terautentikasi dapat mengakses data profil pribadi serta melakukan proses keluar sistem untuk membatalkan keaktifan token. Seluruh mekanisme pengamanan ini diterapkan guna mencegah akses ilegal ke modul internal lainnya. Fokus pengujian diletakkan pada fungsionalitas utama, validasi input, serta kepatuhan terhadap batasan hak akses (role-based access control).

### Tabel Skenario Pengujian Modul Authentication

| ID Test | Route Name | HTTP Method | Endpoint | Request Body | Response Yang Diharapkan |
|---|---|---|---|---|---|
| TC-AUTHE-001 | Mendaftarkan akun pengguna baru | POST | `/auth/register` | Data JSON sesuai skema request | Status 200/201 OK dengan data |
| TC-AUTHE-002 | Mendaftarkan perusahaan baru beserta akun owner | POST | `/auth/register-company` | Data JSON sesuai skema request | Status 200/201 OK dengan data |
| TC-AUTHE-003 | Melakukan autentikasi pengguna untuk masuk ke dalam sistem | POST | `/auth/login` | Data JSON sesuai skema request | Status 200/201 OK dengan data |
| TC-AUTHE-004 | Melakukan proses keluar dari sistem dengan memvalidasi token | POST | `/auth/logout` | Data JSON sesuai skema request | Status 200/201 OK dengan data |
| TC-AUTHE-005 | Mengambil informasi profil pengguna yang sedang masuk | GET | `/auth/profile` | - | Status 200/201 OK dengan data |


Verifikasi terhadap kemampuan sistem diharapkan dapat dicapai melalui skenario pengujian di atas. Seluruh pengujian harus dipastikan telah mencakup penegakan hak akses pada tiap endpoint, serta pengembalian respons yang sesuai baik untuk skenario sukses maupun skenario penanganan kesalahan (error handling).


### Tabel Skenario Pengujian Graybox Modul Authentication

| ID Test | Endpoint | HTTP Method | Skenario Uji (Graybox) | Pengecekan Internal (Sistem/DB) | Expected Output |
|---|---|---|---|---|---|
| TC-GB-AUTHE-001 | `/auth/register` | POST | Menguji keberhasilan operasi: Mendaftarkan akun pengguna baru (Valid/Authorized) | Verifikasi perubahan state (Insert/Update) pada database tabel terkait; cek log aktivitas. | Status 200/201 OK |
| TC-GB-AUTHE-002 | `/auth/register` | POST | Menguji penolakan operasi: Mendaftarkan akun pengguna baru dengan akses yang tidak sah atau data invalid | Mengecek penjagaan sistem pada level middleware/controller untuk memastikan transaksi database di-rollback atau tidak dipanggil sama sekali. | Status 400/401/403/404 Error |
| TC-GB-AUTHE-003 | `/auth/register-company` | POST | Menguji keberhasilan operasi: Mendaftarkan perusahaan baru beserta akun owner (Valid/Authorized) | Verifikasi perubahan state (Insert/Update) pada database tabel terkait; cek log aktivitas. | Status 200/201 OK |
| TC-GB-AUTHE-004 | `/auth/register-company` | POST | Menguji penolakan operasi: Mendaftarkan perusahaan baru beserta akun owner dengan akses yang tidak sah atau data invalid | Mengecek penjagaan sistem pada level middleware/controller untuk memastikan transaksi database di-rollback atau tidak dipanggil sama sekali. | Status 400/401/403/404 Error |
| TC-GB-AUTHE-005 | `/auth/login` | POST | Menguji keberhasilan operasi: Melakukan autentikasi pengguna untuk masuk ke dalam sistem (Valid/Authorized) | Verifikasi perubahan state (Insert/Update) pada database tabel terkait; cek log aktivitas. | Status 200/201 OK |
| TC-GB-AUTHE-006 | `/auth/login` | POST | Menguji penolakan operasi: Melakukan autentikasi pengguna untuk masuk ke dalam sistem dengan akses yang tidak sah atau data invalid | Mengecek penjagaan sistem pada level middleware/controller untuk memastikan transaksi database di-rollback atau tidak dipanggil sama sekali. | Status 400/401/403/404 Error |
| TC-GB-AUTHE-007 | `/auth/logout` | POST | Menguji keberhasilan operasi: Melakukan proses keluar dari sistem dengan memvalidasi token (Valid/Authorized) | Verifikasi perubahan state (Insert/Update) pada database tabel terkait; cek log aktivitas. | Status 200/201 OK |
| TC-GB-AUTHE-008 | `/auth/logout` | POST | Menguji penolakan operasi: Melakukan proses keluar dari sistem dengan memvalidasi token dengan akses yang tidak sah atau data invalid | Mengecek penjagaan sistem pada level middleware/controller untuk memastikan transaksi database di-rollback atau tidak dipanggil sama sekali. | Status 400/401/403/404 Error |
| TC-GB-AUTHE-009 | `/auth/profile` | GET | Menguji keberhasilan operasi: Mengambil informasi profil pengguna yang sedang masuk (Valid/Authorized) | Verifikasi query yang dieksekusi database menggunakan parameter yang benar dan mengembalikan relasi data dengan tepat. | Status 200/201 OK |
| TC-GB-AUTHE-010 | `/auth/profile` | GET | Menguji penolakan operasi: Mengambil informasi profil pengguna yang sedang masuk dengan akses yang tidak sah atau data invalid | Mengecek penjagaan sistem pada level middleware/controller untuk memastikan transaksi database di-rollback atau tidak dipanggil sama sekali. | Status 400/401/403/404 Error |
