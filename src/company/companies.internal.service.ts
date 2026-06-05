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
import {
  ExternalAccount,
  ExternalAccountDocument,
} from 'src/customer-pairing/schemas/external-account.schema';
import {
  MembershipCode,
  MembershipCodeDocument,
} from 'src/membership/schemas/membership.schema';
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
import { encrypt, decrypt } from 'src/common/utils/crypto.util';

@Injectable()
export class CompaniesInternalService {
  constructor(
    @InjectModel(Company.name) private companyModel: Model<CompanyDocument>,
    @InjectModel(Invitation.name)
    private invitationModel: Model<InvitationDocument>,
    @InjectModel(ExternalAccount.name)
    private externalAccountModel: Model<ExternalAccountDocument>,
    @InjectModel(MembershipCode.name)
    private membershipCodeModel: Model<MembershipCodeDocument>,
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
            errors.push({
              [`invites[${i}].positionId`]: 'Invalid Position ID format',
            });
            continue;
          }
          try {
            position = await this.positionsService.findById(invite.positionId);
          } catch {
            errors.push({
              [`invites[${i}].positionId`]: `Position with ID ${invite.positionId} not found`,
            });
            continue;
          }
        }
      } else {
        // company_staff — positionId required
        if (!invite.positionId) {
          errors.push({
            [`invites[${i}].positionId`]:
              'Position ID is required for staff role',
          });
          continue;
        }
        if (!Types.ObjectId.isValid(invite.positionId)) {
          errors.push({
            [`invites[${i}].positionId`]: 'Invalid Position ID format',
          });
          continue;
        }
        try {
          position = await this.positionsService.findById(invite.positionId);
        } catch {
          errors.push({
            [`invites[${i}].positionId`]: `Position with ID ${invite.positionId} not found`,
          });
          continue;
        }

        // Department Manager: can only invite staff for their own position
        if (
          invitingUser &&
          DepartmentAuthHelper.isDepartmentManager(invitingUser)
        ) {
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
        errors.push({
          [`invites[${i}].email`]: 'User already belongs to a company',
        });
        continue;
      }
      if (user.role !== Role.UnassignedStaff) {
        errors.push({
          [`invites[${i}].email`]: 'User is not available for invitation',
        });
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
    const company = await this.companyModel
      .findById(companyId)
      .select('name')
      .exec();
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
        {
          resource: 'invitation',
          resourceId: (newInvitation as any)._id.toString(),
        },
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

    const transformedData = InvitationResource.transformInvitationList(
      newlyCreatedInvitations,
    );

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

    const transformedInvitations =
      InvitationResource.transformInvitationList(invitations);

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
      secret_key: cfg.secretKey ? decrypt(cfg.secretKey) : null,
      is_integration_active: cfg.isIntegrationActive ?? false,
      integration_type: cfg.integrationType ?? 'external_system',
    };
  }

  async updateIntegrationConfig(
    companyId: string,
    dto: UpdateIntegrationConfigDto,
  ): Promise<any> {
    const company = await this.findInternalById(companyId);
    const currentType =
      (company as any).integrationConfig?.integrationType ?? 'external_system';
    const newType = dto.integration_type;
    const isTypeChanging = newType !== undefined && newType !== currentType;

    const update: Record<string, any> = {};

    if (dto.external_login_url !== undefined)
      update['integrationConfig.externalLoginUrl'] = dto.external_login_url;
    if (dto.external_verify_url !== undefined)
      update['integrationConfig.externalVerifyUrl'] = dto.external_verify_url;
    if (dto.external_check_memberships_url !== undefined)
      update['integrationConfig.externalCheckMembershipsUrl'] =
        dto.external_check_memberships_url;
    if (dto.external_check_status_url !== undefined)
      update['integrationConfig.externalCheckStatusUrl'] =
        dto.external_check_status_url;
    if (dto.secret_key !== undefined)
      update['integrationConfig.secretKey'] = dto.secret_key
        ? encrypt(dto.secret_key)
        : null;
    if (dto.is_integration_active !== undefined)
      update['integrationConfig.isIntegrationActive'] =
        dto.is_integration_active;
    if (dto.integration_type !== undefined)
      update['integrationConfig.integrationType'] = dto.integration_type;

    await this.companyModel.updateOne({ _id: company._id }, { $set: update });

    if (isTypeChanging) {
      const now = new Date();
      await this.externalAccountModel.updateMany(
        { companyId: company._id, deletedAt: null },
        { $set: { deletedAt: now } },
      );
      await this.membershipCodeModel.updateMany(
        { companyId: company._id, deletedAt: null },
        { $set: { deletedAt: now } },
      );
    }

    return this.getIntegrationConfig(companyId);
  }

  /**
   * Check if a user can be kicked based on WO assignments and role permissions.
   */
  private async _canKickEmployee(
    target: any,
    user: AuthenticatedUser,
  ): Promise<boolean> {
    // Cannot kick an Owner
    if (target.role === Role.CompanyOwner) return false;

    // Role-based permission check
    if (target.role === Role.CompanyManager) {
      // Only Owner can kick a Manager
      if (user.role !== Role.CompanyOwner) return false;
    } else if (target.role === Role.CompanyStaff) {
      // Owner, General Manager, or Department Manager (same position) can kick Staff
      if (user.role === Role.CompanyOwner) {
        // OK
      } else if (user.role === Role.CompanyManager) {
        if (DepartmentAuthHelper.isDepartmentManager(user)) {
          const targetPositionId = target.positionId?.toString();
          const managerPositionId = user.position?._id?.toString();
          if (targetPositionId !== managerPositionId) return false;
        }
        // General Manager can kick any staff
      } else {
        return false;
      }
    } else {
      return false;
    }

    // Check WO assignments — blocked if assigned to any active WO
    const activeWoCount = await this.companyModel.db
      .collection('workorders')
      .countDocuments({
        assignedStaff: new Types.ObjectId(target._id.toString()),
        deletedAt: null,
        status: {
          $in: ['drafted', 'sent', 'approved', 'on_progress'],
        },
      });

    return activeWoCount === 0;
  }

  async getEmployeeDetail(
    employeeId: string,
    user: AuthenticatedUser,
  ): Promise<any> {
    if (!user.company?._id) {
      throw new ForbiddenException('User is not associated with any company.');
    }

    if (!Types.ObjectId.isValid(employeeId)) {
      throw new NotFoundException('Invalid employee ID');
    }

    const employee = await this.companyModel.db
      .collection('users')
      .findOne({
        _id: new Types.ObjectId(employeeId),
        companyId: user.company._id,
        deletedAt: null,
      });

    if (!employee) {
      throw new NotFoundException('Employee not found');
    }

    // Owner can see managers + staff; Manager can only see staff
    if (user.role === Role.CompanyManager) {
      if (employee.role !== Role.CompanyStaff) {
        throw new NotFoundException('Employee not found');
      }
    }

    // Populate position
    let position: any = null;
    if (employee.positionId) {
      position = await this.companyModel.db
        .collection('positions')
        .findOne({ _id: employee.positionId });
    }

    const { password, fcmTokens, ...safeEmployee } = employee;
    const result: any = { ...safeEmployee };
    if (position) {
      result.position = {
        _id: position._id,
        name: position.name,
        description: position.description,
      };
      delete result.positionId;
    }

    const canKick = await this._canKickEmployee(employee, user);

    return { data: result, meta: { canKick } };
  }

  async kickEmployee(
    employeeId: string,
    user: AuthenticatedUser,
  ): Promise<any> {
    if (!user.company?._id) {
      throw new ForbiddenException('User is not associated with any company.');
    }

    if (!Types.ObjectId.isValid(employeeId)) {
      throw new NotFoundException('Invalid employee ID');
    }

    const employee = await this.companyModel.db
      .collection('users')
      .findOne({
        _id: new Types.ObjectId(employeeId),
        companyId: user.company._id,
        deletedAt: null,
      });

    if (!employee) {
      throw new NotFoundException('Employee not found');
    }

    // Cannot kick yourself
    if (employee._id.toString() === user._id.toString()) {
      throw new ForbiddenException('Anda tidak dapat mengeluarkan diri sendiri.');
    }

    // Cannot kick owner
    if (employee.role === Role.CompanyOwner) {
      throw new ForbiddenException('Tidak dapat mengeluarkan Owner perusahaan.');
    }

    // Role-based authorization
    if (employee.role === Role.CompanyManager) {
      if (user.role !== Role.CompanyOwner) {
        throw new ForbiddenException(
          'Hanya Owner yang dapat mengeluarkan Manager.',
        );
      }
    } else if (employee.role === Role.CompanyStaff) {
      if (
        user.role !== Role.CompanyOwner &&
        user.role !== Role.CompanyManager
      ) {
        throw new ForbiddenException(
          'Anda tidak memiliki izin untuk mengeluarkan karyawan ini.',
        );
      }
      // Department Manager: only staff with matching position
      if (DepartmentAuthHelper.isDepartmentManager(user)) {
        const targetPositionId = employee.positionId?.toString();
        const managerPositionId = user.position?._id?.toString();
        if (targetPositionId !== managerPositionId) {
          throw new ForbiddenException(
            'Department Manager hanya dapat mengeluarkan staf di departemennya sendiri.',
          );
        }
      }
    }

    // Check WO assignments
    const activeWoCount = await this.companyModel.db
      .collection('workorders')
      .countDocuments({
        assignedStaff: new Types.ObjectId(employeeId),
        deletedAt: null,
        status: {
          $in: ['drafted', 'sent', 'approved', 'on_progress'],
        },
      });

    if (activeWoCount > 0) {
      throw new UnprocessableEntityException(
        `Karyawan tidak dapat dikeluarkan karena masih ditugaskan pada ${activeWoCount} Perintah Kerja yang aktif.`,
      );
    }

    // Detach from company (not soft delete)
    await this.companyModel.db
      .collection('users')
      .updateOne(
        { _id: new Types.ObjectId(employeeId) },
        {
          $set: { role: Role.UnassignedStaff },
          $unset: { companyId: '', positionId: '' },
        },
      );

    let position: any = null;
    if (employee.positionId) {
      position = await this.companyModel.db
        .collection('positions')
        .findOne({ _id: employee.positionId });
    }

    const { password, fcmTokens, ...safeEmployee } = employee;
    const result: any = {
      ...safeEmployee,
      role: Role.UnassignedStaff,
      companyId: null,
      positionId: null,
    };
    if (position) {
      result.position = {
        _id: position._id,
        name: position.name,
        description: position.description,
      };
      delete result.positionId;
    }

    return result;
  }
}
