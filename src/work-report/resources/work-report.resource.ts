import { WorkReportDocument } from '../schemas/work-report.schema';

export class WorkReportResource {
  static transformWorkReport(doc: WorkReportDocument | any): any {
    const report = doc.toObject ? doc.toObject() : { ...doc };

    return {
      _id: report._id,
      workOrderId: report.workOrderId,
      companyId: report.companyId,
      reportForm: report.reportFormId,
      workReportApprovalAccessType: report.workReportApprovalAccessType,
      status: report.status,
      approvedBy: (report.workReportApprovalAccessType === 'manager' && report.approvedBy)
        ? {
            _id: report.approvedBy._id ?? report.approvedBy,
            name: report.approvedBy.name,
            email: report.approvedBy.email,
            role: report.approvedBy.role,
          }
        : null,
      startedAt: report.startedAt,
      submittedAt: report.submittedAt,
      approvedAt: report.approvedAt,
      rejectedAt: report.rejectedAt,
      createdAt: report.createdAt,
      updatedAt: report.updatedAt,
      deletedAt: report.deletedAt,
    };
  }
}
