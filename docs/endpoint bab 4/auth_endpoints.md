# Deskripsi Endpoint Modul Authentication

Berikut disajikan tabel rincian teknis dari masing-masing *endpoint* yang terdapat pada modul *authentication*.

### 1. Registrasi Pengguna Baru

Pengisian formulir pendaftaran oleh calon pengguna baru dilakukan untuk menyimpan data akun ke dalam basis data sistem. Proses pendaftaran ini dijalankan tanpa memerlukan token otorisasi karena akun pengguna belum terbentuk.

| Keterangan | Detail |
|---|---|
| Endpoint | POST `/auth/register` |
| Autentikasi | Tidak Diperlukan |
| Role | Umum |
| Path Parameter | N/A |
| Request Body | <pre>{<br>&nbsp;&nbsp;"name":&nbsp;"Jane&nbsp;Doe",<br>&nbsp;&nbsp;"email":&nbsp;"janedoe@example.com",<br>&nbsp;&nbsp;"password":&nbsp;"securepassword",<br>&nbsp;&nbsp;"role":&nbsp;"unassigned_staff"<br>}</pre> |
| Headers | Content-Type: application/json |
| Status Code | 200 |
| Response | <pre>{<br>&nbsp;&nbsp;"success":&nbsp;true,<br>&nbsp;&nbsp;"message":&nbsp;"User&nbsp;registered&nbsp;successfully",<br>&nbsp;&nbsp;"data":&nbsp;{<br>&nbsp;&nbsp;&nbsp;&nbsp;"_id":&nbsp;"6a21c2ceec7ef2549a52b50f",<br>&nbsp;&nbsp;&nbsp;&nbsp;"name":&nbsp;"Jane&nbsp;Doe",<br>&nbsp;&nbsp;&nbsp;&nbsp;"email":&nbsp;"janedoe@example.com",<br>&nbsp;&nbsp;&nbsp;&nbsp;"role":&nbsp;"unassigned_staff"<br>&nbsp;&nbsp;}<br>}</pre> |

Registrasi pengguna baru difasilitasi melalui endpoint pada tabel di atas dengan mengirimkan data nama, email, kata sandi, dan peran pengguna. Autentikasi tidak diperlukan pada proses ini karena akun pengguna belum tersedia di dalam sistem. Data akun yang terdaftar dapat digunakan untuk masuk sistem dan memperoleh token akses JWT.

---

### 2. Registrasi Perusahaan dan Pemilik

Pendaftaran entitas bisnis baru beserta akun pemilik (*owner*) diproses secara bersamaan melalui pengiriman data registrasi perusahaan. Fasilitas ini disediakan secara terbuka guna memudahkan pengguna baru yang ingin mendaftarkan perusahaannya ke dalam platform.

| Keterangan | Detail |
|---|---|
| Endpoint | POST `/auth/register-company` |
| Autentikasi | Tidak Diperlukan |
| Role | Umum |
| Path Parameter | N/A |
| Request Body | <pre>{<br>&nbsp;&nbsp;"name":&nbsp;"John&nbsp;Doe",<br>&nbsp;&nbsp;"email":&nbsp;"johndoe@example.com",<br>&nbsp;&nbsp;"password":&nbsp;"securepassword",<br>&nbsp;&nbsp;"companyName":&nbsp;"Indo&nbsp;Tech"<br>}</pre> |
| Headers | Content-Type: application/json |
| Status Code | 200 |
| Response | <pre>{<br>&nbsp;&nbsp;"success":&nbsp;true,<br>&nbsp;&nbsp;"message":&nbsp;"Company&nbsp;and&nbsp;owner&nbsp;registered&nbsp;successfully",<br>&nbsp;&nbsp;"data":&nbsp;{<br>&nbsp;&nbsp;&nbsp;&nbsp;"user":&nbsp;{<br>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;"_id":&nbsp;"6a21c2ceec7ef2549a52b50f",<br>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;"name":&nbsp;"John&nbsp;Doe",<br>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;"email":&nbsp;"johndoe@example.com",<br>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;"role":&nbsp;"owner_company"<br>&nbsp;&nbsp;&nbsp;&nbsp;},<br>&nbsp;&nbsp;&nbsp;&nbsp;"company":&nbsp;{<br>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;"_id":&nbsp;"6a21c2b9a7bdad3a940c3df1",<br>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;"name":&nbsp;"Indo&nbsp;Tech"<br>&nbsp;&nbsp;&nbsp;&nbsp;}<br>&nbsp;&nbsp;},<br>&nbsp;&nbsp;"meta":&nbsp;{<br>&nbsp;&nbsp;&nbsp;&nbsp;"welcome":&nbsp;true<br>&nbsp;&nbsp;}<br>}</pre> |

