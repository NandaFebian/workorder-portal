### 1. Kamus Data Users (Module Users)

Data pengguna sistem disimpan di dalam tabel users. Hak akses dan profil setiap entitas dikelola melalui tabel ini. Kredensial, peran, dan afiliasi organisasi dicatat untuk setiap pengguna yang terdaftar.

Tabel 3.6 Kamus Data Users
| Nama Kolom | Tipe Data | Keterangan |
|---|---|---|
| _id | ObjectId | Primary key unik pengguna. |
| name | String | Nama lengkap pengguna. |
| email | String | Alamat surel unik untuk autentikasi. |
| password | String | Hash kata sandi (select: false, tidak muncul di query biasa). |
| role | String | Tingkat otorisasi pengguna (enum Role). |
| companyId | ObjectId | Referensi ke perusahaan tempat pengguna berafiliasi. |
| positionId | ObjectId | Referensi ke jabatan pengguna di perusahaan. |
| fcmTokens | Array of String | Token perangkat FCM untuk notifikasi push (select: false). |
| deletedAt | Date | Soft delete — menandai pengguna sebagai tidak aktif. |
| __v | Number | Version key internal Mongoose. |
| createdAt | Date | Waktu pembuatan data. |
| updatedAt | Date | Waktu pembaruan data terakhir. |

Otentikasi dan otorisasi pengguna sistem difasilitasi melalui rancangan tabel users berdasarkan Tabel 3.6. Mekanisme keamanan sistem untuk melindungi kredensial pengguna ditunjukkan oleh penggunaan kolom password yang tidak dapat dibaca secara langsung melalui query biasa (select: false). Pemberian hak akses yang sesuai secara otomatis bagi setiap pengguna dijamin melalui integrasi antara role, companyId, dan positionId dalam satu entitas, sehingga pengelolaan akses terhadap fitur aplikasi dapat disesuaikan dengan hierarki organisasi.

---

### 2. Kamus Data Positions (Module Positions)

Tingkatan jabatan dalam organisasi didefinisikan secara struktural di tabel positions. Tanggung jawab kerja dipetakan melalui setiap jabatan yang tersedia. Otorisasi yang dapat dilakukan oleh karyawan ditentukan oleh jabatan masing-masing.

Tabel 3.7 Kamus Data Positions
| Nama Kolom | Tipe Data | Keterangan |
|---|---|---|
| _id | ObjectId | Primary key unik jabatan. |
| name | String | Nama jabatan. |
| description | String | Deskripsi tugas dan tanggung jawab. |
| isActive | Boolean | Status aktif jabatan (default: true). |
| companyId | ObjectId | Referensi ke perusahaan pemilik jabatan. |
| deletedAt | Date | Soft delete. |
| __v | Number | Version key internal. |
| createdAt | Date | Waktu pembuatan data. |
| updatedAt | Date | Waktu pembaruan data terakhir. |

Penentuan hierarki dan tanggung jawab karyawan dalam organisasi difasilitasi melalui rancangan tabel positions berdasarkan Tabel 3.7. Mekanisme fleksibilitas sistem untuk mengaktifkan atau menonaktifkan jabatan tanpa menghapus data ditunjukkan oleh penggunaan kolom isActive. Pemberian otorisasi yang sesuai bagi setiap pemegang jabatan dijamin melalui integrasi antara name dan description dalam satu entitas, sehingga pembagian tugas dan wewenang di dalam perusahaan dapat dikelola secara terstruktur.

---

### 3. Kamus Data Companies (Module Company)

Data profil organisasi yang terdaftar dalam sistem dikelola melalui tabel companies. Konfigurasi operasional dan parameter integrasi eksternal disimpan di dalam tabel ini. Setiap perusahaan dicatat dengan informasi lengkap termasuk fitur tambahan.

Tabel 3.8 Kamus Data Companies
| Nama Kolom | Tipe Data | Keterangan |
|---|---|---|
| _id | ObjectId | Primary key unik perusahaan. |
| name | String | Nama resmi perusahaan. |
| address | String | Alamat kantor. |
| description | String | Deskripsi bisnis. |
| ownerId | ObjectId | Referensi ke pengguna pemilik perusahaan. |
| managers | Array of ObjectId | Daftar pengguna dengan akses manajer. |
| staffs | Array of ObjectId | Daftar pengguna terdaftar sebagai staf. |
| isActive | Boolean | Status operasional perusahaan. |
| isFaqActive | Boolean | Status fitur FAQ eksternal. |
| faqApiKey | String | Kunci API untuk layanan FAQ eksternal. |
| faqExternalCompanyId | Number | ID perusahaan pada sistem FAQ eksternal. |
| integrationConfig.externalLoginUrl | String/null | URL endpoint login sistem eksternal. |
| integrationConfig.externalVerifyUrl | String/null | URL endpoint verifikasi akun eksternal. |
| integrationConfig.externalCheckMembershipsUrl | String/null | URL endpoint pengecekan status membership eksternal. |
| integrationConfig.externalCheckStatusUrl | String/null | URL endpoint pengecekan status pengguna eksternal. |
| integrationConfig.secretKey | String/null | Kunci rahasia terenkripsi untuk autentikasi integrasi. |
| integrationConfig.isIntegrationActive | Boolean | Status aktif atau nonaktifnya integrasi eksternal. |
| integrationConfig.integrationType | String | Tipe integrasi: external_system / claim_token. |
| deletedAt | Date | Soft delete. |
| __v | Number | Version key internal. |
| createdAt | Date | Waktu pembuatan data. |
| updatedAt | Date | Waktu pembaruan data terakhir. |

