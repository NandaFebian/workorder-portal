# Deskripsi Endpoint Modul Positions

Berikut disajikan tabel rincian teknis dari masing-masing *endpoint* yang terdapat pada modul *positions*.

### 1. Mengambil Semua Posisi Jabatan

Pengambilan seluruh daftar posisi jabatan kerja yang terdaftar di dalam perusahaan dilakukan untuk memetakan penugasan staf. Hak akses pembacaan posisi ini dibuka bagi seluruh pegawai internal perusahaan terdaftar.

| Keterangan | Detail |
|---|---|
| Endpoint | GET `/positions` |
| Autentikasi | Diperlukan (JWT Token) |
| Role | Company Owner, Company Manager, Company Staff |
| Path Parameter | N/A |
| Request Body | N/A |
| Headers | Authorization: Bearer {token} |
| Status Code | 200 |
| Response | <pre>{<br>&nbsp;&nbsp;"success":&nbsp;true,<br>&nbsp;&nbsp;"code":&nbsp;200,<br>&nbsp;&nbsp;"message":&nbsp;"Positions&nbsp;retrieved&nbsp;successfully",<br>&nbsp;&nbsp;"data":&nbsp;[<br>&nbsp;&nbsp;&nbsp;&nbsp;{<br>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;"_id":&nbsp;"6a266e2cb38f7b06d56e5bd5",<br>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;"name":&nbsp;"HRD",<br>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;"description":&nbsp;"Human&nbsp;Resource&nbsp;Development",<br>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;"isActive":&nbsp;true,<br>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;"companyId":&nbsp;"6a21c2b9a7bdad3a940c3df1",<br>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;"deletedAt":&nbsp;null,<br>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;"createdAt":&nbsp;"2026-06-08T07:24:28.383Z",<br>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;"updatedAt":&nbsp;"2026-06-08T07:24:28.383Z",<br>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;"__v":&nbsp;0<br>&nbsp;&nbsp;&nbsp;&nbsp;},<br>&nbsp;&nbsp;&nbsp;&nbsp;{<br>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;"_id":&nbsp;"6a21c2ceec7ef2549a52b50f",<br>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;"name":&nbsp;"IT&nbsp;SUPPORT&nbsp;4",<br>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;"description":&nbsp;"supporter&nbsp;IT",<br>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;"isActive":&nbsp;true,<br>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;"companyId":&nbsp;"6a21c2b9a7bdad3a940c3df1",<br>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;"deletedAt":&nbsp;null,<br>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;"createdAt":&nbsp;"2026-06-04T18:24:14.061Z",<br>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;"updatedAt":&nbsp;"2026-06-07T14:39:17.541Z",<br>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;"__v":&nbsp;0<br>&nbsp;&nbsp;&nbsp;&nbsp;}<br>&nbsp;&nbsp;]<br>}</pre> |

Pemetaan penugasan staf difasilitasi melalui endpoint pada tabel di atas bagi seluruh pegawai internal perusahaan untuk memetakan penugasan staf berdasarkan struktur jabatan. Autentikasi JWT dan pemeriksaan peran Company Owner, Company Manager, atau Company Staff diterapkan untuk membatasi akses pembacaan. Array informasi struktur jabatan yang dikembalikan dapat dimuat pada panel pilihan penugasan kerja lapangan.

---

### 2. Mengambil Detail Posisi Jabatan Berdasarkan ID

Pemeriksaan rincian informasi satu jabatan spesifik beserta daftar staf aktif yang menduduki jabatan tersebut dilakukan dengan melampirkan parameter ID rute. Otorisasi peran diperiksa guna membatasi pembacaan data kepegawaian institusi.

