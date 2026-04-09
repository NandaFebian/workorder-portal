import {
  Injectable,
  NotFoundException,
  BadRequestException,
  Inject,
  forwardRef,
  ForbiddenException,
  UnprocessableEntityException,
} from '@nestjs/common';
import { generateCode } from 'src/common/utils/generate-code.util';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Service, ServiceDocument } from 'src/service/schemas/service.schema';
import { validateFormSubmission } from 'src/form/helpers/form-validation.helper';
import { MembershipService } from 'src/membership/membership.service';
import {
  ServiceRequest,
  ServiceRequestDocument,
} from './schemas/service-request.schema';
import {
  FormSubmission,
  FormSubmissionDocument,
} from 'src/form/schemas/form-submissions.schema';
import { FormsService } from 'src/form/form.service';
import { WorkOrderService } from 'src/work-order/work-order.service';
import { ServicesInternalService } from 'src/service/services.internal.service';
import { AuthenticatedUser } from 'src/auth/interfaces/authenticated-user.interface';
import { WorkReportService } from 'src/work-report/work-report.service';
import { SrResponseUtil } from './utils/sr-response.util';
import { FcmService } from 'src/fcm/fcm.service';

@Injectable()
export class ServiceRequestService {
  constructor(
    @InjectModel(ServiceRequest.name)
    private srModel: Model<ServiceRequestDocument>,
    @InjectModel(FormSubmission.name)
    private submissionModel: Model<FormSubmissionDocument>,
    @InjectModel(Service.name)
    private serviceModel: Model<ServiceDocument>,
    private readonly formsService: FormsService,
    private readonly workOrderService: WorkOrderService,
    @Inject(forwardRef(() => ServicesInternalService))
    private readonly servicesInternalService: ServicesInternalService,
    private readonly workReportService: WorkReportService,
    private readonly membershipService: MembershipService,
    private readonly fcmService: FcmService,
  ) {}

  async create(data: any): Promise<ServiceRequestDocument> {
    const newRequest = new this.srModel({
      ...data,
      code: `SR-${generateCode()}`,
      serviceRequestStatus: 'received',
      receivedAt: new Date(),
    });
    return newRequest.save();
  }

  async getIntakeForm(
    serviceId: string,
    user: AuthenticatedUser | null,
    attemptType: 'public' | 'internal',
  ): Promise<any> {
    if (!Types.ObjectId.isValid(serviceId)) throw new BadRequestException('Invalid Service ID');
    
    const service = await this.serviceModel.findOne({ _id: new Types.ObjectId(serviceId), deletedAt: null, isActive: true }).exec();
    if (!service) throw new NotFoundException('Service not found or inactive');

    if (attemptType === 'public') {
      if (service.accessType === 'internal') {
        throw new ForbiddenException('External clients are not allowed to access internal services.');
      }
      if (service.accessType === 'member_only') {
        if (!user || (!user._id)) {
           throw new ForbiddenException('You must log in to access this member-only service.');
        }
        const isMember = await this.membershipService.isUserSubscribed(user._id.toString(), service.companyId.toString());
        if (!isMember) {
          throw new ForbiddenException('You must be a registered member of the Provider company to access this service.');
        }
      }
    } else if (attemptType === 'internal') {
      if (!user || !user.company?._id || user.company._id.toString() !== service.companyId.toString()) {
        throw new ForbiddenException('Only internal staff of the provider company can access this form.');
      }
    }

    const src = (service as any).serviceRequestConfig || {};
    if (!src.intakeFormId) return null;
    
    try {
      const template = await this.formsService.findTemplateById(src.intakeFormId.toString());
      return template;
    } catch {
      return null;
    }
  }

