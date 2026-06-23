# Laporan Hasil Pengujian Unit (Unit Testing)

**Aplikasi:** Work Order Portal (Backend API)
**Tanggal Pengujian:** 23 Juni 2026
**Total Skenario:** 76 skenario
**Hasil Akhir:** ✅ 76 Lulus / 0 Gagal (100%)

---

## 1. Tujuan Pengujian

Pengujian unit dilakukan untuk memverifikasi bahwa setiap fungsi (method) pada lapisan
*service* aplikasi Work Order Portal bekerja sesuai dengan logika bisnis yang dirancang,
baik pada kasus normal (*positif*) maupun kasus penanganan kesalahan (*negatif*).
Pengujian difokuskan pada logika bisnis inti, validasi data, transisi status, serta
penanganan eksepsi pada tujuh modul utama aplikasi.

## 2. Metodologi & Lingkungan Pengujian

Pengujian menggunakan pendekatan **isolasi penuh (fully mocked unit test)**: seluruh
dependensi eksternal (model Mongoose/database, layanan lain, dan integrasi pihak ketiga
seperti Firebase) digantikan dengan *mock object*. Dengan demikian, pengujian **tidak
terhubung ke database manapun**, berjalan cepat, deterministik, dan tidak memengaruhi
data nyata.

| Komponen | Keterangan |
|---|---|
| Kerangka uji | Jest 30.1.2 |
| Kompilator TypeScript | ts-jest 29.4.1 |
| Utilitas uji NestJS | `@nestjs/testing` (`Test.createTestingModule`) |
| Runtime | Node.js v22.16.0 |
| Strategi dependensi | Mock penuh (`getModelToken`, `useValue`) |
| Konektivitas database | Tidak ada (terisolasi) |

**Perintah menjalankan pengujian:**

```bash
npm run test:unit
# atau
npx jest --config ./test/unit-test/jest-unit.json
```

## 3. Ringkasan Hasil per Modul

| No | Modul | Berkas Uji | Jumlah | Lulus | Gagal | Status |
|---|---|---|:---:|:---:|:---:|:---:|
| 1 | Auth | `auth.service.spec.ts` | 9 | 9 | 0 | ✅ |
| 2 | Work Order | `work-order.service.spec.ts` | 19 | 19 | 0 | ✅ |
| 3 | Service Request | `service-request.service.spec.ts` | 18 | 18 | 0 | ✅ |
| 4 | Membership | `membership.service.spec.ts` | 11 | 11 | 0 | ✅ |
| 5 | Service Price | `service-price.service.spec.ts` | 8 | 8 | 0 | ✅ |
| 6 | Invitations | `invitations.service.spec.ts` | 8 | 8 | 0 | ✅ |
| 7 | Notifications (FCM) | `fcm.service.spec.ts` | 3 | 3 | 0 | ✅ |
| | **TOTAL** | **7 berkas** | **76** | **76** | **0** | **✅ 100%** |

```
Test Suites: 7 passed, 7 total
Tests:       76 passed, 76 total
Time:        ± 18 s
```

---

## 4. Detail Hasil Pengujian

Keterangan tipe kasus: **Positif** = alur normal yang diharapkan berhasil;
**Negatif** = alur yang diharapkan menolak/melempar eksepsi.

### 4.1 Modul Auth

| ID Test | Fungsi | Tipe | Skenario | Hasil Diharapkan | Status |
|---|---|---|---|---|:---:|
| UT-AUTH-001 | `login()` | Positif | Login dengan email & password valid | Mengembalikan profil dan access token (JWT) | ✅ Lulus |
| UT-AUTH-002 | `login()` | Negatif | Login dengan password salah | Melempar `UnauthorizedError` | ✅ Lulus |
| UT-AUTH-003 | `login()` | Negatif | Login dengan email tidak terdaftar | Melempar `UnauthorizedError` | ✅ Lulus |
| UT-AUTH-004 | `register()` | Positif | Registrasi user baru payload valid | Data user baru, password ter-hash bcrypt | ✅ Lulus |
| UT-AUTH-005 | `register()` | Negatif | Registrasi email sudah terdaftar | Melempar `ConflictError` | ✅ Lulus |
| UT-AUTH-006 | `register()` | Negatif | Registrasi payload tidak lengkap | Validasi gagal (delegasi ValidationPipe) | ✅ Lulus |
| UT-AUTH-007 | `registerCompany()` | Positif | Registrasi perusahaan + owner | Record User & Company terelasi via `ownerId` | ✅ Lulus |
| UT-AUTH-008 | `registerCompany()` | Negatif | Email owner sudah terdaftar | Melempar `ConflictError` | ✅ Lulus |
| UT-AUTH-009 | `registerCompany()` | Negatif | Nama perusahaan kosong | Validasi gagal | ✅ Lulus |

