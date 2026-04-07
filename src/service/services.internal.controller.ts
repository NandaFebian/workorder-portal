// src/service/services.controller.ts
import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  UseGuards,
  HttpCode,
  HttpStatus,
  Put,
  Delete,
  Patch,
  BadRequestException,
} from '@nestjs/common';
// Import Service Internal
import { ServicesInternalService } from './services.internal.service';
import { CreateServiceDto } from './dto/create-service.dto';
import { UpdateServiceDto } from './dto/update-service.dto';
import { AuthGuard } from '../auth/guards/auth.guard';
import { GetUser } from '../common/decorators/get-user.decorator';
import type { AuthenticatedUser } from 'src/auth/interfaces/authenticated-user.interface';
import { RolesGuard } from 'src/auth/guards/roles.guard';
import { Roles } from 'src/common/decorators/roles.decorator';
import { Role } from 'src/common/enums/role.enum';
import { ResponseUtil } from 'src/common/utils/response.util';
import { ServiceRequestService } from 'src/service-request/service-request.service';

@Controller('services')
@UseGuards(AuthGuard, RolesGuard)
export class ServicesController {
  // Inject service internal
  constructor(
    private readonly internalService: ServicesInternalService,
    private readonly csrService: ServiceRequestService,
  ) { }

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @Roles(Role.CompanyOwner, Role.CompanyManager)
  async create(
    @Body() createServiceDto: CreateServiceDto,
    @GetUser() user: AuthenticatedUser,
  ) {
    const populatedService = await this.internalService.create(
      createServiceDto,
      user,
    );
    return ResponseUtil.success(
      'Service created successfully',
      populatedService,
    );
  }

  @Get()
  @HttpCode(HttpStatus.OK)
  @Roles(Role.CompanyOwner, Role.CompanyManager, Role.CompanyStaff)
  async findAll(@GetUser() user: AuthenticatedUser) {
    const services = await this.internalService.findAll(user);
    return ResponseUtil.success('Load data success', services);
  }

  @Get(':id')
  @HttpCode(HttpStatus.OK)
  @Roles(Role.CompanyOwner, Role.CompanyManager)
  async findOne(@Param('id') id: string, @GetUser() user: AuthenticatedUser) {
    const service = await this.internalService.findByVersionId(id, user);
    return ResponseUtil.success('Load data success', service);
  }

  @Get(':serviceId/intake-form')
  @HttpCode(HttpStatus.OK)
  @Roles(Role.CompanyOwner, Role.CompanyManager, Role.CompanyStaff)
  async getIntakeFormInternal(
    @Param('serviceId') serviceId: string,
    @GetUser() user: AuthenticatedUser,
  ) {
    const data = await this.csrService.getIntakeForm(serviceId, user, 'internal');
    return ResponseUtil.success('Load intake form success', data ?? null);
  }

  @Put(':id')
  @HttpCode(HttpStatus.OK)
  @Roles(Role.CompanyOwner, Role.CompanyManager)
  async update(
    @Param('id') id: string,
    @Body() updateServiceDto: UpdateServiceDto,
    @GetUser() user: AuthenticatedUser,
  ) {
    const populatedUpdatedService = await this.internalService.updateById(
      id,
      updateServiceDto,
      user,
    );
    return ResponseUtil.success(
      'New service version created successfully',
      populatedUpdatedService,
    );
  }

  @Patch(':id/toggle-active')
  @HttpCode(HttpStatus.OK)
  @Roles(Role.CompanyOwner, Role.CompanyManager)
  async toggleActive(
    @Param('id') id: string,
    @Body('isActive') isActive: boolean,
    @GetUser() user: AuthenticatedUser,
  ) {
    if (typeof isActive !== 'boolean') {
      throw new BadRequestException('isActive must be a boolean value');
    }

    const populatedUpdatedService = await this.internalService.toggleActive(
      id,
      isActive,
      user,
    );
    return ResponseUtil.success(
      'Service status updated successfully',
      populatedUpdatedService,
    );
  }

  @Delete(':id')
  @HttpCode(HttpStatus.OK)
  @Roles(Role.CompanyOwner, Role.CompanyManager)
  async remove(@Param('id') id: string, @GetUser() user: AuthenticatedUser) {
    const data = await this.internalService.removeById(id, user);
    return ResponseUtil.success('Service deleted successfully', data);
  }
}
