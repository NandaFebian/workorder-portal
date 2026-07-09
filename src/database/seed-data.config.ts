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
  // ══════════════════════════════════════════════════════════════════════════
  // MANUAL DRAFT (SR approval: manager, WO approval: auto, WR approval: manager)
  // ══════════════════════════════════════════════════════════════════════════

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

  // ── 2. Fasilitas & Perkantoran — Perawatan AC & Tata Udara Gedung ──────
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

  // ── 3. Servis & Reparasi — Servis Kendaraan ────────────────────────────
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

  // ══════════════════════════════════════════════════════════════════════════
  // AUTO DRAFT (Semua auto: SR, WO, WR)
  // ══════════════════════════════════════════════════════════════════════════

  // ── 4. ISP & Jaringan — Validasi Pembayaran Tagihan Internet ───────────
  {
    title: 'Validasi Pembayaran Tagihan Internet',
    description:
      'Layanan verifikasi pembayaran tagihan internet pelanggan. Pelanggan mengirimkan bukti transfer, staf memvalidasi dan mengaktifkan layanan.',
    companyTypeId: COMPANY_TYPE_IDS.ISP,
    accessType: 'public',
    draftingWorkOrderType: 'auto',
    serviceRequestConfig: {
      serviceRequestApprovalAccessType: ApprovalAccessType.AUTO,
      reviewNeed: true,
      intakeForm: {
        title: 'Formulir Konfirmasi Pembayaran Tagihan',
        description: 'Kirimkan bukti pembayaran tagihan internet Anda untuk diverifikasi.',
        formType: SubmissionType.Intake,
        fields: [
          { order: 1, label: 'Nomor Pelanggan / ID Akun', type: FieldType.Text, required: true, placeholder: 'contoh: CUST-20250101' },
          { order: 2, label: 'Periode Tagihan', type: FieldType.SingleSelect, required: true, options: [{ key: 'jan', value: 'Januari' }, { key: 'feb', value: 'Februari' }, { key: 'mar', value: 'Maret' }, { key: 'apr', value: 'April' }, { key: 'mei', value: 'Mei' }, { key: 'jun', value: 'Juni' }, { key: 'jul', value: 'Juli' }, { key: 'agu', value: 'Agustus' }, { key: 'sep', value: 'September' }, { key: 'okt', value: 'Oktober' }, { key: 'nov', value: 'November' }, { key: 'des', value: 'Desember' }] },
          { order: 3, label: 'Nominal Pembayaran (Rp)', type: FieldType.Text, required: true, placeholder: 'contoh: 350000' },
          { order: 4, label: 'Metode Pembayaran', type: FieldType.SingleSelect, required: true, options: [{ key: 'transfer', value: 'Transfer Bank' }, { key: 'ewallet', value: 'E-Wallet (GoPay/OVO/Dana)' }, { key: 'minimarket', value: 'Minimarket (Indomaret/Alfamart)' }] },
          { order: 5, label: 'Bukti Pembayaran', type: FieldType.Image, required: true },
        ],
      },
      reviewForm: {
        title: 'Ulasan Proses Validasi Pembayaran',
        description: 'Berikan penilaian terhadap kecepatan dan kemudahan proses validasi pembayaran.',
        formType: SubmissionType.Review,
        fields: [
          { order: 1, label: 'Kecepatan Proses Validasi', type: FieldType.SingleSelect, required: true, options: [{ key: 'cepat', value: 'Cepat (< 1 jam)' }, { key: 'normal', value: 'Normal (1-24 jam)' }, { key: 'lambat', value: 'Lambat (> 24 jam)' }] },
          { order: 2, label: 'Komentar', type: FieldType.Textarea, required: false },
        ],
      },
    },
    workOrdersConfig: [
      {
        configId: null,
        positionsOnDuty: { name: 'Staf Billing & Keuangan', description: 'Staf yang memverifikasi pembayaran dan mengaktifkan layanan pelanggan.' },
        workOrderApprovalAccessType: ApprovalAccessType.AUTO,
        workReportApprovalAccessType: ApprovalAccessType.AUTO,
        showReportToRequester: false,
        minStaff: 1,
        maxStaff: 1,
        workReportForm: {
          title: 'Laporan Verifikasi Pembayaran',
          description: 'Hasil verifikasi pembayaran tagihan pelanggan.',
          formType: SubmissionType.Report,
          fields: [
            { order: 1, label: 'Status Verifikasi', type: FieldType.SingleSelect, required: true, options: [{ key: 'valid', value: 'Valid - Pembayaran Dikonfirmasi' }, { key: 'nominal_salah', value: 'Nominal Tidak Sesuai' }, { key: 'tidak_valid', value: 'Tidak Valid - Bukti Ditolak' }] },
            { order: 2, label: 'Nomor Referensi Transaksi', type: FieldType.Text, required: true, placeholder: 'Nomor referensi dari sistem billing...' },
            { order: 3, label: 'Screenshot Konfirmasi Sistem', type: FieldType.Image, required: true },
          ],
        },
      },
    ],
  },

  // ── 5. Servis & Reparasi — Konfirmasi Pembayaran Servis ────────────────
  {
    title: 'Konfirmasi Pembayaran Servis',
    description:
      'Layanan verifikasi pembayaran atas jasa servis kendaraan atau perangkat. Pelanggan mengirimkan bukti bayar, staf mengkonfirmasi dan merilis unit.',
    companyTypeId: COMPANY_TYPE_IDS.Servis,
    accessType: 'public',
    draftingWorkOrderType: 'auto',
    serviceRequestConfig: {
      serviceRequestApprovalAccessType: ApprovalAccessType.AUTO,
      reviewNeed: true,
      intakeForm: {
        title: 'Formulir Konfirmasi Pembayaran Servis',
        description: 'Kirimkan bukti pembayaran untuk mengambil unit yang telah selesai diservis.',
        formType: SubmissionType.Intake,
        fields: [
          { order: 1, label: 'Nomor Invoice / Nota Servis', type: FieldType.Text, required: true, placeholder: 'contoh: INV-2025-001234' },
          { order: 2, label: 'Nominal Pembayaran (Rp)', type: FieldType.Text, required: true, placeholder: 'contoh: 750000' },
          { order: 3, label: 'Metode Pembayaran', type: FieldType.SingleSelect, required: true, options: [{ key: 'tunai', value: 'Tunai' }, { key: 'transfer', value: 'Transfer Bank' }, { key: 'debit', value: 'Kartu Debit' }, { key: 'cc', value: 'Kartu Kredit' }] },
          { order: 4, label: 'Bukti Pembayaran', type: FieldType.Image, required: true },
        ],
      },
      reviewForm: {
        title: 'Ulasan Proses Pembayaran & Pengambilan',
        description: 'Berikan penilaian terhadap proses pembayaran dan pengambilan unit.',
        formType: SubmissionType.Review,
        fields: [
          { order: 1, label: 'Kemudahan Proses Pembayaran', type: FieldType.SingleSelect, required: true, options: [{ key: 'mudah', value: 'Mudah & Cepat' }, { key: 'cukup', value: 'Cukup Mudah' }, { key: 'sulit', value: 'Rumit / Berbelit' }] },
          { order: 2, label: 'Komentar', type: FieldType.Textarea, required: false },
        ],
      },
    },
    workOrdersConfig: [
      {
        configId: null,
        positionsOnDuty: { name: 'Staf Kasir & Administrasi', description: 'Staf kasir yang memverifikasi pembayaran dan memproses serah terima unit.' },
        workOrderApprovalAccessType: ApprovalAccessType.AUTO,
        workReportApprovalAccessType: ApprovalAccessType.AUTO,
        showReportToRequester: false,
        minStaff: 1,
        maxStaff: 1,
        workReportForm: {
          title: 'Laporan Konfirmasi Pembayaran & Serah Terima',
          description: 'Dokumentasi verifikasi pembayaran dan penyerahan unit ke pelanggan.',
          formType: SubmissionType.Report,
          fields: [
            { order: 1, label: 'Status Pembayaran', type: FieldType.SingleSelect, required: true, options: [{ key: 'lunas', value: 'Lunas - Unit Siap Diambil' }, { key: 'kurang', value: 'Pembayaran Kurang' }, { key: 'ditolak', value: 'Bukti Tidak Valid' }] },
            { order: 2, label: 'Nomor Kwitansi Resmi', type: FieldType.Text, required: true, placeholder: 'Nomor kwitansi yang diterbitkan...' },
            { order: 3, label: 'Foto Kwitansi / Bukti Serah Terima', type: FieldType.Image, required: true },
          ],
        },
      },
    ],
  },

  // ── 6. Fasilitas & Perkantoran — Validasi Pembayaran Sewa & Utilitas ───
  {
    title: 'Validasi Pembayaran Sewa & Utilitas',
    description:
      'Layanan verifikasi pembayaran sewa ruangan, listrik, air, dan biaya pengelolaan gedung bagi tenant/penyewa.',
    companyTypeId: COMPANY_TYPE_IDS.Fasilitas,
    accessType: 'member_only',
    draftingWorkOrderType: 'auto',
    serviceRequestConfig: {
      serviceRequestApprovalAccessType: ApprovalAccessType.AUTO,
      reviewNeed: true,
      intakeForm: {
        title: 'Formulir Konfirmasi Pembayaran Sewa & Utilitas',
        description: 'Kirimkan bukti pembayaran sewa dan/atau utilitas gedung Anda.',
        formType: SubmissionType.Intake,
        fields: [
          { order: 1, label: 'Nomor Unit / Tenant', type: FieldType.Text, required: true, placeholder: 'contoh: Unit 5A / Tenant-012' },
          { order: 2, label: 'Jenis Pembayaran', type: FieldType.SingleSelect, required: true, options: [{ key: 'sewa', value: 'Sewa Ruangan' }, { key: 'listrik', value: 'Tagihan Listrik' }, { key: 'air', value: 'Tagihan Air' }, { key: 'ipl', value: 'IPL (Biaya Pengelolaan)' }, { key: 'gabungan', value: 'Gabungan' }] },
          { order: 3, label: 'Periode Pembayaran', type: FieldType.Text, required: true, placeholder: 'contoh: Juli 2025' },
          { order: 4, label: 'Nominal Pembayaran (Rp)', type: FieldType.Text, required: true, placeholder: 'contoh: 15000000' },
          { order: 5, label: 'Bukti Transfer / Pembayaran', type: FieldType.Image, required: true },
        ],
      },
      reviewForm: {
        title: 'Evaluasi Proses Validasi Pembayaran',
        description: 'Penilaian terhadap kecepatan dan akurasi proses validasi pembayaran sewa.',
        formType: SubmissionType.Review,
        fields: [
          { order: 1, label: 'Kecepatan Konfirmasi', type: FieldType.SingleSelect, required: true, options: [{ key: 'cepat', value: 'Cepat' }, { key: 'normal', value: 'Normal' }, { key: 'lambat', value: 'Lambat' }] },
          { order: 2, label: 'Catatan', type: FieldType.Textarea, required: false },
        ],
      },
    },
    workOrdersConfig: [
      {
        configId: null,
        positionsOnDuty: { name: 'Staf Keuangan Gedung', description: 'Staf keuangan yang memverifikasi pembayaran sewa dan utilitas dari tenant.' },
        workOrderApprovalAccessType: ApprovalAccessType.AUTO,
        workReportApprovalAccessType: ApprovalAccessType.AUTO,
        showReportToRequester: false,
        minStaff: 1,
        maxStaff: 1,
        workReportForm: {
          title: 'Laporan Verifikasi Pembayaran Sewa & Utilitas',
          description: 'Hasil verifikasi pembayaran dari tenant/penyewa.',
          formType: SubmissionType.Report,
          fields: [
            { order: 1, label: 'Status Verifikasi', type: FieldType.SingleSelect, required: true, options: [{ key: 'valid', value: 'Valid - Pembayaran Diterima' }, { key: 'kurang', value: 'Nominal Kurang Bayar' }, { key: 'tidak_valid', value: 'Tidak Valid' }] },
            { order: 2, label: 'Nomor Bukti Penerimaan', type: FieldType.Text, required: true, placeholder: 'Nomor kwitansi resmi...' },
            { order: 3, label: 'Screenshot Mutasi / Sistem', type: FieldType.Image, required: true },
          ],
        },
      },
    ],
  },
];
