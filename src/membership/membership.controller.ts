import { Controller, Post, Get, Body, UseGuards, Param } from '@nestjs/common';
import { MembershipService } from './membership.service';
import { GenerateMemberCodesDto } from './dto/generate-code.dto';
import { ClaimMemberCodeDto } from './dto/claim-code.dto';
import { AuthGuard } from 'src/auth/guards/auth.guard';
import { GetUser } from 'src/common/decorators/get-user.decorator';
import { AuthenticatedUser } from 'src/auth/interfaces/authenticated-user.interface';
import { RolesGuard } from 'src/auth/guards/roles.guard';
import { Roles } from 'src/common/decorators/roles.decorator';
import { Role } from 'src/common/enums/role.enum';

@Controller('memberships')
@UseGuards(AuthGuard)
export class MembershipController {
    constructor(private readonly membershipService: MembershipService) { }

    @Get()
    @UseGuards(RolesGuard)
    @Roles(Role.CompanyOwner, Role.CompanyManager, 'admin_app') // Assume admin or managers manage this
    async findAll() {
        return this.membershipService.findAll();
    }

    @Post('generate')
    @UseGuards(RolesGuard)
    @Roles(Role.CompanyOwner, Role.CompanyManager, 'admin_app')
    async generateCodes(@Body() dto: GenerateMemberCodesDto) {
        return this.membershipService.generateCodes(dto);
    }

    @Post('claim')
    async claimCode(@Body() dto: ClaimMemberCodeDto, @GetUser() user: AuthenticatedUser) {
        return this.membershipService.claimCode(dto, user);
    }
}
