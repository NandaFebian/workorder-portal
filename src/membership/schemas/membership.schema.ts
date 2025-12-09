import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Schema as MongooseSchema } from 'mongoose';

export type MembershipCodeDocument = MembershipCode & Document;

@Schema({ timestamps: true })
export class MembershipCode {
    @Prop({ required: true, unique: true })
    code: string;

    @Prop({ default: false })
    isClaimed: boolean;

    @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'User', default: null })
    claimedBy: MongooseSchema.Types.ObjectId;

    @Prop({ default: null })
    claimedAt: Date;
}

export const MembershipCodeSchema = SchemaFactory.createForClass(MembershipCode);
