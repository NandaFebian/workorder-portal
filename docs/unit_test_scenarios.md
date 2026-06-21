# Skenario Unit Testing — Prioritas Utama & Menengah

---

## 1. Auth Module

| No | ID Test | Nama Fungsi | Tipe Kasus | Skenario Pengujian | Hasil yang Diharapkan |
|---|---|---|---|---|---|
| 1 | UT-AUTH-001 | `login()` | Positif | Login dengan kredensial email & password valid | Mengembalikan object profil dan access token (JWT) |
| 2 | UT-AUTH-002 | `login()` | Negatif | Login dengan password salah | Melemparkan eksepsi `UnauthorizedError` |
| 3 | UT-AUTH-003 | `login()` | Negatif | Login dengan email yang tidak terdaftar | Melemparkan eksepsi `UnauthorizedError` |
| 4 | UT-AUTH-004 | `register()` | Positif | Registrasi user baru dengan payload valid | Mengembalikan data user baru, password tersimpan dalam bentuk hash bcrypt |
| 5 | UT-AUTH-005 | `register()` | Negatif | Registrasi dengan email yang sudah terdaftar | Melemparkan eksepsi `ConflictError` dengan pesan duplikasi email |
| 6 | UT-AUTH-006 | `register()` | Negatif | Registrasi dengan payload tidak lengkap (nama kosong, email salah format) | Melemparkan eksepsi `ValidationError` dengan detail field error |
| 7 | UT-AUTH-007 | `registerCompany()` | Positif | Registrasi perusahaan baru beserta owner sekaligus | Mengembalikan record User dan Company yang saling terelasi via `ownerId` |
| 8 | UT-AUTH-008 | `registerCompany()` | Negatif | Registrasi company dengan email owner yang sudah terdaftar | Melemparkan eksepsi `ConflictError` |
| 9 | UT-AUTH-009 | `registerCompany()` | Negatif | Registrasi company dengan nama perusahaan kosong | Melemparkan eksepsi `ValidationError` |

---

## 2. Work Order Module

| No | ID Test | Nama Fungsi | Tipe Kasus | Skenario Pengujian | Hasil yang Diharapkan |
|---|---|---|---|---|---|
| 1 | UT-WO-001 | `create()` | Positif | Membuat work order baru dengan payload lengkap | Mengembalikan object work order baru dengan status awal `PENDING` |
| 2 | UT-WO-002 | `create()` | Negatif | Membuat work order tanpa field wajib | Melemparkan eksepsi `ValidationError` |
| 3 | UT-WO-003 | `assignStaff()` | Positif | Menugaskan staff ke work order yang berstatus `PENDING` | Mengembalikan object work order dengan status `ASSIGNED` dan data staff tertaut |
| 4 | UT-WO-004 | `assignStaff()` | Negatif | Menugaskan staff dengan user ID yang tidak valid | Melemparkan eksepsi `NotFoundError` |
| 5 | UT-WO-005 | `start()` | Positif | Memulai work order yang berstatus `ASSIGNED` | Mengembalikan object work order dengan status berubah menjadi `IN_PROGRESS` |
| 6 | UT-WO-006 | `start()` | Negatif | Memulai work order yang sudah `COMPLETED` | Melemparkan eksepsi `ConflictError` karena transisi status tidak valid |
| 7 | UT-WO-007 | `start()` | Negatif | Memulai work order yang belum di-assign staff | Melemparkan eksepsi `ConflictError` karena status masih `PENDING` |
| 8 | UT-WO-008 | `complete()` | Positif | Menyelesaikan work order yang berstatus `IN_PROGRESS` | Mengembalikan object work order dengan status `COMPLETED` |
| 9 | UT-WO-009 | `complete()` | Negatif | Menyelesaikan work order yang bukan berstatus `IN_PROGRESS` | Melemparkan eksepsi `ConflictError` karena transisi status tidak valid |
| 10 | UT-WO-010 | `fail()` | Positif | Menandai work order gagal dari status `IN_PROGRESS` | Mengembalikan object work order dengan status `FAILED` |
| 11 | UT-WO-011 | `fail()` | Negatif | Menandai gagal pada work order yang sudah `COMPLETED` | Melemparkan eksepsi `ConflictError` |
| 12 | UT-WO-012 | `cancel()` | Positif | Membatalkan work order yang belum dimulai (`PENDING`/`ASSIGNED`) | Mengembalikan object work order dengan status `CANCELLED` |
| 13 | UT-WO-013 | `cancel()` | Negatif | Membatalkan work order yang sudah `IN_PROGRESS` atau `COMPLETED` | Melemparkan eksepsi `ConflictError` |
| 14 | UT-WO-014 | `updateStatus()` | Positif | Mengubah status work order sesuai alur transisi yang valid | Mengembalikan object work order dengan status terbaru |
| 15 | UT-WO-015 | `remove()` | Positif | Menghapus work order berdasarkan ID valid | Mengembalikan status konfirmasi penghapusan data |
| 16 | UT-WO-016 | `remove()` | Negatif | Menghapus work order dengan ID yang tidak ditemukan | Melemparkan eksepsi `NotFoundError` |
| 17 | UT-WO-017 | `findAll()` | Positif | Mengambil seluruh work order milik company user | Mengembalikan array object work order beserta metadata |
| 18 | UT-WO-018 | `findOne()` | Positif | Mengambil detail work order berdasarkan ID valid | Mengembalikan object tunggal work order dengan data lengkap |
| 19 | UT-WO-019 | `findOne()` | Negatif | Mengambil detail work order dengan ID tidak ditemukan | Melemparkan eksepsi `NotFoundError` |

