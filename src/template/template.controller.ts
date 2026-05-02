import { Controller, Get, Post, Param, Body, UseGuards, Req } from '@nestjs/common';
import { TemplateService } from './template.service';
import { AuthGuard } from '../auth/guards/auth.guard';

@Controller('template')
@UseGuards(AuthGuard)
export class TemplateController {
  constructor(private readonly templateService: TemplateService) { }

  @Get('company-type')
  async getCompanyTypes() {
    return this.templateService.getCompanyTypes();
  }

  @Get('company-type/:companyTypeId/services')
  async getServicesByCompanyType(@Param('companyTypeId') companyTypeId: string) {
    return this.templateService.getServicesByCompanyType(companyTypeId);
  }

  @Get('services/:serviceTemplateId')
  async getServiceTemplate(@Param('serviceTemplateId') serviceTemplateId: string) {
    return this.templateService.getServiceTemplate(serviceTemplateId);
  }

  @Post('services/generate')
  async generateServices(
    @Req() req: any,
    @Body('serviceTemplateIds') serviceTemplateIds: string[],
  ) {
    return this.templateService.generateServices(req.user, serviceTemplateIds);
  }
}
