# Hasil API Testing — WorkOrder-Service

**Tanggal Pengujian:** 14 Juni 2026
**Environment:** Staging — `https://workorder-portal.up.railway.app`
**Tool:** Postman v11.x
**Tester:** QA Team

**Hasil Keseluruhan**: 175/175 Sesuai (100%)

---

## 1. Authentication (`/auth`)

| No | Skenario Pengujian | Endpoint | Input | Expected Output | Hasil |
|---|---|---|---|---|---|
| TC-AUTH-01 | Login dengan kredensial valid | POST /auth/login | Email dan password valid | Status 200, mengembalikan token JWT dan data user | Sesuai |
| TC-AUTH-02 | Login dengan password salah | POST /auth/login | Email valid, password salah | Status 400, pesan "Invalid credentials" | Sesuai |
| TC-AUTH-03 | Login dengan email tidak terdaftar | POST /auth/login | Email tidak terdaftar | Status 400, pesan "Invalid credentials" | Sesuai |
| TC-AUTH-04 | Login dengan body kosong | POST /auth/login | Body kosong `{}` | Status 400, pesan "Validation failed" | Sesuai |
| TC-AUTH-05 | Registrasi user baru (client) | POST /auth/register | Nama, email, password, dan role "client" valid | Status 200, mengembalikan data user tanpa password | Sesuai |
| TC-AUTH-06 | Registrasi dengan email sudah terdaftar | POST /auth/register | Email yang sudah terdaftar | Status 400, pesan "Email already registered" | Sesuai |
| TC-AUTH-07 | Registrasi dengan field tidak valid | POST /auth/register | Nama kosong, email format salah, password < 6 karakter, role invalid | Status 400, pesan "Validation failed" dengan daftar error | Sesuai |
| TC-AUTH-08 | Registrasi owner + perusahaan | POST /auth/register-company | Nama, email, password, dan companyName valid | Status 200, mengembalikan data user dan company | Sesuai |
| TC-AUTH-09 | Registrasi owner dengan email sudah terdaftar | POST /auth/register-company | Email yang sudah terdaftar | Status 400, pesan "Email already registered" | Sesuai |
| TC-AUTH-10 | Registrasi owner dengan payload tidak lengkap | POST /auth/register-company | Nama kosong, email format salah | Status 400, pesan "Validation failed" | Sesuai |
| TC-AUTH-11 | Logout dengan token valid | POST /auth/logout | Header Authorization dengan token valid | Status 200, pesan "Logout successful" | Sesuai |
| TC-AUTH-12 | Logout tanpa token | POST /auth/logout | Tanpa header Authorization | Status 401 Unauthorized | Sesuai |
| TC-AUTH-13 | Ambil profil user terautentikasi | GET /auth/profile | Header Authorization dengan token valid | Status 200, mengembalikan data profil tanpa field password | Sesuai |
| TC-AUTH-14 | Ambil profil tanpa token | GET /auth/profile | Tanpa header Authorization | Status 401 Unauthorized | Sesuai |

---

## 2. Dashboard (`/dashboard`)

| No | Skenario Pengujian | Endpoint | Input | Expected Output | Hasil |
|---|---|---|---|---|---|
| TC-DASH-01 | Ambil statistik service request | GET /dashboard/service-request | Query period_type=monthly, token owner | Status 200, mengembalikan data metrik service request | Sesuai |
| TC-DASH-02 | Akses statistik service request tanpa token | GET /dashboard/service-request | Query period_type=monthly, tanpa header | Status 401 Unauthorized | Sesuai |
| TC-DASH-03 | Akses statistik dengan period_type tidak valid | GET /dashboard/service-request | Query period_type=invalid, token owner | Status 400, pesan "Validation failed" | Sesuai |
| TC-DASH-04 | Ambil statistik work order | GET /dashboard/work-order | Query period_type=monthly, token owner | Status 200, mengembalikan data metrik work order | Sesuai |
| TC-DASH-05 | Akses statistik work order tanpa token | GET /dashboard/work-order | Query period_type=monthly, tanpa header | Status 401 Unauthorized | Sesuai |
| TC-DASH-06 | Ambil data dashboard company | GET /dashboard/company/ | Token owner | Status 200, mengembalikan data ringkasan perusahaan | Sesuai |
| TC-DASH-07 | Akses dashboard company sebagai client | GET /dashboard/company/ | Token client | Status 403 Forbidden | Sesuai |

---

## 3. Notifications (`/notifications`)

| No | Skenario Pengujian | Endpoint | Input | Expected Output | Hasil |
|---|---|---|---|---|---|
| TC-NOTIF-01 | Daftarkan FCM token baru | POST /notifications/fcm-token | Body token FCM valid, header Authorization | Status 201, token terdaftar | Sesuai |
| TC-NOTIF-02 | Daftarkan FCM token tanpa auth | POST /notifications/fcm-token | Body token FCM valid, tanpa header | Status 401 Unauthorized | Sesuai |
| TC-NOTIF-03 | Daftarkan FCM token duplikat | POST /notifications/fcm-token | Token FCM yang sudah terdaftar | Status 201, tanpa duplikasi di database | Sesuai |
| TC-NOTIF-04 | Hapus FCM token terdaftar | DELETE /notifications/fcm-token | Body token FCM valid, header Authorization | Status 200, token dihapus | Sesuai |
| TC-NOTIF-05 | Hapus FCM token yang tidak terdaftar | DELETE /notifications/fcm-token | Token FCM yang tidak ada | Status 200, operasi idempotent | Sesuai |
| TC-NOTIF-06 | Ambil daftar notifikasi user | GET /notifications | Header Authorization dengan token valid | Status 200, mengembalikan array notifikasi | Sesuai |
| TC-NOTIF-07 | Ambil notifikasi tanpa token | GET /notifications | Tanpa header Authorization | Status 401 Unauthorized | Sesuai |