  async submitIntake(
    serviceId: string,
    user: AuthenticatedUser,
    dto: any,
  ): Promise<any> {
    if (!Types.ObjectId.isValid(serviceId)) throw new BadRequestException('Invalid Service ID');
    
    const service = await this.serviceModel.findOne({ _id: new Types.ObjectId(serviceId), deletedAt: null, isActive: true }).exec();
    if (!service) throw new NotFoundException('Service not found or inactive');

    // Access Control Check
    if (service.accessType === 'internal') {
      if (!user.company?._id || user.company._id.toString() !== service.companyId.toString()) {
        throw new ForbiddenException('External Clients are not allowed to submit internal requests.');
      }
    } else if (service.accessType === 'member_only') {
      const isMember = await this.membershipService.isUserSubscribed(user._id.toString(), service.companyId.toString());
      if (!isMember) {
        throw new ForbiddenException('Requester must be a registered member of the Provider company.');
      }
    } // public allows everyone

    const src = (service as any).serviceRequestConfig || {};
    
    let intakeFormId: Types.ObjectId | null = null;
    let reviewFormId: Types.ObjectId | null = null;
    let templateFields: any[] = [];
    
    if (src.intakeFormId) {
      intakeFormId = src.intakeFormId as Types.ObjectId;
      try {
        const template = await this.formsService.findTemplateById(intakeFormId.toString());
        if (template) {
          templateFields = template.fields || [];
        }
      } catch {}
    }
    
    if (src.reviewFormId && src.reviewNeed) {
      reviewFormId = src.reviewFormId as Types.ObjectId;
    }
    
    const submission = dto.submission || null;

    // Strict Request Payload Validation: Ensure user doesn't submit random form IDs
    if (submission) {
      if (!intakeFormId) {
        throw new BadRequestException('This service does not require any intake form submission.');
      }
      if (submission.formId !== intakeFormId.toString()) {
        throw new BadRequestException(`Submitted form ID ${submission.formId} does not match the required intake form for this service.`);
      }
    }

    // Strict schema & required fields validation
    if (submission && submission.formId === intakeFormId?.toString()) {
      const submissionData = submission.fieldsData || [];
      const submittedOrders = submissionData.map(f => f.order);
      const missingFields: Record<string, string>[] = [];
      for (const tField of templateFields) {
        if (tField.required && !submittedOrders.includes(tField.order)) {
          missingFields.push({ [tField.label || 'unknown']: 'Missing required field' });
        }
      }
      
      if (missingFields.length > 0) {
        throw new UnprocessableEntityException({
          message: 'Validation failed',
          errors: { field: missingFields },
        });
      }
      validateFormSubmission(templateFields, submissionData);
    } else if (intakeFormId) {
       // Check if there are any required fields in the template, if yes and no submission, throw error
       const hasRequired = templateFields.some(f => f.required);
       if (hasRequired) {
          throw new UnprocessableEntityException({
            message: 'Validation failed',
            errors: { field: [{ '*' : 'Intake form submission is required.' }] },
          });
       }
    }
    
    const newSR = await this.srModel.create({
      code: `SR-${generateCode()}`,
      serviceId: service._id,
      requestedBy: user._id,
      companyId: service.companyId,
      intakeFormId,
      reviewFormId,
      serviceRequestApprovalAccessType: src.serviceRequestApprovalAccessType ?? 'auto',
      reviewNeed: src.reviewNeed ?? false,
      serviceRequestStatus: 'received',
      receivedAt: new Date(),
    });

    // Save submission if provided and valid
    if (submission && intakeFormId && submission.formId === intakeFormId.toString()) {
      const subDocId = new Types.ObjectId();
      await this.submissionModel.create({
        _id: subDocId,
        ownerId: (newSR as any)._id,
        formId: new Types.ObjectId(submission.formId),
        submissionType: 'intake',
        submittedBy: new Types.ObjectId(user._id.toString()),
        fieldsData: submission.fieldsData,
        status: 'submitted',
        submittedAt: new Date(),
      });
      newSR.intakeSubmissionId = subDocId;
      await newSR.save();
    }
    
    // --- Example FCM Usage: Send Notification ---
    // In a real scenario, you retrieve tokens for the staff of the company receiving this SR
    // const providerTokens = ['token1', 'token2']; // e.g., await userModel.findTokensByCompany(service.companyId);
    // if (providerTokens.length) {
    //   await this.fcmService.sendToMultipleDevices(
    //     providerTokens,
    //     'New Service Request Received',
    //     `SR ${newSR.code} has been submitted for service ${service.title}.`,
    //     { serviceRequestId: (newSR as any)._id.toString() },
    //   );
    // }
    
    // Fallback/Mock sending to a supposed requested user or device
    if (user && user['fcmToken']) {
      await this.fcmService.sendToDevice(
        user['fcmToken'] as string,
        'Service Request Created',
        `Your request ${newSR.code} is created and pending review.`,
        { serviceRequestId: (newSR as any)._id.toString() }
      );
    }
    // ---------------------------------------------
    
    return this.findOneForClient((newSR as any)._id.toString(), user._id.toString());
  }

