// src/company/companies.internal.controller.ts
import { Controller, Get, HttpCode, HttpStatus, Param, Put, Body, UseGuards, Post, ForbiddenException, Delete } from "@nestjs/common";
import { CompaniesInternalService } from "./companies.internal.service";
import { AuthGuard } from "src/auth/guards/auth.guard";
import { UpdateCompanyDto } from "./dto/update-company.dto";
import { InviteEmployeesDto } from "./dto/invite-employees.dto";
import { InviteEmployeesResponse } from "./interfaces/invitation.interface";
import { GetUser } from '../common/decorators/get-user.decorator';
import { Roles } from "src/common/decorators/roles.decorator";
import { RolesGuard } from "src/auth/guards/roles.guard";
import { UsersService } from "src/users/users.service";
import type { AuthenticatedUser } from "src/auth/interfaces/authenticated-user.interface";
import { Role } from "src/common/enums/role.enum";
import { ResponseUtil } from "src/common/utils/response.util";
import { CompanyResource } from "./resources/company.resource";

@Controller('company')
export class CompaniesInternalController {
    constructor(
        private readonly companiesInternalService: CompaniesInternalService, // Inject service internal
        private readonly usersService: UsersService,
    ) { }

    @Get()
    @UseGuards(AuthGuard, RolesGuard)
    @Roles(Role.AppAdmin, Role.CompanyOwner)
    @HttpCode(HttpStatus.OK)
    async findAll(@GetUser() user: AuthenticatedUser) {
        if (user.role === 'admin_app') {
            const companies = await this.companiesInternalService.findAllInternal();
            const transformedCompanies = companies.map(c => CompanyResource.transformCompany(c));
            return ResponseUtil.success('Companies retrieved successfully', transformedCompanies);
        } else if (user.role === 'owner_company') {
            if (!user.company?._id) {
                // Should not happen for a valid owner, but good to handle
                return ResponseUtil.success('No company associated with this owner', []);
            }
            const company = await this.companiesInternalService.findInternalById(user.company._id.toString());
            const transformedCompany = CompanyResource.transformCompany(company);
            // Return as array to be consistent with admin response
            return ResponseUtil.success('Company retrieved successfully', [transformedCompany]);
        }
    }

    @Post('invite')
    @UseGuards(AuthGuard, RolesGuard)
    @Roles(Role.CompanyOwner)
    async inviteEmployees(
        @GetUser() invitingUser: AuthenticatedUser,
        @Body() inviteEmployeesDto: InviteEmployeesDto
    ): Promise<InviteEmployeesResponse> {
        if (!invitingUser.company?._id) {
            throw new ForbiddenException('User must belong to a company to invite employees');
        }
        return this.companiesInternalService.inviteEmployees(invitingUser.company._id.toString(), inviteEmployeesDto);
    }

    @Get('invitations/history')
    @UseGuards(AuthGuard, RolesGuard)
    @Roles(Role.CompanyOwner, Role.CompanyManager)
    async getInvitationHistory(@GetUser() user: AuthenticatedUser) {
        if (!user.company?._id) {
            throw new ForbiddenException('You are not associated with any company.');
        }
        return this.companiesInternalService.getInvitationHistory(user.company._id.toString());
    }

    @Get('employees')
    @UseGuards(AuthGuard, RolesGuard)
    @Roles(Role.CompanyOwner, Role.CompanyManager) // Gunakan enum Role
    @HttpCode(HttpStatus.OK)
    async findAllEmployees(@GetUser() user: AuthenticatedUser) {
        if (!user.company?._id) {
            throw new ForbiddenException('You are not associated with any company.');
        }

        let allowedRoles: string[] = [];
        if (user.role === Role.CompanyOwner) {
            // Owner bisa melihat Manager dan Staff
            allowedRoles = [Role.CompanyManager, Role.CompanyStaff];
        } else if (user.role === Role.CompanyManager) {
            // Manager hanya bisa melihat Staff
            allowedRoles = [Role.CompanyStaff];
        }

        // Panggil service dengan menyertakan filter roles
        const employees = await this.usersService.findAllByCompanyId(
            user.company._id,
            allowedRoles // Teruskan filter peran
        );

        // Transformasi data menggunakan resource
        const transformedEmployees = employees.map(emp => CompanyResource.transformEmployee(emp));

        return ResponseUtil.success('Employees retrieved successfully', transformedEmployees);
    }

    @Put(':id')
    @UseGuards(AuthGuard, RolesGuard)
    @Roles(Role.CompanyOwner, Role.CompanyManager) // Tentukan siapa yg boleh update
    @HttpCode(HttpStatus.OK)
    async update(@Param('id') id: string, @Body() updateCompanyDto: UpdateCompanyDto) {
        // TODO: Tambahkan logika di service untuk cek otorisasi (apa user ini boleh update company dg id tsb)
        const company = await this.companiesInternalService.update(id, updateCompanyDto);
        const transformedCompany = CompanyResource.transformCompany(company);
        return ResponseUtil.success('Company updated successfully', transformedCompany);
    }

    @Get(':id')
    @HttpCode(HttpStatus.OK)
    @Roles(Role.CompanyOwner, Role.CompanyManager, Role.AppAdmin)
    async findById(@Param('id') id: string) {
        const company = await this.companiesInternalService.findInternalById(id);
        const transformedCompany = CompanyResource.transformCompany(company);
        return ResponseUtil.success('Company retrieved successfully', transformedCompany);
    }

    @Delete(':id')
    @HttpCode(HttpStatus.OK)
    @Roles(Role.CompanyOwner)
    async remove(@Param('id') id: string, @GetUser() user: AuthenticatedUser) {
        const data = await this.companiesInternalService.remove(id, user);
        return ResponseUtil.success('Company deleted successfully', data);
    }
}