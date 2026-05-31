# Daftar Tabel Test Case Lengkap (E2E)

Dokumen ini berisi daftar lengkap test case yang diimplementasikan dalam skrip pengujian E2E (`.e2e-spec.ts`) di folder `test/`.

> **Keterangan Status:** `Passed` = sudah ada di script | `Planned` = perlu ditambahkan ke script

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
| 1 | TC-AUTH-01 | `/auth/register` | POST | Blackbox & Whitebox | Registrasi user baru dengan payload valid | `{"name":"John Doe","email":"john@example.com","password":"password123","role":"client"}` | `200 OK`, data user terbuat, password di-hash bcrypt di DB | Passed |
| 2 | TC-AUTH-02 | `/auth/register` | POST | Blackbox | Registrasi dengan email yang sudah terdaftar | `{"name":"John Doe","email":"john@example.com","password":"password123","role":"client"}` | `400 Bad Request`, pesan `"Email already registered"` | Passed |
| 3 | TC-AUTH-03 | `/auth/register` | POST | Blackbox | Input registrasi tidak valid (nama kosong, email salah format, password < 6 char) | `{"name":"","email":"not-an-email","password":"123","role":"invalid_role"}` | `400 Bad Request`, pesan `"Validation failed"` | Passed |
| 4 | TC-AUTH-04 | `/auth/register-company` | POST | Blackbox & Whitebox | Registrasi perusahaan dan owner baru dengan payload valid | `{"name":"Owner Name","email":"owner@company.com","password":"password123","companyName":"ACME Corp"}` | `200 OK`, record `User` dan `Company` terbuat & terhubung di DB | Passed |
| 5 | TC-AUTH-05 | `/auth/register-company` | POST | Blackbox | Registrasi owner dengan email yang sudah terdaftar | `{"name":"Owner Name","email":"owner@company.com","password":"password123","companyName":"ACME Corp"}` | `400 Bad Request`, pesan `"Email already registered"` | Passed |
| 6 | TC-AUTH-06 | `/auth/register-company` | POST | Blackbox | Input registrasi perusahaan tidak lengkap | `{"name":"","email":"invalid-email"}` | `400 Bad Request`, pesan `"Validation failed"` | Passed |
| 7 | TC-AUTH-07 | `/auth/login` | POST | Blackbox & Whitebox | Login dengan email dan password yang valid | `{"email":"jane@example.com","password":"password123"}` | `200 OK`, token Bearer format valid di response | Passed |
| 8 | TC-AUTH-08 | `/auth/login` | POST | Blackbox | Login dengan password yang salah | `{"email":"jane@example.com","password":"wrongpassword"}` | `400 Bad Request`, pesan `"Invalid credentials"` | Passed |
| 9 | TC-AUTH-09 | `/auth/login` | POST | Blackbox | Login dengan email yang tidak terdaftar | `{"email":"notexist@example.com","password":"password123"}` | `400 Bad Request`, pesan `"Invalid credentials"` | Planned |
| 10 | TC-AUTH-10 | `/auth/logout` | POST | Blackbox | Logout dengan token JWT valid | Authorization Header: `Bearer <token>` | `200 OK`, pesan `"Logout successful"` | Passed |
| 11 | TC-AUTH-11 | `/auth/logout` | POST | Blackbox | Logout tanpa menyertakan token JWT | None | `401 Unauthorized` | Passed |
| 12 | TC-AUTH-12 | `/auth/profile` | GET | Blackbox & Whitebox | Ambil profil aktif dengan token JWT valid; field password tidak muncul | Authorization Header: `Bearer <token>` | `200 OK`, data profile tanpa field password di response | Passed |
| 13 | TC-AUTH-13 | `/auth/profile` | GET | Blackbox | Ambil profil tanpa menyertakan token JWT | None | `401 Unauthorized` | Passed |

---

