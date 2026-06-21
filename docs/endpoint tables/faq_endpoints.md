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

Penyediaan fitur bantuan mandiri berbasis kecerdasan buatan bagi klien perusahaan difasilitasi melalui daftar endpoint modul faq berdasarkan tabel di atas. Mekanisme pengelolaan basis pengetahuan sistem untuk menjaga kualitas sumber data FAQ ditunjukkan oleh kolom Deskripsi yang membedakan unggahan dokumen teks dengan berkas PDF ke penyedia eksternal. Interaksi tanya jawab yang efektif antara klien dengan AI chatbot dijamin melalui pemisahan endpoint pengelolaan dokumen (terbatas untuk Company Owner) dengan endpoint konsultasi (dapat diakses oleh Authenticated User), sehingga beban administrasi layanan pelanggan dapat dikurangi.
