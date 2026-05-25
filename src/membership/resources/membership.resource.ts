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

  /**
   * Transform membership code to snake_case format
   */
  static transformMembershipCode(code: any): any {
    if (!code) return null;
    const obj = code.toObject ? code.toObject() : { ...code };

    const result: any = {
      _id: obj._id,
      companyId: obj.companyId,
      externalCustomerEmail: obj.externalCustomerEmail,
      externalCustomerName: obj.externalCustomerName,
      token: obj.token,
      claimedAt: obj.claimedAt,
      integrationType: obj.integrationType || 'claim_token',
      deletedAt: obj.deletedAt,
      createdAt: obj.createdAt,
      updatedAt: obj.updatedAt,
    };

    if (obj.claimedBy) {
      if (typeof obj.claimedBy === 'object' && obj.claimedBy._id) {
        result.claimedBy = {
          _id: obj.claimedBy._id,
          name: obj.claimedBy.name,
          email: obj.claimedBy.email,
          role: obj.claimedBy.role,
        };
        if (obj.claimedBy.createdAt) {
          result.claimedBy.createdAt = obj.claimedBy.createdAt;
        }
        if (obj.claimedBy.updatedAt) {
          result.claimedBy.updatedAt = obj.claimedBy.updatedAt;
        }
      } else {
        result.claimedBy = obj.claimedBy;
      }
    } else {
      result.claimedBy = null;
    }

    return result;
  }

  /**
   * Transform a list of membership codes
   */
  static transformMembershipCodeList(codes: any[]): any[] {
    if (!codes || !Array.isArray(codes)) return [];
    return codes.map((c) => this.transformMembershipCode(c));
  }
}

