// src/service/services.client.controller.ts
import { Controller, Get, HttpCode, HttpStatus, Param } from '@nestjs/common';
import { ServicesService } from './services.service';

@Controller('public/services') // Pastikan prefix-nya 'public/services'
export class ServicesClientController {
    constructor(private readonly servicesService: ServicesService) { }

    @Get('company/:companyId')
    @HttpCode(HttpStatus.OK)
    async findAllByCompanyId(@Param('companyId') companyId: string) {
        const services = await this.servicesService.findAllByCompanyId(companyId);
        return {
            message: 'Services for company retrieved successfully',
            data: services,
        };
    }

    /**
     * Endpoint ini sekarang mengembalikan { service, formQuantity }
     */
    @Get(':id')
    @HttpCode(HttpStatus.OK)
    async findById(@Param('id') id: string) {
        const serviceData = await this.servicesService.findById(id);
        return {
            message: 'Service retrieved successfully',
            data: serviceData,
        };
    }

    /**
     * ENDPOINT BARU: Mengambil form terbaru untuk service ini
     */
    @Get(':id/intake-forms')
    @HttpCode(HttpStatus.OK)
    async getFormsForService(@Param('id') id: string) {
        const forms = await this.servicesService.getLatestFormsForService(id);
        return {
            message: 'Forms for service retrieved successfully',
            data: forms,
        };
    }
}