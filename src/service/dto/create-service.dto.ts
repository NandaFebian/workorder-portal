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

// DTO baru untuk merepresentasikan form dengan urutannya
class OrderedFormDto {
    @IsNumber()
    @IsNotEmpty()
    order: number;

    @IsMongoId()
    @IsNotEmpty()
    form: string;
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

    // Menggunakan DTO baru untuk validasi
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

    @IsEnum(['public', 'member-only', 'internal'])
    @IsNotEmpty()
    accessType: string;

    @IsBoolean()
    @IsOptional()
    isActive: boolean;
}