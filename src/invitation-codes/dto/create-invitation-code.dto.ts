import {
  IsEnum,
  IsInt,
  IsMongoId,
  IsNotEmpty,
  IsOptional,
  IsString,
  Length,
  Matches,
  Min,
} from 'class-validator';
import { Role } from 'src/common/enums/role.enum';

export class CreateInvitationCodeDto {
  @IsEnum([Role.CompanyManager, Role.CompanyStaff], {
    message: `Role must be either ${Role.CompanyManager} or ${Role.CompanyStaff}`,
  })
  @IsNotEmpty({ message: 'Role should not be empty' })
  role: string;

  /**
   * Department/position granted on claim.
   * Required when role is company_staff; optional for company_manager —
   * the same rule a regular email invitation applies.
   */
  @IsOptional()
  @IsMongoId({ message: 'Position ID must be a valid MongoDB ObjectId' })
  positionId?: string;

  /** Optional custom code. Auto-generated when omitted. */
  @IsOptional()
  @IsString()
  @Length(4, 32, { message: 'Code must be between 4 and 32 characters' })
  @Matches(/^[A-Za-z0-9_-]+$/, {
    message: 'Code may only contain letters, numbers, hyphens and underscores',
  })
  code?: string;

  /** Maximum number of claims. Omit for unlimited. */
  @IsOptional()
  @IsInt({ message: 'maxUses must be an integer' })
  @Min(1, { message: 'maxUses must be at least 1' })
  maxUses?: number;

  /** Days until the code expires. Omit for no expiry. */
  @IsOptional()
  @IsInt({ message: 'expiresInDays must be an integer' })
  @Min(1, { message: 'expiresInDays must be at least 1' })
  expiresInDays?: number;
}
