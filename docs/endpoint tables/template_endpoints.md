# Template Endpoints

Perancangan antarmuka pemrograman aplikasi (API) pada modul *template* disajikan dalam bentuk daftar *endpoint*. Rincian *endpoint* tersebut dapat dilihat pada tabel berikut.

| No | Endpoint | Method | Deskripsi | Autentikasi | Role Required |
|---|---|---|---|---|---|
| 1 | `/template/company-type` | GET | Mengambil semua daftar tipe kategori perusahaan | Ya | Authenticated User |
| 2 | `/template/company-type/:companyTypeId/services` | GET | Mengambil daftar templat layanan berdasarkan tipe kategori perusahaan | Ya | Authenticated User |
| 3 | `/template/services/:serviceTemplateId` | GET | Mengambil preview data dari templat layanan tertentu | Ya | Authenticated User |
| 4 | `/template/services/generate` | POST | Menghasilkan layanan operasional baru berdasarkan templat layanan yang dipilih | Ya | Company Owner, Company Manager |

Inisialisasi layanan operasional bagi perusahaan baru berdasarkan templat bawaan difasilitasi melalui daftar endpoint modul template berdasarkan tabel di atas. Mekanisme personalisasi templat sistem untuk menyesuaikan layanan dengan jenis industri perusahaan ditunjukkan oleh kolom Endpoint yang memuat parameter companyTypeId sebagai pemilah kategori templat. Efisiensi waktu konfigurasi awal dijamin melalui penyediaan endpoint generate yang membuat layanan operasional secara otomatis dari templat yang dipilih, sehingga perusahaan baru dapat segera beroperasi tanpa perlu merancang formulir dan alur kerja dari awal.
