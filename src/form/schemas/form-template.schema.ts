// src/forms/schemas/form-template.schema.ts
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';
import { FormField } from './form-field.schema';

export type FormTemplateDocument = FormTemplate & Document;

@Schema({ timestamps: true })
export class FormTemplate {
    @Prop({ required: true, unique: true })
    title: string; // Menggantikan 'name'

    @Prop({ required: false })
    description: string;

    @Prop({ required: true })
    accessType: string;

    @Prop({ type: [String] })
    accessibleBy: string[];

    @Prop({ type: [String] })
    allowedPositions: string[];

    @Prop({ type: [FormField] })
    fields: FormField[];
}

export const FormTemplateSchema = SchemaFactory.createForClass(FormTemplate);