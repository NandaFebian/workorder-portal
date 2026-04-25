import { ServiceRequestStatus } from '../enums/service-request-status.enum';
import { WorkOrderStatus } from '../enums/work-order-status.enum';
import { WorkReportStatus } from '../enums/work-report-status.enum';

export class StatusTranslator {
  static translateSRStatus(status: ServiceRequestStatus): string {
    const map: Record<ServiceRequestStatus, string> = {
      [ServiceRequestStatus.RECEIVED]: 'Diterima',
      [ServiceRequestStatus.CANCELLED]: 'Dibatalkan',
      [ServiceRequestStatus.REJECTED]: 'Ditolak',
      [ServiceRequestStatus.APPROVED]: 'Disetujui',
      [ServiceRequestStatus.UNPROCESSABLE]: 'Tidak Dapat Diproses',
      [ServiceRequestStatus.ON_PROGRESS]: 'Sedang Dikerjakan',
      [ServiceRequestStatus.PARTIAL_COMPLETED]: 'Selesai Sebagian',
      [ServiceRequestStatus.FAILED]: 'Gagal',
      [ServiceRequestStatus.COMPLETED]: 'Selesai',
      [ServiceRequestStatus.CLOSED]: 'Ditutup',
    };
    return map[status] || status;
  }

  static translateWOStatus(status: WorkOrderStatus): string {
    const map: Record<WorkOrderStatus, string> = {
      [WorkOrderStatus.DRAFTED]: 'Draf',
      [WorkOrderStatus.SENT]: 'Terkirim',
      [WorkOrderStatus.APPROVED]: 'Disetujui',
      [WorkOrderStatus.REJECTED]: 'Ditolak',
      [WorkOrderStatus.ON_PROGRESS]: 'Sedang Dikerjakan',
      [WorkOrderStatus.COMPLETED]: 'Selesai',
      [WorkOrderStatus.FAILED]: 'Gagal',
      [WorkOrderStatus.CANCELLED]: 'Dibatalkan',
    };
    return map[status] || status;
  }

  static translateReportStatus(status: WorkReportStatus): string {
    const map: Record<WorkReportStatus, string> = {
      [WorkReportStatus.DRAFTED]: 'Draf',
      [WorkReportStatus.ON_PROGRESS]: 'Sedang Dikerjakan',
      [WorkReportStatus.SUBMITTED]: 'Dikirim',
      [WorkReportStatus.APPROVED]: 'Disetujui',
      [WorkReportStatus.REJECTED]: 'Ditolak',
    };
    return map[status] || status;
  }
}
