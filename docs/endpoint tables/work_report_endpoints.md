# Work Report Endpoints

Perancangan antarmuka pemrograman aplikasi (API) pada modul *work report* disajikan dalam bentuk daftar *endpoint*. Rincian *endpoint* tersebut dapat dilihat pada tabel berikut.

| No | Endpoint | Method | Deskripsi | Autentikasi | Role Required |
|---|---|---|---|---|---|
| 1 | `/workreports/:id` | GET | Mengambil rincian detail laporan pekerjaan berdasarkan ID | Ya | Authenticated User |
| 2 | `/workreports` | POST | Membuat entri laporan pekerjaan baru secara manual | Ya | Authenticated User |
| 3 | `/workreports/:id` | PUT | Memperbarui draf laporan pekerjaan berdasarkan ID | Ya | Authenticated User |
| 4 | `/workreports/:id/submit` | POST | Mengirimkan jawaban formulir laporan pekerjaan yang telah diisi | Ya | Company Owner, Company Manager, Company Staff |
| 5 | `/workreports/:id/sent` | PATCH | Mengubah status laporan pekerjaan menjadi terkirim (*sent*) | Ya | Company Owner, Company Manager, Company Staff |
| 6 | `/workreports/:id/approve` | PATCH | Menyetujui laporan pekerjaan yang telah diserahkan oleh staf pelaksana | Ya | Company Owner, Company Manager |
| 7 | `/workreports/:id/reject` | PATCH | Menolak laporan pekerjaan dan mengembalikannya ke staf pelaksana | Ya | Company Owner, Company Manager |
| 8 | `/workreports/:id` | DELETE | Menghapus dokumen laporan pekerjaan dari sistem | Ya | Company Owner, Company Manager |

Modul *work report* digunakan untuk mendokumentasikan rincian pengerjaan tugas lapangan yang dilaporkan oleh staf pelaksana. Pembaruan data laporan pada awalnya disimpan sebagai draf sebelum dilakukan proses pengiriman ke tingkat manajerial. Manajer atau pemilik perusahaan memiliki wewenang penuh untuk menyetujui laporan atau menolaknya kembali jika ditemukan ketidaksesuaian data di lapangan. Otentikasi dan pengecekan peran diterapkan untuk menjamin laporan tidak dimodifikasi secara sepihak setelah disetujui.
