import { Module, forwardRef } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { UsersModule } from '../users/users.module';
import { CompaniesModule } from '../company/companies.module';
import { ActiveToken, ActiveTokenSchema } from './schemas/active-token.schema';
import { AuthGuard } from './guards/auth.guard'; // <-- 1. Impor Guard

@Module({
    imports: [
        UsersModule,
        forwardRef(() => CompaniesModule),
        MongooseModule.forFeature([{ name: ActiveToken.name, schema: ActiveTokenSchema }]),
    ],
    controllers: [AuthController],
    providers: [
        AuthService,
        AuthGuard // <-- 2. Daftarkan sebagai provider
    ],
    exports: [
        AuthGuard, // <-- 3. Ekspor agar bisa dipakai modul lain
        MongooseModule.forFeature([{ name: ActiveToken.name, schema: ActiveTokenSchema }])
    ]
})
export class AuthModule { }