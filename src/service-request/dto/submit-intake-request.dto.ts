// src/service-requests/dto/submit-intake-request.dto.ts
import { Type } from 'class-transformer';
import { IsArray, ValidateNested } from 'class-validator';
import { SubmitFormDto } from 'src/form/dto/submit-form.dto';

export class SubmitIntakeRequestDto {
    @IsArray()
    @ValidateNested({ each: true })
    @Type(() => SubmitFormDto)
    intakeFormSubmissions: SubmitFormDto[];
}