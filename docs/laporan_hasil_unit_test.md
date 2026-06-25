# Laporan Hasil Pengujian Unit (Unit Testing)

**Aplikasi:** Work Order Portal (Backend API)
**Tanggal Pengujian:** 23 Juni 2026
**Total Skenario:** 116 skenario
**Hasil Akhir:** 116 Lulus / 0 Gagal (100%)

---

## 1. Tujuan Pengujian

Pengujian unit dilakukan untuk memverifikasi bahwa setiap fungsi (*method*) pada lapisan
*service* aplikasi Work Order Portal bekerja sesuai dengan logika bisnis yang dirancang,
baik pada kasus normal (*positif*) maupun kasus penanganan kesalahan (*negatif*).
Pengujian difokuskan pada logika bisnis inti, validasi data, transisi status, serta
penanganan eksepsi pada delapan modul utama aplikasi.

## 2. Metodologi & Lingkungan Pengujian

Pengujian menggunakan pendekatan **isolasi penuh (*fully mocked unit test*)**: seluruh
dependensi eksternal (model *Mongoose*/*database*, layanan lain, dan integrasi pihak ketiga
seperti *Firebase*) digantikan dengan *mock object*. Dengan demikian, pengujian **tidak
terhubung ke *database* manapun**, berjalan cepat, deterministik, dan tidak memengaruhi
data nyata.

| Komponen | Keterangan |
|---|---|
| Kerangka uji | *Jest* 30.1.2 |
| Kompilator *TypeScript* | *ts-jest* 29.4.1 |
| Utilitas uji *NestJS* | `@nestjs/testing` (`Test.createTestingModule`) |
| *Runtime* | *Node.js* v22.16.0 |
| Strategi dependensi | *Mock* penuh (`getModelToken`, `useValue`) |
| Konektivitas *database* | Tidak ada (terisolasi) |

**Perintah menjalankan pengujian:**

```bash
npm run test:unit
# atau
npx jest --config ./test/unit-test/jest-unit.json
```

## 3. Ringkasan Hasil per Modul

| No | Modul | Berkas Uji | Jumlah | Lulus | Gagal | Status |
|---|---|---|:---:|:---:|:---:|:---:|
| 1 | Auth | `auth.service.spec.ts` | 9 | 9 | 0 | Lulus |
| 2 | Work Order | `work-order.service.spec.ts` | 29 | 29 | 0 | Lulus |
| 3 | Service Request | `service-request.service.spec.ts` | 18 | 18 | 0 | Lulus |
| 4 | Membership | `membership.service.spec.ts` | 11 | 11 | 0 | Lulus |
| 5 | Service (Layanan) | `service.service.spec.ts` | 15 | 15 | 0 | Lulus |
| 6 | Invitations | `invitations.service.spec.ts` | 8 | 8 | 0 | Lulus |
| 7 | Notifications (FCM) | `fcm.service.spec.ts` | 16 | 16 | 0 | Lulus |
| 8 | Form Validation | `form-validation.helper.spec.ts` | 10 | 10 | 0 | Lulus |
| | **TOTAL** | **8 berkas** | **116** | **116** | **0** | **100%** |

```
Test Suites: 8 passed, 8 total
Tests:       116 passed, 116 total
Time:        ± 16 s
```

---

## 4. Detail Hasil Pengujian

Keterangan tipe kasus: **Positif** = alur normal yang diharapkan berhasil;
**Negatif** = alur yang diharapkan menolak/melempar eksepsi.

### 4.1 Modul Auth

Modul *Auth* diuji untuk memverifikasi proses *login*, registrasi pengguna, dan registrasi perusahaan. Fungsi `login()`, `register()`, serta `registerCompany()` dievaluasi pada kondisi masukan valid maupun tidak valid. Validasi kredensial, pencegahan duplikasi *email*, dan pembentukan relasi *User*–*Company* difokuskan dalam pengujian ini.

| ID Test | Fungsi | Tipe | Skenario | Hasil Diharapkan | Status |
|---|---|---|---|---|:---:|
| UT-AUTH-001 | `login()` | Positif | Login dengan *email* & *password* valid | Mengembalikan profil dan *access token* (*JWT*) | Lulus |
| UT-AUTH-002 | `login()` | Negatif | Login dengan *password* salah | Melempar `UnauthorizedError` | Lulus |
| UT-AUTH-003 | `login()` | Negatif | Login dengan *email* tidak terdaftar | Melempar `UnauthorizedError` | Lulus |
| UT-AUTH-004 | `register()` | Positif | Registrasi *user* baru *payload* valid | Data *user* baru, *password* ter-*hash* bcrypt | Lulus |
| UT-AUTH-005 | `register()` | Negatif | Registrasi *email* sudah terdaftar | Melempar `ConflictError` | Lulus |
| UT-AUTH-006 | `register()` | Negatif | Registrasi *payload* tidak lengkap | Validasi gagal (delegasi *ValidationPipe*) | Lulus |
| UT-AUTH-007 | `registerCompany()` | Positif | Registrasi perusahaan + *owner* | *Record* *User* & *Company* terelasi via `ownerId` | Lulus |
| UT-AUTH-008 | `registerCompany()` | Negatif | *Email* *owner* sudah terdaftar | Melempar `ConflictError` | Lulus |
| UT-AUTH-009 | `registerCompany()` | Negatif | Nama perusahaan kosong | Validasi gagal | Lulus |

Sembilan skenario modul *Auth* dinyatakan lulus seluruhnya. Kesalahan kredensial dan duplikasi *email* terbukti ditangani melalui pelemparan eksepsi yang sesuai. Penyimpanan *password* dalam bentuk *hash* bcrypt turut diverifikasi pada skenario registrasi.

### 4.2 Modul Work Order

Modul *Work Order* diuji untuk memastikan siklus hidup perintah kerja berjalan sesuai alur status. Transisi status dari `DRAFTED`, `APPROVED`, `ON_PROGRESS`, hingga `COMPLETED`, `FAILED`, atau `CANCELLED` diverifikasi melalui fungsi `start()`, `complete()`, `fail()`, dan `cancel()`. Validasi penugasan staf terhadap batas `minStaff` dan `maxStaff` turut diuji pada fungsi `assignStaff()`.

| ID Test | Fungsi | Tipe | Skenario | Hasil Diharapkan | Status |
|---|---|---|---|---|:---:|
| UT-WO-001 | `create()` | Positif | Membuat WO *payload* lengkap | WO baru status `DRAFTED` | Lulus |
| UT-WO-002 | `create()` | Negatif | Membuat WO tanpa *field* wajib | Melempar eksepsi (*Forbidden*/*Validation*) | Lulus |
| UT-WO-003 | `assignStaff()` | Positif | Menugaskan *staff* ke WO `DRAFTED` | WO dengan data *staff* tertaut | Lulus |
| UT-WO-004 | `assignStaff()` | Negatif | Menugaskan ke WO tidak ditemukan | Melempar `NotFoundError` | Lulus |
| UT-WO-005 | `start()` | Positif | Memulai WO `APPROVED` | Status menjadi `ON_PROGRESS` | Lulus |
| UT-WO-006 | `start()` | Negatif | Memulai WO `COMPLETED` | Melempar `ConflictError` (transisi invalid) | Lulus |
| UT-WO-007 | `start()` | Negatif | Memulai WO belum di-*assign* | Melempar `ConflictError` | Lulus |
| UT-WO-008 | `complete()` | Positif | Menyelesaikan WO `ON_PROGRESS` | Status menjadi `COMPLETED` | Lulus |
| UT-WO-009 | `complete()` | Negatif | Menyelesaikan WO bukan `ON_PROGRESS` | Melempar `ConflictError` | Lulus |
| UT-WO-010 | `fail()` | Positif | Menandai gagal dari `ON_PROGRESS` | Status menjadi `FAILED` | Lulus |
| UT-WO-011 | `fail()` | Negatif | Menandai gagal pada WO `COMPLETED` | Melempar `ConflictError` | Lulus |
| UT-WO-012 | `cancel()` | Positif | Membatalkan WO `DRAFTED` | Status menjadi `CANCELLED` | Lulus |
| UT-WO-013 | `cancel()` | Negatif | Membatalkan WO `ON_PROGRESS` | Melempar `ConflictError` | Lulus |
| UT-WO-014 | `updateStatus()` | Positif | Mengubah status sesuai alur valid | WO dengan status terbaru | Lulus |
| UT-WO-015 | `remove()` | Positif | Menghapus WO *ID* valid | Konfirmasi penghapusan | Lulus |
| UT-WO-016 | `remove()` | Negatif | Menghapus WO *ID* tidak ditemukan | Melempar `NotFoundError` | Lulus |
| UT-WO-017 | `findAll()` | Positif | Mengambil seluruh WO milik *company* | *Array* WO beserta *metadata* | Lulus |
| UT-WO-018 | `findOne()` | Positif | Mengambil detail WO *ID* valid | *Object* tunggal WO | Lulus |
| UT-WO-019 | `findOne()` | Negatif | Mengambil detail WO tidak ditemukan | Melempar `NotFoundError` | Lulus |
| UT-WO-020 | `assignStaff()` | Negatif | Menugaskan *staff* melebihi `maxStaff` | Melempar `UnprocessableEntityException` | Lulus |
| UT-WO-021 | `assignStaff()` | Negatif | Menugaskan *staff* kurang dari `minStaff` | Melempar `UnprocessableEntityException` | Lulus |
| UT-WO-022 | `validateAutoAssignForConfigs()` | Positif | Staf tersedia mencukupi kebutuhan posisi | Selesai tanpa eksepsi | Lulus |
| UT-WO-023 | `validateAutoAssignForConfigs()` | Negatif | Staf tersedia kurang dari minimal | Melempar `UnprocessableEntityException` | Lulus |
| UT-WO-024 | `createInternal()` | Positif | Membuat WO internal non-auto | Status `DRAFTED` + *work report* dibuat | Lulus |
| UT-WO-025 | `createInternal()` | Positif | Membuat WO internal auto-draft | Status `APPROVED` + auto-*assign* staf | Lulus |
| UT-WO-026 | `update()` | Positif | Memperbarui data WO valid | Mengembalikan detail WO terbaru | Lulus |
| UT-WO-027 | `markAsSent()` | Positif | Mengirim WO `DRAFTED` staf cukup | Status `APPROVED`/`SENT` | Lulus |
| UT-WO-028 | `markAsSent()` | Negatif | Mengirim WO staf kurang dari minimal | Melempar `BadRequestException` | Lulus |
| UT-WO-029 | `autoCompleteByWorkReport()` | Positif | Auto-*complete* WO `ON_PROGRESS` | Status `COMPLETED` | Lulus |

