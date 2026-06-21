# Test Case API Testing — WorkOrder-Service

Dokumen ini berisi daftar test case positif (+) dan negatif (-) untuk seluruh endpoint API.

> **Konvensi ID**: `TC-[MODULE]-[NOMOR]`
> **Tipe**: (+) = Positif | (-) = Negatif

---

## 1. Authentication (`/auth`)

| ID Test | Skenario Pengujian | Data Uji | Response yang Diharapkan |
|---|---|---|---|
| TC-AUTH-01 (+) | Login dengan kredensial valid | `POST /auth/login` — `{"email":"user@mail.com","password":"password123"}` | `200 OK` — Token JWT dan data profil user |
| TC-AUTH-02 (-) | Login dengan password salah | `POST /auth/login` — `{"email":"user@mail.com","password":"wrongpass"}` | `400 Bad Request` — `"Invalid credentials"` |
| TC-AUTH-03 (-) | Login dengan email tidak terdaftar | `POST /auth/login` — `{"email":"notexist@mail.com","password":"password123"}` | `400 Bad Request` — `"Invalid credentials"` |
| TC-AUTH-04 (-) | Login dengan body kosong | `POST /auth/login` — `{}` | `400 Bad Request` — `"Validation failed"` |
| TC-AUTH-05 (+) | Registrasi user baru (client) | `POST /auth/register` — `{"name":"John","email":"john@mail.com","password":"password123","role":"client"}` | `200 OK` — Data user terbuat |
| TC-AUTH-06 (-) | Registrasi dengan email sudah terdaftar | `POST /auth/register` — `{"name":"John","email":"john@mail.com","password":"password123","role":"client"}` | `400 Bad Request` — `"Email already registered"` |
| TC-AUTH-07 (-) | Registrasi dengan field tidak valid (nama kosong, email salah format, password < 6 char) | `POST /auth/register` — `{"name":"","email":"not-email","password":"12","role":"invalid"}` | `400 Bad Request` — `"Validation failed"` |
| TC-AUTH-08 (+) | Registrasi owner + perusahaan | `POST /auth/register-company` — `{"name":"Owner","email":"owner@co.com","password":"password123","companyName":"ACME Corp"}` | `200 OK` — Record User dan Company terbuat |
| TC-AUTH-09 (-) | Registrasi owner dengan email sudah terdaftar | `POST /auth/register-company` — `{"name":"Owner","email":"owner@co.com","password":"password123","companyName":"ACME"}` | `400 Bad Request` — `"Email already registered"` |
| TC-AUTH-10 (-) | Registrasi owner dengan payload tidak lengkap | `POST /auth/register-company` — `{"name":"","email":"invalid"}` | `400 Bad Request` — `"Validation failed"` |
| TC-AUTH-11 (+) | Logout dengan token valid | `POST /auth/logout` — Header: `Authorization: Bearer <token>` | `200 OK` — `"Logout successful"` |
| TC-AUTH-12 (-) | Logout tanpa token | `POST /auth/logout` — Tanpa Authorization header | `401 Unauthorized` |
| TC-AUTH-13 (+) | Ambil profil user terautentikasi | `GET /auth/profile` — Header: `Authorization: Bearer <token>` | `200 OK` — Data profil tanpa field password |
| TC-AUTH-14 (-) | Ambil profil tanpa token | `GET /auth/profile` — Tanpa Authorization header | `401 Unauthorized` |

---

## 2. Dashboard (`/dashboard`)

| ID Test | Skenario Pengujian | Data Uji | Response yang Diharapkan |
|---|---|---|---|
| TC-DASH-01 (+) | Ambil statistik service request dengan token owner | `GET /dashboard/service-request?period_type=monthly` — Header: `Bearer <token-owner>` | `200 OK` — Data metrik service request |
| TC-DASH-02 (-) | Akses statistik service request tanpa token | `GET /dashboard/service-request?period_type=monthly` — Tanpa header | `401 Unauthorized` |
| TC-DASH-03 (-) | Akses statistik service request dengan period_type tidak valid | `GET /dashboard/service-request?period_type=invalid` — Header: `Bearer <token-owner>` | `400 Bad Request` — `"Validation failed"` |
| TC-DASH-04 (+) | Ambil statistik work order dengan token owner | `GET /dashboard/work-order?period_type=monthly` — Header: `Bearer <token-owner>` | `200 OK` — Data metrik work order |
| TC-DASH-05 (-) | Akses statistik work order tanpa token | `GET /dashboard/work-order?period_type=monthly` — Tanpa header | `401 Unauthorized` |
| TC-DASH-06 (+) | Ambil data dashboard company | `GET /dashboard/company/` — Header: `Bearer <token-owner>` | `200 OK` — Data ringkasan perusahaan |
| TC-DASH-07 (-) | Akses dashboard company sebagai client | `GET /dashboard/company/` — Header: `Bearer <token-client>` | `403 Forbidden` |

---

## 3. Notifications (`/notifications`)

