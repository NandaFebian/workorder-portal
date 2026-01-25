import { UserResource } from '../../users/resources/user.resource';

/**
 * Company Resource
 * Handles company data transformation for API responses
 */
export class CompanyResource {
    /**
     * Transform company data - full details
     */
    static transformCompany(company: any): any {
        if (!company) return null;

        const companyObj = company.toObject ? company.toObject() : { ...company };

        // Transform ownerId to owner if populated
        if (companyObj.ownerId) {
            if (typeof companyObj.ownerId === 'object') {
                companyObj.owner = UserResource.transformUserMinimal(companyObj.ownerId);
            } else {
                companyObj.owner = companyObj.ownerId;
            }
            delete companyObj.ownerId;
        }

        return companyObj;
    }

    /**
     * Transform company minimal - for nested objects
     * Returns only essential fields: _id, name, address, description
     */
    static transformCompanyMinimal(company: any): any {
        if (!company) return null;

        const companyObj = company.toObject ? company.toObject() : { ...company };

        return {
            _id: companyObj._id,
            name: companyObj.name,
            address: companyObj.address,
            description: companyObj.description,
        };
    }

    /**
     * Transform company with owner details
     * Use when owner is populated
     */
    static transformCompanyWithOwner(company: any): any {
        if (!company) return null;

        const companyObj = company.toObject ? company.toObject() : { ...company };

        // Transform owner
        if (companyObj.ownerId) {
            companyObj.owner = UserResource.transformUser(companyObj.ownerId);
            delete companyObj.ownerId;
        }

        return companyObj;
    }

    /**
     * Transform employee with position nested object
     * @deprecated Use UserResource.transformUser instead
     */
    static transformEmployee(user: any): any {
        return UserResource.transformUser(user);
    }

    /**
     * Transform invitation
     */
    static transformInvitation(invitation: any): any {
        return invitation.toObject ? invitation.toObject() : invitation;
    }
}
