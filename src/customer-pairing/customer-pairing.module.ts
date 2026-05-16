import { Module, forwardRef } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { HttpModule } from '@nestjs/axios';
import { CustomerPairingController } from './customer-pairing.controller';
import { CustomerPairingService } from './customer-pairing.service';
import {
  ExternalAccount,
  ExternalAccountSchema,
} from './schemas/external-account.schema';
import {
  PairingState,
  PairingStateSchema,
} from './schemas/pairing-state.schema';
import { Company, CompanySchema } from 'src/company/schemas/company.schemas';
import { AuthModule } from 'src/auth/auth.module';
import { UsersModule } from 'src/users/users.module';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: ExternalAccount.name, schema: ExternalAccountSchema },
      { name: PairingState.name, schema: PairingStateSchema },
      { name: Company.name, schema: CompanySchema },
    ]),
    HttpModule,
    forwardRef(() => AuthModule),
    forwardRef(() => UsersModule),
  ],
  controllers: [CustomerPairingController],
  providers: [CustomerPairingService],
  exports: [CustomerPairingService],
})
export class CustomerPairingModule {}
