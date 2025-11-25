// src/client-service-request/client-service-request.module.ts
import { Module, forwardRef } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ClientServiceRequest, ClientServiceRequestSchema } from './schemas/client-service-request.schema';
import { ClientServiceRequestService } from './client-service-request.service';
import { ClientServiceRequestPublicController } from './client-service-request.public.controller';
import { ClientServiceRequestInternalController } from './client-service-request.internal.controller';
import { AuthModule } from 'src/auth/auth.module';
import { UsersModule } from 'src/users/users.module';
import { FormModule } from 'src/form/form.module';
import { FormSubmission, FormSubmissionSchema } from 'src/form/schemas/form-submissions.schema';
import { WorkOrderModule } from 'src/work-order/work-order.module';
import { ServicesModule } from 'src/service/services.module';

@Module({
    imports: [
        MongooseModule.forFeature([
            { name: ClientServiceRequest.name, schema: ClientServiceRequestSchema },
            { name: FormSubmission.name, schema: FormSubmissionSchema }
        ]),
        forwardRef(() => AuthModule),
        UsersModule,
        FormModule,
        WorkOrderModule,
        forwardRef(() => ServicesModule),
    ],
    controllers: [ClientServiceRequestPublicController, ClientServiceRequestInternalController],
    providers: [ClientServiceRequestService],
    exports: [ClientServiceRequestService],
})
export class ClientServiceRequestModule { }