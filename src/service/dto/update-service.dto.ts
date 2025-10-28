// src/service/dto/update-service.dto.ts
import { PartialType } from '@nestjs/mapped-types';
import { CreateServiceDto, ClientIntakeFormDto } from './create-service.dto'; // Import ClientIntakeFormDto
import { IsArray, IsOptional, ValidateNested } from 'class-validator'; // Import decorator yang diperlukan
import { Type } from 'class-transformer';

export class UpdateServiceDto extends PartialType(CreateServiceDto) {
    @IsArray()
    @ValidateNested({ each: true })
    @Type(() => ClientIntakeFormDto)
    @IsOptional()
    clientIntakeForms?: ClientIntakeFormDto[];
}