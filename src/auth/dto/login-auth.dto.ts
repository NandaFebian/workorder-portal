import { IsEmail, IsNotEmpty, IsString, MinLength } from 'class-validator';

export class LoginAuthDto {
    @IsEmail({}, { message: 'Email must be a valid email address' }) // Pesan error bisa ditambahkan
    @IsNotEmpty({ message: 'Email should not be empty' })
    email: string;

    @IsString()
    @MinLength(6, { message: 'Password must be at least 6 characters long' })
    @IsNotEmpty({ message: 'Password should not be empty' })
    password: string;
}