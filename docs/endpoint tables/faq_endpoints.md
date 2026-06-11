# FAQ Endpoints

Perancangan antarmuka pemrograman aplikasi (API) pada modul *faq* disajikan dalam bentuk daftar *endpoint*. Rincian *endpoint* tersebut dapat dilihat pada tabel berikut.

| No | Endpoint | Method | Deskripsi | Autentikasi | Role Required |
|---|---|---|---|---|---|
| 1 | `/faq/toggle-active` | PUT | Mengaktifkan atau menonaktifkan fitur FAQ chatbot pada perusahaan | Ya | Company Owner |
| 2 | `/faq/text-docs` | POST | Mengunggah dokumen pengetahuan berbasis teks untuk basis data FAQ | Ya | Company Owner |
| 3 | `/faq/pdf-docs` | POST | Mengunggah dokumen pengetahuan berbasis berkas PDF (multipart/form-data) | Ya | Company Owner |
| 4 | `/faq/docs` | GET | Mengambil seluruh daftar dokumen pengetahuan perusahaan | Ya | Company Owner |
| 5 | `/faq/docs/:docsId` | DELETE | Menghapus dokumen pengetahuan berdasarkan ID eksternal penyedia FAQ | Ya | Company Owner |
| 6 | `/faq/ask` | POST | Mengajukan pertanyaan ke chatbot FAQ perusahaan | Ya | Authenticated User |
| 7 | `/faq/:companyId/history` | GET | Mengambil riwayat percakapan chatbot pengguna pada perusahaan tertentu | Ya | Authenticated User |

Modul *faq* diimplementasikan untuk menyediakan fitur bantuan mandiri (*self-service*) berbasis kecerdasan buatan (*AI chatbot*) bagi klien. Basis pengetahuan dikelola oleh pemilik perusahaan (*owner*) melalui unggahan dokumen teks maupun berkas PDF secara berkala. Seluruh data pengetahuan yang diunggah akan disinkronkan ke penyedia layanan FAQ eksternal. Sisi klien dapat melakukan interaksi tanya jawab secara langsung serta melihat kembali riwayat percakapan yang pernah dilakukan. Hak akses pengelolaan dokumen dibatasi secara ketat hanya untuk tingkat pemilik guna menghindari penyalahgunaan informasi.
