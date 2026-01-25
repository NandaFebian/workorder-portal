/**
 * Form Resource
 * Handles form template and submission data transformation for API responses
 */
export class FormResource {
    /**
     * Transform form template - full details
     */
    static transformFormTemplate(template: any): any {
        if (!template) return null;
        return template.toObject ? template.toObject() : { ...template };
    }

    /**
     * Transform form template minimal - for nested objects
     * Returns only essential fields: _id, title, description, formType
     */
    static transformFormTemplateMinimal(template: any): any {
        if (!template) return null;

        const templateObj = template.toObject ? template.toObject() : { ...template };

        return {
            _id: templateObj._id,
            title: templateObj.title,
            description: templateObj.description,
            formType: templateObj.formType,
        };
    }

    /**
     * Transform form with fields
     * Use when fields are populated
     */
    static transformFormWithFields(template: any): any {
        if (!template) return null;

        const templateObj = template.toObject ? template.toObject() : { ...template };

        // Transform fields if they exist
        if (templateObj.fields && Array.isArray(templateObj.fields)) {
            templateObj.fields = templateObj.fields.map((field: any) =>
                this.transformField(field)
            );
        }

        return templateObj;
    }

    /**
     * Transform form submission
     */
    static transformSubmission(submission: any): any {
        if (!submission) return null;
        return submission.toObject ? submission.toObject() : { ...submission };
    }

    /**
     * Transform submission with form details
     * Use when form template is populated
     */
    static transformSubmissionWithForm(submission: any): any {
        if (!submission) return null;

        const submissionObj = submission.toObject ? submission.toObject() : { ...submission };

        // Transform formId to form if populated
        if (submissionObj.formId && typeof submissionObj.formId === 'object') {
            submissionObj.form = this.transformFormTemplateMinimal(submissionObj.formId);
            delete submissionObj.formId;
        }

        return submissionObj;
    }

    /**
     * Transform field
     */
    static transformField(field: any): any {
        if (!field) return null;
        return field.toObject ? field.toObject() : { ...field };
    }

    /**
     * Transform list of form templates
     */
    static transformFormTemplateList(templates: any[]): any[] {
        if (!templates || !Array.isArray(templates)) {
            return [];
        }
        return templates.map((template) => this.transformFormTemplate(template));
    }
}
