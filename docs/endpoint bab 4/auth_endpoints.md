# Deskripsi Endpoint Modul Authentication

Berikut disajikan tabel rincian teknis dari masing-masing *endpoint* yang terdapat pada modul *authentication*.

### 1. Registrasi Pengguna Baru

Pengajuan pendaftaran akun oleh calon pengguna baru diproses dengan mengirimkan kode OTP ke alamat surel yang didaftarkan. Akun pengguna belum dibentuk pada tahap ini sehingga data pendaftaran hanya disimpan sementara sampai kode OTP berhasil diverifikasi.

| Keterangan | Detail |
|---|---|
| Endpoint | POST `/auth/register` |
| Autentikasi | Tidak Diperlukan |
| Role | Umum |
| Path Parameter | N/A |
| Request Body | <pre>{<br>&nbsp;&nbsp;"name":&nbsp;"Jane&nbsp;Doe",<br>&nbsp;&nbsp;"email":&nbsp;"janedoe@example.com",<br>&nbsp;&nbsp;"password":&nbsp;"securepassword",<br>&nbsp;&nbsp;"role":&nbsp;"unassigned_staff"<br>}</pre> |
| Headers | Content-Type: application/json |
| Status Code | 200 |
| Response | <pre>{<br>&nbsp;&nbsp;"success":&nbsp;true,<br>&nbsp;&nbsp;"code":&nbsp;200,<br>&nbsp;&nbsp;"message":&nbsp;"Verification&nbsp;code&nbsp;sent&nbsp;to&nbsp;your&nbsp;email.&nbsp;Please&nbsp;verify&nbsp;to&nbsp;complete&nbsp;registration.",<br>&nbsp;&nbsp;"data":&nbsp;null<br>}</pre> |

Alamat surel yang telah terdaftar akan ditolak oleh sistem sebelum kode OTP dikirimkan. Objek data pada respon dikembalikan bernilai kosong (*null*) karena akun pengguna baru akan dibentuk setelah proses verifikasi kode OTP diselesaikan.

---
### 2. Registrasi Perusahaan dan Pemilik

Pengajuan pendaftaran entitas bisnis baru beserta akun pemilik (*owner*) diproses dengan mengirimkan kode OTP ke alamat surel pendaftar. Nama perusahaan divalidasi keunikannya terlebih dahulu sehingga pengguna tidak perlu menyelesaikan verifikasi untuk mengetahui bahwa nama tersebut telah digunakan.

| Keterangan | Detail |
|---|---|
| Endpoint | POST `/auth/register-company` |
| Autentikasi | Tidak Diperlukan |
| Role | Umum |
| Path Parameter | N/A |
| Request Body | <pre>{<br>&nbsp;&nbsp;"name":&nbsp;"John&nbsp;Doe",<br>&nbsp;&nbsp;"email":&nbsp;"johndoe@example.com",<br>&nbsp;&nbsp;"password":&nbsp;"securepassword",<br>&nbsp;&nbsp;"companyName":&nbsp;"Indo&nbsp;Tech"<br>}</pre> |
| Headers | Content-Type: application/json |
| Status Code | 200 |
| Response | <pre>{<br>&nbsp;&nbsp;"success":&nbsp;true,<br>&nbsp;&nbsp;"code":&nbsp;200,<br>&nbsp;&nbsp;"message":&nbsp;"Verification&nbsp;code&nbsp;sent&nbsp;to&nbsp;your&nbsp;email.&nbsp;Please&nbsp;verify&nbsp;to&nbsp;complete&nbsp;registration.",<br>&nbsp;&nbsp;"data":&nbsp;null<br>}</pre> |

Entitas perusahaan dan akun pemilik belum dibentuk pada tahap ini, melainkan disimpan sementara bersama kode OTP yang telah di-*hash*. Pemeriksaan keunikan nama perusahaan dijalankan sebelum surel dikirimkan guna mencegah kegagalan pendaftaran pada tahap verifikasi.

---
### 3. Verifikasi Kode OTP Pendaftaran

Verifikasi kode OTP yang diterima melalui surel dilakukan untuk membuktikan kepemilikan alamat surel pendaftar. Akun pengguna, termasuk entitas perusahaan bagi pendaftaran pemilik, baru dibentuk secara resmi pada tahap ini.

| Keterangan | Detail |
|---|---|
| Endpoint | POST `/auth/verify-otp` |
| Autentikasi | Tidak Diperlukan |
| Role | Umum |
| Path Parameter | N/A |
| Request Body | <pre>{<br>&nbsp;&nbsp;"email":&nbsp;"johndoe@example.com",<br>&nbsp;&nbsp;"otp":&nbsp;"284630"<br>}</pre> |
| Headers | Content-Type: application/json |
| Status Code | 200 |
| Response | <pre>{<br>&nbsp;&nbsp;"success":&nbsp;true,<br>&nbsp;&nbsp;"code":&nbsp;200,<br>&nbsp;&nbsp;"message":&nbsp;"Email&nbsp;verified&nbsp;and&nbsp;account&nbsp;created&nbsp;successfully",<br>&nbsp;&nbsp;"data":&nbsp;null<br>}</pre> |

