import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Schema as MongooseSchema } from 'mongoose';

export type ServiceDocument = Service & Document;

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

    @Prop([String])
    workOrderFormsKey: string[];

    @Prop([String])
    reportFormsKey: string[];

    @Prop({
        required: true,
        enum: ['public', 'member-only', 'internal'],
    })
    accessType: string;

    @Prop({ default: true })
    isActive: boolean;
}

export const ServiceSchema = SchemaFactory.createForClass(Service);