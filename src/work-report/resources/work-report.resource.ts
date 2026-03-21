import { WorkReportDocument } from '../schemas/work-report.schema';

export class WorkReportResource {
  static transformWorkReport(doc: WorkReportDocument | any): any {
    const report = doc.toObject ? doc.toObject() : { ...doc };

    return {
      _id: report._id,
      workOrderId: report.workOrderId,
      companyId: report.companyId,
      approvedBy: report.approvedBy
        ? {
            _id: report.approvedBy._id ?? report.approvedBy,
            name: report.approvedBy.name,
            email: report.approvedBy.email,
            role: report.approvedBy.role,
          }
        : null,
      status: report.status,
      startedAt: report.startedAt,
      completedAt: report.completedAt,
      createdAt: report.createdAt,
      updatedAt: report.updatedAt,
    };
  }
}
