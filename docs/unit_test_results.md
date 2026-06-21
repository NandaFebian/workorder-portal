# Hasil Unit Testing — Prioritas Utama & Menengah

---

## 1. Auth Module

Pengujian terhadap modul Auth dilakukan secara terisolasi dengan memanfaatkan mock pada layer repository dan service enkripsi password. Seluruh fungsi autentikasi diuji meliputi alur login, registrasi user individu, serta registrasi perusahaan beserta akun owner-nya. Validasi terhadap penanganan kredensial tidak valid, duplikasi email, dan kelengkapan payload telah dipastikan berjalan sesuai spesifikasi. Mekanisme hashing password menggunakan bcrypt juga diverifikasi untuk memastikan data sensitif tidak tersimpan dalam bentuk plaintext.

| No | ID Test | Nama Fungsi | Skenario Pengujian | Hasil Diharapkan | Hasil Aktual | Status |
|---|---|---|---|---|---|---|
| 1 | UT-AUTH-001 | `login()` | Login dengan kredensial email & password valid | Mengembalikan object profil dan access token (JWT) | Object profil dan access token JWT berhasil dikembalikan | PASS |
| 2 | UT-AUTH-002 | `login()` | Login dengan password salah | Melemparkan eksepsi `UnauthorizedError` | Eksepsi `UnauthorizedError` berhasil dilemparkan | PASS |
| 3 | UT-AUTH-003 | `login()` | Login dengan email yang tidak terdaftar | Melemparkan eksepsi `UnauthorizedError` | Eksepsi `UnauthorizedError` berhasil dilemparkan | PASS |
| 4 | UT-AUTH-004 | `register()` | Registrasi user baru dengan payload valid | Mengembalikan data user baru, password tersimpan dalam bentuk hash bcrypt | Data user baru dikembalikan dengan password ter-hash bcrypt | PASS |
| 5 | UT-AUTH-005 | `register()` | Registrasi dengan email yang sudah terdaftar | Melemparkan eksepsi `ConflictError` dengan pesan duplikasi email | Eksepsi `ConflictError` dengan pesan duplikasi email berhasil dilemparkan | PASS |
| 6 | UT-AUTH-006 | `register()` | Registrasi dengan payload tidak lengkap (nama kosong, email salah format) | Melemparkan eksepsi `ValidationError` dengan detail field error | Eksepsi `ValidationError` beserta detail field error berhasil dilemparkan | PASS |
| 7 | UT-AUTH-007 | `registerCompany()` | Registrasi perusahaan baru beserta owner sekaligus | Mengembalikan record User dan Company yang saling terelasi via `ownerId` | Record User dan Company terelasi via `ownerId` berhasil dikembalikan | PASS |
| 8 | UT-AUTH-008 | `registerCompany()` | Registrasi company dengan email owner yang sudah terdaftar | Melemparkan eksepsi `ConflictError` | Eksepsi `ConflictError` berhasil dilemparkan | PASS |
| 9 | UT-AUTH-009 | `registerCompany()` | Registrasi company dengan nama perusahaan kosong | Melemparkan eksepsi `ValidationError` | Eksepsi `ValidationError` berhasil dilemparkan | PASS |

Seluruh 9 skenario pengujian pada modul Auth telah dieksekusi dan menghasilkan status PASS secara keseluruhan. Mekanisme autentikasi berbasis JWT, validasi duplikasi email pada proses registrasi, serta penanganan payload tidak lengkap telah terkonfirmasi berfungsi sesuai ekspektasi. Proses hashing password dengan bcrypt juga terverifikasi menyimpan data kredensial dalam format terenkripsi pada layer persistence.

---

## 2. Work Order Module

Pengujian terhadap modul Work Order difokuskan pada validasi state machine yang mengatur transisi status sepanjang siklus hidup work order. Seluruh fungsi mulai dari pembuatan, penugasan staff, eksekusi, penyelesaian, kegagalan, hingga pembatalan diuji secara terisolasi menggunakan mock repository. Skenario negatif ditekankan pada penanganan transisi status yang tidak diizinkan untuk memastikan integritas alur kerja terjaga. Operasi CRUD dasar seperti pengambilan data dan penghapusan record juga divalidasi terhadap penanganan ID yang tidak ditemukan.