Pengelolaan profil dan konfigurasi operasional perusahaan difasilitasi melalui rancangan tabel companies berdasarkan Tabel 3.8. Mekanisme keamanan sistem untuk menyimpan kredensial integrasi eksternal ditunjukkan oleh penggunaan kolom integrationConfig.secretKey yang tersimpan dalam keadaan terenkripsi. Penerapan fitur tambahan secara modular dijamin melalui integrasi antara isFaqActive, faqApiKey, dan faqExternalCompanyId dalam satu entitas, sehingga kebutuhan bisnis yang berkembang dapat diakomodasi tanpa perubahan struktur database.

---

### 4. Kamus Data Invitations (Module Company)

Riwayat proses perekrutan karyawan dicatat di tabel invitations. Status undangan oleh manajemen perusahaan dikelola melalui tabel ini. Proses klaim akun oleh calon staf diamankan melalui entitas undangan.

Tabel 3.9 Kamus Data Invitations
| Nama Kolom | Tipe Data | Keterangan |
|---|---|---|
| _id | ObjectId | Primary key unik undangan. |
| companyId | ObjectId | Referensi ke perusahaan pengirim undangan. |
| userId | ObjectId | Referensi ke calon karyawan penerima undangan. |
| role | String | Peran yang ditawarkan (staff/manager). |
| positionId | ObjectId | Referensi ke jabatan yang ditawarkan. |
| status | String | Status undangan: pending, accepted, rejected, expired, cancelled. |
| expiresAt | Date | Batas waktu kedaluwarsa undangan. |
| deletedAt | Date | Soft delete. |
| __v | Number | Version key internal. |
| createdAt | Date | Waktu pembuatan data. |
| updatedAt | Date | Waktu pembaruan data terakhir. |

Penambahan personel perusahaan secara terkendali difasilitasi melalui rancangan tabel invitations berdasarkan Tabel 3.9. Mekanisme keamanan sistem untuk mencegah penyalahgunaan undangan yang telah lama diterbitkan ditunjukkan oleh penggunaan kolom expiresAt. Pemberian hak akses dan posisi yang sesuai secara otomatis bagi pengguna yang menerima undangan (accepted) dijamin melalui integrasi antara role dan positionId dalam satu entitas, sehingga efisiensi manajemen sumber daya manusia di dalam aplikasi dapat ditingkatkan.

---

### 5. Kamus Data Company Types (Module Template)

Kategori operasional industri perusahaan dikelompokkan ke dalam tabel companytypes. Templat layanan yang relevan ditentukan melalui pengelompokan ini. Katalog layanan yang sesuai dengan jenis bisnis dapat disajikan oleh sistem.

Tabel 3.10 Kamus Data Company Types
| Nama Kolom | Tipe Data | Keterangan |
|---|---|---|
| _id | ObjectId | Primary key unik jenis perusahaan. |
| name | String | Nama kategori (contoh: IT, Retail). |
| description | String | Penjelasan ruang lingkup kategori. |
| __v | Number | Version key internal. |
| createdAt | Date | Waktu pembuatan data. |
| updatedAt | Date | Waktu pembaruan data terakhir. |

Pengelompokan perusahaan berdasarkan kategori industri difasilitasi melalui rancangan tabel companytypes berdasarkan Tabel 3.10. Mekanisme standardisasi sistem untuk menentukan templat layanan yang relevan ditunjukkan oleh penggunaan kolom name sebagai pengenal kategori. Penerapan alur kerja yang seragam untuk setiap jenis bisnis dijamin melalui integrasi antara name dan description dalam satu entitas, sehingga katalog layanan yang ditampilkan dapat disesuaikan dengan sektor industri masing-masing perusahaan.

---

### 6. Kamus Data Service Templates (Module Template)

Cetak biru layanan standar didefinisikan di tabel servicetemplates. Kebutuhan alur kerja dan form input ditentukan melalui cetak biru ini. Aturan otorisasi tugas dapat diaktifkan oleh perusahaan berdasarkan kategori bisnis mereka.

