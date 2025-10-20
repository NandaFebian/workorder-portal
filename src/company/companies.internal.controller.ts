// src/company/companies.internal.controller.ts
import { Controller, Get, HttpCode, HttpStatus, Param, Put, Body, UseGuards, Post, ForbiddenException } from "@nestjs/common";
import { CompaniesService } from "./companies.service";
import { AuthGuard } from "src/auth/guards/auth.guard";
import { UpdateCompanyDto } from "./dto/update-company.dto";
import { InviteEmployeesDto } from "./dto/invite-employees.dto";
import { InviteEmployeesResponse } from "./interfaces/invitation.interface";
import { GetUser } from '../common/decorators/get-user.decorator';
import { Roles } from "src/common/decorators/roles.decorator";
import { RolesGuard } from "src/auth/guards/roles.guard";
import { UsersService } from "src/users/users.service";
import type { AuthenticatedUser } from "src/auth/interfaces/authenticated-user.interface";

@Controller('company')
export class CompaniesInternalController {
    constructor(
        private readonly companiesService: CompaniesService,
        private readonly usersService: UsersService,
    ) { }

    @Get()
    @HttpCode(HttpStatus.OK)
    async findAll() {
        const companies = await this.companiesService.findAll();
        return {
            message: 'Companies retrieved successfully',
            data: companies,
        };
    }

    @Put(':id')
    @UseGuards(AuthGuard)
    @HttpCode(HttpStatus.OK)
    async update(@Param('id') id: string, @Body() updateCompanyDto: UpdateCompanyDto) {
        const company = await this.companiesService.update(id, updateCompanyDto);
        return {
            message: 'Company updated successfully',
            data: company,
        };
    }

    @Get(':id')
    @HttpCode(HttpStatus.OK)
    async findById(@Param('id') id: string) {
        const company = await this.companiesService.findById(id);
        return {
            message: 'Company retrieved successfully',
            data: company,
        };
    }

    @Post('invite')
    @UseGuards(AuthGuard, RolesGuard)
    @Roles('owner_company')
    async inviteEmployees(
        @GetUser() invitingUser: AuthenticatedUser,
        @Body() inviteEmployeesDto: InviteEmployeesDto
    ): Promise<InviteEmployeesResponse> {
        if (!invitingUser.company?._id) {
            throw new ForbiddenException('User must belong to a company to invite employees');
        }
        return this.companiesService.inviteEmployees(invitingUser.company._id.toString(), inviteEmployeesDto);
    }

    @Get('invitations/history')
    @UseGuards(AuthGuard)
    async getInvitationHistory(@GetUser() user: AuthenticatedUser) {
        return this.companiesService.getInvitationHistory(user._id.toString());
    }

    @Get('employees')
    @UseGuards(AuthGuard, RolesGuard)
    @Roles('owner_company', 'manager_company')
    @HttpCode(HttpStatus.OK)
    async findAllEmployees(@GetUser() user: AuthenticatedUser) {
        if (!user.company?._id) {
            throw new ForbiddenException('You are not associated with any company.');
        }

        const employees = await this.usersService.findAllByCompanyId(user.company._id);

        const transformedEmployees = employees.map(emp => {
            const empObject: any = emp.toObject();
            if (empObject.positionId) {
                empObject.position = empObject.positionId;
                delete empObject.positionId;
            }
            delete empObject.password;
            return empObject;
        });

        return {
            message: 'Employees retrieved successfully',
            data: transformedEmployees,
        };
    }
}