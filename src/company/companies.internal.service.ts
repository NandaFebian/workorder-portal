// src/company/companies.internal.service.ts
import { Injectable, NotFoundException, ForbiddenException, BadRequestException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Company, CompanyDocument } from './schemas/company.schemas';
import { UpdateCompanyDto } from './dto/update-company.dto';
import { Invitation, InvitationDocument } from './schemas/invitation.schemas';
import { UsersService } from '../users/users.service';
import { InviteEmployeesDto } from './dto/invite-employees.dto';
import { SuccessfulInvite, InviteError, InviteEmployeesResponse } from './interfaces/invitation.interface';
import { PositionsService } from 'src/positions/positions.service';
import { UserDocument } from 'src/users/schemas/user.schema';
import { Role } from 'src/common/enums/role.enum';
import type { AuthenticatedUser } from 'src/auth/interfaces/authenticated-user.interface';

@Injectable()
export class CompaniesInternalService {
    constructor(
        @InjectModel(Company.name) private companyModel: Model<CompanyDocument>,
        @InjectModel(Invitation.name) private invitationModel: Model<InvitationDocument>,
        private usersService: UsersService,
        private positionsService: PositionsService,
    ) { }

    async create(createCompanyDto: { name: string; address: string | null; ownerId: Types.ObjectId }): Promise<CompanyDocument> {
        const newCompany = new this.companyModel(createCompanyDto);
        return newCompany.save(); // __v: 0 akan ditambahkan otomatis
    }

    async update(id: string, updateCompanyDto: UpdateCompanyDto): Promise<CompanyDocument> {
        if (!Types.ObjectId.isValid(id)) {
            throw new NotFoundException(`Invalid company ID: ${id}`);
        }

        const existingCompany = await this.companyModel.findById(id).exec();
        if (!existingCompany) {
            throw new NotFoundException(`Company with ID ${id} not found`);
        }

        Object.assign(existingCompany, updateCompanyDto);
        return existingCompany.save(); // .save() akan menaikkan __v
    }

    async findAllInternal(): Promise<CompanyDocument[]> {
        // Logika internal, bisa mengambil semua (termasuk yang tidak aktif)
        return this.companyModel.find({ deletedAt: null }).populate('ownerId', 'name email _id').sort({ createdAt: -1 }).exec();
    }

    async findInternalById(id: string): Promise<CompanyDocument> {
        if (!Types.ObjectId.isValid(id)) {
            throw new NotFoundException(`Invalid company ID: ${id}`);
        }
        const company = await this.companyModel.findOne({ _id: id, deletedAt: null }).populate('ownerId', 'name email _id').exec();
        if (!company) {
            throw new NotFoundException(`Company with ID ${id} not found`);
        }
        return company;
    }

