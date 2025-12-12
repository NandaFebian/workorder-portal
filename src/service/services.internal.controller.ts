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
// Import Service Internal
import { ServicesInternalService } from './services.internal.service';
import { CreateServiceDto } from './dto/create-service.dto';
import { UpdateServiceDto } from './dto/update-service.dto';
import { AuthGuard } from '../auth/guards/auth.guard';
import { GetUser } from '../common/decorators/get-user.decorator';
import type { AuthenticatedUser } from 'src/auth/interfaces/authenticated-user.interface';
import { RolesGuard } from 'src/auth/guards/roles.guard';
import { Roles } from 'src/common/decorators/roles.decorator';
import { ResponseUtil } from 'src/common/utils/response.util';

@Controller('services')
@UseGuards(AuthGuard, RolesGuard)
export class ServicesController {
    // Inject service internal
    constructor(private readonly internalService: ServicesInternalService) { }

    @Post()
    @HttpCode(HttpStatus.CREATED)
    @Roles('owner_company', 'manager_company')
    async create(
        @Body() createServiceDto: CreateServiceDto,
        @GetUser() user: AuthenticatedUser,
    ) {
        const populatedService = await this.internalService.create(createServiceDto, user);
        return ResponseUtil.success('Service created successfully', populatedService);
    }

    @Get()
    @HttpCode(HttpStatus.OK)
    @Roles('owner_company', 'manager_company')
    async findAll(@GetUser() user: AuthenticatedUser) {
        const services = await this.internalService.findAll(user);
        return ResponseUtil.success('Load data success', services);
    }

    @Get(':id')
    @HttpCode(HttpStatus.OK)
    @Roles('owner_company', 'manager_company')
    async findOne(@Param('id') id: string, @GetUser() user: AuthenticatedUser) {
        const service = await this.internalService.findByVersionId(id, user);
        return ResponseUtil.success('Load data success', service);
    }

    @Put(':serviceKey')
    @HttpCode(HttpStatus.OK)
    @Roles('owner_company', 'manager_company')
    async update(
        @Param('serviceKey') serviceKey: string,
        @Body() updateServiceDto: UpdateServiceDto,
        @GetUser() user: AuthenticatedUser,
    ) {
        const populatedUpdatedService = await this.internalService.update(serviceKey, updateServiceDto, user);
        return ResponseUtil.success('New service version created successfully', populatedUpdatedService);
    }
}