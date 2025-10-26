import { IsNotEmpty, IsString, IsOptional, IsBoolean } from 'class-validator';

export class CreatePositionDto {
    @IsString()
    @IsNotEmpty({ message: 'Position name should not be empty' })
    name: string;

    @IsString()
    @IsOptional()
    description?: string;

    @IsBoolean()
    @IsOptional()
    isActive?: boolean;
}