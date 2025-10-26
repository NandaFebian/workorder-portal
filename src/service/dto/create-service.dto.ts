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
    Min, // Import Min jika perlu validasi angka minimum
    ArrayMinSize // Import ArrayMinSize jika perlu validasi jumlah elemen array
} from 'class-validator';
import { Type } from 'class-transformer';

class RequiredStaffDto {
    @IsMongoId({ message: 'positionId must be a valid MongoDB ObjectId' })
    @IsNotEmpty()
    positionId: string;

    @IsNumber()
    @Min(0, { message: 'Minimum staff must be 0 or greater' }) // Contoh validasi tambahan
    @IsNotEmpty()
    minimumStaff: number;

    @IsNumber()
    @Min(1, { message: 'Maximum staff must be at least 1' }) // Contoh validasi tambahan
    @IsNotEmpty()
    maximumStaff: number;

    // Bisa ditambahkan validasi custom: maximumStaff >= minimumStaff jika perlu
}

class OrderedFormDto {
    @IsNumber()
    @Min(1, { message: 'Order must be 1 or greater' })
    @IsNotEmpty()
    order: number;

    @IsString()
    @IsNotEmpty({ message: 'formKey should not be empty' })
    formKey: string;

    @IsArray()
    @IsString({ each: true })
    @IsOptional() // Mungkin bisa opsional atau wajib tergantung kebutuhan
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
    @ArrayMinSize(1, { message: 'At least one required staff must be specified' }) // Contoh: Minimal 1 staff
    requiredStaff: RequiredStaffDto[];

    @IsArray()
    @ValidateNested({ each: true })
    @Type(() => OrderedFormDto)
    @IsOptional()
    workOrderForms?: OrderedFormDto[];

    @IsArray()
    @ValidateNested({ each: true })
    @Type(() => OrderedFormDto)
    @IsOptional()
    reportForms?: OrderedFormDto[];

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
    @Type(() => OrderedFormDto)
    @IsOptional()
    clientIntakeForms?: OrderedFormDto[];
}