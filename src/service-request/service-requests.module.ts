// src/service-requests/service-requests.module.ts
import { Module, forwardRef } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import {
    ClientServiceRequest,
    ClientServiceRequestSchema,
} from './schemas/client-service-request.schema';
import { ServiceRequestsController } from './service-requests.controller';
import { ServiceRequestsService } from './service-requests.service';
import { AuthModule } from 'src/auth/auth.module';
import { FormModule } from 'src/form/form.module';
import { ServicesModule } from 'src/service/services.module';
import { UsersModule } from 'src/users/users.module'; // <-- 1. WAJIB ADA DI SINI

@Module({
    imports: [
        MongooseModule.forFeature([
            { name: ClientServiceRequest.name, schema: ClientServiceRequestSchema },
        ]),
        forwardRef(() => AuthModule),
        FormModule, // Dibutuhkan untuk FormsService
        forwardRef(() => ServicesModule), // Dibutuhkan untuk ServicesClientService
        UsersModule, // <-- 2. TAMBAHKAN KEMBALI
    ],
    controllers: [ServiceRequestsController],
    providers: [ServiceRequestsService],
    exports: [ServiceRequestsService],
})
export class ServiceRequestsModule { }