Tabel 3.11 Kamus Data Service Templates
| Nama Kolom | Tipe Data | Keterangan |
|---|---|---|
| _id | ObjectId | Primary key unik templat. |
| title | String | Judul templat layanan. |
| description | String | Deskripsi alur operasional. |
| companyTypeId | ObjectId | Referensi ke kategori perusahaan yang relevan. |
| accessType | String | Aksesibilitas: public, member_only, internal. |
| draftingWorkOrderType | String | Metode pembuatan WO: auto/manual. |
| serviceRequestConfig.serviceRequestApprovalAccessType | String | Metode otorisasi: auto, manager, staff_pic, staff_any. |
| serviceRequestConfig.reviewNeed | Boolean | Apakah pengajuan perlu peninjauan lanjutan. |
| serviceRequestConfig.intakeForm.title | String/null | Judul cetak biru form intake. |
| serviceRequestConfig.intakeForm.description | String/null | Deskripsi cetak biru form intake. |
| serviceRequestConfig.intakeForm.formType | String/null | Tipe form intake: intake, work_order, report, dll. |
| serviceRequestConfig.intakeForm.fields | Array of Object/null | Skema field input pada form intake (lihat FormField). |
| serviceRequestConfig.reviewForm.title | String/null | Judul cetak biru form review. |
| serviceRequestConfig.reviewForm.description | String/null | Deskripsi cetak biru form review. |
| serviceRequestConfig.reviewForm.formType | String/null | Tipe form review: intake, work_order, report, dll. |
| serviceRequestConfig.reviewForm.fields | Array of Object/null | Skema field input pada form review (lihat FormField). |
| workOrdersConfig[].configId | String/null | Identitas unik konfigurasi WO. |
| workOrdersConfig[].positionsOnDuty | Object | Konfigurasi posisi yang bertugas. |
| workOrdersConfig[].workOrderForm.title | String/null | Judul cetak biru form instruksi pengerjaan. |
| workOrdersConfig[].workOrderForm.description | String/null | Deskripsi cetak biru form instruksi pengerjaan. |
| workOrdersConfig[].workOrderForm.formType | String/null | Tipe form instruksi pengerjaan. |
| workOrdersConfig[].workOrderForm.fields | Array of Object/null | Skema field input pada form instruksi pengerjaan. |
| workOrdersConfig[].workReportForm.title | String/null | Judul cetak biru form laporan hasil. |
| workOrdersConfig[].workReportForm.description | String/null | Deskripsi cetak biru form laporan hasil. |
| workOrdersConfig[].workReportForm.formType | String/null | Tipe form laporan hasil. |
| workOrdersConfig[].workReportForm.fields | Array of Object/null | Skema field input pada form laporan hasil. |
| workOrdersConfig[].workOrderApprovalAccessType | String | Mekanisme approval WO: auto. |
| workOrdersConfig[].workReportApprovalAccessType | String | Mekanisme approval laporan: auto/manager. |
| workOrdersConfig[].minStaff | Number | Jumlah minimal staf pelaksana. |
| workOrdersConfig[].maxStaff | Number | Jumlah maksimal staf pelaksana. |
| workOrdersConfig[].showReportToRequester | Boolean | Izin menampilkan laporan ke pemohon. |
| __v | Number | Version key internal. |
| createdAt | Date | Waktu pembuatan data. |
| updatedAt | Date | Waktu pembaruan data terakhir. |

Pembuatan cetak biru layanan standar untuk setiap kategori perusahaan difasilitasi melalui rancangan tabel servicetemplates berdasarkan Tabel 3.11. Mekanisme kontrol akses sistem untuk membatasi visibilitas templat layanan ditunjukkan oleh penggunaan kolom accessType dengan nilai public, member_only, atau internal. Penerapan alur kerja yang konsisten dari pengajuan hingga pelaporan dijamin melalui integrasi antara serviceRequestConfig dan workOrdersConfig dalam satu entitas, sehingga replikasi layanan untuk perusahaan sejenis dapat dilakukan tanpa desain ulang dari awal.

---

### 7. Kamus Data Services (Module Service)

Daftar jenis pekerjaan operasional aktif dikelola di dalam tabel services. Setiap layanan milik masing-masing perusahaan dicatat dengan pengaturan dinamis. Alur otorisasi pengajuan dan penyelesaian work order disesuaikan melalui entitas ini.

