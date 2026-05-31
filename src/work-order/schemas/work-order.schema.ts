import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Schema as MongooseSchema } from 'mongoose';
import { WorkOrderStatus } from '../../common/enums/work-order-status.enum';
import { ApprovalAccessType } from '../../common/enums/approval-access-type.enum';

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

  @Prop({
    type: MongooseSchema.Types.ObjectId,
    ref: 'Service',
    required: true,
    index: true,
  })
  serviceId: MongooseSchema.Types.ObjectId;

  @Prop({
    type: MongooseSchema.Types.ObjectId,
    ref: 'Company',
    required: true,
    index: true,
  })
  companyId: MongooseSchema.Types.ObjectId;

  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'User', default: null })
  approvedBy: MongooseSchema.Types.ObjectId | null;

  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'User', default: null })
  staffPIC: MongooseSchema.Types.ObjectId | null;

  @Prop({
    type: [{ type: MongooseSchema.Types.ObjectId, ref: 'User' }],
    default: [],
    index: true,
  })
  assignedStaff: MongooseSchema.Types.ObjectId[];

  // Store single form id (from the matching workOrdersConfig entry)
  @Prop({
    type: MongooseSchema.Types.ObjectId,
    ref: 'FormTemplate',
    default: null,
  })
  workOrderFormId: MongooseSchema.Types.ObjectId | null;

  @Prop({
    type: MongooseSchema.Types.ObjectId,
    ref: 'FormTemplate',
    default: null,
  })
  reportFormId: MongooseSchema.Types.ObjectId | null;

  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'Position', default: null })
  positionId: MongooseSchema.Types.ObjectId | null;

  @Prop({
    type: String,
    enum: [ApprovalAccessType.AUTO, ApprovalAccessType.STAFF_PIC],
    default: ApprovalAccessType.AUTO,
  })
  workOrderApprovalAccessType: ApprovalAccessType;

  @Prop({
    type: String,
    enum: [ApprovalAccessType.AUTO, ApprovalAccessType.MANAGER],
    default: ApprovalAccessType.AUTO,
  })
  workReportApprovalAccessType: ApprovalAccessType;

  @Prop({ default: 0 })
  minStaff: number;

  @Prop({ default: 1 })
  maxStaff: number;

  @Prop({
    required: true,
    enum: Object.values(WorkOrderStatus),
    default: WorkOrderStatus.DRAFTED,
    index: true,
  })
  status: WorkOrderStatus;

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

  @Prop({ type: Date, default: null, index: true })
  deletedAt: Date | null;
}

export const WorkOrderSchema = SchemaFactory.createForClass(WorkOrder);

WorkOrderSchema.index({ companyId: 1, deletedAt: 1 });
WorkOrderSchema.index({ companyId: 1, status: 1, deletedAt: 1 });
WorkOrderSchema.index({ serviceRequestId: 1, deletedAt: 1 });
WorkOrderSchema.index({ assignedStaff: 1, status: 1, deletedAt: 1 });
