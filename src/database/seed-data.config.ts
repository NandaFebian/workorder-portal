import { Types } from 'mongoose';
import { SubmissionType } from '../common/enums/submission-type.enum';
import { ApprovalAccessType } from '../common/enums/approval-access-type.enum';
import { FieldType } from '../common/enums/field-type.enum';

export const COMPANY_TYPE_IDS = {
  PT: new Types.ObjectId('665000000000000000000001'),
  CV: new Types.ObjectId('665000000000000000000002'),
  PERORANGAN: new Types.ObjectId('665000000000000000000003'),
  YAYASAN: new Types.ObjectId('665000000000000000000004'),
  KOPERASI: new Types.ObjectId('665000000000000000000005'),
};

export const companyTypesData = [
  {
    _id: COMPANY_TYPE_IDS.PT,
    name: 'PT (Perseroan Terbatas)',
    description: 'Badan usaha berbadan hukum yang modalnya terkumpul dari berbagai saham. Cocok untuk bisnis skala menengah hingga besar.',
  },
  {
    _id: COMPANY_TYPE_IDS.CV,
    name: 'CV (Commanditaire Vennootschap)',
    description: 'Persekutuan komanditer, badan usaha yang terdiri dari sekutu aktif dan sekutu pasif. Umum digunakan oleh UMKM.',
  },
  {
    _id: COMPANY_TYPE_IDS.PERORANGAN,
    name: 'Perorangan / Usaha Mandiri',
    description: 'Badan usaha yang dimiliki dan dikelola oleh satu orang. Cocok untuk freelancer dan wirausaha perorangan.',
  },
  {
    _id: COMPANY_TYPE_IDS.YAYASAN,
    name: 'Yayasan',
    description: 'Badan hukum nirlaba yang dibentuk untuk tujuan sosial, kemanusiaan, atau keagamaan.',
  },
  {
    _id: COMPANY_TYPE_IDS.KOPERASI,
    name: 'Koperasi',
    description: 'Badan usaha yang beranggotakan orang atau badan hukum, berlandaskan asas kekeluargaan.',
  },
];

