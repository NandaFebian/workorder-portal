# Authentication Endpoints

Perancangan antarmuka pemrograman aplikasi (API) pada modul *authentication* disajikan dalam bentuk daftar *endpoint*. Rincian *endpoint* tersebut dapat dilihat pada tabel berikut.

| No | Endpoint | Method | Deskripsi | Autentikasi | Role Required |
|---|---|---|---|---|---|
| 1 | `/auth/register` | POST | Mendaftarkan akun pengguna baru | Tidak | - |
| 2 | `/auth/register-company` | POST | Mendaftarkan perusahaan baru beserta akun owner | Tidak | - |
| 3 | `/auth/login` | POST | Melakukan autentikasi pengguna untuk masuk ke dalam sistem | Tidak | - |
| 4 | `/auth/logout` | POST | Melakukan proses keluar dari sistem dengan memvalidasi token | Ya | Authenticated User |
| 5 | `/auth/profile` | GET | Mengambil informasi profil pengguna yang sedang masuk | Ya | Authenticated User |

Pengelolaan siklus autentikasi pengguna dari pendaftaran akun hingga keluar sistem difasilitasi melalui daftar endpoint modul authentication berdasarkan tabel di atas. Mekanisme pengamanan akses sistem untuk melindungi endpoint internal dari pengguna yang belum terverifikasi ditunjukkan oleh kolom Autentikasi yang mewajibkan token pada endpoint logout dan profile. Perlindungan modul internal dari akses ilegal dijamin melalui pemisahan endpoint publik tanpa autentikasi (register, login, register-company) dengan endpoint terproteksi (logout, profile), sehingga risiko penyusupan ke area administratif dapat diminimalkan.
