# Laporan Hasil Unit Test Modul Dashboard

Hasil pengujian level unit didokumentasikan untuk memverifikasi kebenaran logika internal pada modul ini secara terisolasi. Fungsi-fungsi pada lapisan service dan controller telah dieksekusi menggunakan mock data sehingga tidak bergantung pada komponen eksternal. Kesesuaian output terhadap berbagai skenario input telah divalidasi berdasarkan spesifikasi kebutuhan fungsional sistem. Batasan hak akses serta penanganan kesalahan dipastikan telah diimplementasikan secara ketat melalui rekam jejak pengujian ini.

### Tabel Hasil Pengujian Modul

| ID Test | Nama Fungsi / Method | Skenario Pengujian | Hasil yang Diharapkan | Hasil Aktual | Status |
|---|---|---|---|---|---|
| TC-UNIT-DASHB-001-A | `getAllDashboard()` | Berhasil: Mengambil statistik service request berdasarkan periode | Mengembalikan array object beserta metadata pagination (jika ada) | Data valid berhasil dikembalikan sistem | **PASS** |
| TC-UNIT-DASHB-001-C | `getAllDashboard()` | Gagal: Terjadi kesalahan database/server | Melemparkan eksepsi `InternalServerError` untuk penanganan log | Eksepsi berhasil dilemparkan sesuai harapan | **PASS** |
| TC-UNIT-DASHB-002-A | `getAllDashboard()` | Berhasil: Mengambil statistik work order berdasarkan periode | Mengembalikan array object beserta metadata pagination (jika ada) | Data valid berhasil dikembalikan sistem | **PASS** |
| TC-UNIT-DASHB-002-C | `getAllDashboard()` | Gagal: Terjadi kesalahan database/server | Melemparkan eksepsi `InternalServerError` untuk penanganan log | Eksepsi berhasil dilemparkan sesuai harapan | **PASS** |
| TC-UNIT-DASHB-003-A | `getAllDashboard()` | Berhasil: Mengambil data dashboard untuk owner perusahaan | Mengembalikan array object beserta metadata pagination (jika ada) | Data valid berhasil dikembalikan sistem | **PASS** |
| TC-UNIT-DASHB-003-C | `getAllDashboard()` | Gagal: Terjadi kesalahan database/server | Melemparkan eksepsi `InternalServerError` untuk penanganan log | Eksepsi berhasil dilemparkan sesuai harapan | **PASS** |

Pelaksanaan terhadap seluruh skenario pengujian unit diselesaikan sesuai dengan rancangan awal. Status keberhasilan untuk setiap fungsi dicatat secara terperinci ke dalam laporan hasil uji. Segala bentuk kegagalan atau ketidaksesuaian ditelusuri untuk perbaikan lebih lanjut oleh tim pengembang. Kestabilan komponen internal dipastikan telah dievaluasi secara menyeluruh melalui dokumentasi hasil pengujian ini.