| ID Test | Skenario Pengujian | Data Uji | Response yang Diharapkan |
|---|---|---|---|
| TC-NOTIF-01 (+) | Daftarkan FCM token baru | `POST /notifications/fcm-token` — `{"token":"fcm-token-abc123"}` — Header: `Bearer <token>` | `201 Created` — Token terdaftar |
| TC-NOTIF-02 (-) | Daftarkan FCM token tanpa auth | `POST /notifications/fcm-token` — `{"token":"fcm-token-abc123"}` — Tanpa header | `401 Unauthorized` |
| TC-NOTIF-03 (-) | Daftarkan FCM token duplikat | `POST /notifications/fcm-token` — `{"token":"<existing-token>"}` | `201 Created` — Tanpa duplikasi di DB |
| TC-NOTIF-04 (+) | Hapus FCM token terdaftar | `DELETE /notifications/fcm-token` — `{"token":"fcm-token-abc123"}` — Header: `Bearer <token>` | `200 OK` |
| TC-NOTIF-05 (-) | Hapus FCM token yang tidak terdaftar | `DELETE /notifications/fcm-token` — `{"token":"non-existent"}` | `200 OK` (idempotent) |
| TC-NOTIF-06 (+) | Ambil daftar notifikasi user | `GET /notifications` — Header: `Bearer <token>` | `200 OK` — Array notifikasi |
| TC-NOTIF-07 (-) | Ambil notifikasi tanpa token | `GET /notifications` — Tanpa header | `401 Unauthorized` |

---

## 4. Service Requests (`/service-requests`)

| ID Test | Skenario Pengujian | Data Uji | Response yang Diharapkan |
|---|---|---|---|
| TC-SR-01 (+) | Ambil riwayat service request yang dikirim | `GET /service-requests/sent` — Header: `Bearer <token-client>` | `200 OK` — Array service request |
| TC-SR-02 (-) | Akses riwayat sent tanpa token | `GET /service-requests/sent` — Tanpa header | `401 Unauthorized` |
| TC-SR-03 (+) | Ambil inbox service request (owner/manager) | `GET /service-requests/inbox` — Header: `Bearer <token-owner>` | `200 OK` — Array service request masuk |
| TC-SR-04 (-) | Akses inbox sebagai client (role tidak diizinkan) | `GET /service-requests/inbox` — Header: `Bearer <token-client>` | `403 Forbidden` |
| TC-SR-05 (+) | Ambil detail service request by ID | `GET /service-requests/:id` — ID valid — Header: `Bearer <token>` | `200 OK` — Detail service request |
| TC-SR-06 (-) | Ambil detail service request dengan ID tidak terdaftar | `GET /service-requests/:id` — Fake ObjectId | `404 Not Found` |
| TC-SR-07 (+) | Tolak service request | `PATCH /service-requests/:id/reject` — ID valid — Header: `Bearer <token-owner>` | `200 OK` — Status berubah menjadi rejected |
| TC-SR-08 (-) | Tolak service request yang sudah diproses | `PATCH /service-requests/:id/reject` — ID SR yang sudah approved | `400 Bad Request` — Status tidak dapat diubah |
| TC-SR-09 (+) | Setujui service request | `PATCH /service-requests/:id/approve` — ID valid — Header: `Bearer <token-owner>` | `200 OK` — Status berubah menjadi approved |
| TC-SR-10 (-) | Setujui service request tanpa token | `PATCH /service-requests/:id/approve` — Tanpa header | `401 Unauthorized` |
| TC-SR-11 (+) | Submit intake form / buat service request | `POST /service-requests/service/:id` — `{"answers":[...]}` — Header: `Bearer <token-client>` | `201 Created` — Service request terbuat |
| TC-SR-12 (-) | Submit intake form dengan serviceId tidak terdaftar | `POST /service-requests/service/:id` — Fake ObjectId | `404 Not Found` |
| TC-SR-13 (-) | Submit intake form dengan body kosong | `POST /service-requests/service/:id` — `{}` | `400 Bad Request` — `"Validation failed"` |
| TC-SR-14 (+) | Ambil laporan pekerjaan untuk service request | `GET /service-requests/:id/report` — ID valid — Header: `Bearer <token>` | `200 OK` — Data laporan |
| TC-SR-15 (-) | Ambil laporan dengan ID SR tidak terdaftar | `GET /service-requests/:id/report` — Fake ObjectId | `404 Not Found` |
| TC-SR-16 (+) | Kirim review untuk service request | `POST /service-requests/:id/review` — `{"rating":5,"comment":"Bagus"}` — Header: `Bearer <token-client>` | `200 OK` — Review tersimpan |
| TC-SR-17 (-) | Kirim review dengan rating di luar range | `POST /service-requests/:id/review` — `{"rating":10,"comment":""}` | `400 Bad Request` — `"Validation failed"` |
| TC-SR-18 (-) | Kirim review untuk SR yang belum selesai | `POST /service-requests/:id/review` — ID SR status bukan completed | `400 Bad Request` |

---

## 5. Public Services (`/public`)

| ID Test | Skenario Pengujian | Data Uji | Response yang Diharapkan |
|---|---|---|---|
| TC-PUB-01 (+) | Ambil intake form publik tanpa auth | `GET /public/services/:id/intake-form` — ID service valid | `200 OK` — Data intake form |
| TC-PUB-02 (-) | Ambil intake form dengan ID tidak terdaftar | `GET /public/services/:id/intake-form` — Fake ObjectId | `404 Not Found` |
| TC-PUB-03 (+) | Ambil daftar semua perusahaan publik | `GET /public/companies` — Tanpa auth | `200 OK` — List perusahaan aktif |
| TC-PUB-04 (+) | Ambil detail perusahaan publik by ID | `GET /public/companies/:companyId` — ID valid | `200 OK` — Detail perusahaan |
| TC-PUB-05 (-) | Ambil detail perusahaan publik dengan ID tidak terdaftar | `GET /public/companies/:companyId` — Fake ObjectId | `404 Not Found` |
| TC-PUB-06 (+) | Ambil layanan perusahaan publik | `GET /public/companies/:companyId/services` — ID valid | `200 OK` — Daftar layanan aktif |
| TC-PUB-07 (-) | Ambil layanan perusahaan dengan companyId tidak terdaftar | `GET /public/companies/:companyId/services` — Fake ObjectId | `404 Not Found` |

