# Customer Pairing Endpoints

Perancangan antarmuka pemrograman aplikasi (API) pada modul *customer pairing* disajikan dalam bentuk daftar *endpoint*. Rincian *endpoint* tersebut dapat dilihat pada tabel berikut.

| No | Endpoint | Method | Deskripsi | Autentikasi | Role Required |
|---|---|---|---|---|---|
| 1 | `/customer-pairing/start` | POST | Menginisiasi proses sinkronisasi akun klien eksternal | Ya | Client |
| 2 | `/customer-pairing/complete` | POST | Menyelesaikan proses sinkronisasi dan menghubungkan akun klien | Ya | Client |
| 3 | `/customer-pairing` | GET | Melihat daftar seluruh akun eksternal yang telah terhubung | Ya | Client |
| 4 | `/customer-pairing/company/:companyId` | GET | Melihat detail hubungan akun eksternal pada perusahaan tertentu | Ya | Client |
| 5 | `/customer-pairing/:external_account_id` | DELETE | Memutuskan hubungan akun klien eksternal (*unpair*) | Ya | Client |

Integrasi akun klien eksternal dengan profil sistem internal perusahaan difasilitasi melalui daftar endpoint modul customer pairing berdasarkan tabel di atas. Mekanisme pembatasan akses sistem untuk memastikan hanya pemilik akun yang dapat mengelola sinkronisasi ditunjukkan oleh kolom Role Required yang membatasi seluruh endpoint hanya untuk peran Client. Keamanan proses penghubungan akun antarplatform dijamin melalui alur dua tahap (start dan complete) yang memerlukan verifikasi token, sehingga risiko pemetaan akun yang tidak sah dapat diminimalkan.