export const serviceTemplatesData = [
  // ── Template 1: Dari JSON User (Pengadaan Perangkat Baru / Auto Approve) ──
  {
    title: 'Pengadaan Perangkat Baru',
    description: 'Template layanan pengadaan perangkat IT baru.',
    companyTypeId: COMPANY_TYPE_IDS.PT,
    serviceRequestConfig: {
      serviceRequestApprovalAccessType: ApprovalAccessType.MANAGER,
      reviewNeed: true,
      intakeForm: {
        title: 'Formulir Permintaan Perangkat Baru',
        description: 'Formulir awal untuk pengguna meminta pengadaan komputer atau laptop baru.',
        formType: SubmissionType.Intake,
        fields: [
          { order: 1, label: 'Nama Pengguna', type: FieldType.Text, required: true, placeholder: 'nama anda..', options: [] },
          { order: 2, label: 'Alasan Permintaan', type: FieldType.Textarea, required: true, placeholder: 'alasan anda..', options: [] },
        ],
      },
      reviewForm: {
        title: 'Formulir Evaluasi Vendor Pengadaan',
        description: 'Formulir untuk mengevaluasi kinerja vendor setelah barang diterima.',
        formType: SubmissionType.Review,
        fields: [
          { 
            order: 1, 
            label: 'Rating Kualitas Barang', 
            type: FieldType.SingleSelect, 
            required: true, 
            options: [
              { key: '1776928352039', value: '1' },
              { key: '1776928356338', value: '2' },
              { key: '1776928357023', value: '3' },
              { key: '1776928357743', value: '4' },
              { key: '1776928358516', value: '5' }
            ] 
          },
          { 
            order: 2, 
            label: 'Rating Kecepatan Pengiriman', 
            type: FieldType.SingleSelect, 
            required: true, 
            options: [
              { key: '1776928375393', value: 'Cepat' },
              { key: '1776928379871', value: 'Lambat' }
            ] 
          },
        ],
      },
    },
    workOrdersConfig: [
      {
        configId: null,
        positionsOnDuty: {
          _id: "69e9c3b64ed12731e6970808",
          name: "Information Technology (IT)",
          description: "Menangani infrastruktur jaringan, perangkat lunak, dan dukungan teknis perusahaan.",
          companyId: "69e909874ed12731e697072e"
        },
        workOrderApprovalAccessType: ApprovalAccessType.STAFF_PIC,
        workReportApprovalAccessType: ApprovalAccessType.MANAGER,
        minStaff: 1,
        maxStaff: 1,
        workOrderForm: {
          title: 'Formulir Pembelian Hardware',
          description: 'Instruksi kerja untuk tim IT Purchasing melakukan pembelian barang.',
          formType: SubmissionType.WorkOrder,
          fields: [
            { order: 1, label: 'Spesifikasi Perangkat', type: FieldType.Textarea, required: true, placeholder: 'spesifikasi yang diperlukan..' },
            { 
              order: 2, 
              label: 'Estimasi Biaya (Rp)', 
              type: FieldType.SingleSelect, 
              required: false, 
              options: [
                { key: '1776927950039', value: '<= Rp10K' },
                { key: '1776927965875', value: 'Rp10K <= 20K' },
                { key: '1776927995774', value: '>= 21K' }
              ] 
            },
            { 
              order: 3, 
              label: 'Vendor Terpilih', 
              type: FieldType.SingleSelect, 
              required: true, 
              options: [
                { key: '1776928016668', value: 'Vendor 1' },
                { key: '1776928022122', value: 'Vendor 2' },
                { key: '1776928023125', value: 'Vendor 3' }
              ] 
            },
          ],
        },
        workReportForm: {
          title: 'Laporan Bukti Pembelian & Serah Terima Gudang',
          description: 'Formulir untuk mengunggah nota pembelian dan foto bukti barang masuk.',
          formType: SubmissionType.Report,
          fields: [
            { order: 1, label: 'Total Pengeluaran Asli (Rp)', type: FieldType.Text, required: true, placeholder: 'Total pengeluaran..' },
            { order: 2, label: 'Bukti Pembelian', type: FieldType.Image, required: true },
          ],
        },
      },
    ],
  },
  
  // ── Template 2: Maintenance Berkala (Menggunakan Multi Select) ──────────────
  {
    title: 'Maintenance Berkala Sistem IT',
    description: 'Template layanan perawatan rutin infrastruktur IT perusahaan.',
    companyTypeId: COMPANY_TYPE_IDS.PT,
    serviceRequestConfig: {
      serviceRequestApprovalAccessType: ApprovalAccessType.AUTO,
      reviewNeed: false,
      intakeForm: {
        title: 'Form Permintaan Maintenance IT',
        description: 'Data awal kebutuhan maintenance sistem IT',
        formType: SubmissionType.Intake,
        fields: [
          { order: 1, label: 'Nama PIC IT', type: FieldType.Text, required: true },
          { 
            order: 2, 
            label: 'Scope Maintenance', 
            type: FieldType.MultiSelect, 
            required: true,
            options: [
              { key: 'm1', value: 'Server' },
              { key: 'm2', value: 'Jaringan' },
              { key: 'm3', value: 'Perangkat Endpoint' }
            ]
          },
          { order: 3, label: 'Periode Terakhir Maintenance', type: FieldType.Date, required: false },
        ],
      },
      reviewForm: null,
    },
    workOrdersConfig: [
      {
        configId: null,
        positionsOnDuty: {
          _id: "69e9c3b64ed12731e6970808",
          name: "Information Technology (IT)",
          description: "Menangani infrastruktur jaringan, perangkat lunak, dan dukungan teknis perusahaan.",
          companyId: "69e909874ed12731e697072e"
        },
        workOrderApprovalAccessType: ApprovalAccessType.STAFF_PIC,
        workReportApprovalAccessType: ApprovalAccessType.AUTO,
        minStaff: 1,
        maxStaff: 3,
        workOrderForm: {
          title: 'Form Instruksi Maintenance IT',
          description: 'Checklist pekerjaan maintenance IT',
          formType: SubmissionType.WorkOrder,
          fields: [
            { 
              order: 1, 
              label: 'Tugas yang Harus Dikerjakan', 
              type: FieldType.MultiSelect, 
              required: true,
              options: [
                { key: 't1', value: 'Update Antivirus' },
                { key: 't2', value: 'Cek Log Server' },
                { key: 't3', value: 'Backup Data' }
              ]
            },
          ],
        },
        workReportForm: {
          title: 'Form Laporan Maintenance IT',
          description: 'Ringkasan hasil maintenance',
          formType: SubmissionType.Report,
          fields: [
            { 
              order: 1, 
              label: 'Item yang Diselesaikan', 
              type: FieldType.MultiSelect, 
              required: true,
              options: [
                { key: 'd1', value: 'Update Antivirus Selesai' },
                { key: 'd2', value: 'Cek Log Server Selesai' },
                { key: 'd3', value: 'Backup Data Selesai' }
              ]
            },
            { order: 2, label: 'Temuan Masalah', type: FieldType.Textarea, required: false },
            { order: 3, label: 'Rekomendasi Lanjutan', type: FieldType.Textarea, required: false },
          ],
        },
      },
    ],
  },
  
  // ── Template 3: Instalasi Jaringan & CCTV (Multi Select & Single Select) ──
  {
    title: 'Instalasi Jaringan & CCTV',
    description: 'Template layanan pemasangan jaringan LAN/WiFi dan sistem kamera pengawas (CCTV).',
    companyTypeId: COMPANY_TYPE_IDS.CV,
    serviceRequestConfig: {
      serviceRequestApprovalAccessType: ApprovalAccessType.AUTO,
      reviewNeed: true,
      intakeForm: {
        title: 'Form Permintaan Instalasi Jaringan & CCTV',
        description: 'Detail kebutuhan instalasi jaringan dan CCTV',
        formType: SubmissionType.Intake,
        fields: [
          { order: 1, label: 'Luas Area (m²)', type: FieldType.Number, required: true },
          { order: 2, label: 'Jumlah Titik Access Point', type: FieldType.Number, required: true },
          { order: 3, label: 'Jumlah Kamera CCTV', type: FieldType.Number, required: false },
        ],
      },
      reviewForm: {
        title: 'Form Review Instalasi Jaringan & CCTV',
        description: 'Review kelengkapan instalasi',
        formType: SubmissionType.Review,
        fields: [
          { 
            order: 1, 
            label: 'Status Pemasangan', 
            type: FieldType.SingleSelect, 
            required: true,
            options: [
              { key: 's1', value: 'Semua Berfungsi Baik' },
              { key: 's2', value: 'Ada Kendala Minor' },
              { key: 's3', value: 'Banyak Kendala' }
            ]
          },
          { order: 2, label: 'Catatan Tambahan', type: FieldType.Textarea, required: false },
        ],
      },
    },
    workOrdersConfig: [
      {
        configId: null,
        positionsOnDuty: {
          _id: "69e9c3c94ed12731e697080f",
          name: "Facilities & Maintenance",
          description: "Menangani pemeliharaan gedung, ruang kerja, dan fasilitas fisik perusahaan.",
          companyId: "69e909874ed12731e697072e"
        },
        workOrderApprovalAccessType: ApprovalAccessType.AUTO,
        workReportApprovalAccessType: ApprovalAccessType.MANAGER,
        minStaff: 1,
        maxStaff: 3,
        workOrderForm: {
          title: 'Form Instruksi Instalasi Jaringan & CCTV',
          description: 'Detail teknis pemasangan',
          formType: SubmissionType.WorkOrder,
          fields: [
            { order: 1, label: 'Titik Instalasi', type: FieldType.Textarea, required: true },
            { 
              order: 2, 
              label: 'Tipe Kabel yang Digunakan', 
              type: FieldType.MultiSelect, 
              required: true,
              options: [
                { key: 'k1', value: 'UTP Cat5e' },
                { key: 'k2', value: 'UTP Cat6' },
                { key: 'k3', value: 'Fiber Optic' },
                { key: 'k4', value: 'Coaxial' }
              ]
            },
          ],
        },
        workReportForm: {
          title: 'Form Laporan Instalasi Jaringan & CCTV',
          description: 'Laporan hasil pemasangan',
          formType: SubmissionType.Report,
          fields: [
            { 
              order: 1, 
              label: 'Kondisi Akhir Titik Instalasi', 
              type: FieldType.MultiSelect, 
              required: true,
              options: [
                { key: 'c1', value: 'Access Point Terpasang' },
                { key: 'c2', value: 'CCTV Terpasang' },
                { key: 'c3', value: 'Kabel Rapih' }
              ]
            },
            { order: 2, label: 'Kendala Pemasangan', type: FieldType.Textarea, required: false },
            { order: 3, label: 'Foto Hasil Instalasi', type: FieldType.Image, required: true },
          ],
        },
      },
    ],
  },
];