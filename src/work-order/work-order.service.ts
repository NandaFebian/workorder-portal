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
  ) { }

  async createInternal(data: any): Promise<WorkOrderDocument> {
    const newWorkOrder = new this.workOrderModel({
      ...data,
      code: `WO-${generateCode()}`,
    });
    const saved = await newWorkOrder.save();

    await this.workReportService.create({
      workOrderId: (saved as any)._id.toString(),
      companyId: (saved as any).companyId.toString(),
      reportFormId: (saved as any).reportFormId ? (saved as any).reportFormId.toString() : null,
      status: 'drafted',
      workReportApprovalAccessType: (saved as any).workReportApprovalAccessType,
    } as any);

    return saved;
  }

  async create(createWorkOrderDto: any, user: AuthenticatedUser): Promise<any> {
    if (!user.company?._id) {
      throw new ForbiddenException('User company information is missing');
    }
    const newWorkOrder = new this.workOrderModel({
      ...createWorkOrderDto,
      code: `WO-${generateCode()}`,
      companyId: user.company._id,
      createdBy: user._id,
      status: 'drafted',
    });
    const saved = await newWorkOrder.save();

    await this.workReportService.create({
      workOrderId: (saved._id as any).toString(),
      companyId: (saved.companyId as any).toString(),
      reportFormId: saved.reportFormId ? (saved.reportFormId as any).toString() : null,
      status: 'drafted',
      workReportApprovalAccessType: saved.workReportApprovalAccessType,
    } as any);

    return this.findOneInternal((saved._id as any).toString(), user);
  }

  async update(id: string, updateWorkOrderDto: any, user: AuthenticatedUser): Promise<any> {
    if (!user.company?._id) {
      throw new ForbiddenException('User company information is missing');
    }
    const wo = await this.workOrderModel.findOne({
      _id: id,
      companyId: user.company._id,
      deletedAt: null,
    });
    if (!wo) throw new NotFoundException('Work Order not found');
    Object.assign(wo, updateWorkOrderDto);
    await wo.save();
    return this.findOneInternal(id, user);
  }


  async findAllInternal(user: AuthenticatedUser, filterDto: WorkOrderFilterDto): Promise<any[]> {
    if (!user.company?._id) {
      throw new ForbiddenException('User company information is missing');
    }

    const query: any = { companyId: user.company._id, deletedAt: null };

    if (user.role === 'staff_company') {
      if (filterDto.status && filterDto.status !== 'sent') {
        return [];
      }
      query.assignedStaff = user._id;
      query.status = { $in: ['sent', 'onprogress', 'completed', 'failed'] };
    } else {
      if (filterDto.status) query.status = filterDto.status;
      if (filterDto.assignedStaffId) {
        query.assignedStaff = new Types.ObjectId(filterDto.assignedStaffId);
      }
    }

    if (filterDto.startDate && filterDto.endDate) {
      query.createdAt = {
        $gte: new Date(filterDto.startDate),
        $lte: new Date(filterDto.endDate),
      };
    }

    const workOrders = await this.workOrderModel
      .find(query)
      .populate('createdBy', 'name email role')
      .populate('approvedBy', 'name email role')
      .populate('staffPIC', 'name email role')
      .populate('assignedStaff', 'name email role')
      .populate('serviceId', 'companyId title description accessType isActive')
      .populate('positionId', '-__v')
      .sort({ createdAt: -1 })
      .exec();

    return Promise.all(workOrders.map((doc) => this._hydrateOne(doc, false)));
  }

  async findAllAssigned(user: AuthenticatedUser): Promise<any[]> {
    const workOrders = await this.workOrderModel
      .find({ assignedStaff: user._id, status: 'sent', deletedAt: null })
      .populate('serviceId', 'title description')
      .populate('positionId', '-__v')
      .sort({ createdAt: -1 })
      .exec();

    return Promise.all(workOrders.map((doc) => this._hydrateOne(doc)));
  }

  async findOneInternal(id: string, user: AuthenticatedUser): Promise<any> {
    if (!Types.ObjectId.isValid(id)) throw new BadRequestException('Invalid Work Order ID');

    const wo = await this.workOrderModel
      .findOne({ _id: id, companyId: user.company!._id, deletedAt: null })
      .populate('createdBy', 'name email role')
      .populate('approvedBy', 'name email role')
      .populate('staffPIC', 'name email role')
      .populate('assignedStaff', 'name email role')
      .populate('serviceId', 'companyId title description accessType isActive')
      .populate('positionId', '-__v')
      .exec();

    if (!wo) throw new NotFoundException('Work Order not found');
    return this._hydrateOne(wo);
  }

  async findOneAssigned(id: string, user: AuthenticatedUser): Promise<any> {
    if (!Types.ObjectId.isValid(id)) throw new BadRequestException('Invalid Work Order ID');

    const wo = await this.workOrderModel
      .findOne({ _id: id, assignedStaff: user._id, deletedAt: null })
      .populate('serviceId', 'title description')
      .populate('positionId', '-__v')
      .exec();

    if (!wo) throw new NotFoundException('Work Order not found');
    return this._hydrateOne(wo);
  }

  private async _hydrateOne(wo: any, includeMeta: boolean = true): Promise<any> {
    // Hydrate the single work order form from its key
    let workOrderForm: any = null;
    if (wo.workOrderFormId) {
      try {
        const template = await this.formsService.findTemplateById(wo.workOrderFormId.toString());
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
      .exec();

    let meta: any = {
      workOrderCapabilities: {
        can_start: false,
        can_complete: false,
        can_fail: false,
        can_recreate: false,
      },
      workOrderSiblings: [],
    };

    let siblingsQuery: any = null;
    if (wo.batchId) {
      siblingsQuery = { batchId: wo.batchId };
    } else if (wo.serviceRequestId) {
      siblingsQuery = { serviceRequestId: wo.serviceRequestId };
    }

    if (siblingsQuery) {
      const siblings = await this.workOrderModel.find(
        { ...siblingsQuery, deletedAt: null },
        { _id: 1, code: 1, status: 1, positionId: 1 }
      ).populate('positionId', 'name').exec();

      meta.workOrderSiblings = siblings.map((s: any) => ({
        _id: s._id,
        code: s.code,
        status: s.status,
        position: s.positionId ? { _id: s.positionId._id, name: s.positionId.name } : null
      }));

      // can_start ONLY if ALL siblings are approved
      const allApproved = siblings.length > 0 && siblings.every(s => s.status === 'approved' || s.status === 'onprogress' || s.status === 'completed');
      meta.workOrderCapabilities.can_start = allApproved;
    }

    if (wo.configId) {
      const history = await this.workOrderModel.find({ configId: wo.configId, deletedAt: null }).exec();
      if (history.length > 0) {
        meta.workOrderCapabilities.can_recreate = history.every(h => h.status === 'rejected');
      }
    }

    try {
      const report = await this.workReportService.findOneQuietlyByWorkOrderId((wo._id as any).toString());
      if (report && report.status === 'approved') {
        meta.workOrderCapabilities.can_complete = true;
        meta.workOrderCapabilities.can_fail = true;
      }
    } catch {
      // ignore
    }

    const transformed = WorkOrderResource.transformWorkOrderDetail(wo, workOrderForm, submissions);
    if (!includeMeta) return transformed;

    return { data: transformed, meta };
  }

  async updateStatus(id: string, updateStatusDto: any, user: AuthenticatedUser): Promise<any> {
    if (!user.company?._id) throw new ForbiddenException('User company information is missing');

    const wo = await this.workOrderModel.findOne({
      _id: id,
      companyId: user.company._id,
      deletedAt: null,
    });
    if (!wo) throw new NotFoundException('Work Order not found');

    const now = new Date();
    wo.status = updateStatusDto.status;

    switch (updateStatusDto.status) {
      case 'drafted':
        if (!wo.draftedAt) wo.draftedAt = now;
        break;
      case 'sent':
        if (!wo.sentAt) wo.sentAt = now;
        break;
      case 'approved':
        if (!wo.approvedAt) wo.approvedAt = now;
        break;
      case 'rejected':
        if (!wo.rejectedAt) wo.rejectedAt = now;
        break;
      case 'onprogress':
        if (!wo.startedAt) wo.startedAt = now;
        break;
      case 'completed':
        if (!wo.completedAt) wo.completedAt = now;
        break;
      case 'failed':
        if (!wo.failedAt) wo.failedAt = now;
        break;
      case 'cancelled':
        if (!wo.cancelledAt) wo.cancelledAt = now;
        break;
    }

    await wo.save();
    return this.findOneInternal(id, user);
  }

  async assignStaff(id: string, assignStaffDto: AssignStaffDto, user: AuthenticatedUser): Promise<any> {
    if (!user.company?._id) throw new ForbiddenException('User company information is missing');

    const wo = await this.workOrderModel.findOne({
      _id: id,
      companyId: user.company._id,
      deletedAt: null,
    });
    if (!wo) throw new NotFoundException('Work Order not found');

    const errors: string[] = [];

    if (assignStaffDto.staff_pic) {
      const picUser = await (this as any).usersService.findOneByEmail(assignStaffDto.staff_pic);
      if (!picUser) {
        errors.push(`PIC Staff with email ${assignStaffDto.staff_pic} not found`);
      } else if (picUser.companyId && picUser.companyId.toString() !== user.company._id.toString()) {
        errors.push(`PIC Staff with email ${assignStaffDto.staff_pic} does not belong to your company`);
      } else {
        wo.staffPIC = picUser._id as any;
      }
    }

    if (assignStaffDto.assign_staffs && Array.isArray(assignStaffDto.assign_staffs)) {
      const staffIds: Types.ObjectId[] = [];
      for (const email of assignStaffDto.assign_staffs) {
        const staff = await (this as any).usersService.findOneByEmail(email);
        if (!staff) {
          errors.push(`Staff with email ${email} not found`);
          continue;
        }
        if (staff.companyId && staff.companyId.toString() !== user.company._id.toString()) {
          errors.push(`Staff with email ${email} does not belong to your company`);
          continue;
        }
        staffIds.push(staff._id as Types.ObjectId);
      }
      wo.assignedStaff = staffIds as any;
    }

    if (errors.length > 0) throw new UnprocessableEntityException(errors.join(', '));

    await wo.save();
    return this.findOneInternal(id, user);
  }

  async markAsSent(id: string, user: AuthenticatedUser): Promise<any> {
    if (!user.company?._id) throw new ForbiddenException('User company information is missing');

    const wo = await this.workOrderModel.findOne({ _id: id, companyId: user.company._id, deletedAt: null });
    if (!wo) throw new NotFoundException('Work Order not found');

    // Requirement: User must be creator OR Owner
    const isOwner = user.role === 'owner_company';
    const isCreator = wo.createdBy && wo.createdBy.toString() === user._id.toString();
    if (!isOwner && !isCreator) {
      throw new ForbiddenException('Hanya Pembuat Perintah Kerja atau Owner yang dapat mengirim Perintah Kerja');
    }

    if (wo.status !== 'drafted') {
      throw new UnprocessableEntityException('Status tidak memenuhi syarat');
    }

    // Validation: Minimum Staff
    if (wo.assignedStaff.length < wo.minStaff) {
      throw new BadRequestException(`Jumlah staf minimal belum terpenuhi (${wo.assignedStaff.length}/${wo.minStaff})`);
    }

    // Verify all submissions are present for the work order form
    if (wo.workOrderFormId) {
      const template = await this.formsService.findTemplateById(wo.workOrderFormId.toString());
      if (template) {
        const submission = await this.submissionModel.findOne({
          ownerId: wo._id,
          formId: template._id,
          submissionType: SubmissionType.WorkOrder,
        });
        if (!submission) {
          throw new UnprocessableEntityException('Work order form must be submitted before marking as sent');
        }
      }
    }

    const now = new Date();
    if (wo.workOrderApprovalAccessType === 'auto') {
      wo.status = 'approved';
      wo.approvedAt = now;
      // Note: No sentAt if auto
      await wo.save();
      return this.findOneInternal(id, user);
    } else {
      wo.status = 'sent';
      if (!wo.sentAt) wo.sentAt = now;
      await wo.save();
      return this.findOneInternal(id, user);
    }
  }

  async approve(id: string, user: AuthenticatedUser): Promise<any> {
    const wo = await this.workOrderModel.findOne({ _id: id, deletedAt: null });
    if (!wo) throw new NotFoundException('Work Order not found');

    if (wo.status !== 'sent') {
      throw new UnprocessableEntityException('Status tidak memenuhi syarat');
    }

    this._checkApprovalRequiresManual(wo);
    this._checkOnlyStaffPic(wo, user);

    wo.status = 'approved';
    wo.approvedBy = user._id as any;
    if (!wo.approvedAt) wo.approvedAt = new Date();
    await wo.save();
    return this.findOneInternal(id, user);
  }

  async reject(id: string, user: AuthenticatedUser): Promise<any> {
    const wo = await this.workOrderModel.findOne({ _id: id, deletedAt: null });
    if (!wo) throw new NotFoundException('Work Order not found');

    if (wo.status !== 'sent') {
      throw new UnprocessableEntityException('Status tidak memenuhi syarat');
    }

    this._checkApprovalRequiresManual(wo);
    this._checkOnlyStaffPic(wo, user);

    wo.status = 'rejected';
    if (!wo.rejectedAt) wo.rejectedAt = new Date();
    await wo.save();
    return this.findOneInternal(id, user);
  }

  async recreate(id: string, user: AuthenticatedUser): Promise<any> {
    const wo = await this.workOrderModel.findOne({ _id: id, deletedAt: null });
    if (!wo) throw new NotFoundException('Work Order not found');

    this._checkOwnership(wo, user);
    if (wo.status !== 'rejected') throw new UnprocessableEntityException('Status tidak memenuhi syarat');

    const newWo = new this.workOrderModel({
      code: `WO-${generateCode()}`,
      serviceRequestId: wo.serviceRequestId,
      createdBy: user._id,
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
      status: 'drafted',
      draftedAt: new Date(),
    });
    const saved = await newWo.save();

    await this.workReportService.create({
      workOrderId: (saved._id as any).toString(),
      companyId: (saved.companyId as any).toString(),
      reportFormId: saved.reportFormId ? (saved.reportFormId as any).toString() : null,
      status: 'drafted',
      workReportApprovalAccessType: saved.workReportApprovalAccessType,
    } as any);
    return this.findOneInternal((saved._id as any).toString(), user);
  }

  async cancel(id: string, user: AuthenticatedUser): Promise<any> {
    const wo = await this.workOrderModel.findOne({ _id: id, deletedAt: null });
    if (!wo) throw new NotFoundException('Work Order not found');

    this._checkOwnership(wo, user);
    const allowedCancelStatuses = ['drafted', 'approved', 'sent', 'rejected'];
    if (!allowedCancelStatuses.includes(wo.status)) {
      throw new UnprocessableEntityException('Status tidak memenuhi syarat');
    }

    wo.status = 'cancelled';
    wo.cancelledAt = new Date();
    await wo.save();

    // Cancel all siblings
    if (wo.serviceRequestId) {
      await this.workOrderModel.updateMany(
        { serviceRequestId: wo.serviceRequestId, _id: { $ne: wo._id }, deletedAt: null },
        { $set: { status: 'cancelled', cancelledAt: new Date() } }
      );

      const srId = wo.serviceRequestId.toString();
      await this.serviceRequestService.updateSRStatusSystemically(srId, 'unprocessable');
    }

    return this.findOneInternal(id, user);
  }

  async start(id: string, user: AuthenticatedUser): Promise<any> {
    const wo = await this.workOrderModel.findOne({ _id: id, deletedAt: null });
    if (!wo) throw new NotFoundException('Work Order not found');

    if (wo.status !== 'approved') throw new UnprocessableEntityException('Status tidak memenuhi syarat');

    this._checkOnlyStaffPic(wo, user);

    if (wo.serviceRequestId) {
      const siblings = await this.workOrderModel.find({ serviceRequestId: wo.serviceRequestId, deletedAt: null });
      const allApproved = siblings.length > 0 && siblings.every(s => s.status === 'approved' || s.status === 'onprogress' || s.status === 'completed');
      if (!allApproved) {
        throw new UnprocessableEntityException('All sibling WOs must be approved before any can start');
      }
    }

    wo.status = 'onprogress';
    wo.startedAt = new Date();
    await wo.save();

    const report = await this.workReportService.findOneQuietlyByWorkOrderId((wo as any)._id.toString());
    if (report && report.status === 'drafted') {
      await this.workReportService.update((report as any)._id.toString(), { status: 'onProgress', startedAt: new Date() } as any);
    }

    if (wo.serviceRequestId) {
      await this.serviceRequestService.updateSRStatusSystemically(wo.serviceRequestId.toString(), 'onprogress');
    }

    return this.findOneInternal(id, user);
  }

  async complete(id: string, issue: string | null, user: AuthenticatedUser): Promise<any> {
    const wo = await this.workOrderModel.findOne({ _id: id, deletedAt: null });
    if (!wo) throw new NotFoundException('Work Order not found');

    this._checkOwnership(wo, user);
    if (wo.status !== 'onprogress') throw new UnprocessableEntityException('Status tidak memenuhi syarat');

    const report = await this.workReportService.findOneQuietlyByWorkOrderId(id);
    if (!report || report.status !== 'approved') {
      throw new UnprocessableEntityException('Work report must be approved before completing WO');
    }

    wo.status = 'completed';
    wo.completedAt = new Date();
    if (issue) {
      wo.has_issue = true;
      wo.issue_note = issue;
    }
    await wo.save();

    if (wo.serviceRequestId) {
      await this._checkAndUpdateSRStatus(wo.serviceRequestId.toString());
    }

    return this.findOneInternal(id, user);
  }

  async fail(id: string, issue: string, user: AuthenticatedUser): Promise<any> {
    const wo = await this.workOrderModel.findOne({ _id: id, deletedAt: null });
    if (!wo) throw new NotFoundException('Work Order not found');

    this._checkOwnership(wo, user);
    if (wo.status !== 'onprogress') throw new UnprocessableEntityException('Status tidak memenuhi syarat');

    const report = await this.workReportService.findOneQuietlyByWorkOrderId(id);
    if (!report || report.status !== 'approved') {
      throw new UnprocessableEntityException('Work report must be approved before failing WO');
    }

    if (!issue) {
      throw new UnprocessableEntityException('Issue note is required when failing WO');
    }

    wo.status = 'failed';
    wo.failedAt = new Date();
    wo.has_issue = true;
    wo.issue_note = issue;
    await wo.save();

    if (wo.serviceRequestId) {
      await this._checkAndUpdateSRStatus(wo.serviceRequestId.toString());
    }

    return this.findOneInternal(id, user);
  }

  private async _checkAndUpdateSRStatus(srId: string) {
    const siblings = await this.workOrderModel.find({ serviceRequestId: new Types.ObjectId(srId), deletedAt: null });
    if (!siblings.length) return;

    let allTerminated = true; // All are either completed or failed
    let allCompleted = true;
    let allFailed = true;

    for (const sib of siblings) {
      if (sib.status !== 'completed' && sib.status !== 'failed') {
        allTerminated = false;
      }
      if (sib.status !== 'completed') {
        allCompleted = false;
      }
      if (sib.status !== 'failed') {
        allFailed = false;
      }
    }

    let srStatus = 'onprogress';
    if (allTerminated) {
      if (allCompleted) {
        srStatus = 'completed';
      } else if (allFailed) {
        srStatus = 'unprocessable'; // As requested: unprocessable if all WOs failed
      } else {
        srStatus = 'partial_completed';
      }
    }

    if (srStatus !== 'onprogress') {
      await this.serviceRequestService.updateSRStatusSystemically(srId, srStatus);
    }
  }

  async createSubmissions(id: string, createSubmissionsDto: CreateSubmissionsDto, user: AuthenticatedUser): Promise<any> {
    if (!Types.ObjectId.isValid(id)) throw new BadRequestException('Invalid Work Order ID');

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

    const formTemplate = await this.formsService.findTemplateById(submission.formId);
    if (!formTemplate) {
      throw new NotFoundException(`Form template with ID ${submission.formId} not found`);
    }

    validateFormSubmission(formTemplate.fields, submission.fieldsData);

    const fieldsData = submission.fieldsData.map((field) => {
      const templateField = formTemplate.fields.find((f) => f.order === field.order);
      if (!templateField) {
        throw new UnprocessableEntityException(`Field with order ${field.order} not found in form template`);
      }
      return { order: templateField.order, value: field.value };
    });

    const newSubmission = new this.submissionModel({
      submissionType: SubmissionType.WorkOrder,
      ownerId: new Types.ObjectId(id),
      formId: new Types.ObjectId(submission.formId),
      submittedBy: new Types.ObjectId(user._id.toString()),
      fieldsData,
      status: 'submitted',
      submittedAt: new Date(),
    });
    await newSubmission.save();

    return this.findOneInternal(id, user);
  }

  async remove(id: string, user: AuthenticatedUser): Promise<any> {
    if (!user.company?._id) throw new ForbiddenException('User company information is missing');

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
    return { data: { ...woDetail.data, deletedAt }, meta: woDetail.meta };
  }

  async getReport(id: string, user: AuthenticatedUser): Promise<any> {
    const reportData = await this.workReportService.findByWorkOrderId(id, user);
    const woResult = await this.findOneInternal(id, user);
    return { report: reportData, meta: woResult.meta };
  }

  async submitReportForm(id: string, dto: any, user: AuthenticatedUser): Promise<any> {
    const reportData = await this.workReportService.submitReportFormByWorkOrderId(id, dto, user);
    const woResult = await this.findOneInternal(id, user);
    return { report: reportData, meta: woResult.meta };
  }

  private _checkOwnership(wo: any, user: AuthenticatedUser) {
    if (user.role === 'owner_company') return;

    const isCreator = wo.createdBy && wo.createdBy.toString() === user._id.toString();

    if (user.role === 'manager_company') {
      const isSystemGenerated = !wo.createdBy;
      if (isSystemGenerated || isCreator) return;
      throw new ForbiddenException('Manager hanya diizinkan untuk mengonfigurasi atau memodifikasi sebuah WO JIKA dibuat oleh sistem (null) ATAU manager tersebut adalah pembuatnya langsung.');
    }

    if (!isCreator) {
      throw new ForbiddenException('Hanya Pembuat Perintah Kerja yang dapat melakukan aksi ini');
    }
  }

  private _checkOnlyStaffPic(wo: any, user: AuthenticatedUser) {
    if (wo.workOrderApprovalAccessType !== 'staff_pic') {
      return;
    }
    const isPIC = wo.staffPIC && wo.staffPIC.toString() === user._id.toString();
    if (!wo.staffPIC) {
      throw new ForbiddenException('Staff PIC belum ditentukan');
    }
    if (!isPIC) {
      throw new ForbiddenException('Hanya Staff PIC yang dapat melakukan aksi ini');
    }
  }

  private _checkApprovalRequiresManual(wo: any) {
    if (wo.workOrderApprovalAccessType === 'auto') {
      throw new ForbiddenException('Status auto tidak memenuhi syarat');
    }
  }
}
