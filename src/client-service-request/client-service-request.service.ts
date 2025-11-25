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

@Injectable()
export class ClientServiceRequestService {
    constructor(
        @InjectModel(ClientServiceRequest.name) private csrModel: Model<ClientServiceRequestDocument>,
        @InjectModel(FormSubmission.name) private submissionModel: Model<FormSubmissionDocument>,
        private readonly formsService: FormsService,
        private readonly workOrderService: WorkOrderService, // Inject WO Service
        @Inject(forwardRef(() => ServicesInternalService)) // Inject Internal Service untuk ambil data raw service
        private readonly servicesInternalService: ServicesInternalService,
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

        return requests.map(request => {
            const doc = request.toObject() as any;
            return {
                _id: doc._id,
                status: doc.status,
                createdAt: doc.createdAt,
                updatedAt: doc.updatedAt,
                companyId: doc.companyId,
                client: doc.clientId,
                service: doc.serviceId,
            };
        });
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

        const doc = csr.toObject() as any;

        return {
            _id: doc._id,
            status: doc.status,
            createdAt: doc.createdAt,
            updatedAt: doc.updatedAt,
            companyId: doc.companyId,
            client: doc.clientId,
            service: doc.serviceId,
            clientIntakeForms: clientIntakeFormsWithFields,
            submissions: submissions
        };
    }

    async findAllByCompanyId(companyId: string): Promise<ClientServiceRequestDocument[]> {
        return this.csrModel.find({ companyId: new Types.ObjectId(companyId) })
            .populate('serviceId', 'title')
            .populate('clientId', 'name email')
            .sort({ createdAt: -1 })
            .exec();
    }

    async findOneInternal(id: string): Promise<ClientServiceRequestDocument> {
        if (!Types.ObjectId.isValid(id)) throw new BadRequestException('Invalid ID');
        const csr = await this.csrModel.findById(id)
            .populate('serviceId')
            .populate('clientId', 'name email')
            .exec();
        if (!csr) throw new NotFoundException('Service Request not found');
        return csr;
    }

    async updateStatus(id: string, status: 'approved' | 'rejected', user: AuthenticatedUser): Promise<any> {
        if (!Types.ObjectId.isValid(id)) throw new BadRequestException('Invalid ID');

        const csr = await this.csrModel.findByIdAndUpdate(
            id,
            { status },
            { new: true }
        ).exec();

        if (!csr) throw new NotFoundException('Service Request not found');

        let createdWorkOrder: WorkOrderDocument | null = null;

        if (status === 'approved') {
            // Ambil data service (Forms sudah ter-populate oleh helper aggregation)
            const serviceData = await this.servicesInternalService.findByVersionId(csr.serviceId.toString(), user);

            // Debug: Pastikan serviceData memiliki workOrderForms
            if (!serviceData.workOrderForms || serviceData.workOrderForms.length === 0) {
                console.warn('Warning: No Work Order Forms found in Service Definition');
            }

            const workOrderForms = serviceData.workOrderForms || [];

            const validWOForms = workOrderForms.map((item) => {
                return {
                    order: item.order,
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
                };
            });

            createdWorkOrder = await this.workOrderService.create({
                clientServiceRequestId: csr._id,
                createdBy: user._id,
                serviceId: csr.serviceId,
                companyId: csr.companyId,
                relatedWorkOrderId: null,
                assignedStaff: [],
                workOrderForms: validWOForms, // Data ini harus sesuai dengan WorkOrderFormSnapshotSchema
                status: 'drafted',
            });
        }

        return {
            message: `Request ${status} successfully`,
            data: {
                request: csr,
                workOrder: createdWorkOrder
            }
        };
    }
}   