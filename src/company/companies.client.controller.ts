// src/company/companies.client.controller.ts
import { Controller, Get, HttpCode, HttpStatus, Param } from '@nestjs/common';
import { CompaniesClientService } from './companies.client.service'; // Import service client

@Controller('public/companies')
export class CompaniesClientController {
    constructor(private readonly clientService: CompaniesClientService) { }

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
    @HttpCode(HttpStatus.OK)
    async findById(@Param('id') id: string) {
        const company = await this.clientService.findPublicById(id);
        return {
            message: 'Company retrieved successfully',
            data: company,
        };
    }

    // Endpoint: {{base_url}}/public/companies/{{companyId}}/services
    @Get(':id/services')
    @HttpCode(HttpStatus.OK)
    async findServicesByCompanyId(@Param('id') id: string) {
        const services = await this.clientService.findPublicServicesByCompanyId(id);
        return {
            message: 'Services retrieved successfully',
            data: services,
        };
    }
}