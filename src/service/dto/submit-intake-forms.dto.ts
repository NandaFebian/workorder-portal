// src/service/dto/submit-intake-forms.dto.ts
import { Type } from 'class-transformer';
import { IsArray, IsDefined, IsMongoId, IsNotEmpty, IsNumber, ValidateNested } from 'class-validator';

export class FieldDataDto {
    @IsNumber()
    @IsNotEmpty()
    order: number;

    @IsDefined()
    value: any;
}

export class SubmitIntakeFormItemDto {
    @IsMongoId()
    @IsNotEmpty()
    formId: string;

    @IsArray()
    @ValidateNested({ each: true })
    @Type(() => FieldDataDto)
    fieldsData: FieldDataDto[];
}