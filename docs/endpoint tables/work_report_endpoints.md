# Work Report Endpoints

Perancangan antarmuka pemrograman aplikasi (API) pada modul *work report* disajikan dalam bentuk daftar *endpoint*. Rincian *endpoint* tersebut dapat dilihat pada tabel berikut.

| No | Endpoint | Method | Deskripsi | Autentikasi | Role Required |
|---|---|---|---|---|---|
| 1 | `/workreports/:id/submit` | POST | Mengirimkan jawaban formulir laporan pekerjaan yang telah diisi | Ya | Company Owner, Company Manager, Company Staff |
| 2 | `/workreports/:id/sent` | PATCH | Mengubah status laporan pekerjaan menjadi terkirim (*sent*) | Ya | Company Owner, Company Manager, Company Staff |
| 3 | `/workreports/:id/approve` | PATCH | Menyetujui laporan pekerjaan yang telah diserahkan oleh staf pelaksana | Ya | Company Owner, Company Manager |
| 4 | `/workreports/:id/reject` | PATCH | Menolak laporan pekerjaan dan mengembalikannya ke staf pelaksana | Ya | Company Owner, Company Manager |

Dokumentasi rincian pengerjaan tugas lapangan oleh staf pelaksana difasilitasi melalui daftar endpoint modul work report berdasarkan tabel di atas. Mekanisme pengendalian mutu sistem untuk memastikan laporan melalui proses verifikasi sebelum disetujui ditunjukkan oleh kolom Deskripsi yang menyediakan alur draf, pengiriman (sent), persetujuan, hingga penolakan. Akuntabilitas hasil pekerjaan dijamin melalui pembatasan akses persetujuan dan penolakan hanya untuk Owner dan Manager, sehingga laporan tidak dapat dimodifikasi secara sepihak setelah memperoleh persetujuan.
