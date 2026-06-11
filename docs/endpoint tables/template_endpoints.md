# Template Endpoints

Perancangan antarmuka pemrograman aplikasi (API) pada modul *template* disajikan dalam bentuk daftar *endpoint*. Rincian *endpoint* tersebut dapat dilihat pada tabel berikut.

| No | Endpoint | Method | Deskripsi | Autentikasi | Role Required |
|---|---|---|---|---|---|
| 1 | `/template/company-type` | GET | Mengambil semua daftar tipe kategori perusahaan | Ya | Authenticated User |
| 2 | `/template/company-type/:companyTypeId/services` | GET | Mengambil daftar templat layanan berdasarkan tipe kategori perusahaan | Ya | Authenticated User |
| 3 | `/template/services/:serviceTemplateId` | GET | Mengambil preview data dari templat layanan tertentu | Ya | Authenticated User |
| 4 | `/template/services/generate` | POST | Menghasilkan layanan operasional baru berdasarkan templat layanan yang dipilih | Ya | Company Owner, Company Manager |

Modul *template* digunakan untuk mempermudah inisialisasi layanan operasional bagi perusahaan yang baru terdaftar. Sistem menyediakan beberapa pilihan templat layanan bawaan yang disesuaikan dengan jenis industri perusahaan terkait. Pemilik (*owner*) atau manajer (*manager*) dapat memilih satu atau beberapa templat layanan untuk dibuat secara otomatis ke dalam katalog aktif mereka. Hal ini berguna untuk memangkas waktu konfigurasi awal struktur formulir dan alur penugasan staf perusahaan.
