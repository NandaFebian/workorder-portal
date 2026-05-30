# Rencana Pengujian API (API Testing Plan)

Rencana ini mencakup pengujian fungsionalitas seluruh endpoint API pada proyek ini menggunakan pengujian **Blackbox** dan **Whitebox** dengan **Jest** & **Supertest**.

## Desain & Metodologi Pengujian

### Pengujian Blackbox
- Validasi Input: Memastikan DTO (`class-validator`) berfungsi dengan benar (400 Bad Request untuk input tidak valid).
- Validasi Output: Skema respons JSON sesuai standar (interseptor global, struktur field, tipe data).
- Kode Status HTTP: 200/201 (sukses), 400 (validation), 401 (unauthorized), 403 (forbidden), 404 (not found).

### Pengujian Whitebox
- Validasi Autentikasi & Otorisasi: Guard memeriksa JWT dan perizinan role (admin, staff, client, dll).
- Logika Bisnis: Aliran data dalam service, mutasi state dalam database (MongoDB via Mongoose).
- Integrasi Eksternal: Mocking pihak ketiga seperti Firebase FCM, AWS S3, BullMQ, dan integrasi API luar.

---

## Proposed Changes

### [NEW] Testing Suite Files
Rangkaian file pengujian baru yang akan dibuat di folder `test/`:
- `test/auth.e2e-spec.ts`
- `test/users.e2e-spec.ts`
- `test/company.e2e-spec.ts`
- `test/positions.e2e-spec.ts`
- `test/services.e2e-spec.ts`
- `test/forms.e2e-spec.ts`
- `test/service-requests.e2e-spec.ts`
- `test/workorders.e2e-spec.ts`
- `test/workreports.e2e-spec.ts`
- `test/memberships.e2e-spec.ts`
- `test/invitations.e2e-spec.ts`
- `test/notifications.e2e-spec.ts`
- `test/storage.e2e-spec.ts`
- `test/template.e2e-spec.ts`
- `test/dashboard.e2e-spec.ts`
- `test/faq.e2e-spec.ts`
- `test/customer-pairing.e2e-spec.ts`
- `test/service-price.e2e-spec.ts`

---

## Endpoint Checklist & Rencana Uji

#### 1. Auth Module (`/auth`)

#### `POST /auth/register` (Registrasi User Baru)
- [x] **Blackbox**:
  - Mengembalikan `201 Created` dengan token JWT jika payload valid.
  - Mengembalikan `400 Bad Request` jika email sudah terdaftar, format email salah, atau password terlalu pendek.
- [x] **Whitebox**:
  - Memastikan password di-hash menggunakan `bcrypt` sebelum disimpan ke database.
  - Memastikan record user baru dibuat di MongoDB dengan schema `User`.

#### `POST /auth/register-company` (Registrasi Perusahaan Baru)
- [x] **Blackbox**:
  - Mengembalikan `201 Created` beserta detail perusahaan dan user admin utama jika payload valid.
  - Mengembalikan `400 Bad Request` jika data perusahaan tidak lengkap.
- [x] **Whitebox**:
  - Memverifikasi transaksi database untuk membuat `Company` sekaligus user admin `User` baru.
  - Memastikan relasi keanggotaan/role admin terasosiasi dengan benar di database.

#### `POST /auth/login` (Login User)
- [x] **Blackbox**:
  - Mengembalikan `200 OK` beserta access token jika kredensial benar.
  - Mengembalikan `401 Unauthorized` jika password salah atau email tidak terdaftar.
- [x] **Whitebox**:
  - Memvalidasi penggunaan `bcrypt.compare` untuk pencocokan password.
  - Memastikan response payload mengandung token JWT yang ditandatangani dengan secret key yang valid.

#### `POST /auth/logout` (Logout User)
- [x] **Blackbox**:
  - Mengembalikan `200 OK` (atau `201`) saat dipanggil dengan JWT token aktif.
- [x] **Whitebox**:
  - Memastikan token dimasukkan ke blacklist cache (jika diimplementasikan) atau sesi/cookie dibersihkan.

#### `GET /auth/profile` (Ambil Profil Aktif)
- [x] **Blackbox**:
  - Mengembalikan `200 OK` dengan data profil user aktif saat menyertakan JWT token valid.
  - Mengembalikan `401 Unauthorized` jika token tidak ada atau tidak valid.