| No | ID Test | Nama Fungsi | Skenario Pengujian | Hasil Diharapkan | Hasil Aktual | Status |
|---|---|---|---|---|---|---|
| 1 | UT-WO-001 | `create()` | Membuat work order baru dengan payload lengkap | Mengembalikan object work order baru dengan status awal `PENDING` | Object work order baru dengan status `PENDING` berhasil dikembalikan | PASS |
| 2 | UT-WO-002 | `create()` | Membuat work order tanpa field wajib | Melemparkan eksepsi `ValidationError` | Eksepsi `ValidationError` berhasil dilemparkan | PASS |
| 3 | UT-WO-003 | `assignStaff()` | Menugaskan staff ke work order yang berstatus `PENDING` | Mengembalikan object work order dengan status `ASSIGNED` dan data staff tertaut | Object work order dengan status `ASSIGNED` dan data staff berhasil dikembalikan | PASS |
| 4 | UT-WO-004 | `assignStaff()` | Menugaskan staff dengan user ID yang tidak valid | Melemparkan eksepsi `NotFoundError` | Eksepsi `NotFoundError` berhasil dilemparkan | PASS |
| 5 | UT-WO-005 | `start()` | Memulai work order yang berstatus `ASSIGNED` | Mengembalikan object work order dengan status berubah menjadi `IN_PROGRESS` | Object work order dengan status `IN_PROGRESS` berhasil dikembalikan | PASS |
| 6 | UT-WO-006 | `start()` | Memulai work order yang sudah `COMPLETED` | Melemparkan eksepsi `ConflictError` karena transisi status tidak valid | Eksepsi `ConflictError` untuk transisi status tidak valid berhasil dilemparkan | PASS |
| 7 | UT-WO-007 | `start()` | Memulai work order yang belum di-assign staff | Melemparkan eksepsi `ConflictError` karena status masih `PENDING` | Eksepsi `ConflictError` karena status `PENDING` berhasil dilemparkan | PASS |
| 8 | UT-WO-008 | `complete()` | Menyelesaikan work order yang berstatus `IN_PROGRESS` | Mengembalikan object work order dengan status `COMPLETED` | Object work order dengan status `COMPLETED` berhasil dikembalikan | PASS |
| 9 | UT-WO-009 | `complete()` | Menyelesaikan work order yang bukan berstatus `IN_PROGRESS` | Melemparkan eksepsi `ConflictError` karena transisi status tidak valid | Eksepsi `ConflictError` untuk transisi status tidak valid berhasil dilemparkan | PASS |
| 10 | UT-WO-010 | `fail()` | Menandai work order gagal dari status `IN_PROGRESS` | Mengembalikan object work order dengan status `FAILED` | Object work order dengan status `FAILED` berhasil dikembalikan | PASS |
| 11 | UT-WO-011 | `fail()` | Menandai gagal pada work order yang sudah `COMPLETED` | Melemparkan eksepsi `ConflictError` | Eksepsi `ConflictError` berhasil dilemparkan | PASS |
| 12 | UT-WO-012 | `cancel()` | Membatalkan work order yang belum dimulai (`PENDING`/`ASSIGNED`) | Mengembalikan object work order dengan status `CANCELLED` | Object work order dengan status `CANCELLED` berhasil dikembalikan | PASS |
| 13 | UT-WO-013 | `cancel()` | Membatalkan work order yang sudah `IN_PROGRESS` atau `COMPLETED` | Melemparkan eksepsi `ConflictError` | Eksepsi `ConflictError` berhasil dilemparkan | PASS |
| 14 | UT-WO-014 | `updateStatus()` | Mengubah status work order sesuai alur transisi yang valid | Mengembalikan object work order dengan status terbaru | Object work order dengan status terbaru berhasil dikembalikan | PASS |
| 15 | UT-WO-015 | `remove()` | Menghapus work order berdasarkan ID valid | Mengembalikan status konfirmasi penghapusan data | Status konfirmasi penghapusan data berhasil dikembalikan | PASS |
| 16 | UT-WO-016 | `remove()` | Menghapus work order dengan ID yang tidak ditemukan | Melemparkan eksepsi `NotFoundError` | Eksepsi `NotFoundError` berhasil dilemparkan | PASS |
| 17 | UT-WO-017 | `findAll()` | Mengambil seluruh work order milik company user | Mengembalikan array object work order beserta metadata | Array object work order beserta metadata berhasil dikembalikan | PASS |
| 18 | UT-WO-018 | `findOne()` | Mengambil detail work order berdasarkan ID valid | Mengembalikan object tunggal work order dengan data lengkap | Object tunggal work order dengan data lengkap berhasil dikembalikan | PASS |
| 19 | UT-WO-019 | `findOne()` | Mengambil detail work order dengan ID tidak ditemukan | Melemparkan eksepsi `NotFoundError` | Eksepsi `NotFoundError` berhasil dilemparkan | PASS |

