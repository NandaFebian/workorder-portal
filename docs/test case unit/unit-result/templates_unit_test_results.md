# Laporan Hasil Unit Test Modul Templates

Hasil pengujian level unit didokumentasikan untuk memverifikasi kebenaran logika internal pada modul ini secara terisolasi. Fungsi-fungsi pada lapisan service dan controller telah dieksekusi menggunakan mock data sehingga tidak bergantung pada komponen eksternal. Kesesuaian output terhadap berbagai skenario input telah divalidasi berdasarkan spesifikasi kebutuhan fungsional sistem. Batasan hak akses serta penanganan kesalahan dipastikan telah diimplementasikan secara ketat melalui rekam jejak pengujian ini.

### Tabel Hasil Pengujian Modul

| ID Test | Nama Fungsi / Method | Skenario Pengujian | Hasil yang Diharapkan | Hasil Aktual | Status |
|---|---|---|---|---|---|
| TC-UNIT-TMPLT-001-A | `getAllTemplate()` | Berhasil: Mengambil semua tipe perusahaan untuk template | Mengembalikan array object beserta metadata pagination (jika ada) | Data valid berhasil dikembalikan sistem | **PASS** |
| TC-UNIT-TMPLT-001-C | `getAllTemplate()` | Gagal: Terjadi kesalahan database/server | Melemparkan eksepsi `InternalServerError` untuk penanganan log | Eksepsi berhasil dilemparkan sesuai harapan | **PASS** |
| TC-UNIT-TMPLT-002-A | `getAllTemplate()` | Berhasil: Mengambil layanan berdasarkan tipe perusahaan | Mengembalikan array object beserta metadata pagination (jika ada) | Data valid berhasil dikembalikan sistem | **PASS** |
| TC-UNIT-TMPLT-002-B | `getAllTemplate()` | Gagal: Data tidak ditemukan | Melemparkan eksepsi `NotFoundError` secara spesifik | Eksepsi berhasil dilemparkan sesuai harapan | **PASS** |
| TC-UNIT-TMPLT-002-C | `getAllTemplate()` | Gagal: Terjadi kesalahan database/server | Melemparkan eksepsi `InternalServerError` untuk penanganan log | Eksepsi berhasil dilemparkan sesuai harapan | **PASS** |
| TC-UNIT-TMPLT-003-A | `getTemplateById()` | Berhasil: Melihat preview template layanan | Mengembalikan object tunggal entitas dengan data lengkap | Data valid berhasil dikembalikan sistem | **PASS** |
| TC-UNIT-TMPLT-003-B | `getTemplateById()` | Gagal: Data tidak ditemukan | Melemparkan eksepsi `NotFoundError` secara spesifik | Eksepsi berhasil dilemparkan sesuai harapan | **PASS** |
| TC-UNIT-TMPLT-003-C | `getTemplateById()` | Gagal: Terjadi kesalahan database/server | Melemparkan eksepsi `InternalServerError` untuk penanganan log | Eksepsi berhasil dilemparkan sesuai harapan | **PASS** |
| TC-UNIT-TMPLT-004-A | `createTemplate()` | Berhasil: Menghasilkan layanan dari template | Mengembalikan object record baru yang telah berhasil di-persist ke database | Data valid berhasil dikembalikan sistem | **PASS** |
| TC-UNIT-TMPLT-004-B | `createTemplate()` | Gagal: Validasi input salah | Melemparkan eksepsi `ValidationError` dengan detail error field | Eksepsi berhasil dilemparkan sesuai harapan | **PASS** |
| TC-UNIT-TMPLT-004-C | `createTemplate()` | Gagal: Terjadi kesalahan database/server | Melemparkan eksepsi `InternalServerError` untuk penanganan log | Eksepsi berhasil dilemparkan sesuai harapan | **PASS** |

Pelaksanaan terhadap seluruh skenario pengujian unit diselesaikan sesuai dengan rancangan awal. Status keberhasilan untuk setiap fungsi dicatat secara terperinci ke dalam laporan hasil uji. Segala bentuk kegagalan atau ketidaksesuaian ditelusuri untuk perbaikan lebih lanjut oleh tim pengembang. Kestabilan komponen internal dipastikan telah dievaluasi secara menyeluruh melalui dokumentasi hasil pengujian ini.
