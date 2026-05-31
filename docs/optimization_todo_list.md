# To-Do List Optimasi & Pengembangan Sistem (workorder-portal)

Dokumen ini berisi daftar tugas (to-do list) terstruktur untuk mengimplementasikan rekomendasi optimasi pada sistem `workorder-portal`.

---

## [ ] 1. Arsitektur & Separation of Concerns
- [ ] **Optimasi Strategi JWT**:
  - [ ] Pasang module caching (in-memory / Redis).
  - [ ] Ubah `JwtStrategy.validate` untuk mencari data user di cache sebelum query ke MongoDB.
  - [ ] Tambahkan invalidasi cache saat profil user diperbarui.
- [ ] **Refaktor Circular Dependency**:
  - [ ] Hapus pemanggilan `this.workOrderModel.db.model('Service')` di `src/work-order/work-order.service.ts`.
  - [ ] Gunakan `@Inject(forwardRef(() => ServiceModel))` atau ekstraksi shared/agregator module untuk penanganan circular dependency secara bersih.

---

## [ ] 2. Kinerja & Database (MongoDB / Mongoose)
- [ ] **Penerapan Database Indexing**:
  - [ ] Tambahkan `@Prop({ index: true })` pada field foreign key (`companyId`, `userId`, `positionId`, `serviceId`, `serviceKey`).
  - [ ] Buat compound index untuk query penyaringan relasional yang sering digunakan bersama status (contoh: `companyId` + `deletedAt`, `userId` + `deletedAt`).
- [ ] **Standardisasi Filter Soft-Delete**:
  - [ ] Integrasikan library `mongoose-delete` ke skema Mongoose atau buat global query middleware filter.
  - [ ] Hapus penulisan filter manual `{ deletedAt: null }` di seluruh berkas service untuk merapikan kode.

---

## [ ] 3. Queueing System & Asynchronous Task Processing
- [ ] **Refaktorisasi Antrean Notifikasi (BullMQ)**:
  - [ ] Definisikan job `sendFcmNotification` pada BullMQ producer.
  - [ ] Pindahkan logika pengiriman `admin.messaging().send` dari main thread ke BullMQ worker processor.
  - [ ] Ubah pemanggilan `fcmService.sendToUser` agar memasukkan tugas ke antrean (non-blocking).
- [ ] **Optimasi Operasi Baca/Tulis Ringan**:
  - [ ] Hapus job `markAsRead` dari antrean BullMQ.
  - [ ] Ubah penandaan notifikasi dibaca (`markAsRead`) agar langsung mengeksekusi query MongoDB update secara langsung di thread utama secara non-blocking.

---

## [ ] 4. Keamanan & Integritas Data
- [ ] **Pengetatan CORS**:
  - [ ] Ganti origin wildcard `*` pada konfigurasi CORS di `app-setup.ts`.
  - [ ] Batasi origin hanya pada whitelist domain dari environment variable (`CORS_ALLOWED_ORIGINS`).
- [ ] **Enkripsi Kunci Integrasi**:
  - [ ] Implementasikan utilitas enkripsi simetris menggunakan modul `crypto` Node.js dengan algoritma `aes-256-gcm`.
  - [ ] Enkripsi `integrationConfig.secretKey` sebelum disimpan di MongoDB, dan dekripsi saat akan digunakan untuk request eksternal.
- [ ] **Aktivasi Rate Limiting**:
  - [ ] Konfigurasikan `@nestjs/throttler` secara global.
  - [ ] Pasang Throttler Guard pada endpoint autentikasi (`/auth/login`, `/auth/register`) untuk mencegah brute-force.

---

## [ ] 5. Cakupan Pengujian & QA (Quality Assurance)
- [ ] **Pembuatan E2E Test Suite Baru**:
  - [ ] Buat `test/service-requests.e2e-spec.ts` untuk pengujian alur pengajuan layanan.
  - [ ] Buat `test/work-orders.e2e-spec.ts` untuk siklus hidup perintah kerja.
  - [ ] Buat `test/work-reports.e2e-spec.ts` untuk pengujian pelaporan dan persetujuan kerja.
  - [ ] Buat `test/faq.e2e-spec.ts` untuk alur chatbot RAG.
  - [ ] Buat `test/customer-pairing.e2e-spec.ts` untuk pengujian integrasi akun eksternal.
- [ ] **Isolasi Database Pengujian**:
  - [ ] Konfigurasikan berkas setup pengujian (`test/jest-e2e.json` atau inisialisasi supertest) agar selalu menggunakan URI basis data khusus testing (misal `mongodb://localhost:27017/workorder_test`) atau pasang `mongodb-memory-server` guna menjamin keselamatan data lokal development.
