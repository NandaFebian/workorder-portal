import { Type } from 'class-transformer';
import {
  IsString,
  IsNotEmpty,
  IsArray,
  ValidateNested,
  IsEnum,
  IsOptional,
  IsInt,
  IsBoolean,
  IsNumber,
} from 'class-validator';
import { FormType } from '../../common/enums/form-type.enum';
import { FieldType } from '../../common/enums/field-type.enum';

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

  @IsEnum(FieldType, {
    message: 'type must be a valid FieldType enum value',
  })
  @IsNotEmpty()
  type: FieldType;

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

  @IsEnum(FormType, {
    message: `formType must be a valid FormType enum value`,
  })
  @IsNotEmpty()
  formType: FormType;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => FormFieldDto)
  fields: FormFieldDto[];
}
