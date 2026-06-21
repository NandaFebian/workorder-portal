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

Pengelolaan daur hidup permintaan layanan dari pengajuan hingga penyelesaian difasilitasi melalui daftar endpoint modul service request berdasarkan tabel di atas. Mekanisme otorisasi ganda sistem untuk memisahkan ruang lingkup klien (pengaju) dengan pihak perusahaan (pengelola) ditunjukkan oleh kolom Role Required yang membedakan hak akses Client dengan Owner, Manager, dan Staff secara eksplisit. Akuntabilitas proses penanganan permintaan dijamin melalui penyediaan endpoint persetujuan dan penolakan dalam satu modul, sehingga setiap transisi status terekam dan dapat diaudit.
