# Dashboard Endpoints

Perancangan antarmuka pemrograman aplikasi (API) pada modul *dashboard* disajikan dalam bentuk daftar *endpoint*. Rincian *endpoint* tersebut dapat dilihat pada tabel berikut.

| No | Endpoint | Method | Deskripsi | Autentikasi | Role Required |
|---|---|---|---|---|---|
| 1 | `/dashboard/service-request` | GET | Mengambil data metrik dan statistik permintaan layanan | Ya | Authenticated User |
| 2 | `/dashboard/work-order` | GET | Mengambil data metrik dan statistik perintah kerja (*work order*) | Ya | Authenticated User |
| 3 | `/dashboard/company` | GET | Mengambil data metrik ringkasan kinerja perusahaan | Ya | Authenticated User |

Penyajian data metrik dan statistik kinerja sistem secara visual difasilitasi melalui daftar endpoint modul dashboard berdasarkan tabel di atas. Mekanisme personalisasi data sistem untuk menampilkan informasi yang relevan sesuai hak akses pengguna ditunjukkan oleh kolom Autentikasi yang mewajibkan token pada seluruh endpoint. Pengambilan keputusan strategis di tingkat manajemen dijamin melalui penyediaan tiga metrik utama (service request, work order, dan company) dalam satu modul, sehingga pemantauan kinerja perusahaan secara menyeluruh dapat dilakukan secara berkala.
