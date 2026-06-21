# Laporan Hasil Unit Test Modul Work Orders

Hasil pengujian level unit didokumentasikan untuk memverifikasi kebenaran logika internal pada modul ini secara terisolasi. Fungsi-fungsi pada lapisan service dan controller telah dieksekusi menggunakan mock data sehingga tidak bergantung pada komponen eksternal. Kesesuaian output terhadap berbagai skenario input telah divalidasi berdasarkan spesifikasi kebutuhan fungsional sistem. Batasan hak akses serta penanganan kesalahan dipastikan telah diimplementasikan secara ketat melalui rekam jejak pengujian ini.

### Tabel Hasil Pengujian Modul

| ID Test | Nama Fungsi / Method | Skenario Pengujian | Hasil yang Diharapkan | Hasil Aktual | Status |
|---|---|---|---|---|---|
| TC-UNIT-WKORD-001-A | `getAllWorkorders()` | Berhasil: Mengambil semua work order | Mengembalikan array object beserta metadata pagination (jika ada) | Data valid berhasil dikembalikan sistem | **PASS** |
| TC-UNIT-WKORD-001-C | `getAllWorkorders()` | Gagal: Terjadi kesalahan database/server | Melemparkan eksepsi `InternalServerError` untuk penanganan log | Eksepsi berhasil dilemparkan sesuai harapan | **PASS** |
| TC-UNIT-WKORD-002-A | `getWorkordersById()` | Berhasil: Mengambil detail work order berdasarkan ID | Mengembalikan object tunggal entitas dengan data lengkap | Data valid berhasil dikembalikan sistem | **PASS** |
| TC-UNIT-WKORD-002-B | `getWorkordersById()` | Gagal: Data tidak ditemukan | Melemparkan eksepsi `NotFoundError` secara spesifik | Eksepsi berhasil dilemparkan sesuai harapan | **PASS** |
| TC-UNIT-WKORD-002-C | `getWorkordersById()` | Gagal: Terjadi kesalahan database/server | Melemparkan eksepsi `InternalServerError` untuk penanganan log | Eksepsi berhasil dilemparkan sesuai harapan | **PASS** |
| TC-UNIT-WKORD-003-A | `createWorkorders()` | Berhasil: Membuat ulang work order yang ditolak | Mengembalikan object record baru yang telah berhasil di-persist ke database | Data valid berhasil dikembalikan sistem | **PASS** |
| TC-UNIT-WKORD-003-B | `createWorkorders()` | Gagal: Validasi input salah | Melemparkan eksepsi `ValidationError` dengan detail error field | Eksepsi berhasil dilemparkan sesuai harapan | **PASS** |
| TC-UNIT-WKORD-003-C | `createWorkorders()` | Gagal: Terjadi kesalahan database/server | Melemparkan eksepsi `InternalServerError` untuk penanganan log | Eksepsi berhasil dilemparkan sesuai harapan | **PASS** |
| TC-UNIT-WKORD-004-A | `updateWorkorders()` | Berhasil: Mengirimkan data form work order | Mengembalikan object record terbaru pasca modifikasi database | Data valid berhasil dikembalikan sistem | **PASS** |
| TC-UNIT-WKORD-004-B | `updateWorkorders()` | Gagal: Data tidak ditemukan | Melemparkan eksepsi `NotFoundError` secara spesifik | Eksepsi berhasil dilemparkan sesuai harapan | **PASS** |
| TC-UNIT-WKORD-004-C | `updateWorkorders()` | Gagal: Terjadi kesalahan database/server | Melemparkan eksepsi `InternalServerError` untuk penanganan log | Eksepsi berhasil dilemparkan sesuai harapan | **PASS** |
| TC-UNIT-WKORD-005-A | `updateWorkorders()` | Berhasil: Menugaskan staff ke work order | Mengembalikan object record terbaru pasca modifikasi database | Data valid berhasil dikembalikan sistem | **PASS** |
| TC-UNIT-WKORD-005-B | `updateWorkorders()` | Gagal: Data tidak ditemukan | Melemparkan eksepsi `NotFoundError` secara spesifik | Eksepsi berhasil dilemparkan sesuai harapan | **PASS** |
| TC-UNIT-WKORD-005-C | `updateWorkorders()` | Gagal: Terjadi kesalahan database/server | Melemparkan eksepsi `InternalServerError` untuk penanganan log | Eksepsi berhasil dilemparkan sesuai harapan | **PASS** |
| TC-UNIT-WKORD-006-A | `updateWorkorders()` | Berhasil: Menandai konfigurasi work order selesai | Mengembalikan object record terbaru pasca modifikasi database | Data valid berhasil dikembalikan sistem | **PASS** |
| TC-UNIT-WKORD-006-C | `updateWorkorders()` | Gagal: Terjadi kesalahan database/server | Melemparkan eksepsi `InternalServerError` untuk penanganan log | Eksepsi berhasil dilemparkan sesuai harapan | **PASS** |
| TC-UNIT-WKORD-007-A | `updateWorkorders()` | Berhasil: Menyetujui work order | Mengembalikan object record terbaru pasca modifikasi database | Data valid berhasil dikembalikan sistem | **PASS** |
| TC-UNIT-WKORD-007-C | `updateWorkorders()` | Gagal: Terjadi kesalahan database/server | Melemparkan eksepsi `InternalServerError` untuk penanganan log | Eksepsi berhasil dilemparkan sesuai harapan | **PASS** |
| TC-UNIT-WKORD-008-A | `updateWorkorders()` | Berhasil: Menolak work order | Mengembalikan object record terbaru pasca modifikasi database | Data valid berhasil dikembalikan sistem | **PASS** |
| TC-UNIT-WKORD-008-C | `updateWorkorders()` | Gagal: Terjadi kesalahan database/server | Melemparkan eksepsi `InternalServerError` untuk penanganan log | Eksepsi berhasil dilemparkan sesuai harapan | **PASS** |
| TC-UNIT-WKORD-009-A | `updateWorkorders()` | Berhasil: Membatalkan work order | Mengembalikan object record terbaru pasca modifikasi database | Data valid berhasil dikembalikan sistem | **PASS** |
| TC-UNIT-WKORD-009-C | `updateWorkorders()` | Gagal: Terjadi kesalahan database/server | Melemparkan eksepsi `InternalServerError` untuk penanganan log | Eksepsi berhasil dilemparkan sesuai harapan | **PASS** |
| TC-UNIT-WKORD-010-A | `updateWorkorders()` | Berhasil: Menyelesaikan work order | Mengembalikan object record terbaru pasca modifikasi database | Data valid berhasil dikembalikan sistem | **PASS** |
| TC-UNIT-WKORD-010-C | `updateWorkorders()` | Gagal: Terjadi kesalahan database/server | Melemparkan eksepsi `InternalServerError` untuk penanganan log | Eksepsi berhasil dilemparkan sesuai harapan | **PASS** |
| TC-UNIT-WKORD-011-A | `updateWorkorders()` | Berhasil: Memulai work order (in progress) | Mengembalikan object record terbaru pasca modifikasi database | Data valid berhasil dikembalikan sistem | **PASS** |
| TC-UNIT-WKORD-011-C | `updateWorkorders()` | Gagal: Terjadi kesalahan database/server | Melemparkan eksepsi `InternalServerError` untuk penanganan log | Eksepsi berhasil dilemparkan sesuai harapan | **PASS** |
| TC-UNIT-WKORD-012-A | `updateWorkorders()` | Berhasil: Menandai work order gagal | Melemparkan error sesuai jenis kegagalan yang disimulasikan | Eksepsi berhasil dilemparkan sesuai harapan | **PASS** |
| TC-UNIT-WKORD-012-C | `updateWorkorders()` | Gagal: Terjadi kesalahan database/server | Melemparkan eksepsi `InternalServerError` untuk penanganan log | Eksepsi berhasil dilemparkan sesuai harapan | **PASS** |
| TC-UNIT-WKORD-013-A | `getAllWorkorders()` | Berhasil: Mengambil laporan work order | Mengembalikan array object beserta metadata pagination (jika ada) | Data valid berhasil dikembalikan sistem | **PASS** |
| TC-UNIT-WKORD-013-B | `getAllWorkorders()` | Gagal: Data tidak ditemukan | Melemparkan eksepsi `NotFoundError` secara spesifik | Eksepsi berhasil dilemparkan sesuai harapan | **PASS** |
| TC-UNIT-WKORD-013-C | `getAllWorkorders()` | Gagal: Terjadi kesalahan database/server | Melemparkan eksepsi `InternalServerError` untuk penanganan log | Eksepsi berhasil dilemparkan sesuai harapan | **PASS** |

Pelaksanaan terhadap seluruh skenario pengujian unit diselesaikan sesuai dengan rancangan awal. Status keberhasilan untuk setiap fungsi dicatat secara terperinci ke dalam laporan hasil uji. Segala bentuk kegagalan atau ketidaksesuaian ditelusuri untuk perbaikan lebih lanjut oleh tim pengembang. Kestabilan komponen internal dipastikan telah dievaluasi secara menyeluruh melalui dokumentasi hasil pengujian ini.
