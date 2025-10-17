import {
    Controller,
    Get,
    Post,
    Body,
    Param,
    UseGuards,
    HttpCode,
    HttpStatus,
    ForbiddenException,
} from '@nestjs/common';
import { ServicesService } from './services.service';
import { CreateServiceDto } from './dto/create-service.dto';
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
            success: true,
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
            success: true,
            message: 'Services retrieved successfully',
            data: services,
        };
    }

    @Get(':id')
    @HttpCode(HttpStatus.OK)
    @Roles('owner_company', 'manager_company')
    async findOne(@Param('id') id: string, @GetUser() user: AuthenticatedUser) {
        const service = await this.servicesService.findOne(id, user);
        return {
            success: true,
            message: 'Service retrieved successfully',
            data: service,
        };
    }
}