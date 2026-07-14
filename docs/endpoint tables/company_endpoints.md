# Company Endpoints

Perancangan antarmuka pemrograman aplikasi (API) pada modul *company* disajikan dalam bentuk daftar *endpoint*. Rincian *endpoint* tersebut dapat dilihat pada tabel berikut.

| No | Endpoint | Method | Deskripsi | Autentikasi | Role Required |
|---|---|---|---|---|---|
| 1 | `/public/companies` | GET | Melihat daftar seluruh perusahaan publik, dilengkapi pencarian opsional melalui parameter `keyword` berdasarkan nama perusahaan maupun nama layanan publik yang dimilikinya | Tidak (Optional) | Authenticated User / Public |
| 2 | `/public/companies/:id` | GET | Melihat detail informasi perusahaan berdasarkan ID | Tidak (Optional) | Authenticated User / Public |
| 3 | `/public/companies/:id/services` | GET | Melihat daftar layanan yang ditawarkan oleh suatu perusahaan | Tidak (Optional) | Authenticated User / Public |
| 4 | `/company` | GET | Mengambil data perusahaan yang terafiliasi dengan pengguna internal | Ya | Owner, Manager, Staff |
| 5 | `/company` | PUT | Mengubah informasi profil perusahaan | Ya | Owner, Manager |
| 6 | `/company` | DELETE | Menghapus data perusahaan dari sistem | Ya | Owner |
| 7 | `/company/detail` | GET | Mengambil detail informasi profil perusahaan | Ya | Owner, Manager |
| 8 | `/company/invite` | POST | Mengirim undangan kerja ke calon pegawai baru | Ya | Owner, Manager |
| 9 | `/company/invitable-users` | GET | Mencari calon pegawai berperan *unassigned staff* berdasarkan alamat surel sebelum undangan dikirimkan | Ya | Owner, Manager |
| 10 | `/company/invitations/history` | GET | Melihat riwayat pengiriman undangan pegawai | Ya | Owner, Manager |
| 11 | `/company/employees` | GET | Melihat daftar pegawai yang aktif di perusahaan | Ya | Owner, Manager |
| 12 | `/company/employees/:id` | GET | Melihat detail data pegawai berdasarkan ID | Ya | Owner, Manager |
| 13 | `/company/employees` | DELETE | Memberhentikan atau menghapus pegawai dari perusahaan | Ya | Owner, Manager |
| 14 | `/company/integration-config` | GET | Mengambil konfigurasi integrasi pihak ketiga | Ya | Owner |
| 15 | `/company/integration-config` | PUT | Mengubah konfigurasi integrasi pihak ketiga | Ya | Owner |

Modul *company* dirancang untuk memisahkan operasional publik dan administrasi internal perusahaan. Informasi dasar mengenai profil perusahaan dan daftar layanan yang ditawarkan disediakan secara publik agar dapat diakses oleh calon klien, termasuk fasilitas pencarian perusahaan yang turut menelusuri nama layanan publik sehingga klien tetap menemukan perusahaan yang relevan meskipun tidak mengetahui nama perusahaannya. Pengelolaan internal perusahaan seperti struktur keanggotaan pegawai, undangan rekrutmen, dan integrasi sistem eksternal dibatasi melalui peran pengguna yang ketat. Pencarian calon pegawai sebelum undangan dikirimkan hanya menampilkan pengguna yang benar-benar memenuhi syarat, yaitu berperan *unassigned staff* dan belum berafiliasi dengan perusahaan mana pun, sehingga undangan tidak akan gagal pada saat dikirimkan. Perubahan konfigurasi kritis dan penghapusan data perusahaan hanya dapat dilakukan oleh pemilik perusahaan (*owner*). Otorisasi berbasis peran diterapkan pada tingkat pengontrol (*controller*) untuk menjaga integritas data operasional masing-masing entitas.
