# Service Endpoints

Perancangan antarmuka pemrograman aplikasi (API) pada modul *service* disajikan dalam bentuk daftar *endpoint*. Rincian *endpoint* tersebut dapat dilihat pada tabel berikut.

| No | Endpoint | Method | Deskripsi | Autentikasi | Role Required |
|---|---|---|---|---|---|
| 1 | `/public/services/company/:companyId` | GET | Mengambil semua daftar layanan publik milik perusahaan tertentu | Tidak (Optional) | Authenticated User / Public |
| 2 | `/public/services/:id` | GET | Mengambil detail informasi layanan publik berdasarkan ID | Tidak (Optional) | Authenticated User / Public |
| 3 | `/public/services/:id/intake-form` | GET | Mengambil struktur formulir intake layanan publik untuk klien | Tidak (Optional) | Authenticated User / Public |
| 4 | `/services` | POST | Membuat layanan baru di bawah naungan perusahaan | Ya | Company Owner, Company Manager |
| 5 | `/services` | GET | Mengambil daftar seluruh layanan internal perusahaan | Ya | Company Owner, Company Manager, Company Staff |
| 6 | `/services/:id` | GET | Mengambil detail data layanan internal berdasarkan ID versi | Ya | Company Owner, Company Manager |
| 7 | `/services/:id` | PUT | Memperbarui konfigurasi layanan dengan membuat versi baru | Ya | Company Owner, Company Manager |
| 8 | `/services/:id/toggle-active` | PATCH | Mengubah status keaktifan layanan (aktif/nonaktif) | Ya | Company Owner, Company Manager |
| 9 | `/services/:id` | DELETE | Menghapus data layanan dari sistem perusahaan | Ya | Company Owner, Company Manager |
| 10 | `/services/:serviceId/intake-form` | GET | Mengambil formulir intake layanan untuk keperluan internal | Ya | Company Owner, Company Manager, Company Staff |
| 11 | `/services/:serviceId/create-work-order` | POST | Membuat perintah kerja secara manual berdasarkan konfigurasi layanan | Ya | Company Owner, Company Manager |

Modul *service* digunakan sebagai katalog layanan kerja yang ditawarkan oleh perusahaan kepada klien. Akses publik disediakan agar klien dapat menjelajahi jenis layanan serta mengambil konfigurasi formulir *intake* yang diperlukan untuk pengajuan. Sisi pengelolaan internal membatasi fungsi pembuatan, pembaruan, dan penghapusan layanan hanya untuk tingkat pemilik (*owner*) atau manajer (*manager*). Modul ini juga mendukung pembuatan perintah kerja (*work order*) secara manual berdasarkan templat alur kerja yang telah dikonfigurasikan di dalam masing-masing layanan.
