# Storage Endpoints

Perancangan antarmuka pemrograman aplikasi (API) pada modul *storage* disajikan dalam bentuk daftar *endpoint*. Rincian *endpoint* tersebut dapat dilihat pada tabel berikut.

| No | Endpoint | Method | Deskripsi | Autentikasi | Role Required |
|---|---|---|---|---|---|
| 1 | `/files` | POST | Mengunggah berkas gambar ke sistem penyimpanan cloud MinIO | Tidak | - |

Modul *storage* diimplementasikan untuk menangani penyimpanan berkas eksternal seperti gambar ke peladen penyimpanan pihak ketiga (*MinIO storage*). Pengunggahan berkas dilakukan melalui transmisi data *multipart/form-data* dan divalidasi dengan ketat pada tingkat peladen. Sistem membatasi ukuran maksimal gambar sebesar 5 megabita serta memastikan format tipe berkas hanya berupa gambar demi keamanan sistem penyimpanan.
