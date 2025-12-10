// src/service/schemas/service.schema.ts
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Schema as MongooseSchema } from 'mongoose';

export type ServiceDocument = Service & Document;

// Skema untuk menyimpan form yang terhubung dengan service beserta hak aksesnya
@Schema({ _id: false })
class OrderedForm {
    @Prop({ required: true })
    order: number;

    // --- PERUBAHAN DI SINI ---
    @Prop({ type: String, ref: 'FormTemplate', required: true })
    formKey: string; // Mengganti 'formId' (ObjectId) menjadi 'formKey' (String)
    // -------------------------

    @Prop({ type: [String], required: true })
    fillableByRoles: string[];

    @Prop({ type: [String], required: true })
    viewableByRoles: string[];

    @Prop({ type: [{ type: MongooseSchema.Types.ObjectId, ref: 'Position' }], required: true })
    fillableByPositionIds: MongooseSchema.Types.ObjectId[];

    @Prop({ type: [{ type: MongooseSchema.Types.ObjectId, ref: 'Position' }], required: true })
    viewableByPositionIds: MongooseSchema.Types.ObjectId[];
}
export const OrderedFormSchema = SchemaFactory.createForClass(OrderedForm);

@Schema({ timestamps: true, versionKey: false })
export class Service {
    @Prop({ required: true, index: true })
    serviceKey: string;

    @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'Company', required: true })
    companyId: MongooseSchema.Types.ObjectId;

    @Prop({ required: true })
    title: string;

    @Prop({ required: true })
    description: string;

    @Prop([
        {
            positionId: { type: MongooseSchema.Types.ObjectId, ref: 'Position', required: true }, // Mengganti 'position' menjadi 'positionId'
            minimumStaff: { type: Number, required: true },
            maximumStaff: { type: Number, required: true },
        },
    ])
    requiredStaffs: {
        positionId: MongooseSchema.Types.ObjectId;
        minimumStaff: number;
        maximumStaff: number;
    }[];

    @Prop({ type: [OrderedFormSchema], default: [] })
    workOrderForms: OrderedForm[];

    @Prop({ type: [OrderedFormSchema], default: [] })
    reportForms: OrderedForm[];

    @Prop({ type: [OrderedFormSchema], default: [] })
    clientIntakeForms: OrderedForm[];

    @Prop({ required: true, enum: ['public', 'member_only', 'internal'] })
    accessType: string;

    @Prop({ default: true })
    isActive: boolean;

    @Prop({ required: true, default: 0 })
    __v: number;
}

export const ServiceSchema = SchemaFactory.createForClass(Service);