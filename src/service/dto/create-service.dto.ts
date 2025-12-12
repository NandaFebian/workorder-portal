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
    Min,
    ArrayMinSize
} from 'class-validator';
import { Type } from 'class-transformer';

// DTO untuk Staff
class RequiredStaffDto {
    @IsMongoId({ message: 'positionId must be a valid MongoDB ObjectId' })
    @IsNotEmpty()
    positionId: string;

    @IsNumber()
    @Min(0, { message: 'Minimum staff must be 0 or greater' })
    @IsNotEmpty()
    minimumStaff: number;

    @IsNumber()
    @Min(1, { message: 'Maximum staff must be at least 1' })
    @IsNotEmpty()
    maximumStaff: number;
}

// DTO untuk Work Order & Report Forms (Dengan role/position)
class OrderedFormWithAccessDto {
    @IsNumber()
    @Min(1, { message: 'Order must be 1 or greater' })
    @IsNotEmpty()
    order: number;

    @IsMongoId({ message: 'formId must be a valid MongoDB ObjectId' })
    @IsNotEmpty({ message: 'formId should not be empty' })
    formId: string;

    @IsArray()
    @IsString({ each: true })
    @IsOptional()
    fillableByRoles?: string[];

    @IsArray()
    @IsString({ each: true })
    @IsOptional()
    viewableByRoles?: string[];

    @IsArray()
    @IsMongoId({ each: true, message: 'Each fillableByPositionIds must be a valid MongoDB ObjectId' })
    @IsOptional()
    fillableByPositionIds?: string[];

    @IsArray()
    @IsMongoId({ each: true, message: 'Each viewableByPositionIds must be a valid MongoDB ObjectId' })
    @IsOptional()
    viewableByPositionIds?: string[];
}

export class ClientIntakeFormDto {
    @IsNumber()
    @Min(1, { message: 'Order must be 1 or greater' })
    @IsNotEmpty()
    order: number;

    @IsMongoId({ message: 'formId must be a valid MongoDB ObjectId' })
    @IsNotEmpty({ message: 'formId should not be empty' })
    formId: string;
}

const allowedAccessTypes = ['public', 'member_only', 'internal'];

export class CreateServiceDto {
    @IsString()
    @IsNotEmpty({ message: 'Title should not be empty' })
    title: string;

    @IsString()
    @IsNotEmpty({ message: 'Description should not be empty' })
    description: string;

    @IsArray()
    @ValidateNested({ each: true })
    @Type(() => RequiredStaffDto)
    @ArrayMinSize(1, { message: 'At least one required staff must be specified' })
    requiredStaffs: RequiredStaffDto[];

    // Gunakan DTO dengan akses kontrol
    @IsArray()
    @ValidateNested({ each: true })
    @Type(() => OrderedFormWithAccessDto)
    @IsOptional()
    workOrderForms?: OrderedFormWithAccessDto[];

    // Gunakan DTO dengan akses kontrol
    @IsArray()
    @ValidateNested({ each: true })
    @Type(() => OrderedFormWithAccessDto)
    @IsOptional()
    reportForms?: OrderedFormWithAccessDto[];

    @IsEnum(allowedAccessTypes, {
        message: `accessType must be one of the following values: ${allowedAccessTypes.join(', ')}`,
    })
    @IsNotEmpty()
    accessType: string;

    @IsBoolean()
    @IsOptional()
    isActive?: boolean;

    @IsArray()
    @ValidateNested({ each: true })
    @Type(() => ClientIntakeFormDto)
    @IsOptional()
    clientIntakeForms?: ClientIntakeFormDto[];
}