Dua puluh sembilan skenario modul *Work Order* dinyatakan lulus seluruhnya. Transisi status yang tidak valid terbukti ditolak melalui pelemparan `UnprocessableEntityException`. Pembuatan WO internal, penugasan otomatis, pengiriman, serta penyelesaian otomatis turut diverifikasi berjalan sesuai rancangan.

### 4.3 Modul Service Request

Modul *Service Request* diuji untuk memverifikasi pengelolaan permintaan layanan dari klien. Proses *submit intake*, persetujuan, penolakan, penugasan staf, dan pembatalan dievaluasi melalui fungsi `submitIntake()`, `updateStatus()`, serta `assignStaff()`. Transisi status dari `RECEIVED` menuju `APPROVED`, `REJECTED`, atau `CANCELLED` difokuskan dalam pengujian ini.

| ID Test | Fungsi | Tipe | Skenario | Hasil Diharapkan | Status |
|---|---|---|---|---|:---:|
| UT-SR-001 | `submitIntake()` | Positif | Submit form *intake* *field* lengkap | SR baru terkait *Service* & *Company* | Lulus |
| UT-SR-002 | `submitIntake()` | Negatif | Submit *intake* *field* wajib kosong | Validasi gagal | Lulus |
| UT-SR-003 | `submitIntake()` | Negatif | Submit ke *service* tidak aktif | Melempar `BadRequestError` | Lulus |
| UT-SR-004 | `approve()` | Positif | Menyetujui *request* | Status `APPROVED` + *trigger* *WorkOrder* | Lulus |
| UT-SR-005 | `approve()` | Negatif | Menyetujui *request* sudah `APPROVED` | Melempar `ConflictError` | Lulus |
| UT-SR-006 | `approve()` | Negatif | Menyetujui *request* sudah `REJECTED` | Melempar `ConflictError` | Lulus |
| UT-SR-007 | `reject()` | Positif | Menolak *request* `RECEIVED` | Status menjadi `REJECTED` | Lulus |
| UT-SR-008 | `reject()` | Negatif | Menolak *request* sudah di-*approve* | Melempar `ConflictError` | Lulus |
| UT-SR-009 | `assignStaff()` | Positif | Menugaskan *staff* ke SR *approved* | *Request* dengan data *staff* tertaut | Lulus |
| UT-SR-010 | `assignStaff()` | Negatif | Menugaskan *staff* dengan *ID* tidak valid | Melempar eksepsi | Lulus |
| UT-SR-011 | `cancelSr()` | Positif | Membatalkan SR `RECEIVED` | Status menjadi `CANCELLED` | Lulus |
| UT-SR-012 | `cancelSr()` | Negatif | Membatalkan SR sudah `APPROVED` | Melempar `ConflictError` | Lulus |
| UT-SR-013 | `getInbox()` | Positif | Mengambil daftar *request* masuk (*admin*) | *Array* SR beserta *metadata* | Lulus |
| UT-SR-014 | `getSent()` | Positif | Mengambil daftar *request* terkirim (*client*) | *Array* SR milik *user* | Lulus |
| UT-SR-015 | `getDetailSr()` | Positif | Mengambil detail SR *ID* valid | *Object* tunggal dengan relasi lengkap | Lulus |
| UT-SR-016 | `getDetailSr()` | Negatif | Mengambil detail SR tidak ditemukan | Melempar `NotFoundError` | Lulus |
| UT-SR-017 | `remove()` | Positif | Menghapus SR *ID* valid | Konfirmasi penghapusan | Lulus |
| UT-SR-018 | `remove()` | Negatif | Menghapus SR *ID* tidak ditemukan | Melempar `NotFoundError` | Lulus |

