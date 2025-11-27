import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Report, ReportSchema } from './schemas/work-report.schema';
import { WorkReportService } from './work-report.service';

@Module({
    imports: [
        MongooseModule.forFeature([{ name: Report.name, schema: ReportSchema }]),
    ],
    providers: [WorkReportService],
    exports: [WorkReportService], // Export agar bisa dipakai CSR Service
})
export class ReportModule { }