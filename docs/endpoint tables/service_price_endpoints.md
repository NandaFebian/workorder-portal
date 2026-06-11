# Service Price Endpoints

Perancangan antarmuka pemrograman aplikasi (API) pada modul *service price* disajikan dalam bentuk daftar *endpoint*. Rincian *endpoint* tersebut dapat dilihat pada tabel berikut.

| No | Endpoint | Method | Deskripsi | Autentikasi | Role Required |
|---|---|---|---|---|---|
| 1 | `/service-price` | GET | Mengambil semua daftar penentuan harga layanan perusahaan | Ya | Company Owner, Company Manager |
| 2 | `/service-price` | POST | Membuat aturan penetapan harga layanan baru | Ya | Company Owner, Company Manager |
| 3 | `/service-price/:id` | PUT | Memperbarui aturan penetapan harga layanan berdasarkan ID | Ya | Company Owner, Company Manager |
| 4 | `/service-price/:id` | DELETE | Menghapus aturan penetapan harga layanan dari sistem | Ya | Company Owner, Company Manager |

Modul *service price* diimplementasikan untuk mengatur skema tarif atau biaya dari layanan-layanan yang disediakan oleh perusahaan. Seluruh operasional pembacaan, pembuatan, pembaruan, dan penghapusan harga layanan dikelompokkan khusus bagi pengguna dengan tingkat kekuasaan pemilik (*owner*) atau manajer. Pembatasan ini bertujuan untuk menjaga stabilitas penetapan kompensasi finansial pekerjaan serta meminimalkan risiko manipulasi nilai biaya di tingkat staf pelaksana.
