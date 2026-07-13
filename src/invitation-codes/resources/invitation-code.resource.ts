export class InvitationCodeResource {
  static transform(doc: any): any {
    if (!doc) return null;
    const obj = doc.toObject ? doc.toObject() : { ...doc };

    const maxUses = obj.maxUses ?? null;
    const usedCount = obj.usedCount ?? 0;
    const isExpired = obj.expiresAt
      ? new Date(obj.expiresAt).getTime() < Date.now()
      : false;
    const isExhausted = maxUses !== null && usedCount >= maxUses;

    return {
      _id: obj._id,
      code: obj.code,
      companyId: obj.companyId,
      role: obj.role,
      position: obj.positionId ?? null,
      createdBy: obj.createdBy ?? null,
      isActive: obj.isActive,
      maxUses,
      usedCount,
      remainingUses: maxUses === null ? null : Math.max(maxUses - usedCount, 0),
      expiresAt: obj.expiresAt ?? null,
      // Convenience flag: is this code redeemable right now?
      isClaimable: obj.isActive && !isExpired && !isExhausted,
      claimedCount: Array.isArray(obj.claimedBy) ? obj.claimedBy.length : 0,
      createdAt: obj.createdAt,
      updatedAt: obj.updatedAt,
    };
  }

  static transformList(docs: any[]): any[] {
    if (!Array.isArray(docs)) return [];
    return docs.map((doc) => this.transform(doc));
  }
}