Pendaftaran perusahaan dan pemiliknya difasilitasi melalui endpoint pada tabel di atas dengan mengirimkan data perusahaan dan identitas pemilik. Autentikasi tidak diperlukan pada endpoint ini agar pengguna baru dapat mendaftarkan entitas bisnisnya tanpa hambatan otorisasi awal. Perusahaan dan akun pemilik yang terdaftar secara otomatis dihubungkan di dalam basis data sistem untuk mempercepat inisialisasi organisasi.

---

### 3. Masuk ke Sistem (Login)

Verifikasi kredensial pengguna diproses melalui *endpoint* masuk sistem guna mendapatkan token otorisasi yang valid. Pengguna wajib mengirimkan alamat email dan kata sandi yang telah terdaftar sebelumnya.

| Keterangan | Detail |
|---|---|
| Endpoint | POST `/auth/login` |
| Autentikasi | Tidak Diperlukan |
| Role | Umum |
| Path Parameter | N/A |
| Request Body | <pre>{<br>&nbsp;&nbsp;"email":&nbsp;"ledang@owner.com",<br>&nbsp;&nbsp;"password":&nbsp;"123"<br>}</pre> |
| Headers | Content-Type: application/json |
| Status Code | 200 |
| Response | <pre>{<br>&nbsp;&nbsp;"success":&nbsp;true,<br>&nbsp;&nbsp;"code":&nbsp;200,<br>&nbsp;&nbsp;"message":&nbsp;"Operation&nbsp;successful",<br>&nbsp;&nbsp;"data":&nbsp;{<br>&nbsp;&nbsp;&nbsp;&nbsp;"user":&nbsp;{<br>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;"_id":&nbsp;"6a21c2b9a7bdad3a940c3def",<br>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;"name":&nbsp;"Ledang&nbsp;Owner",<br>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;"email":&nbsp;"ledang@owner.com",<br>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;"role":&nbsp;"owner_company"<br>&nbsp;&nbsp;&nbsp;&nbsp;},<br>&nbsp;&nbsp;&nbsp;&nbsp;"token":&nbsp;"Bearer&nbsp;eyJhbGciOiJIUzI1Ni..."<br>&nbsp;&nbsp;}<br>}</pre> |

Verifikasi kredensial pengguna difasilitasi melalui endpoint pada tabel di atas dengan mengirimkan email dan kata sandi yang terdaftar. Autentikasi tidak diperlukan pada tahap ini karena token akses belum dimiliki oleh pengguna yang akan masuk sistem. Token JWT yang dihasilkan oleh peladen dapat digunakan untuk mengakses endpoint-endpoint terlindungi di dalam platform.

---

### 4. Keluar dari Sistem (Logout)

Pembatalan masa aktif token yang sedang digunakan dilakukan melalui proses keluar sistem oleh pengguna. Proses ini memerlukan validasi token yang dikirimkan melalui tajuk otorisasi.