## 3. Users Module (`/users`)
File Script: [users.e2e-spec.ts](file:///d:/Perkuliahan/Work%20Order/workorder-portal/test/users.e2e-spec.ts)

| No | ID Test | Endpoint | HTTP Method | Tipe Pengujian | Kondisi Uji | Input/Payload | Expected Output | Status |
|---|---|---|---|---|---|---|---|---|
| 1 | TC-USER-01 | `/users/me` | GET | Blackbox & Whitebox | Ambil profil sendiri dengan token valid; field password tidak muncul | Authorization Header: `Bearer <token>` | `200 OK`, data profil lengkap, `password` undefined di response | Passed |
| 2 | TC-USER-02 | `/users/me` | GET | Blackbox | Ambil profil tanpa token JWT | None | `401 Unauthorized`, pesan `"Unauthorized"` | Passed |
| 3 | TC-USER-03 | `/users/me` | PATCH | Blackbox & Whitebox | Update nama dan email dengan payload valid; verifikasi perubahan di DB | `{"name":"Jane Updated","email":"jane.updated@example.com"}` | `200 OK`, nama & email terupdate di DB | Passed |
| 4 | TC-USER-04 | `/users/me` | PATCH | Blackbox & Whitebox | Ganti password dengan `currentPassword` benar; verifikasi login pakai password baru | `{"currentPassword":"password123","newPassword":"newpassword123"}` | `200 OK`, dapat login dengan password baru | Passed |
| 5 | TC-USER-05 | `/users/me` | PATCH | Blackbox | Ganti password dengan `currentPassword` salah | `{"currentPassword":"wrongpassword","newPassword":"newpassword123"}` | `401 Unauthorized` | Passed |
| 6 | TC-USER-06 | `/users/me` | PATCH | Blackbox | Update profil dengan format email tidak valid | `{"email":"invalid-email-format"}` | `400 Bad Request`, pesan `"Validation failed"` | Passed |
| 7 | TC-USER-07 | `/users/me` | PATCH | Whitebox | Verifikasi bahwa field `_id` dan `role` tidak dapat diubah dari client | `{"_id":"fake-id","role":"admin"}` | `200 OK`, `_id` dan `role` tetap tidak berubah di DB | Planned |

---

## 4. Company Module (`/company` & `/public/companies`)
File Script: [company.e2e-spec.ts](file:///d:/Perkuliahan/Work%20Order/workorder-portal/test/company.e2e-spec.ts)

| No | ID Test | Endpoint | HTTP Method | Tipe Pengujian | Kondisi Uji | Input/Payload | Expected Output | Status |
|---|---|---|---|---|---|---|---|---|
| 1 | TC-COMP-01 | `/company` | GET | Blackbox & Whitebox | Ambil detail perusahaan internal sebagai Owner | Authorization Header: `Bearer <token-owner>` | `200 OK`, detail perusahaan milik owner | Passed |
| 2 | TC-COMP-02 | `/company` | GET | Blackbox | Akses endpoint internal perusahaan sebagai Client (unauthorized role) | Authorization Header: `Bearer <token-client>` | `403 Forbidden` | Passed |
| 3 | TC-COMP-03 | `/company/invite` | POST | Blackbox & Whitebox | Undang karyawan baru sebagai Company Manager; record Invitation dibuat di DB | `{"invites":[{"email":"staff.candidate@example.com","role":"company_manager"}]}` | `201 Created`, invitation status `pending` ada di DB | Passed |
| 4 | TC-COMP-04 | `/company/invite` | POST | Blackbox | Undang user yang sudah terasosiasi dengan perusahaan yang sama | `{"invites":[{"email":"owner@acme.com","role":"company_manager"}]}` | `422 Unprocessable Entity`, pesan `"Validation failed"` | Passed |
| 5 | TC-COMP-05 | `/company/invitations/history` | GET | Blackbox & Whitebox | Ambil riwayat undangan perusahaan; hanya tampil milik company sendiri | Authorization Header: `Bearer <token-owner>` | `200 OK` dengan daftar riwayat undangan yang benar | Passed |
| 6 | TC-COMP-06 | `/company/employees` | GET | Blackbox & Whitebox | Ambil daftar karyawan perusahaan yang terautentikasi | Authorization Header: `Bearer <token-owner>` | `200 OK` dengan daftar karyawan yang benar | Passed |
| 7 | TC-COMP-07 | `/company` | PUT | Blackbox & Whitebox | Update profil perusahaan dengan data valid; verifikasi di DB | `{"name":"ACME Global Inc","address":"123 Enterprise Rd","description":"Global tech provider"}` | `200 OK`, data terupdate di DB | Passed |
| 8 | TC-COMP-08 | `/company/detail` | GET | Blackbox & Whitebox | Ambil detail lengkap profil perusahaan | Authorization Header: `Bearer <token-owner>` | `200 OK`, detail profil sesuai | Passed |
| 9 | TC-COMP-09 | `/company` | DELETE | Blackbox & Whitebox | Soft-delete perusahaan oleh Owner; flag `deletedAt` terisi | Authorization Header: `Bearer <token-owner>` | `200 OK`, field `deletedAt` bukan null di DB | Passed |
| 10 | TC-COMP-10 | `/company/integration-config` | GET | Blackbox | Ambil konfigurasi integrasi perusahaan; nilai default `is_integration_active: false` | Authorization Header: `Bearer <token-owner>` | `200 OK`, `is_integration_active: false` | Passed |
| 11 | TC-COMP-11 | `/company/integration-config` | PUT | Blackbox & Whitebox | Update konfigurasi integrasi; verifikasi mapping camelCase di DB | `{"is_integration_active":true,"integration_type":"external_system","external_login_url":"..."}` | `200 OK`, `isIntegrationActive: true` di DB | Passed |
| 12 | TC-COMP-12 | `/public/companies` | GET | Blackbox | Ambil list perusahaan publik tanpa auth; hanya yang `isActive: true` | None | `200 OK`, list perusahaan aktif | Passed |
| 13 | TC-COMP-13 | `/public/companies` | GET | Whitebox | Pastikan perusahaan non-aktif (`isActive: false`) tidak muncul di public list | None | `200 OK`, perusahaan non-aktif tidak ada di response | Planned |
| 14 | TC-COMP-14 | `/public/companies/:id` | GET | Blackbox & Whitebox | Ambil detail perusahaan publik berdasarkan ID | `id` sebagai parameter URL | `200 OK`, detail perusahaan | Passed |
| 15 | TC-COMP-15 | `/public/companies/:id` | GET | Blackbox | Akses detail perusahaan publik dengan ID tidak terdaftar | Fake ObjectId sebagai parameter URL | `404 Not Found` | Planned |
| 16 | TC-COMP-16 | `/public/companies/:id/services` | GET | Blackbox & Whitebox | Ambil list layanan publik perusahaan tanpa auth | `id` sebagai parameter URL | `200 OK`, daftar layanan aktif milik perusahaan | Passed |

---

## 5. Positions Module (`/positions`)
File Script: [positions.e2e-spec.ts](file:///d:/Perkuliahan/Work%20Order/workorder-portal/test/positions.e2e-spec.ts)

| No | ID Test | Endpoint | HTTP Method | Tipe Pengujian | Kondisi Uji | Input/Payload | Expected Output | Status |
|---|---|---|---|---|---|---|---|---|
| 1 | TC-POS-01 | `/positions` | GET | Blackbox | Ambil daftar posisi sebagai Owner (dengan data yang ada) | Authorization Header: `Bearer <token-owner>` | `200 OK` dengan daftar posisi | Passed |
| 2 | TC-POS-02 | `/positions` | GET | Whitebox | Verifikasi isolasi data: posisi perusahaan A tidak tampil di B | Authorization Header: `Bearer <token-owner-B>` | `200 OK`, daftar kosong / tanpa posisi milik perusahaan A | Passed |
| 3 | TC-POS-03 | `/positions/:id` | GET | Blackbox | Ambil detail posisi dengan ID valid | `id` posisi sebagai parameter URL | `200 OK` dengan detail posisi | Passed |
| 4 | TC-POS-04 | `/positions/:id` | GET | Blackbox | Ambil detail posisi dengan ID tidak terdaftar | Fake ObjectId sebagai parameter URL | `404 Not Found` | Passed |
| 5 | TC-POS-05 | `/positions/:id` | GET | Blackbox | Ambil posisi tanpa menyertakan token JWT | None | `401 Unauthorized` | Planned |
| 6 | TC-POS-06 | `/positions` | POST | Blackbox | Buat posisi baru sebagai Owner dengan payload valid | `{"name":"Teknisi Lapangan","description":"Instalasi lapangan"}` | `201 Created` dengan detail posisi baru | Passed |
| 7 | TC-POS-07 | `/positions` | POST | Blackbox | Buat posisi baru sebagai Client (role tidak diizinkan) | `{"name":"Test","description":"Test"}` | `403 Forbidden` | Passed |
| 8 | TC-POS-08 | `/positions` | POST | Blackbox | Buat posisi dengan nama kosong / validasi gagal | `{"name":"","description":""}` | `400 Bad Request`, pesan `"Validation failed"` | Planned |
| 9 | TC-POS-09 | `/positions` | POST | Whitebox | Verifikasi record posisi tersimpan di MongoDB | `{"name":"Admin Gudang","description":"Kelola gudang"}` | `201 Created`, record ditemukan di DB | Passed |
| 10 | TC-POS-10 | `/positions/:id` | PUT | Blackbox & Whitebox | Update data posisi dengan payload valid; verifikasi di DB | `{"name":"New Name","description":"New Desc"}` | `200 OK`, data terupdate di DB | Passed |
| 11 | TC-POS-11 | `/positions/:id` | PUT | Blackbox | Update posisi dengan ID yang tidak terdaftar | Fake ObjectId sebagai parameter URL | `404 Not Found` | Planned |
| 12 | TC-POS-12 | `/positions/:id` | DELETE | Blackbox | Hapus posisi kerja milik company sendiri | `id` posisi sebagai parameter URL | `200 OK` | Passed |
| 13 | TC-POS-13 | `/positions/:id` | DELETE | Whitebox | Verifikasi posisi terhapus dari DB setelah delete | `id` posisi sebagai parameter URL | `200 OK`, record tidak ditemukan di DB | Planned |

---

## 6. Services Module (`/services` & `/public/services`)
File Script: [services.e2e-spec.ts](file:///d:/Perkuliahan/Work%20Order/workorder-portal/test/services.e2e-spec.ts)

| No | ID Test | Endpoint | HTTP Method | Tipe Pengujian | Kondisi Uji | Input/Payload | Expected Output | Status |
|---|---|---|---|---|---|---|---|---|
| 1 | TC-SVC-01 | `/services` | POST | Blackbox | Buat layanan baru dengan payload valid | `{"title":"Layanan Test","accessType":"internal","draftingWorkOrderType":"auto",...}` | `201 Created` dengan detail layanan baru | Passed |
| 2 | TC-SVC-02 | `/services` | POST | Whitebox | Validasi reference: `intakeFormId` tidak terdaftar di DB | Override `intakeFormId` dengan fake ObjectId | `404 Not Found` | Passed |
| 3 | TC-SVC-03 | `/services` | POST | Whitebox | Verifikasi record layanan tersimpan di MongoDB setelah create | Payload layanan valid | `201 Created`, record Service ditemukan di DB | Planned |
| 4 | TC-SVC-04 | `/services` | POST | Blackbox | Buat layanan tanpa field wajib (`title` kosong) | Payload tanpa `title` | `400 Bad Request`, pesan `"Validation failed"` | Planned |
| 5 | TC-SVC-05 | `/services` | GET | Blackbox | Ambil semua daftar layanan internal perusahaan | Authorization Header: `Bearer <token-owner>` | `200 OK` dengan daftar layanan | Passed |
| 6 | TC-SVC-06 | `/services` | GET | Whitebox | Verifikasi isolasi data: layanan perusahaan A tidak muncul di B | Authorization Header: `Bearer <token-owner-B>` | `200 OK`, daftar tanpa layanan perusahaan A | Passed |
| 7 | TC-SVC-07 | `/services/:id` | GET | Blackbox | Ambil detail layanan berdasarkan ID valid | `id` layanan sebagai parameter URL | `200 OK` dengan detail layanan | Passed |
| 8 | TC-SVC-08 | `/services/:id` | GET | Blackbox | Ambil detail layanan dengan ID tidak terdaftar | Fake ObjectId sebagai parameter URL | `404 Not Found` | Planned |
| 9 | TC-SVC-09 | `/services/:id/toggle-active` | PATCH | Blackbox & Whitebox | Ubah status layanan dari aktif ke nonaktif; verifikasi di DB | `{"isActive":false}` | `200 OK`, `isActive: false` di DB | Passed |
| 10 | TC-SVC-10 | `/services/:id/toggle-active` | Blackbox | Toggle aktifkan kembali layanan yang nonaktif | `{"isActive":true}` | `200 OK`, `isActive: true` di response | Planned |
| 11 | TC-SVC-11 | `/services/:id` | DELETE | Blackbox & Whitebox | Soft-delete layanan; `deletedAt` terisi di DB | `id` layanan sebagai parameter URL | `200 OK`, `deletedAt` bukan null di DB | Passed |
| 12 | TC-SVC-12 | `/public/services/company/:companyId` | GET | Blackbox | Ambil layanan publik perusahaan tanpa auth (accessType: public, isActive: true) | `companyId` sebagai parameter URL | `200 OK` dengan daftar layanan aktif publik | Passed |
| 13 | TC-SVC-13 | `/public/services/company/:companyId` | GET | Whitebox | Pastikan endpoint publik dapat diakses tanpa JWT (tidak return 401) | None | Status bukan `401` | Passed |
| 14 | TC-SVC-14 | `/public/services/company/:companyId` | GET | Whitebox | Verifikasi hanya layanan `isActive: true` yang muncul di public endpoint | Buat layanan nonaktif dan aktif | `200 OK`, layanan nonaktif tidak ada di response | Planned |

---

## 7. Forms Module (`/forms`)
File Script: [forms.e2e-spec.ts](file:///d:/Perkuliahan/Work%20Order/workorder-portal/test/forms.e2e-spec.ts)

| No | ID Test | Endpoint | HTTP Method | Tipe Pengujian | Kondisi Uji | Input/Payload | Expected Output | Status |
|---|---|---|---|---|---|---|---|---|
| 1 | TC-FORM-01 | `/forms` | POST | Blackbox | Buat template form baru dengan payload valid | `{"title":"Form Intake Test","formType":"intake","fields":[...]}` | `201 Created` dengan detail form baru | Passed |
| 2 | TC-FORM-02 | `/forms` | POST | Whitebox | Validasi enum `formType` tidak valid | `{"title":"Form","formType":"invalid_type","fields":[]}` | `400 Bad Request`, `"Validation failed"` | Passed |
| 3 | TC-FORM-03 | `/forms` | POST | Whitebox | Verifikasi record form tersimpan di MongoDB | Payload form valid | `201 Created`, record FormTemplate ditemukan di DB | Planned |
| 4 | TC-FORM-04 | `/forms` | POST | Blackbox | Buat form tanpa field `title` | Payload tanpa `title` | `400 Bad Request`, pesan `"Validation failed"` | Planned |
| 5 | TC-FORM-05 | `/forms` | GET | Blackbox | Ambil seluruh template form milik perusahaan | Authorization Header: `Bearer <token-owner>` | `200 OK` dengan daftar form | Passed |
| 6 | TC-FORM-06 | `/forms` | GET | Whitebox | Verifikasi isolasi data: form perusahaan A tidak muncul di B | Authorization Header: `Bearer <token-owner-B>` | `200 OK`, form milik perusahaan A tidak ada | Passed |
| 7 | TC-FORM-07 | `/forms/:id` | GET | Blackbox | Ambil detail form berdasarkan ID valid | `id` form sebagai parameter URL | `200 OK` dengan detail form | Passed |
| 8 | TC-FORM-08 | `/forms/:id` | GET | Blackbox | Ambil detail form dengan ID tidak terdaftar | Fake ObjectId sebagai parameter URL | `404 Not Found` | Passed |
| 9 | TC-FORM-09 | `/forms/:id` | PUT | Blackbox | Update judul dan field form | `{"title":"Form Updated","fields":[...]}` | `200 OK`, judul terupdate | Passed |
| 10 | TC-FORM-10 | `/forms/:id` | PUT | Whitebox | Verifikasi perubahan tersimpan di MongoDB setelah update | `{"title":"Form Updated","fields":[...]}` | `200 OK`, judul terupdate di DB | Planned |
| 11 | TC-FORM-11 | `/forms/submissions` | POST | Blackbox & Whitebox | Submit form dengan semua field wajib terisi; record tersimpan di DB | `{"formId":"...","answers":[{"fieldId":"...","value":"Budi Santoso"}]}` | `201 Created`, data tersimpan di collection FormSubmission | Passed |
| 12 | TC-FORM-12 | `/forms/submissions` | POST | Blackbox | Submit form dengan field wajib (required) dikosongkan | `{"formId":"...","answers":[]}` | `>= 400 Bad Request` | Passed |
| 13 | TC-FORM-13 | `/forms/submissions` | POST | Blackbox | Submit form dengan `formId` tidak terdaftar | `{"formId":"<fake-id>","answers":[...]}` | `404 Not Found` | Planned |
| 14 | TC-FORM-14 | `/forms/:id` | DELETE | Blackbox | Hapus template form milik perusahaan | `id` form sebagai parameter URL | `200 OK` | Passed |
| 15 | TC-FORM-15 | `/forms/:id` | DELETE | Whitebox | Verifikasi form terhapus dari DB setelah delete | `id` form sebagai parameter URL | `200 OK`, record tidak ditemukan di DB | Planned |

---

## 8. Invitations Module (`/invitations`)
File Script: [invitations.e2e-spec.ts](file:///d:/Perkuliahan/Work%20Order/workorder-portal/test/invitations.e2e-spec.ts)

| No | ID Test | Endpoint | HTTP Method | Tipe Pengujian | Kondisi Uji | Input/Payload | Expected Output | Status |
|---|---|---|---|---|---|---|---|---|
| 1 | TC-INV-01 | `/invitations/pending` | GET | Blackbox | Ambil daftar undangan pending untuk user yang diundang | Authorization Header: `Bearer <token-staff>` | `200 OK` dengan list undangan pending | Passed |
| 2 | TC-INV-02 | `/invitations/pending` | GET | Whitebox | Verifikasi hanya undangan milik user yang muncul | Authorization Header: `Bearer <token-staff>` | `200 OK`, list hanya berisi undangan dengan `inviteeId` yang cocok | Planned |
| 3 | TC-INV-03 | `/invitations/:id/accept` | PUT | Blackbox & Whitebox | Terima undangan; `companyId` user terisi di DB | `id` undangan sebagai parameter URL | `200 OK`, status `accepted`, `companyId` user bertambah di DB | Passed |
| 4 | TC-INV-04 | `/invitations/:id/accept` | Blackbox | Terima undangan yang sudah pernah diterima (duplikasi) | ID undangan yang sudah `accepted` | `400 Bad Request` atau `422 Unprocessable Entity` | Planned |
| 5 | TC-INV-05 | `/invitations/:id/reject` | PUT | Blackbox | Tolak undangan bergabung perusahaan | `id` undangan sebagai parameter URL | `200 OK`, status undangan menjadi `"rejected"` | Passed |
| 6 | TC-INV-06 | `/invitations/:id/reject` | Whitebox | Verifikasi status `rejected` tersimpan di DB | `id` undangan sebagai parameter URL | `200 OK`, status dokumen di DB adalah `rejected` | Planned |
| 7 | TC-INV-07 | `/invitations/:id` | DELETE | Blackbox | Tarik/batalkan undangan oleh pengirim (owner) | `id` undangan sebagai parameter URL | `200 OK` | Passed |
| 8 | TC-INV-08 | `/invitations/:id` | DELETE | Blackbox | Batalkan undangan oleh user yang bukan pengirim | Authorization Header: token staff (bukan pengirim) | `403 Forbidden` | Planned |

---

## 9. Memberships Module (`/memberships`)
File Script: [memberships.e2e-spec.ts](file:///d:/Perkuliahan/Work%20Order/workorder-portal/test/memberships.e2e-spec.ts)

| No | ID Test | Endpoint | HTTP Method | Tipe Pengujian | Kondisi Uji | Input/Payload | Expected Output | Status |
|---|---|---|---|---|---|---|---|---|
| 1 | TC-MBR-01 | `/memberships` | GET | Blackbox | Ambil daftar membership aktif perusahaan | Authorization Header: `Bearer <token-owner>` | `200 OK` dengan daftar membership | Passed |
| 2 | TC-MBR-02 | `/memberships/codes` | GET | Blackbox | Ambil daftar kode membership buatan perusahaan | Authorization Header: `Bearer <token-owner>` | `200 OK` dengan list kode | Passed |
| 3 | TC-MBR-03 | `/memberships/codes` | POST | Blackbox | Buat kode membership baru dengan role dan maxUses valid | `{"role":"company_staff","maxUses":5}` | `201 Created` dengan detail kode baru | Passed |
| 4 | TC-MBR-04 | `/memberships/codes` | POST | Whitebox | Verifikasi record kode tersimpan di collection MembershipCode | `{"role":"company_staff","maxUses":5}` | `201 Created`, record ada di DB | Passed |
| 5 | TC-MBR-05 | `/memberships/codes` | POST | Blackbox | Buat kode dengan role tidak valid | `{"role":"invalid_role","maxUses":5}` | `400 Bad Request`, pesan `"Validation failed"` | Planned |
| 6 | TC-MBR-06 | `/memberships/codes/claim` | POST | Blackbox & Whitebox | Klaim kode membership yang valid; user bergabung ke perusahaan | `{"code":"<valid-code>"}` | `200 OK`, user berhasil masuk perusahaan | Passed |
| 7 | TC-MBR-07 | `/memberships/codes/claim` | Whitebox | Verifikasi `companyId` user terisi di DB setelah klaim berhasil | `{"code":"<valid-code>"}` | `200 OK`, field `companyId` pada User document terisi | Planned |
| 8 | TC-MBR-08 | `/memberships/codes/claim` | POST | Blackbox | Klaim kode membership yang tidak valid / tidak terdaftar | `{"code":"INVALID_CODE_XYZ"}` | `400 Bad Request` | Passed |
| 9 | TC-MBR-09 | `/memberships/codes/claim` | POST | Blackbox | Klaim kode yang sudah mencapai `maxUses` | Kode dengan `currentUses == maxUses` | `400 Bad Request` | Planned |
| 10 | TC-MBR-10 | `/memberships/codes/:id` | DELETE | Blackbox | Nonaktifkan / hapus kode membership milik perusahaan | `id` kode sebagai parameter URL | `200 OK` | Passed |
| 11 | TC-MBR-11 | `/memberships/codes/:id` | DELETE | Whitebox | Verifikasi kode dinonaktifkan di DB setelah delete | `id` kode sebagai parameter URL | `200 OK`, status kode di DB berubah menjadi nonaktif | Planned |

---

## 10. Notifications Module (`/notifications`)
File Script: [notifications.e2e-spec.ts](file:///d:/Perkuliahan/Work%20Order/workorder-portal/test/notifications.e2e-spec.ts)

| No | ID Test | Endpoint | HTTP Method | Tipe Pengujian | Kondisi Uji | Input/Payload | Expected Output | Status |
|---|---|---|---|---|---|---|---|---|
| 1 | TC-NOTIF-01 | `/notifications` | GET | Blackbox | Ambil riwayat notifikasi user yang terautentikasi | Authorization Header: `Bearer <token-owner>` | `200 OK` dengan array riwayat notifikasi | Passed |
| 2 | TC-NOTIF-02 | `/notifications` | GET | Blackbox | Akses riwayat notifikasi tanpa token JWT | None | `401 Unauthorized` | Planned |
| 3 | TC-NOTIF-03 | `/notifications/fcm-token` | POST | Blackbox | Registrasi token FCM baru | `{"token":"fake-fcm-token-abc123"}` | `201 Created` dengan data token terdaftar | Passed |
| 4 | TC-NOTIF-04 | `/notifications/fcm-token` | POST | Whitebox | Verifikasi token FCM tersimpan di array `fcmTokens` user di DB | `{"token":"fake-fcm-token-whitebox"}` | `201 Created`, token ditemukan dalam `fcmTokens` di DB | Passed |
| 5 | TC-NOTIF-05 | `/notifications/fcm-token` | POST | Blackbox | Registrasi FCM token yang sudah terdaftar (duplikasi) | `{"token":"<existing-token>"}` | `201 Created` tanpa duplikasi token di DB | Planned |
| 6 | TC-NOTIF-06 | `/notifications/fcm-token` | DELETE | Blackbox | Hapus / logout token FCM yang terdaftar | `{"token":"fake-fcm-token-to-delete"}` | `200 OK` | Passed |
| 7 | TC-NOTIF-07 | `/notifications/fcm-token` | DELETE | Whitebox | Verifikasi token terhapus dari array `fcmTokens` di DB | `{"token":"fake-fcm-token-whitebox-delete"}` | `200 OK`, token tidak ada lagi dalam `fcmTokens` di DB | Passed |
| 8 | TC-NOTIF-08 | `/notifications/fcm-token` | DELETE | Blackbox | Hapus token FCM yang tidak terdaftar | `{"token":"non-existent-token"}` | `200 OK` (operasi idempotent) | Planned |

---

## 11. Storage Module (`/files`)
File Script: [storage.e2e-spec.ts](file:///d:/Perkuliahan/Work%20Order/workorder-portal/test/storage.e2e-spec.ts)

| No | ID Test | Endpoint | HTTP Method | Tipe Pengujian | Kondisi Uji | Input/Payload | Expected Output | Status |
|---|---|---|---|---|---|---|---|---|
| 1 | TC-FILE-01 | `/files` | POST | Blackbox | Upload file gambar valid (< 5MB) dengan format yang diizinkan | Multi-part form: file PNG valid ~100KB | `201 Created` dengan URL file di response | Planned |
| 2 | TC-FILE-02 | `/files` | POST | Blackbox | Upload file melebihi batas ukuran 5MB | Multi-part form: buffer 6MB | `>= 400 Bad Request` | Passed |
| 3 | TC-FILE-03 | `/files` | POST | Blackbox | Upload file dengan tipe bukan gambar (PDF) | Multi-part form: PDF buffer | `>= 400 Bad Request` | Passed |
| 4 | TC-FILE-04 | `/files` | POST | Blackbox | Upload tanpa menyertakan token JWT | File valid tanpa Authorization Header | `401 Unauthorized` | Planned |
| 5 | TC-FILE-05 | `/files` | POST | Whitebox | Verifikasi URL file yang diupload dapat diakses dan valid | File PNG valid | `201 Created`, URL di response adalah string valid / dapat diakses | Planned |

---

## 12. Template Module (`/template`)
File Script: [template.e2e-spec.ts](file:///d:/Perkuliahan/Work%20Order/workorder-portal/test/template.e2e-spec.ts)

| No | ID Test | Endpoint | HTTP Method | Tipe Pengujian | Kondisi Uji | Input/Payload | Expected Output | Status |
|---|---|---|---|---|---|---|---|---|
| 1 | TC-TPL-01 | `/template/company-type` | GET | Blackbox | Ambil daftar tipe perusahaan yang terdaftar | Authorization Header: `Bearer <token-owner>` | `200 OK` dengan list `"PT (Perseroan Terbatas)"` | Passed |
| 2 | TC-TPL-02 | `/template/company-type` | GET | Whitebox | Verifikasi data company type diambil dari collection CompanyType di DB | Authorization Header: `Bearer <token-owner>` | `200 OK`, jumlah data sesuai yang di-seed ke DB | Planned |
| 3 | TC-TPL-03 | `/template/company-type/:companyTypeId/services` | GET | Blackbox | Ambil list template layanan untuk tipe perusahaan valid | `companyTypeId` sebagai parameter URL | `200 OK` dengan array template layanan | Passed |
| 4 | TC-TPL-04 | `/template/company-type/:companyTypeId/services` | GET | Blackbox | Ambil list template dengan tipe ID tidak terdaftar | Fake ObjectId sebagai parameter URL | `404 Not Found` | Passed |
| 5 | TC-TPL-05 | `/template/services/:serviceTemplateId` | GET | Blackbox | Ambil detail template layanan berdasarkan ID valid | `serviceTemplateId` sebagai parameter URL | `200 OK` dengan detail template | Passed |
| 6 | TC-TPL-06 | `/template/services/:serviceTemplateId` | GET | Blackbox | Ambil detail template dengan ID tidak terdaftar | Fake ObjectId sebagai parameter URL | `404 Not Found` | Planned |
| 7 | TC-TPL-07 | `/template/services/generate` | POST | Blackbox | Generate layanan dari template; mengembalikan daftar layanan baru | `{"serviceTemplateIds":["<template-id>"]}` | `201 Created` dengan daftar layanan ter-generate | Passed |
| 8 | TC-TPL-08 | `/template/services/generate` | POST | Whitebox | Verifikasi record Service ter-clone dengan `companyId` yang benar di DB | `{"serviceTemplateIds":["<template-id>"]}` | `201 Created`, record Service baru ada di DB | Passed |
| 9 | TC-TPL-09 | `/template/services/generate` | POST | Whitebox | Verifikasi FormTemplate baru dibuat dari blueprint template | `{"serviceTemplateIds":["<template-id>"]}` | `201 Created`, record FormTemplate baru ada di DB | Passed |
| 10 | TC-TPL-10 | `/template/services/generate` | POST | Whitebox | Verifikasi Position baru dibuat otomatis jika belum ada di perusahaan | `{"serviceTemplateIds":["<template-id>"]}` | `201 Created`, record Position baru ada di DB | Passed |
| 11 | TC-TPL-11 | `/template/services/generate` | POST | Blackbox | Generate layanan dengan `serviceTemplateId` yang tidak terdaftar | `{"serviceTemplateIds":["<fake-id>"]}` | `404 Not Found` | Planned |
| 12 | TC-TPL-12 | `/template/services/generate` | POST | Blackbox | Generate tanpa menyertakan token JWT | `{"serviceTemplateIds":["<template-id>"]}` | `401 Unauthorized` | Planned |

---

## 13. Dashboard Module (`/dashboard`)
File Script: [dashboard.e2e-spec.ts](file:///d:/Perkuliahan/Work%20Order/workorder-portal/test/dashboard.e2e-spec.ts)

| No | ID Test | Endpoint | HTTP Method | Tipe Pengujian | Kondisi Uji | Input/Payload | Expected Output | Status |
|---|---|---|---|---|---|---|---|---|
| 1 | TC-DASH-01 | `/dashboard/service-request` | GET | Blackbox | Ambil metrik service requests dengan token Owner | Authorization Header: `Bearer <token-owner>` | `200 OK` dengan data metrik | Passed |
| 2 | TC-DASH-02 | `/dashboard/service-request` | Blackbox | Akses metrik tanpa token JWT | None | `401 Unauthorized` | Planned |
| 3 | TC-DASH-03 | `/dashboard/work-order` | GET | Blackbox | Ambil metrik work orders dengan token Owner | Authorization Header: `Bearer <token-owner>` | `200 OK` dengan data metrik | Passed |
| 4 | TC-DASH-04 | `/dashboard/work-order` | GET | Whitebox | Verifikasi data metrik terfilter berdasarkan `companyId` Owner | Authorization Header: `Bearer <token-owner>` | `200 OK`, data hanya milik perusahaan yang bersangkutan | Planned |
| 5 | TC-DASH-05 | `/dashboard/company` | GET | Blackbox | Ambil ringkasan statistik perusahaan | Authorization Header: `Bearer <token-owner>` | `200 OK` dengan data ringkasan | Passed |
| 6 | TC-DASH-06 | `/dashboard/company` | GET | Whitebox | Verifikasi struktur response metrik company (field yang ada sesuai) | Authorization Header: `Bearer <token-owner>` | `200 OK`, `res.body.data` memiliki field yang didefinisikan | Planned |

---

## 14. Service Price Module (`/service-price`)
File Script: [service-price.e2e-spec.ts](file:///d:/Perkuliahan/Work%20Order/workorder-portal/test/service-price.e2e-spec.ts)

| No | ID Test | Endpoint | HTTP Method | Tipe Pengujian | Kondisi Uji | Input/Payload | Expected Output | Status |
|---|---|---|---|---|---|---|---|---|
| 1 | TC-SP-01 | `/service-price` | GET | Blackbox | Ambil semua daftar skema harga layanan | Authorization Header: `Bearer <token-owner>` | `200 OK` dengan array skema harga | Passed |
| 2 | TC-SP-02 | `/service-price` | GET | Whitebox | Verifikasi data harga hanya milik perusahaan yang terautentikasi | Authorization Header: `Bearer <token-owner>` | `200 OK`, tidak ada data harga perusahaan lain | Planned |
| 3 | TC-SP-03 | `/service-price` | POST | Blackbox | Buat skema harga baru dengan payload valid | `{"name":"Harga Standar","price":100000,"currency":"IDR"}` | `201 Created` dengan detail skema baru | Passed |
| 4 | TC-SP-04 | `/service-price` | POST | Whitebox | Verifikasi record skema harga tersimpan di DB | `{"name":"Harga Standar","price":100000,"currency":"IDR"}` | `201 Created`, record ditemukan di DB | Planned |
| 5 | TC-SP-05 | `/service-price` | POST | Blackbox | Buat skema harga dengan field wajib kosong | `{"name":""}` | `400 Bad Request`, pesan `"Validation failed"` | Planned |
| 6 | TC-SP-06 | `/service-price/:id` | PUT | Blackbox | Update detail skema harga dengan payload valid | `{"name":"Harga Diupdate","price":75000}` | `200 OK` | Passed |
| 7 | TC-SP-07 | `/service-price/:id` | PUT | Whitebox | Verifikasi perubahan skema harga tersimpan di DB | `{"name":"Harga Diupdate","price":75000}` | `200 OK`, data terupdate di DB | Planned |
| 8 | TC-SP-08 | `/service-price/:id` | PUT | Blackbox | Update skema harga dengan ID tidak terdaftar | Fake ObjectId sebagai parameter URL | `404 Not Found` | Planned |
| 9 | TC-SP-09 | `/service-price/:id` | DELETE | Blackbox | Hapus skema harga | `id` skema sebagai parameter URL | `200 OK` | Passed |
| 10 | TC-SP-10 | `/service-price/:id` | DELETE | Whitebox | Verifikasi record terhapus dari DB | `id` skema sebagai parameter URL | `200 OK`, record tidak ditemukan di DB | Planned |

---

## 15. Global Error & Exception Handling
File Script: [error-format.e2e-spec.ts](file:///d:/Perkuliahan/Work%20Order/workorder-portal/test/error-format.e2e-spec.ts) & [repro-issue.e2e-spec.ts](file:///d:/Perkuliahan/Work%20Order/workorder-portal/test/repro-issue.e2e-spec.ts)

| No | ID Test | Endpoint | HTTP Method | Tipe Pengujian | Kondisi Uji | Input/Payload | Expected Output | Status |
|---|---|---|---|---|---|---|---|---|
| 1 | TC-ERR-01 | `/non-existent-route` | GET | Blackbox | Akses route yang tidak terdaftar | None | `404 Not Found` dengan code `HTTP_404` (format terstandardisasi) | Passed |
| 2 | TC-ERR-02 | `/memberships` | GET | Blackbox | Akses endpoint terproteksi tanpa token JWT | None | `401 Unauthorized` dengan code `HTTP_401` | Passed |
| 3 | TC-ERR-03 | `/forms/:id` | GET | Whitebox | Akses dengan format ObjectId tidak valid (23 karakter, bukan 24) | ID: `68fa31cdc122d79a11504fb` | `400 Bad Request` (bukan `500 Internal Server Error`) | Passed |

---

## Modul Belum Memiliki Script Pengujian E2E
Modul-modul berikut belum diimplementasikan ke dalam skrip pengujian E2E:
| Modul | Endpoint Utama | Keterangan |
|---|---|---|
| Service Request | `/service-requests` | Alur utama pengajuan dan persetujuan layanan |
| Work Order | `/workorders`, `/staff/work-orders` | Manajemen work order dan penugasan staf |
| Work Report | `/workreports` | Laporan pekerjaan staf |
| FAQ | `/faq` | Manajemen dokumen dan AI FAQ |
| Customer Pairing | `/customer-pairing` | Pencocokan customer dari sistem eksternal |

---

## Rekap Total Test Case

| Kategori | Jumlah |
|---|---|
| Test case sudah ada di script (`Passed`) | **96** |
| Test case yang perlu ditambahkan (`Planned`) | **43** |
| **Total keseluruhan** | **139** |
