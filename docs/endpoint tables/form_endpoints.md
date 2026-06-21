# Form Endpoints

Perancangan antarmuka pemrograman aplikasi (API) pada modul *form* disajikan dalam bentuk daftar *endpoint*. Rincian *endpoint* tersebut dapat dilihat pada tabel berikut.

| No | Endpoint | Method | Deskripsi | Autentikasi | Role Required |
|---|---|---|---|---|---|
| 1 | `/forms` | POST | Membuat templat formulir baru di bawah naungan perusahaan | Ya | Company Owner, Company Manager |
| 2 | `/forms` | GET | Mengambil semua daftar templat formulir perusahaan | Ya | Authenticated User |
| 3 | `/forms/:id` | GET | Mengambil rincian detail templat formulir berdasarkan ID | Ya | Authenticated User |
| 4 | `/forms/:id` | PUT | Memperbarui atau menaikkan versi templat formulir berdasarkan ID | Ya | Company Owner, Company Manager |
| 5 | `/forms/:id` | DELETE | Menghapus templat formulir berdasarkan ID | Ya | Company Owner, Company Manager |

Pembuatan dan pengelolaan formulir dinamis untuk kebutuhan intake, work order, dan work report difasilitasi melalui daftar endpoint modul form berdasarkan tabel di atas. Mekanisme kontrol versi sistem untuk menjaga integritas riwayat perubahan templat ditunjukkan oleh kolom Deskripsi pada endpoint PUT yang secara otomatis meningkatkan versi dokumen. Validasi struktur data input secara konsisten dijamin melalui pembatasan CRUD templat (terbatas untuk Owner dan Manager), sehingga kualitas data yang masuk ke dalam sistem dapat dipertahankan.
