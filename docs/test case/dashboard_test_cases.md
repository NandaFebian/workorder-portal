# Skenario Pengujian Modul Dashboard

Pengujian dilakukan untuk memastikan bahwa operasional pada modul Dashboard dapat dilaksanakan sesuai dengan kebutuhan sistem. Modul *dashboard* digunakan untuk menyajikan visualisasi data analitis dan ringkasan kinerja sistem kepada pengguna. Pengambilan metrik statistik disesuaikan dengan peran pengguna yang melakukan permintaan data tersebut. Data historis permintaan layanan, perkembangan pengerjaan perintah kerja (*work order*), dan performa umum perusahaan dapat dimonitor secara berkala melalui parameter periode waktu tertentu. Seluruh informasi metrik ini disajikan guna mendukung proses pengambilan keputusan strategis di tingkat manajemen. Fokus pengujian diletakkan pada fungsionalitas utama, validasi input, serta kepatuhan terhadap batasan hak akses (role-based access control).

### Tabel Skenario Pengujian Modul Dashboard

| ID Test | Route Name | HTTP Method | Endpoint | Request Body | Response Yang Diharapkan |
|---|---|---|---|---|---|
| TC-DASH-001 | Mengambil data metrik dan statistik permintaan layanan | GET | `/dashboard/service-request` | - | Status 200/201 OK dengan data |
| TC-DASH-002 | Mengambil data metrik dan statistik perintah kerja (*work order*) | GET | `/dashboard/work-order` | - | Status 200/201 OK dengan data |
| TC-DASH-003 | Mengambil data metrik ringkasan kinerja perusahaan | GET | `/dashboard/company` | - | Status 200/201 OK dengan data |


Verifikasi terhadap kemampuan sistem diharapkan dapat dicapai melalui skenario pengujian di atas. Seluruh pengujian harus dipastikan telah mencakup penegakan hak akses pada tiap endpoint, serta pengembalian respons yang sesuai baik untuk skenario sukses maupun skenario penanganan kesalahan (error handling).


### Tabel Skenario Pengujian Graybox Modul Dashboard

| ID Test | Endpoint | HTTP Method | Skenario Uji (Graybox) | Pengecekan Internal (Sistem/DB) | Expected Output |
|---|---|---|---|---|---|
| TC-GB-DASH-001 | `/dashboard/service-request` | GET | Menguji keberhasilan operasi: Mengambil data metrik dan statistik permintaan layanan (Valid/Authorized) | Verifikasi query yang dieksekusi database menggunakan parameter yang benar dan mengembalikan relasi data dengan tepat. | Status 200/201 OK |
| TC-GB-DASH-002 | `/dashboard/service-request` | GET | Menguji penolakan operasi: Mengambil data metrik dan statistik permintaan layanan dengan akses yang tidak sah atau data invalid | Mengecek penjagaan sistem pada level middleware/controller untuk memastikan transaksi database di-rollback atau tidak dipanggil sama sekali. | Status 400/401/403/404 Error |
| TC-GB-DASH-003 | `/dashboard/work-order` | GET | Menguji keberhasilan operasi: Mengambil data metrik dan statistik perintah kerja (*work order*) (Valid/Authorized) | Verifikasi query yang dieksekusi database menggunakan parameter yang benar dan mengembalikan relasi data dengan tepat. | Status 200/201 OK |
| TC-GB-DASH-004 | `/dashboard/work-order` | GET | Menguji penolakan operasi: Mengambil data metrik dan statistik perintah kerja (*work order*) dengan akses yang tidak sah atau data invalid | Mengecek penjagaan sistem pada level middleware/controller untuk memastikan transaksi database di-rollback atau tidak dipanggil sama sekali. | Status 400/401/403/404 Error |
| TC-GB-DASH-005 | `/dashboard/company` | GET | Menguji keberhasilan operasi: Mengambil data metrik ringkasan kinerja perusahaan (Valid/Authorized) | Verifikasi query yang dieksekusi database menggunakan parameter yang benar dan mengembalikan relasi data dengan tepat. | Status 200/201 OK |
| TC-GB-DASH-006 | `/dashboard/company` | GET | Menguji penolakan operasi: Mengambil data metrik ringkasan kinerja perusahaan dengan akses yang tidak sah atau data invalid | Mengecek penjagaan sistem pada level middleware/controller untuk memastikan transaksi database di-rollback atau tidak dipanggil sama sekali. | Status 400/401/403/404 Error |
