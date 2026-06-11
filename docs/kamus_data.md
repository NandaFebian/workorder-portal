### 1. Kamus Data Users (Module Users)

Struktur data pengguna sistem disimpan di dalam tabel users untuk mengontrol hak akses dan profil setiap entitas. Struktur ini mendokumentasikan kredensial, peran, dan asosiasi organisasi dari setiap pengguna yang terdaftar.

Tabel 3.6 Kamus Data Users
| Nama Kolom | Tipe Data | Keterangan |
|---|---|---|
| _id | ObjectId | Berfungsi sebagai primary key unik untuk mengidentifikasi setiap pengguna. |
| name | String | Menyimpan nama lengkap pengguna. |
| email | String | Menyimpan alamat surel unik pengguna yang digunakan untuk autentikasi. |
| password | String | Menyimpan hash kata sandi pengguna untuk keamanan autentikasi. |
| role | String | Menentukan tingkat otorisasi pengguna dalam sistem sesuai dengan peran yang ditentukan. |
| companyId | ObjectId | Merujuk ke identitas unik perusahaan tempat pengguna berafiliasi. |
| positionId | ObjectId | Merujuk ke identitas unik jabatan spesifik yang diemban pengguna di dalam perusahaan. |
| fcmTokens | Array of String | Menyimpan token perangkat Firebase Cloud Messaging untuk pengiriman notifikasi. |
| deletedAt | Date | Menyimpan data waktu saat entitas pengguna dinonaktifkan secara logis (soft delete). |
| __v | Number | Version key internal untuk pelacakan perubahan dokumen di basis data. |
| createdAt | Date | Menyimpan waktu pembuatan data pertama kali. |
| updatedAt | Date | Menyimpan waktu pembaruan data terakhir kali. |

Integrasi fcmTokens memungkinkan distribusi pesan pemberitahuan langsung ke gawai pengguna secara real-time. Melalui field deletedAt, sistem mengimplementasikan soft delete untuk melindungi integritas relasional data pengguna dalam histori transaksi work order.

---

### 2. Kamus Data Positions (Module Positions)

Tingkatan jabatan dalam organisasi didefinisikan secara struktural dalam tabel positions untuk memetakan tanggung jawab kerja. Setiap jabatan menentukan otorisasi yang dapat dilakukan oleh karyawan dalam alur tugas.

Tabel 3.7 Kamus Data Positions
| Nama Kolom | Tipe Data | Keterangan |
|---|---|---|
| _id | ObjectId | Berfungsi sebagai primary key unik dari tabel positions. |
| name | String | Menyimpan label nama jabatan dalam organisasi. |
| description | String | Menyimpan penjelasan tugas dan tanggung jawab jabatan. |
| isActive | Boolean | Menentukan status keaktifan jabatan dalam sistem. |
| companyId | ObjectId | Merujuk ke perusahaan tempat jabatan ini dibuat. |
| deletedAt | Date | Menyimpan data waktu saat jabatan dihapus secara soft delete. |
| __v | Number | Version key internal untuk manajemen versi dokumen. |
| createdAt | Date | Menyimpan waktu pembuatan data pertama kali. |
| updatedAt | Date | Menyimpan waktu pembaruan data terakhir kali. |

Fleksibilitas penyesuaian peran organisasi difasilitasi oleh atribut name dan description. Penggunaan field isActive menjaga kelangsungan relasi data jabatan terhadap pengguna yang masih aktif tanpa harus menghapus arsip lama.

---

### 3. Kamus Data Companies (Module Company)

Data profil organisasi atau perusahaan yang terdaftar dalam sistem dikelola melalui tabel companies. Tabel ini menyimpan konfigurasi operasional, fitur tambahan, dan parameter integrasi eksternal perusahaan.

