import { IsEmail, IsEnum, IsNotEmpty, IsString, MinLength } from 'class-validator';
import { Role } from '../../common/enums/role.enum';

export class RegisterAuthDto {
    @IsString()
    @IsNotEmpty({ message: 'Name is required' })
    name: string;

    @IsEmail({}, { message: 'Email must be a valid email address' })
    @IsNotEmpty({ message: 'Email is required' })
    email: string;

    @IsString()
    @MinLength(6, { message: 'Password must be at least 6 characters long' })
    @IsNotEmpty({ message: 'Password is required' })
    password: string;

    @IsEnum([Role.Client, Role.UnassignedStaff], {
        message: `role must be one of the following values: ${[Role.Client, Role.UnassignedStaff].join(', ')}`
    })
    @IsNotEmpty({ message: 'Role is required' })
    role: string;
}