| Keterangan | Detail |
|---|---|
| Endpoint | GET `/positions/:id` |
| Autentikasi | Diperlukan (JWT Token) |
| Role | Company Owner, Company Manager, Company Staff |
| Path Parameter | id : 6a21c2ceec7ef2549a52b50f |
| Request Body | N/A |
| Headers | Authorization: Bearer {token} |
| Status Code | 200 |
| Response | <pre>{<br>&nbsp;&nbsp;"message":&nbsp;"Position&nbsp;retrieved&nbsp;successfully",<br>&nbsp;&nbsp;"data":&nbsp;{<br>&nbsp;&nbsp;&nbsp;&nbsp;"_id":&nbsp;"6a266e2cb38f7b06d56e5bd5",<br>&nbsp;&nbsp;&nbsp;&nbsp;"name":&nbsp;"HRD",<br>&nbsp;&nbsp;&nbsp;&nbsp;"description":&nbsp;"Human&nbsp;Resource&nbsp;Development",<br>&nbsp;&nbsp;&nbsp;&nbsp;"isActive":&nbsp;true,<br>&nbsp;&nbsp;&nbsp;&nbsp;"companyId":&nbsp;"6a21c2b9a7bdad3a940c3df1",<br>&nbsp;&nbsp;&nbsp;&nbsp;"deletedAt":&nbsp;null,<br>&nbsp;&nbsp;&nbsp;&nbsp;"createdAt":&nbsp;"2026-06-08T07:24:28.383Z",<br>&nbsp;&nbsp;&nbsp;&nbsp;"updatedAt":&nbsp;"2026-06-08T07:24:28.383Z",<br>&nbsp;&nbsp;&nbsp;&nbsp;"__v":&nbsp;0<br>&nbsp;&nbsp;},<br>&nbsp;&nbsp;"meta":&nbsp;{<br>&nbsp;&nbsp;&nbsp;&nbsp;"canDelete":&nbsp;false<br>&nbsp;&nbsp;}<br>}</pre> |

Pemeriksaan rincian jabatan difasilitasi melalui endpoint pada tabel di atas bagi pegawai internal untuk memeriksa rincian satu jabatan spesifik beserta daftar staf aktif yang menduduki jabatan tersebut. Autentikasi token JWT dan parameter ID jabatan pada path diverifikasi sebelum data dikirimkan. Objek metadata tambahan berupa status izin penghapusan jabatan dilampirkan sebagai referensi antarmuka pengguna.

---

### 3.  Membuat Posisi Jabatan Baru

Pendaftaran dan penyimpanan data posisi jabatan kerja baru di dalam struktur perusahaan dilakukan oleh pihak pengelola. Permintaan penambahan data ini mewajibkan pengiriman nama posisi jabatan yang valid.

| Keterangan | Detail |
|---|---|
| Endpoint | POST `/positions` |
| Autentikasi | Diperlukan (JWT Token) |
| Role | Company Owner, Company Manager |
| Path Parameter | N/A |
| Request Body | <pre>{<br>&nbsp;&nbsp;"name":&nbsp;"IT&nbsp;SUPPORT&nbsp;4",<br>&nbsp;&nbsp;"description":&nbsp;"supporter&nbsp;IT",<br>&nbsp;&nbsp;"isActive":&nbsp;true<br>}</pre> |
| Headers | Authorization: Bearer {token}, Content-Type: application/json |
| Status Code | 201 |
| Response | <pre>{<br>&nbsp;&nbsp;"message":&nbsp;"Position&nbsp;created&nbsp;successfully",<br>&nbsp;&nbsp;"data":&nbsp;{<br>&nbsp;&nbsp;&nbsp;&nbsp;"_id":&nbsp;"6a266e2cb38f7b06d56e5bd5",<br>&nbsp;&nbsp;&nbsp;&nbsp;"name":&nbsp;"HRD",<br>&nbsp;&nbsp;&nbsp;&nbsp;"description":&nbsp;"Human&nbsp;Resource&nbsp;Development",<br>&nbsp;&nbsp;&nbsp;&nbsp;"isActive":&nbsp;true,<br>&nbsp;&nbsp;&nbsp;&nbsp;"companyId":&nbsp;"6a21c2b9a7bdad3a940c3df1",<br>&nbsp;&nbsp;&nbsp;&nbsp;"deletedAt":&nbsp;null,<br>&nbsp;&nbsp;&nbsp;&nbsp;"createdAt":&nbsp;"2026-06-08T07:24:28.383Z",<br>&nbsp;&nbsp;&nbsp;&nbsp;"updatedAt":&nbsp;"2026-06-08T07:24:28.383Z",<br>&nbsp;&nbsp;&nbsp;&nbsp;"__v":&nbsp;0<br>&nbsp;&nbsp;}<br>}</pre> |

Pendaftaran posisi jabatan kerja baru difasilitasi melalui endpoint pada tabel di atas bagi pemilik atau manajer perusahaan. Request body berisi nama dan deskripsi jabatan serta autentikasi JWT diverifikasi sebelum data disimpan. Entri jabatan baru dideklarasikan ke basis data dan objek respon berisi ID unik jabatan dikembalikan sebagai konfirmasi.

---

### 4. Memperbarui Rincian Posisi Jabatan