Tabel 3.8 Kamus Data Companies
| Nama Kolom | Tipe Data | Keterangan |
|---|---|---|
| _id | ObjectId | Berfungsi sebagai primary key unik untuk setiap perusahaan. |
| name | String | Menyimpan nama resmi perusahaan. |
| address | String | Menyimpan alamat fisik kantor perusahaan. |
| description | String | Menyimpan deskripsi singkat mengenai unit bisnis perusahaan. |
| ownerId | ObjectId | Merujuk ke pengguna yang bertindak sebagai pemilik perusahaan. |
| managers | Array of ObjectId | Menyimpan daftar referensi pengguna yang memiliki akses manajer. |
| staffs | Array of ObjectId | Menyimpan daftar referensi pengguna yang terdaftar sebagai staf. |
| isActive | Boolean | Status operasional aktif atau tidak aktifnya perusahaan. |
| isFaqActive | Boolean | Status keaktifan integrasi FAQ untuk bantuan eksternal. |
| faqApiKey | String | Kunci API rahasia untuk otentikasi layanan FAQ eksternal. |
| faqExternalCompanyId | Number | Identitas unik perusahaan pada sistem FAQ eksternal. |
| integrationConfig | Object | Menyimpan detail konfigurasi URL dan kunci integrasi sistem eksternal. |
| deletedAt | Date | Waktu penghapusan logis untuk soft delete entitas perusahaan. |
| __v | Number | Version key internal untuk manajemen versi dokumen. |
| createdAt | Date | Menyimpan waktu pembuatan data pertama kali. |
| updatedAt | Date | Menyimpan waktu pembaruan data terakhir kali. |

Pengelompokan user melalui field managers dan staffs mempermudah pembagian hak kontrol operasional di tingkat perusahaan. Pengaturan integrasi pada integrationConfig memfasilitasi pertukaran data login dan verifikasi secara modular dengan platform pihak ketiga.

---

### 4. Kamus Data Invitations (Module Company)

Tabel invitations mencatat riwayat dan status proses perekrutan karyawan baru oleh pihak manajemen perusahaan. Entitas ini digunakan untuk mengamankan proses klaim akun oleh calon staf sebelum bergabung secara resmi.

Tabel 3.9 Kamus Data Invitations
| Nama Kolom | Tipe Data | Keterangan |
|---|---|---|
| _id | ObjectId | Berfungsi sebagai primary key unik dari tabel invitations. |
| companyId | ObjectId | Merujuk ke perusahaan yang mengirimkan undangan kerja. |
| userId | ObjectId | Merujuk ke calon karyawan penerima undangan. |
| role | String | Menyimpan peran organisasi yang ditawarkan kepada penerima undangan. |
| positionId | ObjectId | Merujuk ke jabatan spesifik yang ditawarkan dalam undangan. |
| status | String | Status persetujuan undangan (pending, accepted, rejected, expired, dll). |
| expiresAt | Date | Batas waktu kedaluwarsa keabsahan undangan. |
| deletedAt | Date | Waktu penghapusan logis dari riwayat undangan. |
| __v | Number | Version key internal untuk manajemen versi dokumen. |
| createdAt | Date | Menyimpan waktu pembuatan data pertama kali. |
| updatedAt | Date | Menyimpan waktu pembaruan data terakhir kali. |

Atribut expiresAt menjamin validitas temporer undangan guna mencegah penyalahgunaan token undangan yang sudah lama. Status transisi yang terdokumentasi membantu pelacakan performa rekrutmen internal organisasi secara berkala.

---

### 5. Kamus Data Company Types (Module Template)

Kategori operasional industri perusahaan dikelompokkan ke dalam tabel companytypes guna menentukan templat layanan yang relevan. Pengelompokan ini mempermudah sistem dalam menyajikan katalog layanan yang sesuai dengan jenis bisnis.

Tabel 3.10 Kamus Data Company Types
| Nama Kolom | Tipe Data | Keterangan |
|---|---|---|
| _id | ObjectId | Berfungsi sebagai primary key unik untuk jenis perusahaan. |
| name | String | Menyimpan label nama kategori perusahaan (contoh: IT, Retail). |
| description | String | Menyimpan penjelasan ruang lingkup kategori industri tersebut. |
| __v | Number | Version key internal untuk manajemen versi dokumen. |
| createdAt | Date | Menyimpan waktu pembuatan data pertama kali. |
| updatedAt | Date | Menyimpan waktu pembaruan data terakhir kali. |

