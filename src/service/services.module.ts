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
import { ClientServiceRequestModule } from 'src/client-service-request/client-service-request.module'; // Import baru
import { FormSubmission, FormSubmissionSchema } from 'src/form/schemas/form-submissions.schema'; // Import schema untuk injeksi manual di service

@Module({
    imports: [
        MongooseModule.forFeature([
            { name: Service.name, schema: ServiceSchema },
            { name: FormSubmission.name, schema: FormSubmissionSchema } // Register model disini jika diinjeksi langsung
        ]),
        forwardRef(() => AuthModule),
        UsersModule,
        forwardRef(() => FormModule),
        ClientServiceRequestModule, // Import Module CSR
    ],
    controllers: [
        ServicesController,
        ServicesClientController
    ],
    providers: [
        ServicesInternalService,
        ServicesClientService
    ],
    exports: [
        ServicesInternalService,
        ServicesClientService
    ],
})
export class ServicesModule { }