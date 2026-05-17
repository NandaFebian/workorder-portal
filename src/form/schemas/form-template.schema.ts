import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Schema as MongooseSchema } from 'mongoose';
import { FormField } from './form-field.schema';
import { FormType } from '../../common/enums/form-type.enum';


export type FormTemplateDocument = FormTemplate & Document;

// Nonaktifkan versionKey otomatis dari Mongoose
@Schema({
  timestamps: true,
  versionKey: false,
  toJSON: {
    transform: (doc, ret: any) => {
      delete ret.formKey;
      return ret;
    },
  },
})
export class FormTemplate {
  @Prop({ required: true, index: true })
  formKey: string;

  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'Company', required: true })
  companyId: MongooseSchema.Types.ObjectId;

  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'Position', default: null })
  position: MongooseSchema.Types.ObjectId | null;

  @Prop({ required: true })
  title: string;

  @Prop({ required: false })
  description: string;

  @Prop({ required: true, enum: Object.values(FormType) })
  formType: FormType;

  // Definisikan __v secara manual sebagai field biasa
  @Prop({ required: true, default: 0 })
  __v: number;

  @Prop({ type: [FormField] })
  fields: FormField[];

  @Prop({ type: Date, default: null })
  deletedAt: Date;
}

export const FormTemplateSchema = SchemaFactory.createForClass(FormTemplate);
