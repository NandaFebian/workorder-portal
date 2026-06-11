# Service Request Endpoints

Perancangan antarmuka pemrograman aplikasi (API) pada modul *service request* disajikan dalam bentuk daftar *endpoint*. Rincian *endpoint* tersebut dapat dilihat pada tabel berikut.

| No | Endpoint | Method | Deskripsi | Autentikasi | Role Required |
|---|---|---|---|---|---|
| 1 | `/service-requests/inbox` | GET | Melihat semua permintaan layanan masuk ke perusahaan (internal) | Ya | Owner, Manager, Staff |
| 2 | `/service-requests/sent` | GET | Melihat daftar permintaan layanan yang dikirim oleh client (sebagai client/requester) | Ya | Authenticated User |
| 3 | `/service-requests/:id` | GET | Melihat detail permintaan layanan (SR) berdasarkan ID (untuk client/requester) | Ya | Authenticated User |
| 4 | `/service-requests/:id/report` | GET | Melihat laporan terkait permintaan layanan untuk requester | Ya | Authenticated User |
| 5 | `/service-requests/service/:serviceId` | POST | Mengirimkan permintaan layanan (submit intake form) baru berdasarkan ID Layanan | Ya | Authenticated User |
| 6 | `/service-requests/:id/review` | POST | Mengirimkan review/penilaian terhadap permintaan layanan yang telah selesai | Ya | Authenticated User |
| 7 | `/service-requests/:id/approve` | PATCH | Menyetujui permintaan layanan dari klien | Ya | Owner, Manager, Staff |
| 8 | `/service-requests/:id/reject` | PATCH | Menolak permintaan layanan dari klien | Ya | Owner, Manager, Staff |
| 9 | `/service-requests/:id/cancel` | PATCH | Membatalkan permintaan layanan yang telah diajukan | Ya | Authenticated User |
| 10 | `/service-requests/:id/assign-staff` | PATCH | Menugaskan staff untuk menangani permintaan layanan | Ya | Owner, Manager |
| 11 | `/service-requests/:id` | DELETE | Menghapus data/riwayat permintaan layanan | Ya | Owner, Manager |

Daftar *endpoint* yang disajikan pada tabel tersebut dibagi menjadi dua bagian utama, yaitu *endpoint* publik dan *endpoint* internal. *Endpoint* publik digunakan oleh pengguna dengan peran *client* untuk mengirimkan formulir permintaan layanan, melakukan pembatalan, serta mengirimkan ulasan hasil pekerjaan. *Endpoint* internal dioperasikan oleh pihak perusahaan yang terdiri atas *owner*, *manager*, dan *staff* untuk mengelola daur hidup permintaan layanan yang masuk. Verifikasi identitas dan otorisasi peran diterapkan pada seluruh *endpoint* melalui sistem penjaga (*guard*). Penghapusan data permintaan layanan dibatasi secara ketat dan hanya dapat dilakukan oleh pengguna dengan peran *owner* atau *manager*.