---

## 6. Services (`/services`)

| ID Test | Skenario Pengujian | Data Uji | Response yang Diharapkan |
|---|---|---|---|
| TC-SVC-01 (+) | Ambil semua layanan internal | `GET /services` — Header: `Bearer <token-owner>` | `200 OK` — Daftar layanan |
| TC-SVC-02 (-) | Ambil layanan tanpa token | `GET /services` — Tanpa header | `401 Unauthorized` |
| TC-SVC-03 (+) | Ambil detail layanan by ID | `GET /services/:id` — ID valid — Header: `Bearer <token-owner>` | `200 OK` — Detail layanan |
| TC-SVC-04 (-) | Ambil detail layanan dengan ID tidak terdaftar | `GET /services/:id` — Fake ObjectId | `404 Not Found` |
| TC-SVC-05 (+) | Buat layanan baru dengan payload valid | `POST /services` — `{"title":"Layanan Baru","accessType":"internal","draftingWorkOrderType":"auto",...}` — Header: `Bearer <token-owner>` | `201 Created` — Detail layanan baru |
| TC-SVC-06 (-) | Buat layanan tanpa field wajib (title kosong) | `POST /services` — `{"title":"","accessType":"internal"}` | `400 Bad Request` — `"Validation failed"` |
| TC-SVC-07 (-) | Buat layanan sebagai client (role tidak diizinkan) | `POST /services` — Header: `Bearer <token-client>` | `403 Forbidden` |
| TC-SVC-08 (+) | Update layanan dengan payload valid | `PUT /services/:id` — `{"title":"Updated"}` — Header: `Bearer <token-owner>` | `200 OK` — Data terupdate |
| TC-SVC-09 (-) | Update layanan dengan ID tidak terdaftar | `PUT /services/:id` — Fake ObjectId | `404 Not Found` |
| TC-SVC-10 (+) | Toggle aktif/nonaktif layanan | `PATCH /services/:id/toggle-active` — `{"isActive":false}` — Header: `Bearer <token-owner>` | `200 OK` — `isActive: false` |
| TC-SVC-11 (-) | Toggle layanan dengan ID tidak terdaftar | `PATCH /services/:id/toggle-active` — Fake ObjectId | `404 Not Found` |
| TC-SVC-12 (+) | Hapus layanan (soft delete) | `DELETE /services/:id` — ID valid — Header: `Bearer <token-owner>` | `200 OK` — `deletedAt` terisi |
| TC-SVC-13 (-) | Hapus layanan dengan ID tidak terdaftar | `DELETE /services/:id` — Fake ObjectId | `404 Not Found` |
| TC-SVC-14 (+) | Buat work order dari layanan | `POST /services/:id/create-work-order` — Header: `Bearer <token-owner>` | `201 Created` — Work order terbuat |
| TC-SVC-15 (-) | Buat work order dari layanan tidak terdaftar | `POST /services/:id/create-work-order` — Fake ObjectId | `404 Not Found` |
| TC-SVC-16 (+) | Ambil intake form layanan (staff) | `GET /services/:id/intake-form` — Header: `Bearer <token-staff>` | `200 OK` — Data intake form |
| TC-SVC-17 (-) | Ambil intake form layanan tidak terdaftar | `GET /services/:id/intake-form` — Fake ObjectId | `404 Not Found` |

---

## 7. Work Orders (`/workorders`)

