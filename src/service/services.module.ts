// src/service/services.module.ts
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
import { ServiceRequestsModule } from 'src/service-request/service-requests.module';

@Module({
    imports: [
        MongooseModule.forFeature([{ name: Service.name, schema: ServiceSchema }]),
        forwardRef(() => AuthModule),
        UsersModule,
        forwardRef(() => FormModule),
        forwardRef(() => ServiceRequestsModule),
    ],
    controllers: [
        ServicesController,
        ServicesClientController
    ],
    providers: [
        ServicesInternalService, // Provide service internal
        ServicesClientService    // Provide service client
    ],
    exports: [
        ServicesInternalService, // Export service internal
        ServicesClientService    // Export service client
    ],
})
export class ServicesModule { }