---

## 4. Service Requests (`/service-requests`)

| No | Skenario Pengujian | Endpoint | Input | Expected Output | Hasil |
|---|---|---|---|---|---|
| TC-SR-01 | Ambil riwayat service request yang dikirim | GET /service-requests/sent | Token client | Status 200, mengembalikan array service request | Sesuai |
| TC-SR-02 | Akses riwayat sent tanpa token | GET /service-requests/sent | Tanpa header Authorization | Status 401 Unauthorized | Sesuai |
| TC-SR-03 | Ambil inbox service request (owner) | GET /service-requests/inbox | Token owner | Status 200, mengembalikan array service request masuk | Sesuai |
| TC-SR-04 | Akses inbox sebagai client | GET /service-requests/inbox | Token client | Status 403 Forbidden | Sesuai |
| TC-SR-05 | Ambil detail service request by ID | GET /service-requests/:id | ID valid, token user | Status 200, mengembalikan detail service request | Sesuai |
| TC-SR-06 | Ambil detail SR dengan ID tidak terdaftar | GET /service-requests/:id | Fake ObjectId | Status 404, pesan "Service Request not found" | Sesuai |
| TC-SR-07 | Tolak service request | PATCH /service-requests/:id/reject | ID valid, token owner | Status 200, status berubah menjadi rejected | Sesuai |
| TC-SR-08 | Tolak SR yang sudah diproses | PATCH /service-requests/:id/reject | ID SR yang sudah approved | Status 400, pesan "Status tidak dapat diubah" | Sesuai |
| TC-SR-09 | Setujui service request | PATCH /service-requests/:id/approve | ID valid, token owner | Status 200, status berubah menjadi approved | Sesuai |
| TC-SR-10 | Setujui SR tanpa token | PATCH /service-requests/:id/approve | Tanpa header Authorization | Status 401 Unauthorized | Sesuai |
| TC-SR-11 | Submit intake form / buat SR | POST /service-requests/service/:id | Body submission dengan fieldsData, token client | Status 201, service request terbuat | Sesuai |
| TC-SR-12 | Submit intake dengan serviceId tidak terdaftar | POST /service-requests/service/:id | Fake ObjectId | Status 404, pesan "Service not found" | Sesuai |
| TC-SR-13 | Submit intake dengan body kosong | POST /service-requests/service/:id | Body kosong `{}` | Status 400, pesan "Validation failed" | Sesuai |
| TC-SR-14 | Ambil laporan pekerjaan untuk SR | GET /service-requests/:id/report | ID valid, token user | Status 200, mengembalikan data laporan | Sesuai |
| TC-SR-15 | Ambil laporan dengan ID SR tidak terdaftar | GET /service-requests/:id/report | Fake ObjectId | Status 404, pesan "Service Request not found" | Sesuai |
| TC-SR-16 | Kirim review untuk service request | POST /service-requests/:id/review | Body rating dan comment, token client | Status 200, review tersimpan | Sesuai |
| TC-SR-17 | Kirim review dengan rating di luar range | POST /service-requests/:id/review | Rating bernilai 10, comment kosong | Status 400, pesan "Validation failed" | Sesuai |
| TC-SR-18 | Kirim review untuk SR yang belum selesai | POST /service-requests/:id/review | ID SR dengan status bukan completed | Status 400, pesan "Ulasan hanya dapat dikirimkan saat status selesai" | Sesuai |

---

## 5. Public Services (`/public`)

| No | Skenario Pengujian | Endpoint | Input | Expected Output | Hasil |
|---|---|---|---|---|---|
| TC-PUB-01 | Ambil intake form publik tanpa auth | GET /public/services/:id/intake-form | ID service valid | Status 200, mengembalikan data intake form | Sesuai |
| TC-PUB-02 | Ambil intake form dengan ID tidak terdaftar | GET /public/services/:id/intake-form | Fake ObjectId | Status 404, pesan "Service not found" | Sesuai |
| TC-PUB-03 | Ambil daftar semua perusahaan publik | GET /public/companies | Tanpa auth | Status 200, mengembalikan list perusahaan aktif | Sesuai |
| TC-PUB-04 | Ambil detail perusahaan publik by ID | GET /public/companies/:companyId | ID valid | Status 200, mengembalikan detail perusahaan | Sesuai |
| TC-PUB-05 | Ambil detail perusahaan dengan ID tidak terdaftar | GET /public/companies/:companyId | Fake ObjectId | Status 404, pesan "Company not found" | Sesuai |
| TC-PUB-06 | Ambil layanan perusahaan publik | GET /public/companies/:companyId/services | ID valid | Status 200, mengembalikan daftar layanan aktif | Sesuai |
| TC-PUB-07 | Ambil layanan dengan companyId tidak terdaftar | GET /public/companies/:companyId/services | Fake ObjectId | Status 404, pesan "Company not found" | Sesuai |

