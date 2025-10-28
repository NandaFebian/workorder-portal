// src/service/services.client.controller.ts
import { Controller, Get, HttpCode, HttpStatus, Param, Post, Body } from '@nestjs/common';
import { ServicesClientService } from './services.client.service'; // Import service client
import { FormsService } from 'src/form/form.service';
import { SubmitFormDto } from 'src/form/dto/submit-form.dto';

@Controller('public/services')
export class ServicesClientController {
    constructor(
        private readonly clientService: ServicesClientService, // Inject service client
        private readonly formsService: FormsService
    ) { }

    @Get('company/:companyId')
    @HttpCode(HttpStatus.OK)
    async findAllByCompanyId(@Param('companyId') companyId: string) {
        const services = await this.clientService.findAllByCompanyId(companyId);
        return {
            message: 'Load data success',
            data: services,
        };
    }

    @Get(':id')
    @HttpCode(HttpStatus.OK)
    async findById(@Param('id') id: string) {
        // Panggil metode detail service yang baru
        const serviceData = await this.clientService.findServiceDetailById(id);
        return {
            message: 'Load data success',
            data: serviceData,
        };
    }

    @Get(':id/intake-forms')
    @HttpCode(HttpStatus.OK)
    async getClientIntakeForms(@Param('id') id: string) {
        const forms = await this.clientService.getClientIntakeFormsForService(id);
        return {
            message: 'Load data success',
            data: forms,
        };
    }

    @Post(':id/intake-forms') // :id di sini adalah serviceId
    @HttpCode(HttpStatus.CREATED)
    async submitIntakeForm(
        @Param('id') serviceId: string,
        @Body() submitFormDto: SubmitFormDto
    ) {
        // Panggil metode submitForm publik dari FormsService
        const submission = await this.formsService.submitPublicForm(submitFormDto, serviceId);
        return {
            message: 'Intake form submitted successfully',
            data: submission,
        };
    }
}