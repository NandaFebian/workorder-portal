# Deskripsi Endpoint Modul Membership

Berikut disajikan tabel rincian teknis dari masing-masing *endpoint* yang terdapat pada modul *membership*.

### 1. Mengambil Klien Berlangganan

Pengambilan daftar seluruh klien yang terdaftar sebagai pelanggan aktif perusahaan dilakukan untuk meninjau relasi kemitraan bisnis. Otorisasi peran manajer atau pemilik perusahaan diperiksa untuk membatasi pemrosesan data ini.

| Keterangan | Detail |
|---|---|
| Endpoint | GET `/memberships` |
| Autentikasi | Diperlukan (JWT Token) |
| Role | Company Owner, Company Manager |
| Path Parameter | N/A |
| Request Body | N/A |
| Headers | Authorization: Bearer {token} |
| Status Code | 200 |
| Response | <pre>{<br>&nbsp;&nbsp;"success":&nbsp;true,<br>&nbsp;&nbsp;"code":&nbsp;200,<br>&nbsp;&nbsp;"message":&nbsp;"Subscribed&nbsp;clients&nbsp;loaded&nbsp;successfully",<br>&nbsp;&nbsp;"data":&nbsp;[<br>&nbsp;&nbsp;&nbsp;&nbsp;{<br>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;"user":&nbsp;{<br>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;"_id":&nbsp;"6a21c47aec7ef2549a52b65a",<br>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;"name":&nbsp;"Ledang&nbsp;Client",<br>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;"email":&nbsp;"ledang@client.com",<br>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;"role":&nbsp;"client"<br>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;},<br>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;"externalAccount":&nbsp;{<br>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;"_id":&nbsp;"6a2299b4b265a11d8ca75ddb",<br>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;"externalCustomerEmail":&nbsp;"budi.dewi886@service.org",<br>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;"externalCustomerName":&nbsp;"Budi&nbsp;Dewi",<br>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;"integrationType":&nbsp;"external_system",<br>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;"pairedAt":&nbsp;"2026-06-05T09:41:08.474Z",<br>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;"company":&nbsp;{<br>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;"_id":&nbsp;"6a21c2b9a7bdad3a940c3df1",<br>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;"name":&nbsp;"PT.&nbsp;Sukses&nbsp;Indonesia",<br>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;"address":&nbsp;"Jln.&nbsp;Udayana",<br>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;"description":&nbsp;"Mengalokasikan&nbsp;projek&nbsp;untuk&nbsp;Indonesia",<br>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;"createdAt":&nbsp;"2026-06-04T18:23:53.796Z",<br>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;"updatedAt":&nbsp;"2026-06-09T12:50:34.369Z",<br>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;"deletedAt":&nbsp;null<br>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;}<br>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;},<br>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;"integrationType":&nbsp;"external_system"<br>&nbsp;&nbsp;&nbsp;&nbsp;}<br>&nbsp;&nbsp;]<br>}</pre> |

Peninjauan daftar klien difasilitasi melalui endpoint pada tabel di atas bagi manajer atau pemilik perusahaan untuk meninjau daftar klien yang terdaftar sebagai pelanggan aktif. Autentikasi JWT dan pemeriksaan peran Company Owner atau Company Manager diterapkan untuk membatasi akses pembacaan data kemitraan ini. Informasi daftar keanggotaan yang dikembalikan dalam bentuk array objek dapat dimanfaatkan untuk evaluasi dan pengelolaan relasi kemitraan bisnis.

---

### 2. Mengambil Semua Kode Keanggotaan

Pemanggilan seluruh daftar kode promo keanggotaan (*membership codes*) dilakukan oleh pengelola perusahaan untuk memonitor ketersediaan voucer aktif. Validasi token JWT diterapkan guna menjaga integritas kunci promo agar tidak bocor.

| Keterangan | Detail |
|---|---|
| Endpoint | GET `/memberships/codes` |
| Autentikasi | Diperlukan (JWT Token) |
| Role | Company Owner, Company Manager |
| Path Parameter | N/A |
| Request Body | N/A |
| Headers | Authorization: Bearer {token} |
| Status Code | 200 |
| Response | <pre>{<br>&nbsp;&nbsp;"success":&nbsp;true,<br>&nbsp;&nbsp;"code":&nbsp;200,<br>&nbsp;&nbsp;"message":&nbsp;"Membership&nbsp;codes&nbsp;loaded&nbsp;successfully",<br>&nbsp;&nbsp;"data":&nbsp;[]<br>}</pre> |

Pemantauan ketersediaan voucer keanggotaan difasilitasi melalui endpoint pada tabel di atas bagi pengelola perusahaan. Autentikasi token JWT dan verifikasi peran manajerial diterapkan untuk menjaga integritas kunci promo agar tidak bocor. Data kode keanggotaan beserta status klaimnya yang dikembalikan dapat digunakan untuk memantau efektivitas program kemitraan.

---

### 3. Mengimpor Kode Keanggotaan (CSV)