Kode OTP dinyatakan tidak berlaku apabila telah melewati batas waktu 5 menit, telah salah dimasukkan sebanyak 5 kali, atau telah digunakan sebelumnya. Data pendaftaran sementara dihapus dari basis data segera setelah akun pengguna berhasil dibentuk sehingga kode bersifat sekali pakai.

---
### 4. Kirim Ulang Kode OTP Pendaftaran

Penerbitan ulang kode OTP disediakan bagi pengguna yang belum menerima atau telah melewatkan masa berlaku kode sebelumnya. Pengguna cukup mengirimkan alamat surel tanpa perlu mengisi ulang seluruh formulir pendaftaran.

| Keterangan | Detail |
|---|---|
| Endpoint | POST `/auth/resend-otp` |
| Autentikasi | Tidak Diperlukan |
| Role | Umum |
| Path Parameter | N/A |
| Request Body | <pre>{<br>&nbsp;&nbsp;"email":&nbsp;"johndoe@example.com"<br>}</pre> |
| Headers | Content-Type: application/json |
| Status Code | 200 |
| Response | <pre>{<br>&nbsp;&nbsp;"success":&nbsp;true,<br>&nbsp;&nbsp;"code":&nbsp;200,<br>&nbsp;&nbsp;"message":&nbsp;"A&nbsp;new&nbsp;verification&nbsp;code&nbsp;has&nbsp;been&nbsp;sent&nbsp;to&nbsp;your&nbsp;email.",<br>&nbsp;&nbsp;"data":&nbsp;null<br>}</pre> |

Kode OTP lama dinyatakan hangus dan penghitung percobaan gagal dikembalikan ke nilai awal setiap kali kode baru diterbitkan. Permintaan yang diajukan kurang dari 60 detik sejak pengiriman terakhir akan ditolak dengan kode status 429 guna mencegah pengiriman surel secara berlebihan.

---
### 5. Masuk ke Sistem (Login)

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
### 6. Keluar dari Sistem (Logout)

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
### 7. Mengambil Profil Pengguna

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

---
### 8. Permintaan Pengaturan Ulang Kata Sandi

Pengajuan pemulihan kata sandi dilakukan oleh pengguna yang kehilangan akses ke akunnya melalui pengiriman kode OTP ke alamat surel terdaftar. Respon yang dikembalikan selalu sama tanpa memandang terdaftar atau tidaknya alamat surel tersebut.

| Keterangan | Detail |
|---|---|
| Endpoint | POST `/auth/forgot-password` |
| Autentikasi | Tidak Diperlukan |
| Role | Umum |
| Path Parameter | N/A |
| Request Body | <pre>{<br>&nbsp;&nbsp;"email":&nbsp;"ledang@owner.com"<br>}</pre> |
| Headers | Content-Type: application/json |
| Status Code | 200 |
| Response | <pre>{<br>&nbsp;&nbsp;"success":&nbsp;true,<br>&nbsp;&nbsp;"code":&nbsp;200,<br>&nbsp;&nbsp;"message":&nbsp;"If&nbsp;the&nbsp;email&nbsp;is&nbsp;registered,&nbsp;a&nbsp;password&nbsp;reset&nbsp;code&nbsp;has&nbsp;been&nbsp;sent&nbsp;to&nbsp;it.",<br>&nbsp;&nbsp;"data":&nbsp;null<br>}</pre> |

Keseragaman pesan respon diterapkan secara sengaja agar *endpoint* ini tidak dapat dimanfaatkan untuk menelusuri alamat surel mana saja yang terdaftar di dalam sistem (*account enumeration*). Permintaan untuk alamat surel yang tidak dikenal diabaikan secara diam-diam tanpa menimbulkan galat.

---
### 9. Pengaturan Ulang Kata Sandi

Penetapan kata sandi baru dilakukan setelah pengguna memasukkan kode OTP yang dikirimkan ke alamat surelnya. Kode OTP tersebut menjadi satu-satunya dasar otorisasi sehingga kata sandi lama tidak diperlukan.

| Keterangan | Detail |
|---|---|
| Endpoint | POST `/auth/reset-password` |
| Autentikasi | Tidak Diperlukan |
| Role | Umum |
| Path Parameter | N/A |
| Request Body | <pre>{<br>&nbsp;&nbsp;"email":&nbsp;"ledang@owner.com",<br>&nbsp;&nbsp;"otp":&nbsp;"654321",<br>&nbsp;&nbsp;"newPassword":&nbsp;"katasandibaru"<br>}</pre> |
| Headers | Content-Type: application/json |
| Status Code | 200 |
| Response | <pre>{<br>&nbsp;&nbsp;"success":&nbsp;true,<br>&nbsp;&nbsp;"code":&nbsp;200,<br>&nbsp;&nbsp;"message":&nbsp;"Password&nbsp;has&nbsp;been&nbsp;reset&nbsp;successfully",<br>&nbsp;&nbsp;"data":&nbsp;null<br>}</pre> |

Kata sandi baru disimpan dalam bentuk *hash* bcrypt sebagaimana proses pendaftaran akun pada umumnya. Data permintaan pemulihan langsung dihapus setelah kata sandi berhasil diperbarui sehingga kode OTP bersifat sekali pakai.

