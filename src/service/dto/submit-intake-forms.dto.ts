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

export class SubmissionItemDto {
    @IsMongoId()
    @IsNotEmpty()
    formId: string;

    @IsArray()
    @ValidateNested({ each: true })
    @Type(() => FieldDataDto)
    fieldsData: FieldDataDto[];
}

export class SubmitIntakeFormDto {
    @IsArray()
    @ValidateNested({ each: true })
    @Type(() => SubmissionItemDto)
    submissions: SubmissionItemDto[];
}
