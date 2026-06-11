# Skenario Pengujian Modul Users

Pengujian dilakukan untuk memastikan bahwa operasional pada modul Users dapat dilaksanakan sesuai dengan kebutuhan sistem. Modul *users* dikembangkan untuk memfasilitasi pembaruan data personal pengguna secara mandiri. Informasi profil lengkap dapat diakses untuk ditampilkan pada menu pengaturan akun di antarmuka pengguna. Pembaruan data pribadi seperti nama lengkap, alamat email, serta perubahan kata sandi diproses dengan menyertakan verifikasi kredensial lama demi alasan keamanan. Pembatasan akses diterapkan sepenuhnya pada tingkat pengontrol sehingga setiap pengguna hanya dapat melihat dan memperbarui datanya sendiri. Fokus pengujian diletakkan pada fungsionalitas utama, validasi input, serta kepatuhan terhadap batasan hak akses (role-based access control).

### Tabel Skenario Pengujian Modul Users

| ID Test | Route Name | HTTP Method | Endpoint | Request Body | Response Yang Diharapkan |
|---|---|---|---|---|---|
| TC-USERS-001 | Mengambil profil detail lengkap dari pengguna yang sedang terautentikasi | GET | `/users/me` | - | Status 200/201 OK dengan data |
| TC-USERS-002 | Memperbarui informasi profil pengguna yang sedang aktif (nama, email, atau sandi baru) | PATCH | `/users/me` | Data JSON sesuai skema request | Status 200/201 OK dengan data |


Verifikasi terhadap kemampuan sistem diharapkan dapat dicapai melalui skenario pengujian di atas. Seluruh pengujian harus dipastikan telah mencakup penegakan hak akses pada tiap endpoint, serta pengembalian respons yang sesuai baik untuk skenario sukses maupun skenario penanganan kesalahan (error handling).


### Tabel Skenario Pengujian Graybox Modul Users

| ID Test | Endpoint | HTTP Method | Skenario Uji (Graybox) | Pengecekan Internal (Sistem/DB) | Expected Output |
|---|---|---|---|---|---|
| TC-GB-USERS-001 | `/users/me` | GET | Menguji keberhasilan operasi: Mengambil profil detail lengkap dari pengguna yang sedang terautentikasi (Valid/Authorized) | Verifikasi query yang dieksekusi database menggunakan parameter yang benar dan mengembalikan relasi data dengan tepat. | Status 200/201 OK |
| TC-GB-USERS-002 | `/users/me` | GET | Menguji penolakan operasi: Mengambil profil detail lengkap dari pengguna yang sedang terautentikasi dengan akses yang tidak sah atau data invalid | Mengecek penjagaan sistem pada level middleware/controller untuk memastikan transaksi database di-rollback atau tidak dipanggil sama sekali. | Status 400/401/403/404 Error |
| TC-GB-USERS-003 | `/users/me` | PATCH | Menguji keberhasilan operasi: Memperbarui informasi profil pengguna yang sedang aktif (nama, email, atau sandi baru) (Valid/Authorized) | Verifikasi perubahan state (Insert/Update) pada database tabel terkait; cek log aktivitas. | Status 200/201 OK |
| TC-GB-USERS-004 | `/users/me` | PATCH | Menguji penolakan operasi: Memperbarui informasi profil pengguna yang sedang aktif (nama, email, atau sandi baru) dengan akses yang tidak sah atau data invalid | Mengecek penjagaan sistem pada level middleware/controller untuk memastikan transaksi database di-rollback atau tidak dipanggil sama sekali. | Status 400/401/403/404 Error |