| ID Test | Skenario Pengujian | Data Uji | Response yang Diharapkan |
|---|---|---|---|
| TC-WO-01 (+) | Ambil semua work order | `GET /workorders` — Header: `Bearer <token-owner>` | `200 OK` — Daftar work order |
| TC-WO-02 (-) | Ambil work order tanpa token | `GET /workorders` — Tanpa header | `401 Unauthorized` |
| TC-WO-03 (+) | Ambil detail work order by ID | `GET /workorders/:id` — ID valid — Header: `Bearer <token>` | `200 OK` — Detail work order |
| TC-WO-04 (-) | Ambil detail work order dengan ID tidak terdaftar | `GET /workorders/:id` — Fake ObjectId | `404 Not Found` |
| TC-WO-05 (+) | Recreate work order yang ditolak | `POST /workorders/:id/recreate` — ID WO rejected — Header: `Bearer <token-owner>` | `201 Created` — WO baru terbuat |
| TC-WO-06 (-) | Recreate work order yang belum ditolak | `POST /workorders/:id/recreate` — ID WO status bukan rejected | `400 Bad Request` |
| TC-WO-07 (+) | Submit data form work order | `PUT /workorders/:id/submissions` — `{"answers":[...]}` — Header: `Bearer <token-staff>` | `200 OK` — Data form tersimpan |
| TC-WO-08 (-) | Submit form work order dengan body kosong | `PUT /workorders/:id/submissions` — `{}` | `400 Bad Request` — `"Validation failed"` |
| TC-WO-09 (+) | Assign staff ke work order | `PUT /workorders/:id/assign-staffs` — `{"staffIds":["<staff-id>"]}` — Header: `Bearer <token-owner>` | `200 OK` — Staff ter-assign |
| TC-WO-10 (-) | Assign staff dengan staffId tidak terdaftar | `PUT /workorders/:id/assign-staffs` — `{"staffIds":["<fake-id>"]}` | `404 Not Found` |
| TC-WO-11 (+) | Tandai konfigurasi WO selesai (sent) | `PATCH /workorders/:id/sent` — ID valid — Header: `Bearer <token-owner>` | `200 OK` — Status berubah ke sent |
| TC-WO-12 (-) | Sent WO yang belum dikonfigurasi | `PATCH /workorders/:id/sent` — ID WO status tidak sesuai | `400 Bad Request` |
| TC-WO-13 (+) | Setujui work order | `PATCH /workorders/:id/approve` — ID valid — Header: `Bearer <token-owner>` | `200 OK` — Status approved |
| TC-WO-14 (-) | Approve WO yang bukan status pending | `PATCH /workorders/:id/approve` — ID WO status bukan pending | `400 Bad Request` |
| TC-WO-15 (+) | Tolak work order | `PATCH /workorders/:id/reject` — ID valid — Header: `Bearer <token-owner>` | `200 OK` — Status rejected |
| TC-WO-16 (-) | Reject WO tanpa token | `PATCH /workorders/:id/reject` — Tanpa header | `401 Unauthorized` |
| TC-WO-17 (+) | Batalkan work order | `PATCH /workorders/:id/cancel` — ID valid — Header: `Bearer <token-owner>` | `200 OK` — Status cancelled |
| TC-WO-18 (-) | Cancel WO yang sudah completed | `PATCH /workorders/:id/cancel` — ID WO status completed | `400 Bad Request` |
| TC-WO-19 (+) | Selesaikan work order | `PATCH /workorders/:id/complete` — ID valid — Header: `Bearer <token-owner>` | `200 OK` — Status completed |
| TC-WO-20 (-) | Complete WO yang bukan status in_progress | `PATCH /workorders/:id/complete` — ID WO status bukan in_progress | `400 Bad Request` |
| TC-WO-21 (+) | Mulai work order (in progress) | `PATCH /workorders/:id/start` — ID valid — Header: `Bearer <token-staff>` | `200 OK` — Status in_progress |
| TC-WO-22 (-) | Start WO yang bukan status approved | `PATCH /workorders/:id/start` — ID WO status bukan approved | `400 Bad Request` |
| TC-WO-23 (+) | Tandai work order gagal | `PATCH /workorders/:id/fail` — ID valid — Header: `Bearer <token-staff>` | `200 OK` — Status failed |
| TC-WO-24 (-) | Fail WO yang bukan status in_progress | `PATCH /workorders/:id/fail` — ID WO status bukan in_progress | `400 Bad Request` |
| TC-WO-25 (+) | Ambil laporan work order | `GET /workorders/:id/report` — ID valid — Header: `Bearer <token>` | `200 OK` — Data laporan |
| TC-WO-26 (-) | Ambil laporan WO dengan ID tidak terdaftar | `GET /workorders/:id/report` — Fake ObjectId | `404 Not Found` |

---

## 8. Work Reports (`/workreports`)

| ID Test | Skenario Pengujian | Data Uji | Response yang Diharapkan |
|---|---|---|---|
| TC-WR-01 (+) | Submit data work report | `POST /workreports/:id/submit` — `{"fields":[...]}` — Header: `Bearer <token-staff>` | `200 OK` — Data report tersimpan |
| TC-WR-02 (-) | Submit work report dengan body kosong | `POST /workreports/:id/submit` — `{}` | `400 Bad Request` — `"Validation failed"` |
| TC-WR-03 (-) | Submit work report dengan ID tidak terdaftar | `POST /workreports/:id/submit` — Fake ObjectId | `404 Not Found` |
| TC-WR-04 (+) | Kirim work report untuk review | `PATCH /workreports/:id/sent` — ID valid — Header: `Bearer <token-staff>` | `200 OK` — Status berubah ke sent |
| TC-WR-05 (-) | Sent work report yang sudah dikirim | `PATCH /workreports/:id/sent` — ID WR status bukan draft | `400 Bad Request` |
| TC-WR-06 (+) | Setujui work report | `PATCH /workreports/:id/approve` — ID valid — Header: `Bearer <token-owner>` | `200 OK` — Status approved |
| TC-WR-07 (-) | Approve work report yang bukan status sent | `PATCH /workreports/:id/approve` — ID WR status bukan sent | `400 Bad Request` |
| TC-WR-08 (-) | Approve work report tanpa token | `PATCH /workreports/:id/approve` — Tanpa header | `401 Unauthorized` |
| TC-WR-09 (+) | Tolak work report | `PATCH /workreports/:id/reject` — ID valid — Header: `Bearer <token-owner>` | `200 OK` — Status rejected |
| TC-WR-10 (-) | Reject work report dengan ID tidak terdaftar | `PATCH /workreports/:id/reject` — Fake ObjectId | `404 Not Found` |

---

## 9. Company Profile & Employees (`/company`)

