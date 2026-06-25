# Skenario Unit Testing — Prioritas Utama & Menengah

> Dokumen ini telah **diselaraskan dengan implementasi dan hasil pengujian unit yang sebenarnya**
> (116/116 lulus). Nama status, jenis eksepsi (kelas exception NestJS), dan nama fungsi
> mengikuti perilaku kode aktual yang diverifikasi oleh berkas `test/unit-test/*.spec.ts`.

---

## 1. Auth Module

Modul *Auth* dirancang untuk menguji proses *login*, registrasi pengguna, dan registrasi perusahaan. Skenario disusun mencakup kondisi masukan valid maupun tidak valid pada fungsi `login()`, `register()`, dan `registerCompany()`. Validasi kredensial, pencegahan duplikasi *email*, serta pembentukan relasi *User*–*Company* ditetapkan sebagai fokus pengujian.

| No | ID Test | Nama Fungsi | Tipe Kasus | Skenario Pengujian | Hasil yang Diharapkan |
|---|---|---|---|---|---|
| 1 | UT-AUTH-001 | `login()` | Positif | Login dengan kredensial email & password valid | Mengembalikan object profil dan access token (JWT, berformat `Bearer ...`) |
| 2 | UT-AUTH-002 | `login()` | Negatif | Login dengan password salah | Melemparkan `HttpException` dengan kode `AUTH_INVALID_CREDENTIALS` |
| 3 | UT-AUTH-003 | `login()` | Negatif | Login dengan email yang tidak terdaftar | Melemparkan `HttpException` dengan kode `AUTH_INVALID_CREDENTIALS` |
| 4 | UT-AUTH-004 | `register()` | Positif | Registrasi user baru dengan payload valid | Mengembalikan data user baru tanpa field `password`/`fcmTokens` (password tersimpan ter-hash bcrypt) |
| 5 | UT-AUTH-005 | `register()` | Negatif | Registrasi dengan email yang sudah terdaftar | Melemparkan `HttpException` berstatus `400 BAD_REQUEST` (duplikasi email) |
| 6 | UT-AUTH-006 | `register()` | Negatif | Registrasi dengan payload tidak lengkap (nama kosong, email salah format) | Melemparkan eksepsi (validasi didelegasikan ke `UsersService`/`ValidationPipe`) |
| 7 | UT-AUTH-007 | `registerCompany()` | Positif | Registrasi perusahaan baru beserta owner sekaligus | Mengembalikan object `user` (beserta `company`) dan `token` yang saling terelasi |
| 8 | UT-AUTH-008 | `registerCompany()` | Negatif | Registrasi company dengan email owner yang sudah terdaftar | Melemparkan `HttpException` (email sudah terdaftar); `usersService.create` tidak dipanggil |
| 9 | UT-AUTH-009 | `registerCompany()` | Negatif | Registrasi company dengan nama perusahaan kosong | Melemparkan eksepsi (validasi didelegasikan) |

Sembilan skenario disusun pada modul *Auth*. Penanganan kredensial salah dan duplikasi *email* diharapkan menghasilkan eksepsi `HttpException` yang sesuai. Penyimpanan *password* dalam bentuk *hash* bcrypt turut diverifikasi pada jalur registrasi.

---

## 2. Work Order Module

Modul *Work Order* dirancang untuk menguji siklus hidup perintah kerja beserta transisi statusnya. Skenario disusun melingkupi pembuatan, penugasan staf, dan transisi melalui fungsi `start()`, `complete()`, `fail()`, serta `cancel()`. Validasi batas `minStaff` dan `maxStaff` pada penugasan ditetapkan sebagai bagian pengujian.

> Status WO aktual: `DRAFTED` → `APPROVED`/`SENT` → `ON_PROGRESS` → `COMPLETED`/`FAILED`, atau `CANCELLED`.

