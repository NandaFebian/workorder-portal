# Invitations Endpoints

Perancangan antarmuka pemrograman aplikasi (API) pada modul *invitations* disajikan dalam bentuk daftar *endpoint*. Rincian *endpoint* tersebut dapat dilihat pada tabel berikut.

| No | Endpoint | Method | Deskripsi | Autentikasi | Role Required |
|---|---|---|---|---|---|
| 1 | `/invitations/pending` | GET | Mengambil daftar undangan bergabung ke perusahaan yang berstatus tunda (*pending*) | Ya | Unassigned Staff |
| 2 | `/invitations/:id/accept` | PUT | Menerima undangan untuk bergabung dengan perusahaan terkait | Ya | Unassigned Staff |
| 3 | `/invitations/:id/reject` | PUT | Menolak undangan untuk bergabung dengan perusahaan terkait | Ya | Unassigned Staff |
| 4 | `/invitations/:id` | DELETE | Menghapus atau membatalkan undangan yang telah dikirimkan oleh perusahaan | Ya | Company Owner, Company Manager |

Modul *invitations* ditujukan untuk mengelola alur bergabungnya pegawai ke suatu perusahaan dalam platform. Penerimaan undangan hanya diperbolehkan bagi pengguna dengan peran *unassigned staff* yang belum berafiliasi dengan perusahaan mana pun. Calon pegawai dapat menolak atau menerima undangan yang masuk untuk memperbarui status asosiasi mereka. Pembatalan undangan yang sudah telanjur dikirim dikelola secara internal oleh tingkat pemilik atau manajer perusahaan melalui *endpoint* penghapusan.
