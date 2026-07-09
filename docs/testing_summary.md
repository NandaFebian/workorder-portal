# Ringkasan Pengujian: Unit Testing & Stress Testing

---

## 1. Unit Testing

### 1.1 Apa Itu Unit Testing?

Unit testing adalah pengujian yang menguji **satu fungsi spesifik** secara terisolasi. Dependensi luar (seperti database dan layanan pihak ketiga) digantikan oleh objek tiruan (*mock*), sehingga pengujian fokus hanya pada logika internal fungsi tersebut.

### 1.2 Ringkasan

| Aspek | Detail |
|---|---|
| Framework | Jest |
| Jumlah file test | **8 file** |
| Jumlah modul yang diuji | **8 modul** |
| Total test case | **116 test case** |

### 1.3 Rincian Test Case per Modul

| No | File Test | Modul / Service | ID Test | Jumlah TC |
|---|---|---|---|---|
| 1 | `auth.service.spec.ts` | AuthService | UT-AUTH-001 s/d 009 | 9 |
| 2 | `fcm.service.spec.ts` | FcmService (Notifikasi) | UT-NOTIF-001 s/d 016 | 16 |
| 3 | `form-validation.helper.spec.ts` | FormValidationHelper | UT-FORM-001 s/d 010 | 10 |
| 4 | `invitations.service.spec.ts` | InvitationsService | UT-INV-001 s/d 008 | 8 |
| 5 | `membership.service.spec.ts` | MembershipService | UT-MBRSH-001 s/d 011 | 11 |
| 6 | `service-request.service.spec.ts` | ServiceRequestService | UT-SR-001 s/d 018 | 18 |
| 7 | `service.service.spec.ts` | ServicesInternalService | UT-SVC-001 s/d 015 | 15 |
| 8 | `work-order.service.spec.ts` | WorkOrderService | UT-WO-001 s/d 029 | 29 |
| | | | **Total** | **116** |

### 1.4 Apa Saja yang Diuji?

#### AuthService (9 TC) — Proses login, registrasi, dan registrasi perusahaan
- Login dengan kredensial valid → mengembalikan profil dan token
- Login dengan password salah atau email tidak terdaftar → ditolak
- Registrasi user baru → data tersimpan, password tidak ikut di response
- Registrasi dengan email yang sudah ada → ditolak
- Registrasi perusahaan baru → User dan Company saling terelasi

#### FcmService (16 TC) — Pengiriman push notification via Firebase
- Mengirim notifikasi ke user → masuk antrean BullMQ
- Fallback pengiriman langsung jika antrean gagal (Redis down)
- Mendaftarkan dan menghapus token perangkat (FCM token)
- Menandai notifikasi sudah dibaca (per ID, per resource, per tipe)
- Mengambil inbox notifikasi user
- Pengiriman ke perangkat jika Firebase belum/sudah diinisialisasi
- Multicast ke banyak perangkat, termasuk pembersihan token yang gagal

#### FormValidationHelper (10 TC) — Validasi field formulir dinamis
- Field number: validasi rentang min-max, penolakan nilai non-angka
- Field single\_select: validasi key terhadap opsi yang tersedia
- Field multi\_select: validasi array key, penolakan jika bukan array
- Field wajib (*required*): penolakan jika tidak diisi

#### InvitationsService (8 TC) — Kelola undangan bergabung perusahaan
- Menerima undangan valid → user bergabung ke perusahaan
- Menolak undangan yang sudah diterima atau tidak ditemukan
- Menolak undangan pending → status berubah ke `rejected`
- Mengambil daftar undangan pending milik user
- Menghapus undangan (valid dan tidak ditemukan)

#### MembershipService (11 TC) — Kelola kode keanggotaan pelanggan
- Upload CSV kode membership → data tersimpan
- Upload file bukan CSV, kolom salah, atau kosong → ditolak
- Klaim kode valid → pelanggan terhubung ke perusahaan
- Klaim kode yang sudah diklaim atau tidak ditemukan → ditolak
- Mengambil dan menghapus daftar kode membership