Melalui relasi companytypes, standardisasi fitur dan alur kerja untuk tipe bisnis serupa dapat diatur dengan konsisten. Jejak waktu pembuatan mempermudah audit klasifikasi industri yang terdaftar di portal.

---

### 6. Kamus Data Service Templates (Module Template)

Tabel servicetemplates mendefinisikan cetak biru layanan standar yang dapat diaktifkan oleh perusahaan berdasarkan kategori bisnis mereka. Cetak biru ini mencakup kebutuhan alur kerja, form input, dan aturan otorisasi tugas.

Tabel 3.11 Kamus Data Service Templates
| Nama Kolom | Tipe Data | Keterangan |
|---|---|---|
| _id | ObjectId | Berfungsi sebagai primary key unik dari templat layanan. |
| title | String | Menyimpan nama atau judul templat layanan. |
| description | String | Menyimpan deskripsi detail mengenai alur operasional layanan. |
| companyTypeId | ObjectId | Merujuk ke kategori jenis perusahaan yang dapat menggunakan templat ini. |
| accessType | String | Menentukan tingkat aksesibilitas bawaan layanan (public, member_only, internal). |
| draftingWorkOrderType | String | Metode perancangan tugas awal (otomatis atau manual). |
| serviceRequestConfig | Object | Menyimpan skema konfigurasi form pengajuan dan persetujuan bawaan. |
| workOrdersConfig | Array of Object | Menyimpan daftar konfigurasi alur kerja work order bawaan. |
| __v | Number | Version key internal untuk manajemen versi dokumen. |
| createdAt | Date | Menyimpan waktu pembuatan data pertama kali. |
| updatedAt | Date | Menyimpan waktu pembaruan data terakhir kali. |

Struktur nested objek pada serviceRequestConfig mempermudah replikasi form isian secara dinamis tanpa perlu mendesain ulang dari awal. Aturan minimum dan maksimum staf yang diwarisi dari cetak biru ini memastikan kecukupan alokasi SDM saat pengerjaan di lapangan.

---

### 7. Kamus Data Services (Module Service)

Daftar jenis pekerjaan atau layanan operasional aktif milik masing-masing perusahaan dikelola di dalam tabel services. Pengaturan dinamis alur otorisasi pengajuan dan penyelesaian work order disesuaikan pada entitas ini.

Tabel 3.12 Kamus Data Services
| Nama Kolom | Tipe Data | Keterangan |
|---|---|---|
| _id | ObjectId | Berfungsi sebagai primary key unik dari entitas layanan. |
| serviceKey | String | Menyimpan pengenal unik layanan untuk integrasi eksternal. |
| companyId | ObjectId | Merujuk ke perusahaan pemilik layanan terkait. |
| title | String | Menyimpan judul layanan spesifik. |
| description | String | Menyimpan rincian fungsi operasional dari layanan tersebut. |
| accessType | String | Mengatur hak akses pengajuan (public, member_only, internal). |
| isActive | Boolean | Menentukan apakah layanan dapat diakses oleh publik atau pengguna. |
| draftingWorkOrderType | String | Mekanisme pembuatan work order (auto atau manual). |
| serviceRequestConfig | Object | Berisi detail spesifik form intake, review, serta otorisasi persetujuan. |
| workOrdersConfig | Array of Object | Konfigurasi spesifik pengerjaan, pelaporan, dan batasan staf per tahapan. |
| deletedAt | Date | Menyimpan waktu penghapusan logis (soft delete). |
| __v | Number | Version key internal untuk manajemen versi dokumen. |
| createdAt | Date | Menyimpan waktu pembuatan data pertama kali. |
| updatedAt | Date | Menyimpan waktu pembaruan data terakhir kali. |

