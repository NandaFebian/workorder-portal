# Skenario Pengujian Graybox Modul Service Pricing

Pengujian dilakukan untuk memastikan bahwa operasional pada modul Service Pricing dapat dilaksanakan sesuai dengan kebutuhan sistem. Daftar *endpoint* pada modul *service pricing* digunakan untuk mengelola data harga layanan yang ditawarkan oleh perusahaan. Owner dapat melakukan operasi CRUD (Create, Read, Update, Delete) terhadap data pricing layanan. Seluruh endpoint memerlukan token otorisasi dan menerapkan pembatasan hak akses berbasis peran (role-based access control). Fokus pengujian diletakkan pada fungsionalitas utama, validasi input, serta kepatuhan terhadap batasan hak akses.

### Tabel Skenario Pengujian Graybox Modul Service Pricing

| ID Test | Endpoint | HTTP Method | Skenario Uji (Graybox) | Pengecekan Internal (Sistem/DB) | Expected Output |
|---|---|---|---|---|---|
| TC-GB-SRVPR-001 | `/service-price` | GET | Menguji keberhasilan operasi: Mengambil semua data pricing layanan (Valid/Authorized) | Verifikasi query yang dieksekusi database menggunakan parameter yang benar dan mengembalikan relasi data dengan tepat. | Status 200/201 OK |
| TC-GB-SRVPR-002 | `/service-price` | GET | Menguji penolakan operasi: Mengambil semua data pricing layanan dengan akses yang tidak sah atau data invalid | Mengecek penjagaan sistem pada level middleware/controller untuk memastikan transaksi database di-rollback atau tidak dipanggil sama sekali. | Status 400/401/403/404 Error |
| TC-GB-SRVPR-003 | `/service-price` | POST | Menguji keberhasilan operasi: Membuat pricing layanan baru (Valid/Authorized) | Verifikasi perubahan state (Insert) pada database tabel terkait; cek log aktivitas. | Status 200/201 OK |
| TC-GB-SRVPR-004 | `/service-price` | POST | Menguji penolakan operasi: Membuat pricing layanan baru dengan akses yang tidak sah atau data invalid | Mengecek penjagaan sistem pada level middleware/controller untuk memastikan transaksi database di-rollback atau tidak dipanggil sama sekali. | Status 400/401/403/404 Error |
| TC-GB-SRVPR-005 | `/service-price/:id` | PUT | Menguji keberhasilan operasi: Memperbarui data pricing layanan (Valid/Authorized) | Verifikasi perubahan state (Update) pada database tabel terkait; cek log aktivitas. | Status 200/201 OK |
| TC-GB-SRVPR-006 | `/service-price/:id` | PUT | Menguji penolakan operasi: Memperbarui data pricing layanan dengan akses yang tidak sah atau data invalid | Mengecek penjagaan sistem pada level middleware/controller untuk memastikan transaksi database di-rollback atau tidak dipanggil sama sekali. | Status 400/401/403/404 Error |
| TC-GB-SRVPR-007 | `/service-price/:id` | DELETE | Menguji keberhasilan operasi: Menghapus pricing layanan (Valid/Authorized) | Verifikasi perubahan state (Delete) pada database tabel terkait; cek log aktivitas. | Status 200/201 OK |
| TC-GB-SRVPR-008 | `/service-price/:id` | DELETE | Menguji penolakan operasi: Menghapus pricing layanan dengan akses yang tidak sah atau data invalid | Mengecek penjagaan sistem pada level middleware/controller untuk memastikan transaksi database di-rollback atau tidak dipanggil sama sekali. | Status 400/401/403/404 Error |