#### ServiceRequestService (18 TC) — Alur permintaan layanan
- Submit intake lengkap → service request baru terbuat
- Submit ke layanan tidak aktif atau tidak ditemukan → ditolak
- Approve request → status berubah ke APPROVED
- Approve yang sudah approved/rejected → ditolak (konflik status)
- Reject request → status berubah ke REJECTED
- Assign staff PIC ke request, termasuk validasi staff
- Cancel request pending → status CANCELLED
- Cancel yang sudah approved → ditolak
- Mengambil inbox (admin) dan riwayat terkirim (client)
- Detail dan hapus service request

#### ServicesInternalService (15 TC) — Kelola layanan perusahaan
- Update layanan → membuat versi baru (bukan menimpa)
- Nomor versi bertambah, serviceKey dan companyId tetap konsisten
- Layanan tidak ditemukan atau user dari perusahaan berbeda → ditolak
- Mengambil seluruh layanan milik perusahaan
- Detail layanan berdasarkan versi
- Toggle aktif/nonaktif → seluruh versi diperbarui
- Hapus layanan → soft-delete seluruh versi

#### WorkOrderService (29 TC) — Alur work order dan transisi status
- Membuat work order baru → status awal DRAFTED
- Menugaskan staff (assign), termasuk validasi batas min/max staff
- Memulai work order (start) → dari APPROVED ke ON\_PROGRESS
- Menyelesaikan (complete) → dari ON\_PROGRESS ke COMPLETED
- Menandai gagal (fail) → dari ON\_PROGRESS ke FAILED
- Membatalkan (cancel) → dari DRAFTED ke CANCELLED
- Transisi status yang tidak valid (misal: start dari COMPLETED) → ditolak
- Update data, kirim (markAsSent), dan auto-complete setelah laporan disetujui
- CRUD: findAll, findOne, remove
- Auto-assign staff berdasarkan posisi saat mode `auto`
- Validasi ketersediaan staff per posisi sebelum auto-assign

### 1.5 Mengapa Unit Test Dilakukan pada Modul-Modul Ini?

Kedelapan modul yang diuji merupakan **modul dengan logika bisnis paling kompleks** dalam sistem. Pemilihan ini didasarkan pada alasan berikut:

**1. Modul-modul ini memiliki banyak langkah yang saling bergantung**

Contohnya, `WorkOrderService` memiliki alur transisi status: DRAFTED → APPROVED → ON\_PROGRESS → COMPLETED/FAILED/CANCELLED. Setiap transisi memiliki syarat yang harus dipenuhi (misalnya: tidak bisa langsung dari DRAFTED ke COMPLETED). Alur seperti ini memiliki banyak kemungkinan kegagalan yang harus diuji satu per satu.

**2. Modul-modul ini memiliki banyak cabang keputusan**

`ServiceRequestService` bisa gagal karena berbagai alasan: layanan tidak aktif, status sudah berubah, field wajib kosong, user bukan pemilik. Masing-masing harus menghasilkan respons error yang berbeda. Semakin banyak cabang keputusan, semakin penting pengujian unit untuk memastikan setiap jalur berjalan benar.

**3. Modul-modul ini mengubah banyak data sekaligus**

`InvitationsService.acceptInvitation()` mengubah dua entitas sekaligus: data undangan (status → accepted) dan data user (companyId, role, positionId). `WorkOrderService.createInternal()` membuat work order sekaligus work report dan mengirim notifikasi. Perubahan multi-entitas seperti ini rawan error.

**4. Modul-modul ini menyangkut keamanan dan integrasi pihak ketiga**

- `AuthService` menangani password dan pembuatan token akses (JWT) — kesalahan bisa menyebabkan kebocoran data.
- `FcmService` menangani integrasi Firebase Cloud Messaging termasuk fallback ketika antrean gagal.
- `FormValidationHelper` memvalidasi input dinamis berdasarkan konfigurasi template — logika ini tidak mungkin tercakup sepenuhnya oleh pengujian E2E.

**5. Modul lain bersifat CRUD sederhana**

Modul seperti Users, Positions, Storage, dan Dashboard hanya melakukan operasi dasar (simpan, ambil, hapus) tanpa logika bisnis tambahan, sehingga cukup divalidasi melalui pengujian E2E.

---

## 2. Stress Testing (Khusus Endpoint GET)

### 2.1 Apa Itu Stress Testing?

