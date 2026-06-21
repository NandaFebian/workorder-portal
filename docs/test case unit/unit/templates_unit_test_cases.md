# Skenario Pengujian Unit Test Modul Templates

Pengujian level unit direncanakan untuk memverifikasi kebenaran logika internal pada modul ini secara terisolasi. Fungsi-fungsi pada lapisan service dan controller ditargetkan untuk dieksekusi menggunakan mock data agar tidak bergantung pada komponen eksternal. Kesesuaian output terhadap berbagai skenario input diharapkan untuk divalidasi berdasarkan spesifikasi kebutuhan fungsional sistem. Batasan hak akses serta penanganan kesalahan diwajibkan untuk diuji secara ketat melalui perancangan skenario ini.

### Tabel Skenario Pengujian Modul

| ID Test | Nama Fungsi / Method | Skenario Pengujian | Input/Kondisi (Mock) | Hasil yang Diharapkan |
|---|---|---|---|---|
| TC-UNIT-TMPLT-001-A | `getAllTemplate()` | Berhasil: Mengambil semua tipe perusahaan untuk template | Data / ID valid | Mengembalikan array object beserta metadata pagination (jika ada) |
| TC-UNIT-TMPLT-001-C | `getAllTemplate()` | Gagal: Terjadi kesalahan database/server | Mock service melempar error | Melemparkan eksepsi `InternalServerError` untuk penanganan log |
| TC-UNIT-TMPLT-002-A | `getAllTemplate()` | Berhasil: Mengambil layanan berdasarkan tipe perusahaan | Data / ID valid | Mengembalikan array object beserta metadata pagination (jika ada) |
| TC-UNIT-TMPLT-002-B | `getAllTemplate()` | Gagal: Data tidak ditemukan | ID tidak ada di DB | Melemparkan eksepsi `NotFoundError` secara spesifik |
| TC-UNIT-TMPLT-002-C | `getAllTemplate()` | Gagal: Terjadi kesalahan database/server | Mock service melempar error | Melemparkan eksepsi `InternalServerError` untuk penanganan log |
| TC-UNIT-TMPLT-003-A | `getTemplateById()` | Berhasil: Melihat preview template layanan | Data / ID valid | Mengembalikan object tunggal entitas dengan data lengkap |
| TC-UNIT-TMPLT-003-B | `getTemplateById()` | Gagal: Data tidak ditemukan | ID tidak ada di DB | Melemparkan eksepsi `NotFoundError` secara spesifik |
| TC-UNIT-TMPLT-003-C | `getTemplateById()` | Gagal: Terjadi kesalahan database/server | Mock service melempar error | Melemparkan eksepsi `InternalServerError` untuk penanganan log |
| TC-UNIT-TMPLT-004-A | `createTemplate()` | Berhasil: Menghasilkan layanan dari template | Data / ID valid | Mengembalikan object record baru yang telah berhasil di-persist ke database |
| TC-UNIT-TMPLT-004-B | `createTemplate()` | Gagal: Validasi input salah | Data payload tidak lengkap/salah format | Melemparkan eksepsi `ValidationError` dengan detail error field |
| TC-UNIT-TMPLT-004-C | `createTemplate()` | Gagal: Terjadi kesalahan database/server | Mock service melempar error | Melemparkan eksepsi `InternalServerError` untuk penanganan log |

Verifikasi terhadap kemampuan sistem diharapkan dapat dicapai melalui serangkaian skenario pengujian di atas. Seluruh modul dipastikan harus mencakup penanganan logika bisnis pada tiap fungsi secara mendalam. Respons sistem untuk skenario sukses maupun penanganan kesalahan dituntut untuk didefinisikan secara komprehensif. Kualitas perangkat lunak diyakini akan ditingkatkan melalui penerapan pengujian unit yang terstruktur ini.
