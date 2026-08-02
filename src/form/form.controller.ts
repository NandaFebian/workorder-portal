// src/form/form.controller.ts
import {
  Controller,
  Post,
  Body,
  Get,
  Put,
  Param,
  UseGuards,
  Delete,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
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

@ApiTags('Forms')
@ApiBearerAuth('access-token')
@UseGuards(AuthGuard)
@Controller('forms')
export class FormsController {
  constructor(private readonly formsService: FormsService) {}

  @Post('')
  @UseGuards(RolesGuard)
  @Roles(Role.CompanyOwner, Role.CompanyManager)
  @ApiOperation({ summary: 'Create a form template' })
  async createTemplate(
    @Body() createFormTemplateDto: CreateFormTemplateDto,
    @GetUser() user: AuthenticatedUser,
  ) {
    const template = await this.formsService.createTemplate(
      createFormTemplateDto,
      user,
    );
    return ResponseUtil.success('Form template created successfully', template);
  }

  @Get('')
  @ApiOperation({ summary: 'List latest form templates' })
  async findAllTemplates(@GetUser() user: AuthenticatedUser) {
    const templates = await this.formsService.findAllTemplates(user);
    return ResponseUtil.success(
      'Latest form templates retrieved successfully',
      templates,
    );
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a form template by id' })
  async findTemplateById(
    @Param('id') id: string,
    @GetUser() user: AuthenticatedUser,
  ) {
    const template = await this.formsService.findTemplateById(id, user);
    return ResponseUtil.success(
      'Form template retrieved successfully',
      template,
    );
  }

  @Put(':id')
  @UseGuards(RolesGuard)
  @Roles(Role.CompanyOwner, Role.CompanyManager)
  @ApiOperation({ summary: 'Update a form template (creates a new version)' })
  async updateTemplate(
    @Param('id') formId: string,
    @Body() updateFormTemplateDto: UpdateFormTemplateDto,
    @GetUser() user: AuthenticatedUser,
  ) {
    const newVersion = await this.formsService.updateTemplate(
      formId,
      updateFormTemplateDto,
      user,
    );
    return ResponseUtil.success(
      'New form version created successfully',
      newVersion,
    );
  }

  @Post('submissions')
  @ApiOperation({ summary: 'Submit one or more form submissions' })
  async submitForm(
    @GetUser() user: AuthenticatedUser,
    @Body() submitFormDto: SubmitFormDto,
  ) {
    const results = await Promise.all(
      submitFormDto.submissions.map((submission) =>
        this.formsService.submitForm(user, submission),
      ),
    );
    return ResponseUtil.success('Form submitted successfully', results);
  }

  @Delete(':id')
  @UseGuards(RolesGuard)
  @Roles(Role.CompanyOwner, Role.CompanyManager)
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Delete a form template' })
  async remove(@Param('id') id: string, @GetUser() user: AuthenticatedUser) {
    const data = await this.formsService.removeById(id, user);
    return ResponseUtil.success('Form template deleted successfully', data);
  }
}
