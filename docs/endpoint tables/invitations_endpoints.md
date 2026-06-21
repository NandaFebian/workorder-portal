# Invitations Endpoints

Perancangan antarmuka pemrograman aplikasi (API) pada modul *invitations* disajikan dalam bentuk daftar *endpoint*. Rincian *endpoint* tersebut dapat dilihat pada tabel berikut.

| No | Endpoint | Method | Deskripsi | Autentikasi | Role Required |
|---|---|---|---|---|---|
| 1 | `/invitations/pending` | GET | Mengambil daftar undangan bergabung ke perusahaan yang berstatus tunda (*pending*) | Ya | Unassigned Staff |
| 2 | `/invitations/:id/accept` | PUT | Menerima undangan untuk bergabung dengan perusahaan terkait | Ya | Unassigned Staff |
| 3 | `/invitations/:id/reject` | PUT | Menolak undangan untuk bergabung dengan perusahaan terkait | Ya | Unassigned Staff |
| 4 | `/invitations/:id` | DELETE | Menghapus atau membatalkan undangan yang telah dikirimkan oleh perusahaan | Ya | Company Owner, Company Manager |

Pengelolaan alur penerimaan pegawai baru ke dalam perusahaan difasilitasi melalui daftar endpoint modul invitations berdasarkan tabel di atas. Mekanisme pembatasan peran sistem untuk memastikan hanya calon pegawai yang belum memiliki afiliasi yang dapat menerima undangan ditunjukkan oleh kolom Role Required yang membatasi endpoint accept dan reject hanya untuk Unassigned Staff. Fleksibilitas manajemen rekrutmen dijamin melalui penyediaan opsi penerimaan, penolakan, dan pembatalan undangan dalam satu modul, sehingga perusahaan dapat mengontrol komposisi personel secara tepat.