Penggunaan serviceKey menjamin keunikan identifikasi layanan saat diakses melalui jalur API integrasi eksternal. Fleksibilitas konfigurasi accessType mendukung kontrol keamanan akses data sesuai dengan kebijakan privasi klien.

---

### 8. Kamus Data Service Prices (Module Service Price)

Tabel serviceprices mencatat informasi tarif atau harga dari setiap jenis layanan yang disediakan untuk integrasi transaksi komersial. Data ini memisahkan logika keuangan dari konfigurasi alur operasional layanan itu sendiri.

Tabel 3.13 Kamus Data Service Prices
| Nama Kolom | Tipe Data | Keterangan |
|---|---|---|
| _id | ObjectId | Berfungsi sebagai primary key unik dari tarif layanan. |
| serviceKey | String | Menyimpan pengenal unik layanan terkait. |
| price | Number | Menyimpan nominal tarif layanan dalam satuan numerik. |
| deletedAt | Date | Waktu penghapusan logis dari informasi tarif layanan. |
| createdAt | Date | Menyimpan waktu pembuatan data pertama kali. |
| updatedAt | Date | Menyimpan waktu pembaruan data terakhir kali. |

Penerapan indeks unik gabungan antara serviceKey dan deletedAt mencegah terjadinya duplikasi pencatatan harga untuk satu jenis layanan yang sama. Pemisahan ini menjaga fleksibilitas penyesuaian tarif berkala tanpa mengganggu stabilitas data transaksi berjalan.

---

### 9. Kamus Data Service Requests (Module Service Request)

Pencatatan pengajuan permintaan layanan dari pelanggan kepada perusahaan dikelola di dalam tabel servicerequests. Dokumen ini merekam perkembangan status pengajuan dari tahap penerimaan berkas hingga proses penyelesaian tugas.

Tabel 3.14 Kamus Data Service Requests
| Nama Kolom | Tipe Data | Keterangan |
|---|---|---|
| _id | ObjectId | Berfungsi sebagai primary key unik dari pengajuan layanan. |
| code | String | Kode unik pengenal berkas pengajuan untuk pelacakan. |
| serviceId | ObjectId | Merujuk ke jenis layanan yang diminta oleh pemohon. |
| requestedBy | ObjectId | Merujuk ke pengguna yang mengajukan permintaan layanan. |
| companyId | ObjectId | Merujuk ke perusahaan penyedia layanan yang dituju. |
| serviceRequestApprovalAccessType | String | Metode otorisasi persetujuan pengajuan (auto, manager, PIC, dll). |
| staffPIC | ObjectId | Merujuk ke staf yang ditunjuk sebagai penanggung jawab utama. |
| reviewNeed | Boolean | Menentukan apakah pengajuan membutuhkan peninjauan lanjutan. |
| approvedBy | ObjectId | Merujuk ke penanggung jawab yang menyetujui permintaan. |
| serviceRequestStatus | String | Status sirkulasi pengajuan saat ini (received, approved, completed, dll). |
| intakeFormId | ObjectId | Referensi ke templat form data masukan awal. |
| reviewFormId | ObjectId | Referensi ke templat form data hasil tinjauan. |
| intakeSubmissionId | ObjectId | Referensi ke data submission hasil input form awal. |
| reviewSubmissionId | ObjectId | Referensi ke data submission hasil input form tinjauan. |
| receivedAt ... closedAt | Date | Sekumpulan timestamp untuk melacak waktu perpindahan status pengajuan. |
| deletedAt | Date | Waktu penghapusan logis dari data pengajuan. |
| __v | Number | Version key internal untuk manajemen versi dokumen. |
| createdAt | Date | Menyimpan waktu pembuatan data pertama kali. |
| updatedAt | Date | Menyimpan waktu pembaruan data terakhir kali. |

Penyimpanan riwayat status transition date mempermudah analisis durasi layanan (service level agreement) secara akurat. Relasi terhadap data submission form menjamin data masukan dari klien terekam secara terstruktur dan aman.

---

### 10. Kamus Data Work Orders (Module Work Order)

