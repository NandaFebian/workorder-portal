import { RequiredStaffsResource } from '../../common/resources/required-staffs.resource';

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

        // Transform required staffs jika ada menggunakan centralized resource
        if (serviceObj.requiredStaffs) {
            serviceObj.requiredStaffs = RequiredStaffsResource.transformRequiredStaffs(
                serviceObj.requiredStaffs,
            );
        }

        return serviceObj;
    }

    /**
     * Transform required staff dengan position info
     * @deprecated Use RequiredStaffsResource.transformRequiredStaff instead
     */
    static transformRequiredStaff(requiredStaff: any): any {
        return RequiredStaffsResource.transformRequiredStaff(requiredStaff);
    }

    /**
     * Transform list of services
     */
    static transformServiceList(services: any[]): any[] {
        return services.map((service) => this.transformService(service));
    }
}
