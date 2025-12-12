import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Schema as MongooseSchema } from 'mongoose';

export type WorkOrderDocument = WorkOrder & Document;

// 1. Definisikan Schema untuk Form Snapshot
@Schema({ _id: false }) // _id false agar tidak dibuatkan ID baru otomatis jika tidak perlu
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
// Buat factory untuk sub-schema ini (PENTING)
const FormSnapshotSchema = SchemaFactory.createForClass(FormSnapshot);

// 2. Definisikan Schema untuk Item dalam WorkOrderForms
@Schema({ _id: false })
export class WorkOrderFormSnapshot {
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

    // Gunakan SchemaFactory yang sudah dibuat di atas
    @Prop({ type: FormSnapshotSchema })
    form: FormSnapshot;
}
// Buat factory untuk sub-schema ini juga (PENTING)
const WorkOrderFormSnapshotSchema = SchemaFactory.createForClass(WorkOrderFormSnapshot);

// 3. Schema Utama
@Schema({ timestamps: true })
export class WorkOrder {
    @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'ClientServiceRequest', required: true })
    clientServiceRequestId: MongooseSchema.Types.ObjectId;

    @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'User', required: true })
    createdBy: MongooseSchema.Types.ObjectId;

    @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'Service', required: true })
    serviceId: MongooseSchema.Types.ObjectId;

    @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'Company', required: true })
    companyId: MongooseSchema.Types.ObjectId;

    @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'WorkOrder', default: null })
    relatedWorkOrderId: MongooseSchema.Types.ObjectId;

    @Prop({ type: [{ type: MongooseSchema.Types.ObjectId, ref: 'User' }], default: [] })
    assignedStaffs: MongooseSchema.Types.ObjectId[];

    // Gunakan schema factory yang valid
    @Prop({ type: [WorkOrderFormSnapshotSchema], default: [] })
    workOrderForms: WorkOrderFormSnapshot[];

    @Prop({ default: 'drafted' })
    status: string;

    @Prop({ default: null })
    startedAt: Date;

    @Prop({ default: null })
    completedAt: Date;
}

export const WorkOrderSchema = SchemaFactory.createForClass(WorkOrder);