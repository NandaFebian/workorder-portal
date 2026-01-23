import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { WorkReport, WorkReportDocument } from './schemas/work-report.schema';
import { CreateWorkReportDto } from './dto/create-work-report.dto';
import { UpdateWorkReportDto } from './dto/update-work-report.dto';
import { WorkReportResource } from './resources/work-report.resource';
import { FormSubmission, FormSubmissionDocument } from '../form/schemas/form-submissions.schema';

@Injectable()
export class WorkReportService {
    constructor(
        @InjectModel(WorkReport.name) private workReportModel: Model<WorkReportDocument>,
        @InjectModel(FormSubmission.name) private formSubmissionModel: Model<FormSubmissionDocument>,
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
        const { workReportId, formId, fieldsData } = dto;

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

        // Validate formId
        if (!Types.ObjectId.isValid(formId)) {
            throw new NotFoundException('Invalid form ID');
        }

        // Authorization check - verify user belongs to the same company
        if (user.company?._id?.toString() !== workReport.companyId.toString()) {
            throw new NotFoundException('Unauthorized to submit this work report form');
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

        const savedSubmission = await submission.save();

        return savedSubmission;
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