Stress testing adalah pengujian yang mensimulasikan **banyak pengguna mengakses sistem secara bersamaan** untuk mengukur apakah server mampu menangani beban tinggi tanpa melambat atau error.

### 2.2 Ringkasan

| Aspek | Detail |
|---|---|
| Tool | Grafana k6 |
| Target | Server produksi (`workorders-production.up.railway.app`) |
| Simulasi | **100 pengguna** mengakses bersamaan, masing-masing **20 kali** |
| Total request per skenario | ~2.000 request |
| Jumlah skenario | **6 skenario** |
| Jumlah endpoint GET yang diuji | **34 endpoint** |

### 2.3 Daftar Endpoint yang Diuji

#### Skenario 1 — Halaman Publik (4 endpoint, tanpa login)

| No | Endpoint | Deskripsi |
|---|---|---|
| 1 | `GET /public/companies` | Daftar perusahaan publik |
| 2 | `GET /public/companies/:id` | Detail perusahaan publik |
| 3 | `GET /public/companies/:id/services` | Daftar layanan perusahaan publik |
| 4 | `GET /public/services/:id/intake-form` | Formulir pendaftaran layanan publik |

#### Skenario 2 — Halaman Client / Pelanggan (5 endpoint)

| No | Endpoint | Deskripsi |
|---|---|---|
| 5 | `GET /auth/profile` | Profil pengguna aktif |
| 6 | `GET /service-requests/sent` | Daftar permintaan layanan yang dikirim |
| 7 | `GET /service-requests/:id` | Detail permintaan layanan |
| 8 | `GET /service-requests/:id/report` | Laporan hasil layanan |
| 9 | `GET /customer-pairing` | Status pencocokan pelanggan |

#### Skenario 3 — Halaman Operasional / Manager & Staff (5 endpoint)

| No | Endpoint | Deskripsi |
|---|---|---|
| 10 | `GET /service-requests/inbox` | Kotak masuk permintaan layanan |
| 11 | `GET /workorders` | Daftar work order |
| 12 | `GET /workorders/:id` | Detail work order |
| 13 | `GET /workorders/:id/report` | Laporan work order |
| 14 | `GET /workreports/:id` | Detail laporan pekerjaan |

#### Skenario 4 — Halaman Admin Perusahaan / Owner (7 endpoint)

| No | Endpoint | Deskripsi |
|---|---|---|
| 15 | `GET /company` | Data perusahaan |
| 16 | `GET /company/detail` | Detail lengkap perusahaan |
| 17 | `GET /company/employees` | Daftar karyawan |
| 18 | `GET /company/integration-config` | Konfigurasi integrasi |
| 19 | `GET /company/invitations/history` | Riwayat undangan |
| 20 | `GET /positions` | Daftar posisi/jabatan |
| 21 | `GET /positions/:id` | Detail posisi |

#### Skenario 5 — Konfigurasi Layanan & Template (10 endpoint)

| No | Endpoint | Deskripsi |
|---|---|---|
| 22 | `GET /services` | Daftar layanan perusahaan |
| 23 | `GET /services/:id` | Detail layanan |
| 24 | `GET /services/:id/intake-form` | Formulir intake layanan |
| 25 | `GET /forms` | Daftar template formulir |
| 26 | `GET /forms/:id` | Detail template formulir |
| 27 | `GET /service-price` | Daftar harga layanan |
| 28 | `GET /notifications` | Riwayat notifikasi |
| 29 | `GET /template/company-type` | Daftar tipe perusahaan |
| 30 | `GET /template/company-type/:id/services` | Template layanan per tipe |
| 31 | `GET /template/services/:id` | Detail template layanan |

#### Skenario 6 — Dashboard (3 endpoint)

| No | Endpoint | Deskripsi |
|---|---|---|
| 32 | `GET /dashboard/service-request` | Statistik permintaan layanan |
| 33 | `GET /dashboard/work-order` | Statistik work order |
| 34 | `GET /dashboard/company` | Ringkasan data perusahaan |

### 2.4 Mengapa Stress Test Hanya pada Endpoint GET?

**1. Endpoint GET adalah yang paling sering diakses pengguna**

