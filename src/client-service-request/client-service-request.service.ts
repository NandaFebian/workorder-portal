import { Injectable, NotFoundException, BadRequestException, Inject, forwardRef } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { ClientServiceRequest, ClientServiceRequestDocument } from './schemas/client-service-request.schema';
import { FormSubmission, FormSubmissionDocument } from 'src/form/schemas/form-submissions.schema';
import { FormsService } from 'src/form/form.service';
import { WorkOrderService } from 'src/work-order/work-order.service';
import { ServicesInternalService } from 'src/service/services.internal.service';
import { AuthenticatedUser } from 'src/auth/interfaces/authenticated-user.interface';
import { WorkOrderDocument } from 'src/work-order/schemas/work-order.schema';
import { WorkReportService } from 'src/work-report/work-report.service';
import { CsrResponseUtil } from './utils/csr-response.util';

@Injectable()
export class ClientServiceRequestService {
    constructor(
        @InjectModel(ClientServiceRequest.name) private csrModel: Model<ClientServiceRequestDocument>,
        @InjectModel(FormSubmission.name) private submissionModel: Model<FormSubmissionDocument>,
        private readonly formsService: FormsService,
        private readonly workOrderService: WorkOrderService, // Inject WO Service
        @Inject(forwardRef(() => ServicesInternalService)) // Inject Internal Service untuk ambil data raw service
        private readonly servicesInternalService: ServicesInternalService,
        private readonly workReportService: WorkReportService, // Inject Work Report Service
    ) { }

    async create(data: any): Promise<ClientServiceRequestDocument> {
        const newRequest = new this.csrModel(data);
        return newRequest.save();
    }

    async findAllByClientId(userId: string): Promise<any[]> {
        const requests = await this.csrModel.find({ clientId: new Types.ObjectId(userId) })
            .populate('serviceId', 'companyId title description accessType isActive')
            .populate('clientId', 'name email role positionId')
            .sort({ createdAt: -1 })
            .exec();

        return Promise.all(requests.map(request => this._enrichAndFormat(request)));
    }

    async findOneForClient(id: string, userId: string): Promise<any> {
        if (!Types.ObjectId.isValid(id)) throw new BadRequestException('Invalid ID');

        const csr = await this.csrModel.findOne({
            _id: id,
            clientId: new Types.ObjectId(userId)
        })
            .populate('serviceId', 'companyId title description accessType isActive')
            .populate('clientId', 'name email role positionId')
            .exec();

        if (!csr) throw new NotFoundException('Service Request not found');

        return this._enrichAndFormat(csr);
    }

    private async _enrichAndFormat(csr: any): Promise<any> {
        const submissions = await this.submissionModel.find({ ownerId: csr._id }).exec();

        const clientIntakeFormsWithFields = await Promise.all(
            csr.clientIntakeForm.map(async (item) => {
                const snapshotForm = item.form;
                let fields: any[] = [];
                try {
                    const template = await this.formsService.findTemplateById(snapshotForm._id.toString());
                    if (template) {
                        fields = template.fields;
                    }
                } catch (error) {
                    console.warn(`Form template not found for snapshot id: ${snapshotForm._id}`);
                }
                return {
                    order: item.order,
                    form: {
                        _id: snapshotForm._id,
                        title: snapshotForm.title,
                        formType: snapshotForm.formType,
                        description: snapshotForm.description,
                        fields: fields
                    }
                };
            })
        );

        const doc = csr.toObject ? csr.toObject() : csr;
        return CsrResponseUtil.formatOne(doc, clientIntakeFormsWithFields, submissions);
    }

    async findAllByCompanyId(companyId: string): Promise<any[]> {
        const requests = await this.csrModel.find({ companyId: new Types.ObjectId(companyId) })
            .populate('serviceId', 'companyId title description accessType isActive')
            .populate('clientId', 'name email role positionId')
            .sort({ createdAt: -1 })
            .exec();

        return Promise.all(requests.map(request => this._enrichAndFormat(request)));
    }

