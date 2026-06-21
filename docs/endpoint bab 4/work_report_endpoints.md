# Deskripsi Endpoint Modul Work Report

Berikut disajikan tabel rincian teknis dari masing-masing *endpoint* yang terdapat pada modul *work report*.

### 1. Mengirimkan Formulir Laporan Pekerjaan

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

Pengisian dan pengiriman data isian formulir dinamis laporan pekerjaan difasilitasi melalui endpoint pada tabel di atas untuk mengisi dan mengirimkan data isian formulir dinamis laporan pekerjaan oleh staf pelaksana lapangan. Path Parameter id dan Request Body berisi formId serta fieldsData diperlukan dengan autentikasi JWT Token serta role Company Owner, Company Manager, dan Company Staff guna mengesahkan data laporan lapangan. Keakuratan data laporan dijamin melalui validasi struktur jawaban masukan terhadap templat formulir laporan asal sebelum penyimpanan.

---

### 2. Mengubah Status Laporan Menjadi Terkirim (Sent)

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

Penyerahan dokumen laporan pekerjaan dari lapangan difasilitasi melalui endpoint pada tabel di atas untuk menyerahkan dokumen laporan pekerjaan dari lapangan ke pihak pengelola perusahaan. Path Parameter id dan autentikasi JWT Token diperlukan dengan role Company Owner, Company Manager, dan Company Staff guna mencatat perubahan status dokumen di dalam peladen. Riwayat pengiriman berkas dicatat dan notifikasi diteruskan ke sistem peninjauan manajer untuk ditindaklanjuti.

---

### 3. Menyetujui Laporan Pekerjaan (Approve)

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

Persetujuan berkas laporan hasil pekerjaan yang diserahkan oleh staf lapangan difasilitasi melalui endpoint pada tabel di atas untuk menyetujui berkas laporan hasil pekerjaan yang diserahkan oleh staf lapangan. Path Parameter id dan autentikasi JWT Token diperlukan dengan role Company Owner dan Company Manager guna mencegah penyetujuan laporan sepihak dari luar manajemen. Notifikasi persetujuan dikirimkan kepada staf pelaksana sebagai tanda penuntasan tugas lapangan.

---

### 4. Menolak Laporan Pekerjaan (Reject)

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

Penolakan berkas laporan pekerjaan lapangan difasilitasi melalui endpoint pada tabel di atas untuk menolak berkas laporan pekerjaan lapangan oleh pengelola perusahaan. Path Parameter id dan autentikasi JWT Token diperlukan dengan role Company Owner dan Company Manager guna mengembalikan berkas laporan ke staf untuk diperbaiki. Catatan perbaikan didaftarkan dan pemberitahuan perbaikan diteruskan ke staf pelaksana lapangan terkait.

---


