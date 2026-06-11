# Skenario Pengujian Modul FAQ

Pengujian dilakukan untuk memastikan bahwa operasional pada modul FAQ dapat dilaksanakan sesuai dengan kebutuhan sistem. Modul *faq* diimplementasikan untuk menyediakan fitur bantuan mandiri (*self-service*) berbasis kecerdasan buatan (*AI chatbot*) bagi klien. Basis pengetahuan dikelola oleh pemilik perusahaan (*owner*) melalui unggahan dokumen teks maupun berkas PDF secara berkala. Seluruh data pengetahuan yang diunggah akan disinkronkan ke penyedia layanan FAQ eksternal. Sisi klien dapat melakukan interaksi tanya jawab secara langsung serta melihat kembali riwayat percakapan yang pernah dilakukan. Hak akses pengelolaan dokumen dibatasi secara ketat hanya untuk tingkat pemilik guna menghindari penyalahgunaan informasi. Fokus pengujian diletakkan pada fungsionalitas utama, validasi input, serta kepatuhan terhadap batasan hak akses (role-based access control).

### Tabel Skenario Pengujian Modul FAQ

| ID Test | Route Name | HTTP Method | Endpoint | Request Body | Response Yang Diharapkan |
|---|---|---|---|---|---|
| TC-FAQ-001 | Mengaktifkan atau menonaktifkan fitur FAQ chatbot pada perusahaan | PUT | `/faq/toggle-active` | Data JSON sesuai skema request | Status 200/201 OK dengan data |
| TC-FAQ-002 | Mengunggah dokumen pengetahuan berbasis teks untuk basis data FAQ | POST | `/faq/text-docs` | Data JSON sesuai skema request | Status 200/201 OK dengan data |
| TC-FAQ-003 | Mengunggah dokumen pengetahuan berbasis berkas PDF (multipart/form-data) | POST | `/faq/pdf-docs` | Data JSON sesuai skema request | Status 200/201 OK dengan data |
| TC-FAQ-004 | Mengambil seluruh daftar dokumen pengetahuan perusahaan | GET | `/faq/docs` | - | Status 200/201 OK dengan data |
| TC-FAQ-005 | Menghapus dokumen pengetahuan berdasarkan ID eksternal penyedia FAQ | DELETE | `/faq/docs/:docsId` | - | Status 200/204 Success |
| TC-FAQ-006 | Mengajukan pertanyaan ke chatbot FAQ perusahaan | POST | `/faq/ask` | Data JSON sesuai skema request | Status 200/201 OK dengan data |
| TC-FAQ-007 | Mengambil riwayat percakapan chatbot pengguna pada perusahaan tertentu | GET | `/faq/:companyId/history` | - | Status 200/201 OK dengan data |


Verifikasi terhadap kemampuan sistem diharapkan dapat dicapai melalui skenario pengujian di atas. Seluruh pengujian harus dipastikan telah mencakup penegakan hak akses pada tiap endpoint, serta pengembalian respons yang sesuai baik untuk skenario sukses maupun skenario penanganan kesalahan (error handling).


### Tabel Skenario Pengujian Graybox Modul FAQ

