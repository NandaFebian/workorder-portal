import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { WorkOrder, WorkOrderSchema } from './schemas/work-order.schema';
import { WorkOrderService } from './work-order.service';

@Module({
    imports: [
        MongooseModule.forFeature([{ name: WorkOrder.name, schema: WorkOrderSchema }]),
    ],
    providers: [WorkOrderService],
    exports: [WorkOrderService],
})
export class WorkOrderModule { }