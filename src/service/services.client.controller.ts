// src/service/services.client.controller.ts
import {
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Post,
  Body,
  UseGuards,
} from '@nestjs/common';
import { ServicesClientService } from './services.client.service';
import { SubmitIntakeFormDto } from './dto/submit-intake-forms.dto'; // Import DTO Baru
import { AuthGuard } from 'src/auth/guards/auth.guard';
import { OptionalAuthGuard } from 'src/auth/guards/optional-auth.guard';
import { GetUser } from 'src/common/decorators/get-user.decorator';
import { AuthenticatedUser } from 'src/auth/interfaces/authenticated-user.interface';

@Controller('public/services')
export class ServicesClientController {
  constructor(private readonly clientService: ServicesClientService) { }

  @Get('company/:companyId')
  @UseGuards(OptionalAuthGuard)
  @HttpCode(HttpStatus.OK)
  async findAllByCompanyId(
    @Param('companyId') companyId: string,
    @GetUser() user: AuthenticatedUser | null,
  ) {
    const data = await this.clientService.findAllByCompanyId(companyId, user);
    return {
      message: 'Load data success',
      data: data,
    };
  }

  @Get(':id')
  @UseGuards(OptionalAuthGuard)
  @HttpCode(HttpStatus.OK)
  async findById(
    @Param('id') id: string,
    @GetUser() user: AuthenticatedUser | null,
  ) {
    const data = await this.clientService.findServiceDetailById(id, user);
    return {
      message: 'Load data success',
      data: data,
    };
  }

  @Get(':id/intake-forms')
  @UseGuards(OptionalAuthGuard)
  @HttpCode(HttpStatus.OK)
  async getClientIntakeForms(
    @Param('id') id: string,
    @GetUser() user: AuthenticatedUser | null,
  ) {
    const forms = await this.clientService.getClientIntakeFormsForService(id, user);
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
    @Body()
    submission: import('./dto/submit-intake-forms.dto').SubmitIntakeFormDto,
    @GetUser() user: AuthenticatedUser,
  ) {
    // Perbaikan: Kirim variabel 'submission' ke service
    const result = await this.clientService.processIntakeSubmission(
      serviceId,
      user,
      submission,
    );

    return {
      message: 'Client service request created successfully',
      data: result,
    };
  }
}
