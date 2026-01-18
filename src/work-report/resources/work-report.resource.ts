import { WorkReportDocument } from '../schemas/work-report.schema';

export class WorkReportResource {
    /**
     * Transform work report data
     */
    static transformWorkReport(doc: any): any {
        const report = doc.toObject ? doc.toObject() : { ...doc };

        // Rename workOrderId to workOrder if populated
        if (report.workOrderId && (typeof report.workOrderId === 'object')) {
            report.workOrder = report.workOrderId;
            delete report.workOrderId;
        }

        return report;
    }
}
