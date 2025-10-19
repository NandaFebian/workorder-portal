// src/company/companies.module.ts
import { Module, forwardRef } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Company, CompanySchema } from './schemas/company.schemas';
import { Invitation, InvitationSchema } from './schemas/invitation.schemas';
import { CompaniesService } from './companies.service';
import { CompaniesInternalController } from './companies.internal.controller';
import { CompaniesClientController } from './companies.client.controller';
import { AuthModule } from 'src/auth/auth.module';
import { UsersModule } from 'src/users/users.module';
import { PositionsModule } from 'src/positions/positions.module';
import { ServicesModule } from 'src/service/services.module';

@Module({
    imports: [
        MongooseModule.forFeature([
            { name: Company.name, schema: CompanySchema },
            { name: Invitation.name, schema: InvitationSchema }
        ]),
        UsersModule,
        forwardRef(() => AuthModule),
        PositionsModule,
        ServicesModule,
    ],
    controllers: [
        CompaniesInternalController,
        CompaniesClientController
    ],
    providers: [CompaniesService],
    exports: [CompaniesService],
})
export class CompaniesModule { }