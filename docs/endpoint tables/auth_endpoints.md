# Authentication Endpoints

Perancangan antarmuka pemrograman aplikasi (API) pada modul *authentication* disajikan dalam bentuk daftar *endpoint*. Rincian *endpoint* tersebut dapat dilihat pada tabel berikut.

| No | Endpoint | Method | Deskripsi | Autentikasi | Role Required |
|---|---|---|---|---|---|
| 1 | `/auth/register` | POST | Mendaftarkan akun pengguna baru | Tidak | - |
| 2 | `/auth/register-company` | POST | Mendaftarkan perusahaan baru beserta akun owner | Tidak | - |
| 3 | `/auth/login` | POST | Melakukan autentikasi pengguna untuk masuk ke dalam sistem | Tidak | - |
| 4 | `/auth/logout` | POST | Melakukan proses keluar dari sistem dengan memvalidasi token | Ya | Authenticated User |
| 5 | `/auth/profile` | GET | Mengambil informasi profil pengguna yang sedang masuk | Ya | Authenticated User |

Daftar *endpoint* pada modul *authentication* digunakan untuk mengelola akses pengguna ke dalam sistem secara aman. Proses registrasi akun pengguna baru dan pendaftaran perusahaan dilakukan secara terbuka tanpa memerlukan token otorisasi. Proses masuk sistem diverifikasi melalui kredensial pengguna untuk menghasilkan token akses. Pengguna yang telah terautentikasi dapat mengakses data profil pribadi serta melakukan proses keluar sistem untuk membatalkan keaktifan token. Seluruh mekanisme pengamanan ini diterapkan guna mencegah akses ilegal ke modul internal lainnya.