| ID Test | Skenario Pengujian | Data Uji | Response yang Diharapkan |
|---|---|---|---|
| TC-COMP-01 (+) | Ambil profil perusahaan | `GET /company` — Header: `Bearer <token-owner>` | `200 OK` — Detail perusahaan |
| TC-COMP-02 (-) | Akses profil perusahaan sebagai client | `GET /company` — Header: `Bearer <token-client>` | `403 Forbidden` |
| TC-COMP-03 (+) | Ambil detail perusahaan by ID | `GET /company/:id` — ID valid — Header: `Bearer <token>` | `200 OK` — Detail perusahaan |
| TC-COMP-04 (-) | Ambil detail perusahaan dengan ID tidak terdaftar | `GET /company/:id` — Fake ObjectId | `404 Not Found` |
| TC-COMP-05 (+) | Update profil perusahaan | `PUT /company` — `{"name":"ACME Global","address":"Jl. Raya 1","description":"Tech"}` — Header: `Bearer <token-owner>` | `200 OK` — Data terupdate |
| TC-COMP-06 (-) | Update profil perusahaan tanpa token | `PUT /company` — Tanpa header | `401 Unauthorized` |
| TC-COMP-07 (+) | Ambil daftar karyawan perusahaan | `GET /company/employees` — Header: `Bearer <token-owner>` | `200 OK` — List karyawan |
| TC-COMP-08 (-) | Akses daftar karyawan sebagai client | `GET /company/employees` — Header: `Bearer <token-client>` | `403 Forbidden` |
| TC-COMP-09 (+) | Ambil detail karyawan by ID | `GET /company/employees/:id` — ID valid — Header: `Bearer <token-owner>` | `200 OK` — Detail karyawan |
| TC-COMP-10 (-) | Ambil detail karyawan dengan ID tidak terdaftar | `GET /company/employees/:id` — Fake ObjectId | `404 Not Found` |
| TC-COMP-11 (+) | Keluarkan karyawan dari perusahaan | `DELETE /company/employees` — `{"employeeId":"<id>"}` — Header: `Bearer <token-owner>` | `200 OK` — Karyawan dikeluarkan |
| TC-COMP-12 (-) | Keluarkan karyawan dengan ID tidak terdaftar | `DELETE /company/employees` — `{"employeeId":"<fake-id>"}` | `404 Not Found` |
| TC-COMP-13 (+) | Undang karyawan baru | `POST /company/invite` — `{"invites":[{"email":"staff@mail.com","role":"company_staff"}]}` — Header: `Bearer <token-owner>` | `201 Created` — Invitation terbuat |
| TC-COMP-14 (-) | Undang user yang sudah menjadi karyawan | `POST /company/invite` — `{"invites":[{"email":"existing@mail.com","role":"company_staff"}]}` | `422 Unprocessable Entity` — `"Validation failed"` |
| TC-COMP-15 (-) | Undang karyawan tanpa token | `POST /company/invite` — Tanpa header | `401 Unauthorized` |
| TC-COMP-16 (+) | Ambil riwayat undangan | `GET /company/invitations/history` — Header: `Bearer <token-owner>` | `200 OK` — List riwayat undangan |
| TC-COMP-17 (+) | Ambil konfigurasi integrasi | `GET /company/integration-config` — Header: `Bearer <token-owner>` | `200 OK` — Data konfigurasi integrasi |
| TC-COMP-18 (-) | Akses konfigurasi integrasi tanpa token | `GET /company/integration-config` — Tanpa header | `401 Unauthorized` |
| TC-COMP-19 (+) | Update konfigurasi integrasi | `PUT /company/integration-config` — `{"is_integration_active":true,"integration_type":"external"}` — Header: `Bearer <token-owner>` | `200 OK` — Konfigurasi terupdate |
| TC-COMP-20 (-) | Update konfigurasi integrasi sebagai staff (bukan owner) | `PUT /company/integration-config` — Header: `Bearer <token-staff>` | `403 Forbidden` |

---

## 10. Invitations (`/invitations`)

| ID Test | Skenario Pengujian | Data Uji | Response yang Diharapkan |
|---|---|---|---|
| TC-INV-01 (+) | Ambil undangan pending untuk staff | `GET /invitations/pending` — Header: `Bearer <token-staff>` | `200 OK` — List undangan pending |
| TC-INV-02 (-) | Ambil undangan pending tanpa token | `GET /invitations/pending` — Tanpa header | `401 Unauthorized` |
| TC-INV-03 (+) | Terima undangan bergabung perusahaan | `PUT /invitations/:id/accept` — ID valid — Header: `Bearer <token-staff>` | `200 OK` — Status accepted, companyId terisi |
| TC-INV-04 (-) | Terima undangan yang sudah diterima (duplikasi) | `PUT /invitations/:id/accept` — ID undangan status accepted | `400 Bad Request` |
| TC-INV-05 (-) | Terima undangan dengan ID tidak terdaftar | `PUT /invitations/:id/accept` — Fake ObjectId | `404 Not Found` |
| TC-INV-06 (+) | Tolak undangan | `PUT /invitations/:id/reject` — ID valid — Header: `Bearer <token-staff>` | `200 OK` — Status rejected |
| TC-INV-07 (-) | Tolak undangan yang sudah diproses | `PUT /invitations/:id/reject` — ID undangan status bukan pending | `400 Bad Request` |
| TC-INV-08 (+) | Hapus/batalkan undangan oleh owner | `DELETE /invitations/:id` — ID valid — Header: `Bearer <token-owner>` | `200 OK` |
| TC-INV-09 (-) | Batalkan undangan oleh user bukan pengirim | `DELETE /invitations/:id` — Header: `Bearer <token-staff>` (bukan pengirim) | `403 Forbidden` |
| TC-INV-10 (-) | Hapus undangan dengan ID tidak terdaftar | `DELETE /invitations/:id` — Fake ObjectId | `404 Not Found` |

---

