import { IsNotEmpty, IsArray, ValidateNested, IsMongoId, IsDefined, IsNumber } from 'class-validator';
import { Type } from 'class-transformer';

class FieldDataDto {
    @IsNumber()
    @IsNotEmpty()
    order: number;

    @IsDefined()
    value: any; // Bisa string, number, boolean, array, dll
}

export class SubmissionItemDto {
    @IsMongoId()
    @IsNotEmpty()
    formId: string; // ID dari form yang disubmit (dari reportForms)

    @IsArray()
    @ValidateNested({ each: true })
    @Type(() => FieldDataDto)
    fieldsData: FieldDataDto[];
}

export class SubmitWorkReportFormDto {
    @IsArray()
    @ValidateNested({ each: true })
    @Type(() => SubmissionItemDto)
    submissions: SubmissionItemDto[];
}
