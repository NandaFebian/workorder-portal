// src/invitations/invitations.service.ts
import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  BadRequestException,
  InternalServerErrorException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import {
  Invitation,
  InvitationDocument,
} from '../company/schemas/invitation.schemas';
import { User, UserDocument } from '../users/schemas/user.schema';
import { AuthenticatedUser } from '../auth/interfaces/authenticated-user.interface';
import { Role } from '../common/enums/role.enum'; // Impor enum Role
import { InvitationResource } from './resources/invitation.resource';

@Injectable()
export class InvitationsService {
  constructor(
    @InjectModel(Invitation.name)
    private invitationModel: Model<InvitationDocument>,
    @InjectModel(User.name) private userModel: Model<UserDocument>,
    // Opsional: bisa inject UsersService jika ada method helper yang berguna
    // private usersService: UsersService,
  ) {}

  async findPendingForUser(userId: string): Promise<any[]> {
    // Ubah tipe return ke any[] atau interface custom
    if (!Types.ObjectId.isValid(userId)) {
      throw new BadRequestException(`Invalid user ID format: ${userId}`);
    }

    const user = await this.userModel.findById(userId).exec();
    if (!user) {
      throw new BadRequestException('User not found');
    }

    if (user.companyId) {
      throw new BadRequestException(
        'You already belong to a company. You cannot view or receive new invitations.',
      );
    }

    const now = new Date();

    // Cari undangan yang pending dan belum expired
    const pendingInvitationsDocs = await this.invitationModel
      .find({
        userId: new Types.ObjectId(userId),
        status: 'pending',
        expiresAt: { $gt: now },
        deletedAt: null,
      })
      .populate('companyId', 'name')
      .populate('positionId', 'name')
      .select('-userId') // Sembunyikan userId
      .sort({ createdAt: -1 })
      .exec();

    const transformedInvitations = InvitationResource.transformInvitationList(pendingInvitationsDocs);

    // Handle undangan yang sudah expired
    const expiredPending = await this.invitationModel
      .find({
        userId: new Types.ObjectId(userId),
        status: 'pending',
        expiresAt: { $lte: now },
        deletedAt: null,
      })
      .exec();

    if (expiredPending.length > 0) {
      await this.invitationModel
        .updateMany(
          { _id: { $in: expiredPending.map((inv) => inv._id) } },
          { $set: { status: 'expired' } },
        )
        .exec();
    }

    return transformedInvitations;
  }

  async acceptInvitation(
    invitationId: string,
    acceptingUser: AuthenticatedUser,
  ): Promise<UserDocument> {
    // 1. Validasi Input & Cari Undangan
    if (!Types.ObjectId.isValid(invitationId)) {
      throw new BadRequestException(
        `Invalid invitation ID format: ${invitationId}`,
      );
    }

    const invitation = await this.invitationModel.findById(invitationId).exec();

    if (!invitation) {
      throw new NotFoundException(
        `Invitation with ID ${invitationId} not found.`,
      );
    }

    // 2. Validasi Otorisasi & Status Undangan
    if (invitation.userId.toString() !== acceptingUser._id.toString()) {
      throw new ForbiddenException(
        'You are not authorized to accept this invitation.',
      );
    }

    if (invitation.status !== 'pending') {
      throw new BadRequestException(
        `This invitation is no longer pending (current status: ${invitation.status}).`,
      );
    }

    // 3. Cek Kedaluwarsa
    if (invitation.expiresAt < new Date()) {
      // Update status jadi expired jika belum
      if (invitation.status === 'pending') {
        invitation.status = 'expired';
        await invitation.save();
      }
      throw new BadRequestException('This invitation has expired.');
    }

    // 4. Cek apakah user masih eligible (misal, belum tergabung ke company lain)
    // Kita bisa refetch user data terbaru untuk memastikan
    const currentUserState = await this.userModel
      .findById(acceptingUser._id)
      .exec();
    if (!currentUserState) {
      throw new InternalServerErrorException('Accepting user not found.'); // Seharusnya tidak terjadi jika user terautentikasi
    }
    if (currentUserState.companyId) {
      invitation.status = 'rejected';
      await invitation.save();
      throw new BadRequestException('You already belong to a company.');
    }
    if (currentUserState.role !== Role.UnassignedStaff) {
      invitation.status = 'rejected';
      await invitation.save();
      throw new BadRequestException(
        'Your current role is not eligible to accept this type of invitation.',
      );
    }

    try {
      invitation.status = 'accepted';
      await invitation.save();

      const updatedUser = await this.userModel
        .findByIdAndUpdate(
          acceptingUser._id,
          {
            $set: {
              companyId: invitation.companyId,
              positionId: invitation.positionId,
              role: invitation.role,
            },
          },
          { new: true },
        )
        .select('-password')
        .exec();

      if (!updatedUser) {
        throw new InternalServerErrorException(
          'Failed to update user details.',
        );
      }

      return updatedUser;
    } catch (error) {
      console.error('Error accepting invitation:', error);
      if (invitation.status === 'accepted') {
        invitation.status = 'pending';
        await invitation
          .save()
          .catch((rollbackError) =>
            console.error('Rollback failed:', rollbackError),
          );
      }
      throw new InternalServerErrorException(
        'Failed to accept invitation due to an internal error.',
      );
    }
  }

  async rejectInvitation(
    invitationId: string,
    rejectingUser: AuthenticatedUser,
  ): Promise<void> {
    // 1. Validasi & Cari Undangan (mirip accept)
    if (!Types.ObjectId.isValid(invitationId)) {
      throw new BadRequestException(
        `Invalid invitation ID format: ${invitationId}`,
      );
    }
    const invitation = await this.invitationModel.findById(invitationId).exec();
    if (!invitation) {
      throw new NotFoundException(
        `Invitation with ID ${invitationId} not found.`,
      );
    }

    // 2. Validasi Otorisasi & Status (mirip accept)
    if (invitation.userId.toString() !== rejectingUser._id.toString()) {
      throw new ForbiddenException(
        'You are not authorized to reject this invitation.',
      );
    }
    if (invitation.status !== 'pending') {
      throw new BadRequestException(
        `This invitation is no longer pending (current status: ${invitation.status}).`,
      );
    }
    if (invitation.expiresAt < new Date()) {
      invitation.status = 'expired';
      await invitation.save();
      throw new BadRequestException('This invitation has expired.');
    }

    // 3. Update Status Undangan
    invitation.status = 'rejected';
    await invitation.save();
  }

  async remove(
    id: string,
    user: AuthenticatedUser,
  ): Promise<any> {
    if (!Types.ObjectId.isValid(id)) {
      throw new BadRequestException(`Invalid invitation ID format: ${id}`);
    }

    const invitation = await this.invitationModel
      .findOne({ _id: id, deletedAt: null })
      .exec();
    if (!invitation) {
      throw new NotFoundException(`Invitation with ID ${id} not found.`);
    }

    // Validate company ownership
    if (!user.company?._id) {
      throw new ForbiddenException('User is not associated with any company.');
    }
    if (invitation.companyId.toString() !== user.company._id.toString()) {
      throw new ForbiddenException(
        'You do not have permission to delete this invitation.',
      );
    }

    // Soft delete
    const deletedAt = new Date();
    (invitation as any).deletedAt = deletedAt;
    await invitation.save();

    await invitation.populate([
      { path: 'companyId', select: 'name' },
      { path: 'positionId', select: 'name' },
      { path: 'userId', select: 'name email' },
    ]);

    return InvitationResource.transformInvitation(invitation);
  }
}
