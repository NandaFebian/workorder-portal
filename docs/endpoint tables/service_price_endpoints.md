# Service Price Endpoints

Perancangan antarmuka pemrograman aplikasi (API) pada modul *service price* disajikan dalam bentuk daftar *endpoint*. Rincian *endpoint* tersebut dapat dilihat pada tabel berikut.

| No | Endpoint | Method | Deskripsi | Autentikasi | Role Required |
|---|---|---|---|---|---|
| 1 | `/service-price` | GET | Mengambil semua daftar penentuan harga layanan perusahaan | Ya | Company Owner, Company Manager |
| 2 | `/service-price` | POST | Membuat aturan penetapan harga layanan baru | Ya | Company Owner, Company Manager |
| 3 | `/service-price/:id` | PUT | Memperbarui aturan penetapan harga layanan berdasarkan ID | Ya | Company Owner, Company Manager |
| 4 | `/service-price/:id` | DELETE | Menghapus aturan penetapan harga layanan dari sistem | Ya | Company Owner, Company Manager |

Pengaturan skema tarif dan biaya layanan perusahaan difasilitasi melalui daftar endpoint modul service price berdasarkan tabel di atas. Mekanisme pencegahan manipulasi finansial sistem untuk menjaga integritas penetapan harga ditunjukkan oleh kolom Role Required yang membatasi seluruh operasi CRUD harga hanya untuk Owner dan Manager. Stabilitas kompensasi finansial pekerjaan dijamin melalui pembatasan akses tingkat staf pelaksana, sehingga risiko perubahan nilai biaya secara sepihak dapat diminimalkan.
