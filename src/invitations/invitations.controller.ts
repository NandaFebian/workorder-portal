// src/invitations/invitations.controller.ts
import {
  Controller,
  Put,
  Get,
  Post,
  Delete,
  Param,
  UseGuards,
  HttpCode,
  HttpStatus,
  ForbiddenException,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { AuthGuard } from '../auth/guards/auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { GetUser } from '../common/decorators/get-user.decorator';
import type { AuthenticatedUser } from '../auth/interfaces/authenticated-user.interface';
import { InvitationsService } from './invitations.service';
import { Role } from '../common/enums/role.enum';
import { ResponseUtil } from '../common/utils/response.util';

@Controller('invitations')
@UseGuards(AuthGuard) // Semua endpoint di sini butuh login
export class InvitationsController {
  constructor(private readonly invitationsService: InvitationsService) {}

  @Get('pending') // Atau bisa juga '/me/pending'
  @UseGuards(RolesGuard)
  @Roles(Role.UnassignedStaff)
  @HttpCode(HttpStatus.OK)
  async getMyPendingInvitations(@GetUser() user: AuthenticatedUser) {
    // Anda perlu menambahkan method 'findPendingForUser' di InvitationsService
    const pendingInvitations = await this.invitationsService.findPendingForUser(
      user._id.toString(),
    );
    return {
      message: 'Pending invitations retrieved successfully',
      data: pendingInvitations,
    };
  }

  @Put(':id/accept')
  @UseGuards(RolesGuard)
  @Roles(Role.UnassignedStaff)
  @HttpCode(HttpStatus.OK)
  async acceptInvitation(
    @Param('id') invitationId: string,
    @GetUser() user: AuthenticatedUser,
  ) {
    if (user.company) {
      throw new ForbiddenException('You already belong to a company.');
    }

    const data = await this.invitationsService.acceptInvitation(
      invitationId,
      user,
    );
    return ResponseUtil.success('Invitation accepted successfully', data);
  }

  @Put(':id/reject')
  @UseGuards(RolesGuard)
  @Roles(Role.UnassignedStaff)
  @HttpCode(HttpStatus.OK)
  async rejectInvitation(
    @Param('id') invitationId: string,
    @GetUser() user: AuthenticatedUser,
  ) {
    const data = await this.invitationsService.rejectInvitation(
      invitationId,
      user,
    );
    return ResponseUtil.success('Invitation rejected successfully', data);
  }

  @Delete(':id')
  @UseGuards(RolesGuard)
  @Roles(Role.CompanyOwner, Role.CompanyManager)
  @HttpCode(HttpStatus.OK)
  async remove(@Param('id') id: string, @GetUser() user: AuthenticatedUser) {
    const data = await this.invitationsService.remove(id, user);
    return ResponseUtil.success('Invitation deleted successfully', data);
  }

  // Mungkin perlu endpoint GET /invitations/pending untuk user melihat undangannya?
  // @Get('pending')
  // @Roles(Role.UnassignedStaff)
  // async getMyPendingInvitations(@GetUser() user: AuthenticatedUser) {
  //     // Implementasi service untuk find({ userId: user._id, status: 'pending' })
  // }
}