---

## 3. Service Request Module

| No | ID Test | Nama Fungsi | Tipe Kasus | Skenario Pengujian | Hasil yang Diharapkan |
|---|---|---|---|---|---|
| 1 | UT-SR-001 | `submitIntake()` | Positif | Mensubmit form intake klien dengan field lengkap | Mengembalikan data service request baru terkait spesifik Service dan Company |
| 2 | UT-SR-002 | `submitIntake()` | Negatif | Mensubmit form intake dengan field wajib kosong | Melemparkan eksepsi `ValidationError` dengan detail field error |
| 3 | UT-SR-003 | `submitIntake()` | Negatif | Mensubmit intake ke service yang tidak aktif | Melemparkan eksepsi `BadRequestError` |
| 4 | UT-SR-004 | `approve()` | Positif | Menyetujui request oleh company admin | Status request menjadi `APPROVED` dan men-trigger pembuatan WorkOrder otomatis |
| 5 | UT-SR-005 | `approve()` | Negatif | Menyetujui request yang sudah berstatus `APPROVED` | Melemparkan eksepsi `ConflictError` karena sudah disetujui sebelumnya |
| 6 | UT-SR-006 | `approve()` | Negatif | Menyetujui request yang sudah di-`REJECTED` | Melemparkan eksepsi `ConflictError` karena transisi status tidak valid |
| 7 | UT-SR-007 | `reject()` | Positif | Menolak request yang berstatus `PENDING` | Status request berubah menjadi `REJECTED` |
| 8 | UT-SR-008 | `reject()` | Negatif | Menolak request yang sudah di-approve | Melemparkan eksepsi `ConflictError` |
| 9 | UT-SR-009 | `assignStaff()` | Positif | Menugaskan staff ke service request yang sudah approved | Mengembalikan object request dengan data staff tertaut |
| 10 | UT-SR-010 | `assignStaff()` | Negatif | Menugaskan staff dengan user ID tidak valid | Melemparkan eksepsi `NotFoundError` |
| 11 | UT-SR-011 | `cancelSr()` | Positif | Membatalkan service request yang masih `PENDING` | Status request berubah menjadi `CANCELLED` |
| 12 | UT-SR-012 | `cancelSr()` | Negatif | Membatalkan request yang sudah `APPROVED` | Melemparkan eksepsi `ConflictError` |
| 13 | UT-SR-013 | `getInbox()` | Positif | Mengambil daftar request masuk untuk company admin | Mengembalikan array object service request beserta metadata |
| 14 | UT-SR-014 | `getSent()` | Positif | Mengambil daftar request yang dikirim oleh client | Mengembalikan array object service request milik user |
| 15 | UT-SR-015 | `getDetailSr()` | Positif | Mengambil detail service request berdasarkan ID valid | Mengembalikan object tunggal dengan data relasi lengkap |
| 16 | UT-SR-016 | `getDetailSr()` | Negatif | Mengambil detail dengan ID tidak ditemukan | Melemparkan eksepsi `NotFoundError` |
| 17 | UT-SR-017 | `remove()` | Positif | Menghapus service request berdasarkan ID valid | Mengembalikan status konfirmasi penghapusan |
| 18 | UT-SR-018 | `remove()` | Negatif | Menghapus service request dengan ID tidak ditemukan | Melemparkan eksepsi `NotFoundError` |

---

## 4. Membership Module

| No | ID Test | Nama Fungsi | Tipe Kasus | Skenario Pengujian | Hasil yang Diharapkan |
|---|---|---|---|---|---|
| 1 | UT-MBRSH-001 | `importCsv()` | Positif | Mengunggah file CSV berformat valid berisi daftar kode | Mengembalikan array object code beserta eksternal account yang tersimpan |
| 2 | UT-MBRSH-002 | `importCsv()` | Negatif | Mengunggah file dengan ekstensi bukan CSV | Melemparkan eksepsi `ValidationError` |
| 3 | UT-MBRSH-003 | `importCsv()` | Negatif | Mengunggah CSV dengan struktur kolom tidak sesuai | Melemparkan eksepsi `ValidationError` dengan detail kolom yang salah |
| 4 | UT-MBRSH-004 | `importCsv()` | Negatif | Mengunggah CSV kosong tanpa baris data | Melemparkan eksepsi `ValidationError` |
| 5 | UT-MBRSH-005 | `claimCode()` | Positif | User klien melakukan klaim kode valid yang belum terpakai | Mengembalikan object hasil klaim, status kode berubah menjadi used |
| 6 | UT-MBRSH-006 | `claimCode()` | Negatif | Mengklaim kode yang sudah pernah diklaim user lain | Melemparkan eksepsi `ConflictError` |
| 7 | UT-MBRSH-007 | `claimCode()` | Negatif | Mengklaim kode yang tidak ditemukan di database | Melemparkan eksepsi `NotFoundError` |
| 8 | UT-MBRSH-008 | `findAll()` | Positif | Mengambil seluruh daftar kode membership milik company | Mengembalikan array object code beserta metadata |
| 9 | UT-MBRSH-009 | `findAllSubscribedClients()` | Positif | Mengambil daftar client yang sudah berlangganan | Mengembalikan array object client yang terelasi dengan company |
| 10 | UT-MBRSH-010 | `remove()` | Positif | Menghapus kode membership berdasarkan ID valid | Mengembalikan status konfirmasi penghapusan |
| 11 | UT-MBRSH-011 | `remove()` | Negatif | Menghapus kode membership dengan ID tidak ditemukan | Melemparkan eksepsi `NotFoundError` |