- [x] **Whitebox**:
  - Memastikan JWT Strategy mem-decode token dan memuat data user ke objek request (`req.user`).

---

### 2. Users Module (`/users`)

#### `GET /users/me` (Ambil Profil Saya)
- [x] **Blackbox**:
  - Mengembalikan `200 OK` berisi data detail user yang terautentikasi.
- [x] **Whitebox**:
  - Mengambil data dari MongoDB berdasarkan `req.user.id` dan memverifikasi field sensitif (seperti password) di-exclude dari query.

#### `PATCH /users/me` (Update Profil Saya)
- [x] **Blackbox**:
  - Mengembalikan `200 OK` dengan data profil terbaru setelah diupdate.
  - Mengembalikan `400 Bad Request` jika ada tipe data payload yang tidak sesuai (misal string untuk array).
- [x] **Whitebox**:
  - Memastikan perubahan data tersimpan di MongoDB.
  - Memvalidasi bahwa ID user tidak dapat diubah oleh client.

---

### 3. Company Module (`/company` & `/public/companies`)

#### `GET /company` (Ambil Data Perusahaan Internal)
- [x] **Blackbox**:
  - Mengembalikan `200 OK` berisi detail perusahaan milik user aktif.
- [x] **Whitebox**:
  - Memastikan query mengambil data berdasarkan `companyId` yang terikat pada user admin/staf.

#### `POST /company/invite` (Undang Karyawan Baru)
- [x] **Blackbox**:
  - Mengembalikan `201 Created` saat admin mengundang email karyawan baru.
  - Mengembalikan `400 Bad Request` jika email sudah berstatus karyawan aktif.
- [x] **Whitebox**:
  - Memasikan pembuatan record di schema `Invitation` dengan status `PENDING`.
  - Memverifikasi pengiriman email undangan (jika terintegrasi) atau antrean notifikasi.

#### `GET /company/invitations/history` (Riwayat Undangan)
- [x] **Blackbox**:
  - Mengembalikan `200 OK` berisi daftar seluruh undangan yang pernah dibuat oleh perusahaan tersebut.
- [x] **Whitebox**:
  - Memverifikasi query filter berdasarkan `companyId` pengirim undangan.

#### `GET /company/employees` (Daftar Karyawan)
- [x] **Blackbox**:
  - Mengembalikan `200 OK` berisi daftar karyawan beserta status role mereka di perusahaan.
- [x] **Whitebox**:
  - Menguji filter query relasi database antara schema `User` and `Company`.

#### `PUT /company` (Update Info Perusahaan)
- [x] **Blackbox**:
  - Mengembalikan `200 OK` dengan data perusahaan yang telah diupdate.
- [x] **Whitebox**:
  - Memverifikasi hak akses (hanya Owner/Admin perusahaan yang dapat melakukan update).

#### `GET /company/detail` (Detail Perusahaan Internal)
- [x] **Blackbox**:
  - Mengembalikan `200 OK` berisi detail lengkap profil perusahaan.
- [x] **Whitebox**:
  - Memastikan integrasi fetching data profil dari MongoDB.

#### `DELETE /company` (Hapus/Nonaktifkan Perusahaan)
- [x] **Blackbox**:
  - Mengembalikan `200 OK` atau `204 No Content` saat perusahaan dihapus oleh owner.
- [x] **Whitebox**:
  - Memverifikasi proses cascading delete (menonaktifkan user/member asosiasi, atau menandai flag `deletedAt`).

#### `GET /company/integration-config` (Ambil Konfigurasi Integrasi)
- [x] **Blackbox**:
  - Mengembalikan `200 OK` berisi data setup integrasi (misal Webhook URL, API Keys).
- [x] **Whitebox**:
  - Memastikan data sensitif dienkripsi/disamarkan sebelum dikirim ke response.

#### `PUT /company/integration-config` (Update Konfigurasi Integrasi)
- [x] **Blackbox**:
  - Mengembalikan `200 OK` setelah konfigurasi berhasil disimpan.
- [x] **Whitebox**:
  - Memvalidasi payload konfigurasi dan memastikan data terenkripsi disimpan dengan benar ke MongoDB.

#### `GET /public/companies` (Daftar Perusahaan Publik)
- [x] **Blackbox**:
  - Mengembalikan `200 OK` berisi list perusahaan publik (tanpa memerlukan autentikasi).
