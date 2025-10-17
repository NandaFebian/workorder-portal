import { Controller, Get, HttpCode, HttpStatus, Param } from '@nestjs/common';
import { ServicesService } from './services.service';

@Controller('client/services') // <-- Perhatikan prefix URL yang berbeda
export class ServicesClientController {
    constructor(private readonly servicesService: ServicesService) { }

    @Get('company/:companyId')
    @HttpCode(HttpStatus.OK)
    async findAllByCompanyId(@Param('companyId') companyId: string) {
        const services = await this.servicesService.findAllByCompanyId(companyId);
        return {
            success: true,
            message: 'Services for company retrieved successfully',
            data: services,
        };
    }

    @Get(':id')
    @HttpCode(HttpStatus.OK)
    async findById(@Param('id') id: string) {
        const service = await this.servicesService.findById(id);
        return {
            success: true,
            message: 'Service retrieved successfully',
            data: service,
        };
    }
}