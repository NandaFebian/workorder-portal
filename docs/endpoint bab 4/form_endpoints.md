# Deskripsi Endpoint Modul Form

Berikut disajikan tabel rincian teknis dari masing-masing *endpoint* yang terdapat pada modul *form*.

### 1. Membuat Templat Formulir Baru

Pendaftaran dan penyimpanan konfigurasi templat formulir dinamis baru diproses oleh pihak manajemen perusahaan. Otorisasi token diperiksa secara ketat guna menjamin struktur formulir hanya dibuat oleh pihak yang berwenang.

| Keterangan | Detail |
|---|---|
| Endpoint | POST `/forms` |
| Autentikasi | Diperlukan (JWT Token) |
| Role | Company Owner, Company Manager |
| Path Parameter | N/A |
| Request Body | <pre>{<br>&nbsp;&nbsp;"title":&nbsp;"REPORT&nbsp;BARU",<br>&nbsp;&nbsp;"description":&nbsp;"Formulir&nbsp;Pelaporan&nbsp;Kerja",<br>&nbsp;&nbsp;"formType":&nbsp;"report",<br>&nbsp;&nbsp;"fields":&nbsp;[<br>&nbsp;&nbsp;&nbsp;&nbsp;{<br>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;"order":&nbsp;1,<br>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;"label":&nbsp;"Isu&nbsp;kerusakan",<br>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;"type":&nbsp;"text",<br>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;"required":&nbsp;true,<br>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;"placeholder":&nbsp;"masukan&nbsp;isu"<br>&nbsp;&nbsp;&nbsp;&nbsp;}<br>&nbsp;&nbsp;]<br>}</pre> |
| Headers | Authorization: Bearer {token}, Content-Type: application/json |
| Status Code | 201 |
| Response | <pre>{<br>&nbsp;&nbsp;"success":&nbsp;true,<br>&nbsp;&nbsp;"message":&nbsp;"Form&nbsp;template&nbsp;created&nbsp;successfully",<br>&nbsp;&nbsp;"data":&nbsp;{<br>&nbsp;&nbsp;&nbsp;&nbsp;"_id":&nbsp;"6a22775db265a11d8ca74519",<br>&nbsp;&nbsp;&nbsp;&nbsp;"title":&nbsp;"REPORT&nbsp;BARU",<br>&nbsp;&nbsp;&nbsp;&nbsp;"formType":&nbsp;"report"<br>&nbsp;&nbsp;}<br>}</pre> |

Pembuatan templat formulir baru difasilitasi melalui endpoint pada tabel di atas dengan mengirimkan judul, deskripsi, tipe formulir, dan struktur bidang isian. Autentikasi diperlukan dan peran dibatasi untuk company owner dan company manager agar struktur formulir hanya dibuat oleh pihak manajemen. Templat formulir yang berhasil didaftarkan disimpan dengan pengenal versi awal untuk kebutuhan asosiasi dokumen berikutnya.

---

### 2. Mengambil Semua Templat Formulir

Pemeriksaan daftar seluruh konfigurasi templat formulir internal perusahaan dilakukan untuk memuat pilihan isian dokumen. Token otorisasi JWT wajib dilampirkan agar data yang dikembalikan terjamin keabsahannya.

| Keterangan | Detail |
|---|---|
| Endpoint | GET `/forms` |
| Autentikasi | Diperlukan (JWT Token) |
| Role | Semua role terautentikasi |
| Path Parameter | N/A |
| Request Body | N/A |
| Headers | Authorization: Bearer {token} |
| Status Code | 200 |
| Response | <pre>{<br>&nbsp;&nbsp;"success":&nbsp;true,<br>&nbsp;&nbsp;"message":&nbsp;"Latest&nbsp;form&nbsp;templates&nbsp;retrieved&nbsp;successfully",<br>&nbsp;&nbsp;"data":&nbsp;[<br>&nbsp;&nbsp;&nbsp;&nbsp;{<br>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;"_id":&nbsp;"6a2288b5b265a11d8ca749f4",<br>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;"title":&nbsp;"Maintenance&nbsp;Request"<br>&nbsp;&nbsp;&nbsp;&nbsp;}<br>&nbsp;&nbsp;]<br>}</pre> |