    async findOneInternal(id: string): Promise<any> {
        if (!Types.ObjectId.isValid(id)) throw new BadRequestException('Invalid ID');
        const csr = await this.csrModel.findById(id)
            .populate('serviceId', 'companyId title description accessType isActive')
            .populate('clientId', 'name email role positionId')
            .exec();
        if (!csr) throw new NotFoundException('Service Request not found');
        return this._enrichAndFormat(csr);
    }

    async updateStatus(id: string, status: 'approved' | 'rejected', user: AuthenticatedUser): Promise<any> {
        if (!Types.ObjectId.isValid(id)) throw new BadRequestException('Invalid ID');

        const csr = await this.csrModel.findByIdAndUpdate(
            id, { status }, { new: true }
        ).exec();

        if (!csr) throw new NotFoundException('Service Request not found');

        let createdWorkOrder: WorkOrderDocument | null = null;
        let createdReport: any = null;

        if (status === 'approved') {
            const serviceData = await this.servicesInternalService.findByVersionId(csr.serviceId.toString(), user);

            // 1. Prepare Work Order Forms
            const workOrderForms = serviceData.workOrderForms || [];
            const validWOForms = workOrderForms.map((item) => ({
                order: item.order,
                fillableByRoles: item.fillableByRoles || [],
                viewableByRoles: item.viewableByRoles || [],
                fillableByPositionIds: item.fillableByPositionIds || [],
                viewableByPositionIds: item.viewableByPositionIds || [],
                form: {
                    _id: item.form._id,
                    fillableByRoles: item.fillableByRoles || [],
                    viewableByRoles: item.viewableByRoles || [],
                    fillableByPositionIds: item.fillableByPositionIds || [],
                    viewableByPositionIds: item.viewableByPositionIds || [],
                    form: {
                        _id: item.form._id,
                        title: item.form.title,
                        description: item.form.description,
                        formType: item.form.formType
                    }
                }
            }));

            // 2. Create Work Order
            const createWorkOrderData = {
                companyId: csr.companyId,
                serviceId: csr.serviceId,
                clientServiceRequestId: csr._id,
                clientId: csr.clientId,
                priority: 'medium', // Default priority
                status: 'drafted',
                workOrderForms: validWOForms,
                createdBy: user._id
            };

            createdWorkOrder = await this.workOrderService.createInternal(createWorkOrderData);

            // 3. Prepare Work Report Forms
            const reportForms = serviceData.reportForms || [];
            const validReportForms = reportForms.map((item) => ({
                order: item.order,
                fillableByRoles: item.fillableByRoles || [],
                viewableByRoles: item.viewableByRoles || [],
                fillableByPositionIds: item.fillableByPositionIds || [],
                viewableByPositionIds: item.viewableByPositionIds || [],
                form: {
                    _id: item.form._id,
                    fillableByRoles: item.fillableByRoles || [],
                    viewableByRoles: item.viewableByRoles || [],
                    fillableByPositionIds: item.fillableByPositionIds || [],
                    viewableByPositionIds: item.viewableByPositionIds || [],
                    form: {
                        _id: item.form._id,
                        title: item.form.title,
                        description: item.form.description,
                        formType: item.form.formType
                    }
                }
            }));

            // 4. Create Work Report (AUTO CREATE)
            if (createdWorkOrder && createdWorkOrder._id) {
                createdReport = await this.workReportService.create({
                    workOrderId: createdWorkOrder._id.toString(),
                    companyId: csr.companyId.toString(),
                    reportForms: validReportForms, // Simpan snapshot form laporan
                    status: 'in_progress' // Status default sesuai request
                });
            }
        }

        return {
            message: `Request ${status} successfully`,
            data: {
                request: csr,
                workOrder: createdWorkOrder,
                workReport: createdReport // Sertakan di response
            }
        };
    }
}