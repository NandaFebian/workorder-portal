// src/forms/dto/create-form-template.dto.ts
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

export class CreateFormTemplateDto {
    @IsString()
    @IsNotEmpty()
    title: string;

    @IsString()
    @IsOptional()
    description?: string;

    @IsString()
    @IsNotEmpty()
    accessType: string;

    @IsArray()
    @IsString({ each: true })
    accessibleBy: string[];

    @IsArray()
    @IsString({ each: true })
    allowedPositions: string[];

    @IsArray()
    @ValidateNested({ each: true })
    @Type(() => FormFieldDto)
    fields: FormFieldDto[];
}