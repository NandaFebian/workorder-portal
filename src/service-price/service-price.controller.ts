import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  UseGuards,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { ServicePriceService } from './service-price.service';
import { CreateServicePriceDto } from './dto/create-service-price.dto';
import { UpdateServicePriceDto } from './dto/update-service-price.dto';
import { AuthGuard } from 'src/auth/guards/auth.guard';
import { RolesGuard } from 'src/auth/guards/roles.guard';
import { Roles } from 'src/common/decorators/roles.decorator';
import { Role } from 'src/common/enums/role.enum';
import { GetUser } from 'src/common/decorators/get-user.decorator';
import { AuthenticatedUser } from 'src/auth/interfaces/authenticated-user.interface';
import { ResponseUtil } from 'src/common/utils/response.util';

@Controller('service-price')
@UseGuards(AuthGuard, RolesGuard)
export class ServicePriceController {
  constructor(private readonly servicePriceService: ServicePriceService) {}

  @Get()
  @HttpCode(HttpStatus.OK)
  @Roles(Role.CompanyOwner, Role.CompanyManager)
  async findAll(@GetUser() user: AuthenticatedUser) {
    const data = await this.servicePriceService.findAll(user);
    return ResponseUtil.success('Service pricing loaded successfully', data);
  }

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @Roles(Role.CompanyOwner, Role.CompanyManager)
  async create(
    @Body() dto: CreateServicePriceDto,
    @GetUser() user: AuthenticatedUser,
  ) {
    const data = await this.servicePriceService.create(dto, user);
    return ResponseUtil.success('Service pricing created successfully', data);
  }

  @Put(':id')
  @HttpCode(HttpStatus.OK)
  @Roles(Role.CompanyOwner, Role.CompanyManager)
  async update(
    @Param('id') id: string,
    @Body() dto: UpdateServicePriceDto,
    @GetUser() user: AuthenticatedUser,
  ) {
    const data = await this.servicePriceService.update(id, dto, user);
    return ResponseUtil.success('Service pricing updated successfully', data);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.OK)
  @Roles(Role.CompanyOwner, Role.CompanyManager)
  async remove(@Param('id') id: string, @GetUser() user: AuthenticatedUser) {
    const data = await this.servicePriceService.remove(id, user);
    return ResponseUtil.success('Service pricing deleted successfully', data);
  }
}