Dalam penggunaan sehari-hari, pengguna lebih banyak **melihat data** daripada **membuat/mengubah data**. Contohnya:
- Membuka dashboard → 3 endpoint GET dipanggil sekaligus.
- Melihat daftar dan detail work order → minimal 2 endpoint GET per sesi.
- Client browsing layanan publik → 4 endpoint GET tanpa login.

Diperkirakan **80% dari seluruh request** yang masuk ke server adalah operasi GET. Jika server tidak mampu menangani beban GET dari banyak pengguna bersamaan, maka seluruh pengalaman pengguna akan terganggu.

**2. Endpoint GET memerlukan pemrosesan database yang paling berat**

Beberapa endpoint GET melakukan pemrosesan data yang kompleks:
- **Dashboard** harus menghitung statistik dari ribuan dokumen (berapa work order yang selesai, berapa yang masih berjalan, dll).
- **Detail work order** harus mengambil data dari beberapa koleksi sekaligus (data layanan, data staf, data formulir, data laporan) dan menggabungkannya.
- **Daftar layanan** melakukan agregasi untuk menghitung jumlah work order aktif per layanan.

Pemrosesan berat seperti ini paling rentan melambat ketika banyak pengguna mengaksesnya bersamaan.

**3. Endpoint selain GET berbahaya jika di-stress test di server produksi**

Endpoint selain GET (POST, PUT, DELETE) **mengubah data di database**:
- Jika `POST /service-requests` di-stress test dengan 100 pengguna × 20 iterasi, maka akan terbuat **2.000 permintaan layanan palsu** di database produksi.
- Jika `DELETE /workorders/:id` di-stress test, bisa **menghapus data work order asli**.
- Jika `PATCH /workorders/:id/status` di-stress test, bisa **mengubah status ratusan work order** tanpa proses bisnis yang seharusnya.

Endpoint GET bersifat **aman** karena hanya membaca data tanpa mengubahnya, sehingga bisa di-stress test berulang kali tanpa merusak data.

**4. Tujuan stress test adalah mengukur performa, bukan kebenaran logika**

Stress testing bertujuan mengukur:
- **Response time** — seberapa cepat server merespons (rata-rata, p90, p95).
- **Error rate** — berapa persen request yang gagal di bawah beban tinggi.
- **Throughput** — berapa request per detik yang mampu ditangani server.

Kebenaran logika endpoint POST, PUT, dan DELETE sudah diuji oleh unit test (116 TC) dan E2E test. Stress test hanya perlu memvalidasi bahwa endpoint yang paling sering diakses tetap stabil di bawah beban.

**5. Semua role pengguna sudah tercakup**

| Skenario | Jenis Pengguna |
|---|---|
| Public Endpoints | Pengunjung tanpa login |
| Client Endpoints | Pelanggan |
| Operations | Manager dan staff operasional |
| Company & Admin | Pemilik perusahaan |
| Services & Config | Pemilik perusahaan (kelola layanan) |
| Dashboard | Pemilik perusahaan / manager |

---

## 3. Rekap Keseluruhan

| Jenis Pengujian | Tujuan | Cakupan |
|---|---|---|
| **Unit Testing** | Memastikan logika bisnis internal bekerja benar secara terisolasi | 8 modul, **116 test case** |
| **Stress Testing** | Memastikan server tetap stabil dan responsif di bawah beban 100 pengguna simultan | 6 skenario, **34 endpoint GET** |

### Bagaimana Kedua Pengujian Saling Melengkapi?

```
              ┌────────────────────────┐
              │     Stress Testing     │  ← Apakah server kuat
              │   34 endpoint GET      │     menangani banyak pengguna?
              │   100 pengguna simultan│
              ├────────────────────────┤
              │     Unit Testing       │  ← Apakah logika bisnis
              │   8 modul, 116 TC      │     yang rumit sudah benar?
              │   Terisolasi (mock)    │
              └────────────────────────┘
```

- **Unit testing** memastikan logika bisnis yang rumit (transisi status, validasi formulir, keamanan, integrasi Firebase) bekerja dengan benar di setiap kemungkinan skenario.
- **Stress testing** memastikan server tetap stabil dan responsif ketika 100 pengguna mengakses 34 endpoint secara bersamaan.
