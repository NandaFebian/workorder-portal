// src/invitations/invitations.controller.ts
import { Controller, Put, Get, Post, Delete, Param, UseGuards, HttpCode, HttpStatus, ForbiddenException, NotFoundException, BadRequestException } from '@nestjs/common';
import { AuthGuard } from '../auth/guards/auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { GetUser } from '../common/decorators/get-user.decorator';
import type { AuthenticatedUser } from '../auth/interfaces/authenticated-user.interface';
import { InvitationsService } from './invitations.service';
import { Role } from '../common/enums/role.enum';

@Controller('invitations')
@UseGuards(AuthGuard) // Semua endpoint di sini butuh login
export class InvitationsController {
    constructor(private readonly invitationsService: InvitationsService) { }

    @Get('pending') // Atau bisa juga '/me/pending'
    @UseGuards(RolesGuard)
    @Roles(Role.UnassignedStaff) // Hanya user unassigned yang bisa melihat undangan pending
    @HttpCode(HttpStatus.OK)
    async getMyPendingInvitations(@GetUser() user: AuthenticatedUser) {
        // Anda perlu menambahkan method 'findPendingForUser' di InvitationsService
        const pendingInvitations = await this.invitationsService.findPendingForUser(user._id.toString());
        return {
            message: 'Pending invitations retrieved successfully',
            data: pendingInvitations,
        };
    }

    @Put(':id/accept')
    @UseGuards(RolesGuard) // Tambahkan RolesGuard
    @Roles(Role.UnassignedStaff) // Hanya user dengan role UnassignedStaff yang bisa accept
    @HttpCode(HttpStatus.OK)
    async acceptInvitation(
        @Param('id') invitationId: string,
        @GetUser() user: AuthenticatedUser,
    ) {
        if (user.company) {
            throw new ForbiddenException('You already belong to a company.');
        }

        const updatedUser = await this.invitationsService.acceptInvitation(invitationId, user);
        return {
            message: 'Invitation accepted successfully',
            data: {
                // Kirim data user yang relevan (tanpa password)
                _id: updatedUser._id,
                name: updatedUser.name,
                email: updatedUser.email,
                role: updatedUser.role,
                companyId: updatedUser.companyId,
                positionId: updatedUser.positionId
            },
        };
    }

    @Put(':id/reject')
    @UseGuards(RolesGuard)
    @Roles(Role.UnassignedStaff) // Hanya user unassigned yg bisa reject invite ke company
    @HttpCode(HttpStatus.OK)
    async rejectInvitation(
        @Param('id') invitationId: string,
        @GetUser() user: AuthenticatedUser,
    ) {
        await this.invitationsService.rejectInvitation(invitationId, user);
        return {
            message: 'Invitation rejected successfully',
            // data tidak perlu dikirim karena hanya update status invite
        };
    }

    @Delete(':id')
    @UseGuards(RolesGuard)
    @Roles('owner_company', 'manager_company')
    @HttpCode(HttpStatus.OK)
    async remove(@Param('id') id: string, @GetUser() user: AuthenticatedUser) {
        await this.invitationsService.remove(id, user);
        return {
            message: 'Invitation deleted successfully',
        };
    }

    // Mungkin perlu endpoint GET /invitations/pending untuk user melihat undangannya?
    // @Get('pending')
    // @Roles(Role.UnassignedStaff)
    // async getMyPendingInvitations(@GetUser() user: AuthenticatedUser) {
    //     // Implementasi service untuk find({ userId: user._id, status: 'pending' })
    // }
}