import { IsArray, IsString, IsNotEmpty, ValidateNested, IsNumber, IsDefined, IsMongoId } from 'class-validator';
import { Type } from 'class-transformer';

class FieldDataDto {
    @IsNumber()
    @IsNotEmpty()
    @Type(() => Number)
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

export class CreateSubmissionsDto {
    @IsArray()
    @ValidateNested({ each: true })
    @Type(() => SubmissionItemDto)
    submissions: SubmissionItemDto[];
}
