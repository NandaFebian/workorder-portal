// src/positions/schemas/position.schema.ts
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Schema as MongooseSchema } from 'mongoose';

export type PositionDocument = Position & Document;

@Schema({ timestamps: true })
export class Position {
    @Prop({ required: true })
    name: string;

    @Prop({ required: false })
    description: string;

    @Prop({ default: true })
    isActive: boolean;

    @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'Company', default: null })
    companyId: MongooseSchema.Types.ObjectId;

    @Prop({ type: Date, default: null })
    deletedAt: Date;
}

export const PositionSchema = SchemaFactory.createForClass(Position);