// src/invitations/invitations.service.ts
import { Injectable, NotFoundException, ForbiddenException, BadRequestException, InternalServerErrorException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Invitation, InvitationDocument } from '../company/schemas/invitation.schemas';
import { User, UserDocument } from '../users/schemas/user.schema';
import { AuthenticatedUser } from '../auth/interfaces/authenticated-user.interface';
import { Role } from '../common/enums/role.enum'; // Impor enum Role

@Injectable()
export class InvitationsService {
    constructor(
        @InjectModel(Invitation.name) private invitationModel: Model<InvitationDocument>,
        @InjectModel(User.name) private userModel: Model<UserDocument>,
        // Opsional: bisa inject UsersService jika ada method helper yang berguna
        // private usersService: UsersService,
    ) { }

    async findPendingForUser(userId: string): Promise<any[]> { // Ubah tipe return ke any[] atau interface custom
        if (!Types.ObjectId.isValid(userId)) {
            throw new BadRequestException(`Invalid user ID format: ${userId}`);
        }

        const now = new Date();

        // Cari undangan yang pending dan belum expired 
        const pendingInvitationsDocs = await this.invitationModel.find({
            userId: new Types.ObjectId(userId),
            status: 'pending',
            expiresAt: { $gt: now },
            deletedAt: null
        })
            .populate('companyId', 'name')
            .populate('positionId', 'name')
            .select('-userId') // Sembunyikan userId
            .sort({ createdAt: -1 })
            .exec();

        const transformedInvitations = pendingInvitationsDocs.map(inv => {
            // Konversi Mongoose document ke plain object
            const invObject: any = inv.toObject();

            return {
                _id: invObject._id,
                company: invObject.companyId,
                role: invObject.role,
                position: invObject.positionId,
                status: invObject.status,
                expiresAt: invObject.expiresAt,
                createdAt: invObject.createdAt,
                updatedAt: invObject.updatedAt,
                __v: invObject.__v,
            };
        });

        // Handle undangan yang sudah expired
        const expiredPending = await this.invitationModel.find({
            userId: new Types.ObjectId(userId),
            status: 'pending',
            expiresAt: { $lte: now },
            deletedAt: null
        }).exec();

        if (expiredPending.length > 0) {
            await this.invitationModel.updateMany(
                { _id: { $in: expiredPending.map(inv => inv._id) } },
                { $set: { status: 'expired' } }
            ).exec();
        }

        return transformedInvitations;
    }

