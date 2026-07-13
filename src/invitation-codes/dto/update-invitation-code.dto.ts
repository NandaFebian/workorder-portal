import {
  IsBoolean,
  IsEnum,
  IsInt,
  IsMongoId,
  IsOptional,
  Min,
} from 'class-validator';
import { Role } from 'src/common/enums/role.enum';

export class UpdateInvitationCodeDto {
  @IsOptional()
  @IsEnum([Role.CompanyManager, Role.CompanyStaff], {
    message: `Role must be either ${Role.CompanyManager} or ${Role.CompanyStaff}`,
  })
  role?: string;

  @IsOptional()
  @IsMongoId({ message: 'Position ID must be a valid MongoDB ObjectId' })
  positionId?: string | null;

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;

  @IsOptional()
  @IsInt({ message: 'maxUses must be an integer' })
  @Min(1, { message: 'maxUses must be at least 1' })
  maxUses?: number | null;

  @IsOptional()
  @IsInt({ message: 'expiresInDays must be an integer' })
  @Min(1, { message: 'expiresInDays must be at least 1' })
  expiresInDays?: number | null;
}
