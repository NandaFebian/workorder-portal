import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Schema as MongooseSchema } from 'mongoose';
import { FormField } from './form-field.schema';

export type FormTemplateDocument = FormTemplate & Document;

// Nonaktifkan versionKey otomatis dari Mongoose
@Schema({ timestamps: true, versionKey: false })
export class FormTemplate {
    @Prop({ required: true, index: true })
    formKey: string;

    @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'Company', required: true })
    companyId: MongooseSchema.Types.ObjectId;

    @Prop({ required: true })
    title: string;

    @Prop({ required: false })
    description: string;

    @Prop({ required: true, enum: ['work_order', 'report'] })
    formType: string;

    // Definisikan __v secara manual sebagai field biasa
    @Prop({ required: true, default: 0 })
    __v: number;

    @Prop({ type: [FormField] })
    fields: FormField[];
}

export const FormTemplateSchema = SchemaFactory.createForClass(FormTemplate);   