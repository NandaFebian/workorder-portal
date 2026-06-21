# Laporan Hasil Unit Test Modul Service Requests

Hasil pengujian level unit didokumentasikan untuk memverifikasi kebenaran logika internal pada modul ini secara terisolasi. Fungsi-fungsi pada lapisan service dan controller telah dieksekusi menggunakan mock data sehingga tidak bergantung pada komponen eksternal. Kesesuaian output terhadap berbagai skenario input telah divalidasi berdasarkan spesifikasi kebutuhan fungsional sistem. Batasan hak akses serta penanganan kesalahan dipastikan telah diimplementasikan secara ketat melalui rekam jejak pengujian ini.

### Tabel Hasil Pengujian Modul

| ID Test | Nama Fungsi / Method | Skenario Pengujian | Hasil yang Diharapkan | Hasil Aktual | Status |
|---|---|---|---|---|---|
| TC-UNIT-SRVREQ-001-A | `getAllServiceRequests()` | Berhasil: Mengambil riwayat service request yang dikirim | Mengembalikan array object beserta metadata pagination (jika ada) | Data valid berhasil dikembalikan sistem | **PASS** |
| TC-UNIT-SRVREQ-001-C | `getAllServiceRequests()` | Gagal: Terjadi kesalahan database/server | Melemparkan eksepsi `InternalServerError` untuk penanganan log | Eksepsi berhasil dilemparkan sesuai harapan | **PASS** |
| TC-UNIT-SRVREQ-002-A | `getAllServiceRequests()` | Berhasil: Mengambil inbox service request untuk owner/manager | Mengembalikan array object beserta metadata pagination (jika ada) | Data valid berhasil dikembalikan sistem | **PASS** |
| TC-UNIT-SRVREQ-002-C | `getAllServiceRequests()` | Gagal: Terjadi kesalahan database/server | Melemparkan eksepsi `InternalServerError` untuk penanganan log | Eksepsi berhasil dilemparkan sesuai harapan | **PASS** |
| TC-UNIT-SRVREQ-003-A | `getServiceRequestsById()` | Berhasil: Mengambil detail service request berdasarkan ID | Mengembalikan object tunggal entitas dengan data lengkap | Data valid berhasil dikembalikan sistem | **PASS** |
| TC-UNIT-SRVREQ-003-B | `getServiceRequestsById()` | Gagal: Data tidak ditemukan | Melemparkan eksepsi `NotFoundError` secara spesifik | Eksepsi berhasil dilemparkan sesuai harapan | **PASS** |
| TC-UNIT-SRVREQ-003-C | `getServiceRequestsById()` | Gagal: Terjadi kesalahan database/server | Melemparkan eksepsi `InternalServerError` untuk penanganan log | Eksepsi berhasil dilemparkan sesuai harapan | **PASS** |
| TC-UNIT-SRVREQ-004-A | `updateServiceRequests()` | Berhasil: Menolak service request | Mengembalikan object record terbaru pasca modifikasi database | Data valid berhasil dikembalikan sistem | **PASS** |
| TC-UNIT-SRVREQ-004-C | `updateServiceRequests()` | Gagal: Terjadi kesalahan database/server | Melemparkan eksepsi `InternalServerError` untuk penanganan log | Eksepsi berhasil dilemparkan sesuai harapan | **PASS** |
| TC-UNIT-SRVREQ-005-A | `updateServiceRequests()` | Berhasil: Menyetujui service request | Mengembalikan object record terbaru pasca modifikasi database | Data valid berhasil dikembalikan sistem | **PASS** |
| TC-UNIT-SRVREQ-005-C | `updateServiceRequests()` | Gagal: Terjadi kesalahan database/server | Melemparkan eksepsi `InternalServerError` untuk penanganan log | Eksepsi berhasil dilemparkan sesuai harapan | **PASS** |
| TC-UNIT-SRVREQ-006-A | `createServiceRequests()` | Berhasil: Mengirimkan intake form atau membuat service request | Mengembalikan object record baru yang telah berhasil di-persist ke database | Data valid berhasil dikembalikan sistem | **PASS** |
| TC-UNIT-SRVREQ-006-B | `createServiceRequests()` | Gagal: Validasi input salah | Melemparkan eksepsi `ValidationError` dengan detail error field | Eksepsi berhasil dilemparkan sesuai harapan | **PASS** |
| TC-UNIT-SRVREQ-006-C | `createServiceRequests()` | Gagal: Terjadi kesalahan database/server | Melemparkan eksepsi `InternalServerError` untuk penanganan log | Eksepsi berhasil dilemparkan sesuai harapan | **PASS** |
| TC-UNIT-SRVREQ-007-A | `getAllServiceRequests()` | Berhasil: Mengambil laporan pekerjaan untuk service request | Mengembalikan array object beserta metadata pagination (jika ada) | Data valid berhasil dikembalikan sistem | **PASS** |
| TC-UNIT-SRVREQ-007-B | `getAllServiceRequests()` | Gagal: Data tidak ditemukan | Melemparkan eksepsi `NotFoundError` secara spesifik | Eksepsi berhasil dilemparkan sesuai harapan | **PASS** |
| TC-UNIT-SRVREQ-007-C | `getAllServiceRequests()` | Gagal: Terjadi kesalahan database/server | Melemparkan eksepsi `InternalServerError` untuk penanganan log | Eksepsi berhasil dilemparkan sesuai harapan | **PASS** |
| TC-UNIT-SRVREQ-008-A | `createServiceRequests()` | Berhasil: Mengirimkan review untuk service request | Mengembalikan object record baru yang telah berhasil di-persist ke database | Data valid berhasil dikembalikan sistem | **PASS** |
| TC-UNIT-SRVREQ-008-B | `createServiceRequests()` | Gagal: Validasi input salah | Melemparkan eksepsi `ValidationError` dengan detail error field | Eksepsi berhasil dilemparkan sesuai harapan | **PASS** |
| TC-UNIT-SRVREQ-008-C | `createServiceRequests()` | Gagal: Terjadi kesalahan database/server | Melemparkan eksepsi `InternalServerError` untuk penanganan log | Eksepsi berhasil dilemparkan sesuai harapan | **PASS** |

Pelaksanaan terhadap seluruh skenario pengujian unit diselesaikan sesuai dengan rancangan awal. Status keberhasilan untuk setiap fungsi dicatat secara terperinci ke dalam laporan hasil uji. Segala bentuk kegagalan atau ketidaksesuaian ditelusuri untuk perbaikan lebih lanjut oleh tim pengembang. Kestabilan komponen internal dipastikan telah dievaluasi secara menyeluruh melalui dokumentasi hasil pengujian ini.
