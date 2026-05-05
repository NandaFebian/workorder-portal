// src/company/schemas/company.schemas.ts
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Schema as MongooseSchema } from 'mongoose';

export type CompanyDocument = Company & Document;

@Schema({ timestamps: true }) // Dibiarkan default, __v akan otomatis aktif
export class Company {
  @Prop({ required: true })
  name: string;

  @Prop({ required: false, default: null })
  address: string;

  @Prop({ required: false, default: null })
  description: string;

  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'User' })
  ownerId: MongooseSchema.Types.ObjectId;

  @Prop({
    type: [{ type: MongooseSchema.Types.ObjectId, ref: 'User' }],
    default: [],
  })
  managers: MongooseSchema.Types.ObjectId[];

  @Prop({
    type: [{ type: MongooseSchema.Types.ObjectId, ref: 'User' }],
    default: [],
  })
  staffs: MongooseSchema.Types.ObjectId[];

  @Prop({ default: false })
  isActive: boolean;

  // FAQ Feature
  @Prop({ default: false })
  isFaqActive: boolean;

  @Prop({ type: String, default: null })
  faqApiKey: string | null;

  @Prop({ type: Number, default: null })
  faqExternalCompanyId: number | null;

  @Prop({ type: Date, default: null })
  deletedAt: Date;
}

export const CompanySchema = SchemaFactory.createForClass(Company);
