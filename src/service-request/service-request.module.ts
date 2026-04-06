import { Module, forwardRef } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import {
  ServiceRequest,
  ServiceRequestSchema,
} from './schemas/service-request.schema';
import { ServiceRequestService } from './service-request.service';
import { ServiceRequestPublicController } from './service-request.public.controller';
import { ServiceRequestInternalController } from './service-request.internal.controller';
import { AuthModule } from 'src/auth/auth.module';
import { UsersModule } from 'src/users/users.module';
import { FormModule } from 'src/form/form.module';
import {
  FormSubmission,
  FormSubmissionSchema,
} from 'src/form/schemas/form-submissions.schema';
import { WorkOrderModule } from 'src/work-order/work-order.module';
import { ServicesModule } from 'src/service/services.module';
import { WorkReportModule } from 'src/work-report/work-report.module';
import { MembershipModule } from 'src/membership/membership.module';
import { Service, ServiceSchema } from 'src/service/schemas/service.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: ServiceRequest.name, schema: ServiceRequestSchema },
      { name: FormSubmission.name, schema: FormSubmissionSchema },
      { name: Service.name, schema: ServiceSchema },
    ]),
    forwardRef(() => AuthModule),
    UsersModule,
    FormModule,
    forwardRef(() => WorkOrderModule),
    forwardRef(() => ServicesModule),
    WorkReportModule,
    MembershipModule,
  ],
  controllers: [
    ServiceRequestPublicController,
    ServiceRequestInternalController,
  ],
  providers: [ServiceRequestService],
  exports: [ServiceRequestService],
})
export class ServiceRequestModule {}
