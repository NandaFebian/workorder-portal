import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type ServicePriceDocument = ServicePrice & Document;

@Schema({ timestamps: true, versionKey: false })
export class ServicePrice {
  @Prop({ type: String, required: true })
  serviceKey: string;

  @Prop({ type: Number, required: true, min: 0 })
  price: number;

  @Prop({ type: Date, default: null })
  deletedAt: Date | null;
}

export const ServicePriceSchema = SchemaFactory.createForClass(ServicePrice);

ServicePriceSchema.index(
  { serviceKey: 1 },
  { unique: true, partialFilterExpression: { deletedAt: null } },
);
