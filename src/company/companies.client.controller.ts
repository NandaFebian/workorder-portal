// src/company/companies.client.controller.ts
import {
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { CompaniesClientService } from './companies.client.service';
import { OptionalAuthGuard } from 'src/auth/guards/optional-auth.guard';
import { GetUser } from 'src/common/decorators/get-user.decorator';
import { AuthenticatedUser } from 'src/auth/interfaces/authenticated-user.interface';

@ApiTags('Companies (Client)')
@Controller('public/companies')
export class CompaniesClientController {
  constructor(private readonly clientService: CompaniesClientService) {}

  @Get()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'List all public companies' })
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
  @ApiOperation({ summary: 'Get a public company by id' })
  async findById(
    @Param('id') id: string,
    @GetUser() user: AuthenticatedUser | null,
  ) {
    const { company, isSubscribed, isIntegrationActive, integrationType } =
      await this.clientService.findPublicById(id, user);
    return {
      message: 'Company retrieved successfully',
      data: company,
      meta: {
        isSubscribed,
        isIntegrationActive,
        integrationType,
      },
    };
  }

  // Endpoint: {{base_url}}/public/companies/{{companyId}}/services
  @Get(':id/services')
  @UseGuards(OptionalAuthGuard)
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'List public services offered by a company' })
  async findServicesByCompanyId(
    @Param('id') id: string,
    @GetUser() user: AuthenticatedUser | null,
  ) {
    const { services, isSubscribed } =
      await this.clientService.findPublicServicesByCompanyId(id, user);
    return {
      message: 'Services retrieved successfully',
      data: services,
    };
  }
}