Tabel 3.12 Kamus Data Services
| Nama Kolom | Tipe Data | Keterangan |
|---|---|---|
| _id | ObjectId | Primary key unik layanan. |
| serviceKey | String | Pengenal unik layanan untuk integrasi eksternal. |
| companyId | ObjectId | Referensi ke perusahaan pemilik. |
| title | String | Judul layanan. |
| description | String | Rincian fungsi operasional. |
| accessType | String | Hak akses pengajuan: public, member_only, internal. |
| isActive | Boolean | Status aktif layanan (default: true). |
| draftingWorkOrderType | String | Mekanisme pembuatan WO: auto/manual. |
| serviceRequestConfig.intakeFormId | ObjectId/null | Referensi ke FormTemplate untuk form intake. |
| serviceRequestConfig.reviewFormId | ObjectId/null | Referensi ke FormTemplate untuk form review. |
| serviceRequestConfig.serviceRequestApprovalAccessType | String | Metode otorisasi: auto, manager, staff_pic, staff_any. |
| serviceRequestConfig.reviewNeed | Boolean | Apakah pengajuan perlu peninjauan lanjutan. |
| workOrdersConfig[].configId | String/null | Identitas unik konfigurasi WO. |
| workOrdersConfig[].positionId | ObjectId | Referensi ke posisi/jabatan pelaksana. |
| workOrdersConfig[].workOrderFormId | ObjectId/null | Referensi ke FormTemplate untuk form instruksi WO. |
| workOrdersConfig[].workReportFormId | ObjectId/null | Referensi ke FormTemplate untuk form laporan. |
| workOrdersConfig[].workOrderApprovalAccessType | String | Mekanisme approval WO: auto. |
| workOrdersConfig[].workReportApprovalAccessType | String | Mekanisme approval laporan: auto/manager. |
| workOrdersConfig[].minStaff | Number | Jumlah minimal staf pelaksana. |
| workOrdersConfig[].maxStaff | Number | Jumlah maksimal staf pelaksana. |
| workOrdersConfig[].showReportToRequester | Boolean | Izin menampilkan laporan ke pemohon. |
| __v | Number | Version key internal. |
| deletedAt | Date | Soft delete. |
| createdAt | Date | Waktu pembuatan data. |
| updatedAt | Date | Waktu pembaruan data terakhir. |

Pengelolaan layanan operasional aktif milik perusahaan difasilitasi melalui rancangan tabel services berdasarkan Tabel 3.12. Mekanisme identifikasi unik sistem untuk integrasi dengan platform eksternal ditunjukkan oleh penggunaan kolom serviceKey sebagai pengenal layanan. Penyesuaian alur otorisasi secara dinamis untuk setiap layanan dijamin melalui integrasi antara serviceRequestConfig dan workOrdersConfig dalam satu entitas, sehingga kebutuhan bisnis yang spesifik dapat diakomodasi tanpa mengganggu layanan lainnya.

---

### 8. Kamus Data Service Prices (Module Service Price)

Informasi tarif dari setiap jenis layanan dicatat di tabel serviceprices. Logika keuangan dipisahkan dari konfigurasi alur operasional layanan. Transaksi komersial dapat diintegrasikan melalui data harga yang tersimpan.

Tabel 3.13 Kamus Data Service Prices
| Nama Kolom | Tipe Data | Keterangan |
|---|---|---|
| _id | ObjectId | Primary key unik tarif. |
| serviceKey | String | Pengenal unik layanan terkait. |
| price | Number | Nominal tarif layanan. |
| deletedAt | Date | Soft delete. |
| createdAt | Date | Waktu pembuatan data. |
| updatedAt | Date | Waktu pembaruan data terakhir. |

Pencatatan tarif layanan yang terpisah dari konfigurasi operasional difasilitasi melalui rancangan tabel serviceprices berdasarkan Tabel 3.13. Mekanisme pencegahan duplikasi data sistem untuk menjaga integritas harga layanan ditunjukkan oleh penggunaan indeks unik parsial pada kolom serviceKey dengan filter deletedAt: null. Fleksibilitas penyesuaian tarif secara berkala dijamin melalui pemisahan logika keuangan dari data operasional, sehingga perubahan harga tidak akan mengganggu stabilitas data transaksi yang sedang berjalan.

---

### 9. Kamus Data Service Requests (Module Service Request)

Pengajuan permintaan layanan dari pelanggan dicatat di tabel servicerequests. Perkembangan status pengajuan direkam dari tahap penerimaan hingga penyelesaian. Setiap pengajuan dilacak melalui dokumen ini secara menyeluruh.

Tabel 3.14 Kamus Data Service Requests
| Nama Kolom | Tipe Data | Keterangan |
|---|---|---|
| _id | ObjectId | Primary key unik pengajuan. |
| code | String | Kode unik pengajuan untuk pelacakan. |
| serviceId | ObjectId | Referensi ke jenis layanan yang diminta. |
| requestedBy | ObjectId | Referensi ke pengguna pemohon. |
| companyId | ObjectId | Referensi ke perusahaan penyedia layanan. |
| serviceRequestApprovalAccessType | String | Metode otorisasi: auto, manager, staff_pic, staff_any. |
| staffPIC | ObjectId | Referensi ke staf penanggung jawab. |
| reviewNeed | Boolean | Apakah perlu peninjauan lanjutan. |
| approvedBy | ObjectId | Referensi ke penyetuju permintaan. |
| serviceRequestStatus | String | Status pengajuan (enum ServiceRequestStatus). |
| intakeFormId | ObjectId | Referensi ke templat form intake. |
| reviewFormId | ObjectId | Referensi ke templat form review. |
| intakeSubmissionId | ObjectId | Referensi ke submission form intake. |
| reviewSubmissionId | ObjectId | Referensi ke submission form review. |
| receivedAt | Date | Waktu diterima. |
| approvedAt | Date | Waktu disetujui. |
| rejectedAt | Date | Waktu ditolak. |
| cancelledAt | Date | Waktu dibatalkan. |
| workOrderCreatedAt | Date | Waktu WO dibuat. |
| onProgressAt | Date | Waktu mulai dikerjakan. |
| unprocessableAt | Date | Waktu ditandai tidak dapat diproses. |
| partialCompletedAt | Date | Waktu selesai sebagian. |
| failedAt | Date | Waktu gagal. |
| completedAt | Date | Waktu selesai. |
| closedAt | Date | Waktu ditutup. |
| deletedAt | Date | Soft delete. |
| __v | Number | Version key internal. |
| createdAt | Date | Waktu pembuatan data. |
| updatedAt | Date | Waktu pembaruan data terakhir. |