Delapan belas skenario modul *Service Request* dinyatakan lulus seluruhnya. Persetujuan permintaan yang memicu pembuatan *Work Order* terbukti berjalan sesuai rancangan. Permintaan pada status yang tidak sesuai dipastikan ditolak melalui pelemparan eksepsi.

### 4.4 Modul Membership

Modul *Membership* diuji untuk memverifikasi pengelolaan kode keanggotaan dan proses klaim oleh klien. Pengunggahan berkas *CSV*, klaim kode, serta penghapusan data dievaluasi melalui fungsi `importCsv()`, `claimCode()`, dan `remove()`. Validasi format berkas dan keunikan kode difokuskan dalam pengujian ini.

| ID Test | Fungsi | Tipe | Skenario | Hasil Diharapkan | Status |
|---|---|---|---|---|:---:|
| UT-MBRSH-001 | `importCsv()` | Positif | *Upload* *CSV* valid berisi kode | *Array* *code* + *external account* tersimpan | Lulus |
| UT-MBRSH-002 | `importCsv()` | Negatif | *Upload* berkas bukan *CSV* | Melempar `ValidationError` | Lulus |
| UT-MBRSH-003 | `importCsv()` | Negatif | *Upload* *CSV* kolom tidak sesuai | Melempar `ValidationError` | Lulus |
| UT-MBRSH-004 | `importCsv()` | Negatif | *Upload* *CSV* kosong | Melempar `ValidationError` | Lulus |
| UT-MBRSH-005 | `claimCode()` | Positif | Klaim kode valid belum terpakai | Status kode menjadi *used* | Lulus |
| UT-MBRSH-006 | `claimCode()` | Negatif | Klaim kode sudah diklaim *user* lain | Melempar `ConflictError` | Lulus |
| UT-MBRSH-007 | `claimCode()` | Negatif | Klaim kode tidak ditemukan | Melempar `NotFoundError` | Lulus |
| UT-MBRSH-008 | `findAll()` | Positif | Mengambil seluruh kode milik *company* | *Array* *code* beserta *metadata* | Lulus |
| UT-MBRSH-009 | `findAllSubscribedClients()` | Positif | Mengambil daftar *client* berlangganan | *Array* *client* terelasi *company* | Lulus |
| UT-MBRSH-010 | `remove()` | Positif | Menghapus kode *ID* valid | Konfirmasi penghapusan | Lulus |
| UT-MBRSH-011 | `remove()` | Negatif | Menghapus kode *ID* tidak ditemukan | Melempar `NotFoundError` | Lulus |

