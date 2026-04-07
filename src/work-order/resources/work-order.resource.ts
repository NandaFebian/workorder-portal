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
      status: wo.status,
      readyAt: wo.readyAt,
      startedAt: wo.startedAt,
      completedAt: wo.completedAt,
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
