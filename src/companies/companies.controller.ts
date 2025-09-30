import { Controller, Get, HttpCode, HttpStatus, Param, Put, Body, UseGuards, Post, ForbiddenException, UnauthorizedException, Req } from "@nestjs/common";
import { CompaniesService } from "./companies.service";
import { AuthGuard } from "src/auth/guards/auth.guard";
import { UpdateCompanyDto } from "./dto/update-company.dto";
import { InviteEmployeesDto } from "./dto/invite-employees.dto";
import { InviteEmployeesResponse } from "./interfaces/invitation.interface";
import { GetUser } from '../common/decorators/get-user.decorator';
import type { UserDocument } from '../users/schemas/user.schema';

@Controller('companies')
export class CompaniesController {
    constructor(private readonly companiesService: CompaniesService) { }

    @Get()
    @HttpCode(HttpStatus.OK)
    async findAll() {
        const companies = await this.companiesService.findAll();
        return {
            message: 'Companies retrieved successfully',
            meta: {
                total: companies.length,
            },
            data: {
                companies: companies,
            }
        };
    }

    // Endpoint untuk mengupdate perusahaan berdasarkan ID
    @Put(':id')
    @UseGuards(AuthGuard)
    @HttpCode(HttpStatus.OK)
    async update(@Param('id') id: string, @Body() updateCompanyDto: UpdateCompanyDto) {
        const company = await this.companiesService.update(id, updateCompanyDto);
        return {
            message: 'Company updated successfully',
            data: {
                company: company,
            }
        };
    }

    // Endpoint untuk mendapatkan perusahaan berdasarkan ID
    @Get(':id')
    @HttpCode(HttpStatus.OK)
    async findById(@Param('id') id: string) {
        const company = await this.companiesService.findById(id);
        return {
            message: 'Company retrieved successfully',
            data: {
                company: company,
            }
        };
    }

    @Post('invite')
    @UseGuards(AuthGuard)
    async inviteEmployees(
        @GetUser() invitingUser: UserDocument,
        @Body() inviteEmployeesDto: InviteEmployeesDto
    ): Promise<InviteEmployeesResponse> {
        // Validasi role user
        if (!['owner_company', 'manager_company'].includes(invitingUser.role)) {
            throw new ForbiddenException('Only company owners and managers can invite employees');
        }

        // Validasi company ID
        if (!invitingUser.companyId) {
            throw new ForbiddenException('User must belong to a company to invite employees');
        }

        return this.companiesService.inviteEmployees(invitingUser.companyId.toString(), inviteEmployeesDto);
    }

    @Get('invitations/history')
    @UseGuards(AuthGuard)
    async getInvitationHistory(@Req() request: any) {
        return this.companiesService.getInvitationHistory(request.user._id);
    }
}