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
            message: 'Load data success',
            data: services,
        };
    }

    /**
     * Endpoint ini sekarang mengembalikan { service, formQuantity } di dalam 'data'
     */
    @Get(':id')
    @HttpCode(HttpStatus.OK)
    async findById(@Param('id') id: string) {
        // Panggil service method yang sudah mengembalikan struktur { service, formQuantity }
        const serviceData = await this.servicesService.findById(id);
        return {
            message: 'Load data success',
            // --- 👇 PERUBAHAN DI SINI 👇 ---
            data: serviceData, // Langsung gunakan hasil dari service
            // --- 👆 PERUBAHAN DI SINI 👆 ---
        };
    }

    /**
     * ENDPOINT BARU: Mengambil form terbaru untuk service ini
     * (Tidak ada perubahan di sini, sudah benar)
     */
    @Get(':id/intake-forms')
    @HttpCode(HttpStatus.OK)
    async getFormsForService(@Param('id') id: string) {
        const forms = await this.servicesService.getLatestFormsForService(id);
        return {
            message: 'Load data success',
            data: forms,
        };
    }
}