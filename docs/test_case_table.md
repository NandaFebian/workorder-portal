# Daftar Tabel Test Case Lengkap (E2E)

Dokumen ini berisi daftar lengkap test case yang diimplementasikan dalam skrip pengujian E2E (`.e2e-spec.ts`) di folder `test/`.

---

## 1. App Module (`/`)
File Script: [app.e2e-spec.ts](file:///d:/Perkuliahan/Work%20Order/workorder-portal/test/app.e2e-spec.ts)

| No | ID Test | Endpoint | HTTP Method | Tipe Pengujian | Kondisi Uji | Input/Payload | Expected Output | Status |
|---|---|---|---|---|---|---|---|---|
| 1 | TC-APP-01 | `/` | GET | Blackbox | Akses root endpoint | None | `200 OK` dengan teks `"Hello World!"` | Passed |

---

## 2. Auth Module (`/auth`)
File Script: [auth.e2e-spec.ts](file:///d:/Perkuliahan/Work%20Order/workorder-portal/test/auth.e2e-spec.ts)

| No | ID Test | Endpoint | HTTP Method | Tipe Pengujian | Kondisi Uji | Input/Payload | Expected Output | Status |
|---|---|---|---|---|---|---|---|---|
| 1 | TC-AUTH-01 | `/auth/register` | POST | Blackbox & Whitebox | Payload registrasi baru valid | `{"name":"John Doe","email":"john@example.com","password":"password123","role":"client"}` | `200 OK`, pesan registrasi berhasil, password di-hash di DB | Passed |
| 2 | TC-AUTH-02 | `/auth/register` | POST | Blackbox | Registrasi dengan email yang sudah ada | `{"name":"John Doe","email":"john@example.com","password":"password123","role":"client"}` | `400 Bad Request`, pesan `"Email already registered"` | Passed |
| 3 | TC-AUTH-03 | `/auth/register` | POST | Blackbox | Validasi input registrasi tidak valid | `{"name":"","email":"not-an-email","password":"123","role":"invalid_role"}` | `400 Bad Request`, pesan `"Validation failed"` | Passed |
| 4 | TC-AUTH-04 | `/auth/register-company` | POST | Blackbox & Whitebox | Payload registrasi perusahaan baru valid | `{"name":"Owner Name","email":"owner@company.com","password":"password123","companyName":"ACME Corp"}` | `200 OK`, admin `User` dan `Company` terbuat & terhubung di DB | Passed |
| 5 | TC-AUTH-05 | `/auth/register-company` | POST | Blackbox | Registrasi owner dengan email yang sudah ada | `{"name":"Owner Name","email":"owner@company.com","password":"password123","companyName":"ACME Corp"}` | `400 Bad Request`, pesan `"Email already registered"` | Passed |
| 6 | TC-AUTH-06 | `/auth/register-company` | POST | Blackbox | Input registrasi perusahaan tidak lengkap | `{"name":"","email":"invalid-email"}` | `400 Bad Request`, pesan `"Validation failed"` | Passed |
| 7 | TC-AUTH-07 | `/auth/login` | POST | Blackbox & Whitebox | Login dengan kredensial yang valid | `{"email":"jane@example.com","password":"password123"}` | `200 OK` dengan token Bearer valid | Passed |
| 8 | TC-AUTH-08 | `/auth/login` | POST | Blackbox | Login dengan password salah | `{"email":"jane@example.com","password":"wrongpassword"}` | `400 Bad Request`, pesan `"Invalid credentials"` | Passed |
| 9 | TC-AUTH-09 | `/auth/logout` | POST | Blackbox | Logout dengan token JWT valid | Authorization Header: `Bearer <token>` | `200 OK`, pesan `"Logout successful"` | Passed |
| 10 | TC-AUTH-10 | `/auth/logout` | POST | Blackbox | Logout tanpa menyertakan token JWT | None | `401 Unauthorized` | Passed |
| 11 | TC-AUTH-11 | `/auth/profile` | GET | Blackbox & Whitebox | Ambil profil dengan token JWT valid | Authorization Header: `Bearer <token>` | `200 OK`, data profile tanpa field password | Passed |
| 12 | TC-AUTH-12 | `/auth/profile` | GET | Blackbox | Ambil profil tanpa token JWT | None | `401 Unauthorized` | Passed |

---

## 3. Users Module (`/users`)
File Script: [users.e2e-spec.ts](file:///d:/Perkuliahan/Work%20Order/workorder-portal/test/users.e2e-spec.ts)

| No | ID Test | Endpoint | HTTP Method | Tipe Pengujian | Kondisi Uji | Input/Payload | Expected Output | Status |
|---|---|---|---|---|---|---|---|---|
| 1 | TC-USER-01 | `/users/me` | GET | Blackbox & Whitebox | Ambil profil sendiri dengan token valid | Authorization Header: `Bearer <token>` | `200 OK`, data profil lengkap, password di-exclude | Passed |
| 2 | TC-USER-02 | `/users/me` | GET | Blackbox | Ambil profil sendiri tanpa token JWT | None | `401 Unauthorized`, pesan `"Unauthorized"` | Passed |
| 3 | TC-USER-03 | `/users/me` | PATCH | Blackbox & Whitebox | Update nama dan email dengan payload valid | `{"name":"Jane Updated","email":"jane.updated@example.com"}` | `200 OK`, data profil terupdate di DB | Passed |
| 4 | TC-USER-04 | `/users/me` | PATCH | Blackbox & Whitebox | Ganti password dengan currentPassword benar | `{"currentPassword":"password123","newPassword":"newpassword123"}` | `200 OK`, login berikutnya bisa pakai password baru | Passed |
| 5 | TC-USER-05 | `/users/me` | PATCH | Blackbox | Ganti password dengan currentPassword salah | `{"currentPassword":"wrongpassword","newPassword":"newpassword123"}` | `401 Unauthorized` | Passed |
| 6 | TC-USER-06 | `/users/me` | PATCH | Blackbox | Update profil dengan format email salah | `{"email":"invalid-email-format"}` | `400 Bad Request`, pesan `"Validation failed"` | Passed |

---

## 4. Company Module (`/company` & `/public/companies`)
File Script: [company.e2e-spec.ts](file:///d:/Perkuliahan/Work%20Order/workorder-portal/test/company.e2e-spec.ts)

| No | ID Test | Endpoint | HTTP Method | Tipe Pengujian | Kondisi Uji | Input/Payload | Expected Output | Status |
|---|---|---|---|---|---|---|---|---|
| 1 | TC-COMP-01 | `/company` | GET | Blackbox & Whitebox | Ambil detail perusahaan sebagai Owner | Authorization Header: `Bearer <token-owner>` | `200 OK`, detail perusahaan `ACME Corp` | Passed |
| 2 | TC-COMP-02 | `/company` | GET | Blackbox | Ambil detail perusahaan sebagai Client | Authorization Header: `Bearer <token-client>` | `403 Forbidden` | Passed |
| 3 | TC-COMP-03 | `/company/invite` | POST | Blackbox & Whitebox | Undang karyawan baru (Company Manager) | `{"invites":[{"email":"staff.candidate@example.com","role":"company_manager"}]}` | `201 Created`, record Invitation dibuat di DB (status pending) | Passed |
| 4 | TC-COMP-04 | `/company/invite` | POST | Blackbox | Undang user yang sudah terasosiasi | `{"invites":[{"email":"owner@acme.com","role":"company_manager"}]}` | `422 Unprocessable Entity`, pesan `"Validation failed"` | Passed |
| 5 | TC-COMP-05 | `/company/invitations/history` | GET | Blackbox & Whitebox | Ambil riwayat undangan perusahaan | Authorization Header: `Bearer <token-owner>` | `200 OK` dengan daftar riwayat undangan | Passed |
| 6 | TC-COMP-06 | `/company/employees` | GET | Blackbox & Whitebox | Ambil daftar karyawan perusahaan | Authorization Header: `Bearer <token-owner>` | `200 OK` dengan daftar karyawan | Passed |
| 7 | TC-COMP-07 | `/company` | PUT | Blackbox & Whitebox | Update profil perusahaan dengan data valid | `{"name":"ACME Global Inc","address":"123 Enterprise Rd","description":"Global tech provider"}` | `200 OK`, terupdate di DB | Passed |
| 8 | TC-COMP-08 | `/company/detail` | GET | Blackbox & Whitebox | Ambil detail lengkap profil perusahaan | Authorization Header: `Bearer <token-owner>` | `200 OK`, detail profil sesuai | Passed |
| 9 | TC-COMP-09 | `/company` | DELETE | Blackbox & Whitebox | Soft-delete perusahaan oleh Owner | Authorization Header: `Bearer <token-owner>` | `200 OK`, field `deletedAt` terisi timestamp di DB | Passed |
| 10 | TC-COMP-10 | `/company/integration-config` | GET & PUT | Blackbox & Whitebox | Ambil & update config integrasi external | `{"is_integration_active":true,"integration_type":"external_system",...}` | `200 OK`, data config terupdate di DB (camelCase mapping) | Passed |
| 11 | TC-COMP-11 | `/public/companies` | GET | Blackbox & Whitebox | Ambil list perusahaan publik (tanpa auth) | None | `200 OK`, list perusahaan yang aktif (isActive: true) | Passed |
| 12 | TC-COMP-12 | `/public/companies/:id` | GET | Blackbox & Whitebox | Ambil detail perusahaan publik (tanpa auth) | `id` sebagai parameter URL | `200 OK`, detail perusahaan | Passed |
| 13 | TC-COMP-13 | `/public/companies/:id/services` | GET | Blackbox & Whitebox | Ambil layanan publik perusahaan (tanpa auth) | `id` sebagai parameter URL | `200 OK`, daftar layanan aktif | Passed |

---

## 5. Positions Module (`/positions`)
File Script: [positions.e2e-spec.ts](file:///d:/Perkuliahan/Work%20Order/workorder-portal/test/positions.e2e-spec.ts)

| No | ID Test | Endpoint | HTTP Method | Tipe Pengujian | Kondisi Uji | Input/Payload | Expected Output | Status |
|---|---|---|---|---|---|---|---|---|
| 1 | TC-POS-01 | `/positions` | GET | Blackbox | Ambil daftar posisi sebagai Owner | Authorization Header: `Bearer <token-owner>` | `200 OK` dengan daftar posisi | Passed |
| 2 | TC-POS-02 | `/positions` | GET | Whitebox | Ambil daftar posisi beda perusahaan | Authorization Header: `Bearer <token-owner-B>` | `200 OK`, posisi perusahaan A tidak tampil di B | Passed |
| 3 | TC-POS-03 | `/positions/:id` | GET | Blackbox | Ambil detail posisi dengan ID valid | `id` posisi sebagai parameter URL | `200 OK` dengan detail posisi | Passed |
| 4 | TC-POS-04 | `/positions/:id` | GET | Blackbox | Ambil detail posisi dengan ID tidak valid | Random ObjectId sebagai parameter URL | `404 Not Found` | Passed |
| 5 | TC-POS-06 | `/positions` | POST | Blackbox | Buat posisi baru sebagai Owner | `{"name":"Teknisi Lapangan","description":"Instalasi lapangan"}` | `201 Created` dengan detail posisi baru | Passed |
| 6 | TC-POS-07 | `/positions` | POST | Blackbox | Buat posisi baru sebagai Client (non-admin) | `{"name":"Test","description":"Test"}` | `403 Forbidden` | Passed |
| 7 | TC-POS-09 | `/positions` | POST | Whitebox | Pastikan data posisi tersimpan di MongoDB | `{"name":"Admin Gudang","description":"Kelola gudang"}` | `201 Created`, record tersimpan di DB | Passed |
| 8 | TC-POS-10 | `/positions/:id` | PUT | Blackbox & Whitebox | Update data posisi dengan payload valid | `{"name":"New Name","description":"New Desc"}` | `200 OK`, data terupdate di DB | Passed |
| 9 | TC-POS-12 | `/positions/:id` | DELETE | Blackbox | Hapus posisi kerja | `id` posisi sebagai parameter URL | `200 OK` | Passed |

---

## 6. Services Module (`/services` & `/public/services`)
File Script: [services.e2e-spec.ts](file:///d:/Perkuliahan/Work%20Order/workorder-portal/test/services.e2e-spec.ts)

| No | ID Test | Endpoint | HTTP Method | Tipe Pengujian | Kondisi Uji | Input/Payload | Expected Output | Status |
|---|---|---|---|---|---|---|---|---|
| 1 | TC-SVC-01 | `/services` | POST | Blackbox | Buat layanan baru dengan payload valid | `{ "title": "Layanan Test", "accessType": "internal", ... }` | `201 Created` dengan detail layanan baru | Passed |
| 2 | TC-SVC-02 | `/services` | POST | Whitebox | Validasi jika `intakeFormId` tidak terdaftar | Override `intakeFormId` dengan fake ObjectId | `404 Not Found` | Passed |
| 3 | TC-SVC-03 | `/services` | GET | Blackbox | Ambil semua daftar layanan internal | Authorization Header: `Bearer <token-owner>` | `200 OK` dengan daftar layanan | Passed |
| 4 | TC-SVC-04 | `/services` | GET | Whitebox | Ambil daftar layanan dari perusahaan lain | Authorization Header: `Bearer <token-owner-B>` | `200 OK`, layanan perusahaan A tidak muncul di B | Passed |
| 5 | TC-SVC-05 | `/services/:id` | GET | Blackbox | Ambil detail layanan berdasarkan ID | `id` layanan sebagai parameter URL | `200 OK` dengan detail layanan | Passed |
| 6 | TC-SVC-13 | `/services/:id/toggle-active` | PATCH | Blackbox & Whitebox | Ubah status aktif/nonaktif layanan | `{"isActive":false}` | `200 OK`, status berubah di DB | Passed |
| 7 | TC-SVC-15 | `/services/:id` | DELETE | Blackbox & Whitebox | Soft-delete layanan | `id` layanan sebagai parameter URL | `200 OK`, field `deletedAt` terisi di DB | Passed |
| 8 | TC-SVC-17 | `/public/services/company/:companyId` | GET | Blackbox | Ambil layanan publik perusahaan (tanpa auth) | `companyId` sebagai parameter URL | `200 OK` dengan daftar layanan aktif publik | Passed |
| 9 | TC-SVC-18 | `/public/services/company/:companyId` | GET | Whitebox | Pastikan akses tanpa JWT tidak ditolak | None | `200 OK` (tidak mengembalikan 401) | Passed |

---

## 7. Forms Module (`/forms`)
File Script: [forms.e2e-spec.ts](file:///d:/Perkuliahan/Work%20Order/workorder-portal/test/forms.e2e-spec.ts)

| No | ID Test | Endpoint | HTTP Method | Tipe Pengujian | Kondisi Uji | Input/Payload | Expected Output | Status |
|---|---|---|---|---|---|---|---|---|
| 1 | TC-FORM-01 | `/forms` | POST | Blackbox | Buat template form baru dengan payload valid | `{"title":"Form Intake Test","formType":"intake","fields":[...]}` | `201 Created` dengan detail form baru | Passed |
| 2 | TC-FORM-02 | `/forms` | POST | Whitebox | Validasi formType tidak terdaftar | `{"title":"Form","formType":"invalid_type","fields":[]}` | `400 Bad Request`, `"Validation failed"` | Passed |
| 3 | TC-FORM-03 | `/forms` | GET | Blackbox | Ambil seluruh template form perusahaan | Authorization Header: `Bearer <token-owner>` | `200 OK` dengan daftar form | Passed |
| 4 | TC-FORM-04 | `/forms` | GET | Whitebox | Ambil daftar form dari perusahaan lain | Authorization Header: `Bearer <token-owner-B>` | `200 OK`, form perusahaan A tidak muncul di B | Passed |
| 5 | TC-FORM-05 | `/forms/:id` | GET | Blackbox | Ambil detail form berdasarkan ID | `id` form sebagai parameter URL | `200 OK` dengan detail form | Passed |
| 6 | TC-FORM-05b | `/forms/:id` | GET | Blackbox | Ambil detail form dengan ID tidak ditemukan | Fake ObjectId sebagai parameter URL | `404 Not Found` | Passed |
| 7 | TC-FORM-07 | `/forms/:id` | PUT | Blackbox | Update detail data form | `{"title":"Form Updated","fields":[...]}` | `200 OK`, judul terupdate | Passed |
| 8 | TC-FORM-09 | `/forms/submissions` | POST | Blackbox & Whitebox | Submit form dengan field wajib terisi | `{"formId":"...","answers":[{"fieldId":"...","value":"Budi Santoso"}]}` | `201 Created`, data tersimpan di DB | Passed |
| 9 | TC-FORM-10 | `/forms/submissions` | POST | Blackbox | Submit form dengan field wajib dikosongkan | `{"formId":"...","answers":[]}` | `400 Bad Request` | Passed |
| 10 | TC-FORM-14 | `/forms/:id` | DELETE | Blackbox | Hapus template form | `id` form sebagai parameter URL | `200 OK` | Passed |

---

## 8. Invitations Module (`/invitations`)
File Script: [invitations.e2e-spec.ts](file:///d:/Perkuliahan/Work%20Order/workorder-portal/test/invitations.e2e-spec.ts)

| No | ID Test | Endpoint | HTTP Method | Tipe Pengujian | Kondisi Uji | Input/Payload | Expected Output | Status |
|---|---|---|---|---|---|---|---|---|
| 1 | TC-INV-01 | `/invitations/pending` | GET | Blackbox | Ambil daftar undangan pending untuk user | Authorization Header: `Bearer <token-staff>` | `200 OK` dengan list undangan | Passed |
| 2 | TC-INV-02 | `/invitations/:id/accept` | PUT | Blackbox & Whitebox | Terima undangan bergabung perusahaan | `id` undangan sebagai parameter URL | `200 OK`, status accepted, `companyId` user terisi | Passed |
| 3 | TC-INV-04 | `/invitations/:id/reject` | PUT | Blackbox | Tolak undangan bergabung perusahaan | `id` undangan sebagai parameter URL | `200 OK`, status undangan menjadi `"rejected"` | Passed |
| 4 | TC-INV-05 | `/invitations/:id` | DELETE | Blackbox | Tarik / batalkan undangan oleh pengirim | `id` undangan sebagai parameter URL | `200 OK` | Passed |

---

## 9. Memberships Module (`/memberships`)
File Script: [memberships.e2e-spec.ts](file:///d:/Perkuliahan/Work%20Order/workorder-portal/test/memberships.e2e-spec.ts)

| No | ID Test | Endpoint | HTTP Method | Tipe Pengujian | Kondisi Uji | Input/Payload | Expected Output | Status |
|---|---|---|---|---|---|---|---|---|
| 1 | TC-MBR-01 | `/memberships` | GET | Blackbox | Ambil daftar membership aktif | Authorization Header: `Bearer <token-owner>` | `200 OK` dengan daftar membership | Passed |
| 2 | TC-MBR-02 | `/memberships/codes` | GET | Blackbox | Ambil daftar kode membership perusahaan | Authorization Header: `Bearer <token-owner>` | `200 OK` dengan list kode | Passed |
| 3 | TC-MBR-03 | `/memberships/codes` | POST | Blackbox | Buat kode membership baru | `{"role":"company_staff","maxUses":5}` | `201 Created` dengan detail kode baru | Passed |
| 4 | TC-MBR-04 | `/memberships/codes` | POST | Whitebox | Pastikan data kode tersimpan di database | `{"role":"company_staff","maxUses":5}` | `201 Created`, record tersimpan di DB | Passed |
| 5 | TC-MBR-05 | `/memberships/codes/claim` | POST | Blackbox & Whitebox | Klaim kode membership yang valid | `{"code":"<valid-code>"}` | `200 OK`, user berhasil masuk perusahaan | Passed |
| 6 | TC-MBR-07 | `/memberships/codes/claim` | POST | Blackbox | Klaim kode membership tidak valid | `{"code":"INVALID_CODE_XYZ"}` | `400 Bad Request` | Passed |
| 7 | TC-MBR-09 | `/memberships/codes/:id` | DELETE | Blackbox | Nonaktifkan / hapus kode membership | `id` kode sebagai parameter URL | `200 OK` | Passed |

---

## 10. Notifications Module (`/notifications`)
File Script: [notifications.e2e-spec.ts](file:///d:/Perkuliahan/Work%20Order/workorder-portal/test/notifications.e2e-spec.ts)

| No | ID Test | Endpoint | HTTP Method | Tipe Pengujian | Kondisi Uji | Input/Payload | Expected Output | Status |
|---|---|---|---|---|---|---|---|---|
| 1 | TC-NOTIF-01 | `/notifications` | GET | Blackbox | Ambil riwayat notifikasi user | Authorization Header: `Bearer <token-owner>` | `200 OK` dengan array riwayat notifikasi | Passed |
| 2 | TC-NOTIF-02 | `/notifications/fcm-token` | POST | Blackbox | Registrasi token FCM baru | `{"token":"fake-fcm-token-abc123"}` | `201 Created` dengan data token terdaftar | Passed |
| 3 | TC-NOTIF-03 | `/notifications/fcm-token` | POST | Whitebox | Pastikan token FCM tersimpan di user DB | `{"token":"fake-fcm-token-whitebox"}` | `201 Created`, array `fcmTokens` terisi token di DB | Passed |
| 4 | TC-NOTIF-04 | `/notifications/fcm-token` | DELETE | Blackbox | Hapus token FCM terdaftar | `{"token":"fake-fcm-token-to-delete"}` | `200 OK` | Passed |
| 5 | TC-NOTIF-05 | `/notifications/fcm-token` | DELETE | Whitebox | Pastikan token terhapus dari array di DB | `{"token":"fake-fcm-token-whitebox-delete"}` | `200 OK`, token hilang dari `fcmTokens` user di DB | Passed |

---

## 11. Storage Module (`/files`)
File Script: [storage.e2e-spec.ts](file:///d:/Perkuliahan/Work%20Order/workorder-portal/test/storage.e2e-spec.ts)

| No | ID Test | Endpoint | HTTP Method | Tipe Pengujian | Kondisi Uji | Input/Payload | Expected Output | Status |
|---|---|---|---|---|---|---|---|---|
| 1 | TC-FILE-02 | `/files` | POST | Blackbox | Upload file melebihi batas ukuran 5MB | Multi-part form: buffer file size 6MB | `>= 400 Bad Request` | Passed |
| 2 | TC-FILE-03 | `/files` | POST | Blackbox | Upload file dengan tipe data bukan gambar | Multi-part form: PDF file buffer | `>= 400 Bad Request` | Passed |

---

## 12. Template Module (`/template`)
File Script: [template.e2e-spec.ts](file:///d:/Perkuliahan/Work%20Order/workorder-portal/test/template.e2e-spec.ts)

| No | ID Test | Endpoint | HTTP Method | Tipe Pengujian | Kondisi Uji | Input/Payload | Expected Output | Status |
|---|---|---|---|---|---|---|---|---|
| 1 | TC-TPL-01 | `/template/company-type` | GET | Blackbox | Ambil daftar tipe perusahaan terdaftar | Authorization Header: `Bearer <token-owner>` | `200 OK` dengan list `"PT (Perseroan Terbatas)"` | Passed |
| 2 | TC-TPL-02 | `/template/company-type/:companyTypeId/services` | GET | Blackbox | Ambil list template layanan tipe perusahaan valid | `companyTypeId` sebagai parameter URL | `200 OK` dengan array template layanan | Passed |
| 3 | TC-TPL-03 | `/template/company-type/:companyTypeId/services` | GET | Blackbox | Ambil list template dengan tipe ID salah | Fake ObjectId sebagai parameter URL | `404 Not Found` | Passed |
| 4 | TC-TPL-04 | `/template/services/:serviceTemplateId` | GET | Blackbox | Ambil detail template layanan valid | `serviceTemplateId` sebagai parameter URL | `200 OK` dengan detail template | Passed |
| 5 | TC-TPL-05 | `/template/services/generate` | POST | Blackbox | Clonal / Generate layanan dari template | `{"serviceTemplateIds":["<template-id>"]}` | `201 Created` dengan daftar layanan ter-generate | Passed |
| 6 | TC-TPL-06 | `/template/services/generate` | POST | Whitebox | Verifikasi layanan baru terbuat di DB | `{"serviceTemplateIds":["<template-id>"]}` | `201 Created`, record service baru terdaftar untuk `companyId` | Passed |
| 7 | TC-TPL-07 | `/template/services/generate` | POST | Whitebox | Verifikasi form baru terbuat dari blueprint | `{"serviceTemplateIds":["<template-id>"]}` | `201 Created`, record FormTemplate baru dibuat di DB | Passed |
| 8 | TC-TPL-08 | `/template/services/generate` | POST | Whitebox | Verifikasi penambahan posisi otomatis jika belum ada | `{"serviceTemplateIds":["<template-id>"]}` | `201 Created`, record Position baru terdaftar di DB | Passed |

---

## 13. Dashboard Module (`/dashboard`)
File Script: [dashboard.e2e-spec.ts](file:///d:/Perkuliahan/Work%20Order/workorder-portal/test/dashboard.e2e-spec.ts)

| No | ID Test | Endpoint | HTTP Method | Tipe Pengujian | Kondisi Uji | Input/Payload | Expected Output | Status |
|---|---|---|---|---|---|---|---|---|
| 1 | TC-DASH-01 | `/dashboard/service-request` | GET | Blackbox | Ambil metrik service requests | Authorization Header: `Bearer <token-owner>` | `200 OK` dengan metrik detail | Passed |
| 2 | TC-DASH-02 | `/dashboard/work-order` | GET | Blackbox | Ambil metrik work orders | Authorization Header: `Bearer <token-owner>` | `200 OK` dengan metrik detail | Passed |
| 3 | TC-DASH-03 | `/dashboard/company` | GET | Blackbox | Ambil ringkasan statistik perusahaan | Authorization Header: `Bearer <token-owner>` | `200 OK` dengan data ringkasan | Passed |

---

## 14. Service Price Module (`/service-price`)
File Script: [service-price.e2e-spec.ts](file:///d:/Perkuliahan/Work%20Order/workorder-portal/test/service-price.e2e-spec.ts)

| No | ID Test | Endpoint | HTTP Method | Tipe Pengujian | Kondisi Uji | Input/Payload | Expected Output | Status |
|---|---|---|---|---|---|---|---|---|
| 1 | TC-SP-01 | `/service-price` | GET | Blackbox | Ambil semua daftar harga layanan | Authorization Header: `Bearer <token-owner>` | `200 OK` dengan array skema harga | Passed |
| 2 | TC-SP-02 | `/service-price` | POST | Blackbox | Buat skema harga baru | `{"name":"Harga Standar","price":100000,"currency":"IDR"}` | `201 Created` dengan detail skema baru | Passed |
| 3 | TC-SP-03 | `/service-price/:id` | PUT | Blackbox | Update detail skema harga | `{"name":"Harga Diupdate","price":75000}` | `200 OK` | Passed |
| 4 | TC-SP-04 | `/service-price/:id` | DELETE | Blackbox | Hapus skema harga | `id` skema sebagai parameter URL | `200 OK` | Passed |

---

## 15. Global Error & Exception Handling
File Script: [error-format.e2e-spec.ts](file:///d:/Perkuliahan/Work%20Order/workorder-portal/test/error-format.e2e-spec.ts) & [repro-issue.e2e-spec.ts](file:///d:/Perkuliahan/Work%20Order/workorder-portal/test/repro-issue.e2e-spec.ts)

| No | ID Test | Endpoint | HTTP Method | Tipe Pengujian | Kondisi Uji | Input/Payload | Expected Output | Status |
|---|---|---|---|---|---|---|---|---|
| 1 | TC-ERR-01 | `/non-existent-route` | GET | Blackbox | Akses route yang tidak terdaftar | None | `404 Not Found` dengan code `HTTP_404` (terstandardisasi) | Passed |
| 2 | TC-ERR-02 | `/memberships` | GET | Blackbox | Akses endpoint terproteksi tanpa token | None | `401 Unauthorized` dengan code `HTTP_401` | Passed |
| 3 | TC-REPRO-01 | `/forms/:id` | GET | Whitebox (Repro) | Akses detail dengan format ObjectId tidak valid | ID 23 karakter: `68fa31cdc122d79a11504fb` | `400 Bad Request` (Bukan 500 Internal Server Error) | Passed |

---

## Modul Belum Memiliki Script Pengujian E2E
Modul-modul berikut saat ini belum diimplementasikan ke dalam skrip pengujian E2E (`.e2e-spec.ts`):
- **Service Request Module** (`/service-requests`)
- **Work Order Module** (`/workorders` & `/staff/work-orders`)
- **Work Report Module** (`/workreports`)
- **FAQ Module** (`/faq`)
- **Customer Pairing Module** (`/customer-pairing`)