## 11. Positions (`/positions`)

| ID Test | Skenario Pengujian | Data Uji | Response yang Diharapkan |
|---|---|---|---|
| TC-POS-01 (+) | Ambil semua posisi | `GET /positions` — Header: `Bearer <token-owner>` | `200 OK` — Daftar posisi |
| TC-POS-02 (-) | Ambil posisi tanpa token | `GET /positions` — Tanpa header | `401 Unauthorized` |
| TC-POS-03 (+) | Buat posisi baru dengan payload valid | `POST /positions` — `{"name":"Teknisi","description":"Instalasi"}` — Header: `Bearer <token-owner>` | `201 Created` — Detail posisi baru |
| TC-POS-04 (-) | Buat posisi dengan nama kosong | `POST /positions` — `{"name":"","description":""}` | `400 Bad Request` — `"Validation failed"` |
| TC-POS-05 (-) | Buat posisi sebagai client (role tidak diizinkan) | `POST /positions` — Header: `Bearer <token-client>` | `403 Forbidden` |
| TC-POS-06 (+) | Ambil detail posisi by ID | `GET /positions/:id` — ID valid — Header: `Bearer <token-owner>` | `200 OK` — Detail posisi |
| TC-POS-07 (-) | Ambil detail posisi dengan ID tidak terdaftar | `GET /positions/:id` — Fake ObjectId | `404 Not Found` |
| TC-POS-08 (+) | Update posisi dengan payload valid | `PUT /positions/:id` — `{"name":"Updated","description":"Desc"}` — Header: `Bearer <token-owner>` | `200 OK` — Data terupdate |
| TC-POS-09 (-) | Update posisi dengan ID tidak terdaftar | `PUT /positions/:id` — Fake ObjectId | `404 Not Found` |
| TC-POS-10 (+) | Hapus posisi | `DELETE /positions/:id` — ID valid — Header: `Bearer <token-owner>` | `200 OK` |
| TC-POS-11 (-) | Hapus posisi dengan ID tidak terdaftar | `DELETE /positions/:id` — Fake ObjectId | `404 Not Found` |

---

## 12. Forms (`/forms`)

| ID Test | Skenario Pengujian | Data Uji | Response yang Diharapkan |
|---|---|---|---|
| TC-FORM-01 (+) | Ambil semua template form | `GET /forms` — Header: `Bearer <token-owner>` | `200 OK` — Daftar form |
| TC-FORM-02 (-) | Ambil form tanpa token | `GET /forms` — Tanpa header | `401 Unauthorized` |
| TC-FORM-03 (+) | Buat form baru dengan payload valid | `POST /forms` — `{"title":"Form Intake","formType":"intake","fields":[...]}` — Header: `Bearer <token-owner>` | `201 Created` — Detail form baru |
| TC-FORM-04 (-) | Buat form tanpa field title | `POST /forms` — `{"formType":"intake","fields":[]}` | `400 Bad Request` — `"Validation failed"` |
| TC-FORM-05 (-) | Buat form dengan formType tidak valid | `POST /forms` — `{"title":"Form","formType":"invalid_type","fields":[]}` | `400 Bad Request` — `"Validation failed"` |
| TC-FORM-06 (+) | Ambil detail form by ID | `GET /forms/:id` — ID valid — Header: `Bearer <token-owner>` | `200 OK` — Detail form |
| TC-FORM-07 (-) | Ambil detail form dengan ID tidak terdaftar | `GET /forms/:id` — Fake ObjectId | `404 Not Found` |
| TC-FORM-08 (+) | Update form dengan payload valid | `PUT /forms/:id` — `{"title":"Updated Form","fields":[...]}` — Header: `Bearer <token-owner>` | `200 OK` — Data terupdate |
| TC-FORM-09 (-) | Update form dengan ID tidak terdaftar | `PUT /forms/:id` — Fake ObjectId | `404 Not Found` |
| TC-FORM-10 (+) | Hapus template form | `DELETE /forms/:id` — ID valid — Header: `Bearer <token-owner>` | `200 OK` |
| TC-FORM-11 (-) | Hapus form dengan ID tidak terdaftar | `DELETE /forms/:id` — Fake ObjectId | `404 Not Found` |

---

## 13. FAQs (`/faq`)