---

## 6. Services (`/services`)

| No | Skenario Pengujian | Endpoint | Input | Expected Output | Hasil |
|---|---|---|---|---|---|
| TC-SVC-01 | Ambil semua layanan internal | GET /services | Token owner | Status 200, mengembalikan daftar layanan | Sesuai |
| TC-SVC-02 | Ambil layanan tanpa token | GET /services | Tanpa header Authorization | Status 401 Unauthorized | Sesuai |
| TC-SVC-03 | Ambil detail layanan by ID | GET /services/:id | ID valid, token owner | Status 200, mengembalikan detail layanan | Sesuai |
| TC-SVC-04 | Ambil detail layanan dengan ID tidak terdaftar | GET /services/:id | Fake ObjectId | Status 404, pesan "Service not found" | Sesuai |
| TC-SVC-05 | Buat layanan baru dengan payload valid | POST /services | Body title, accessType, draftingWorkOrderType, serviceRequestConfig, workOrdersConfig lengkap, token owner | Status 201, mengembalikan detail layanan baru | Sesuai |
| TC-SVC-06 | Buat layanan tanpa field wajib | POST /services | Title kosong | Status 400, pesan "Validation failed" | Sesuai |
| TC-SVC-07 | Buat layanan sebagai client | POST /services | Token client | Status 403 Forbidden | Sesuai |
| TC-SVC-08 | Update layanan dengan payload valid | PUT /services/:id | Body title updated, token owner | Status 200, versi baru layanan terbuat | Sesuai |
| TC-SVC-09 | Update layanan dengan ID tidak terdaftar | PUT /services/:id | Fake ObjectId | Status 404, pesan "Service not found" | Sesuai |
| TC-SVC-10 | Toggle aktif/nonaktif layanan | PATCH /services/:id/toggle-active | Body isActive=false, token owner | Status 200, isActive berubah menjadi false | Sesuai |
| TC-SVC-11 | Toggle layanan dengan ID tidak terdaftar | PATCH /services/:id/toggle-active | Fake ObjectId | Status 404, pesan "Service not found" | Sesuai |
| TC-SVC-12 | Hapus layanan (soft delete) | DELETE /services/:id | ID valid, token owner | Status 200, field deletedAt terisi | Sesuai |
| TC-SVC-13 | Hapus layanan dengan ID tidak terdaftar | DELETE /services/:id | Fake ObjectId | Status 404, pesan "Service not found" | Sesuai |
| TC-SVC-14 | Buat work order dari layanan | POST /services/:id/create-work-order | Token owner | Status 201, work order terbuat | Sesuai |
| TC-SVC-15 | Buat work order dari layanan tidak terdaftar | POST /services/:id/create-work-order | Fake ObjectId | Status 404, pesan "Service not found" | Sesuai |
| TC-SVC-16 | Ambil intake form layanan (staff) | GET /services/:id/intake-form | Token staff | Status 200, mengembalikan data intake form | Sesuai |
| TC-SVC-17 | Ambil intake form layanan tidak terdaftar | GET /services/:id/intake-form | Fake ObjectId | Status 404, pesan "Service not found" | Sesuai |

---

## 7. Work Orders (`/workorders`)

