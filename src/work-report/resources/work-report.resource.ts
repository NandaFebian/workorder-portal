import { WorkReportDocument } from '../schemas/work-report.schema';

export class WorkReportResource {
    /**
     * Transform work report data
     */
    static transformWorkReport(doc: any): any {
        const report = doc.toObject ? doc.toObject() : { ...doc };

        return report;
    }
}
