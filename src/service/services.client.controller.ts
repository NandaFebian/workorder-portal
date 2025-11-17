// src/service/services.client.controller.ts
import {
    Controller, Get, HttpCode, HttpStatus, Param, Post, Body,
    UseGuards
} from '@nestjs/common';
import { ServicesClientService } from './services.client.service';
import { FormsService } from 'src/form/form.service';
import { ServiceRequestsService } from 'src/service-request/service-requests.service';
import { IntakeSubmissionDto } from 'src/service-request/dto/intake-submission.dto';
import { AuthGuard } from 'src/auth/guards/auth.guard';
import { RolesGuard } from 'src/auth/guards/roles.guard';
import { Roles } from 'src/common/decorators/roles.decorator';
import { GetUser } from 'src/common/decorators/get-user.decorator';
import { AuthenticatedUser } from 'src/auth/interfaces/authenticated-user.interface';
import { Role } from 'src/common/enums/role.enum';

@Controller('public/services')
export class ServicesClientController {
    constructor(
        private readonly clientService: ServicesClientService,
        private readonly formsService: FormsService,
        private readonly requestsService: ServiceRequestsService,

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

    @Post(':id/intake-forms') // :id adalah serviceId
    @UseGuards(AuthGuard, RolesGuard) // <-- 6. Lindungi endpoint
    @Roles(Role.Client) // <-- 7. Hanya untuk Klien
    @HttpCode(HttpStatus.CREATED)
    async submitIntakeForm(
        @Param('id') serviceId: string,
        // 8. Terima ARRAY dari DTO baru, sesuai gambar 'image_fee401.png'
        @Body() intakeSubmissions: IntakeSubmissionDto[],
        @GetUser() user: AuthenticatedUser, // <-- 9. Dapatkan user
    ) {
        // 10. Panggil ServiceRequestService
        const request = await this.requestsService.create(
            serviceId,
            intakeSubmissions,
            user,
        );

        return {
            message: 'Service request submitted successfully',
            data: request,
        };
    }
}