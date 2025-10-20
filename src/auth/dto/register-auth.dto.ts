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

    @IsEnum([Role.Client, Role.UnassignedStaff], { message: 'Role must be client or staff_unassigned' })
    @IsNotEmpty()
    role: string;
}