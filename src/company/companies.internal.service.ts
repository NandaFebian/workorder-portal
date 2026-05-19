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
import { UpdateIntegrationConfigDto } from './dto/update-integration-config.dto';
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
import { FcmService } from 'src/fcm/fcm.service';
import { DepartmentAuthHelper } from 'src/common/helpers/department-auth.helper';

@Injectable()
export class CompaniesInternalService {
  constructor(
    @InjectModel(Company.name) private companyModel: Model<CompanyDocument>,
    @InjectModel(Invitation.name)
    private invitationModel: Model<InvitationDocument>,
    private usersService: UsersService,
    private positionsService: PositionsService,
    private fcmService: FcmService,
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

  async findAllInternal(): Promise<any[]> {
    // Logika internal, bisa mengambil semua (termasuk yang tidak aktif)
    return this.companyModel
      .find({ deletedAt: null })
      .populate('ownerId', 'name email _id')
      .sort({ createdAt: -1 })
      .lean()
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
    invitingUser?: AuthenticatedUser,
  ): Promise<InviteEmployeesResponse> {
    await this.findInternalById(companyId);
    const errors: Record<string, string>[] = [];

    // First Pass: Validate ALL entries first — collect every error before doing anything
    const usersToInvite: {
      inviteData: any;
      user: UserDocument;
      position: any;
    }[] = [];

    for (let i = 0; i < inviteEmployeesDto.invites.length; i++) {
      const invite = inviteEmployeesDto.invites[i];
      // Validate role
      if (
        ![Role.CompanyStaff, Role.CompanyManager].includes(invite.role as Role)
      ) {
        errors.push({ [`invites[${i}].role`]: 'Invalid role specified' });
        continue;
      }

      let position: any = null;
      if (invite.role === Role.CompanyManager) {
        if (invite.positionId) {
          if (!Types.ObjectId.isValid(invite.positionId)) {
            errors.push({ [`invites[${i}].positionId`]: 'Invalid Position ID format' });
            continue;
          }
          try {
            position = await this.positionsService.findById(invite.positionId);
          } catch {
            errors.push({ [`invites[${i}].positionId`]: `Position with ID ${invite.positionId} not found` });
            continue;
          }
        }
      } else {
        // company_staff — positionId required
        if (!invite.positionId) {
          errors.push({ [`invites[${i}].positionId`]: 'Position ID is required for staff role' });
          continue;
        }
        if (!Types.ObjectId.isValid(invite.positionId)) {
          errors.push({ [`invites[${i}].positionId`]: 'Invalid Position ID format' });
          continue;
        }
        try {
          position = await this.positionsService.findById(invite.positionId);
        } catch {
          errors.push({ [`invites[${i}].positionId`]: `Position with ID ${invite.positionId} not found` });
          continue;
        }

        // Department Manager: can only invite staff for their own position
        if (invitingUser && DepartmentAuthHelper.isDepartmentManager(invitingUser)) {
          const managerPositionId = invitingUser.position!._id.toString();
          if (invite.positionId !== managerPositionId) {
            errors.push({
              [`invites[${i}].positionId`]:
                'Department managers can only invite staff for positions in their department.',
            });
            continue;
          }
        }
      }

      const user = await this.usersService.findOneByEmail(invite.email);
      if (!user) {
        errors.push({ [`invites[${i}].email`]: 'User not found' });
        continue;
      }
      if (user.companyId) {
        errors.push({ [`invites[${i}].email`]: 'User already belongs to a company' });
        continue;
      }
      if (user.role !== Role.UnassignedStaff) {
        errors.push({ [`invites[${i}].email`]: 'User is not available for invitation' });
        continue;
      }

      usersToInvite.push({ inviteData: invite, user, position });
    }

    // If ANY entry failed validation — abort the entire batch (all-or-nothing)
    if (errors.length > 0) {
      throw new UnprocessableEntityException({
        message: 'Validation failed',
        errors: { field: errors },
      });
    }

    // Second Pass: All entries valid — safely create all invitations
    const company = await this.companyModel.findById(companyId).select('name').exec();
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

      // Notify user about the invitation
      await this.fcmService.sendToUser(
        (user as any)._id.toString(),
        'Undangan Bergabung Perusahaan',
        `Anda telah diundang untuk bergabung dengan ${company?.name || 'perusahaan'} sebagai ${inviteData.role.replace('_', ' ')}.`,
        { resource: 'invitation', resourceId: (newInvitation as any)._id.toString() }
      );

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

  async getInvitationHistory(companyId: string, userId?: string) {
    const invitations = await this.invitationModel
      .find({ companyId: new Types.ObjectId(companyId), deletedAt: null })
      .sort({ createdAt: -1 })
      .populate([
        { path: 'companyId', select: 'name' },
        { path: 'positionId', select: 'name' },
        { path: 'userId', select: 'name email' },
      ])
      .exec();

    // Mark invitation notifications as read if userId is provided
    if (userId) {
      await this.fcmService.markAsReadByType(userId, 'invitation');
    }

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

  async getIntegrationConfig(companyId: string): Promise<any> {
    const company = await this.findInternalById(companyId);
    const cfg = (company as any).integrationConfig ?? {};
    return {
      external_login_url: cfg.externalLoginUrl ?? null,
      external_verify_url: cfg.externalVerifyUrl ?? null,
      external_check_memberships_url: cfg.externalCheckMembershipsUrl ?? null,
      external_check_status_url: cfg.externalCheckStatusUrl ?? null,
      secret_key: cfg.secretKey ?? null,
      is_integration_active: cfg.isIntegrationActive ?? false,
    };
  }

  async updateIntegrationConfig(
    companyId: string,
    dto: UpdateIntegrationConfigDto,
  ): Promise<any> {
    const company = await this.findInternalById(companyId);
    const update: Record<string, any> = {};

    if (dto.external_login_url !== undefined)
      update['integrationConfig.externalLoginUrl'] = dto.external_login_url;
    if (dto.external_verify_url !== undefined)
      update['integrationConfig.externalVerifyUrl'] = dto.external_verify_url;
    if (dto.external_check_memberships_url !== undefined)
      update['integrationConfig.externalCheckMembershipsUrl'] = dto.external_check_memberships_url;
    if (dto.external_check_status_url !== undefined)
      update['integrationConfig.externalCheckStatusUrl'] = dto.external_check_status_url;
    if (dto.secret_key !== undefined)
      update['integrationConfig.secretKey'] = dto.secret_key;
    if (dto.is_integration_active !== undefined)
      update['integrationConfig.isIntegrationActive'] = dto.is_integration_active;

    await this.companyModel.updateOne({ _id: company._id }, { $set: update });

    return this.getIntegrationConfig(companyId);
  }
}