| No | ID Test | Nama Fungsi | Tipe Kasus | Skenario Pengujian | Hasil yang Diharapkan |
|---|---|---|---|---|---|
| 1 | UT-WO-001 | `create()` | Positif | Membuat work order baru dengan payload lengkap | Mengembalikan object work order baru dengan status awal `DRAFTED` |
| 2 | UT-WO-002 | `create()` | Negatif | Membuat work order oleh user tanpa company (field wajib tidak terpenuhi) | Melemparkan `ForbiddenException` |
| 3 | UT-WO-003 | `assignStaff()` | Positif | Menugaskan staff ke work order berstatus `DRAFTED` | Mengembalikan object work order dengan data staff (PIC & assigned) tertaut |
| 4 | UT-WO-004 | `assignStaff()` | Negatif | Menugaskan staff ke work order yang tidak ditemukan | Melemparkan `NotFoundException` |
| 5 | UT-WO-005 | `start()` | Positif | Memulai work order yang berstatus `APPROVED` | Mengembalikan object work order dengan status berubah menjadi `ON_PROGRESS` |
| 6 | UT-WO-006 | `start()` | Negatif | Memulai work order yang sudah `COMPLETED` | Melemparkan `UnprocessableEntityException` (transisi status tidak valid) |
| 7 | UT-WO-007 | `start()` | Negatif | Memulai work order yang belum disetujui (masih `DRAFTED`) | Melemparkan `UnprocessableEntityException` (status belum `APPROVED`) |
| 8 | UT-WO-008 | `complete()` | Positif | Menyelesaikan work order yang berstatus `ON_PROGRESS` | Mengembalikan object work order dengan status `COMPLETED` |
| 9 | UT-WO-009 | `complete()` | Negatif | Menyelesaikan work order yang bukan berstatus `ON_PROGRESS` | Melemparkan `UnprocessableEntityException` (transisi status tidak valid) |
| 10 | UT-WO-010 | `fail()` | Positif | Menandai work order gagal dari status `ON_PROGRESS` | Mengembalikan object work order dengan status `FAILED` |
| 11 | UT-WO-011 | `fail()` | Negatif | Menandai gagal pada work order yang sudah `COMPLETED` | Melemparkan `UnprocessableEntityException` |
| 12 | UT-WO-012 | `cancel()` | Positif | Membatalkan work order yang belum dimulai (`DRAFTED`) | Mengembalikan object work order dengan status `CANCELLED` |
| 13 | UT-WO-013 | `cancel()` | Negatif | Membatalkan work order yang sudah `ON_PROGRESS` | Melemparkan `UnprocessableEntityException` |
| 14 | UT-WO-014 | `updateStatus()` | Positif | Mengubah status work order sesuai alur transisi yang valid | Mengembalikan object work order dengan status terbaru |
| 15 | UT-WO-015 | `remove()` | Positif | Menghapus work order berdasarkan ID valid | Mengembalikan data WO beserta `deletedAt` (konfirmasi soft-delete) |
| 16 | UT-WO-016 | `remove()` | Negatif | Menghapus work order dengan ID yang tidak ditemukan | Melemparkan `NotFoundException` |
| 17 | UT-WO-017 | `findAllInternal()` | Positif | Mengambil seluruh work order milik company user | Mengembalikan array object work order beserta metadata |
| 18 | UT-WO-018 | `findOneInternal()` | Positif | Mengambil detail work order berdasarkan ID valid | Mengembalikan object tunggal work order dengan data lengkap |
| 19 | UT-WO-019 | `findOneInternal()` | Negatif | Mengambil detail work order dengan ID tidak ditemukan | Melemparkan `NotFoundException` |
| 20 | UT-WO-020 | `assignStaff()` | Negatif | Menugaskan staff melebihi batas maksimal (`maxStaff`) | Melemparkan `UnprocessableEntityException` (jumlah staf melebihi batas maksimal) |
| 21 | UT-WO-021 | `assignStaff()` | Negatif | Menugaskan staff kurang dari batas minimal (`minStaff`) | Melemparkan `UnprocessableEntityException` (jumlah staf kurang dari batas minimal) |
| 22 | UT-WO-022 | `validateAutoAssignForConfigs()` | Positif | Validasi ketersediaan staf saat jumlah mencukupi kebutuhan posisi | Selesai tanpa melemparkan eksepsi |
| 23 | UT-WO-023 | `validateAutoAssignForConfigs()` | Negatif | Validasi ketersediaan staf saat jumlah kurang dari minimal | Melemparkan `UnprocessableEntityException` |
| 24 | UT-WO-024 | `createInternal()` | Positif | Membuat work order internal non-auto (`manual`) | Mengembalikan WO status `DRAFTED` dan membuat *work report* otomatis |
| 25 | UT-WO-025 | `createInternal()` | Positif | Membuat work order internal auto-draft (`auto`) | Mengembalikan WO status `APPROVED` dengan staf yang ter-*assign* otomatis |
| 26 | UT-WO-026 | `update()` | Positif | Memperbarui data work order yang valid | Mengembalikan object work order dengan data terbaru |
| 27 | UT-WO-027 | `markAsSent()` | Positif | Mengirim work order `DRAFTED` dengan staf mencukupi | Mengembalikan WO status `APPROVED`/`SENT` |
| 28 | UT-WO-028 | `markAsSent()` | Negatif | Mengirim work order dengan staf kurang dari minimal | Melemparkan `BadRequestException` |
| 29 | UT-WO-029 | `autoCompleteByWorkReport()` | Positif | Menyelesaikan WO `ON_PROGRESS` otomatis setelah laporan disetujui | Mengembalikan WO status `COMPLETED` |