Pemeriksaan daftar seluruh templat formulir difasilitasi melalui endpoint pada tabel di atas dengan token JWT pada tajuk otorisasi. Autentikasi diperlukan dan dapat diakses oleh semua role terautentikasi agar data templat yang dikembalikan terjamin keabsahannya. Array metadata templat formulir dikembalikan untuk memuat pilihan konfigurasi pada panel manajemen formulir.

---

### 3. Mengambil Detail Templat Formulir Berdasarkan ID

Pemeriksaan rincian bidang isian dari satu templat formulir spesifik diproses dengan melampirkan parameter ID unik templat. Token otorisasi JWT diperlukan untuk validasi hak akses sebelum data dikirimkan.

| Keterangan | Detail |
|---|---|
| Endpoint | GET `/forms/:id` |
| Autentikasi | Diperlukan (JWT Token) |
| Role | Semua role terautentikasi |
| Path Parameter | id : 6a2288b5b265a11d8ca749f4 |
| Request Body | N/A |
| Headers | Authorization: Bearer {token} |
| Status Code | 200 |
| Response | <pre>{<br>&nbsp;&nbsp;"success":&nbsp;true,<br>&nbsp;&nbsp;"message":&nbsp;"Form&nbsp;template&nbsp;retrieved&nbsp;successfully",<br>&nbsp;&nbsp;"data":&nbsp;{<br>&nbsp;&nbsp;&nbsp;&nbsp;"_id":&nbsp;"6a2288b5b265a11d8ca749f4",<br>&nbsp;&nbsp;&nbsp;&nbsp;"title":&nbsp;"Maintenance&nbsp;Request",<br>&nbsp;&nbsp;&nbsp;&nbsp;"description":&nbsp;"Form&nbsp;for&nbsp;request",<br>&nbsp;&nbsp;&nbsp;&nbsp;"formType":&nbsp;"intake",<br>&nbsp;&nbsp;&nbsp;&nbsp;"fields":&nbsp;[<br>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;{<br>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;"order":&nbsp;1,<br>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;"label":&nbsp;"Isu",<br>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;"type":&nbsp;"text",<br>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;"required":&nbsp;true,<br>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;"placeholder":&nbsp;"masukan&nbsp;isu",<br>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;"_id":&nbsp;"6a2288b5b265a11d8ca749f5"<br>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;},<br>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;{<br>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;"order":&nbsp;2,<br>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;"label":&nbsp;"Contoh",<br>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;"type":&nbsp;"multi_select",<br>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;"required":&nbsp;true,<br>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;"placeholder":&nbsp;null,<br>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;"options":&nbsp;[<br>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;{<br>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;"key":&nbsp;"1780648096177",<br>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;"value":&nbsp;"123"<br>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;},<br>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;{<br>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;"key":&nbsp;"1780648104542",<br>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;"value":&nbsp;"123"<br>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;},<br>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;{<br>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;"key":&nbsp;"1780648105394",<br>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;"value":&nbsp;"123"<br>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;}<br>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;],<br>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;"min":&nbsp;null,<br>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;"max":&nbsp;null,<br>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;"_id":&nbsp;"6a2288b5b265a11d8ca749f6"<br>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;},<br>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;{<br>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;"order":&nbsp;3,<br>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;"label":&nbsp;"Pendapat",<br>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;"type":&nbsp;"textarea",<br>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;"required":&nbsp;false,<br>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;"placeholder":&nbsp;"contoh&nbsp;pendapat",<br>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;"options":&nbsp;[],<br>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;"min":&nbsp;null,<br>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;"max":&nbsp;null,<br>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;"_id":&nbsp;"6a2288b5b265a11d8ca749f7"<br>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;}<br>&nbsp;&nbsp;&nbsp;&nbsp;]<br>&nbsp;&nbsp;},<br>&nbsp;&nbsp;"meta":&nbsp;{<br>&nbsp;&nbsp;&nbsp;&nbsp;"canDelete":&nbsp;true<br>&nbsp;&nbsp;}<br>}</pre> |

Pemeriksaan detail templat formulir berdasarkan ID difasilitasi melalui endpoint pada tabel di atas dengan parameter ID unik templat. Autentikasi diperlukan dan dapat diakses oleh semua role terautentikasi agar hak akses setiap pengguna divalidasi sebelum data dikirimkan. Objek data lengkap dengan array struktur isian dikembalikan bersama parameter izin penghapusan untuk antarmuka pengguna.

---

### 4. Memperbarui Templat Formulir

