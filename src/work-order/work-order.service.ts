import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ForbiddenException,
  UnprocessableEntityException,
  Inject,
  forwardRef,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { WorkOrder, WorkOrderDocument } from './schemas/work-order.schema';
import { generateCode } from 'src/common/utils/generate-code.util';
import { AuthenticatedUser } from 'src/auth/interfaces/authenticated-user.interface';
import { FormsService } from 'src/form/form.service';
import { UsersService } from 'src/users/users.service';
import { AssignStaffDto } from './dto/assign-staff.dto';
import { WorkOrderFilterDto } from './dto/work-order-filter.dto';
import { CreateSubmissionsDto } from './dto/create-submissions.dto';
import {
  FormSubmission,
  FormSubmissionDocument,
} from 'src/form/schemas/form-submissions.schema';
import { WorkReportService } from 'src/work-report/work-report.service';
import { WorkOrderResource } from './resources/work-order.resource';
import { SubmissionType } from '../common/enums/submission-type.enum';
import { validateFormSubmission } from 'src/form/helpers/form-validation.helper';
import { ServiceRequestService } from 'src/service-request/service-request.service';
import { FcmService } from 'src/fcm/fcm.service';
import { Role } from 'src/common/enums/role.enum';
import { WorkOrderStatus } from 'src/common/enums/work-order-status.enum';
import { ApprovalAccessType } from 'src/common/enums/approval-access-type.enum';
import { ServiceRequestStatus } from 'src/common/enums/service-request-status.enum';
import { WorkReportStatus } from 'src/common/enums/work-report-status.enum';
import { FormSubmissionStatus } from 'src/common/enums/form-submission-status.enum';
import { StatusTranslator } from 'src/common/utils/status-translator.util';
import { DepartmentAuthHelper } from 'src/common/helpers/department-auth.helper';

@Injectable()
export class WorkOrderService {
  constructor(
    @InjectModel(WorkOrder.name)
    private workOrderModel: Model<WorkOrderDocument>,
    @InjectModel(FormSubmission.name)
    private submissionModel: Model<FormSubmissionDocument>,
    private readonly formsService: FormsService,
    private readonly usersService: UsersService,
    private readonly workReportService: WorkReportService,
    @Inject(forwardRef(() => ServiceRequestService))
    private readonly serviceRequestService: ServiceRequestService,
    private readonly fcmService: FcmService,
  ) {}

  /**
   * Pre-validates that all auto-draft WO configs have sufficient staff available.
   * Call this BEFORE creating a Service Request to ensure atomic failure
   * (so no orphaned SRs are left if staff assignment would fail).
   *
   * @param configs - Array of workOrdersConfig entries from the Service document
   * @param companyId - The provider company ID
   */
  async validateAutoAssignForConfigs(
    configs: Array<{ positionId: any; minStaff?: number; maxStaff?: number }>,
    companyId: string,
  ): Promise<void> {
    for (const config of configs) {
      if (!config.positionId) continue;
      const positionId = config.positionId?.toString?.() ?? config.positionId;
      const minStaff = config.minStaff ?? 0;

      const candidates = await this.usersService.findByPositionId(positionId);
      const eligible = candidates.filter(
        (s: any) =>
          s.companyId?.toString() === companyId &&
          s.role === Role.CompanyStaff &&
          !s.deletedAt,
      );

      if (eligible.length < minStaff) {
        throw new UnprocessableEntityException(
          `Tidak cukup staf tersedia untuk posisi yang dibutuhkan. Dibutuhkan: ${minStaff}, Tersedia: ${eligible.length}. Pembuatan permintaan layanan dibatalkan.`,
        );
      }
    }
  }

  /**
   * Auto-assign staff for a work order using DSS (Decision Support System).
   * Initial strategy: first N available staff with matching position in the company.
   * Returns staffPIC (first selected) and assignedStaff list.
   * Throws if not enough staff are available.
   */
  private async _autoAssignStaff(
    positionId: string,
    companyId: string,
    minStaff: number,
    maxStaff: number,
  ): Promise<{
    staffPIC: Types.ObjectId | null;
    assignedStaff: Types.ObjectId[];
  }> {
    const candidates = await this.usersService.findByPositionId(positionId);
    const eligible = candidates.filter(
      (s: any) =>
        s.companyId?.toString() === companyId &&
        s.role === Role.CompanyStaff &&
        !s.deletedAt,
    );

    if (eligible.length < minStaff) {
      throw new UnprocessableEntityException(
        `Not enough staff available for this position. Required: ${minStaff}, Available: ${eligible.length}`,
      );
    }

    const selected = eligible.slice(0, minStaff);
    return {
      staffPIC: null,
      assignedStaff: selected.map((s: any) => s._id as Types.ObjectId),
    };
  }

  async createInternal(data: any): Promise<WorkOrderDocument> {
    const now = new Date();
    const isAutoDraft = data.draftingWorkOrderType === 'auto';

    let workOrderFormId = data.workOrderFormId;
    if (workOrderFormId) {
      try {
        const f = await this.formsService.findTemplateById(
          workOrderFormId.toString(),
        );
        if (f) {
          const latestF = await this.formsService.findLatestTemplateByKey(
            f.formKey,
          );
          if (latestF) workOrderFormId = latestF._id;
        }
      } catch {}
    }

    let reportFormId = data.reportFormId;
    if (reportFormId) {
      try {
        const f = await this.formsService.findTemplateById(
          reportFormId.toString(),
        );
        if (f) {
          const latestF = await this.formsService.findLatestTemplateByKey(
            f.formKey,
          );
          if (latestF) reportFormId = latestF._id;
        }
      } catch {}
    }

    // Auto-draft: staff must be assigned before creating the WO
    let autoStaff: {
      staffPIC: Types.ObjectId | null;
      assignedStaff: Types.ObjectId[];
    } | null = null;
    if (isAutoDraft && data.positionId) {
      autoStaff = await this._autoAssignStaff(
        data.positionId.toString(),
        data.companyId.toString(),
        data.minStaff ?? 0,
        data.maxStaff ?? 1,
      );
    }

    // Auto-draft: skip drafted status → set directly to approved (ready_to_start)
    const status = isAutoDraft
      ? WorkOrderStatus.APPROVED
      : (data.status ?? WorkOrderStatus.DRAFTED);

    const newWorkOrder = new this.workOrderModel({
      ...data,
      workOrderFormId: isAutoDraft ? null : workOrderFormId,
      reportFormId,
      code: `WO-${generateCode()}`,
      status,
      draftedAt: !isAutoDraft ? now : undefined,
      approvedAt: isAutoDraft ? now : undefined,
      sentAt: isAutoDraft ? now : undefined,
      staffPIC: autoStaff?.staffPIC ?? data.staffPIC ?? null,
      assignedStaff: autoStaff?.assignedStaff ?? data.assignedStaff ?? [],
    });
    const saved = await newWorkOrder.save();

    await this.workReportService.create({
      workOrderId: (saved as any)._id.toString(),
      companyId: (saved as any).companyId.toString(),
      reportFormId: saved.reportFormId
        ? (saved.reportFormId as any).toString()
        : null,
      status: WorkReportStatus.DRAFTED,
      workReportApprovalAccessType: (saved as any).workReportApprovalAccessType,
      showReportToRequester: data.showReportToRequester ?? false,
    } as any);

    // Auto-draft: WO bypasses markAsSent, so notify assigned staff directly
    if (isAutoDraft && autoStaff) {
      const woId = (saved as any)._id.toString();

      if (autoStaff.staffPIC) {
        await this.fcmService.sendToUser(
          autoStaff.staffPIC.toString(),
          'Perintah Kerja Baru Ditugaskan',
          `Anda telah ditunjuk sebagai PIC untuk Perintah Kerja (${saved.code}) yang telah disetujui otomatis.`,
          {
            resource: 'work_order',
            resourceId: woId,
            status: WorkOrderStatus.APPROVED,
          },
        );
      }

      for (const staffId of autoStaff.assignedStaff) {
        if (
          autoStaff.staffPIC &&
          staffId.toString() === autoStaff.staffPIC.toString()
        )
          continue;
        await this.fcmService.sendToUser(
          staffId.toString(),
          'Perintah Kerja Baru Ditugaskan',
          `Anda memiliki tugas baru untuk Perintah Kerja (${saved.code}) yang telah disetujui otomatis.`,
          {
            resource: 'work_order',
            resourceId: woId,
            status: WorkOrderStatus.APPROVED,
          },
        );
      }
    }

    return saved;
  }

