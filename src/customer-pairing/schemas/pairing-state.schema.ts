import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Schema as MongooseSchema } from 'mongoose';

export type PairingStateDocument = PairingState & Document;

@Schema({ timestamps: true })
export class PairingState {
  @Prop({ required: true, unique: true })
  state: string;

  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'User', required: true })
  userId: MongooseSchema.Types.ObjectId;

  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'Company', required: true })
  companyId: MongooseSchema.Types.ObjectId;

  @Prop({ type: Date, default: () => new Date(Date.now() + 10 * 60 * 1000) })
  expiresAt: Date;
}

export const PairingStateSchema = SchemaFactory.createForClass(PairingState);

PairingStateSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });
