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

  // Store single form id (from the matching workOrdersConfig entry)
  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'FormTemplate', default: null })
  reportFormId: MongooseSchema.Types.ObjectId | null;

  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'User', default: null })
  approvedBy: MongooseSchema.Types.ObjectId | null;

  @Prop({
    type: String,
    enum: ['auto', 'manager'],
    default: 'auto',
  })
  workReportApprovalAccessType: string;

  @Prop({
    required: true,
    enum: ['drafted', 'onProgress', 'submitted', 'rejected', 'approved'],
    default: 'drafted',
  })
  status: string;

  @Prop({ type: Date, default: null })
  startedAt: Date | null;

  @Prop({ type: Date, default: null })
  submittedAt: Date | null;

  @Prop({ type: Date, default: null })
  approvedAt: Date | null;

  @Prop({ type: Date, default: null })
  rejectedAt: Date | null;

  @Prop({ type: Date, default: null })
  deletedAt: Date | null;
}

export const WorkReportSchema = SchemaFactory.createForClass(WorkReport);
