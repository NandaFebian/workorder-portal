// src/service/dto/submit-intake-forms.dto.ts
import { Type } from 'class-transformer';
import { IsArray, IsDefined, IsMongoId, IsNotEmpty, IsNumber, IsString, ValidateNested } from 'class-validator';

export class FieldDataDto {
    @IsDefined() // Bisa number atau string sesuai mock (order)
    order: any;

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