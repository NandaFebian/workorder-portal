import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Schema as MongooseSchema } from 'mongoose';

export type WorkOrderDocument = WorkOrder & Document;

@Schema({ timestamps: true })
export class WorkOrder {
  @Prop({
    type: MongooseSchema.Types.ObjectId,
    ref: 'ClientServiceRequest',
    default: null,
  })
  clientServiceRequestId: MongooseSchema.Types.ObjectId | null;

  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'User', required: true })
  createdBy: MongooseSchema.Types.ObjectId;

  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'Service', required: true })
  serviceId: MongooseSchema.Types.ObjectId;

  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'Company', required: true })
  companyId: MongooseSchema.Types.ObjectId;

  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'User', default: null })
  approvedBy: MongooseSchema.Types.ObjectId | null;

  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'User', default: null })
  staffPIC: MongooseSchema.Types.ObjectId | null;

  @Prop({
    type: [{ type: MongooseSchema.Types.ObjectId, ref: 'User' }],
    default: [],
  })
  assignedStaff: MongooseSchema.Types.ObjectId[];

  // Store single form key (from the matching workOrdersConfig entry)
  @Prop({ type: String, default: null })
  workOrderFormKey: string | null;

  @Prop({
    required: true,
    enum: ['drafted', 'ready', 'inProgress', 'completed', 'cancelled'],
    default: 'drafted',
  })
  status: string;

  // Per-status date tracking
  @Prop({ type: Date, default: null })
  readyAt: Date | null;

  @Prop({ type: Date, default: null })
  startedAt: Date | null;

  @Prop({ type: Date, default: null })
  completedAt: Date | null;

  @Prop({ type: Date, default: null })
  cancelledAt: Date | null;

  @Prop({ type: Date, default: null })
  deletedAt: Date | null;
}

export const WorkOrderSchema = SchemaFactory.createForClass(WorkOrder);
