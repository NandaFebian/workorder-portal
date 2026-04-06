# Panduan Pengujian (Testing Guide) - Modul Service Request

Dokumentasi ini dibuat untuk mempermudah pengujian modul *Service Request* (SR) dari berbagai sisi *user* (Requester maupun Provider), lengkap dengan format URL endpoint, *method*, dan contoh *Request Body* yang sesuai dengan kerangka *Mega Refactor* terbaru.

Pastikan Anda telah menambahkan `Authorization: Bearer <TOKEN>` yang sesuai pada *headers* untuk setiap skenario di bawah ini.

---

## 🏗️ SKENARIO 1: SISI REQUESTER (Client Eks/Internal Staff)
**Token Syarat:** Gunakan JWT milik Client/User biasa.

### 1. Cek Ketersediaan Form Layanan (Intake Form)
Gunakan *endpoint* ini untuk mengambil kerangka pertanyaan *Intake Form* dari *Service* tertentu sebelum men-*submit*-nya.
*   **Method:** `GET`
*   **Endpoint:** `/public/services/:serviceId/intake-form`
*   **Catatan Pengujian:** Coba *request* ke layanan bertipe `internal`, sistem harus mengembalikan `403 Forbidden`.

### 2. Submit Intake (Membuat Service Request)
Melakukan pembuatan Service Request baru berdasarkan *form* yang telah diisi. Pastikan `formId` adalah ID yang didapat dari langkah 1 (atau bebas menggunakan ID skema form yang terdaftar untuk layanan tersebut) dan nilai `order` presisi terhadap *form target*.
*   **Method:** `POST`
*   **Endpoint:** `/service-request/service/:serviceId`
*   **Body Content:**
```json
{
  "submissions": [
    {
      "formId": "65ab1c...<FormTemplate_ID>",
      "fieldsData": [
        {
          "order": 1,
          "value": "Perbaikan Lampu Taman"
        },
        {
          "order": 2,
          "value": "urgent"
        }
      ]
    }
  ]
}
```
*   **Catatan Pengujian:** Cobalah untuk memalsukan `fieldsData` pendaftaran dengan menghilangkan sebuah urutan pertanyaan yang wajib (`required: true`) dan Anda harus mendapatkan *error* `422 Unprocessable Entity`.

### 3. Melihat Seluruh (Inbox) SR yang Pernah Dikirim
Melihat riwayat keseluruhan SR yang telah terbuat oleh akun bersangkutan.
*   **Method:** `GET`
*   **Endpoint:** `/service-requests/sent`

### 4. Melihat Detail SR Saya Sendiri
*   **Method:** `GET`
*   **Endpoint:** `/service-requests/:srId`

### 5. Membatalkan (Cancel) SR
Membatalkan laporan SR ke provider.
*   **Method:** `PATCH`
*   **Endpoint:** `/service-requests/:srId/cancel`
*   **Body Content:** *(Tidak Butuh Body)*
*   **Catatan Pengujian:** Ini hanya dapat dimatikan jika SR masih berada di status awalan yaitu `received`.

### 6. Submit Review (Tahap Akhir Pasca Penyelesaian Pekerjaan)
Menuliskan *review* bagi SR yang telah dinyatakan `completed` dari sisi Provider.
*   **Method:** `POST`
*   **Endpoint:** `/service-request/:srId/review`
*   **Body Content:** *(Bedakan antara form intake dan form review berdasarkan konfigurasi)*
```json
{
  "submissions": [
    {
      "formId": "65ab1d...<ReviewForm_ID>",
      "fieldsData": [
        {
          "order": 1,
          "value": 5
        },
        {
          "order": 2,
          "value": "Pekerjaan rapi dan cepat!"
        }
      ]
    }
  ]
}
```

---

## 🏢 SKENARIO 2: SISI PROVIDER (Owner / Manager Perusahaan)
**Token Syarat:** Gunakan JWT milik *Provider* (yang terhubung ke `companyId` layanan bersangkutan).

### 1. Cek Seluruh Permintaan SR yang Masuk (Inbox)
Melihat data masukan SR pada perusahaan *provider* (Menyembunyikan SR di perusahaan yang tidak diretas/dimasuki penguji).
*   **Method:** `GET`
*   **Endpoint:** `/service-requests/inbox`

### 2. Membaca Detail SR (lengkap dengan data Review/Intake/WO)
*   **Method:** `GET`
*   **Endpoint:** `/service-requests/:srId`
*   **Catatan Pengujian:** Respons data spesifik JSON di jalur *internal* pasti lebih lebar/besar dibandingkan jalur Requester. Coba akses ID SR perusahaan lain, sistem harus menolaknya (`403 Forbidden`).

### 3. Reject Service Request
Menolak SR yang disubmit klien.
*   **Method:** `PATCH`
*   **Endpoint:** `/service-requests/:srId/reject`
*   **Body Content:** *(Tidak Butuh Body)*

### 4. Approve Service Request (Test Pemicu Workflow OTOMATIS)
Mengizinkan SR untuk mulai di-*handle*. Di langkah inilah keruntutan Work Order / Work Report langsung tercipta.
*   **Method:** `PATCH`
*   **Endpoint:** `/service-requests/:srId/approve`
*   **Body Content:** *(Tidak Butuh Body)*
*   **Catatan Pengujian:** Pastikan ketika Anda melakukan validasi Approve pada SR ini, SR berubah statusnya bertahap (*auto logic*) ke `workOrderCreated` (dengan catatan layanan ini memiliki *workOrdersConfig* tercantum). Anda dapat mengeceknya kembali melalui *Detail API* no.2.

### 5. Menghapus Bersih History / Arsip SR
Hanya dapat dilakukan oleh provider.
*   **Method:** `DELETE`
*   **Endpoint:** `/service-requests/:srId`
*   **Body Content:** *(Tidak Butuh Body)*

---

### 🔥 Catatan Pengujian Penting Untuk Form dan Tipe Data
1.  **Validitas `order` (Untuk Form Template):**
    Saat merekayasa *request body* pada API `Submit Intake` dan `Submit Review`, nomor nilai objek `order` dalam `fieldsData` HARUS SAMA PERSIS / sinkron dengan `order` yang dikembalikan modul API Get Intake/Review Form.
2.  **Validitas Array `multi_select`:**
    Jika jenis jawaban form bertipe `multi_select`, isikan `value` JSON menggunakan format Array String: `["opsi_1", "opsi_3"]`.
3.  **Halaman Testing Tool Relevan:**
    Gunakan Postman, Insomnia, ataupun integrasikan dengan Swagger. Pengecekan terberat adalah pada `Roles` Guard. Pastikan JWT Token yang dipakai dikonfigurasi dengan tipe `role` yang konsisten (`Client` / `CompanyOwner` / `CompanyManager`).
