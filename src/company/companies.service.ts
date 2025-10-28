// src/company/companies.service.ts
import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
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
import { ServicesClientService } from 'src/service/services.client.service';
import { Role } from 'src/common/enums/role.enum';

@Injectable()
export class CompaniesService {
    constructor(
        @InjectModel(Company.name) private companyModel: Model<CompanyDocument>,
        @InjectModel(Invitation.name) private invitationModel: Model<InvitationDocument>,
        private usersService: UsersService,
        private positionsService: PositionsService,
        private servicesClientService: ServicesClientService,
    ) { }

    async create(createCompanyDto: { name: string; address: string | null; ownerId: Types.ObjectId }): Promise<CompanyDocument> {
        const newCompany = new this.companyModel(createCompanyDto);
        return newCompany.save();
    }

    async update(id: string, updateCompanyDto: UpdateCompanyDto): Promise<CompanyDocument> {
        if (!Types.ObjectId.isValid(id)) {
            throw new NotFoundException(`Invalid company ID: ${id}`);
        }
        const updatedCompany = await this.companyModel.findByIdAndUpdate(id, updateCompanyDto, { new: true }).exec();
        if (!updatedCompany) {
            throw new NotFoundException(`Company with ID ${id} not found`);
        }
        return updatedCompany;
    }

    async findAll(): Promise<CompanyDocument[]> {
        return this.companyModel.find().populate('ownerId', 'name email').exec();
    }

    async findById(id: string): Promise<any> {
        if (!Types.ObjectId.isValid(id)) {
            throw new NotFoundException(`Invalid company ID: ${id}`);
        }

        const company = await this.companyModel.findById(id).populate('ownerId', 'name email').exec();
        if (!company) {
            throw new NotFoundException(`Company with ID ${id} not found`);
        }

        const services = await this.servicesClientService.findAllByCompanyId(id);
        const companyData = company.toObject();
        return {
            ...companyData,
            services,
        };
    }

    async inviteEmployees(companyId: string, inviteEmployeesDto: InviteEmployeesDto): Promise<InviteEmployeesResponse> {
        const company = await this.findById(companyId);
        const successfulInvites: SuccessfulInvite[] = [];
        const errors: InviteError[] = [];

        for (const invite of inviteEmployeesDto.invites) {
            try {
                if (!Types.ObjectId.isValid(invite.positionId)) {
                    errors.push({
                        user: { email: invite.email },
                        role_offered: invite.role,
                        position_offered: { _id: invite.positionId, name: "Invalid ID" },
                        message: "Invalid Position ID format",
                    });
                    continue;
                }
                const position = await this.positionsService.findById(invite.positionId);
                if (!position) {
                    errors.push({
                        user: { email: invite.email },
                        role_offered: invite.role,
                        position_offered: { _id: invite.positionId, name: "Not Found" },
                        message: `Position with ID ${invite.positionId} not found`,
                    });
                    continue;
                }

                const createError = (message: string, user?: UserDocument): InviteError => ({
                    user: { email: invite.email, name: user?.name },
                    role_offered: invite.role,
                    position_offered: { _id: position.id, name: position.name },
                    message,
                });

                const user = await this.usersService.findOneByEmail(invite.email);
                if (!user) {
                    errors.push(createError("User not found"));
                    continue;
                }

                const existingInvitation = await this.invitationModel.findOne({ userId: user._id, status: 'pending' }).exec();
                if (existingInvitation) {
                    errors.push(createError("User has a pending invitation", user));
                    continue;
                }

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
                errors.push({
                    user: { email: invite.email },
                    role_offered: invite.role,
                    position_offered: { _id: invite.positionId, name: "Unknown" },
                    message: error.message,
                });
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

    async getInvitationHistory(userId: string) {
        const invitations = await this.invitationModel
            .find({ userId: new Types.ObjectId(userId) })
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
}