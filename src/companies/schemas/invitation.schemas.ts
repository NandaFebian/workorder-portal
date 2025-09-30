import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Schema as MongooseSchema } from 'mongoose';

export type InvitationDocument = Invitation & Document;

@Schema({ timestamps: true })
export class Invitation {
    @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'Company', required: true })
    companyId: MongooseSchema.Types.ObjectId;

    @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'User', required: true })
    userId: MongooseSchema.Types.ObjectId;

    @Prop({ required: true })
    role: string;

    @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'Position', required: true })
    positionId: MongooseSchema.Types.ObjectId;

    @Prop({ required: true })
    status: string; // 'pending', 'accepted', 'rejected', 'expired'

    @Prop({ required: true })
    expiresAt: Date;
}

export const InvitationSchema = SchemaFactory.createForClass(Invitation);
