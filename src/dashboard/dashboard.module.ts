import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { DashboardController } from './dashboard.controller';
import { DashboardService } from './dashboard.service';
import { ServiceRequest, ServiceRequestSchema } from '../service-request/schemas/service-request.schema';
import { WorkOrder, WorkOrderSchema } from '../work-order/schemas/work-order.schema';
import { WorkReport, WorkReportSchema } from '../work-report/schemas/work-report.schema';
import { Notification, NotificationSchema } from '../fcm/schemas/notification.schema';
import { User, UserSchema } from '../users/schemas/user.schema';
import { AuthModule } from '../auth/auth.module';
import { UsersModule } from '../users/users.module';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: ServiceRequest.name, schema: ServiceRequestSchema },
      { name: WorkOrder.name, schema: WorkOrderSchema },
      { name: WorkReport.name, schema: WorkReportSchema },
      { name: Notification.name, schema: NotificationSchema },
      { name: User.name, schema: UserSchema },
    ]),
    AuthModule,
    UsersModule,
  ],
  controllers: [DashboardController],
  providers: [DashboardService]
})
export class DashboardModule {}
