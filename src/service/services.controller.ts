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
import type { UserDocument } from '../users/schemas/user.schema';

@Controller('services')
@UseGuards(AuthGuard)
export class ServicesController {
    constructor(private readonly servicesService: ServicesService) { }

    @Post()
    @HttpCode(HttpStatus.CREATED)
    async create(
        @Body() createServiceDto: CreateServiceDto,
        @GetUser() user: UserDocument,
    ) {
        if (!['owner_company', 'manager_company'].includes(user.role)) {
            throw new ForbiddenException(
                'Only company owners and managers can create services',
            );
        }
        const newService = await this.servicesService.create(createServiceDto, user);
        return {
            success: true,
            message: 'Service created successfully',
            data: newService,
        };
    }

    @Get()
    @HttpCode(HttpStatus.OK)
    async findAll(@GetUser() user: UserDocument) {
        if (!['owner_company', 'manager_company'].includes(user.role)) {
            throw new ForbiddenException(
                'Only company owners and managers can access this resource',
            );
        }
        const services = await this.servicesService.findAll(user);
        return {
            success: true,
            message: 'Services retrieved successfully',
            data: services,
        };
    }

    @Get(':id')
    @HttpCode(HttpStatus.OK)
    async findOne(@Param('id') id: string, @GetUser() user: UserDocument) {
        if (!['owner_company', 'manager_company'].includes(user.role)) {
            throw new ForbiddenException(
                'Only company owners and managers can access this resource',
            );
        }
        const service = await this.servicesService.findOne(id, user);
        return {
            success: true,
            message: 'Service retrieved successfully',
            data: service,
        };
    }
}