  async submitReview(
    srId: string,
    user: AuthenticatedUser,
    dto: any,
  ): Promise<any> {
    if (!Types.ObjectId.isValid(srId)) throw new BadRequestException('Invalid ID');

    const sr = await this.srModel.findOne({ _id: srId, deletedAt: null }).exec();
    if (!sr) throw new NotFoundException('Service Request not found');

    const requestedById = sr.requestedBy?._id ? sr.requestedBy._id.toString() : sr.requestedBy?.toString();
    if (requestedById !== user._id.toString()) {
      throw new ForbiddenException('Only the requester who made this SR can submit a review.');
    }

    if (sr.serviceRequestStatus !== 'completed') {
      throw new UnprocessableEntityException('Review can only be submitted when SR status is completed.');
    }

    if (!sr.reviewFormId) {
      throw new UnprocessableEntityException('This SR does not have a review form associated.');
    }

    const template = await this.formsService.findTemplateById(sr.reviewFormId!.toString());
    if (!template) throw new UnprocessableEntityException('Review form template not found.');
    const templateFields = template.fields || [];

    const submission = dto.submission || null;

    if (!submission) {
      throw new UnprocessableEntityException({
        message: 'Validation failed',
        errors: { field: [{ '*' : 'Review submission payload is empty or invalid.' }] },
      });
    }

    if (submission.formId !== sr.reviewFormId!.toString()) {
      throw new BadRequestException(`Submitted form ID ${submission.formId} does not match the review form for this service request.`);
    }

    const submissionData = submission.fieldsData || [];
    const submittedOrders = submissionData.map(f => f.order);
    const missingFields: Record<string, string>[] = [];
    for (const tField of templateFields) {
      if (tField.required && !submittedOrders.includes(tField.order)) {
        missingFields.push({ [tField.label || 'unknown']: 'Missing required field' });
      }
    }

    if (missingFields.length > 0) {
      throw new UnprocessableEntityException({
        message: 'Validation failed',
        errors: { field: missingFields },
      });
    }
    validateFormSubmission(templateFields, submissionData);
      
    const subDocId = new Types.ObjectId();
    await this.submissionModel.create({
      _id: subDocId,
      ownerId: (sr as any)._id,
      formId: sr.reviewFormId,
      submissionType: 'review',
      submittedBy: new Types.ObjectId(user._id.toString()),
      fieldsData: submissionData,
      status: 'submitted',
      submittedAt: new Date(),
    });
      
    sr.reviewSubmissionId = subDocId;
      
    if (sr.reviewNeed) {
      sr.serviceRequestStatus = 'closed';
      sr.closedAt = new Date();
    }
    await sr.save();

    return this.findOneForClient((sr as any)._id.toString(), user._id.toString());
  }

  async findAllByClientId(userId: string): Promise<any[]> {
    const requests = await this.srModel
      .find({ requestedBy: new Types.ObjectId(userId), deletedAt: null })
      .populate('companyId', 'name address description isActive')
      .populate('serviceId', 'companyId title description accessType isActive')
      .populate('requestedBy', 'name email role')
      .populate('approvedBy', 'name email role')
      .sort({ createdAt: -1 })
      .exec();

    return Promise.all(requests.map((r) => this._enrichAndFormat(r, false)));
  }

  async findOneForClient(id: string, userId: string): Promise<any> {
    if (!Types.ObjectId.isValid(id)) throw new BadRequestException('Invalid ID');

    const sr = await this.srModel
      .findOne({ _id: id, deletedAt: null })
      .populate('companyId', 'name address description isActive')
      .populate('serviceId', 'companyId title description accessType isActive')
      .populate('requestedBy', 'name email role')
      .populate('approvedBy', 'name email role')
      .exec();

    if (!sr) throw new NotFoundException('Service Request not found');
    
    const requestedById = sr.requestedBy?._id ? sr.requestedBy._id.toString() : sr.requestedBy?.toString();
    if (requestedById !== userId) {
      throw new ForbiddenException('You are not authorized to access this Service Request.');
    }

    return this._enrichAndFormat(sr, false);
  }

