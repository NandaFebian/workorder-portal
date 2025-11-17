// src/service-requests/dto/create-service-request.dto.ts
import { Type } from 'class-transformer';
import { IsMongoId, IsNotEmpty, IsArray, ValidateNested } from 'class-validator';
import { SubmitFormDto } from 'src/form/dto/submit-form.dto';

export class CreateServiceRequestDto {
    @IsMongoId()
    @IsNotEmpty()
    serviceId: string;

    @IsArray()
    @ValidateNested({ each: true })
    @Type(() => SubmitFormDto)
    intakeFormSubmissions: SubmitFormDto[];
}