import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { WorkReport, WorkReportDocument } from './schemas/work-report.schema';
import { CreateWorkReportDto } from './dto/create-work-report.dto';
import { UpdateWorkReportDto } from './dto/update-work-report.dto';
import { WorkReportResource } from './resources/work-report.resource';

@Injectable()
export class WorkReportService {
    constructor(
        @InjectModel(WorkReport.name) private workReportModel: Model<WorkReportDocument>,
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

    async remove(id: string): Promise<void> {
        if (!Types.ObjectId.isValid(id)) throw new NotFoundException('Invalid ID');

        const report = await this.workReportModel.findOne({ _id: id, deletedAt: null }).exec();
        if (!report) throw new NotFoundException('Work Report not found');

        // Soft delete
        report.deletedAt = new Date();
        await report.save();
    }
}