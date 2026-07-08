import { Types } from 'mongoose';
import { SubmissionType } from '../common/enums/submission-type.enum';
import { ApprovalAccessType } from '../common/enums/approval-access-type.enum';
import { FieldType } from '../common/enums/field-type.enum';

export const COMPANY_TYPE_IDS = {
  ISP: new Types.ObjectId('665000000000000000000001'),
  Manufaktur: new Types.ObjectId('665000000000000000000002'),
  Fasilitas: new Types.ObjectId('665000000000000000000003'),
  Servis: new Types.ObjectId('665000000000000000000004'),
};

export const companyTypesData = [
  {
    _id: COMPANY_TYPE_IDS.ISP,
    name: 'ISP & Jaringan',
    description:
      'Perusahaan penyedia layanan internet dan infrastruktur jaringan.',
  },
  {
    _id: COMPANY_TYPE_IDS.Manufaktur,
    name: 'Manufaktur & Produksi',
    description:
      'Perusahaan yang bergerak di bidang manufaktur dan produksi barang.',
  },
  {
    _id: COMPANY_TYPE_IDS.Fasilitas,
    name: 'Fasilitas & Perkantoran',
    description:
      'Perusahaan pengelola gedung, fasilitas, dan lingkungan perkantoran.',
  },
  {
    _id: COMPANY_TYPE_IDS.Servis,
    name: 'Servis & Reparasi',
    description:
      'Perusahaan jasa perbaikan kendaraan, elektronik, dan perangkat teknis.',
  },
];

