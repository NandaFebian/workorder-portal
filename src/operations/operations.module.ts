import { Module } from '@nestjs/common';
import { WorkOrderModule } from '../work-order/work-order.module';
import { WorkReportModule } from '../work-report/work-report.module';
import { ServiceRequestModule } from '../service-request/service-request.module';
import { ServicesModule } from '../service/services.module';

@Module({
  imports: [
    WorkOrderModule,
    WorkReportModule,
    ServiceRequestModule,
    ServicesModule,
  ],
  exports: [
    WorkOrderModule,
    WorkReportModule,
    ServiceRequestModule,
    ServicesModule,
  ],
})
export class OperationsModule {}
