import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Schema as MongooseSchema } from 'mongoose';

export type ServiceDocument = Service & Document;

@Schema({ _id: false })
class ServiceRequestConfig {
  @Prop({ type: String, default: null })
  intakeFormKey: string | null;

  @Prop({ type: String, default: null })
  reviewFormKey: string | null;

  @Prop({
    type: String,
    enum: ['auto', 'manager'],
    default: 'auto',
  })
  serviceRequestApprovalAccessType: string;

  @Prop({ default: false })
  reviewNeed: boolean;
}
const ServiceRequestConfigSchema =
  SchemaFactory.createForClass(ServiceRequestConfig);

@Schema({ _id: false })
class WorkOrderConfig {
  @Prop({
    type: MongooseSchema.Types.ObjectId,
    ref: 'Position',
    required: true,
  })
  positionId: MongooseSchema.Types.ObjectId;

  @Prop({ type: String, default: null })
  workOrderFormKey: string | null;

  @Prop({ type: String, default: null })
  workReportFormKey: string | null;

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

  @Prop({ required: true, min: 0 })
  minStaff: number;

  @Prop({ required: true, min: 1 })
  maxStaff: number;
}
const WorkOrderConfigSchema = SchemaFactory.createForClass(WorkOrderConfig);

@Schema({ timestamps: true, versionKey: false })
export class Service {
  @Prop({ required: true, index: true })
  serviceKey: string;

  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'Company', required: true })
  companyId: MongooseSchema.Types.ObjectId;

  @Prop({ required: true })
  title: string;

  @Prop({ required: true })
  description: string;

  @Prop({ required: true, enum: ['public', 'member_only', 'internal'] })
  accessType: string;

  @Prop({ default: true })
  isActive: boolean;

  @Prop({ type: ServiceRequestConfigSchema, default: () => ({}) })
  serviceRequestConfig: ServiceRequestConfig;

  @Prop({ type: [WorkOrderConfigSchema], default: [] })
  workOrdersConfig: WorkOrderConfig[];

  @Prop({ required: true, default: 0 })
  __v: number;

  @Prop({ type: Date, default: null })
  deletedAt: Date;
}

export const ServiceSchema = SchemaFactory.createForClass(Service);
