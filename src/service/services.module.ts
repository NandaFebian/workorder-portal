// src/service/services.module.ts
import { Module, forwardRef } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ServicesService } from './services.service';
import { ServicesController } from './services.controller';
import { ServicesClientController } from './services.client.controller';
import { Service, ServiceSchema } from './schemas/service.schema';
import { AuthModule } from '../auth/auth.module';
import { UsersModule } from '../users/users.module';
import { FormModule } from 'src/form/form.module';

@Module({
    imports: [
        MongooseModule.forFeature([{ name: Service.name, schema: ServiceSchema }]),
        forwardRef(() => AuthModule),
        UsersModule,
        forwardRef(() => FormModule),
    ],
    controllers: [
        ServicesController,
        ServicesClientController
    ],
    providers: [ServicesService],
    exports: [ServicesService],
})
export class ServicesModule { }