- [x] **Whitebox**:
  - Memastikan filter query MongoDB hanya mengambil perusahaan berstatus publik/aktif.

#### `GET /public/companies/:id` (Detail Perusahaan Publik)
- [x] **Blackbox**:
  - Mengembalikan `200 OK` berisi detail perusahaan publik berdasarkan ID.
  - Mengembalikan `404 Not Found` jika ID tidak ada.
- [x] **Whitebox**:
  - Memverifikasi pencarian data berdasarkan parameter ID.

#### `GET /public/companies/:id/services` (Daftar Layanan Perusahaan Publik)
- [x] **Blackbox**:
  - Mengembalikan `200 OK` berisi daftar layanan aktif yang ditawarkan oleh perusahaan tersebut.
- [x] **Whitebox**:
  - Memverifikasi relasi schema `Service` dengan filter `companyId` dan status `active = true`.

---

### 4. Positions Module (`/positions`)

#### `GET /positions` (Ambil Semua Posisi Kerja/Jabatan)
- [ ] **Blackbox**:
  - Mengembalikan `200 OK` berisi daftar posisi jabatan yang ada di perusahaan user.
- [ ] **Whitebox**:
  - Memastikan data difilter berdasarkan `companyId` user aktif.

#### `GET /positions/:id` (Detail Posisi Kerja)
- [ ] **Blackbox**:
  - Mengembalikan `200 OK` berisi detail posisi spesifik.
  - Mengembalikan `404 Not Found` jika posisi tidak ditemukan.
- [ ] **Whitebox**:
  - Memvalidasi kepemilikan posisi sebelum mengembalikan data (mencegah data kebocoran antar perusahaan).

#### `POST /positions` (Buat Posisi Baru - Admin Only)
- [ ] **Blackbox**:
  - Mengembalikan `201 Created` setelah posisi berhasil dibuat.
  - Mengembalikan `403 Forbidden` jika diakses oleh non-admin.
- [ ] **Whitebox**:
  - Memastikan verifikasi Role Guard (admin/owner) berjalan sukses.
  - Menyimpan record baru di MongoDB.

#### `PUT /positions/:id` (Update Posisi - Admin Only)
- [ ] **Blackbox**:
  - Mengembalikan `200 OK` setelah data posisi diupdate.
- [ ] **Whitebox**:
  - Memverifikasi perubahan record spesifik pada database MongoDB.

#### `DELETE /positions/:id` (Hapus Posisi - Admin Only)
- [ ] **Blackbox**:
  - Mengembalikan `200 OK` atau `204 No Content` saat posisi berhasil dihapus.
- [ ] **Whitebox**:
  - Memverifikasi penanganan jika ada karyawan yang masih memiliki posisi tersebut (prevent delete atau reassign).

---

### 5. Services Module (`/services` & `/public/services`)

#### `POST /services` (Buat Layanan Baru)
- [ ] **Blackbox**:
  - Mengembalikan `201 Created` setelah mengisi data name, description, price template, dan forms.
- [ ] **Whitebox**:
  - Memastikan relasi ke `Form` (intake-form) divalidasi keberadaannya di database.

#### `GET /services` (Daftar Layanan Internal)
- [ ] **Blackbox**:
  - Mengembalikan `200 OK` berisi list semua layanan (aktif maupun tidak).
- [ ] **Whitebox**:
  - Mengambil data dari MongoDB berdasarkan `companyId` user terautentikasi.

#### `GET /services/:id` (Detail Layanan Internal)
- [ ] **Blackbox**:
  - Mengembalikan `200 OK` berisi detail lengkap layanan.
- [ ] **Whitebox**:
  - Memverifikasi validitas database object ID.

#### `GET /services/:serviceId/intake-form` (Ambil Form Intake Layanan)
- [ ] **Blackbox**:
  - Mengembalikan `200 OK` berisi struktur form yang harus diisi konsumen.
- [ ] **Whitebox**:
  - Memastikan schema `Form` yang terasosiasi di-resolve dengan benar dari database.

#### `POST /services/:serviceId/create-work-order` (Buat Work Order Langsung)
- [ ] **Blackbox**:
  - Mengembalikan `201 Created` berisi detail work order baru.
- [ ] **Whitebox**:
  - Memastikan pembuatan schema `WorkOrder` baru di database yang terikat langsung ke layanan.

