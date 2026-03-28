import {
  Controller,
  Post,
  Get,
  Delete,
  Body,
  UseGuards,
  Param,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { MembershipService } from './membership.service';
import { GenerateMemberCodesDto } from './dto/generate-code.dto';
import { ClaimMemberCodeDto } from './dto/claim-code.dto';
import { AuthGuard } from 'src/auth/guards/auth.guard';
import { GetUser } from 'src/common/decorators/get-user.decorator';
import { AuthenticatedUser } from 'src/auth/interfaces/authenticated-user.interface';
import { RolesGuard } from 'src/auth/guards/roles.guard';
import { Roles } from 'src/common/decorators/roles.decorator';
import { Role } from 'src/common/enums/role.enum';
import { ResponseUtil } from 'src/common/utils/response.util';

@Controller('memberships')
@UseGuards(AuthGuard)
export class MembershipController {
  constructor(private readonly membershipService: MembershipService) { }

  @Get()
  @UseGuards(RolesGuard)
  @Roles(Role.CompanyOwner, Role.CompanyManager, Role.AppAdmin)
  async getSubscribedClients(@GetUser() user: AuthenticatedUser) {
    const data = await this.membershipService.findAllSubscribedClients(user);
    return ResponseUtil.success('Subscribed clients loaded successfully', data);
  }
}

@Controller('memberships/codes')
@UseGuards(AuthGuard)
export class MembershipCodeController {
  constructor(private readonly membershipService: MembershipService) { }

  @Get()
  @UseGuards(RolesGuard)
  @Roles(Role.CompanyOwner, Role.CompanyManager, Role.AppAdmin)
  async findAll(@GetUser() user: AuthenticatedUser) {
    const data = await this.membershipService.findAll(user);
    return ResponseUtil.success('Membership codes loaded successfully', data);
  }

  @Post()
  @UseGuards(RolesGuard)
  @Roles(Role.CompanyOwner, Role.CompanyManager, Role.AppAdmin)
  async generateCodes(
    @Body() dto: GenerateMemberCodesDto,
    @GetUser() user: AuthenticatedUser,
  ) {
    const data = await this.membershipService.generateCodes(dto, user);
    return ResponseUtil.success('Codes generated successfully', data);
  }

  @Post('claim')
  async claimCode(
    @Body() dto: ClaimMemberCodeDto,
    @GetUser() user: AuthenticatedUser,
  ) {
    return this.membershipService.claimCode(dto, user);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.OK)
  @Roles(Role.AppAdmin)
  async remove(@Param('id') id: string) {
    const data = await this.membershipService.remove(id);
    return ResponseUtil.success('Membership code deleted successfully', data);
  }
}