| ID Test | Endpoint | HTTP Method | Skenario Uji (Graybox) | Pengecekan Internal (Sistem/DB) | Expected Output |
|---|---|---|---|---|---|
| TC-GB-FAQ-001 | `/faq/toggle-active` | PUT | Menguji keberhasilan operasi: Mengaktifkan atau menonaktifkan fitur FAQ chatbot pada perusahaan (Valid/Authorized) | Verifikasi perubahan state (Insert/Update) pada database tabel terkait; cek log aktivitas. | Status 200/201 OK |
| TC-GB-FAQ-002 | `/faq/toggle-active` | PUT | Menguji penolakan operasi: Mengaktifkan atau menonaktifkan fitur FAQ chatbot pada perusahaan dengan akses yang tidak sah atau data invalid | Mengecek penjagaan sistem pada level middleware/controller untuk memastikan transaksi database di-rollback atau tidak dipanggil sama sekali. | Status 400/401/403/404 Error |
| TC-GB-FAQ-003 | `/faq/text-docs` | POST | Menguji keberhasilan operasi: Mengunggah dokumen pengetahuan berbasis teks untuk basis data FAQ (Valid/Authorized) | Verifikasi perubahan state (Insert/Update) pada database tabel terkait; cek log aktivitas. | Status 200/201 OK |
| TC-GB-FAQ-004 | `/faq/text-docs` | POST | Menguji penolakan operasi: Mengunggah dokumen pengetahuan berbasis teks untuk basis data FAQ dengan akses yang tidak sah atau data invalid | Mengecek penjagaan sistem pada level middleware/controller untuk memastikan transaksi database di-rollback atau tidak dipanggil sama sekali. | Status 400/401/403/404 Error |
| TC-GB-FAQ-005 | `/faq/pdf-docs` | POST | Menguji keberhasilan operasi: Mengunggah dokumen pengetahuan berbasis berkas PDF (multipart/form-data) (Valid/Authorized) | Verifikasi perubahan state (Insert/Update) pada database tabel terkait; cek log aktivitas. | Status 200/201 OK |
| TC-GB-FAQ-006 | `/faq/pdf-docs` | POST | Menguji penolakan operasi: Mengunggah dokumen pengetahuan berbasis berkas PDF (multipart/form-data) dengan akses yang tidak sah atau data invalid | Mengecek penjagaan sistem pada level middleware/controller untuk memastikan transaksi database di-rollback atau tidak dipanggil sama sekali. | Status 400/401/403/404 Error |
| TC-GB-FAQ-007 | `/faq/docs` | GET | Menguji keberhasilan operasi: Mengambil seluruh daftar dokumen pengetahuan perusahaan (Valid/Authorized) | Verifikasi query yang dieksekusi database menggunakan parameter yang benar dan mengembalikan relasi data dengan tepat. | Status 200/201 OK |
| TC-GB-FAQ-008 | `/faq/docs` | GET | Menguji penolakan operasi: Mengambil seluruh daftar dokumen pengetahuan perusahaan dengan akses yang tidak sah atau data invalid | Mengecek penjagaan sistem pada level middleware/controller untuk memastikan transaksi database di-rollback atau tidak dipanggil sama sekali. | Status 400/401/403/404 Error |
| TC-GB-FAQ-009 | `/faq/docs/:docsId` | DELETE | Menguji keberhasilan operasi: Menghapus dokumen pengetahuan berdasarkan ID eksternal penyedia FAQ (Valid/Authorized) | Verifikasi flag soft-delete (deleted_at) atau hard-delete pada database tabel terkait. | Status 200/204 Success |
| TC-GB-FAQ-010 | `/faq/docs/:docsId` | DELETE | Menguji penolakan operasi: Menghapus dokumen pengetahuan berdasarkan ID eksternal penyedia FAQ dengan akses yang tidak sah atau data invalid | Mengecek penjagaan sistem pada level middleware/controller untuk memastikan transaksi database di-rollback atau tidak dipanggil sama sekali. | Status 400/401/403/404 Error |
| TC-GB-FAQ-011 | `/faq/ask` | POST | Menguji keberhasilan operasi: Mengajukan pertanyaan ke chatbot FAQ perusahaan (Valid/Authorized) | Verifikasi perubahan state (Insert/Update) pada database tabel terkait; cek log aktivitas. | Status 200/201 OK |
| TC-GB-FAQ-012 | `/faq/ask` | POST | Menguji penolakan operasi: Mengajukan pertanyaan ke chatbot FAQ perusahaan dengan akses yang tidak sah atau data invalid | Mengecek penjagaan sistem pada level middleware/controller untuk memastikan transaksi database di-rollback atau tidak dipanggil sama sekali. | Status 400/401/403/404 Error |
| TC-GB-FAQ-013 | `/faq/:companyId/history` | GET | Menguji keberhasilan operasi: Mengambil riwayat percakapan chatbot pengguna pada perusahaan tertentu (Valid/Authorized) | Verifikasi query yang dieksekusi database menggunakan parameter yang benar dan mengembalikan relasi data dengan tepat. | Status 200/201 OK |
| TC-GB-FAQ-014 | `/faq/:companyId/history` | GET | Menguji penolakan operasi: Mengambil riwayat percakapan chatbot pengguna pada perusahaan tertentu dengan akses yang tidak sah atau data invalid | Mengecek penjagaan sistem pada level middleware/controller untuk memastikan transaksi database di-rollback atau tidak dipanggil sama sekali. | Status 400/401/403/404 Error |
