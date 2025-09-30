import { IsEmail, IsEnum, IsNotEmpty, IsString, MinLength } from 'class-validator';

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

    // Untuk awal, kita batasi registrasi hanya untuk role 'client'
    @IsEnum(['client', 'staff_unassigned'], { message: 'Role must be client or staff_unassigned' })
    @IsNotEmpty()
    role: string;
}