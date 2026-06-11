# Deskripsi Endpoint Modul FAQ

Berikut disajikan tabel rincian teknis dari masing-masing *endpoint* yang terdapat pada modul *faq*.

### 1. Toggle Aktif Fitur FAQ

Pengaktifan atau penonaktifan integrasi bantuan otomatis chatbot dilakukan oleh pemilik perusahaan. Operasi pembaruan ini mewajibkan pengiriman status boolean keaktifan dan otorisasi token JWT pemilik.

| Keterangan | Detail |
|---|---|
| Endpoint | PUT `/faq/toggle-active` |
| Autentikasi | Diperlukan (JWT Token) |
| Role | Company Owner |
| Path Parameter | N/A |
| Request Body | <pre>{<br>&nbsp;&nbsp;"isActive":&nbsp;true<br>}</pre> |
| Headers | Authorization: Bearer {token}, Content-Type: application/json |
| Status Code | 200 |
| Response | <pre>{<br>&nbsp;&nbsp;"success":&nbsp;true,<br>&nbsp;&nbsp;"message":&nbsp;"FAQ&nbsp;feature&nbsp;updated&nbsp;successfully.",<br>&nbsp;&nbsp;"data":&nbsp;{<br>&nbsp;&nbsp;&nbsp;&nbsp;"_id":&nbsp;"6a21c2b9a7bdad3a940c3df1",<br>&nbsp;&nbsp;&nbsp;&nbsp;"name":&nbsp;"PT.&nbsp;Sukses&nbsp;Indonesia",<br>&nbsp;&nbsp;&nbsp;&nbsp;"address":&nbsp;"Jln.&nbsp;Udayana",<br>&nbsp;&nbsp;&nbsp;&nbsp;"description":&nbsp;"Mengalokasikan&nbsp;projek&nbsp;untuk&nbsp;Indonesia",<br>&nbsp;&nbsp;&nbsp;&nbsp;"managers":&nbsp;[],<br>&nbsp;&nbsp;&nbsp;&nbsp;"staffs":&nbsp;[],<br>&nbsp;&nbsp;&nbsp;&nbsp;"isActive":&nbsp;true,<br>&nbsp;&nbsp;&nbsp;&nbsp;"isFaqActive":&nbsp;true,<br>&nbsp;&nbsp;&nbsp;&nbsp;"integrationConfig":&nbsp;{<br>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;"externalLoginUrl":&nbsp;"asd",<br>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;"externalVerifyUrl":&nbsp;"qwd",<br>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;"externalCheckMembershipsUrl":&nbsp;"qwd",<br>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;"externalCheckStatusUrl":&nbsp;null,<br>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;"secretKey":&nbsp;"83cfe59566e5cae5a84de63b:147a397cb0d29772c0a03fcfbed14c4b:8e2e2248d6ebd6f2afd86499",<br>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;"isIntegrationActive":&nbsp;true,<br>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;"integrationType":&nbsp;"external_system"<br>&nbsp;&nbsp;&nbsp;&nbsp;},<br>&nbsp;&nbsp;&nbsp;&nbsp;"deletedAt":&nbsp;null,<br>&nbsp;&nbsp;&nbsp;&nbsp;"createdAt":&nbsp;"2026-06-04T18:23:53.796Z",<br>&nbsp;&nbsp;&nbsp;&nbsp;"updatedAt":&nbsp;"2026-06-09T12:50:34.369Z",<br>&nbsp;&nbsp;&nbsp;&nbsp;"__v":&nbsp;0,<br>&nbsp;&nbsp;&nbsp;&nbsp;"owner":&nbsp;{<br>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;"_id":&nbsp;"6a21c2b9a7bdad3a940c3def",<br>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;"name":&nbsp;"Ledang&nbsp;Owner",<br>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;"email":&nbsp;"ledang@owner.com"<br>&nbsp;&nbsp;&nbsp;&nbsp;}<br>&nbsp;&nbsp;}<br>}</pre> |

Penyedia integrasi chatbot eksternal akan secara otomatis mendaftarkan profil perusahaan pada pemrosesan pengaktifan pertama kali. Status keaktifan terbaru dikembalikan sebagai objek konfirmasi pemrosesan data.

---

### 2. Mengunggah Dokumen Pengetahuan Teks

Pengiriman materi basis data bantuan dalam format teks mentah dilakukan untuk memperkaya pengetahuan chatbot perusahaan. Hak akses pembuatan data ini dilindungi agar hanya pemilik perusahaan saja yang diizinkan mengunggah.