  async findAllByCompanyId(companyId: string): Promise<any[]> {
    const requests = await this.srModel
      .find({ companyId: new Types.ObjectId(companyId), deletedAt: null })
      .populate('companyId', 'name address description isActive')
      .populate('serviceId', 'companyId title description accessType isActive')
      .populate('requestedBy', 'name email role')
      .populate('approvedBy', 'name email role')
      .sort({ createdAt: -1 })
      .exec();

    return Promise.all(requests.map((r) => this._enrichAndFormat(r, true)));
  }

  async findOneInternal(id: string, user?: AuthenticatedUser): Promise<any> {
    if (!Types.ObjectId.isValid(id)) throw new BadRequestException('Invalid ID');

    const sr = await this.srModel
      .findOne({ _id: id, deletedAt: null })
      .populate('companyId', 'name address description isActive')
      .populate('serviceId', 'companyId title description accessType isActive')
      .populate('requestedBy', 'name email role')
      .populate('approvedBy', 'name email role')
      .exec();

    if (!sr) throw new NotFoundException('Service Request not found');

    const companyIdStr = sr.companyId?._id ? sr.companyId._id.toString() : sr.companyId?.toString();
    if (user?.company?._id && companyIdStr !== user.company._id.toString()) {
      throw new ForbiddenException('You are not authorized to access this Service Request.');
    }

    return this._enrichAndFormat(sr, true);
  }

  async getUnifiedDetail(id: string, user: AuthenticatedUser): Promise<any> {
    if (!Types.ObjectId.isValid(id)) throw new BadRequestException('Invalid ID');
    
    const sr = await this.srModel.findOne({ _id: id, deletedAt: null }).exec();
    if (!sr) throw new NotFoundException('Service Request not found');

    const requestedById = sr.requestedBy?._id ? sr.requestedBy._id.toString() : sr.requestedBy?.toString();
    const isRequester = requestedById === user._id.toString();
    const isProvider = user.company?._id && sr.companyId.toString() === user.company._id.toString();

    if (isRequester) {
      return this.findOneForClient(id, user._id.toString());
    } else if (isProvider) {
      return this.findOneInternal(id, user);
    } else {
      throw new ForbiddenException('You are not authorized to access this Service Request.');
    }
  }

  private async _enrichAndFormat(sr: any, isInternal = true): Promise<any> {
    const doc = sr.toObject ? sr.toObject() : sr;

    // Hydrate intake form
    let intakeForm: any = null;
    if (doc.intakeFormId) {
      try {
        const template = await this.formsService.findTemplateById(doc.intakeFormId.toString());
        if (template) {
          const t = template.toObject ? template.toObject() : template;
          intakeForm = { _id: t._id, title: t.title, description: t.description, formType: t.formType, fields: t.fields };
        }
      } catch {}
    }

    // Hydrate review form
    let reviewForm: any = null;
    if (doc.reviewFormId) {
      try {
        const template = await this.formsService.findTemplateById(doc.reviewFormId.toString());
        if (template) {
          const t = template.toObject ? template.toObject() : template;
          reviewForm = { _id: t._id, title: t.title, description: t.description, formType: t.formType, fields: t.fields };
        }
      } catch {}
    }

    // Find intake and review submissions (filter by submissionType to avoid cross-contamination)
    const intakeSubmission = doc.intakeFormId
      ? await this.submissionModel
          .findOne({ ownerId: doc._id, formId: doc.intakeFormId, submissionType: 'intake' })
          .exec()
      : null;

    const reviewSubmission = doc.reviewFormId
      ? await this.submissionModel
          .findOne({ ownerId: doc._id, formId: doc.reviewFormId, submissionType: 'review' })
          .exec()
      : null;

    return isInternal
      ? SrResponseUtil.formatInternal(doc, intakeForm, reviewForm, intakeSubmission, reviewSubmission)
      : SrResponseUtil.formatPublic(doc, intakeForm, reviewForm, intakeSubmission, reviewSubmission);
  }

