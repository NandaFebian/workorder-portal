// src/service-requests/schemas/client-service-request.schema.ts
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Schema as MongooseSchema } from 'mongoose';

export type ClientServiceRequestDocument = ClientServiceRequest & Document;

export enum RequestStatus {
    RECEIVED = 'received',
    CANCELLED = 'cancelled',
    REJECTED = 'rejected',
    UNDER_REVIEW = 'under_review',
    APPROVED = 'approved',
    WORK_ORDER_CREATED = 'work_order_created',
    COMPLETED = 'completed',
}

@Schema({ timestamps: true })
export class ClientServiceRequest {
    @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'Service', required: true })
    serviceId: MongooseSchema.Types.ObjectId;

    @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'User', required: true })
    clientId: MongooseSchema.Types.ObjectId;

    @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'Company', required: true })
    companyId: MongooseSchema.Types.ObjectId;

    @Prop({
        type: String,
        enum: Object.values(RequestStatus),
        default: RequestStatus.RECEIVED,
        required: true,
    })
    status: string;

    // Ini merujuk ke dokumen FormSubmission yang dibuat
    @Prop({
        type: [{ type: MongooseSchema.Types.ObjectId, ref: 'FormSubmission' }],
        default: [],
    })
    clientIntakeFormSubmissionIds: MongooseSchema.Types.ObjectId[];
}

export const ClientServiceRequestSchema = SchemaFactory.createForClass(ClientServiceRequest);