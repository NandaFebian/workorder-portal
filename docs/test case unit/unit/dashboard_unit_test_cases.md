# Skenario Pengujian Unit Test Modul Dashboard

Pengujian level unit direncanakan untuk memverifikasi kebenaran logika internal pada modul ini secara terisolasi. Fungsi-fungsi pada lapisan service dan controller ditargetkan untuk dieksekusi menggunakan mock data agar tidak bergantung pada komponen eksternal. Kesesuaian output terhadap berbagai skenario input diharapkan untuk divalidasi berdasarkan spesifikasi kebutuhan fungsional sistem. Batasan hak akses serta penanganan kesalahan diwajibkan untuk diuji secara ketat melalui perancangan skenario ini.

### Tabel Skenario Pengujian Modul

| ID Test | Nama Fungsi / Method | Skenario Pengujian | Input/Kondisi (Mock) | Hasil yang Diharapkan |
|---|---|---|---|---|
| TC-UNIT-DASHB-001-A | `getAllDashboard()` | Berhasil: Mengambil statistik service request berdasarkan periode | Data / ID valid | Mengembalikan array object beserta metadata pagination (jika ada) |
| TC-UNIT-DASHB-001-C | `getAllDashboard()` | Gagal: Terjadi kesalahan database/server | Mock service melempar error | Melemparkan eksepsi `InternalServerError` untuk penanganan log |
| TC-UNIT-DASHB-002-A | `getAllDashboard()` | Berhasil: Mengambil statistik work order berdasarkan periode | Data / ID valid | Mengembalikan array object beserta metadata pagination (jika ada) |
| TC-UNIT-DASHB-002-C | `getAllDashboard()` | Gagal: Terjadi kesalahan database/server | Mock service melempar error | Melemparkan eksepsi `InternalServerError` untuk penanganan log |
| TC-UNIT-DASHB-003-A | `getAllDashboard()` | Berhasil: Mengambil data dashboard untuk owner perusahaan | Data / ID valid | Mengembalikan array object beserta metadata pagination (jika ada) |
| TC-UNIT-DASHB-003-C | `getAllDashboard()` | Gagal: Terjadi kesalahan database/server | Mock service melempar error | Melemparkan eksepsi `InternalServerError` untuk penanganan log |

Verifikasi terhadap kemampuan sistem diharapkan dapat dicapai melalui serangkaian skenario pengujian di atas. Seluruh modul dipastikan harus mencakup penanganan logika bisnis pada tiap fungsi secara mendalam. Respons sistem untuk skenario sukses maupun penanganan kesalahan dituntut untuk didefinisikan secara komprehensif. Kualitas perangkat lunak diyakini akan ditingkatkan melalui penerapan pengujian unit yang terstruktur ini.
