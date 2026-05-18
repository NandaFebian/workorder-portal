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
import { NotificationProducer } from 'src/notification-queue/notification.producer';
import { UsersService } from 'src/users/users.service';
import { AssignStaffDto } from 'src/work-order/dto/assign-staff.dto';
import { Role } from 'src/common/enums/role.enum';
import { ServiceRequestStatus } from 'src/common/enums/service-request-status.enum';
import { FormSubmissionStatus } from 'src/common/enums/form-submission-status.enum';
import { SubmissionType } from 'src/common/enums/submission-type.enum';
import { ApprovalAccessType } from 'src/common/enums/approval-access-type.enum';
import { WorkOrderStatus } from 'src/common/enums/work-order-status.enum';
import { WorkReportStatus } from 'src/common/enums/work-report-status.enum';
import { StatusTranslator } from 'src/common/utils/status-translator.util';
import { DepartmentAuthHelper } from 'src/common/helpers/department-auth.helper';

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
    private readonly notificationProducer: NotificationProducer,
    private readonly usersService: UsersService,
  ) {}

  async create(data: any): Promise<ServiceRequestDocument> {
    const newRequest = new this.srModel({
      ...data,
      code: `SR-${generateCode()}`,
      serviceRequestStatus: ServiceRequestStatus.RECEIVED,
      receivedAt: new Date(),
    });
    return newRequest.save();
  }

  async getIntakeForm(
    serviceId: string,
    user: AuthenticatedUser | null,
    attemptType: 'public' | 'internal',
  ): Promise<any> {
    const service = await this._getValidatedLatestService(serviceId, user, attemptType);

    const src = (service as any).serviceRequestConfig || {};
    if (!src.intakeFormId) return null;
    
    try {
      const specificForm = await this.formsService.findTemplateById(src.intakeFormId.toString());
      if (!specificForm) return null;
      return await this.formsService.findLatestTemplateByKey(specificForm.formKey);
    } catch {
      return null;
    }
  }

  async submitIntake(
    serviceId: string,
    user: AuthenticatedUser,
    dto: any,
  ): Promise<any> {
    // Determine attempt type based on the service's accessType.
    // We first do a lightweight fetch to read accessType before full validation.
    let preliminaryAccessType: string | null = null;
    if (Types.ObjectId.isValid(serviceId)) {
      const preliminary = await this.serviceModel
        .findOne({ _id: new Types.ObjectId(serviceId), deletedAt: null })
        .select('accessType serviceKey companyId')
        .exec();
      if (preliminary) {
        // Resolve latest version's accessType
        const latestPrelim = await this.serviceModel
          .findOne({ serviceKey: preliminary.serviceKey })
          .sort({ __v: -1 })
          .select('accessType companyId isActive deletedAt')
          .exec();
        preliminaryAccessType = latestPrelim?.accessType ?? null;
      }
    }

    // Access Control: validate based on service's access type
    // - internal → must be internal staff of the provider company
    // - member_only → must be a registered member (handled by 'public' path which checks membership)
    // - public → any authenticated user (nClient)
    const attemptType = preliminaryAccessType === 'internal' ? 'internal' : 'public';

    // Additional enforcement for 'internal' services:
    // External clients (no company association with the provider) are not allowed.
    if (preliminaryAccessType === 'internal') {
      // _getValidatedLatestService with 'internal' will enforce company membership
      if (!user.company?._id) {
        throw new ForbiddenException('Klien eksternal tidak diizinkan untuk mengakses layanan internal.');
      }
    }

    const service = await this._getValidatedLatestService(serviceId, user, attemptType);

    const src = (service as any).serviceRequestConfig || {};
    
    let intakeFormId: Types.ObjectId | null = null;
    let reviewFormId: Types.ObjectId | null = null;
    let templateFields: any[] = [];
    
    if (src.intakeFormId) {
      try {
        const specificForm = await this.formsService.findTemplateById(src.intakeFormId.toString());
        if (specificForm) {
            const template = await this.formsService.findLatestTemplateByKey(specificForm.formKey);
            if (template) {
                intakeFormId = template._id as Types.ObjectId;
                templateFields = template.fields || [];
            }
        }
      } catch {}
    }
    
    if (src.reviewFormId) {
      try {
        const specificReviewForm = await this.formsService.findTemplateById(src.reviewFormId.toString());
        if (specificReviewForm) {
            const latestReviewForm = await this.formsService.findLatestTemplateByKey(specificReviewForm.formKey);
            if (latestReviewForm) {
                reviewFormId = latestReviewForm._id as Types.ObjectId;
            }
        }
      } catch {}
    }
    
    const submission = (dto && dto.formId) ? dto : (dto.submission || null);

    // Strict Request Payload Validation: Ensure user doesn't submit random form IDs
    if (submission) {
      if (!intakeFormId) {
        throw new BadRequestException('Layanan ini tidak memerlukan pengiriman formulir intake.');
      }
      
      let isValidForm = false;
      try {
        const submittedForm = await this.formsService.findTemplateById(submission.formId);
        const expectedForm = await this.formsService.findTemplateById(intakeFormId.toString());
        if (submittedForm && expectedForm && submittedForm.formKey === expectedForm.formKey) {
          isValidForm = true;
        }
      } catch {}

      if (!isValidForm) {
        throw new BadRequestException(`ID formulir yang dikirimkan (${submission.formId}) tidak cocok dengan formulir intake yang diperlukan untuk layanan ini.`);
      }

      // Ensure we process it as the latest form
      submission.formId = intakeFormId.toString();
    }

    // Use centralized validation helper (which now handles required fields)
    if (intakeFormId) {
      const submissionData = submission?.fieldsData || [];
      validateFormSubmission(templateFields, submissionData);
    }

    // Pre-validate DSS auto-assign staff BEFORE persisting the SR.
    // If this is an auto-draft service and there is not enough staff available
    // for any of the WO configs, we must fail NOW (before the SR is created)
    // so no orphaned Service Request is left in the database.
    const isAutoService = (src.serviceRequestApprovalAccessType ?? ApprovalAccessType.AUTO) === ApprovalAccessType.AUTO
      && (service as any).draftingWorkOrderType === 'auto';
    if (isAutoService) {
      const woConfigs = (service as any).workOrdersConfig || [];
      if (woConfigs.length > 0) {
        await this.workOrderService.validateAutoAssignForConfigs(
          woConfigs.map((c: any) => ({
            positionId: c.positionsOnDuty?._id ?? c.positionId,
            minStaff: c.minStaff ?? 0,
            maxStaff: c.maxStaff ?? 1,
          })),
          (service as any).companyId?.toString(),
        );
      }
    }
    
    const newSR = await this.srModel.create({
      code: `SR-${generateCode()}`,
      serviceId: service._id,
      requestedBy: user._id,
      companyId: service.companyId,
      intakeFormId,
      reviewFormId,
      serviceRequestApprovalAccessType: src.serviceRequestApprovalAccessType ?? ApprovalAccessType.AUTO,
      reviewNeed: src.reviewNeed ?? false,
      serviceRequestStatus: ServiceRequestStatus.RECEIVED,
      receivedAt: new Date(),
    });

    // Save submission if provided and valid
    if (submission && intakeFormId && submission.formId === intakeFormId.toString()) {
      const subDocId = new Types.ObjectId();
      await this.submissionModel.create({
        _id: subDocId,
        ownerId: (newSR as any)._id,
        formId: new Types.ObjectId(submission.formId),
        submissionType: SubmissionType.Intake,
        submittedBy: new Types.ObjectId(user._id.toString()),
        fieldsData: submission.fieldsData,
        status: FormSubmissionStatus.SUBMITTED,
        submittedAt: new Date(),
      });
      newSR.intakeSubmissionId = subDocId;
      await newSR.save();
    }
    
    // Notify requester about SR creation
    await this.fcmService.sendToUser(
      user._id.toString(),
      'Permintaan Layanan Diterima',
      `Permintaan layanan Anda (${newSR.code}) telah berhasil dibuat dan sedang menunggu peninjauan.`,
      { resource: 'service_request', resourceId: (newSR as any)._id.toString() }
    );

    // Notify provider company managers/owner
    const providerManagers = await this.usersService.findAllByCompanyId(
      service.companyId as any,
      [Role.CompanyOwner, Role.CompanyManager],
    );

    for (const manager of providerManagers) {
      await this.fcmService.sendToUser(
        (manager as any)._id.toString(),
        'Permintaan Layanan Baru',
        `Terdapat permintaan layanan baru (${newSR.code}) dari ${user.name}.`,
        { resource: 'service_request', resourceId: (newSR as any)._id.toString() }
      );
    }
    
    if ((src.serviceRequestApprovalAccessType ?? ApprovalAccessType.AUTO) === ApprovalAccessType.AUTO) {
      await this._autoApproveServiceRequest(newSR, user, service);
    }
    
    // Return the appropriate response format based on who submitted:
    // - Internal staff submitting to their own service → internal format
    // - Everyone else (clients, members) → public (requester) format
    const isInternalSubmitter =
      attemptType === 'internal' &&
      user.company?._id &&
      user.company._id.toString() === (service as any).companyId?.toString();

    if (isInternalSubmitter) {
      return this.findOneInternal((newSR as any)._id.toString(), user);
    }
    return this.findOneForClient((newSR as any)._id.toString(), user._id.toString());
  }

  private async _autoApproveServiceRequest(sr: ServiceRequestDocument, user: AuthenticatedUser, service: any): Promise<void> {
    const now = new Date();
    sr.serviceRequestStatus = ServiceRequestStatus.APPROVED;
    (sr as any).approvedAt = now;
    await sr.save();

    const batchId = new Types.ObjectId().toString();
    const configs = service.workOrdersConfig || [];
    
    if (configs.length > 0) {
      await Promise.all(
        configs.map(async (config: any) => {
          const workOrderFormId = config.workOrderForm?._id ?? config.workOrderFormId ?? null;
          const reportFormId = config.workReportForm?._id ?? config.workReportFormId ?? null;
          const positionId = config.positionsOnDuty?._id ?? config.positionId ?? null;
          
          return this.workOrderService.createInternal({
            companyId: sr.companyId,
            serviceId: sr.serviceId,
            serviceRequestId: sr._id,
            batchId,
            positionId,
            configId: config.configId ?? config._id?.toString() ?? null,
            workOrderFormId,
            reportFormId,
            workOrderApprovalAccessType: config.workOrderApprovalAccessType ?? 'auto',
            workReportApprovalAccessType: config.workReportApprovalAccessType ?? 'auto',
            minStaff: config.minStaff ?? 0,
            maxStaff: config.maxStaff ?? 1,
            createdBy: null,
            draftingWorkOrderType: service.draftingWorkOrderType ?? 'manual',
            showReportToRequester: config.showReportToRequester ?? false,
          });
        })
      );

      // Update sr workOrderCreatedAt timestamp
      (sr as any).workOrderCreatedAt = new Date();
      await sr.save();
    }
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
      throw new ForbiddenException('Hanya pemohon yang membuat permintaan layanan ini yang dapat mengirimkan ulasan.');
    }

    if (sr.serviceRequestStatus !== ServiceRequestStatus.COMPLETED && sr.serviceRequestStatus !== ServiceRequestStatus.CLOSED) {
      throw new UnprocessableEntityException('Ulasan hanya dapat dikirimkan saat status permintaan layanan selesai atau ditutup.');
    }

    if (!sr.reviewFormId) {
      throw new UnprocessableEntityException('Permintaan layanan ini tidak memiliki formulir ulasan.');
    }

    const template = await this.formsService.findTemplateById(sr.reviewFormId!.toString());
    if (!template) throw new UnprocessableEntityException('Templat formulir ulasan tidak ditemukan.');
    const templateFields = template.fields || [];

    const submission = (dto && dto.formId) ? dto : (dto.submission || null);

    if (!submission) {
      throw new UnprocessableEntityException({
        message: 'Validasi gagal',
        errors: { field: [{ '*' : 'Payload ulasan kosong atau tidak valid.' }] },
      });
    }

    let isValidForm = false;
    try {
      const submittedForm = await this.formsService.findTemplateById(submission.formId);
      const expectedForm = await this.formsService.findTemplateById(sr.reviewFormId!.toString());
      if (submittedForm && expectedForm && submittedForm.formKey === expectedForm.formKey) {
        isValidForm = true;
      }
    } catch {}

    if (!isValidForm) {
      throw new BadRequestException(`ID formulir yang dikirimkan (${submission.formId}) tidak cocok dengan formulir ulasan untuk permintaan layanan ini.`);
    }

    // Override with the correct one attached to SR
    submission.formId = sr.reviewFormId!.toString();

    const submissionData = submission.fieldsData || [];
    validateFormSubmission(templateFields, submissionData);
      
    const subDocId = new Types.ObjectId();
    await this.submissionModel.create({
      _id: subDocId,
      ownerId: (sr as any)._id,
      formId: sr.reviewFormId,
      submissionType: SubmissionType.Review,
      submittedBy: new Types.ObjectId(user._id.toString()),
      fieldsData: submissionData,
      status: FormSubmissionStatus.SUBMITTED,
      submittedAt: new Date(),
    });
      
    sr.reviewSubmissionId = subDocId;
      
    sr.serviceRequestStatus = ServiceRequestStatus.CLOSED;
    sr.closedAt = new Date();
    await sr.save();

    // Notify provider company managers/owner about review submission
    const providerManagers = await this.usersService.findAllByCompanyId(
      sr.companyId as any,
      [Role.CompanyOwner, Role.CompanyManager],
    );

    for (const manager of providerManagers) {
      await this.fcmService.sendToUser(
        (manager as any)._id.toString(),
        'Ulasan Permintaan Layanan Masuk',
        `Pemohon ${user.name} telah mengirimkan ulasan untuk ${sr.code}.`,
        {
          resource: 'service_request',
          resourceId: (sr as any)._id.toString(),
          status: sr.serviceRequestStatus,
        },
      );
    }

    return this.findOneForClient((sr as any)._id.toString(), user._id.toString());
  }

  async findAllByClientId(userId: string): Promise<any[]> {
    const requests = await this.srModel
      .find({ requestedBy: new Types.ObjectId(userId), deletedAt: null })
      .populate('companyId', 'name address description isActive')
      .populate('serviceId', 'title description accessType isActive')
      .populate('requestedBy', 'name email role')
      .populate('approvedBy', 'name email role')
      .populate('staffPIC', 'name email role')
      .sort({ createdAt: -1 })
      .lean()
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
      .populate('staffPIC', 'name email role')
      .exec();

    if (!sr) throw new NotFoundException('Service Request not found');
    
    const requestedById = sr.requestedBy?._id ? sr.requestedBy._id.toString() : sr.requestedBy?.toString();
    if (requestedById !== userId) {
      throw new ForbiddenException('Anda tidak memiliki akses ke Permintaan Layanan ini.');
    }

    return this._enrichAndFormat(sr, false);
  }

  async findAllByCompanyId(companyId: string, user?: AuthenticatedUser): Promise<any[]> {
    const requests = await this.srModel
      .find({ companyId: new Types.ObjectId(companyId), deletedAt: null })
      .populate('companyId', 'name address description isActive')
      .populate('serviceId', 'title description accessType isActive')
      .populate('requestedBy', 'name email role')
      .populate('approvedBy', 'name email role')
      .populate('staffPIC', 'name email role')
      .sort({ createdAt: -1 })
      .lean()
      .exec();

    // Department Manager: only see SRs whose service configs all match their position
    let filtered = requests;
    if (user && DepartmentAuthHelper.isDepartmentManager(user)) {
      const serviceCache = new Map<string, any>();
      filtered = [];
      for (const r of requests) {
        const svcId = r.serviceId?._id?.toString() ?? r.serviceId?.toString();
        if (!svcId) continue;
        if (!serviceCache.has(svcId)) {
          const svc = await this.serviceModel.findOne({ _id: svcId, deletedAt: null }).exec();
          serviceCache.set(svcId, svc);
        }
        const svc = serviceCache.get(svcId);
        if (svc && DepartmentAuthHelper.canManageService(user, svc.workOrdersConfig ?? [])) {
          filtered.push(r);
        }
      }
    }

    return Promise.all(filtered.map((r) => this._enrichAndFormat(r, true)));
  }

  async findOneInternal(id: string, user?: AuthenticatedUser): Promise<any> {
    if (!Types.ObjectId.isValid(id)) throw new BadRequestException('Invalid ID');

    const sr = await this.srModel
      .findOne({ _id: id, deletedAt: null })
      .populate('companyId', 'name address description isActive')
      .populate('serviceId', 'companyId title description accessType isActive')
      .populate('requestedBy', 'name email role')
      .populate('approvedBy', 'name email role')
      .populate('staffPIC', 'name email role')
      .exec();

    if (!sr) throw new NotFoundException('Service Request not found');

    const companyIdStr = sr.companyId?._id ? sr.companyId._id.toString() : sr.companyId?.toString();
    if (user?.company?._id && companyIdStr !== user.company._id.toString()) {
      throw new ForbiddenException('Anda tidak memiliki akses ke Permintaan Layanan ini.');
    }

    return this._enrichAndFormat(sr, true);
  }

  async getUnifiedDetail(id: string, user: AuthenticatedUser, notificationId?: string): Promise<any> {
    if (!Types.ObjectId.isValid(id)) throw new BadRequestException('Invalid ID');
    
    const sr = await this.srModel.findOne({ _id: id, deletedAt: null }).exec();
    if (!sr) throw new NotFoundException('Service Request not found');

    const requestedById = sr.requestedBy?._id ? sr.requestedBy._id.toString() : sr.requestedBy?.toString();
    const isRequester = requestedById === user._id.toString();
    const isProvider = user.company?._id && sr.companyId.toString() === user.company._id.toString();

    // Mark notifications as read using background job if notificationId is provided
    if (notificationId) {
      this.notificationProducer.enqueueMarkAsRead(notificationId);
    } else {
      // Fallback
      this.fcmService.markAsReadByResource(user._id.toString(), 'service_request', id).catch(console.error);
    }

    if (isRequester) {
      return this.findOneForClient(id, user._id.toString());
    } else if (isProvider) {
      return this.findOneInternal(id, user);
    } else {
      throw new ForbiddenException('Anda tidak memiliki akses ke Permintaan Layanan ini.');
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

    // Find intake and review submissions in parallel
    const [intakeSubmission, reviewSubmission] = await Promise.all([
      doc.intakeFormId
        ? this.submissionModel
            .findOne({ ownerId: doc._id, formId: doc.intakeFormId, submissionType: SubmissionType.Intake })
            .lean()
            .exec()
        : Promise.resolve(null),
      doc.reviewFormId
        ? this.submissionModel
            .findOne({ ownerId: doc._id, formId: doc.reviewFormId, submissionType: SubmissionType.Review })
            .lean()
            .exec()
        : Promise.resolve(null),
    ]);

    return isInternal
      ? SrResponseUtil.formatInternal(doc, intakeForm, reviewForm, intakeSubmission, reviewSubmission)
      : SrResponseUtil.formatPublic(doc, intakeForm, reviewForm, intakeSubmission, reviewSubmission);
  }

  async updateSRStatusSystemically(id: string, status: ServiceRequestStatus): Promise<void> {
    const sr = await this.srModel.findOne({ _id: id, deletedAt: null }).exec();
    if (!sr) return;
    const now = new Date();
    let targetStatus = status;
    if (targetStatus === ServiceRequestStatus.COMPLETED && !sr.reviewNeed) {
      targetStatus = ServiceRequestStatus.CLOSED;
      sr.completedAt = now;
    }

    sr.serviceRequestStatus = targetStatus;
    switch (targetStatus) {
      case ServiceRequestStatus.UNPROCESSABLE:
        sr.unprocessableAt = now;
        break;
      case ServiceRequestStatus.ON_PROGRESS:
        sr.onProgressAt = now;
        break;
      case ServiceRequestStatus.PARTIAL_COMPLETED:
        sr.partialCompletedAt = now;
        break;
      case ServiceRequestStatus.FAILED:
        sr.failedAt = now;
        break;
      case ServiceRequestStatus.COMPLETED:
        sr.completedAt = now;
        break;
      case ServiceRequestStatus.CLOSED:
        sr.closedAt = now;
        break;
    }
    await sr.save();

    // Notify requester about the systemic status update
    if (sr.requestedBy) {
      const requesterId = sr.requestedBy._id ? sr.requestedBy._id.toString() : sr.requestedBy.toString();
      const statusLabel = StatusTranslator.translateSRStatus(targetStatus);
      await this.fcmService.sendToUser(
        requesterId,
        'Status Permintaan Layanan Diperbarui',
        `Status permintaan layanan Anda (${sr.code}) telah diperbarui menjadi: ${statusLabel}.`,
        {
          resource: 'service_request',
          resourceId: id,
          status: targetStatus,
        },
      );
    }
  }

  async updateStatus(
    id: string,
    status: ServiceRequestStatus,
    user: AuthenticatedUser,
  ): Promise<any> {
    if (!Types.ObjectId.isValid(id)) throw new BadRequestException('Invalid ID');

    const sr = await this.srModel.findOne({ _id: id, deletedAt: null }).exec();
    if (!sr) throw new NotFoundException('Service Request not found');

    if (sr.serviceRequestStatus !== ServiceRequestStatus.RECEIVED && (status === ServiceRequestStatus.CANCELLED || status === ServiceRequestStatus.APPROVED || status === ServiceRequestStatus.REJECTED)) {
       throw new UnprocessableEntityException('This action can only be performed when SR status is received.');
    }

    if (status === ServiceRequestStatus.CANCELLED) {
      const requestedById = sr.requestedBy?._id ? sr.requestedBy._id.toString() : sr.requestedBy?.toString();
      if (requestedById !== user._id.toString()) {
        throw new ForbiddenException('Hanya pemohon yang dapat membatalkan Permintaan Layanan ini.');
      }
    } else if (status === ServiceRequestStatus.APPROVED || status === ServiceRequestStatus.REJECTED) {
      if (!user.company?._id || user.company._id.toString() !== sr.companyId.toString()) {
        throw new ForbiddenException('Only the provider company staff can perform this action.');
      }

      // Department Manager: can only approve/reject SRs whose service configs match their position
      if (DepartmentAuthHelper.isDepartmentManager(user)) {
        const svc = await this.serviceModel.findOne({ _id: sr.serviceId, deletedAt: null }).exec();
        if (!svc || !DepartmentAuthHelper.canManageService(user, svc.workOrdersConfig ?? [])) {
          throw new ForbiddenException(
            'Department managers can only handle service requests where all departments match their position.',
          );
        }
      }

      if (sr.serviceRequestApprovalAccessType === ApprovalAccessType.MANAGER) {
        if (user.role !== Role.CompanyOwner && user.role !== Role.CompanyManager) {
          throw new ForbiddenException('Hanya Manager atau Owner yang dapat melakukan aksi ini');
        }
      } else if (sr.serviceRequestApprovalAccessType === ApprovalAccessType.STAFF_PIC) {
        if (!sr.staffPIC) {
          throw new UnprocessableEntityException('Staff PIC harus ditentukan sebelum menyetujui Service Request ini');
        }
        const isPIC = sr.staffPIC.toString() === user._id.toString();
        const isPrivileged = user.role === Role.CompanyOwner || user.role === Role.CompanyManager;
        if (!isPIC && !isPrivileged) {
          throw new ForbiddenException('Hanya Staff PIC yang ditunjuk yang dapat melakukan aksi ini');
        }
      } else if (sr.serviceRequestApprovalAccessType === ApprovalAccessType.STAFF_ANY) {
        // Mode staff_any allow any staff from the provider company
        // This is already covered by the companyId check at the top of this block,
        // but we explicitly label it here for clarity.
      }
    }

    const now = new Date();
    let targetStatus = status;
    if (targetStatus === ServiceRequestStatus.COMPLETED && !sr.reviewNeed) {
      targetStatus = ServiceRequestStatus.CLOSED;
    }

    const updateData: any = { serviceRequestStatus: targetStatus };

    switch (targetStatus) {
      case ServiceRequestStatus.APPROVED:
        updateData.approvedBy = user._id;
        updateData.approvedAt = now;
        break;
      case ServiceRequestStatus.REJECTED:
        updateData.rejectedAt = now;
        break;
      case ServiceRequestStatus.CANCELLED:
        updateData.cancelledAt = now;
        break;
      case ServiceRequestStatus.COMPLETED:
        updateData.completedAt = now;
        break;
      case ServiceRequestStatus.CLOSED:
        updateData.closedAt = now;
        // If it was supposed to be COMPLETED but moved to CLOSED, set completedAt too
        if (status === ServiceRequestStatus.COMPLETED) {
          updateData.completedAt = now;
        }
        break;
    }

    Object.assign(sr, updateData);
    await sr.save();

    // Notify requester about the status update
    if (sr.requestedBy) {
      const requesterId = sr.requestedBy._id ? sr.requestedBy._id.toString() : sr.requestedBy.toString();
      const statusLabel = StatusTranslator.translateSRStatus(targetStatus);
      await this.fcmService.sendToUser(
        requesterId,
        'Status Permintaan Layanan Diperbarui',
        `Status permintaan layanan Anda (${sr.code}) telah diperbarui menjadi: ${statusLabel}.`,
        {
          resource: 'service_request',
          resourceId: id,
          status: targetStatus,
        },
      );
    }

    if (status === ServiceRequestStatus.APPROVED) {
      const serviceData = await this.servicesInternalService.findByVersionId(
        sr.serviceId.toString(),
        user,
      );

      const batchId = new Types.ObjectId().toString();
      const configs = serviceData.workOrdersConfig || [];
      const createdWorkOrdersRaw = await Promise.all(
        configs.map(async (config: any) => {
          const workOrderFormId = config.workOrderForm?._id ?? config.workOrderFormId ?? null;
          const reportFormId = config.workReportForm?._id ?? config.workReportFormId ?? null;
          const positionId = config.positionsOnDuty?._id ?? config.positionId ?? null;
          
          return this.workOrderService.createInternal({
            companyId: sr.companyId,
            serviceId: sr.serviceId,
            serviceRequestId: sr._id,
            batchId,
            positionId,
            configId: config.configId ?? config._id?.toString() ?? null,
            workOrderFormId,
            reportFormId,
            workOrderApprovalAccessType: config.workOrderApprovalAccessType ?? 'auto',
            workReportApprovalAccessType: config.workReportApprovalAccessType ?? 'auto',
            minStaff: config.minStaff ?? 0,
            maxStaff: config.maxStaff ?? 1,
            createdBy: user._id,
            draftingWorkOrderType: serviceData.draftingWorkOrderType ?? 'manual',
            showReportToRequester: config.showReportToRequester ?? false,
          });
        })
      );

      // Update sr workOrderCreatedAt timestamp
      sr.workOrderCreatedAt = now;
      await sr.save();

      const workOrders = await Promise.all(
        createdWorkOrdersRaw.map(async (wo: any) => {
          const woRes = await this.workOrderService.findOneInternal(wo._id.toString(), user);
          return woRes.data;
        })
      );

      const serviceRequest = await this.findOneInternal(id, user);

      return serviceRequest;
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

  async assignStaff(id: string, assignStaffDto: AssignStaffDto, user: AuthenticatedUser): Promise<any> {
    if (!user.company?._id) throw new ForbiddenException('User company information is missing');

    const sr = await this.srModel.findOne({
      _id: id,
      companyId: user.company._id,
      deletedAt: null,
    });
    if (!sr) throw new NotFoundException('Service Request not found');

    if (assignStaffDto.staff_pic !== undefined) {
      if (!assignStaffDto.staff_pic || assignStaffDto.staff_pic === '') {
        sr.staffPIC = null;
      } else {
        const picUser = await this.usersService.findOneByEmail(assignStaffDto.staff_pic);
        if (!picUser) {
          throw new UnprocessableEntityException(`PIC Staff dengan email ${assignStaffDto.staff_pic} tidak ditemukan`);
        } else if (picUser.companyId && picUser.companyId.toString() !== user.company._id.toString()) {
          throw new UnprocessableEntityException(`PIC Staff dengan email ${assignStaffDto.staff_pic} bukan dari perusahaan Anda`);
        } else {
          sr.staffPIC = picUser._id as any;
        }
      }
    }
    await sr.save();

    // Notify PIC
    if (sr.staffPIC) {
      await this.fcmService.sendToUser(
        sr.staffPIC.toString(),
        'Ditugaskan sebagai PIC Permintaan Layanan',
        `Anda telah ditunjuk sebagai PIC untuk Permintaan Layanan: ${sr.code}.`,
        { resource: 'service_request', resourceId: id }
      );
    }

    return this.findOneInternal(id, user);
  }

  private async _getValidatedLatestService(
    serviceId: string,
    user: AuthenticatedUser | null,
    attemptType: 'public' | 'internal' = 'public',
  ): Promise<ServiceDocument> {
    if (!Types.ObjectId.isValid(serviceId)) {
      throw new BadRequestException('Invalid Service ID');
    }

    const requestedService = await this.serviceModel
      .findOne({ _id: new Types.ObjectId(serviceId), deletedAt: null })
      .exec();

    if (!requestedService) {
      throw new NotFoundException('Service not found');
    }

    const latestVersion = await this.serviceModel
      .findOne({ serviceKey: requestedService.serviceKey })
      .sort({ __v: -1 })
      .exec();

    if (!latestVersion || latestVersion.deletedAt !== null || !latestVersion.isActive) {
      throw new NotFoundException('Layanan ini sudah dihapus atau sedang tidak aktif.');
    }

    if (attemptType === 'public') {
      if (latestVersion.accessType === 'internal') {
        throw new ForbiddenException('Klien eksternal tidak diizinkan untuk mengakses layanan internal.');
      }
      if (latestVersion.accessType === 'member_only') {
        if (!user || !user._id) {
          throw new ForbiddenException('Anda harus login untuk mengakses layanan khusus member ini.');
        }
        const isMember = await this.membershipService.isUserSubscribed(
          user._id.toString(),
          latestVersion.companyId.toString(),
        );
        if (!isMember) {
          throw new ForbiddenException('Anda harus menjadi member perusahaan penyedia untuk mengakses layanan ini.');
        }
      }
    } else if (attemptType === 'internal') {
      if (!user || !user.company?._id || user.company._id.toString() !== latestVersion.companyId.toString()) {
        throw new ForbiddenException('Hanya staf internal perusahaan penyedia yang dapat mengakses form ini.');
      }
    }

    return latestVersion;
  }

  /**
   * GET /service-request/:id/report
   * Returns workReportForms and submissions for the requester.
   * Only returns data if showReportToRequester === true on the associated WorkReport.
   */
  async getReportForRequester(srId: string, user: AuthenticatedUser): Promise<any> {
    if (!Types.ObjectId.isValid(srId)) throw new BadRequestException('Invalid SR ID');

    const sr = await this.srModel.findOne({ _id: srId, deletedAt: null }).exec();
    if (!sr) throw new NotFoundException('Service Request not found');

    // Only the original requester can access the report
    const requestedById = sr.requestedBy?._id
      ? sr.requestedBy._id.toString()
      : sr.requestedBy?.toString();
    if (requestedById !== user._id.toString()) {
      throw new ForbiddenException('Only the requester can access this report');
    }

    // Find all Work Orders under this SR
    const workOrders = await this.workOrderService.findRawByServiceRequestId(srId);

    const workReports: any[] = [];

    for (const wo of workOrders) {
      const report = await this.workReportService.findOneQuietlyByWorkOrderId(
        (wo as any)._id.toString(),
      );

      if (!report) continue;

      const reportEntry: any = {
        workOrderId: (wo as any)._id,
        showReportToRequester: report.showReportToRequester ?? false,
        reportForm: null,
        submissions: [],
      };

      // Only include form & submissions if the flag is set
      if (report.showReportToRequester) {
        if (report.reportFormId) {
          try {
            const form = await this.formsService.findTemplateById(
              report.reportFormId.toString(),
            );
            if (form) {
              const t = (form as any).toObject ? (form as any).toObject() : form;
              reportEntry.reportForm = {
                _id: t._id,
                title: t.title,
                description: t.description,
                formType: t.formType,
                formKey: t.formKey,
                fields: t.fields,
                createdAt: t.createdAt,
                updatedAt: t.updatedAt,
              };
            }
          } catch {}
        }

        const subs = await this.submissionModel
          .find({
            ownerId: (report as any)._id,
            submissionType: SubmissionType.Report,
          })
          .lean()
          .exec();
        reportEntry.submissions = subs;
      }

      workReports.push(reportEntry);
    }

    return { workReports };
  }
}
