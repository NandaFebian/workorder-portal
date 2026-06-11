# Skenario Pengujian Modul Storage

Pengujian dilakukan untuk memastikan bahwa operasional pada modul Storage dapat dilaksanakan sesuai dengan kebutuhan sistem. Modul *storage* diimplementasikan untuk menangani penyimpanan berkas eksternal seperti gambar ke peladen penyimpanan pihak ketiga (*MinIO storage*). Pengunggahan berkas dilakukan melalui transmisi data *multipart/form-data* dan divalidasi dengan ketat pada tingkat peladen. Sistem membatasi ukuran maksimal gambar sebesar 5 megabita serta memastikan format tipe berkas hanya berupa gambar demi keamanan sistem penyimpanan. Fokus pengujian diletakkan pada fungsionalitas utama, validasi input, serta kepatuhan terhadap batasan hak akses (role-based access control).

### Tabel Skenario Pengujian Modul Storage

| ID Test | Route Name | HTTP Method | Endpoint | Request Body | Response Yang Diharapkan |
|---|---|---|---|---|---|
| TC-STORA-001 | Mengunggah berkas gambar ke sistem penyimpanan cloud MinIO | POST | `/files` | Data JSON sesuai skema request | Status 200/201 OK dengan data |


Verifikasi terhadap kemampuan sistem diharapkan dapat dicapai melalui skenario pengujian di atas. Seluruh pengujian harus dipastikan telah mencakup penegakan hak akses pada tiap endpoint, serta pengembalian respons yang sesuai baik untuk skenario sukses maupun skenario penanganan kesalahan (error handling).


### Tabel Skenario Pengujian Graybox Modul Storage

| ID Test | Endpoint | HTTP Method | Skenario Uji (Graybox) | Pengecekan Internal (Sistem/DB) | Expected Output |
|---|---|---|---|---|---|
| TC-GB-STORA-001 | `/files` | POST | Menguji keberhasilan operasi: Mengunggah berkas gambar ke sistem penyimpanan cloud MinIO (Valid/Authorized) | Verifikasi perubahan state (Insert/Update) pada database tabel terkait; cek log aktivitas. | Status 200/201 OK |
| TC-GB-STORA-002 | `/files` | POST | Menguji penolakan operasi: Mengunggah berkas gambar ke sistem penyimpanan cloud MinIO dengan akses yang tidak sah atau data invalid | Mengecek penjagaan sistem pada level middleware/controller untuk memastikan transaksi database di-rollback atau tidak dipanggil sama sekali. | Status 400/401/403/404 Error |
