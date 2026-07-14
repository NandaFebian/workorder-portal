# Authentication Endpoints

Perancangan antarmuka pemrograman aplikasi (API) pada modul *authentication* disajikan dalam bentuk daftar *endpoint*. Rincian *endpoint* tersebut dapat dilihat pada tabel berikut.

| No | Endpoint | Method | Deskripsi | Autentikasi | Role Required |
|---|---|---|---|---|---|
| 1 | `/auth/register` | POST | Mengajukan pendaftaran akun pengguna baru dan mengirimkan kode OTP ke surel | Tidak | - |
| 2 | `/auth/register-company` | POST | Mengajukan pendaftaran perusahaan baru beserta akun owner dan mengirimkan kode OTP ke surel | Tidak | - |
| 3 | `/auth/verify-otp` | POST | Memverifikasi kode OTP pendaftaran sekaligus membuat akun pengguna secara resmi | Tidak | - |
| 4 | `/auth/resend-otp` | POST | Mengirim ulang kode OTP untuk pendaftaran yang belum diverifikasi | Tidak | - |
| 5 | `/auth/login` | POST | Melakukan autentikasi pengguna untuk masuk ke dalam sistem | Tidak | - |
| 6 | `/auth/logout` | POST | Melakukan proses keluar dari sistem dengan memvalidasi token | Ya | Authenticated User |
| 7 | `/auth/profile` | GET | Mengambil informasi profil pengguna yang sedang masuk | Ya | Authenticated User |
| 8 | `/auth/forgot-password` | POST | Mengajukan pengaturan ulang kata sandi dan mengirimkan kode OTP ke surel | Tidak | - |
| 9 | `/auth/reset-password` | POST | Memverifikasi kode OTP dan menetapkan kata sandi baru bagi pengguna | Tidak | - |

Daftar *endpoint* pada modul *authentication* digunakan untuk mengelola akses pengguna ke dalam sistem secara aman. Proses registrasi dirancang dalam dua tahap, yaitu pengajuan pendaftaran yang mengirimkan kode OTP ke alamat surel serta verifikasi kode OTP yang baru membentuk akun secara resmi, sehingga akun tidak pernah dibuat sebelum kepemilikan surel terbukti sah. Pengiriman ulang kode OTP dibatasi dengan jeda waktu tertentu (*cooldown*) guna mencegah penyalahgunaan pengiriman surel secara berlebihan. Proses masuk sistem diverifikasi melalui kredensial pengguna untuk menghasilkan token akses, sedangkan pengguna yang telah terautentikasi dapat mengakses data profil pribadi serta melakukan proses keluar sistem untuk membatalkan keaktifan token. Mekanisme pemulihan kata sandi turut memanfaatkan kode OTP sebagai satu-satunya dasar otorisasi penggantian kata sandi tanpa memerlukan kata sandi lama. Seluruh mekanisme pengamanan ini diterapkan guna mencegah akses ilegal ke modul internal lainnya.
