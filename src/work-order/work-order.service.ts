import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { WorkOrder, WorkOrderDocument } from './schemas/work-order.schema';
import { AuthenticatedUser } from 'src/auth/interfaces/authenticated-user.interface';
import { FormsService } from 'src/form/form.service';

@Injectable()
export class WorkOrderService {
    constructor(
        @InjectModel(WorkOrder.name) private workOrderModel: Model<WorkOrderDocument>,
        private readonly formsService: FormsService,
    ) { }

    async create(data: any): Promise<WorkOrderDocument> {
        const newWorkOrder = new this.workOrderModel(data);
        return newWorkOrder.save();
    }

    // GET All Work Orders (Internal Company)
    async findAll(user: AuthenticatedUser): Promise<any[]> {
        if (!user.company || !user.company._id) {
            throw new BadRequestException('User company information is missing');
        }

        const workOrders = await this.workOrderModel
            .find({ companyId: new Types.ObjectId(user.company._id) })
            .populate('createdBy', 'name email role positionId') // Populate User
            .populate('serviceId', 'companyId title description accessType isActive') // Populate Service
            .sort({ createdAt: -1 })
            .exec();

        // Transformasi Data
        return workOrders.map(wo => {
            const doc = wo.toObject() as any;
            return {
                _id: doc._id,
                clientServiceRequestId: doc.clientServiceRequestId,
                companyId: doc.companyId,
                relatedWorkOrderId: doc.relatedWorkOrderId,
                assignedStaff: doc.assignedStaff,
                status: doc.status,
                createdAt: doc.createdAt,
                updatedAt: doc.updatedAt,
                startedAt: doc.startedAt,
                completedAt: doc.completedAt,
                createdBy: doc.createdBy, // Sudah ter-populate
                service: doc.serviceId,   // Rename serviceId -> service
                // Note: Untuk list, biasanya form detail tidak perlu di-hydrate lengkap agar ringan,
                // tapi jika perlu, bisa disesuaikan. Di sini kita biarkan snapshot asli.
            };
        });
    }

    // GET Detail Work Order
    async findOne(id: string, user: AuthenticatedUser): Promise<any> {
        if (!Types.ObjectId.isValid(id)) {
            throw new BadRequestException('Invalid Work Order ID');
        }

        if (!user.company) {
            throw new BadRequestException('User company information is missing');
        }

        const wo = await this.workOrderModel
            .findOne({
                _id: id,
                companyId: new Types.ObjectId(user.company._id) // Security check
            })
            .populate('createdBy', 'name email role positionId')
            .populate('serviceId', 'companyId title description accessType isActive')
            .exec();

        if (!wo) {
            throw new NotFoundException('Work Order not found');
        }

        // Hydrate Forms (Ambil fields terbaru dari Template)
        // Karena snapshot di WO biasanya tidak menyimpan 'fields', kita ambil dari master form
        const workOrderFormsWithFields = await Promise.all(
            wo.workOrderForms.map(async (item) => {
                const snapshotForm = item.form;
                let fields: any[] = [];
                try {
                    const template = await this.formsService.findTemplateById(snapshotForm._id.toString());
                    if (template) {
                        fields = template.fields;
                    }
                } catch (error) {
                    console.warn(`Form template not found: ${snapshotForm._id}`);
                }

                return {
                    order: item.order,
                    // Sertakan detail snapshot
                    // fillableByRoles, dll jika perlu
                    form: {
                        _id: snapshotForm._id,
                        title: snapshotForm.title,
                        formType: snapshotForm.formType,
                        description: snapshotForm.description,
                        fields: fields // Inject fields
                    }
                };
            })
        );

        const doc = wo.toObject() as any;

        return {
            _id: doc._id,
            clientServiceRequestId: doc.clientServiceRequestId,
            companyId: doc.companyId,
            relatedWorkOrderId: doc.relatedWorkOrderId,
            assignedStaff: doc.assignedStaff,
            status: doc.status,
            createdAt: doc.createdAt,
            updatedAt: doc.updatedAt,
            startedAt: doc.startedAt,
            completedAt: doc.completedAt,
            createdBy: doc.createdBy,
            service: doc.serviceId, // Rename serviceId -> service
            workorderForms: workOrderFormsWithFields // Rename workOrderForms -> workorderForms (sesuai JSON Anda)
        };
    }
}