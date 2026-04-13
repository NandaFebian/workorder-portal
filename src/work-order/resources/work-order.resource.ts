export class WorkOrderResource {
  static transformWorkOrder(doc: any): any {
    const wo = doc.toObject ? doc.toObject() : doc;

    return {
      _id: wo._id,
      code: wo.code,
      serviceRequestId: wo.serviceRequestId,
      companyId: wo.companyId,
      service: wo.serviceId
        ? {
            _id: wo.serviceId._id,
            title: wo.serviceId.title,
            description: wo.serviceId.description,
            accessType: wo.serviceId.accessType,
            isActive: wo.serviceId.isActive,
          }
        : null,
      createdBy: wo.createdBy
        ? this.transformUser(wo.createdBy)
        : null,
      approvedBy: wo.approvedBy
        ? this.transformUser(wo.approvedBy)
        : null,
      workOrderApprovalAccessType: wo.workOrderApprovalAccessType,
      minStaff: wo.minStaff,
      maxStaff: wo.maxStaff,
      assignedStaff: (wo.assignedStaff || []).map((s: any) => this.transformUser(s)),
      staffPIC: wo.staffPIC
        ? this.transformUser(wo.staffPIC)
        : null,
      position: wo.positionId
        ? (wo.positionId.name ? { _id: wo.positionId._id, name: wo.positionId.name } : wo.positionId)
        : null,
      status: wo.status,
      has_issue: wo.has_issue ?? false,
      issue_note: wo.issue_note ?? null,
      draftedAt: wo.draftedAt,
      sentAt: wo.sentAt,
      approvedAt: wo.approvedAt,
      rejectedAt: wo.rejectedAt,
      startedAt: wo.startedAt,
      completedAt: wo.completedAt,
      failedAt: wo.failedAt,
      cancelledAt: wo.cancelledAt,
      createdAt: wo.createdAt,
      updatedAt: wo.updatedAt,
      deletedAt: wo.deletedAt,
    };
  }

  static transformUser(user: any): any {
    if (!user || typeof user !== 'object') return user;
    return {
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
    };
  }

  static transformWorkOrderDetail(
    wo: any,
    workOrderForm: any,
    submissions: any[],
  ): any {
    return {
      ...this.transformWorkOrder(wo),
      workOrderForm,
      submissions,
    };
  }
}
