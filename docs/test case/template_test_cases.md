# Skenario Pengujian Modul Template

Pengujian dilakukan untuk memastikan bahwa operasional pada modul Template dapat dilaksanakan sesuai dengan kebutuhan sistem. Modul *template* digunakan untuk mempermudah inisialisasi layanan operasional bagi perusahaan yang baru terdaftar. Sistem menyediakan beberapa pilihan templat layanan bawaan yang disesuaikan dengan jenis industri perusahaan terkait. Pemilik (*owner*) atau manajer (*manager*) dapat memilih satu atau beberapa templat layanan untuk dibuat secara otomatis ke dalam katalog aktif mereka. Hal ini berguna untuk memangkas waktu konfigurasi awal struktur formulir dan alur penugasan staf perusahaan. Fokus pengujian diletakkan pada fungsionalitas utama, validasi input, serta kepatuhan terhadap batasan hak akses (role-based access control).

### Tabel Skenario Pengujian Modul Template

| ID Test | Route Name | HTTP Method | Endpoint | Request Body | Response Yang Diharapkan |
|---|---|---|---|---|---|
| TC-TEMPL-001 | Mengambil semua daftar tipe kategori perusahaan | GET | `/template/company-type` | - | Status 200/201 OK dengan data |
| TC-TEMPL-002 | Mengambil daftar templat layanan berdasarkan tipe kategori perusahaan | GET | `/template/company-type/:companyTypeId/services` | - | Status 200/201 OK dengan data |
| TC-TEMPL-003 | Mengambil preview data dari templat layanan tertentu | GET | `/template/services/:serviceTemplateId` | - | Status 200/201 OK dengan data |
| TC-TEMPL-004 | Menghasilkan layanan operasional baru berdasarkan templat layanan yang dipilih | POST | `/template/services/generate` | Data JSON sesuai skema request | Status 200/201 OK dengan data |


Verifikasi terhadap kemampuan sistem diharapkan dapat dicapai melalui skenario pengujian di atas. Seluruh pengujian harus dipastikan telah mencakup penegakan hak akses pada tiap endpoint, serta pengembalian respons yang sesuai baik untuk skenario sukses maupun skenario penanganan kesalahan (error handling).


### Tabel Skenario Pengujian Graybox Modul Template

| ID Test | Endpoint | HTTP Method | Skenario Uji (Graybox) | Pengecekan Internal (Sistem/DB) | Expected Output |
|---|---|---|---|---|---|
| TC-GB-TEMPL-001 | `/template/company-type` | GET | Menguji keberhasilan operasi: Mengambil semua daftar tipe kategori perusahaan (Valid/Authorized) | Verifikasi query yang dieksekusi database menggunakan parameter yang benar dan mengembalikan relasi data dengan tepat. | Status 200/201 OK |
| TC-GB-TEMPL-002 | `/template/company-type` | GET | Menguji penolakan operasi: Mengambil semua daftar tipe kategori perusahaan dengan akses yang tidak sah atau data invalid | Mengecek penjagaan sistem pada level middleware/controller untuk memastikan transaksi database di-rollback atau tidak dipanggil sama sekali. | Status 400/401/403/404 Error |
| TC-GB-TEMPL-003 | `/template/company-type/:companyTypeId/services` | GET | Menguji keberhasilan operasi: Mengambil daftar templat layanan berdasarkan tipe kategori perusahaan (Valid/Authorized) | Verifikasi query yang dieksekusi database menggunakan parameter yang benar dan mengembalikan relasi data dengan tepat. | Status 200/201 OK |
| TC-GB-TEMPL-004 | `/template/company-type/:companyTypeId/services` | GET | Menguji penolakan operasi: Mengambil daftar templat layanan berdasarkan tipe kategori perusahaan dengan akses yang tidak sah atau data invalid | Mengecek penjagaan sistem pada level middleware/controller untuk memastikan transaksi database di-rollback atau tidak dipanggil sama sekali. | Status 400/401/403/404 Error |
| TC-GB-TEMPL-005 | `/template/services/:serviceTemplateId` | GET | Menguji keberhasilan operasi: Mengambil preview data dari templat layanan tertentu (Valid/Authorized) | Verifikasi query yang dieksekusi database menggunakan parameter yang benar dan mengembalikan relasi data dengan tepat. | Status 200/201 OK |
| TC-GB-TEMPL-006 | `/template/services/:serviceTemplateId` | GET | Menguji penolakan operasi: Mengambil preview data dari templat layanan tertentu dengan akses yang tidak sah atau data invalid | Mengecek penjagaan sistem pada level middleware/controller untuk memastikan transaksi database di-rollback atau tidak dipanggil sama sekali. | Status 400/401/403/404 Error |
| TC-GB-TEMPL-007 | `/template/services/generate` | POST | Menguji keberhasilan operasi: Menghasilkan layanan operasional baru berdasarkan templat layanan yang dipilih (Valid/Authorized) | Verifikasi perubahan state (Insert/Update) pada database tabel terkait; cek log aktivitas. | Status 200/201 OK |
| TC-GB-TEMPL-008 | `/template/services/generate` | POST | Menguji penolakan operasi: Menghasilkan layanan operasional baru berdasarkan templat layanan yang dipilih dengan akses yang tidak sah atau data invalid | Mengecek penjagaan sistem pada level middleware/controller untuk memastikan transaksi database di-rollback atau tidak dipanggil sama sekali. | Status 400/401/403/404 Error |
