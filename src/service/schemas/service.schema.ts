import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Schema as MongooseSchema } from 'mongoose';

export type ServiceDocument = Service & Document;

// Skema untuk menyimpan urutan dan referensi form
@Schema({ _id: false })
class OrderedForm {
    @Prop({ required: true })
    order: number;

    @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'FormTemplate', required: true })
    form: MongooseSchema.Types.ObjectId;
}
const OrderedFormSchema = SchemaFactory.createForClass(OrderedForm);

@Schema({ timestamps: true })
export class Service {
    @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'Company', required: true })
    companyId: MongooseSchema.Types.ObjectId;

    @Prop({ required: true })
    title: string;

    @Prop({ required: true })
    description: string;

    @Prop([
        {
            position: {
                type: MongooseSchema.Types.ObjectId,
                ref: 'Position',
                required: true,
            },
            minimumStaff: { type: Number, required: true },
            maximumStaff: { type: Number, required: true },
        },
    ])
    requiredStaff: {
        position: MongooseSchema.Types.ObjectId;
        minimumStaff: number;
        maximumStaff: number;
    }[];

    @Prop({ type: [OrderedFormSchema], default: [] })
    workOrderForms: OrderedForm[];

    @Prop({ type: [OrderedFormSchema], default: [] })
    reportForms: OrderedForm[];

    @Prop({
        required: true,
        enum: ['public', 'member-only', 'internal'],
    })
    accessType: string;

    @Prop({ default: true })
    isActive: boolean;
}

export const ServiceSchema = SchemaFactory.createForClass(Service);