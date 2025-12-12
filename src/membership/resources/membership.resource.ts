/**
 * Membership Resource
 * Menangani transformasi data Membership
 */
export class MembershipResource {
    /**
     * Transform membership
     */
    static transformMembership(membership: any): any {
        return membership.toObject ? membership.toObject() : membership;
    }

    /**
     * Transform generate codes response
     */
    static transformGenerateCodesResponse(codes: any[]): any {
        return {
            count: codes.length,
            codes: codes,
        };
    }
}
