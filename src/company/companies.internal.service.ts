// src/company/companies.internal.service.ts
import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  BadRequestException,
  UnprocessableEntityException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Company, CompanyDocument } from './schemas/company.schemas';
import { UpdateCompanyDto } from './dto/update-company.dto';
import { Invitation, InvitationDocument } from './schemas/invitation.schemas';
import { UsersService } from '../users/users.service';
import { InviteEmployeesDto } from './dto/invite-employees.dto';
import {
  SuccessfulInvite,
  InviteError,
  InviteEmployeesResponse,
} from './interfaces/invitation.interface';
import { PositionsService } from 'src/positions/positions.service';
import { UserDocument } from 'src/users/schemas/user.schema';
import { Role } from 'src/common/enums/role.enum';
import type { AuthenticatedUser } from 'src/auth/interfaces/authenticated-user.interface';
import { InvitationResource } from '../invitations/resources/invitation.resource';

@Injectable()
export class CompaniesInternalService {
  constructor(
    @InjectModel(Company.name) private companyModel: Model<CompanyDocument>,
    @InjectModel(Invitation.name)
    private invitationModel: Model<InvitationDocument>,
    private usersService: UsersService,
    private positionsService: PositionsService,
  ) {}

  async create(createCompanyDto: {
    name: string;
    address: string | null;
    ownerId: Types.ObjectId;
  }): Promise<CompanyDocument> {
    const newCompany = new this.companyModel(createCompanyDto);
    return newCompany.save(); // __v: 0 akan ditambahkan otomatis
  }

  async update(
    id: string,
    updateCompanyDto: UpdateCompanyDto,
  ): Promise<CompanyDocument> {
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
    return this.companyModel
      .find({ deletedAt: null })
      .populate('ownerId', 'name email _id')
      .sort({ createdAt: -1 })
      .exec();
  }

  async findInternalById(id: string): Promise<CompanyDocument> {
    if (!Types.ObjectId.isValid(id)) {
      throw new NotFoundException(`Invalid company ID: ${id}`);
    }
    const company = await this.companyModel
      .findOne({ _id: id, deletedAt: null })
      .populate('ownerId', 'name email _id')
      .exec();
    if (!company) {
      throw new NotFoundException(`Company with ID ${id} not found`);
    }
    return company;
  }

