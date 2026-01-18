# Sample Request Bodies - Work Order Portal

Dokumentasi lengkap sample request body untuk setiap modul dalam aplikasi Work Order Portal. Semua sample disesuaikan dengan DTO dan validasi yang ada.

---

## 1. Auth Module

### 1.1 Login User
**Endpoint:** `POST /auth/login`

```json
{
  "email": "user@example.com",
  "password": "password123"
}
```

**Validasi:**
- `email`: Harus berupa email valid, tidak boleh kosong
- `password`: Minimal 6 karakter, tidak boleh kosong

---

### 1.2 Register User (Client/Unassigned Staff)
**Endpoint:** `POST /auth/register`

```json
{
  "name": "John Doe",
  "email": "john.doe@example.com",
  "password": "securePassword123",
  "role": "client"
}
```

**Role Options:**
- `client` - Untuk klien
- `staff_unassigned` - Untuk staff yang belum ditugaskan

**Validasi:**
- `name`: String, tidak boleh kosong
- `email`: Email valid, tidak boleh kosong
- `password`: Minimal 6 karakter, tidak boleh kosong
- `role`: Harus `client` atau `unassigned_staff`

---

### 1.3 Register Company (Owner)
**Endpoint:** `POST /auth/register-company`

```json
{
  "name": "Jane Smith",
  "email": "jane.smith@company.com",
  "password": "companyPassword123",
  "companyName": "PT Maju Jaya"
}
```

**Validasi:**
- `name`: String, tidak boleh kosong
- `email`: Email valid, tidak boleh kosong
- `password`: Minimal 6 karakter, tidak boleh kosong
- `companyName`: String, tidak boleh kosong

---

## 2. Company Module

### 2.1 Create Company
**Endpoint:** `POST /companies`

```json
{
  "name": "PT Teknologi Nusantara",
  "address": "Jl. Sudirman No. 123, Jakarta",
  "description": "Perusahaan teknologi yang bergerak di bidang software development",
  "isActive": true
}
```

**Validasi:**
- `name`: String, tidak boleh kosong (required)
- `address`: String, opsional
- `description`: String, opsional
- `isActive`: Boolean, opsional (default: true)

---

### 2.2 Update Company
**Endpoint:** `PATCH /companies/:id`

```json
{
  "name": "PT Teknologi Nusantara Updated",
  "address": "Jl. Gatot Subroto No. 456, Jakarta",
  "description": "Updated description",
  "isActive": false
}
```

**Note:** Semua field bersifat opsional (PartialType dari CreateCompanyDto)

---

### 2.3 Invite Employees
**Endpoint:** `POST /companies/:companyId/invite-employees`

```json
{
  "invites": [
    {
      "email": "manager@company.com",
      "role": "manager_company",
      "positionId": "507f1f77bcf86cd799439011"
    },
    {
      "email": "staff1@company.com",
      "role": "staff_company",
      "positionId": "507f1f77bcf86cd799439012"
    },
    {
      "email": "staff2@company.com",
      "role": "staff_company",
      "positionId": "507f1f77bcf86cd799439013"
    }
  ]
}
```

**Role Options:**
- `manager_company` - Manager perusahaan
- `staff_company` - Staff perusahaan

**Validasi:**
- `invites`: Array tidak boleh kosong
- Setiap invite harus memiliki:
  - `email`: Email valid, tidak boleh kosong
  - `role`: Harus `manager_company` atau `staff_company`
  - `positionId`: MongoDB ObjectId valid, tidak boleh kosong

---

## 3. Position Module

### 3.1 Create Position
**Endpoint:** `POST /positions`

```json
{
  "name": "Software Engineer",
  "description": "Bertanggung jawab untuk mengembangkan dan memelihara aplikasi",
  "isActive": true
}
```

**Validasi:**
- `name`: String, tidak boleh kosong (required)
- `description`: String, opsional
- `isActive`: Boolean, opsional (default: true)

---

### 3.2 Update Position
**Endpoint:** `PATCH /positions/:id`

```json
{
  "name": "Senior Software Engineer",
  "description": "Updated description for senior role",
  "isActive": true
}
```

**Note:** Semua field bersifat opsional (PartialType dari CreatePositionDto)

---

## 4. User Module

