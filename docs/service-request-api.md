# Service Request — API Usage Documentation

> **Base URL**: `http://localhost:3000`  
> **Auth**: Semua endpoint membutuhkan Bearer Token di header `Authorization`, kecuali disebutkan sebaliknya.

---

## Table of Contents

1. [Get Intake Form (Public / Member Only)](#1-get-intake-form-public--member-only)
2. [Get Intake Form (Internal Only)](#2-get-intake-form-internal-only)
3. [Submit Intake — Create SR](#3-submit-intake--create-sr)
4. [Get All SR Sent (Requester)](#4-get-all-sr-sent-requester)
5. [Get SR Detail](#5-get-sr-detail)
6. [Submit Review](#6-submit-review)
7. [Cancel SR](#7-cancel-sr)
8. [Get All SR Inbox (Provider)](#8-get-all-sr-inbox-provider)
9. [Approve SR](#9-approve-sr)
10. [Reject SR](#10-reject-sr)

---

## 1. Get Intake Form (Public / Member Only)

Ambil form intake sebelum membuat Service Request untuk service yang bersifat public atau member_only.

**Endpoint**
```
GET /public/services/:serviceId/intake-form
```

**Auth**: Optional (wajib untuk `member_only`)

**Access Rules**
- `public` → siapapun (termasuk tanpa login)
- `member_only` → harus login + terdaftar sebagai member perusahaan tersebut
- `internal` → **403 Access Denied**

**Request Body**: Tidak ada

**Response (200)**
```json
{
  "message": "Load data success",
  "data": {
    "form": {
      "_id": "ObjectID",
      "formKey": "uuid-string",
      "title": "Form Intake Servis AC",
      "description": "Formulir pengajuan servis AC",
      "formType": "intake",
      "fields": [
        {
          "order": 1,
          "label": "Kondisi AC",
          "type": "single_select",
          "required": true,
          "options": [
            { "key": "1775489449100", "value": "Rusak Ringan" },
            { "key": "1775489459633", "value": "Rusak Berat" }
          ]
        },
        {
          "order": 2,
          "label": "Catatan tambahan",
          "type": "textarea",
          "required": false,
          "placeholder": "Tulis catatan jika ada..."
        }
      ]
    }
  }
}
```

---

## 2. Get Intake Form (Internal Only)

Ambil form intake untuk service yang bersifat internal (hanya untuk staf perusahaan provider).

**Endpoint**
```
GET /services/:serviceId/intake-form
```

**Auth**: Wajib — Role: `CompanyOwner`, `CompanyManager`, `CompanyStaff`

**Access Rules**
- Hanya staf perusahaan yang memiliki service tersebut yang bisa mengakses.
- Aktor lain → **403 Forbidden**

**Request Body**: Tidak ada

**Response (200)**
```json
{
  "message": "Load intake form success",
  "data": {
    "form": {
      "_id": "ObjectID",
      "title": "Form Intake Internal",
      "formType": "intake",
      "fields": [ ... ]
    }
  }
}
```

---

## 3. Submit Intake — Create SR

Membuat Service Request baru dengan mengisi form intake.

**Endpoint**
```
POST /service-request/service/:serviceId
```

**Auth**: Wajib

**Access Rules**
| Service Access Type | Siapa yang bisa submit |
|---|---|
| `public` | Semua user yang login |
| `member_only` | User yang sudah claim membership perusahaan tersebut |
| `internal` | Staf internal dari perusahaan provider tersebut saja |

**Request Body**

Jika service **tidak memiliki intake form**, kirimkan body kosong `{}`.

Jika service **memiliki intake form**:
```json
{
  "submission": {
    "formId": "ID_FORM_INTAKE",
    "fieldsData": [
      {
        "order": 1,
        "value": "KEY_OPTION"
      },
      {
        "order": 2,
        "value": "Teks bebas untuk textarea"
      }
    ]
  }
}
```

> **Catatan penting:**
> - `formId` harus **persis sama** dengan `intakeFormId` yang dikonfigurasi pada service tersebut.
> - `order` mengacu pada nomor urut field di template form.
> - Untuk field `single_select`: `value` berisi **key** dari opsi (bukan label/value text).
> - Untuk field `multi_select`: `value` berisi **array of keys** → `["key1", "key2"]`.
> - Field dengan `required: true` **wajib disertakan**, jika tidak → **422 Unprocessable Entity**.

**Response (201)** — SR Requester Side
```json
{
  "success": true,
  "message": "Submit intake success",
  "data": {
    "_id": "ObjectID",
    "serviceRequestStatus": "received",
    "company": { "_id": "...", "name": "...", "address": "...", "isActive": true },
    "service": { "_id": "...", "title": "...", "accessType": "public", "isActive": true },
    "requestedBy": { "_id": "...", "name": "...", "email": "...", "role": "client" },
    "approvedBy": null,
    "intakeForm": { "_id": "...", "title": "...", "fields": [ ... ] },
    "reviewForm": null,
    "intakeSubmission": {
      "_id": "...",
      "formId": "...",
      "fieldsData": [ { "order": 1, "value": "KEY_OPTION" } ],
      "status": "submitted",
      "submittedAt": "2026-04-07T..."
    },
    "reviewSubmission": null,
    "receivedAt": "2026-04-07T...",
    "approvedAt": null,
    "rejectedAt": null,
    "cancelledAt": null,
    "workOrderCreatedAt": null,
    "completedAt": null,
    "closedAt": null
  }
}
```

---

## 4. Get All SR Sent (Requester)

Mengambil seluruh Service Request yang pernah dibuat oleh user yang sedang login.

**Endpoint**
```
GET /service-requests/sent
```

**Auth**: Wajib

**Request Body**: Tidak ada

**Response (200)** — Array of SR Requester Side
```json
{
  "success": true,
  "message": "Load sent service requests success",
  "data": [ ... ]
}
```

---

## 5. Get SR Detail

Mengambil detail satu Service Request berdasarkan ID-nya.

**Endpoint**
```
GET /service-requests/:id
```

**Auth**: Wajib

**Access Rules**
- User adalah **requester** SR → mendapat *Requester Side Response*
- User adalah **staf provider** (companyId cocok) → mendapat *Provider Side Response*
- User lain → **403 Forbidden**

**Request Body**: Tidak ada

**Response (200)** — SR Requester atau Provider Side (tergantung siapa yang request)

---

## 6. Submit Review

Mengirimkan review setelah Service Request berstatus `completed`.

**Endpoint**
```
POST /service-request/:srId/review
```

**Auth**: Wajib — Hanya requester yang membuat SR tersebut

**Access Rules**
- Status SR **harus** `completed` sebelum review bisa disubmit.
- Hanya requester yang membuat SR ini yang bisa submit.
- Setelah submit, jika `reviewNeed: true` maka status SR berubah menjadi `closed`.

**Request Body**
```json
{
  "submission": {
    "formId": "ID_FORM_REVIEW",
    "fieldsData": [
      {
        "order": 1,
        "value": "KEY_OPTION"
      },
      {
        "order": 2,
        "value": "Pelayanan sangat memuaskan!"
      }
    ]
  }
}
```

> **Catatan:** `formId` harus cocok dengan `reviewFormId` yang terdaftar di SR. Validasi field sama dengan submit intake.

**Response (201)** — SR Requester Side (dengan `reviewSubmission` terisi)

---

## 7. Cancel SR

Membatalkan Service Request.

**Endpoint**
```
PATCH /service-requests/:id/cancel
```

**Auth**: Wajib — Hanya requester yang membuat SR tersebut

**Access Rules**
- SR hanya bisa dibatalkan ketika statusnya `received`.
- Status lain → **422 Unprocessable Entity**.

**Request Body**: Tidak ada

**Response (200)** — SR Requester Side dengan `serviceRequestStatus: "cancelled"`

---

## 8. Get All SR Inbox (Provider)

Mengambil seluruh Service Request yang masuk ke perusahaan provider.

**Endpoint**
```
GET /service-requests/inbox
```

**Auth**: Wajib — Role: `CompanyOwner`, `CompanyManager`, `CompanyStaff`

**Access Rules**
- Data difilter otomatis berdasarkan `companyId` dari token user yang login.

**Request Body**: Tidak ada

**Response (200)** — Array of SR Provider Side
```json
{
  "success": true,
  "message": "Load inbox success",
  "data": [
    {
      "_id": "ObjectID",
      "serviceRequestStatus": "received",
      "serviceRequestApprovalAccessType": "auto",
      "reviewNeed": true,
      "service": { ... },
      "requestedBy": { ... },
      "intakeForm": { ... },
      "intakeSubmission": { ... },
      ...
    }
  ]
}
```

---

## 9. Approve SR

Menyetujui Service Request dan memicu pembuatan Work Order secara otomatis.

**Endpoint**
```
PATCH /service-requests/:id/approve
```

**Auth**: Wajib — Role: `CompanyOwner`, `CompanyManager`

**Access Rules**
- Hanya provider (staf dari perusahaan yang menerima SR) yang bisa approve.
- SR hanya bisa di-approve ketika statusnya `received`.

**Request Body**: Tidak ada

**Response (200)** — Work Order yang baru dibuat (bukan SR response)

> **Efek samping**: Setelah approve, status SR berubah dari `approved` menjadi `workOrderCreated` secara otomatis, dan Work Order baru dibuat.

---

## 10. Reject SR

Menolak Service Request.

**Endpoint**
```
PATCH /service-requests/:id/reject
```

**Auth**: Wajib — Role: `CompanyOwner`, `CompanyManager`

**Access Rules**
- Hanya provider yang bisa reject.
- SR hanya bisa di-reject ketika statusnya `received`.

**Request Body**: Tidak ada

**Response (200)** — SR Provider Side dengan `serviceRequestStatus: "rejected"`

---

## Status Flow

```
received
  ├── → cancelled   (oleh Requester)
  ├── → rejected    (oleh Provider)
  └── → approved → workOrderCreated → completed → closed (jika reviewNeed: true)
                                                → [selesai] (jika reviewNeed: false)
```

---

## Error Responses Umum

| Status | Kondisi |
|---|---|
| `400 Bad Request` | FormId tidak cocok dengan intake form service |
| `403 Forbidden` | Tidak punya akses ke SR atau service |
| `404 Not Found` | SR / Service tidak ditemukan atau tidak aktif |
| `422 Unprocessable Entity` | Status tidak sesuai untuk aksi / field required tidak diisi |
