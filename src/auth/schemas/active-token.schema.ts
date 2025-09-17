import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Schema as MongooseSchema } from 'mongoose';

export type ActiveTokenDocument = ActiveToken & Document;

@Schema({ timestamps: true })
export class ActiveToken {
    @Prop({ required: true, unique: true })
    token: string;

    @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'User', required: true })
    userId: MongooseSchema.Types.ObjectId;
}

export const ActiveTokenSchema = SchemaFactory.createForClass(ActiveToken);