# Laporan Hasil Unit Test Modul Services (Owner CRUD)

Hasil pengujian level unit didokumentasikan untuk memverifikasi kebenaran logika internal pada modul ini secara terisolasi. Fungsi-fungsi pada lapisan service dan controller telah dieksekusi menggunakan mock data sehingga tidak bergantung pada komponen eksternal. Kesesuaian output terhadap berbagai skenario input telah divalidasi berdasarkan spesifikasi kebutuhan fungsional sistem. Batasan hak akses serta penanganan kesalahan dipastikan telah diimplementasikan secara ketat melalui rekam jejak pengujian ini.

### Tabel Hasil Pengujian Modul

| ID Test | Nama Fungsi / Method | Skenario Pengujian | Hasil yang Diharapkan | Hasil Aktual | Status |
|---|---|---|---|---|---|
| TC-UNIT-SERVC-001-A | `getAllServices()` | Berhasil: Mengambil semua data layanan | Mengembalikan array object beserta metadata pagination (jika ada) | Data valid berhasil dikembalikan sistem | **PASS** |
| TC-UNIT-SERVC-001-C | `getAllServices()` | Gagal: Terjadi kesalahan database/server | Melemparkan eksepsi `InternalServerError` untuk penanganan log | Eksepsi berhasil dilemparkan sesuai harapan | **PASS** |
| TC-UNIT-SERVC-002-A | `getServicesById()` | Berhasil: Mengambil detail layanan berdasarkan ID | Mengembalikan object tunggal entitas dengan data lengkap | Data valid berhasil dikembalikan sistem | **PASS** |
| TC-UNIT-SERVC-002-B | `getServicesById()` | Gagal: Data tidak ditemukan | Melemparkan eksepsi `NotFoundError` secara spesifik | Eksepsi berhasil dilemparkan sesuai harapan | **PASS** |
| TC-UNIT-SERVC-002-C | `getServicesById()` | Gagal: Terjadi kesalahan database/server | Melemparkan eksepsi `InternalServerError` untuk penanganan log | Eksepsi berhasil dilemparkan sesuai harapan | **PASS** |
| TC-UNIT-SERVC-003-A | `createServices()` | Berhasil: Membuat layanan baru | Mengembalikan object record baru yang telah berhasil di-persist ke database | Data valid berhasil dikembalikan sistem | **PASS** |
| TC-UNIT-SERVC-003-B | `createServices()` | Gagal: Validasi input salah | Melemparkan eksepsi `ValidationError` dengan detail error field | Eksepsi berhasil dilemparkan sesuai harapan | **PASS** |
| TC-UNIT-SERVC-003-C | `createServices()` | Gagal: Terjadi kesalahan database/server | Melemparkan eksepsi `InternalServerError` untuk penanganan log | Eksepsi berhasil dilemparkan sesuai harapan | **PASS** |
| TC-UNIT-SERVC-004-A | `updateServices()` | Berhasil: Memperbarui data layanan | Mengembalikan object record terbaru pasca modifikasi database | Data valid berhasil dikembalikan sistem | **PASS** |
| TC-UNIT-SERVC-004-B | `updateServices()` | Gagal: Data tidak ditemukan | Melemparkan eksepsi `NotFoundError` secara spesifik | Eksepsi berhasil dilemparkan sesuai harapan | **PASS** |
| TC-UNIT-SERVC-004-C | `updateServices()` | Gagal: Terjadi kesalahan database/server | Melemparkan eksepsi `InternalServerError` untuk penanganan log | Eksepsi berhasil dilemparkan sesuai harapan | **PASS** |
| TC-UNIT-SERVC-005-A | `updateServices()` | Berhasil: Mengaktifkan atau menonaktifkan layanan | Mengembalikan object record terbaru pasca modifikasi database | Data valid berhasil dikembalikan sistem | **PASS** |
| TC-UNIT-SERVC-005-C | `updateServices()` | Gagal: Terjadi kesalahan database/server | Melemparkan eksepsi `InternalServerError` untuk penanganan log | Eksepsi berhasil dilemparkan sesuai harapan | **PASS** |
| TC-UNIT-SERVC-006-A | `deleteServices()` | Berhasil: Menghapus layanan | Mengembalikan status konfirmasi penghapusan data dari sistem | Data valid berhasil dikembalikan sistem | **PASS** |
| TC-UNIT-SERVC-006-B | `deleteServices()` | Gagal: Data tidak ditemukan | Melemparkan eksepsi `NotFoundError` secara spesifik | Eksepsi berhasil dilemparkan sesuai harapan | **PASS** |
| TC-UNIT-SERVC-006-C | `deleteServices()` | Gagal: Terjadi kesalahan database/server | Melemparkan eksepsi `InternalServerError` untuk penanganan log | Eksepsi berhasil dilemparkan sesuai harapan | **PASS** |
| TC-UNIT-SERVC-007-A | `createServices()` | Berhasil: Membuat work order dari layanan | Mengembalikan object record baru yang telah berhasil di-persist ke database | Data valid berhasil dikembalikan sistem | **PASS** |
| TC-UNIT-SERVC-007-B | `createServices()` | Gagal: Validasi input salah | Melemparkan eksepsi `ValidationError` dengan detail error field | Eksepsi berhasil dilemparkan sesuai harapan | **PASS** |
| TC-UNIT-SERVC-007-C | `createServices()` | Gagal: Terjadi kesalahan database/server | Melemparkan eksepsi `InternalServerError` untuk penanganan log | Eksepsi berhasil dilemparkan sesuai harapan | **PASS** |
| TC-UNIT-SERVC-008-A | `getAllServices()` | Berhasil: Mengambil intake form untuk layanan (staff) | Mengembalikan array object beserta metadata pagination (jika ada) | Data valid berhasil dikembalikan sistem | **PASS** |
| TC-UNIT-SERVC-008-B | `getAllServices()` | Gagal: Data tidak ditemukan | Melemparkan eksepsi `NotFoundError` secara spesifik | Eksepsi berhasil dilemparkan sesuai harapan | **PASS** |
| TC-UNIT-SERVC-008-C | `getAllServices()` | Gagal: Terjadi kesalahan database/server | Melemparkan eksepsi `InternalServerError` untuk penanganan log | Eksepsi berhasil dilemparkan sesuai harapan | **PASS** |

Pelaksanaan terhadap seluruh skenario pengujian unit diselesaikan sesuai dengan rancangan awal. Status keberhasilan untuk setiap fungsi dicatat secara terperinci ke dalam laporan hasil uji. Segala bentuk kegagalan atau ketidaksesuaian ditelusuri untuk perbaikan lebih lanjut oleh tim pengembang. Kestabilan komponen internal dipastikan telah dievaluasi secara menyeluruh melalui dokumentasi hasil pengujian ini.
