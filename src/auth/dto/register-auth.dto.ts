// src/auth/dto/register-auth.dto.ts
import { IsEmail, IsEnum, IsNotEmpty, IsString, MinLength } from 'class-validator';
import { Role } from '../../common/enums/role.enum';

export class RegisterAuthDto {
    @IsString()
    @IsNotEmpty()
    name: string;

    @IsEmail()
    @IsNotEmpty()
    email: string;

    @IsString()
    @IsNotEmpty()
    @MinLength(6, { message: 'Password must be at least 6 characters long' })
    password: string;

    @IsEnum([Role.Client, Role.UnassignedStaff], {
        message: `role must be one of the following values: ${[Role.Client, Role.UnassignedStaff].join(', ')}`
    })
    @IsNotEmpty()
    role: string;
}