# Deskripsi Endpoint Modul Customer Pairing

Berikut disajikan tabel rincian teknis dari masing-masing *endpoint* yang terdapat pada modul *customer pairing*.

### 1. Menginisiasi Proses Pairing

Pemberian tautan callback dan pengenal ID perusahaan dikirimkan oleh klien untuk memulai alur integrasi akun eksternal. Otorisasi token divalidasi guna memastikan pemohon memiliki peran sebagai klien terdaftar.

| Keterangan | Detail |
|---|---|
| Endpoint | POST `/customer-pairing/start` |
| Autentikasi | Diperlukan (JWT Token) |
| Role | Client |
| Path Parameter | N/A |
| Request Body | <pre>{<br>&nbsp;&nbsp;"redirect_base_url":&nbsp;"http://example.com/callback",<br>&nbsp;&nbsp;"company_id":&nbsp;"6a21c2b9a7bdad3a940c3df1"<br>}</pre> |
| Headers | Authorization: Bearer {token}, Content-Type: application/json |
| Status Code | 200 |
| Response | <pre>{<br>&nbsp;&nbsp;"success":&nbsp;true,<br>&nbsp;&nbsp;"message":&nbsp;"Pairing&nbsp;initiated",<br>&nbsp;&nbsp;"data":&nbsp;{<br>&nbsp;&nbsp;&nbsp;&nbsp;"pairingToken":&nbsp;"pair_token_abc123"<br>&nbsp;&nbsp;}<br>}</pre> |

Inisiasi proses pairing akun eksternal difasilitasi melalui endpoint pada tabel di atas dengan mengirimkan tautan callback dan ID perusahaan. Autentikasi diperlukan dan peran dibatasi untuk client agar hanya klien terdaftar yang dapat memulai alur integrasi akun eksternal. Token inisiasi unik dihasilkan oleh peladen untuk dilampirkan pada pemanggilan layanan otorisasi eksternal.

---

### 2. Menyelesaikan Proses Pairing

Konfirmasi kode otorisasi dan nilai *state* dari peladen integrasi luar diserahkan oleh klien untuk merampungkan sinkronisasi akun. Validasi token dikerjakan guna menjamin keamanan proses penyambungan.

| Keterangan | Detail |
|---|---|
| Endpoint | POST `/customer-pairing/complete` |
| Autentikasi | Diperlukan (JWT Token) |
| Role | Client |
| Path Parameter | N/A |
| Request Body | <pre>{<br>&nbsp;&nbsp;"company_id":&nbsp;"6a21c2b9a7bdad3a940c3df1",<br>&nbsp;&nbsp;"code":&nbsp;"callback_auth_code_123",<br>&nbsp;&nbsp;"state":&nbsp;"callback_state_xyz"<br>}</pre> |
| Headers | Authorization: Bearer {token}, Content-Type: application/json |
| Status Code | 200 |
| Response | <pre>{<br>&nbsp;&nbsp;"success":&nbsp;true,<br>&nbsp;&nbsp;"message":&nbsp;"Account&nbsp;paired&nbsp;successfully",<br>&nbsp;&nbsp;"data":&nbsp;{<br>&nbsp;&nbsp;&nbsp;&nbsp;"paired":&nbsp;true<br>&nbsp;&nbsp;}<br>}</pre> |

Penyelesaian proses pairing difasilitasi melalui endpoint pada tabel di atas dengan mengirimkan kode otorisasi dan nilai state dari peladen eksternal. Autentikasi diperlukan dan peran dibatasi untuk client agar proses sinkronisasi akun hanya dilakukan oleh klien yang sah. Hubungan antara akun klien lokal dan akun platform eksternal disimpan ke basis data setelah kode otorisasi dinyatakan valid.

---

### 3. Mengambil Semua Akun Terhubung

Pemantauan seluruh akun eksternal yang terhubung dengan profil klien dijalankan melalui pemanggilan daftar relasi keanggotaan. Token otorisasi diperlukan untuk menyaring data agar hanya memuat data milik klien bersangkutan.

