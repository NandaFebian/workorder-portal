import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Schema as MongooseSchema } from 'mongoose';

export type ExternalAccountDocument = ExternalAccount & Document;

@Schema({ timestamps: true })
export class ExternalAccount {
  @Prop({ type: String, required: true })
  externalCustomerEmail: string;

  @Prop({ type: String, required: true })
  externalCustomerName: string;

  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'Company', required: true })
  companyId: MongooseSchema.Types.ObjectId;

  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'User', required: true })
  userId: MongooseSchema.Types.ObjectId;

  @Prop({ type: Date, default: () => new Date() })
  pairedAt: Date;

  @Prop({ type: Date, default: null })
  deletedAt: Date;
}

export const ExternalAccountSchema = SchemaFactory.createForClass(ExternalAccount);

ExternalAccountSchema.index(
  { externalCustomerEmail: 1, companyId: 1 },
  {
    unique: true,
    partialFilterExpression: { deletedAt: null },
  },
);
