/**
 * Form Resource
 * Menangani transformasi data Form Template dan Submission
 */
export class FormResource {
    /**
     * Transform form template
     */
    static transformFormTemplate(template: any): any {
        return template.toObject ? template.toObject() : template;
    }

    /**
     * Transform form submission
     */
    static transformSubmission(submission: any): any {
        return submission.toObject ? submission.toObject() : submission;
    }

    /**
     * Transform field
     */
    static transformField(field: any): any {
        return field;
    }
}
