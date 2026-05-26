import { IsOptional, IsString } from 'class-validator';

export class ClaimMemberCodeDto {
  @IsOptional()
  @IsString()
  code?: string;

  @IsOptional()
  @IsString()
  token?: string;

  @IsOptional()
  @IsString()
  companyId?: string;

  @IsOptional()
  @IsString()
  company_id?: string;
}
