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
    async createTemplate(@Body() createFormTemplateDto: CreateFormTemplateDto, @GetUser() user: AuthenticatedUser) {
        const template = await this.formsService.createTemplate(createFormTemplateDto, user);
        return { message: 'Form template created successfully', data: template };
    }

    @Get('templates')
    async findAllTemplates(@GetUser() user: AuthenticatedUser) {
        const templates = await this.formsService.findAllTemplates(user);
        return { message: 'Latest form templates retrieved successfully', data: templates };
    }

    @Get('templates/:id')
    async findTemplateById(@Param('id') id: string) {
        const template = await this.formsService.findTemplateById(id);
        return { message: 'Form template retrieved successfully', data: template };
    }

    // Endpoint diubah untuk menerima formKey
    @Put('templates/:formKey')
    @UseGuards(RolesGuard)
    @Roles('owner_company', 'manager_company')
    async updateTemplate(
        @Param('formKey') formKey: string,
        @Body() updateFormTemplateDto: UpdateFormTemplateDto,
        @GetUser() user: AuthenticatedUser,
    ) {
        const newVersion = await this.formsService.updateTemplate(formKey, updateFormTemplateDto, user);
        return { message: 'New form version created successfully', data: newVersion };
    }

    @Post('submissions')
    async submitForm(@GetUser() user: AuthenticatedUser, @Body() submitFormDto: SubmitFormDto) {
        const submission = await this.formsService.submitForm(user, submitFormDto);
        return { message: 'Form submitted successfully', data: submission };
    }
}