Pengajuan permintaan layanan oleh pelanggan kepada perusahaan difasilitasi melalui rancangan tabel servicerequests berdasarkan Tabel 3.14. Mekanisme pelacakan status sistem untuk memantau perkembangan pengajuan dari tahap penerimaan hingga penyelesaian ditunjukkan oleh penggunaan kolom serviceRequestStatus dan seluruh timestamp status terkait. Keakuratan analisis durasi layanan dijamin melalui pencatatan setiap transisi status (receivedAt, approvedAt, completedAt, closedAt) dalam satu dokumen, sehingga evaluasi kinerja layanan dapat dilakukan secara menyeluruh.

---

### 10. Kamus Data Work Orders (Module Work Order)

Detail penugasan operasional konkret disimpan di tabel workorders. Pengerjaan tugas oleh tim teknis dikoordinasikan melalui struktur ini. Persetujuan permintaan layanan diturunkan menjadi penugasan di lapangan.

Tabel 3.15 Kamus Data Work Orders
| Nama Kolom | Tipe Data | Keterangan |
|---|---|---|
| _id | ObjectId | Primary key unik WO. |
| code | String | Kode unik tugas. |
| serviceRequestId | ObjectId | Referensi ke service request asal. |
| batchId | String | Kode pengelompokan tugas massal. |
| createdBy | ObjectId | Pengguna yang menerbitkan WO. |
| configId | String | Identitas konfigurasi dari cetak biru layanan. |
| serviceId | ObjectId | Referensi ke layanan terkait. |
| companyId | ObjectId | Referensi ke perusahaan penanggung jawab. |
| approvedBy | ObjectId | Pengguna yang menyetujui pengerjaan. |
| staffPIC | ObjectId | Staf penanggung jawab lapangan. |
| assignedStaff | Array of ObjectId | Daftar staf pelaksana. |
| workOrderFormId | ObjectId | Templat form instruksi pengerjaan. |
| reportFormId | ObjectId | Templat form laporan hasil. |
| positionId | ObjectId | Jabatan minimum staf pelaksana. |
| workOrderApprovalAccessType | String | Otorisasi persetujuan: auto/staff_pic. |
| workReportApprovalAccessType | String | Otorisasi persetujuan laporan: auto/manager. |
| minStaff | Number | Kuota minimal staf. |
| maxStaff | Number | Kuota maksimal staf. |
| status | String | Status pelaksanaan (enum WorkOrderStatus). |
| has_issue | Boolean | Indikator kendala operasional. |
| issue_note | String | Catatan kendala lapangan. |
| draftedAt | Date | Waktu dibuat draf. |
| sentAt | Date | Waktu dikirim. |
| approvedAt | Date | Waktu disetujui. |
| rejectedAt | Date | Waktu ditolak. |
| startedAt | Date | Waktu mulai dikerjakan. |
| completedAt | Date | Waktu selesai. |
| failedAt | Date | Waktu gagal. |
| cancelledAt | Date | Waktu dibatalkan. |
| deletedAt | Date | Soft delete. |
| __v | Number | Version key internal. |
| createdAt | Date | Waktu pembuatan data. |
| updatedAt | Date | Waktu pembaruan data terakhir. |

Penugasan operasional lapangan yang diturunkan dari persetujuan service request difasilitasi melalui rancangan tabel workorders berdasarkan Tabel 3.15. Mekanisme deteksi kendala teknis sistem untuk mengidentifikasi hambatan di lapangan ditunjukkan oleh penggunaan kolom has_issue dan issue_note. Pengelolaan beban kerja personel secara seimbang dijamin melalui integrasi antara minStaff dan maxStaff dalam setiap penugasan, sehingga risiko ketidakseimbangan alokasi sumber daya manusia dapat diminimalkan.

---

### 11. Kamus Data Work Reports (Module Work Report)

