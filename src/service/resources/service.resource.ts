/**
 * Service Resource
 * Menangani transformasi data Service dengan required staffs dan forms
 */
export class ServiceResource {
    /**
     * Transform service dengan populate required staffs
     */
    static transformService(service: any): any {
        const serviceObj = service.toObject ? service.toObject() : { ...service };

        // Transform required staffs jika ada
        if (serviceObj.requiredStaffs) {
            serviceObj.requiredStaffs = serviceObj.requiredStaffs.map((req: any) =>
                this.transformRequiredStaff(req),
            );
        }

        return serviceObj;
    }

    /**
     * Transform required staff dengan position info
     */
    static transformRequiredStaff(requiredStaff: any): any {
        return {
            minimumStaff: requiredStaff.minimumStaff,
            maximumStaff: requiredStaff.maximumStaff,
            positions: requiredStaff.positions,
        };
    }

    /**
     * Transform list of services
     */
    static transformServiceList(services: any[]): any[] {
        return services.map((service) => this.transformService(service));
    }
}
