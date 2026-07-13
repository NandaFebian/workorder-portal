import { Module } from '@nestjs/common';
import { CompaniesModule } from '../company/companies.module';
import { PositionsModule } from '../positions/positions.module';
import { InvitationsModule } from '../invitations/invitations.module';
import { InvitationCodesModule } from '../invitation-codes/invitation-codes.module';

@Module({
  imports: [
    CompaniesModule,
    PositionsModule,
    InvitationsModule,
    InvitationCodesModule,
  ],
  exports: [
    CompaniesModule,
    PositionsModule,
    InvitationsModule,
    InvitationCodesModule,
  ],
})
export class OrganizationModule {}