  async autoCompleteByWorkReport(workOrderId: string): Promise<void> {
    const wo = await this.workOrderModel
      .findOne({ _id: workOrderId, deletedAt: null })
      .exec();
    if (!wo) return;

    if (wo.status !== WorkOrderStatus.ON_PROGRESS) return;

    wo.status = WorkOrderStatus.COMPLETED;
    wo.completedAt = new Date();
    await wo.save();

    if (wo.serviceRequestId) {
      await this._checkAndUpdateSRStatus(wo.serviceRequestId.toString());
    }

    await this._notifyAuthorizedManagers(
      wo,
      'Perintah Kerja Selesai (Otomatis)',
      `Perintah Kerja (${wo.code}) telah selesai secara otomatis setelah laporan disetujui.`,
      WorkOrderStatus.COMPLETED,
    );
  }

  /**
   * Returns raw (unpopulated) work order documents for a given service request.
   * Used by the report-for-requester endpoint.
   */
  async findRawByServiceRequestId(
    serviceRequestId: string,
  ): Promise<WorkOrderDocument[]> {
    return this.workOrderModel
      .find({
        serviceRequestId: new Types.ObjectId(serviceRequestId),
        deletedAt: null,
      })
      .exec();
  }

  async create(createWorkOrderDto: any, user: AuthenticatedUser): Promise<any> {
    if (!user.company?._id) {
      throw new ForbiddenException('User company information is missing');
    }

    if (createWorkOrderDto.staffPIC || createWorkOrderDto.assignedStaff) {
      await this._validateStaffRequirement(createWorkOrderDto);
    }

    let serviceId = createWorkOrderDto.serviceId;
    if (serviceId) {
      const svcModel = this.workOrderModel.db.model('Service');
      const svc = await svcModel.findOne({ _id: serviceId, deletedAt: null });
      if (svc) {
        const latestSvc = await svcModel
          .findOne({ serviceKey: svc.serviceKey })
          .sort({ __v: -1 });
        if (latestSvc && latestSvc.deletedAt === null && latestSvc.isActive) {
          serviceId = latestSvc._id;
        } else if (
          latestSvc &&
          (latestSvc.deletedAt !== null || !latestSvc.isActive)
        ) {
          throw new BadRequestException(
            'Layanan ini sudah dihapus atau sedang tidak aktif.',
          );
        }
      }
    }

    let workOrderFormId = createWorkOrderDto.workOrderFormId;
    if (workOrderFormId) {
      try {
        const f = await this.formsService.findTemplateById(
          workOrderFormId.toString(),
        );
        if (f) {
          const latestF = await this.formsService.findLatestTemplateByKey(
            f.formKey,
          );
          if (latestF) workOrderFormId = latestF._id;
        }
      } catch {}
    }

    let reportFormId = createWorkOrderDto.reportFormId;
    if (reportFormId) {
      try {
        const f = await this.formsService.findTemplateById(
          reportFormId.toString(),
        );
        if (f) {
          const latestF = await this.formsService.findLatestTemplateByKey(
            f.formKey,
          );
          if (latestF) reportFormId = latestF._id;
        }
      } catch {}
    }

    const newWorkOrder = new this.workOrderModel({
      ...createWorkOrderDto,
      serviceId,
      workOrderFormId,
      reportFormId,
      code: `WO-${generateCode()}`,
      companyId: user.company._id,
      createdBy: user._id,
      status: WorkOrderStatus.DRAFTED,
      draftedAt: new Date(),
    });
    const saved = await newWorkOrder.save();

    // Look up showReportToRequester from the service's WO config
    let showReportToRequester = false;
    if (serviceId && createWorkOrderDto.configId) {
      try {
        const svcModel = this.workOrderModel.db.model('Service');
        const svc = await svcModel.findOne({ _id: serviceId, deletedAt: null });
        if (svc) {
          const matchedConfig = svc.workOrdersConfig?.find(
            (c: any) => c.configId === createWorkOrderDto.configId,
          );
          if (matchedConfig)
            showReportToRequester =
              matchedConfig.showReportToRequester ?? false;
        }
      } catch {}
    }

    await this.workReportService.create({
      workOrderId: (saved._id as any).toString(),
      companyId: (saved.companyId as any).toString(),
      reportFormId: saved.reportFormId
        ? (saved.reportFormId as any).toString()
        : null,
      status: WorkReportStatus.DRAFTED,
      workReportApprovalAccessType: saved.workReportApprovalAccessType,
      showReportToRequester,
    } as any);

    return this.findOneInternal((saved._id as any).toString(), user);
  }

  async update(
    id: string,
    updateWorkOrderDto: any,
    user: AuthenticatedUser,
  ): Promise<any> {
    if (!user.company?._id) {
      throw new ForbiddenException('User company information is missing');
    }
    const wo = await this.workOrderModel
      .findOne({
        _id: id,
        companyId: user.company._id,
        deletedAt: null,
      })
      .populate('serviceId');
    if (!wo) throw new NotFoundException('Work Order not found');
    this._checkServiceActive(wo);

    if (updateWorkOrderDto.staffPIC || updateWorkOrderDto.assignedStaff) {
      const merged = { ...wo.toObject(), ...updateWorkOrderDto };
      await this._validateStaffRequirement(merged);
    }

    Object.assign(wo, updateWorkOrderDto);
    await wo.save();
    return this.findOneInternal(id, user);
  }

  private _checkServiceActive(wo: any) {
    if (!wo.serviceId || typeof wo.serviceId !== 'object') return;
    const svc = wo.serviceId;
    if (svc.isActive === false && wo.status !== WorkOrderStatus.ON_PROGRESS) {
      throw new ForbiddenException(
        'Layanan terkait sedang tidak aktif. Aksi pada Perintah Kerja ini tidak diizinkan.',
      );
    }
  }

  private async _validateStaffRequirement(wo: any) {
    const requiredPositionId = wo.positionId?.toString();
    const errors: string[] = [];

    // Check Staff PIC mandatory if not auto
    if (
      wo.workOrderApprovalAccessType !== ApprovalAccessType.AUTO &&
      !wo.staffPIC
    ) {
      errors.push(
        'Staff PIC wajib diisi untuk Work Order yang memerlukan persetujuan',
      );
    }

    // Check Staff PIC position
    if (wo.staffPIC && requiredPositionId) {
      const pic = await this.usersService.findById(wo.staffPIC.toString());
      if (pic && pic.positionId?.toString() !== requiredPositionId) {
        errors.push(`Staf PIC ${pic.email} tidak memiliki posisi yang sesuai`);
      }
    }

    // Check Assigned Staff positions
    if (
      wo.assignedStaff &&
      Array.isArray(wo.assignedStaff) &&
      requiredPositionId
    ) {
      for (const staffId of wo.assignedStaff) {
        const staff = await this.usersService.findById(staffId.toString());
        if (staff && staff.positionId?.toString() !== requiredPositionId) {
          errors.push(`Staf ${staff.email} tidak memiliki posisi yang sesuai`);
        }
      }
    }

    if (errors.length > 0) {
      throw new UnprocessableEntityException(errors.join(', '));
    }
  }

