import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ForbiddenException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { WorkOrder, WorkOrderDocument } from './schemas/work-order.schema';
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
  ) {}

  async createInternal(data: any): Promise<WorkOrderDocument> {
    const newWorkOrder = new this.workOrderModel(data);
    return newWorkOrder.save();
  }

  async create(createWorkOrderDto: any, user: AuthenticatedUser): Promise<any> {
    if (!user.company?._id) {
      throw new BadRequestException('User company information is missing');
    }
    const newWorkOrder = new this.workOrderModel({
      ...createWorkOrderDto,
      companyId: user.company._id,
      createdBy: user._id,
      status: 'drafted',
    });
    const saved = await newWorkOrder.save();
    return this.findOneInternal((saved._id as any).toString(), user);
  }

  async update(id: string, updateWorkOrderDto: any, user: AuthenticatedUser): Promise<any> {
    if (!user.company?._id) {
      throw new BadRequestException('User company information is missing');
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
      throw new BadRequestException('User company information is missing');
    }

    const query: any = { companyId: user.company._id, deletedAt: null };

    if (filterDto.status) query.status = filterDto.status;
    if (filterDto.assignedStaffId) {
      query.assignedStaff = new Types.ObjectId(filterDto.assignedStaffId);
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
      .sort({ createdAt: -1 })
      .exec();

    return Promise.all(workOrders.map((doc) => this._hydrateOne(doc)));
  }

  async findAllAssigned(user: AuthenticatedUser): Promise<any[]> {
    const workOrders = await this.workOrderModel
      .find({ assignedStaff: user._id, deletedAt: null })
      .populate('serviceId', 'title description')
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
      .exec();

    if (!wo) throw new NotFoundException('Work Order not found');
    return this._hydrateOne(wo);
  }

  async findOneAssigned(id: string, user: AuthenticatedUser): Promise<any> {
    if (!Types.ObjectId.isValid(id)) throw new BadRequestException('Invalid Work Order ID');

    const wo = await this.workOrderModel
      .findOne({ _id: id, assignedStaff: user._id, deletedAt: null })
      .populate('serviceId', 'title description')
      .exec();

    if (!wo) throw new NotFoundException('Work Order not found');
    return this._hydrateOne(wo);
  }

  private async _hydrateOne(wo: any): Promise<any> {
    // Hydrate the single work order form from its key
    let workOrderForm: any = null;
    if (wo.workOrderFormKey) {
      try {
        const template = await this.formsService.findLatestTemplateByKey(wo.workOrderFormKey);
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

    return WorkOrderResource.transformWorkOrderDetail(wo, workOrderForm, submissions);
  }

  async updateStatus(id: string, updateStatusDto: any, user: AuthenticatedUser): Promise<any> {
    if (!user.company?._id) throw new BadRequestException('User company information is missing');

    const wo = await this.workOrderModel.findOne({
      _id: id,
      companyId: user.company._id,
      deletedAt: null,
    });
    if (!wo) throw new NotFoundException('Work Order not found');

    const now = new Date();
    wo.status = updateStatusDto.status;

    switch (updateStatusDto.status) {
      case 'ready':
        if (!wo.readyAt) wo.readyAt = now;
        break;
      case 'inProgress':
        if (!wo.startedAt) wo.startedAt = now;
        break;
      case 'completed':
        if (!wo.completedAt) wo.completedAt = now;
        break;
      case 'cancelled':
        if (!wo.cancelledAt) wo.cancelledAt = now;
        break;
    }

    await wo.save();
    return this.findOneInternal(id, user);
  }

  async assignStaff(id: string, assignStaffDto: AssignStaffDto, user: AuthenticatedUser): Promise<any> {
    if (!user.company?._id) throw new BadRequestException('User company information is missing');

    const wo = await this.workOrderModel.findOne({
      _id: id,
      companyId: user.company._id,
      deletedAt: null,
    });
    if (!wo) throw new NotFoundException('Work Order not found');

    const staffIds: Types.ObjectId[] = [];
    const errors: string[] = [];

    const emails = Array.isArray(assignStaffDto.staffEmail)
      ? assignStaffDto.staffEmail
      : [assignStaffDto.staffEmail];

    for (const email of emails) {
      const staff = await this.usersService.findOneByEmail(email);
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

    if (errors.length > 0) throw new BadRequestException(errors.join(', '));

    wo.assignedStaff = staffIds as any;
    await wo.save();
    return this.findOneInternal(id, user);
  }

  async markAsReady(id: string, user: AuthenticatedUser): Promise<any> {
    if (!user.company?._id) throw new BadRequestException('User company information is missing');

    const wo = await this.workOrderModel.findOne({ _id: id, companyId: user.company._id });
    if (!wo) throw new NotFoundException('Work Order not found');

    // Verify all submissions are present for the work order form
    if (wo.workOrderFormKey) {
      const template = await this.formsService.findLatestTemplateByKey(wo.workOrderFormKey);
      if (template) {
        const submission = await this.submissionModel.findOne({
          ownerId: wo._id,
          formId: template._id,
          submissionType: SubmissionType.WorkOrder,
        });
        if (!submission) {
          throw new BadRequestException('Work order form must be submitted before marking as ready');
        }
      }
    }

    wo.status = 'ready';
    if (!wo.readyAt) wo.readyAt = new Date();
    await wo.save();
    return this.findOneInternal(id, user);
  }

  async markAsInProgress(id: string, user: AuthenticatedUser): Promise<any> {
    if (!user.company?._id) throw new BadRequestException('User company information is missing');

    const wo = await this.workOrderModel.findOne({ _id: id, companyId: user.company._id });
    if (!wo) throw new NotFoundException('Work Order not found');

    if (wo.status !== 'ready') {
      throw new BadRequestException('Work Order must be in ready status before starting');
    }

    wo.status = 'inProgress';
    if (!wo.startedAt) wo.startedAt = new Date();
    await wo.save();
    return this.findOneInternal(id, user);
  }

  async createSubmissions(id: string, createSubmissionsDto: CreateSubmissionsDto, user: AuthenticatedUser): Promise<any> {
    if (!Types.ObjectId.isValid(id)) throw new BadRequestException('Invalid Work Order ID');

    const wo = await this.workOrderModel.findOne({
      _id: id,
      companyId: user.company!._id,
      deletedAt: null,
    });
    if (!wo) throw new NotFoundException('Work Order not found');

    for (const submission of createSubmissionsDto.submissions) {
      const formTemplate = await this.formsService.findTemplateById(submission.formId);
      if (!formTemplate) {
        throw new NotFoundException(`Form template with ID ${submission.formId} not found`);
      }

      validateFormSubmission(formTemplate.fields, submission.fieldsData);

      const fieldsData = submission.fieldsData.map((field) => {
        const templateField = formTemplate.fields.find((f) => f.order === field.order);
        if (!templateField) {
          throw new BadRequestException(`Field with order ${field.order} not found in form template`);
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
    }

    return this.findOneInternal(id, user);
  }

  async remove(id: string, user: AuthenticatedUser): Promise<{ deletedAt: Date }> {
    if (!user.company?._id) throw new BadRequestException('User company information is missing');

    const wo = await this.workOrderModel.findOne({
      _id: id,
      companyId: user.company._id,
      deletedAt: null,
    });
    if (!wo) throw new NotFoundException('Work Order not found');

    const deletedAt = new Date();
    wo.deletedAt = deletedAt;
    await wo.save();
    return { deletedAt };
  }

  async getReport(id: string, user: AuthenticatedUser): Promise<any> {
    return this.workReportService.findByWorkOrderId(id, user);
  }

  async submitReportForm(id: string, dto: any, user: AuthenticatedUser): Promise<any> {
    return this.workReportService.submitReportFormByWorkOrderId(id, dto, user);
  }
}