  async updateStatus(
    id: string,
    status: string,
    user: AuthenticatedUser,
  ): Promise<any> {
    if (!Types.ObjectId.isValid(id)) throw new BadRequestException('Invalid ID');

    const sr = await this.srModel.findOne({ _id: id, deletedAt: null }).exec();
    if (!sr) throw new NotFoundException('Service Request not found');

    if (sr.serviceRequestStatus !== 'received' && (status === 'cancelled' || status === 'approved' || status === 'rejected')) {
       throw new UnprocessableEntityException('This action can only be performed when SR status is received.');
    }

    if (status === 'cancelled') {
      const requestedById = sr.requestedBy?._id ? sr.requestedBy._id.toString() : sr.requestedBy?.toString();
      if (requestedById !== user._id.toString()) {
        throw new ForbiddenException('Only the requester can cancel this Service Request.');
      }
    } else if (status === 'approved' || status === 'rejected') {
      if (!user.company?._id || user.company._id.toString() !== sr.companyId.toString()) {
         throw new ForbiddenException('Only the provider company staff can perform this action.');
      }
    }

    const now = new Date();
    const updateData: any = { serviceRequestStatus: status };

    switch (status) {
      case 'approved':
        updateData.approvedBy = user._id;
        updateData.approvedAt = now;
        break;
      case 'rejected':
        updateData.rejectedAt = now;
        break;
      case 'cancelled':
        updateData.cancelledAt = now;
        break;
      case 'completed':
        updateData.completedAt = now;
        break;
      case 'closed':
        updateData.closedAt = now;
        break;
    }

    Object.assign(sr, updateData);
    await sr.save();

    if (status === 'approved') {
      const serviceData = await this.servicesInternalService.findByVersionId(
        sr.serviceId.toString(),
        user,
      );

      // Pick the first workOrdersConfig entry to determine the work order form
      const firstConfig = serviceData.workOrdersConfig?.[0];
      const workOrderFormId = firstConfig?.workOrderForm?._id ?? null;
      const reportFormId = firstConfig?.workReportForm?._id ?? null;
      const workOrderApprovalAccessType = firstConfig?.workOrderApprovalAccessType ?? 'auto';
      const minStaff = firstConfig?.minStaff ?? 0;
      const maxStaff = firstConfig?.maxStaff ?? 1;

      const createdWorkOrder = await this.workOrderService.createInternal({
        companyId: sr.companyId,
        serviceId: sr.serviceId,
        serviceRequestId: sr._id,
        workOrderFormId,
        workOrderApprovalAccessType,
        minStaff,
        maxStaff,
        createdBy: user._id,
        status: 'drafted',
      });

      if (createdWorkOrder?._id && reportFormId) {
        await this.workReportService.create({
          workOrderId: createdWorkOrder._id.toString(),
          companyId: sr.companyId.toString(),
          reportFormId: reportFormId ? reportFormId.toString() : null,
          status: 'drafted',
        } as any);
      }

      // Update sr status to workOrderCreated
      sr.serviceRequestStatus = 'workOrderCreated';
      sr.workOrderCreatedAt = now;
      await sr.save();

      const workOrder = await this.workOrderService.findOneInternal(
        (createdWorkOrder as any)._id.toString(),
        user,
      );
      const serviceRequest = await this.findOneInternal(id, user);

      return { serviceRequest, workOrder };
    }

    return this.findOneInternal(id, user);
  }

  async remove(id: string, user: AuthenticatedUser): Promise<any> {
    if (!Types.ObjectId.isValid(id)) throw new BadRequestException('Invalid ID');

    const sr = await this.srModel.findOne({ _id: id, deletedAt: null }).exec();
    if (!sr) throw new NotFoundException('Client service request not found');

    if (!user.company?._id) {
      throw new ForbiddenException('User is not associated with any company.');
    }
    if (sr.companyId.toString() !== user.company._id.toString()) {
      throw new ForbiddenException('You do not have permission to delete this request.');
    }

    // Capture full SR detail before deletion
    const srDetail = await this.findOneInternal(id);

    const deletedAt = new Date();
    sr.deletedAt = deletedAt;
    await sr.save();

    return { ...srDetail, deletedAt };
  }
}
