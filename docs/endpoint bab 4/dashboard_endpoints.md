# Deskripsi Endpoint Modul Dashboard

Berikut disajikan tabel rincian teknis dari masing-masing *endpoint* yang terdapat pada modul *dashboard*.

### 1. Mengambil Statistik Permintaan Layanan

Pengambilan data ringkasan eksekutif dan status grafik permintaan layanan dilakukan untuk menyajikan perkembangan data klien ke pihak perusahaan. Permintaan data dilindungi menggunakan otorisasi token pengguna internal yang masuk sistem.

| Keterangan | Detail |
|---|---|
| Endpoint | GET `/dashboard/service-request` |
| Autentikasi | Diperlukan (JWT Token) |
| Role | Semua role terautentikasi |
| Path Parameter | N/A |
| Request Body | N/A |
| Headers | Authorization: Bearer {token} |
| Status Code | 200 |
| Response | <pre>{<br>&nbsp;&nbsp;"totalRequests":&nbsp;150,<br>&nbsp;&nbsp;"approvedRequests":&nbsp;100,<br>&nbsp;&nbsp;"rejectedRequests":&nbsp;20,<br>&nbsp;&nbsp;"pendingRequests":&nbsp;30<br>}</pre> |

Data statistik dihitung secara *real-time* oleh peladen berdasarkan status dokumen permintaan layanan di database. Ringkasan jumlah data dikelompokkan dan dikirimkan kembali untuk dimuat ke dalam komponen grafik antarmuka.

---

### 2. Mengambil Statistik Perintah Kerja

Pengawasan perkembangan pelaksanaan seluruh perintah kerja lapangan dilakukan melalui pemanggilan metrik statistik pengerjaan. Akses data dilindungi oleh verifikasi tanda pengenal otorisasi JWT untuk menghindari akses ilegal.

| Keterangan | Detail |
|---|---|
| Endpoint | GET `/dashboard/work-order` |
| Autentikasi | Diperlukan (JWT Token) |
| Role | Semua role terautentikasi |
| Path Parameter | N/A |
| Request Body | N/A |
| Headers | Authorization: Bearer {token} |
| Status Code | 200 |
| Response | <pre>{<br>&nbsp;&nbsp;"totalWorkOrders":&nbsp;80,<br>&nbsp;&nbsp;"completed":&nbsp;50,<br>&nbsp;&nbsp;"inProgress":&nbsp;20,<br>&nbsp;&nbsp;"failed":&nbsp;10<br>}</pre> |

Statistik progres perintah kerja dikembalikan dalam pembagian status pengerjaan aktif, selesai, maupun gagal. Data tersebut digunakan oleh manajer operasional untuk menganalisis produktivitas pengerjaan tugas lapangan.

---

### 3. Mengambil Statistik Kinerja Perusahaan

Pemantauan efisiensi operasional organisasi secara makro dilakukan dengan memanggil data rangkuman profil internal perusahaan. Token otorisasi JWT diperiksa guna membatasi pembacaan data performa sensitif ini.

| Keterangan | Detail |
|---|---|
| Endpoint | GET `/dashboard/company` |
| Autentikasi | Diperlukan (JWT Token) |
| Role | Semua role terautentikasi |
| Path Parameter | N/A |
| Request Body | N/A |
| Headers | Authorization: Bearer {token} |
| Status Code | 200 |
| Response | <pre>{<br>&nbsp;&nbsp;"totalEmployees":&nbsp;15,<br>&nbsp;&nbsp;"totalServicesOffered":&nbsp;5,<br>&nbsp;&nbsp;"activeContracts":&nbsp;8<br>}</pre> |

Data kepegawaian aktif serta jumlah total jenis katalog penawaran pekerjaan disajikan dalam bentuk angka ringkasan. Respon ini membantu pengelola perusahaan dalam meninjau pertumbuhan sumber daya manusia organisasi.

