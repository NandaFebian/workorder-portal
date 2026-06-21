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

Pengaktifan atau penonaktifan fitur FAQ difasilitasi melalui endpoint pada tabel di atas dengan mengirimkan status boolean keaktifan. Autentikasi diperlukan dan peran dibatasi untuk company owner agar integrasi chatbot eksternal hanya dikelola oleh pemilik perusahaan. Status keaktifan terbaru dikembalikan sebagai objek konfirmasi setelah penyedia chatbot eksternal mendaftarkan profil perusahaan.

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

Pengunggahan dokumen pengetahuan teks difasilitasi melalui endpoint pada tabel di atas dengan mengirimkan judul dan konten teks materi bantuan. Autentikasi diperlukan dan peran dibatasi untuk company owner agar data pengetahuan chatbot hanya ditambahkan oleh pemilik perusahaan. Data pengetahuan yang terkirim diteruskan ke mesin pemroses kecerdasan buatan eksternal untuk dipelajari oleh sistem chatbot.

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

Pengunggahan dokumen pengetahuan PDF difasilitasi melalui endpoint pada tabel di atas dengan antarmuka multipart/form-data. Autentikasi diperlukan dan peran dibatasi untuk company owner agar berkas panduan cetak hanya diunggah oleh pihak yang berwenang. Berkas PDF divalidasi ukuran dan ekstensinya oleh peladen sebelum diunggah ke penyedia integrasi chatbot kecerdasan buatan.

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

Pemeriksaan daftar seluruh dokumen pengetahuan difasilitasi melalui endpoint pada tabel di atas dengan token JWT pemilik perusahaan. Autentikasi diperlukan dan peran dibatasi untuk company owner agar hak kepemilikan dokumen-dokumen bantuan dapat terverifikasi. Daftar dokumen dikembalikan dalam array objek untuk merender manajemen basis data bantuan pada dashboard pemilik.

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

Penghapusan dokumen pengetahuan difasilitasi melalui endpoint pada tabel di atas dengan menyertakan ID dokumen eksternal pada parameter rute. Autentikasi diperlukan dan peran dibatasi untuk company owner agar kewenangan pemilik dalam menghapus dokumen dapat diverifikasi oleh sistem. Dokumen referensi chatbot dihapus secara permanen dari peladen eksternal dan konfirmasi dikirimkan kembali ke antarmuka aplikasi.

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

Interaksi tanya jawab dengan chatbot difasilitasi melalui endpoint pada tabel di atas dengan mengirimkan ID perusahaan dan pertanyaan pengguna. Autentikasi diperlukan dan dapat diakses oleh semua role terautentikasi agar riwayat interaksi setiap pengguna tercatat di sistem bantuan. Jawaban hasil pengolahan kecerdasan buatan dikembalikan bersama ID riwayat sesi untuk melanjutkan percakapan selanjutnya.

---


