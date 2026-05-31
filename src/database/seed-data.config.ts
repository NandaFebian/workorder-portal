import { Types } from 'mongoose';
import { SubmissionType } from '../common/enums/submission-type.enum';
import { ApprovalAccessType } from '../common/enums/approval-access-type.enum';
import { FieldType } from '../common/enums/field-type.enum';

export const COMPANY_TYPE_IDS = {
  PT: new Types.ObjectId('665000000000000000000001'),
  CV: new Types.ObjectId('665000000000000000000002'),
  Koperasi: new Types.ObjectId('665000000000000000000003'),
  Yayasan: new Types.ObjectId('665000000000000000000004'),
};

export const companyTypesData = [
  {
    _id: COMPANY_TYPE_IDS.PT,
    name: 'PT (Perseroan Terbatas)',
    description:
      'Badan usaha berbadan hukum yang modalnya terkumpul dari berbagai saham. Cocok untuk bisnis skala menengah hingga besar.',
  },
  {
    _id: COMPANY_TYPE_IDS.CV,
    name: 'CV (Commanditaire Vennootschap)',
    description:
      'Persekutuan komanditer, badan usaha yang terdiri dari sekutu aktif dan sekutu pasif. Umum digunakan oleh UMKM.',
  },
  {
    _id: COMPANY_TYPE_IDS.Koperasi,
    name: 'Koperasi',
    description:
      'Badan usaha yang beranggotakan orang-seorang atau badan hukum koperasi dengan melandaskan kegiatannya berdasarkan prinsip koperasi.',
  },
  {
    _id: COMPANY_TYPE_IDS.Yayasan,
    name: 'Yayasan',
    description:
      'Badan hukum yang terdiri atas kekayaan yang dipisahkan dan diperuntukkan untuk mencapai tujuan tertentu di bidang sosial, keagamaan, dan kemanusiaan.',
  },
];

function generateTemplates() {
  const templates: any[] = [];
  const accessTypes = ['public', 'member_only', 'internal'];
  const woTypes = ['auto', 'manual'];
  const reviewNeeds = [false, true];

  const companyTypeEntries = [
    { id: COMPANY_TYPE_IDS.PT, name: 'PT' },
    { id: COMPANY_TYPE_IDS.CV, name: 'CV' },
    { id: COMPANY_TYPE_IDS.Koperasi, name: 'Koperasi' },
    { id: COMPANY_TYPE_IDS.Yayasan, name: 'Yayasan' },
  ];

  for (const company of companyTypeEntries) {
    for (const access of accessTypes) {
      for (const wo of woTypes) {
        for (const review of reviewNeeds) {
          // If WO is auto, report approval access type is forced to 'auto'.
          // If WO is manual, we can have both 'auto' and 'manager' for report.
          const reports = wo === 'auto' ? ['auto'] : ['auto', 'manager'];

          for (const report of reports) {
            const displayAccess =
              access === 'public'
                ? 'Public'
                : access === 'member_only'
                  ? 'Member'
                  : 'Internal';
            const displayWO = wo === 'auto' ? 'WO Auto' : 'WO Manual';
            const displayReport =
              report === 'auto' ? 'Report Auto' : 'Report Manual';
            const displayReview = review ? 'Review Manual' : 'Review Auto';

            const title = `${displayAccess} - ${displayWO} - ${displayReport} - ${displayReview} (${company.name})`;
            const description = `Template layanan dengan tipe akses ${displayAccess}, ${displayWO}, persetujuan report ${displayReport}, dan verifikasi review ${displayReview} untuk ${company.name}.`;

            // Prepare Work Order form blueprint
            // For WO Auto, workOrderForm must be null
            const workOrderFormBlueprint =
              wo === 'auto'
                ? null
                : {
                    title: `Formulir Kerja - ${title}`,
                    description: 'Formulir untuk memandu eksekusi kerja staff.',
                    formType: SubmissionType.WorkOrder,
                    fields: [
                      {
                        order: 1,
                        label: 'Laporan Pekerjaan',
                        type: FieldType.Textarea,
                        required: true,
                        placeholder: 'detail kerja...',
                      },
                    ],
                  };

            const template = {
              title,
              description,
              companyTypeId: company.id,
              accessType: access,
              draftingWorkOrderType: wo,
              serviceRequestConfig: {
                serviceRequestApprovalAccessType:
                  wo === 'auto'
                    ? ApprovalAccessType.AUTO
                    : ApprovalAccessType.MANAGER,
                reviewNeed: review,
                intakeForm: {
                  title: `Formulir Permintaan - ${title}`,
                  description:
                    'Formulir awal untuk mengajukan request layanan ini.',
                  formType: SubmissionType.Intake,
                  fields: [
                    {
                      order: 1,
                      label: 'Nama Pemohon',
                      type: FieldType.Text,
                      required: true,
                      placeholder: 'nama...',
                    },
                    {
                      order: 2,
                      label: 'Keterangan Kebutuhan',
                      type: FieldType.Textarea,
                      required: true,
                      placeholder: 'detail...',
                    },
                  ],
                },
                reviewForm: review
                  ? {
                      title: `Formulir Evaluasi - ${title}`,
                      description:
                        'Formulir evaluasi setelah pengerjaan selesai.',
                      formType: SubmissionType.Review,
                      fields: [
                        {
                          order: 1,
                          label: 'Tingkat Kepuasan',
                          type: FieldType.SingleSelect,
                          required: true,
                          options: [
                            { key: 'opt1', value: 'Sangat Puas' },
                            { key: 'opt2', value: 'Cukup Puas' },
                            { key: 'opt3', value: 'Kurang Puas' },
                          ],
                        },
                      ],
                    }
                  : null,
              },
              workOrdersConfig: [
                {
                  configId: null,
                  positionsOnDuty: {
                    _id: '665000000000000000000005',
                    name: 'General Services',
                    description:
                      'Divisi umum untuk penanganan operasional layanan.',
                  },
                  workOrderApprovalAccessType: ApprovalAccessType.AUTO,
                  workReportApprovalAccessType:
                    report === 'auto'
                      ? ApprovalAccessType.AUTO
                      : ApprovalAccessType.MANAGER,
                  minStaff: 1,
                  maxStaff: 2,
                  workOrderForm: workOrderFormBlueprint,
                  workReportForm: {
                    title: `Formulir Laporan Kerja - ${title}`,
                    description: 'Laporan penyelesaian pekerjaan dari staff.',
                    formType: SubmissionType.Report,
                    fields: [
                      {
                        order: 1,
                        label: 'Catatan Penyelesaian',
                        type: FieldType.Textarea,
                        required: true,
                        placeholder: 'pekerjaan selesai...',
                      },
                      {
                        order: 2,
                        label: 'Bukti Foto',
                        type: FieldType.Image,
                        required: false,
                      },
                    ],
                  },
                },
              ],
            };

            templates.push(template);
          }
        }
      }
    }
  }
  return templates;
}

export const serviceTemplatesData = generateTemplates();
