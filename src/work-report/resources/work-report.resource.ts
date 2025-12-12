/**
 * Work Report Resource
 * Menangani transformasi data Work Report
 */
export class WorkReportResource {
    /**
     * Transform work report
     */
    static transformWorkReport(report: any): any {
        const reportObj = report.toObject ? report.toObject() : { ...report };

        // Transform report forms jika ada
        if (reportObj.reportForms) {
            reportObj.reportForms = reportObj.reportForms.map((form: any) =>
                this.transformReportForm(form),
            );
        }

        return reportObj;
    }

    /**
     * Transform report form
     */
    static transformReportForm(reportForm: any): any {
        return reportForm;
    }
}
