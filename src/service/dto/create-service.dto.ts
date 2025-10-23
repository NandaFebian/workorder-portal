// src/service/dto/create-service.dto.ts
import {
    IsArray,
    IsBoolean,
    IsEnum,
    IsMongoId,
    IsNotEmpty,
    IsNumber,
    IsOptional,
    IsString,
    ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';

class RequiredStaffDto {
    @IsMongoId()
    @IsNotEmpty()
    positionId: string;

    @IsNumber()
    @IsNotEmpty()
    minimumStaff: number;

    @IsNumber()
    @IsNotEmpty()
    maximumStaff: number;
}

class OrderedFormDto {
    @IsNumber()
    @IsNotEmpty()
    order: number;

    // --- PERUBAHAN DI SINI ---
    @IsString()
    @IsNotEmpty()
    formKey: string; // Mengganti 'formId'
    // -------------------------

    @IsArray()
    @IsString({ each: true })
    fillableByRoles: string[];

    @IsArray()
    @IsString({ each: true })
    viewableByRoles: string[];

    @IsArray()
    @IsMongoId({ each: true })
    fillableByPositionIds: string[];

    @IsArray()
    @IsMongoId({ each: true })
    viewableByPositionIds: string[];
}

const allowedAccessTypes = ['public', 'member_only', 'internal'];

export class CreateServiceDto {
    @IsString()
    @IsNotEmpty()
    title: string;

    @IsString()
    @IsNotEmpty()
    description: string;

    @IsArray()
    @ValidateNested({ each: true })
    @Type(() => RequiredStaffDto)
    requiredStaff: RequiredStaffDto[];

    @IsArray()
    @ValidateNested({ each: true })
    @Type(() => OrderedFormDto)
    @IsOptional()
    workOrderForms: OrderedFormDto[];

    @IsArray()
    @ValidateNested({ each: true })
    @Type(() => OrderedFormDto)
    @IsOptional()
    reportForms: OrderedFormDto[];

    @IsEnum(allowedAccessTypes, {
        message: `accessType must be one of the following values: ${allowedAccessTypes.join(', ')}`,
    })
    @IsNotEmpty()
    accessType: string;

    @IsBoolean()
    @IsOptional()
    isActive: boolean;

    @IsArray()
    @ValidateNested({ each: true })
    @Type(() => OrderedFormDto)
    @IsOptional()
    clientIntakeForms: OrderedFormDto[];
}