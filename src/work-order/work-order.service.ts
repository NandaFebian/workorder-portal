import { Injectable, NotFoundException, BadRequestException, ForbiddenException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { WorkOrder, WorkOrderDocument } from './schemas/work-order.schema';
import { AuthenticatedUser } from 'src/auth/interfaces/authenticated-user.interface';
import { FormsService } from 'src/form/form.service';
import { UsersService } from 'src/users/users.service';
import { Role } from 'src/common/enums/role.enum';
import { CreateWorkOrderDto } from './dto/create-work-order.dto';
import { UpdateWorkOrderDto } from './dto/update-work-order.dto';
import { UpdateWorkOrderStatusDto } from './dto/update-work-order-status.dto';
import { AssignStaffDto } from './dto/assign-staff.dto';
import { WorkOrderFilterDto } from './dto/work-order-filter.dto';

@Injectable()
export class WorkOrderService {
    constructor(
        @InjectModel(WorkOrder.name) private workOrderModel: Model<WorkOrderDocument>,
        private readonly formsService: FormsService,
        private readonly usersService: UsersService,
    ) { }

    async create(createWorkOrderDto: CreateWorkOrderDto, user: AuthenticatedUser): Promise<WorkOrderDocument> {
        if (!user.company || !user.company._id) {
            throw new BadRequestException('User company information is missing');
        }

        const newWorkOrder = new this.workOrderModel({
            ...createWorkOrderDto,
            companyId: user.company._id,
            createdBy: user._id,
            status: 'drafted', // Default status
        });
        return newWorkOrder.save();
    }

    async createInternal(data: any): Promise<WorkOrderDocument> {
        const newWorkOrder = new this.workOrderModel(data);
        return newWorkOrder.save();
    }

    // GET All Work Orders (Internal Company)
    async findAllInternal(user: AuthenticatedUser, filterDto: WorkOrderFilterDto): Promise<any[]> {
        if (!user.company || !user.company._id) {
            throw new BadRequestException('User company information is missing');
        }

        const query: any = { companyId: user.company._id };

        if (filterDto.status) {
            query.status = filterDto.status;
        }
        if (filterDto.priority) {
            query.priority = filterDto.priority;
        }
        if (filterDto.assignedStaffId) {
            query.assignedStaff = new Types.ObjectId(filterDto.assignedStaffId);
        }
        if (filterDto.clientId) {
            // Assuming we can filter by client via clientServiceRequestId population or if we store clientId directly
        }
        if (filterDto.startDate && filterDto.endDate) {
            query.createdAt = {
                $gte: new Date(filterDto.startDate),
                $lte: new Date(filterDto.endDate),
            };
        }

        const workOrders = await this.workOrderModel
            .find(query)
            .populate('createdBy', 'name email role positionId')
            .populate('serviceId', 'companyId title description accessType isActive')
            .populate('assignedStaff', 'name email')
            .sort({ createdAt: -1 })
            .exec();

        return workOrders.map(doc => this.transformWorkOrder(doc));
    }

    // GET All Work Orders (Staff Assigned)
    async findAllAssigned(user: AuthenticatedUser): Promise<any[]> {
        return this.workOrderModel.find({ assignedStaff: user._id })
            .populate('serviceId', 'title description')
            .sort({ createdAt: -1 })
            .exec();
    }

    // GET Detail Work Order (Internal)
    async findOneInternal(id: string, user: AuthenticatedUser): Promise<any> {
        if (!Types.ObjectId.isValid(id)) {
            throw new BadRequestException('Invalid Work Order ID');
        }

        const wo = await this.workOrderModel
            .findOne({
                _id: id,
                companyId: user.company!._id
            })
            .populate('createdBy', 'name email role positionId')
            .populate('serviceId', 'companyId title description accessType isActive')
            .populate('assignedStaff', 'name email')
            .exec();

        if (!wo) {
            throw new NotFoundException('Work Order not found');
        }

        return this.hydrateWorkOrderForms(wo);
    }

    // GET Detail Work Order (Staff Assigned)
    async findOneAssigned(id: string, user: AuthenticatedUser): Promise<any> {
        if (!Types.ObjectId.isValid(id)) {
            throw new BadRequestException('Invalid Work Order ID');
        }

        const wo = await this.workOrderModel
            .findOne({
                _id: id,
                assignedStaff: user._id // Ensure assignment
            })
            .populate('serviceId', 'title description')
            .exec();

        if (!wo) {
            throw new NotFoundException('Work Order not found');
        }

        return this.hydrateWorkOrderForms(wo);
    }

    async update(id: string, updateWorkOrderDto: UpdateWorkOrderDto, user: AuthenticatedUser): Promise<WorkOrderDocument> {
        if (!user.company || !user.company._id) {
            throw new BadRequestException('User company information is missing');
        }
        const wo = await this.workOrderModel.findOne({ _id: id, companyId: user.company._id });
        if (!wo) throw new NotFoundException('Work Order not found');

        Object.assign(wo, updateWorkOrderDto);
        return wo.save();
    }

    async updateStatus(id: string, updateStatusDto: UpdateWorkOrderStatusDto, user: AuthenticatedUser): Promise<WorkOrderDocument> {
        if (!user.company || !user.company._id) {
            throw new BadRequestException('User company information is missing');
        }
        const wo = await this.workOrderModel.findOne({ _id: id, companyId: user.company._id });
        if (!wo) throw new NotFoundException('Work Order not found');

        wo.status = updateStatusDto.status;

        if (updateStatusDto.status === 'in_progress' && !wo.startedAt) {
            wo.startedAt = new Date();
        } else if (updateStatusDto.status === 'completed' && !wo.completedAt) {
            wo.completedAt = new Date();
        }

        return wo.save();
    }

    async assignStaff(id: string, assignStaffDto: AssignStaffDto, user: AuthenticatedUser): Promise<WorkOrderDocument> {
        if (!user.company || !user.company._id) {
            throw new BadRequestException('User company information is missing');
        }
        const wo = await this.workOrderModel.findOne({ _id: id, companyId: user.company._id });
        if (!wo) throw new NotFoundException('Work Order not found');

        const staffIds: Types.ObjectId[] = [];
        const errors: string[] = [];

        // Ensure staffEmail is treated as an array (though DTO validation should handle this)
        const emails = Array.isArray(assignStaffDto.staffEmail)
            ? assignStaffDto.staffEmail
            : [assignStaffDto.staffEmail];

        for (const email of emails) {
            const staff = await this.usersService.findOneByEmail(email);
            if (!staff) {
                errors.push(`Staff with email ${email} not found`);
                continue;
            }
            // Check if staff belongs to the same company
            if (staff.companyId && staff.companyId.toString() !== user.company._id.toString()) {
                errors.push(`Staff with email ${email} does not belong to your company`);
                continue;
            }

            staffIds.push(staff._id as unknown as Types.ObjectId);
        }

        if (errors.length > 0) {
            throw new BadRequestException(errors.join(', '));
        }

        wo.assignedStaff = staffIds as any;
        return wo.save();
    }

    // Helper to transform WO doc to response object
    private transformWorkOrder(doc: any) {
        const wo = doc.toObject ? doc.toObject() : doc;
        return {
            _id: wo._id,
            clientServiceRequestId: wo.clientServiceRequestId,
            companyId: wo.companyId,
            relatedWorkOrderId: wo.relatedWorkOrderId,
            assignedStaff: wo.assignedStaff,
            status: wo.status,
            priority: wo.priority,
            createdAt: wo.createdAt,
            updatedAt: wo.updatedAt,
            startedAt: wo.startedAt,
            completedAt: wo.completedAt,
            createdBy: wo.createdBy,
            service: wo.serviceId,
        };
    }

    // Helper to hydrate forms
    private async hydrateWorkOrderForms(wo: any) {
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

        const doc = wo.toObject ? wo.toObject() : wo;
        return {
            ...this.transformWorkOrder(doc),
            workorderForms: workOrderFormsWithFields
        };
    }
}