import { Types } from 'mongoose';
import { SubmissionType } from '../common/enums/submission-type.enum';
import { ApprovalAccessType } from '../common/enums/approval-access-type.enum';
import { FieldType } from '../common/enums/field-type.enum';

export const COMPANY_TYPE_IDS = {
  Telekomunikasi: new Types.ObjectId('665000000000000000000001'),
  Logistik: new Types.ObjectId('665000000000000000000002'),
  Kontruksi: new Types.ObjectId('665000000000000000000003'),
  Otomotif: new Types.ObjectId('665000000000000000000004'),
};

export const companyTypesData = [
  {
    _id: COMPANY_TYPE_IDS.Telekomunikasi,
    name: 'Telekomunikasi',
    description:
      'Perusahaan yang bergerak dibidang jasa telekomunikasi.',
  },
  {
    _id: COMPANY_TYPE_IDS.Logistik,
    name: 'Logistik',
    description:
      'Perusahaan yang bergerak dibidang jasa logistik.',
  },
  {
    _id: COMPANY_TYPE_IDS.Kontruksi,
    name: 'Kontruksi',
    description:
      'Perusahaan yang bergerak dibidang jasa kontruksi.',
  },
  {
    _id: COMPANY_TYPE_IDS.Otomotif,
    name: 'Otomotif',
    description:
      'Perusahaan yang bergerak dibidang jasa otomotif.',
  },
];

