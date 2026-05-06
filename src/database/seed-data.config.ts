import { Types } from 'mongoose';
import { SubmissionType } from '../common/enums/submission-type.enum';
import { ApprovalAccessType } from '../common/enums/approval-access-type.enum';
import { FieldType } from '../common/enums/field-type.enum';

export const COMPANY_TYPE_IDS = {
  PT: new Types.ObjectId('665000000000000000000001'),
  CV: new Types.ObjectId('665000000000000000000002'),
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
];

const template1Pengadaan = {
  title: 'Pengadaan Perangkat Baru',
  description: 'Template layanan pengadaan perangkat IT baru.',
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
};

const template2Maintenance = {
  title: 'Maintenance Berkala Sistem IT',
  description: 'Template layanan perawatan rutin infrastruktur IT perusahaan.',
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
    reviewForm: {
      title: 'Formulir Evaluasi Maintenance',
      description: 'Review hasil maintenance sistem IT.',
      formType: SubmissionType.Review,
      fields: [
        { 
          order: 1, 
          label: 'Tingkat Kepuasan', 
          type: FieldType.SingleSelect, 
          required: true, 
          options: [
            { key: 's1', value: 'Sangat Puas' },
            { key: 's2', value: 'Cukup' },
            { key: 's3', value: 'Kurang' }
          ] 
        },
        { order: 2, label: 'Saran Tambahan', type: FieldType.Textarea, required: false },
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
};

export const serviceTemplatesData = [
  { ...template1Pengadaan, companyTypeId: COMPANY_TYPE_IDS.PT },
  { ...template2Maintenance, companyTypeId: COMPANY_TYPE_IDS.PT },
  { ...template1Pengadaan, companyTypeId: COMPANY_TYPE_IDS.CV },
  { ...template2Maintenance, companyTypeId: COMPANY_TYPE_IDS.CV },
];