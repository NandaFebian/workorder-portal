// src/service-requests/service-requests.controller.ts
import { Controller, Get, Put, Body, Param, UseGuards, HttpCode, HttpStatus } from '@nestjs/common';
import { AuthGuard } from 'src/auth/guards/auth.guard';
import { RolesGuard } from 'src/auth/guards/roles.guard';
import { Roles } from 'src/common/decorators/roles.decorator';
import { GetUser } from 'src/common/decorators/get-user.decorator';
import { AuthenticatedUser } from 'src/auth/interfaces/authenticated-user.interface';
import { ServiceRequestsService } from './service-requests.service';
import { UpdateRequestStatusDto } from './dto/update-request-status.dto';
import { Role } from 'src/common/enums/role.enum';

@UseGuards(AuthGuard)
@Controller('service-requests')
export class ServiceRequestsController {
    constructor(private readonly requestsService: ServiceRequestsService) { }

    @Get('my-requests')
    @Roles(Role.Client)
    @UseGuards(RolesGuard)
    @HttpCode(HttpStatus.OK)
    async getMyRequests(@GetUser() user: AuthenticatedUser) {
        const requests = await this.requestsService.findForClient(user);
        return { message: 'Requests retrieved successfully', data: requests };
    }

    @Get('company')
    @Roles(Role.CompanyOwner, Role.CompanyManager)
    @UseGuards(RolesGuard)
    @HttpCode(HttpStatus.OK)
    async getCompanyRequests(@GetUser() user: AuthenticatedUser) {
        const requests = await this.requestsService.findForCompany(user);
        return { message: 'Company requests retrieved successfully', data: requests };
    }

    @Put(':id/status')
    @Roles(Role.CompanyOwner, Role.CompanyManager)
    @UseGuards(RolesGuard)
    @HttpCode(HttpStatus.OK)
    async updateStatus(
        @Param('id') requestId: string,
        @Body() updateDto: UpdateRequestStatusDto,
        @GetUser() user: AuthenticatedUser,
    ) {
        const updatedRequest = await this.requestsService.updateStatus(requestId, updateDto, user);
        return { message: 'Request status updated successfully', data: updatedRequest };
    }
}