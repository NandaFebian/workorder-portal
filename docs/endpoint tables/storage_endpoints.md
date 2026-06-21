# Storage Endpoints

Perancangan antarmuka pemrograman aplikasi (API) pada modul *storage* disajikan dalam bentuk daftar *endpoint*. Rincian *endpoint* tersebut dapat dilihat pada tabel berikut.

| No | Endpoint | Method | Deskripsi | Autentikasi | Role Required |
|---|---|---|---|---|---|
| 1 | `/files` | POST | Mengunggah berkas gambar ke sistem penyimpanan cloud MinIO | Tidak | - |

Penanganan penyimpanan berkas gambar ke peladen MinIO difasilitasi melalui daftar endpoint modul storage berdasarkan tabel di atas. Mekanisme validasi keamanan sistem untuk mencegah unggahan berkas berbahaya ditunjukkan oleh kolom Deskripsi yang membatasi tipe konten hanya berupa gambar dengan transmisi multipart/form-data. Perlindungan infrastruktur penyimpanan dari penyalahgunaan bandwidth dijamin melalui pembatasan ukuran maksimal 5 megabita pada tingkat peladen, sehingga risiko serangan unggahan berkas berbahaya dapat diminimalkan.
