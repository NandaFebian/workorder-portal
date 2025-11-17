// src/service-requests/dto/intake-submission.dto.ts
import { Type } from 'class-transformer';
import { IsMongoId, IsNotEmpty, IsArray, ValidateNested, IsString, IsOptional } from 'class-validator';
import { IntakeFieldDataDto } from './intake-field-data.dto';

export class IntakeSubmissionDto {
    @IsMongoId()
    @IsNotEmpty()
    formId: string; // Ini 'formId' dari gambar Anda

    @IsString()
    @IsOptional()
    submissionType?: string; // 'submissionType' dari gambar Anda

    @IsArray()
    @ValidateNested({ each: true })
    @Type(() => IntakeFieldDataDto)
    fieldsData: IntakeFieldDataDto[]; // 'fieldsData' dari gambar Anda
}