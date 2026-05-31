import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Schema as MongooseSchema } from 'mongoose';

export type MembershipCodeDocument = MembershipCode & Document;

@Schema({ timestamps: true })
export class MembershipCode {
  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'Company', required: true })
  companyId: MongooseSchema.Types.ObjectId;

  @Prop({ type: String, required: true })
  externalCustomerEmail: string;

  @Prop({ type: String, required: true })
  externalCustomerName: string;

  @Prop({ required: true, unique: true })
  token: string;

  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'User', default: null })
  claimedBy: MongooseSchema.Types.ObjectId;

  @Prop({ default: null })
  claimedAt: Date;

  @Prop({
    type: String,
    enum: ['external_system', 'claim_token'],
    default: null,
  })
  integrationType: string;

  @Prop({ type: Date, default: null })
  deletedAt: Date;
}

export const MembershipCodeSchema =
  SchemaFactory.createForClass(MembershipCode);
