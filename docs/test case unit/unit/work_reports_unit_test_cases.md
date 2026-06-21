# Skenario Pengujian Unit Test Modul Work Reports

Pengujian level unit direncanakan untuk memverifikasi kebenaran logika internal pada modul ini secara terisolasi. Fungsi-fungsi pada lapisan service dan controller ditargetkan untuk dieksekusi menggunakan mock data agar tidak bergantung pada komponen eksternal. Kesesuaian output terhadap berbagai skenario input diharapkan untuk divalidasi berdasarkan spesifikasi kebutuhan fungsional sistem. Batasan hak akses serta penanganan kesalahan diwajibkan untuk diuji secara ketat melalui perancangan skenario ini.

### Tabel Skenario Pengujian Modul

| ID Test | Nama Fungsi / Method | Skenario Pengujian | Input/Kondisi (Mock) | Hasil yang Diharapkan |
|---|---|---|---|---|
| TC-UNIT-WKRPT-001-A | `createWorkreports()` | Berhasil: Menyimpan data work report | Data / ID valid | Mengembalikan object record baru yang telah berhasil di-persist ke database |
| TC-UNIT-WKRPT-001-B | `createWorkreports()` | Gagal: Validasi input salah | Data payload tidak lengkap/salah format | Melemparkan eksepsi `ValidationError` dengan detail error field |
| TC-UNIT-WKRPT-001-C | `createWorkreports()` | Gagal: Terjadi kesalahan database/server | Mock service melempar error | Melemparkan eksepsi `InternalServerError` untuk penanganan log |
| TC-UNIT-WKRPT-002-A | `updateWorkreports()` | Berhasil: Mengirim work report untuk review | Data / ID valid | Mengembalikan object record terbaru pasca modifikasi database |
| TC-UNIT-WKRPT-002-C | `updateWorkreports()` | Gagal: Terjadi kesalahan database/server | Mock service melempar error | Melemparkan eksepsi `InternalServerError` untuk penanganan log |
| TC-UNIT-WKRPT-003-A | `updateWorkreports()` | Berhasil: Menyetujui work report | Data / ID valid | Mengembalikan object record terbaru pasca modifikasi database |
| TC-UNIT-WKRPT-003-C | `updateWorkreports()` | Gagal: Terjadi kesalahan database/server | Mock service melempar error | Melemparkan eksepsi `InternalServerError` untuk penanganan log |
| TC-UNIT-WKRPT-004-A | `updateWorkreports()` | Berhasil: Menolak work report | Data / ID valid | Mengembalikan object record terbaru pasca modifikasi database |
| TC-UNIT-WKRPT-004-C | `updateWorkreports()` | Gagal: Terjadi kesalahan database/server | Mock service melempar error | Melemparkan eksepsi `InternalServerError` untuk penanganan log |

Verifikasi terhadap kemampuan sistem diharapkan dapat dicapai melalui serangkaian skenario pengujian di atas. Seluruh modul dipastikan harus mencakup penanganan logika bisnis pada tiap fungsi secara mendalam. Respons sistem untuk skenario sukses maupun penanganan kesalahan dituntut untuk didefinisikan secara komprehensif. Kualitas perangkat lunak diyakini akan ditingkatkan melalui penerapan pengujian unit yang terstruktur ini.
