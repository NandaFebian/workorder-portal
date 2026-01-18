// src/company/companies.internal.service.ts
import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
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

        for (const invite of inviteEmployeesDto.invites) {
            try {
                if (!Types.ObjectId.isValid(invite.positionId)) {
                    errors.push({ user: { email: invite.email }, role_offered: invite.role, position_offered: { _id: invite.positionId, name: "Invalid ID" }, message: "Invalid Position ID format" });
                    continue;
                }
                const position = await this.positionsService.findById(invite.positionId);
                if (!position) {
                    errors.push({ user: { email: invite.email }, role_offered: invite.role, position_offered: { _id: invite.positionId, name: "Not Found" }, message: `Position with ID ${invite.positionId} not found` });
                    continue;
                }
                const createError = (message: string, user?: UserDocument): InviteError => ({ user: { email: invite.email, name: user?.name }, role_offered: invite.role, position_offered: { _id: position.id, name: position.name }, message });
                const user = await this.usersService.findOneByEmail(invite.email);
                if (!user) {
                    errors.push(createError("User not found"));
                    continue;
                }
                // const existingInvitation = await this.invitationModel.findOne({ userId: user._id, status: 'pending' }).exec();
                // if (existingInvitation) {
                //     errors.push(createError("User has a pending invitation", user));
                //     continue;
                // }
                if (user.role !== Role.UnassignedStaff) {
                    errors.push(createError("User is not available for invitation", user));
                    continue;
                }
                if (user.companyId) {
                    errors.push(createError("User already belongs to a company", user));
                    continue;
                }
                if (![Role.CompanyStaff, Role.CompanyManager].includes(invite.role as Role)) {
                    errors.push(createError("Invalid role specified", user));
                    continue;
                }
                const expiresAt = new Date();
                expiresAt.setDate(expiresAt.getDate() + 7);
                await this.invitationModel.create({
                    companyId: new Types.ObjectId(companyId),
                    userId: user._id,
                    role: invite.role,
                    positionId: new Types.ObjectId(invite.positionId),
                    status: 'pending',
                    expiresAt
                });
                successfulInvites.push({
                    user: { name: user.name, email: user.email },
                    role_offered: invite.role,
                    position_offered: { _id: position.id, name: position.name }
                });
            } catch (error) {
                errors.push({ user: { email: invite.email }, role_offered: invite.role, position_offered: { _id: invite.positionId, name: "Unknown" }, message: error.message });
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

    async remove(id: string, user: AuthenticatedUser): Promise<void> {
        const existingCompany = await this.findInternalById(id);

        // Check if user is the owner
        if (!user.company?._id) {
            throw new ForbiddenException('User is not associated with any company.');
        }
        if ((existingCompany._id as Types.ObjectId).toString() !== user.company._id.toString()) {
            throw new ForbiddenException('You do not have permission to delete this company.');
        }

        // Soft delete: set deletedAt to current timestamp
        existingCompany.deletedAt = new Date();
        await existingCompany.save();
    }
}