  async findAllInternal(
    user: AuthenticatedUser,
    filterDto: WorkOrderFilterDto,
  ): Promise<any[]> {
    if (!user.company?._id) {
      throw new ForbiddenException('User company information is missing');
    }

    const query: any = { companyId: user.company._id, deletedAt: null };

    if (user.role === Role.CompanyStaff) {
      if (filterDto.status && filterDto.status !== WorkOrderStatus.SENT) {
        return [];
      }
      query.assignedStaff = user._id;
      query.status = {
        $in: [
          WorkOrderStatus.SENT,
          WorkOrderStatus.ON_PROGRESS,
          WorkOrderStatus.COMPLETED,
          WorkOrderStatus.FAILED,
          WorkOrderStatus.APPROVED,
          WorkOrderStatus.REJECTED,
          WorkOrderStatus.CANCELLED,
        ],
      };
    } else if (user.role === Role.CompanyManager) {
      const managerId = new Types.ObjectId(user._id.toString());
      query.$or = [
        { createdBy: managerId },
        { createdBy: null }, // System generated (Service Request flow)
      ];
      if (filterDto.status) query.status = filterDto.status;
      if (filterDto.assignedStaffId) {
        query.assignedStaff = new Types.ObjectId(filterDto.assignedStaffId);
      }
    } else {
      if (filterDto.status) query.status = filterDto.status;
      if (filterDto.assignedStaffId) {
        query.assignedStaff = new Types.ObjectId(filterDto.assignedStaffId);
      }
    }

    if (filterDto.startDate && filterDto.endDate) {
      const start = new Date(filterDto.startDate);
      start.setHours(0, 0, 0, 0);

      const end = new Date(filterDto.endDate);
      end.setHours(23, 59, 59, 999);

      query.createdAt = {
        $gte: start,
        $lte: end,
      };
    }

    const workOrdersRaw = await this.workOrderModel
      .find(query)
      .populate('createdBy', 'name email role')
      .populate('approvedBy', 'name email role')
      .populate('staffPIC', 'name email role')
      .populate('assignedStaff', 'name email role')
      .populate('serviceId', 'title description accessType isActive')
      .populate(
        'positionId',
        'name description isActive companyId createdAt updatedAt deletedAt',
      )
      .sort({ createdAt: -1 })
      .lean()
      .exec();

    return Promise.all(workOrdersRaw.map((wo) => this._hydrateOne(wo, false)));
  }

  async findOneInternal(
    id: string,
    user: AuthenticatedUser,
    notificationId?: string,
  ): Promise<any> {
    if (!user.company?._id)
      throw new ForbiddenException('User company information is missing');

    // Support lookup by both ObjectId and WO code (e.g. "WO-XXXXX")
    const isObjectId = Types.ObjectId.isValid(id);
    const query: any = {
      ...(isObjectId ? { _id: id } : { code: id }),
      companyId: user.company._id,
      deletedAt: null,
    };
    if (user.role === Role.CompanyStaff) {
      query.assignedStaff = user._id;
    }

    const wo = await this.workOrderModel
      .findOne(query)
      .populate('createdBy', 'name email role')
      .populate('approvedBy', 'name email role')
      .populate('staffPIC', 'name email role')
      .populate('assignedStaff', 'name email role')
      .populate('serviceId', 'companyId title description accessType isActive')
      .populate('positionId', '-__v')
      .exec();

    if (!wo) throw new NotFoundException('Work Order not found');

    const woId = (wo as any)._id.toString();

    // Mark notifications as read directly if notificationId is provided
    if (notificationId) {
      this.fcmService.markAsRead(notificationId).catch(console.error);
    } else {
      // Fallback using resource-based update if no ID
      this.fcmService
        .markAsReadByResource(user._id.toString(), 'work_order', woId)
        .catch(console.error);
    }

    return this._hydrateOne(wo);
  }

