// src/service/services.client.controller.ts
import { Controller, Get, HttpCode, HttpStatus, Param, Post, Body, UseGuards } from '@nestjs/common';
import { ServicesClientService } from './services.client.service';
import { SubmitIntakeFormItemDto } from './dto/submit-intake-forms.dto'; // Import DTO Baru
import { AuthGuard } from 'src/auth/guards/auth.guard';
import { GetUser } from 'src/common/decorators/get-user.decorator';
import { AuthenticatedUser } from 'src/auth/interfaces/authenticated-user.interface';

@Controller('public/services')
export class ServicesClientController {
    constructor(
        private readonly clientService: ServicesClientService,
    ) { }

    // GET Detail Service (sesuai mock router.get("/:id"))
    @Get(':id')
    @HttpCode(HttpStatus.OK)
    async findById(@Param('id') id: string) {
        const data = await this.clientService.findServiceDetailById(id);
        // Mock response structure: { message, data: { service: ..., formQuantity: ... } }
        return {
            message: 'Load data success',
            data: data,
        };
    }

    // GET Intake Forms (sesuai mock router.get("/:id/intake-forms"))
    @Get(':id/intake-forms')
    @HttpCode(HttpStatus.OK)
    async getClientIntakeForms(@Param('id') id: string) {
        const forms = await this.clientService.getClientIntakeFormsForService(id);
        return {
            message: 'Load data success',
            data: forms,
        };
    }

    // POST Submit Intake (sesuai mock router.post("/:id/intake-forms"))
    @Post(':id/intake-forms')
    @UseGuards(AuthGuard)
    @HttpCode(HttpStatus.CREATED)
    async submitIntakeForm(
        @Param('id') serviceId: string,
        @Body() submission: SubmitIntakeFormItemDto,
        @GetUser() user: AuthenticatedUser
    ) {
        // Perbaikan: Kirim variabel 'submission' ke service
        const result = await this.clientService.processIntakeSubmission(serviceId, user, submission);

        return {
            message: 'Client service request created successfully',
            data: result,
        };
    }

    @Get('company/:companyId')
    @HttpCode(HttpStatus.OK)
    async findAllByCompanyId(@Param('companyId') companyId: string) {
        const services = await this.clientService.findAllByCompanyId(companyId);
        return {
            message: 'Load data success',
            data: services,
        };
    }
}