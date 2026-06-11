# Skenario Pengujian Modul Form

Pengujian dilakukan untuk memastikan bahwa operasional pada modul Form dapat dilaksanakan sesuai dengan kebutuhan sistem. Modul *form* dikembangkan untuk menyediakan infrastruktur pembuatan formulir dinamis baik untuk formulir permintaan layanan (*intake form*), perintah kerja (*work order*), maupun laporan pekerjaan (*work report*). Pembuatan dan pembaruan templat formulir dibatasi bagi pengguna berwenang seperti *owner* dan *manager*. Pembaruan templat akan secara otomatis meningkatkan versi dari dokumen tersebut demi menjaga riwayat data terdahulu. Seluruh hasil pengisian formulir dikirimkan melalui *endpoint* pengumpulan jawaban (*submission*) untuk divalidasi struktur dan keterisiannya. Fokus pengujian diletakkan pada fungsionalitas utama, validasi input, serta kepatuhan terhadap batasan hak akses (role-based access control).

### Tabel Skenario Pengujian Modul Form

| ID Test | Route Name | HTTP Method | Endpoint | Request Body | Response Yang Diharapkan |
|---|---|---|---|---|---|
| TC-FORM-001 | Membuat templat formulir baru di bawah naungan perusahaan | POST | `/forms` | Data JSON sesuai skema request | Status 200/201 OK dengan data |
| TC-FORM-002 | Mengambil semua daftar templat formulir perusahaan | GET | `/forms` | - | Status 200/201 OK dengan data |
| TC-FORM-003 | Mengambil rincian detail templat formulir berdasarkan ID | GET | `/forms/:id` | - | Status 200/201 OK dengan data |
| TC-FORM-004 | Memperbarui atau menaikkan versi templat formulir berdasarkan ID | PUT | `/forms/:id` | Data JSON sesuai skema request | Status 200/201 OK dengan data |
| TC-FORM-005 | Mengirimkan data pengisian formulir (*submit form*) | POST | `/forms/submissions` | Data JSON sesuai skema request | Status 200/201 OK dengan data |
| TC-FORM-006 | Menghapus templat formulir berdasarkan ID | DELETE | `/forms/:id` | - | Status 200/204 Success |


Verifikasi terhadap kemampuan sistem diharapkan dapat dicapai melalui skenario pengujian di atas. Seluruh pengujian harus dipastikan telah mencakup penegakan hak akses pada tiap endpoint, serta pengembalian respons yang sesuai baik untuk skenario sukses maupun skenario penanganan kesalahan (error handling).


### Tabel Skenario Pengujian Graybox Modul Form

| ID Test | Endpoint | HTTP Method | Skenario Uji (Graybox) | Pengecekan Internal (Sistem/DB) | Expected Output |
|---|---|---|---|---|---|
| TC-GB-FORM-001 | `/forms` | POST | Menguji keberhasilan operasi: Membuat templat formulir baru di bawah naungan perusahaan (Valid/Authorized) | Verifikasi perubahan state (Insert/Update) pada database tabel terkait; cek log aktivitas. | Status 200/201 OK |
| TC-GB-FORM-002 | `/forms` | POST | Menguji penolakan operasi: Membuat templat formulir baru di bawah naungan perusahaan dengan akses yang tidak sah atau data invalid | Mengecek penjagaan sistem pada level middleware/controller untuk memastikan transaksi database di-rollback atau tidak dipanggil sama sekali. | Status 400/401/403/404 Error |
| TC-GB-FORM-003 | `/forms` | GET | Menguji keberhasilan operasi: Mengambil semua daftar templat formulir perusahaan (Valid/Authorized) | Verifikasi query yang dieksekusi database menggunakan parameter yang benar dan mengembalikan relasi data dengan tepat. | Status 200/201 OK |
| TC-GB-FORM-004 | `/forms` | GET | Menguji penolakan operasi: Mengambil semua daftar templat formulir perusahaan dengan akses yang tidak sah atau data invalid | Mengecek penjagaan sistem pada level middleware/controller untuk memastikan transaksi database di-rollback atau tidak dipanggil sama sekali. | Status 400/401/403/404 Error |
| TC-GB-FORM-005 | `/forms/:id` | GET | Menguji keberhasilan operasi: Mengambil rincian detail templat formulir berdasarkan ID (Valid/Authorized) | Verifikasi query yang dieksekusi database menggunakan parameter yang benar dan mengembalikan relasi data dengan tepat. | Status 200/201 OK |
| TC-GB-FORM-006 | `/forms/:id` | GET | Menguji penolakan operasi: Mengambil rincian detail templat formulir berdasarkan ID dengan akses yang tidak sah atau data invalid | Mengecek penjagaan sistem pada level middleware/controller untuk memastikan transaksi database di-rollback atau tidak dipanggil sama sekali. | Status 400/401/403/404 Error |
| TC-GB-FORM-007 | `/forms/:id` | PUT | Menguji keberhasilan operasi: Memperbarui atau menaikkan versi templat formulir berdasarkan ID (Valid/Authorized) | Verifikasi perubahan state (Insert/Update) pada database tabel terkait; cek log aktivitas. | Status 200/201 OK |
| TC-GB-FORM-008 | `/forms/:id` | PUT | Menguji penolakan operasi: Memperbarui atau menaikkan versi templat formulir berdasarkan ID dengan akses yang tidak sah atau data invalid | Mengecek penjagaan sistem pada level middleware/controller untuk memastikan transaksi database di-rollback atau tidak dipanggil sama sekali. | Status 400/401/403/404 Error |
| TC-GB-FORM-009 | `/forms/submissions` | POST | Menguji keberhasilan operasi: Mengirimkan data pengisian formulir (*submit form*) (Valid/Authorized) | Verifikasi perubahan state (Insert/Update) pada database tabel terkait; cek log aktivitas. | Status 200/201 OK |
| TC-GB-FORM-010 | `/forms/submissions` | POST | Menguji penolakan operasi: Mengirimkan data pengisian formulir (*submit form*) dengan akses yang tidak sah atau data invalid | Mengecek penjagaan sistem pada level middleware/controller untuk memastikan transaksi database di-rollback atau tidak dipanggil sama sekali. | Status 400/401/403/404 Error |
| TC-GB-FORM-011 | `/forms/:id` | DELETE | Menguji keberhasilan operasi: Menghapus templat formulir berdasarkan ID (Valid/Authorized) | Verifikasi flag soft-delete (deleted_at) atau hard-delete pada database tabel terkait. | Status 200/204 Success |
| TC-GB-FORM-012 | `/forms/:id` | DELETE | Menguji penolakan operasi: Menghapus templat formulir berdasarkan ID dengan akses yang tidak sah atau data invalid | Mengecek penjagaan sistem pada level middleware/controller untuk memastikan transaksi database di-rollback atau tidak dipanggil sama sekali. | Status 400/401/403/404 Error |
