# Laporan Hasil Unit Test Modul Authentication

Hasil pengujian level unit didokumentasikan untuk memverifikasi kebenaran logika internal pada modul ini secara terisolasi. Fungsi-fungsi pada lapisan service dan controller telah dieksekusi menggunakan mock data sehingga tidak bergantung pada komponen eksternal. Kesesuaian output terhadap berbagai skenario input telah divalidasi berdasarkan spesifikasi kebutuhan fungsional sistem. Batasan hak akses serta penanganan kesalahan dipastikan telah diimplementasikan secara ketat melalui rekam jejak pengujian ini.

### Tabel Hasil Pengujian Modul

| ID Test | Nama Fungsi / Method | Skenario Pengujian | Hasil yang Diharapkan | Hasil Aktual | Status |
|---|---|---|---|---|---|
| TC-UNIT-AUTHE-001-A | `register()` | Berhasil: Mendaftarkan akun pengguna baru | Mengembalikan array object beserta metadata pagination (jika ada) | Data valid berhasil dikembalikan sistem | **PASS** |
| TC-UNIT-AUTHE-001-B | `register()` | Gagal: Validasi input salah | Melemparkan eksepsi `ValidationError` dengan detail error field | Eksepsi berhasil dilemparkan sesuai harapan | **PASS** |
| TC-UNIT-AUTHE-001-C | `register()` | Gagal: Terjadi kesalahan database/server | Melemparkan eksepsi `InternalServerError` untuk penanganan log | Eksepsi berhasil dilemparkan sesuai harapan | **PASS** |
| TC-UNIT-AUTHE-002-A | `registerCompany()` | Berhasil: Mendaftarkan perusahaan baru beserta akun owner | Mengembalikan array object beserta metadata pagination (jika ada) | Data valid berhasil dikembalikan sistem | **PASS** |
| TC-UNIT-AUTHE-002-B | `registerCompany()` | Gagal: Validasi input salah | Melemparkan eksepsi `ValidationError` dengan detail error field | Eksepsi berhasil dilemparkan sesuai harapan | **PASS** |
| TC-UNIT-AUTHE-002-C | `registerCompany()` | Gagal: Terjadi kesalahan database/server | Melemparkan eksepsi `InternalServerError` untuk penanganan log | Eksepsi berhasil dilemparkan sesuai harapan | **PASS** |
| TC-UNIT-AUTHE-003-A | `login()` | Berhasil: Melakukan autentikasi pengguna untuk masuk ke dalam sistem | Mengembalikan object kredensial termasuk access token pengguna | Data valid berhasil dikembalikan sistem | **PASS** |
| TC-UNIT-AUTHE-003-B | `login()` | Gagal: Validasi input salah | Melemparkan eksepsi `ValidationError` dengan detail error field | Eksepsi berhasil dilemparkan sesuai harapan | **PASS** |
| TC-UNIT-AUTHE-003-C | `login()` | Gagal: Terjadi kesalahan database/server | Melemparkan eksepsi `InternalServerError` untuk penanganan log | Eksepsi berhasil dilemparkan sesuai harapan | **PASS** |
| TC-UNIT-AUTHE-004-A | `logout()` | Berhasil: Melakukan proses keluar dari sistem dengan memvalidasi token | Mengembalikan pesan sukses pembatalan sesi token aktif | Data valid berhasil dikembalikan sistem | **PASS** |
| TC-UNIT-AUTHE-004-B | `logout()` | Gagal: Validasi input salah | Melemparkan eksepsi `ValidationError` dengan detail error field | Eksepsi berhasil dilemparkan sesuai harapan | **PASS** |
| TC-UNIT-AUTHE-004-C | `logout()` | Gagal: Terjadi kesalahan database/server | Melemparkan eksepsi `InternalServerError` untuk penanganan log | Eksepsi berhasil dilemparkan sesuai harapan | **PASS** |
| TC-UNIT-AUTHE-005-A | `getProfile()` | Berhasil: Mengambil informasi profil pengguna yang sedang masuk | Mengembalikan object kredensial termasuk access token pengguna | Data valid berhasil dikembalikan sistem | **PASS** |
| TC-UNIT-AUTHE-005-C | `getProfile()` | Gagal: Terjadi kesalahan database/server | Melemparkan eksepsi `InternalServerError` untuk penanganan log | Eksepsi berhasil dilemparkan sesuai harapan | **PASS** |

Pelaksanaan terhadap seluruh skenario pengujian unit diselesaikan sesuai dengan rancangan awal. Status keberhasilan untuk setiap fungsi dicatat secara terperinci ke dalam laporan hasil uji. Segala bentuk kegagalan atau ketidaksesuaian ditelusuri untuk perbaikan lebih lanjut oleh tim pengembang. Kestabilan komponen internal dipastikan telah dievaluasi secara menyeluruh melalui dokumentasi hasil pengujian ini.
