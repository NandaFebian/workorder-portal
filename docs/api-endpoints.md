# API Endpoints — WorkOrder-Service

Base URL dikonfigurasi melalui environment variable `VITE_API_URL`.

---

## Authentication

| Method | Endpoint | Deskripsi |
|--------|----------|-----------|
| POST | `/auth/login` | Login user, mengembalikan token dan profil |
| POST | `/auth/register` | Registrasi user baru (client/staff) |
| POST | `/auth/register-company` | Registrasi owner perusahaan |
| POST | `/auth/logout` | Logout, invalidate session |
| GET | `/auth/profile` | Ambil profil user yang terautentikasi |

---

## Dashboard

| Method | Endpoint | Deskripsi |
|--------|----------|-----------|
| GET | `/dashboard/service-request?period_type=` | Statistik service request berdasarkan periode |
| GET | `/dashboard/work-order?period_type=` | Statistik work order berdasarkan periode |
| GET | `/dashboard/company/` | Data dashboard untuk owner |

---

## Notifications

| Method | Endpoint | Deskripsi |
|--------|----------|-----------|
| POST | `/notifications/fcm-token` | Daftarkan FCM token untuk push notification |
| DELETE | `/notifications/fcm-token` | Hapus FCM token |
| GET | `/notifications` | Ambil daftar notifikasi |

---

## Service Requests

| Method | Endpoint | Deskripsi |
|--------|----------|-----------|
| GET | `/service-requests/sent` | Riwayat service request yang dikirim |
| GET | `/service-requests/inbox` | Inbox service request (owner/manager) |
| GET | `/service-requests/:id` | Detail service request |
| PATCH | `/service-requests/:id/reject` | Tolak service request |
| PATCH | `/service-requests/:id/approve` | Setujui service request |
| POST | `/service-requests/service/:id` | Submit intake form / buat service request |
| GET | `/service-requests/:id/report` | Laporan pekerjaan untuk service request |
| POST | `/service-requests/:id/review` | Kirim review untuk service request |

---

## Public Services (Client)

| Method | Endpoint | Deskripsi |
|--------|----------|-----------|
| GET | `/public/services/:id/intake-form` | Ambil intake form publik (tanpa auth) |
| GET | `/public/companies` | Daftar semua perusahaan (client-facing) |
| GET | `/public/companies/:companyId` | Detail perusahaan (client-facing) |
| GET | `/public/companies/:companyId/services` | Layanan perusahaan (client-facing) |

---

## Services (Owner CRUD)

| Method | Endpoint | Deskripsi |
|--------|----------|-----------|
| GET | `/services` | Semua layanan |
| GET | `/services/:id` | Detail layanan |
| POST | `/services` | Buat layanan baru |
| PUT | `/services/:id` | Update layanan |
| PATCH | `/services/:id/toggle-active` | Aktif/nonaktifkan layanan |
| DELETE | `/services/:id` | Hapus layanan |
| POST | `/services/:id/create-work-order` | Buat work order dari layanan |
| GET | `/services/:id/intake-form` | Intake form untuk layanan (staff) |

---

## Work Orders

| Method | Endpoint | Deskripsi |
|--------|----------|-----------|
| GET | `/workorders` | Semua work order |
| GET | `/workorders/:id` | Detail work order |
| POST | `/workorders/:id/recreate` | Recreate work order yang ditolak |
| PUT | `/workorders/:id/submissions` | Submit data form work order |
| PUT | `/workorders/:id/assign-staffs` | Assign staff ke work order |
| PATCH | `/workorders/:id/sent` | Tandai konfigurasi WO selesai |
| PATCH | `/workorders/:id/approve` | Setujui work order |
| PATCH | `/workorders/:id/reject` | Tolak work order |
| PATCH | `/workorders/:id/cancel` | Batalkan work order |
| PATCH | `/workorders/:id/complete` | Selesaikan work order |
| PATCH | `/workorders/:id/start` | Mulai work order (in progress) |
| PATCH | `/workorders/:id/fail` | Tandai work order gagal |
| GET | `/workorders/:id/report` | Laporan work order |

---

## Work Reports

| Method | Endpoint | Deskripsi |
|--------|----------|-----------|
| POST | `/workreports/:id/submit` | Simpan data work report |
| PATCH | `/workreports/:id/sent` | Kirim work report untuk review |
| PATCH | `/workreports/:id/approve` | Setujui work report |
| PATCH | `/workreports/:id/reject` | Tolak work report |

