// src/company/companies.client.controller.ts
import { Controller, Get, HttpCode, HttpStatus, Param } from '@nestjs/common';
import { CompaniesService } from './companies.service';

@Controller('public/companies')
export class CompaniesClientController {
    constructor(private readonly companiesService: CompaniesService) { }

    @Get()
    @HttpCode(HttpStatus.OK)
    async findAll() {
        const companies = await this.companiesService.findAll();
        return {
            message: 'Companies retrieved successfully',
            data: companies,
        };
    }

    @Get(':id')
    @HttpCode(HttpStatus.OK)
    async findById(@Param('id') id: string) {
        const company = await this.companiesService.findById(id);
        return {
            message: 'Company retrieved successfully',
            data: company,
        };
    }
}