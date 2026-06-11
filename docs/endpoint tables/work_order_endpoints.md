# Work Order Endpoints

Perancangan antarmuka pemrograman aplikasi (API) pada modul *work order* disajikan dalam bentuk daftar *endpoint*. Rincian *endpoint* tersebut dapat dilihat pada tabel berikut.

| No | Endpoint | Method | Deskripsi | Autentikasi | Role Required |
|---|---|---|---|---|---|
| 1 | `/staff/work-orders` | GET | Mengambil semua daftar perintah kerja yang ditugaskan kepada staf pelaksana | Ya | Company Staff, Company Manager |
| 2 | `/staff/work-orders/:id` | GET | Mengambil detail informasi perintah kerja staf tertentu berdasarkan ID | Ya | Company Staff, Company Manager |
| 3 | `/workorders` | POST | Membuat perintah kerja (*work order*) baru secara manual | Ya | Company Owner, Company Manager, Company Staff |
| 4 | `/workorders` | GET | Mengambil seluruh daftar perintah kerja internal perusahaan | Ya | Company Owner, Company Manager, Company Staff |
| 5 | `/workorders/:id` | GET | Mengambil detail informasi perintah kerja internal berdasarkan ID | Ya | Company Owner, Company Manager, Company Staff |
| 6 | `/workorders/:id` | PATCH | Memperbarui rincian informasi perintah kerja | Ya | Company Owner, Company Manager, Company Staff |
| 7 | `/workorders/:id/status` | PATCH | Mengubah status progres perintah kerja secara langsung | Ya | Company Owner, Company Manager, Company Staff |
| 8 | `/workorders/:id/assign-staffs` | PUT | Menugaskan beberapa staf pelaksana ke dalam suatu perintah kerja | Ya | Company Owner, Company Manager |
| 9 | `/workorders/:id/submissions` | PUT | Menyimpan draf pengisian formulir data lapangan untuk perintah kerja | Ya | Company Owner, Company Manager, Company Staff |
| 10 | `/workorders/:id/sent` | PATCH | Mengirimkan laporan perintah kerja yang telah selesai ke tingkat manajerial | Ya | Company Owner, Company Manager, Company Staff |
| 11 | `/workorders/:id/approve` | PATCH | Menyetujui hasil pengerjaan perintah kerja | Ya | Company Owner, Company Manager, Company Staff |
| 12 | `/workorders/:id/reject` | PATCH | Menolak hasil pengerjaan perintah kerja dan mengembalikannya ke draf | Ya | Company Owner, Company Manager, Company Staff |
| 13 | `/workorders/:id/recreate` | POST | Membuat ulang perintah kerja yang gagal atau ditolak sebelumnya | Ya | Company Owner, Company Manager, Company Staff |
| 14 | `/workorders/:id/cancel` | PATCH | Membatalkan pelaksanaan perintah kerja | Ya | Company Owner, Company Manager, Company Staff |
| 15 | `/workorders/:id/start` | PATCH | Menandai dimulainya pelaksanaan perintah kerja lapangan | Ya | Company Owner, Company Manager, Company Staff |
| 16 | `/workorders/:id/complete` | PATCH | Menandai pengerjaan perintah kerja telah diselesaikan | Ya | Company Owner, Company Manager, Company Staff |
| 17 | `/workorders/:id/fail` | PATCH | Menandai kegagalan dalam pelaksanaan perintah kerja dengan menyertakan alasan | Ya | Company Owner, Company Manager, Company Staff |
| 18 | `/workorders/:id` | DELETE | Menghapus data perintah kerja dari sistem perusahaan | Ya | Company Owner, Company Manager |
| 19 | `/workorders/:id/report` | GET | Mengambil dokumen laporan pekerjaan yang berasosiasi dengan perintah kerja terkait | Ya | Company Owner, Company Manager, Company Staff |
| 20 | `/workorders/:id/report` | PUT | Mengisi atau mengirimkan draf formulir laporan pekerjaan | Ya | Company Owner, Company Manager, Company Staff |

Modul *work order* merupakan inti dari sistem manajemen perintah kerja pada perusahaan. Pembagian peran membedakan tampilan bagi staf lapangan pelaksana tugas dan manajer pemantau operasional. Alur status perintah kerja dikendalikan secara runtut dari fase draf, mulai dikerjakan, hingga persetujuan hasil pekerjaan oleh manajer atau pemilik. Penugasan staf dan penghapusan dokumen perintah kerja dibatasi secara ketat di tingkat pemilik (*owner*) atau manajer (*manager*) untuk meminimalkan kekacauan pembagian tugas lapangan.
