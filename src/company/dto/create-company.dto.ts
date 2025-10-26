import { IsNotEmpty, IsOptional, IsString, IsBoolean } from "class-validator";

export class CreateCompanyDto {
    @IsString()
    @IsNotEmpty({ message: 'Company name should not be empty' })
    name: string;

    @IsString()
    @IsOptional()
    address?: string; // Tambahkan '?' agar sesuai dengan IsOptional

    @IsString()
    @IsOptional()
    description?: string; // Tambahkan '?' agar sesuai dengan IsOptional

    @IsBoolean()
    @IsOptional()
    isActive?: boolean; // Tambahkan '?' agar sesuai dengan IsOptional
}