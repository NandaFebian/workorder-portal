import { Module } from '@nestjs/common';
import { CompaniesModule } from '../company/companies.module';
import { PositionsModule } from '../positions/positions.module';
import { InvitationsModule } from '../invitations/invitations.module';

@Module({
    imports: [
        CompaniesModule,
        PositionsModule,
        InvitationsModule,
    ],
    exports: [
        CompaniesModule,
        PositionsModule,
        InvitationsModule,
    ],
})
export class OrganizationModule { }
