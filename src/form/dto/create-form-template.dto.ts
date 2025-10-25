import { Type } from 'class-transformer';
import {
    IsString, IsNotEmpty, IsArray, ValidateNested, IsEnum,
    IsOptional, IsInt, IsBoolean, IsNumber
} from 'class-validator';

class OptionDto {
    @IsString()
    @IsNotEmpty()
    key: string;

    @IsString()
    @IsNotEmpty()
    value: string;
}

class FormFieldDto {
    @IsInt()
    @IsNotEmpty()
    order: number;

    @IsString()
    @IsNotEmpty()
    label: string;

    @IsString()
    @IsNotEmpty()
    type: string;

    @IsBoolean()
    @IsNotEmpty()
    required: boolean;

    @IsString()
    @IsOptional()
    placeholder?: string;

    @IsArray()
    @ValidateNested({ each: true })
    @Type(() => OptionDto)
    @IsOptional()
    options?: OptionDto[];

    @IsNumber()
    @IsOptional()
    min?: number;

    @IsNumber()
    @IsOptional()
    max?: number;
}

const allowedFormTypes = ['work_order', 'report'] as const;

export class CreateFormTemplateDto {
    @IsString()
    @IsNotEmpty()
    title: string;

    @IsString()
    @IsOptional()
    description?: string;

    @IsEnum(['work_order', 'report'], {
        message: `formType must be one of the following values: ${allowedFormTypes.join(', ')}`,
    })
    @IsNotEmpty()
    formType: string;

    @IsArray()
    @ValidateNested({ each: true })
    @Type(() => FormFieldDto)
    fields: FormFieldDto[];
}