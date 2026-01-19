// src/forms/dto/submit-form.dto.ts
import { Type } from 'class-transformer';
import { IsMongoId, IsNotEmpty, IsArray, ValidateNested, IsDefined, IsNumber } from 'class-validator';

export class FieldDataDto {
    @IsNumber()
    @IsNotEmpty()
    order: number;

    @IsDefined()
    value: any;
}

export class SubmitFormDto {
    @IsMongoId()
    @IsNotEmpty()
    formId: string;

    @IsArray()
    @ValidateNested({ each: true })
    @Type(() => FieldDataDto)
    fieldsData: FieldDataDto[];
}
