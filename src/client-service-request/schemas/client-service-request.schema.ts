import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Schema as MongooseSchema } from 'mongoose';

export type ClientServiceRequestDocument = ClientServiceRequest & Document;

// Schema untuk menyimpan snapshot form definition
@Schema({ _id: false })
class FormSnapshot {
    @Prop()
    _id: MongooseSchema.Types.ObjectId;

    @Prop()
    title: string;

    @Prop()
    description: string;

    @Prop()
    formType: string;
}

@Schema({ _id: false })
class OrderedFormSnapshot {
    @Prop()
    order: number;

    @Prop({ type: FormSnapshot })
    form: FormSnapshot;
}

@Schema({ timestamps: true })
export class ClientServiceRequest {
    @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'Service', required: true })
    serviceId: MongooseSchema.Types.ObjectId;

    @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'User', required: true })
    clientId: MongooseSchema.Types.ObjectId;

    @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'Company', required: true })
    companyId: MongooseSchema.Types.ObjectId;

    // Menyimpan snapshot struktur form intake saat request dibuat
    @Prop({ type: [OrderedFormSnapshot], default: [] })
    clientIntakeForm: OrderedFormSnapshot[];

    @Prop({ required: true, enum: ['received', 'approved', 'rejected'], default: 'received' })
    status: string;
}

export const ClientServiceRequestSchema = SchemaFactory.createForClass(ClientServiceRequest);