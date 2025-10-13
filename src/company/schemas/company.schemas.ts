import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Schema as MongooseSchema } from 'mongoose';

export type CompanyDocument = Company & Document;

@Schema({ timestamps: true })
export class Company {
    @Prop({ required: true })
    name: string;

    @Prop({ required: false, default: null })
    address: string;

    @Prop({ required: false, default: null })
    description: string;

    @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'User' })
    ownerId: MongooseSchema.Types.ObjectId;

    @Prop({ type: [{ type: MongooseSchema.Types.ObjectId, ref: 'User' }], default: [] })
    managers: MongooseSchema.Types.ObjectId[];

    @Prop({ type: [{ type: MongooseSchema.Types.ObjectId, ref: 'User' }], default: [] })
    staffs: MongooseSchema.Types.ObjectId[];

    @Prop({ default: false })
    isActive: boolean;
}

export const CompanySchema = SchemaFactory.createForClass(Company);