# Deskripsi Endpoint Modul Invitations

Berikut disajikan tabel rincian teknis dari masing-masing *endpoint* yang terdapat pada modul *invitations*.

### 1. Mengambil Undangan Berstatus Tunda (Pending)

Pengambilan daftar seluruh undangan rekrutmen perusahaan yang ditujukan kepada akun staf aktif dilakukan melalui pemanggilan daftar ini. Otorisasi peran diperiksa untuk memastikan pemohon berstatus sebagai staf tidak terafiliasi (*unassigned staff*).

| Keterangan | Detail |
|---|---|
| Endpoint | GET `/invitations/pending` |
| Autentikasi | Diperlukan (JWT Token) |
| Role | Unassigned Staff |
| Path Parameter | N/A |
| Request Body | N/A |
| Headers | Authorization: Bearer {token} |
| Status Code | 200 |
| Response | <pre>{<br>&nbsp;&nbsp;"message":&nbsp;"Pending&nbsp;invitations&nbsp;retrieved&nbsp;successfully",<br>&nbsp;&nbsp;"data":&nbsp;[<br>&nbsp;&nbsp;&nbsp;&nbsp;{<br>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;"_id":&nbsp;"6a22775db265a11d8ca7452d",<br>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;"companyId":&nbsp;"6a21c2b9a7bdad3a940c3df1",<br>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;"email":&nbsp;"staff@example.com",<br>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;"status":&nbsp;"pending"<br>&nbsp;&nbsp;&nbsp;&nbsp;}<br>&nbsp;&nbsp;]<br>}</pre> |

Peninjauan daftar undangan rekrutmen difasilitasi melalui endpoint pada tabel di atas bagi staf yang belum terafiliasi. Autentikasi JWT dan pemeriksaan peran Unassigned Staff diterapkan untuk memastikan hanya pengguna yang berhak dapat mengakses data tersebut. Kemudahan peninjauan identitas perusahaan pengirim dari data undangan yang dikembalikan dapat dimanfaatkan oleh calon pegawai dalam proses seleksi afiliasi kerja.

---

### 2. Menerima Undangan Kerja

Penerimaan kesediaan bergabung dengan struktur organisasi perusahaan diproses dengan mengirimkan parameter ID undangan pada rute pemanggilan. Token otorisasi JWT wajib dilampirkan oleh calon pegawai guna memvalidasi tindakan penyetujuan.

| Keterangan | Detail |
|---|---|
| Endpoint | PUT `/invitations/:id/accept` |
| Autentikasi | Diperlukan (JWT Token) |
| Role | Unassigned Staff |
| Path Parameter | id : 6a22775db265a11d8ca7452d |
| Request Body | N/A |
| Headers | Authorization: Bearer {token} |
| Status Code | 200 |
| Response | <pre>{<br>&nbsp;&nbsp;"success":&nbsp;true,<br>&nbsp;&nbsp;"message":&nbsp;"Invitation&nbsp;accepted&nbsp;successfully",<br>&nbsp;&nbsp;"data":&nbsp;{<br>&nbsp;&nbsp;&nbsp;&nbsp;"accepted":&nbsp;true<br>&nbsp;&nbsp;}<br>}</pre> |

Penyetujuan undangan kerja difasilitasi melalui endpoint pada tabel di atas bagi staf yang ingin menyetujui undangan kerja dari perusahaan tertentu. Autentikasi token JWT dan parameter ID undangan pada path diverifikasi sebelum status penerimaan diperbarui di database. Afiliasi perusahaan dan penugasan posisi jabatan baru dapat langsung diterapkan ke profil pengguna setelah penyetujuan berhasil divalidasi.

---

### 3. Menolak Undangan Kerja

Penolakan ajakan rekrutmen kerja dari manajemen perusahaan dilakukan dengan mengirimkan ID undangan ke peladen. Token otorisasi JWT digunakan untuk mencatat dan mengubah status dokumen rekrutmen terkait.

| Keterangan | Detail |
|---|---|
| Endpoint | PUT `/invitations/:id/reject` |
| Autentikasi | Diperlukan (JWT Token) |
| Role | Unassigned Staff |
| Path Parameter | id : 6a22775db265a11d8ca7452d |
| Request Body | N/A |
| Headers | Authorization: Bearer {token} |
| Status Code | 200 |
| Response | <pre>{<br>&nbsp;&nbsp;"success":&nbsp;true,<br>&nbsp;&nbsp;"message":&nbsp;"Invitation&nbsp;rejected&nbsp;successfully",<br>&nbsp;&nbsp;"data":&nbsp;{<br>&nbsp;&nbsp;&nbsp;&nbsp;"rejected":&nbsp;true<br>&nbsp;&nbsp;}<br>}</pre> |

Penolakan ajakan rekrutmen difasilitasi melalui endpoint pada tabel di atas bagi staf yang hendak menolak ajakan rekrutmen dari perusahaan. Autentikasi token JWT dan validasi parameter ID undangan pada path digunakan untuk mencatat perubahan status dokumen rekrutmen. Status undangan diubah menjadi ditolak secara permanen di database sehingga sesi rekrutmen tunda dapat ditutup sepenuhnya.

---

### 4. Membatalkan/Menghapus Undangan Kerja

Penghapusan atau pembatalan dokumen undangan yang sudah telanjur dikirimkan ke calon pegawai diproses oleh tim manajemen perusahaan. Otorisasi peran manajer atau pemilik diverifikasi guna membatasi kewenangan pengelolaan ini.

| Keterangan | Detail |
|---|---|
| Endpoint | DELETE `/invitations/:id` |
| Autentikasi | Diperlukan (JWT Token) |
| Role | Company Owner, Company Manager |
| Path Parameter | id : 6a22775db265a11d8ca7452d |
| Request Body | N/A |
| Headers | Authorization: Bearer {token} |
| Status Code | 200 |
| Response | <pre>{<br>&nbsp;&nbsp;"success":&nbsp;true,<br>&nbsp;&nbsp;"message":&nbsp;"Invitation&nbsp;deleted&nbsp;successfully",<br>&nbsp;&nbsp;"data":&nbsp;{<br>&nbsp;&nbsp;&nbsp;&nbsp;"deletedCount":&nbsp;1<br>&nbsp;&nbsp;}<br>}</pre> |

Pembatalan undangan yang telah dikirimkan difasilitasi melalui endpoint pada tabel di atas bagi pemilik atau manajer perusahaan. Pemeriksaan peran Company Owner atau Company Manager dan autentikasi JWT diterapkan untuk membatasi kewenangan penghapusan ini. Dokumen undangan dihapus secara fisik dari basis data sehingga calon pegawai tidak dapat lagi melihat atau menyetujui undangan terkait.