Pelaporan hasil pelaksanaan tugas didokumentasikan di tabel workreports. Bukti penyelesaian pekerjaan oleh tim lapangan dicatat melalui tabel ini. Kualitas pengerjaan dapat diverifikasi oleh manajer sebelum diserahkan kepada pemohon.

Tabel 3.16 Kamus Data Work Reports
| Nama Kolom | Tipe Data | Keterangan |
|---|---|---|
| _id | ObjectId | Primary key unik laporan. |
| workOrderId | ObjectId | Referensi ke WO asal. |
| companyId | ObjectId | Referensi ke perusahaan pengerja. |
| reportFormId | ObjectId | Referensi ke templat form laporan. |
| approvedBy | ObjectId | Referensi ke verifikator laporan. |
| workReportApprovalAccessType | String | Mekanisme persetujuan: auto/manager. |
| status | String | Status laporan (enum WorkReportStatus). |
| startedAt | Date | Waktu mulai pengerjaan laporan. |
| submittedAt | Date | Waktu penyerahan laporan. |
| approvedAt | Date | Waktu verifikasi disetujui. |
| rejectedAt | Date | Waktu verifikasi ditolak. |
| showReportToRequester | Boolean | Izin tampilkan laporan ke klien. |
| deletedAt | Date | Soft delete. |
| __v | Number | Version key internal. |
| createdAt | Date | Waktu pembuatan data. |
| updatedAt | Date | Waktu pembaruan data terakhir. |

Pelaporan hasil pelaksanaan tugas oleh tim lapangan difasilitasi melalui rancangan tabel workreports berdasarkan Tabel 3.16. Mekanisme perlindungan data sensitif sistem untuk mengontrol visibilitas laporan kepada pihak eksternal ditunjukkan oleh penggunaan kolom showReportToRequester. Verifikasi kualitas pengerjaan secara bertahap dijamin melalui integrasi antara status, approvedBy, dan jejak timestamp persetujuan dalam satu entitas, sehingga akuntabilitas hasil kerja dapat dipertahankan sebelum diserahkan kepada pemohon.

---

### 12. Kamus Data Form Templates (Module Form)

Konfigurasi form dinamis untuk pengumpulan data didefinisikan di tabel formtemplates. Struktur isian data yang harus dilengkapi ditentukan melalui templat form. Pengajuan dan laporan dapat dikumpulkan melalui form yang telah dikonfigurasi.

Tabel 3.17 Kamus Data Form Templates
| Nama Kolom | Tipe Data | Keterangan |
|---|---|---|
| _id | ObjectId | Primary key unik templat form. |
| formKey | String | Kode pengenal unik untuk integrasi. |
| companyId | ObjectId | Referensi ke perusahaan pemilik. |
| position | ObjectId | Referensi ke jabatan yang berhak mengakses form ini. |
| title | String | Judul tampilan form. |
| description | String | Panduan pengisian form. |
| formType | String | Kategori form: intake, work_order, report, dll. |
| fields[].order | Number | Urutan tampilan field pada form. |
| fields[].label | String | Label atau nama field yang ditampilkan ke pengguna. |
| fields[].type | String | Tipe input field (enum FieldType: text, number, date, file, dll). |
| fields[].required | Boolean | Apakah field wajib diisi (default: false). |
| fields[].placeholder | String | Teks placeholder pada input field. |
| fields[].options[].key | String | Kunci atau identifier opsi (untuk field select/radio/checkbox). |
| fields[].options[].value | String | Nilai tampilan opsi. |
| fields[].min | Number/null | Nilai minimum (untuk tipe number) atau panjang minimum. |
| fields[].max | Number/null | Nilai maksimum (untuk tipe number) atau panjang maksimum. |
| __v | Number | Version key manual (versionKey: false, dikelola manual). |
| deletedAt | Date | Soft delete. |
| createdAt | Date | Waktu pembuatan data. |
| updatedAt | Date | Waktu pembaruan data terakhir. |

Pembuatan form dinamis untuk pengumpulan data pengajuan dan laporan difasilitasi melalui rancangan tabel formtemplates berdasarkan Tabel 3.17. Mekanisme fleksibilitas input data sistem untuk mengakomodasi berbagai kebutuhan operasional ditunjukkan oleh penggunaan kolom fields yang berisi array FormField dengan tipe data yang beragam. Konsistensi struktur form pada setiap transaksi berjalan dijamin melalui integrasi antara formType dan fields dalam satu entitas, sehingga perubahan konfigurasi form tidak akan mempengaruhi data submission yang telah tersimpan sebelumnya.

---

### 13. Kamus Data Form Submissions (Module Form)

Data jawaban formulir dinamis disimpan di tabel formsubmissions. Hasil aktual dari masukan data pengajuan dicatat dalam koleksi ini. Data laporan kerja lapangan yang telah diisi oleh pengguna disimpan dengan aman.