### 4.1 Create User
**Endpoint:** `POST /users`

```json
{
  "name": "Alice Johnson",
  "email": "alice.johnson@example.com",
  "password": "userPassword123",
  "role": "client"
}
```

**Note:** DTO ini tidak memiliki validasi decorator, namun field yang diperlukan:
- `name`: Nama user
- `email`: Email user
- `password`: Password user
- `role`: Role user

---

## 5. Service Module

### 5.1 Create Service
**Endpoint:** `POST /services`

```json
{
  "title": "Website Development Service",
  "description": "Layanan pembuatan website profesional untuk bisnis Anda",
  "requiredStaffs": [
    {
      "positionId": "507f1f77bcf86cd799439011",
      "minimumStaff": 1,
      "maximumStaff": 3
    },
    {
      "positionId": "507f1f77bcf86cd799439012",
      "minimumStaff": 0,
      "maximumStaff": 2
    }
  ],
  "workOrderForms": [
    {
      "order": 1,
      "formId": "507f1f77bcf86cd799439021",
      "fillableByRoles": ["manager_company", "staff_company"],
      "viewableByRoles": ["manager_company", "staff_company", "owner_company"],
      "fillableByPositionIds": ["507f1f77bcf86cd799439011"],
      "viewableByPositionIds": ["507f1f77bcf86cd799439011", "507f1f77bcf86cd799439012"]
    },
    {
      "order": 2,
      "formId": "507f1f77bcf86cd799439022",
      "fillableByRoles": ["staff_company"],
      "viewableByRoles": ["manager_company", "staff_company"]
    }
  ],
  "reportForms": [
    {
      "order": 1,
      "formId": "507f1f77bcf86cd799439031",
      "fillableByRoles": ["staff_company"],
      "viewableByRoles": ["manager_company", "staff_company", "owner_company"],
      "fillableByPositionIds": ["507f1f77bcf86cd799439011"]
    }
  ],
  "accessType": "public",
  "isActive": true,
  "clientIntakeForms": [
    {
      "order": 1,
      "formId": "507f1f77bcf86cd799439041"
    },
    {
      "order": 2,
      "formId": "507f1f77bcf86cd799439042"
    }
  ]
}
```

**Access Type Options:**
- `public` - Dapat diakses oleh semua orang
- `member_only` - Hanya untuk member yang terdaftar
- `internal` - Hanya untuk internal perusahaan

**Validasi:**
- `title`: String, tidak boleh kosong
- `description`: String, tidak boleh kosong
- `requiredStaffs`: Array minimal 1 item, setiap item:
  - `positionId`: MongoDB ObjectId valid
  - `minimumStaff`: Number >= 0
  - `maximumStaff`: Number >= 1
- `workOrderForms`: Array opsional, setiap item:
  - `order`: Number >= 1
  - `formId`: MongoDB ObjectId valid
  - `fillableByRoles`: Array string opsional
  - `viewableByRoles`: Array string opsional
  - `fillableByPositionIds`: Array MongoDB ObjectId opsional
  - `viewableByPositionIds`: Array MongoDB ObjectId opsional
- `reportForms`: Array opsional (struktur sama dengan workOrderForms)
- `accessType`: Harus `public`, `member_only`, atau `internal`
- `isActive`: Boolean opsional
- `clientIntakeForms`: Array opsional, setiap item:
  - `order`: Number >= 1
  - `formId`: MongoDB ObjectId valid

---

### 5.2 Update Service
**Endpoint:** `PATCH /services/:id`

```json
{
  "title": "Updated Website Development Service",
  "description": "Updated description",
  "accessType": "member_only",
  "isActive": false,
  "clientIntakeForms": [
    {
      "order": 1,
      "formId": "507f1f77bcf86cd799439041"
    }
  ]
}
```

**Note:** Semua field bersifat opsional (PartialType dari CreateServiceDto)

---

### 5.3 Submit Intake Forms
**Endpoint:** `POST /services/:serviceId/submit-intake-forms`

