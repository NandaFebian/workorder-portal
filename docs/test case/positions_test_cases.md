# Skenario Pengujian Modul Positions

Pengujian dilakukan untuk memastikan bahwa operasional pada modul Positions dapat dilaksanakan sesuai dengan kebutuhan sistem. Modul *positions* dikembangkan untuk mengelola struktur jabatan kerja pegawai di dalam perusahaan. Pembacaan daftar jabatan dapat dilakukan oleh seluruh pegawai perusahaan untuk memudahkan koordinasi internal. Pembuatan dan pembaruan informasi posisi dibatasi untuk tingkat manajerial ke atas demi menjaga kestabilan organisasi. Penghapusan posisi dibatasi secara ketat hanya dapat dilakukan oleh pemilik perusahaan (*owner*) guna mencegah hilangnya data posisi yang sedang aktif digunakan. Fokus pengujian diletakkan pada fungsionalitas utama, validasi input, serta kepatuhan terhadap batasan hak akses (role-based access control).

### Tabel Skenario Pengujian Modul Positions

| ID Test | Route Name | HTTP Method | Endpoint | Request Body | Response Yang Diharapkan |
|---|---|---|---|---|---|
| TC-POSIT-001 | Mengambil semua daftar posisi jabatan yang ada di perusahaan | GET | `/positions` | - | Status 200/201 OK dengan data |
| TC-POSIT-002 | Mengambil detail informasi posisi jabatan beserta daftar pegawainya | GET | `/positions/:id` | - | Status 200/201 OK dengan data |
| TC-POSIT-003 | Membuat posisi jabatan baru di dalam perusahaan | POST | `/positions` | Data JSON sesuai skema request | Status 200/201 OK dengan data |
| TC-POSIT-004 | Memperbarui rincian informasi posisi jabatan berdasarkan ID | PUT | `/positions/:id` | Data JSON sesuai skema request | Status 200/201 OK dengan data |
| TC-POSIT-005 | Menghapus posisi jabatan dari sistem perusahaan | DELETE | `/positions/:id` | - | Status 200/204 Success |


Verifikasi terhadap kemampuan sistem diharapkan dapat dicapai melalui skenario pengujian di atas. Seluruh pengujian harus dipastikan telah mencakup penegakan hak akses pada tiap endpoint, serta pengembalian respons yang sesuai baik untuk skenario sukses maupun skenario penanganan kesalahan (error handling).


### Tabel Skenario Pengujian Graybox Modul Positions

| ID Test | Endpoint | HTTP Method | Skenario Uji (Graybox) | Pengecekan Internal (Sistem/DB) | Expected Output |
|---|---|---|---|---|---|
| TC-GB-POSIT-001 | `/positions` | GET | Menguji keberhasilan operasi: Mengambil semua daftar posisi jabatan yang ada di perusahaan (Valid/Authorized) | Verifikasi query yang dieksekusi database menggunakan parameter yang benar dan mengembalikan relasi data dengan tepat. | Status 200/201 OK |
| TC-GB-POSIT-002 | `/positions` | GET | Menguji penolakan operasi: Mengambil semua daftar posisi jabatan yang ada di perusahaan dengan akses yang tidak sah atau data invalid | Mengecek penjagaan sistem pada level middleware/controller untuk memastikan transaksi database di-rollback atau tidak dipanggil sama sekali. | Status 400/401/403/404 Error |
| TC-GB-POSIT-003 | `/positions/:id` | GET | Menguji keberhasilan operasi: Mengambil detail informasi posisi jabatan beserta daftar pegawainya (Valid/Authorized) | Verifikasi query yang dieksekusi database menggunakan parameter yang benar dan mengembalikan relasi data dengan tepat. | Status 200/201 OK |
| TC-GB-POSIT-004 | `/positions/:id` | GET | Menguji penolakan operasi: Mengambil detail informasi posisi jabatan beserta daftar pegawainya dengan akses yang tidak sah atau data invalid | Mengecek penjagaan sistem pada level middleware/controller untuk memastikan transaksi database di-rollback atau tidak dipanggil sama sekali. | Status 400/401/403/404 Error |
| TC-GB-POSIT-005 | `/positions` | POST | Menguji keberhasilan operasi: Membuat posisi jabatan baru di dalam perusahaan (Valid/Authorized) | Verifikasi perubahan state (Insert/Update) pada database tabel terkait; cek log aktivitas. | Status 200/201 OK |
| TC-GB-POSIT-006 | `/positions` | POST | Menguji penolakan operasi: Membuat posisi jabatan baru di dalam perusahaan dengan akses yang tidak sah atau data invalid | Mengecek penjagaan sistem pada level middleware/controller untuk memastikan transaksi database di-rollback atau tidak dipanggil sama sekali. | Status 400/401/403/404 Error |
| TC-GB-POSIT-007 | `/positions/:id` | PUT | Menguji keberhasilan operasi: Memperbarui rincian informasi posisi jabatan berdasarkan ID (Valid/Authorized) | Verifikasi perubahan state (Insert/Update) pada database tabel terkait; cek log aktivitas. | Status 200/201 OK |
| TC-GB-POSIT-008 | `/positions/:id` | PUT | Menguji penolakan operasi: Memperbarui rincian informasi posisi jabatan berdasarkan ID dengan akses yang tidak sah atau data invalid | Mengecek penjagaan sistem pada level middleware/controller untuk memastikan transaksi database di-rollback atau tidak dipanggil sama sekali. | Status 400/401/403/404 Error |
| TC-GB-POSIT-009 | `/positions/:id` | DELETE | Menguji keberhasilan operasi: Menghapus posisi jabatan dari sistem perusahaan (Valid/Authorized) | Verifikasi flag soft-delete (deleted_at) atau hard-delete pada database tabel terkait. | Status 200/204 Success |
| TC-GB-POSIT-010 | `/positions/:id` | DELETE | Menguji penolakan operasi: Menghapus posisi jabatan dari sistem perusahaan dengan akses yang tidak sah atau data invalid | Mengecek penjagaan sistem pada level middleware/controller untuk memastikan transaksi database di-rollback atau tidak dipanggil sama sekali. | Status 400/401/403/404 Error |