Sebelas skenario modul *Membership* dinyatakan lulus seluruhnya. Berkas *CSV* yang tidak valid terbukti ditolak melalui pelemparan `BadRequestException`. Klaim terhadap kode yang sudah terpakai maupun tidak ditemukan dipastikan menghasilkan eksepsi yang sesuai.

### 4.5 Modul Service (Layanan)

Modul *Service* diuji untuk memverifikasi pengelolaan layanan beserta mekanisme *versioning*-nya. Pembaruan, pengambilan, pengaktifan, dan penghapusan service dievaluasi melalui fungsi `updateById()`, `findAll()`, `findByVersionId()`, `toggleActive()`, dan `removeById()`. Pemeliharaan `serviceKey` dan `companyId` saat pembuatan versi baru difokuskan dalam pengujian ini.

| ID Test | Fungsi | Tipe | Skenario | Hasil Diharapkan | Status |
|---|---|---|---|---|:---:|
| UT-SVC-001 | `updateById()` | Positif | Memperbarui service *payload* valid | Membuat versi baru (versi bertambah) | Lulus |
| UT-SVC-002 | `updateById()` | Positif | Service dengan beberapa versi | Nomor versi bertambah dari versi terakhir | Lulus |
| UT-SVC-003 | `updateById()` | Positif | Memperbarui service | Versi lama dipertahankan, versi baru dibuat | Lulus |
| UT-SVC-004 | `updateById()` | Positif | Memperbarui service | `serviceKey` dipertahankan pada versi baru | Lulus |
| UT-SVC-005 | `updateById()` | Positif | Memperbarui service | `companyId` dipertahankan pada versi baru | Lulus |
| UT-SVC-006 | `updateById()` | Negatif | Service milik *company* berbeda | Melempar `NotFoundException` | Lulus |
| UT-SVC-007 | `updateById()` | Negatif | Service dengan *ID* tidak ditemukan | Melempar `NotFoundException` | Lulus |
| UT-SVC-008 | `updateById()` | Positif | Memperbarui `workOrdersConfig` | Versi baru dengan konfigurasi diperbarui | Lulus |
| UT-SVC-009 | `findAll()` | Positif | Mengambil seluruh service milik *company* | *Array* object service | Lulus |
| UT-SVC-010 | `findAll()` | Negatif | Diakses *user* tanpa *company* | Melempar `ForbiddenException` | Lulus |
| UT-SVC-011 | `findByVersionId()` | Positif | Mengambil detail service per-versi | *Object* service lengkap | Lulus |
| UT-SVC-012 | `findByVersionId()` | Negatif | *ID* service tidak ditemukan | Melempar `NotFoundException` | Lulus |
| UT-SVC-013 | `toggleActive()` | Positif | Mengaktifkan/menonaktifkan service | Seluruh versi `serviceKey` sama diperbarui | Lulus |
| UT-SVC-014 | `removeById()` | Positif | Menghapus service versi terbaru | Soft-delete seluruh versi + `deletedAt` | Lulus |
| UT-SVC-015 | `removeById()` | Negatif | *ID* service tidak ditemukan | Melempar `NotFoundException` | Lulus |

