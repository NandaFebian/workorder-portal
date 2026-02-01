import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { WorkReport, WorkReportDocument } from './schemas/work-report.schema';
import { CreateWorkReportDto } from './dto/create-work-report.dto';
import { UpdateWorkReportDto } from './dto/update-work-report.dto';
import { WorkReportResource } from './resources/work-report.resource';
import { FormSubmission, FormSubmissionDocument } from '../form/schemas/form-submissions.schema';
import { AuthenticatedUser } from 'src/auth/interfaces/authenticated-user.interface';
import { FormsService } from 'src/form/form.service';

@Injectable()
export class WorkReportService {
    constructor(
        @InjectModel(WorkReport.name) private workReportModel: Model<WorkReportDocument>,
        @InjectModel(FormSubmission.name) private formSubmissionModel: Model<FormSubmissionDocument>,
        private readonly formsService: FormsService,
    ) { }

    async create(createDto: CreateWorkReportDto): Promise<WorkReportDocument> {
        const newReport = new this.workReportModel({
            ...createDto,
            status: createDto.status || 'in_progress', // Default sesuai request
        });
        return newReport.save();
    }

    async findAll(): Promise<WorkReportDocument[]> {
        return this.workReportModel.find({ deletedAt: null }).sort({ createdAt: -1 }).exec();
    }

    async findOne(id: string): Promise<any> {
        if (!Types.ObjectId.isValid(id)) throw new NotFoundException('Invalid ID');
        const report = await this.workReportModel.findOne({ _id: id, deletedAt: null })
            .populate('workOrderId')
            .exec();
        if (!report) throw new NotFoundException('Work Report not found');
        return WorkReportResource.transformWorkReport(report);
    }

    async update(id: string, updateDto: UpdateWorkReportDto): Promise<WorkReportDocument> {
        if (!Types.ObjectId.isValid(id)) throw new NotFoundException('Invalid ID');

        const updatedReport = await this.workReportModel.findByIdAndUpdate(
            id,
            updateDto,
            { new: true }
        ).exec();

        if (!updatedReport) throw new NotFoundException('Work Report not found');
        return updatedReport;
    }

    async submitReportForm(dto: any, user: any): Promise<any> {
        const { workReportId, submissions } = dto;

        // Validate work report exists
        if (!Types.ObjectId.isValid(workReportId)) {
            throw new NotFoundException('Invalid work report ID');
        }

        const workReport = await this.workReportModel.findOne({
            _id: workReportId,
            deletedAt: null
        }).exec();

        if (!workReport) {
            throw new NotFoundException('Work report not found');
        }

        // Authorization check - verify user belongs to the same company
        if (user.company?._id?.toString() !== workReport.companyId.toString()) {
            throw new NotFoundException('Unauthorized to submit this work report form');
        }

        const savedSubmissions: FormSubmissionDocument[] = [];

        // Iterate over submissions
        if (submissions && Array.isArray(submissions)) {
            for (const item of submissions) {
                const { formId, fieldsData } = item;

                // Validate formId
                if (!Types.ObjectId.isValid(formId)) {
                    continue; // Skip invalid forms or throw error
                }

                // Create form submission
                const submission = new this.formSubmissionModel({
                    submissionType: 'work_report',
                    ownerId: new Types.ObjectId(workReportId),
                    formId: new Types.ObjectId(formId),
                    submittedBy: user._id,
                    fieldsData: fieldsData,
                    status: 'submitted',
                    submittedAt: new Date()
                });

                const saved = await submission.save();
                savedSubmissions.push(saved);
            }
        }

        return savedSubmissions;
    }

    async findByWorkOrderId(workOrderId: string, user: AuthenticatedUser): Promise<any> {
        if (!Types.ObjectId.isValid(workOrderId)) throw new NotFoundException('Invalid Work Order ID');

        const report = await this.workReportModel.findOne({
            workOrderId: new Types.ObjectId(workOrderId),
            deletedAt: null
        })
            .populate('workOrderId')
            .exec();

        if (!report) throw new NotFoundException('Work Report not found');

        // Transform and Filter based on Role and Position
        const transformedReport = WorkReportResource.transformWorkReport(report);

        // Filter AND Hydrate reportForms
        if (transformedReport.reportForms) {
            const filteredForms = transformedReport.reportForms.filter((item: any) => {
                const hasRole = item.viewableByRoles?.includes(user.role);
                if (!hasRole) return false;

                const positionIds = item.viewableByPositionIds || [];
                if (positionIds.length === 0) {
                    return true;
                }

                if (user.position && user.position._id) {
                    return positionIds.includes(user.position._id.toString());
                } else if (user.position) {
                    return positionIds.includes((user.position as any).toString());
                }

                return false;
            });

            // Hydrate forms with full details from FormsService
            transformedReport.reportForms = await Promise.all(filteredForms.map(async (item: any) => {
                const formId = item.form._id;
                let fullFormData = { ...item.form, fields: [] }; // Default fallback

                try {
                    const template = await this.formsService.findTemplateById(formId.toString());
                    if (template) {
                        // Populate fields and other details from template
                        fullFormData = {
                            _id: template._id,
                            title: template.title,
                            description: template.description,
                            formType: template.formType,
                            fields: template.fields,
                            // Add other necessary fields if any
                        };
                    }
                } catch (e) {
                    console.warn(`Failed to hydrate form ${formId}: ${e.message}`);
                }

                return {
                    ...item,
                    form: fullFormData
                };
            }));
        }

        return transformedReport;
    }

    async remove(id: string): Promise<{ deletedAt: Date }> {
        if (!Types.ObjectId.isValid(id)) throw new NotFoundException('Invalid ID');

        const report = await this.workReportModel.findOne({ _id: id, deletedAt: null }).exec();
        if (!report) throw new NotFoundException('Work Report not found');

        // Soft delete
        const deletedAt = new Date();
        report.deletedAt = deletedAt;
        await report.save();

        return { deletedAt };
    }
}