  private async _hydrateOne(
    wo: any,
    includeMeta: boolean = true,
  ): Promise<any> {
    // Hydrate workOrderForm and submissions for both list and detail views
    let workOrderForm: any = null;
    if (wo.workOrderFormId) {
      try {
        const template = await this.formsService.findTemplateById(
          wo.workOrderFormId.toString(),
        );
        if (template) {
          const t = template.toObject ? template.toObject() : template;
          workOrderForm = {
            _id: t._id,
            title: t.title,
            description: t.description,
            formType: t.formType,
            fields: t.fields,
          };
        }
      } catch {
        // Form template not found, leave null
      }
    }

    const submissions = await this.submissionModel
      .find({ ownerId: wo._id, submissionType: SubmissionType.WorkOrder })
      .lean()
      .exec();

    // For list view, return data with form+submissions but skip heavy meta computation
    if (!includeMeta) {
      return WorkOrderResource.transformWorkOrderDetail(
        wo,
        workOrderForm,
        submissions,
      );
    }

    const meta: any = {
      workOrderCapabilities: {
        can_start: false,
        can_complete: false,
        can_fail: false,
        can_recreate: false,
        can_cancel: false,
      },
      workOrderSiblings: [],
      reportNeedReview: false,
    };

    const isApproved = wo.status === WorkOrderStatus.APPROVED;
    const isOnProgress = wo.status === WorkOrderStatus.ON_PROGRESS;
    const isRejected = wo.status === WorkOrderStatus.REJECTED;

    let siblingsQuery: any = null;
    if (wo.serviceRequestId) {
      siblingsQuery = { serviceRequestId: wo.serviceRequestId };
    } else if (wo.batchId) {
      siblingsQuery = { batchId: wo.batchId };
    }

    if (siblingsQuery) {
      const siblingsRaw = await this.workOrderModel
        .find(
          { ...siblingsQuery, deletedAt: null },
          {
            _id: 1,
            code: 1,
            status: 1,
            positionId: 1,
            configId: 1,
            serviceId: 1,
            createdAt: 1,
          },
        )
        .populate('positionId', 'name')
        .populate('serviceId', 'title description accessType isActive')
        .sort({ createdAt: -1 })
        .exec();

      const latestSiblingsMap = new Map();
      const siblingsForMeta: any[] = [];
      const siblingsForLogic: any[] = [];
      for (const s of siblingsRaw) {
        const sid =
          s.configId?.toString() ||
          ((s.positionId as any)?._id
            ? (s.positionId as any)._id.toString()
            : s.positionId?.toString());
        if (!sid) {
          siblingsForMeta.push(s);
          siblingsForLogic.push(s);
        } else {
          const isLatest = !latestSiblingsMap.has(sid);
          if (isLatest) {
            latestSiblingsMap.set(sid, s);
            siblingsForLogic.push(s);
          }
          // meta.workOrderSiblings includes latest version + all rejected versions
          if (isLatest || s.status === WorkOrderStatus.REJECTED) {
            siblingsForMeta.push(s);
          }
        }
      }

      meta.workOrderSiblings = siblingsForMeta.map((s: any) => ({
        _id: s._id,
        code: s.code,
        status: s.status,
        position: s.positionId
          ? { _id: s.positionId._id, name: s.positionId.name }
          : null,
        serviceSummary: s.serviceId
          ? {
              _id: s.serviceId._id,
              title: s.serviceId.title,
              description: s.serviceId.description,
              accessType: s.serviceId.accessType,
              isActive: s.serviceId.isActive,
            }
          : null,
      }));

      // can_start ONLY if ALL relevant siblings (latest versions) are ready AND current WO is approved
      const allSiblingsReady =
        siblingsForLogic.length > 0 &&
        siblingsForLogic.every((s) =>
          [
            WorkOrderStatus.APPROVED,
            WorkOrderStatus.ON_PROGRESS,
            WorkOrderStatus.COMPLETED,
            WorkOrderStatus.FAILED,
          ].includes(s.status),
        );
      meta.workOrderCapabilities.can_start = isApproved && allSiblingsReady;

      // can_cancel only if no relevant sibling is active (on_progress, completed, failed)
      const isActiveSibling = siblingsForLogic.some((s) =>
        [
          WorkOrderStatus.ON_PROGRESS,
          WorkOrderStatus.COMPLETED,
          WorkOrderStatus.FAILED,
        ].includes(s.status),
      );
      const allowedCancelStatuses = [
        WorkOrderStatus.DRAFTED,
        WorkOrderStatus.APPROVED,
        WorkOrderStatus.SENT,
        WorkOrderStatus.REJECTED,
      ];
      meta.workOrderCapabilities.can_cancel =
        allowedCancelStatuses.includes(wo.status) && !isActiveSibling;
    } else {
      // If no siblings, just check if current WO is approved
      meta.workOrderCapabilities.can_start = isApproved;

      const allowedCancelStatuses = [
        WorkOrderStatus.DRAFTED,
        WorkOrderStatus.APPROVED,
        WorkOrderStatus.SENT,
        WorkOrderStatus.REJECTED,
      ];
      meta.workOrderCapabilities.can_cancel = allowedCancelStatuses.includes(
        wo.status,
      );
    }

    const parentQuery = wo.serviceRequestId
      ? { serviceRequestId: wo.serviceRequestId }
      : wo.batchId
        ? { batchId: wo.batchId }
        : null;
    const taskId =
      wo.configId ||
      (wo.positionId?.['_id']
        ? wo.positionId['_id'].toString()
        : wo.positionId?.toString());

    if (taskId && parentQuery) {
      const orConditions: any[] = [{ configId: taskId }];
      if (Types.ObjectId.isValid(taskId)) {
        orConditions.push({ positionId: new Types.ObjectId(taskId) });
      }
      const history = await this.workOrderModel
        .find({
          ...parentQuery,
          $or: orConditions,
          deletedAt: null,
        })
        .sort({ createdAt: -1 })
        .exec();

      if (history.length > 0) {
        const latest = history[0] as any;
        const isLatest = latest._id.toString() === wo._id.toString();
        // can_recreate if current WO is rejected AND it is the latest version for this task
        meta.workOrderCapabilities.can_recreate = isRejected && isLatest;
      }
    } else {
      // Fallback: if no taskId or parent, just allow recreate if rejected
      meta.workOrderCapabilities.can_recreate = isRejected;
    }

    try {
      const report = await this.workReportService.findOneQuietlyByWorkOrderId(
        wo._id.toString(),
      );
      if (report && report.status === WorkReportStatus.APPROVED) {
        const isAutoReport =
          wo.workReportApprovalAccessType === ApprovalAccessType.AUTO;
        meta.workOrderCapabilities.can_complete = isOnProgress && !isAutoReport;
        meta.workOrderCapabilities.can_fail = isOnProgress && !isAutoReport;
      }

      if (
        [
          WorkOrderStatus.ON_PROGRESS,
          WorkOrderStatus.COMPLETED,
          WorkOrderStatus.FAILED,
        ].includes(wo.status)
      ) {
        if (report && report.status === WorkReportStatus.SUBMITTED) {
          meta.reportNeedReview = true;
        }
      }
    } catch {
      // ignore
    }

    const transformed = WorkOrderResource.transformWorkOrderDetail(
      wo,
      workOrderForm,
      submissions,
    );
    return { data: transformed, meta };
  }

  async updateStatus(
    id: string,
    updateStatusDto: any,
    user: AuthenticatedUser,
  ): Promise<any> {
    if (!user.company?._id)
      throw new ForbiddenException('User company information is missing');

    const wo = await this.workOrderModel
      .findOne({
        _id: id,
        companyId: user.company._id,
        deletedAt: null,
      })
      .populate('serviceId');
    if (!wo) throw new NotFoundException('Work Order not found');
    this._checkServiceActive(wo);

    const now = new Date();
    wo.status = updateStatusDto.status;

    switch (updateStatusDto.status) {
      case WorkOrderStatus.DRAFTED:
        if (!wo.draftedAt) wo.draftedAt = now;
        break;
      case WorkOrderStatus.SENT:
        if (!wo.sentAt) wo.sentAt = now;
        break;
      case WorkOrderStatus.APPROVED:
        if (!wo.approvedAt) wo.approvedAt = now;
        break;
      case WorkOrderStatus.REJECTED:
        if (!wo.rejectedAt) wo.rejectedAt = now;
        break;
      case WorkOrderStatus.ON_PROGRESS:
        if (!wo.startedAt) wo.startedAt = now;
        break;
      case WorkOrderStatus.COMPLETED:
        if (!wo.completedAt) wo.completedAt = now;
        break;
      case WorkOrderStatus.FAILED:
        if (!wo.failedAt) wo.failedAt = now;
        break;
      case WorkOrderStatus.CANCELLED:
        if (!wo.cancelledAt) wo.cancelledAt = now;
        break;
    }

    await wo.save();

    if (wo.serviceRequestId) {
      await this._checkAndUpdateSRStatus(wo.serviceRequestId.toString());
    }

    // Notify authorized managers about the status update
    const statusLabel = StatusTranslator.translateWOStatus(
      updateStatusDto.status,
    );
    await this._notifyAuthorizedManagers(
      wo,
      'Status Perintah Kerja Diperbarui',
      `Status Perintah Kerja (${wo.code}) telah diperbarui menjadi: ${statusLabel}.`,
      updateStatusDto.status,
    );

    return this.findOneInternal(id, user);
  }

