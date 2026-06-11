# Deskripsi Endpoint Modul Work Report

Berikut disajikan tabel rincian teknis dari masing-masing *endpoint* yang terdapat pada modul *work report*.

### 1. Mengambil Detail Laporan Pekerjaan Berdasarkan ID

Pemeriksaan rincian informasi isi dokumen laporan hasil pekerjaan dilakukan dengan menyertakan parameter ID unik pada rute pemanggilan. Otorisasi token JWT diperlukan agar detail laporan hanya dapat dibaca oleh pengguna sistem yang sah.

| Keterangan | Detail |
|---|---|
| Endpoint | GET `/workreports/:id` |
| Autentikasi | Diperlukan (JWT Token) |
| Role | Semua role terautentikasi |
| Path Parameter | id : 6a27fc4b6b3d62e70195bfcd |
| Request Body | N/A |
| Headers | Authorization: Bearer {token} |
| Status Code | 200 |
| Response | <pre>{<br>&nbsp;&nbsp;"success":&nbsp;true,<br>&nbsp;&nbsp;"message":&nbsp;"Work&nbsp;report&nbsp;retrieved&nbsp;successfully",<br>&nbsp;&nbsp;"data":&nbsp;{<br>&nbsp;&nbsp;&nbsp;&nbsp;"_id":&nbsp;"6a27fc4b6b3d62e70195bfcd",<br>&nbsp;&nbsp;&nbsp;&nbsp;"status":&nbsp;"drafted"<br>&nbsp;&nbsp;}<br>}</pre> |

Objek data detail dokumen laporan pekerjaan dikirimkan oleh peladen jika data laporan ditemukan. Staf pelaksana dapat menggunakan data ini untuk dimuat kembali pada menu isian formulir.

---

### 2. Membuat Laporan Pekerjaan Secara Manual

Pembuatan dokumen laporan pekerjaan baru secara manual dilakukan untuk mencatat progres pengerjaan tugas di lapangan. Pengiriman data awal laporan ini mewajibkan pelampiran ID perintah kerja dan ID perusahaan pada badan permintaan.

| Keterangan | Detail |
|---|---|
| Endpoint | POST `/workreports` |
| Autentikasi | Diperlukan (JWT Token) |
| Role | Semua role terautentikasi |
| Path Parameter | N/A |
| Request Body | <pre>{<br>&nbsp;&nbsp;"workOrderId":&nbsp;"6a27fc4b6b3d62e70195bfcc",<br>&nbsp;&nbsp;"companyId":&nbsp;"6a21c2b9a7bdad3a940c3df1",<br>&nbsp;&nbsp;"reportFormId":&nbsp;"6a22775db265a11d8ca74519"<br>}</pre> |
| Headers | Authorization: Bearer {token}, Content-Type: application/json |
| Status Code | 201 |
| Response | <pre>{<br>&nbsp;&nbsp;"message":&nbsp;"Work&nbsp;report&nbsp;created&nbsp;successfully",<br>&nbsp;&nbsp;"data":&nbsp;{<br>&nbsp;&nbsp;&nbsp;&nbsp;"_id":&nbsp;"6a27fc4b6b3d62e70195bfcd"<br>&nbsp;&nbsp;}<br>}</pre> |

Dokumen draf laporan pekerjaan baru didaftarkan ke dalam database peladen setelah isian data divalidasi. ID laporan pekerjaan dikembalikan kepada klien sebagai konfirmasi pendaftaran dokumen baru.

---

### 3. Memperbarui Laporan Pekerjaan

Penyuntingan metadata konfigurasi laporan pekerjaan yang sudah ada dilakukan dengan melampirkan parameter ID laporan pada rute panggilan. Token otorisasi JWT wajib disertakan oleh pengguna untuk memvalidasi hak penyuntingan berkas laporan.

