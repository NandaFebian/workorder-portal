# Skenario Pengujian Unit Test Modul Work Orders

Pengujian level unit direncanakan untuk memverifikasi kebenaran logika internal pada modul ini secara terisolasi. Fungsi-fungsi pada lapisan service dan controller ditargetkan untuk dieksekusi menggunakan mock data agar tidak bergantung pada komponen eksternal. Kesesuaian output terhadap berbagai skenario input diharapkan untuk divalidasi berdasarkan spesifikasi kebutuhan fungsional sistem. Batasan hak akses serta penanganan kesalahan diwajibkan untuk diuji secara ketat melalui perancangan skenario ini.

### Tabel Skenario Pengujian Modul

| ID Test | Nama Fungsi / Method | Skenario Pengujian | Input/Kondisi (Mock) | Hasil yang Diharapkan |
|---|---|---|---|---|
| TC-UNIT-WKORD-001-A | `getAllWorkorders()` | Berhasil: Mengambil semua work order | Data / ID valid | Mengembalikan array object beserta metadata pagination (jika ada) |
| TC-UNIT-WKORD-001-C | `getAllWorkorders()` | Gagal: Terjadi kesalahan database/server | Mock service melempar error | Melemparkan eksepsi `InternalServerError` untuk penanganan log |
| TC-UNIT-WKORD-002-A | `getWorkordersById()` | Berhasil: Mengambil detail work order berdasarkan ID | Data / ID valid | Mengembalikan object tunggal entitas dengan data lengkap |
| TC-UNIT-WKORD-002-B | `getWorkordersById()` | Gagal: Data tidak ditemukan | ID tidak ada di DB | Melemparkan eksepsi `NotFoundError` secara spesifik |
| TC-UNIT-WKORD-002-C | `getWorkordersById()` | Gagal: Terjadi kesalahan database/server | Mock service melempar error | Melemparkan eksepsi `InternalServerError` untuk penanganan log |
| TC-UNIT-WKORD-003-A | `createWorkorders()` | Berhasil: Membuat ulang work order yang ditolak | Data / ID valid | Mengembalikan object record baru yang telah berhasil di-persist ke database |
| TC-UNIT-WKORD-003-B | `createWorkorders()` | Gagal: Validasi input salah | Data payload tidak lengkap/salah format | Melemparkan eksepsi `ValidationError` dengan detail error field |
| TC-UNIT-WKORD-003-C | `createWorkorders()` | Gagal: Terjadi kesalahan database/server | Mock service melempar error | Melemparkan eksepsi `InternalServerError` untuk penanganan log |
| TC-UNIT-WKORD-004-A | `updateWorkorders()` | Berhasil: Mengirimkan data form work order | Data / ID valid | Mengembalikan object record terbaru pasca modifikasi database |
| TC-UNIT-WKORD-004-B | `updateWorkorders()` | Gagal: Data tidak ditemukan | ID tidak ada di DB | Melemparkan eksepsi `NotFoundError` secara spesifik |
| TC-UNIT-WKORD-004-C | `updateWorkorders()` | Gagal: Terjadi kesalahan database/server | Mock service melempar error | Melemparkan eksepsi `InternalServerError` untuk penanganan log |
| TC-UNIT-WKORD-005-A | `updateWorkorders()` | Berhasil: Menugaskan staff ke work order | Data / ID valid | Mengembalikan object record terbaru pasca modifikasi database |
| TC-UNIT-WKORD-005-B | `updateWorkorders()` | Gagal: Data tidak ditemukan | ID tidak ada di DB | Melemparkan eksepsi `NotFoundError` secara spesifik |
| TC-UNIT-WKORD-005-C | `updateWorkorders()` | Gagal: Terjadi kesalahan database/server | Mock service melempar error | Melemparkan eksepsi `InternalServerError` untuk penanganan log |
| TC-UNIT-WKORD-006-A | `updateWorkorders()` | Berhasil: Menandai konfigurasi work order selesai | Data / ID valid | Mengembalikan object record terbaru pasca modifikasi database |
| TC-UNIT-WKORD-006-C | `updateWorkorders()` | Gagal: Terjadi kesalahan database/server | Mock service melempar error | Melemparkan eksepsi `InternalServerError` untuk penanganan log |
| TC-UNIT-WKORD-007-A | `updateWorkorders()` | Berhasil: Menyetujui work order | Data / ID valid | Mengembalikan object record terbaru pasca modifikasi database |
| TC-UNIT-WKORD-007-C | `updateWorkorders()` | Gagal: Terjadi kesalahan database/server | Mock service melempar error | Melemparkan eksepsi `InternalServerError` untuk penanganan log |
| TC-UNIT-WKORD-008-A | `updateWorkorders()` | Berhasil: Menolak work order | Data / ID valid | Mengembalikan object record terbaru pasca modifikasi database |
| TC-UNIT-WKORD-008-C | `updateWorkorders()` | Gagal: Terjadi kesalahan database/server | Mock service melempar error | Melemparkan eksepsi `InternalServerError` untuk penanganan log |
| TC-UNIT-WKORD-009-A | `updateWorkorders()` | Berhasil: Membatalkan work order | Data / ID valid | Mengembalikan object record terbaru pasca modifikasi database |
| TC-UNIT-WKORD-009-C | `updateWorkorders()` | Gagal: Terjadi kesalahan database/server | Mock service melempar error | Melemparkan eksepsi `InternalServerError` untuk penanganan log |
| TC-UNIT-WKORD-010-A | `updateWorkorders()` | Berhasil: Menyelesaikan work order | Data / ID valid | Mengembalikan object record terbaru pasca modifikasi database |
| TC-UNIT-WKORD-010-C | `updateWorkorders()` | Gagal: Terjadi kesalahan database/server | Mock service melempar error | Melemparkan eksepsi `InternalServerError` untuk penanganan log |
| TC-UNIT-WKORD-011-A | `updateWorkorders()` | Berhasil: Memulai work order (in progress) | Data / ID valid | Mengembalikan object record terbaru pasca modifikasi database |
| TC-UNIT-WKORD-011-C | `updateWorkorders()` | Gagal: Terjadi kesalahan database/server | Mock service melempar error | Melemparkan eksepsi `InternalServerError` untuk penanganan log |
| TC-UNIT-WKORD-012-A | `updateWorkorders()` | Berhasil: Menandai work order gagal | Data / ID valid | Melemparkan error sesuai jenis kegagalan yang disimulasikan |
| TC-UNIT-WKORD-012-C | `updateWorkorders()` | Gagal: Terjadi kesalahan database/server | Mock service melempar error | Melemparkan eksepsi `InternalServerError` untuk penanganan log |
| TC-UNIT-WKORD-013-A | `getAllWorkorders()` | Berhasil: Mengambil laporan work order | Data / ID valid | Mengembalikan array object beserta metadata pagination (jika ada) |
| TC-UNIT-WKORD-013-B | `getAllWorkorders()` | Gagal: Data tidak ditemukan | ID tidak ada di DB | Melemparkan eksepsi `NotFoundError` secara spesifik |
| TC-UNIT-WKORD-013-C | `getAllWorkorders()` | Gagal: Terjadi kesalahan database/server | Mock service melempar error | Melemparkan eksepsi `InternalServerError` untuk penanganan log |

Verifikasi terhadap kemampuan sistem diharapkan dapat dicapai melalui serangkaian skenario pengujian di atas. Seluruh modul dipastikan harus mencakup penanganan logika bisnis pada tiap fungsi secara mendalam. Respons sistem untuk skenario sukses maupun penanganan kesalahan dituntut untuk didefinisikan secara komprehensif. Kualitas perangkat lunak diyakini akan ditingkatkan melalui penerapan pengujian unit yang terstruktur ini.
