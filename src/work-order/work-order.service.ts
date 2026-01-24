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
import { CreateSubmissionsDto } from './dto/create-submissions.dto';
import { FormSubmission, FormSubmissionDocument } from 'src/form/schemas/form-submissions.schema';
import { WorkReportService } from 'src/work-report/work-report.service';
import { WorkOrderResource } from './resources/work-order.resource';

@Injectable()
export class WorkOrderService {
    constructor(
        @InjectModel(WorkOrder.name) private workOrderModel: Model<WorkOrderDocument>,
        @InjectModel(FormSubmission.name) private submissionModel: Model<FormSubmissionDocument>,
        private readonly formsService: FormsService,
        private readonly usersService: UsersService,
        private readonly workReportService: WorkReportService,
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

        const query: any = { companyId: user.company._id, deletedAt: null };

        if (filterDto.status) {
            query.status = filterDto.status;
        }
        if (filterDto.priority) {
            query.priority = filterDto.priority;
        }
        if (filterDto.assignedStaffId) {
            query.assignedStaffs = new Types.ObjectId(filterDto.assignedStaffId);
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
            .populate({
                path: 'serviceId',
                select: 'companyId title description accessType isActive requiredStaffs',
                populate: {
                    path: 'requiredStaffs.positionId',
                    model: 'Position',
                    select: 'name description isActive companyId'
                }
            })
            .populate('assignedStaffs', 'name email')
            .sort({ createdAt: -1 })
            .exec();

        return workOrders.map(doc => WorkOrderResource.transformWorkOrder(doc));
    }

    // GET All Work Orders (Staff Assigned)
    async findAllAssigned(user: AuthenticatedUser): Promise<any[]> {
        return this.workOrderModel.find({ assignedStaffs: user._id, deletedAt: null })
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
                companyId: user.company!._id,
                deletedAt: null
            })
            .populate('createdBy', 'name email role positionId')
            .populate({
                path: 'serviceId',
                select: 'companyId title description accessType isActive requiredStaffs',
                populate: {
                    path: 'requiredStaffs.positionId',
                    model: 'Position',
                    select: '_id name'
                }
            })
            .populate({
                path: 'assignedStaffs',
                select: 'name email role companyId positionId',
                populate: {
                    path: 'positionId',
                    model: 'Position',
                    select: '_id name companyId createdAt updatedAt'
                }
            })
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
                assignedStaffs: user._id, // Ensure assignment
                deletedAt: null
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
        const wo = await this.workOrderModel.findOne({ _id: id, companyId: user.company._id, deletedAt: null });
        if (!wo) throw new NotFoundException('Work Order not found');

