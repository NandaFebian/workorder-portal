# Work Order Endpoints

Perancangan antarmuka pemrograman aplikasi (API) pada modul *work order* disajikan dalam bentuk daftar *endpoint*. Rincian *endpoint* tersebut dapat dilihat pada tabel berikut.

| No | Endpoint | Method | Deskripsi | Autentikasi | Role Required |
|---|---|---|---|---|---|
| 1 | `/workorders` | POST | Membuat perintah kerja (*work order*) baru secara manual | Ya | Company Owner, Company Manager, Company Staff |
| 2 | `/workorders` | GET | Mengambil seluruh daftar perintah kerja internal perusahaan | Ya | Company Owner, Company Manager, Company Staff |
| 3 | `/workorders/:id` | GET | Mengambil detail informasi perintah kerja internal berdasarkan ID | Ya | Company Owner, Company Manager, Company Staff |
| 4 | `/workorders/:id/recreate` | POST | Membuat ulang perintah kerja yang gagal atau ditolak sebelumnya | Ya | Company Owner, Company Manager, Company Staff |
| 5 | `/workorders/:id/submissions` | PUT | Menyimpan draf pengisian formulir data lapangan untuk perintah kerja | Ya | Company Owner, Company Manager, Company Staff |
| 6 | `/workorders/:id/assign-staffs` | PUT | Menugaskan beberapa staf pelaksana ke dalam suatu perintah kerja | Ya | Company Owner, Company Manager |
| 7 | `/workorders/:id/sent` | PATCH | Mengirimkan laporan perintah kerja yang telah selesai ke tingkat manajerial | Ya | Company Owner, Company Manager, Company Staff |
| 8 | `/workorders/:id/approve` | PATCH | Menyetujui hasil pengerjaan perintah kerja | Ya | Company Owner, Company Manager, Company Staff |
| 9 | `/workorders/:id/reject` | PATCH | Menolak hasil pengerjaan perintah kerja dan mengembalikannya ke draf | Ya | Company Owner, Company Manager, Company Staff |
| 10 | `/workorders/:id/cancel` | PATCH | Membatalkan pelaksanaan perintah kerja | Ya | Company Owner, Company Manager, Company Staff |
| 11 | `/workorders/:id/start` | PATCH | Menandai dimulainya pelaksanaan perintah kerja lapangan | Ya | Company Owner, Company Manager, Company Staff |
| 12 | `/workorders/:id/complete` | PATCH | Menandai pengerjaan perintah kerja telah diselesaikan | Ya | Company Owner, Company Manager, Company Staff |
| 13 | `/workorders/:id/fail` | PATCH | Menandai kegagalan dalam pelaksanaan perintah kerja dengan menyertakan alasan | Ya | Company Owner, Company Manager, Company Staff |
| 14 | `/workorders/:id/report` | GET | Mengambil dokumen laporan pekerjaan yang berasosiasi dengan perintah kerja terkait | Ya | Company Owner, Company Manager, Company Staff |

Pengelolaan siklus perintah kerja dari pembuatan hingga penyelesaian lapangan difasilitasi melalui daftar endpoint modul work order berdasarkan tabel di atas. Mekanisme pengaturan alur status sistem untuk mengendalikan transisi pengerjaan secara runtut ditunjukkan oleh kolom Deskripsi yang menyediakan endpoint khusus untuk setiap fase (start, complete, fail, approve, reject, cancel, sent). Pembagian tugas yang terstruktur dijamin melalui pembatasan penugasan staf hanya untuk Owner dan Manager, sehingga kekacauan alokasi sumber daya lapangan dapat diminimalkan.
