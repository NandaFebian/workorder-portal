# Invitation Code Endpoints

Perancangan antarmuka pemrograman aplikasi (API) pada modul *invitation code* disajikan dalam bentuk daftar *endpoint*. Rincian *endpoint* tersebut dapat dilihat pada tabel berikut.

| No | Endpoint | Method | Deskripsi | Autentikasi | Role Required |
|---|---|---|---|---|---|
| 1 | `/company/invitation-codes` | POST | Membuat dan mengonfigurasi kode undangan beserta peran dan jabatan yang diberikan | Ya | Owner, Manager |
| 2 | `/company/invitation-codes` | GET | Melihat daftar kode undangan yang diterbitkan perusahaan | Ya | Owner, Manager |
| 3 | `/company/invitation-codes/:id` | GET | Melihat detail konfigurasi kode undangan berdasarkan ID | Ya | Owner, Manager |
| 4 | `/company/invitation-codes/:id` | PATCH | Mengubah konfigurasi maupun status keaktifan kode undangan | Ya | Owner, Manager |
| 5 | `/company/invitation-codes/:id` | DELETE | Mencabut kode undangan sehingga tidak dapat diklaim kembali | Ya | Owner, Manager |
| 6 | `/invitation-codes/:code` | GET | Melihat pratinjau perusahaan, peran, dan jabatan yang diberikan oleh suatu kode undangan | Ya | Authenticated User |
| 7 | `/invitation-codes/claim` | POST | Mengklaim kode undangan untuk bergabung dengan perusahaan | Ya | Unassigned Staff |

Modul *invitation code* menyediakan alternatif perekrutan pegawai melalui kode undangan unik yang dapat dibagikan secara massal, tanpa harus mengirimkan undangan satu per satu ke alamat surel calon pegawai. Konfigurasi peran dan jabatan yang melekat pada kode inilah yang akan diterapkan kepada pengguna pada saat kode tersebut diklaim, dengan aturan yang sama seperti undangan melalui surel. Pembatasan hak akses diterapkan secara berjenjang, yaitu pemilik perusahaan (*owner*) dapat mengelola seluruh kode undangan, manajer umum hanya dapat mengelola kode berperan staf pada seluruh jabatan, sedangkan manajer departemen hanya dapat mengelola kode berperan staf pada jabatan yang dipimpinnya. Klaim kode hanya diperbolehkan bagi pengguna berperan *unassigned staff* yang belum berafiliasi dengan perusahaan mana pun, serta akan ditolak apabila kode telah dinonaktifkan, kedaluwarsa, atau kuota klaimnya habis. Pengurangan kuota klaim dilakukan secara atomik pada tingkat basis data agar klaim yang terjadi bersamaan tidak melampaui batas maksimum yang ditetapkan.
