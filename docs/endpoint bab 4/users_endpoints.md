# Deskripsi Endpoint Modul Users

Berikut disajikan tabel rincian teknis dari masing-masing *endpoint* yang terdapat pada modul *users*.

### 1. Mengambil Informasi Akun Pengguna Aktif

Pengambilan informasi profil lengkap dari pengguna yang sedang masuk sistem dilakukan untuk menampilkan data pribadi pada panel antarmuka pengguna. Akses pemanggilan dilindungi oleh token otorisasi JWT aktif.

| Keterangan | Detail |
|---|---|
| Endpoint | GET `/users/me` |
| Autentikasi | Diperlukan (JWT Token) |
| Role | Semua role terautentikasi |
| Path Parameter | N/A |
| Request Body | N/A |
| Headers | Authorization: Bearer {token} |
| Status Code | 200 |
| Response | <pre>{<br>&nbsp;&nbsp;"success":&nbsp;true,<br>&nbsp;&nbsp;"code":&nbsp;200,<br>&nbsp;&nbsp;"message":&nbsp;"Profile&nbsp;retrieved&nbsp;successfully",<br>&nbsp;&nbsp;"data":&nbsp;{<br>&nbsp;&nbsp;&nbsp;&nbsp;"_id":&nbsp;"6a21c2b9a7bdad3a940c3def",<br>&nbsp;&nbsp;&nbsp;&nbsp;"name":&nbsp;"Ledang&nbsp;Owner",<br>&nbsp;&nbsp;&nbsp;&nbsp;"email":&nbsp;"ledang@owner.com",<br>&nbsp;&nbsp;&nbsp;&nbsp;"role":&nbsp;"owner_company",<br>&nbsp;&nbsp;&nbsp;&nbsp;"positionId":&nbsp;null,<br>&nbsp;&nbsp;&nbsp;&nbsp;"deletedAt":&nbsp;null,<br>&nbsp;&nbsp;&nbsp;&nbsp;"createdAt":&nbsp;"2026-06-04T18:23:53.459Z",<br>&nbsp;&nbsp;&nbsp;&nbsp;"updatedAt":&nbsp;"2026-06-09T12:42:40.310Z",<br>&nbsp;&nbsp;&nbsp;&nbsp;"__v":&nbsp;0,<br>&nbsp;&nbsp;&nbsp;&nbsp;"company":&nbsp;{<br>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;"_id":&nbsp;"6a21c2b9a7bdad3a940c3df1",<br>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;"name":&nbsp;"PT.&nbsp;Sukses&nbsp;Indonesia",<br>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;"address":&nbsp;"Jln.&nbsp;Udayana",<br>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;"description":&nbsp;"Mengalokasikan&nbsp;projek&nbsp;untuk&nbsp;Indonesia"<br>&nbsp;&nbsp;&nbsp;&nbsp;}<br>&nbsp;&nbsp;}<br>}</pre> |

Objek berisi data diri lengkap pengguna dikirimkan oleh peladen setelah token otorisasi dinyatakan valid. Data yang dikembalikan dipastikan bersih dari parameter rahasia internal seperti kata sandi terenkripsi.

---

### 2. Memperbarui Profil Pengguna

Penyuntingan data profil mandiri pengguna seperti nama dan email diproses melalui pengiriman data pembaruan baru. Validasi token JWT diterapkan agar perubahan data profil hanya berlaku untuk akun pengirim yang sah.

| Keterangan | Detail |
|---|---|
| Endpoint | PATCH `/users/me` |
| Autentikasi | Diperlukan (JWT Token) |
| Role | Semua role terautentikasi |
| Path Parameter | N/A |
| Request Body | <pre>{<br>&nbsp;&nbsp;"name":&nbsp;"Ledang&nbsp;Owner&nbsp;Baru",<br>&nbsp;&nbsp;"email":&nbsp;"ledang@owner.com",<br>&nbsp;&nbsp;"currentPassword":&nbsp;"123",<br>&nbsp;&nbsp;"newPassword":&nbsp;"123"<br>}</pre> |
| Headers | Authorization: Bearer {token}, Content-Type: application/json |
| Status Code | 200 |
| Response | <pre>{<br>&nbsp;&nbsp;"success":&nbsp;true,<br>&nbsp;&nbsp;"code":&nbsp;200,<br>&nbsp;&nbsp;"message":&nbsp;"Profile&nbsp;retrieved&nbsp;successfully",<br>&nbsp;&nbsp;"data":&nbsp;{<br>&nbsp;&nbsp;&nbsp;&nbsp;"_id":&nbsp;"6a21c2b9a7bdad3a940c3def",<br>&nbsp;&nbsp;&nbsp;&nbsp;"name":&nbsp;"Ledang&nbsp;Owner&nbsp;Baru",<br>&nbsp;&nbsp;&nbsp;&nbsp;"email":&nbsp;"ledang@owner.com",<br>&nbsp;&nbsp;&nbsp;&nbsp;"role":&nbsp;"owner_company",<br>&nbsp;&nbsp;&nbsp;&nbsp;"positionId":&nbsp;null,<br>&nbsp;&nbsp;&nbsp;&nbsp;"deletedAt":&nbsp;null,<br>&nbsp;&nbsp;&nbsp;&nbsp;"createdAt":&nbsp;"2026-06-04T18:23:53.459Z",<br>&nbsp;&nbsp;&nbsp;&nbsp;"updatedAt":&nbsp;"2026-06-09T12:42:40.310Z",<br>&nbsp;&nbsp;&nbsp;&nbsp;"__v":&nbsp;0,<br>&nbsp;&nbsp;&nbsp;&nbsp;"company":&nbsp;{<br>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;"_id":&nbsp;"6a21c2b9a7bdad3a940c3df1",<br>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;"name":&nbsp;"PT.&nbsp;Sukses&nbsp;Indonesia",<br>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;"address":&nbsp;"Jln.&nbsp;Udayana",<br>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;"description":&nbsp;"Mengalokasikan&nbsp;projek&nbsp;untuk&nbsp;Indonesia"<br>&nbsp;&nbsp;&nbsp;&nbsp;}<br>&nbsp;&nbsp;}<br>}</pre> |

Perubahan nilai properti profil disimpan secara permanen di database peladen setelah pencocokan kata sandi lama dinyatakan valid. Konfirmasi data profil terbaru dikembalikan ke klien sebagai respon pemrosesan.

