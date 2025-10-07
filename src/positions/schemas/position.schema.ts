// src/positions/schemas/position.schema.ts
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type PositionDocument = Position & Document;

@Schema({ timestamps: true })
export class Position {
    @Prop({ required: true, unique: true }) // Tambahkan unique untuk memastikan tidak ada nama posisi yang sama
    name: string;

    @Prop({ required: false })
    description: string;

    @Prop({ default: true })
    isActive: boolean;
}

export const PositionSchema = SchemaFactory.createForClass(Position);