Seluruh 19 skenario pengujian pada modul Work Order telah dieksekusi dan menghasilkan status PASS tanpa kegagalan. Validasi state machine untuk transisi status dari `PENDING` hingga `COMPLETED`, `FAILED`, dan `CANCELLED` telah terkonfirmasi berjalan sesuai aturan bisnis yang ditetapkan. Penanganan terhadap upaya transisi status yang tidak valid dipastikan menghasilkan eksepsi `ConflictError` secara konsisten pada seluruh kasus uji negatif.

---

## 3. Service Request Module

Pengujian terhadap modul Service Request mencakup seluruh siklus hidup permintaan layanan mulai dari submit intake oleh klien hingga persetujuan, penolakan, dan pembatalan oleh admin perusahaan. Mekanisme penugasan staff ke request yang telah disetujui diuji secara terisolasi menggunakan mock data pada layer service dan repository. Validasi terhadap pengambilan data inbox, daftar terkirim, serta detail request individual telah dipastikan mengembalikan respons sesuai konteks otentikasi pengguna. Penanganan operasi penghapusan terhadap ID yang tidak valid juga diverifikasi menghasilkan eksepsi yang tepat.

| No | ID Test | Nama Fungsi | Skenario Pengujian | Hasil Diharapkan | Hasil Aktual | Status |
|---|---|---|---|---|---|---|
| 1 | UT-SR-001 | `submitIntake()` | Mensubmit form intake klien dengan field lengkap | Mengembalikan data service request baru terkait spesifik Service dan Company | Data service request baru terkait Service dan Company berhasil dikembalikan | PASS |
| 2 | UT-SR-002 | `submitIntake()` | Mensubmit form intake dengan field wajib kosong | Melemparkan eksepsi `ValidationError` dengan detail field error | Eksepsi `ValidationError` beserta detail field error berhasil dilemparkan | PASS |
| 3 | UT-SR-003 | `submitIntake()` | Mensubmit intake ke service yang tidak aktif | Melemparkan eksepsi `BadRequestError` | Eksepsi `BadRequestError` berhasil dilemparkan | PASS |
| 4 | UT-SR-004 | `approve()` | Menyetujui request oleh company admin | Status request menjadi `APPROVED` dan men-trigger pembuatan WorkOrder otomatis | Status `APPROVED` dan pembuatan WorkOrder otomatis berhasil di-trigger | PASS |
| 5 | UT-SR-005 | `approve()` | Menyetujui request yang sudah berstatus `APPROVED` | Melemparkan eksepsi `ConflictError` karena sudah disetujui sebelumnya | Eksepsi `ConflictError` karena duplikasi approval berhasil dilemparkan | PASS |
| 6 | UT-SR-006 | `approve()` | Menyetujui request yang sudah di-`REJECTED` | Melemparkan eksepsi `ConflictError` karena transisi status tidak valid | Eksepsi `ConflictError` untuk transisi dari `REJECTED` berhasil dilemparkan | PASS |
| 7 | UT-SR-007 | `reject()` | Menolak request yang berstatus `PENDING` | Status request berubah menjadi `REJECTED` | Status request berhasil diubah menjadi `REJECTED` | PASS |
| 8 | UT-SR-008 | `reject()` | Menolak request yang sudah di-approve | Melemparkan eksepsi `ConflictError` | Eksepsi `ConflictError` berhasil dilemparkan | PASS |
| 9 | UT-SR-009 | `assignStaff()` | Menugaskan staff ke service request yang sudah approved | Mengembalikan object request dengan data staff tertaut | Object request dengan data staff tertaut berhasil dikembalikan | PASS |
| 10 | UT-SR-010 | `assignStaff()` | Menugaskan staff dengan user ID tidak valid | Melemparkan eksepsi `NotFoundError` | Eksepsi `NotFoundError` berhasil dilemparkan | PASS |
| 11 | UT-SR-011 | `cancelSr()` | Membatalkan service request yang masih `PENDING` | Status request berubah menjadi `CANCELLED` | Status request berhasil diubah menjadi `CANCELLED` | PASS |
| 12 | UT-SR-012 | `cancelSr()` | Membatalkan request yang sudah `APPROVED` | Melemparkan eksepsi `ConflictError` | Eksepsi `ConflictError` berhasil dilemparkan | PASS |
| 13 | UT-SR-013 | `getInbox()` | Mengambil daftar request masuk untuk company admin | Mengembalikan array object service request beserta metadata | Array object service request beserta metadata berhasil dikembalikan | PASS |
| 14 | UT-SR-014 | `getSent()` | Mengambil daftar request yang dikirim oleh client | Mengembalikan array object service request milik user | Array object service request milik user berhasil dikembalikan | PASS |
| 15 | UT-SR-015 | `getDetailSr()` | Mengambil detail service request berdasarkan ID valid | Mengembalikan object tunggal dengan data relasi lengkap | Object tunggal dengan data relasi lengkap berhasil dikembalikan | PASS |
| 16 | UT-SR-016 | `getDetailSr()` | Mengambil detail dengan ID tidak ditemukan | Melemparkan eksepsi `NotFoundError` | Eksepsi `NotFoundError` berhasil dilemparkan | PASS |
| 17 | UT-SR-017 | `remove()` | Menghapus service request berdasarkan ID valid | Mengembalikan status konfirmasi penghapusan | Status konfirmasi penghapusan berhasil dikembalikan | PASS |
| 18 | UT-SR-018 | `remove()` | Menghapus service request dengan ID tidak ditemukan | Melemparkan eksepsi `NotFoundError` | Eksepsi `NotFoundError` berhasil dilemparkan | PASS |

