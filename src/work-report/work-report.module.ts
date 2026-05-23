import { forwardRef, Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { WorkReport, WorkReportSchema } from './schemas/work-report.schema';
import {
  FormSubmission,
  FormSubmissionSchema,
} from '../form/schemas/form-submissions.schema';
import { WorkReportService } from './work-report.service';
import { WorkReportController } from './work-report.controller';
import { AuthModule } from 'src/auth/auth.module';
import { UsersModule } from 'src/users/users.module';
import { FormModule } from 'src/form/form.module';
import { WorkOrderModule } from 'src/work-order/work-order.module';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: WorkReport.name, schema: WorkReportSchema },
      { name: FormSubmission.name, schema: FormSubmissionSchema },
    ]),
    forwardRef(() => AuthModule),
    UsersModule,
    FormModule,
    forwardRef(() => WorkOrderModule),
  ],
  controllers: [WorkReportController],
  providers: [WorkReportService],
  exports: [WorkReportService],
})
export class WorkReportModule {}
