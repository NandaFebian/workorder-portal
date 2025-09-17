import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { UsersModule } from 'src/users/users.module';
import { CompaniesModule } from 'src/companies/companies.module';
import { ActiveToken, ActiveTokenSchema } from './schemas/active-token.schema';

@Module({
    imports: [
        UsersModule,
        CompaniesModule,
        // Daftarkan skema baru
        MongooseModule.forFeature([{ name: ActiveToken.name, schema: ActiveTokenSchema }]),
    ],
    controllers: [AuthController],
    providers: [AuthService],
})
export class AuthModule { }