---

## 5. Service Price Module

| No | ID Test | Nama Fungsi | Tipe Kasus | Skenario Pengujian | Hasil yang Diharapkan |
|---|---|---|---|---|---|
| 1 | UT-SP-001 | `create()` | Positif | Membuat variasi harga layanan dengan payload valid | Mengembalikan object record harga layanan yang aktif |
| 2 | UT-SP-002 | `create()` | Negatif | Membuat harga dengan field wajib kosong | Melemparkan eksepsi `ValidationError` |
| 3 | UT-SP-003 | `create()` | Negatif | Membuat harga duplikat untuk service yang sama | Melemparkan eksepsi `ConflictError` |
| 4 | UT-SP-004 | `update()` | Positif | Memperbarui nominal harga layanan berdasarkan ID valid | Mengembalikan object record harga yang telah diperbarui |
| 5 | UT-SP-005 | `update()` | Negatif | Memperbarui harga dengan ID tidak ditemukan | Melemparkan eksepsi `NotFoundError` |
| 6 | UT-SP-006 | `findAll()` | Positif | Mengambil seluruh daftar harga layanan milik company | Mengembalikan array object harga layanan |
| 7 | UT-SP-007 | `remove()` | Positif | Menghapus harga layanan berdasarkan ID valid | Mengembalikan status konfirmasi penghapusan |
| 8 | UT-SP-008 | `remove()` | Negatif | Menghapus harga dengan ID tidak ditemukan | Melemparkan eksepsi `NotFoundError` |

---

## 6. Invitations Module

| No | ID Test | Nama Fungsi | Tipe Kasus | Skenario Pengujian | Hasil yang Diharapkan |
|---|---|---|---|---|---|
| 1 | UT-INV-001 | `acceptInvitation()` | Positif | User menerima undangan valid untuk bergabung dengan company | Mengembalikan status relasi user terhadap company menjadi aktif |
| 2 | UT-INV-002 | `acceptInvitation()` | Negatif | Menerima undangan yang sudah pernah di-accept | Melemparkan eksepsi `ConflictError` |
| 3 | UT-INV-003 | `acceptInvitation()` | Negatif | Menerima undangan dengan ID tidak ditemukan | Melemparkan eksepsi `NotFoundError` |
| 4 | UT-INV-004 | `rejectInvitation()` | Positif | User menolak undangan yang masih pending | Mengubah status undangan menjadi rejected tanpa mengubah relasi user |
| 5 | UT-INV-005 | `rejectInvitation()` | Negatif | Menolak undangan yang sudah di-accept sebelumnya | Melemparkan eksepsi `ConflictError` |
| 6 | UT-INV-006 | `getMyPendingInvitations()` | Positif | Mengambil daftar undangan pending milik user | Mengembalikan array object undangan berstatus pending |
| 7 | UT-INV-007 | `remove()` | Positif | Menghapus undangan berdasarkan ID valid | Mengembalikan status konfirmasi penghapusan |
| 8 | UT-INV-008 | `remove()` | Negatif | Menghapus undangan dengan ID tidak ditemukan | Melemparkan eksepsi `NotFoundError` |

---

## 7. Notifications Module (FCM)

| No | ID Test | Nama Fungsi | Tipe Kasus | Skenario Pengujian | Hasil yang Diharapkan |
|---|---|---|---|---|---|
| 1 | UT-NOTIF-001 | `sendNotification()` | Positif | Mengirim notifikasi push dengan token FCM valid | Memanggil FCM dispatcher internal dan mengembalikan respons antrean berhasil |
| 2 | UT-NOTIF-002 | `sendNotification()` | Negatif | Mengirim notifikasi dengan token FCM invalid/expired | Melemparkan eksepsi `BadRequestError` atau mengembalikan status gagal kirim |
| 3 | UT-NOTIF-003 | `sendNotification()` | Negatif | Mengirim notifikasi tanpa body/title | Melemparkan eksepsi `ValidationError` |

---

**Total: 76 skenario unit test**
