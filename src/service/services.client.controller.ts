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
import { ServiceRequestService } from 'src/service-request/service-request.service';
import { SubmitIntakeFormDto } from './dto/submit-intake-forms.dto'; // Import DTO Baru
import { AuthGuard } from 'src/auth/guards/auth.guard';
import { OptionalAuthGuard } from 'src/auth/guards/optional-auth.guard';
import { GetUser } from 'src/common/decorators/get-user.decorator';
import { AuthenticatedUser } from 'src/auth/interfaces/authenticated-user.interface';

@Controller('public/services')
export class ServicesClientController {
  constructor(
    private readonly clientService: ServicesClientService,
    private readonly csrService: ServiceRequestService,
  ) { }

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

  @Get(':id/intake-form')
  @UseGuards(OptionalAuthGuard)
  @HttpCode(HttpStatus.OK)
  async getClientIntakeForms(
    @Param('id') id: string,
    @GetUser() user: AuthenticatedUser | null,
  ) {
    const data = await this.csrService.getIntakeForm(id, user, 'public');
    return {
      message: 'Load data success',
      data: data ? { form: data } : {},
    };
  }
}
