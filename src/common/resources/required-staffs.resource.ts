/**
 * Centralized Resource for RequiredStaffs Transformation
 * Ensures consistent transformation of requiredStaffs across all endpoints
 */
export class RequiredStaffsResource {
    static transformRequiredStaff(requiredStaff: any): any {
        if (!requiredStaff) return null;

        return {
            minimumStaff: requiredStaff.minimumStaff,
            maximumStaff: requiredStaff.maximumStaff,
            position: requiredStaff.positionId || requiredStaff.position || null,
            ...(requiredStaff._id && { _id: requiredStaff._id }),
        };
    }

    /**
     * Transform array of requiredStaffs
     */
    static transformRequiredStaffs(requiredStaffs: any[]): any[] {
        if (!requiredStaffs || !Array.isArray(requiredStaffs)) {
            return [];
        }

        return requiredStaffs.map((req) => this.transformRequiredStaff(req));
    }

    /**
     * Transform service object with requiredStaffs
     * Ensures consistent service response format
     */
    static transformServiceWithRequiredStaffs(service: any): any {
        if (!service) return null;

        const serviceObj = service.toObject ? service.toObject() : service;

        return {
            _id: serviceObj._id,
            companyId: serviceObj.companyId,
            title: serviceObj.title,
            description: serviceObj.description,
            accessType: serviceObj.accessType,
            isActive: serviceObj.isActive,
            requiredStaffs: this.transformRequiredStaffs(serviceObj.requiredStaffs),
            ...(serviceObj.serviceKey && { serviceKey: serviceObj.serviceKey }),
            ...(serviceObj.__v !== undefined && { __v: serviceObj.__v }),
            ...(serviceObj.createdAt && { createdAt: serviceObj.createdAt }),
            ...(serviceObj.updatedAt && { updatedAt: serviceObj.updatedAt }),
        };
    }
}
