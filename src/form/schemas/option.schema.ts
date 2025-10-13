// src/forms/schemas/option.schema.ts
import { Prop, Schema } from '@nestjs/mongoose';

@Schema({ _id: false }) // _id: false karena ini adalah sub-dokumen
export class Option {
    @Prop({ required: true })
    key: string;

    @Prop({ required: true })
    value: string;
}