Pemasukan data kode keanggotaan baru secara massal diproses menggunakan unggahan dokumen berkas CSV (*multipart/form-data*). Token otorisasi JWT wajib dilampirkan oleh pemilik atau manajer untuk memvalidasi operasi impor data.

| Keterangan | Detail |
|---|---|
| Endpoint | POST `/memberships/codes` |
| Autentikasi | Diperlukan (JWT Token) |
| Role | Company Owner, Company Manager |
| Path Parameter | N/A |
| Request Body | N/A |
| Headers | Authorization: Bearer {token}, Content-Type: multipart/form-data |
| Status Code | 201 |
| Response | <pre>{<br>&nbsp;&nbsp;"success":&nbsp;true,<br>&nbsp;&nbsp;"message":&nbsp;"Codes&nbsp;imported&nbsp;successfully",<br>&nbsp;&nbsp;"data":&nbsp;[<br>&nbsp;&nbsp;&nbsp;&nbsp;{<br>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;"code":&nbsp;"MEMB-001"<br>&nbsp;&nbsp;&nbsp;&nbsp;}<br>&nbsp;&nbsp;]<br>}</pre> |

Pemasukan data kode keanggotaan baru difasilitasi melalui endpoint pada tabel di atas bagi pemilik atau manajer untuk memasukkan data kode keanggotaan baru secara massal melalui unggahan CSV. Autentikasi token JWT dan format multipart/form-data pada header digunakan untuk memvalidasi operasi impor data. Seluruh entri kode yang termuat di dalam berkas CSV divalidasi formatnya sebelum didaftarkan secara massal ke dalam database.

---

### 4. Mengklaim Kode Keanggotaan

Pengklaiman kode diskon atau token keanggotaan oleh klien diproses untuk mengaktifkan status berlangganan pada perusahaan tertentu. Operasi ini membutuhkan pengiriman kode atau token integrasi di dalam badan permintaan (*request body*).

| Keterangan | Detail |
|---|---|
| Endpoint | POST `/memberships/codes/claim` |
| Autentikasi | Diperlukan (JWT Token) |
| Role | Semua role terautentikasi |
| Path Parameter | N/A |
| Request Body | <pre>{<br>&nbsp;&nbsp;"code":&nbsp;"MEMB-001"<br>}</pre> |
| Headers | Authorization: Bearer {token}, Content-Type: application/json |
| Status Code | 200 |
| Response | <pre>{<br>&nbsp;&nbsp;"message":&nbsp;"Membership&nbsp;code&nbsp;claimed&nbsp;successfully",<br>&nbsp;&nbsp;"data":&nbsp;{<br>&nbsp;&nbsp;&nbsp;&nbsp;"companyId":&nbsp;"6a21c2b9a7bdad3a940c3df1",<br>&nbsp;&nbsp;&nbsp;&nbsp;"claimedAt":&nbsp;"2026-06-09T12:00:00.000Z"<br>&nbsp;&nbsp;}<br>}</pre> |

Pengaktifan status berlangganan difasilitasi melalui endpoint pada tabel di atas bagi klien yang ingin mengaktifkan status berlangganan pada perusahaan tertentu. Request body berisi kode keanggotaan dan autentikasi JWT diverifikasi sebelum sistem memproses klaim. Informasi tanggal klaim dan relasi ID perusahaan dikembalikan kepada pengguna sebagai bukti registrasi kemitraan baru.

---

### 5. Menghapus Kode Keanggotaan

Penghapusan kode keanggotaan dari basis data sistem dijalankan dengan menyertakan ID kode keanggotaan pada parameter rute. Token otorisasi JWT wajib dikirimkan untuk membuktikan wewenang manajerial pengelola.

| Keterangan | Detail |
|---|---|
| Endpoint | DELETE `/memberships/codes/:id` |
| Autentikasi | Diperlukan (JWT Token) |
| Role | Company Owner, Company Manager |
| Path Parameter | id : 6a22775db265a11d8ca7452c |
| Request Body | N/A |
| Headers | Authorization: Bearer {token} |
| Status Code | 200 |
| Response | <pre>{<br>&nbsp;&nbsp;"success":&nbsp;true,<br>&nbsp;&nbsp;"message":&nbsp;"Membership&nbsp;code&nbsp;deleted&nbsp;successfully",<br>&nbsp;&nbsp;"data":&nbsp;{<br>&nbsp;&nbsp;&nbsp;&nbsp;"deletedCount":&nbsp;1<br>&nbsp;&nbsp;}<br>}</pre> |

Penghapusan kode keanggotaan difasilitasi melalui endpoint pada tabel di atas bagi pemilik atau manajer perusahaan untuk menghapus kode keanggotaan dari basis data. Autentikasi token JWT dan parameter ID kode pada path diperiksa untuk membuktikan wewenang manajerial pengelola. Entri kode keanggotaan dihapus secara fisik sehingga kode tersebut tidak dapat lagi diklaim oleh siapa pun.