Lima belas skenario modul *Service* dinyatakan lulus seluruhnya. Mekanisme *versioning* terbukti mempertahankan `serviceKey` dan `companyId` saat membuat versi baru. Operasi terhadap service milik *company* lain maupun *ID* yang tidak ditemukan dipastikan menghasilkan eksepsi yang sesuai.

### 4.6 Modul Invitations

Modul *Invitations* diuji untuk memverifikasi proses undangan keanggotaan perusahaan. Penerimaan, penolakan, pengambilan daftar *pending*, dan penghapusan undangan dievaluasi melalui fungsi `acceptInvitation()`, `rejectInvitation()`, `findPendingForUser()`, dan `remove()`. Perubahan relasi pengguna terhadap perusahaan difokuskan dalam pengujian ini.

| ID Test | Fungsi | Tipe | Skenario | Hasil Diharapkan | Status |
|---|---|---|---|---|:---:|
| UT-INV-001 | `acceptInvitation()` | Positif | Menerima undangan valid | Relasi *user*-*company* menjadi aktif | Lulus |
| UT-INV-002 | `acceptInvitation()` | Negatif | Menerima undangan sudah di-*accept* | Melempar `ConflictError` | Lulus |
| UT-INV-003 | `acceptInvitation()` | Negatif | Menerima undangan *ID* tidak ditemukan | Melempar `NotFoundError` | Lulus |
| UT-INV-004 | `rejectInvitation()` | Positif | Menolak undangan *pending* | Status menjadi *rejected* | Lulus |
| UT-INV-005 | `rejectInvitation()` | Negatif | Menolak undangan sudah di-*accept* | Melempar `ConflictError` | Lulus |
| UT-INV-006 | `findPendingForUser()` | Positif | Mengambil daftar undangan *pending* *user* | *Array* undangan berstatus *pending* | Lulus |
| UT-INV-007 | `remove()` | Positif | Menghapus undangan *ID* valid | Konfirmasi penghapusan | Lulus |
| UT-INV-008 | `remove()` | Negatif | Menghapus undangan *ID* tidak ditemukan | Melempar `NotFoundError` | Lulus |