Dua puluh sembilan skenario disusun pada modul *Work Order*. Transisi status yang tidak valid diharapkan ditolak melalui pelemparan `UnprocessableEntityException`. Pembuatan WO internal, penugasan otomatis, pengiriman, serta penyelesaian otomatis turut dicakup dalam pengujian.

---

## 3. Service Request Module

Modul *Service Request* dirancang untuk menguji pengelolaan permintaan layanan dari klien. Skenario disusun mencakup *submit intake*, persetujuan, penolakan, penugasan staf, dan pembatalan melalui fungsi `submitIntake()`, `updateStatus()`, serta `assignStaff()`. Transisi status dari `RECEIVED` menuju `APPROVED`, `REJECTED`, atau `CANCELLED` ditetapkan sebagai fokus pengujian.

> Status SR aktual: `RECEIVED` → `APPROVED`/`REJECTED`/`CANCELLED` → `COMPLETED`/`CLOSED`.
> Aksi approve/reject/cancel diimplementasikan melalui method `updateStatus()`.

| No | ID Test | Nama Fungsi | Tipe Kasus | Skenario Pengujian | Hasil yang Diharapkan |
|---|---|---|---|---|---|
| 1 | UT-SR-001 | `submitIntake()` | Positif | Mensubmit form intake klien dengan field lengkap | Mengembalikan data service request baru terkait spesifik Service dan Company |
| 2 | UT-SR-002 | `submitIntake()` | Negatif | Mensubmit intake dengan referensi service tidak valid/field tidak valid | Melemparkan eksepsi validasi (`BadRequestException`) |
| 3 | UT-SR-003 | `submitIntake()` | Negatif | Mensubmit intake ke service yang tidak aktif/terhapus | Melemparkan `NotFoundException` (layanan tidak aktif) |
| 4 | UT-SR-004 | `updateStatus()` (approve) | Positif | Menyetujui request oleh company admin | Status request menjadi `APPROVED` dan men-trigger pembuatan WorkOrder otomatis |
| 5 | UT-SR-005 | `updateStatus()` (approve) | Negatif | Menyetujui request yang sudah berstatus `APPROVED` | Melemparkan `UnprocessableEntityException` (status bukan `RECEIVED`) |
| 6 | UT-SR-006 | `updateStatus()` (approve) | Negatif | Menyetujui request yang sudah di-`REJECTED` | Melemparkan `UnprocessableEntityException` (transisi status tidak valid) |
| 7 | UT-SR-007 | `updateStatus()` (reject) | Positif | Menolak request yang berstatus `RECEIVED` | Status request berubah menjadi `REJECTED` |
| 8 | UT-SR-008 | `updateStatus()` (reject) | Negatif | Menolak request yang sudah di-approve | Melemparkan `UnprocessableEntityException` |
| 9 | UT-SR-009 | `assignStaff()` | Positif | Menugaskan staff (PIC) ke service request yang sudah approved | Mengembalikan object request dengan data staff tertaut |
| 10 | UT-SR-010 | `assignStaff()` | Negatif | Menugaskan staff dengan email/user yang tidak ditemukan | Melemparkan `UnprocessableEntityException` (PIC tidak ditemukan) |
| 11 | UT-SR-011 | `updateStatus()` (cancel) | Positif | Membatalkan service request yang masih `RECEIVED` | Status request berubah menjadi `CANCELLED` |
| 12 | UT-SR-012 | `updateStatus()` (cancel) | Negatif | Membatalkan request yang sudah `APPROVED` | Melemparkan `UnprocessableEntityException` |
| 13 | UT-SR-013 | `findAllByCompanyId()` | Positif | Mengambil daftar request masuk untuk company admin | Mengembalikan array object service request beserta metadata |
| 14 | UT-SR-014 | `findAllByClientId()` | Positif | Mengambil daftar request yang dikirim oleh client | Mengembalikan array object service request milik user |
| 15 | UT-SR-015 | `getReportForRequester()` | Positif | Mengambil detail service request berdasarkan ID valid | Mengembalikan object tunggal dengan data relasi lengkap |
| 16 | UT-SR-016 | `getReportForRequester()` | Negatif | Mengambil detail dengan ID tidak ditemukan | Melemparkan `NotFoundException` |
| 17 | UT-SR-017 | `remove()` | Positif | Menghapus service request berdasarkan ID valid | Mengembalikan data SR beserta `deletedAt` (konfirmasi soft-delete) |
| 18 | UT-SR-018 | `remove()` | Negatif | Menghapus service request dengan ID tidak ditemukan | Melemparkan `NotFoundException` |