Tabel workorders menyimpan detail penugasan operasional konkret yang diturunkan dari persetujuan permintaan layanan. Struktur ini mengoordinasikan pengerjaan tugas oleh tim teknis di lapangan.

Tabel 3.15 Kamus Data Work Orders
| Nama Kolom | Tipe Data | Keterangan |
|---|---|---|
| _id | ObjectId | Berfungsi sebagai primary key unik dari lembar kerja. |
| code | String | Kode registrasi unik tugas untuk pencatatan resmi. |
| serviceRequestId | ObjectId | Referensi ke berkas asal pengajuan permintaan layanan. |
| batchId | String | Kode pengelompokan penugasan massal jika ada. |
| createdBy | ObjectId | Pengguna yang menerbitkan lembar kerja tugas terkait. |
| configId | String | Identitas konfigurasi pengerjaan dari cetak biru layanan. |
| serviceId | ObjectId | Referensi ke layanan terkait yang sedang dikerjakan. |
| companyId | ObjectId | Referensi ke perusahaan yang bertanggung jawab atas pengerjaan. |
| approvedBy | ObjectId | Pengguna yang memverifikasi persetujuan pengerjaan tugas. |
| staffPIC | ObjectId | Staf penanggung jawab utama di lapangan. |
| assignedStaff | Array of ObjectId | Daftar staf pelaksana lapangan yang ditugaskan. |
| workOrderFormId | ObjectId | Templat form instruksi pengerjaan tugas khusus. |
| reportFormId | ObjectId | Templat form laporan hasil pengerjaan yang harus diisi. |
| positionId | ObjectId | Jabatan minimum staf pelaksana yang disyaratkan. |
| workOrderApprovalAccessType | String | Mekanisme otorisasi persetujuan tugas lapangan. |
| workReportApprovalAccessType | String | Mekanisme otorisasi persetujuan laporan penyelesaian. |
| minStaff / maxStaff | Number | Batasan jumlah kuota pelaksana yang diizinkan bertugas. |
| status | String | Status pelaksanaan tugas (drafted, sent, completed, dll). |
| has_issue | Boolean | Status indikator adanya kendala operasional lapangan. |
| issue_note | String | Catatan penjelasan kendala yang ditemui di lapangan. |
| draftedAt ... cancelledAt | Date | Jejak waktu perpindahan status operasional tugas. |
| deletedAt | Date | Waktu penghapusan logis berkas tugas. |
| __v | Number | Version key internal untuk manajemen versi dokumen. |
| createdAt | Date | Menyimpan waktu pembuatan data pertama kali. |
| updatedAt | Date | Menyimpan waktu pembaruan data terakhir kali. |

Atribut has_issue and issue_note mempercepat deteksi dan penanganan hambatan teknis yang dihadapi oleh staf pelaksana. Melalui pembatasan kuota minStaff dan maxStaff, sistem mampu meminimalkan risiko ketidakseimbangan beban kerja personel.

---

### 11. Kamus Data Work Reports (Module Work Report)

Pelaporan hasil pelaksanaan tugas oleh tim lapangan didokumentasikan di dalam tabel workreports sebagai bukti penyelesaian pekerjaan. Data laporan ini menjadi dasar bagi manajer untuk memverifikasi kualitas pengerjaan sebelum diserahkan kepada pemohon.

Tabel 3.16 Kamus Data Work Reports
| Nama Kolom | Tipe Data | Keterangan |
|---|---|---|
| _id | ObjectId | Berfungsi sebagai primary key unik dari laporan pengerjaan. |
| workOrderId | ObjectId | Referensi ke lembar kerja asal penugasan terkait. |
| companyId | ObjectId | Referensi ke perusahaan yang mengerjakan laporan ini. |
| reportFormId | ObjectId | Referensi ke templat form pelaporan yang digunakan. |
| approvedBy | ObjectId | Referensi ke verifikator laporan (manajer/supervisor). |
| workReportApprovalAccessType | String | Mekanisme persetujuan kelayakan isi laporan. |
| status | String | Status sirkulasi laporan (drafted, submitted, approved, rejected). |
| startedAt / submittedAt | Date | Timestamp dimulainya pengerjaan dan penyerahan draf laporan. |
| approvedAt / rejectedAt | Date | Timestamp verifikasi akhir kelayakan laporan oleh penyelia. |
| showReportToRequester | Boolean | Status izin penampilan berkas laporan kepada pihak luar/klien. |
| deletedAt | Date | Waktu penghapusan logis berkas laporan pengerjaan. |
| __v | Number | Version key internal untuk manajemen versi dokumen. |
| createdAt | Date | Menyimpan waktu pembuatan data pertama kali. |
| updatedAt | Date | Menyimpan waktu pembaruan data terakhir kali. |

