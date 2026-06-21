# Membership Endpoints

Perancangan antarmuka pemrograman aplikasi (API) pada modul *membership* disajikan dalam bentuk daftar *endpoint*. Rincian *endpoint* tersebut dapat dilihat pada tabel berikut.

| No | Endpoint | Method | Deskripsi | Autentikasi | Role Required |
|---|---|---|---|---|---|
| 1 | `/memberships` | GET | Mengambil daftar seluruh klien yang berlangganan (*subscribed clients*) | Ya | Company Owner, Company Manager |
| 2 | `/memberships/codes` | GET | Mengambil semua daftar kode keanggotaan (*membership codes*) | Ya | Company Owner, Company Manager |
| 3 | `/memberships/codes` | POST | Mengimpor kode keanggotaan secara massal melalui berkas CSV | Ya | Company Owner, Company Manager |
| 4 | `/memberships/codes/claim` | POST | Mengklaim kode keanggotaan untuk berlangganan layanan perusahaan | Ya | Authenticated User |
| 5 | `/memberships/codes/:id` | DELETE | Menghapus data kode keanggotaan dari sistem | Ya | Company Owner, Company Manager |

Pengelolaan program keanggotaan eksklusif bagi klien perusahaan difasilitasi melalui daftar endpoint modul membership berdasarkan tabel di atas. Mekanisme otorisasi sistem untuk memisahkan hak kelola kode keanggotaan dengan hak klaim ditunjukkan oleh kolom Role Required yang membatasi operasi CRUD kode hanya untuk Owner dan Manager, sedangkan klaim dapat dilakukan oleh Authenticated User. Efisiensi distribusi kode keanggotaan dijamin melalui fitur impor massal CSV dan endpoint klaim mandiri, sehingga proses registrasi pelanggan baru dapat dipercepat tanpa intervensi manual berulang.
