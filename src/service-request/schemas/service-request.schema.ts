import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Schema as MongooseSchema, Types } from 'mongoose';
import { ServiceRequestStatus } from '../../common/enums/service-request-status.enum';
import { ApprovalAccessType } from '../../common/enums/approval-access-type.enum';

export type ServiceRequestDocument = ServiceRequest & Document;

@Schema({ timestamps: true })
export class ServiceRequest {
  @Prop({ type: String, unique: true, sparse: true })
  code: string;

  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'Service', required: true })
  serviceId: Types.ObjectId;

  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'User', required: true })
  requestedBy: Types.ObjectId;

  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'Company', required: true })
  companyId: Types.ObjectId;

  // Snapshot config values from Service at time of SR creation
  @Prop({ type: String, enum: Object.values(ApprovalAccessType), default: ApprovalAccessType.AUTO })
  serviceRequestApprovalAccessType: ApprovalAccessType;

  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'User', default: null })
  staffPIC: Types.ObjectId | null;

  @Prop({ type: Boolean, default: false })
  reviewNeed: boolean;

  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'User', default: null })
  approvedBy: Types.ObjectId | null;

  @Prop({
    required: true,
    enum: Object.values(ServiceRequestStatus),
    default: ServiceRequestStatus.RECEIVED,
  })
  serviceRequestStatus: ServiceRequestStatus;

  // Store snapshot form IDs at time of request creation
  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'FormTemplate', default: null })
  intakeFormId: Types.ObjectId | null;

  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'FormTemplate', default: null })
  reviewFormId: Types.ObjectId | null;

  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'FormSubmission', default: null })
  intakeSubmissionId: Types.ObjectId | null;

  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'FormSubmission', default: null })
  reviewSubmissionId: Types.ObjectId | null;

  // Date tracking per status transition
  @Prop({ type: Date, default: null })
  receivedAt: Date | null;

  @Prop({ type: Date, default: null })
  approvedAt: Date | null;

  @Prop({ type: Date, default: null })
  rejectedAt: Date | null;

  @Prop({ type: Date, default: null })
  cancelledAt: Date | null;

  @Prop({ type: Date, default: null })
  workOrderCreatedAt: Date | null;

  @Prop({ type: Date, default: null })
  onProgressAt: Date | null;

  @Prop({ type: Date, default: null })
  unprocessableAt: Date | null;

  @Prop({ type: Date, default: null })
  partialCompletedAt: Date | null;

  @Prop({ type: Date, default: null })
  failedAt: Date | null;

  @Prop({ type: Date, default: null })
  completedAt: Date | null;

  @Prop({ type: Date, default: null })
  closedAt: Date | null;

  @Prop({ type: Date, default: null })
  deletedAt: Date | null;
}

export const ServiceRequestSchema =
  SchemaFactory.createForClass(ServiceRequest);