Delapan belas skenario disusun pada modul *Service Request*. Persetujuan permintaan yang memicu pembuatan *Work Order* diharapkan berjalan sesuai rancangan. Permintaan pada status yang tidak sesuai dipastikan ditolak melalui pelemparan eksepsi.

---

## 4. Membership Module

Modul *Membership* dirancang untuk menguji pengelolaan kode keanggotaan dan proses klaim oleh klien. Skenario disusun mencakup pengunggahan berkas *CSV*, klaim kode, dan penghapusan data melalui fungsi `importCsv()`, `claimCode()`, dan `remove()`. Validasi format berkas serta keunikan kode ditetapkan sebagai fokus pengujian.

| No | ID Test | Nama Fungsi | Tipe Kasus | Skenario Pengujian | Hasil yang Diharapkan |
|---|---|---|---|---|---|
| 1 | UT-MBRSH-001 | `importCsv()` | Positif | Mengunggah file CSV berformat valid berisi daftar kode | Mengembalikan array object code beserta eksternal account yang tersimpan |
| 2 | UT-MBRSH-002 | `importCsv()` | Negatif | Mengunggah file dengan ekstensi bukan CSV | Melemparkan `BadRequestException` |
| 3 | UT-MBRSH-003 | `importCsv()` | Negatif | Mengunggah CSV dengan struktur kolom tidak sesuai | Melemparkan `BadRequestException` |
| 4 | UT-MBRSH-004 | `importCsv()` | Negatif | Mengunggah CSV kosong tanpa baris data | Melemparkan `BadRequestException` |
| 5 | UT-MBRSH-005 | `claimCode()` | Positif | User klien melakukan klaim kode valid yang belum terpakai | Mengembalikan object hasil klaim, status kode berubah menjadi *used* |
| 6 | UT-MBRSH-006 | `claimCode()` | Negatif | Mengklaim kode yang sudah pernah diklaim user lain | Melemparkan eksepsi (kode sudah diklaim) |
| 7 | UT-MBRSH-007 | `claimCode()` | Negatif | Mengklaim kode yang tidak ditemukan di database | Melemparkan `NotFoundException` |
| 8 | UT-MBRSH-008 | `findAll()` | Positif | Mengambil seluruh daftar kode membership milik company | Mengembalikan array object code beserta metadata |
| 9 | UT-MBRSH-009 | `findAllSubscribedClients()` | Positif | Mengambil daftar client yang sudah berlangganan | Mengembalikan array object client yang terelasi dengan company |
| 10 | UT-MBRSH-010 | `remove()` | Positif | Menghapus kode membership berdasarkan ID valid | Mengembalikan status konfirmasi penghapusan |
| 11 | UT-MBRSH-011 | `remove()` | Negatif | Menghapus kode membership dengan ID tidak ditemukan | Melemparkan `NotFoundException` |

Sebelas skenario disusun pada modul *Membership*. Berkas *CSV* yang tidak valid diharapkan ditolak melalui pelemparan `BadRequestException`. Klaim terhadap kode yang sudah terpakai maupun tidak ditemukan dipastikan menghasilkan eksepsi yang sesuai.

---

## 5. Service Module (Layanan)

