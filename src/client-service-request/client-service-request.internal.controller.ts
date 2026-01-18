import { Controller, Get, Put, Param, UseGuards, HttpCode, HttpStatus, ForbiddenException, Delete } from '@nestjs/common';
import { ClientServiceRequestService } from './client-service-request.service';
import { AuthGuard } from 'src/auth/guards/auth.guard';
import { RolesGuard } from 'src/auth/guards/roles.guard';
import { Roles } from 'src/common/decorators/roles.decorator';
import { GetUser } from 'src/common/decorators/get-user.decorator';
import { AuthenticatedUser } from 'src/auth/interfaces/authenticated-user.interface';
import { ResponseUtil } from 'src/common/utils/response.util';

@Controller('client-service-request')
@UseGuards(AuthGuard, RolesGuard)
@Roles('owner_company', 'manager_company', 'staff_company')
export class ClientServiceRequestInternalController {
    constructor(private readonly csrService: ClientServiceRequestService) { }

    @Get()
    @HttpCode(HttpStatus.OK)
    async findAll(@GetUser() user: AuthenticatedUser) {
        if (!user.company?._id) throw new ForbiddenException('No company associated');
        const data = await this.csrService.findAllByCompanyId(user.company._id.toString());
        return ResponseUtil.success('Load data success', data);
    }

    @Get(':id')
    @HttpCode(HttpStatus.OK)
    async findOne(@Param('id') id: string) {
        const data = await this.csrService.findOneInternal(id);
        return ResponseUtil.success('Load data success', data);
    }

    @Put(':id/approve')
    @Roles('owner_company', 'manager_company')
    @HttpCode(HttpStatus.OK)
    async approve(@Param('id') id: string, @GetUser() user: AuthenticatedUser) {
        // Pass user ke service
        return await this.csrService.updateStatus(id, 'approved', user);
    }

    @Put(':id/reject')
    @Roles('owner_company', 'manager_company')
    @HttpCode(HttpStatus.OK)
    async reject(@Param('id') id: string, @GetUser() user: AuthenticatedUser) {
        // Pass user ke service
        return await this.csrService.updateStatus(id, 'rejected', user);
    }

    @Delete(':id')
    @HttpCode(HttpStatus.OK)
    @Roles('owner_company', 'manager_company')
    async remove(@Param('id') id: string, @GetUser() user: AuthenticatedUser) {
        await this.csrService.remove(id, user);
        return ResponseUtil.success('Client service request deleted successfully', null);
    }
}