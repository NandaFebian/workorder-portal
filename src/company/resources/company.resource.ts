/**
 * Company Resource
 * Menangani transformasi data Company dan Employee
 */
export class CompanyResource {
    /**
     * Transform company data
     */
    static transformCompany(company: any): any {
        const companyObj = company.toObject ? company.toObject() : { ...company };

        if (companyObj.ownerId) {
            companyObj.owner = companyObj.ownerId;
            delete companyObj.ownerId;
        }

        return companyObj;
    }

    /**
     * Transform employee dengan position nested object
     */
    static transformEmployee(user: any): any {
        const empObject: any = user.toObject ? user.toObject() : { ...user };

        // Transform positionId menjadi position nested object
        if (empObject.positionId) {
            empObject.position = empObject.positionId;
            delete empObject.positionId;
        }

        return empObject;
    }

    /**
     * Transform invitation
     */
    static transformInvitation(invitation: any): any {
        return invitation.toObject ? invitation.toObject() : invitation;
    }
}