| Keterangan | Detail |
|---|---|
| Endpoint | POST `/auth/logout` |
| Autentikasi | Diperlukan (JWT Token) |
| Role | Semua role terautentikasi |
| Path Parameter | N/A |
| Request Body | N/A |
| Headers | Authorization: Bearer {token} |
| Status Code | 200 |
| Response | <pre>{<br>&nbsp;&nbsp;"success":&nbsp;true,<br>&nbsp;&nbsp;"message":&nbsp;"Logout&nbsp;successful.&nbsp;Please&nbsp;discard&nbsp;your&nbsp;token.",<br>&nbsp;&nbsp;"data":&nbsp;{<br>&nbsp;&nbsp;&nbsp;&nbsp;"timestamp":&nbsp;"2026-06-09T12:00:00.000Z"<br>&nbsp;&nbsp;}<br>}</pre> |

Pembatalan masa aktif token difasilitasi melalui endpoint pada tabel di atas dengan menyertakan token JWT pada tajuk otorisasi. Autentikasi diperlukan pada endpoint ini agar token yang digunakan dapat divalidasi dan dihentikan masa berlakunya oleh sistem. Keamanan sesi pengguna terjaga setelah token tidak lagi berlaku untuk permintaan selanjutnya.

---

### 5. Mengambil Profil Pengguna

Pengambilan data profil lengkap dari pengguna yang sedang masuk sistem dilakukan untuk menampilkan informasi akun pada antarmuka. Hak akses *endpoint* ini dilindungi secara ketat menggunakan mekanisme verifikasi token JWT.

| Keterangan | Detail |
|---|---|
| Endpoint | GET `/auth/profile` |
| Autentikasi | Diperlukan (JWT Token) |
| Role | Semua role terautentikasi |
| Path Parameter | N/A |
| Request Body | N/A |
| Headers | Authorization: Bearer {token} |
| Status Code | 200 |
| Response | <pre>{<br>&nbsp;&nbsp;"success":&nbsp;true,<br>&nbsp;&nbsp;"code":&nbsp;200,<br>&nbsp;&nbsp;"message":&nbsp;"Profile&nbsp;retrieved&nbsp;successfully",<br>&nbsp;&nbsp;"data":&nbsp;{<br>&nbsp;&nbsp;&nbsp;&nbsp;"_id":&nbsp;"6a21c2b9a7bdad3a940c3def",<br>&nbsp;&nbsp;&nbsp;&nbsp;"name":&nbsp;"Ledang&nbsp;Owner",<br>&nbsp;&nbsp;&nbsp;&nbsp;"email":&nbsp;"ledang@owner.com",<br>&nbsp;&nbsp;&nbsp;&nbsp;"role":&nbsp;"owner_company",<br>&nbsp;&nbsp;&nbsp;&nbsp;"positionId":&nbsp;null,<br>&nbsp;&nbsp;&nbsp;&nbsp;"deletedAt":&nbsp;null,<br>&nbsp;&nbsp;&nbsp;&nbsp;"createdAt":&nbsp;"2026-06-04T18:23:53.459Z",<br>&nbsp;&nbsp;&nbsp;&nbsp;"updatedAt":&nbsp;"2026-06-09T12:42:40.310Z",<br>&nbsp;&nbsp;&nbsp;&nbsp;"__v":&nbsp;0,<br>&nbsp;&nbsp;&nbsp;&nbsp;"company":&nbsp;{<br>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;"_id":&nbsp;"6a21c2b9a7bdad3a940c3df1",<br>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;"name":&nbsp;"PT.&nbsp;Sukses&nbsp;Indonesia",<br>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;"address":&nbsp;"Jln.&nbsp;Udayana",<br>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;"description":&nbsp;"Mengalokasikan&nbsp;projek&nbsp;untuk&nbsp;Indonesia"<br>&nbsp;&nbsp;&nbsp;&nbsp;}<br>&nbsp;&nbsp;}<br>}</pre> |

Pengambilan data profil pengguna difasilitasi melalui endpoint pada tabel di atas dengan melampirkan token JWT pada tajuk permintaan. Autentikasi diperlukan untuk memastikan hanya pengguna yang sah dapat mengakses data profil miliknya sendiri. Data profil pribadi seperti kata sandi disembunyikan oleh peladen demi menjaga kerahasiaan informasi sensitif pengguna.

