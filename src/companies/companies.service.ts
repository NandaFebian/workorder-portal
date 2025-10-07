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

@Injectable()
export class CompaniesService {
    constructor(
        @InjectModel(Company.name) private companyModel: Model<CompanyDocument>,
        @InjectModel(Invitation.name) private invitationModel: Model<InvitationDocument>,
        private usersService: UsersService,
        private positionsService: PositionsService,
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
        // Populate ownerId untuk mendapatkan detail owner
        return this.companyModel.find().populate('ownerId', 'name email').exec();
    }

    // Method untuk mendapatkan perusahaan berdasarkan ID
    async findById(id: string): Promise<CompanyDocument & { _id: Types.ObjectId }> {
        if (!Types.ObjectId.isValid(id)) {
            throw new NotFoundException(`Invalid company ID: ${id}`);
        }
        // Populate ownerId untuk mendapatkan detail owner
        const company = await this.companyModel.findById(id).populate('ownerId', 'name email').exec();
        if (!company) {
            throw new NotFoundException(`Company with ID ${id} not found`);
        }
        return company as CompanyDocument & { _id: Types.ObjectId };
    }

    async inviteEmployees(companyId: string, inviteEmployeesDto: InviteEmployeesDto): Promise<InviteEmployeesResponse> {
        const company = await this.findById(companyId);
        const successfulInvites: SuccessfulInvite[] = [];
        const errors: InviteError[] = []; // Tipe data ini sekarang sudah sesuai dengan interface baru

        for (const invite of inviteEmployeesDto.invites) {
            // Helper ini sekarang akan membuat error dengan format yang benar
            const createError = (message: string): InviteError => ({
                invite: {
                    email: invite.email,
                    role: invite.role,
                    positionId: { _id: invite.positionId }, // Transformasi dilakukan di sini
                },
                message,
            });

            try {
                if (!Types.ObjectId.isValid(invite.positionId)) {
                    errors.push(createError("Invalid Position ID format"));
                    continue;
                }
                const position = await this.positionsService.findById(invite.positionId);
                if (!position) {
                    errors.push(createError(`Position with ID ${invite.positionId} not found`));
                    continue;
                }

                const user = await this.usersService.findOneByEmail(invite.email);
                if (!user) {
                    errors.push(createError("User not found"));
                    continue;
                }

                const existingInvitation = await this.invitationModel.findOne({
                    userId: user._id,
                    status: 'pending',
                }).exec();

                if (existingInvitation) {
                    errors.push(createError("User has a pending invitation"));
                    continue;
                }

                // ... (validasi lainnya tetap sama)
                if (user.role !== 'staff_unassigned') {
                    errors.push(createError("User is not available for invitation"));
                    continue;
                }
                if (user.companyId) {
                    errors.push(createError("User already belongs to a company"));
                    continue;
                }
                if (!['staff_company', 'manager_company'].includes(invite.role)) {
                    errors.push(createError("Invalid role specified"));
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
                    position_offered: {
                        _id: position.id,
                        name: position.name,
                    }
                });

            } catch (error) {
                errors.push(createError(error.message));
            }
        }

        return {
            message: "Invite process finished",
            meta: {
                successCount: successfulInvites.length,
                errorCount: errors.length,
            },
            data: {
                company: {
                    _id: company.id,
                    name: company.name
                },
                invited: successfulInvites
            },
            // Larik 'errors' sekarang sudah memiliki tipe yang benar
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

        // Lakukan transformasi di sini agar controller lebih bersih
        const transformedInvitations = invitations.map(inv => {
            const invObject = inv.toObject();
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
            data: {
                invitations: transformedInvitations,
            }
        };
    }
}