### 4.2 Modul Work Order

| ID Test | Fungsi | Tipe | Skenario | Hasil Diharapkan | Status |
|---|---|---|---|---|:---:|
| UT-WO-001 | `create()` | Positif | Membuat WO payload lengkap | WO baru status `DRAFTED` | ✅ Lulus |
| UT-WO-002 | `create()` | Negatif | Membuat WO tanpa field wajib | Melempar eksepsi (Forbidden/Validation) | ✅ Lulus |
| UT-WO-003 | `assignStaff()` | Positif | Menugaskan staff ke WO `DRAFTED` | WO dengan data staff tertaut | ✅ Lulus |
| UT-WO-004 | `assignStaff()` | Negatif | Menugaskan ke WO tidak ditemukan | Melempar `NotFoundError` | ✅ Lulus |
| UT-WO-005 | `start()` | Positif | Memulai WO `APPROVED` | Status menjadi `ON_PROGRESS` | ✅ Lulus |
| UT-WO-006 | `start()` | Negatif | Memulai WO `COMPLETED` | Melempar `ConflictError` (transisi invalid) | ✅ Lulus |
| UT-WO-007 | `start()` | Negatif | Memulai WO belum di-assign | Melempar `ConflictError` | ✅ Lulus |
| UT-WO-008 | `complete()` | Positif | Menyelesaikan WO `ON_PROGRESS` | Status menjadi `COMPLETED` | ✅ Lulus |
| UT-WO-009 | `complete()` | Negatif | Menyelesaikan WO bukan `ON_PROGRESS` | Melempar `ConflictError` | ✅ Lulus |
| UT-WO-010 | `fail()` | Positif | Menandai gagal dari `ON_PROGRESS` | Status menjadi `FAILED` | ✅ Lulus |
| UT-WO-011 | `fail()` | Negatif | Menandai gagal pada WO `COMPLETED` | Melempar `ConflictError` | ✅ Lulus |
| UT-WO-012 | `cancel()` | Positif | Membatalkan WO `DRAFTED` | Status menjadi `CANCELLED` | ✅ Lulus |
| UT-WO-013 | `cancel()` | Negatif | Membatalkan WO `ON_PROGRESS` | Melempar `ConflictError` | ✅ Lulus |
| UT-WO-014 | `updateStatus()` | Positif | Mengubah status sesuai alur valid | WO dengan status terbaru | ✅ Lulus |
| UT-WO-015 | `remove()` | Positif | Menghapus WO ID valid | Konfirmasi penghapusan | ✅ Lulus |
| UT-WO-016 | `remove()` | Negatif | Menghapus WO ID tidak ditemukan | Melempar `NotFoundError` | ✅ Lulus |
| UT-WO-017 | `findAll()` | Positif | Mengambil seluruh WO milik company | Array WO beserta metadata | ✅ Lulus |
| UT-WO-018 | `findOne()` | Positif | Mengambil detail WO ID valid | Object tunggal WO | ✅ Lulus |
| UT-WO-019 | `findOne()` | Negatif | Mengambil detail WO tidak ditemukan | Melempar `NotFoundError` | ✅ Lulus |

### 4.3 Modul Service Request

