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
} from '@nestjs/common';
import { ServicesService } from './services.service';
import { CreateServiceDto } from './dto/create-service.dto';
import { UpdateServiceDto } from './dto/update-service.dto';
import { AuthGuard } from '../auth/guards/auth.guard';
import { GetUser } from '../common/decorators/get-user.decorator';
import type { AuthenticatedUser } from 'src/auth/interfaces/authenticated-user.interface';
import { RolesGuard } from 'src/auth/guards/roles.guard';
import { Roles } from 'src/common/decorators/roles.decorator';

@Controller('services')
@UseGuards(AuthGuard, RolesGuard)
export class ServicesController {
    constructor(private readonly servicesService: ServicesService) { }

    @Post()
    @HttpCode(HttpStatus.CREATED)
    @Roles('owner_company', 'manager_company')
    async create(
        @Body() createServiceDto: CreateServiceDto,
        @GetUser() user: AuthenticatedUser,
    ) {
        const newService = await this.servicesService.create(createServiceDto, user);
        return {
            message: 'Service created successfully',
            data: newService,
        };
    }

    @Get()
    @HttpCode(HttpStatus.OK)
    @Roles('owner_company', 'manager_company')
    async findAll(@GetUser() user: AuthenticatedUser) {
        const services = await this.servicesService.findAll(user);
        return {
            message: 'Latest services retrieved successfully',
            data: services,
        };
    }

    @Get(':id')
    @HttpCode(HttpStatus.OK)
    @Roles('owner_company', 'manager_company')
    async findOne(@Param('id') id: string, @GetUser() user: AuthenticatedUser) {
        const service = await this.servicesService.findByVersionId(id, user);
        return {
            message: 'Service version retrieved successfully',
            data: service,
        };
    }

    @Put(':serviceKey')
    @HttpCode(HttpStatus.OK)
    @Roles('owner_company', 'manager_company')
    async update(
        @Param('serviceKey') serviceKey: string,
        @Body() updateServiceDto: UpdateServiceDto,
        @GetUser() user: AuthenticatedUser,
    ) {
        const newVersion = await this.servicesService.update(serviceKey, updateServiceDto, user);
        return {
            message: 'New service version created successfully',
            data: newVersion,
        };
    }
}