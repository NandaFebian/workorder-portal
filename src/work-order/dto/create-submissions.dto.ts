import { IsArray, IsString, IsNotEmpty, ValidateNested, IsOptional, IsDateString } from 'class-validator';
import { Type } from 'class-transformer';

class FieldDataDto {
    @IsString()
    @IsNotEmpty()
    order: string;

    value: any;
}

class SubmissionDto {
    @IsString()
    @IsOptional()
    _id?: string;

    @IsString()
    @IsNotEmpty()
    ownerId: string;

    @IsString()
    @IsNotEmpty()
    formId: string;

    @IsString()
    @IsNotEmpty()
    submissionType: string;

    @IsArray()
    @ValidateNested({ each: true })
    @Type(() => FieldDataDto)
    fieldsData: FieldDataDto[];

    @IsString()
    @IsNotEmpty()
    status: string;

    @IsString()
    @IsNotEmpty()
    submittedBy: string;

    @IsDateString()
    @IsOptional()
    createdAt?: string;

    @IsDateString()
    @IsOptional()
    updatedAt?: string;

    @IsDateString()
    @IsOptional()
    submittedAt?: string;
}

export class CreateSubmissionsDto {
    @IsArray()
    @ValidateNested({ each: true })
    @Type(() => SubmissionDto)
    submissions: SubmissionDto[];
}
