# Service Endpoints

Perancangan antarmuka pemrograman aplikasi (API) pada modul *service* disajikan dalam bentuk daftar *endpoint*. Rincian *endpoint* tersebut dapat dilihat pada tabel berikut.

| No | Endpoint | Method | Deskripsi | Autentikasi | Role Required |
|---|---|---|---|---|---|
| 1 | `/public/services/:id/intake-form` | GET | Mengambil struktur formulir intake layanan publik untuk klien | Tidak (Optional) | Authenticated User / Public |
| 2 | `/services` | POST | Membuat layanan baru di bawah naungan perusahaan | Ya | Company Owner, Company Manager |
| 3 | `/services` | GET | Mengambil daftar seluruh layanan internal perusahaan | Ya | Company Owner, Company Manager, Company Staff |
| 4 | `/services/:id` | GET | Mengambil detail data layanan internal berdasarkan ID versi | Ya | Company Owner, Company Manager |
| 5 | `/services/:id` | PUT | Memperbarui konfigurasi layanan dengan membuat versi baru | Ya | Company Owner, Company Manager |
| 6 | `/services/:id/toggle-active` | PATCH | Mengubah status keaktifan layanan (aktif/nonaktif) | Ya | Company Owner, Company Manager |
| 7 | `/services/:id` | DELETE | Menghapus data layanan dari sistem perusahaan | Ya | Company Owner, Company Manager |
| 8 | `/services/:serviceId/intake-form` | GET | Mengambil formulir intake layanan untuk keperluan internal | Ya | Company Owner, Company Manager, Company Staff |
| 9 | `/services/:serviceId/create-work-order` | POST | Membuat perintah kerja secara manual berdasarkan konfigurasi layanan | Ya | Company Owner, Company Manager |

Pengelolaan katalog layanan yang ditawarkan perusahaan kepada klien difasilitasi melalui daftar endpoint modul service berdasarkan tabel di atas. Mekanisme pemisahan akses publik dan internal sistem untuk melindungi data konfigurasi layanan yang sensitif ditunjukkan oleh kolom Autentikasi yang menyediakan akses publik terbatas (opsional) untuk endpoint tertentu dan mewajibkan token untuk endpoint internal. Fleksibilitas operasional layanan dijamin melalui penyediaan endpoint pembuatan work order manual dan toggle aktivasi layanan, sehingga manajer dapat menyesuaikan ketersediaan layanan tanpa mengubah konfigurasi dasar.
