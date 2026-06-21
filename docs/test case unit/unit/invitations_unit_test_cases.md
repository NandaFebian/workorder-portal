# Skenario Pengujian Unit Test Modul Invitations

Pengujian level unit direncanakan untuk memverifikasi kebenaran logika internal pada modul ini secara terisolasi. Fungsi-fungsi pada lapisan service dan controller ditargetkan untuk dieksekusi menggunakan mock data agar tidak bergantung pada komponen eksternal. Kesesuaian output terhadap berbagai skenario input diharapkan untuk divalidasi berdasarkan spesifikasi kebutuhan fungsional sistem. Batasan hak akses serta penanganan kesalahan diwajibkan untuk diuji secara ketat melalui perancangan skenario ini.

### Tabel Skenario Pengujian Modul

| ID Test | Nama Fungsi / Method | Skenario Pengujian | Input/Kondisi (Mock) | Hasil yang Diharapkan |
|---|---|---|---|---|
| TC-UNIT-INVIT-001-A | `getAllInvitations()` | Berhasil: Mengambil undangan pending untuk staff | Data / ID valid | Mengembalikan array object beserta metadata pagination (jika ada) |
| TC-UNIT-INVIT-001-C | `getAllInvitations()` | Gagal: Terjadi kesalahan database/server | Mock service melempar error | Melemparkan eksepsi `InternalServerError` untuk penanganan log |
| TC-UNIT-INVIT-002-A | `updateInvitations()` | Berhasil: Menerima undangan bergabung | Data / ID valid | Mengembalikan object record terbaru pasca modifikasi database |
| TC-UNIT-INVIT-002-B | `updateInvitations()` | Gagal: Data tidak ditemukan | ID tidak ada di DB | Melemparkan eksepsi `NotFoundError` secara spesifik |
| TC-UNIT-INVIT-002-C | `updateInvitations()` | Gagal: Terjadi kesalahan database/server | Mock service melempar error | Melemparkan eksepsi `InternalServerError` untuk penanganan log |
| TC-UNIT-INVIT-003-A | `updateInvitations()` | Berhasil: Menolak undangan bergabung | Data / ID valid | Mengembalikan object record terbaru pasca modifikasi database |
| TC-UNIT-INVIT-003-B | `updateInvitations()` | Gagal: Data tidak ditemukan | ID tidak ada di DB | Melemparkan eksepsi `NotFoundError` secara spesifik |
| TC-UNIT-INVIT-003-C | `updateInvitations()` | Gagal: Terjadi kesalahan database/server | Mock service melempar error | Melemparkan eksepsi `InternalServerError` untuk penanganan log |
| TC-UNIT-INVIT-004-A | `deleteInvitations()` | Berhasil: Menghapus atau membatalkan undangan | Data / ID valid | Mengembalikan status konfirmasi penghapusan data dari sistem |
| TC-UNIT-INVIT-004-B | `deleteInvitations()` | Gagal: Data tidak ditemukan | ID tidak ada di DB | Melemparkan eksepsi `NotFoundError` secara spesifik |
| TC-UNIT-INVIT-004-C | `deleteInvitations()` | Gagal: Terjadi kesalahan database/server | Mock service melempar error | Melemparkan eksepsi `InternalServerError` untuk penanganan log |

Verifikasi terhadap kemampuan sistem diharapkan dapat dicapai melalui serangkaian skenario pengujian di atas. Seluruh modul dipastikan harus mencakup penanganan logika bisnis pada tiap fungsi secara mendalam. Respons sistem untuk skenario sukses maupun penanganan kesalahan dituntut untuk didefinisikan secara komprehensif. Kualitas perangkat lunak diyakini akan ditingkatkan melalui penerapan pengujian unit yang terstruktur ini.
