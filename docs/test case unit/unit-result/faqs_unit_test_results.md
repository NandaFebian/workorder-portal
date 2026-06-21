# Laporan Hasil Unit Test Modul FAQs

Hasil pengujian level unit didokumentasikan untuk memverifikasi kebenaran logika internal pada modul ini secara terisolasi. Fungsi-fungsi pada lapisan service dan controller telah dieksekusi menggunakan mock data sehingga tidak bergantung pada komponen eksternal. Kesesuaian output terhadap berbagai skenario input telah divalidasi berdasarkan spesifikasi kebutuhan fungsional sistem. Batasan hak akses serta penanganan kesalahan dipastikan telah diimplementasikan secara ketat melalui rekam jejak pengujian ini.

### Tabel Hasil Pengujian Modul

| ID Test | Nama Fungsi / Method | Skenario Pengujian | Hasil yang Diharapkan | Hasil Aktual | Status |
|---|---|---|---|---|---|
| TC-UNIT-FAQSS-001-A | `updateFaq()` | Berhasil: Mengaktifkan atau menonaktifkan FAQ perusahaan | Mengembalikan object record terbaru pasca modifikasi database | Data valid berhasil dikembalikan sistem | **PASS** |
| TC-UNIT-FAQSS-001-B | `updateFaq()` | Gagal: Data tidak ditemukan | Melemparkan eksepsi `NotFoundError` secara spesifik | Eksepsi berhasil dilemparkan sesuai harapan | **PASS** |
| TC-UNIT-FAQSS-001-C | `updateFaq()` | Gagal: Terjadi kesalahan database/server | Melemparkan eksepsi `InternalServerError` untuk penanganan log | Eksepsi berhasil dilemparkan sesuai harapan | **PASS** |
| TC-UNIT-FAQSS-002-A | `getAllFaq()` | Berhasil: Mengambil semua dokumen FAQ | Mengembalikan array object beserta metadata pagination (jika ada) | Data valid berhasil dikembalikan sistem | **PASS** |
| TC-UNIT-FAQSS-002-C | `getAllFaq()` | Gagal: Terjadi kesalahan database/server | Melemparkan eksepsi `InternalServerError` untuk penanganan log | Eksepsi berhasil dilemparkan sesuai harapan | **PASS** |
| TC-UNIT-FAQSS-003-A | `createFaq()` | Berhasil: Mengunggah FAQ sebagai teks | Mengembalikan object record baru yang telah berhasil di-persist ke database | Data valid berhasil dikembalikan sistem | **PASS** |
| TC-UNIT-FAQSS-003-B | `createFaq()` | Gagal: Validasi input salah | Melemparkan eksepsi `ValidationError` dengan detail error field | Eksepsi berhasil dilemparkan sesuai harapan | **PASS** |
| TC-UNIT-FAQSS-003-C | `createFaq()` | Gagal: Terjadi kesalahan database/server | Melemparkan eksepsi `InternalServerError` untuk penanganan log | Eksepsi berhasil dilemparkan sesuai harapan | **PASS** |
| TC-UNIT-FAQSS-004-A | `createFaq()` | Berhasil: Mengunggah FAQ sebagai PDF (multipart) | Mengembalikan array/object hasil ekstraksi file upload | Data valid berhasil dikembalikan sistem | **PASS** |
| TC-UNIT-FAQSS-004-B | `createFaq()` | Gagal: Validasi input salah | Melemparkan eksepsi `ValidationError` dengan detail error field | Eksepsi berhasil dilemparkan sesuai harapan | **PASS** |
| TC-UNIT-FAQSS-004-C | `createFaq()` | Gagal: Terjadi kesalahan database/server | Melemparkan eksepsi `InternalServerError` untuk penanganan log | Eksepsi berhasil dilemparkan sesuai harapan | **PASS** |
| TC-UNIT-FAQSS-005-A | `deleteFaq()` | Berhasil: Menghapus dokumen FAQ | Mengembalikan status konfirmasi penghapusan data dari sistem | Data valid berhasil dikembalikan sistem | **PASS** |
| TC-UNIT-FAQSS-005-B | `deleteFaq()` | Gagal: Data tidak ditemukan | Melemparkan eksepsi `NotFoundError` secara spesifik | Eksepsi berhasil dilemparkan sesuai harapan | **PASS** |
| TC-UNIT-FAQSS-005-C | `deleteFaq()` | Gagal: Terjadi kesalahan database/server | Melemparkan eksepsi `InternalServerError` untuk penanganan log | Eksepsi berhasil dilemparkan sesuai harapan | **PASS** |
| TC-UNIT-FAQSS-006-A | `createFaq()` | Berhasil: Mengajukan pertanyaan ke AI chatbot | Mengembalikan object record baru yang telah berhasil di-persist ke database | Data valid berhasil dikembalikan sistem | **PASS** |
| TC-UNIT-FAQSS-006-B | `createFaq()` | Gagal: Validasi input salah | Melemparkan eksepsi `ValidationError` dengan detail error field | Eksepsi berhasil dilemparkan sesuai harapan | **PASS** |
| TC-UNIT-FAQSS-006-C | `createFaq()` | Gagal: Terjadi kesalahan database/server | Melemparkan eksepsi `InternalServerError` untuk penanganan log | Eksepsi berhasil dilemparkan sesuai harapan | **PASS** |

Pelaksanaan terhadap seluruh skenario pengujian unit diselesaikan sesuai dengan rancangan awal. Status keberhasilan untuk setiap fungsi dicatat secara terperinci ke dalam laporan hasil uji. Segala bentuk kegagalan atau ketidaksesuaian ditelusuri untuk perbaikan lebih lanjut oleh tim pengembang. Kestabilan komponen internal dipastikan telah dievaluasi secara menyeluruh melalui dokumentasi hasil pengujian ini.