| Keterangan | Detail |
|---|---|
| Endpoint | POST `/faq/text-docs` |
| Autentikasi | Diperlukan (JWT Token) |
| Role | Company Owner |
| Path Parameter | N/A |
| Request Body | <pre>{<br>&nbsp;&nbsp;"title":&nbsp;"SOP&nbsp;Penggunaan&nbsp;Sistem",<br>&nbsp;&nbsp;"content":&nbsp;"Berikut&nbsp;cara&nbsp;untuk&nbsp;menggunakan&nbsp;aplikasi&nbsp;portal..."<br>}</pre> |
| Headers | Authorization: Bearer {token}, Content-Type: application/json |
| Status Code | 201 |
| Response | <pre>{<br>&nbsp;&nbsp;"success":&nbsp;true,<br>&nbsp;&nbsp;"message":&nbsp;"Text&nbsp;document&nbsp;uploaded&nbsp;successfully.",<br>&nbsp;&nbsp;"data":&nbsp;{<br>&nbsp;&nbsp;&nbsp;&nbsp;"id":&nbsp;123,<br>&nbsp;&nbsp;&nbsp;&nbsp;"title":&nbsp;"SOP&nbsp;Penggunaan&nbsp;Sistem",<br>&nbsp;&nbsp;&nbsp;&nbsp;"type":&nbsp;"text"<br>&nbsp;&nbsp;}<br>}</pre> |

Data pengetahuan teks yang terkirim langsung diteruskan ke mesin pemroses kecerdasan buatan pihak ketiga untuk dipelajari. Respon data berisi ID pengenal unik dari dokumen eksternal dikembalikan sebagai penanda kesuksesan unggahan.

---

### 3. Mengunggah Dokumen Pengetahuan PDF

Pengunggahan berkas panduan cetak berekstensi PDF diproses menggunakan antarmuka pengiriman berkas (*multipart/form-data*). Token otorisasi JWT wajib dilampirkan oleh pemilik untuk memverifikasi keabsahan dokumen baru.

| Keterangan | Detail |
|---|---|
| Endpoint | POST `/faq/pdf-docs` |
| Autentikasi | Diperlukan (JWT Token) |
| Role | Company Owner |
| Path Parameter | N/A |
| Request Body | <pre>{<br>&nbsp;&nbsp;"title":&nbsp;"Panduan&nbsp;Layanan&nbsp;PDF"<br>}</pre> |
| Headers | Authorization: Bearer {token}, Content-Type: multipart/form-data |
| Status Code | 201 |
| Response | <pre>{<br>&nbsp;&nbsp;"success":&nbsp;true,<br>&nbsp;&nbsp;"message":&nbsp;"PDF&nbsp;document&nbsp;uploaded&nbsp;successfully.",<br>&nbsp;&nbsp;"data":&nbsp;{<br>&nbsp;&nbsp;&nbsp;&nbsp;"id":&nbsp;124,<br>&nbsp;&nbsp;&nbsp;&nbsp;"title":&nbsp;"SOP&nbsp;Pengerjaan",<br>&nbsp;&nbsp;&nbsp;&nbsp;"type":&nbsp;"pdf"<br>&nbsp;&nbsp;}<br>}</pre> |

Berkas PDF divalidasi ukuran dan ekstensinya oleh peladen sebelum diunggah ke penyedia integrasi chatbot kecerdasan buatan. Objek data dokumen eksternal dikembalikan setelah proses pengunggahan selesai dilakukan.

---

### 4. Mengambil Semua Dokumen Pengetahuan

Pemeriksaan daftar seluruh dokumen bantuan yang pernah diunggah oleh pengelola perusahaan dijalankan melalui pemanggilan daftar dokumen. Otorisasi peran diperiksa untuk memastikan hak kepemilikan dokumen-dokumen tersebut.

| Keterangan | Detail |
|---|---|
| Endpoint | GET `/faq/docs` |
| Autentikasi | Diperlukan (JWT Token) |
| Role | Company Owner |
| Path Parameter | N/A |
| Request Body | N/A |
| Headers | Authorization: Bearer {token} |
| Status Code | 200 |
| Response | <pre>{<br>&nbsp;&nbsp;"success":&nbsp;true,<br>&nbsp;&nbsp;"message":&nbsp;"Documents&nbsp;retrieved&nbsp;successfully.",<br>&nbsp;&nbsp;"data":&nbsp;[<br>&nbsp;&nbsp;&nbsp;&nbsp;{<br>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;"id":&nbsp;123,<br>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;"title":&nbsp;"Panduan&nbsp;Layanan"<br>&nbsp;&nbsp;&nbsp;&nbsp;}<br>&nbsp;&nbsp;]<br>}</pre> |

Daftar dokumen dikembalikan dalam bentuk array objek yang memuat judul dokumen beserta pengenal eksternalnya. Informasi ini digunakan untuk merender daftar manajemen basis data bantuan pada dashboard pemilik.

