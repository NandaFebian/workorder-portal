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
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { TemplateService } from './template.service';
import { AuthGuard } from '../auth/guards/auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { Role } from '../common/enums/role.enum';
import { GetUser } from '../common/decorators/get-user.decorator';
import { AuthenticatedUser } from '../auth/interfaces/authenticated-user.interface';
import { ResponseUtil } from '../common/utils/response.util';

@ApiTags('Templates')
@ApiBearerAuth('access-token')
@Controller('template')
@UseGuards(AuthGuard)
export class TemplateController {
  constructor(private readonly templateService: TemplateService) {}

  // ─── Company Types ───────────────────────────────────────────────────────────

  @Get('company-type')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'List company types' })
  async getCompanyTypes() {
    const data = await this.templateService.getCompanyTypes();
    return ResponseUtil.success('Load company types success', data);
  }

  // ─── Service Templates ───────────────────────────────────────────────────────

  @Get('company-type/:companyTypeId/services')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'List service templates for a company type' })
  async getServicesByCompanyType(
    @Param('companyTypeId') companyTypeId: string,
  ) {
    const data =
      await this.templateService.getServicesByCompanyType(companyTypeId);
    return ResponseUtil.success('Load service templates success', data);
  }

  @Get('services/:serviceTemplateId')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Preview a service template' })
  async getServiceTemplatePreview(
    @Param('serviceTemplateId') serviceTemplateId: string,
  ) {
    const data =
      await this.templateService.getServiceTemplatePreview(serviceTemplateId);
    return ResponseUtil.success('Load service template preview success', data);
  }

  // ─── Generate ────────────────────────────────────────────────────────────────

  @Post('services/generate')
  @HttpCode(HttpStatus.CREATED)
  @UseGuards(RolesGuard)
  @Roles(Role.CompanyOwner, Role.CompanyManager)
  @ApiOperation({ summary: 'Generate services from selected templates' })
  async generateServices(
    @Body('serviceTemplateIds') serviceTemplateIds: any[],
    @GetUser() user: AuthenticatedUser,
  ) {
    // Normalisasi input: dukung baik ["id1"] maupun [{ id: "id1" }] atau [{ serviceTemplateId: "id1" }]
    const normalizedIds = (serviceTemplateIds || [])
      .map((item) => {
        if (typeof item === 'string') return item;
        return item.serviceTemplateId || item.id || item._id;
      })
      .filter(Boolean);

    const data = await this.templateService.generateServices(
      user,
      normalizedIds,
    );
    return ResponseUtil.success('Services generated successfully', data);
  }
}