| ID Test | Skenario Pengujian | Data Uji | Response yang Diharapkan |
|---|---|---|---|
| TC-FAQ-01 (+) | Toggle aktif/nonaktif FAQ perusahaan | `PUT /faq/toggle-active` — `{"isActive":true}` — Header: `Bearer <token-owner>` | `200 OK` — Status FAQ terupdate |
| TC-FAQ-02 (-) | Toggle FAQ tanpa token | `PUT /faq/toggle-active` — Tanpa header | `401 Unauthorized` |
| TC-FAQ-03 (+) | Ambil semua dokumen FAQ | `GET /faq/docs` — Header: `Bearer <token-owner>` | `200 OK` — List dokumen FAQ |
| TC-FAQ-04 (-) | Akses dokumen FAQ sebagai client (role tidak diizinkan) | `GET /faq/docs` — Header: `Bearer <token-client>` | `403 Forbidden` |
| TC-FAQ-05 (+) | Upload FAQ sebagai teks | `POST /faq/text-docs` — `{"title":"FAQ 1","content":"Isi FAQ"}` — Header: `Bearer <token-owner>` | `201 Created` — Dokumen FAQ terbuat |
| TC-FAQ-06 (-) | Upload FAQ teks tanpa field wajib | `POST /faq/text-docs` — `{"title":""}` | `400 Bad Request` — `"Validation failed"` |
| TC-FAQ-07 (+) | Upload FAQ sebagai PDF (multipart) | `POST /faq/pdf-docs` — Multipart form: file PDF valid — Header: `Bearer <token-owner>` | `201 Created` — Dokumen FAQ terbuat |
| TC-FAQ-08 (-) | Upload FAQ PDF dengan file bukan PDF | `POST /faq/pdf-docs` — Multipart form: file PNG | `400 Bad Request` — Tipe file tidak diizinkan |
| TC-FAQ-09 (-) | Upload FAQ PDF tanpa file | `POST /faq/pdf-docs` — Multipart form kosong | `400 Bad Request` — `"Validation failed"` |
| TC-FAQ-10 (+) | Hapus dokumen FAQ | `DELETE /faq/docs/:id` — ID valid — Header: `Bearer <token-owner>` | `200 OK` |
| TC-FAQ-11 (-) | Hapus dokumen FAQ dengan ID tidak terdaftar | `DELETE /faq/docs/:id` — Fake ObjectId | `404 Not Found` |
| TC-FAQ-12 (+) | Tanya AI chatbot FAQ | `POST /faq/ask` — `{"question":"Bagaimana cara order?"}` — Header: `Bearer <token>` | `200 OK` — Jawaban AI |
| TC-FAQ-13 (-) | Tanya AI chatbot dengan pertanyaan kosong | `POST /faq/ask` — `{"question":""}` | `400 Bad Request` — `"Validation failed"` |

---

## 14. Templates (`/template`)

| ID Test | Skenario Pengujian | Data Uji | Response yang Diharapkan |
|---|---|---|---|
| TC-TPL-01 (+) | Ambil semua tipe perusahaan untuk template | `GET /template/company-type` — Header: `Bearer <token-owner>` | `200 OK` — List tipe perusahaan |
| TC-TPL-02 (-) | Ambil tipe perusahaan tanpa token | `GET /template/company-type` — Tanpa header | `401 Unauthorized` |
| TC-TPL-03 (+) | Ambil layanan berdasarkan tipe perusahaan | `GET /template/company-type/:id/services` — ID valid — Header: `Bearer <token-owner>` | `200 OK` — Array template layanan |
| TC-TPL-04 (-) | Ambil layanan dengan tipe ID tidak terdaftar | `GET /template/company-type/:id/services` — Fake ObjectId | `404 Not Found` |
| TC-TPL-05 (+) | Preview template layanan by ID | `GET /template/services/:id` — ID valid — Header: `Bearer <token-owner>` | `200 OK` — Detail template |
| TC-TPL-06 (-) | Preview template dengan ID tidak terdaftar | `GET /template/services/:id` — Fake ObjectId | `404 Not Found` |
| TC-TPL-07 (+) | Generate layanan dari template | `POST /template/services/generate` — `{"serviceTemplateIds":["<id>"]}` — Header: `Bearer <token-owner>` | `201 Created` — Layanan ter-generate |
| TC-TPL-08 (-) | Generate dengan serviceTemplateId tidak terdaftar | `POST /template/services/generate` — `{"serviceTemplateIds":["<fake-id>"]}` | `404 Not Found` |
| TC-TPL-09 (-) | Generate tanpa token | `POST /template/services/generate` — Tanpa header | `401 Unauthorized` |
| TC-TPL-10 (-) | Generate dengan body kosong | `POST /template/services/generate` — `{}` | `400 Bad Request` — `"Validation failed"` |

---

## 15. Memberships & Codes (`/memberships`)

| ID Test | Skenario Pengujian | Data Uji | Response yang Diharapkan |
|---|---|---|---|
| TC-MBR-01 (+) | Ambil semua kode membership | `GET /memberships/codes` — Header: `Bearer <token-owner>` | `200 OK` — List kode membership |
| TC-MBR-02 (-) | Ambil kode membership tanpa token | `GET /memberships/codes` — Tanpa header | `401 Unauthorized` |
| TC-MBR-03 (+) | Upload kode membership baru (multipart) | `POST /memberships/codes` — Multipart form: file CSV valid — Header: `Bearer <token-owner>` | `201 Created` — Kode ter-upload |
| TC-MBR-04 (-) | Upload kode tanpa file | `POST /memberships/codes` — Multipart form kosong | `400 Bad Request` — `"Validation failed"` |
| TC-MBR-05 (+) | Hapus kode membership | `DELETE /memberships/codes/:id` — ID valid — Header: `Bearer <token-owner>` | `200 OK` |
| TC-MBR-06 (-) | Hapus kode membership dengan ID tidak terdaftar | `DELETE /memberships/codes/:id` — Fake ObjectId | `404 Not Found` |
| TC-MBR-07 (+) | Klaim kode membership valid | `POST /memberships/codes/claim` — `{"code":"<valid-code>"}` — Header: `Bearer <token-client>` | `200 OK` — User bergabung perusahaan |
| TC-MBR-08 (-) | Klaim kode membership tidak valid | `POST /memberships/codes/claim` — `{"code":"INVALID_CODE"}` | `400 Bad Request` |
| TC-MBR-09 (-) | Klaim kode yang sudah mencapai maxUses | `POST /memberships/codes/claim` — `{"code":"<expired-code>"}` | `400 Bad Request` |
| TC-MBR-10 (+) | Ambil semua membership | `GET /memberships` — Header: `Bearer <token-owner>` | `200 OK` — Daftar membership |
| TC-MBR-11 (-) | Akses membership tanpa token | `GET /memberships` — Tanpa header | `401 Unauthorized` |