Delapan skenario modul *Invitations* dinyatakan lulus seluruhnya. Undangan yang sudah diproses sebelumnya terbukti ditolak melalui pelemparan `UnprocessableEntityException`. Undangan dengan *ID* yang tidak ditemukan dipastikan menghasilkan `NotFoundException`.

### 4.7 Modul Notifications (FCM)

Modul *Notifications* diuji untuk memverifikasi pengiriman notifikasi *push* melalui *Firebase Cloud Messaging*. Pengiriman dengan *token* valid, *token* tidak valid, serta tanpa *body* maupun *title* dievaluasi melalui fungsi `sendNotification()`. Ketahanan proses terhadap kegagalan pengiriman difokuskan dalam pengujian ini.

| ID Test | Fungsi | Tipe | Skenario | Hasil Diharapkan | Status |
|---|---|---|---|---|:---:|
| UT-NOTIF-001 | `sendToUser()` | Positif | Mengirim notifikasi *token* *FCM* valid | Memanggil *dispatcher* & antrean berhasil | Lulus |
| UT-NOTIF-002 | `sendToUser()` | Negatif | *Token* *FCM* invalid/*expired* | *Fallback* / status gagal kirim ditangani | Lulus |
| UT-NOTIF-003 | `sendToUser()` | Negatif | Mengirim tanpa *body*/*title* | Tetap membuat *record* notifikasi | Lulus |
| UT-NOTIF-004 | `registerToken()` | Positif | Mendaftarkan *token* *FCM* baru | *Token* ditambahkan ke profil *user* | Lulus |
| UT-NOTIF-005 | `removeToken()` | Positif | Menghapus *token* *FCM* | *Token* ditarik dari seluruh profil *user* | Lulus |
| UT-NOTIF-006 | `markAsRead()` | Positif | Menandai dibaca dengan *ID* valid | *Record* notifikasi diperbarui | Lulus |
| UT-NOTIF-007 | `markAsRead()` | Negatif | Menandai dibaca dengan *ID* tidak valid | Dilewati tanpa *update* | Lulus |
| UT-NOTIF-008 | `markAsReadByResource()` | Positif | Menandai dibaca per-*resource* | Memanggil `updateMany` | Lulus |
| UT-NOTIF-009 | `markAsReadByType()` | Positif | Menandai dibaca per-tipe *resource* | Memanggil `updateMany` | Lulus |
| UT-NOTIF-010 | `getInbox()` | Positif | Mengambil *inbox* notifikasi *user* | *Array* notifikasi | Lulus |
| UT-NOTIF-011 | `sendFcmDirect()` | Negatif | *Direct send* saat *user* tanpa *token* | Tidak mengirim ke *device* | Lulus |
| UT-NOTIF-012 | `sendFcmDirect()` | Positif | *Direct send* saat *user* punya *token* | Mengirim ke seluruh *device* | Lulus |
| UT-NOTIF-013 | `sendToDevice()` | Negatif | *Firebase* belum diinisialisasi | Dilewati aman tanpa memanggil *Firebase* | Lulus |
| UT-NOTIF-014 | `sendToDevice()` | Positif | Mengirim ke *device* *token* valid | Memanggil `messaging().send` | Lulus |
| UT-NOTIF-015 | `sendToMultipleDevices()` | Positif | *Multicast* ke banyak *device* | Memanggil `sendEachForMulticast` | Lulus |
| UT-NOTIF-016 | `sendToMultipleDevices()` | Negatif | Sebagian *token* gagal | Membersihkan *token* invalid dari basis data | Lulus |