  async assignStaff(
    id: string,
    assignStaffDto: AssignStaffDto,
    user: AuthenticatedUser,
  ): Promise<any> {
    if (!user.company?._id)
      throw new ForbiddenException('User company information is missing');

    const wo = await this.workOrderModel
      .findOne({
        _id: id,
        companyId: user.company._id,
        deletedAt: null,
      })
      .populate('serviceId');
    if (!wo) throw new NotFoundException('Work Order not found');
    this._checkServiceActive(wo);

    const errors: string[] = [];
    const requiredPositionId = wo.positionId?.toString();

    let newStaffPIC = wo.staffPIC;
    let newAssignedStaff = [...wo.assignedStaff];

    if (assignStaffDto.staff_pic !== undefined) {
      if (!assignStaffDto.staff_pic || assignStaffDto.staff_pic === '') {
        newStaffPIC = null;
      } else {
        const picUser = await this.usersService.findOneByEmail(
          assignStaffDto.staff_pic,
        );
        if (!picUser) {
          errors.push(
            `Staf PIC dengan email ${assignStaffDto.staff_pic} tidak ditemukan`,
          );
        } else if (
          picUser.companyId &&
          picUser.companyId.toString() !== user.company._id.toString()
        ) {
          errors.push(
            `Staf PIC dengan email ${assignStaffDto.staff_pic} bukan dari perusahaan Anda`,
          );
        } else if (
          requiredPositionId &&
          picUser.positionId?.toString() !== requiredPositionId
        ) {
          errors.push(
            `Staf PIC dengan email ${assignStaffDto.staff_pic} tidak memiliki posisi yang sesuai dengan kebutuhan Perintah Kerja`,
          );
        } else {
          newStaffPIC = picUser._id as any;
        }
      }
    }

    if (
      assignStaffDto.assign_staffs &&
      Array.isArray(assignStaffDto.assign_staffs)
    ) {
      const staffIds: Types.ObjectId[] = [];
      for (const email of assignStaffDto.assign_staffs) {
        const staff = await this.usersService.findOneByEmail(email);
        if (!staff) {
          errors.push(`Staf dengan email ${email} tidak ditemukan`);
          continue;
        }
        if (
          staff.companyId &&
          staff.companyId.toString() !== user.company._id.toString()
        ) {
          errors.push(`Staf dengan email ${email} bukan dari perusahaan Anda`);
          continue;
        }
        if (
          requiredPositionId &&
          staff.positionId?.toString() !== requiredPositionId
        ) {
          errors.push(
            `Staf dengan email ${email} tidak memiliki posisi yang sesuai dengan kebutuhan Perintah Kerja`,
          );
          continue;
        }
        staffIds.push(staff._id as Types.ObjectId);
      }
      newAssignedStaff = staffIds as any;
    }

    // Validation: assigned staff count must respect the WO's configured bounds
    const assignedCount = newAssignedStaff.length;
    if (
      typeof wo.maxStaff === 'number' &&
      wo.maxStaff > 0 &&
      assignedCount > wo.maxStaff
    ) {
      errors.push(
        `Jumlah staf melebihi batas maksimal (${assignedCount}/${wo.maxStaff})`,
      );
    }
    if (
      typeof wo.minStaff === 'number' &&
      wo.minStaff > 0 &&
      assignedCount > 0 &&
      assignedCount < wo.minStaff
    ) {
      errors.push(
        `Jumlah staf kurang dari batas minimal (${assignedCount}/${wo.minStaff})`,
      );
    }

    if (errors.length > 0)
      throw new UnprocessableEntityException(errors.join(', '));

    // Final validation for mandatory PIC if not auto
    if (
      wo.workOrderApprovalAccessType !== ApprovalAccessType.AUTO &&
      !newStaffPIC
    ) {
      throw new BadRequestException(
        'Staff PIC wajib diisi untuk Work Order yang memerlukan persetujuan',
      );
    }

    wo.staffPIC = newStaffPIC;
    wo.assignedStaff = newAssignedStaff;

    await wo.save();

    // Notify staff ONLY if WO is not in DRAFT status
    if (wo.status !== WorkOrderStatus.DRAFTED) {
      // Notify new PIC
      if (assignStaffDto.staff_pic && wo.staffPIC) {
        await this.fcmService.sendToUser(
          wo.staffPIC.toString(),
          'Ditugaskan sebagai PIC Perintah Kerja',
          `Anda telah ditunjuk sebagai Penanggung Jawab (PIC) untuk Perintah Kerja: ${wo.code}.`,
          { resource: 'work_order', resourceId: id },
        );
      }

      // Notify assigned staff
      if (assignStaffDto.assign_staffs && wo.assignedStaff.length > 0) {
        for (const staffId of wo.assignedStaff) {
          await this.fcmService.sendToUser(
            staffId.toString(),
            'Penugasan Perintah Kerja Baru',
            `Anda telah ditugaskan sebagai staf pelaksana untuk Perintah Kerja: ${wo.code}.`,
            { resource: 'work_order', resourceId: id },
          );
        }
      }
    }

    return this.findOneInternal(id, user);
  }

  async markAsSent(id: string, user: AuthenticatedUser): Promise<any> {
    if (!user.company?._id)
      throw new ForbiddenException('User company information is missing');

    const wo = await this.workOrderModel
      .findOne({ _id: id, companyId: user.company._id, deletedAt: null })
      .populate('serviceId');
    if (!wo) throw new NotFoundException('Work Order not found');
    this._checkServiceActive(wo);

    // Requirement: User must be creator OR Owner OR Manager (for system-generated or self-created)
    const isOwner = user.role === Role.CompanyOwner;
    const isCreator =
      wo.createdBy && wo.createdBy.toString() === user._id.toString();
    const isManager =
      user.role === Role.CompanyManager && (!wo.createdBy || isCreator);

    if (!isOwner && !isCreator && !isManager) {
      throw new ForbiddenException(
        'Hanya Pembuat Perintah Kerja, Manager, atau Owner yang dapat mengirim Perintah Kerja',
      );
    }

    if (wo.status !== WorkOrderStatus.DRAFTED) {
      throw new UnprocessableEntityException('Status tidak memenuhi syarat');
    }

    // Validation: Minimum Staff
    if (wo.assignedStaff.length < wo.minStaff) {
      throw new BadRequestException(
        `Jumlah staf minimal belum terpenuhi (${wo.assignedStaff.length}/${wo.minStaff})`,
      );
    }

    if (
      wo.workOrderApprovalAccessType !== ApprovalAccessType.AUTO &&
      !wo.staffPIC
    ) {
      throw new BadRequestException(
        'Staff PIC wajib diisi untuk Work Order yang memerlukan persetujuan',
      );
    }

    // Verify all submissions are present for the work order form
    if (wo.workOrderFormId) {
      const template = await this.formsService.findTemplateById(
        wo.workOrderFormId.toString(),
      );
      if (template) {
        const submission = await this.submissionModel.findOne({
          ownerId: wo._id,
          formId: template._id,
          submissionType: SubmissionType.WorkOrder,
        });
        if (!submission) {
          throw new UnprocessableEntityException(
            'Formulir perintah kerja harus dikirimkan sebelum ditandai sebagai terkirim',
          );
        }
      }
    }

    const now = new Date();
    if (wo.workOrderApprovalAccessType === ApprovalAccessType.AUTO) {
      wo.status = WorkOrderStatus.APPROVED;
      wo.approvedAt = now;
      wo.sentAt = now;
    } else {
      wo.status = WorkOrderStatus.SENT;
      if (!wo.sentAt) wo.sentAt = now;
    }

    await wo.save();

    // Notify staff that the Perintah Kerja is now active/sent
    if (wo.staffPIC) {
      const statusLabel = StatusTranslator.translateWOStatus(wo.status);
      await this.fcmService.sendToUser(
        wo.staffPIC.toString(),
        wo.status === WorkOrderStatus.APPROVED
          ? 'Perintah Kerja Disetujui'
          : 'Perintah Kerja Baru',
        `Perintah Kerja (${wo.code}) telah ${statusLabel.toLowerCase()} dan siap untuk Anda tindak lanjuti.`,
        { resource: 'work_order', resourceId: id, status: wo.status },
      );
    }

    if (wo.assignedStaff && wo.assignedStaff.length > 0) {
      for (const staffId of wo.assignedStaff) {
        // Skip if staff is also the PIC (already notified)
        if (wo.staffPIC && staffId.toString() === wo.staffPIC.toString())
          continue;

        await this.fcmService.sendToUser(
          staffId.toString(),
          wo.status === WorkOrderStatus.APPROVED
            ? 'Perintah Kerja Disetujui'
            : 'Perintah Kerja Baru',
          `Anda memiliki tugas baru untuk Perintah Kerja (${wo.code}).`,
          { resource: 'work_order', resourceId: id, status: wo.status },
        );
      }
    }

    return this.findOneInternal(id, user);
  }

