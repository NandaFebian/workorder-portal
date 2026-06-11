# Skenario Pengujian Modul Work Report

Pengujian dilakukan untuk memastikan bahwa operasional pada modul Work Report dapat dilaksanakan sesuai dengan kebutuhan sistem. Modul *work report* digunakan untuk mendokumentasikan rincian pengerjaan tugas lapangan yang dilaporkan oleh staf pelaksana. Pembaruan data laporan pada awalnya disimpan sebagai draf sebelum dilakukan proses pengiriman ke tingkat manajerial. Manajer atau pemilik perusahaan memiliki wewenang penuh untuk menyetujui laporan atau menolaknya kembali jika ditemukan ketidaksesuaian data di lapangan. Otentikasi dan pengecekan peran diterapkan untuk menjamin laporan tidak dimodifikasi secara sepihak setelah disetujui. Fokus pengujian diletakkan pada fungsionalitas utama, validasi input, serta kepatuhan terhadap batasan hak akses (role-based access control).

### Tabel Skenario Pengujian Modul Work Report

| ID Test | Route Name | HTTP Method | Endpoint | Request Body | Response Yang Diharapkan |
|---|---|---|---|---|---|
| TC-WREP-001 | Mengambil rincian detail laporan pekerjaan berdasarkan ID | GET | `/workreports/:id` | - | Status 200/201 OK dengan data |
| TC-WREP-002 | Membuat entri laporan pekerjaan baru secara manual | POST | `/workreports` | Data JSON sesuai skema request | Status 200/201 OK dengan data |
| TC-WREP-003 | Memperbarui draf laporan pekerjaan berdasarkan ID | PUT | `/workreports/:id` | Data JSON sesuai skema request | Status 200/201 OK dengan data |
| TC-WREP-004 | Mengirimkan jawaban formulir laporan pekerjaan yang telah diisi | POST | `/workreports/:id/submit` | Data JSON sesuai skema request | Status 200/201 OK dengan data |
| TC-WREP-005 | Mengubah status laporan pekerjaan menjadi terkirim (*sent*) | PATCH | `/workreports/:id/sent` | Data JSON sesuai skema request | Status 200/201 OK dengan data |
| TC-WREP-006 | Menyetujui laporan pekerjaan yang telah diserahkan oleh staf pelaksana | PATCH | `/workreports/:id/approve` | Data JSON sesuai skema request | Status 200/201 OK dengan data |
| TC-WREP-007 | Menolak laporan pekerjaan dan mengembalikannya ke staf pelaksana | PATCH | `/workreports/:id/reject` | Data JSON sesuai skema request | Status 200/201 OK dengan data |
| TC-WREP-008 | Menghapus dokumen laporan pekerjaan dari sistem | DELETE | `/workreports/:id` | - | Status 200/204 Success |


Verifikasi terhadap kemampuan sistem diharapkan dapat dicapai melalui skenario pengujian di atas. Seluruh pengujian harus dipastikan telah mencakup penegakan hak akses pada tiap endpoint, serta pengembalian respons yang sesuai baik untuk skenario sukses maupun skenario penanganan kesalahan (error handling).


### Tabel Skenario Pengujian Graybox Modul Work Report

