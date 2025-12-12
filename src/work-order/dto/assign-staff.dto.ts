import { IsArray, IsEmail, IsNotEmpty } from 'class-validator';

export class AssignStaffDto {
    @IsArray()
    @IsNotEmpty()
    @IsEmail({}, { each: true })
    staffEmail: string[];
}
