# Skenario Pengujian Unit Test Modul Positions

Pengujian level unit direncanakan untuk memverifikasi kebenaran logika internal pada modul ini secara terisolasi. Fungsi-fungsi pada lapisan service dan controller ditargetkan untuk dieksekusi menggunakan mock data agar tidak bergantung pada komponen eksternal. Kesesuaian output terhadap berbagai skenario input diharapkan untuk divalidasi berdasarkan spesifikasi kebutuhan fungsional sistem. Batasan hak akses serta penanganan kesalahan diwajibkan untuk diuji secara ketat melalui perancangan skenario ini.

### Tabel Skenario Pengujian Modul

| ID Test | Nama Fungsi / Method | Skenario Pengujian | Input/Kondisi (Mock) | Hasil yang Diharapkan |
|---|---|---|---|---|
| TC-UNIT-POSTN-001-A | `getAllPositions()` | Berhasil: Mengambil semua data posisi | Data / ID valid | Mengembalikan array object beserta metadata pagination (jika ada) |
| TC-UNIT-POSTN-001-C | `getAllPositions()` | Gagal: Terjadi kesalahan database/server | Mock service melempar error | Melemparkan eksepsi `InternalServerError` untuk penanganan log |
| TC-UNIT-POSTN-002-A | `createPositions()` | Berhasil: Membuat posisi baru | Data / ID valid | Mengembalikan object record baru yang telah berhasil di-persist ke database |
| TC-UNIT-POSTN-002-B | `createPositions()` | Gagal: Validasi input salah | Data payload tidak lengkap/salah format | Melemparkan eksepsi `ValidationError` dengan detail error field |
| TC-UNIT-POSTN-002-C | `createPositions()` | Gagal: Terjadi kesalahan database/server | Mock service melempar error | Melemparkan eksepsi `InternalServerError` untuk penanganan log |
| TC-UNIT-POSTN-003-A | `getPositionsById()` | Berhasil: Mengambil detail posisi berdasarkan ID | Data / ID valid | Mengembalikan object tunggal entitas dengan data lengkap |
| TC-UNIT-POSTN-003-B | `getPositionsById()` | Gagal: Data tidak ditemukan | ID tidak ada di DB | Melemparkan eksepsi `NotFoundError` secara spesifik |
| TC-UNIT-POSTN-003-C | `getPositionsById()` | Gagal: Terjadi kesalahan database/server | Mock service melempar error | Melemparkan eksepsi `InternalServerError` untuk penanganan log |
| TC-UNIT-POSTN-004-A | `updatePositions()` | Berhasil: Memperbarui data posisi | Data / ID valid | Mengembalikan object record terbaru pasca modifikasi database |
| TC-UNIT-POSTN-004-B | `updatePositions()` | Gagal: Data tidak ditemukan | ID tidak ada di DB | Melemparkan eksepsi `NotFoundError` secara spesifik |
| TC-UNIT-POSTN-004-C | `updatePositions()` | Gagal: Terjadi kesalahan database/server | Mock service melempar error | Melemparkan eksepsi `InternalServerError` untuk penanganan log |
| TC-UNIT-POSTN-005-A | `deletePositions()` | Berhasil: Menghapus posisi | Data / ID valid | Mengembalikan status konfirmasi penghapusan data dari sistem |
| TC-UNIT-POSTN-005-B | `deletePositions()` | Gagal: Data tidak ditemukan | ID tidak ada di DB | Melemparkan eksepsi `NotFoundError` secara spesifik |
| TC-UNIT-POSTN-005-C | `deletePositions()` | Gagal: Terjadi kesalahan database/server | Mock service melempar error | Melemparkan eksepsi `InternalServerError` untuk penanganan log |

Verifikasi terhadap kemampuan sistem diharapkan dapat dicapai melalui serangkaian skenario pengujian di atas. Seluruh modul dipastikan harus mencakup penanganan logika bisnis pada tiap fungsi secara mendalam. Respons sistem untuk skenario sukses maupun penanganan kesalahan dituntut untuk didefinisikan secara komprehensif. Kualitas perangkat lunak diyakini akan ditingkatkan melalui penerapan pengujian unit yang terstruktur ini.
