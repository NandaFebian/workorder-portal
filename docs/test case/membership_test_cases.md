# Skenario Pengujian Modul Membership

Pengujian dilakukan untuk memastikan bahwa operasional pada modul Membership dapat dilaksanakan sesuai dengan kebutuhan sistem. Modul *membership* dirancang untuk memfasilitasi program keanggotaan eksklusif bagi klien perusahaan. Pihak internal perusahaan dapat mengimpor kode-kode keanggotaan baru dari dokumen eksternal menggunakan format CSV secara cepat. Klien yang memiliki kode tersebut dapat melakukan klaim melalui *endpoint* klaim guna mendaftarkan akun mereka sebagai pelanggan aktif perusahaan. Pengaturan hak akses diterapkan agar pendaftaran kode baru dan peninjauan daftar keanggotaan dibatasi untuk tingkat manajerial. Fokus pengujian diletakkan pada fungsionalitas utama, validasi input, serta kepatuhan terhadap batasan hak akses (role-based access control).

### Tabel Skenario Pengujian Modul Membership

| ID Test | Route Name | HTTP Method | Endpoint | Request Body | Response Yang Diharapkan |
|---|---|---|---|---|---|
| TC-MEMBE-001 | Mengambil daftar seluruh klien yang berlangganan (*subscribed clients*) | GET | `/memberships` | - | Status 200/201 OK dengan data |
| TC-MEMBE-002 | Mengambil semua daftar kode keanggotaan (*membership codes*) | GET | `/memberships/codes` | - | Status 200/201 OK dengan data |
| TC-MEMBE-003 | Mengimpor kode keanggotaan secara massal melalui berkas CSV | POST | `/memberships/codes` | Data JSON sesuai skema request | Status 200/201 OK dengan data |
| TC-MEMBE-004 | Mengklaim kode keanggotaan untuk berlangganan layanan perusahaan | POST | `/memberships/codes/claim` | Data JSON sesuai skema request | Status 200/201 OK dengan data |
| TC-MEMBE-005 | Menghapus data kode keanggotaan dari sistem | DELETE | `/memberships/codes/:id` | - | Status 200/204 Success |


Verifikasi terhadap kemampuan sistem diharapkan dapat dicapai melalui skenario pengujian di atas. Seluruh pengujian harus dipastikan telah mencakup penegakan hak akses pada tiap endpoint, serta pengembalian respons yang sesuai baik untuk skenario sukses maupun skenario penanganan kesalahan (error handling).


### Tabel Skenario Pengujian Graybox Modul Membership

| ID Test | Endpoint | HTTP Method | Skenario Uji (Graybox) | Pengecekan Internal (Sistem/DB) | Expected Output |
|---|---|---|---|---|---|
| TC-GB-MEMBE-001 | `/memberships` | GET | Menguji keberhasilan operasi: Mengambil daftar seluruh klien yang berlangganan (*subscribed clients*) (Valid/Authorized) | Verifikasi query yang dieksekusi database menggunakan parameter yang benar dan mengembalikan relasi data dengan tepat. | Status 200/201 OK |
| TC-GB-MEMBE-002 | `/memberships` | GET | Menguji penolakan operasi: Mengambil daftar seluruh klien yang berlangganan (*subscribed clients*) dengan akses yang tidak sah atau data invalid | Mengecek penjagaan sistem pada level middleware/controller untuk memastikan transaksi database di-rollback atau tidak dipanggil sama sekali. | Status 400/401/403/404 Error |
| TC-GB-MEMBE-003 | `/memberships/codes` | GET | Menguji keberhasilan operasi: Mengambil semua daftar kode keanggotaan (*membership codes*) (Valid/Authorized) | Verifikasi query yang dieksekusi database menggunakan parameter yang benar dan mengembalikan relasi data dengan tepat. | Status 200/201 OK |
| TC-GB-MEMBE-004 | `/memberships/codes` | GET | Menguji penolakan operasi: Mengambil semua daftar kode keanggotaan (*membership codes*) dengan akses yang tidak sah atau data invalid | Mengecek penjagaan sistem pada level middleware/controller untuk memastikan transaksi database di-rollback atau tidak dipanggil sama sekali. | Status 400/401/403/404 Error |
| TC-GB-MEMBE-005 | `/memberships/codes` | POST | Menguji keberhasilan operasi: Mengimpor kode keanggotaan secara massal melalui berkas CSV (Valid/Authorized) | Verifikasi perubahan state (Insert/Update) pada database tabel terkait; cek log aktivitas. | Status 200/201 OK |
| TC-GB-MEMBE-006 | `/memberships/codes` | POST | Menguji penolakan operasi: Mengimpor kode keanggotaan secara massal melalui berkas CSV dengan akses yang tidak sah atau data invalid | Mengecek penjagaan sistem pada level middleware/controller untuk memastikan transaksi database di-rollback atau tidak dipanggil sama sekali. | Status 400/401/403/404 Error |
| TC-GB-MEMBE-007 | `/memberships/codes/claim` | POST | Menguji keberhasilan operasi: Mengklaim kode keanggotaan untuk berlangganan layanan perusahaan (Valid/Authorized) | Verifikasi perubahan state (Insert/Update) pada database tabel terkait; cek log aktivitas. | Status 200/201 OK |
| TC-GB-MEMBE-008 | `/memberships/codes/claim` | POST | Menguji penolakan operasi: Mengklaim kode keanggotaan untuk berlangganan layanan perusahaan dengan akses yang tidak sah atau data invalid | Mengecek penjagaan sistem pada level middleware/controller untuk memastikan transaksi database di-rollback atau tidak dipanggil sama sekali. | Status 400/401/403/404 Error |
| TC-GB-MEMBE-009 | `/memberships/codes/:id` | DELETE | Menguji keberhasilan operasi: Menghapus data kode keanggotaan dari sistem (Valid/Authorized) | Verifikasi flag soft-delete (deleted_at) atau hard-delete pada database tabel terkait. | Status 200/204 Success |
| TC-GB-MEMBE-010 | `/memberships/codes/:id` | DELETE | Menguji penolakan operasi: Menghapus data kode keanggotaan dari sistem dengan akses yang tidak sah atau data invalid | Mengecek penjagaan sistem pada level middleware/controller untuk memastikan transaksi database di-rollback atau tidak dipanggil sama sekali. | Status 400/401/403/404 Error |