  async approve(id: string, user: AuthenticatedUser): Promise<any> {
    const wo = await this.workOrderModel
      .findOne({ _id: id, deletedAt: null })
      .populate('serviceId');
    if (!wo) throw new NotFoundException('Work Order not found');
    this._checkServiceActive(wo);

    if (wo.status !== WorkOrderStatus.SENT) {
      throw new UnprocessableEntityException('Status tidak memenuhi syarat');
    }

    this._checkApprovalRequiresManual(wo);
    this._checkOnlyStaffPic(wo, user);

    wo.status = WorkOrderStatus.APPROVED;
    wo.approvedBy = user._id as any;
    if (!wo.approvedAt) wo.approvedAt = new Date();
    await wo.save();

    // Notify authorized managers about approval
    await this._notifyAuthorizedManagers(
      wo,
      'Perintah Kerja Disetujui',
      `Perintah Kerja (${wo.code}) telah disetujui oleh PIC.`,
      WorkOrderStatus.APPROVED,
    );

    return this.findOneInternal(id, user);
  }

  async reject(id: string, user: AuthenticatedUser): Promise<any> {
    const wo = await this.workOrderModel
      .findOne({ _id: id, deletedAt: null })
      .populate('serviceId');
    if (!wo) throw new NotFoundException('Work Order not found');
    this._checkServiceActive(wo);

    if (wo.status !== WorkOrderStatus.SENT) {
      throw new UnprocessableEntityException('Status tidak memenuhi syarat');
    }

    this._checkApprovalRequiresManual(wo);
    this._checkOnlyStaffPic(wo, user);

    wo.status = WorkOrderStatus.REJECTED;
    if (!wo.rejectedAt) wo.rejectedAt = new Date();
    await wo.save();

    // Notify authorized managers about rejection
    await this._notifyAuthorizedManagers(
      wo,
      'Perintah Kerja Ditolak',
      `Perintah Kerja (${wo.code}) telah ditolak oleh PIC.`,
      WorkOrderStatus.REJECTED,
    );

    return this.findOneInternal(id, user);
  }

  async recreate(id: string, user: AuthenticatedUser): Promise<any> {
    const wo = await this.workOrderModel
      .findOne({ _id: id, deletedAt: null })
      .populate('serviceId');
    if (!wo) throw new NotFoundException('Work Order not found');
    this._checkServiceActive(wo);

    this._checkOwnership(wo, user);
    if (wo.status !== WorkOrderStatus.REJECTED)
      throw new UnprocessableEntityException('Status tidak memenuhi syarat');

    const newWo = new this.workOrderModel({
      code: `WO-${generateCode()}`,
      serviceRequestId: wo.serviceRequestId,
      batchId: wo.batchId,
      createdBy: wo.createdBy,
      serviceId: wo.serviceId,
      companyId: wo.companyId,
      positionId: wo.positionId,
      configId: wo.configId,
      workOrderFormId: wo.workOrderFormId,
      reportFormId: wo.reportFormId,
      workOrderApprovalAccessType: wo.workOrderApprovalAccessType,
      workReportApprovalAccessType: wo.workReportApprovalAccessType,
      minStaff: wo.minStaff,
      maxStaff: wo.maxStaff,
      status: WorkOrderStatus.DRAFTED,
      draftedAt: new Date(),
    });
    const saved = await newWo.save();

    // Copy showReportToRequester from the old WO's work report
    const oldReport =
      await this.workReportService.findOneQuietlyByWorkOrderId(id);

    await this.workReportService.create({
      workOrderId: (saved._id as any).toString(),
      companyId: (saved.companyId as any).toString(),
      reportFormId: saved.reportFormId
        ? (saved.reportFormId as any).toString()
        : null,
      status: WorkReportStatus.DRAFTED,
      workReportApprovalAccessType: saved.workReportApprovalAccessType,
      showReportToRequester: (oldReport as any)?.showReportToRequester ?? false,
    } as any);

    // Notify Authorized Managers that a new WO has been created from a rejected one
    await this._notifyAuthorizedManagers(
      saved,
      'Perintah Kerja Dibuat Ulang',
      `Perintah Kerja (${wo.code}) yang ditolak telah dibuat ulang menjadi ${saved.code}.`,
      WorkOrderStatus.DRAFTED,
    );

    return this.findOneInternal((saved._id as any).toString(), user);
  }

  async cancel(id: string, user: AuthenticatedUser): Promise<any> {
    const wo = await this.workOrderModel
      .findOne({ _id: id, deletedAt: null })
      .populate('serviceId');
    if (!wo) throw new NotFoundException('Work Order not found');
    this._checkServiceActive(wo);

    this._checkOwnership(wo, user);

    const siblingsQuery = wo.serviceRequestId
      ? { serviceRequestId: wo.serviceRequestId }
      : wo.batchId
        ? { batchId: wo.batchId }
        : null;

    if (siblingsQuery) {
      const activeSibling = await this.workOrderModel.findOne({
        ...siblingsQuery,
        status: {
          $in: [
            WorkOrderStatus.ON_PROGRESS,
            WorkOrderStatus.COMPLETED,
            WorkOrderStatus.FAILED,
          ],
        },
        deletedAt: null,
      });
      if (activeSibling) {
        throw new UnprocessableEntityException(
          'Tidak dapat membatalkan karena terdapat tugas yang sedang dalam pengerjaan atau telah selesai',
        );
      }
    }

    const allowedCancelStatuses = [
      WorkOrderStatus.DRAFTED,
      WorkOrderStatus.APPROVED,
      WorkOrderStatus.SENT,
      WorkOrderStatus.REJECTED,
    ];
    if (!allowedCancelStatuses.includes(wo.status)) {
      throw new UnprocessableEntityException('Status tidak memenuhi syarat');
    }

    // Capture status before mutation for notification guard
    const prevStatus = wo.status;

    wo.status = WorkOrderStatus.CANCELLED;
    wo.cancelledAt = new Date();
    await wo.save();

    // Cancel all siblings
    if (wo.serviceRequestId) {
      await this.workOrderModel.updateMany(
        {
          serviceRequestId: wo.serviceRequestId,
          _id: { $ne: wo._id },
          deletedAt: null,
          status: {
            $in: [
              WorkOrderStatus.DRAFTED,
              WorkOrderStatus.SENT,
              WorkOrderStatus.APPROVED,
              WorkOrderStatus.REJECTED,
            ],
          },
        },
        {
          $set: { status: WorkOrderStatus.CANCELLED, cancelledAt: new Date() },
        },
      );

      const srId = wo.serviceRequestId.toString();
      await this._checkAndUpdateSRStatus(srId);
    }

    // Notify Staff PIC / Assigned Staff about cancellation
    // Only notify if WO was already sent to staff (not still in DRAFTED stage)
    const wasAlreadySentToStaff = prevStatus !== WorkOrderStatus.DRAFTED;
    if (wasAlreadySentToStaff) {
      if (wo.staffPIC) {
        await this.fcmService.sendToUser(
          wo.staffPIC.toString(),
          'Perintah Kerja Dibatalkan',
          `Perintah Kerja (${wo.code}) telah dibatalkan.`,
          {
            resource: 'work_order',
            resourceId: id,
            status: WorkOrderStatus.CANCELLED,
          },
        );
      } else if (wo.assignedStaff && wo.assignedStaff.length > 0) {
        for (const staffId of wo.assignedStaff) {
          await this.fcmService.sendToUser(
            staffId.toString(),
            'Perintah Kerja Dibatalkan',
            `Perintah Kerja (${wo.code}) telah dibatalkan.`,
            {
              resource: 'work_order',
              resourceId: id,
              status: WorkOrderStatus.CANCELLED,
            },
          );
        }
      }
    }

    return this.findOneInternal(id, user);
  }

