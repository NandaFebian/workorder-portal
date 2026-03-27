export class SrResponseUtil {
  static formatOne(
    doc: any,
    intakeForm: any,
    reviewForm: any,
    intakeSubmission: any,
    reviewSubmission: any,
  ) {
    return {
      _id: doc._id,
      serviceRequestStatus: doc.serviceRequestStatus,
      service: doc.serviceId
        ? {
            _id: doc.serviceId._id,
            companyId: doc.serviceId.companyId,
            title: doc.serviceId.title,
            description: doc.serviceId.description,
            accessType: doc.serviceId.accessType,
            isActive: doc.serviceId.isActive,
            serviceRequestConfig: doc.serviceId.serviceRequestConfig,
            workOrdersConfig: doc.serviceId.workOrdersConfig,
          }
        : null,
      requestedBy: doc.requestedBy
        ? {
            _id: doc.requestedBy._id,
            name: doc.requestedBy.name,
            email: doc.requestedBy.email,
            role: doc.requestedBy.role,
          }
        : null,
      approvedBy: doc.approvedBy
        ? {
            _id: doc.approvedBy._id,
            name: doc.approvedBy.name,
            email: doc.approvedBy.email,
            role: doc.approvedBy.role,
          }
        : null,
      intakeForm,
      reviewForm,
      intakeSubmission,
      reviewSubmission,
      receivedAt: doc.receivedAt,
      approvedAt: doc.approvedAt,
      rejectedAt: doc.rejectedAt,
      cancelledAt: doc.cancelledAt,
      workOrderCreatedAt: doc.workOrderCreatedAt,
      completedAt: doc.completedAt,
      closedAt: doc.closedAt,
      createdAt: doc.createdAt,
      updatedAt: doc.updatedAt,
      deletedAt: doc.deletedAt,
    };
  }
}
