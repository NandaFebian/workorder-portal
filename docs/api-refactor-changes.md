# API Changes Documentation — Service Refactor

> Dokumentasi ini mencakup seluruh perubahan schema, request body, dan response body hasil refactor pada modul **Service**, **ServiceRequest (CSR)**, **WorkOrder**, dan **WorkReport**.

---

## Daftar Isi

- [Service](#1-service)
- [Service Request (CSR)](#2-service-request-csr)
- [Work Order](#3-work-order)
- [Work Report](#4-work-report)

---

## 1. Service

### Perubahan Schema

| Lama | Baru |
|---|---|
| `workOrderForms[]` (array form) | Dihapus |
| `reportForms[]` (array form) | Dihapus |
| `clientIntakeForms[]` (array form) | Dihapus |
| `requiredStaffs[]` (array posisi) | Dihapus |
| — | `serviceRequestConfig` (sub-dokumen) |
| — | `workOrdersConfig[]` (array sub-dokumen) |

### POST `/internal/services` — Create Service

**Request Body:**
```json
{
  "title": "Pemeliharaan AC",
  "description": "Layanan pemeliharaan dan servis AC berkala",
  "accessType": "member_only",
  "isActive": true,
  "serviceRequestConfig": {
    "intakeFormId": "64f1a2b3c4d5e6f7a8b9c0d1",
    "reviewFormId": "64f1a2b3c4d5e6f7a8b9c0d2",
    "serviceRequestApprovalAccessType": "manager",
    "reviewNeed": true
  },
  "workOrdersConfig": [
    {
      "positionId": "64f1a2b3c4d5e6f7a8b9c0d3",
      "workOrderFormId": "64f1a2b3c4d5e6f7a8b9c0d4",
      "workReportFormId": "64f1a2b3c4d5e6f7a8b9c0d5",
      "workOrderApprovalAccessType": "staff_pic",
      "workReportApprovalAccessType": "manager",
      "minStaff": 1,
      "maxStaff": 3
    }
  ]
}
```

**Response Body:**
```json
{
  "_id": "64f1a2b3c4d5e6f7a8b9c001",
  "serviceKey": "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
  "companyId": "64f1a2b3c4d5e6f7a8b9c010",
  "title": "Pemeliharaan AC",
  "description": "Layanan pemeliharaan dan servis AC berkala",
  "accessType": "member_only",
  "isActive": true,
  "serviceRequestConfig": {
    "intakeForm": {
      "_id": "64f1a2b3c4d5e6f7a8b9c0d1",
      "title": "Form Permintaan Servis",
      "description": "Formulir pengajuan permintaan layanan AC",
      "formType": "intake",
      "fields": [
        {
          "_id": "64f1a2b3c4d5e6f7a8b9c0f1",
          "order": 1,
          "label": "Deskripsi Keluhan",
          "type": "textarea",
          "required": true,
          "placeholder": "Deskripsikan keluhan Anda secara detail"
        },
        {
          "_id": "64f1a2b3c4d5e6f7a8b9c0f2",
          "order": 2,
          "label": "Lokasi Unit AC",
          "type": "text",
          "required": true,
          "placeholder": "Contoh: Ruang tamu lantai 1"
        },
        {
          "_id": "64f1a2b3c4d5e6f7a8b9c0f3",
          "order": 3,
          "label": "Merek AC",
          "type": "single_select",
          "required": true,
          "placeholder": null,
          "options": [
            { "key": "daikin", "value": "Daikin" },
            { "key": "panasonic", "value": "Panasonic" },
            { "key": "sharp", "value": "Sharp" },
            { "key": "lg", "value": "LG" }
          ]
        },
        {
          "_id": "64f1a2b3c4d5e6f7a8b9c0f4",
          "order": 4,
          "label": "Kapasitas AC (PK)",
          "type": "number",
          "required": false,
          "placeholder": "Contoh: 1",
          "min": 0.5,
          "max": 5
        }
      ]
    },
    "reviewForm": {
      "_id": "64f1a2b3c4d5e6f7a8b9c0d2",
      "title": "Form Review Permintaan",
      "description": "Formulir review dan verifikasi permintaan",
      "formType": "intake",
      "fields": [
        {
          "_id": "64f1a2b3c4d5e6f7a8b9c0f5",
          "order": 1,
          "label": "Catatan Review",
          "type": "textarea",
          "required": true,
          "placeholder": "Tulis catatan hasil review"
        },
        {
          "_id": "64f1a2b3c4d5e6f7a8b9c0f6",
          "order": 2,
          "label": "Prioritas",
          "type": "single_select",
          "required": true,
          "placeholder": null,
          "options": [
            { "key": "low", "value": "Rendah" },
            { "key": "medium", "value": "Sedang" },
            { "key": "high", "value": "Tinggi" }
          ]
        }
      ]
    },
    "serviceRequestApprovalAccessType": "manager",
    "reviewNeed": true
  },
  "workOrdersConfig": [
    {
      "workOrderForm": {
        "_id": "64f1a2b3c4d5e6f7a8b9c0d4",
        "title": "Form Work Order Teknisi",
        "description": "Formulir pelaksanaan pekerjaan teknisi",
        "formType": "work_order",
        "fields": [
          {
            "_id": "64f1a2b3c4d5e6f7a8b9c0f7",
            "order": 1,
            "label": "Tindakan yang Dilakukan",
            "type": "textarea",
            "required": true,
            "placeholder": "Deskripsikan tindakan perbaikan yang dilakukan"
          },
          {
            "_id": "64f1a2b3c4d5e6f7a8b9c0f8",
            "order": 2,
            "label": "Jenis Layanan",
            "type": "multi_select",
            "required": true,
            "placeholder": null,
            "options": [
              { "key": "cleaning", "value": "Cuci AC" },
              { "key": "freon", "value": "Isi Freon" },
              { "key": "repair", "value": "Perbaikan" },
              { "key": "installation", "value": "Pemasangan" }
            ]
          },
          {
            "_id": "64f1a2b3c4d5e6f7a8b9c0f9",
            "order": 3,
            "label": "Estimasi Durasi (jam)",
            "type": "number",
            "required": false,
            "placeholder": "Contoh: 2",
            "min": 0,
            "max": 24
          },
          {
            "_id": "64f1a2b3c4d5e6f7a8b9c0fa",
            "order": 4,
            "label": "Kondisi Unit Sebelum Servis",
            "type": "single_select",
            "required": true,
            "placeholder": null,
            "options": [
              { "key": "good", "value": "Baik" },
              { "key": "moderate", "value": "Cukup Baik" },
              { "key": "poor", "value": "Buruk" }
            ]
          }
        ]
      },
      "workReportForm": {
        "_id": "64f1a2b3c4d5e6f7a8b9c0d5",
        "title": "Form Laporan Pekerjaan",
        "description": "Formulir laporan hasil pekerjaan",
        "formType": "report",
        "fields": [
          {
            "_id": "64f1a2b3c4d5e6f7a8b9c0fb",
            "order": 1,
            "label": "Hasil Pekerjaan",
            "type": "textarea",
            "required": true,
            "placeholder": "Deskripsikan hasil pekerjaan secara lengkap"
          },
          {
            "_id": "64f1a2b3c4d5e6f7a8b9c0fc",
            "order": 2,
            "label": "Kondisi Unit Sesudah Servis",
            "type": "single_select",
            "required": true,
            "placeholder": null,
            "options": [
              { "key": "good", "value": "Baik" },
              { "key": "moderate", "value": "Cukup Baik" },
              { "key": "poor", "value": "Perlu Tindak Lanjut" }
            ]
          },
          {
            "_id": "64f1a2b3c4d5e6f7a8b9c0fd",
            "order": 3,
            "label": "Rekomendasi Lanjutan",
            "type": "textarea",
            "required": false,
            "placeholder": "Tulis rekomendasi jika ada"
          }
        ]
      },
      "positionsOnDuty": {
        "_id": "64f1a2b3c4d5e6f7a8b9c0d3",
        "name": "Teknisi AC",
        "description": "Posisi teknisi untuk servis AC",
        "companyId": "64f1a2b3c4d5e6f7a8b9c010"
      },
      "workOrderApprovalAccessType": "staff_pic",
      "workReportApprovalAccessType": "manager",
      "minStaff": 1,
      "maxStaff": 3
    }
  ]
}
```

### PATCH `/internal/services/:id` — Update Service

**Request Body** (semua opsional):
```json
{
  "title": "Pemeliharaan AC Premium",
  "serviceRequestConfig": {
    "serviceRequestApprovalAccessType": "auto",
    "reviewNeed": false
  },
  "workOrdersConfig": [
    {
      "positionId": "64f1a2b3c4d5e6f7a8b9c0d3",
      "workOrderFormId": "64f1a2b3c4d5e6f7a8b9c0d4",
      "workReportFormId": "64f1a2b3c4d5e6f7a8b9c0d5",
      "workOrderApprovalAccessType": "auto",
      "workReportApprovalAccessType": "auto",
      "minStaff": 2,
      "maxStaff": 5
    }
  ]
}
```

---

## 2. Service Request (CSR)

### Perubahan Schema

| Lama | Baru |
|---|---|
| `clientId` | `requestedBy` |
| `status: 'received' \| 'approved' \| 'rejected'` | `serviceRequestStatus: 'received' \| 'cancelled' \| 'rejected' \| 'approved' \| 'workOrderCreated' \| 'completed' \| 'closed'` |
| Tidak ada `approvedBy` | `approvedBy: ObjectId` (ref User) |
| Tidak ada date tracking | `receivedAt`, `approvedAt`, `rejectedAt`, `cancelledAt`, `workOrderCreatedAt`, `completedAt`, `closedAt` |
| Tidak ada snapshot form | `intakeFormId`, `reviewFormId` (snapshot saat dibuat) |

### GET `/service-requests/:id` — Detail Service Request

**Response Body:**
```json
{
  "_id": "64f1a2b3c4d5e6f7a8b9c002",
  "serviceRequestStatus": "workOrderCreated",
  "service": {
    "_id": "64f1a2b3c4d5e6f7a8b9c001",
    "companyId": "64f1a2b3c4d5e6f7a8b9c010",
    "title": "Pemeliharaan AC",
    "description": "Layanan pemeliharaan dan servis AC berkala",
    "accessType": "member_only",
    "isActive": true
  },
  "requestedBy": {
    "_id": "64f1a2b3c4d5e6f7a8b9c020",
    "name": "Budi Santoso",
    "email": "budi@client.com",
    "role": "client"
  },
  "approvedBy": {
    "_id": "64f1a2b3c4d5e6f7a8b9c021",
    "name": "Sari Manager",
    "email": "sari@company.com",
    "role": "company_manager"
  },
  "intakeForm": {
    "_id": "64f1a2b3c4d5e6f7a8b9c0d1",
    "title": "Form Permintaan Servis",
    "description": "Formulir pengajuan permintaan layanan AC",
    "formType": "intake",
    "fields": [
      {
        "_id": "64f1a2b3c4d5e6f7a8b9c0f1",
        "order": 1,
        "label": "Deskripsi Keluhan",
        "type": "textarea",
        "required": true,
        "placeholder": "Deskripsikan keluhan Anda secara detail"
      },
      {
        "_id": "64f1a2b3c4d5e6f7a8b9c0f3",
        "order": 2,
        "label": "Merek AC",
        "type": "single_select",
        "required": true,
        "placeholder": null,
        "options": [
          { "key": "daikin", "value": "Daikin" },
          { "key": "panasonic", "value": "Panasonic" },
          { "key": "sharp", "value": "Sharp" }
        ]
      }
    ]
  },
  "reviewForm": {
    "_id": "64f1a2b3c4d5e6f7a8b9c0d2",
    "title": "Form Review Permintaan",
    "description": "Formulir review dan verifikasi permintaan",
    "formType": "intake",
    "fields": [
      {
        "_id": "64f1a2b3c4d5e6f7a8b9c0f5",
        "order": 1,
        "label": "Catatan Review",
        "type": "textarea",
        "required": true,
        "placeholder": "Tulis catatan hasil review"
      },
      {
        "_id": "64f1a2b3c4d5e6f7a8b9c0f6",
        "order": 2,
        "label": "Prioritas",
        "type": "single_select",
        "required": true,
        "placeholder": null,
        "options": [
          { "key": "low", "value": "Rendah" },
          { "key": "medium", "value": "Sedang" },
          { "key": "high", "value": "Tinggi" }
        ]
      }
    ]
  },
  "intakeSubmission": {
    "_id": "64f1a2b3c4d5e6f7a8b9c030",
    "formId": "64f1a2b3c4d5e6f7a8b9c0d1",
    "fieldsData": [
      { "order": 1, "value": "AC ruang tamu tidak dingin" }
    ],
    "submittedAt": "2026-03-21T10:00:00.000Z"
  },
  "reviewSubmission": null,
  "receivedAt": "2026-03-21T10:00:00.000Z",
  "approvedAt": "2026-03-21T11:00:00.000Z",
  "rejectedAt": null,
  "cancelledAt": null,
  "workOrderCreatedAt": "2026-03-21T11:00:05.000Z",
  "completedAt": null,
  "closedAt": null,
  "createdAt": "2026-03-21T10:00:00.000Z",
  "updatedAt": "2026-03-21T11:00:05.000Z"
}
```

### POST `/internal/service-requests/:id/status` — Update Status

**Request Body:**
```json
{
  "status": "approved"
}
```

**Nilai status yang valid:** `approved` | `rejected` | `cancelled` | `completed` | `closed`

**Response Body (saat `approved`):**
> Otomatis membuat WorkOrder dan mengubah status menjadi `workOrderCreated`. Response yang dikembalikan adalah **WorkOrder** yang baru dibuat.

```json
{
  "_id": "64f1a2b3c4d5e6f7a8b9c003",
  "serviceRequestId": "64f1a2b3c4d5e6f7a8b9c002",
  "status": "drafted",
  "service": { ... },
  "createdBy": { ... },
  "workOrderForm": { ... },
  "submissions": []
}
```

---

## 3. Work Order

### Perubahan Schema

| Lama | Baru |
|---|---|
| `workOrderForms[]` (array form) | `workOrderFormKey` (string, satu form key) |
| `assignedStaffs[]` | `assignedStaff[]` (tanpa "s") |
| Tidak ada `approvedBy` | `approvedBy: ObjectId` (ref User, nullable) |
| Tidak ada `staffPIC` | `staffPIC: ObjectId` (ref User, nullable) |
| `status: 'drafted' \| 'in_progress' \| ...` | `status: 'drafted' \| 'ready' \| 'inProgress' \| 'completed' \| 'cancelled'` |
| Tidak ada date tracking per status | `readyAt`, `startedAt`, `completedAt`, `cancelledAt` |

### GET `/workorders/:id` — Detail Work Order

**Response Body:**
```json
{
  "_id": "64f1a2b3c4d5e6f7a8b9c003",
  "clientServiceRequestId": "64f1a2b3c4d5e6f7a8b9c002",
  "companyId": "64f1a2b3c4d5e6f7a8b9c010",
  "service": {
    "_id": "64f1a2b3c4d5e6f7a8b9c001",
    "title": "Pemeliharaan AC",
    "description": "Layanan pemeliharaan dan servis AC berkala",
    "accessType": "member_only",
    "isActive": true
  },
  "createdBy": {
    "_id": "64f1a2b3c4d5e6f7a8b9c021",
    "name": "Sari Manager",
    "email": "sari@company.com",
    "role": "company_manager"
  },
  "approvedBy": null,
  "assignedStaff": [
    {
      "_id": "64f1a2b3c4d5e6f7a8b9c022",
      "name": "Joko Teknisi",
      "email": "joko@company.com",
      "role": "company_staff"
    }
  ],
  "staffPIC": {
    "_id": "64f1a2b3c4d5e6f7a8b9c022",
    "name": "Joko Teknisi",
    "email": "joko@company.com",
    "role": "company_staff"
  },
  "status": "inProgress",
  "workOrderForm": {
    "_id": "64f1a2b3c4d5e6f7a8b9c0d4",
    "title": "Form Work Order Teknisi",
    "description": "Formulir pelaksanaan pekerjaan teknisi",
    "formType": "work_order",
    "fields": [
      {
        "_id": "64f1a2b3c4d5e6f7a8b9c0f7",
        "order": 1,
        "label": "Tindakan yang Dilakukan",
        "type": "textarea",
        "required": true,
        "placeholder": "Deskripsikan tindakan perbaikan yang dilakukan"
      },
      {
        "_id": "64f1a2b3c4d5e6f7a8b9c0f8",
        "order": 2,
        "label": "Jenis Layanan",
        "type": "multi_select",
        "required": true,
        "placeholder": null,
        "options": [
          { "key": "cleaning", "value": "Cuci AC" },
          { "key": "freon", "value": "Isi Freon" },
          { "key": "repair", "value": "Perbaikan" }
        ]
      },
      {
        "_id": "64f1a2b3c4d5e6f7a8b9c0f9",
        "order": 3,
        "label": "Estimasi Durasi (jam)",
        "type": "number",
        "required": false,
        "placeholder": "Contoh: 2",
        "min": 0,
        "max": 24
      }
    ]
  },
  "submissions": [
    {
      "_id": "64f1a2b3c4d5e6f7a8b9c040",
      "formId": "64f1a2b3c4d5e6f7a8b9c0d4",
      "submittedAt": "2026-03-21T13:00:00.000Z",
      "fieldsData": [
        { "order": 1, "value": "Freon sudah diisi ulang" }
      ]
    }
  ],
  "readyAt": "2026-03-21T12:00:00.000Z",
  "startedAt": "2026-03-21T12:30:00.000Z",
  "completedAt": null,
  "cancelledAt": null,
  "createdAt": "2026-03-21T11:00:05.000Z",
  "updatedAt": "2026-03-21T12:30:00.000Z"
}
```

### PUT `/workorders/:id/assign-staffs` — Assign Staff

**Request Body:**
```json
{
  "staffEmail": ["joko@company.com", "budi@company.com"]
}
```

### PATCH `/workorders/:id/status` — Update Status

**Request Body:**
```json
{
  "status": "inProgress"
}
```

**Nilai status:** `ready` | `inProgress` | `completed` | `cancelled`

> Timestamp (`readyAt`, `startedAt`, dll.) akan otomatis diset saat status berubah.

---

## 4. Work Report

### Perubahan Schema

| Lama | Baru |
|---|---|
| `reportForms[]` (array form) | `reportFormKey` (string, satu form key) |
| Tidak ada `approvedBy` | `approvedBy: ObjectId` (ref User, nullable) |

### GET `/workorders/:id/report` — Detail Report

**Response Body:**
```json
{
  "_id": "64f1a2b3c4d5e6f7a8b9c004",
  "workOrderId": "64f1a2b3c4d5e6f7a8b9c003",
  "companyId": "64f1a2b3c4d5e6f7a8b9c010",
  "approvedBy": null,
  "status": "in_progress",
  "reportForm": {
    "_id": "64f1a2b3c4d5e6f7a8b9c0d5",
    "title": "Form Laporan Pekerjaan",
    "description": "Formulir laporan hasil pekerjaan",
    "formType": "report",
    "fields": [
      {
        "_id": "64f1a2b3c4d5e6f7a8b9c0fb",
        "order": 1,
        "label": "Hasil Pekerjaan",
        "type": "textarea",
        "required": true,
        "placeholder": "Deskripsikan hasil pekerjaan secara lengkap"
      },
      {
        "_id": "64f1a2b3c4d5e6f7a8b9c0fc",
        "order": 2,
        "label": "Kondisi Unit Sesudah Servis",
        "type": "single_select",
        "required": true,
        "placeholder": null,
        "options": [
          { "key": "good", "value": "Baik" },
          { "key": "moderate", "value": "Cukup Baik" },
          { "key": "poor", "value": "Perlu Tindak Lanjut" }
        ]
      },
      {
        "_id": "64f1a2b3c4d5e6f7a8b9c0fd",
        "order": 3,
        "label": "Rekomendasi Lanjutan",
        "type": "textarea",
        "required": false,
        "placeholder": "Tulis rekomendasi jika ada"
      }
    ]
  },
  "submissions": [
    {
      "_id": "64f1a2b3c4d5e6f7a8b9c050",
      "formId": "64f1a2b3c4d5e6f7a8b9c0d5",
      "submittedAt": "2026-03-21T15:00:00.000Z",
      "fieldsData": [
        { "order": 1, "value": "Pekerjaan selesai. AC berfungsi normal." }
      ]
    }
  ],
  "startedAt": "2026-03-21T12:30:00.000Z",
  "completedAt": null,
  "createdAt": "2026-03-21T11:00:05.000Z",
  "updatedAt": "2026-03-21T15:00:00.000Z"
}
```

### PUT `/workorders/:id/report` — Submit Report Form

**Request Body:**
```json
{
  "submissions": [
    {
      "formId": "64f1a2b3c4d5e6f7a8b9c0d5",
      "fieldsData": [
        { "order": 1, "value": "Pekerjaan selesai. AC berfungsi normal." },
        { "order": 2, "value": "Tidak ada kerusakan tambahan." }
      ]
    }
  ]
}
```

---

## 5. Membership

### Perubahan Schema

| Lama | Baru |
|---|---|
| Random string dengan `Math.random` | Menggunakan `crypto.randomBytes(4).toString('hex')` untuk mencegah tabrakan kode antar company |
| Tidak ada `companyId` | `companyId: ObjectId` (ref Company, required) |

### GET `/memberships` — List Codes (Company Scoped)

> Dulu mengembalikan **semua** kode dari semua company. Sekarang difilter **hanya kode milik company user yang me-request**.

**Response Body:**
```json
{
  "message": "Membership codes loaded successfully",
  "data": [
    {
      "_id": "64f1a2b3c4d5e6f7a8b9c0c1",
      "code": "MEM-A1B2C3D4",
      "isClaimed": true,
      "claimedBy": {
        "_id": "64f1a2b3c4d5e6f7a8b9c0u1",
        "name": "Budi Klien",
        "email": "budi@client.com",
        "role": "client"
      },
      "companyId": "64f1a2b3c4d5e6f7a8b9c010",
      "claimedAt": "2026-03-21T10:00:00.000Z",
      "createdAt": "2026-03-21T09:00:00.000Z"
    }
  ]
}
```

### POST `/memberships/generate`

> Otomatis memasukkan `companyId` milik admin/manager yang men-generate kode. Format `PREFIX-8HEXCHARS` yang benar-benar unik.

**Request Body:**
```json
{
  "amount": 5,
  "prefix": "VIP"
}
```

### GET `/memberships/clients` — List Subscribed Clients [NEW]

> Menampilkan data semua **klien** yang telah berlangganan (meng-claim kode) ke perusahaan Anda.

**Response Body:**
```json
{
  "message": "Subscribed clients loaded successfully",
  "data": [
    {
      "membershipCode": "VIP-9F8E7D6C",
      "claimedAt": "2026-03-21T11:00:00.000Z",
      "client": {
        "_id": "64f1a2b3c4d5e6f7a8b9c0u2",
        "name": "Andi Pelanggan",
        "email": "andi@client.com",
        "role": "client"
      }
    }
  ]
}
```

---

## Alur Status Lengkap

### Service Request Status Flow
```
received → approved → workOrderCreated → completed → closed
         ↘ rejected
         ↘ cancelled
```

### Work Order Status Flow
```
drafted → ready → inProgress → completed
                ↘ cancelled
```

---

## Catatan Penting

> **Database Migration:** Refactor ini mengubah struktur schema secara fundamental. Data lama di MongoDB **tidak kompatibel** dengan schema baru. Untuk development, drop dan re-seed koleksi: `services`, `clientservicerequests`, `workorders`, `workreports`.

> **Form Storage:** DB hanya menyimpan `formKey` (string referensi ke FormTemplate). Response API akan selalu menampilkan form yang sudah di-*hydrate* (data lengkap form template).

> **Approval Flow:** Saat CSR di-approve, sistem otomatis membuat WorkOrder dan WorkReport (draft). Status CSR langsung berubah ke `workOrderCreated`.
