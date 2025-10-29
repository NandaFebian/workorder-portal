// src/company/companies.internal.controller.ts
import { Controller, Get, HttpCode, HttpStatus, Param, Put, Body, UseGuards, Post, ForbiddenException } from "@nestjs/common";
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

@Controller('company')
export class CompaniesInternalController {
    constructor(
        private readonly companiesInternalService: CompaniesInternalService, // Inject service internal
        private readonly usersService: UsersService,
    ) { }

    @Get()
    @HttpCode(HttpStatus.OK)
    // Sebaiknya endpoint ini diamankan (misal: @Roles('admin_app'))
    async findAll() {
        const companies = await this.companiesInternalService.findAllInternal();
        return {
            message: 'Companies retrieved successfully',
            data: companies,
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
        return this.companiesInternalService.inviteEmployees(invitingUser.company._id.toString(), inviteEmployeesDto);
    }

    @Get('invitations/history')
    @UseGuards(AuthGuard)
    async getInvitationHistory(@GetUser() user: AuthenticatedUser) {
        return this.companiesInternalService.getInvitationHistory(user._id.toString());
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

        // Transformasi data
        const transformedEmployees = employees.map(emp => {
            const empObject: any = emp.toObject();
            // Tidak perlu menghapus password karena sudah dikecualikan di query service
            // delete empObject.password;
            if (empObject.positionId) {
                empObject.position = empObject.positionId;
                delete empObject.positionId;
            }
            return empObject;
        });

        return {
            message: 'Employees retrieved successfully',
            data: transformedEmployees,
        };
    }

    @Put(':id')
    @UseGuards(AuthGuard, RolesGuard)
    @Roles('owner_company', 'manager_company', 'admin_app') // Tentukan siapa yg boleh update
    @HttpCode(HttpStatus.OK)
    async update(@Param('id') id: string, @Body() updateCompanyDto: UpdateCompanyDto) {
        // TODO: Tambahkan logika di service untuk cek otorisasi (apa user ini boleh update company dg id tsb)
        const company = await this.companiesInternalService.update(id, updateCompanyDto);
        return {
            message: 'Company updated successfully',
            data: company,
        };
    }

    @Get(':id')
    @HttpCode(HttpStatus.OK)
    // Sebaiknya endpoint ini diamankan
    async findById(@Param('id') id: string) {
        const company = await this.companiesInternalService.findInternalById(id);
        return {
            message: 'Company retrieved successfully',
            data: company,
        };
    }
}