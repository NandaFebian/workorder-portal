import { Module, forwardRef } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Service, ServiceSchema } from './schemas/service.schema';
import { AuthModule } from '../auth/auth.module';
import { UsersModule } from '../users/users.module';
import { FormModule } from 'src/form/form.module';
import { ServicesController } from './services.internal.controller';
import { ServicesClientController } from './services.client.controller';
import { ServicesInternalService } from './services.internal.service';
import { ServicesClientService } from './services.client.service';
import { ServiceRequestModule } from 'src/service-request/service-request.module';
import {
  FormSubmission,
  FormSubmissionSchema,
} from 'src/form/schemas/form-submissions.schema';
import {
  MembershipCode,
  MembershipCodeSchema,
} from 'src/membership/schemas/membership.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Service.name, schema: ServiceSchema },
      { name: FormSubmission.name, schema: FormSubmissionSchema },
      { name: MembershipCode.name, schema: MembershipCodeSchema },
    ]),
    forwardRef(() => AuthModule),
    UsersModule,
    forwardRef(() => FormModule),
    forwardRef(() => ServiceRequestModule),
  ],
  controllers: [ServicesController, ServicesClientController],
  providers: [ServicesInternalService, ServicesClientService],
  exports: [ServicesInternalService, ServicesClientService],
})
export class ServicesModule {}