Tabel 3.18 Kamus Data Form Submissions
| Nama Kolom | Tipe Data | Keterangan |
|---|---|---|
| _id | ObjectId | Primary key unik submission. |
| submissionType | String | Jenis submission: intake, work_order, report, image. |
| ownerId | ObjectId | Referensi ke entitas pemilik (contoh: ServiceRequest). |
| formId | ObjectId | Referensi ke templat form asal. |
| submittedBy | ObjectId | Referensi ke pengguna pengisi form. |
| fieldsData[].order | Number | Nomor urut field sesuai definisi FormField. |
| fieldsData[].value | Mixed | Nilai jawaban yang diisi pengguna (String, Number, Array, dll). |
| status | String | Status submission (enum FormSubmissionStatus). |
| submittedAt | Date | Waktu pengiriman submission. |
| deletedAt | Date | Soft delete. |
| __v | Number | Version key internal. |
| createdAt | Date | Waktu pembuatan data. |
| updatedAt | Date | Waktu pembaruan data terakhir. |

Penyimpanan data jawaban formulir dinamis yang telah diisi oleh pengguna difasilitasi melalui rancangan tabel formsubmissions berdasarkan Tabel 3.18. Mekanisme fleksibilitas penyimpanan sistem untuk menampung berbagai tipe data jawaban ditunjukkan oleh penggunaan kolom fieldsData dengan struktur Mixed pada nilai value. Keterkaitan data submission dengan entitas pemiliknya dijamin melalui integrasi antara ownerId dan formId dalam satu dokumen, sehingga pencarian dan rekonsiliasi data pengajuan dapat dilakukan secara efisien.

---

### 14. Kamus Data Pairing States (Module Customer Pairing)

Kode verifikasi sementara untuk otentikasi integrasi disimpan di tabel pairingstates. Keamanan sirkulasi pairing kunci akses dijaga melalui masa aktif yang singkat. Akun eksternal dapat diotentikasi melalui data yang tersimpan di tabel ini.

Tabel 3.19 Kamus Data Pairing States
| Nama Kolom | Tipe Data | Keterangan |
|---|---|---|
| _id | ObjectId | Primary key unik kode pairing. |
| state | String | Kode token acak untuk pencocokan transaksi. |
| userId | ObjectId | Referensi ke pengguna yang menginisiasi pairing. |
| companyId | ObjectId | Referensi ke perusahaan pemroses verifikasi. |
| expiresAt | Date | Batas kedaluwarsa (10 menit, TTL index otomatis menghapus dokumen). |
| __v | Number | Version key internal. |
| createdAt | Date | Waktu pembuatan data. |
| updatedAt | Date | Waktu pembaruan data terakhir. |

Penyimpanan kode verifikasi sementara untuk otentikasi integrasi akun eksternal difasilitasi melalui rancangan tabel pairingstates berdasarkan Tabel 3.19. Mekanisme pembersihan data otomatis sistem untuk mencegah penumpukan data sampah ditunjukkan oleh penggunaan TTL index pada kolom expiresAt. Keamanan proses pairing antara pengguna lokal dengan akun eksternal dijamin melalui integrasi antara state, userId, dan companyId dalam satu entitas, sehingga risiko penyalahgunaan token verifikasi yang telah kedaluwarsa dapat diminimalkan.

---

### 15. Kamus Data External Accounts (Module Customer Pairing)

Hubungan permanen antara akun lokal dengan akun eksternal dipetakan di tabel externalaccounts. Kelancaran otentikasi login tunggal lintas platform dijamin melalui pemetaan ini. Akun pengguna dari sistem eksternal mitra dapat diintegrasikan dengan portal lokal.

Tabel 3.20 Kamus Data External Accounts
| Nama Kolom | Tipe Data | Keterangan |
|---|---|---|
| _id | ObjectId | Primary key unik pemetaan. |
| externalCustomerEmail | String | Surel akun pengguna di sistem eksternal. |
| externalCustomerName | String | Nama profil di sistem eksternal. |
| companyId | ObjectId | Referensi ke perusahaan mitra. |
| userId | ObjectId | Referensi ke akun pengguna lokal. |
| pairedAt | Date | Waktu pemasangan akun. |
| expiresAt | Date | Batas kedaluwarsa koneksi (jika diatur). |
| integrationType | String | Metode integrasi: external_system / claim_token. |
| deletedAt | Date | Soft delete. |
| __v | Number | Version key internal. |
| createdAt | Date | Waktu pembuatan data. |
| updatedAt | Date | Waktu pembaruan data terakhir. |

Pemetaan permanen antara akun portal lokal dengan akun sistem eksternal mitra difasilitasi melalui rancangan tabel externalaccounts berdasarkan Tabel 3.20. Mekanisme pencegahan duplikasi data sistem untuk menjaga keunikan pemetaan akun ditunjukkan oleh penggunaan indeks unik parsial pada kolom externalCustomerEmail dan companyId dengan filter deletedAt: null. Kelancaran otentikasi login tunggal lintas platform dijamin melalui integrasi antara userId dan externalCustomerEmail dalam satu entitas, sehingga pengguna dapat mengakses layanan eksternal tanpa perlu registrasi ulang.

