import { IsNotEmpty, IsOptional, IsString, IsBoolean } from "class-validator";

export class CreateCompanyDto {
    @IsString()
    @IsNotEmpty({ message: 'Company name should not be empty' })
    name: string;

    @IsString()
    @IsOptional()
    address?: string;

    @IsString()
    @IsOptional()
    description?: string;

    @IsBoolean()
    @IsOptional()
    isActive?: boolean;
}