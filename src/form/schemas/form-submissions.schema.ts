// src/forms/schemas/form-submission.schema.ts
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Schema as MongooseSchema } from 'mongoose';

@Schema({ _id: false })
class Answer {
    @Prop({ required: true })
    fieldId: string; // Merujuk ke _id dari FormField di template

    @Prop({ type: MongooseSchema.Types.Mixed })
    value: any; // Bisa string, number, array, dll.
}

export type FormSubmissionDocument = FormSubmission & Document;

@Schema({ timestamps: true })
export class FormSubmission {
    @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'FormTemplate', required: true })
    formTemplateId: MongooseSchema.Types.ObjectId;

    @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'User', required: true })
    submittedById: MongooseSchema.Types.ObjectId;

    @Prop({ type: [Answer] })
    answers: Answer[];
}

export const FormSubmissionSchema = SchemaFactory.createForClass(FormSubmission);