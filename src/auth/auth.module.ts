import { Module, forwardRef } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { UsersModule } from '../users/users.module';
import { CompaniesModule } from '../company/companies.module';
import { ActiveToken, ActiveTokenSchema } from './schemas/active-token.schema';
import { AuthGuard } from './guards/auth.guard';
import { JwtStrategy } from './strategies/jwt.strategy';

@Module({
    imports: [
        UsersModule,
        forwardRef(() => CompaniesModule),
        PassportModule.register({ defaultStrategy: 'jwt' }),
        JwtModule.registerAsync({
            imports: [ConfigModule],
            useFactory: async (configService: ConfigService) => ({
                secret: configService.get<string>('JWT_SECRET') || 'default-secret-key',
                signOptions: {
                    expiresIn: (configService.get<string>('JWT_EXPIRATION') || '7d') as any,
                },
            }),
            inject: [ConfigService],
        }),
        MongooseModule.forFeature([{ name: ActiveToken.name, schema: ActiveTokenSchema }]),
    ],
    controllers: [AuthController],
    providers: [
        AuthService,
        AuthGuard,
        JwtStrategy,
    ],
    exports: [
        AuthGuard,
        JwtStrategy,
        PassportModule,
        JwtModule,
    ]
})
export class AuthModule { }