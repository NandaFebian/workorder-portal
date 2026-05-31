import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Schema as MongooseSchema } from 'mongoose';

export type ServiceDocument = Service & Document;

@Schema({ _id: false })
class ServiceRequestConfig {
  @Prop({
    type: MongooseSchema.Types.ObjectId,
    ref: 'FormTemplate',
    default: null,
  })
  intakeFormId: MongooseSchema.Types.ObjectId | null;

  @Prop({
    type: MongooseSchema.Types.ObjectId,
    ref: 'FormTemplate',
    default: null,
  })
  reviewFormId: MongooseSchema.Types.ObjectId | null;

  @Prop({
    type: String,
    enum: ['auto', 'manager', 'staff_pic', 'staff_any'],
    default: 'auto',
  })
  serviceRequestApprovalAccessType: string;

  @Prop({ default: false })
  reviewNeed: boolean;
}
const ServiceRequestConfigSchema =
  SchemaFactory.createForClass(ServiceRequestConfig);

@Schema()
class WorkOrderConfig {
  _id?: MongooseSchema.Types.ObjectId;
  @Prop({ type: String, default: null })
  configId: string | null;

  @Prop({
    type: MongooseSchema.Types.ObjectId,
    ref: 'Position',
    required: true,
  })
  positionId: MongooseSchema.Types.ObjectId;

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
  workReportFormId: MongooseSchema.Types.ObjectId | null;

  @Prop({
    type: String,
    enum: ['auto'],
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

  @Prop({ type: Boolean, default: false })
  showReportToRequester: boolean;
}
const WorkOrderConfigSchema = SchemaFactory.createForClass(WorkOrderConfig);

@Schema({
  timestamps: true,
  versionKey: false,
  toJSON: {
    transform: (doc, ret: any) => {
      delete ret.serviceKey;
      return ret;
    },
  },
})
export class Service {
  @Prop({ required: true, index: true })
  serviceKey: string;

  @Prop({
    type: MongooseSchema.Types.ObjectId,
    ref: 'Company',
    required: true,
    index: true,
  })
  companyId: MongooseSchema.Types.ObjectId;

  @Prop({ required: true })
  title: string;

  @Prop({ required: true })
  description: string;

  @Prop({ required: true, enum: ['public', 'member_only', 'internal'] })
  accessType: string;

  @Prop({ default: true })
  isActive: boolean;

  @Prop({
    type: String,
    enum: ['auto', 'manual'],
    default: 'manual',
  })
  draftingWorkOrderType: string;

  @Prop({ type: ServiceRequestConfigSchema, default: () => ({}) })
  serviceRequestConfig: ServiceRequestConfig;

  @Prop({ type: [WorkOrderConfigSchema], default: [] })
  workOrdersConfig: WorkOrderConfig[];

  @Prop({ required: true, default: 0 })
  __v: number;

  @Prop({ type: Date, default: null, index: true })
  deletedAt: Date;
}

export const ServiceSchema = SchemaFactory.createForClass(Service);

ServiceSchema.index({ serviceKey: 1, deletedAt: 1 });
ServiceSchema.index({ companyId: 1, deletedAt: 1 });
ServiceSchema.index({ companyId: 1, isActive: 1, deletedAt: 1 });
