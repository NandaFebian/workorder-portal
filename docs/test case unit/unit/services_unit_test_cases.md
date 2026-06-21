# Skenario Pengujian Unit Test Modul Services (Owner CRUD)

Pengujian level unit direncanakan untuk memverifikasi kebenaran logika internal pada modul ini secara terisolasi. Fungsi-fungsi pada lapisan service dan controller ditargetkan untuk dieksekusi menggunakan mock data agar tidak bergantung pada komponen eksternal. Kesesuaian output terhadap berbagai skenario input diharapkan untuk divalidasi berdasarkan spesifikasi kebutuhan fungsional sistem. Batasan hak akses serta penanganan kesalahan diwajibkan untuk diuji secara ketat melalui perancangan skenario ini.

### Tabel Skenario Pengujian Modul

| ID Test | Nama Fungsi / Method | Skenario Pengujian | Input/Kondisi (Mock) | Hasil yang Diharapkan |
|---|---|---|---|---|
| TC-UNIT-SERVC-001-A | `getAllServices()` | Berhasil: Mengambil semua data layanan | Data / ID valid | Mengembalikan array object beserta metadata pagination (jika ada) |
| TC-UNIT-SERVC-001-C | `getAllServices()` | Gagal: Terjadi kesalahan database/server | Mock service melempar error | Melemparkan eksepsi `InternalServerError` untuk penanganan log |
| TC-UNIT-SERVC-002-A | `getServicesById()` | Berhasil: Mengambil detail layanan berdasarkan ID | Data / ID valid | Mengembalikan object tunggal entitas dengan data lengkap |
| TC-UNIT-SERVC-002-B | `getServicesById()` | Gagal: Data tidak ditemukan | ID tidak ada di DB | Melemparkan eksepsi `NotFoundError` secara spesifik |
| TC-UNIT-SERVC-002-C | `getServicesById()` | Gagal: Terjadi kesalahan database/server | Mock service melempar error | Melemparkan eksepsi `InternalServerError` untuk penanganan log |
| TC-UNIT-SERVC-003-A | `createServices()` | Berhasil: Membuat layanan baru | Data / ID valid | Mengembalikan object record baru yang telah berhasil di-persist ke database |
| TC-UNIT-SERVC-003-B | `createServices()` | Gagal: Validasi input salah | Data payload tidak lengkap/salah format | Melemparkan eksepsi `ValidationError` dengan detail error field |
| TC-UNIT-SERVC-003-C | `createServices()` | Gagal: Terjadi kesalahan database/server | Mock service melempar error | Melemparkan eksepsi `InternalServerError` untuk penanganan log |
| TC-UNIT-SERVC-004-A | `updateServices()` | Berhasil: Memperbarui data layanan | Data / ID valid | Mengembalikan object record terbaru pasca modifikasi database |
| TC-UNIT-SERVC-004-B | `updateServices()` | Gagal: Data tidak ditemukan | ID tidak ada di DB | Melemparkan eksepsi `NotFoundError` secara spesifik |
| TC-UNIT-SERVC-004-C | `updateServices()` | Gagal: Terjadi kesalahan database/server | Mock service melempar error | Melemparkan eksepsi `InternalServerError` untuk penanganan log |
| TC-UNIT-SERVC-005-A | `updateServices()` | Berhasil: Mengaktifkan atau menonaktifkan layanan | Data / ID valid | Mengembalikan object record terbaru pasca modifikasi database |
| TC-UNIT-SERVC-005-C | `updateServices()` | Gagal: Terjadi kesalahan database/server | Mock service melempar error | Melemparkan eksepsi `InternalServerError` untuk penanganan log |
| TC-UNIT-SERVC-006-A | `deleteServices()` | Berhasil: Menghapus layanan | Data / ID valid | Mengembalikan status konfirmasi penghapusan data dari sistem |
| TC-UNIT-SERVC-006-B | `deleteServices()` | Gagal: Data tidak ditemukan | ID tidak ada di DB | Melemparkan eksepsi `NotFoundError` secara spesifik |
| TC-UNIT-SERVC-006-C | `deleteServices()` | Gagal: Terjadi kesalahan database/server | Mock service melempar error | Melemparkan eksepsi `InternalServerError` untuk penanganan log |
| TC-UNIT-SERVC-007-A | `createServices()` | Berhasil: Membuat work order dari layanan | Data / ID valid | Mengembalikan object record baru yang telah berhasil di-persist ke database |
| TC-UNIT-SERVC-007-B | `createServices()` | Gagal: Validasi input salah | Data payload tidak lengkap/salah format | Melemparkan eksepsi `ValidationError` dengan detail error field |
| TC-UNIT-SERVC-007-C | `createServices()` | Gagal: Terjadi kesalahan database/server | Mock service melempar error | Melemparkan eksepsi `InternalServerError` untuk penanganan log |
| TC-UNIT-SERVC-008-A | `getAllServices()` | Berhasil: Mengambil intake form untuk layanan (staff) | Data / ID valid | Mengembalikan array object beserta metadata pagination (jika ada) |
| TC-UNIT-SERVC-008-B | `getAllServices()` | Gagal: Data tidak ditemukan | ID tidak ada di DB | Melemparkan eksepsi `NotFoundError` secara spesifik |
| TC-UNIT-SERVC-008-C | `getAllServices()` | Gagal: Terjadi kesalahan database/server | Mock service melempar error | Melemparkan eksepsi `InternalServerError` untuk penanganan log |

Verifikasi terhadap kemampuan sistem diharapkan dapat dicapai melalui serangkaian skenario pengujian di atas. Seluruh modul dipastikan harus mencakup penanganan logika bisnis pada tiap fungsi secara mendalam. Respons sistem untuk skenario sukses maupun penanganan kesalahan dituntut untuk didefinisikan secara komprehensif. Kualitas perangkat lunak diyakini akan ditingkatkan melalui penerapan pengujian unit yang terstruktur ini.