    async acceptInvitation(invitationId: string, acceptingUser: AuthenticatedUser): Promise<UserDocument> {
        // 1. Validasi Input & Cari Undangan
        if (!Types.ObjectId.isValid(invitationId)) {
            throw new BadRequestException(`Invalid invitation ID format: ${invitationId}`);
        }

        const invitation = await this.invitationModel.findById(invitationId).exec();

        if (!invitation) {
            throw new NotFoundException(`Invitation with ID ${invitationId} not found.`);
        }

        // 2. Validasi Otorisasi & Status Undangan
        if (invitation.userId.toString() !== acceptingUser._id.toString()) {
            throw new ForbiddenException('You are not authorized to accept this invitation.');
        }

        if (invitation.status !== 'pending') {
            throw new BadRequestException(`This invitation is no longer pending (current status: ${invitation.status}).`);
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
        const currentUserState = await this.userModel.findById(acceptingUser._id).exec();
        if (!currentUserState) {
            throw new InternalServerErrorException('Accepting user not found.'); // Seharusnya tidak terjadi jika user terautentikasi
        }
        if (currentUserState.companyId) {
            // Jika sudah punya company, mungkin tolak atau handle sesuai business logic
            // Kita juga bisa update status invite jadi 'rejected' atau 'invalidated'
            invitation.status = 'rejected'; // Atau status lain yg sesuai
            await invitation.save();
            throw new BadRequestException('You already belong to a company.');
        }
        if (currentUserState.role !== Role.UnassignedStaff) {
            // Jika role sudah bukan unassigned (mungkin sudah jadi client atau role lain)
            invitation.status = 'rejected'; // Atau status lain
            await invitation.save();
            throw new BadRequestException('Your current role is not eligible to accept this type of invitation.');
        }

        // --- Transaksi (Opsional tapi Direkomendasikan) ---
        // Jika menggunakan MongoDB Replica Set atau Atlas, bisa pakai transaction
        // const session = await this.invitationModel.db.startSession();
        // session.startTransaction();
        try {
            // 5. Update Status Undangan
            invitation.status = 'accepted';
            // await invitation.save({ session }); // Jika pakai transaction
            await invitation.save();

            // 6. Update Dokumen User
            const updatedUser = await this.userModel.findByIdAndUpdate(
                acceptingUser._id,
                {
                    $set: {
                        companyId: invitation.companyId,
                        positionId: invitation.positionId,
                        role: invitation.role, // Set role sesuai tawaran di invite
                    },
                },
                // { session, new: true } // Jika pakai transaction, `new: true` untuk mendapatkan dokumen yg sudah diupdate
                { new: true }
            ).select('-password').exec(); // Exclude password dari hasil

            if (!updatedUser) {
                throw new InternalServerErrorException('Failed to update user details.');
            }

            // await session.commitTransaction(); // Jika pakai transaction
            return updatedUser;

        } catch (error) {
            // await session.abortTransaction(); // Jika pakai transaction
            console.error("Error accepting invitation:", error);
            // Rollback manual sederhana jika tidak pakai transaction (opsional)
            // Jika update user gagal setelah invite diupdate, coba set invite kembali ke pending
            if (invitation.status === 'accepted') {
                invitation.status = 'pending';
                await invitation.save().catch(rollbackError => console.error("Rollback failed:", rollbackError));
            }
            throw new InternalServerErrorException('Failed to accept invitation due to an internal error.');
        } finally {
            // session.endSession(); // Jika pakai transaction
        }
    }

    async rejectInvitation(invitationId: string, rejectingUser: AuthenticatedUser): Promise<void> {
        // 1. Validasi & Cari Undangan (mirip accept)
        if (!Types.ObjectId.isValid(invitationId)) {
            throw new BadRequestException(`Invalid invitation ID format: ${invitationId}`);
        }
        const invitation = await this.invitationModel.findById(invitationId).exec();
        if (!invitation) {
            throw new NotFoundException(`Invitation with ID ${invitationId} not found.`);
        }

        // 2. Validasi Otorisasi & Status (mirip accept)
        if (invitation.userId.toString() !== rejectingUser._id.toString()) {
            throw new ForbiddenException('You are not authorized to reject this invitation.');
        }
        if (invitation.status !== 'pending') {
            throw new BadRequestException(`This invitation is no longer pending (current status: ${invitation.status}).`);
        }
        if (invitation.expiresAt < new Date()) {
            invitation.status = 'expired'; // Pastikan status benar jika sudah expired
            await invitation.save();
            throw new BadRequestException('This invitation has expired.');
        }

        // 3. Update Status Undangan
        invitation.status = 'rejected';
        await invitation.save();
    }

    async remove(id: string, user: AuthenticatedUser): Promise<{ deletedAt: Date }> {
        if (!Types.ObjectId.isValid(id)) {
            throw new BadRequestException(`Invalid invitation ID format: ${id}`);
        }

        const invitation = await this.invitationModel.findOne({ _id: id, deletedAt: null }).exec();
        if (!invitation) {
            throw new NotFoundException(`Invitation with ID ${id} not found.`);
        }

        // Validate company ownership
        if (!user.company?._id) {
            throw new ForbiddenException('User is not associated with any company.');
        }
        if (invitation.companyId.toString() !== user.company._id.toString()) {
            throw new ForbiddenException('You do not have permission to delete this invitation.');
        }

        // Soft delete
        const deletedAt = new Date();
        (invitation as any).deletedAt = deletedAt;
        await invitation.save();

        return { deletedAt };
    }
}