        Object.assign(wo, updateWorkOrderDto);
        return wo.save();
    }

    async updateStatus(id: string, updateStatusDto: UpdateWorkOrderStatusDto, user: AuthenticatedUser): Promise<WorkOrderDocument> {
        if (!user.company || !user.company._id) {
            throw new BadRequestException('User company information is missing');
        }
        const wo = await this.workOrderModel.findOne({ _id: id, companyId: user.company._id, deletedAt: null });
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
        const wo = await this.workOrderModel.findOne({ _id: id, companyId: user.company._id, deletedAt: null });
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

        wo.assignedStaffs = staffIds as any;
        return wo.save();
    }

    // Helper to hydrate forms
    private async hydrateWorkOrderForms(wo: any) {
        const workOrderFormsWithFields = await Promise.all(
            wo.workOrderForms.map(async (item) => {
                const snapshotForm = item.form;
                let fullFormData: any = {
                    _id: snapshotForm._id,
                    title: snapshotForm.title,
                    formType: snapshotForm.formType,
                    description: snapshotForm.description,
                    fields: []
                };

                try {
                    const template = await this.formsService.findTemplateById(snapshotForm._id.toString());
                    if (template) {
                        // Populate with complete form template data (excluding formKey and companyId)
                        fullFormData = {
                            _id: template._id,
                            title: template.title,
                            description: template.description,
                            formType: template.formType,
                            __v: template.__v,
                            fields: template.fields,
                            createdAt: (template as any).createdAt,
                            updatedAt: (template as any).updatedAt
                        };
                    }
                } catch (error) {
                    console.warn(`Form template not found: ${snapshotForm._id}`);
                }

                return {
                    order: item.order,
                    form: fullFormData
                };
            })
        );

        // Fetch submissions for this work order
        const submissions = await this.submissionModel
            .find({
                ownerId: wo._id,
                submissionType: 'work_order'
            })
            .exec();

        return WorkOrderResource.transformWorkOrderDetail(
            wo,
            workOrderFormsWithFields,
            submissions
        );
    }

    async createSubmissions(id: string, createSubmissionsDto: CreateSubmissionsDto, user: AuthenticatedUser): Promise<any> {
        if (!Types.ObjectId.isValid(id)) {
            throw new BadRequestException('Invalid Work Order ID');
        }

        // Verify work order exists and user has access
        const wo = await this.workOrderModel.findOne({
            _id: id,
            companyId: user.company!._id,
            deletedAt: null
        });

        if (!wo) {
            throw new NotFoundException('Work Order not found');
        }

        const savedSubmissions: FormSubmissionDocument[] = [];

        for (const submission of createSubmissionsDto.submissions) {
            // Fetch FormTemplate to get the correct field order
            const formTemplate = await this.formsService.findTemplateById(submission.formId);

            if (!formTemplate) {
                throw new NotFoundException(`Form template with ID ${submission.formId} not found`);
            }

            // Map fieldsData using order from FormTemplate
            const fieldsData = submission.fieldsData.map(field => {
                // Find matching field in template by order
                const templateField = formTemplate.fields.find(f => f.order === field.order);

                if (!templateField) {
                    throw new BadRequestException(`Field with order ${field.order} not found in form template`);
                }

                return {
                    order: templateField.order,
                    value: field.value
                };
            });

            const submissionData = {
                submissionType: submission.submissionType,
                ownerId: new Types.ObjectId(submission.ownerId),
                formId: new Types.ObjectId(submission.formId),
                submittedBy: new Types.ObjectId(submission.submittedBy),
                fieldsData: fieldsData,
                status: submission.status,
                submittedAt: submission.submittedAt ? new Date(submission.submittedAt) : new Date()
            };

            const newSubmission = new this.submissionModel(submissionData);
            const saved = await newSubmission.save();
            savedSubmissions.push(saved);
        }

        return {
            workOrderId: id,
            submissions: savedSubmissions
        };
    }

    async markAsReady(id: string, user: AuthenticatedUser): Promise<WorkOrderDocument> {
        if (!user.company || !user.company._id) {
            throw new BadRequestException('User company information is missing');
        }

        const wo = await this.workOrderModel.findOne({
            _id: id,
            companyId: user.company._id
        }).populate('serviceId');

        if (!wo) {
            throw new NotFoundException('Work Order not found');
        }

        // Check if all required work order forms have submissions
        if (wo.workOrderForms && wo.workOrderForms.length > 0) {
            const submissions = await this.submissionModel
                .find({
                    ownerId: wo._id,
                    submissionType: 'work_order'
                })
                .exec();

            const submittedFormIds = submissions.map(sub => sub.formId.toString());
            const requiredFormIds = wo.workOrderForms.map(form => form.form._id.toString());

            const missingForms = requiredFormIds.filter(formId => !submittedFormIds.includes(formId));

            if (missingForms.length > 0) {
                throw new BadRequestException('All required work order forms must be submitted before marking as ready');
            }
        }

        wo.status = 'ready';
        return wo.save();
    }

    async markAsInProgress(id: string, user: AuthenticatedUser): Promise<WorkOrderDocument> {
        if (!user.company || !user.company._id) {
            throw new BadRequestException('User company information is missing');
        }

        const wo = await this.workOrderModel.findOne({
            _id: id,
            companyId: user.company._id
        }).populate('serviceId');

        if (!wo) {
            throw new NotFoundException('Work Order not found');
        }

        // Validate work order is ready
        if (wo.status !== 'ready') {
            throw new BadRequestException('Work Order must be in ready status before starting');
        }

        wo.status = 'in_progress';
        if (!wo.startedAt) {
            wo.startedAt = new Date();
        }
        const savedWo = await wo.save();

        // Automatically create work report
        const service: any = wo.serviceId;
        const reportForms = service?.reportForms || [];

        await this.workReportService.create({
            workOrderId: (savedWo._id as any).toString(),
            companyId: user.company._id.toString(),
            reportForms: reportForms.map((form: any) => ({
                order: form.order,
                fillableByRoles: form.fillableByRoles || [],
                viewableByRoles: form.viewableByRoles || [],
                fillableByPositionIds: form.fillableByPositionIds?.map((id: any) => id.toString()) || [],
                viewableByPositionIds: form.viewableByPositionIds?.map((id: any) => id.toString()) || [],
                form: {
                    _id: form.formKey,
                    title: '',
                    description: '',
                    formType: 'report'
                }
            })),
            status: 'in_progress'
        });

        return savedWo;
    }

    async remove(id: string, user: AuthenticatedUser): Promise<{ deletedAt: Date }> {
        if (!user.company || !user.company._id) {
            throw new BadRequestException('User company information is missing');
        }

        const wo = await this.workOrderModel.findOne({
            _id: id,
            companyId: user.company._id,
            deletedAt: null
        });

        if (!wo) {
            throw new NotFoundException('Work Order not found');
        }

        // Soft delete
        const deletedAt = new Date();
        wo.deletedAt = deletedAt;
        await wo.save();

        return { deletedAt };
    }
}