Seluruh 18 skenario pengujian pada modul Service Request telah dieksekusi dan menghasilkan status PASS secara menyeluruh. Alur kerja submit intake, approval yang men-trigger pembuatan WorkOrder otomatis, serta rejection dan cancellation telah terverifikasi beroperasi sesuai aturan transisi status yang ditetapkan. Penanganan konflik pada upaya perubahan status yang tidak valid dipastikan konsisten menghasilkan respons error yang informatif.

---

## 4. Membership Module

Pengujian terhadap modul Membership mencakup fungsionalitas impor data kode membership melalui file CSV, proses klaim kode oleh user klien, serta operasi pengambilan dan penghapusan data. Mekanisme parsing file CSV diuji secara terisolasi untuk memvalidasi penanganan format file tidak valid, struktur kolom yang tidak sesuai, dan file kosong. Proses klaim kode diverifikasi terhadap penanganan duplikasi klaim dan pencarian kode yang tidak ditemukan pada database. Fungsi pengambilan daftar kode membership dan daftar client berlangganan juga dipastikan mengembalikan data yang sesuai dengan konteks perusahaan pengguna.

| No | ID Test | Nama Fungsi | Skenario Pengujian | Hasil Diharapkan | Hasil Aktual | Status |
|---|---|---|---|---|---|---|
| 1 | UT-MBRSH-001 | `importCsv()` | Mengunggah file CSV berformat valid berisi daftar kode | Mengembalikan array object code beserta eksternal account yang tersimpan | Array object code beserta eksternal account berhasil dikembalikan | PASS |
| 2 | UT-MBRSH-002 | `importCsv()` | Mengunggah file dengan ekstensi bukan CSV | Melemparkan eksepsi `ValidationError` | Eksepsi `ValidationError` berhasil dilemparkan | PASS |
| 3 | UT-MBRSH-003 | `importCsv()` | Mengunggah CSV dengan struktur kolom tidak sesuai | Melemparkan eksepsi `ValidationError` dengan detail kolom yang salah | Eksepsi `ValidationError` beserta detail kolom yang salah berhasil dilemparkan | PASS |
| 4 | UT-MBRSH-004 | `importCsv()` | Mengunggah CSV kosong tanpa baris data | Melemparkan eksepsi `ValidationError` | Eksepsi `ValidationError` berhasil dilemparkan | PASS |
| 5 | UT-MBRSH-005 | `claimCode()` | User klien melakukan klaim kode valid yang belum terpakai | Mengembalikan object hasil klaim, status kode berubah menjadi used | Object hasil klaim dengan status kode `used` berhasil dikembalikan | PASS |
| 6 | UT-MBRSH-006 | `claimCode()` | Mengklaim kode yang sudah pernah diklaim user lain | Melemparkan eksepsi `ConflictError` | Eksepsi `ConflictError` berhasil dilemparkan | PASS |
| 7 | UT-MBRSH-007 | `claimCode()` | Mengklaim kode yang tidak ditemukan di database | Melemparkan eksepsi `NotFoundError` | Eksepsi `NotFoundError` berhasil dilemparkan | PASS |
| 8 | UT-MBRSH-008 | `findAll()` | Mengambil seluruh daftar kode membership milik company | Mengembalikan array object code beserta metadata | Array object code beserta metadata berhasil dikembalikan | PASS |
| 9 | UT-MBRSH-009 | `findAllSubscribedClients()` | Mengambil daftar client yang sudah berlangganan | Mengembalikan array object client yang terelasi dengan company | Array object client terelasi dengan company berhasil dikembalikan | PASS |
| 10 | UT-MBRSH-010 | `remove()` | Menghapus kode membership berdasarkan ID valid | Mengembalikan status konfirmasi penghapusan | Status konfirmasi penghapusan berhasil dikembalikan | PASS |
| 11 | UT-MBRSH-011 | `remove()` | Menghapus kode membership dengan ID tidak ditemukan | Melemparkan eksepsi `NotFoundError` | Eksepsi `NotFoundError` berhasil dilemparkan | PASS |

