# Skenario Pengujian Unit Test Modul Public Services

Pengujian level unit direncanakan untuk memverifikasi kebenaran logika internal pada modul ini secara terisolasi. Fungsi-fungsi pada lapisan service dan controller ditargetkan untuk dieksekusi menggunakan mock data agar tidak bergantung pada komponen eksternal. Kesesuaian output terhadap berbagai skenario input diharapkan untuk divalidasi berdasarkan spesifikasi kebutuhan fungsional sistem. Batasan hak akses serta penanganan kesalahan diwajibkan untuk diuji secara ketat melalui perancangan skenario ini.

### Tabel Skenario Pengujian Modul

| ID Test | Nama Fungsi / Method | Skenario Pengujian | Input/Kondisi (Mock) | Hasil yang Diharapkan |
|---|---|---|---|---|
| TC-UNIT-PUBSV-001-A | `getAllPublic()` | Berhasil: Mengambil intake form publik tanpa autentikasi | Data / ID valid | Mengembalikan object kredensial termasuk access token pengguna |
| TC-UNIT-PUBSV-001-B | `getAllPublic()` | Gagal: Data tidak ditemukan | ID tidak ada di DB | Melemparkan eksepsi `NotFoundError` secara spesifik |
| TC-UNIT-PUBSV-001-C | `getAllPublic()` | Gagal: Terjadi kesalahan database/server | Mock service melempar error | Melemparkan eksepsi `InternalServerError` untuk penanganan log |
| TC-UNIT-PUBSV-002-A | `getAllPublic()` | Berhasil: Mengambil daftar semua perusahaan untuk client | Data / ID valid | Mengembalikan array object beserta metadata pagination (jika ada) |
| TC-UNIT-PUBSV-002-C | `getAllPublic()` | Gagal: Terjadi kesalahan database/server | Mock service melempar error | Melemparkan eksepsi `InternalServerError` untuk penanganan log |
| TC-UNIT-PUBSV-003-A | `getAllPublic()` | Berhasil: Mengambil detail perusahaan untuk client | Data / ID valid | Mengembalikan array object beserta metadata pagination (jika ada) |
| TC-UNIT-PUBSV-003-C | `getAllPublic()` | Gagal: Terjadi kesalahan database/server | Mock service melempar error | Melemparkan eksepsi `InternalServerError` untuk penanganan log |
| TC-UNIT-PUBSV-004-A | `getAllPublic()` | Berhasil: Mengambil daftar layanan perusahaan untuk client | Data / ID valid | Mengembalikan array object beserta metadata pagination (jika ada) |
| TC-UNIT-PUBSV-004-C | `getAllPublic()` | Gagal: Terjadi kesalahan database/server | Mock service melempar error | Melemparkan eksepsi `InternalServerError` untuk penanganan log |

Verifikasi terhadap kemampuan sistem diharapkan dapat dicapai melalui serangkaian skenario pengujian di atas. Seluruh modul dipastikan harus mencakup penanganan logika bisnis pada tiap fungsi secara mendalam. Respons sistem untuk skenario sukses maupun penanganan kesalahan dituntut untuk didefinisikan secara komprehensif. Kualitas perangkat lunak diyakini akan ditingkatkan melalui penerapan pengujian unit yang terstruktur ini.
