# Customer Pairing Endpoints

Perancangan antarmuka pemrograman aplikasi (API) pada modul *customer pairing* disajikan dalam bentuk daftar *endpoint*. Rincian *endpoint* tersebut dapat dilihat pada tabel berikut.

| No | Endpoint | Method | Deskripsi | Autentikasi | Role Required |
|---|---|---|---|---|---|
| 1 | `/customer-pairing/start` | POST | Menginisiasi proses sinkronisasi akun klien eksternal | Ya | Client |
| 2 | `/customer-pairing/complete` | POST | Menyelesaikan proses sinkronisasi dan menghubungkan akun klien | Ya | Client |
| 3 | `/customer-pairing` | GET | Melihat daftar seluruh akun eksternal yang telah terhubung | Ya | Client |
| 4 | `/customer-pairing/company/:companyId` | GET | Melihat detail hubungan akun eksternal pada perusahaan tertentu | Ya | Client |
| 5 | `/customer-pairing/:external_account_id` | DELETE | Memutuskan hubungan akun klien eksternal (*unpair*) | Ya | Client |

Modul *customer pairing* berfungsi untuk mengintegrasikan akun klien eksternal dengan profil sistem internal perusahaan. Seluruh operasional pada modul ini dibatasi khusus bagi pengguna dengan peran *client*. Proses sinkronisasi diawali dengan inisiasi verifikasi melalui *endpoint* inisiasi dan diselesaikan melalui konfirmasi token pada *endpoint* penyelesaian. Pemantauan hubungan akun serta pemutusan koneksi akun eksternal dikelola sepenuhnya melalui *endpoint* terkait untuk menjaga keamanan integrasi data antarplatform.
