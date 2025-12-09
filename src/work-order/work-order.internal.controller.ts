import { Controller, Get, Post, Patch, Put, Delete, Param, Body, Query, UseGuards, HttpCode, HttpStatus } from '@nestjs/common';
import { WorkOrderService } from './work-order.service';
import { AuthGuard } from 'src/auth/guards/auth.guard';
import { RolesGuard } from 'src/auth/guards/roles.guard';
import { Roles } from 'src/common/decorators/roles.decorator';
import { Role } from 'src/common/enums/role.enum';
import { GetUser } from 'src/common/decorators/get-user.decorator';
import { AuthenticatedUser } from 'src/auth/interfaces/authenticated-user.interface';
import { CreateWorkOrderDto } from './dto/create-work-order.dto';
import { UpdateWorkOrderDto } from './dto/update-work-order.dto';
import { UpdateWorkOrderStatusDto } from './dto/update-work-order-status.dto';
import { AssignStaffDto } from './dto/assign-staff.dto';
import { WorkOrderFilterDto } from './dto/work-order-filter.dto';
import { CreateSubmissionsDto } from './dto/create-submissions.dto';

@Controller('workorders')
@UseGuards(AuthGuard, RolesGuard)
@Roles(Role.CompanyOwner, Role.CompanyManager, Role.CompanyStaff)
export class WorkOrderInternalController {
    constructor(private readonly workOrderService: WorkOrderService) { }

    @Post()
    @HttpCode(HttpStatus.CREATED)
    async create(@Body() createWorkOrderDto: CreateWorkOrderDto, @GetUser() user: AuthenticatedUser) {
        const data = await this.workOrderService.create(createWorkOrderDto, user);
        return {
            message: 'Work Order created successfully',
            data,
        };
    }

    @Get()
    @HttpCode(HttpStatus.OK)
    async findAll(@GetUser() user: AuthenticatedUser, @Query() filterDto: WorkOrderFilterDto) {
        const data = await this.workOrderService.findAllInternal(user, filterDto);
        return {
            message: 'Load data success',
            data,
        };
    }

    @Get(':id')
    @HttpCode(HttpStatus.OK)
    async findOne(@Param('id') id: string, @GetUser() user: AuthenticatedUser) {
        const data = await this.workOrderService.findOneInternal(id, user);
        return {
            message: 'Load data success',
            data,
        };
    }

    @Patch(':id')
    @HttpCode(HttpStatus.OK)
    async update(@Param('id') id: string, @Body() updateWorkOrderDto: UpdateWorkOrderDto, @GetUser() user: AuthenticatedUser) {
        const data = await this.workOrderService.update(id, updateWorkOrderDto, user);
        return {
            message: 'Work Order updated successfully',
            data,
        };
    }

    @Patch(':id/status')
    @HttpCode(HttpStatus.OK)
    async updateStatus(@Param('id') id: string, @Body() updateStatusDto: UpdateWorkOrderStatusDto, @GetUser() user: AuthenticatedUser) {
        const data = await this.workOrderService.updateStatus(id, updateStatusDto, user);
        return {
            message: 'Work Order status updated successfully',
            data,
        };
    }


    @Put(':id/assign-staffs')
    @HttpCode(HttpStatus.OK)
    async assignStaff(@Param('id') id: string, @Body() assignStaffDto: AssignStaffDto, @GetUser() user: AuthenticatedUser) {
        const data = await this.workOrderService.assignStaff(id, assignStaffDto, user);
        return {
            message: 'Staff assigned successfully',
            data,
        };
    }

    @Put(':id/submissions')
    @HttpCode(HttpStatus.OK)
    async createSubmissions(@Param('id') id: string, @Body() createSubmissionsDto: CreateSubmissionsDto, @GetUser() user: AuthenticatedUser) {
        const data = await this.workOrderService.createSubmissions(id, createSubmissionsDto, user);
        return {
            message: 'Submissions saved successfully',
            data,
        };
    }

    @Put(':id/ready')
    @HttpCode(HttpStatus.OK)
    async markAsReady(@Param('id') id: string, @GetUser() user: AuthenticatedUser) {
        const data = await this.workOrderService.markAsReady(id, user);
        return {
            message: 'Work Order marked as ready',
            data,
        };
    }
}