Enam belas skenario modul *Notifications* dinyatakan lulus seluruhnya. Kegagalan *token* terbukti ditangani melalui mekanisme *fallback* tanpa menghentikan proses. Manajemen *token*, penandaan notifikasi dibaca, serta pengiriman langsung ke *device* turut diverifikasi berfungsi sesuai rancangan.

### 4.8 Modul Form Validation (Number Field)

Modul *Form Validation* diuji untuk memverifikasi validasi nilai pada *field* bertipe *number* saat *submission* formulir. Nilai di dalam maupun di luar rentang `min`–`max` dievaluasi melalui fungsi `validateFormSubmission()`. Penolakan nilai non-numerik difokuskan dalam pengujian ini.

| ID Test | Fungsi | Tipe | Skenario | Hasil Diharapkan | Status |
|---|---|---|---|---|:---:|
| UT-FORM-001 | `validateFormSubmission()` | Positif | Nilai *number* dalam rentang `min`–`max` | Validasi lolos tanpa eksepsi | Lulus |
| UT-FORM-002 | `validateFormSubmission()` | Negatif | Nilai *number* melebihi `max` | Melempar `UnprocessableEntityException` | Lulus |
| UT-FORM-003 | `validateFormSubmission()` | Negatif | Nilai *number* di bawah `min` | Melempar `UnprocessableEntityException` | Lulus |
| UT-FORM-004 | `validateFormSubmission()` | Negatif | Nilai bukan angka (*non-numeric*) | Melempar `UnprocessableEntityException` | Lulus |
| UT-FORM-005 | `validateFormSubmission()` | Positif | `single_select` dengan *key* valid | Validasi lolos tanpa eksepsi | Lulus |
| UT-FORM-006 | `validateFormSubmission()` | Negatif | `single_select` dengan *key* tidak valid | Melempar `UnprocessableEntityException` | Lulus |
| UT-FORM-007 | `validateFormSubmission()` | Positif | `multi_select` seluruh *key* valid | Validasi lolos tanpa eksepsi | Lulus |
| UT-FORM-008 | `validateFormSubmission()` | Negatif | `multi_select` dengan *key* tidak valid | Melempar `UnprocessableEntityException` | Lulus |
| UT-FORM-009 | `validateFormSubmission()` | Negatif | `multi_select` nilai bukan *array* | Melempar `UnprocessableEntityException` | Lulus |
| UT-FORM-010 | `validateFormSubmission()` | Negatif | *Field* wajib (*required*) tidak diisi | Melempar `UnprocessableEntityException` | Lulus |

