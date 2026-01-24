import { WorkOrderDocument } from '../schemas/work-order.schema';
import { FormSubmissionDocument } from '../../form/schemas/form-submissions.schema';
import { RequiredStaffsResource } from '../../common/resources/required-staffs.resource';

/**
 * Work Order Resource
 * Menangani transformasi data Work Order dari database ke response format
 * Memisahkan presentation logic dari business logic
 */
export class WorkOrderResource {
    /**
     * Transform basic work order untuk list view
     */
    static transformWorkOrder(doc: any): any {
        const wo = doc.toObject ? doc.toObject() : doc;

        // Transform requiredStaffs menggunakan centralized resource
        let requiredStaffs: any[] = [];
        if (wo.serviceId?.requiredStaffs) {
            requiredStaffs = RequiredStaffsResource.transformRequiredStaffs(
                wo.serviceId.requiredStaffs,
            );
        }

        // Transform service object menggunakan centralized resource
        let transformedService: any = null;
        if (wo.serviceId) {
            transformedService = RequiredStaffsResource.transformServiceWithRequiredStaffs(
                wo.serviceId,
            );
        }

        return {
            _id: wo._id,
            clientServiceRequestId: wo.clientServiceRequestId,
            companyId: wo.companyId,
            relatedWorkOrderId: wo.relatedWorkOrderId,
            requiredStaffs: requiredStaffs,
            status: wo.status,
            priority: wo.priority,
            createdAt: wo.createdAt,
            updatedAt: wo.updatedAt,
            startedAt: wo.startedAt,
            completedAt: wo.completedAt,
            createdBy: wo.createdBy,
            service: transformedService,
        };
    }

    /**
     * Transform assigned staff dengan position info
     */
    static transformAssignedStaff(staff: any): any {
        return {
            _id: staff._id,
            name: staff.name,
            email: staff.email,
            role: staff.role,
            position: staff.positionId
                ? {
                    _id: staff.positionId._id,
                    name: staff.positionId.name,
                    companyId: staff.positionId.companyId,
                    createdAt: staff.positionId.createdAt,
                    updatedAt: staff.positionId.updatedAt,
                }
                : null,
            companyId: staff.companyId,
        };
    }

    /**
     * Transform work order detail dengan forms dan submissions
     */
    static transformWorkOrderDetail(
        wo: any,
        workOrderFormsWithFields: any[],
        submissions: FormSubmissionDocument[],
    ): any {
        const doc = wo.toObject ? wo.toObject() : wo;

        // Transform assigned staffs
        const transformedAssignedStaffs =
            doc.assignedStaffs?.map((staff: any) =>
                this.transformAssignedStaff(staff),
            ) || [];

        return {
            ...this.transformWorkOrder(doc),
            assignedStaffs: transformedAssignedStaffs,
            workorderForms: workOrderFormsWithFields,
            submissions: submissions,
        };
    }
}
