# Skenario Pengujian Graybox Modul File Upload

Pengujian dilakukan untuk memastikan bahwa operasional pada modul File Upload dapat dilaksanakan sesuai dengan kebutuhan sistem. Daftar *endpoint* pada modul *file upload* digunakan untuk mengelola proses pengunggahan file ke dalam sistem. Pengguna yang terautentikasi dapat mengunggah file menggunakan format multipart/form-data. Endpoint ini memerlukan token otorisasi guna memastikan hanya pengguna yang sah yang dapat mengunggah file ke dalam sistem. Fokus pengujian diletakkan pada fungsionalitas utama, validasi input file, serta kepatuhan terhadap batasan hak akses.

### Tabel Skenario Pengujian Graybox Modul File Upload

| ID Test | Endpoint | HTTP Method | Skenario Uji (Graybox) | Pengecekan Internal (Sistem/DB) | Expected Output |
|---|---|---|---|---|---|
| TC-GB-FILUP-001 | `/files` | POST | Menguji keberhasilan operasi: Mengunggah file ke sistem (Valid/Authorized) | Verifikasi perubahan state (Insert) pada database tabel terkait; cek log aktivitas serta penyimpanan file pada storage. | Status 200/201 OK |
| TC-GB-FILUP-002 | `/files` | POST | Menguji penolakan operasi: Mengunggah file ke sistem dengan akses yang tidak sah atau data invalid | Mengecek penjagaan sistem pada level middleware/controller untuk memastikan transaksi database di-rollback atau tidak dipanggil sama sekali. | Status 400/401/403/404 Error |
