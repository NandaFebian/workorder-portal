import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type CompanyTypeDocument = CompanyType & Document;

@Schema({ timestamps: true })
export class CompanyType {
  @Prop({ required: true })
  name: string;

  @Prop()
  description: string;
}

export const CompanyTypeSchema = SchemaFactory.createForClass(CompanyType);
