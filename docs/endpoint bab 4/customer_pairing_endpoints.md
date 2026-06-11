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

Token inisiasi unik dihasilkan oleh peladen dan dikembalikan kepada klien untuk dilampirkan pada pemanggilan layanan otorisasi eksternal. Klien kemudian diarahkan menuju URL verifikasi eksternal menggunakan token tersebut.

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

Hubungan antara akun klien lokal dan akun platform eksternal resmi disimpan ke dalam basis data sistem setelah kode otorisasi dinyatakan sah. Nilai konfirmasi keaktifan hubungan dikembalikan kepada klien.

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

Array berisi relasi akun yang aktif dikembalikan ke aplikasi klien untuk mempermudah monitoring akun eksternal. Informasi ini berguna sebagai data referensi pengelolaan hubungan antarplatform.

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

Satu objek detail relasi akun eksternal dikirimkan kembali oleh peladen jika data relasi ditemukan. Klien dapat menggunakan informasi ID eksternal tersebut untuk memverifikasi hak akses layanannya.

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

Relasi akun eksternal dihapus secara permanen dari basis data sistem setelah proses verifikasi disetujui. Notifikasi pemutusan koneksi dikembalikan kepada klien sebagai konfirmasi keberhasilan operasional.

