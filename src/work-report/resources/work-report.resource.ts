import { WorkReportDocument } from '../schemas/work-report.schema';

export class WorkReportResource {
    /**
     * Transform work report data
     */
    static transformWorkReport(doc: any): any {
        const report = doc.toObject ? doc.toObject() : { ...doc };

        // Ensure workOrderId is a string, not an object
        if (report.workOrderId && typeof report.workOrderId === 'object') {
            report.workOrderId = report.workOrderId.toString();
        }

        return report;
    }
}