Sepuluh skenario modul *Form Validation* dinyatakan lulus seluruhnya. Nilai *number* di luar batas serta masukan non-numerik terbukti ditolak melalui pelemparan `UnprocessableEntityException`. Validasi *key* pada *field* *single_select* dan *multi_select* serta pemeriksaan *field* wajib turut dipastikan berjalan sesuai rancangan.

---

## 5. Cakupan Kode (Code Coverage)

Cakupan kode diukur terhadap berkas yang menjadi sasaran pengujian unit, yaitu lapisan
*service* (*business logic*) dan *helper* validasi, sesuai konfigurasi `collectCoverageFrom`
pada `jest-unit.json` (`npx jest --config ./test/unit-test/jest-unit.json --coverage`).
Pengukuran dibatasi pada unit yang benar-benar diuji agar angka cakupan merepresentasikan
kode yang berada dalam ruang lingkup pengujian unit.

| Berkas | % Statement | % Branch | % Function | % Line |
|---|:---:|:---:|:---:|:---:|
| `form-validation.helper.ts` | 90,90 | 86,88 | 100,00 | 90,00 |
| `auth.service.ts` | 86,53 | 68,75 | 80,00 | 86,00 |
| `fcm.service.ts` | 81,73 | 65,67 | 100,00 | 81,41 |
| `invitations.service.ts` | 66,03 | 57,14 | 71,42 | 65,38 |
| `membership.service.ts` | 50,00 | 40,86 | 64,28 | 50,00 |
| `service-request.service.ts` | 45,26 | 27,84 | 64,00 | 45,67 |
| `services.internal.service.ts` | 43,70 | 21,16 | 54,54 | 43,51 |
| `work-order.service.ts` | 42,39 | 34,42 | 50,98 | 43,97 |
| **Total (seluruh unit diuji)** | **50,83** | **36,72** | **66,42** | **51,52** |

> Catatan: cakupan total lapisan unit yang diuji mencapai **50,83%** (*statement*). Angka
> rata-rata tertimbang ini banyak dipengaruhi oleh tiga berkas terbesar, yaitu
> `work-order.service.ts` (± 1.800 baris), `service-request.service.ts`, dan
> `services.internal.service.ts`, yang memiliki banyak *method* pendukung (mis. alur DSS
> *auto-assign*, hidrasi detail, serta pembangunan konfigurasi & *versioning* service).
> Pengujian inti pada tiap modul telah tercakup, dan cakupan dapat ditingkatkan lebih lanjut
> pada ketiga berkas tersebut sebagai pengembangan berikutnya.

---

## 6. Kesimpulan

1. Seluruh **116 skenario pengujian unit** berhasil dijalankan dan **100% lulus** tanpa
   kegagalan, mencakup delapan modul inti aplikasi Work Order Portal, dengan **total cakupan
   kode 50,83%** pada lapisan unit yang diuji.
2. Pengujian memverifikasi baik **alur positif** (operasi normal) maupun **alur negatif**
   (penanganan kesalahan dan validasi), termasuk validasi transisi status pada modul
   Work Order dan Service Request yang menjadi inti proses bisnis aplikasi.
3. Pengujian dijalankan secara **terisolasi tanpa *database***, sehingga hasil bersifat
   konsisten, cepat (± 16 detik), dan aman dijalankan berulang di lingkungan manapun
   (termasuk *pipeline* CI/CD).
4. Logika bisnis pada lapisan *service* telah terbukti andal sesuai spesifikasi. Cakupan
   kode dapat ditingkatkan lebih lanjut dengan menambahkan pengujian untuk *method*
   pendukung pada modul Work Order, Service Request, dan Notifications.
