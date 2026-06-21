import {
  IsBoolean,
  IsOptional,
  IsString,
  IsUrl,
  ValidateIf,
} from 'class-validator';

export class UpdateIntegrationConfigDto {
  @ValidateIf((o) => o.integration_type !== 'claim_token' && o.external_login_url !== undefined)
  @IsUrl({ require_tld: false })
  external_login_url?: string | null;

  @ValidateIf((o) => o.integration_type !== 'claim_token' && o.external_verify_url !== undefined)
  @IsUrl({ require_tld: false })
  external_verify_url?: string | null;

  @ValidateIf((o) => o.integration_type !== 'claim_token' && o.external_check_memberships_url !== undefined)
  @IsUrl({ require_tld: false })
  external_check_memberships_url?: string | null;

  @ValidateIf((o) => o.integration_type !== 'claim_token' && o.external_check_status_url !== undefined)
  @IsUrl({ require_tld: false })
  external_check_status_url?: string | null;

  @IsOptional()
  @IsString()
  secret_key?: string | null;

  @IsOptional()
  @IsBoolean()
  is_integration_active?: boolean;

  @IsOptional()
  @IsString()
  integration_type?: 'external_system' | 'claim_token';
}
