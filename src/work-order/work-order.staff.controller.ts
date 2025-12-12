import { Controller, Get, Param, UseGuards, HttpCode, HttpStatus } from '@nestjs/common';
import { WorkOrderService } from './work-order.service';
import { AuthGuard } from 'src/auth/guards/auth.guard';
import { RolesGuard } from 'src/auth/guards/roles.guard';
import { Roles } from 'src/common/decorators/roles.decorator';
import { Role } from 'src/common/enums/role.enum';
import { GetUser } from 'src/common/decorators/get-user.decorator';
import { AuthenticatedUser } from 'src/auth/interfaces/authenticated-user.interface';
import { ResponseUtil } from 'src/common/utils/response.util';

@Controller('staff/work-orders')
@UseGuards(AuthGuard, RolesGuard)
@Roles(Role.CompanyStaff, Role.CompanyManager)
export class WorkOrderStaffController {
    constructor(private readonly workOrderService: WorkOrderService) { }

    @Get()
    @HttpCode(HttpStatus.OK)
    async findAll(@GetUser() user: AuthenticatedUser) {
        const data = await this.workOrderService.findAllAssigned(user);
        return ResponseUtil.success('Load data success', data);
    }

    @Get(':id')
    @HttpCode(HttpStatus.OK)
    async findOne(@Param('id') id: string, @GetUser() user: AuthenticatedUser) {
        const data = await this.workOrderService.findOneAssigned(id, user);
        return ResponseUtil.success('Load data success', data);
    }
}
