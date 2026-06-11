# Skenario Pengujian Modul Service Price

Pengujian dilakukan untuk memastikan bahwa operasional pada modul Service Price dapat dilaksanakan sesuai dengan kebutuhan sistem. Modul *service price* diimplementasikan untuk mengatur skema tarif atau biaya dari layanan-layanan yang disediakan oleh perusahaan. Seluruh operasional pembacaan, pembuatan, pembaruan, dan penghapusan harga layanan dikelompokkan khusus bagi pengguna dengan tingkat kekuasaan pemilik (*owner*) atau manajer. Pembatasan ini bertujuan untuk menjaga stabilitas penetapan kompensasi finansial pekerjaan serta meminimalkan risiko manipulasi nilai biaya di tingkat staf pelaksana. Fokus pengujian diletakkan pada fungsionalitas utama, validasi input, serta kepatuhan terhadap batasan hak akses (role-based access control).

### Tabel Skenario Pengujian Modul Service Price

| ID Test | Route Name | HTTP Method | Endpoint | Request Body | Response Yang Diharapkan |
|---|---|---|---|---|---|
| TC-SPRICE-001 | Mengambil semua daftar penentuan harga layanan perusahaan | GET | `/service-price` | - | Status 200/201 OK dengan data |
| TC-SPRICE-002 | Membuat aturan penetapan harga layanan baru | POST | `/service-price` | Data JSON sesuai skema request | Status 200/201 OK dengan data |
| TC-SPRICE-003 | Memperbarui aturan penetapan harga layanan berdasarkan ID | PUT | `/service-price/:id` | Data JSON sesuai skema request | Status 200/201 OK dengan data |
| TC-SPRICE-004 | Menghapus aturan penetapan harga layanan dari sistem | DELETE | `/service-price/:id` | - | Status 200/204 Success |


Verifikasi terhadap kemampuan sistem diharapkan dapat dicapai melalui skenario pengujian di atas. Seluruh pengujian harus dipastikan telah mencakup penegakan hak akses pada tiap endpoint, serta pengembalian respons yang sesuai baik untuk skenario sukses maupun skenario penanganan kesalahan (error handling).


### Tabel Skenario Pengujian Graybox Modul Service Price

| ID Test | Endpoint | HTTP Method | Skenario Uji (Graybox) | Pengecekan Internal (Sistem/DB) | Expected Output |
|---|---|---|---|---|---|
| TC-GB-SPRICE-001 | `/service-price` | GET | Menguji keberhasilan operasi: Mengambil semua daftar penentuan harga layanan perusahaan (Valid/Authorized) | Verifikasi query yang dieksekusi database menggunakan parameter yang benar dan mengembalikan relasi data dengan tepat. | Status 200/201 OK |
| TC-GB-SPRICE-002 | `/service-price` | GET | Menguji penolakan operasi: Mengambil semua daftar penentuan harga layanan perusahaan dengan akses yang tidak sah atau data invalid | Mengecek penjagaan sistem pada level middleware/controller untuk memastikan transaksi database di-rollback atau tidak dipanggil sama sekali. | Status 400/401/403/404 Error |
| TC-GB-SPRICE-003 | `/service-price` | POST | Menguji keberhasilan operasi: Membuat aturan penetapan harga layanan baru (Valid/Authorized) | Verifikasi perubahan state (Insert/Update) pada database tabel terkait; cek log aktivitas. | Status 200/201 OK |
| TC-GB-SPRICE-004 | `/service-price` | POST | Menguji penolakan operasi: Membuat aturan penetapan harga layanan baru dengan akses yang tidak sah atau data invalid | Mengecek penjagaan sistem pada level middleware/controller untuk memastikan transaksi database di-rollback atau tidak dipanggil sama sekali. | Status 400/401/403/404 Error |
| TC-GB-SPRICE-005 | `/service-price/:id` | PUT | Menguji keberhasilan operasi: Memperbarui aturan penetapan harga layanan berdasarkan ID (Valid/Authorized) | Verifikasi perubahan state (Insert/Update) pada database tabel terkait; cek log aktivitas. | Status 200/201 OK |
| TC-GB-SPRICE-006 | `/service-price/:id` | PUT | Menguji penolakan operasi: Memperbarui aturan penetapan harga layanan berdasarkan ID dengan akses yang tidak sah atau data invalid | Mengecek penjagaan sistem pada level middleware/controller untuk memastikan transaksi database di-rollback atau tidak dipanggil sama sekali. | Status 400/401/403/404 Error |
| TC-GB-SPRICE-007 | `/service-price/:id` | DELETE | Menguji keberhasilan operasi: Menghapus aturan penetapan harga layanan dari sistem (Valid/Authorized) | Verifikasi flag soft-delete (deleted_at) atau hard-delete pada database tabel terkait. | Status 200/204 Success |
| TC-GB-SPRICE-008 | `/service-price/:id` | DELETE | Menguji penolakan operasi: Menghapus aturan penetapan harga layanan dari sistem dengan akses yang tidak sah atau data invalid | Mengecek penjagaan sistem pada level middleware/controller untuk memastikan transaksi database di-rollback atau tidak dipanggil sama sekali. | Status 400/401/403/404 Error |
