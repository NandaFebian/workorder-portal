# Membership Endpoints

Perancangan antarmuka pemrograman aplikasi (API) pada modul *membership* disajikan dalam bentuk daftar *endpoint*. Rincian *endpoint* tersebut dapat dilihat pada tabel berikut.

| No | Endpoint | Method | Deskripsi | Autentikasi | Role Required |
|---|---|---|---|---|---|
| 1 | `/memberships` | GET | Mengambil daftar seluruh klien yang berlangganan (*subscribed clients*) | Ya | Company Owner, Company Manager |
| 2 | `/memberships/codes` | GET | Mengambil semua daftar kode keanggotaan (*membership codes*) | Ya | Company Owner, Company Manager |
| 3 | `/memberships/codes` | POST | Mengimpor kode keanggotaan secara massal melalui berkas CSV | Ya | Company Owner, Company Manager |
| 4 | `/memberships/codes/claim` | POST | Mengklaim kode keanggotaan untuk berlangganan layanan perusahaan | Ya | Authenticated User |
| 5 | `/memberships/codes/:id` | DELETE | Menghapus data kode keanggotaan dari sistem | Ya | Company Owner, Company Manager |

Modul *membership* dirancang untuk memfasilitasi program keanggotaan eksklusif bagi klien perusahaan. Pihak internal perusahaan dapat mengimpor kode-kode keanggotaan baru dari dokumen eksternal menggunakan format CSV secara cepat. Klien yang memiliki kode tersebut dapat melakukan klaim melalui *endpoint* klaim guna mendaftarkan akun mereka sebagai pelanggan aktif perusahaan. Pengaturan hak akses diterapkan agar pendaftaran kode baru dan peninjauan daftar keanggotaan dibatasi untuk tingkat manajerial.
