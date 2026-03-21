import {
  Injectable,
  NotFoundException,
  BadRequestException,
  Inject,
  forwardRef,
  ForbiddenException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import {
  ClientServiceRequest,
  ClientServiceRequestDocument,
} from './schemas/client-service-request.schema';
import {
  FormSubmission,
  FormSubmissionDocument,
} from 'src/form/schemas/form-submissions.schema';
import { FormsService } from 'src/form/form.service';
import { WorkOrderService } from 'src/work-order/work-order.service';
import { ServicesInternalService } from 'src/service/services.internal.service';
import { AuthenticatedUser } from 'src/auth/interfaces/authenticated-user.interface';
import { WorkReportService } from 'src/work-report/work-report.service';
import { CsrResponseUtil } from './utils/csr-response.util';

@Injectable()
export class ClientServiceRequestService {
  constructor(
    @InjectModel(ClientServiceRequest.name)
    private csrModel: Model<ClientServiceRequestDocument>,
    @InjectModel(FormSubmission.name)
    private submissionModel: Model<FormSubmissionDocument>,
    private readonly formsService: FormsService,
    private readonly workOrderService: WorkOrderService,
    @Inject(forwardRef(() => ServicesInternalService))
    private readonly servicesInternalService: ServicesInternalService,
    private readonly workReportService: WorkReportService,
  ) {}

  async create(data: any): Promise<ClientServiceRequestDocument> {
    const newRequest = new this.csrModel({
      ...data,
      serviceRequestStatus: 'received',
      receivedAt: new Date(),
    });
    return newRequest.save();
  }

  async findAllByClientId(userId: string): Promise<any[]> {
    const requests = await this.csrModel
      .find({ requestedBy: new Types.ObjectId(userId), deletedAt: null })
      .populate('serviceId', 'companyId title description accessType isActive')
      .populate('requestedBy', 'name email role')
      .populate('approvedBy', 'name email role')
      .sort({ createdAt: -1 })
      .exec();

    return Promise.all(requests.map((r) => this._enrichAndFormat(r)));
  }

  async findOneForClient(id: string, userId: string): Promise<any> {
    if (!Types.ObjectId.isValid(id)) throw new BadRequestException('Invalid ID');

    const csr = await this.csrModel
      .findOne({ _id: id, requestedBy: new Types.ObjectId(userId), deletedAt: null })
      .populate('serviceId', 'companyId title description accessType isActive')
      .populate('requestedBy', 'name email role')
      .populate('approvedBy', 'name email role')
      .exec();

    if (!csr) throw new NotFoundException('Service Request not found');
    return this._enrichAndFormat(csr);
  }

  async findAllByCompanyId(companyId: string): Promise<any[]> {
    const requests = await this.csrModel
      .find({ companyId: new Types.ObjectId(companyId), deletedAt: null })
      .populate('serviceId', 'companyId title description accessType isActive')
      .populate('requestedBy', 'name email role')
      .populate('approvedBy', 'name email role')
      .sort({ createdAt: -1 })
      .exec();

    return Promise.all(requests.map((r) => this._enrichAndFormat(r)));
  }

  async findOneInternal(id: string): Promise<any> {
    if (!Types.ObjectId.isValid(id)) throw new BadRequestException('Invalid ID');

    const csr = await this.csrModel
      .findOne({ _id: id, deletedAt: null })
      .populate('serviceId', 'companyId title description accessType isActive')
      .populate('requestedBy', 'name email role')
      .populate('approvedBy', 'name email role')
      .exec();

    if (!csr) throw new NotFoundException('Service Request not found');
    return this._enrichAndFormat(csr);
  }

  private async _enrichAndFormat(csr: any): Promise<any> {
    const doc = csr.toObject ? csr.toObject() : csr;

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

    // Find intake and review submissions
    const intakeSubmission = doc.intakeFormId
      ? await this.submissionModel
          .findOne({ ownerId: doc._id, formId: doc.intakeFormId })
          .exec()
      : null;

    const reviewSubmission = doc.reviewFormId
      ? await this.submissionModel
          .findOne({ ownerId: doc._id, formId: doc.reviewFormId })
          .exec()
      : null;

    return CsrResponseUtil.formatOne(doc, intakeForm, reviewForm, intakeSubmission, reviewSubmission);
  }

  async updateStatus(
    id: string,
    status: string,
    user: AuthenticatedUser,
  ): Promise<any> {
    if (!Types.ObjectId.isValid(id)) throw new BadRequestException('Invalid ID');

    const csr = await this.csrModel.findOne({ _id: id, deletedAt: null }).exec();
    if (!csr) throw new NotFoundException('Service Request not found');

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

    Object.assign(csr, updateData);
    await csr.save();

    if (status === 'approved') {
      const serviceData = await this.servicesInternalService.findByVersionId(
        csr.serviceId.toString(),
        user,
      );

      // Pick the first workOrdersConfig entry to determine the work order form
      const firstConfig = serviceData.workOrdersConfig?.[0];
      const workOrderFormId = firstConfig?.workOrderForm?._id ?? null;
      const reportFormId = firstConfig?.workReportForm?._id ?? null;

      const createdWorkOrder = await this.workOrderService.createInternal({
        companyId: csr.companyId,
        serviceId: csr.serviceId,
        clientServiceRequestId: csr._id,
        workOrderFormId,
        createdBy: user._id,
        status: 'drafted',
      });

      if (createdWorkOrder?._id && reportFormId) {
        await this.workReportService.create({
          workOrderId: createdWorkOrder._id.toString(),
          companyId: csr.companyId.toString(),
          reportFormKey: firstConfig?.workReportForm ? firstConfig.workOrderForm?._id?.toString() : null,
          status: 'drafted',
        } as any);
      }

      // Update CSR status to workOrderCreated
      csr.serviceRequestStatus = 'workOrderCreated';
      csr.workOrderCreatedAt = now;
      await csr.save();

      return this.workOrderService.findOneInternal(
        (createdWorkOrder as any)._id.toString(),
        user,
      );
    }

    return this.findOneInternal(id);
  }

  async remove(id: string, user: AuthenticatedUser): Promise<{ deletedAt: Date }> {
    if (!Types.ObjectId.isValid(id)) throw new BadRequestException('Invalid ID');

    const csr = await this.csrModel.findOne({ _id: id, deletedAt: null }).exec();
    if (!csr) throw new NotFoundException('Client service request not found');

    if (!user.company?._id) {
      throw new ForbiddenException('User is not associated with any company.');
    }
    if (csr.companyId.toString() !== user.company._id.toString()) {
      throw new ForbiddenException('You do not have permission to delete this request.');
    }

    const deletedAt = new Date();
    csr.deletedAt = deletedAt;
    await csr.save();

    return { deletedAt };
  }
}
