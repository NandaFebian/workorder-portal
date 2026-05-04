// src/template/template.controller.ts
import {
  Controller,
  Get,
  Post,
  Param,
  Body,
  UseGuards,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { TemplateService } from './template.service';
import { AuthGuard } from '../auth/guards/auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { Role } from '../common/enums/role.enum';
import { GetUser } from '../common/decorators/get-user.decorator';
import { AuthenticatedUser } from '../auth/interfaces/authenticated-user.interface';
import { ResponseUtil } from '../common/utils/response.util';

@Controller('template')
@UseGuards(AuthGuard)
export class TemplateController {
  constructor(private readonly templateService: TemplateService) {}

  // ─── Company Types ───────────────────────────────────────────────────────────

  @Get('company-type')
  @HttpCode(HttpStatus.OK)
  async getCompanyTypes() {
    const data = await this.templateService.getCompanyTypes();
    return ResponseUtil.success('Load company types success', data);
  }

  // ─── Service Templates ───────────────────────────────────────────────────────

  @Get('company-type/:companyTypeId/services')
  @HttpCode(HttpStatus.OK)
  async getServicesByCompanyType(
    @Param('companyTypeId') companyTypeId: string,
  ) {
    const data = await this.templateService.getServicesByCompanyType(companyTypeId);
    return ResponseUtil.success('Load service templates success', data);
  }

  @Get('services/:serviceTemplateId')
  @HttpCode(HttpStatus.OK)
  async getServiceTemplatePreview(
    @Param('serviceTemplateId') serviceTemplateId: string,
  ) {
    const data = await this.templateService.getServiceTemplatePreview(serviceTemplateId);
    return ResponseUtil.success('Load service template preview success', data);
  }

  // ─── Generate ────────────────────────────────────────────────────────────────

  @Post('services/generate')
  @HttpCode(HttpStatus.CREATED)
  @UseGuards(RolesGuard)
  @Roles(Role.CompanyOwner, Role.CompanyManager)
  async generateServices(
    @Body('serviceTemplateIds') serviceTemplateIds: string[],
    @GetUser() user: AuthenticatedUser,
  ) {
    const data = await this.templateService.generateServices(user, serviceTemplateIds);
    return ResponseUtil.success('Services generated successfully', data);
  }
}