#### `PUT /services/:id` (Update Layanan)
- [ ] **Blackbox**:
  - Mengembalikan `200 OK` setelah data layanan diperbarui.
- [ ] **Whitebox**:
  - Memvalidasi perubahan schema data di database MongoDB.

#### `PATCH /services/:id/toggle-active` (Aktif/Nonaktifkan Layanan)
- [ ] **Blackbox**:
  - Mengembalikan `200 OK` setelah status `active` berubah (true/false).
- [ ] **Whitebox**:
  - Menguji modifikasi flag boolean di MongoDB.

#### `DELETE /services/:id` (Hapus Layanan)
- [ ] **Blackbox**:
  - Mengembalikan `200 OK` setelah layanan dihapus.
- [ ] **Whitebox**:
  - Memastikan data layanan tidak hilang total jika ada work order aktif yang merujuk padanya (soft delete).

#### `GET /public/services/company/:companyId` (Layanan Publik Perusahaan)
- [ ] **Blackbox**:
  - Mengembalikan `200 OK` dengan filter hanya layanan yang berstatus aktif.
- [ ] **Whitebox**:
  - Memastikan endpoint dapat diakses tanpa menyertakan auth token (public access).

#### `GET /public/services/:id` (Detail Layanan Publik)
- [ ] **Blackbox**:
  - Mengembalikan `200 OK` detail layanan jika aktif.
  - Mengembalikan `403/404` jika layanan berstatus tidak aktif.
- [ ] **Whitebox**:
  - Menguji logika filter status layanan publik.

#### `GET /public/services/:id/intake-form` (Intake Form Publik)
- [ ] **Blackbox**:
  - Mengembalikan `200 OK` berisi struktur form intake untuk publik.

---

### 6. Forms Module (`/forms`)

#### `POST /forms` (Buat Template Form Baru)
- [ ] **Blackbox**:
  - Mengembalikan `201 Created` dengan schema JSON form builder (fields, type, validasi).
- [ ] **Whitebox**:
  - Memvalidasi skema dynamic JSON field DTO sebelum menyimpannya ke database.

#### `GET /forms` (Ambil Semua Form)
- [ ] **Blackbox**:
  - Mengembalikan `200 OK` berisi daftar seluruh form buatan perusahaan tersebut.
- [ ] **Whitebox**:
  - Query MongoDB menggunakan filter `companyId` pembuat.

#### `GET /forms/:id` (Detail Form)
- [ ] **Blackbox**:
  - Mengembalikan `200 OK` berisi detail schema form tersebut.
- [ ] **Whitebox**:
  - Memverifikasi lookup schema di database MongoDB.

#### `PUT /forms/:id` (Update Form)
- [ ] **Blackbox**:
  - Mengembalikan `200 OK` setelah data layout form diperbarui.
- [ ] **Whitebox**:
  - Menguji integritas data form (apakah merusak submission yang sudah ada).

#### `POST /forms/submissions` (Kirim Hasil Form / Submit Form)
- [ ] **Blackbox**:
  - Mengembalikan `201 Created` setelah validasi field yang diinput sesuai dengan schema template form.
  - Mengembalikan `400 Bad Request` jika field wajib (required) tidak diisi atau tipe data salah.
- [ ] **Whitebox**:
  - Menguji validasi dinamis terhadap dynamic form schema pada service layer.
  - Menyimpan record ke database `FormSubmission`.

#### `DELETE /forms/:id` (Hapus Form)
- [ ] **Blackbox**:
  - Mengembalikan `200 OK` setelah form terhapus.
- [ ] **Whitebox**:
  - Memastikan form tidak terhapus keras jika sedang terikat dengan sebuah layanan (dependency check).

---

### 7. Service Request Module (`/service-requests`)

#### `GET /service-requests/inbox` (Kotak Masuk Permintaan Layanan - Internal Staff/Admin)
- [ ] **Blackbox**:
  - Mengembalikan `200 OK` berisi daftar permintaan layanan masuk dari customer.
- [ ] **Whitebox**:
  - Memverifikasi filter query berdasarkan penugasan admin/staf pada perusahaan yang sama.

#### `PATCH /service-requests/:id/approve` (Approve Permintaan Layanan)
- [ ] **Blackbox**:
  - Mengembalikan `200 OK` dengan status ter-update menjadi `APPROVED`.
