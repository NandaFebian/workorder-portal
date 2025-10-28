// src/form/schemas/form-submissions.schema.ts
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Schema as MongooseSchema } from 'mongoose';

@Schema({ _id: false })
class Answer {
    @Prop({ required: true })
    fieldId: string;

    @Prop({ type: MongooseSchema.Types.Mixed })
    value: any;
}

export type FormSubmissionDocument = FormSubmission & Document;

@Schema({ timestamps: true })
export class FormSubmission {
    @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'FormTemplate', required: true })
    formTemplateId: MongooseSchema.Types.ObjectId;

    // --- 👇 PERUBAHAN DI SINI 👇 ---
    @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'User', required: false, default: null })
    submittedById: MongooseSchema.Types.ObjectId | null; // Buat opsional/nullable
    // --- 👆 PERUBAHAN DI SINI 👆 ---

    @Prop({ type: [Answer] })
    answers: Answer[];

    // Opsional: Tambahkan field ini jika Anda ingin melacak service/company
    @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'Service', required: false })
    relatedServiceId?: MongooseSchema.Types.ObjectId;

    @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'Company', required: false })
    companyId?: MongooseSchema.Types.ObjectId;
}

export const FormSubmissionSchema = SchemaFactory.createForClass(FormSubmission);