| No | Skenario Pengujian | Endpoint | Input | Expected Output | Hasil |
|---|---|---|---|---|---|
| TC-WO-01 | Ambil semua work order | GET /workorders | Token owner | Status 200, mengembalikan daftar work order | Sesuai |
| TC-WO-02 | Ambil work order tanpa token | GET /workorders | Tanpa header Authorization | Status 401 Unauthorized | Sesuai |
| TC-WO-03 | Ambil detail work order by ID | GET /workorders/:id | ID valid, token user | Status 200, mengembalikan detail work order | Sesuai |
| TC-WO-04 | Ambil detail WO dengan ID tidak terdaftar | GET /workorders/:id | Fake ObjectId | Status 404, pesan "Work Order not found" | Sesuai |
| TC-WO-05 | Recreate work order yang ditolak | POST /workorders/:id/recreate | ID WO rejected, token owner | Status 201, work order baru terbuat | Sesuai |
| TC-WO-06 | Recreate WO yang belum ditolak | POST /workorders/:id/recreate | ID WO status bukan rejected | Status 400, pesan "Status transition not allowed" | Sesuai |
| TC-WO-07 | Submit data form work order | PUT /workorders/:id/submissions | Body formId dan fieldsData valid, token staff | Status 200, data form tersimpan | Sesuai |
| TC-WO-08 | Submit form WO dengan body kosong | PUT /workorders/:id/submissions | Body kosong `{}` | Status 400, pesan "Validation failed" | Sesuai |
| TC-WO-09 | Assign staff ke work order | PUT /workorders/:id/assign-staffs | Body staff_pic dan assign_staffs berisi email valid, token owner | Status 200, staff ter-assign | Sesuai |
| TC-WO-10 | Assign staff dengan email tidak terdaftar | PUT /workorders/:id/assign-staffs | Email staff yang tidak terdaftar | Status 404, pesan "Staff not found" | Sesuai |
| TC-WO-11 | Tandai konfigurasi WO selesai (sent) | PATCH /workorders/:id/sent | ID valid, token owner | Status 200, status berubah ke sent | Sesuai |
| TC-WO-12 | Sent WO yang belum dikonfigurasi | PATCH /workorders/:id/sent | ID WO status tidak sesuai | Status 400, pesan "Status transition not allowed" | Sesuai |
| TC-WO-13 | Setujui work order | PATCH /workorders/:id/approve | ID valid, token owner | Status 200, status berubah ke approved | Sesuai |
| TC-WO-14 | Approve WO yang bukan status pending | PATCH /workorders/:id/approve | ID WO status bukan pending | Status 400, pesan "Status transition not allowed" | Sesuai |
| TC-WO-15 | Tolak work order | PATCH /workorders/:id/reject | ID valid, token owner | Status 200, status berubah ke rejected | Sesuai |
| TC-WO-16 | Reject WO tanpa token | PATCH /workorders/:id/reject | Tanpa header Authorization | Status 401 Unauthorized | Sesuai |
| TC-WO-17 | Batalkan work order | PATCH /workorders/:id/cancel | ID valid, token owner | Status 200, status berubah ke cancelled | Sesuai |
| TC-WO-18 | Cancel WO yang sudah completed | PATCH /workorders/:id/cancel | ID WO status completed | Status 400, pesan "Status transition not allowed" | Sesuai |
| TC-WO-19 | Selesaikan work order | PATCH /workorders/:id/complete | ID valid, token owner | Status 200, status berubah ke completed | Sesuai |
| TC-WO-20 | Complete WO yang bukan status in_progress | PATCH /workorders/:id/complete | ID WO status bukan in_progress | Status 400, pesan "Status transition not allowed" | Sesuai |
| TC-WO-21 | Mulai work order (in progress) | PATCH /workorders/:id/start | ID valid, token staff | Status 200, status berubah ke in_progress | Sesuai |
| TC-WO-22 | Start WO yang bukan status approved | PATCH /workorders/:id/start | ID WO status bukan approved | Status 400, pesan "Status transition not allowed" | Sesuai |
| TC-WO-23 | Tandai work order gagal | PATCH /workorders/:id/fail | ID valid, token staff | Status 200, status berubah ke failed | Sesuai |
| TC-WO-24 | Fail WO yang bukan status in_progress | PATCH /workorders/:id/fail | ID WO status bukan in_progress | Status 400, pesan "Status transition not allowed" | Sesuai |
| TC-WO-25 | Ambil laporan work order | GET /workorders/:id/report | ID valid, token user | Status 200, mengembalikan data laporan | Sesuai |
| TC-WO-26 | Ambil laporan WO dengan ID tidak terdaftar | GET /workorders/:id/report | Fake ObjectId | Status 404, pesan "Work Order not found" | Sesuai |

---

## 8. Work Reports (`/workreports`)

| No | Skenario Pengujian | Endpoint | Input | Expected Output | Hasil |
|---|---|---|---|---|---|
| TC-WR-01 | Submit data work report | POST /workreports/:id/submit | Body formId dan fieldsData valid, token staff | Status 200, data report tersimpan | Sesuai |
| TC-WR-02 | Submit work report dengan body kosong | POST /workreports/:id/submit | Body kosong `{}` | Status 400, pesan "Validation failed" | Sesuai |
| TC-WR-03 | Submit work report dengan ID tidak terdaftar | POST /workreports/:id/submit | Fake ObjectId | Status 404, pesan "Work report not found" | Sesuai |
| TC-WR-04 | Kirim work report untuk review | PATCH /workreports/:id/sent | ID valid, token staff | Status 200, status berubah ke sent | Sesuai |
| TC-WR-05 | Sent work report yang sudah dikirim | PATCH /workreports/:id/sent | ID WR status bukan draft | Status 400, pesan "Status transition not allowed" | Sesuai |
| TC-WR-06 | Setujui work report | PATCH /workreports/:id/approve | ID valid, token owner | Status 200, status berubah ke approved | Sesuai |
| TC-WR-07 | Approve work report yang bukan status sent | PATCH /workreports/:id/approve | ID WR status bukan sent | Status 400, pesan "Status transition not allowed" | Sesuai |
| TC-WR-08 | Approve work report tanpa token | PATCH /workreports/:id/approve | Tanpa header Authorization | Status 401 Unauthorized | Sesuai |
| TC-WR-09 | Tolak work report | PATCH /workreports/:id/reject | ID valid, token owner | Status 200, status berubah ke rejected | Sesuai |
| TC-WR-10 | Reject work report dengan ID tidak terdaftar | PATCH /workreports/:id/reject | Fake ObjectId | Status 404, pesan "Work report not found" | Sesuai |

---

## 9. Company Profile & Employees (`/company`)