- [ ] **Whitebox**:
  - Memverifikasi konversi otomatis permintaan layanan menjadi objek `WorkOrder` baru.
  - Menguji pemanggilan FCM service untuk mengirimkan push notification status update ke customer.

#### `PATCH /service-requests/:id/reject` (Reject Permintaan Layanan)
- [ ] **Blackbox**:
  - Mengembalikan `200 OK` dengan status `REJECTED`.
- [ ] **Whitebox**:
  - Memastikan alasan penolakan (reason) tersimpan di database.
  - Menguji pengiriman push notification status update.

#### `PATCH /service-requests/:id/assign-staff` (Tugaskan Staff ke Request)
- [ ] **Blackbox**:
  - Mengembalikan `200 OK` setelah staff ditugaskan.
- [ ] **Whitebox**:
  - Memvalidasi bahwa staff yang ditugaskan terdaftar pada perusahaan yang sama.

#### `DELETE /service-requests/:id` (Hapus Permintaan Layanan)
- [ ] **Blackbox**:
  - Mengembalikan `200 OK` setelah terhapus.
- [ ] **Whitebox**:
  - Memastikan cascade status aman.

#### `GET /service-requests/sent` (Permintaan Terkirim - Client)
- [ ] **Blackbox**:
  - Mengembalikan `200 OK` berisi riwayat permintaan layanan yang diajukan oleh user bersangkutan.
- [ ] **Whitebox**:
  - Memverifikasi filter pencarian berdasarkan `req.user.id` (pembuat request).

#### `GET /service-requests/:id` (Detail Permintaan)
- [ ] **Blackbox**:
  - Mengembalikan `200 OK` berisi detail data permintaan.

#### `POST /service-requests/service/:serviceId` (Kirim Permintaan Layanan Baru)
- [ ] **Blackbox**:
  - Mengembalikan `201 Created` jika payload intake form valid.
- [ ] **Whitebox**:
  - Menyimpan record `ServiceRequest` dengan status `PENDING`.
  - Memicu background job / push notification untuk admin perusahaan.

#### `POST /service-requests/:id/review` (Submit Review/Rating Layanan)
- [ ] **Blackbox**:
  - Mengembalikan `201 Created` setelah rating/ulasan diberikan.
- [ ] **Whitebox**:
  - Memastikan request sudah dalam status `COMPLETED` sebelum mengizinkan rating.

#### `PATCH /service-requests/:id/cancel` (Batalkan Permintaan)
- [ ] **Blackbox**:
  - Mengembalikan `200 OK` status permintaan berubah jadi `CANCELLED`.
- [ ] **Whitebox**:
  - Memastikan pembatalan hanya diizinkan jika status masih `PENDING`.

#### `GET /service-requests/:id/report` (Unduh / Tampilkan Laporan Hasil Request)
- [ ] **Blackbox**:
  - Mengembalikan data dokumen laporan / PDF.

---

### 8. Work Order Module (`/workorders` & `/staff/work-orders`)

#### `POST /workorders` (Buat Work Order Manual)
- [ ] **Blackbox**:
  - Mengembalikan `201 Created` jika input detail valid.
- [ ] **Whitebox**:
  - Menyimpan record `WorkOrder` dan memicu background job di BullMQ.

#### `GET /workorders` (Daftar Work Orders)
- [ ] **Blackbox**:
  - Mengembalikan `200 OK` berisi seluruh daftar work order (dengan opsi pagination/filtering).

#### `GET /workorders/:id` (Detail Work Order)
- [ ] **Blackbox**:
  - Mengembalikan `200 OK` data lengkap WO.

#### `PATCH /workorders/:id` (Update Data Work Order)
- [ ] **Blackbox**:
  - Mengembalikan `200 OK` data terupdate.

#### `PATCH /workorders/:id/status` (Update Status Work Order - Internal)
- [ ] **Blackbox**:
  - Mengembalikan `200 OK` setelah status WO dirubah (misal: `ON_PROGRESS`, `FINISHED`).
- [ ] **Whitebox**:
  - Menguji transisi status yang valid (misal: tidak boleh langsung dari `PENDING` ke `FINISHED` tanpa melewati proses perantara).

#### `PUT /workorders/:id/assign-staffs` (Tugaskan Banyak Staff ke WO)
- [ ] **Blackbox**:
  - Mengembalikan `200 OK` berisi staff-staff terasosiasi.
