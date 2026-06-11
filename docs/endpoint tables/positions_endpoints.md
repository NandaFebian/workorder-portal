# Positions Endpoints

Perancangan antarmuka pemrograman aplikasi (API) pada modul *positions* disajikan dalam bentuk daftar *endpoint*. Rincian *endpoint* tersebut dapat dilihat pada tabel berikut.

| No | Endpoint | Method | Deskripsi | Autentikasi | Role Required |
|---|---|---|---|---|---|
| 1 | `/positions` | GET | Mengambil semua daftar posisi jabatan yang ada di perusahaan | Ya | Company Owner, Company Manager, Company Staff |
| 2 | `/positions/:id` | GET | Mengambil detail informasi posisi jabatan beserta daftar pegawainya | Ya | Company Owner, Company Manager, Company Staff |
| 3 | `/positions` | POST | Membuat posisi jabatan baru di dalam perusahaan | Ya | Company Owner, Company Manager |
| 4 | `/positions/:id` | PUT | Memperbarui rincian informasi posisi jabatan berdasarkan ID | Ya | Company Owner, Company Manager |
| 5 | `/positions/:id` | DELETE | Menghapus posisi jabatan dari sistem perusahaan | Ya | Company Owner |

Modul *positions* dikembangkan untuk mengelola struktur jabatan kerja pegawai di dalam perusahaan. Pembacaan daftar jabatan dapat dilakukan oleh seluruh pegawai perusahaan untuk memudahkan koordinasi internal. Pembuatan dan pembaruan informasi posisi dibatasi untuk tingkat manajerial ke atas demi menjaga kestabilan organisasi. Penghapusan posisi dibatasi secara ketat hanya dapat dilakukan oleh pemilik perusahaan (*owner*) guna mencegah hilangnya data posisi yang sedang aktif digunakan.