Seluruh 11 skenario pengujian pada modul Membership telah dieksekusi dan menghasilkan status PASS tanpa anomali. Mekanisme impor CSV dipastikan mampu menangani berbagai kondisi file input secara defensif, sementara proses klaim kode telah terverifikasi menjaga konsistensi data terhadap duplikasi penggunaan. Fungsi pengambilan daftar kode dan client berlangganan dikonfirmasi mengembalikan data yang terfilter sesuai konteks perusahaan pengguna yang terautentikasi.

---

## 5. Service Price Module

Pengujian terhadap modul Service Price difokuskan pada operasi CRUD harga layanan yang menjadi komponen kritis dalam kalkulasi biaya operasional perusahaan. Fungsi pembuatan dan pembaruan harga diuji terhadap validasi kelengkapan field wajib serta penanganan duplikasi konfigurasi harga untuk layanan yang sama. Operasi pengambilan seluruh daftar harga diverifikasi mengembalikan data yang terfilter berdasarkan konteks perusahaan pengguna. Penanganan penghapusan terhadap ID yang tidak valid juga dipastikan menghasilkan respons error yang konsisten.

| No | ID Test | Nama Fungsi | Skenario Pengujian | Hasil Diharapkan | Hasil Aktual | Status |
|---|---|---|---|---|---|---|
| 1 | UT-SP-001 | `create()` | Membuat variasi harga layanan dengan payload valid | Mengembalikan object record harga layanan yang aktif | Object record harga layanan aktif berhasil dikembalikan | PASS |
| 2 | UT-SP-002 | `create()` | Membuat harga dengan field wajib kosong | Melemparkan eksepsi `ValidationError` | Eksepsi `ValidationError` berhasil dilemparkan | PASS |
| 3 | UT-SP-003 | `create()` | Membuat harga duplikat untuk service yang sama | Melemparkan eksepsi `ConflictError` | Eksepsi `ConflictError` berhasil dilemparkan | PASS |
| 4 | UT-SP-004 | `update()` | Memperbarui nominal harga layanan berdasarkan ID valid | Mengembalikan object record harga yang telah diperbarui | Object record harga yang telah diperbarui berhasil dikembalikan | PASS |
| 5 | UT-SP-005 | `update()` | Memperbarui harga dengan ID tidak ditemukan | Melemparkan eksepsi `NotFoundError` | Eksepsi `NotFoundError` berhasil dilemparkan | PASS |
| 6 | UT-SP-006 | `findAll()` | Mengambil seluruh daftar harga layanan milik company | Mengembalikan array object harga layanan | Array object harga layanan berhasil dikembalikan | PASS |
| 7 | UT-SP-007 | `remove()` | Menghapus harga layanan berdasarkan ID valid | Mengembalikan status konfirmasi penghapusan | Status konfirmasi penghapusan berhasil dikembalikan | PASS |
| 8 | UT-SP-008 | `remove()` | Menghapus harga dengan ID tidak ditemukan | Melemparkan eksepsi `NotFoundError` | Eksepsi `NotFoundError` berhasil dilemparkan | PASS |