---

### 16. Kamus Data Membership Codes (Module Membership)

Kode token klaim untuk registrasi keanggotaan dikelola di tabel membershipcodes. Akses layanan oleh pihak luar perusahaan diatur melalui token ini. Akses berbayar atau terotentikasi dapat diperoleh oleh pelanggan eksternal melalui kode yang didistribusikan.

Tabel 3.21 Kamus Data Membership Codes
| Nama Kolom | Tipe Data | Keterangan |
|---|---|---|
| _id | ObjectId | Primary key unik kode membership. |
| companyId | ObjectId | Referensi perusahaan penerbit token. |
| externalCustomerEmail | String | Surel sasaran penerima token. |
| externalCustomerName | String | Nama penerima manfaat. |
| token | String | Kunci token unik untuk klaim. |
| claimedBy | ObjectId | Referensi ke user lokal yang mengklaim. |
| claimedAt | Date | Waktu klaim token. |
| integrationType | String | Metode verifikasi: external_system / claim_token. |
| deletedAt | Date | Soft delete. |
| __v | Number | Version key internal. |
| createdAt | Date | Waktu pembuatan data. |
| updatedAt | Date | Waktu pembaruan data terakhir. |

Distribusi kode token klaim untuk registrasi keanggotaan layanan difasilitasi melalui rancangan tabel membershipcodes berdasarkan Tabel 3.21. Mekanisme pencegahan penggunaan ganda sistem untuk membatasi klaim token hanya satu kali ditunjukkan oleh penggunaan kolom claimedBy dan claimedAt. Verifikasi hak penerima token secara akurat dijamin melalui integrasi antara externalCustomerEmail dan token dalam satu entitas, sehingga rekonsiliasi data pelanggan eksternal dapat dilakukan secara efisien.

---

### 17. Kamus Data Notifications (Module FCM)

Log pesan pemberitahuan yang dikirimkan kepada pengguna disimpan di tabel notifications. Histori notifikasi dalam aplikasi dapat dilacak melalui koleksi ini. Informasi penting dapat diterima oleh pengguna melalui retensi data notifikasi.

Tabel 3.22 Kamus Data Notifications
| Nama Kolom | Tipe Data | Keterangan |
|---|---|---|
| _id | ObjectId | Primary key unik notifikasi. |
| userId | ObjectId | Referensi ke penerima notifikasi. |
| title | String | Judul pesan. |
| body | String | Isi pesan. |
| data | Object | Metadata payload untuk navigasi aplikasi. |
| isRead | Boolean | Status sudah dibaca. |
| readAt | Date | Waktu notifikasi dibaca. |
| __v | Number | Version key internal. |
| createdAt | Date | Waktu notifikasi dibuat (TTL 30 hari, otomatis dihapus). |
| updatedAt | Date | Waktu pembaruan data terakhir. |

Penyimpanan log pesan pemberitahuan yang dikirimkan kepada pengguna difasilitasi melalui rancangan tabel notifications berdasarkan Tabel 3.22. Mekanisme pemeliharaan basis data sistem untuk mencegah akumulasi data notifikasi lama ditunjukkan oleh penggunaan TTL index 30 hari pada kolom createdAt. Navigasi pengguna secara cepat ke halaman tugas terkait dijamin melalui integrasi antara title, body, dan data payload dalam satu entitas, sehingga pengalaman pengguna dalam menindaklanjuti notifikasi dapat ditingkatkan.

---

### 18. Kamus Data Active Tokens (Module Auth)

Daftar token sesi otentikasi aktif disimpan di tabel activetokens. Mekanisme logout instan dapat didukung melalui data yang tersimpan. Masa berlaku akses login dibatasi melalui token yang tercatat untuk keamanan sesi.

Tabel 3.23 Kamus Data Active Tokens
| Nama Kolom | Tipe Data | Keterangan |
|---|---|---|
| _id | ObjectId | Primary key unik token sesi. |
| token | String | Token JWT unik sesi login aktif. |
| userId | ObjectId | Referensi ke pemilik token. |
| __v | Number | Version key internal. |
| createdAt | Date | Waktu pembuatan sesi. |
| updatedAt | Date | Waktu pembaruan data terakhir. |

Penyimpanan daftar token sesi otentikasi yang aktif difasilitasi melalui rancangan tabel activetokens berdasarkan Tabel 3.23. Mekanisme pengamanan sesi sistem untuk mencegah pembajakan akun pengguna ditunjukkan oleh penggunaan kolom token sebagai pencatat sesi login yang valid. Penghentian akses secara instan setelah pengguna melakukan logout dijamin melalui integrasi antara token dan userId dalam satu entitas, sehingga risiko akses tidak sah dapat diminimalkan.