---

### 5. Menghapus Dokumen Pengetahuan

Pembersihan atau penghapusan materi basis data chatbot dilakukan dengan menyertakan ID dokumen eksternal pada parameter rute. Token otorisasi JWT digunakan untuk memverifikasi kewenangan pemilik dalam menghapus dokumen terkait.

| Keterangan | Detail |
|---|---|
| Endpoint | DELETE `/faq/docs/:docsId` |
| Autentikasi | Diperlukan (JWT Token) |
| Role | Company Owner |
| Path Parameter | docsId : 123 |
| Request Body | N/A |
| Headers | Authorization: Bearer {token} |
| Status Code | 200 |
| Response | <pre>{<br>&nbsp;&nbsp;"success":&nbsp;true,<br>&nbsp;&nbsp;"message":&nbsp;"Document&nbsp;deleted&nbsp;successfully."<br>}</pre> |

Dokumen referensi pengetahuan chatbot akan dihapus secara permanen dari peladen kecerdasan buatan eksternal setelah divalidasi. Konfirmasi penghapusan dikirimkan kembali ke antarmuka aplikasi.

---

### 6. Bertanya ke Chatbot FAQ

Interaksi tanya jawab otomatis oleh pengguna aktif ke asisten chatbot perusahaan dijalankan melalui pengiriman pertanyaan. Token otorisasi JWT wajib disertakan untuk mencatat riwayat interaksi pengguna pada sistem bantuan.

| Keterangan | Detail |
|---|---|
| Endpoint | POST `/faq/ask` |
| Autentikasi | Diperlukan (JWT Token) |
| Role | Semua role terautentikasi |
| Path Parameter | N/A |
| Request Body | <pre>{<br>&nbsp;&nbsp;"companyId":&nbsp;"6a21c2b9a7bdad3a940c3df1",<br>&nbsp;&nbsp;"question":&nbsp;"Bagaimana&nbsp;cara&nbsp;klaim&nbsp;kode?"<br>}</pre> |
| Headers | Authorization: Bearer {token}, Content-Type: application/json |
| Status Code | 200 |
| Response | <pre>{<br>&nbsp;&nbsp;"success":&nbsp;true,<br>&nbsp;&nbsp;"message":&nbsp;"Answer&nbsp;retrieved&nbsp;successfully.",<br>&nbsp;&nbsp;"data":&nbsp;{<br>&nbsp;&nbsp;&nbsp;&nbsp;"answer":&nbsp;"Untuk&nbsp;mengajukan&nbsp;klaim,&nbsp;silakan&nbsp;isi&nbsp;formulir&nbsp;intake.",<br>&nbsp;&nbsp;&nbsp;&nbsp;"historyId":&nbsp;"hist_123"<br>&nbsp;&nbsp;}<br>}</pre> |

Jawaban teks hasil pengolahan data kecerdasan buatan dikembalikan secara langsung bersama dengan ID riwayat sesi percakapan. Pengguna dapat melanjutkan interaksi percakapan menggunakan session tersebut.

---

### 7. Mengambil Riwayat Percakapan Chatbot

Pemeriksaan riwayat tanya jawab lama antara pengguna terdaftar dengan asisten chatbot perusahaan diproses dengan mengirimkan parameter ID perusahaan. Otorisasi token divalidasi agar riwayat percakapan tidak dapat diakses oleh pihak asing.

| Keterangan | Detail |
|---|---|
| Endpoint | GET `/faq/:companyId/history` |
| Autentikasi | Diperlukan (JWT Token) |
| Role | Semua role terautentikasi |
| Path Parameter | companyId : 6a21c2b9a7bdad3a940c3df1 |
| Request Body | N/A |
| Headers | Authorization: Bearer {token} |
| Status Code | 200 |
| Response | <pre>{<br>&nbsp;&nbsp;"success":&nbsp;true,<br>&nbsp;&nbsp;"message":&nbsp;"History&nbsp;retrieved&nbsp;successfully.",<br>&nbsp;&nbsp;"data":&nbsp;[<br>&nbsp;&nbsp;&nbsp;&nbsp;{<br>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;"question":&nbsp;"Bagaimana&nbsp;cara&nbsp;kerja?",<br>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;"answer":&nbsp;"Cara&nbsp;kerjanya&nbsp;adalah..."<br>&nbsp;&nbsp;&nbsp;&nbsp;}<br>&nbsp;&nbsp;]<br>}</pre> |

Array percakapan terurut waktu dikembalikan untuk memuat ulang riwayat tanya jawab pada komponen antarmuka chat bantuan. Hal ini memperjelas pemahaman riwayat solusi yang pernah diajukan sebelumnya.