    async inviteEmployees(companyId: string, inviteEmployeesDto: InviteEmployeesDto): Promise<InviteEmployeesResponse> {
        const company = await this.findInternalById(companyId); // Gunakan find internal
        const successfulInvites: SuccessfulInvite[] = [];
        const errors: InviteError[] = [];

        // 1. First Pass: Validate all users and gather errors
        const usersToInvite: { inviteData: any, user: UserDocument, position: any }[] = [];

        for (const invite of inviteEmployeesDto.invites) {
            // Check if role is valid first
            if (![Role.CompanyStaff, Role.CompanyManager].includes(invite.role as Role)) {
                errors.push({ user: { email: invite.email }, role_offered: invite.role, position_offered: null, message: "Invalid role specified" });
                continue;
            }

            let position: any = null;
            if (invite.role === Role.CompanyManager) {
                if (invite.positionId) {
                    if (!Types.ObjectId.isValid(invite.positionId)) {
                        errors.push({ user: { email: invite.email }, role_offered: invite.role, position_offered: { _id: invite.positionId, name: "Invalid ID" }, message: "Invalid Position ID format" });
                        continue;
                    }
                    position = await this.positionsService.findById(invite.positionId);
                    if (!position) {
                        errors.push({ user: { email: invite.email }, role_offered: invite.role, position_offered: { _id: invite.positionId, name: "Not Found" }, message: `Position with ID ${invite.positionId} not found` });
                        continue;
                    }
                }
            } else {
                if (!invite.positionId) {
                    errors.push({ user: { email: invite.email }, role_offered: invite.role, position_offered: null, message: "Position ID is required for staff role" });
                    continue;
                }
                if (!Types.ObjectId.isValid(invite.positionId)) {
                    errors.push({ user: { email: invite.email }, role_offered: invite.role, position_offered: { _id: invite.positionId, name: "Invalid ID" }, message: "Invalid Position ID format" });
                    continue;
                }
                position = await this.positionsService.findById(invite.positionId);
                if (!position) {
                    errors.push({ user: { email: invite.email }, role_offered: invite.role, position_offered: { _id: invite.positionId, name: "Not Found" }, message: `Position with ID ${invite.positionId} not found` });
                    continue;
                }
            }

            const user = await this.usersService.findOneByEmail(invite.email);
            if (!user) {
                errors.push({ user: { email: invite.email }, role_offered: invite.role, position_offered: position ? { _id: position.id, name: position.name } : null, message: "User not found" });
                continue;
            }
            if (user.role !== Role.UnassignedStaff) {
                errors.push({ user: { email: invite.email, name: user.name }, role_offered: invite.role, position_offered: position ? { _id: position.id, name: position.name } : null, message: "User is not available for invitation" });
                continue;
            }
            if (user.companyId) {
                errors.push({ user: { email: invite.email, name: user.name }, role_offered: invite.role, position_offered: position ? { _id: position.id, name: position.name } : null, message: `User ${user.email} already belongs to a company.` });
                continue;
            }

            usersToInvite.push({ inviteData: invite, user, position });
        }

        // Check if there are any critical errors preventing the whole batch
        const alreadyEmployedErrors = errors.filter(e => e.message.includes('already belongs to a company'));
        if (alreadyEmployedErrors.length > 0) {
            const employedUsersDetails = alreadyEmployedErrors.map(e => e.user.email).join(', ');
            throw new BadRequestException(`Invitation process aborted because the following users already belong to a company: ${employedUsersDetails}`);
        }

        // 2. Second Pass: Create invitations for valid users
        for (const validInvite of usersToInvite) {
            try {
                const { inviteData, user, position } = validInvite;
                const expiresAt = new Date();
                expiresAt.setDate(expiresAt.getDate() + 7);
                await this.invitationModel.create({
                    companyId: new Types.ObjectId(companyId),
                    userId: user._id,
                    role: inviteData.role,
                    positionId: inviteData.positionId ? new Types.ObjectId(inviteData.positionId) : null,
                    status: 'pending',
                    expiresAt
                });
                successfulInvites.push({
                    user: { name: user.name, email: user.email },
                    role_offered: inviteData.role,
                    position_offered: position ? { _id: position.id, name: position.name } : null
                });
            } catch (error) {
                errors.push({ user: { email: validInvite.inviteData.email }, role_offered: validInvite.inviteData.role, position_offered: validInvite.position ? validInvite.position.name : "Unknown", message: error.message });
            }
        }

        return {
            message: "Invite process finished",
            meta: { successCount: successfulInvites.length, errorCount: errors.length },
            data: {
                company: { _id: company.id, name: company.name },
                invited: successfulInvites
            },
            ...(errors.length > 0 && { errors })
        };
    }

    async getInvitationHistory(companyId: string) {
        const invitations = await this.invitationModel
            .find({ companyId: new Types.ObjectId(companyId), deletedAt: null })
            .sort({ createdAt: -1 })
            .populate([
                { path: 'companyId', select: 'name' },
                { path: 'positionId', select: 'name' },
                { path: 'userId', select: 'name email' }
            ])
            .exec();

        const transformedInvitations = invitations.map(inv => {
            const invObject: any = inv.toObject();
            return {
                ...invObject,
                company: invObject.companyId,
                user: invObject.userId,
                position: invObject.positionId,
                companyId: undefined,
                userId: undefined,
                positionId: undefined,
            };
        });

        return {
            message: "Invitations retrieved successfully",
            data: { invitations: transformedInvitations }
        };
    }

    async remove(id: string, user: AuthenticatedUser): Promise<{ deletedAt: Date }> {
        const existingCompany = await this.findInternalById(id);

        // Check if user is the owner
        if (!user.company?._id) {
            throw new ForbiddenException('User is not associated with any company.');
        }
        if ((existingCompany._id as Types.ObjectId).toString() !== user.company._id.toString()) {
            throw new ForbiddenException('You do not have permission to delete this company.');
        }

        // Soft delete: set deletedAt to current timestamp
        const deletedAt = new Date();
        existingCompany.deletedAt = deletedAt;
        await existingCompany.save();

        return { deletedAt };
    }
}