Seluruh 8 skenario pengujian pada modul Service Price telah dieksekusi dan menghasilkan status PASS secara konsisten. Validasi terhadap pembuatan harga duplikat dipastikan mencegah inkonsistensi data konfigurasi harga pada database. Operasi pembaruan dan penghapusan record harga terverifikasi menangani kondisi ID tidak valid dengan eksepsi yang informatif sesuai standar penanganan error aplikasi.

---

## 6. Invitations Module

Pengujian terhadap modul Invitations mencakup alur penerimaan dan penolakan undangan bergabung ke perusahaan oleh pengguna. Mekanisme perubahan status undangan dari pending menjadi accepted atau rejected diuji secara terisolasi terhadap berbagai kondisi termasuk undangan yang sudah diproses sebelumnya. Fungsi pengambilan daftar undangan pending milik user diverifikasi mengembalikan data yang terfilter berdasarkan konteks autentikasi. Operasi penghapusan undangan juga dipastikan menangani ID yang tidak ditemukan dengan respons error yang sesuai.

| No | ID Test | Nama Fungsi | Skenario Pengujian | Hasil Diharapkan | Hasil Aktual | Status |
|---|---|---|---|---|---|---|
| 1 | UT-INV-001 | `acceptInvitation()` | User menerima undangan valid untuk bergabung dengan company | Mengembalikan status relasi user terhadap company menjadi aktif | Status relasi user terhadap company berhasil diaktifkan | PASS |
| 2 | UT-INV-002 | `acceptInvitation()` | Menerima undangan yang sudah pernah di-accept | Melemparkan eksepsi `ConflictError` | Eksepsi `ConflictError` berhasil dilemparkan | PASS |
| 3 | UT-INV-003 | `acceptInvitation()` | Menerima undangan dengan ID tidak ditemukan | Melemparkan eksepsi `NotFoundError` | Eksepsi `NotFoundError` berhasil dilemparkan | PASS |
| 4 | UT-INV-004 | `rejectInvitation()` | User menolak undangan yang masih pending | Mengubah status undangan menjadi rejected tanpa mengubah relasi user | Status undangan berhasil diubah menjadi rejected tanpa perubahan relasi | PASS |
| 5 | UT-INV-005 | `rejectInvitation()` | Menolak undangan yang sudah di-accept sebelumnya | Melemparkan eksepsi `ConflictError` | Eksepsi `ConflictError` berhasil dilemparkan | PASS |
| 6 | UT-INV-006 | `getMyPendingInvitations()` | Mengambil daftar undangan pending milik user | Mengembalikan array object undangan berstatus pending | Array object undangan berstatus pending berhasil dikembalikan | PASS |
| 7 | UT-INV-007 | `remove()` | Menghapus undangan berdasarkan ID valid | Mengembalikan status konfirmasi penghapusan | Status konfirmasi penghapusan berhasil dikembalikan | PASS |
| 8 | UT-INV-008 | `remove()` | Menghapus undangan dengan ID tidak ditemukan | Melemparkan eksepsi `NotFoundError` | Eksepsi `NotFoundError` berhasil dilemparkan | PASS |

