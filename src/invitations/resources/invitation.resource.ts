import { PositionResource } from '../../positions/resources/position.resource';
import { CompanyResource } from '../../company/resources/company.resource';

/**
 * Invitation Resource
 * Handles invitation data transformation for API responses
 */
export class InvitationResource {
    /**
     * Transform invitation basic
     */
    static transformInvitation(invitation: any): any {
        if (!invitation) return null;

        const invObj = invitation.toObject ? invitation.toObject() : { ...invitation };

        // Transform positionId to position if populated
        if (invObj.positionId) {
            invObj.position = PositionResource.transformPosition(invObj.positionId);
            delete invObj.positionId;
        }

        // Transform companyId to company if populated
        if (invObj.companyId && typeof invObj.companyId === 'object') {
            invObj.company = CompanyResource.transformCompanyMinimal(invObj.companyId);
            delete invObj.companyId;
        }

        return invObj;
    }

    /**
     * Transform invitation with full details
     * Use when company and position are populated
     */
    static transformInvitationWithDetails(invitation: any): any {
        if (!invitation) return null;

        const invObj = invitation.toObject ? invitation.toObject() : { ...invitation };

        // Transform position
        if (invObj.positionId) {
            invObj.position = PositionResource.transformPosition(invObj.positionId);
            delete invObj.positionId;
        }

        // Transform company
        if (invObj.companyId && typeof invObj.companyId === 'object') {
            invObj.company = CompanyResource.transformCompany(invObj.companyId);
            delete invObj.companyId;
        }

        return invObj;
    }

    /**
     * Transform array of invitations
     */
    static transformInvitationList(invitations: any[]): any[] {
        if (!invitations || !Array.isArray(invitations)) {
            return [];
        }
        return invitations.map((inv) => this.transformInvitation(inv));
    }
}
