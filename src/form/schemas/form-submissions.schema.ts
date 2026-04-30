import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Schema as MongooseSchema } from 'mongoose';
import { SubmissionType } from '../../common/enums/submission-type.enum';
import { FormSubmissionStatus } from '../../common/enums/form-submission-status.enum';

@Schema({ _id: false })
class FieldData {
  @Prop({ required: true })
  order: number; // Menggunakan order sebagai identifier field sesuai JSON, atau bisa fieldId

  @Prop({ type: MongooseSchema.Types.Mixed })
  value: any;
}
const FieldDataSchema = SchemaFactory.createForClass(FieldData);

export type FormSubmissionDocument = FormSubmission & Document;

@Schema({ timestamps: true })
export class FormSubmission {
  @Prop({
    type: String,
    required: true,
    enum: Object.values(SubmissionType),
    default: SubmissionType.Intake,
  })
  submissionType: SubmissionType; // 'intake', 'work_order', 'report', 'image', dll

  // Owner ID merujuk ke _id dari ServiceRequest
  @Prop({
    type: MongooseSchema.Types.ObjectId,
    required: false,
    default: null,
    index: true,
  })
  ownerId: MongooseSchema.Types.ObjectId;

  @Prop({
    type: MongooseSchema.Types.ObjectId,
    ref: 'FormTemplate',
    required: true,
  })
  formId: MongooseSchema.Types.ObjectId;

  @Prop({
    type: MongooseSchema.Types.ObjectId,
    ref: 'User',
    required: false,
    default: null,
  })
  submittedBy: MongooseSchema.Types.ObjectId | null;

  @Prop({ type: [FieldDataSchema] })
  fieldsData: FieldData[]; // Ubah dari answers ke fieldsData agar sesuai JSON

  @Prop({
    type: String,
    enum: Object.values(FormSubmissionStatus),
    default: FormSubmissionStatus.SUBMITTED,
  })
  status: FormSubmissionStatus;

  @Prop({ type: Date, default: Date.now })
  submittedAt: Date;

  @Prop({ type: Date, default: null })
  deletedAt: Date;
}

export const FormSubmissionSchema =
  SchemaFactory.createForClass(FormSubmission);
