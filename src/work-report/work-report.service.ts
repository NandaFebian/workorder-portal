import { Injectable, NotFoundException } from '@nestjs/common';
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

@Injectable()
export class WorkReportService {
  constructor(
    @InjectModel(WorkReport.name)
    private workReportModel: Model<WorkReportDocument>,
    @InjectModel(FormSubmission.name)
    private formSubmissionModel: Model<FormSubmissionDocument>,
    private readonly formsService: FormsService,
  ) {}

  async create(createDto: CreateWorkReportDto): Promise<WorkReportDocument> {
    const newReport = new this.workReportModel({
      workOrderId: createDto.workOrderId,
      companyId: createDto.companyId,
      reportFormKey: createDto.reportFormKey ?? null,
      status: createDto.status ?? 'drafted',
    });
    return newReport.save();
  }

  async findOne(id: string): Promise<any> {
    if (!Types.ObjectId.isValid(id)) throw new NotFoundException('Invalid ID');
    const report = await this.workReportModel.findOne({ _id: id, deletedAt: null }).exec();
    if (!report) throw new NotFoundException('Work Report not found');
    return this._hydrateReport(report, null);
  }

  async findByWorkOrderId(workOrderId: string, user: AuthenticatedUser): Promise<any> {
    if (!Types.ObjectId.isValid(workOrderId)) throw new NotFoundException('Invalid Work Order ID');

    const report = await this.workReportModel
      .findOne({ workOrderId: new Types.ObjectId(workOrderId), deletedAt: null })
      .exec();

    if (!report) throw new NotFoundException('Work Report not found');
    return this._hydrateReport(report, user);
  }

  private async _hydrateReport(report: WorkReportDocument, user: AuthenticatedUser | null): Promise<any> {
    const base = WorkReportResource.transformWorkReport(report);

    // Hydrate the single report form
    let reportForm: any = null;
    if (report.reportFormKey) {
      try {
        const template = await this.formsService.findLatestTemplateByKey(report.reportFormKey);
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
      reportForm,
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
      .exec();

    if (!workReport) throw new NotFoundException('Work report not found for this work order');

    if (user.company?._id?.toString() !== workReport.companyId.toString()) {
      throw new NotFoundException('Unauthorized to submit this work report form');
    }

    const { submissions } = dto;

    if (submissions && Array.isArray(submissions)) {
      for (const item of submissions) {
        const { formId, fieldsData } = item;
        if (!Types.ObjectId.isValid(formId)) continue;

        // Validate that this form matches the report form
        const reportFormTemplate = workReport.reportFormKey
          ? await this.formsService.findLatestTemplateByKey(workReport.reportFormKey)
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
          status: 'submitted',
          submittedAt: new Date(),
        });
        await submission.save();
      }
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
      .exec();
    if (!workReport) throw new NotFoundException('Work report not found');
    if (user.company?._id?.toString() !== workReport.companyId.toString()) {
      throw new NotFoundException('Unauthorized to submit this work report form');
    }

    if (submissions && Array.isArray(submissions)) {
      for (const item of submissions) {
        const { formId, fieldsData } = item;
        if (!Types.ObjectId.isValid(formId)) continue;
        const formTemplate = await this.formsService.findLatestTemplateByKey(
          workReport.reportFormKey ?? '',
        );
        if (!formTemplate) throw new NotFoundException(`Form template not found`);
        validateFormSubmission(formTemplate.fields, fieldsData);
        const submission = new this.formSubmissionModel({
          submissionType: SubmissionType.Report,
          ownerId: workReport._id,
          formId: new Types.ObjectId(formId),
          submittedBy: user._id,
          fieldsData,
          status: 'submitted',
          submittedAt: new Date(),
        });
        await submission.save();
      }
    }

    return this.findOne((workReport._id as any).toString());
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
