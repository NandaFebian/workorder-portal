# Skenario Pengujian Modul Service Requests

Pengujian dilakukan untuk memastikan bahwa operasional pada modul Service Requests dapat dilaksanakan sesuai dengan kebutuhan sistem. Daftar *endpoint* pada modul *service requests* digunakan untuk mengelola siklus hidup permintaan layanan mulai dari pengajuan, persetujuan, penolakan, hingga pelaporan dan review. Client dapat mengirimkan service request melalui intake form dan melihat riwayat pengiriman. Owner dan manager dapat melihat inbox service request serta melakukan aksi persetujuan atau penolakan. Laporan pekerjaan dan review juga dapat diakses dan dikirimkan melalui modul ini. Seluruh endpoint memerlukan token otorisasi dan menerapkan pembatasan hak akses berbasis peran (role-based access control). Fokus pengujian diletakkan pada fungsionalitas utama, validasi input, serta kepatuhan terhadap batasan hak akses.

### Tabel Skenario Pengujian Modul Service Requests

| ID Test | Route Name | HTTP Method | Endpoint | Request Body | Response Yang Diharapkan |
|---|---|---|---|---|---|
| TC-SRVREQ-001 | Mengambil riwayat service request yang dikirim | GET | `/service-requests/sent` | - | Status 200/201 OK dengan data |
| TC-SRVREQ-002 | Mengambil inbox service request untuk owner/manager | GET | `/service-requests/inbox` | - | Status 200/201 OK dengan data |
| TC-SRVREQ-003 | Mengambil detail service request berdasarkan ID | GET | `/service-requests/:id` | - | Status 200/201 OK dengan data |
| TC-SRVREQ-004 | Menolak service request | PATCH | `/service-requests/:id/reject` | Data JSON sesuai skema request | Status 200/201 OK dengan data |
| TC-SRVREQ-005 | Menyetujui service request | PATCH | `/service-requests/:id/approve` | Data JSON sesuai skema request | Status 200/201 OK dengan data |
| TC-SRVREQ-006 | Mengirimkan intake form atau membuat service request | POST | `/service-requests/service/:id` | Data JSON sesuai skema request | Status 200/201 OK dengan data |
| TC-SRVREQ-007 | Mengambil laporan pekerjaan untuk service request | GET | `/service-requests/:id/report` | - | Status 200/201 OK dengan data |
| TC-SRVREQ-008 | Mengirimkan review untuk service request | POST | `/service-requests/:id/review` | Data JSON sesuai skema request | Status 200/201 OK dengan data |


Verifikasi terhadap kemampuan sistem diharapkan dapat dicapai melalui skenario pengujian di atas. Seluruh pengujian harus dipastikan telah mencakup penegakan hak akses pada tiap endpoint, serta pengembalian respons yang sesuai baik untuk skenario sukses maupun skenario penanganan kesalahan (error handling).


### Tabel Skenario Pengujian Graybox Modul Service Requests