Modul *Service* dirancang untuk menguji pengelolaan layanan beserta mekanisme *versioning*. Skenario disusun mencakup pembaruan, pengambilan, pengaktifan, dan penghapusan melalui fungsi `updateById()`, `findAll()`, `findByVersionId()`, `toggleActive()`, dan `removeById()`. Pemeliharaan `serviceKey` dan `companyId` saat pembuatan versi baru ditetapkan sebagai fokus pengujian.

> Service menerapkan pola *versioning*: setiap pembaruan membuat versi baru dengan `serviceKey`
> dan `companyId` yang dipertahankan. Pembaruan service dilakukan melalui `updateById()`.

| No | ID Test | Nama Fungsi | Tipe Kasus | Skenario Pengujian | Hasil yang Diharapkan |
|---|---|---|---|---|---|
| 1 | UT-SVC-001 | `updateById()` | Positif | Memperbarui service dengan payload valid | Membuat versi baru service (nomor versi bertambah) |
| 2 | UT-SVC-002 | `updateById()` | Positif | Memperbarui service yang sudah memiliki beberapa versi | Nomor versi bertambah dengan benar dari versi terakhir |
| 3 | UT-SVC-003 | `updateById()` | Positif | Memperbarui service | Versi lama dipertahankan (tidak dimodifikasi), versi baru dibuat |
| 4 | UT-SVC-004 | `updateById()` | Positif | Memperbarui service | `serviceKey` dipertahankan pada versi baru |
| 5 | UT-SVC-005 | `updateById()` | Positif | Memperbarui service | `companyId` dipertahankan pada versi baru |
| 6 | UT-SVC-006 | `updateById()` | Negatif | Memperbarui service milik company berbeda | Melemparkan `NotFoundException` |
| 7 | UT-SVC-007 | `updateById()` | Negatif | Memperbarui service dengan ID tidak ditemukan | Melemparkan `NotFoundException` |
| 8 | UT-SVC-008 | `updateById()` | Positif | Memperbarui konfigurasi `workOrdersConfig`/`requiredStaffs` | Versi baru dengan konfigurasi yang diperbarui |
| 9 | UT-SVC-009 | `findAll()` | Positif | Mengambil seluruh service milik company | Mengembalikan array object service |
| 10 | UT-SVC-010 | `findAll()` | Negatif | Mengambil service oleh user tanpa company | Melemparkan `ForbiddenException` |
| 11 | UT-SVC-011 | `findByVersionId()` | Positif | Mengambil detail service versi tertentu berdasarkan ID | Mengembalikan object service dengan data lengkap |
| 12 | UT-SVC-012 | `findByVersionId()` | Negatif | Mengambil detail service dengan ID tidak ditemukan | Melemparkan `NotFoundException` |
| 13 | UT-SVC-013 | `toggleActive()` | Positif | Mengaktifkan/menonaktifkan service | Seluruh versi service dengan `serviceKey` sama diperbarui |
| 14 | UT-SVC-014 | `removeById()` | Positif | Menghapus service versi terbaru berdasarkan ID valid | Soft-delete seluruh versi, mengembalikan data beserta `deletedAt` |
| 15 | UT-SVC-015 | `removeById()` | Negatif | Menghapus service dengan ID tidak ditemukan | Melemparkan `NotFoundException` |

Lima belas skenario disusun pada modul *Service*. Mekanisme *versioning* diharapkan mempertahankan `serviceKey` dan `companyId` pada setiap versi baru. Operasi terhadap layanan milik *company* lain maupun *ID* yang tidak ditemukan dipastikan menghasilkan `NotFoundException`.

---

## 6. Invitations Module

Modul *Invitations* dirancang untuk menguji proses undangan keanggotaan perusahaan. Skenario disusun mencakup penerimaan, penolakan, pengambilan daftar *pending*, dan penghapusan melalui fungsi `acceptInvitation()`, `rejectInvitation()`, `findPendingForUser()`, dan `remove()`. Perubahan relasi pengguna terhadap perusahaan ditetapkan sebagai fokus pengujian.