  async inviteEmployees(
    companyId: string,
    inviteEmployeesDto: InviteEmployeesDto,
  ): Promise<InviteEmployeesResponse> {
    await this.findInternalById(companyId);
    const errors: InviteError[] = [];

    // First Pass: Validate ALL entries first — collect every error before doing anything
    const usersToInvite: {
      inviteData: any;
      user: UserDocument;
      position: any;
    }[] = [];

    for (const invite of inviteEmployeesDto.invites) {
      // Validate role
      if (
        ![Role.CompanyStaff, Role.CompanyManager].includes(invite.role as Role)
      ) {
        errors.push({
          user: { email: invite.email },
          role_offered: invite.role,
          position_offered: null,
          message: 'Invalid role specified',
        });
        continue;
      }

      let position: any = null;
      if (invite.role === Role.CompanyManager) {
        if (invite.positionId) {
          if (!Types.ObjectId.isValid(invite.positionId)) {
            errors.push({
              user: { email: invite.email },
              role_offered: invite.role,
              position_offered: { _id: invite.positionId, name: 'Invalid ID' },
              message: 'Invalid Position ID format',
            });
            continue;
          }
          try {
            position = await this.positionsService.findById(invite.positionId);
          } catch {
            errors.push({
              user: { email: invite.email },
              role_offered: invite.role,
              position_offered: { _id: invite.positionId, name: 'Not Found' },
              message: `Position with ID ${invite.positionId} not found`,
            });
            continue;
          }
        }
      } else {
        // company_staff — positionId wajib
        if (!invite.positionId) {
          errors.push({
            user: { email: invite.email },
            role_offered: invite.role,
            position_offered: null,
            message: 'Position ID is required for staff role',
          });
          continue;
        }
        if (!Types.ObjectId.isValid(invite.positionId)) {
          errors.push({
            user: { email: invite.email },
            role_offered: invite.role,
            position_offered: { _id: invite.positionId, name: 'Invalid ID' },
            message: 'Invalid Position ID format',
          });
          continue;
        }
        try {
          position = await this.positionsService.findById(invite.positionId);
        } catch {
          errors.push({
            user: { email: invite.email },
            role_offered: invite.role,
            position_offered: { _id: invite.positionId, name: 'Not Found' },
            message: `Position with ID ${invite.positionId} not found`,
          });
          continue;
        }
      }

      const user = await this.usersService.findOneByEmail(invite.email);
      if (!user) {
        errors.push({
          user: { email: invite.email },
          role_offered: invite.role,
          position_offered: position
            ? { _id: position._id, name: position.name }
            : null,
          message: 'User not found',
        });
        continue;
      }
      if (user.companyId) {
        errors.push({
          user: { email: invite.email, name: user.name },
          role_offered: invite.role,
          position_offered: position
            ? { _id: position._id, name: position.name }
            : null,
          message: 'User already belongs to a company',
        });
        continue;
      }
      if (user.role !== Role.UnassignedStaff) {
        errors.push({
          user: { email: invite.email, name: user.name },
          role_offered: invite.role,
          position_offered: position
            ? { _id: position._id, name: position.name }
            : null,
          message: 'User is not available for invitation',
        });
        continue;
      }

      usersToInvite.push({ inviteData: invite, user, position });
    }

    // If ANY entry failed validation — abort the entire batch (all-or-nothing)
    if (errors.length > 0) {
      throw new UnprocessableEntityException({
        message: 'Invitation process aborted. Fix all errors and try again.',
        errors,
      });
    }

    // Second Pass: All entries valid — safely create all invitations
    const newlyCreatedInviteIds: any[] = [];
    for (const validInvite of usersToInvite) {
      const { inviteData, user } = validInvite;
      const expiresAt = new Date();
      expiresAt.setDate(expiresAt.getDate() + 7);

      // Cancel any existing pending invitation for the same user+company
      await this.invitationModel.updateMany(
        {
          userId: user._id,
          companyId: new Types.ObjectId(companyId),
          status: 'pending',
          deletedAt: null,
        },
        { $set: { status: 'cancelled' } },
      );

      const newInvitation = await this.invitationModel.create({
        companyId: new Types.ObjectId(companyId),
        userId: user._id,
        role: inviteData.role,
        positionId: inviteData.positionId
          ? new Types.ObjectId(inviteData.positionId)
          : null,
        status: 'pending',
        expiresAt,
      });
      newlyCreatedInviteIds.push(newInvitation._id);
    }

    const newlyCreatedInvitations = await this.invitationModel
      .find({ _id: { $in: newlyCreatedInviteIds } })
      .populate([
        { path: 'companyId', select: 'name' },
        { path: 'positionId', select: 'name' },
        { path: 'userId', select: 'name email' },
      ])
      .exec();

    const transformedData = InvitationResource.transformInvitationList(newlyCreatedInvitations);

    return {
      message: `Successfully invited ${transformedData.length} member(s)`,
      data: transformedData,
      errors: [],
    };
  }

  async getInvitationHistory(companyId: string) {
    const invitations = await this.invitationModel
      .find({ companyId: new Types.ObjectId(companyId), deletedAt: null })
      .sort({ createdAt: -1 })
      .populate([
        { path: 'companyId', select: 'name' },
        { path: 'positionId', select: 'name' },
        { path: 'userId', select: 'name email' },
      ])
      .exec();

    const transformedInvitations = InvitationResource.transformInvitationList(invitations);

    return {
      message: 'Invitations retrieved successfully',
      data: transformedInvitations,
    };
  }

  async remove(
    id: string,
    user: AuthenticatedUser,
  ): Promise<{ deletedAt: Date }> {
    const existingCompany = await this.findInternalById(id);

    // Check if user is the owner
    if (!user.company?._id) {
      throw new ForbiddenException('User is not associated with any company.');
    }
    if (
      (existingCompany._id as Types.ObjectId).toString() !==
      user.company._id.toString()
    ) {
      throw new ForbiddenException(
        'You do not have permission to delete this company.',
      );
    }

    // Soft delete: set deletedAt to current timestamp
    const deletedAt = new Date();
    existingCompany.deletedAt = deletedAt;
    await existingCompany.save();

    return { deletedAt };
  }
}
