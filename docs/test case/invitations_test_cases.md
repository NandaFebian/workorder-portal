# Skenario Pengujian Modul Invitations

Pengujian dilakukan untuk memastikan bahwa operasional pada modul Invitations dapat dilaksanakan sesuai dengan kebutuhan sistem. Modul *invitations* ditujukan untuk mengelola alur bergabungnya pegawai ke suatu perusahaan dalam platform. Penerimaan undangan hanya diperbolehkan bagi pengguna dengan peran *unassigned staff* yang belum berafiliasi dengan perusahaan mana pun. Calon pegawai dapat menolak atau menerima undangan yang masuk untuk memperbarui status asosiasi mereka. Pembatalan undangan yang sudah telanjur dikirim dikelola secara internal oleh tingkat pemilik atau manajer perusahaan melalui *endpoint* penghapusan. Fokus pengujian diletakkan pada fungsionalitas utama, validasi input, serta kepatuhan terhadap batasan hak akses (role-based access control).

### Tabel Skenario Pengujian Modul Invitations

| ID Test | Route Name | HTTP Method | Endpoint | Request Body | Response Yang Diharapkan |
|---|---|---|---|---|---|
| TC-INVIT-001 | Mengambil daftar undangan bergabung ke perusahaan yang berstatus tunda (*pending*) | GET | `/invitations/pending` | - | Status 200/201 OK dengan data |
| TC-INVIT-002 | Menerima undangan untuk bergabung dengan perusahaan terkait | PUT | `/invitations/:id/accept` | Data JSON sesuai skema request | Status 200/201 OK dengan data |
| TC-INVIT-003 | Menolak undangan untuk bergabung dengan perusahaan terkait | PUT | `/invitations/:id/reject` | Data JSON sesuai skema request | Status 200/201 OK dengan data |
| TC-INVIT-004 | Menghapus atau membatalkan undangan yang telah dikirimkan oleh perusahaan | DELETE | `/invitations/:id` | - | Status 200/204 Success |


Verifikasi terhadap kemampuan sistem diharapkan dapat dicapai melalui skenario pengujian di atas. Seluruh pengujian harus dipastikan telah mencakup penegakan hak akses pada tiap endpoint, serta pengembalian respons yang sesuai baik untuk skenario sukses maupun skenario penanganan kesalahan (error handling).


### Tabel Skenario Pengujian Graybox Modul Invitations

| ID Test | Endpoint | HTTP Method | Skenario Uji (Graybox) | Pengecekan Internal (Sistem/DB) | Expected Output |
|---|---|---|---|---|---|
| TC-GB-INVIT-001 | `/invitations/pending` | GET | Menguji keberhasilan operasi: Mengambil daftar undangan bergabung ke perusahaan yang berstatus tunda (*pending*) (Valid/Authorized) | Verifikasi query yang dieksekusi database menggunakan parameter yang benar dan mengembalikan relasi data dengan tepat. | Status 200/201 OK |
| TC-GB-INVIT-002 | `/invitations/pending` | GET | Menguji penolakan operasi: Mengambil daftar undangan bergabung ke perusahaan yang berstatus tunda (*pending*) dengan akses yang tidak sah atau data invalid | Mengecek penjagaan sistem pada level middleware/controller untuk memastikan transaksi database di-rollback atau tidak dipanggil sama sekali. | Status 400/401/403/404 Error |
| TC-GB-INVIT-003 | `/invitations/:id/accept` | PUT | Menguji keberhasilan operasi: Menerima undangan untuk bergabung dengan perusahaan terkait (Valid/Authorized) | Verifikasi perubahan state (Insert/Update) pada database tabel terkait; cek log aktivitas. | Status 200/201 OK |
| TC-GB-INVIT-004 | `/invitations/:id/accept` | PUT | Menguji penolakan operasi: Menerima undangan untuk bergabung dengan perusahaan terkait dengan akses yang tidak sah atau data invalid | Mengecek penjagaan sistem pada level middleware/controller untuk memastikan transaksi database di-rollback atau tidak dipanggil sama sekali. | Status 400/401/403/404 Error |
| TC-GB-INVIT-005 | `/invitations/:id/reject` | PUT | Menguji keberhasilan operasi: Menolak undangan untuk bergabung dengan perusahaan terkait (Valid/Authorized) | Verifikasi perubahan state (Insert/Update) pada database tabel terkait; cek log aktivitas. | Status 200/201 OK |
| TC-GB-INVIT-006 | `/invitations/:id/reject` | PUT | Menguji penolakan operasi: Menolak undangan untuk bergabung dengan perusahaan terkait dengan akses yang tidak sah atau data invalid | Mengecek penjagaan sistem pada level middleware/controller untuk memastikan transaksi database di-rollback atau tidak dipanggil sama sekali. | Status 400/401/403/404 Error |
| TC-GB-INVIT-007 | `/invitations/:id` | DELETE | Menguji keberhasilan operasi: Menghapus atau membatalkan undangan yang telah dikirimkan oleh perusahaan (Valid/Authorized) | Verifikasi flag soft-delete (deleted_at) atau hard-delete pada database tabel terkait. | Status 200/204 Success |
| TC-GB-INVIT-008 | `/invitations/:id` | DELETE | Menguji penolakan operasi: Menghapus atau membatalkan undangan yang telah dikirimkan oleh perusahaan dengan akses yang tidak sah atau data invalid | Mengecek penjagaan sistem pada level middleware/controller untuk memastikan transaksi database di-rollback atau tidak dipanggil sama sekali. | Status 400/401/403/404 Error |
