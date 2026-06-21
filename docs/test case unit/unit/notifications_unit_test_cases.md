# Skenario Pengujian Unit Test Modul Notifications

Pengujian level unit direncanakan untuk memverifikasi kebenaran logika internal pada modul ini secara terisolasi. Fungsi-fungsi pada lapisan service dan controller ditargetkan untuk dieksekusi menggunakan mock data agar tidak bergantung pada komponen eksternal. Kesesuaian output terhadap berbagai skenario input diharapkan untuk divalidasi berdasarkan spesifikasi kebutuhan fungsional sistem. Batasan hak akses serta penanganan kesalahan diwajibkan untuk diuji secara ketat melalui perancangan skenario ini.

### Tabel Skenario Pengujian Modul

| ID Test | Nama Fungsi / Method | Skenario Pengujian | Input/Kondisi (Mock) | Hasil yang Diharapkan |
|---|---|---|---|---|
| TC-UNIT-NOTIF-001-A | `createNotifications()` | Berhasil: Mendaftarkan FCM token untuk push notification | Data / ID valid | Mengembalikan array object beserta metadata pagination (jika ada) |
| TC-UNIT-NOTIF-001-B | `createNotifications()` | Gagal: Validasi input salah | Data payload tidak lengkap/salah format | Melemparkan eksepsi `ValidationError` dengan detail error field |
| TC-UNIT-NOTIF-001-C | `createNotifications()` | Gagal: Terjadi kesalahan database/server | Mock service melempar error | Melemparkan eksepsi `InternalServerError` untuk penanganan log |
| TC-UNIT-NOTIF-002-A | `deleteNotifications()` | Berhasil: Menghapus FCM token | Data / ID valid | Mengembalikan status konfirmasi penghapusan data dari sistem |
| TC-UNIT-NOTIF-002-B | `deleteNotifications()` | Gagal: Data tidak ditemukan | ID tidak ada di DB | Melemparkan eksepsi `NotFoundError` secara spesifik |
| TC-UNIT-NOTIF-002-C | `deleteNotifications()` | Gagal: Terjadi kesalahan database/server | Mock service melempar error | Melemparkan eksepsi `InternalServerError` untuk penanganan log |
| TC-UNIT-NOTIF-003-A | `getAllNotifications()` | Berhasil: Mengambil daftar notifikasi pengguna | Data / ID valid | Mengembalikan array object beserta metadata pagination (jika ada) |
| TC-UNIT-NOTIF-003-C | `getAllNotifications()` | Gagal: Terjadi kesalahan database/server | Mock service melempar error | Melemparkan eksepsi `InternalServerError` untuk penanganan log |

Verifikasi terhadap kemampuan sistem diharapkan dapat dicapai melalui serangkaian skenario pengujian di atas. Seluruh modul dipastikan harus mencakup penanganan logika bisnis pada tiap fungsi secara mendalam. Respons sistem untuk skenario sukses maupun penanganan kesalahan dituntut untuk didefinisikan secara komprehensif. Kualitas perangkat lunak diyakini akan ditingkatkan melalui penerapan pengujian unit yang terstruktur ini.