| Keterangan | Detail |
|---|---|
| Endpoint | GET `/customer-pairing` |
| Autentikasi | Diperlukan (JWT Token) |
| Role | Client |
| Path Parameter | N/A |
| Request Body | N/A |
| Headers | Authorization: Bearer {token} |
| Status Code | 200 |
| Response | <pre>{<br>&nbsp;&nbsp;"success":&nbsp;true,<br>&nbsp;&nbsp;"message":&nbsp;"Paired&nbsp;accounts&nbsp;retrieved&nbsp;successfully",<br>&nbsp;&nbsp;"data":&nbsp;[<br>&nbsp;&nbsp;&nbsp;&nbsp;{<br>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;"_id":&nbsp;"6a22775db265a11d8ca7451a",<br>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;"externalAccountId":&nbsp;"ext_id_123",<br>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;"companyId":&nbsp;"6a21c2b9a7bdad3a940c3df1"<br>&nbsp;&nbsp;&nbsp;&nbsp;}<br>&nbsp;&nbsp;]<br>}</pre> |

Pengambilan semua akun eksternal yang terhubung difasilitasi melalui endpoint pada tabel di atas dengan token JWT pada tajuk otorisasi. Autentikasi diperlukan dan peran dibatasi untuk client agar data relasi akun hanya memuat milik klien yang bersangkutan. Array relasi akun aktif dikembalikan untuk mempermudah monitoring dan pengelolaan hubungan antarplatform.

---

### 4. Mengambil Detail Akun Terhubung Pada Perusahaan

Rincian detail hubungan sinkronisasi akun eksternal pada satu perusahaan spesifik diambil dengan mengirimkan ID perusahaan sebagai parameter. Token otorisasi JWT wajib dilampirkan guna melindungi kerahasiaan integrasi.

| Keterangan | Detail |
|---|---|
| Endpoint | GET `/customer-pairing/company/:companyId` |
| Autentikasi | Diperlukan (JWT Token) |
| Role | Client |
| Path Parameter | companyId : 6a21c2b9a7bdad3a940c3df1 |
| Request Body | N/A |
| Headers | Authorization: Bearer {token} |
| Status Code | 200 |
| Response | <pre>{<br>&nbsp;&nbsp;"success":&nbsp;true,<br>&nbsp;&nbsp;"message":&nbsp;"Paired&nbsp;account&nbsp;retrieved&nbsp;successfully",<br>&nbsp;&nbsp;"data":&nbsp;{<br>&nbsp;&nbsp;&nbsp;&nbsp;"_id":&nbsp;"6a22775db265a11d8ca7451a",<br>&nbsp;&nbsp;&nbsp;&nbsp;"externalAccountId":&nbsp;"ext_id_123"<br>&nbsp;&nbsp;}<br>}</pre> |

Pengambilan detail akun terhubung pada perusahaan tertentu difasilitasi melalui endpoint pada tabel di atas dengan parameter ID perusahaan. Autentikasi diperlukan dan peran dibatasi untuk client agar kerahasiaan data integrasi setiap perusahaan tetap terjaga. Objek detail relasi akun eksternal dikirimkan untuk memverifikasi hak akses layanan klien pada perusahaan terkait.

---

### 5. Memutuskah Hubungan Akun Eksternal

Penghapusan integrasi dan pemutusan hubungan akun eksternal diproses dengan menyebutkan ID akun eksternal pada parameter rute. Otorisasi token diperiksa guna menjamin hak kepemilikan hubungan akun yang akan dihapus.

| Keterangan | Detail |
|---|---|
| Endpoint | DELETE `/customer-pairing/:external_account_id` |
| Autentikasi | Diperlukan (JWT Token) |
| Role | Client |
| Path Parameter | external_account_id : ext_id_123 |
| Request Body | N/A |
| Headers | Authorization: Bearer {token} |
| Status Code | 200 |
| Response | <pre>{<br>&nbsp;&nbsp;"success":&nbsp;true,<br>&nbsp;&nbsp;"message":&nbsp;"External&nbsp;account&nbsp;unpaired&nbsp;successfully",<br>&nbsp;&nbsp;"data":&nbsp;{<br>&nbsp;&nbsp;&nbsp;&nbsp;"unpaired":&nbsp;true<br>&nbsp;&nbsp;}<br>}</pre> |

Pemutusan hubungan akun eksternal difasilitasi melalui endpoint pada tabel di atas dengan menyertakan ID akun eksternal pada parameter rute. Autentikasi diperlukan dan peran dibatasi untuk client agar hak kepemilikan hubungan akun yang akan dihapus dapat diverifikasi. Relasi akun eksternal dihapus secara permanen dari basis data setelah proses verifikasi disetujui oleh sistem.