Pembaruan detail informasi properti posisi jabatan kerja dilakukan dengan melampirkan parameter ID jabatan pada rute panggilan. Hak akses pembaruan dibatasi pada jajaran manajemen perusahaan guna mencegah anarki kepegawaian.

| Keterangan | Detail |
|---|---|
| Endpoint | PUT `/positions/:id` |
| Autentikasi | Diperlukan (JWT Token) |
| Role | Company Owner, Company Manager |
| Path Parameter | id : 6a21c2ceec7ef2549a52b50f |
| Request Body | <pre>{<br>&nbsp;&nbsp;"name":&nbsp;"IT&nbsp;SUPPORT&nbsp;4&nbsp;EDIT",<br>&nbsp;&nbsp;"description":&nbsp;"supporter&nbsp;IT&nbsp;baru",<br>&nbsp;&nbsp;"isActive":&nbsp;true<br>}</pre> |
| Headers | Authorization: Bearer {token}, Content-Type: application/json |
| Status Code | 200 |
| Response | <pre>{<br>&nbsp;&nbsp;"message":&nbsp;"Position&nbsp;updated&nbsp;successfully",<br>&nbsp;&nbsp;"data":&nbsp;{<br>&nbsp;&nbsp;&nbsp;&nbsp;"_id":&nbsp;"6a266e2cb38f7b06d56e5bd5",<br>&nbsp;&nbsp;&nbsp;&nbsp;"name":&nbsp;"IT&nbsp;SUPPORT&nbsp;4&nbsp;EDIT",<br>&nbsp;&nbsp;&nbsp;&nbsp;"description":&nbsp;"Human&nbsp;Resource&nbsp;Development",<br>&nbsp;&nbsp;&nbsp;&nbsp;"isActive":&nbsp;true,<br>&nbsp;&nbsp;&nbsp;&nbsp;"companyId":&nbsp;"6a21c2b9a7bdad3a940c3df1",<br>&nbsp;&nbsp;&nbsp;&nbsp;"deletedAt":&nbsp;null,<br>&nbsp;&nbsp;&nbsp;&nbsp;"createdAt":&nbsp;"2026-06-08T07:24:28.383Z",<br>&nbsp;&nbsp;&nbsp;&nbsp;"updatedAt":&nbsp;"2026-06-08T07:24:28.383Z",<br>&nbsp;&nbsp;&nbsp;&nbsp;"__v":&nbsp;0<br>&nbsp;&nbsp;}<br>}</pre> |

Pembaruan detail properti posisi jabatan difasilitasi melalui endpoint pada tabel di atas bagi jajaran manajemen perusahaan. Autentikasi token JWT, parameter ID jabatan pada path, dan request body berisi data baru diverifikasi untuk mencegah anarki kepegawaian. Perubahan deskripsi dan judul jabatan disinkronkan di database dan respon data terbaru dikembalikan untuk memperbarui konfigurasi kepegawaian.

---

### 5. Menghapus Posisi Jabatan

Penghapusan secara fisik dokumen posisi jabatan dari struktur perusahaan dijalankan dengan menyertakan ID rute jabatan. Otorisasi peran dibatasi secara ketat hanya dapat dilakukan oleh pemilik (*owner*) perusahaan saja.

| Keterangan | Detail |
|---|---|
| Endpoint | DELETE `/positions/:id` |
| Autentikasi | Diperlukan (JWT Token) |
| Role | Company Owner |
| Path Parameter | id : 6a21c2ceec7ef2549a52b50f |
| Request Body | N/A |
| Headers | Authorization: Bearer {token} |
| Status Code | 200 |
| Response | <pre>{<br>&nbsp;&nbsp;"success":&nbsp;true,<br>&nbsp;&nbsp;"message":&nbsp;"Position&nbsp;deleted&nbsp;successfully",<br>&nbsp;&nbsp;"data":&nbsp;{<br>&nbsp;&nbsp;&nbsp;&nbsp;"deletedCount":&nbsp;1<br>&nbsp;&nbsp;}<br>}</pre> |

Penghapusan dokumen posisi jabatan difasilitasi melalui endpoint pada tabel di atas bagi pemilik perusahaan untuk menghapus dokumen posisi jabatan dari struktur organisasi. Autentikasi token JWT dan pemeriksaan peran Company Owner secara ketat diterapkan untuk membatasi kewenangan penghapusan. Status penggunaan jabatan oleh pegawai diverifikasi sebelum proses penghapusan dan konfirmasi keberhasilan dikembalikan kepada klien.

