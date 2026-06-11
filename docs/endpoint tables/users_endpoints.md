# Users Endpoints

Perancangan antarmuka pemrograman aplikasi (API) pada modul *users* disajikan dalam bentuk daftar *endpoint*. Rincian *endpoint* tersebut dapat dilihat pada tabel berikut.

| No | Endpoint | Method | Deskripsi | Autentikasi | Role Required |
|---|---|---|---|---|---|
| 1 | `/users/me` | GET | Mengambil profil detail lengkap dari pengguna yang sedang terautentikasi | Ya | Authenticated User |
| 2 | `/users/me` | PATCH | Memperbarui informasi profil pengguna yang sedang aktif (nama, email, atau sandi baru) | Ya | Authenticated User |

Modul *users* dikembangkan untuk memfasilitasi pembaruan data personal pengguna secara mandiri. Informasi profil lengkap dapat diakses untuk ditampilkan pada menu pengaturan akun di antarmuka pengguna. Pembaruan data pribadi seperti nama lengkap, alamat email, serta perubahan kata sandi diproses dengan menyertakan verifikasi kredensial lama demi alasan keamanan. Pembatasan akses diterapkan sepenuhnya pada tingkat pengontrol sehingga setiap pengguna hanya dapat melihat dan memperbarui datanya sendiri.