Seluruh 8 skenario pengujian pada modul Invitations telah dieksekusi dan menghasilkan status PASS tanpa kegagalan. Mekanisme penerimaan undangan yang mengaktifkan relasi user terhadap company telah terverifikasi berjalan sesuai spesifikasi tanpa efek samping terhadap data pengguna lain. Penanganan konflik pada undangan yang sudah diproses sebelumnya dipastikan konsisten menghasilkan eksepsi yang mencegah duplikasi operasi.

---

## 7. Notifications Module (FCM)

Pengujian terhadap modul Notifications difokuskan pada validasi integrasi dengan Firebase Cloud Messaging dispatcher internal untuk pengiriman notifikasi push. Fungsi pengiriman notifikasi diuji secara terisolasi menggunakan mock pada layer FCM client untuk memverifikasi penanganan token valid, token invalid, serta payload yang tidak lengkap. Mekanisme antrean pengiriman dipastikan mengembalikan respons konfirmasi yang sesuai tanpa melakukan panggilan ke infrastruktur Firebase secara langsung. Validasi terhadap kelengkapan body dan title notifikasi juga diverifikasi pada layer service sebelum proses dispatch dilakukan.

| No | ID Test | Nama Fungsi | Skenario Pengujian | Hasil Diharapkan | Hasil Aktual | Status |
|---|---|---|---|---|---|---|
| 1 | UT-NOTIF-001 | `sendNotification()` | Mengirim notifikasi push dengan token FCM valid | Memanggil FCM dispatcher internal dan mengembalikan respons antrean berhasil | FCM dispatcher dipanggil dan respons antrean berhasil dikembalikan | PASS |
| 2 | UT-NOTIF-002 | `sendNotification()` | Mengirim notifikasi dengan token FCM invalid/expired | Melemparkan eksepsi `BadRequestError` atau mengembalikan status gagal kirim | Eksepsi `BadRequestError` untuk token invalid berhasil dilemparkan | PASS |
| 3 | UT-NOTIF-003 | `sendNotification()` | Mengirim notifikasi tanpa body/title | Melemparkan eksepsi `ValidationError` | Eksepsi `ValidationError` berhasil dilemparkan | PASS |

Seluruh 3 skenario pengujian pada modul Notifications telah dieksekusi dan menghasilkan status PASS secara keseluruhan. Integrasi dengan FCM dispatcher internal terverifikasi berjalan melalui mock tanpa ketergantungan pada infrastruktur eksternal Firebase. Penanganan token invalid dan payload notifikasi yang tidak lengkap dipastikan menghasilkan respons error yang sesuai sebelum proses dispatch dieksekusi.

---

## Ringkasan Hasil

| No | Modul | Total Skenario | Passed | Failed | Tingkat Keberhasilan |
|---|---|---|---|---|---|
| 1 | Auth | 9 | 9 | 0 | 100% |
| 2 | Work Order | 19 | 19 | 0 | 100% |
| 3 | Service Request | 18 | 18 | 0 | 100% |
| 4 | Membership | 11 | 11 | 0 | 100% |
| 5 | Service Price | 8 | 8 | 0 | 100% |
| 6 | Invitations | 8 | 8 | 0 | 100% |
| 7 | Notifications (FCM) | 3 | 3 | 0 | 100% |
| **Total** | **7 Modul** | **76** | **76** | **0** | **100%** |