Pembaruan susunan bidang atau judul templat formulir diproses dengan mengirimkan parameter data pembaruan lengkap. Hak akses pembaruan dibatasi pada tingkat manajer ke atas untuk menjaga stabilitas alur kerja penugasan.

| Keterangan | Detail |
|---|---|
| Endpoint | PUT `/forms/:id` |
| Autentikasi | Diperlukan (JWT Token) |
| Role | Company Owner, Company Manager |
| Path Parameter | id : 6a22775db265a11d8ca74519 |
| Request Body | <pre>{<br>&nbsp;&nbsp;"title":&nbsp;"REPORT&nbsp;BARU&nbsp;EDIT",<br>&nbsp;&nbsp;"description":&nbsp;"Formulir&nbsp;Pelaporan&nbsp;Kerja&nbsp;Baru",<br>&nbsp;&nbsp;"formType":&nbsp;"report",<br>&nbsp;&nbsp;"fields":&nbsp;[<br>&nbsp;&nbsp;&nbsp;&nbsp;{<br>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;"order":&nbsp;1,<br>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;"label":&nbsp;"Isu&nbsp;kerusakan",<br>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;"type":&nbsp;"text",<br>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;"required":&nbsp;true,<br>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;"placeholder":&nbsp;"masukan&nbsp;isu"<br>&nbsp;&nbsp;&nbsp;&nbsp;}<br>&nbsp;&nbsp;]<br>}</pre> |
| Headers | Authorization: Bearer {token}, Content-Type: application/json |
| Status Code | 200 |
| Response | <pre>{<br>&nbsp;&nbsp;"success":&nbsp;true,<br>&nbsp;&nbsp;"message":&nbsp;"New&nbsp;form&nbsp;version&nbsp;created&nbsp;successfully",<br>&nbsp;&nbsp;"data":&nbsp;{<br>&nbsp;&nbsp;&nbsp;&nbsp;"_id":&nbsp;"6a22775db265a11d8ca7451c",<br>&nbsp;&nbsp;&nbsp;&nbsp;"title":&nbsp;"REPORT&nbsp;BARU&nbsp;EDIT",<br>&nbsp;&nbsp;&nbsp;&nbsp;"formType":&nbsp;"report",<br>&nbsp;&nbsp;&nbsp;&nbsp;"version":&nbsp;2<br>&nbsp;&nbsp;}<br>}</pre> |

Pembaruan templat formulir difasilitasi melalui endpoint pada tabel di atas dengan mengirimkan data judul, deskripsi, dan struktur bidang terbaru. Autentikasi diperlukan dan peran dibatasi untuk company owner dan company manager agar stabilitas alur kerja penugasan tetap terjaga. Versi baru dokumen templat didaftarkan secara otomatis untuk menghindari kerusakan riwayat dokumen lama yang sudah terisi.

---

### 5. Menghapus Templat Formulir

Pembersihan templat formulir dari katalog aktif dijalankan dengan mengirimkan parameter rute ID templat formulir. Otorisasi peran diperiksa untuk memastikan hak kepemilikan pemilik perusahaan sebelum operasi penghapusan disetujui.

| Keterangan | Detail |
|---|---|
| Endpoint | DELETE `/forms/:id` |
| Autentikasi | Diperlukan (JWT Token) |
| Role | Company Owner, Company Manager |
| Path Parameter | id : 6a22775db265a11d8ca74519 |
| Request Body | N/A |
| Headers | Authorization: Bearer {token} |
| Status Code | 200 |
| Response | <pre>{<br>&nbsp;&nbsp;"success":&nbsp;true,<br>&nbsp;&nbsp;"message":&nbsp;"Form&nbsp;template&nbsp;deleted&nbsp;successfully",<br>&nbsp;&nbsp;"data":&nbsp;{<br>&nbsp;&nbsp;&nbsp;&nbsp;"deletedCount":&nbsp;1<br>&nbsp;&nbsp;}<br>}</pre> |

Penghapusan templat formulir difasilitasi melalui endpoint pada tabel di atas dengan menyertakan parameter rute ID templat yang akan dihapus. Autentikasi diperlukan dan peran dibatasi untuk company owner dan company manager agar kepemilikan templat terverifikasi sebelum dihapus. Status dokumen diperbarui menjadi terhapus secara logis untuk menghindari ketidaksesuaian relasi data historis yang sudah tersimpan.

