import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Schema as MongooseSchema } from 'mongoose';

export type ClientServiceRequestDocument = ClientServiceRequest & Document;

@Schema({ timestamps: true })
export class ClientServiceRequest {
  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'Service', required: true })
  serviceId: MongooseSchema.Types.ObjectId;

  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'User', required: true })
  requestedBy: MongooseSchema.Types.ObjectId;

  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'Company', required: true })
  companyId: MongooseSchema.Types.ObjectId;

  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'User', default: null })
  approvedBy: MongooseSchema.Types.ObjectId | null;

  @Prop({
    required: true,
    enum: ['received', 'cancelled', 'rejected', 'approved', 'workOrderCreated', 'completed', 'closed'],
    default: 'received',
  })
  serviceRequestStatus: string;

  // Store snapshot form IDs at time of request creation
  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'FormTemplate', default: null })
  intakeFormId: MongooseSchema.Types.ObjectId | null;

  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'FormTemplate', default: null })
  reviewFormId: MongooseSchema.Types.ObjectId | null;

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
  completedAt: Date | null;

  @Prop({ type: Date, default: null })
  closedAt: Date | null;

  @Prop({ type: Date, default: null })
  deletedAt: Date | null;
}

export const ClientServiceRequestSchema =
  SchemaFactory.createForClass(ClientServiceRequest);
