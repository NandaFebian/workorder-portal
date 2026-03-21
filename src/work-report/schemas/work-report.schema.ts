import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Schema as MongooseSchema } from 'mongoose';

export type WorkReportDocument = WorkReport & Document;

@Schema({ timestamps: true })
export class WorkReport {
  @Prop({
    type: MongooseSchema.Types.ObjectId,
    ref: 'WorkOrder',
    required: true,
  })
  workOrderId: MongooseSchema.Types.ObjectId;

  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'Company', required: true })
  companyId: MongooseSchema.Types.ObjectId;

  // Store single form key (from the matching workOrdersConfig entry)
  @Prop({ type: String, default: null })
  reportFormKey: string | null;

  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'User', default: null })
  approvedBy: MongooseSchema.Types.ObjectId | null;

  @Prop({
    required: true,
    enum: ['drafted', 'in_progress', 'completed', 'cancelled', 'rejected'],
    default: 'drafted',
  })
  status: string;

  @Prop({ type: Date, default: null })
  startedAt: Date | null;

  @Prop({ type: Date, default: null })
  completedAt: Date | null;

  @Prop({ type: Date, default: null })
  deletedAt: Date | null;
}

export const WorkReportSchema = SchemaFactory.createForClass(WorkReport);
