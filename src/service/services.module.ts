import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ServicesService } from './services.service';
import { ServicesController } from './services.controller';
import { ServicesClientController } from './services.client.controller';
import { Service, ServiceSchema } from './schemas/service.schema';
import { AuthModule } from '../auth/auth.module';
import { UsersModule } from '../users/users.module';

@Module({
    imports: [
        MongooseModule.forFeature([{ name: Service.name, schema: ServiceSchema }]),
        AuthModule,
        UsersModule,
    ],
    controllers: [
        ServicesController,
        ServicesClientController
    ],
    providers: [ServicesService],
})
export class ServicesModule { }