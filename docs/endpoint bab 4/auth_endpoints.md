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

Data pendaftaran yang dikirimkan melalui permintaan tersebut divalidasi terlebih dahulu oleh sistem sebelum proses penyimpanan dilakukan. Token autentikasi tidak dihasilkan pada tahap ini sehingga pengguna diarahkan untuk melakukan proses masuk sistem guna memperoleh token akses.

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

Entitas perusahaan baru dan akun administrator bertipe pemilik secara otomatis dihubungkan di dalam sistem setelah proses registrasi berhasil. Pesan selamat datang dilampirkan pada bagian metadata respon sebagai penanda keberhasilan inisialisasi entitas.

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

Token akses berformat JSON Web Token (JWT) dikembalikan oleh sistem setelah pencocokan kredensial dinyatakan valid. Token tersebut harus disimpan oleh klien dan dilampirkan pada setiap permintaan berikutnya ke *endpoint* yang terlindungi.

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

Masa berlaku token dihentikan oleh sistem seketika setelah permintaan keluar sistem dinyatakan berhasil. Riwayat waktu pemrosesan keluar sistem dicatat dan dikembalikan dalam bentuk stempel waktu pada objek respon.

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

Informasi pribadi seperti kata sandi disembunyikan oleh peladen sebelum objek data profil dikirimkan ke pengguna. Data profil yang bersih dikembalikan guna menjaga kerahasiaan informasi sensitif milik pengguna.

