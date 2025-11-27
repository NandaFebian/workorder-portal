import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Schema as MongooseSchema } from 'mongoose';

export type WorkReportDocument = WorkReport & Document;

// Re-use schema snapshot untuk form (sama seperti di WorkOrder/CSR)
@Schema({ _id: false })
export class FormSnapshot {
    @Prop({ type: MongooseSchema.Types.ObjectId })
    _id: MongooseSchema.Types.ObjectId;

    @Prop()
    title: string;

    @Prop()
    description: string;

    @Prop()
    formType: string;
}
const FormSnapshotSchema = SchemaFactory.createForClass(FormSnapshot);

@Schema({ _id: false })
export class ReportFormSnapshot {
    @Prop()
    order: number;

    @Prop({ type: [String] })
    fillableByRoles: string[];

    @Prop({ type: [String] })
    viewableByRoles: string[];

    @Prop({ type: [{ type: MongooseSchema.Types.ObjectId, ref: 'Position' }] })
    fillableByPositionIds: MongooseSchema.Types.ObjectId[];

    @Prop({ type: [{ type: MongooseSchema.Types.ObjectId, ref: 'Position' }] })
    viewableByPositionIds: MongooseSchema.Types.ObjectId[];

    @Prop({ type: FormSnapshotSchema })
    form: FormSnapshot;
}
const ReportFormSnapshotSchema = SchemaFactory.createForClass(ReportFormSnapshot);

@Schema({ timestamps: true })
export class WorkReport {
    @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'WorkOrder', required: true })
    workOrderId: MongooseSchema.Types.ObjectId;

    @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'Company', required: true })
    companyId: MongooseSchema.Types.ObjectId;

    // Menyimpan daftar form yang harus diisi (Snapshot dari Service.reportForms)
    @Prop({ type: [ReportFormSnapshotSchema], default: [] })
    reportForms: ReportFormSnapshot[]; // Representasi "formsId" dengan detail snapshot

    @Prop({
        required: true,
        enum: ['in_progress', 'completed', 'cancelled', 'rejected'],
        default: 'in_progress'
    })
    status: string;

    @Prop({ default: null })
    startedAt: Date;

    @Prop({ default: null })
    completedAt: Date;
}

export const WorkReportSchema = SchemaFactory.createForClass(WorkReport);