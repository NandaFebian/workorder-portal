// src/company/companies.module.ts
import { Module, forwardRef } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Company, CompanySchema } from './schemas/company.schemas';
import { Invitation, InvitationSchema } from './schemas/invitation.schemas';
import { CompaniesInternalController } from './companies.internal.controller';
import { CompaniesClientController } from './companies.client.controller';
import { AuthModule } from 'src/auth/auth.module';
import { UsersModule } from 'src/users/users.module';
import { PositionsModule } from 'src/positions/positions.module';
import { ServicesModule } from 'src/service/services.module';
import { CompaniesInternalService } from './companies.internal.service';
import { CompaniesClientService } from './companies.client.service';

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
    providers: [
        CompaniesInternalService, // Provide service internal
        CompaniesClientService    // Provide service client
    ],
    exports: [
        CompaniesInternalService, // Export service internal
        CompaniesClientService    // Export service client
    ],
})
export class CompaniesModule { }