```json
[
  {
    "formId": "507f1f77bcf86cd799439041",
    "fieldsData": [
      {
        "order": 1,
        "value": "Nama Perusahaan ABC"
      },
      {
        "order": 2,
        "value": "contact@abc.com"
      },
      {
        "order": 3,
        "value": "Website untuk e-commerce"
      }
    ]
  },
  {
    "formId": "507f1f77bcf86cd799439042",
    "fieldsData": [
      {
        "order": 1,
        "value": "Rp 50.000.000"
      },
      {
        "order": 2,
        "value": "3 bulan"
      }
    ]
  }
]
```

**Validasi:**
- Array of `SubmitIntakeFormItemDto`
- Setiap item:
  - `formId`: MongoDB ObjectId valid
  - `fieldsData`: Array of field data
    - `order`: Any (number atau string sesuai kebutuhan)
    - `value`: Any (bisa string, number, boolean, dll)

---

## 6. Work Order Module

### 6.1 Create Work Order
**Endpoint:** `POST /work-orders`

```json
{
  "clientServiceRequestId": "507f1f77bcf86cd799439051",
  "serviceId": "507f1f77bcf86cd799439052",
  "description": "Pembuatan website e-commerce untuk toko online",
  "priority": "high"
}
```

**Priority Options:**
- `low` - Prioritas rendah
- `medium` - Prioritas sedang
- `high` - Prioritas tinggi

**Note:** DTO tidak memiliki validasi decorator, namun field yang diperlukan:
- `clientServiceRequestId`: ID dari client service request
- `serviceId`: ID dari service
- `description`: Deskripsi work order (opsional)
- `priority`: Prioritas (opsional)

---

### 6.2 Update Work Order
**Endpoint:** `PATCH /work-orders/:id`

```json
{
  "description": "Updated description for work order",
  "priority": "medium",
  "status": "in_progress",
  "notes": "Work order sedang dikerjakan oleh tim"
}
```

**Status Options:**
- `drafted` - Draft
- `in_progress` - Sedang dikerjakan
- `on_hold` - Ditunda
- `completed` - Selesai
- `cancelled` - Dibatalkan

**Note:** Semua field bersifat opsional

---

### 6.3 Assign Staff to Work Order
**Endpoint:** `POST /work-orders/:id/assign-staff`

```json
{
  "staffEmail": [
    "staff1@company.com",
    "staff2@company.com",
    "staff3@company.com"
  ]
}
```

**Validasi:**
- `staffEmail`: Array tidak boleh kosong, setiap item harus email valid

---

### 6.4 Update Work Order Status
**Endpoint:** `PATCH /work-orders/:id/status`

```json
{
  "status": "completed",
  "reason": "Semua pekerjaan telah selesai dan telah diverifikasi oleh klien"
}
```

**Status Options:**
- `drafted` - Draft
- `in_progress` - Sedang dikerjakan
- `on_hold` - Ditunda
- `completed` - Selesai
- `cancelled` - Dibatalkan

**Validasi:**
- `status`: String (required)
- `reason`: String opsional

---

### 6.5 Create Submissions (Bulk)
**Endpoint:** `POST /work-orders/:id/submissions`

```json
{
  "submissions": [
    {
      "_id": "507f1f77bcf86cd799439061",
      "ownerId": "507f1f77bcf86cd799439062",
      "formId": "507f1f77bcf86cd799439063",
      "submissionType": "work_order",
      "fieldsData": [
        {
          "order": "1",
          "value": "Analisis kebutuhan sistem"
        },
        {
          "order": "2",
          "value": "Sudah selesai 80%"
        }
      ],
      "status": "submitted",
      "submittedBy": "507f1f77bcf86cd799439064",
      "submittedAt": "2026-01-17T01:00:00.000Z"
    },
    {
      "ownerId": "507f1f77bcf86cd799439062",
      "formId": "507f1f77bcf86cd799439065",
      "submissionType": "report",
      "fieldsData": [
        {
          "order": "1",
          "value": "Laporan progress mingguan"
        }
      ],
      "status": "draft",
      "submittedBy": "507f1f77bcf86cd799439064",
      "createdAt": "2026-01-17T01:00:00.000Z",
      "updatedAt": "2026-01-17T01:00:00.000Z"
    }
  ]
}
```