  async start(id: string, user: AuthenticatedUser): Promise<any> {
    const wo = await this.workOrderModel
      .findOne({ _id: id, deletedAt: null })
      .populate('serviceId');
    if (!wo) throw new NotFoundException('Work Order not found');
    this._checkServiceActive(wo);

    if (wo.status !== WorkOrderStatus.APPROVED)
      throw new UnprocessableEntityException('Status tidak memenuhi syarat');

    const isPIC = wo.staffPIC && wo.staffPIC.toString() === user._id.toString();
    const isAssigned =
      wo.assignedStaff &&
      wo.assignedStaff.some((s: any) => s.toString() === user._id.toString());

    const staffCanStart = wo.staffPIC ? isPIC : isAssigned;

    if (!staffCanStart) {
      throw new ForbiddenException(
        'Hanya PIC yang ditunjuk (atau staf yang ditugaskan jika tidak ada PIC) yang dapat memulai perintah kerja.',
      );
    }

    if (wo.serviceRequestId) {
      const siblingsRaw = await this.workOrderModel
        .find({ serviceRequestId: wo.serviceRequestId, deletedAt: null })
        .sort({ createdAt: -1 });
      const latestSiblingsMap = new Map();
      const siblings: any[] = [];
      for (const s of siblingsRaw) {
        const taskId = s.configId?.toString() || s.positionId?.toString();
        if (!taskId) {
          siblings.push(s);
        } else if (!latestSiblingsMap.has(taskId)) {
          latestSiblingsMap.set(taskId, s);
          siblings.push(s);
        }
      }

      const allApproved =
        siblings.length > 0 &&
        siblings.every((s) =>
          ['approved', 'on_progress', 'completed', 'failed'].includes(s.status),
        );
      if (!allApproved) {
        throw new UnprocessableEntityException(
          'All sibling WOs must be approved before any can start',
        );
      }
    }

    wo.status = WorkOrderStatus.ON_PROGRESS;
    wo.startedAt = new Date();
    await wo.save();

    const report = await this.workReportService.findOneQuietlyByWorkOrderId(
      (wo as any)._id.toString(),
    );
    if (report && report.status === WorkReportStatus.DRAFTED) {
      await this.workReportService.update((report as any)._id.toString(), {
        status: WorkReportStatus.ON_PROGRESS,
        startedAt: new Date(),
      } as any);
    }

    if (wo.serviceRequestId) {
      await this.serviceRequestService.updateSRStatusSystemically(
        wo.serviceRequestId.toString(),
        ServiceRequestStatus.ON_PROGRESS,
      );
    }

    // Notify authorized managers that work has started
    await this._notifyAuthorizedManagers(
      wo,
      'Perintah Kerja Dimulai',
      `Staf telah mulai mengerjakan Perintah Kerja (${wo.code}).`,
      WorkOrderStatus.ON_PROGRESS,
    );

    return this.findOneInternal(id, user);
  }

  async complete(
    id: string,
    issue: string | null,
    user: AuthenticatedUser,
  ): Promise<any> {
    const wo = await this.workOrderModel.findOne({ _id: id, deletedAt: null });
    if (!wo) throw new NotFoundException('Work Order not found');

    this._checkOwnership(wo, user);
    if (wo.status !== WorkOrderStatus.ON_PROGRESS)
      throw new UnprocessableEntityException('Status tidak memenuhi syarat');

    const report = await this.workReportService.findOneQuietlyByWorkOrderId(id);
    if (!report || report.status !== WorkReportStatus.APPROVED) {
      throw new UnprocessableEntityException(
        'Work report must be approved before completing WO',
      );
    }

    wo.status = WorkOrderStatus.COMPLETED;
    wo.completedAt = new Date();
    if (issue) {
      wo.has_issue = true;
      wo.issue_note = issue;
    }
    await wo.save();

    if (wo.serviceRequestId) {
      await this._checkAndUpdateSRStatus(wo.serviceRequestId.toString());
    }

    // Notify authorized managers about completion
    await this._notifyAuthorizedManagers(
      wo,
      'Perintah Kerja Selesai',
      `Perintah Kerja (${wo.code}) telah selesai dikerjakan.`,
      WorkOrderStatus.COMPLETED,
    );

    return this.findOneInternal(id, user);
  }

  async fail(id: string, issue: string, user: AuthenticatedUser): Promise<any> {
    const wo = await this.workOrderModel.findOne({ _id: id, deletedAt: null });
    if (!wo) throw new NotFoundException('Work Order not found');

    this._checkOwnership(wo, user);
    if (wo.status !== WorkOrderStatus.ON_PROGRESS)
      throw new UnprocessableEntityException('Status tidak memenuhi syarat');

    const report = await this.workReportService.findOneQuietlyByWorkOrderId(id);
    if (!report || report.status !== WorkReportStatus.APPROVED) {
      throw new UnprocessableEntityException(
        'Work report must be approved before failing WO',
      );
    }

    if (!issue) {
      throw new UnprocessableEntityException(
        'Issue note is required when failing WO',
      );
    }

    wo.status = WorkOrderStatus.FAILED;
    wo.failedAt = new Date();
    wo.has_issue = true;
    wo.issue_note = issue;
    await wo.save();

    if (wo.serviceRequestId) {
      await this._checkAndUpdateSRStatus(wo.serviceRequestId.toString());
    }

    // Notify authorized managers about failure
    await this._notifyAuthorizedManagers(
      wo,
      'Perintah Kerja Gagal',
      `Perintah Kerja (${wo.code}) ditandai sebagai gagal. Alasan: ${issue}`,
      WorkOrderStatus.FAILED,
    );

    return this.findOneInternal(id, user);
  }

  private async _checkAndUpdateSRStatus(srId: string) {
    const rawSiblings = await this.workOrderModel.find({
      serviceRequestId: new Types.ObjectId(srId),
      deletedAt: null,
    });
    if (!rawSiblings.length) return;

    // Filter to latest version of each task (using configId or positionId as task identifier)
    const latestMap = new Map();
    for (const sib of rawSiblings) {
      const taskId =
        sib.configId?.toString() ||
        sib.positionId?.toString() ||
        (sib as any)._id.toString();
      if (
        !latestMap.has(taskId) ||
        (sib as any).createdAt > latestMap.get(taskId).createdAt
      ) {
        latestMap.set(taskId, sib);
      }
    }
    const siblings = Array.from(latestMap.values());

    // Check if all latest versions are in a terminal state
    const terminalStatuses = [
      WorkOrderStatus.COMPLETED,
      WorkOrderStatus.FAILED,
      WorkOrderStatus.CANCELLED,
    ];
    const allTerminal = siblings.every((s) =>
      terminalStatuses.includes(s.status),
    );

    if (!allTerminal) {
      // Still some WOs in progress or pending
      return;
    }

    const allCancelled = siblings.every(
      (s) => s.status === WorkOrderStatus.CANCELLED,
    );
    const allFailed = siblings.every(
      (s) => s.status === WorkOrderStatus.FAILED,
    );
    const allCompleted = siblings.every(
      (s) => s.status === WorkOrderStatus.COMPLETED,
    );
    const someFailed = siblings.some(
      (s) => s.status === WorkOrderStatus.FAILED,
    );

    let srStatus = ServiceRequestStatus.ON_PROGRESS;

    if (allCancelled) {
      srStatus = ServiceRequestStatus.UNPROCESSABLE;
    } else if (allFailed) {
      srStatus = ServiceRequestStatus.UNPROCESSABLE;
    } else if (allCompleted) {
      srStatus = ServiceRequestStatus.COMPLETED;
    } else if (someFailed) {
      srStatus = ServiceRequestStatus.PARTIAL_COMPLETED;
    } else {
      // Mixed case (e.g., some completed, some cancelled)
      srStatus = ServiceRequestStatus.PARTIAL_COMPLETED;
    }

    await this.serviceRequestService.updateSRStatusSystemically(srId, srStatus);
  }