Pengaturan visibilitas melalui showReportToRequester mengamankan informasi operasional sensitif agar tidak terekspos langsung kepada pihak klien jika tidak diperlukan. Jejak waktu persetujuan mempermudah kalkulasi performa kerja aktual dari tim teknis.

---

### 12. Kamus Data Form Templates (Module Form)

Konfigurasi form dinamis untuk pengumpulan data pengajuan dan laporan didefinisikan secara fleksibel dalam tabel formtemplates. Templat form ini menentukan struktur isian data yang harus dilengkapi oleh pengguna.

Tabel 3.17 Kamus Data Form Templates
| Nama Kolom | Tipe Data | Keterangan |
|---|---|---|
| _id | ObjectId | Berfungsi sebagai primary key unik untuk templat form. |
| formKey | String | Kode pengenal unik templat untuk integrasi aplikasi. |
| companyId | ObjectId | Referensi ke perusahaan pemilik konfigurasi form. |
| position | ObjectId | Referensi jabatan yang memiliki wewenang mengakses form ini. |
| title | String | Label judul tampilan dari form dinamis. |
| description | String | Penjelasan panduan pengisian form bagi pengguna. |
| formType | String | Kategori kegunaan form (intake, work_order, report, dll). |
| fields | Array of Object | Skema definisi input field yang wajib tampil pada form. |
| deletedAt | Date | Waktu penghapusan logis dari templat form. |
| __v | Number | Field manual untuk pelacakan revisi versi konfigurasi form. |
| createdAt | Date | Menyimpan waktu pembuatan data pertama kali. |
| updatedAt | Date | Menyimpan waktu pembaruan data terakhir kali. |

Struktur detail input pada fields memungkinkan admin menyesuaikan tipe isian data seperti teks, angka, maupun file sesuai kebutuhan operasional di lapangan. Version key manual (__v) menjamin konsistensi struktur form yang digunakan pada transaksi pengajuan berjalan.

---

### 13. Kamus Data Form Submissions (Module Form)

Data jawaban atau isian formulir dinamis yang telah diisi oleh pengguna disimpan di dalam tabel formsubmissions. Koleksi ini menyimpan hasil aktual dari masukan data pengajuan serta data laporan kerja lapangan.

Tabel 3.18 Kamus Data Form Submissions
| Nama Kolom | Tipe Data | Keterangan |
|---|---|---|
| _id | ObjectId | Berfungsi sebagai primary key unik hasil submission. |
| submissionType | String | Jenis data form yang diserahkan (intake, report, dll). |
| ownerId | ObjectId | Referensi ke entitas pemilik data (contoh: ServiceRequest). |
| formId | ObjectId | Referensi ke templat form asal data masukan. |
| submittedBy | ObjectId | Referensi ke pengguna yang mengirimkan data formulir. |
| fieldsData | Array of Object | Koleksi pasangan index urutan dan nilai jawaban yang diisi. |
| status | String | Status sirkulasi keabsahan pengiriman data submission. |
| submittedAt | Date | Waktu pengiriman berkas submission ke sistem. |
| deletedAt | Date | Waktu penghapusan logis dari submission terkait. |
| __v | Number | Version key internal untuk manajemen versi dokumen. |
| createdAt | Date | Menyimpan waktu pembuatan data pertama kali. |
| updatedAt | Date | Menyimpan waktu pembaruan data terakhir kali. |

