import { Controller, Get, Param, UseGuards, HttpCode, HttpStatus } from '@nestjs/common';
import { WorkOrderService } from './work-order.service';
import { AuthGuard } from 'src/auth/guards/auth.guard';
import { RolesGuard } from 'src/auth/guards/roles.guard';
import { Roles } from 'src/common/decorators/roles.decorator';
import { Role } from 'src/common/enums/role.enum';
import { GetUser } from 'src/common/decorators/get-user.decorator';
import { AuthenticatedUser } from 'src/auth/interfaces/authenticated-user.interface';

@Controller('workorders')
@UseGuards(AuthGuard, RolesGuard)
export class WorkOrderController {
    constructor(private readonly workOrderService: WorkOrderService) { }

    @Get()
    @Roles(Role.CompanyOwner, Role.CompanyManager, Role.CompanyStaff) // Akses Internal
    @HttpCode(HttpStatus.OK)
    async findAll(@GetUser() user: AuthenticatedUser) {
        const data = await this.workOrderService.findAll(user);
        return {
            message: 'Load data success',
            data: data,
        };
    }

    @Get(':id')
    @Roles(Role.CompanyOwner, Role.CompanyManager, Role.CompanyStaff) // Akses Internal
    @HttpCode(HttpStatus.OK)
    async findOne(@Param('id') id: string, @GetUser() user: AuthenticatedUser) {
        const data = await this.workOrderService.findOne(id, user);
        return {
            message: 'Load data success',
            data: data,
        };
    }
}