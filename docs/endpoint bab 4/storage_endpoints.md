# Deskripsi Endpoint Modul Storage

Berikut disajikan tabel rincian teknis dari masing-masing *endpoint* yang terdapat pada modul *storage*.

### 1. Mengunggah Berkas Gambar

Pengiriman berkas dokumen biner bertipe gambar diproses untuk disimpan ke dalam media penyimpanan eksternal. Pemanggilan *endpoint* ini tidak mewajibkan penggunaan token otorisasi namun dibatasi oleh filter berkas masukan yang ketat.

| Keterangan | Detail |
|---|---|
| Endpoint | POST `/files` |
| Autentikasi | Tidak Diperlukan |
| Role | Umum |
| Path Parameter | N/A |
| Request Body | N/A |
| Headers | Content-Type: multipart/form-data |
| Status Code | 200 |
| Response | <pre>{<br>&nbsp;&nbsp;"success":&nbsp;true,<br>&nbsp;&nbsp;"message":&nbsp;"File&nbsp;gambar&nbsp;berhasil&nbsp;diunggah",<br>&nbsp;&nbsp;"data":&nbsp;{<br>&nbsp;&nbsp;&nbsp;&nbsp;"url":&nbsp;"http://localhost:9000/workorder/images/filename.jpg"<br>&nbsp;&nbsp;}<br>}</pre> |

Pengiriman berkas dokumen biner bertipe gambar difasilitasi melalui endpoint pada tabel di atas ke media penyimpanan eksternal MinIO. Autentikasi tidak diperlukan untuk pemanggilan endpoint ini, sehingga pengguna umum dapat mengunggah gambar tanpa hambatan otorisasi. URL lengkap lokasi berkas yang tersimpan dikembalikan guna memfasilitasi rendering eksternal oleh aplikasi pengguna.