- [ ] **Whitebox**:
  - Memverifikasi notifikasi ke staff terpilih lewat push notification FCM.

#### `PUT /workorders/:id/submissions` (Kirim Hasil Pekerjaan WO)
- [ ] **Blackbox**:
  - Mengembalikan `200 OK` jika format lampiran/teks submission valid.
- [ ] **Whitebox**:
  - Menyimpan data submission staf di database MongoDB.

#### `PATCH /workorders/:id/sent`, `approve`, `reject` (Alur Penyerahan Hasil Kerja WO ke Client)
- [ ] **Blackbox**:
  - Mengembalikan `200 OK` untuk masing-masing transisi.
- [ ] **Whitebox**:
  - Memastikan email/notifikasi status dikirim ke customer.
  - Memperbarui status global `ServiceRequest` yang terkait jika disetujui (`APPROVED`).

#### `POST /workorders/:id/recreate` (Membuat Ulang WO yang Gagal)
- [ ] **Blackbox**:
  - Mengembalikan `201 Created` untuk WO baru dari cetakan WO lama.

#### `PATCH /workorders/:id/cancel` (Batal WO)
- [ ] **Blackbox**:
  - Mengembalikan `200 OK` status berubah.

#### `PATCH /workorders/:id/start`, `complete`, `fail` (Kendali Progress WO)
- [ ] **Blackbox**:
  - Mengembalikan `200 OK` setelah status internal WO berganti.

#### `DELETE /workorders/:id` (Hapus WO)
- [ ] **Blackbox**:
  - Mengembalikan `200 OK`.

#### `GET /workorders/:id/report` / `PUT /workorders/:id/report` (Manajemen Laporan Pekerjaan)
- [ ] **Blackbox**:
  - Mengambil data laporan / memperbarui template laporan hasil akhir.

#### `GET /staff/work-orders` (Daftar WO Ditugaskan ke Staf)
- [ ] **Blackbox**:
  - Mengembalikan `200 OK` berisi daftar WO tempat staf yang terautentikasi ditugaskan.
- [ ] **Whitebox**:
  - Menguji filtering data berdasarkan array `staffIds` dalam skema `WorkOrder`.

#### `GET /staff/work-orders/:id` (Detail WO Staf)
- [ ] **Blackbox**:
  - Mengembalikan `200 OK` detail spesifik jika staf terdaftar di WO tersebut.
  - Mengembalikan `403 Forbidden` jika staf tidak terdaftar di WO tersebut.

---

### 9. Work Report Module (`/workreports`)

#### `GET /workreports/:id` (Detail Laporan Pekerjaan Staf)
- [ ] **Blackbox**:
  - Mengembalikan `200 OK` detail laporan pekerjaan.

#### `POST /workreports` (Buat Laporan Pekerjaan Baru)
- [ ] **Blackbox**:
  - Mengembalikan `201 Created` setelah payload laporan diinput staf.
- [ ] **Whitebox**:
  - Memastikan laporan terhubung dengan Work Order valid dan pengirim terdaftar sebagai staff di WO tersebut.

#### `PUT /workreports/:id` (Edit Laporan Pekerjaan)
- [ ] **Blackbox**:
  - Mengembalikan `200 OK`.
- [ ] **Whitebox**:
  - Memastikan edit hanya diizinkan jika status laporan masih draft/belum di-submit.

#### `POST /workreports/:id/submit` (Kirim Laporan untuk Di-review)
- [ ] **Blackbox**:
  - Mengembalikan `200 OK` status laporan berubah menjadi `SUBMITTED`.

#### `PATCH /workreports/:id/sent`, `approve`, `reject` (Alur Review Laporan Pekerjaan oleh Admin)
- [ ] **Blackbox**:
  - Mengembalikan `200 OK` untuk transisi alur review.
- [ ] **Whitebox**:
  - Menguji perubahan status laporan pekerjaan pada database dan notifikasi push ke staf pembuat.

#### `DELETE /workreports/:id` (Hapus Laporan)
- [ ] **Blackbox**:
  - Mengembalikan `200 OK`.

---

### 10. Memberships Module (`/memberships` & `/memberships/codes`)

#### `GET /memberships` (Ambil Daftar Membership Aktif)
- [ ] **Blackbox**:
  - Mengembalikan `200 OK` berisi list keanggotaan aktif user.

