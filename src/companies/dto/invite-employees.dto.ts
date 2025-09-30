import { Type } from 'class-transformer';
import { IsArray, IsEmail, IsEnum, IsMongoId, IsNotEmpty, IsString, ValidateNested } from 'class-validator';

class InviteDto {
    @IsEmail()
    @IsNotEmpty()
    email: string;

    @IsEnum(['manager_company', 'staff_company'], { 
        message: 'Role must be either manager_company or staff_company' 
    })
    @IsNotEmpty()
    role: string;

    @IsMongoId({ message: 'Position ID must be a valid MongoDB ObjectId' })
    @IsNotEmpty()
    positionId: string;
}

export class InviteEmployeesDto {
    @IsArray()
    @ValidateNested({ each: true })
    @Type(() => InviteDto)
    invites: InviteDto[];
}
