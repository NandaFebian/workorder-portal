import { IsBoolean, IsOptional, IsString, IsUrl } from 'class-validator';

export class UpdateIntegrationConfigDto {
  @IsOptional()
  @IsUrl()
  external_login_url?: string;

  @IsOptional()
  @IsUrl()
  external_verify_url?: string;

  @IsOptional()
  @IsUrl()
  external_check_memberships_url?: string;

  @IsOptional()
  @IsString()
  secret_key?: string;

  @IsOptional()
  @IsBoolean()
  is_integration_active?: boolean;
}