#### `GET /memberships/codes` (Daftar Kode Membership)
- [ ] **Blackbox**:
  - Mengembalikan `200 OK` berisi daftar kode membership buatan perusahaan.

#### `POST /memberships/codes` (Generate Kode Membership Baru)
- [ ] **Blackbox**:
  - Mengembalikan `201 Created` setelah kode dengan role tertentu di-generate.
- [ ] **Whitebox**:
  - Menyimpan kode unik yang di-generate di database MongoDB.

#### `POST /memberships/codes/claim` (Klaim Kode Membership untuk Masuk Perusahaan)
- [ ] **Blackbox**:
  - Mengembalikan `200 OK` setelah kode yang valid diinput.
  - Mengembalikan `400 Bad Request` jika kode kedaluwarsa atau tidak valid.
- [ ] **Whitebox**:
  - Menghubungkan user pengklaim ke perusahaan terkait sebagai employee/staff baru.

#### `DELETE /memberships/codes/:id` (Hapus/Batalkan Kode Membership)
- [ ] **Blackbox**:
  - Mengembalikan `200 OK` setelah kode dinonaktifkan.

---

### 11. Invitations Module (`/invitations`)

#### `GET /invitations/pending` (Daftar Undangan Pending)
- [ ] **Blackbox**:
  - Mengembalikan `200 OK` berisi daftar undangan pending yang masuk ke email/akun user bersangkutan.

#### `PUT /invitations/:id/accept` (Menerima Undangan Bergabung)
- [ ] **Blackbox**:
  - Mengembalikan `200 OK` status undangan berubah menjadi `ACCEPTED`.
- [ ] **Whitebox**:
  - Menambahkan user ke daftar karyawan di perusahaan pengundang secara otomatis di database.

#### `PUT /invitations/:id/reject` (Menolak Undangan)
- [ ] **Blackbox**:
  - Mengembalikan `200 OK` status undangan dirubah menjadi `REJECTED`.

#### `DELETE /invitations/:id` (Batalkan/Tarik Undangan - Pengirim)
- [ ] **Blackbox**:
  - Mengembalikan `200 OK` setelah undangan dihapus.

---

### 12. Notifications Module (`/notifications`)

#### `GET /notifications` (Ambil Riwayat Notifikasi)
- [ ] **Blackbox**:
  - Mengembalikan `200 OK` berisi riwayat notifikasi masuk untuk user aktif.

#### `POST /notifications/fcm-token` (Registrasi Token FCM Baru)
- [ ] **Blackbox**:
  - Mengembalikan `201 Created` jika token valid.
- [ ] **Whitebox**:
  - Menyimpan token FCM ke database schema milik user bersangkutan untuk pengiriman push notification.

#### `DELETE /notifications/fcm-token` (Hapus/Logout Token FCM)
- [ ] **Blackbox**:
  - Mengembalikan `200 OK`.
- [ ] **Whitebox**:
  - Menghapus token FCM terkait agar tidak lagi menerima push notification.

---

### 13. Storage Module (`/files`)

#### `POST /files` (Upload File/Media)
- [ ] **Blackbox**:
  - Mengembalikan `201 Created` berisi URL file jika format file diperbolehkan (misal gambar/PDF) dan ukuran sesuai batas.
  - Mengembalikan `400 Bad Request` jika file tidak sesuai aturan.
- [ ] **Whitebox**:
  - Memastikan file berhasil terunggah ke Cloud Storage (S3 Mock/MinIO) via AWS SDK.

---

### 14. Template Module (`/template`)

#### `GET /template/company-type` (Ambil Tipe Perusahaan)
- [ ] **Blackbox**:
  - Mengembalikan `200 OK` berisi list kategori/tipe perusahaan.

#### `GET /template/company-type/:companyTypeId/services` (Daftar Layanan Template dari Kategori)
- [ ] **Blackbox**:
  - Mengembalikan `200 OK` template layanan.

#### `GET /template/services/:serviceTemplateId` (Detail Template Layanan)
- [ ] **Blackbox**:
  - Mengembalikan `200 OK`.

#### `POST /template/services/generate` (Generate Layanan dari Template)
- [ ] **Blackbox**:
  - Mengembalikan `201 Created` layanan baru hasil duplikasi template.
- [ ] **Whitebox**:
  - Mengkloning properti template layanan ke schema `Service` aktif perusahaan.

