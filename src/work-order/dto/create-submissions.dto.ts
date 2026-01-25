import { IsArray, IsString, IsNotEmpty, ValidateNested, IsOptional, IsDateString, IsNumber } from 'class-validator';
import { Type } from 'class-transformer';

class FieldDataDto {
    @IsNumber()
    @IsNotEmpty()
    order: number;

    @IsNotEmpty()
    value: any;
}

export class SubmissionItemDto {
    @IsString()
    @IsNotEmpty()
    formId: string;

    @IsArray()
    @ValidateNested({ each: true })
    @Type(() => FieldDataDto)
    fieldsData: FieldDataDto[];
}

export class CreateSubmissionsDto {
    @IsArray()
    @ValidateNested({ each: true })
    @Type(() => SubmissionItemDto)
    submissions: SubmissionItemDto[];
}