| ID Test | Fungsi | Tipe | Skenario | Hasil Diharapkan | Status |
|---|---|---|---|---|:---:|
| UT-SR-001 | `submitIntake()` | Positif | Submit form intake field lengkap | SR baru terkait Service & Company | ✅ Lulus |
| UT-SR-002 | `submitIntake()` | Negatif | Submit intake field wajib kosong | Validasi gagal | ✅ Lulus |
| UT-SR-003 | `submitIntake()` | Negatif | Submit ke service tidak aktif | Melempar `BadRequestError` | ✅ Lulus |
| UT-SR-004 | `approve()` | Positif | Menyetujui request | Status `APPROVED` + trigger WorkOrder | ✅ Lulus |
| UT-SR-005 | `approve()` | Negatif | Menyetujui request sudah `APPROVED` | Melempar `ConflictError` | ✅ Lulus |
| UT-SR-006 | `approve()` | Negatif | Menyetujui request sudah `REJECTED` | Melempar `ConflictError` | ✅ Lulus |
| UT-SR-007 | `reject()` | Positif | Menolak request `PENDING` | Status menjadi `REJECTED` | ✅ Lulus |
| UT-SR-008 | `reject()` | Negatif | Menolak request sudah di-approve | Melempar `ConflictError` | ✅ Lulus |
| UT-SR-009 | `assignStaff()` | Positif | Menugaskan staff ke SR approved | Request dengan data staff tertaut | ✅ Lulus |
| UT-SR-010 | `assignStaff()` | Negatif | Menugaskan staff dengan ID tidak valid | Melempar eksepsi | ✅ Lulus |
| UT-SR-011 | `cancelSr()` | Positif | Membatalkan SR `PENDING` | Status menjadi `CANCELLED` | ✅ Lulus |
| UT-SR-012 | `cancelSr()` | Negatif | Membatalkan SR sudah `APPROVED` | Melempar `ConflictError` | ✅ Lulus |
| UT-SR-013 | `getInbox()` | Positif | Mengambil daftar request masuk (admin) | Array SR beserta metadata | ✅ Lulus |
| UT-SR-014 | `getSent()` | Positif | Mengambil daftar request terkirim (client) | Array SR milik user | ✅ Lulus |
| UT-SR-015 | `getDetailSr()` | Positif | Mengambil detail SR ID valid | Object tunggal dengan relasi lengkap | ✅ Lulus |
| UT-SR-016 | `getDetailSr()` | Negatif | Mengambil detail SR tidak ditemukan | Melempar `NotFoundError` | ✅ Lulus |
| UT-SR-017 | `remove()` | Positif | Menghapus SR ID valid | Konfirmasi penghapusan | ✅ Lulus |
| UT-SR-018 | `remove()` | Negatif | Menghapus SR ID tidak ditemukan | Melempar `NotFoundError` | ✅ Lulus |

### 4.4 Modul Membership

| ID Test | Fungsi | Tipe | Skenario | Hasil Diharapkan | Status |
|---|---|---|---|---|:---:|
| UT-MBRSH-001 | `importCsv()` | Positif | Upload CSV valid berisi kode | Array code + eksternal account tersimpan | ✅ Lulus |
| UT-MBRSH-002 | `importCsv()` | Negatif | Upload file bukan CSV | Melempar `ValidationError` | ✅ Lulus |
| UT-MBRSH-003 | `importCsv()` | Negatif | Upload CSV kolom tidak sesuai | Melempar `ValidationError` | ✅ Lulus |
| UT-MBRSH-004 | `importCsv()` | Negatif | Upload CSV kosong | Melempar `ValidationError` | ✅ Lulus |
| UT-MBRSH-005 | `claimCode()` | Positif | Klaim kode valid belum terpakai | Status kode menjadi *used* | ✅ Lulus |
| UT-MBRSH-006 | `claimCode()` | Negatif | Klaim kode sudah diklaim user lain | Melempar `ConflictError` | ✅ Lulus |
| UT-MBRSH-007 | `claimCode()` | Negatif | Klaim kode tidak ditemukan | Melempar `NotFoundError` | ✅ Lulus |
| UT-MBRSH-008 | `findAll()` | Positif | Mengambil seluruh kode milik company | Array code beserta metadata | ✅ Lulus |
| UT-MBRSH-009 | `findAllSubscribedClients()` | Positif | Mengambil daftar client berlangganan | Array client terelasi company | ✅ Lulus |
| UT-MBRSH-010 | `remove()` | Positif | Menghapus kode ID valid | Konfirmasi penghapusan | ✅ Lulus |
| UT-MBRSH-011 | `remove()` | Negatif | Menghapus kode ID tidak ditemukan | Melempar `NotFoundError` | ✅ Lulus |

### 4.5 Modul Service Price

| ID Test | Fungsi | Tipe | Skenario | Hasil Diharapkan | Status |
|---|---|---|---|---|:---:|
| UT-SP-001 | `create()` | Positif | Membuat variasi harga payload valid | Record harga layanan aktif | ✅ Lulus |
| UT-SP-002 | `create()` | Negatif | Membuat harga field wajib kosong | Validasi gagal | ✅ Lulus |
| UT-SP-003 | `create()` | Negatif | Membuat harga duplikat | Melempar `ConflictError` | ✅ Lulus |
| UT-SP-004 | `update()` | Positif | Memperbarui nominal harga ID valid | Record harga diperbarui | ✅ Lulus |
| UT-SP-005 | `update()` | Negatif | Memperbarui harga ID tidak ditemukan | Melempar `NotFoundError` | ✅ Lulus |
| UT-SP-006 | `findAll()` | Positif | Mengambil seluruh harga milik company | Array harga layanan | ✅ Lulus |
| UT-SP-007 | `remove()` | Positif | Menghapus harga ID valid | Konfirmasi penghapusan | ✅ Lulus |
| UT-SP-008 | `remove()` | Negatif | Menghapus harga ID tidak ditemukan | Melempar `NotFoundError` | ✅ Lulus |

