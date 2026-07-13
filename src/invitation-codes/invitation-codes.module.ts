import { Module, forwardRef } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import {
  InvitationCode,
  InvitationCodeSchema,
} from './schemas/invitation-code.schema';
import { User, UserSchema } from '../users/schemas/user.schema';
import { Company, CompanySchema } from '../company/schemas/company.schemas';
import {
  InvitationCodesController,
  InvitationCodesClaimController,
} from './invitation-codes.controller';
import { InvitationCodesService } from './invitation-codes.service';
import { AuthModule } from '../auth/auth.module';
import { UsersModule } from '../users/users.module';
import { PositionsModule } from '../positions/positions.module';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: InvitationCode.name, schema: InvitationCodeSchema },
      { name: User.name, schema: UserSchema },
      { name: Company.name, schema: CompanySchema },
    ]),
    forwardRef(() => AuthModule),
    UsersModule,
    PositionsModule,
  ],
  controllers: [InvitationCodesController, InvitationCodesClaimController],
  providers: [InvitationCodesService],
  exports: [InvitationCodesService],
})
export class InvitationCodesModule {}