**Validasi:**
- `submissions`: Array tidak boleh kosong
- Setiap submission:
  - `_id`: String opsional (MongoDB ObjectId)
  - `ownerId`: String, tidak boleh kosong
  - `formId`: String, tidak boleh kosong
  - `submissionType`: String, tidak boleh kosong
  - `fieldsData`: Array of field data
    - `order`: String, tidak boleh kosong
    - `value`: Any, tidak boleh kosong
  - `status`: String, tidak boleh kosong
  - `submittedBy`: String, tidak boleh kosong
  - `createdAt`: ISO Date string opsional
  - `updatedAt`: ISO Date string opsional
  - `submittedAt`: ISO Date string opsional

---

## 7. Form Module

### 7.1 Create Form Template
**Endpoint:** `POST /forms`

```json
{
  "title": "Formulir Permintaan Layanan",
  "description": "Formulir untuk mengajukan permintaan layanan baru",
  "formType": "intake",
  "fields": [
    {
      "order": 1,
      "label": "Nama Lengkap",
      "type": "text",
      "required": true,
      "placeholder": "Masukkan nama lengkap Anda"
    },
    {
      "order": 2,
      "label": "Email",
      "type": "email",
      "required": true,
      "placeholder": "email@example.com"
    },
    {
      "order": 3,
      "label": "Jenis Layanan",
      "type": "select",
      "required": true,
      "options": [
        {
          "key": "web_dev",
          "value": "Website Development"
        },
        {
          "key": "mobile_dev",
          "value": "Mobile App Development"
        },
        {
          "key": "consulting",
          "value": "IT Consulting"
        }
      ]
    },
    {
      "order": 4,
      "label": "Budget (dalam juta rupiah)",
      "type": "number",
      "required": true,
      "min": 10,
      "max": 1000,
      "placeholder": "50"
    },
    {
      "order": 5,
      "label": "Deskripsi Kebutuhan",
      "type": "textarea",
      "required": true,
      "placeholder": "Jelaskan kebutuhan Anda secara detail"
    },
    {
      "order": 6,
      "label": "Setuju dengan syarat dan ketentuan",
      "type": "checkbox",
      "required": true
    }
  ]
}
```

**Form Type Options:**
- `work_order` - Form untuk work order
- `report` - Form untuk laporan
- `intake` - Form untuk intake/pengajuan

**Field Types:**
- `text` - Input teks
- `email` - Input email
- `number` - Input angka
- `textarea` - Text area
- `select` - Dropdown selection
- `checkbox` - Checkbox
- `radio` - Radio button
- `date` - Date picker
- `file` - File upload

**Validasi:**
- `title`: String, tidak boleh kosong
- `description`: String opsional
- `formType`: Harus `work_order`, `report`, atau `intake`
- `fields`: Array tidak boleh kosong, setiap field:
  - `order`: Integer, tidak boleh kosong
  - `label`: String, tidak boleh kosong
  - `type`: String, tidak boleh kosong
  - `required`: Boolean, tidak boleh kosong
  - `placeholder`: String opsional
  - `options`: Array of OptionDto opsional (untuk select/radio)
    - `key`: String, tidak boleh kosong
    - `value`: String, tidak boleh kosong
  - `min`: Number opsional (untuk number type)
  - `max`: Number opsional (untuk number type)

---

### 7.2 Update Form Template
**Endpoint:** `PATCH /forms/:id`

```json
{
  "title": "Updated Form Title",
  "description": "Updated description",
  "fields": [
    {
      "order": 1,
      "label": "Updated Field Label",
      "type": "text",
      "required": false
    }
  ]
}
```

**Note:** Semua field bersifat opsional (PartialType dari CreateFormTemplateDto)

---

### 7.3 Submit Form
**Endpoint:** `POST /forms/submit`

```json
{
  "formTemplateId": "507f1f77bcf86cd799439071",
  "answers": [
    {
      "fieldId": "field_1",
      "value": "John Doe"
    },
    {
      "fieldId": "field_2",
      "value": "john.doe@example.com"
    },
    {
      "fieldId": "field_3",
      "value": "web_dev"
    },
    {
      "fieldId": "field_4",
      "value": 75
    },
    {
      "fieldId": "field_5",
      "value": "Saya membutuhkan website e-commerce dengan fitur payment gateway"
    },
    {
      "fieldId": "field_6",
      "value": true
    }
  ]
}
```

