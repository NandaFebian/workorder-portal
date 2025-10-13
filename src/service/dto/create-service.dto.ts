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
    position: string;

    @IsNumber()
    @IsNotEmpty()
    minimumStaff: number;

    @IsNumber()
    @IsNotEmpty()
    maximumStaff: number;
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
    @IsString({ each: true })
    @IsOptional()
    workOrderFormsKey: string[];

    @IsArray()
    @IsString({ each: true })
    @IsOptional()
    reportFormsKey: string[];

    @IsEnum(['public', 'member-only', 'internal'])
    @IsNotEmpty()
    accessType: string;

    @IsBoolean()
    @IsOptional()
    isActive: boolean;
}