export const serviceTemplatesData = [
  // ── Telekomunikasi ──────────────────────────────────────
  {
    title: 'Pemasangan Koneksi Internet',
    description: 'Instalasi koneksi internet untuk pelanggan publik.',
    companyTypeId: COMPANY_TYPE_IDS.Telekomunikasi,
    accessType: 'public',
    draftingWorkOrderType: 'manual',
    serviceRequestConfig: {
      serviceRequestApprovalAccessType: ApprovalAccessType.MANAGER,
      reviewNeed: true,
      intakeForm: {
        title: 'Formulir Permintaan Pemasangan Internet',
        description: 'Ajukan pemasangan jaringan internet baru untuk lokasi Anda.',
        formType: SubmissionType.Intake,
        fields: [
          { order: 1, label: 'Alamat Pemasangan', type: FieldType.Textarea, required: true, placeholder: 'Alamat lengkap lokasi pemasangan...' },
          { order: 2, label: 'Paket Kecepatan', type: FieldType.SingleSelect, required: true, options: [{ key: '50mbps', value: '50 Mbps' }, { key: '100mbps', value: '100 Mbps' }, { key: '200mbps', value: '200 Mbps' }] },
          { order: 3, label: 'Metode Pembayaran', type: FieldType.SingleSelect, required: true, options: [{ key: 'transfer', value: 'Transfer Bank' }, { key: 'cc', value: 'Kartu Kredit' }] }
        ]
      },
      reviewForm: {
        title: 'Ulasan Pemasangan Internet',
        description: 'Berikan ulasan Anda setelah proses instalasi internet selesai.',
        formType: SubmissionType.Review,
        fields: [
          { order: 1, label: 'Kualitas Koneksi', type: FieldType.SingleSelect, required: true, options: [{ key: 'stabil', value: 'Stabil & Cepat' }, { key: 'cukup', value: 'Cukup Stabil' }, { key: 'lambat', value: 'Lambat / Sering Terputus' }] },
          { order: 2, label: 'Komentar & Saran', type: FieldType.Textarea, required: false }
        ]
      }
    },
    workOrdersConfig: [
      {
        configId: null,
        positionsOnDuty: { name: 'Teknisi Jaringan', description: 'Tim teknisi yang melakukan instalasi perkabelan dan konfigurasi modem.' },
        workOrderApprovalAccessType: ApprovalAccessType.AUTO,
        workReportApprovalAccessType: ApprovalAccessType.MANAGER,
        showReportToRequester: false,
        minStaff: 1,
        maxStaff: 2,
        workOrderForm: {
          title: 'Instruksi Kerja Instalasi Jaringan',
          description: 'Panduan konfigurasi port dan penarikan kabel modem.',
          formType: SubmissionType.WorkOrder,
          fields: [
            { order: 1, label: 'Port ODP yang Digunakan', type: FieldType.Text, required: true },
            { order: 2, label: 'Panjang Kabel (meter)', type: FieldType.Text, required: true }
          ]
        },
        workReportForm: {
          title: 'Laporan Hasil Instalasi Internet',
          description: 'Laporan teknis penyelesaian pemasangan internet.',
          formType: SubmissionType.Report,
          fields: [
            { order: 1, label: 'Status Pemasangan', type: FieldType.SingleSelect, required: true, options: [{ key: 'sukses', value: 'Sukses Terkoneksi' }, { key: 'kendala', value: 'Ada Kendala Redaman Tinggi' }] },
            { order: 2, label: 'Foto Redaman OPM', type: FieldType.Image, required: true }
          ]
        }
      }
    ]
  },
  {
    title: 'Pemeriksaan Billing',
    description: 'Pemeriksaan tagihan internet bagi pelanggan publik.',
    companyTypeId: COMPANY_TYPE_IDS.Telekomunikasi,
    accessType: 'public',
    draftingWorkOrderType: 'auto',
    serviceRequestConfig: {
      serviceRequestApprovalAccessType: ApprovalAccessType.MANAGER,
      reviewNeed: true,
      intakeForm: {
        title: 'Formulir Pengaduan Billing',
        description: 'Laporkan ketidaksesuaian tagihan internet Anda.',
        formType: SubmissionType.Intake,
        fields: [
          { order: 1, label: 'Nomor Pelanggan', type: FieldType.Text, required: true },
          { order: 2, label: 'Bulan Tagihan', type: FieldType.SingleSelect, required: true, options: [{ key: 'jan', value: 'Januari' }, { key: 'feb', value: 'Februari' }, { key: 'mar', value: 'Maret' }] },
          { order: 3, label: 'Detail Keluhan', type: FieldType.Textarea, required: true }
        ]
      },
      reviewForm: {
        title: 'Ulasan Pengaduan Billing',
        description: 'Penilaian atas respons penyelesaian keluhan tagihan.',
        formType: SubmissionType.Review,
        fields: [
          { order: 1, label: 'Kesesuaian Solusi', type: FieldType.SingleSelect, required: true, options: [{ key: 'sesuai', value: 'Sesuai, tagihan telah dikoreksi' }, { key: 'tidak', value: 'Tidak Sesuai' }] }
        ]
      }
    },
    workOrdersConfig: [
      {
        configId: null,
        positionsOnDuty: { name: 'Staf Billing & Keuangan', description: 'Staf yang memverifikasi mutasi dan data billing pelanggan.' },
        workOrderApprovalAccessType: ApprovalAccessType.AUTO,
        workReportApprovalAccessType: ApprovalAccessType.AUTO,
        showReportToRequester: false,
        minStaff: 1,
        maxStaff: 1,

        workReportForm: {
          title: 'Laporan Verifikasi Billing',
          description: 'Hasil investigasi atas keluhan tagihan.',
          formType: SubmissionType.Report,
          fields: [
            { order: 1, label: 'Hasil Koreksi Tagihan', type: FieldType.SingleSelect, required: true, options: [{ key: 'koreksi', value: 'Kredit Tagihan Diberikan' }, { key: 'sesuai', value: 'Tagihan Asli Sudah Benar' }] },
            { order: 2, label: 'Bukti Screen Billing System', type: FieldType.Image, required: true }
          ]
        }
      }
    ]
  },
  // ── Logistik ──────────────────────────────────────
  {
    title: 'Pengiriman Barang',
    description: 'Layanan pengiriman barang untuk anggota.',
    companyTypeId: COMPANY_TYPE_IDS.Logistik,
    accessType: 'member_only',
    draftingWorkOrderType: 'manual',
    serviceRequestConfig: {
      serviceRequestApprovalAccessType: ApprovalAccessType.MANAGER,
      reviewNeed: true,
      intakeForm: {
        title: 'Formulir Permintaan Pengiriman Barang',
        description: 'Ajukan pengiriman paket/barang khusus anggota.',
        formType: SubmissionType.Intake,
        fields: [
          { order: 1, label: 'Nama Barang & Deskripsi', type: FieldType.Textarea, required: true },
          { order: 2, label: 'Berat Barang (kg)', type: FieldType.Text, required: true },
          { order: 3, label: 'Alamat Penerima', type: FieldType.Textarea, required: true }
        ]
      },
      reviewForm: {
        title: 'Ulasan Layanan Pengiriman',
        description: 'Penilaian ketepatan waktu dan kondisi barang saat diterima.',
        formType: SubmissionType.Review,
        fields: [
          { order: 1, label: 'Kondisi Paket', type: FieldType.SingleSelect, required: true, options: [{ key: 'aman', value: 'Sempurna / Tidak Rusak' }, { key: 'rusak', value: 'Ada Kerusakan' }] }
        ]
      }
    },
    workOrdersConfig: [
      {
        configId: null,
        positionsOnDuty: { name: 'Kurir Lapangan', description: 'Kurir internal yang melakukan penjemputan dan pengantaran barang.' },
        workOrderApprovalAccessType: ApprovalAccessType.AUTO,
        workReportApprovalAccessType: ApprovalAccessType.MANAGER,
        showReportToRequester: false,
        minStaff: 1,
        maxStaff: 1,
        workOrderForm: {
          title: 'Instruksi Pengantaran Paket',
          description: 'Rute penjemputan dan pengantaran paket.',
          formType: SubmissionType.WorkOrder,
          fields: [
            { order: 1, label: 'Rute Prioritas', type: FieldType.Textarea, required: true }
          ]
        },
        workReportForm: {
          title: 'Laporan Kurir Selesai Kirim',
          description: 'Bukti serah terima barang kepada penerima.',
          formType: SubmissionType.Report,
          fields: [
            { order: 1, label: 'Diterima Oleh', type: FieldType.Text, required: true },
            { order: 2, label: 'Foto Serah Terima Paket', type: FieldType.Image, required: true }
          ]
        }
      }
    ]
  },
  // ── Kontruksi ──────────────────────────────────────
  {
    title: 'Perbaikan Ruangan',
    description: 'Perbaikan ruangan untuk anggota.',
    companyTypeId: COMPANY_TYPE_IDS.Kontruksi,
    accessType: 'member_only',
    draftingWorkOrderType: 'auto',
    serviceRequestConfig: {
      serviceRequestApprovalAccessType: ApprovalAccessType.MANAGER,
      reviewNeed: true,
      intakeForm: {
        title: 'Formulir Request Perbaikan Ruangan',
        description: 'Ajukan perbaikan fisik ruangan kantor/toko.',
        formType: SubmissionType.Intake,
        fields: [
          { order: 1, label: 'Ruangan & Area', type: FieldType.Text, required: true, placeholder: 'contoh: Ruang Meeting / Pantry' },
          { order: 2, label: 'Jenis Perbaikan', type: FieldType.SingleSelect, required: true, options: [{ key: 'dinding', value: 'Cat / Retak Dinding' }, { key: 'pintu', value: 'Pintu / Engsel' }, { key: 'atap', value: 'Kebocoran Atap / Plafon' }] },
          { order: 3, label: 'Deskripsi Detail', type: FieldType.Textarea, required: true }
        ]
      },
      reviewForm: {
        title: 'Ulasan Hasil Perbaikan Ruangan',
        description: 'Penilaian kerapian dan kebersihan hasil pengerjaan.',
        formType: SubmissionType.Review,
        fields: [
          { order: 1, label: 'Kerapian Hasil', type: FieldType.SingleSelect, required: true, options: [{ key: 'rapi', value: 'Rapi & Bersih' }, { key: 'kurang', value: 'Kurang Rapi / Kotor' }] }
        ]
      }
    },
    workOrdersConfig: [
      {
        configId: null,
        positionsOnDuty: { name: 'Teknisi Sipil & Bangunan', description: 'Teknisi yang menangani renovasi interior, pengecatan, dan kebocoran gedung.' },
        workOrderApprovalAccessType: ApprovalAccessType.AUTO,
        workReportApprovalAccessType: ApprovalAccessType.MANAGER,
        showReportToRequester: false,
        minStaff: 1,
        maxStaff: 3,

        workReportForm: {
          title: 'Laporan Pekerjaan Sipil Selesai',
          description: 'Dokumentasi foto sebelum dan sesudah renovasi.',
          formType: SubmissionType.Report,
          fields: [
            { order: 1, label: 'Hasil Pekerjaan', type: FieldType.Textarea, required: true },
            { order: 2, label: 'Foto After Perbaikan', type: FieldType.Image, required: true }
          ]
        }
      }
    ]
  },
  // ── Otomotif ──────────────────────────────────────
  {
    title: 'Perbaikan Kendaraan Roda Dua',
    description: 'Perbaikan kendaraan roda dua untuk publik.',
    companyTypeId: COMPANY_TYPE_IDS.Otomotif,
    accessType: 'public',
    draftingWorkOrderType: 'auto',
    serviceRequestConfig: {
      serviceRequestApprovalAccessType: ApprovalAccessType.MANAGER,
      reviewNeed: true,
      intakeForm: {
        title: 'Formulir Pendaftaran Servis Motor',
        description: 'Daftarkan servis rutin atau perbaikan sepeda motor Anda.',
        formType: SubmissionType.Intake,
        fields: [
          { order: 1, label: 'Merk & Model Motor', type: FieldType.Text, required: true },
          { order: 2, label: 'Nomor Polisi', type: FieldType.Text, required: true },
          { order: 3, label: 'Keluhan Servis', type: FieldType.Textarea, required: true }
        ]
      },
      reviewForm: {
        title: 'Ulasan Servis Motor',
        description: 'Penilaian performa motor setelah dilakukan servis.',
        formType: SubmissionType.Review,
        fields: [
          { order: 1, label: 'Kondisi Mesin', type: FieldType.SingleSelect, required: true, options: [{ key: 'halus', value: 'Lebih Halus & Bertenaga' }, { key: 'sama', value: 'Sama Saja' }, { key: 'masalah', value: 'Masih Bermasalah' }] }
        ]
      }
    },
    workOrdersConfig: [
      {
        configId: null,
        positionsOnDuty: { name: 'Mekanik Sepeda Motor', description: 'Mekanik spesialis sepeda motor roda dua.' },
        workOrderApprovalAccessType: ApprovalAccessType.AUTO,
        workReportApprovalAccessType: ApprovalAccessType.AUTO,
        showReportToRequester: false,
        minStaff: 1,
        maxStaff: 1,

        workReportForm: {
          title: 'Laporan Pekerjaan Servis Motor',
          description: 'Detail penggantian suku cadang dan penyetelan motor.',
          formType: SubmissionType.Report,
          fields: [
            { order: 1, label: 'Suku Cadang Yang Diganti', type: FieldType.Textarea, required: true },
            { order: 2, label: 'Foto Kwitansi & Motor Selesai', type: FieldType.Image, required: true }
          ]
        }
      }
    ]
  },
  {
    title: 'Perbaikan Kendaraan Roda Empat',
    description: 'Perbaikan kendaraan roda empat untuk publik.',
    companyTypeId: COMPANY_TYPE_IDS.Otomotif,
    accessType: 'public',
    draftingWorkOrderType: 'auto',
    serviceRequestConfig: {
      serviceRequestApprovalAccessType: ApprovalAccessType.MANAGER,
      reviewNeed: true,
      intakeForm: {
        title: 'Formulir Pendaftaran Servis Mobil',
        description: 'Daftarkan servis rutin atau perbaikan mobil Anda.',
        formType: SubmissionType.Intake,
        fields: [
          { order: 1, label: 'Merk & Model Mobil', type: FieldType.Text, required: true },
          { order: 2, label: 'Nomor Polisi', type: FieldType.Text, required: true },
          { order: 3, label: 'Keluhan / Permintaan Servis', type: FieldType.Textarea, required: true }
        ]
      },
      reviewForm: {
        title: 'Ulasan Servis Mobil',
        description: 'Penilaian kenyamanan berkendara setelah servis.',
        formType: SubmissionType.Review,
        fields: [
          { order: 1, label: 'Kenyamanan Mobil', type: FieldType.SingleSelect, required: true, options: [{ key: 'sangat_nyaman', value: 'Sangat Nyaman / Responsif' }, { key: 'cukup', value: 'Cukup Nyaman' }] }
        ]
      }
    },
    workOrdersConfig: [
      {
        configId: null,
        positionsOnDuty: { name: 'Mekanik Mobil', description: 'Mekanik senior spesialis mobil roda empat.' },
        workOrderApprovalAccessType: ApprovalAccessType.AUTO,
        workReportApprovalAccessType: ApprovalAccessType.MANAGER,
        showReportToRequester: false,
        minStaff: 1,
        maxStaff: 2,

        workReportForm: {
          title: 'Laporan Pekerjaan Servis Mobil',
          description: 'Detail pengerjaan mekanik untuk mobil roda empat.',
          formType: SubmissionType.Report,
          fields: [
            { order: 1, label: 'Daftar Pekerjaan & Suku Cadang', type: FieldType.Textarea, required: true },
            { order: 2, label: 'Foto Pekerjaan di Kolong / Mesin', type: FieldType.Image, required: true }
          ]
        }
      }
    ]
  },
  // ── Telekomunikasi (Perseroan Terbatas) ──────────────────────────────────────────────
  {
    title: 'Perbaikan & Pemeliharaan Fasilitas Kantor',
    description:
      'Layanan penanganan kerusakan dan pemeliharaan rutin aset fisik kantor, meliputi AC, plumbing, kelistrikan, dan furnitur.',
    companyTypeId: COMPANY_TYPE_IDS.Telekomunikasi,
    accessType: 'internal',
    draftingWorkOrderType: 'manual',
    serviceRequestConfig: {
      serviceRequestApprovalAccessType: ApprovalAccessType.MANAGER,
      reviewNeed: true,
      intakeForm: {
        title: 'Formulir Permintaan Perbaikan Fasilitas',
        description: 'Ajukan permintaan perbaikan atau pemeliharaan fasilitas kantor.',
        formType: SubmissionType.Intake,
        fields: [
          { order: 1, label: 'Lokasi Kerusakan', type: FieldType.Text, required: true, placeholder: 'contoh: Lantai 3, Ruang Meeting A' },
          { order: 2, label: 'Jenis Kerusakan', type: FieldType.SingleSelect, required: true, options: [{ key: 'ac', value: 'AC / Pendingin Ruangan' }, { key: 'listrik', value: 'Instalasi Listrik' }, { key: 'plumbing', value: 'Pipa / Saluran Air' }, { key: 'furnitur', value: 'Furnitur & Perabot' }, { key: 'lainnya', value: 'Lainnya' }] },
          { order: 3, label: 'Deskripsi Kerusakan', type: FieldType.Textarea, required: true, placeholder: 'Jelaskan kondisi kerusakan secara detail...' },
          { order: 4, label: 'Foto Kerusakan', type: FieldType.Image, required: false },
          { order: 5, label: 'Tingkat Urgensi', type: FieldType.SingleSelect, required: true, options: [{ key: 'rendah', value: 'Rendah' }, { key: 'sedang', value: 'Sedang' }, { key: 'tinggi', value: 'Tinggi (Menghambat Operasional)' }] },
        ],
      },
      reviewForm: {
        title: 'Evaluasi Perbaikan Fasilitas',
        description: 'Penilaian kepuasan terhadap hasil perbaikan yang telah dilakukan.',
        formType: SubmissionType.Review,
        fields: [
          { order: 1, label: 'Hasil Perbaikan Sesuai Harapan?', type: FieldType.SingleSelect, required: true, options: [{ key: 'ya', value: 'Ya, sudah sesuai' }, { key: 'belum', value: 'Belum sepenuhnya' }, { key: 'tidak', value: 'Tidak sesuai' }] },
          { order: 2, label: 'Penilaian Kecepatan Respons', type: FieldType.SingleSelect, required: true, options: [{ key: 'cepat', value: 'Cepat' }, { key: 'sedang', value: 'Cukup' }, { key: 'lambat', value: 'Lambat' }] },
          { order: 3, label: 'Catatan Tambahan', type: FieldType.Textarea, required: false, placeholder: 'Masukan atau saran untuk tim teknisi...' },
        ],
      },
    },
    workOrdersConfig: [
      {
        configId: null,
        positionsOnDuty: { name: 'Teknisi Fasilitas', description: 'Tim teknisi internal yang menangani perbaikan dan pemeliharaan gedung.' },
        workOrderApprovalAccessType: ApprovalAccessType.AUTO,
        workReportApprovalAccessType: ApprovalAccessType.MANAGER,
        showReportToRequester: false,
        minStaff: 1,
        maxStaff: 3,
        workOrderForm: {
          title: 'Formulir Instruksi Kerja Perbaikan',
          description: 'Panduan teknis untuk pelaksanaan perbaikan fasilitas.',
          formType: SubmissionType.WorkOrder,
          fields: [
            { order: 1, label: 'Langkah Pengerjaan', type: FieldType.Textarea, required: true, placeholder: 'Uraikan langkah-langkah perbaikan...' },
            { order: 2, label: 'Alat & Material Dibutuhkan', type: FieldType.Textarea, required: true, placeholder: 'Daftar alat dan bahan...' },
            { order: 3, label: 'Estimasi Waktu Penyelesaian (jam)', type: FieldType.Text, required: true, placeholder: 'contoh: 2' },
          ],
        },
        workReportForm: {
          title: 'Laporan Penyelesaian Perbaikan Fasilitas',
          description: 'Dokumentasi hasil perbaikan yang telah dilakukan oleh teknisi.',
          formType: SubmissionType.Report,
          fields: [
            { order: 1, label: 'Tindakan yang Dilakukan', type: FieldType.Textarea, required: true, placeholder: 'Jelaskan pekerjaan yang telah diselesaikan...' },
            { order: 2, label: 'Kondisi Setelah Perbaikan', type: FieldType.SingleSelect, required: true, options: [{ key: 'normal', value: 'Normal / Berfungsi penuh' }, { key: 'partial', value: 'Sebagian teratasi' }, { key: 'perlu_lanjutan', value: 'Perlu tindak lanjut' }] },
            { order: 3, label: 'Foto Hasil Perbaikan', type: FieldType.Image, required: true },
            { order: 4, label: 'Material yang Digunakan', type: FieldType.Textarea, required: false, placeholder: 'Daftar material yang terpakai...' },
          ],
        },
      },
    ],
  },
  {
    title: 'Pengadaan & Peminjaman Inventaris IT',
    description:
      'Layanan permintaan perangkat IT (laptop, monitor, aksesoris) untuk kebutuhan kerja karyawan, baik peminjaman sementara maupun pengadaan tetap.',
    companyTypeId: COMPANY_TYPE_IDS.Telekomunikasi,
    accessType: 'internal',
    draftingWorkOrderType: 'auto',
    serviceRequestConfig: {
      serviceRequestApprovalAccessType: ApprovalAccessType.MANAGER,
      reviewNeed: false,
      intakeForm: {
        title: 'Formulir Permintaan Inventaris IT',
        description: 'Ajukan kebutuhan perangkat IT untuk keperluan kerja.',
        formType: SubmissionType.Intake,
        fields: [
          { order: 1, label: 'Jenis Perangkat', type: FieldType.SingleSelect, required: true, options: [{ key: 'laptop', value: 'Laptop' }, { key: 'monitor', value: 'Monitor' }, { key: 'keyboard', value: 'Keyboard & Mouse' }, { key: 'headset', value: 'Headset' }, { key: 'lainnya', value: 'Lainnya' }] },
          { order: 2, label: 'Jumlah Unit', type: FieldType.Text, required: true, placeholder: 'contoh: 2' },
          { order: 3, label: 'Tujuan Penggunaan', type: FieldType.Textarea, required: true, placeholder: 'Jelaskan untuk keperluan apa perangkat ini dibutuhkan...' },
          { order: 4, label: 'Durasi Peminjaman', type: FieldType.SingleSelect, required: true, options: [{ key: 'permanen', value: 'Permanen (Pengadaan)' }, { key: '1_minggu', value: '1 Minggu' }, { key: '1_bulan', value: '1 Bulan' }, { key: 'lainnya', value: 'Lainnya' }] },
        ],
      },
      reviewForm: {
        title: 'Evaluasi Program Beasiswa',
        description: 'Penilaian dari penerima beasiswa terhadap program yang dijalankan Otomotif.',
        formType: SubmissionType.Review,
        fields: [
          { order: 1, label: 'Program Beasiswa Membantu Pendidikan Anda?', type: FieldType.SingleSelect, required: true, options: [{ key: 'sangat', value: 'Sangat Membantu' }, { key: 'cukup', value: 'Cukup Membantu' }, { key: 'kurang', value: 'Kurang Membantu' }] },
          { order: 2, label: 'Kepuasan atas Proses Seleksi', type: FieldType.SingleSelect, required: true, options: [{ key: 'transparan', value: 'Transparan & Adil' }, { key: 'cukup', value: 'Cukup Baik' }, { order: 3, key: 'perlu_perbaikan', value: 'Perlu Perbaikan' }] },
          { order: 3, label: 'Saran untuk Program Beasiswa', type: FieldType.Textarea, required: false },
        ],
      },
    },
    workOrdersConfig: [
      {
        configId: null,
        positionsOnDuty: { name: 'Tim IT Support', description: 'Tim IT yang mengelola inventaris dan distribusi perangkat teknologi.' },
        workOrderApprovalAccessType: ApprovalAccessType.AUTO,
        workReportApprovalAccessType: ApprovalAccessType.AUTO,
        showReportToRequester: false,
        minStaff: 1,
        maxStaff: 2,

        workReportForm: {
          title: 'Laporan Serah Terima Perangkat IT',
          description: 'Dokumentasi serah terima perangkat IT kepada pemohon.',
          formType: SubmissionType.Report,
          fields: [
            { order: 1, label: 'Perangkat yang Diserahkan', type: FieldType.Textarea, required: true, placeholder: 'Nama perangkat, nomor seri, kondisi...' },
            { order: 2, label: 'Kondisi Perangkat', type: FieldType.SingleSelect, required: true, options: [{ key: 'baru', value: 'Baru' }, { key: 'baik', value: 'Bekas - Kondisi Baik' }, { key: 'cukup', value: 'Bekas - Kondisi Cukup' }] },
            { order: 3, label: 'Foto Serah Terima', type: FieldType.Image, required: true },
          ],
        },
      },
    ],
  },
  {
    title: 'Layanan Sertifikasi & Legalisasi Dokumen Perusahaan',
    description:
      'Pengurusan legalisasi, apostille, dan sertifikasi dokumen resmi perusahaan seperti akta, NPWP, NIB, dan dokumen hukum lainnya.',
    companyTypeId: COMPANY_TYPE_IDS.Telekomunikasi,
    accessType: 'member_only',
    draftingWorkOrderType: 'manual',
    serviceRequestConfig: {
      serviceRequestApprovalAccessType: ApprovalAccessType.MANAGER,
      reviewNeed: true,
      intakeForm: {
        title: 'Formulir Permintaan Legalisasi Dokumen',
        description: 'Ajukan dokumen yang memerlukan proses legalisasi atau sertifikasi resmi.',
        formType: SubmissionType.Intake,
        fields: [
          { order: 1, label: 'Jenis Dokumen', type: FieldType.SingleSelect, required: true, options: [{ key: 'akta', value: 'Akta Pendirian / Perubahan' }, { key: 'npwp', value: 'NPWP Perusahaan' }, { key: 'nib', value: 'NIB (Nomor Induk Berusaha)' }, { key: 'sk', value: 'SK Kemenkumham' }, { key: 'lainnya', value: 'Lainnya' }] },
          { order: 2, label: 'Tujuan Legalisasi', type: FieldType.Textarea, required: true, placeholder: 'Jelaskan tujuan penggunaan dokumen yang dilegalisasi...' },
          { order: 3, label: 'Upload Dokumen Asli', type: FieldType.Image, required: true },
          { order: 4, label: 'Deadline yang Diharapkan', type: FieldType.Text, required: false, placeholder: 'contoh: 15 Januari 2025' },
        ],
      },
      reviewForm: {
        title: 'Evaluasi Layanan Legalisasi Dokumen',
        description: 'Penilaian atas proses dan hasil legalisasi dokumen yang diterima.',
        formType: SubmissionType.Review,
        fields: [
          { order: 1, label: 'Dokumen Sesuai Kebutuhan?', type: FieldType.SingleSelect, required: true, options: [{ key: 'ya', value: 'Ya, lengkap dan sesuai' }, { key: 'sebagian', value: 'Sebagian sesuai' }, { key: 'tidak', value: 'Tidak sesuai' }] },
          { order: 2, label: 'Kepuasan Keseluruhan', type: FieldType.SingleSelect, required: true, options: [{ key: 'puas', value: 'Sangat Puas' }, { key: 'cukup', value: 'Cukup Puas' }, { key: 'kurang', value: 'Kurang Puas' }] },
          { order: 3, label: 'Masukan', type: FieldType.Textarea, required: false },
        ],
      },
    },
    workOrdersConfig: [
      {
        configId: null,
        positionsOnDuty: { name: 'Tim Legal & Compliance', description: 'Tim hukum yang menangani dokumen legal dan perizinan perusahaan.' },
        workOrderApprovalAccessType: ApprovalAccessType.AUTO,
        workReportApprovalAccessType: ApprovalAccessType.MANAGER,
        showReportToRequester: false,
        minStaff: 1,
        maxStaff: 2,
        workOrderForm: {
          title: 'Instruksi Kerja Pengurusan Legalisasi',
          description: 'Panduan langkah pengurusan legalisasi dokumen resmi.',
          formType: SubmissionType.WorkOrder,
          fields: [
            { order: 1, label: 'Instansi yang Dituju', type: FieldType.Text, required: true, placeholder: 'contoh: Kemenkumham, Notaris, Dinas Perdagangan' },
            { order: 2, label: 'Dokumen Persyaratan yang Disiapkan', type: FieldType.Textarea, required: true, placeholder: 'Daftar dokumen pendukung yang perlu disiapkan...' },
            { order: 3, label: 'Catatan Khusus', type: FieldType.Textarea, required: false },
          ],
        },
        workReportForm: {
          title: 'Laporan Hasil Legalisasi Dokumen',
          description: 'Dokumentasi hasil pengurusan legalisasi dokumen.',
          formType: SubmissionType.Report,
          fields: [
            { order: 1, label: 'Status Penyelesaian', type: FieldType.SingleSelect, required: true, options: [{ key: 'selesai', value: 'Selesai & Dokumen Diserahkan' }, { key: 'proses', value: 'Masih Dalam Proses' }, { key: 'kendala', value: 'Terdapat Kendala' }] },
            { order: 2, label: 'Nomor Referensi / Tracking', type: FieldType.Text, required: false, placeholder: 'Nomor tracking atau referensi dari instansi...' },
            { order: 3, label: 'Foto / Scan Dokumen Hasil', type: FieldType.Image, required: true },
            { order: 4, label: 'Catatan Penyelesaian', type: FieldType.Textarea, required: true },
          ],
        },
      },
    ],
  },
  // ── Kontruksi (Commanditaire Vennootschap) ─────────────────────────────────────
  {
    title: 'Jasa Instalasi & Renovasi Ringan',
    description:
      'Layanan pemasangan, renovasi, dan pengerjaan konstruksi ringan untuk kebutuhan klien, mencakup pemasangan partisi, instalasi listrik ringan, dan cat dinding.',
    companyTypeId: COMPANY_TYPE_IDS.Kontruksi,
    accessType: 'public',
    draftingWorkOrderType: 'manual',
    serviceRequestConfig: {
      serviceRequestApprovalAccessType: ApprovalAccessType.AUTO,
      reviewNeed: true,
      intakeForm: {
        title: 'Formulir Permintaan Jasa Instalasi & Renovasi',
        description: 'Sampaikan kebutuhan renovasi atau instalasi Anda kepada tim kami.',
        formType: SubmissionType.Intake,
        fields: [
          { order: 1, label: 'Nama Pemohon / Klien', type: FieldType.Text, required: true, placeholder: 'Nama lengkap...' },
          { order: 2, label: 'Nomor Telepon', type: FieldType.Text, required: true, placeholder: '08xxxxxxxxxx' },
          { order: 3, label: 'Alamat Lokasi Pengerjaan', type: FieldType.Textarea, required: true, placeholder: 'Alamat lengkap lokasi...' },
          { order: 4, label: 'Jenis Pekerjaan', type: FieldType.SingleSelect, required: true, options: [{ key: 'partisi', value: 'Pemasangan Partisi / Sekat' }, { key: 'listrik', value: 'Instalasi Listrik' }, { key: 'cat', value: 'Pengecatan Dinding' }, { key: 'plafon', value: 'Pemasangan Plafon' }, { key: 'lainnya', value: 'Lainnya' }] },
          { order: 5, label: 'Deskripsi Detail Pekerjaan', type: FieldType.Textarea, required: true, placeholder: 'Jelaskan detail kebutuhan renovasi...' },
          { order: 6, label: 'Foto Kondisi Saat Ini', type: FieldType.Image, required: false },
        ],
      },
      reviewForm: {
        title: 'Ulasan Jasa Renovasi',
        description: 'Berikan ulasan atas hasil pengerjaan tim kami.',
        formType: SubmissionType.Review,
        fields: [
          { order: 1, label: 'Kualitas Hasil Pengerjaan', type: FieldType.SingleSelect, required: true, options: [{ key: 'sangat_baik', value: 'Sangat Baik' }, { key: 'baik', value: 'Baik' }, { key: 'cukup', value: 'Cukup' }, { key: 'kurang', value: 'Kurang Memuaskan' }] },
          { order: 2, label: 'Ketepatan Waktu', type: FieldType.SingleSelect, required: true, options: [{ key: 'tepat', value: 'Tepat Waktu' }, { key: 'terlambat_sedikit', value: 'Sedikit Terlambat' }, { key: 'terlambat', value: 'Terlambat' }] },
          { order: 3, label: 'Rekomendasi ke Rekan?', type: FieldType.SingleSelect, required: true, options: [{ key: 'ya', value: 'Ya, akan merekomendasikan' }, { key: 'mungkin', value: 'Mungkin' }, { key: 'tidak', value: 'Tidak' }] },
          { order: 4, label: 'Komentar / Saran', type: FieldType.Textarea, required: false },
        ],
      },
    },
    workOrdersConfig: [
      {
        configId: null,
        positionsOnDuty: { name: 'Tim Lapangan & Teknisi', description: 'Pekerja lapangan yang mengeksekusi pekerjaan instalasi dan renovasi.' },
        workOrderApprovalAccessType: ApprovalAccessType.AUTO,
        workReportApprovalAccessType: ApprovalAccessType.MANAGER,
        showReportToRequester: false,
        minStaff: 2,
        maxStaff: 5,
        workOrderForm: {
          title: 'Instruksi Kerja Lapangan - Renovasi',
          description: 'Detail teknis pekerjaan yang harus dilaksanakan tim lapangan.',
          formType: SubmissionType.WorkOrder,
          fields: [
            { order: 1, label: 'Spesifikasi Material yang Digunakan', type: FieldType.Textarea, required: true, placeholder: 'Daftar material beserta spesifikasinya...' },
            { order: 2, label: 'Metode Pengerjaan', type: FieldType.Textarea, required: true, placeholder: 'Uraikan metode dan urutan pengerjaan...' },
            { order: 3, label: 'Target Penyelesaian (hari)', type: FieldType.Text, required: true, placeholder: 'contoh: 3' },
            { order: 4, label: 'Catatan Keselamatan Kerja', type: FieldType.Textarea, required: false },
          ],
        },
        workReportForm: {
          title: 'Laporan Penyelesaian Pekerjaan Lapangan',
          description: 'Laporan hasil akhir pengerjaan dari tim lapangan.',
          formType: SubmissionType.Report,
          fields: [
            { order: 1, label: 'Status Pekerjaan', type: FieldType.SingleSelect, required: true, options: [{ key: 'selesai', value: 'Selesai 100%' }, { key: 'sebagian', value: 'Selesai Sebagian' }, { key: 'kendala', value: 'Terkendala' }] },
            { order: 2, label: 'Foto Hasil Akhir', type: FieldType.Image, required: true },
            { order: 3, label: 'Material Terpakai', type: FieldType.Textarea, required: true, placeholder: 'Detail material yang digunakan beserta jumlahnya...' },
            { order: 4, label: 'Kendala & Solusi', type: FieldType.Textarea, required: false },
          ],
        },
      },
    ],
  },
  {
    title: 'Jasa Pengiriman & Logistik Barang',
    description:
      'Layanan pengiriman barang, distribusi produk, dan jasa kurir untuk kebutuhan bisnis dan perorangan dalam kota maupun antar kota.',
    companyTypeId: COMPANY_TYPE_IDS.Kontruksi,
    accessType: 'public',
    draftingWorkOrderType: 'auto',
    serviceRequestConfig: {
      serviceRequestApprovalAccessType: ApprovalAccessType.AUTO,
      reviewNeed: true,
      intakeForm: {
        title: 'Formulir Order Pengiriman',
        description: 'Isi detail pengiriman barang Anda.',
        formType: SubmissionType.Intake,
        fields: [
          { order: 1, label: 'Nama Pengirim', type: FieldType.Text, required: true, placeholder: 'Nama lengkap pengirim...' },
          { order: 2, label: 'Nomor Telepon Pengirim', type: FieldType.Text, required: true, placeholder: '08xxxxxxxxxx' },
          { order: 3, label: 'Alamat Pengambilan', type: FieldType.Textarea, required: true, placeholder: 'Alamat lengkap pick-up...' },
          { order: 4, label: 'Nama Penerima', type: FieldType.Text, required: true, placeholder: 'Nama lengkap penerima...' },
          { order: 5, label: 'Alamat Tujuan', type: FieldType.Textarea, required: true, placeholder: 'Alamat lengkap tujuan pengiriman...' },
          { order: 6, label: 'Deskripsi Barang', type: FieldType.Textarea, required: true, placeholder: 'Jenis barang, berat estimasi, dimensi...' },
          { order: 7, label: 'Jenis Pengiriman', type: FieldType.SingleSelect, required: true, options: [{ key: 'same_day', value: 'Same Day' }, { key: 'next_day', value: 'Next Day' }, { key: 'reguler', value: 'Reguler (2-3 hari)' }] },
        ],
      },
      reviewForm: {
        title: 'Ulasan Layanan Pengiriman',
        description: 'Berikan penilaian atas layanan pengiriman yang Anda terima.',
        formType: SubmissionType.Review,
        fields: [
          { order: 1, label: 'Kondisi Barang Saat Diterima', type: FieldType.SingleSelect, required: true, options: [{ key: 'sempurna', value: 'Sempurna / Tidak ada kerusakan' }, { key: 'baik', value: 'Baik' }, { key: 'rusak', value: 'Ada Kerusakan' }] },
          { order: 2, label: 'Ketepatan Waktu Pengiriman', type: FieldType.SingleSelect, required: true, options: [{ key: 'tepat', value: 'Tepat Waktu' }, { key: 'terlambat_sedikit', value: 'Sedikit Terlambat' }, { key: 'terlambat', value: 'Terlambat' }] },
          { order: 3, label: 'Penilaian Kurir', type: FieldType.SingleSelect, required: true, options: [{ key: 'sangat_baik', value: 'Sangat Ramah & Profesional' }, { key: 'baik', value: 'Baik' }, { key: 'cukup', value: 'Cukup' }] },
          { order: 4, label: 'Komentar', type: FieldType.Textarea, required: false },
        ],
      },
    },
    workOrdersConfig: [
      {
        configId: null,
        positionsOnDuty: { name: 'Kurir & Driver', description: 'Tim kurir dan pengemudi yang menangani pengambilan dan pengiriman barang.' },
        workOrderApprovalAccessType: ApprovalAccessType.AUTO,
        workReportApprovalAccessType: ApprovalAccessType.AUTO,
        showReportToRequester: false,
        minStaff: 1,
        maxStaff: 2,

        workReportForm: {
          title: 'Laporan Penyelesaian Pengiriman',
          description: 'Konfirmasi bahwa barang telah berhasil diantarkan.',
          formType: SubmissionType.Report,
          fields: [
            { order: 1, label: 'Status Pengiriman', type: FieldType.SingleSelect, required: true, options: [{ key: 'terkirim', value: 'Terkirim & Diterima Langsung' }, { key: 'titip', value: 'Dititipkan ke Penjaga / Satpam' }, { key: 'gagal', value: 'Gagal Terkirim' }] },
            { order: 2, label: 'Foto Bukti Pengiriman', type: FieldType.Image, required: true },
            { order: 3, label: 'Catatan', type: FieldType.Textarea, required: false, placeholder: 'Keterangan tambahan jika ada...' },
          ],
        },
      },
    ],
  },
  // ── Logistik ─────────────────────────────────────────────────────────────
  {
    title: 'Pengajuan Pinjaman Anggota',
    description:
      'Layanan pengajuan pinjaman modal usaha dan konsumtif bagi anggota Logistik yang aktif, dengan proses persetujuan bertahap sesuai aturan Logistik.',
    companyTypeId: COMPANY_TYPE_IDS.Logistik,
    accessType: 'member_only',
    draftingWorkOrderType: 'manual',
    serviceRequestConfig: {
      serviceRequestApprovalAccessType: ApprovalAccessType.MANAGER,
      reviewNeed: true,
      intakeForm: {
        title: 'Formulir Pengajuan Pinjaman',
        description: 'Isi data lengkap untuk pengajuan pinjaman kepada Logistik.',
        formType: SubmissionType.Intake,
        fields: [
          { order: 1, label: 'Nama Lengkap Anggota', type: FieldType.Text, required: true, placeholder: 'Sesuai KTP...' },
          { order: 2, label: 'Nomor Anggota', type: FieldType.Text, required: true, placeholder: 'Nomor ID keanggotaan...' },
          { order: 3, label: 'Jumlah Pinjaman yang Diajukan (Rp)', type: FieldType.Text, required: true, placeholder: 'contoh: 5000000' },
          { order: 4, label: 'Jangka Waktu Angsuran (bulan)', type: FieldType.SingleSelect, required: true, options: [{ key: '6', value: '6 Bulan' }, { key: '12', value: '12 Bulan' }, { key: '24', value: '24 Bulan' }, { key: '36', value: '36 Bulan' }] },
          { order: 5, label: 'Tujuan Penggunaan Dana', type: FieldType.SingleSelect, required: true, options: [{ key: 'modal_usaha', value: 'Modal Usaha' }, { key: 'pendidikan', value: 'Biaya Pendidikan' }, { key: 'kesehatan', value: 'Kesehatan' }, { key: 'konsumtif', value: 'Kebutuhan Konsumtif' }, { key: 'lainnya', value: 'Lainnya' }] },
          { order: 6, label: 'Uraian Penggunaan Dana', type: FieldType.Textarea, required: true, placeholder: 'Jelaskan secara detail rencana penggunaan dana...' },
          { order: 7, label: 'Upload KTP', type: FieldType.Image, required: true },
        ],
      },
      reviewForm: {
        title: 'Evaluasi Layanan Pinjaman',
        description: 'Berikan penilaian atas proses pengajuan pinjaman yang telah dilalui.',
        formType: SubmissionType.Review,
        fields: [
          { order: 1, label: 'Kemudahan Proses Pengajuan', type: FieldType.SingleSelect, required: true, options: [{ key: 'mudah', value: 'Sangat Mudah' }, { key: 'cukup', value: 'Cukup Mudah' }, { key: 'sulit', value: 'Perlu Disederhanakan' }] },
          { order: 2, label: 'Kecepatan Pencairan Dana', type: FieldType.SingleSelect, required: true, options: [{ key: 'cepat', value: 'Cepat' }, { key: 'normal', value: 'Normal' }, { key: 'lambat', value: 'Lambat' }] },
          { order: 3, label: 'Kepuasan Pelayanan', type: FieldType.SingleSelect, required: true, options: [{ key: 'puas', value: 'Puas' }, { key: 'cukup', value: 'Cukup Puas' }, { key: 'kurang', value: 'Kurang Puas' }] },
          { order: 4, label: 'Saran Perbaikan', type: FieldType.Textarea, required: false },
        ],
      },
    },
    workOrdersConfig: [
      {
        configId: null,
        positionsOnDuty: { name: 'Petugas Kredit & Keuangan', description: 'Petugas yang memverifikasi kelayakan dan memproses pencairan pinjaman anggota.' },
        workOrderApprovalAccessType: ApprovalAccessType.AUTO,
        workReportApprovalAccessType: ApprovalAccessType.MANAGER,
        showReportToRequester: false,
        minStaff: 1,
        maxStaff: 2,
        workOrderForm: {
          title: 'Instruksi Verifikasi & Pencairan Pinjaman',
          description: 'Panduan kerja petugas dalam memproses pengajuan pinjaman anggota.',
          formType: SubmissionType.WorkOrder,
          fields: [
            { order: 1, label: 'Hasil Verifikasi Kelayakan', type: FieldType.SingleSelect, required: true, options: [{ key: 'layak', value: 'Layak Disetujui' }, { key: 'perlu_revisi', value: 'Perlu Revisi / Pengurangan Jumlah' }, { key: 'ditolak', value: 'Ditolak' }] },
            { order: 2, label: 'Jumlah Disetujui (Rp)', type: FieldType.Text, required: true, placeholder: 'Jumlah final yang disetujui...' },
            { order: 3, label: 'Catatan Hasil Verifikasi', type: FieldType.Textarea, required: true, placeholder: 'Alasan dan pertimbangan keputusan...' },
          ],
        },
        workReportForm: {
          title: 'Laporan Pencairan Pinjaman',
          description: 'Bukti dan dokumentasi pencairan pinjaman kepada anggota.',
          formType: SubmissionType.Report,
          fields: [
            { order: 1, label: 'Status Pencairan', type: FieldType.SingleSelect, required: true, options: [{ key: 'cair', value: 'Dana Sudah Dicairkan' }, { key: 'ditunda', value: 'Ditunda' }, { key: 'batal', value: 'Dibatalkan' }] },
            { order: 2, label: 'Tanggal Pencairan', type: FieldType.Text, required: true, placeholder: 'DD/MM/YYYY' },
            { order: 3, label: 'Bukti Transfer / Kwitansi', type: FieldType.Image, required: true },
            { order: 4, label: 'Catatan Tambahan', type: FieldType.Textarea, required: false },
          ],
        },
      },
    ],
  },
  {
    title: 'Simpanan Sukarela Anggota',
    description:
      'Layanan penyetoran simpanan sukarela bagi anggota Logistik yang ingin menambah saldo tabungan sewaktu-waktu di luar simpanan wajib dan pokok.',
    companyTypeId: COMPANY_TYPE_IDS.Logistik,
    accessType: 'member_only',
    draftingWorkOrderType: 'auto',
    serviceRequestConfig: {
      serviceRequestApprovalAccessType: ApprovalAccessType.AUTO,
      reviewNeed: false,
      intakeForm: {
        title: 'Formulir Setoran Simpanan Sukarela',
        description: 'Isi data penyetoran simpanan sukarela Anda.',
        formType: SubmissionType.Intake,
        fields: [
          { order: 1, label: 'Nama Anggota', type: FieldType.Text, required: true, placeholder: 'Nama lengkap...' },
          { order: 2, label: 'Nomor Anggota', type: FieldType.Text, required: true, placeholder: 'Nomor ID keanggotaan...' },
          { order: 3, label: 'Jumlah Setoran (Rp)', type: FieldType.Text, required: true, placeholder: 'Minimum Rp 50.000' },
          { order: 4, label: 'Metode Pembayaran', type: FieldType.SingleSelect, required: true, options: [{ key: 'tunai', value: 'Tunai di Kantor' }, { key: 'transfer', value: 'Transfer Bank' }] },
          { order: 5, label: 'Bukti Transfer (jika via transfer)', type: FieldType.Image, required: false },
        ],
      },
      reviewForm: {
        title: 'Evaluasi Program Beasiswa',
        description: 'Penilaian dari penerima beasiswa terhadap program yang dijalankan Otomotif.',
        formType: SubmissionType.Review,
        fields: [
          { order: 1, label: 'Program Beasiswa Membantu Pendidikan Anda?', type: FieldType.SingleSelect, required: true, options: [{ key: 'sangat', value: 'Sangat Membantu' }, { key: 'cukup', value: 'Cukup Membantu' }, { key: 'kurang', value: 'Kurang Membantu' }] },
          { order: 2, label: 'Kepuasan atas Proses Seleksi', type: FieldType.SingleSelect, required: true, options: [{ key: 'transparan', value: 'Transparan & Adil' }, { key: 'cukup', value: 'Cukup Baik' }, { order: 3, key: 'perlu_perbaikan', value: 'Perlu Perbaikan' }] },
          { order: 3, label: 'Saran untuk Program Beasiswa', type: FieldType.Textarea, required: false },
        ],
      },
    },
    workOrdersConfig: [
      {
        configId: null,
        positionsOnDuty: { name: 'Kasir & Teller Logistik', description: 'Petugas yang memproses transaksi setoran dan penarikan simpanan anggota.' },
        workOrderApprovalAccessType: ApprovalAccessType.AUTO,
        workReportApprovalAccessType: ApprovalAccessType.AUTO,
        showReportToRequester: false,
        minStaff: 1,
        maxStaff: 1,

        workReportForm: {
          title: 'Konfirmasi Penerimaan Setoran',
          description: 'Dokumentasi konfirmasi setoran simpanan sukarela anggota.',
          formType: SubmissionType.Report,
          fields: [
            { order: 1, label: 'Status Penerimaan', type: FieldType.SingleSelect, required: true, options: [{ key: 'diterima', value: 'Dana Diterima & Dibukukan' }, { key: 'pending', value: 'Menunggu Konfirmasi' }] },
            { order: 2, label: 'Nomor Bukti Transaksi', type: FieldType.Text, required: true, placeholder: 'Nomor kwitansi atau referensi transaksi...' },
            { order: 3, label: 'Foto / Scan Kwitansi', type: FieldType.Image, required: true },
          ],
        },
      },
    ],
  },
  // ── Otomotif ──────────────────────────────────────────────────────────────
  {
    title: 'Permohonan Bantuan Beasiswa Pendidikan',
    description:
      'Layanan pengajuan beasiswa bagi pelajar dan mahasiswa berprestasi yang membutuhkan dukungan finansial untuk melanjutkan pendidikan.',
    companyTypeId: COMPANY_TYPE_IDS.Otomotif,
    accessType: 'public',
    draftingWorkOrderType: 'manual',
    serviceRequestConfig: {
      serviceRequestApprovalAccessType: ApprovalAccessType.MANAGER,
      reviewNeed: true,
      intakeForm: {
        title: 'Formulir Permohonan Beasiswa',
        description: 'Lengkapi data diri dan dokumen pendukung untuk permohonan beasiswa.',
        formType: SubmissionType.Intake,
        fields: [
          { order: 1, label: 'Nama Lengkap Pemohon', type: FieldType.Text, required: true, placeholder: 'Sesuai KTP/Kartu Pelajar...' },
          { order: 2, label: 'Jenjang Pendidikan', type: FieldType.SingleSelect, required: true, options: [{ key: 'sma', value: 'SMA / SMK / Sederajat' }, { key: 'd3', value: 'D3 (Diploma)' }, { key: 's1', value: 'S1 (Sarjana)' }, { key: 's2', value: 'S2 (Magister)' }] },
          { order: 3, label: 'Nama Institusi Pendidikan', type: FieldType.Text, required: true, placeholder: 'Nama sekolah / universitas...' },
          { order: 4, label: 'IPK / Nilai Rata-Rata', type: FieldType.Text, required: true, placeholder: 'contoh: 3.75 atau 88.5' },
          { order: 5, label: 'Penghasilan Orang Tua / Wali per Bulan (Rp)', type: FieldType.Text, required: true, placeholder: 'contoh: 3000000' },
          { order: 6, label: 'Essay: Mengapa Anda Layak Mendapatkan Beasiswa', type: FieldType.Textarea, required: true, placeholder: 'Minimal 150 kata...' },
          { order: 7, label: 'Upload Kartu Keluarga', type: FieldType.Image, required: true },
          { order: 8, label: 'Upload Transkrip Nilai / Rapor', type: FieldType.Image, required: true },
        ],
      },
      reviewForm: {
        title: 'Evaluasi Program Beasiswa',
        description: 'Penilaian dari penerima beasiswa terhadap program yang dijalankan Otomotif.',
        formType: SubmissionType.Review,
        fields: [
          { order: 1, label: 'Program Beasiswa Membantu Pendidikan Anda?', type: FieldType.SingleSelect, required: true, options: [{ key: 'sangat', value: 'Sangat Membantu' }, { key: 'cukup', value: 'Cukup Membantu' }, { key: 'kurang', value: 'Kurang Membantu' }] },
          { order: 2, label: 'Kepuasan atas Proses Seleksi', type: FieldType.SingleSelect, required: true, options: [{ key: 'transparan', value: 'Transparan & Adil' }, { key: 'cukup', value: 'Cukup Baik' }, { order: 3, key: 'perlu_perbaikan', value: 'Perlu Perbaikan' }] },
          { order: 3, label: 'Saran untuk Program Beasiswa', type: FieldType.Textarea, required: false },
        ],
      },
    },
    workOrdersConfig: [
      {
        configId: null,
        positionsOnDuty: { name: 'Tim Seleksi Beasiswa', description: 'Tim yang mengevaluasi kelayakan dan memproses permohonan beasiswa.' },
        workOrderApprovalAccessType: ApprovalAccessType.AUTO,
        workReportApprovalAccessType: ApprovalAccessType.MANAGER,
        showReportToRequester: false,
        minStaff: 2,
        maxStaff: 4,
        workOrderForm: {
          title: 'Instruksi Seleksi & Verifikasi Beasiswa',
          description: 'Panduan proses seleksi dan verifikasi dokumen pemohon beasiswa.',
          formType: SubmissionType.WorkOrder,
          fields: [
            { order: 1, label: 'Aspek yang Dievaluasi', type: FieldType.Textarea, required: true, placeholder: 'Prestasi akademik, kondisi ekonomi, essay...' },
            { order: 2, label: 'Jadwal Wawancara (jika diperlukan)', type: FieldType.Text, required: false, placeholder: 'Tanggal dan waktu wawancara...' },
            { order: 3, label: 'Catatan Khusus Seleksi', type: FieldType.Textarea, required: false },
          ],
        },
        workReportForm: {
          title: 'Laporan Hasil Seleksi Beasiswa',
          description: 'Dokumentasi keputusan akhir seleksi beasiswa.',
          formType: SubmissionType.Report,
          fields: [
            { order: 1, label: 'Keputusan Akhir', type: FieldType.SingleSelect, required: true, options: [{ key: 'diterima', value: 'Diterima sebagai Penerima Beasiswa' }, { key: 'cadangan', value: 'Masuk Daftar Cadangan' }, { key: 'ditolak', value: 'Tidak Memenuhi Kriteria' }] },
            { order: 2, label: 'Nilai / Skor Akhir Seleksi', type: FieldType.Text, required: true, placeholder: 'Total skor atau nilai agregat...' },
            { order: 3, label: 'Catatan Keputusan', type: FieldType.Textarea, required: true, placeholder: 'Alasan dan pertimbangan keputusan...' },
            { order: 4, label: 'Dokumen Keputusan', type: FieldType.Image, required: false },
          ],
        },
      },
    ],
  },
  {
    title: 'Program Pelatihan Keterampilan Masyarakat',
    description:
      'Layanan pendaftaran program pelatihan vokasional dan pengembangan keterampilan yang diselenggarakan Otomotif untuk memberdayakan masyarakat.',
    companyTypeId: COMPANY_TYPE_IDS.Otomotif,
    accessType: 'public',
    draftingWorkOrderType: 'auto',
    serviceRequestConfig: {
      serviceRequestApprovalAccessType: ApprovalAccessType.AUTO,
      reviewNeed: true,
      intakeForm: {
        title: 'Formulir Pendaftaran Pelatihan',
        description: 'Daftarkan diri Anda pada program pelatihan keterampilan yang tersedia.',
        formType: SubmissionType.Intake,
        fields: [
          { order: 1, label: 'Nama Lengkap', type: FieldType.Text, required: true, placeholder: 'Nama lengkap peserta...' },
          { order: 2, label: 'Usia', type: FieldType.Text, required: true, placeholder: 'contoh: 25' },
          { order: 3, label: 'Program Pelatihan yang Diminati', type: FieldType.SingleSelect, required: true, options: [{ key: 'menjahit', value: 'Menjahit & Desain Busana' }, { key: 'kuliner', value: 'Pengolahan Kuliner & Pastry' }, { key: 'digital', value: 'Literasi Digital & Komputer' }, { key: 'las', value: 'Pengelasan & Fabrikasi Logam' }, { key: 'tata_rias', value: 'Tata Rias & Kecantikan' }] },
          { order: 4, label: 'Pendidikan Terakhir', type: FieldType.SingleSelect, required: true, options: [{ key: 'sd', value: 'SD / Sederajat' }, { key: 'smp', value: 'SMP / Sederajat' }, { key: 'sma', value: 'SMA / SMK / Sederajat' }, { key: 'pt', value: 'Perguruan Tinggi' }] },
          { order: 5, label: 'Motivasi Mengikuti Pelatihan', type: FieldType.Textarea, required: true, placeholder: 'Ceritakan alasan dan harapan Anda...' },
        ],
      },
      reviewForm: {
        title: 'Evaluasi Program Pelatihan',
        description: 'Isi kuesioner evaluasi setelah mengikuti program pelatihan.',
        formType: SubmissionType.Review,
        fields: [
          { order: 1, label: 'Kualitas Materi Pelatihan', type: FieldType.SingleSelect, required: true, options: [{ key: 'sangat_baik', value: 'Sangat Baik & Relevan' }, { key: 'baik', value: 'Baik' }, { key: 'cukup', value: 'Cukup' }, { key: 'kurang', value: 'Perlu Ditingkatkan' }] },
          { order: 2, label: 'Kualitas Instruktur / Fasilitator', type: FieldType.SingleSelect, required: true, options: [{ key: 'sangat_baik', value: 'Sangat Kompeten' }, { key: 'baik', value: 'Baik' }, { key: 'cukup', value: 'Cukup' }] },
          { order: 3, label: 'Apakah Pelatihan Meningkatkan Keterampilan Anda?', type: FieldType.SingleSelect, required: true, options: [{ key: 'sangat', value: 'Sangat Meningkatkan' }, { key: 'cukup', value: 'Cukup Meningkatkan' }, { key: 'sedikit', value: 'Sedikit' }] },
          { order: 4, label: 'Saran Pengembangan Program', type: FieldType.Textarea, required: false },
        ],
      },
    },
    workOrdersConfig: [
      {
        configId: null,
        positionsOnDuty: { name: 'Instruktur & Fasilitator', description: 'Tenaga pengajar yang memfasilitasi pelaksanaan program pelatihan keterampilan.' },
        workOrderApprovalAccessType: ApprovalAccessType.AUTO,
        workReportApprovalAccessType: ApprovalAccessType.AUTO,
        showReportToRequester: false,
        minStaff: 1,
        maxStaff: 3,

        workReportForm: {
          title: 'Laporan Pelaksanaan Pelatihan',
          description: 'Dokumentasi kegiatan dan hasil pelaksanaan sesi pelatihan.',
          formType: SubmissionType.Report,
          fields: [
            { order: 1, label: 'Jumlah Peserta yang Hadir', type: FieldType.Text, required: true, placeholder: 'contoh: 18' },
            { order: 2, label: 'Materi yang Disampaikan', type: FieldType.Textarea, required: true, placeholder: 'Ringkasan topik dan materi yang diajarkan...' },
            { order: 3, label: 'Tingkat Pemahaman Peserta', type: FieldType.SingleSelect, required: true, options: [{ key: 'tinggi', value: 'Tinggi (>80% memahami)' }, { key: 'sedang', value: 'Sedang (50-80%)' }, { key: 'rendah', value: 'Perlu Pengulangan (<50%)' }] },
            { order: 4, label: 'Foto Dokumentasi Kegiatan', type: FieldType.Image, required: true },
            { order: 5, label: 'Catatan & Tindak Lanjut', type: FieldType.Textarea, required: false },
          ],
        },
      },
    ],
  },
];
