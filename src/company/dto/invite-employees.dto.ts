// src/company/dto/invite-employees.dto.ts
import { Type } from 'class-transformer';
import { IsArray, IsEmail, IsEnum, IsMongoId, IsNotEmpty, ValidateNested } from 'class-validator';
import { Role } from 'src/common/enums/role.enum';

class InviteDto {
    @IsEmail()
    @IsNotEmpty()
    email: string;

    @IsEnum([Role.CompanyManager, Role.CompanyStaff], {
        message: `role must be one of the following values: ${[Role.CompanyManager, Role.CompanyStaff].join(', ')}`
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