| Keterangan | Detail |
|---|---|
| Endpoint | PUT `/workreports/:id` |
| Autentikasi | Diperlukan (JWT Token) |
| Role | Semua role terautentikasi |
| Path Parameter | id : 6a27fc4b6b3d62e70195bfcd |
| Request Body | <pre>{<br>&nbsp;&nbsp;"status":&nbsp;"on_progress",<br>&nbsp;&nbsp;"showReportToRequester":&nbsp;true<br>}</pre> |
| Headers | Authorization: Bearer {token}, Content-Type: application/json |
| Status Code | 200 |
| Response | <pre>{<br>&nbsp;&nbsp;"message":&nbsp;"Work&nbsp;report&nbsp;updated&nbsp;successfully",<br>&nbsp;&nbsp;"data":&nbsp;{<br>&nbsp;&nbsp;&nbsp;&nbsp;"_id":&nbsp;"6a27fc4b6b3d62e70195bfcd",<br>&nbsp;&nbsp;&nbsp;&nbsp;"status":&nbsp;"on_progress"<br>&nbsp;&nbsp;}<br>}</pre> |

Perubahan properti laporan pekerjaan disimpan secara langsung ke dalam basis data peladen. Respon data terbaru dikembalikan untuk memperbarui informasi konfigurasi laporan lokal klien.

---

### 4. Mengirimkan Formulir Laporan Pekerjaan

Pengisian dan pengiriman data isian formulir dinamis laporan pekerjaan diproses oleh staf pelaksana lapangan melalui badan permintaan. Token otorisasi JWT wajib disertakan oleh staf penanggung jawab tugas untuk mengesahkan data laporan lapangan.

| Keterangan | Detail |
|---|---|
| Endpoint | POST `/workreports/:id/submit` |
| Autentikasi | Diperlukan (JWT Token) |
| Role | Company Owner, Company Manager, Company Staff |
| Path Parameter | id : 6a27fc4b6b3d62e70195bfcd |
| Request Body | <pre>{<br>&nbsp;&nbsp;"formId":&nbsp;"6a22775db265a11d8ca74519",<br>&nbsp;&nbsp;"fieldsData":&nbsp;[<br>&nbsp;&nbsp;&nbsp;&nbsp;{<br>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;"order":&nbsp;1,<br>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;"value":&nbsp;"Pekerjaan&nbsp;perbaikan&nbsp;tiang&nbsp;telah&nbsp;rampung"<br>&nbsp;&nbsp;&nbsp;&nbsp;}<br>&nbsp;&nbsp;]<br>}</pre> |
| Headers | Authorization: Bearer {token}, Content-Type: application/json |
| Status Code | 200 |
| Response | <pre>{<br>&nbsp;&nbsp;"success":&nbsp;true,<br>&nbsp;&nbsp;"message":&nbsp;"Work&nbsp;report&nbsp;form&nbsp;submitted&nbsp;successfully"<br>}</pre> |

Jawaban masukan divalidasi struktur datanya terhadap templat formulir laporan asal sebelum disimpan ke basis data peladen. Konfirmasi keberhasilan dikirimkan kembali ke antarmuka seluler staf pelaksana.

---

### 5. Mengubah Status Laporan Menjadi Terkirim (Sent)

Penyerahan dokumen laporan pekerjaan dari lapangan ke pihak pengelola diproses dengan memanggil *endpoint* kirim laporan. Token otorisasi JWT staf pelaksana diverifikasi guna mencatat perubahan status dokumen di dalam peladen.

| Keterangan | Detail |
|---|---|
| Endpoint | PATCH `/workreports/:id/sent` |
| Autentikasi | Diperlukan (JWT Token) |
| Role | Company Owner, Company Manager, Company Staff |
| Path Parameter | id : 6a27fc4b6b3d62e70195bfcd |
| Request Body | N/A |
| Headers | Authorization: Bearer {token} |
| Status Code | 200 |
| Response | <pre>{<br>&nbsp;&nbsp;"success":&nbsp;true,<br>&nbsp;&nbsp;"message":&nbsp;"Work&nbsp;report&nbsp;marked&nbsp;as&nbsp;sent"<br>}</pre> |

