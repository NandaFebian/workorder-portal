import { Module, forwardRef } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { HttpModule } from '@nestjs/axios';
import { MembershipController, MembershipCodeController } from './membership.controller';
import { MembershipService } from './membership.service';
import {
  MembershipCode,
  MembershipCodeSchema,
} from './schemas/membership.schema';
import {
  ExternalAccount,
  ExternalAccountSchema,
} from 'src/customer-pairing/schemas/external-account.schema';
import { AuthModule } from 'src/auth/auth.module';
import { UsersModule } from 'src/users/users.module';
import { Company, CompanySchema } from 'src/company/schemas/company.schemas';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: MembershipCode.name, schema: MembershipCodeSchema },
      { name: Company.name, schema: CompanySchema },
      { name: ExternalAccount.name, schema: ExternalAccountSchema },
    ]),
    HttpModule,
    forwardRef(() => AuthModule),
    forwardRef(() => UsersModule),
  ],
  controllers: [MembershipController, MembershipCodeController],
  providers: [MembershipService],
  exports: [MembershipService],
})
export class MembershipModule { }