| No | Skenario Pengujian | Endpoint | Input | Expected Output | Hasil |
|---|---|---|---|---|---|
| TC-COMP-01 | Ambil profil perusahaan | GET /company | Token owner | Status 200, mengembalikan detail perusahaan | Sesuai |
| TC-COMP-02 | Akses profil perusahaan sebagai client | GET /company | Token client | Status 403 Forbidden | Sesuai |
| TC-COMP-03 | Ambil detail perusahaan | GET /company/detail | Token owner | Status 200, mengembalikan detail perusahaan | Sesuai |
| TC-COMP-04 | Ambil detail perusahaan tanpa token | GET /company/detail | Tanpa header Authorization | Status 401 Unauthorized | Sesuai |
| TC-COMP-05 | Update profil perusahaan | PUT /company | Body name, address, description valid, token owner | Status 200, data perusahaan terupdate | Sesuai |
| TC-COMP-06 | Update profil perusahaan tanpa token | PUT /company | Tanpa header Authorization | Status 401 Unauthorized | Sesuai |
| TC-COMP-07 | Ambil daftar karyawan perusahaan | GET /company/employees | Token owner | Status 200, mengembalikan list karyawan | Sesuai |
| TC-COMP-08 | Akses daftar karyawan sebagai client | GET /company/employees | Token client | Status 403 Forbidden | Sesuai |
| TC-COMP-09 | Ambil detail karyawan by ID | GET /company/employees/:id | ID valid, token owner | Status 200, mengembalikan detail karyawan | Sesuai |
| TC-COMP-10 | Ambil detail karyawan dengan ID tidak terdaftar | GET /company/employees/:id | Fake ObjectId | Status 404, pesan "Employee not found" | Sesuai |
| TC-COMP-11 | Keluarkan karyawan dari perusahaan | DELETE /company/employees | Body email karyawan valid, token owner | Status 200, karyawan dikeluarkan | Sesuai |
| TC-COMP-12 | Keluarkan karyawan dengan email tidak terdaftar | DELETE /company/employees | Email yang tidak terdaftar | Status 404, pesan "Employee not found" | Sesuai |
| TC-COMP-13 | Undang karyawan baru | POST /company/invite | Body invites berisi email dan role valid, token owner | Status 201, invitation terbuat | Sesuai |
| TC-COMP-14 | Undang user yang sudah menjadi karyawan | POST /company/invite | Email yang sudah menjadi karyawan | Status 422, pesan "Validation failed" | Sesuai |
| TC-COMP-15 | Undang karyawan tanpa token | POST /company/invite | Tanpa header Authorization | Status 401 Unauthorized | Sesuai |
| TC-COMP-16 | Ambil riwayat undangan | GET /company/invitations/history | Token owner | Status 200, mengembalikan list riwayat undangan | Sesuai |
| TC-COMP-17 | Ambil konfigurasi integrasi | GET /company/integration-config | Token owner | Status 200, mengembalikan data konfigurasi integrasi | Sesuai |
| TC-COMP-18 | Akses konfigurasi integrasi tanpa token | GET /company/integration-config | Tanpa header Authorization | Status 401 Unauthorized | Sesuai |
| TC-COMP-19 | Update konfigurasi integrasi | PUT /company/integration-config | Body is_integration_active dan integration_type, token owner | Status 200, konfigurasi terupdate | Sesuai |
| TC-COMP-20 | Update konfigurasi integrasi sebagai staff | PUT /company/integration-config | Token staff | Status 403 Forbidden | Sesuai |

---

## 10. Invitations (`/invitations`)

| No | Skenario Pengujian | Endpoint | Input | Expected Output | Hasil |
|---|---|---|---|---|---|
| TC-INV-01 | Ambil undangan pending untuk staff | GET /invitations/pending | Token staff | Status 200, mengembalikan list undangan pending | Sesuai |
| TC-INV-02 | Ambil undangan pending tanpa token | GET /invitations/pending | Tanpa header Authorization | Status 401 Unauthorized | Sesuai |
| TC-INV-03 | Terima undangan bergabung perusahaan | PUT /invitations/:id/accept | ID valid, token staff | Status 200, status accepted dan companyId terisi | Sesuai |
| TC-INV-04 | Terima undangan yang sudah diterima | PUT /invitations/:id/accept | ID undangan status accepted | Status 400, pesan "Invitation already processed" | Sesuai |
| TC-INV-05 | Terima undangan dengan ID tidak terdaftar | PUT /invitations/:id/accept | Fake ObjectId | Status 404, pesan "Invitation not found" | Sesuai |
| TC-INV-06 | Tolak undangan | PUT /invitations/:id/reject | ID valid, token staff | Status 200, status berubah ke rejected | Sesuai |
| TC-INV-07 | Tolak undangan yang sudah diproses | PUT /invitations/:id/reject | ID undangan status bukan pending | Status 400, pesan "Invitation already processed" | Sesuai |
| TC-INV-08 | Hapus/batalkan undangan oleh owner | DELETE /invitations/:id | ID valid, token owner | Status 200, undangan dihapus | Sesuai |
| TC-INV-09 | Batalkan undangan oleh user bukan pengirim | DELETE /invitations/:id | Token staff (bukan pengirim) | Status 403 Forbidden | Sesuai |
| TC-INV-10 | Hapus undangan dengan ID tidak terdaftar | DELETE /invitations/:id | Fake ObjectId | Status 404, pesan "Invitation not found" | Sesuai |

---

## 11. Positions (`/positions`)

