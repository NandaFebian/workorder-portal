// src/company/companies.client.controller.ts
import { Controller, Get, HttpCode, HttpStatus, Param, UseGuards } from '@nestjs/common';
import { CompaniesClientService } from './companies.client.service';
import { OptionalAuthGuard } from 'src/auth/guards/optional-auth.guard';
import { GetUser } from 'src/common/decorators/get-user.decorator';
import { AuthenticatedUser } from 'src/auth/interfaces/authenticated-user.interface';

@Controller('public/companies')
export class CompaniesClientController {
  constructor(private readonly clientService: CompaniesClientService) {}

  @Get()
  @HttpCode(HttpStatus.OK)
  async findAll() {
    const companies = await this.clientService.findAllPublic();
    return {
      message: 'Companies retrieved successfully',
      data: companies,
    };
  }

  // Endpoint: {{base_url}}/public/companies/{{companyId}}
  @Get(':id')
  @UseGuards(OptionalAuthGuard)
  @HttpCode(HttpStatus.OK)
  async findById(
    @Param('id') id: string,
    @GetUser() user: AuthenticatedUser | null,
  ) {
    const { company, isSubscribed } = await this.clientService.findPublicById(id, user);
    return {
      message: 'Company retrieved successfully',
      data: company,
      meta: {
        isSubscribed,
      },
    };
  }

  // Endpoint: {{base_url}}/public/companies/{{companyId}}/services
  @Get(':id/services')
  @UseGuards(OptionalAuthGuard)
  @HttpCode(HttpStatus.OK)
  async findServicesByCompanyId(
    @Param('id') id: string,
    @GetUser() user: AuthenticatedUser | null,
  ) {
    const services = await this.clientService.findPublicServicesByCompanyId(id, user);
    return {
      message: 'Services retrieved successfully',
      data: services,
    };
  }
}
