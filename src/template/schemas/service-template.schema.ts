import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Schema as MongooseSchema } from 'mongoose';

export type ServiceTemplateDocument = ServiceTemplate & Document;

@Schema({ _id: false })
export class FormTemplateBlueprint {
  @Prop({ required: true })
  title: string;

  @Prop()
  description: string;

  @Prop({ required: true, enum: ['intake', 'review', 'work_order', 'report'] })
  formType: string;

  @Prop({ type: [Object], default: [] })
  fields: any[];
}
const FormTemplateBlueprintSchema = SchemaFactory.createForClass(FormTemplateBlueprint);

@Schema({ _id: false })
export class ServiceRequestTemplateConfig {
  @Prop({ type: FormTemplateBlueprintSchema, default: null })
  intakeForm: FormTemplateBlueprint | null;

  @Prop({ type: FormTemplateBlueprintSchema, default: null })
  reviewForm: FormTemplateBlueprint | null;

  @Prop({
    type: String,
    enum: ['auto', 'manager', 'staff_pic', 'staff_any'],
    default: 'auto',
  })
  serviceRequestApprovalAccessType: string;

  @Prop({ default: false })
  reviewNeed: boolean;
}
const ServiceRequestTemplateConfigSchema = SchemaFactory.createForClass(ServiceRequestTemplateConfig);

@Schema({ _id: false })
export class WorkOrderTemplateConfig {
  @Prop({ type: String, default: null })
  configId: string | null;

  @Prop({ required: true })
  positionName: string;

  @Prop({ type: FormTemplateBlueprintSchema, default: null })
  workOrderForm: FormTemplateBlueprint | null;

  @Prop({ type: FormTemplateBlueprintSchema, default: null })
  workReportForm: FormTemplateBlueprint | null;

  @Prop({
    type: String,
    enum: ['auto', 'staff_pic', 'staff_any'],
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
const WorkOrderTemplateConfigSchema = SchemaFactory.createForClass(WorkOrderTemplateConfig);

@Schema({ timestamps: true })
export class ServiceTemplate {
  @Prop({ required: true })
  title: string;

  @Prop({ required: true })
  description: string;

  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'CompanyType', required: true })
  companyTypeId: MongooseSchema.Types.ObjectId;

  @Prop({ type: ServiceRequestTemplateConfigSchema, default: () => ({}) })
  serviceRequestConfig: ServiceRequestTemplateConfig;

  @Prop({ type: [WorkOrderTemplateConfigSchema], default: [] })
  workOrdersConfig: WorkOrderTemplateConfig[];
}

export const ServiceTemplateSchema = SchemaFactory.createForClass(ServiceTemplate);
