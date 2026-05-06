import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Schema as MongooseSchema } from 'mongoose';
import { SubmissionType } from '../../common/enums/submission-type.enum';
import { ApprovalAccessType } from '../../common/enums/approval-access-type.enum';

export type ServiceTemplateDocument = ServiceTemplate & Document;

@Schema({ _id: false })
export class FormTemplateBlueprint {
  @Prop({ required: true })
  title: string;

  @Prop()
  description: string;

  @Prop({ required: true, enum: Object.values(SubmissionType) })
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
    enum: Object.values(ApprovalAccessType),
    default: ApprovalAccessType.AUTO,
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

  @Prop({ type: Object, required: true })
  positionsOnDuty: any;

  @Prop({ type: FormTemplateBlueprintSchema, default: null })
  workOrderForm: FormTemplateBlueprint | null;

  @Prop({ type: FormTemplateBlueprintSchema, default: null })
  workReportForm: FormTemplateBlueprint | null;

  @Prop({
    type: String,
    enum: [ApprovalAccessType.AUTO, ApprovalAccessType.STAFF_PIC, ApprovalAccessType.STAFF_ANY],
    default: ApprovalAccessType.AUTO,
  })
  workOrderApprovalAccessType: string;

  @Prop({
    type: String,
    enum: [ApprovalAccessType.AUTO, ApprovalAccessType.MANAGER],
    default: ApprovalAccessType.AUTO,
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