| ID Test | Endpoint | HTTP Method | Skenario Uji (Graybox) | Pengecekan Internal (Sistem/DB) | Expected Output |
|---|---|---|---|---|---|
| TC-GB-WREP-001 | `/workreports/:id` | GET | Menguji keberhasilan operasi: Mengambil rincian detail laporan pekerjaan berdasarkan ID (Valid/Authorized) | Verifikasi query yang dieksekusi database menggunakan parameter yang benar dan mengembalikan relasi data dengan tepat. | Status 200/201 OK |
| TC-GB-WREP-002 | `/workreports/:id` | GET | Menguji penolakan operasi: Mengambil rincian detail laporan pekerjaan berdasarkan ID dengan akses yang tidak sah atau data invalid | Mengecek penjagaan sistem pada level middleware/controller untuk memastikan transaksi database di-rollback atau tidak dipanggil sama sekali. | Status 400/401/403/404 Error |
| TC-GB-WREP-003 | `/workreports` | POST | Menguji keberhasilan operasi: Membuat entri laporan pekerjaan baru secara manual (Valid/Authorized) | Verifikasi perubahan state (Insert/Update) pada database tabel terkait; cek log aktivitas. | Status 200/201 OK |
| TC-GB-WREP-004 | `/workreports` | POST | Menguji penolakan operasi: Membuat entri laporan pekerjaan baru secara manual dengan akses yang tidak sah atau data invalid | Mengecek penjagaan sistem pada level middleware/controller untuk memastikan transaksi database di-rollback atau tidak dipanggil sama sekali. | Status 400/401/403/404 Error |
| TC-GB-WREP-005 | `/workreports/:id` | PUT | Menguji keberhasilan operasi: Memperbarui draf laporan pekerjaan berdasarkan ID (Valid/Authorized) | Verifikasi perubahan state (Insert/Update) pada database tabel terkait; cek log aktivitas. | Status 200/201 OK |
| TC-GB-WREP-006 | `/workreports/:id` | PUT | Menguji penolakan operasi: Memperbarui draf laporan pekerjaan berdasarkan ID dengan akses yang tidak sah atau data invalid | Mengecek penjagaan sistem pada level middleware/controller untuk memastikan transaksi database di-rollback atau tidak dipanggil sama sekali. | Status 400/401/403/404 Error |
| TC-GB-WREP-007 | `/workreports/:id/submit` | POST | Menguji keberhasilan operasi: Mengirimkan jawaban formulir laporan pekerjaan yang telah diisi (Valid/Authorized) | Verifikasi perubahan state (Insert/Update) pada database tabel terkait; cek log aktivitas. | Status 200/201 OK |
| TC-GB-WREP-008 | `/workreports/:id/submit` | POST | Menguji penolakan operasi: Mengirimkan jawaban formulir laporan pekerjaan yang telah diisi dengan akses yang tidak sah atau data invalid | Mengecek penjagaan sistem pada level middleware/controller untuk memastikan transaksi database di-rollback atau tidak dipanggil sama sekali. | Status 400/401/403/404 Error |
| TC-GB-WREP-009 | `/workreports/:id/sent` | PATCH | Menguji keberhasilan operasi: Mengubah status laporan pekerjaan menjadi terkirim (*sent*) (Valid/Authorized) | Verifikasi perubahan state (Insert/Update) pada database tabel terkait; cek log aktivitas. | Status 200/201 OK |
| TC-GB-WREP-010 | `/workreports/:id/sent` | PATCH | Menguji penolakan operasi: Mengubah status laporan pekerjaan menjadi terkirim (*sent*) dengan akses yang tidak sah atau data invalid | Mengecek penjagaan sistem pada level middleware/controller untuk memastikan transaksi database di-rollback atau tidak dipanggil sama sekali. | Status 400/401/403/404 Error |
| TC-GB-WREP-011 | `/workreports/:id/approve` | PATCH | Menguji keberhasilan operasi: Menyetujui laporan pekerjaan yang telah diserahkan oleh staf pelaksana (Valid/Authorized) | Verifikasi perubahan state (Insert/Update) pada database tabel terkait; cek log aktivitas. | Status 200/201 OK |
| TC-GB-WREP-012 | `/workreports/:id/approve` | PATCH | Menguji penolakan operasi: Menyetujui laporan pekerjaan yang telah diserahkan oleh staf pelaksana dengan akses yang tidak sah atau data invalid | Mengecek penjagaan sistem pada level middleware/controller untuk memastikan transaksi database di-rollback atau tidak dipanggil sama sekali. | Status 400/401/403/404 Error |
| TC-GB-WREP-013 | `/workreports/:id/reject` | PATCH | Menguji keberhasilan operasi: Menolak laporan pekerjaan dan mengembalikannya ke staf pelaksana (Valid/Authorized) | Verifikasi perubahan state (Insert/Update) pada database tabel terkait; cek log aktivitas. | Status 200/201 OK |
| TC-GB-WREP-014 | `/workreports/:id/reject` | PATCH | Menguji penolakan operasi: Menolak laporan pekerjaan dan mengembalikannya ke staf pelaksana dengan akses yang tidak sah atau data invalid | Mengecek penjagaan sistem pada level middleware/controller untuk memastikan transaksi database di-rollback atau tidak dipanggil sama sekali. | Status 400/401/403/404 Error |
| TC-GB-WREP-015 | `/workreports/:id` | DELETE | Menguji keberhasilan operasi: Menghapus dokumen laporan pekerjaan dari sistem (Valid/Authorized) | Verifikasi flag soft-delete (deleted_at) atau hard-delete pada database tabel terkait. | Status 200/204 Success |
| TC-GB-WREP-016 | `/workreports/:id` | DELETE | Menguji penolakan operasi: Menghapus dokumen laporan pekerjaan dari sistem dengan akses yang tidak sah atau data invalid | Mengecek penjagaan sistem pada level middleware/controller untuk memastikan transaksi database di-rollback atau tidak dipanggil sama sekali. | Status 400/401/403/404 Error |
