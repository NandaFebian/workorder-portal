// src/company/companies.internal.controller.ts
import {
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Put,
  Body,
  UseGuards,
  Post,
  ForbiddenException,
  BadRequestException,
  Delete,
  Query,
} from '@nestjs/common';
import { CompaniesInternalService } from './companies.internal.service';
import { AuthGuard } from 'src/auth/guards/auth.guard';
import { UpdateCompanyDto } from './dto/update-company.dto';
import { UpdateIntegrationConfigDto } from './dto/update-integration-config.dto';
import { InviteEmployeesDto } from './dto/invite-employees.dto';
import { KickEmployeeDto } from './dto/kick-employee.dto';
import { InviteEmployeesResponse } from './interfaces/invitation.interface';
import { GetUser } from '../common/decorators/get-user.decorator';
import { Roles } from 'src/common/decorators/roles.decorator';
import { RolesGuard } from 'src/auth/guards/roles.guard';
import { UsersService } from 'src/users/users.service';
import type { AuthenticatedUser } from 'src/auth/interfaces/authenticated-user.interface';
import { Role } from 'src/common/enums/role.enum';
import { ResponseUtil } from 'src/common/utils/response.util';
import { CompanyResource } from './resources/company.resource';
import { DepartmentAuthHelper } from 'src/common/helpers/department-auth.helper';

@Controller('company')
export class CompaniesInternalController {
  constructor(
    private readonly companiesInternalService: CompaniesInternalService, // Inject service internal
    private readonly usersService: UsersService,
  ) {}

  @Get()
  @UseGuards(AuthGuard, RolesGuard)
  @Roles(Role.AppAdmin, Role.CompanyOwner, Role.CompanyManager, Role.CompanyStaff)
  @HttpCode(HttpStatus.OK)
  async findAll(@GetUser() user: AuthenticatedUser) {
    if (user.role === 'admin_app') {
      const companies = await this.companiesInternalService.findAllInternal();
      const transformedCompanies = companies.map((c) =>
        CompanyResource.transformCompany(c),
      );
      return ResponseUtil.success(
        'Companies retrieved successfully',
        transformedCompanies,
      );
    }

    if (!user.company?._id) {
      return ResponseUtil.success(
        'No company associated with this user',
        null,
      );
    }
    const company = await this.companiesInternalService.findInternalById(
      user.company._id.toString(),
    );
    const transformedCompany = CompanyResource.transformCompany(company);

    return ResponseUtil.success(
      'Company retrieved successfully',
      transformedCompany,
    );
  }

  @Post('invite')
  @UseGuards(AuthGuard, RolesGuard)
  @Roles(Role.CompanyOwner, Role.CompanyManager)
  async inviteEmployees(
    @GetUser() invitingUser: AuthenticatedUser,
    @Body() inviteEmployeesDto: InviteEmployeesDto,
  ): Promise<InviteEmployeesResponse> {
    if (!invitingUser.company?._id) {
      throw new ForbiddenException(
        'User must belong to a company to invite employees',
      );
    }
    return this.companiesInternalService.inviteEmployees(
      invitingUser.company._id.toString(),
      inviteEmployeesDto,
      invitingUser,
    );
  }

  // Endpoint: {{base_url}}/company/invitable-users?email=<keyword>
  // Look up unassigned-staff users (available for invitation) by email so an
  // owner/manager can find the right person before sending an invite.
  @Get('invitable-users')
  @UseGuards(AuthGuard, RolesGuard)
  @Roles(Role.CompanyOwner, Role.CompanyManager)
  @HttpCode(HttpStatus.OK)
  async searchInvitableUsers(
    @GetUser() user: AuthenticatedUser,
    @Query('email') email?: string,
  ) {
    if (!user.company?._id) {
      throw new ForbiddenException('You are not associated with any company.');
    }

    const keyword = email?.trim();
    if (!keyword) {
      throw new BadRequestException(
        'The "email" query parameter is required to search for invitable users.',
      );
    }

    const users =
      await this.usersService.searchAvailableUnassignedStaffByEmail(keyword);

    return ResponseUtil.success(
      'Invitable users retrieved successfully',
      users,
    );
  }

  @Get('invitations/history')
  @UseGuards(AuthGuard, RolesGuard)
  @Roles(Role.CompanyOwner, Role.CompanyManager)
  async getInvitationHistory(@GetUser() user: AuthenticatedUser) {
    if (!user.company?._id) {
      throw new ForbiddenException('You are not associated with any company.');
    }
    return this.companiesInternalService.getInvitationHistory(
      user.company._id.toString(),
      user._id.toString(),
    );
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
      if (DepartmentAuthHelper.isDepartmentManager(user)) {
        // Department Manager: hanya melihat staff dengan posisi yang sama
        allowedRoles = [Role.CompanyStaff];
      } else {
        // General Manager: melihat department manager dan staff
        allowedRoles = [Role.CompanyManager, Role.CompanyStaff];
      }
    }

    // Panggil service dengan menyertakan filter roles
    let employees = await this.usersService.findAllByCompanyId(
      user.company._id,
      allowedRoles,
    );

