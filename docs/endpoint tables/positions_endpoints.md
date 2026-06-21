# Positions Endpoints

Perancangan antarmuka pemrograman aplikasi (API) pada modul *positions* disajikan dalam bentuk daftar *endpoint*. Rincian *endpoint* tersebut dapat dilihat pada tabel berikut.

| No | Endpoint | Method | Deskripsi | Autentikasi | Role Required |
|---|---|---|---|---|---|
| 1 | `/positions` | GET | Mengambil semua daftar posisi jabatan yang ada di perusahaan | Ya | Company Owner, Company Manager, Company Staff |
| 2 | `/positions/:id` | GET | Mengambil detail informasi posisi jabatan beserta daftar pegawainya | Ya | Company Owner, Company Manager, Company Staff |
| 3 | `/positions` | POST | Membuat posisi jabatan baru di dalam perusahaan | Ya | Company Owner, Company Manager |
| 4 | `/positions/:id` | PUT | Memperbarui rincian informasi posisi jabatan berdasarkan ID | Ya | Company Owner, Company Manager |
| 5 | `/positions/:id` | DELETE | Menghapus posisi jabatan dari sistem perusahaan | Ya | Company Owner |

Pengelolaan struktur jabatan dan hierarki organisasi perusahaan difasilitasi melalui daftar endpoint modul positions berdasarkan tabel di atas. Mekanisme pengamanan stabilitas organisasi sistem untuk mencegah perubahan struktur yang tidak sah ditunjukkan oleh kolom Role Required yang membatasi pembaruan posisi untuk Owner dan Manager, serta penghapusan hanya untuk Owner. Transparansi informasi jabatan di seluruh tingkatan pegawai dijamin melalui penyediaan akses baca untuk semua peran (Staff, Manager, Owner), sehingga koordinasi internal antar divisi dapat berjalan lancar.