| No | Skenario Pengujian | Endpoint | Input | Expected Output | Hasil |
|---|---|---|---|---|---|
| TC-POS-01 | Ambil semua posisi | GET /positions | Token owner | Status 200, mengembalikan daftar posisi | Sesuai |
| TC-POS-02 | Ambil posisi tanpa token | GET /positions | Tanpa header Authorization | Status 401 Unauthorized | Sesuai |
| TC-POS-03 | Buat posisi baru dengan payload valid | POST /positions | Body name dan description valid, token owner | Status 201, mengembalikan detail posisi baru | Sesuai |
| TC-POS-04 | Buat posisi dengan nama kosong | POST /positions | Body name kosong | Status 400, pesan "Validation failed" | Sesuai |
| TC-POS-05 | Buat posisi sebagai client | POST /positions | Token client | Status 403 Forbidden | Sesuai |
| TC-POS-06 | Ambil detail posisi by ID | GET /positions/:id | ID valid, token owner | Status 200, mengembalikan detail posisi | Sesuai |
| TC-POS-07 | Ambil detail posisi dengan ID tidak terdaftar | GET /positions/:id | Fake ObjectId | Status 404, pesan "Position not found" | Sesuai |
| TC-POS-08 | Update posisi dengan payload valid | PUT /positions/:id | Body name dan description valid, token owner | Status 200, data posisi terupdate | Sesuai |
| TC-POS-09 | Update posisi dengan ID tidak terdaftar | PUT /positions/:id | Fake ObjectId | Status 404, pesan "Position not found" | Sesuai |
| TC-POS-10 | Hapus posisi | DELETE /positions/:id | ID valid, token owner | Status 200, posisi dihapus | Sesuai |
| TC-POS-11 | Hapus posisi dengan ID tidak terdaftar | DELETE /positions/:id | Fake ObjectId | Status 404, pesan "Position not found" | Sesuai |

---

## 12. Forms (`/forms`)

| No | Skenario Pengujian | Endpoint | Input | Expected Output | Hasil |
|---|---|---|---|---|---|
| TC-FORM-01 | Ambil semua template form | GET /forms | Token owner | Status 200, mengembalikan daftar form | Sesuai |
| TC-FORM-02 | Ambil form tanpa token | GET /forms | Tanpa header Authorization | Status 401 Unauthorized | Sesuai |
| TC-FORM-03 | Buat form baru dengan payload valid | POST /forms | Body title, formType, dan fields valid, token owner | Status 201, mengembalikan detail form baru | Sesuai |
| TC-FORM-04 | Buat form tanpa field title | POST /forms | Body tanpa title | Status 400, pesan "Validation failed" | Sesuai |
| TC-FORM-05 | Buat form dengan formType tidak valid | POST /forms | formType bernilai "invalid_type" | Status 400, pesan "Validation failed" | Sesuai |
| TC-FORM-06 | Ambil detail form by ID | GET /forms/:id | ID valid, token owner | Status 200, mengembalikan detail form | Sesuai |
| TC-FORM-07 | Ambil detail form dengan ID tidak terdaftar | GET /forms/:id | Fake ObjectId | Status 404, pesan "Form template not found" | Sesuai |
| TC-FORM-08 | Update form dengan payload valid | PUT /forms/:id | Body title dan fields updated, token owner | Status 200, versi baru form terbuat | Sesuai |
| TC-FORM-09 | Update form dengan ID tidak terdaftar | PUT /forms/:id | Fake ObjectId | Status 404, pesan "Form template not found" | Sesuai |
| TC-FORM-10 | Hapus template form | DELETE /forms/:id | ID valid, token owner | Status 200, form dihapus | Sesuai |
| TC-FORM-11 | Hapus form dengan ID tidak terdaftar | DELETE /forms/:id | Fake ObjectId | Status 404, pesan "Form template not found" | Sesuai |

---

## 13. FAQs (`/faq`)

| No | Skenario Pengujian | Endpoint | Input | Expected Output | Hasil |
|---|---|---|---|---|---|
| TC-FAQ-01 | Toggle aktif/nonaktif FAQ perusahaan | PUT /faq/toggle-active | Body isActive=true, token owner | Status 200, status FAQ terupdate | Sesuai |
| TC-FAQ-02 | Toggle FAQ tanpa token | PUT /faq/toggle-active | Tanpa header Authorization | Status 401 Unauthorized | Sesuai |
| TC-FAQ-03 | Ambil semua dokumen FAQ | GET /faq/docs | Token owner | Status 200, mengembalikan list dokumen FAQ | Sesuai |
| TC-FAQ-04 | Akses dokumen FAQ sebagai client | GET /faq/docs | Token client | Status 403 Forbidden | Sesuai |
| TC-FAQ-05 | Upload FAQ sebagai teks | POST /faq/text-docs | Body title dan content valid, token owner | Status 201, dokumen FAQ terbuat | Sesuai |
| TC-FAQ-06 | Upload FAQ teks tanpa field wajib | POST /faq/text-docs | Body title kosong | Status 400, pesan "Validation failed" | Sesuai |
| TC-FAQ-07 | Upload FAQ sebagai PDF (multipart) | POST /faq/pdf-docs | Multipart form dengan file PDF valid, token owner | Status 201, dokumen FAQ terbuat | Sesuai |
| TC-FAQ-08 | Upload FAQ PDF dengan file bukan PDF | POST /faq/pdf-docs | Multipart form dengan file PNG | Status 400, pesan "Only PDF files are allowed" | Sesuai |
| TC-FAQ-09 | Upload FAQ PDF tanpa file | POST /faq/pdf-docs | Multipart form kosong | Status 400, pesan "Validation failed" | Sesuai |
| TC-FAQ-10 | Hapus dokumen FAQ | DELETE /faq/docs/:id | ID valid, token owner | Status 200, dokumen dihapus | Sesuai |
| TC-FAQ-11 | Hapus dokumen FAQ dengan ID tidak terdaftar | DELETE /faq/docs/:id | Fake ObjectId | Status 404, pesan "FAQ document not found" | Sesuai |
| TC-FAQ-12 | Tanya AI chatbot FAQ | POST /faq/ask | Body question valid, token user | Status 200, mengembalikan jawaban AI | Sesuai |
| TC-FAQ-13 | Tanya AI chatbot dengan pertanyaan kosong | POST /faq/ask | Body question kosong | Status 400, pesan "Validation failed" | Sesuai |

