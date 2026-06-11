# Form Endpoints

Perancangan antarmuka pemrograman aplikasi (API) pada modul *form* disajikan dalam bentuk daftar *endpoint*. Rincian *endpoint* tersebut dapat dilihat pada tabel berikut.

| No | Endpoint | Method | Deskripsi | Autentikasi | Role Required |
|---|---|---|---|---|---|
| 1 | `/forms` | POST | Membuat templat formulir baru di bawah naungan perusahaan | Ya | Company Owner, Company Manager |
| 2 | `/forms` | GET | Mengambil semua daftar templat formulir perusahaan | Ya | Authenticated User |
| 3 | `/forms/:id` | GET | Mengambil rincian detail templat formulir berdasarkan ID | Ya | Authenticated User |
| 4 | `/forms/:id` | PUT | Memperbarui atau menaikkan versi templat formulir berdasarkan ID | Ya | Company Owner, Company Manager |
| 5 | `/forms/submissions` | POST | Mengirimkan data pengisian formulir (*submit form*) | Ya | Authenticated User |
| 6 | `/forms/:id` | DELETE | Menghapus templat formulir berdasarkan ID | Ya | Company Owner, Company Manager |

Modul *form* dikembangkan untuk menyediakan infrastruktur pembuatan formulir dinamis baik untuk formulir permintaan layanan (*intake form*), perintah kerja (*work order*), maupun laporan pekerjaan (*work report*). Pembuatan dan pembaruan templat formulir dibatasi bagi pengguna berwenang seperti *owner* dan *manager*. Pembaruan templat akan secara otomatis meningkatkan versi dari dokumen tersebut demi menjaga riwayat data terdahulu. Seluruh hasil pengisian formulir dikirimkan melalui *endpoint* pengumpulan jawaban (*submission*) untuk divalidasi struktur dan keterisiannya.
