import { Module } from '@nestjs/common';
import { WorkOrderModule } from '../work-order/work-order.module';
import { WorkReportModule } from '../work-report/work-report.module';
import { ClientServiceRequestModule } from '../client-service-request/client-service-request.module';
import { ServicesModule } from '../service/services.module';

@Module({
    imports: [
        WorkOrderModule,
        WorkReportModule,
        ClientServiceRequestModule,
        ServicesModule,
    ],
    exports: [
        WorkOrderModule,
        WorkReportModule,
        ClientServiceRequestModule,
        ServicesModule,
    ],
})
export class OperationsModule { }
