# Skenario Pengujian Unit Test Modul Company Profile & Employees

Pengujian level unit direncanakan untuk memverifikasi kebenaran logika internal pada modul ini secara terisolasi. Fungsi-fungsi pada lapisan service dan controller ditargetkan untuk dieksekusi menggunakan mock data agar tidak bergantung pada komponen eksternal. Kesesuaian output terhadap berbagai skenario input diharapkan untuk divalidasi berdasarkan spesifikasi kebutuhan fungsional sistem. Batasan hak akses serta penanganan kesalahan diwajibkan untuk diuji secara ketat melalui perancangan skenario ini.

### Tabel Skenario Pengujian Modul

| ID Test | Nama Fungsi / Method | Skenario Pengujian | Input/Kondisi (Mock) | Hasil yang Diharapkan |
|---|---|---|---|---|
| TC-UNIT-CMPNY-001-A | `getAllCompany()` | Berhasil: Mengambil profil perusahaan | Data / ID valid | Mengembalikan array object beserta metadata pagination (jika ada) |
| TC-UNIT-CMPNY-001-C | `getAllCompany()` | Gagal: Terjadi kesalahan database/server | Mock service melempar error | Melemparkan eksepsi `InternalServerError` untuk penanganan log |
| TC-UNIT-CMPNY-002-A | `getCompanyById()` | Berhasil: Mengambil detail perusahaan berdasarkan ID | Data / ID valid | Mengembalikan object tunggal entitas dengan data lengkap |
| TC-UNIT-CMPNY-002-B | `getCompanyById()` | Gagal: Data tidak ditemukan | ID tidak ada di DB | Melemparkan eksepsi `NotFoundError` secara spesifik |
| TC-UNIT-CMPNY-002-C | `getCompanyById()` | Gagal: Terjadi kesalahan database/server | Mock service melempar error | Melemparkan eksepsi `InternalServerError` untuk penanganan log |
| TC-UNIT-CMPNY-003-A | `updateCompany()` | Berhasil: Memperbarui profil perusahaan | Data / ID valid | Mengembalikan object record terbaru pasca modifikasi database |
| TC-UNIT-CMPNY-003-B | `updateCompany()` | Gagal: Data tidak ditemukan | ID tidak ada di DB | Melemparkan eksepsi `NotFoundError` secara spesifik |
| TC-UNIT-CMPNY-003-C | `updateCompany()` | Gagal: Terjadi kesalahan database/server | Mock service melempar error | Melemparkan eksepsi `InternalServerError` untuk penanganan log |
| TC-UNIT-CMPNY-004-A | `getAllCompany()` | Berhasil: Mengambil semua karyawan perusahaan | Data / ID valid | Mengembalikan array object beserta metadata pagination (jika ada) |
| TC-UNIT-CMPNY-004-C | `getAllCompany()` | Gagal: Terjadi kesalahan database/server | Mock service melempar error | Melemparkan eksepsi `InternalServerError` untuk penanganan log |
| TC-UNIT-CMPNY-005-A | `getCompanyById()` | Berhasil: Mengambil detail karyawan berdasarkan ID | Data / ID valid | Mengembalikan object tunggal entitas dengan data lengkap |
| TC-UNIT-CMPNY-005-B | `getCompanyById()` | Gagal: Data tidak ditemukan | ID tidak ada di DB | Melemparkan eksepsi `NotFoundError` secara spesifik |
| TC-UNIT-CMPNY-005-C | `getCompanyById()` | Gagal: Terjadi kesalahan database/server | Mock service melempar error | Melemparkan eksepsi `InternalServerError` untuk penanganan log |
| TC-UNIT-CMPNY-006-A | `deleteCompany()` | Berhasil: Mengeluarkan karyawan dari perusahaan | Data / ID valid | Mengembalikan status konfirmasi penghapusan data dari sistem |
| TC-UNIT-CMPNY-006-B | `deleteCompany()` | Gagal: Data tidak ditemukan | ID tidak ada di DB | Melemparkan eksepsi `NotFoundError` secara spesifik |
| TC-UNIT-CMPNY-006-C | `deleteCompany()` | Gagal: Terjadi kesalahan database/server | Mock service melempar error | Melemparkan eksepsi `InternalServerError` untuk penanganan log |
| TC-UNIT-CMPNY-007-A | `createCompany()` | Berhasil: Mengundang karyawan baru ke perusahaan | Data / ID valid | Mengembalikan object record baru yang telah berhasil di-persist ke database |
| TC-UNIT-CMPNY-007-B | `createCompany()` | Gagal: Validasi input salah | Data payload tidak lengkap/salah format | Melemparkan eksepsi `ValidationError` dengan detail error field |
| TC-UNIT-CMPNY-007-C | `createCompany()` | Gagal: Terjadi kesalahan database/server | Mock service melempar error | Melemparkan eksepsi `InternalServerError` untuk penanganan log |
| TC-UNIT-CMPNY-008-A | `getAllCompany()` | Berhasil: Mengambil riwayat undangan karyawan | Data / ID valid | Mengembalikan array object beserta metadata pagination (jika ada) |
| TC-UNIT-CMPNY-008-C | `getAllCompany()` | Gagal: Terjadi kesalahan database/server | Mock service melempar error | Melemparkan eksepsi `InternalServerError` untuk penanganan log |
| TC-UNIT-CMPNY-009-A | `getAllCompany()` | Berhasil: Mengambil konfigurasi integrasi perusahaan | Data / ID valid | Mengembalikan array object beserta metadata pagination (jika ada) |
| TC-UNIT-CMPNY-009-C | `getAllCompany()` | Gagal: Terjadi kesalahan database/server | Mock service melempar error | Melemparkan eksepsi `InternalServerError` untuk penanganan log |
| TC-UNIT-CMPNY-010-A | `updateCompany()` | Berhasil: Memperbarui konfigurasi integrasi perusahaan | Data / ID valid | Mengembalikan object record terbaru pasca modifikasi database |
| TC-UNIT-CMPNY-010-B | `updateCompany()` | Gagal: Data tidak ditemukan | ID tidak ada di DB | Melemparkan eksepsi `NotFoundError` secara spesifik |
| TC-UNIT-CMPNY-010-C | `updateCompany()` | Gagal: Terjadi kesalahan database/server | Mock service melempar error | Melemparkan eksepsi `InternalServerError` untuk penanganan log |

Verifikasi terhadap kemampuan sistem diharapkan dapat dicapai melalui serangkaian skenario pengujian di atas. Seluruh modul dipastikan harus mencakup penanganan logika bisnis pada tiap fungsi secara mendalam. Respons sistem untuk skenario sukses maupun penanganan kesalahan dituntut untuk didefinisikan secara komprehensif. Kualitas perangkat lunak diyakini akan ditingkatkan melalui penerapan pengujian unit yang terstruktur ini.
