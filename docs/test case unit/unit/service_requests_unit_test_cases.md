# Skenario Pengujian Unit Test Modul Service Requests

Pengujian level unit direncanakan untuk memverifikasi kebenaran logika internal pada modul ini secara terisolasi. Fungsi-fungsi pada lapisan service dan controller ditargetkan untuk dieksekusi menggunakan mock data agar tidak bergantung pada komponen eksternal. Kesesuaian output terhadap berbagai skenario input diharapkan untuk divalidasi berdasarkan spesifikasi kebutuhan fungsional sistem. Batasan hak akses serta penanganan kesalahan diwajibkan untuk diuji secara ketat melalui perancangan skenario ini.

### Tabel Skenario Pengujian Modul

| ID Test | Nama Fungsi / Method | Skenario Pengujian | Input/Kondisi (Mock) | Hasil yang Diharapkan |
|---|---|---|---|---|
| TC-UNIT-SRVREQ-001-A | `getAllServiceRequests()` | Berhasil: Mengambil riwayat service request yang dikirim | Data / ID valid | Mengembalikan array object beserta metadata pagination (jika ada) |
| TC-UNIT-SRVREQ-001-C | `getAllServiceRequests()` | Gagal: Terjadi kesalahan database/server | Mock service melempar error | Melemparkan eksepsi `InternalServerError` untuk penanganan log |
| TC-UNIT-SRVREQ-002-A | `getAllServiceRequests()` | Berhasil: Mengambil inbox service request untuk owner/manager | Data / ID valid | Mengembalikan array object beserta metadata pagination (jika ada) |
| TC-UNIT-SRVREQ-002-C | `getAllServiceRequests()` | Gagal: Terjadi kesalahan database/server | Mock service melempar error | Melemparkan eksepsi `InternalServerError` untuk penanganan log |
| TC-UNIT-SRVREQ-003-A | `getServiceRequestsById()` | Berhasil: Mengambil detail service request berdasarkan ID | Data / ID valid | Mengembalikan object tunggal entitas dengan data lengkap |
| TC-UNIT-SRVREQ-003-B | `getServiceRequestsById()` | Gagal: Data tidak ditemukan | ID tidak ada di DB | Melemparkan eksepsi `NotFoundError` secara spesifik |
| TC-UNIT-SRVREQ-003-C | `getServiceRequestsById()` | Gagal: Terjadi kesalahan database/server | Mock service melempar error | Melemparkan eksepsi `InternalServerError` untuk penanganan log |
| TC-UNIT-SRVREQ-004-A | `updateServiceRequests()` | Berhasil: Menolak service request | Data / ID valid | Mengembalikan object record terbaru pasca modifikasi database |
| TC-UNIT-SRVREQ-004-C | `updateServiceRequests()` | Gagal: Terjadi kesalahan database/server | Mock service melempar error | Melemparkan eksepsi `InternalServerError` untuk penanganan log |
| TC-UNIT-SRVREQ-005-A | `updateServiceRequests()` | Berhasil: Menyetujui service request | Data / ID valid | Mengembalikan object record terbaru pasca modifikasi database |
| TC-UNIT-SRVREQ-005-C | `updateServiceRequests()` | Gagal: Terjadi kesalahan database/server | Mock service melempar error | Melemparkan eksepsi `InternalServerError` untuk penanganan log |
| TC-UNIT-SRVREQ-006-A | `createServiceRequests()` | Berhasil: Mengirimkan intake form atau membuat service request | Data / ID valid | Mengembalikan object record baru yang telah berhasil di-persist ke database |
| TC-UNIT-SRVREQ-006-B | `createServiceRequests()` | Gagal: Validasi input salah | Data payload tidak lengkap/salah format | Melemparkan eksepsi `ValidationError` dengan detail error field |
| TC-UNIT-SRVREQ-006-C | `createServiceRequests()` | Gagal: Terjadi kesalahan database/server | Mock service melempar error | Melemparkan eksepsi `InternalServerError` untuk penanganan log |
| TC-UNIT-SRVREQ-007-A | `getAllServiceRequests()` | Berhasil: Mengambil laporan pekerjaan untuk service request | Data / ID valid | Mengembalikan array object beserta metadata pagination (jika ada) |
| TC-UNIT-SRVREQ-007-B | `getAllServiceRequests()` | Gagal: Data tidak ditemukan | ID tidak ada di DB | Melemparkan eksepsi `NotFoundError` secara spesifik |
| TC-UNIT-SRVREQ-007-C | `getAllServiceRequests()` | Gagal: Terjadi kesalahan database/server | Mock service melempar error | Melemparkan eksepsi `InternalServerError` untuk penanganan log |
| TC-UNIT-SRVREQ-008-A | `createServiceRequests()` | Berhasil: Mengirimkan review untuk service request | Data / ID valid | Mengembalikan object record baru yang telah berhasil di-persist ke database |
| TC-UNIT-SRVREQ-008-B | `createServiceRequests()` | Gagal: Validasi input salah | Data payload tidak lengkap/salah format | Melemparkan eksepsi `ValidationError` dengan detail error field |
| TC-UNIT-SRVREQ-008-C | `createServiceRequests()` | Gagal: Terjadi kesalahan database/server | Mock service melempar error | Melemparkan eksepsi `InternalServerError` untuk penanganan log |

Verifikasi terhadap kemampuan sistem diharapkan dapat dicapai melalui serangkaian skenario pengujian di atas. Seluruh modul dipastikan harus mencakup penanganan logika bisnis pada tiap fungsi secara mendalam. Respons sistem untuk skenario sukses maupun penanganan kesalahan dituntut untuk didefinisikan secara komprehensif. Kualitas perangkat lunak diyakini akan ditingkatkan melalui penerapan pengujian unit yang terstruktur ini.
