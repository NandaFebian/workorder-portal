import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { MembershipController, MembershipCodeController } from './membership.controller';
import { MembershipService } from './membership.service';
import {
  MembershipCode,
  MembershipCodeSchema,
} from './schemas/membership.schema';
import { AuthModule } from 'src/auth/auth.module';
import { UsersModule } from 'src/users/users.module';
import { Company, CompanySchema } from 'src/company/schemas/company.schemas';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: MembershipCode.name, schema: MembershipCodeSchema },
      { name: Company.name, schema: CompanySchema },
    ]),
    AuthModule,
    UsersModule,
  ],
  controllers: [MembershipController, MembershipCodeController],
  providers: [MembershipService],
})
export class MembershipModule {}