Struktur Mixed pada fieldsData memberikan ruang bagi penyimpanan beragam jenis tipe data jawaban tanpa perlu mengubah skema database secara fisik. Keterikatan submission terhadap ownerId memudahkan integrasi data dalam pencarian relasional cepat.

---

### 14. Kamus Data Pairing States (Module Customer Pairing)

Penyimpanan kode verifikasi sementara untuk otentikasi integrasi akun eksternal dikelola di dalam tabel pairingstates. Data ini dirancang memiliki masa aktif yang singkat guna menjaga keamanan sirkulasi pairing kunci akses.

Tabel 3.19 Kamus Data Pairing States
| Nama Kolom | Tipe Data | Keterangan |
|---|---|---|
| _id | ObjectId | Berfungsi sebagai primary key unik dari kode verifikasi pairing. |
| state | String | Kode token acak unik untuk pencocokan transaksi pairing. |
| userId | ObjectId | Referensi ke pengguna yang menginisiasi proses pairing. |
| companyId | ObjectId | Referensi ke perusahaan yang memproses request verifikasi. |
| expiresAt | Date | Batas waktu kedaluwarsa keamanan token pairing. |
| __v | Number | Version key internal untuk manajemen versi dokumen. |
| createdAt | Date | Menyimpan waktu pembuatan data pertama kali. |
| updatedAt | Date | Menyimpan waktu pembaruan data terakhir kali. |

Indeks TTL (Time-To-Live) pada expiresAt secara otomatis menghapus dokumen dari memori database begitu masa aktif token kedaluwarsa. Mekanisme ini meminimalkan penumpukan data sampah sementara di dalam basis data operasional.

---

### 15. Kamus Data External Accounts (Module Customer Pairing)

Tabel externalaccounts memetakan hubungan permanen antara akun terdaftar dalam portal lokal dengan akun pengguna dari sistem eksternal mitra. Pemetaan ini menjamin kelancaran otentikasi login tunggal (single sign-on) lintas platform.

Tabel 3.20 Kamus Data External Accounts
| Nama Kolom | Tipe Data | Keterangan |
|---|---|---|
| _id | ObjectId | Berfungsi sebagai primary key unik dari pemetaan akun eksternal. |
| externalCustomerEmail | String | Surel unik identitas akun pengguna di sistem eksternal. |
| externalCustomerName | String | Nama profil pengguna di sistem eksternal. |
| companyId | ObjectId | Referensi ke perusahaan mitra penyedia sistem eksternal. |
| userId | ObjectId | Referensi ke akun pengguna lokal dalam portal. |
| pairedAt | Date | Timestamp pencatatan persetujuan pemasangan akun pertama kali. |
| expiresAt | Date | Batas kedaluwarsa koneksi integrasi akun jika diatur. |
| integrationType | String | Kategori metode integrasi (external_system atau claim_token). |
| deletedAt | Date | Waktu pemutusan koneksi akun secara soft delete. |
| __v | Number | Version key internal untuk manajemen versi dokumen. |
| createdAt | Date | Menyimpan waktu pembuatan data pertama kali. |
| updatedAt | Date | Menyimpan waktu pembaruan data terakhir kali. |

Indeks unik gabungan antara externalCustomerEmail, companyId, dan deletedAt memastikan satu identitas surel eksternal hanya terhubung dengan tepat satu akun pengguna lokal. Hal ini memperkecil potensi anomali pertukaran data hak keanggotaan.

---

### 16. Kamus Data Membership Codes (Module Membership)

Tabel membershipcodes mengelola kode token klaim untuk registrasi keanggotaan atau klaim benefit layanan oleh pihak luar perusahaan. Kode ini didistribusikan kepada pelanggan eksternal agar mereka dapat memperoleh akses berbayar atau terotentikasi.