---

### 15. Dashboard Module (`/dashboard`)

#### `GET /dashboard/service-request` (Metrik Dashboard Service Requests)
- [ ] **Blackbox**:
  - Mengembalikan `200 OK` berisi statistik data (total pending, approved, rejected, dll).

#### `GET /dashboard/work-order` (Metrik Dashboard Work Orders)
- [ ] **Blackbox**:
  - Mengembalikan `200 OK` berisi statistik (total active, selesai, staf utilitas).

#### `GET /dashboard/company` (Metrik Dashboard Ringkasan Perusahaan)
- [ ] **Blackbox**:
  - Mengembalikan `200 OK` data ringkasan.

---

### 16. FAQ Module (`/faq`)

#### `PUT /faq/toggle-active` (Aktif/Nonaktifkan Fitur FAQ)
- [ ] **Blackbox**:
  - Mengembalikan `200 OK`.

#### `POST /faq/text-docs` / `POST /faq/pdf-docs` (Unggah Dokumen Referensi FAQ)
- [ ] **Blackbox**:
  - Mengembalikan `201 Created` jika dokumen teks/PDF valid terproses.
- [ ] **Whitebox**:
  - Memastikan ekstraksi teks/parsing PDF tersimpan sebagai bank pengetahuan AI FAQ.

#### `GET /faq/docs` (Ambil Dokumen Referensi FAQ)
- [ ] **Blackbox**:
  - Mengembalikan `200 OK` list dokumen referensi.

#### `DELETE /faq/docs/:docsId` (Hapus Referensi Dokumen FAQ)
- [ ] **Blackbox**:
  - Mengembalikan `200 OK`.

#### `POST /faq/ask` (Tanya AI FAQ)
- [ ] **Blackbox**:
  - Mengembalikan `201 Created` berisi jawaban AI berdasarkan dokumen FAQ.
- [ ] **Whitebox**:
  - Menguji integrasi model AI/RAG dalam merespons pertanyaan berdasarkan knowledge base.

#### `GET /faq/:companyId/history` (Riwayat Pertanyaan FAQ)
- [ ] **Blackbox**:
  - Mengembalikan `200 OK` riwayat pertanyaan masuk.

---

### 17. Customer Pairing Module (`/customer-pairing`)

#### `POST /customer-pairing/start` (Mulai Pencocokan/Pairing Customer)
- [ ] **Blackbox**:
  - Mengembalikan `201 Created` status pairing terdaftar.

#### `POST /customer-pairing/complete` (Selesaikan Pairing)
- [ ] **Blackbox**:
  - Mengembalikan `200 OK` dengan relasi pairing terverifikasi.

#### `GET /customer-pairing` (Ambil Status Pairing)
- [ ] **Blackbox**:
  - Mengembalikan `200 OK` daftar status pairing.

#### `GET /customer-pairing/company/:companyId` (Daftar Pairing Berdasarkan Perusahaan)
- [ ] **Blackbox**:
  - Mengembalikan `200 OK` daftar pairing perusahaan.

#### `DELETE /customer-pairing/:external_account_id` (Hapus Relasi Pairing)
- [ ] **Blackbox**:
  - Mengembalikan `200 OK`.

---

### 18. Service Price Module (`/service-price`)

#### `GET /service-price` (Ambil Semua Harga Layanan)
- [ ] **Blackbox**:
  - Mengembalikan `200 OK` list harga layanan.

#### `POST /service-price` (Buat Skema Harga Layanan Baru)
- [ ] **Blackbox**:
  - Mengembalikan `201 Created`.

#### `PUT /service-price/:id` (Update Skema Harga)
- [ ] **Blackbox**:
  - Mengembalikan `200 OK`.

#### `DELETE /service-price/:id` (Hapus Skema Harga)
- [ ] **Blackbox**:
  - Mengembalikan `200 OK`.

---

## Verification Plan

### Automated Tests
Jalankan pengujian menggunakan runner Jest:
```bash
# Menjalankan seluruh pengujian E2E
npm run test:e2e

# Menjalankan pengujian E2E dengan coverage report
npm run test:e2e -- --coverage
```

### Manual Verification
- Jalankan aplikasi secara lokal dengan `npm run start:dev` untuk membandingkan output API manual (via Postman/Swagger `/api-docs`) dengan hasil tes otomatis.
