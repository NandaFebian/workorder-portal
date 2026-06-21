import { validate } from 'class-validator';
import { UpdateIntegrationConfigDto } from './update-integration-config.dto';
import { plainToInstance } from 'class-transformer';

describe('UpdateIntegrationConfigDto', () => {
  it('should validate successfully with valid URLs when integration_type is external_system', async () => {
    const payload = {
      integration_type: 'external_system',
      external_login_url: 'http://localhost/login',
      external_verify_url: 'http://localhost/verify',
      external_check_memberships_url: 'http://localhost/memberships',
      external_check_status_url: 'http://localhost/status',
    };

    const dto = plainToInstance(UpdateIntegrationConfigDto, payload);
    const errors = await validate(dto);
    expect(errors.length).toBe(0);
  });

  it('should fail validation with invalid URLs when integration_type is external_system', async () => {
    const payload = {
      integration_type: 'external_system',
      external_login_url: 'not-a-url@@@',
    };

    const dto = plainToInstance(UpdateIntegrationConfigDto, payload);
    const errors = await validate(dto);
    expect(errors.length).toBeGreaterThan(0);
    expect(errors[0].property).toBe('external_login_url');
  });

  it('should fail validation when URLs are null and integration_type is external_system', async () => {
    const payload = {
      integration_type: 'external_system',
      external_login_url: null,
    };

    const dto = plainToInstance(UpdateIntegrationConfigDto, payload);
    const errors = await validate(dto);
    expect(errors.length).toBeGreaterThan(0);
    expect(errors[0].property).toBe('external_login_url');
  });

  it('should pass validation when URLs are null and integration_type is claim_token', async () => {
    const payload = {
      integration_type: 'claim_token',
      external_login_url: null,
      external_verify_url: null,
      external_check_memberships_url: null,
      external_check_status_url: null,
    };

    const dto = plainToInstance(UpdateIntegrationConfigDto, payload);
    const errors = await validate(dto);
    expect(errors.length).toBe(0);
  });

  it('should pass validation when URLs are empty string and integration_type is claim_token', async () => {
    const payload = {
      integration_type: 'claim_token',
      external_login_url: '',
      external_verify_url: '',
      external_check_memberships_url: '',
      external_check_status_url: '',
    };

    const dto = plainToInstance(UpdateIntegrationConfigDto, payload);
    const errors = await validate(dto);
    expect(errors.length).toBe(0);
  });

  it('should pass validation when URLs are omitted/undefined and integration_type is claim_token', async () => {
    const payload = {
      integration_type: 'claim_token',
    };

    const dto = plainToInstance(UpdateIntegrationConfigDto, payload);
    const errors = await validate(dto);
    expect(errors.length).toBe(0);
  });

  it('should pass validation with partial update when integration_type is external_system (no URL fields sent)', async () => {
    const payload = {
      integration_type: 'external_system',
      is_integration_active: true,
    };

    const dto = plainToInstance(UpdateIntegrationConfigDto, payload);
    const errors = await validate(dto);
    expect(errors.length).toBe(0);
  });
});