Tabel 3.21 Kamus Data Membership Codes
| Nama Kolom | Tipe Data | Keterangan |
|---|---|---|
| _id | ObjectId | Berfungsi sebagai primary key unik dari kode membership. |
| companyId | ObjectId | Referensi perusahaan penerbit token klaim keanggotaan. |
| externalCustomerEmail | String | Alamat surel sasaran utama penerima token klaim. |
| externalCustomerName | String | Nama penerima manfaat yang tertera pada token. |
| token | String | Kunci token klaim unik untuk otentikasi pendaftaran. |
| claimedBy | ObjectId | Referensi ke user lokal yang mengklaim token ini. |
| claimedAt | Date | Waktu keberhasilan proses klaim token oleh pengguna. |
| integrationType | String | Metode jalur verifikasi integrasi keanggotaan. |
| deletedAt | Date | Waktu penghapusan logis dari riwayat keaktifan kode. |
| __v | Number | Version key internal untuk manajemen versi dokumen. |
| createdAt | Date | Menyimpan waktu pembuatan data pertama kali. |
| updatedAt | Date | Menyimpan waktu pembaruan data terakhir kali. |

Status claimedBy dan claimedAt membatasi penggunaan token agar hanya dapat diklaim satu kali oleh pengguna yang berhak. Pencatatan terperinci email sasaran mempercepat proses rekonsiliasi data pelanggan eksternal secara efisien.

---

### 17. Kamus Data Notifications (Module FCM)

Tabel notifications menyimpan log pesan pemberitahuan yang dikirimkan kepada masing-masing pengguna untuk pelacakan histori notifikasi dalam aplikasi. Koleksi ini mendukung retensi data notifikasi agar pengguna tidak melewatkan info penting.

Tabel 3.22 Kamus Data Notifications
| Nama Kolom | Tipe Data | Keterangan |
|---|---|---|
| _id | ObjectId | Berfungsi sebagai primary key unik dari log notifikasi. |
| userId | ObjectId | Referensi ke pengguna tujuan penerima pemberitahuan. |
| title | String | Kepala judul pesan notifikasi. |
| body | String | Rincian isi pesan notifikasi yang dikirimkan. |
| data | Object | Metadata payload tambahan untuk navigasi aplikasi. |
| isRead | Boolean | Status penanda apakah notifikasi sudah dibaca oleh pengguna. |
| readAt | Date | Waktu pengguna membaca pesan notifikasi. |
| __v | Number | Version key internal untuk manajemen versi dokumen. |
| createdAt | Date | Timestamp waktu notifikasi terkirim ke database. |
| updatedAt | Date | Menyimpan waktu pembaruan status log notifikasi. |

Penerapan indeks kedaluwarsa otomatis (expires: '30d') pada field createdAt membantu menjaga ukuran basis data dengan menghapus arsip lama. Payload data digunakan secara fleksibel oleh antarmuka aplikasi untuk mengarahkan pengguna langsung ke halaman tugas terkait.

---

### 18. Kamus Data Active Tokens (Module Auth)

Tabel activetokens menyimpan daftar token sesi otentikasi aktif yang diterbitkan untuk pengguna sistem guna mendukung mekanisme logout instan. Token yang tercatat di sini membatasi masa berlaku akses login untuk menghindari pembajakan sesi.

Tabel 3.23 Kamus Data Active Tokens
| Nama Kolom | Tipe Data | Keterangan |
|---|---|---|
| _id | ObjectId | Berfungsi sebagai primary key unik untuk data token sesi. |
| token | String | String JWT atau token unik sesi login yang aktif. |
| userId | ObjectId | Referensi ke pengguna pemilik token otentikasi tersebut. |
| __v | Number | Version key internal untuk manajemen versi dokumen. |
| createdAt | Date | Menyimpan waktu pembuatan sesi login pertama kali. |
| updatedAt | Date | Menyimpan waktu pembaruan token sesi terakhir kali. |

Validasi keberadaan token di dalam tabel ini berfungsi sebagai gerbang pengaman tambahan pada proses autentikasi (token verification). Begitu pengguna melakukan logout, data token terkait langsung dihapus sehingga sesi akses segera dinyatakan tidak berlaku.