export const serviceTemplatesData = [
  // ── 1. ISP & Jaringan — Instalasi Internet & Jaringan ──────────────────
  {
    title: 'Instalasi Internet & Jaringan',
    description:
      'Layanan pemasangan koneksi internet baru meliputi instalasi router, modem ONT, dan access point untuk pelanggan.',
    companyTypeId: COMPANY_TYPE_IDS.ISP,
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
          { order: 3, label: 'Tipe Perangkat', type: FieldType.SingleSelect, required: true, options: [{ key: 'ont_router', value: 'Modem ONT + Router' }, { key: 'ont_ap', value: 'Modem ONT + Access Point' }, { key: 'ont_only', value: 'Modem ONT Saja' }] },
          { order: 4, label: 'Catatan Tambahan', type: FieldType.Textarea, required: false, placeholder: 'Informasi tambahan mengenai lokasi atau kebutuhan khusus...' },
        ],
      },
      reviewForm: {
        title: 'Ulasan Pemasangan Internet',
        description: 'Berikan ulasan Anda setelah proses instalasi internet selesai.',
        formType: SubmissionType.Review,
        fields: [
          { order: 1, label: 'Kualitas Koneksi', type: FieldType.SingleSelect, required: true, options: [{ key: 'stabil', value: 'Stabil & Cepat' }, { key: 'cukup', value: 'Cukup Stabil' }, { key: 'lambat', value: 'Lambat / Sering Terputus' }] },
          { order: 2, label: 'Kerapian Instalasi', type: FieldType.SingleSelect, required: true, options: [{ key: 'rapi', value: 'Rapi & Bersih' }, { key: 'cukup', value: 'Cukup Rapi' }, { key: 'berantakan', value: 'Berantakan' }] },
          { order: 3, label: 'Komentar & Saran', type: FieldType.Textarea, required: false },
        ],
      },
    },
    workOrdersConfig: [
      {
        configId: null,
        positionsOnDuty: { name: 'Teknisi Jaringan', description: 'Tim teknisi yang melakukan instalasi kabel fiber, konfigurasi modem ONT, dan setup router/access point.' },
        workOrderApprovalAccessType: ApprovalAccessType.AUTO,
        workReportApprovalAccessType: ApprovalAccessType.MANAGER,
        showReportToRequester: false,
        minStaff: 1,
        maxStaff: 2,
        workOrderForm: {
          title: 'Instruksi Kerja Instalasi Jaringan',
          description: 'Detail teknis pekerjaan instalasi yang harus dilakukan teknisi.',
          formType: SubmissionType.WorkOrder,
          fields: [
            { order: 1, label: 'Port ODP yang Digunakan', type: FieldType.Text, required: true, placeholder: 'contoh: ODP-JKT-001 Port 3' },
            { order: 2, label: 'Panjang Kabel Fiber (meter)', type: FieldType.Text, required: true, placeholder: 'contoh: 45' },
            { order: 3, label: 'Perangkat yang Dipasang', type: FieldType.Textarea, required: true, placeholder: 'Daftar perangkat: ONT, router, AP...' },
          ],
        },
        workReportForm: {
          title: 'Laporan Hasil Instalasi Internet',
          description: 'Laporan teknis penyelesaian pemasangan internet.',
          formType: SubmissionType.Report,
          fields: [
            { order: 1, label: 'Status Pemasangan', type: FieldType.SingleSelect, required: true, options: [{ key: 'sukses', value: 'Sukses Terkoneksi' }, { key: 'kendala', value: 'Ada Kendala Redaman Tinggi' }, { key: 'gagal', value: 'Gagal - Perlu Reschedule' }] },
            { order: 2, label: 'Nilai Redaman (dBm)', type: FieldType.Text, required: true, placeholder: 'contoh: -18.5' },
            { order: 3, label: 'Foto Redaman OPM', type: FieldType.Image, required: true },
            { order: 4, label: 'Foto Hasil Instalasi', type: FieldType.Image, required: true },
          ],
        },
      },
    ],
  },

  // ── 2. Manufaktur & Produksi — Pemeliharaan Peralatan Produksi ──────────
  {
    title: 'Pemeliharaan Peralatan Produksi',
    description:
      'Layanan perbaikan dan pemeliharaan rutin mesin produksi untuk menjaga kelancaran operasional pabrik.',
    companyTypeId: COMPANY_TYPE_IDS.Manufaktur,
    accessType: 'internal',
    draftingWorkOrderType: 'auto',
    serviceRequestConfig: {
      serviceRequestApprovalAccessType: ApprovalAccessType.AUTO,
      reviewNeed: true,
      intakeForm: {
        title: 'Formulir Laporan Gangguan Mesin',
        description: 'Laporkan kerusakan atau gangguan pada mesin produksi.',
        formType: SubmissionType.Intake,
        fields: [
          { order: 1, label: 'Nama/Kode Mesin', type: FieldType.Text, required: true, placeholder: 'contoh: CNC-M03 / Conveyor Line B' },
          { order: 2, label: 'Lokasi Mesin', type: FieldType.Text, required: true, placeholder: 'contoh: Gedung Produksi, Lantai 2, Area B' },
          { order: 3, label: 'Jenis Gangguan', type: FieldType.SingleSelect, required: true, options: [{ key: 'mekanik', value: 'Kerusakan Mekanik' }, { key: 'elektrik', value: 'Gangguan Elektrik' }, { key: 'hydraulic', value: 'Kebocoran Hydraulic' }, { key: 'software', value: 'Error Software/PLC' }] },
          { order: 4, label: 'Deskripsi Gangguan', type: FieldType.Textarea, required: true, placeholder: 'Jelaskan gejala kerusakan secara detail...' },
          { order: 5, label: 'Foto Kondisi Mesin', type: FieldType.Image, required: false },
        ],
      },
      reviewForm: {
        title: 'Evaluasi Hasil Perbaikan Mesin',
        description: 'Penilaian kinerja mesin setelah perbaikan dilakukan.',
        formType: SubmissionType.Review,
        fields: [
          { order: 1, label: 'Mesin Berfungsi Normal?', type: FieldType.SingleSelect, required: true, options: [{ key: 'normal', value: 'Ya, berfungsi normal' }, { key: 'sebagian', value: 'Sebagian berfungsi' }, { key: 'masalah', value: 'Masih bermasalah' }] },
          { order: 2, label: 'Kecepatan Penanganan', type: FieldType.SingleSelect, required: true, options: [{ key: 'cepat', value: 'Cepat' }, { key: 'normal', value: 'Normal' }, { key: 'lambat', value: 'Lambat' }] },
          { order: 3, label: 'Catatan Operator', type: FieldType.Textarea, required: false },
        ],
      },
    },
    workOrdersConfig: [
      {
        configId: null,
        positionsOnDuty: { name: 'Teknisi Mesin Produksi', description: 'Teknisi yang menangani perbaikan dan pemeliharaan mesin-mesin produksi pabrik.' },
        workOrderApprovalAccessType: ApprovalAccessType.AUTO,
        workReportApprovalAccessType: ApprovalAccessType.AUTO,
        showReportToRequester: false,
        minStaff: 1,
        maxStaff: 3,
        workReportForm: {
          title: 'Laporan Perbaikan Mesin Produksi',
          description: 'Dokumentasi teknis perbaikan yang telah dilakukan.',
          formType: SubmissionType.Report,
          fields: [
            { order: 1, label: 'Tindakan Perbaikan', type: FieldType.Textarea, required: true, placeholder: 'Uraikan langkah perbaikan yang dilakukan...' },
            { order: 2, label: 'Sparepart yang Diganti', type: FieldType.Textarea, required: true, placeholder: 'Daftar komponen yang diganti beserta kode part...' },
            { order: 3, label: 'Hasil Testing Mesin', type: FieldType.SingleSelect, required: true, options: [{ key: 'ok', value: 'Lolos Test - Siap Produksi' }, { key: 'partial', value: 'Perlu Monitoring Lanjutan' }, { key: 'fail', value: 'Gagal - Perlu Tindakan Tambahan' }] },
            { order: 4, label: 'Foto Before & After', type: FieldType.Image, required: true },
          ],
        },
      },
    ],
  },

  // ── 3. Fasilitas & Perkantoran — Perawatan AC & Tata Udara Gedung ──────
  {
    title: 'Perawatan AC & Tata Udara Gedung',
    description:
      'Layanan perawatan rutin dan perbaikan sistem pendingin udara (AC split, AC central, exhaust fan) di lingkungan gedung perkantoran.',
    companyTypeId: COMPANY_TYPE_IDS.Fasilitas,
    accessType: 'internal',
    draftingWorkOrderType: 'manual',
    serviceRequestConfig: {
      serviceRequestApprovalAccessType: ApprovalAccessType.MANAGER,
      reviewNeed: true,
      intakeForm: {
        title: 'Formulir Permintaan Perawatan AC',
        description: 'Ajukan permintaan perawatan atau perbaikan sistem pendingin udara.',
        formType: SubmissionType.Intake,
        fields: [
          { order: 1, label: 'Lokasi Unit AC', type: FieldType.Text, required: true, placeholder: 'contoh: Lantai 5, Ruang Meeting Utama' },
          { order: 2, label: 'Tipe AC', type: FieldType.SingleSelect, required: true, options: [{ key: 'split', value: 'AC Split Wall' }, { key: 'cassette', value: 'AC Cassette' }, { key: 'standing', value: 'AC Standing Floor' }, { key: 'central', value: 'AC Central / Chiller' }] },
          { order: 3, label: 'Jenis Keluhan', type: FieldType.SingleSelect, required: true, options: [{ key: 'tidak_dingin', value: 'Tidak Dingin / Kurang Dingin' }, { key: 'bocor', value: 'AC Bocor / Tetes Air' }, { key: 'bau', value: 'Bau Tidak Sedap' }, { key: 'bunyi', value: 'Bunyi Berisik' }, { key: 'mati', value: 'AC Mati Total' }] },
          { order: 4, label: 'Deskripsi Keluhan', type: FieldType.Textarea, required: true, placeholder: 'Jelaskan kondisi AC saat ini...' },
        ],
      },
      reviewForm: {
        title: 'Evaluasi Perawatan AC',
        description: 'Penilaian kondisi ruangan setelah perawatan AC dilakukan.',
        formType: SubmissionType.Review,
        fields: [
          { order: 1, label: 'Suhu Ruangan Setelah Perawatan', type: FieldType.SingleSelect, required: true, options: [{ key: 'dingin', value: 'Dingin & Nyaman' }, { key: 'cukup', value: 'Cukup Dingin' }, { key: 'masih_panas', value: 'Masih Panas' }] },
          { order: 2, label: 'Kebersihan Pengerjaan', type: FieldType.SingleSelect, required: true, options: [{ key: 'bersih', value: 'Bersih & Rapi' }, { key: 'cukup', value: 'Cukup Bersih' }, { key: 'kotor', value: 'Masih Kotor' }] },
          { order: 3, label: 'Catatan', type: FieldType.Textarea, required: false },
        ],
      },
    },
    workOrdersConfig: [
      {
        configId: null,
        positionsOnDuty: { name: 'Teknisi HVAC', description: 'Teknisi spesialis sistem pendingin dan tata udara gedung.' },
        workOrderApprovalAccessType: ApprovalAccessType.AUTO,
        workReportApprovalAccessType: ApprovalAccessType.MANAGER,
        showReportToRequester: false,
        minStaff: 1,
        maxStaff: 2,
        workOrderForm: {
          title: 'Instruksi Kerja Perawatan AC',
          description: 'Detail teknis pekerjaan perawatan atau perbaikan AC.',
          formType: SubmissionType.WorkOrder,
          fields: [
            { order: 1, label: 'Jenis Perawatan', type: FieldType.SingleSelect, required: true, options: [{ key: 'cuci', value: 'Cuci AC (Indoor & Outdoor)' }, { key: 'isi_freon', value: 'Isi Ulang Freon' }, { key: 'ganti_part', value: 'Penggantian Komponen' }, { key: 'troubleshoot', value: 'Troubleshooting & Diagnosa' }] },
            { order: 2, label: 'Alat & Material yang Dibutuhkan', type: FieldType.Textarea, required: true, placeholder: 'Daftar alat dan material...' },
            { order: 3, label: 'Estimasi Waktu Pengerjaan (jam)', type: FieldType.Text, required: true, placeholder: 'contoh: 2' },
          ],
        },
        workReportForm: {
          title: 'Laporan Perawatan AC',
          description: 'Dokumentasi hasil perawatan atau perbaikan AC.',
          formType: SubmissionType.Report,
          fields: [
            { order: 1, label: 'Tindakan yang Dilakukan', type: FieldType.Textarea, required: true, placeholder: 'Uraikan pekerjaan yang telah dilaksanakan...' },
            { order: 2, label: 'Kondisi Setelah Perawatan', type: FieldType.SingleSelect, required: true, options: [{ key: 'normal', value: 'Normal - AC Berfungsi Penuh' }, { key: 'partial', value: 'Sebagian Teratasi' }, { key: 'perlu_lanjutan', value: 'Perlu Penggantian Unit' }] },
            { order: 3, label: 'Suhu Sebelum & Sesudah (°C)', type: FieldType.Text, required: true, placeholder: 'contoh: 28°C → 22°C' },
            { order: 4, label: 'Foto Hasil Perawatan', type: FieldType.Image, required: true },
          ],
        },
      },
    ],
  },

  // ── 4. Servis & Reparasi — Servis Kendaraan ────────────────────────────
  {
    title: 'Servis Kendaraan',
    description:
      'Layanan servis rutin dan perbaikan kendaraan bermotor (roda dua & roda empat) meliputi mesin, kelistrikan, dan body.',
    companyTypeId: COMPANY_TYPE_IDS.Servis,
    accessType: 'public',
    draftingWorkOrderType: 'manual',
    serviceRequestConfig: {
      serviceRequestApprovalAccessType: ApprovalAccessType.MANAGER,
      reviewNeed: true,
      intakeForm: {
        title: 'Formulir Pendaftaran Servis Kendaraan',
        description: 'Daftarkan kendaraan Anda untuk servis rutin atau perbaikan.',
        formType: SubmissionType.Intake,
        fields: [
          { order: 1, label: 'Jenis Kendaraan', type: FieldType.SingleSelect, required: true, options: [{ key: 'motor', value: 'Sepeda Motor' }, { key: 'mobil', value: 'Mobil' }] },
          { order: 2, label: 'Merk & Tipe', type: FieldType.Text, required: true, placeholder: 'contoh: Honda Vario 160 / Toyota Avanza 2020' },
          { order: 3, label: 'Nomor Polisi', type: FieldType.Text, required: true, placeholder: 'contoh: B 1234 ABC' },
          { order: 4, label: 'Jenis Servis', type: FieldType.SingleSelect, required: true, options: [{ key: 'rutin', value: 'Servis Rutin / Berkala' }, { key: 'mesin', value: 'Perbaikan Mesin' }, { key: 'kelistrikan', value: 'Kelistrikan & Aki' }, { key: 'body', value: 'Body & Cat' }, { key: 'ban', value: 'Ban & Velg' }] },
          { order: 5, label: 'Keluhan / Deskripsi Masalah', type: FieldType.Textarea, required: true, placeholder: 'Jelaskan keluhan atau permintaan servis...' },
        ],
      },
      reviewForm: {
        title: 'Ulasan Servis Kendaraan',
        description: 'Berikan penilaian terhadap hasil servis kendaraan Anda.',
        formType: SubmissionType.Review,
        fields: [
          { order: 1, label: 'Kondisi Kendaraan Setelah Servis', type: FieldType.SingleSelect, required: true, options: [{ key: 'sangat_baik', value: 'Sangat Baik - Nyaman Dikendarai' }, { key: 'baik', value: 'Baik' }, { key: 'masalah', value: 'Masih Ada Masalah' }] },
          { order: 2, label: 'Kerapian & Kebersihan Pengerjaan', type: FieldType.SingleSelect, required: true, options: [{ key: 'rapi', value: 'Rapi & Bersih' }, { key: 'cukup', value: 'Cukup' }, { key: 'kotor', value: 'Kurang Bersih' }] },
          { order: 3, label: 'Komentar', type: FieldType.Textarea, required: false },
        ],
      },
    },
    workOrdersConfig: [
      {
        configId: null,
        positionsOnDuty: { name: 'Mekanik', description: 'Mekanik yang menangani servis dan perbaikan kendaraan bermotor.' },
        workOrderApprovalAccessType: ApprovalAccessType.AUTO,
        workReportApprovalAccessType: ApprovalAccessType.MANAGER,
        showReportToRequester: false,
        minStaff: 1,
        maxStaff: 2,
        workOrderForm: {
          title: 'Instruksi Kerja Servis Kendaraan',
          description: 'Detail pekerjaan servis yang harus dilakukan mekanik.',
          formType: SubmissionType.WorkOrder,
          fields: [
            { order: 1, label: 'Daftar Pekerjaan', type: FieldType.Textarea, required: true, placeholder: 'Uraikan pekerjaan yang harus dilakukan...' },
            { order: 2, label: 'Sparepart yang Dibutuhkan', type: FieldType.Textarea, required: true, placeholder: 'Daftar sparepart beserta kode part...' },
            { order: 3, label: 'Estimasi Waktu Pengerjaan (jam)', type: FieldType.Text, required: true, placeholder: 'contoh: 3' },
          ],
        },
        workReportForm: {
          title: 'Laporan Penyelesaian Servis Kendaraan',
          description: 'Dokumentasi hasil servis kendaraan oleh mekanik.',
          formType: SubmissionType.Report,
          fields: [
            { order: 1, label: 'Pekerjaan yang Dilakukan', type: FieldType.Textarea, required: true, placeholder: 'Detail pekerjaan yang telah diselesaikan...' },
            { order: 2, label: 'Sparepart yang Diganti', type: FieldType.Textarea, required: true, placeholder: 'Daftar part yang diganti beserta harga...' },
            { order: 3, label: 'Hasil Test Drive', type: FieldType.SingleSelect, required: true, options: [{ key: 'ok', value: 'Normal - Siap Digunakan' }, { key: 'monitor', value: 'Perlu Monitoring' }, { key: 'lanjutan', value: 'Perlu Perbaikan Lanjutan' }] },
            { order: 4, label: 'Foto Hasil Servis', type: FieldType.Image, required: true },
          ],
        },
      },
    ],
  },

  // ── 5. Servis & Reparasi — Perbaikan Perangkat Elektronik ──────────────
  {
    title: 'Perbaikan Perangkat Elektronik',
    description:
      'Layanan perbaikan dan servis perangkat elektronik seperti laptop, printer, smartphone, dan peralatan elektronik lainnya.',
    companyTypeId: COMPANY_TYPE_IDS.Servis,
    accessType: 'public',
    draftingWorkOrderType: 'auto',
    serviceRequestConfig: {
      serviceRequestApprovalAccessType: ApprovalAccessType.AUTO,
      reviewNeed: true,
      intakeForm: {
        title: 'Formulir Penerimaan Perangkat Elektronik',
        description: 'Daftarkan perangkat elektronik Anda untuk diperbaiki.',
        formType: SubmissionType.Intake,
        fields: [
          { order: 1, label: 'Jenis Perangkat', type: FieldType.SingleSelect, required: true, options: [{ key: 'laptop', value: 'Laptop / Notebook' }, { key: 'printer', value: 'Printer / Scanner' }, { key: 'smartphone', value: 'Smartphone / Tablet' }, { key: 'lainnya', value: 'Perangkat Lainnya' }] },
          { order: 2, label: 'Merk & Tipe', type: FieldType.Text, required: true, placeholder: 'contoh: HP Pavilion 14 / Epson L3210' },
          { order: 3, label: 'Nomor Seri (opsional)', type: FieldType.Text, required: false, placeholder: 'Nomor seri perangkat...' },
          { order: 4, label: 'Keluhan / Kerusakan', type: FieldType.Textarea, required: true, placeholder: 'Jelaskan masalah yang dialami perangkat...' },
          { order: 5, label: 'Foto Kondisi Perangkat', type: FieldType.Image, required: false },
        ],
      },
      reviewForm: {
        title: 'Ulasan Perbaikan Perangkat',
        description: 'Berikan penilaian terhadap hasil perbaikan perangkat Anda.',
        formType: SubmissionType.Review,
        fields: [
          { order: 1, label: 'Perangkat Berfungsi Normal?', type: FieldType.SingleSelect, required: true, options: [{ key: 'normal', value: 'Ya, berfungsi normal' }, { key: 'sebagian', value: 'Sebagian berfungsi' }, { key: 'masalah', value: 'Masih bermasalah' }] },
          { order: 2, label: 'Kepuasan Pelayanan', type: FieldType.SingleSelect, required: true, options: [{ key: 'puas', value: 'Puas' }, { key: 'cukup', value: 'Cukup Puas' }, { key: 'kurang', value: 'Kurang Puas' }] },
          { order: 3, label: 'Komentar', type: FieldType.Textarea, required: false },
        ],
      },
    },
    workOrdersConfig: [
      {
        configId: null,
        positionsOnDuty: { name: 'Teknisi Elektronik', description: 'Teknisi spesialis perbaikan laptop, printer, smartphone, dan perangkat elektronik.' },
        workOrderApprovalAccessType: ApprovalAccessType.AUTO,
        workReportApprovalAccessType: ApprovalAccessType.AUTO,
        showReportToRequester: false,
        minStaff: 1,
        maxStaff: 1,
        workReportForm: {
          title: 'Laporan Perbaikan Perangkat Elektronik',
          description: 'Dokumentasi diagnosis dan perbaikan perangkat elektronik.',
          formType: SubmissionType.Report,
          fields: [
            { order: 1, label: 'Hasil Diagnosa', type: FieldType.Textarea, required: true, placeholder: 'Uraikan penyebab kerusakan...' },
            { order: 2, label: 'Tindakan Perbaikan', type: FieldType.Textarea, required: true, placeholder: 'Detail perbaikan yang dilakukan...' },
            { order: 3, label: 'Komponen yang Diganti', type: FieldType.Textarea, required: false, placeholder: 'Daftar komponen pengganti (jika ada)...' },
            { order: 4, label: 'Status Akhir', type: FieldType.SingleSelect, required: true, options: [{ key: 'selesai', value: 'Selesai - Perangkat Normal' }, { key: 'tidak_bisa', value: 'Tidak Dapat Diperbaiki' }, { key: 'tunggu_part', value: 'Menunggu Sparepart' }] },
            { order: 5, label: 'Foto Hasil Perbaikan', type: FieldType.Image, required: true },
          ],
        },
      },
    ],
  },

  // ── 6. Fasilitas & Perkantoran — Kebersihan & Perawatan Gedung ─────────
  {
    title: 'Kebersihan & Perawatan Gedung',
    description:
      'Layanan kebersihan rutin dan perawatan area gedung meliputi pembersihan lantai, kaca, toilet, dan pengelolaan sampah.',
    companyTypeId: COMPANY_TYPE_IDS.Fasilitas,
    accessType: 'member_only',
    draftingWorkOrderType: 'auto',
    serviceRequestConfig: {
      serviceRequestApprovalAccessType: ApprovalAccessType.AUTO,
      reviewNeed: true,
      intakeForm: {
        title: 'Formulir Permintaan Layanan Kebersihan',
        description: 'Ajukan permintaan layanan kebersihan untuk area gedung Anda.',
        formType: SubmissionType.Intake,
        fields: [
          { order: 1, label: 'Area yang Perlu Dibersihkan', type: FieldType.Text, required: true, placeholder: 'contoh: Lobby Utama / Toilet Lt. 3 / Parkiran' },
          { order: 2, label: 'Jenis Layanan', type: FieldType.SingleSelect, required: true, options: [{ key: 'rutin', value: 'Pembersihan Rutin' }, { key: 'deep', value: 'Deep Cleaning' }, { key: 'kaca', value: 'Pembersihan Kaca & Jendela' }, { key: 'sampah', value: 'Pengangkutan Sampah' }, { key: 'pest', value: 'Pest Control' }] },
          { order: 3, label: 'Tingkat Urgensi', type: FieldType.SingleSelect, required: true, options: [{ key: 'rendah', value: 'Rendah - Terjadwal' }, { key: 'sedang', value: 'Sedang' }, { key: 'tinggi', value: 'Tinggi - Segera' }] },
          { order: 4, label: 'Catatan Tambahan', type: FieldType.Textarea, required: false, placeholder: 'Informasi tambahan...' },
        ],
      },
      reviewForm: {
        title: 'Evaluasi Layanan Kebersihan',
        description: 'Berikan penilaian atas hasil pembersihan yang dilakukan.',
        formType: SubmissionType.Review,
        fields: [
          { order: 1, label: 'Kebersihan Area', type: FieldType.SingleSelect, required: true, options: [{ key: 'bersih', value: 'Bersih & Wangi' }, { key: 'cukup', value: 'Cukup Bersih' }, { key: 'kotor', value: 'Masih Kotor' }] },
          { order: 2, label: 'Ketepatan Waktu', type: FieldType.SingleSelect, required: true, options: [{ key: 'tepat', value: 'Tepat Waktu' }, { key: 'terlambat', value: 'Terlambat' }] },
          { order: 3, label: 'Saran', type: FieldType.Textarea, required: false },
        ],
      },
    },
    workOrdersConfig: [
      {
        configId: null,
        positionsOnDuty: { name: 'Petugas Kebersihan', description: 'Tim kebersihan yang menangani pembersihan dan perawatan area gedung.' },
        workOrderApprovalAccessType: ApprovalAccessType.AUTO,
        workReportApprovalAccessType: ApprovalAccessType.AUTO,
        showReportToRequester: false,
        minStaff: 1,
        maxStaff: 4,
        workReportForm: {
          title: 'Laporan Pelaksanaan Kebersihan',
          description: 'Dokumentasi hasil pembersihan area gedung.',
          formType: SubmissionType.Report,
          fields: [
            { order: 1, label: 'Area yang Dibersihkan', type: FieldType.Textarea, required: true, placeholder: 'Daftar area yang telah dibersihkan...' },
            { order: 2, label: 'Pekerjaan yang Dilakukan', type: FieldType.Textarea, required: true, placeholder: 'Detail pekerjaan: sapu, pel, lap kaca, dll...' },
            { order: 3, label: 'Kondisi Akhir', type: FieldType.SingleSelect, required: true, options: [{ key: 'bersih', value: 'Bersih Sempurna' }, { key: 'cukup', value: 'Cukup Bersih' }, { key: 'perlu_lanjutan', value: 'Perlu Pembersihan Lanjutan' }] },
            { order: 4, label: 'Foto Hasil Pembersihan', type: FieldType.Image, required: true },
          ],
        },
      },
    ],
  },
];