| No | ID Test | Nama Fungsi | Tipe Kasus | Skenario Pengujian | Hasil yang Diharapkan |
|---|---|---|---|---|---|
| 1 | UT-INV-001 | `acceptInvitation()` | Positif | User menerima undangan valid untuk bergabung dengan company | Mengembalikan status relasi user terhadap company menjadi aktif |
| 2 | UT-INV-002 | `acceptInvitation()` | Negatif | Menerima undangan yang sudah pernah di-accept | Melemparkan `UnprocessableEntityException` |
| 3 | UT-INV-003 | `acceptInvitation()` | Negatif | Menerima undangan dengan ID tidak ditemukan | Melemparkan `NotFoundException` |
| 4 | UT-INV-004 | `rejectInvitation()` | Positif | User menolak undangan yang masih pending | Mengubah status undangan menjadi *rejected* tanpa mengubah relasi user |
| 5 | UT-INV-005 | `rejectInvitation()` | Negatif | Menolak undangan yang sudah di-accept sebelumnya | Melemparkan `UnprocessableEntityException` |
| 6 | UT-INV-006 | `findPendingForUser()` | Positif | Mengambil daftar undangan pending milik user | Mengembalikan array object undangan berstatus pending |
| 7 | UT-INV-007 | `remove()` | Positif | Menghapus undangan berdasarkan ID valid | Mengembalikan status konfirmasi penghapusan |
| 8 | UT-INV-008 | `remove()` | Negatif | Menghapus undangan dengan ID tidak ditemukan | Melemparkan `NotFoundException` |

Delapan skenario disusun pada modul *Invitations*. Undangan yang sudah diproses sebelumnya diharapkan ditolak melalui pelemparan `UnprocessableEntityException`. Undangan dengan *ID* yang tidak ditemukan dipastikan menghasilkan `NotFoundException`.

---

## 7. Notifications Module (FCM)

Modul *Notifications* dirancang untuk menguji pengiriman notifikasi *push* melalui *Firebase Cloud Messaging*. Skenario disusun mencakup pengiriman, manajemen *token*, penandaan dibaca, dan pengiriman langsung melalui fungsi `sendToUser()`, `registerToken()`, `markAsRead()`, serta `sendToDevice()`. Ketahanan proses terhadap kegagalan pengiriman ditetapkan sebagai fokus pengujian.

| No | ID Test | Nama Fungsi | Tipe Kasus | Skenario Pengujian | Hasil yang Diharapkan |
|---|---|---|---|---|---|
| 1 | UT-NOTIF-001 | `sendToUser()` | Positif | Mengirim notifikasi push dengan token FCM valid | Memanggil FCM dispatcher internal dan mengembalikan respons antrean berhasil |
| 2 | UT-NOTIF-002 | `sendToUser()` | Negatif | Mengirim notifikasi dengan token FCM invalid/expired | Menangani kegagalan token (fallback *direct send*), tidak menghentikan proses |
| 3 | UT-NOTIF-003 | `sendToUser()` | Negatif | Mengirim notifikasi tanpa body/title | Tetap membuat record notifikasi (tidak melemparkan eksepsi fatal) |
| 4 | UT-NOTIF-004 | `registerToken()` | Positif | Mendaftarkan token FCM baru untuk user | Token ditambahkan ke profil user (`$addToSet`) |
| 5 | UT-NOTIF-005 | `removeToken()` | Positif | Menghapus token FCM dari seluruh profil | Token ditarik dari seluruh profil user (`$pull`) |
| 6 | UT-NOTIF-006 | `markAsRead()` | Positif | Menandai notifikasi dibaca dengan ID valid | Record notifikasi diperbarui menjadi `isRead = true` |
| 7 | UT-NOTIF-007 | `markAsRead()` | Negatif | Menandai notifikasi dibaca dengan ID tidak valid | Dilewati tanpa melakukan update (tidak melemparkan eksepsi) |
| 8 | UT-NOTIF-008 | `markAsReadByResource()` | Positif | Menandai dibaca berdasarkan resource & resourceId | Memanggil `updateMany` untuk notifikasi terkait |
| 9 | UT-NOTIF-009 | `markAsReadByType()` | Positif | Menandai dibaca berdasarkan tipe resource | Memanggil `updateMany` untuk seluruh notifikasi bertipe tersebut |
| 10 | UT-NOTIF-010 | `getInbox()` | Positif | Mengambil daftar notifikasi (inbox) milik user | Mengembalikan array notifikasi |
| 11 | UT-NOTIF-011 | `sendFcmDirect()` | Negatif | Pengiriman langsung saat user tidak memiliki token | Tidak mengirim ke device (proses dilewati) |
| 12 | UT-NOTIF-012 | `sendFcmDirect()` | Positif | Pengiriman langsung saat user memiliki token | Mengirim ke seluruh device milik user |
| 13 | UT-NOTIF-013 | `sendToDevice()` | Negatif | Mengirim ke device saat Firebase belum diinisialisasi | Dilewati dengan aman tanpa memanggil Firebase |
| 14 | UT-NOTIF-014 | `sendToDevice()` | Positif | Mengirim ke device dengan token valid | Memanggil `messaging().send` pada Firebase |
| 15 | UT-NOTIF-015 | `sendToMultipleDevices()` | Positif | Mengirim notifikasi multicast ke banyak device | Memanggil `sendEachForMulticast` pada Firebase |
| 16 | UT-NOTIF-016 | `sendToMultipleDevices()` | Negatif | Multicast dengan sebagian token gagal | Membersihkan token invalid dari basis data |

