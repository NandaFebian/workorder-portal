import { Module, forwardRef } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { WorkOrder, WorkOrderSchema } from './schemas/work-order.schema';
import { WorkOrderInternalController } from './work-order.internal.controller';
import { WorkOrderStaffController } from './work-order.staff.controller';
import { WorkOrderService } from './work-order.service';
import { FormModule } from 'src/form/form.module';
import { AuthModule } from 'src/auth/auth.module';
import { UsersModule } from 'src/users/users.module';
import { FormSubmission, FormSubmissionSchema } from 'src/form/schemas/form-submissions.schema';
import { WorkReportModule } from 'src/work-report/work-report.module';

@Module({
    imports: [
        MongooseModule.forFeature([
            { name: WorkOrder.name, schema: WorkOrderSchema },
            { name: FormSubmission.name, schema: FormSubmissionSchema }
        ]),
        FormModule,
        forwardRef(() => AuthModule),
        UsersModule,
        WorkReportModule,
    ],
    controllers: [WorkOrderInternalController, WorkOrderStaffController],
    providers: [WorkOrderService],
    exports: [WorkOrderService],
})
export class WorkOrderModule { }