---

## Company Profile & Employees

| Method | Endpoint | Deskripsi |
|--------|----------|-----------|
| GET | `/company` | Profil perusahaan |
| GET | `/company/:id` | Detail perusahaan by ID |
| PUT | `/company` | Update profil perusahaan |
| GET | `/company/employees` | Semua karyawan perusahaan |
| GET | `/company/employees/:id` | Detail karyawan |
| DELETE | `/company/employees` | Keluarkan karyawan |
| POST | `/company/invite` | Undang karyawan baru |
| GET | `/company/invitations/history` | Riwayat undangan |
| GET | `/company/integration-config` | Konfigurasi integrasi perusahaan |
| PUT | `/company/integration-config` | Update konfigurasi integrasi |

---

## Invitations

| Method | Endpoint | Deskripsi |
|--------|----------|-----------|
| GET | `/invitations/pending` | Undangan pending untuk staff |
| PUT | `/invitations/:id/accept` | Terima undangan |
| PUT | `/invitations/:id/reject` | Tolak undangan |
| DELETE | `/invitations/:id` | Hapus/batalkan undangan (owner) |

---

## Positions

| Method | Endpoint | Deskripsi |
|--------|----------|-----------|
| GET | `/positions` | Semua posisi |
| POST | `/positions` | Buat posisi baru |
| GET | `/positions/:id` | Detail posisi |
| PUT | `/positions/:id` | Update posisi |
| DELETE | `/positions/:id` | Hapus posisi |

---

## Forms

| Method | Endpoint | Deskripsi |
|--------|----------|-----------|
| GET | `/forms` | Semua form |
| POST | `/forms` | Buat form baru |
| GET | `/forms/:id` | Detail form |
| PUT | `/forms/:id` | Update form |
| DELETE | `/forms/:id` | Hapus form |

---

## FAQs

| Method | Endpoint | Deskripsi |
|--------|----------|-----------|
| PUT | `/faq/toggle-active` | Aktif/nonaktifkan FAQ perusahaan |
| GET | `/faq/docs` | Semua dokumen FAQ |
| POST | `/faq/text-docs` | Upload FAQ sebagai teks |
| POST | `/faq/pdf-docs` | Upload FAQ sebagai PDF (multipart) |
| DELETE | `/faq/docs/:id` | Hapus dokumen FAQ |
| POST | `/faq/ask` | Tanya AI chatbot |

---

## Templates

| Method | Endpoint | Deskripsi |
|--------|----------|-----------|
| GET | `/template/company-type` | Semua tipe perusahaan untuk template |
| GET | `/template/company-type/:id/services` | Layanan berdasarkan tipe perusahaan |
| GET | `/template/services/:id` | Preview template layanan |
| POST | `/template/services/generate` | Generate layanan dari template |

---

## Memberships & Codes

| Method | Endpoint | Deskripsi |
|--------|----------|-----------|
| GET | `/memberships/codes` | Semua kode membership |
| POST | `/memberships/codes` | Upload kode membership (multipart) |
| DELETE | `/memberships/codes/:id` | Hapus kode membership |
| POST | `/memberships/codes/claim` | Klaim kode membership (client) |
| GET | `/memberships` | Semua membership |

---

## Customer Pairing

| Method | Endpoint | Deskripsi |
|--------|----------|-----------|
| POST | `/customer-pairing/start` | Mulai proses OAuth pairing |
| POST | `/customer-pairing/complete` | Selesaikan OAuth pairing |
| GET | `/customer-pairing` | Semua akun ter-pair (client) |
| GET | `/customer-pairing/company/:id` | Akun ter-pair di perusahaan tertentu |
| DELETE | `/customer-pairing/:id` | Lepas akun ter-pair |

---

## Service Pricing

| Method | Endpoint | Deskripsi |
|--------|----------|-----------|
| GET | `/service-price` | Semua data pricing layanan |
| POST | `/service-price` | Buat pricing baru |
| PUT | `/service-price/:id` | Update pricing |
| DELETE | `/service-price/:id` | Hapus pricing |

---

## File Upload

| Method | Endpoint | Deskripsi |
|--------|----------|-----------|
| POST | `/files` | Upload file (multipart/form-data) |

---

## Ringkasan

| Metode | Jumlah |
|--------|--------|
| GET | 38 |
| POST | 27 |
| PUT | 16 |
| PATCH | 16 |
| DELETE | 11 |
| **Total** | **~103 endpoint unik** |
