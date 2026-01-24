// src/form/form.controller.ts
import { Controller, Post, Body, Get, Put, Param, UseGuards, Delete, HttpCode, HttpStatus } from '@nestjs/common';
import { FormsService } from './form.service';
import { CreateFormTemplateDto } from './dto/create-form-template.dto';
import { UpdateFormTemplateDto } from './dto/update-form-template.dto';
import { AuthGuard } from 'src/auth/guards/auth.guard';
import { RolesGuard } from 'src/auth/guards/roles.guard';
import { Roles } from 'src/common/decorators/roles.decorator';
import { Role } from 'src/common/enums/role.enum';
import { SubmitFormDto } from './dto/submit-form.dto';
import { GetUser } from 'src/common/decorators/get-user.decorator';
import type { AuthenticatedUser } from 'src/auth/interfaces/authenticated-user.interface';
import { ResponseUtil } from 'src/common/utils/response.util';

@UseGuards(AuthGuard)
@Controller('forms')
export class FormsController {
    constructor(private readonly formsService: FormsService) { }

    @Post('')
    @UseGuards(RolesGuard)
    @Roles(Role.CompanyOwner, Role.CompanyManager)
    async createTemplate(@Body() createFormTemplateDto: CreateFormTemplateDto, @GetUser() user: AuthenticatedUser) {
        const template = await this.formsService.createTemplate(createFormTemplateDto, user);
        return ResponseUtil.success('Form template created successfully', template);
    }

    @Get('')
    async findAllTemplates(@GetUser() user: AuthenticatedUser) {
        const templates = await this.formsService.findAllTemplates(user);
        return ResponseUtil.success('Latest form templates retrieved successfully', templates);
    }

    @Get(':id')
    async findTemplateById(@Param('id') id: string) {
        const template = await this.formsService.findTemplateById(id);
        return ResponseUtil.success('Form template retrieved successfully', template);
    }

    @Put(':formKey')
    @UseGuards(RolesGuard)
    @Roles(Role.CompanyOwner, Role.CompanyManager)
    async updateTemplate(
        @Param('formKey') formKey: string,
        @Body() updateFormTemplateDto: UpdateFormTemplateDto,
        @GetUser() user: AuthenticatedUser,
    ) {
        const newVersion = await this.formsService.updateTemplate(formKey, updateFormTemplateDto, user);
        return ResponseUtil.success('New form version created successfully', newVersion);
    }

    @Post('submissions')
    async submitForm(@GetUser() user: AuthenticatedUser, @Body() submitFormDto: SubmitFormDto) {
        const submission = await this.formsService.submitForm(user, submitFormDto);
        return ResponseUtil.success('Form submitted successfully', submission);
    }

    @Delete(':id')
    @UseGuards(RolesGuard)
    @Roles(Role.CompanyOwner, Role.CompanyManager)
    @HttpCode(HttpStatus.OK)
    async remove(@Param('id') id: string, @GetUser() user: AuthenticatedUser) {
        const data = await this.formsService.removeById(id, user);
        return ResponseUtil.success('Form template deleted successfully', data);
    }
}