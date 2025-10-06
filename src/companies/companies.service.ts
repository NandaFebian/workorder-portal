import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Company, CompanyDocument } from './schemas/company.schemas';
import { UpdateCompanyDto } from './dto/update-company.dto';
import { Invitation, InvitationDocument } from './schemas/invitation.schemas';
import { UsersService } from '../users/users.service';
import { InviteEmployeesDto } from './dto/invite-employees.dto';
import { SuccessfulInvite, InviteError, InviteEmployeesResponse } from './interfaces/invitation.interface';

@Injectable()
export class CompaniesService {
    constructor(
        @InjectModel(Company.name) private companyModel: Model<CompanyDocument>,
        @InjectModel(Invitation.name) private invitationModel: Model<InvitationDocument>,
        private usersService: UsersService,
    ) { }

    // Method untuk membuat perusahaan baru
    async create(createCompanyDto: { name: string; address: string | null; ownerId: Types.ObjectId }): Promise<CompanyDocument> {
        const newCompany = new this.companyModel(createCompanyDto);
        return newCompany.save();
    }

    // Method untuk mengupdate perusahaan
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

    // Method untuk mendapatkan semua perusahaan (untuk keperluan admin)
    async findAll(): Promise<CompanyDocument[]> {
        return this.companyModel.find().exec();
    }

    // Method untuk mendapatkan perusahaan berdasarkan ID
    async findById(id: string): Promise<CompanyDocument & { _id: Types.ObjectId }> {
        if (!Types.ObjectId.isValid(id)) {
            throw new NotFoundException(`Invalid company ID: ${id}`);
        }
        const company = await this.companyModel.findById(id).exec();
        if (!company) {
            throw new NotFoundException(`Company with ID ${id} not found`);
        }
        return company as CompanyDocument & { _id: Types.ObjectId };
    }

    async inviteEmployees(companyId: string, inviteEmployeesDto: InviteEmployeesDto): Promise<InviteEmployeesResponse> {
        const company = await this.findById(companyId);
        const successfulInvites: SuccessfulInvite[] = [];
        const errors: InviteError[] = [];

        for (const invite of inviteEmployeesDto.invites) {
            try {
                const user = await this.usersService.findOneByEmail(invite.email);

                if (!user) {
                    errors.push({
                        invite,
                        message: "User not found"
                    });
                    continue;
                }

                if (user.role !== 'staff_unassigned') {
                    errors.push({
                        invite,
                        message: "User is not available for invitation"
                    });
                    continue;
                }

                if (user.companyId) {
                    errors.push({
                        invite,
                        message: "User already belongs to a company"
                    });
                    continue;
                }

                // Validate role
                if (!['staff_company', 'manager_company'].includes(invite.role)) {
                    errors.push({
                        invite,
                        message: "Invalid role specified"
                    });
                    continue;
                }

                const existingInvitation = await this.invitationModel.findOne({
                    userId: user._id,
                    status: 'pending',
                }).exec();

                if (existingInvitation) {
                    errors.push({
                        invite,
                        message: "User has a pending invitation",
                    });
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
                    user: {
                        name: user.name,
                        email: user.email
                    },
                    role_offered: invite.role,
                    position_offered: {
                        _id: invite.positionId,
                        name: "STATIC DUMMY"
                    }
                });

            } catch (error) {
                errors.push({
                    invite,
                    message: error.message
                });
            }
        }

        return {
            message: "Invite process finished",
            meta: {
                successCount: successfulInvites.length,
                errorCount: errors.length
            },
            data: {
                company: {
                    _id: company._id.toString(),
                    name: company.name
                },
                invited: successfulInvites
            },
            ...(errors.length > 0 && { errors })
        };
    }

    async getInvitationHistory(userId: string) {
        const invitations = await this.invitationModel
            .find({ userId: new Types.ObjectId(userId) })
            .populate('companyId', 'name')
            .exec();

        return {
            message: "Invitations retrieved successfully",
            data: {
                invitations: invitations
            }
        };
    }
}