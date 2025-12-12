// src/forms/schemas/form-field.schema.ts
import { Prop, Schema } from '@nestjs/mongoose';
import { Option } from './option.schema';

@Schema({ _id: true })
export class FormField {
    @Prop({ required: true })
    order: number;

    @Prop({ required: true })
    label: string;

    @Prop({ required: true })
    type: string;

    @Prop({ required: true, default: false })
    required: boolean;

    @Prop({ required: false })
    placeholder: string;

    @Prop({ type: [Option], required: false, default: undefined })
    options?: Option[];

    @Prop({ required: false })
    min?: number;

    @Prop({ required: false })
    max?: number;
}