  async createSubmissions(
    id: string,
    createSubmissionsDto: CreateSubmissionsDto,
    user: AuthenticatedUser,
  ): Promise<any> {
    if (!Types.ObjectId.isValid(id))
      throw new BadRequestException('Invalid Work Order ID');

    const wo = await this.workOrderModel.findOne({
      _id: id,
      companyId: user.company!._id,
      deletedAt: null,
    });
    if (!wo) throw new NotFoundException('Work Order not found');

    this._checkOwnership(wo, user);
    if (wo.status !== 'drafted') {
      throw new UnprocessableEntityException('Status tidak memenuhi syarat');
    }

    const submission = createSubmissionsDto;

    const formTemplate = await this.formsService.findTemplateById(
      submission.formId,
    );
    if (!formTemplate) {
      throw new NotFoundException(
        `Form template with ID ${submission.formId} not found`,
      );
    }

    validateFormSubmission(formTemplate.fields, submission.fieldsData);

    const fieldsData = submission.fieldsData.map((field) => {
      const templateField = formTemplate.fields.find(
        (f) => f.order === field.order,
      );
      if (!templateField) {
        throw new UnprocessableEntityException(
          `Field with order ${field.order} not found in form template`,
        );
      }
      return { order: templateField.order, value: field.value };
    });

    const newSubmission = new this.submissionModel({
      submissionType: SubmissionType.WorkOrder,
      ownerId: new Types.ObjectId(id),
      formId: new Types.ObjectId(submission.formId),
      submittedBy: new Types.ObjectId(user._id.toString()),
      fieldsData,
      status: FormSubmissionStatus.SUBMITTED,
      submittedAt: new Date(),
    });
    await newSubmission.save();

    return this.findOneInternal(id, user);
  }

  async remove(id: string, user: AuthenticatedUser): Promise<any> {
    if (!user.company?._id)
      throw new ForbiddenException('User company information is missing');

    const wo = await this.workOrderModel.findOne({
      _id: id,
      companyId: user.company._id,
      deletedAt: null,
    });
    if (!wo) throw new NotFoundException('Work Order not found');

    // Capture full WO detail before deletion
    const woDetail = await this._hydrateOne(wo);

    const deletedAt = new Date();
    wo.deletedAt = deletedAt;
    await wo.save();

    if (wo.serviceRequestId) {
      await this._checkAndUpdateSRStatus(wo.serviceRequestId.toString());
    }

    return { data: { ...woDetail.data, deletedAt }, meta: woDetail.meta };
  }

  async getReport(id: string, user: AuthenticatedUser): Promise<any> {
    const reportData = await this.workReportService.findByWorkOrderId(id, user);
    const woResult = await this.findOneInternal(id, user);
    return { report: reportData, meta: woResult.meta };
  }

  async submitReportForm(
    id: string,
    dto: any,
    user: AuthenticatedUser,
  ): Promise<any> {
    const reportData =
      await this.workReportService.submitReportFormByWorkOrderId(id, dto, user);
    const woResult = await this.findOneInternal(id, user);
    return { report: reportData, meta: woResult.meta };
  }

  private _checkOwnership(wo: any, user: AuthenticatedUser) {
    if (user.role === Role.CompanyOwner) return;

    const isCreator =
      wo.createdBy && wo.createdBy.toString() === user._id.toString();

    if (user.role === Role.CompanyManager) {
      const isSystemGenerated = !wo.createdBy;
      if (isSystemGenerated || isCreator) return;
      throw new ForbiddenException(
        'Manager hanya diizinkan untuk mengonfigurasi atau memodifikasi sebuah WO JIKA dibuat oleh sistem (null) ATAU manager tersebut adalah pembuatnya langsung.',
      );
    }

    if (!isCreator) {
      throw new ForbiddenException(
        'Hanya Pembuat Perintah Kerja yang dapat melakukan aksi ini',
      );
    }
  }

  private _checkOnlyStaffPic(wo: any, user: AuthenticatedUser) {
    if (user.role === Role.CompanyOwner) return;
    const isCreator =
      wo.createdBy && wo.createdBy.toString() === user._id.toString();
    if (isCreator) return;
    const isManagerWithRights =
      user.role === Role.CompanyManager && (!wo.createdBy || isCreator);
    if (isManagerWithRights) return;

    if (wo.workOrderApprovalAccessType === ApprovalAccessType.STAFF_PIC) {
      const isPIC =
        wo.staffPIC && wo.staffPIC.toString() === user._id.toString();
      if (!wo.staffPIC) {
        throw new ForbiddenException(
          'Staff PIC belum ditentukan untuk metode persetujuan Staff PIC',
        );
      }
      if (!isPIC) {
        throw new ForbiddenException(
          'Hanya Staff PIC yang dapat melakukan aksi ini',
        );
      }
      return;
    }

    if (wo.workOrderApprovalAccessType === ApprovalAccessType.STAFF_ANY) {
      const isAssigned =
        wo.assignedStaff &&
        wo.assignedStaff.some((s: any) => s.toString() === user._id.toString());
      if (!isAssigned) {
        throw new ForbiddenException(
          'Hanya Staf yang ditugaskan yang dapat melakukan aksi ini',
        );
      }
      return;
    }
  }

  private _checkApprovalRequiresManual(wo: any) {
    if (wo.workOrderApprovalAccessType === ApprovalAccessType.AUTO) {
      throw new ForbiddenException('Status auto tidak memenuhi syarat');
    }
  }

  private async _notifyAuthorizedManagers(
    wo: any,
    title: string,
    body: string,
    status: string,
  ) {
    const managers = await this.usersService.findAllByCompanyId(
      wo.companyId.toString(),
      [Role.CompanyOwner, Role.CompanyManager],
    );

    for (const manager of managers) {
      const m = manager;
      const isOwner = m.role === Role.CompanyOwner;
      const isCreator =
        wo.createdBy && wo.createdBy.toString() === m._id.toString();

      const woPosId =
        wo.positionId?._id?.toString() ?? wo.positionId?.toString();
      const mPosId =
        m.positionId?._id?.toString() ?? m.positionId?.toString() ?? null;
      const isMatchingDepartment = !!woPosId && woPosId === mPosId;

      const isAuthorizedManager =
        isOwner ||
        DepartmentAuthHelper.isGeneralManager(m) ||
        isMatchingDepartment;

      if (isAuthorizedManager || isCreator) {
        await this.fcmService.sendToUser(m._id.toString(), title, body, {
          resource: 'work_order',
          resourceId: wo._id.toString(),
          status,
        });
      }
    }
  }
}