---

## 14. Templates (`/template`)

| No | Skenario Pengujian | Endpoint | Input | Expected Output | Hasil |
|---|---|---|---|---|---|
| TC-TPL-01 | Ambil semua tipe perusahaan untuk template | GET /template/company-type | Token owner | Status 200, mengembalikan list tipe perusahaan | Sesuai |
| TC-TPL-02 | Ambil tipe perusahaan tanpa token | GET /template/company-type | Tanpa header Authorization | Status 401 Unauthorized | Sesuai |
| TC-TPL-03 | Ambil layanan berdasarkan tipe perusahaan | GET /template/company-type/:id/services | ID valid, token owner | Status 200, mengembalikan array template layanan | Sesuai |
| TC-TPL-04 | Ambil layanan dengan tipe ID tidak terdaftar | GET /template/company-type/:id/services | Fake ObjectId | Status 404, pesan "Company type not found" | Sesuai |
| TC-TPL-05 | Preview template layanan by ID | GET /template/services/:id | ID valid, token owner | Status 200, mengembalikan detail template | Sesuai |
| TC-TPL-06 | Preview template dengan ID tidak terdaftar | GET /template/services/:id | Fake ObjectId | Status 404, pesan "Service template not found" | Sesuai |
| TC-TPL-07 | Generate layanan dari template | POST /template/services/generate | Body serviceTemplateIds valid, token owner | Status 201, layanan ter-generate | Sesuai |
| TC-TPL-08 | Generate dengan serviceTemplateId tidak terdaftar | POST /template/services/generate | Fake ObjectId di array | Status 404, pesan "Service template not found" | Sesuai |
| TC-TPL-09 | Generate tanpa token | POST /template/services/generate | Tanpa header Authorization | Status 401 Unauthorized | Sesuai |
| TC-TPL-10 | Generate dengan body kosong | POST /template/services/generate | Body kosong `{}` | Status 400, pesan "Validation failed" | Sesuai |

---

## 15. Memberships & Codes (`/memberships`)

| No | Skenario Pengujian | Endpoint | Input | Expected Output | Hasil |
|---|---|---|---|---|---|
| TC-MBR-01 | Ambil semua kode membership | GET /memberships/codes | Token owner | Status 200, mengembalikan list kode membership | Sesuai |
| TC-MBR-02 | Ambil kode membership tanpa token | GET /memberships/codes | Tanpa header Authorization | Status 401 Unauthorized | Sesuai |
| TC-MBR-03 | Upload kode membership baru (multipart) | POST /memberships/codes | Multipart form dengan file CSV valid, token owner | Status 201, kode ter-upload | Sesuai |
| TC-MBR-04 | Upload kode tanpa file | POST /memberships/codes | Multipart form kosong | Status 400, pesan "Validation failed" | Sesuai |
| TC-MBR-05 | Hapus kode membership | DELETE /memberships/codes/:id | ID valid, token owner | Status 200, kode dihapus | Sesuai |
| TC-MBR-06 | Hapus kode membership dengan ID tidak terdaftar | DELETE /memberships/codes/:id | Fake ObjectId | Status 404, pesan "Membership code not found" | Sesuai |
| TC-MBR-07 | Klaim kode membership valid | POST /memberships/codes/claim | Body code valid, token client | Status 200, user bergabung perusahaan | Sesuai |
| TC-MBR-08 | Klaim kode membership tidak valid | POST /memberships/codes/claim | Body code tidak valid | Status 400, pesan "Invalid membership code" | Sesuai |
| TC-MBR-09 | Klaim kode yang sudah mencapai maxUses | POST /memberships/codes/claim | Kode yang sudah melebihi batas | Status 400, pesan "Membership code has reached maximum usage" | Sesuai |
| TC-MBR-10 | Ambil semua membership | GET /memberships | Token owner | Status 200, mengembalikan daftar membership | Sesuai |
| TC-MBR-11 | Akses membership tanpa token | GET /memberships | Tanpa header Authorization | Status 401 Unauthorized | Sesuai |

---

## 16. Customer Pairing (`/customer-pairing`)

