# Laporan Hasil Unit Test Modul Public Services

Hasil pengujian level unit didokumentasikan untuk memverifikasi kebenaran logika internal pada modul ini secara terisolasi. Fungsi-fungsi pada lapisan service dan controller telah dieksekusi menggunakan mock data sehingga tidak bergantung pada komponen eksternal. Kesesuaian output terhadap berbagai skenario input telah divalidasi berdasarkan spesifikasi kebutuhan fungsional sistem. Batasan hak akses serta penanganan kesalahan dipastikan telah diimplementasikan secara ketat melalui rekam jejak pengujian ini.

### Tabel Hasil Pengujian Modul

| ID Test | Nama Fungsi / Method | Skenario Pengujian | Hasil yang Diharapkan | Hasil Aktual | Status |
|---|---|---|---|---|---|
| TC-UNIT-PUBSV-001-A | `getAllPublic()` | Berhasil: Mengambil intake form publik tanpa autentikasi | Mengembalikan object kredensial termasuk access token pengguna | Data valid berhasil dikembalikan sistem | **PASS** |
| TC-UNIT-PUBSV-001-B | `getAllPublic()` | Gagal: Data tidak ditemukan | Melemparkan eksepsi `NotFoundError` secara spesifik | Eksepsi berhasil dilemparkan sesuai harapan | **PASS** |
| TC-UNIT-PUBSV-001-C | `getAllPublic()` | Gagal: Terjadi kesalahan database/server | Melemparkan eksepsi `InternalServerError` untuk penanganan log | Eksepsi berhasil dilemparkan sesuai harapan | **PASS** |
| TC-UNIT-PUBSV-002-A | `getAllPublic()` | Berhasil: Mengambil daftar semua perusahaan untuk client | Mengembalikan array object beserta metadata pagination (jika ada) | Data valid berhasil dikembalikan sistem | **PASS** |
| TC-UNIT-PUBSV-002-C | `getAllPublic()` | Gagal: Terjadi kesalahan database/server | Melemparkan eksepsi `InternalServerError` untuk penanganan log | Eksepsi berhasil dilemparkan sesuai harapan | **PASS** |
| TC-UNIT-PUBSV-003-A | `getAllPublic()` | Berhasil: Mengambil detail perusahaan untuk client | Mengembalikan array object beserta metadata pagination (jika ada) | Data valid berhasil dikembalikan sistem | **PASS** |
| TC-UNIT-PUBSV-003-C | `getAllPublic()` | Gagal: Terjadi kesalahan database/server | Melemparkan eksepsi `InternalServerError` untuk penanganan log | Eksepsi berhasil dilemparkan sesuai harapan | **PASS** |
| TC-UNIT-PUBSV-004-A | `getAllPublic()` | Berhasil: Mengambil daftar layanan perusahaan untuk client | Mengembalikan array object beserta metadata pagination (jika ada) | Data valid berhasil dikembalikan sistem | **PASS** |
| TC-UNIT-PUBSV-004-C | `getAllPublic()` | Gagal: Terjadi kesalahan database/server | Melemparkan eksepsi `InternalServerError` untuk penanganan log | Eksepsi berhasil dilemparkan sesuai harapan | **PASS** |

Pelaksanaan terhadap seluruh skenario pengujian unit diselesaikan sesuai dengan rancangan awal. Status keberhasilan untuk setiap fungsi dicatat secara terperinci ke dalam laporan hasil uji. Segala bentuk kegagalan atau ketidaksesuaian ditelusuri untuk perbaikan lebih lanjut oleh tim pengembang. Kestabilan komponen internal dipastikan telah dievaluasi secara menyeluruh melalui dokumentasi hasil pengujian ini.
