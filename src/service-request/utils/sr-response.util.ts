const buildDates = (doc: any) => ({
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
});

const buildService = (serviceId: any) =>
  serviceId
    ? {
        _id: serviceId._id,
        title: serviceId.title,
        description: serviceId.description,
        accessType: serviceId.accessType,
        isActive: serviceId.isActive,
      }
    : null;

const buildUser = (user: any) =>
  user
    ? {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
      }
    : null;

const buildCompany = (company: any) =>
  company
    ? {
        _id: company._id,
        name: company.name,
        address: company.address,
        description: company.description,
        isActive: company.isActive,
      }
    : null;

export class SrResponseUtil {
  /**
   * Format response for public (client) callers.
   * Includes company object, excludes internal config fields.
   */
  static formatPublic(
    doc: any,
    intakeForm: any,
    reviewForm: any,
    intakeSubmission: any,
    reviewSubmission: any,
  ) {
    return {
      _id: doc._id,
      code: doc.code,
      serviceRequestStatus: doc.serviceRequestStatus,
      company: buildCompany(doc.companyId),
      service: buildService(doc.serviceId),
      requestedBy: buildUser(doc.requestedBy),
      approvedBy: buildUser(doc.approvedBy),
      intakeForm,
      reviewForm,
      intakeSubmission,
      reviewSubmission,
      ...buildDates(doc),
    };
  }

  /**
   * Format response for internal (company) callers.
   * Includes serviceRequestApprovalAccessType and reviewNeed, excludes company object.
   */
  static formatInternal(
    doc: any,
    intakeForm: any,
    reviewForm: any,
    intakeSubmission: any,
    reviewSubmission: any,
  ) {
    return {
      _id: doc._id,
      code: doc.code,
      serviceRequestStatus: doc.serviceRequestStatus,
      serviceRequestApprovalAccessType: doc.serviceRequestApprovalAccessType ?? 'auto',
      reviewNeed: doc.reviewNeed ?? false,
      company: buildCompany(doc.companyId),
      service: buildService(doc.serviceId),
      requestedBy: buildUser(doc.requestedBy),
      approvedBy: buildUser(doc.approvedBy),
      intakeForm,
      reviewForm,
      intakeSubmission,
      reviewSubmission,
      ...buildDates(doc),
    };
  }

  /** @deprecated Use formatPublic or formatInternal instead */
  static formatOne(
    doc: any,
    intakeForm: any,
    reviewForm: any,
    intakeSubmission: any,
    reviewSubmission: any,
  ) {
    return this.formatInternal(doc, intakeForm, reviewForm, intakeSubmission, reviewSubmission);
  }
}
