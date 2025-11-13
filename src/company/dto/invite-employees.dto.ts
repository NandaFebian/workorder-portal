import { Type } from 'class-transformer';
import { IsArray, IsEmail, IsEnum, IsMongoId, IsNotEmpty, ValidateNested } from 'class-validator';
import { Role } from 'src/common/enums/role.enum';

// Validasi untuk setiap objek dalam array invites
class InviteDto {
    @IsEmail({}, { message: 'Each invite must have a valid email' })
    @IsNotEmpty({ message: 'Email cannot be empty in an invite' })
    email: string;

    @IsEnum([Role.CompanyManager, Role.CompanyStaff], {
        message: `Role must be either ${Role.CompanyManager} or ${Role.CompanyStaff}`
    })
    @IsNotEmpty({ message: 'Role cannot be empty in an invite' })
    role: string;

    @IsMongoId({ message: 'Position ID must be a valid MongoDB ObjectId' })
    @IsNotEmpty({ message: 'Position ID cannot be empty in an invite' })
    positionId: string;
}

// Validasi untuk DTO utama
export class InviteEmployeesDto {
    @IsArray()
    @ValidateNested({ each: true }) // Validasi setiap elemen dalam array
    @Type(() => InviteDto) // Beri tahu class-validator tipe elemen array
    @IsNotEmpty({ message: 'Invites array should not be empty' })
    invites: InviteDto[];
}