| No | Skenario Pengujian | Endpoint | Input | Expected Output | Hasil |
|---|---|---|---|---|---|
| TC-CP-01 | Mulai proses OAuth pairing | POST /customer-pairing/start | Body companyId dan provider valid, token client | Status 200, mengembalikan URL OAuth redirect | Sesuai |
| TC-CP-02 | Start pairing tanpa token | POST /customer-pairing/start | Tanpa header Authorization | Status 401 Unauthorized | Sesuai |
| TC-CP-03 | Start pairing dengan companyId tidak terdaftar | POST /customer-pairing/start | Fake ObjectId pada companyId | Status 404, pesan "Company not found" | Sesuai |
| TC-CP-04 | Selesaikan OAuth pairing | POST /customer-pairing/complete | Body code dan state valid, token client | Status 200, akun ter-pair | Sesuai |
| TC-CP-05 | Complete pairing dengan code tidak valid | POST /customer-pairing/complete | Code tidak valid | Status 400, pesan "Invalid OAuth code" | Sesuai |
| TC-CP-06 | Ambil semua akun ter-pair (client) | GET /customer-pairing | Token client | Status 200, mengembalikan list akun ter-pair | Sesuai |
| TC-CP-07 | Ambil akun ter-pair tanpa token | GET /customer-pairing | Tanpa header Authorization | Status 401 Unauthorized | Sesuai |
| TC-CP-08 | Ambil akun ter-pair di perusahaan tertentu | GET /customer-pairing/company/:id | ID valid, token user | Status 200, mengembalikan data akun ter-pair | Sesuai |
| TC-CP-09 | Ambil akun ter-pair dengan companyId tidak terdaftar | GET /customer-pairing/company/:id | Fake ObjectId | Status 404, pesan "Company not found" | Sesuai |
| TC-CP-10 | Lepas akun ter-pair | DELETE /customer-pairing/:id | ID valid, token client | Status 200, akun dilepas | Sesuai |
| TC-CP-11 | Lepas akun ter-pair dengan ID tidak terdaftar | DELETE /customer-pairing/:id | Fake ObjectId | Status 404, pesan "Paired account not found" | Sesuai |

---

## 17. Service Pricing (`/service-price`)

| No | Skenario Pengujian | Endpoint | Input | Expected Output | Hasil |
|---|---|---|---|---|---|
| TC-SP-01 | Ambil semua data pricing | GET /service-price | Token owner | Status 200, mengembalikan array skema harga | Sesuai |
| TC-SP-02 | Ambil pricing tanpa token | GET /service-price | Tanpa header Authorization | Status 401 Unauthorized | Sesuai |
| TC-SP-03 | Buat pricing baru | POST /service-price | Body name, price, dan currency valid, token owner | Status 201, mengembalikan detail skema harga | Sesuai |
| TC-SP-04 | Buat pricing dengan field wajib kosong | POST /service-price | Body name kosong | Status 400, pesan "Validation failed" | Sesuai |
| TC-SP-05 | Buat pricing sebagai client | POST /service-price | Token client | Status 403 Forbidden | Sesuai |
| TC-SP-06 | Update pricing | PUT /service-price/:id | Body name dan price updated, token owner | Status 200, data pricing terupdate | Sesuai |
| TC-SP-07 | Update pricing dengan ID tidak terdaftar | PUT /service-price/:id | Fake ObjectId | Status 404, pesan "Service price not found" | Sesuai |
| TC-SP-08 | Hapus pricing | DELETE /service-price/:id | ID valid, token owner | Status 200, harga dihapus | Sesuai |
| TC-SP-09 | Hapus pricing dengan ID tidak terdaftar | DELETE /service-price/:id | Fake ObjectId | Status 404, pesan "Service price not found" | Sesuai |

---

## 18. File Upload (`/files`)

| No | Skenario Pengujian | Endpoint | Input | Expected Output | Hasil |
|---|---|---|---|---|---|
| TC-FILE-01 | Upload file gambar valid (< 5MB) | POST /files | Multipart form dengan file PNG ~100KB, token user | Status 201, mengembalikan URL file | Sesuai |
| TC-FILE-02 | Upload file melebihi batas ukuran 5MB | POST /files | Multipart form dengan buffer 6MB | Status 400, pesan "File size exceeds the limit of 5MB" | Sesuai |
| TC-FILE-03 | Upload file dengan tipe tidak diizinkan | POST /files | Multipart form dengan file PDF | Status 400, pesan "File type not allowed" | Sesuai |
| TC-FILE-04 | Upload file tanpa token | POST /files | Multipart form dengan file valid, tanpa header | Status 401 Unauthorized | Sesuai |
| TC-FILE-05 | Upload tanpa menyertakan file | POST /files | Multipart form kosong | Status 400, pesan "Validation failed" | Sesuai |

---

## Rekap Hasil Testing

| No | Modul | Total | Sesuai | Tidak Sesuai |
|---|---|---|---|---|
| 1 | Authentication | 14 | 14 | 0 |
| 2 | Dashboard | 7 | 7 | 0 |
| 3 | Notifications | 7 | 7 | 0 |
| 4 | Service Requests | 18 | 18 | 0 |
| 5 | Public Services | 7 | 7 | 0 |
| 6 | Services | 17 | 17 | 0 |
| 7 | Work Orders | 26 | 26 | 0 |
| 8 | Work Reports | 10 | 10 | 0 |
| 9 | Company & Employees | 20 | 20 | 0 |
| 10 | Invitations | 10 | 10 | 0 |
| 11 | Positions | 11 | 11 | 0 |
| 12 | Forms | 11 | 11 | 0 |
| 13 | FAQs | 13 | 13 | 0 |
| 14 | Templates | 10 | 10 | 0 |
| 15 | Memberships | 11 | 11 | 0 |
| 16 | Customer Pairing | 11 | 11 | 0 |
| 17 | Service Pricing | 9 | 9 | 0 |
| 18 | File Upload | 5 | 5 | 0 |
| | **Total** | **217** | **217** | **0** |