---

## 16. Customer Pairing (`/customer-pairing`)

| ID Test | Skenario Pengujian | Data Uji | Response yang Diharapkan |
|---|---|---|---|
| TC-CP-01 (+) | Mulai proses OAuth pairing | `POST /customer-pairing/start` — `{"companyId":"<id>","provider":"google"}` — Header: `Bearer <token-client>` | `200 OK` — URL OAuth redirect |
| TC-CP-02 (-) | Start pairing tanpa token | `POST /customer-pairing/start` — Tanpa header | `401 Unauthorized` |
| TC-CP-03 (-) | Start pairing dengan companyId tidak terdaftar | `POST /customer-pairing/start` — `{"companyId":"<fake-id>"}` | `404 Not Found` |
| TC-CP-04 (+) | Selesaikan OAuth pairing | `POST /customer-pairing/complete` — `{"code":"<oauth-code>","state":"<state>"}` — Header: `Bearer <token-client>` | `200 OK` — Akun ter-pair |
| TC-CP-05 (-) | Complete pairing dengan code tidak valid | `POST /customer-pairing/complete` — `{"code":"invalid","state":"<state>"}` | `400 Bad Request` |
| TC-CP-06 (+) | Ambil semua akun ter-pair (client) | `GET /customer-pairing` — Header: `Bearer <token-client>` | `200 OK` — List akun ter-pair |
| TC-CP-07 (-) | Ambil akun ter-pair tanpa token | `GET /customer-pairing` — Tanpa header | `401 Unauthorized` |
| TC-CP-08 (+) | Ambil akun ter-pair di perusahaan tertentu | `GET /customer-pairing/company/:id` — ID valid — Header: `Bearer <token>` | `200 OK` — Data akun ter-pair |
| TC-CP-09 (-) | Ambil akun ter-pair dengan companyId tidak terdaftar | `GET /customer-pairing/company/:id` — Fake ObjectId | `404 Not Found` |
| TC-CP-10 (+) | Lepas akun ter-pair | `DELETE /customer-pairing/:id` — ID valid — Header: `Bearer <token-client>` | `200 OK` |
| TC-CP-11 (-) | Lepas akun ter-pair dengan ID tidak terdaftar | `DELETE /customer-pairing/:id` — Fake ObjectId | `404 Not Found` |

---

## 17. Service Pricing (`/service-price`)

| ID Test | Skenario Pengujian | Data Uji | Response yang Diharapkan |
|---|---|---|---|
| TC-SP-01 (+) | Ambil semua data pricing | `GET /service-price` — Header: `Bearer <token-owner>` | `200 OK` — Array skema harga |
| TC-SP-02 (-) | Ambil pricing tanpa token | `GET /service-price` — Tanpa header | `401 Unauthorized` |
| TC-SP-03 (+) | Buat pricing baru | `POST /service-price` — `{"name":"Harga Standar","price":100000,"currency":"IDR"}` — Header: `Bearer <token-owner>` | `201 Created` — Detail skema harga |
| TC-SP-04 (-) | Buat pricing dengan field wajib kosong | `POST /service-price` — `{"name":""}` | `400 Bad Request` — `"Validation failed"` |
| TC-SP-05 (-) | Buat pricing sebagai client (role tidak diizinkan) | `POST /service-price` — Header: `Bearer <token-client>` | `403 Forbidden` |
| TC-SP-06 (+) | Update pricing | `PUT /service-price/:id` — `{"name":"Updated","price":75000}` — Header: `Bearer <token-owner>` | `200 OK` — Data terupdate |
| TC-SP-07 (-) | Update pricing dengan ID tidak terdaftar | `PUT /service-price/:id` — Fake ObjectId | `404 Not Found` |
| TC-SP-08 (+) | Hapus pricing | `DELETE /service-price/:id` — ID valid — Header: `Bearer <token-owner>` | `200 OK` |
| TC-SP-09 (-) | Hapus pricing dengan ID tidak terdaftar | `DELETE /service-price/:id` — Fake ObjectId | `404 Not Found` |

---

## 18. File Upload (`/files`)

| ID Test | Skenario Pengujian | Data Uji | Response yang Diharapkan |
|---|---|---|---|
| TC-FILE-01 (+) | Upload file gambar valid (< 5MB) | `POST /files` — Multipart form: file PNG ~100KB — Header: `Bearer <token>` | `201 Created` — URL file di response |
| TC-FILE-02 (-) | Upload file melebihi batas ukuran 5MB | `POST /files` — Multipart form: buffer 6MB | `400 Bad Request` — Ukuran file melebihi batas |
| TC-FILE-03 (-) | Upload file dengan tipe tidak diizinkan (PDF) | `POST /files` — Multipart form: file PDF | `400 Bad Request` — Tipe file tidak diizinkan |
| TC-FILE-04 (-) | Upload file tanpa token | `POST /files` — Multipart form: file valid — Tanpa header | `401 Unauthorized` |
| TC-FILE-05 (-) | Upload tanpa menyertakan file | `POST /files` — Multipart form kosong | `400 Bad Request` — `"Validation failed"` |

---

## Rekap Total Test Case

| Kategori | Jumlah |
|---|---|
| Test Case Positif (+) | 72 |
| Test Case Negatif (-) | 103 |
| **Total Keseluruhan** | **175** |
