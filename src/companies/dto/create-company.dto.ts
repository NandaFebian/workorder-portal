import { IsNotEmpty, IsOptional, IsString, IsBoolean } from "class-validator";

export class CreateCompanyDto {
    @IsString()
    @IsNotEmpty()
    name: string;

    @IsString()
    @IsOptional()
    address: string;

    @IsString()
    @IsOptional()
    description: string;

    @IsBoolean()
    @IsOptional()
    isActive: boolean;
}