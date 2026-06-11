# Dashboard Endpoints

Perancangan antarmuka pemrograman aplikasi (API) pada modul *dashboard* disajikan dalam bentuk daftar *endpoint*. Rincian *endpoint* tersebut dapat dilihat pada tabel berikut.

| No | Endpoint | Method | Deskripsi | Autentikasi | Role Required |
|---|---|---|---|---|---|
| 1 | `/dashboard/service-request` | GET | Mengambil data metrik dan statistik permintaan layanan | Ya | Authenticated User |
| 2 | `/dashboard/work-order` | GET | Mengambil data metrik dan statistik perintah kerja (*work order*) | Ya | Authenticated User |
| 3 | `/dashboard/company` | GET | Mengambil data metrik ringkasan kinerja perusahaan | Ya | Authenticated User |

Modul *dashboard* digunakan untuk menyajikan visualisasi data analitis dan ringkasan kinerja sistem kepada pengguna. Pengambilan metrik statistik disesuaikan dengan peran pengguna yang melakukan permintaan data tersebut. Data historis permintaan layanan, perkembangan pengerjaan perintah kerja (*work order*), dan performa umum perusahaan dapat dimonitor secara berkala melalui parameter periode waktu tertentu. Seluruh informasi metrik ini disajikan guna mendukung proses pengambilan keputusan strategis di tingkat manajemen.