### 4.6 Modul Invitations

| ID Test | Fungsi | Tipe | Skenario | Hasil Diharapkan | Status |
|---|---|---|---|---|:---:|
| UT-INV-001 | `acceptInvitation()` | Positif | Menerima undangan valid | Relasi user-company menjadi aktif | ✅ Lulus |
| UT-INV-002 | `acceptInvitation()` | Negatif | Menerima undangan sudah di-accept | Melempar `ConflictError` | ✅ Lulus |
| UT-INV-003 | `acceptInvitation()` | Negatif | Menerima undangan ID tidak ditemukan | Melempar `NotFoundError` | ✅ Lulus |
| UT-INV-004 | `rejectInvitation()` | Positif | Menolak undangan pending | Status menjadi *rejected* | ✅ Lulus |
| UT-INV-005 | `rejectInvitation()` | Negatif | Menolak undangan sudah di-accept | Melempar `ConflictError` | ✅ Lulus |
| UT-INV-006 | `findPendingForUser()` | Positif | Mengambil daftar undangan pending user | Array undangan berstatus pending | ✅ Lulus |
| UT-INV-007 | `remove()` | Positif | Menghapus undangan ID valid | Konfirmasi penghapusan | ✅ Lulus |
| UT-INV-008 | `remove()` | Negatif | Menghapus undangan ID tidak ditemukan | Melempar `NotFoundError` | ✅ Lulus |

### 4.7 Modul Notifications (FCM)

| ID Test | Fungsi | Tipe | Skenario | Hasil Diharapkan | Status |
|---|---|---|---|---|:---:|
| UT-NOTIF-001 | `sendNotification()` | Positif | Mengirim notifikasi token FCM valid | Memanggil dispatcher & antrean berhasil | ✅ Lulus |
| UT-NOTIF-002 | `sendNotification()` | Negatif | Token FCM invalid/expired | Fallback / status gagal kirim ditangani | ✅ Lulus |
| UT-NOTIF-003 | `sendNotification()` | Negatif | Mengirim tanpa body/title | Tetap membuat record notifikasi | ✅ Lulus |

---

## 5. Cakupan Kode (Code Coverage)

Cakupan kode diukur terhadap berkas *service* yang menjadi sasaran pengujian unit
(`npx jest --config ./test/unit-test/jest-unit.json --coverage`). Karena pengujian
difokuskan pada method dalam skenario, sebagian alur lain (helper internal, jalur
notifikasi, dan integrasi) belum tercakup penuh.

| Berkas Service | % Statement | % Branch | % Function | % Line |
|---|:---:|:---:|:---:|:---:|
| `auth.service.ts` | 86,53 | 68,75 | 80,00 | 86,00 |
| `service-price.service.ts` | 85,00 | 54,76 | 100,00 | 83,78 |
| `invitations.service.ts` | 66,03 | 57,14 | 71,42 | 65,38 |
| `membership.service.ts` | 50,00 | 40,86 | 64,28 | 50,00 |
| `service-request.service.ts` | 45,26 | 27,84 | 64,00 | 45,67 |
| `work-order.service.ts` | 30,48 | 18,77 | 33,33 | 31,23 |
| `fcm.service.ts` | 27,82 | 11,94 | 21,05 | 26,54 |

> Catatan: angka cakupan yang lebih rendah pada modul Work Order, Service Request, dan
> FCM disebabkan oleh banyaknya method pendukung di luar cakupan skenario prioritas
> (mis. alur DSS auto-assign, pembuatan WO dari Service Request, dan dispatcher Firebase),
> yang merupakan kandidat untuk pengujian lanjutan.

---

## 6. Kesimpulan

1. Seluruh **76 skenario pengujian unit** berhasil dijalankan dan **100% lulus** tanpa
   kegagalan, mencakup tujuh modul inti aplikasi Work Order Portal.
2. Pengujian memverifikasi baik **alur positif** (operasi normal) maupun **alur negatif**
   (penanganan kesalahan dan validasi), termasuk validasi transisi status pada modul
   Work Order dan Service Request yang menjadi inti proses bisnis aplikasi.
3. Pengujian dijalankan secara **terisolasi tanpa database**, sehingga hasil bersifat
   konsisten, cepat (± 18 detik), dan aman dijalankan berulang di lingkungan manapun
   (termasuk pipeline CI/CD).
4. Logika bisnis pada lapisan *service* telah terbukti andal sesuai spesifikasi. Cakupan
   kode dapat ditingkatkan lebih lanjut dengan menambahkan pengujian untuk method
   pendukung pada modul Work Order, Service Request, dan Notifications.
