// src/forms/forms.controller.ts
import { Controller, Post, Body, Get, Put, Param, UseGuards } from '@nestjs/common';
import { FormsService } from './form.service';
import { CreateFormTemplateDto } from './dto/create-form-template.dto';
import { UpdateFormTemplateDto } from './dto/update-form-template.dto';
import { AuthGuard } from 'src/auth/guards/auth.guard';
import { RolesGuard } from 'src/auth/guards/roles.guard';
import { Roles } from 'src/common/decorators/roles.decorator';
import { SubmitFormDto } from './dto/submit-form.dto';
import { GetUser } from 'src/common/decorators/get-user.decorator';
import type { AuthenticatedUser } from 'src/auth/interfaces/authenticated-user.interface';

@UseGuards(AuthGuard)
@Controller('forms')
export class FormsController {
    constructor(private readonly formsService: FormsService) { }

    @Post('templates')
    @UseGuards(RolesGuard)
    @Roles('owner_company', 'manager_company')
    async createTemplate(@Body() createFormTemplateDto: CreateFormTemplateDto) {
        const template = await this.formsService.createTemplate(createFormTemplateDto);
        return { message: 'Form template created successfully', data: template };
    }

    @Get('templates')
    async findAllTemplates() {
        const templates = await this.formsService.findAllTemplates();
        return { message: 'Form templates retrieved successfully', data: templates };
    }

    @Get('templates/:id')
    async findTemplateById(@Param('id') id: string) {
        const template = await this.formsService.findTemplateById(id);
        return { message: 'Form template retrieved successfully', data: template };
    }

    @Put('templates/:id')
    @UseGuards(RolesGuard)
    @Roles('owner_company', 'manager_company')
    async updateTemplate(
        @Param('id') id: string,
        @Body() updateFormTemplateDto: UpdateFormTemplateDto,
    ) {
        const updatedTemplate = await this.formsService.updateTemplate(id, updateFormTemplateDto);
        return { message: 'Form template updated successfully', data: updatedTemplate };
    }

    @Post('submissions')
    async submitForm(@GetUser() user: AuthenticatedUser, @Body() submitFormDto: SubmitFormDto) {
        const submission = await this.formsService.submitForm(user, submitFormDto);
        return { message: 'Form submitted successfully', data: submission };
    }
}