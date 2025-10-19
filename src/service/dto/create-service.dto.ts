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
    positionId: string; // Mengganti 'position' menjadi 'positionId'

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

    @IsMongoId()
    @IsNotEmpty()
    formId: string; // Mengganti 'form' menjadi 'formId'

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

    @IsEnum(['public', 'member_only', 'internal'])
    @IsNotEmpty()
    accessType: string;

    @IsBoolean()
    @IsOptional()
    isActive: boolean;
}