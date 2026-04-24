import { Injectable, NotFoundException, BadRequestException, ForbiddenException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { WorkReport, WorkReportDocument } from './schemas/work-report.schema';
import { CreateWorkReportDto } from './dto/create-work-report.dto';
import { WorkReportResource } from './resources/work-report.resource';
import {
  FormSubmission,
  FormSubmissionDocument,
} from '../form/schemas/form-submissions.schema';
import { AuthenticatedUser } from 'src/auth/interfaces/authenticated-user.interface';
import { FormsService } from 'src/form/form.service';
import { SubmissionType } from '../common/enums/submission-type.enum';
import { validateFormSubmission } from 'src/form/helpers/form-validation.helper';
import { FcmService } from 'src/fcm/fcm.service';
import { FormSubmissionStatus } from 'src/common/enums/form-submission-status.enum';
import { Role } from 'src/common/enums/role.enum';
import { WorkReportStatus } from 'src/common/enums/work-report-status.enum';
import { ApprovalAccessType } from 'src/common/enums/approval-access-type.enum';

@Injectable()
export class WorkReportService {
  constructor(
    @InjectModel(WorkReport.name)
    private workReportModel: Model<WorkReportDocument>,
    @InjectModel(FormSubmission.name)
    private readonly formSubmissionModel: Model<FormSubmissionDocument>,
    private readonly formsService: FormsService,
    private readonly fcmService: FcmService,
  ) {}

  async create(createDto: CreateWorkReportDto): Promise<WorkReportDocument> {
    const newReport = new this.workReportModel({
      workOrderId: createDto.workOrderId,
      companyId: createDto.companyId,
      reportFormId: createDto.reportFormId ?? null,
      status: createDto.status ?? WorkReportStatus.DRAFTED,
      workReportApprovalAccessType: createDto.workReportApprovalAccessType ?? ApprovalAccessType.AUTO,
    });
    return newReport.save();
  }

  async findOne(id: string): Promise<any> {
    if (!Types.ObjectId.isValid(id)) throw new NotFoundException('Invalid ID');
    const report = await this.workReportModel
      .findOne({ _id: id, deletedAt: null })
      .populate('approvedBy', 'name email role')
      .exec();
    if (!report) throw new NotFoundException('Work Report not found');
    return this._hydrateReport(report, null);
  }

  async findOneQuietlyByWorkOrderId(workOrderId: string): Promise<WorkReportDocument | null> {
    if (!Types.ObjectId.isValid(workOrderId)) return null;
    return this.workReportModel.findOne({ workOrderId: new Types.ObjectId(workOrderId), deletedAt: null }).exec();
  }

  async findByWorkOrderId(workOrderId: string, user: AuthenticatedUser): Promise<any> {
    if (!Types.ObjectId.isValid(workOrderId)) throw new NotFoundException('Invalid Work Order ID');

    const report = await this.workReportModel
      .findOne({ workOrderId: new Types.ObjectId(workOrderId), deletedAt: null })
      .populate('workOrderId')
      .populate('approvedBy', 'name email role')
      .exec();

    if (!report) throw new NotFoundException('Work Report not found');

    const wo = report.workOrderId as any;
    if (wo && typeof wo === 'object' && wo._id) {
      const isPIC = wo.staffPIC && wo.staffPIC.toString() === user._id.toString();
      const isAssigned = wo.assignedStaff && wo.assignedStaff.some((s: any) => s.toString() === user._id.toString());
      if (!isPIC && !isAssigned && user.role !== Role.CompanyOwner && user.role !== Role.CompanyManager) {
         throw new ForbiddenException('Only assigned staff, PIC, or manager can access this report.');
      }
      report.workOrderId = wo._id;
    }

    return this._hydrateReport(report, user);
  }

  private async _hydrateReport(report: WorkReportDocument, user: AuthenticatedUser | null): Promise<any> {
    const base = WorkReportResource.transformWorkReport(report);

    // Hydrate the single report form
    let reportForm: any = null;
    if (report.reportFormId) {
      try {
        const template = await this.formsService.findTemplateById(report.reportFormId.toString());
        if (template) {
          const t = template.toObject ? template.toObject() : template;
          reportForm = {
            _id: t._id,
            title: t.title,
            description: t.description,
            formType: t.formType,
            fields: t.fields,
          };
        }
      } catch {
        // template not found
      }
    }

    const submissions = await this.formSubmissionModel
      .find({ ownerId: report._id, submissionType: SubmissionType.Report })
      .exec();

    return {
      ...base,
      reportFormDetail: reportForm,
      submissions,
    };
  }

  async submitReportFormByWorkOrderId(
    workOrderId: string,
    dto: any,
    user: AuthenticatedUser,
  ): Promise<any> {
    if (!Types.ObjectId.isValid(workOrderId)) {
      throw new NotFoundException('Invalid work order ID');
    }

    const workReport = await this.workReportModel
      .findOne({ workOrderId: new Types.ObjectId(workOrderId), deletedAt: null })
      .populate('workOrderId')
      .exec();

    if (!workReport) throw new NotFoundException('Work report not found for this work order');

    if (user.company?._id?.toString() !== workReport.companyId.toString()) {
      throw new ForbiddenException('Unauthorized to submit this work report form');
    }

    const wo = workReport.workOrderId as any;
    if (wo && typeof wo === 'object' && wo._id) {
      const isPIC = wo.staffPIC && wo.staffPIC.toString() === user._id.toString();
      const isAssigned = wo.assignedStaff && wo.assignedStaff.some((s: any) => s.toString() === user._id.toString());
      if (!isPIC && !isAssigned && user.role !== Role.CompanyOwner && user.role !== Role.CompanyManager) {
         throw new ForbiddenException('Only assigned staff, PIC, or manager can submit this report.');
      }
      workReport.workOrderId = wo._id;
    }

    const { formId, fieldsData } = dto;
    if (formId && Types.ObjectId.isValid(formId)) {
      // Validate that this form matches the report form
      const reportFormTemplate = workReport.reportFormId
        ? await this.formsService.findTemplateById(workReport.reportFormId.toString())
        : null;

      if (!reportFormTemplate || (reportFormTemplate._id as any).toString() !== formId) {
        throw new NotFoundException(`Form ${formId} is not the report form for this work report`);
      }

      validateFormSubmission(reportFormTemplate.fields, fieldsData);

      const submission = new this.formSubmissionModel({
        submissionType: SubmissionType.Report,
        ownerId: workReport._id,
        formId: new Types.ObjectId(formId),
        submittedBy: user._id,
        fieldsData,
        status: FormSubmissionStatus.SUBMITTED,
        submittedAt: new Date(),
      });
      await submission.save();

      workReport.submittedAt = new Date();
      await workReport.save();
    }

    return this.findByWorkOrderId(workOrderId, user);
  }

  async update(id: string, updateDto: any): Promise<WorkReportDocument> {
    if (!Types.ObjectId.isValid(id)) throw new NotFoundException('Invalid ID');
    const updatedReport = await this.workReportModel
      .findByIdAndUpdate(id, updateDto, { new: true })
      .exec();
    if (!updatedReport) throw new NotFoundException('Work Report not found');
    return updatedReport;
  }

  async submitReportForm(dto: any, user: any): Promise<any> {
    const { workReportId, submissions } = dto;
    if (!Types.ObjectId.isValid(workReportId)) {
      throw new NotFoundException('Invalid work report ID');
    }
    const workReport = await this.workReportModel
      .findOne({ _id: workReportId, deletedAt: null })
      .populate('workOrderId')
      .exec();
    if (!workReport) throw new NotFoundException('Work report not found');
    if (user.company?._id?.toString() !== workReport.companyId.toString()) {
      throw new ForbiddenException('Unauthorized to submit this work report form');
    }

    const wo = workReport.workOrderId as any;
    if (wo && typeof wo === 'object' && wo._id) {
      const isPIC = wo.staffPIC && wo.staffPIC.toString() === user._id.toString();
      const isAssigned = wo.assignedStaff && wo.assignedStaff.some((s: any) => s.toString() === user._id.toString());
      if (!isPIC && !isAssigned && user.role !== Role.CompanyOwner && user.role !== Role.CompanyManager) {
         throw new ForbiddenException('Only assigned staff, PIC, or manager can submit this report.');
      }
      workReport.workOrderId = wo._id;
    }

    const { formId, fieldsData } = dto;

    if (formId && Types.ObjectId.isValid(formId)) {
      const formTemplate = await this.formsService.findTemplateById(
        workReport.reportFormId?.toString() ?? '',
      );
      if (!formTemplate) throw new NotFoundException(`Form template not found`);
      validateFormSubmission(formTemplate.fields, fieldsData);
      const submission = new this.formSubmissionModel({
        submissionType: SubmissionType.Report,
        ownerId: workReport._id,
        formId: new Types.ObjectId(formId),
        submittedBy: user._id,
        fieldsData,
        status: FormSubmissionStatus.SUBMITTED,
        submittedAt: new Date(),
      });
      await submission.save();

      workReport.submittedAt = new Date();
      await workReport.save();
    }

    return this.findOne((workReport._id as any).toString());
  }

  async markAsSent(id: string, user: AuthenticatedUser): Promise<any> {
    if (!Types.ObjectId.isValid(id)) throw new NotFoundException('Invalid ID');
    const report = await this.workReportModel.findOne({ _id: id, deletedAt: null }).populate('workOrderId').exec();
    if (!report) throw new NotFoundException('Work Report not found');

    if (report.status !== WorkReportStatus.ON_PROGRESS && report.status !== WorkReportStatus.DRAFTED && report.status !== WorkReportStatus.REJECTED) {
      throw new BadRequestException('Only on_progress, drafted, or rejected report can be sent');
    }

    const wo = report.workOrderId as any;
    if (wo && typeof wo === 'object' && wo._id) {
      const isPIC = wo.staffPIC && wo.staffPIC.toString() === user._id.toString();
      const isAssigned = wo.assignedStaff && wo.assignedStaff.some((s: any) => s.toString() === user._id.toString());
      if (!isPIC && !isAssigned && user.role !== Role.CompanyOwner && user.role !== Role.CompanyManager) {
         throw new ForbiddenException('Only assigned staff, PIC, or manager can send this report.');
      }
      report.workOrderId = wo._id;
    }

    report.submittedAt = new Date();
    if (report.workReportApprovalAccessType === ApprovalAccessType.AUTO) {
      report.status = WorkReportStatus.APPROVED;
      report.approvedAt = new Date();
      report.approvedBy = user._id as any;
    } else {
      report.status = WorkReportStatus.SUBMITTED;
    }
    
    await report.save();
    return this.findOne(id);
  }

  async approve(id: string, user: AuthenticatedUser): Promise<any> {
    if (!Types.ObjectId.isValid(id)) throw new NotFoundException('Invalid ID');
    const report = await this.workReportModel.findOne({ _id: id, deletedAt: null }).exec();
    if (!report) throw new NotFoundException('Work Report not found');

    if (report.status !== WorkReportStatus.SUBMITTED) {
      throw new BadRequestException('Work Report status harus SUBMITTED sebelum dapat di-approve');
    }

    if (report.workReportApprovalAccessType === ApprovalAccessType.AUTO) {
      throw new BadRequestException('Report is set to auto approve, manual action not allowed');
    }
    if (user.role !== Role.CompanyOwner && user.role !== Role.CompanyManager) {
      throw new ForbiddenException('Only managers can approve this work report');
    }

    report.status = WorkReportStatus.APPROVED;
    report.approvedAt = new Date();
    report.approvedBy = user._id as any;
    await report.save();

    // Identify who to notify (PIC of the WO)
    const reportFull = await this.workReportModel.findById(id).populate('workOrderId').exec();
    const wo = reportFull?.workOrderId as any;
    if (wo && (wo.staffPIC || (wo.assignedStaff && wo.assignedStaff.length > 0))) {
      const targets = wo.staffPIC ? [wo.staffPIC.toString()] : wo.assignedStaff.map((s: any) => s.toString());
      for (const userId of targets) {
        await this.fcmService.sendToUser(
          userId,
          'Laporan Penugasan Disetujui',
          `Laporan penugasan lapangan Anda untuk Work Order (${wo.code}) telah disetujui.`,
          { resource: 'work_order', resourceId: wo._id.toString(), status: WorkReportStatus.APPROVED }
        );
      }
    }

    return this.findOne(id);
  }

  async reject(id: string, user: AuthenticatedUser): Promise<any> {
    if (!Types.ObjectId.isValid(id)) throw new NotFoundException('Invalid ID');
    const report = await this.workReportModel.findOne({ _id: id, deletedAt: null }).exec();
    if (!report) throw new NotFoundException('Work Report not found');

    if (report.status !== WorkReportStatus.SUBMITTED) {
      throw new BadRequestException('Only submitted report can be rejected');
    }

    if (report.workReportApprovalAccessType === ApprovalAccessType.AUTO) {
      throw new BadRequestException('Report is set to auto approve, manual action not allowed');
    }
    if (user.role !== Role.CompanyOwner && user.role !== Role.CompanyManager) {
      throw new ForbiddenException('Only managers can reject this work report');
    }

    report.status = WorkReportStatus.REJECTED;
    report.rejectedAt = new Date();
    await report.save();

    // Identify who to notify (PIC of the WO)
    const reportFull = await this.workReportModel.findById(id).populate('workOrderId').exec();
    const wo = reportFull?.workOrderId as any;
    if (wo && (wo.staffPIC || (wo.assignedStaff && wo.assignedStaff.length > 0))) {
      const targets = wo.staffPIC ? [wo.staffPIC.toString()] : wo.assignedStaff.map((s: any) => s.toString());
      for (const userId of targets) {
        await this.fcmService.sendToUser(
          userId,
          'Laporan Penugasan Ditolak',
          `Laporan penugasan lapangan Anda untuk Work Order (${wo.code}) telah ditolak. Harap periksa kembali.`,
          { resource: 'work_order', resourceId: wo._id.toString(), status: WorkReportStatus.REJECTED }
        );
      }
    }

    return this.findOne(id);
  }

  async remove(id: string, user: AuthenticatedUser): Promise<any> {
    if (!Types.ObjectId.isValid(id)) throw new NotFoundException('Invalid ID');
    const report = await this.workReportModel.findOne({ _id: id, deletedAt: null }).exec();
    if (!report) throw new NotFoundException('Work Report not found');

    if (!user?.company?._id || user.company._id.toString() !== report.companyId.toString()) {
      throw new NotFoundException('Work Report not found');
    }

    // Capture full detail before deletion
    const reportDetail = await this._hydrateReport(report, user);

    const deletedAt = new Date();
    report.deletedAt = deletedAt;
    await report.save();
    return { ...reportDetail, deletedAt };
  }
}