    // Department Manager: hanya melihat pegawai dengan posisi yang sama
    if (DepartmentAuthHelper.isDepartmentManager(user)) {
      const managerPositionId = user.position?._id?.toString();
      employees = employees.filter(
        (emp) => emp.positionId?.toString() === managerPositionId ||
                 emp.positionId?._id?.toString() === managerPositionId,
      );
    } else if (DepartmentAuthHelper.isGeneralManager(user)) {
      // General Manager: filter out other general managers, hanya lihat dept managers & staff
      employees = employees.filter(
        (emp) => emp._id.toString() !== user._id.toString(),
      );
    }

    // Transformasi data menggunakan resource
    const transformedEmployees = employees.map((emp) =>
      CompanyResource.transformEmployee(emp),
    );

    return ResponseUtil.success(
      'Employees retrieved successfully',
      transformedEmployees,
    );
  }

  @Put()
  @UseGuards(AuthGuard, RolesGuard)
  @Roles(Role.CompanyOwner, Role.CompanyManager) // Tentukan siapa yg boleh update
  @HttpCode(HttpStatus.OK)
  async update(
    @GetUser() user: AuthenticatedUser,
    @Body() updateCompanyDto: UpdateCompanyDto,
  ) {
    if (!user.company?._id) {
      throw new ForbiddenException('You are not associated with any company.');
    }
    const id = user.company._id.toString();
    // TODO: Tambahkan logika di service untuk cek otorisasi (apa user ini boleh update company dg id tsb)
    const company = await this.companiesInternalService.update(
      id,
      updateCompanyDto,
    );
    const transformedCompany = CompanyResource.transformCompany(company);
    return ResponseUtil.success(
      'Company updated successfully',
      transformedCompany,
    );
  }

  @Get('detail')
  @UseGuards(AuthGuard, RolesGuard)
  @HttpCode(HttpStatus.OK)
  @Roles(Role.CompanyOwner, Role.CompanyManager)
  async findById(@GetUser() user: AuthenticatedUser) {
    if (!user.company?._id) {
      throw new ForbiddenException('You are not associated with any company.');
    }
    const id = user.company._id.toString();
    const company = await this.companiesInternalService.findInternalById(id);
    const transformedCompany = CompanyResource.transformCompany(company);
    return ResponseUtil.success(
      'Company retrieved successfully',
      transformedCompany,
    );
  }

  @Delete()
  @UseGuards(AuthGuard, RolesGuard)
  @HttpCode(HttpStatus.OK)
  @Roles(Role.CompanyOwner)
  async remove(@GetUser() user: AuthenticatedUser) {
    if (!user.company?._id) {
      throw new ForbiddenException('You are not associated with any company.');
    }
    const id = user.company._id.toString();
    const data = await this.companiesInternalService.remove(id, user);
    return ResponseUtil.success('Company deleted successfully', data);
  }

  @Get('integration-config')
  @UseGuards(AuthGuard, RolesGuard)
  @HttpCode(HttpStatus.OK)
  @Roles(Role.CompanyOwner)
  async getIntegrationConfig(@GetUser() user: AuthenticatedUser) {
    if (!user.company?._id) {
      throw new ForbiddenException('You are not associated with any company.');
    }
    const data = await this.companiesInternalService.getIntegrationConfig(
      user.company._id.toString(),
    );
    return ResponseUtil.success(
      'Integration config retrieved successfully',
      data,
    );
  }

  @Put('integration-config')
  @UseGuards(AuthGuard, RolesGuard)
  @HttpCode(HttpStatus.OK)
  @Roles(Role.CompanyOwner)
  async updateIntegrationConfig(
    @GetUser() user: AuthenticatedUser,
    @Body() dto: UpdateIntegrationConfigDto,
  ) {
    if (!user.company?._id) {
      throw new ForbiddenException('You are not associated with any company.');
    }
    const data = await this.companiesInternalService.updateIntegrationConfig(
      user.company._id.toString(),
      dto,
    );
    return ResponseUtil.success(
      'Integration config updated successfully',
      data,
    );
  }

  @Get('employees/:id')
  @UseGuards(AuthGuard, RolesGuard)
  @Roles(Role.CompanyOwner, Role.CompanyManager)
  @HttpCode(HttpStatus.OK)
  async getEmployeeDetail(
    @Param('id') id: string,
    @GetUser() user: AuthenticatedUser,
  ) {
    const result = await this.companiesInternalService.getEmployeeDetail(
      id,
      user,
    );
    return ResponseUtil.success(
      'Employee retrieved successfully',
      result.data,
      result.meta,
    );
  }

  @Delete('employees')
  @UseGuards(AuthGuard, RolesGuard)
  @Roles(Role.CompanyOwner, Role.CompanyManager)
  @HttpCode(HttpStatus.OK)
  async kickEmployee(
    @Body() kickEmployeeDto: KickEmployeeDto,
    @GetUser() user: AuthenticatedUser,
  ) {
    const data = await this.companiesInternalService.kickEmployee(kickEmployeeDto.email, user);
    return ResponseUtil.success('Employee removed successfully', data);
  }
}