Status dokumen laporan pekerjaan diperbarui menjadi terkirim (*sent*) di dalam database peladen secara langsung. Riwayat pengiriman berkas dicatat dan notifikasi diteruskan ke sistem peninjauan manajer.

---

### 6. Menyetujui Laporan Pekerjaan (Approve)

Persetujuan atas berkas laporan hasil pekerjaan yang diserahkan oleh staf lapangan dilakukan oleh pengelola perusahaan. Verifikasi token JWT manajer diterapkan guna mencegah penyetujuan laporan sepihak dari luar manajemen.

| Keterangan | Detail |
|---|---|
| Endpoint | PATCH `/workreports/:id/approve` |
| Autentikasi | Diperlukan (JWT Token) |
| Role | Company Owner, Company Manager |
| Path Parameter | id : 6a27fc4b6b3d62e70195bfcd |
| Request Body | N/A |
| Headers | Authorization: Bearer {token} |
| Status Code | 200 |
| Response | <pre>{<br>&nbsp;&nbsp;"success":&nbsp;true,<br>&nbsp;&nbsp;"message":&nbsp;"Work&nbsp;report&nbsp;approved"<br>}</pre> |

Status laporan diperbarui menjadi disetujui (*approved*) di database peladen secara seketika. Notifikasi persetujuan dikirimkan kepada staf pelaksana sebagai tanda penuntasan tugas.

---

### 7. Menolak Laporan Pekerjaan (Reject)

Penolakan berkas laporan pekerjaan lapangan diproses oleh pengelola dengan melampirkan parameter ID laporan rute. Token otorisasi JWT manajer diverifikasi guna mengembalikan berkas laporan ke staf untuk diperbaiki.

| Keterangan | Detail |
|---|---|
| Endpoint | PATCH `/workreports/:id/reject` |
| Autentikasi | Diperlukan (JWT Token) |
| Role | Company Owner, Company Manager |
| Path Parameter | id : 6a27fc4b6b3d62e70195bfcd |
| Request Body | N/A |
| Headers | Authorization: Bearer {token} |
| Status Code | 200 |
| Response | <pre>{<br>&nbsp;&nbsp;"success":&nbsp;true,<br>&nbsp;&nbsp;"message":&nbsp;"Work&nbsp;report&nbsp;rejected"<br>}</pre> |

Status laporan pekerjaan dikembalikan menjadi ditolak (*rejected*) di database peladen. Catatan perbaikan didaftarkan dan pemberitahuan perbaikan diteruskan ke staf pelaksana lapangan terkait.

---

### 8. Menghapus Laporan Pekerjaan

Penghapusan berkas laporan pekerjaan dari sistem internal perusahaan dijalankan oleh pemilik atau manajer dengan menyertakan ID laporan rute. Token otorisasi JWT diperiksa guna membatasi operasi pembersihan dokumen keuangan ini.

| Keterangan | Detail |
|---|---|
| Endpoint | DELETE `/workreports/:id` |
| Autentikasi | Diperlukan (JWT Token) |
| Role | Company Owner, Company Manager |
| Path Parameter | id : 6a27fc4b6b3d62e70195bfcd |
| Request Body | N/A |
| Headers | Authorization: Bearer {token} |
| Status Code | 200 |
| Response | <pre>{<br>&nbsp;&nbsp;"success":&nbsp;true,<br>&nbsp;&nbsp;"message":&nbsp;"Work&nbsp;report&nbsp;deleted&nbsp;successfully"<br>}</pre> |

Sistem memverifikasi status penugasan sebelum menghapus draf berkas laporan dari database peladen secara permanen. Konfirmasi keberhasilan penghapusan data dikembalikan sebagai penutup proses.

