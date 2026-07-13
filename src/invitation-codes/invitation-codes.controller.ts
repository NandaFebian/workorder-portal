import {
  Body,
  Controller,
  Delete,
  ForbiddenException,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';
import { InvitationCodesService } from './invitation-codes.service';
import { AuthGuard } from 'src/auth/guards/auth.guard';
import { RolesGuard } from 'src/auth/guards/roles.guard';
import { Roles } from 'src/common/decorators/roles.decorator';
import { GetUser } from 'src/common/decorators/get-user.decorator';
import { Role } from 'src/common/enums/role.enum';
import { ResponseUtil } from 'src/common/utils/response.util';
import { CreateInvitationCodeDto } from './dto/create-invitation-code.dto';
import { UpdateInvitationCodeDto } from './dto/update-invitation-code.dto';
import { ClaimInvitationCodeDto } from './dto/claim-invitation-code.dto';
import { InvitationCodeResource } from './resources/invitation-code.resource';
import type { AuthenticatedUser } from 'src/auth/interfaces/authenticated-user.interface';

/**
 * Company side: owners/managers configure the codes.
 * Endpoint: {{base_url}}/company/invitation-codes
 */
@Controller('company/invitation-codes')
@UseGuards(AuthGuard, RolesGuard)
@Roles(Role.CompanyOwner, Role.CompanyManager)
export class InvitationCodesController {
  constructor(
    private readonly invitationCodesService: InvitationCodesService,
  ) {}

  private requireCompanyId(user: AuthenticatedUser): string {
    if (!user.company?._id) {
      throw new ForbiddenException('You are not associated with any company.');
    }
    return user.company._id.toString();
  }

  @Post()
  @HttpCode(HttpStatus.CREATED)
  async create(
    @GetUser() user: AuthenticatedUser,
    @Body() dto: CreateInvitationCodeDto,
  ) {
    const code = await this.invitationCodesService.create(
      this.requireCompanyId(user),
      dto,
      user,
    );
    return ResponseUtil.success(
      'Invitation code created successfully',
      InvitationCodeResource.transform(code),
    );
  }

  @Get()
  @HttpCode(HttpStatus.OK)
  async findAll(@GetUser() user: AuthenticatedUser) {
    const codes = await this.invitationCodesService.findAllByCompany(
      this.requireCompanyId(user),
      user,
    );
    return ResponseUtil.success(
      'Invitation codes retrieved successfully',
      InvitationCodeResource.transformList(codes),
    );
  }

  @Get(':id')
  @HttpCode(HttpStatus.OK)
  async findOne(
    @Param('id') id: string,
    @GetUser() user: AuthenticatedUser,
  ) {
    const code = await this.invitationCodesService.findOne(
      id,
      this.requireCompanyId(user),
      user,
    );
    return ResponseUtil.success(
      'Invitation code retrieved successfully',
      InvitationCodeResource.transform(code),
    );
  }

  @Patch(':id')
  @HttpCode(HttpStatus.OK)
  async update(
    @Param('id') id: string,
    @GetUser() user: AuthenticatedUser,
    @Body() dto: UpdateInvitationCodeDto,
  ) {
    const code = await this.invitationCodesService.update(
      id,
      this.requireCompanyId(user),
      dto,
      user,
    );
    return ResponseUtil.success(
      'Invitation code updated successfully',
      InvitationCodeResource.transform(code),
    );
  }

  @Delete(':id')
  @HttpCode(HttpStatus.OK)
  async remove(@Param('id') id: string, @GetUser() user: AuthenticatedUser) {
    const data = await this.invitationCodesService.remove(
      id,
      this.requireCompanyId(user),
      user,
    );
    return ResponseUtil.success('Invitation code revoked successfully', data);
  }
}

/**
 * Claim side: an unassigned staff member redeems a code.
 * Endpoint: {{base_url}}/invitation-codes
 */
@Controller('invitation-codes')
@UseGuards(AuthGuard)
export class InvitationCodesClaimController {
  constructor(
    private readonly invitationCodesService: InvitationCodesService,
  ) {}

  // Look up what a code grants before claiming it.
  @Get(':code')
  @HttpCode(HttpStatus.OK)
  async preview(@Param('code') code: string) {
    const data = await this.invitationCodesService.preview(code);
    return ResponseUtil.success(
      'Invitation code retrieved successfully',
      data,
    );
  }

  @Post('claim')
  @HttpCode(HttpStatus.OK)
  async claim(
    @Body() dto: ClaimInvitationCodeDto,
    @GetUser() user: AuthenticatedUser,
  ) {
    const joinedUser = await this.invitationCodesService.claim(dto, user);
    return ResponseUtil.success(
      'Invitation code claimed successfully. You have joined the company.',
      joinedUser,
    );
  }
}
