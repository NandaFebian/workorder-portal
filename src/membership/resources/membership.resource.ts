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
      company_id: obj.companyId,
      external_customer_email: obj.externalCustomerEmail,
      external_customer_name: obj.externalCustomerName,
      token: obj.token,
      claimed_at: obj.claimedAt,
      deleted_at: obj.deletedAt,
      created_at: obj.createdAt,
      updated_at: obj.updatedAt,
    };

    if (obj.claimedBy) {
      if (typeof obj.claimedBy === 'object' && obj.claimedBy._id) {
        result.claimed_by = {
          _id: obj.claimedBy._id,
          name: obj.claimedBy.name,
          email: obj.claimedBy.email,
          role: obj.claimedBy.role,
        };
        if (obj.claimedBy.createdAt) {
          result.claimed_by.created_at = obj.claimedBy.createdAt;
        }
        if (obj.claimedBy.updatedAt) {
          result.claimed_by.updated_at = obj.claimedBy.updatedAt;
        }
      } else {
        result.claimed_by = obj.claimedBy;
      }
    } else {
      result.claimed_by = null;
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

