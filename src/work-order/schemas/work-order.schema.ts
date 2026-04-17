import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Schema as MongooseSchema } from 'mongoose';

export type WorkOrderDocument = WorkOrder & Document;

@Schema({ timestamps: true })
export class WorkOrder {
  @Prop({ type: String, unique: true, sparse: true })
  code: string;

  @Prop({
    type: MongooseSchema.Types.ObjectId,
    ref: 'ServiceRequest',
    default: null,
  })
  serviceRequestId: MongooseSchema.Types.ObjectId | null;

  @Prop({ type: String, default: null })
  batchId: string | null;

  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'User', default: null })
  createdBy: MongooseSchema.Types.ObjectId | null;

  @Prop({ type: String, default: null })
  configId: string | null;

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

  // Store single form id (from the matching workOrdersConfig entry)
  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'FormTemplate', default: null })
  workOrderFormId: MongooseSchema.Types.ObjectId | null;

  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'FormTemplate', default: null })
  reportFormId: MongooseSchema.Types.ObjectId | null;

  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'Position', default: null })
  positionId: MongooseSchema.Types.ObjectId | null;

  @Prop({
    type: String,
    enum: ['auto', 'staff_pic'],
    default: 'auto',
  })
  workOrderApprovalAccessType: string;

  @Prop({
    type: String,
    enum: ['auto', 'manager'],
    default: 'auto',
  })
  workReportApprovalAccessType: string;

  @Prop({ default: 0 })
  minStaff: number;

  @Prop({ default: 1 })
  maxStaff: number;

  @Prop({
    required: true,
    enum: ['drafted', 'sent', 'approved', 'rejected', 'cancelled', 'on_progress', 'completed', 'failed'],
    default: 'drafted',
  })
  status: string;

  @Prop({ type: Boolean, default: false })
  has_issue: boolean;

  @Prop({ type: String, default: null })
  issue_note: string | null;

  // Per-status date tracking
  @Prop({ type: Date, default: null })
  draftedAt: Date | null;

  @Prop({ type: Date, default: null })
  sentAt: Date | null;

  @Prop({ type: Date, default: null })
  approvedAt: Date | null;

  @Prop({ type: Date, default: null })
  rejectedAt: Date | null;

  @Prop({ type: Date, default: null })
  startedAt: Date | null;

  @Prop({ type: Date, default: null })
  completedAt: Date | null;

  @Prop({ type: Date, default: null })
  failedAt: Date | null;

  @Prop({ type: Date, default: null })
  cancelledAt: Date | null;

  @Prop({ type: Date, default: null })
  deletedAt: Date | null;
}

export const WorkOrderSchema = SchemaFactory.createForClass(WorkOrder);
