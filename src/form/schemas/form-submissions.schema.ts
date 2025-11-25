import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Schema as MongooseSchema } from 'mongoose';

@Schema({ _id: false })
class FieldData {
    @Prop({ required: true })
    order: number; // Menggunakan order sebagai identifier field sesuai JSON, atau bisa fieldId

    @Prop({ type: MongooseSchema.Types.Mixed })
    value: any;
}

export type FormSubmissionDocument = FormSubmission & Document;

@Schema({ timestamps: true })
export class FormSubmission {
    @Prop({ type: String, required: true, default: 'intake' })
    submissionType: string; // 'intake', 'work_order', 'report'

    // Owner ID merujuk ke _id dari ClientServiceRequest
    @Prop({ type: MongooseSchema.Types.ObjectId, required: true, index: true })
    ownerId: MongooseSchema.Types.ObjectId;

    @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'FormTemplate', required: true })
    formId: MongooseSchema.Types.ObjectId;

    @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'User', required: false, default: null })
    submittedBy: MongooseSchema.Types.ObjectId | null;

    @Prop({ type: [FieldData] })
    fieldsData: FieldData[]; // Ubah dari answers ke fieldsData agar sesuai JSON

    @Prop({ default: 'submitted' })
    status: string;

    @Prop({ type: Date, default: Date.now })
    submittedAt: Date;
}

export const FormSubmissionSchema = SchemaFactory.createForClass(FormSubmission);