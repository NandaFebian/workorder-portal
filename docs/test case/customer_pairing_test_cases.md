# Skenario Pengujian Modul Customer Pairing

Pengujian dilakukan untuk memastikan bahwa operasional pada modul Customer Pairing dapat dilaksanakan sesuai dengan kebutuhan sistem. Modul *customer pairing* berfungsi untuk mengintegrasikan akun klien eksternal dengan profil sistem internal perusahaan. Seluruh operasional pada modul ini dibatasi khusus bagi pengguna dengan peran *client*. Proses sinkronisasi diawali dengan inisiasi verifikasi melalui *endpoint* inisiasi dan diselesaikan melalui konfirmasi token pada *endpoint* penyelesaian. Pemantauan hubungan akun serta pemutusan koneksi akun eksternal dikelola sepenuhnya melalui *endpoint* terkait untuk menjaga keamanan integrasi data antarplatform. Fokus pengujian diletakkan pada fungsionalitas utama, validasi input, serta kepatuhan terhadap batasan hak akses (role-based access control).

### Tabel Skenario Pengujian Modul Customer Pairing

| ID Test | Route Name | HTTP Method | Endpoint | Request Body | Response Yang Diharapkan |
|---|---|---|---|---|---|
| TC-CPAIR-001 | Menginisiasi proses sinkronisasi akun klien eksternal | POST | `/customer-pairing/start` | Data JSON sesuai skema request | Status 200/201 OK dengan data |
| TC-CPAIR-002 | Menyelesaikan proses sinkronisasi dan menghubungkan akun klien | POST | `/customer-pairing/complete` | Data JSON sesuai skema request | Status 200/201 OK dengan data |
| TC-CPAIR-003 | Melihat daftar seluruh akun eksternal yang telah terhubung | GET | `/customer-pairing` | - | Status 200/201 OK dengan data |
| TC-CPAIR-004 | Melihat detail hubungan akun eksternal pada perusahaan tertentu | GET | `/customer-pairing/company/:companyId` | - | Status 200/201 OK dengan data |
| TC-CPAIR-005 | Memutuskan hubungan akun klien eksternal (*unpair*) | DELETE | `/customer-pairing/:external_account_id` | - | Status 200/204 Success |


Verifikasi terhadap kemampuan sistem diharapkan dapat dicapai melalui skenario pengujian di atas. Seluruh pengujian harus dipastikan telah mencakup penegakan hak akses pada tiap endpoint, serta pengembalian respons yang sesuai baik untuk skenario sukses maupun skenario penanganan kesalahan (error handling).


### Tabel Skenario Pengujian Graybox Modul Customer Pairing

| ID Test | Endpoint | HTTP Method | Skenario Uji (Graybox) | Pengecekan Internal (Sistem/DB) | Expected Output |
|---|---|---|---|---|---|
| TC-GB-CPAIR-001 | `/customer-pairing/start` | POST | Menguji keberhasilan operasi: Menginisiasi proses sinkronisasi akun klien eksternal (Valid/Authorized) | Verifikasi perubahan state (Insert/Update) pada database tabel terkait; cek log aktivitas. | Status 200/201 OK |
| TC-GB-CPAIR-002 | `/customer-pairing/start` | POST | Menguji penolakan operasi: Menginisiasi proses sinkronisasi akun klien eksternal dengan akses yang tidak sah atau data invalid | Mengecek penjagaan sistem pada level middleware/controller untuk memastikan transaksi database di-rollback atau tidak dipanggil sama sekali. | Status 400/401/403/404 Error |
| TC-GB-CPAIR-003 | `/customer-pairing/complete` | POST | Menguji keberhasilan operasi: Menyelesaikan proses sinkronisasi dan menghubungkan akun klien (Valid/Authorized) | Verifikasi perubahan state (Insert/Update) pada database tabel terkait; cek log aktivitas. | Status 200/201 OK |
| TC-GB-CPAIR-004 | `/customer-pairing/complete` | POST | Menguji penolakan operasi: Menyelesaikan proses sinkronisasi dan menghubungkan akun klien dengan akses yang tidak sah atau data invalid | Mengecek penjagaan sistem pada level middleware/controller untuk memastikan transaksi database di-rollback atau tidak dipanggil sama sekali. | Status 400/401/403/404 Error |
| TC-GB-CPAIR-005 | `/customer-pairing` | GET | Menguji keberhasilan operasi: Melihat daftar seluruh akun eksternal yang telah terhubung (Valid/Authorized) | Verifikasi query yang dieksekusi database menggunakan parameter yang benar dan mengembalikan relasi data dengan tepat. | Status 200/201 OK |
| TC-GB-CPAIR-006 | `/customer-pairing` | GET | Menguji penolakan operasi: Melihat daftar seluruh akun eksternal yang telah terhubung dengan akses yang tidak sah atau data invalid | Mengecek penjagaan sistem pada level middleware/controller untuk memastikan transaksi database di-rollback atau tidak dipanggil sama sekali. | Status 400/401/403/404 Error |
| TC-GB-CPAIR-007 | `/customer-pairing/company/:companyId` | GET | Menguji keberhasilan operasi: Melihat detail hubungan akun eksternal pada perusahaan tertentu (Valid/Authorized) | Verifikasi query yang dieksekusi database menggunakan parameter yang benar dan mengembalikan relasi data dengan tepat. | Status 200/201 OK |
| TC-GB-CPAIR-008 | `/customer-pairing/company/:companyId` | GET | Menguji penolakan operasi: Melihat detail hubungan akun eksternal pada perusahaan tertentu dengan akses yang tidak sah atau data invalid | Mengecek penjagaan sistem pada level middleware/controller untuk memastikan transaksi database di-rollback atau tidak dipanggil sama sekali. | Status 400/401/403/404 Error |
| TC-GB-CPAIR-009 | `/customer-pairing/:external_account_id` | DELETE | Menguji keberhasilan operasi: Memutuskan hubungan akun klien eksternal (*unpair*) (Valid/Authorized) | Verifikasi flag soft-delete (deleted_at) atau hard-delete pada database tabel terkait. | Status 200/204 Success |
| TC-GB-CPAIR-010 | `/customer-pairing/:external_account_id` | DELETE | Menguji penolakan operasi: Memutuskan hubungan akun klien eksternal (*unpair*) dengan akses yang tidak sah atau data invalid | Mengecek penjagaan sistem pada level middleware/controller untuk memastikan transaksi database di-rollback atau tidak dipanggil sama sekali. | Status 400/401/403/404 Error |
