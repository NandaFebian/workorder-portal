# Skenario Pengujian Modul Dashboard

Pengujian dilakukan untuk memastikan bahwa operasional pada modul Dashboard dapat dilaksanakan sesuai dengan kebutuhan sistem. Daftar *endpoint* pada modul *dashboard* digunakan untuk menyediakan data statistik dan ringkasan informasi yang relevan bagi pengguna berdasarkan perannya. Endpoint statistik service request dan work order menyajikan data agregat berdasarkan parameter periode yang dikirimkan. Endpoint dashboard perusahaan menyediakan ringkasan data operasional khusus untuk pemilik perusahaan (owner). Seluruh endpoint pada modul ini memerlukan token otorisasi dan menerapkan pembatasan hak akses berbasis peran (role-based access control). Fokus pengujian diletakkan pada fungsionalitas utama, validasi parameter query, serta kepatuhan terhadap batasan hak akses.

### Tabel Skenario Pengujian Modul Dashboard

| ID Test | Route Name | HTTP Method | Endpoint | Request Body | Response Yang Diharapkan |
|---|---|---|---|---|---|
| TC-DASHB-001 | Mengambil statistik service request berdasarkan periode | GET | `/dashboard/service-request?period_type=` | - | Status 200/201 OK dengan data |
| TC-DASHB-002 | Mengambil statistik work order berdasarkan periode | GET | `/dashboard/work-order?period_type=` | - | Status 200/201 OK dengan data |
| TC-DASHB-003 | Mengambil data dashboard untuk owner perusahaan | GET | `/dashboard/company/` | - | Status 200/201 OK dengan data |


Verifikasi terhadap kemampuan sistem diharapkan dapat dicapai melalui skenario pengujian di atas. Seluruh pengujian harus dipastikan telah mencakup penegakan hak akses pada tiap endpoint, serta pengembalian respons yang sesuai baik untuk skenario sukses maupun skenario penanganan kesalahan (error handling).


### Tabel Skenario Pengujian Graybox Modul Dashboard

| ID Test | Endpoint | HTTP Method | Skenario Uji (Graybox) | Pengecekan Internal (Sistem/DB) | Expected Output |
|---|---|---|---|---|---|
| TC-GB-DASHB-001 | `/dashboard/service-request?period_type=` | GET | Menguji keberhasilan operasi: Mengambil statistik service request berdasarkan periode (Valid/Authorized) | Verifikasi query yang dieksekusi database menggunakan parameter yang benar dan mengembalikan relasi data dengan tepat. | Status 200/201 OK |
| TC-GB-DASHB-002 | `/dashboard/service-request?period_type=` | GET | Menguji penolakan operasi: Mengambil statistik service request berdasarkan periode dengan akses yang tidak sah atau data invalid | Mengecek penjagaan sistem pada level middleware/controller untuk memastikan transaksi database di-rollback atau tidak dipanggil sama sekali. | Status 400/401/403/404 Error |
| TC-GB-DASHB-003 | `/dashboard/work-order?period_type=` | GET | Menguji keberhasilan operasi: Mengambil statistik work order berdasarkan periode (Valid/Authorized) | Verifikasi query yang dieksekusi database menggunakan parameter yang benar dan mengembalikan relasi data dengan tepat. | Status 200/201 OK |
| TC-GB-DASHB-004 | `/dashboard/work-order?period_type=` | GET | Menguji penolakan operasi: Mengambil statistik work order berdasarkan periode dengan akses yang tidak sah atau data invalid | Mengecek penjagaan sistem pada level middleware/controller untuk memastikan transaksi database di-rollback atau tidak dipanggil sama sekali. | Status 400/401/403/404 Error |
| TC-GB-DASHB-005 | `/dashboard/company/` | GET | Menguji keberhasilan operasi: Mengambil data dashboard untuk owner perusahaan (Valid/Authorized) | Verifikasi query yang dieksekusi database menggunakan parameter yang benar dan mengembalikan relasi data dengan tepat. | Status 200/201 OK |
| TC-GB-DASHB-006 | `/dashboard/company/` | GET | Menguji penolakan operasi: Mengambil data dashboard untuk owner perusahaan dengan akses yang tidak sah atau data invalid | Mengecek penjagaan sistem pada level middleware/controller untuk memastikan transaksi database di-rollback atau tidak dipanggil sama sekali. | Status 400/401/403/404 Error |