Enam belas skenario disusun pada modul *Notifications*. Kegagalan *token* diharapkan ditangani melalui mekanisme *fallback* tanpa menghentikan proses. Manajemen *token* dan penandaan notifikasi dibaca turut dicakup dalam pengujian.

---

## 8. Form Validation Module (Number Field)

Modul *Form Validation* dirancang untuk menguji validasi nilai *field* pada *submission* formulir. Skenario disusun mencakup *field* bertipe *number*, *single_select*, *multi_select*, dan *field* wajib melalui fungsi `validateFormSubmission()`. Penegakan batas `min`/`max` serta keabsahan *key* pilihan ditetapkan sebagai fokus pengujian.

> Validasi nilai pada field bertipe `number` saat submission formulir (intake, work order, report)
> terhadap batas `min`/`max` yang dikonfigurasi pada template field.

| No | ID Test | Nama Fungsi | Tipe Kasus | Skenario Pengujian | Hasil yang Diharapkan |
|---|---|---|---|---|---|
| 1 | UT-FORM-001 | `validateFormSubmission()` | Positif | Mengirim nilai number di dalam rentang `min`–`max` | Validasi lolos tanpa melemparkan eksepsi |
| 2 | UT-FORM-002 | `validateFormSubmission()` | Negatif | Mengirim nilai number melebihi batas `max` | Melemparkan `UnprocessableEntityException` |
| 3 | UT-FORM-003 | `validateFormSubmission()` | Negatif | Mengirim nilai number di bawah batas `min` | Melemparkan `UnprocessableEntityException` |
| 4 | UT-FORM-004 | `validateFormSubmission()` | Negatif | Mengirim nilai bukan angka (non-numeric) pada field number | Melemparkan `UnprocessableEntityException` |
| 5 | UT-FORM-005 | `validateFormSubmission()` | Positif | Mengirim `single_select` dengan key valid | Validasi lolos tanpa melemparkan eksepsi |
| 6 | UT-FORM-006 | `validateFormSubmission()` | Negatif | Mengirim `single_select` dengan key tidak valid | Melemparkan `UnprocessableEntityException` |
| 7 | UT-FORM-007 | `validateFormSubmission()` | Positif | Mengirim `multi_select` dengan seluruh key valid | Validasi lolos tanpa melemparkan eksepsi |
| 8 | UT-FORM-008 | `validateFormSubmission()` | Negatif | Mengirim `multi_select` dengan key tidak valid | Melemparkan `UnprocessableEntityException` |
| 9 | UT-FORM-009 | `validateFormSubmission()` | Negatif | Mengirim `multi_select` dengan nilai bukan array | Melemparkan `UnprocessableEntityException` |
| 10 | UT-FORM-010 | `validateFormSubmission()` | Negatif | Mengirim form tanpa mengisi field wajib (`required`) | Melemparkan `UnprocessableEntityException` |

Sepuluh skenario disusun pada modul *Form Validation*. Nilai di luar batas, *key* tidak valid, dan *field* wajib yang kosong diharapkan ditolak melalui pelemparan `UnprocessableEntityException`. Masukan non-numerik pada *field* angka dipastikan menghasilkan eksepsi yang sesuai.

---

**Total: 116 skenario unit test — seluruhnya LULUS (116/116, 100%).**

| Modul | Jumlah Skenario |
|---|:---:|
| Auth | 9 |
| Work Order | 29 |
| Service Request | 18 |
| Membership | 11 |
| Service (Layanan) | 15 |
| Invitations | 8 |
| Notifications (FCM) | 16 |
| Form Validation | 10 |
| **TOTAL** | **116** |