| ID Test | Endpoint | HTTP Method | Skenario Uji (Graybox) | Pengecekan Internal (Sistem/DB) | Expected Output |
|---|---|---|---|---|---|
| TC-GB-SRVREQ-001 | `/service-requests/sent` | GET | Menguji keberhasilan operasi: Mengambil riwayat service request yang dikirim (Valid/Authorized) | Verifikasi query yang dieksekusi database menggunakan parameter yang benar dan mengembalikan relasi data dengan tepat. | Status 200/201 OK |
| TC-GB-SRVREQ-002 | `/service-requests/sent` | GET | Menguji penolakan operasi: Mengambil riwayat service request yang dikirim dengan akses yang tidak sah atau data invalid | Mengecek penjagaan sistem pada level middleware/controller untuk memastikan transaksi database di-rollback atau tidak dipanggil sama sekali. | Status 400/401/403/404 Error |
| TC-GB-SRVREQ-003 | `/service-requests/inbox` | GET | Menguji keberhasilan operasi: Mengambil inbox service request untuk owner/manager (Valid/Authorized) | Verifikasi query yang dieksekusi database menggunakan parameter yang benar dan mengembalikan relasi data dengan tepat. | Status 200/201 OK |
| TC-GB-SRVREQ-004 | `/service-requests/inbox` | GET | Menguji penolakan operasi: Mengambil inbox service request untuk owner/manager dengan akses yang tidak sah atau data invalid | Mengecek penjagaan sistem pada level middleware/controller untuk memastikan transaksi database di-rollback atau tidak dipanggil sama sekali. | Status 400/401/403/404 Error |
| TC-GB-SRVREQ-005 | `/service-requests/:id` | GET | Menguji keberhasilan operasi: Mengambil detail service request berdasarkan ID (Valid/Authorized) | Verifikasi query yang dieksekusi database menggunakan parameter yang benar dan mengembalikan relasi data dengan tepat. | Status 200/201 OK |
| TC-GB-SRVREQ-006 | `/service-requests/:id` | GET | Menguji penolakan operasi: Mengambil detail service request berdasarkan ID dengan akses yang tidak sah atau data invalid | Mengecek penjagaan sistem pada level middleware/controller untuk memastikan transaksi database di-rollback atau tidak dipanggil sama sekali. | Status 400/401/403/404 Error |
| TC-GB-SRVREQ-007 | `/service-requests/:id/reject` | PATCH | Menguji keberhasilan operasi: Menolak service request (Valid/Authorized) | Verifikasi perubahan state (Update) pada database tabel terkait; cek log aktivitas. | Status 200/201 OK |
| TC-GB-SRVREQ-008 | `/service-requests/:id/reject` | PATCH | Menguji penolakan operasi: Menolak service request dengan akses yang tidak sah atau data invalid | Mengecek penjagaan sistem pada level middleware/controller untuk memastikan transaksi database di-rollback atau tidak dipanggil sama sekali. | Status 400/401/403/404 Error |
| TC-GB-SRVREQ-009 | `/service-requests/:id/approve` | PATCH | Menguji keberhasilan operasi: Menyetujui service request (Valid/Authorized) | Verifikasi perubahan state (Update) pada database tabel terkait; cek log aktivitas. | Status 200/201 OK |
| TC-GB-SRVREQ-010 | `/service-requests/:id/approve` | PATCH | Menguji penolakan operasi: Menyetujui service request dengan akses yang tidak sah atau data invalid | Mengecek penjagaan sistem pada level middleware/controller untuk memastikan transaksi database di-rollback atau tidak dipanggil sama sekali. | Status 400/401/403/404 Error |
| TC-GB-SRVREQ-011 | `/service-requests/service/:id` | POST | Menguji keberhasilan operasi: Mengirimkan intake form atau membuat service request (Valid/Authorized) | Verifikasi perubahan state (Insert/Update) pada database tabel terkait; cek log aktivitas. | Status 200/201 OK |
| TC-GB-SRVREQ-012 | `/service-requests/service/:id` | POST | Menguji penolakan operasi: Mengirimkan intake form atau membuat service request dengan akses yang tidak sah atau data invalid | Mengecek penjagaan sistem pada level middleware/controller untuk memastikan transaksi database di-rollback atau tidak dipanggil sama sekali. | Status 400/401/403/404 Error |
| TC-GB-SRVREQ-013 | `/service-requests/:id/report` | GET | Menguji keberhasilan operasi: Mengambil laporan pekerjaan untuk service request (Valid/Authorized) | Verifikasi query yang dieksekusi database menggunakan parameter yang benar dan mengembalikan relasi data dengan tepat. | Status 200/201 OK |
| TC-GB-SRVREQ-014 | `/service-requests/:id/report` | GET | Menguji penolakan operasi: Mengambil laporan pekerjaan untuk service request dengan akses yang tidak sah atau data invalid | Mengecek penjagaan sistem pada level middleware/controller untuk memastikan transaksi database di-rollback atau tidak dipanggil sama sekali. | Status 400/401/403/404 Error |
| TC-GB-SRVREQ-015 | `/service-requests/:id/review` | POST | Menguji keberhasilan operasi: Mengirimkan review untuk service request (Valid/Authorized) | Verifikasi perubahan state (Insert/Update) pada database tabel terkait; cek log aktivitas. | Status 200/201 OK |
| TC-GB-SRVREQ-016 | `/service-requests/:id/review` | POST | Menguji penolakan operasi: Mengirimkan review untuk service request dengan akses yang tidak sah atau data invalid | Mengecek penjagaan sistem pada level middleware/controller untuk memastikan transaksi database di-rollback atau tidak dipanggil sama sekali. | Status 400/401/403/404 Error |
