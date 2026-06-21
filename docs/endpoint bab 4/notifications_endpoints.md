# Deskripsi Endpoint Modul Notifications

Berikut disajikan tabel rincian teknis dari masing-masing *endpoint* yang terdapat pada modul *notifications*.

### 1. Mengambil Kotak Masuk Notifikasi

Pengambilan pesan pemberitahuan yang dikirimkan oleh sistem dilakukan untuk menyajikan informasi terbaru pada kotak masuk pengguna. Hak akses disaring menggunakan token otorisasi JWT agar setiap pengguna hanya menerima pesan yang ditujukan untuk dirinya sendiri.

| Keterangan | Detail |
|---|---|
| Endpoint | GET `/notifications` |
| Autentikasi | Diperlukan (JWT Token) |
| Role | Semua role terautentikasi |
| Path Parameter | N/A |
| Request Body | N/A |
| Headers | Authorization: Bearer {token} |
| Status Code | 200 |
| Response | <pre>{<br>&nbsp;&nbsp;"success":&nbsp;true,<br>&nbsp;&nbsp;"code":&nbsp;200,<br>&nbsp;&nbsp;"message":&nbsp;"Operation&nbsp;successful",<br>&nbsp;&nbsp;"data":&nbsp;[<br>&nbsp;&nbsp;&nbsp;&nbsp;{<br>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;"_id":&nbsp;"6a27fc486b3d62e70195bfd4",<br>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;"userId":&nbsp;"6a21c2b9a7bdad3a940c3def",<br>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;"title":&nbsp;"Permintaan&nbsp;Layanan&nbsp;Baru",<br>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;"body":&nbsp;"Terdapat&nbsp;permintaan&nbsp;layanan&nbsp;baru&nbsp;(SR-M2DRNHBF)&nbsp;dari&nbsp;Ledang&nbsp;Owner.",<br>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;"data":&nbsp;{<br>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;"resource":&nbsp;"service_request",<br>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;"resourceId":&nbsp;"6a27fc466b3d62e70195bfc7"<br>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;},<br>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;"isRead":&nbsp;false,<br>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;"readAt":&nbsp;null,<br>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;"createdAt":&nbsp;"2026-06-09T11:43:04.429Z"<br>&nbsp;&nbsp;&nbsp;&nbsp;},<br>&nbsp;&nbsp;&nbsp;&nbsp;{<br>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;"_id":&nbsp;"6a27fc466b3d62e70195bfcd",<br>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;"userId":&nbsp;"6a21c2b9a7bdad3a940c3def",<br>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;"title":&nbsp;"Permintaan&nbsp;Layanan&nbsp;Diterima",<br>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;"body":&nbsp;"Permintaan&nbsp;layanan&nbsp;Anda&nbsp;(SR-M2DRNHBF)&nbsp;telah&nbsp;berhasil&nbsp;dibuat&nbsp;dan&nbsp;sedang&nbsp;menunggu&nbsp;peninjauan.",<br>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;"data":&nbsp;{<br>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;"resource":&nbsp;"service_request",<br>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;"resourceId":&nbsp;"6a27fc466b3d62e70195bfc7"<br>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;},<br>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;"isRead":&nbsp;false,<br>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;"readAt":&nbsp;null,<br>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;"createdAt":&nbsp;"2026-06-09T11:43:02.964Z"<br>&nbsp;&nbsp;&nbsp;&nbsp;},<br>&nbsp;&nbsp;&nbsp;&nbsp;{<br>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;"_id":&nbsp;"6a27fb76b38f7b06d56e5eb8",<br>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;"userId":&nbsp;"6a21c2b9a7bdad3a940c3def",<br>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;"title":&nbsp;"Permintaan&nbsp;Layanan&nbsp;Baru",<br>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;"body":&nbsp;"Terdapat&nbsp;permintaan&nbsp;layanan&nbsp;baru&nbsp;(SR-AIKWIJOC)&nbsp;dari&nbsp;Ledang&nbsp;Client.",<br>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;"data":&nbsp;{<br>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;"resource":&nbsp;"service_request",<br>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;"resourceId":&nbsp;"6a27fb76b38f7b06d56e5eab"<br>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;},<br>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;"isRead":&nbsp;false,<br>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;"readAt":&nbsp;null,<br>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;"createdAt":&nbsp;"2026-06-09T11:39:34.747Z"<br>&nbsp;&nbsp;&nbsp;&nbsp;}<br>&nbsp;&nbsp;]<br>}</pre> |

Penyajian informasi pemberitahuan terbaru difasilitasi melalui endpoint pada tabel di atas bagi seluruh pengguna terautentikasi. Autentikasi JWT diterapkan agar setiap pengguna hanya menerima pesan yang ditujukan untuk dirinya sendiri. Daftar objek notifikasi yang dikembalikan dalam format array terurut dapat digunakan untuk meninjau aktivitas sistem secara kronologis.

---

### 2. Mendaftarkan Token FCM Perangkat

Pendaftaran token perangkat FCM (*Firebase Cloud Messaging*) baru milik pengguna diproses ketika aplikasi seluler terhubung ke internet. Pengiriman token FCM ini membutuhkan lampiran token otorisasi JWT untuk mengaitkan perangkat dengan akun pengguna.

| Keterangan | Detail |
|---|---|
| Endpoint | POST `/notifications/fcm-token` |
| Autentikasi | Diperlukan (JWT Token) |
| Role | Semua role terautentikasi |
| Path Parameter | N/A |
| Request Body | <pre>{<br>&nbsp;&nbsp;"token":&nbsp;"fcm_token_abc_123"<br>}</pre> |
| Headers | Authorization: Bearer {token}, Content-Type: application/json |
| Status Code | 200 |
| Response | <pre>{<br>&nbsp;&nbsp;"message":&nbsp;"Token&nbsp;registered&nbsp;successfully"<br>}</pre> |

Pendaftaran token perangkat FCM baru difasilitasi melalui endpoint pada tabel di atas bagi seluruh pengguna terautentikasi. Request body berisi token dan autentikasi JWT diverifikasi sebelum data disimpan ke database peladen. Token yang terdaftar akan digunakan sebagai alamat tujuan pengiriman notifikasi langsung ketika terdapat pengerjaan baru.

---

### 3. Menghapus Token FCM Perangkat

Pemberhentian kiriman notifikasi langsung ke perangkat tertentu diproses dengan menghapus token FCM terkait dari profil pengguna. Hak akses pembersihan token dilindungi menggunakan token otorisasi JWT pengguna yang bersangkutan.

| Keterangan | Detail |
|---|---|
| Endpoint | DELETE `/notifications/fcm-token` |
| Autentikasi | Diperlukan (JWT Token) |
| Role | Semua role terautentikasi |
| Path Parameter | N/A |
| Request Body | <pre>{<br>&nbsp;&nbsp;"token":&nbsp;"fcm_token_abc_123"<br>}</pre> |
| Headers | Authorization: Bearer {token}, Content-Type: application/json |
| Status Code | 200 |
| Response | <pre>{<br>&nbsp;&nbsp;"message":&nbsp;"Token&nbsp;removed&nbsp;successfully"<br>}</pre> |

Penghentian kiriman notifikasi difasilitasi melalui endpoint pada tabel di atas bagi pengguna yang ingin menghentikan kiriman notifikasi ke perangkat tertentu. Request body berisi token FCM dan autentikasi JWT diperiksa untuk melindungi hak akses pembersihan token. Penghapusan relasi token dari data profil diselesaikan di database sehingga perangkat tidak akan lagi menerima notifikasi sistem.

