// src/app.module.ts
import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { MongooseModule } from '@nestjs/mongoose';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { CompaniesModule } from './company/companies.module';
import { PositionsModule } from './positions/positions.module';
import { FormModule } from './form/form.module';
import { ServicesModule } from './service/services.module';
import { InvitationsModule } from './invitations/invitations.module';
import { ClientServiceRequestModule } from './client-service-request/client-service-request.module';
import { WorkOrderModule } from './work-order/work-order.module';
import { WorkReportModule } from './work-report/work-report.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    MongooseModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => ({
        uri: configService.get<string>('MONGO_URI'),
      }),
      inject: [ConfigService],
    }),
    AuthModule,
    UsersModule,
    CompaniesModule,
    PositionsModule,
    FormModule,
    ServicesModule,
    InvitationsModule,
    ClientServiceRequestModule,
    WorkOrderModule,
    WorkReportModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule { }