import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Report, ReportDocument } from './schemas/work-report.schema';

@Injectable()
export class WorkReportService {
    constructor(
        @InjectModel(Report.name) private reportModel: Model<ReportDocument>,
    ) { }

    async create(data: any): Promise<ReportDocument> {
        const newReport = new this.reportModel(data);
        return newReport.save();
    }
}