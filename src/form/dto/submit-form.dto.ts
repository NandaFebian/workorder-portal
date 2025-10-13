// src/forms/dto/submit-form.dto.ts
import { Type } from 'class-transformer';
import { IsMongoId, IsNotEmpty, IsArray, ValidateNested, IsString, IsDefined } from 'class-validator';

class AnswerDto {
    @IsString()
    @IsNotEmpty()
    fieldId: string;

    @IsDefined()
    value: any;
}

export class SubmitFormDto {
    @IsMongoId()
    @IsNotEmpty()
    formTemplateId: string;

    @IsArray()
    @ValidateNested({ each: true })
    @Type(() => AnswerDto)
    answers: AnswerDto[];
}