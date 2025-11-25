import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { WorkOrder, WorkOrderDocument } from './schemas/work-order.schema';

@Injectable()
export class WorkOrderService {
    constructor(
        @InjectModel(WorkOrder.name) private workOrderModel: Model<WorkOrderDocument>,
    ) { }

    async create(data: any): Promise<WorkOrderDocument> {
        const newWorkOrder = new this.workOrderModel(data);
        return newWorkOrder.save();
    }
}