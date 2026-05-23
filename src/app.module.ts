import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { FormModule } from './form/form.module';
import { CoreModule } from './core/core.module';
import { OperationsModule } from './operations/operations.module';
import { OrganizationModule } from './organization/organization.module';
import { MembershipModule } from './membership/membership.module';
import { FcmModule } from './fcm/fcm.module';
import { NotificationQueueModule } from './notification-queue/notification-queue.module';
import { StorageModule } from './storage/storage.module';
import { TemplateModule } from './template/template.module';
import { DashboardModule } from './dashboard/dashboard.module';
import { FaqModule } from './faq/faq.module';
import { CustomerPairingModule } from './customer-pairing/customer-pairing.module';
import { ServicePriceModule } from './service-price/service-price.module';

@Module({
  imports: [
    CoreModule,
    AuthModule,
    UsersModule,
    OrganizationModule,
    FormModule,
    OperationsModule,
    MembershipModule,
    FcmModule,
    NotificationQueueModule,
    StorageModule,
    TemplateModule,
    DashboardModule,
    FaqModule,
    CustomerPairingModule,
    ServicePriceModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