**Validasi:**
- `formTemplateId`: MongoDB ObjectId valid, tidak boleh kosong
- `answers`: Array tidak boleh kosong, setiap answer:
  - `fieldId`: String, tidak boleh kosong
  - `value`: Any (bisa string, number, boolean, array, dll)

---

## 8. Membership Module

### 8.1 Generate Membership Codes
**Endpoint:** `POST /membership/generate`

```json
{
  "amount": 50,
  "prefix": "MEMBER2026"
}
```

**Validasi:**
- `amount`: Integer, minimal 1, maksimal 100
- `prefix`: String opsional

**Example without prefix:**
```json
{
  "amount": 10
}
```

---

### 8.2 Claim Membership Code
**Endpoint:** `POST /membership/claim`

```json
{
  "code": "MEMBER2026-ABC123XYZ"
}
```

**Validasi:**
- `code`: String, tidak boleh kosong

---

## 9. Work Report Module

### 9.1 Create Work Report
**Endpoint:** `POST /work-reports`

```json
{
  "workOrderId": "507f1f77bcf86cd799439081",
  "companyId": "507f1f77bcf86cd799439082",
  "reportForms": [
    {
      "formId": "507f1f77bcf86cd799439083",
      "submissionId": "507f1f77bcf86cd799439084"
    },
    {
      "formId": "507f1f77bcf86cd799439085",
      "submissionId": "507f1f77bcf86cd799439086"
    }
  ],
  "status": "in_progress"
}
```

**Status Options:**
- `in_progress` - Sedang dikerjakan
- `completed` - Selesai
- `cancelled` - Dibatalkan
- `rejected` - Ditolak

**Validasi:**
- `workOrderId`: MongoDB ObjectId valid, tidak boleh kosong
- `companyId`: MongoDB ObjectId valid, tidak boleh kosong
- `reportForms`: Array opsional (struktur bisa disesuaikan)
- `status`: Enum, opsional

---

### 9.2 Update Work Report
**Endpoint:** `PATCH /work-reports/:id`

```json
{
  "status": "completed",
  "reportForms": [
    {
      "formId": "507f1f77bcf86cd799439083",
      "submissionId": "507f1f77bcf86cd799439084"
    }
  ],
  "startedAt": "2026-01-10T08:00:00.000Z",
  "completedAt": "2026-01-17T17:00:00.000Z"
}
```

**Validasi:**
- Semua field dari CreateWorkReportDto bersifat opsional
- `startedAt`: ISO Date string opsional
- `completedAt`: ISO Date string opsional

---

## Notes

### MongoDB ObjectId Format
Semua `_id`, `positionId`, `formId`, `companyId`, dll yang bertipe MongoDB ObjectId harus menggunakan format 24 karakter hexadecimal.

**Contoh valid ObjectId:**
- `507f1f77bcf86cd799439011`
- `507f191e810c19729de860ea`
- `65a1b2c3d4e5f6a7b8c9d0e1`

### Date Format
Semua field date harus menggunakan ISO 8601 format.

**Contoh:**
- `2026-01-17T01:00:00.000Z`
- `2026-01-10T08:30:00+07:00`

### Email Format
Email harus valid sesuai standar RFC 5322.

**Contoh valid:**
- `user@example.com`
- `john.doe@company.co.id`
- `admin+test@domain.com`

### Role Values
Berdasarkan enum yang ada di sistem:
- `client` - Klien
- `staff_unassigned` - Staff belum ditugaskan
- `manager_company` - Manager perusahaan
- `staff_company` - Staff perusahaan
- `owner_company` - Pemilik perusahaan
- `admin` - Admin aplikasi

---

## Tips Penggunaan

1. **Validasi Field**: Pastikan semua field yang required tidak kosong dan sesuai dengan tipe data yang diminta
2. **ObjectId**: Gunakan ObjectId yang valid (24 karakter hex) untuk semua reference ID
3. **Array**: Untuk field array, pastikan minimal ada 1 item jika required
4. **Enum**: Gunakan nilai yang sesuai dengan enum yang telah ditentukan
5. **Optional Fields**: Field opsional bisa dihilangkan dari request body
6. **Nested Objects**: Perhatikan struktur nested object terutama pada Service dan Form module

---

**Last Updated:** 2026-01-17
**Version:** 1.0.0
