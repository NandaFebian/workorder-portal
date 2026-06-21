# Company Endpoints

Perancangan antarmuka pemrograman aplikasi (API) pada modul *company* disajikan dalam bentuk daftar *endpoint*. Rincian *endpoint* tersebut dapat dilihat pada tabel berikut.

| No | Endpoint | Method | Deskripsi | Autentikasi | Role Required |
|---|---|---|---|---|---|
| 1 | `/public/companies` | GET | Melihat daftar seluruh perusahaan publik | Tidak (Optional) | Authenticated User / Public |
| 2 | `/public/companies/:id` | GET | Melihat detail informasi perusahaan berdasarkan ID | Tidak (Optional) | Authenticated User / Public |
| 3 | `/public/companies/:id/services` | GET | Melihat daftar layanan yang ditawarkan oleh suatu perusahaan | Tidak (Optional) | Authenticated User / Public |
| 4 | `/company` | GET | Mengambil data perusahaan yang terafiliasi dengan pengguna internal | Ya | Owner, Manager, Staff |
| 5 | `/company/:id` | GET | Melihat detail informasi perusahaan berdasarkan ID | Ya | Owner, Manager |
| 6 | `/company` | PUT | Mengubah informasi profil perusahaan | Ya | Owner, Manager |
| 7 | `/company/invite` | POST | Mengirim undangan kerja ke calon pegawai baru | Ya | Owner, Manager |
| 8 | `/company/invitations/history` | GET | Melihat riwayat pengiriman undangan pegawai | Ya | Owner, Manager |
| 9 | `/company/employees` | GET | Melihat daftar pegawai yang aktif di perusahaan | Ya | Owner, Manager |
| 10 | `/company/employees/:id` | GET | Melihat detail data pegawai berdasarkan ID | Ya | Owner, Manager |
| 11 | `/company/employees` | DELETE | Memberhentikan atau menghapus pegawai dari perusahaan | Ya | Owner, Manager |
| 12 | `/company/integration-config` | GET | Mengambil konfigurasi integrasi pihak ketiga | Ya | Owner |
| 13 | `/company/integration-config` | PUT | Mengubah konfigurasi integrasi pihak ketiga | Ya | Owner |

Pengelolaan profil perusahaan baik untuk konsumsi publik maupun administrasi internal difasilitasi melalui daftar endpoint modul company berdasarkan tabel di atas. Mekanisme otorisasi berbasis peran sistem untuk membatasi akses ke fungsi-fungsi kritis perusahaan ditunjukkan oleh kolom Role Required yang membedakan hak akses Owner, Manager, dan Staff secara hierarkis. Keamanan data operasional perusahaan dijamin melalui pemisahan endpoint publik (/public/companies) yang dapat diakses tanpa autentikasi dengan endpoint internal yang memerlukan token dan peran tertentu, sehingga informasi konfigurasi sensitif hanya dapat diakses oleh pihak yang berwenang.
