// src/company/dto/invite-employees.dto.ts
import { Type } from 'class-transformer';
import { IsArray, IsEmail, IsEnum, IsMongoId, IsNotEmpty, ValidateNested } from 'class-validator';
import { Role } from 'src/common/enums/role.enum';

class InviteDto {
    @IsEmail()
    @IsNotEmpty()
    email: string;

    @IsEnum([Role.CompanyManager, Role.CompanyStaff], {
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