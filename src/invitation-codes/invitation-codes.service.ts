import {
  ConflictException,
  ForbiddenException,
  Injectable,
  NotFoundException,
  UnprocessableEntityException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import {
  InvitationCode,
  InvitationCodeDocument,
} from './schemas/invitation-code.schema';
import { User, UserDocument } from 'src/users/schemas/user.schema';
import { Company, CompanyDocument } from 'src/company/schemas/company.schemas';
import { PositionsService } from 'src/positions/positions.service';
import { FcmService } from 'src/fcm/fcm.service';
import { CreateInvitationCodeDto } from './dto/create-invitation-code.dto';
import { UpdateInvitationCodeDto } from './dto/update-invitation-code.dto';
import { ClaimInvitationCodeDto } from './dto/claim-invitation-code.dto';
import { AuthenticatedUser } from 'src/auth/interfaces/authenticated-user.interface';
import { Role } from 'src/common/enums/role.enum';
import { DepartmentAuthHelper } from 'src/common/helpers/department-auth.helper';
import { generateCode } from 'src/common/utils/generate-code.util';

const CODE_LENGTH = 8;
const CODE_GENERATION_ATTEMPTS = 5;

@Injectable()
export class InvitationCodesService {
  constructor(
    @InjectModel(InvitationCode.name)
    private invitationCodeModel: Model<InvitationCodeDocument>,
    @InjectModel(User.name) private userModel: Model<UserDocument>,
    @InjectModel(Company.name) private companyModel: Model<CompanyDocument>,
    private positionsService: PositionsService,
    private fcmService: FcmService,
  ) {}

  // ─── Company side ─────────────────────────────────────────────────────────

  async create(
    companyId: string,
    dto: CreateInvitationCodeDto,
    user: AuthenticatedUser,
  ): Promise<InvitationCodeDocument> {
    const positionId = await this.resolveRoleAndPosition(
      dto.role,
      dto.positionId ?? null,
      user,
    );

    const code = dto.code
      ? await this.reserveCustomCode(dto.code)
      : await this.generateUniqueCode();

    const created = await this.invitationCodeModel.create({
      code,
      companyId: new Types.ObjectId(companyId),
      role: dto.role,
      positionId,
      createdBy: new Types.ObjectId(user._id.toString()),
      isActive: true,
      maxUses: dto.maxUses ?? null,
      usedCount: 0,
      expiresAt: this.expiryFromDays(dto.expiresInDays ?? null),
      claimedBy: [],
    });

    return this.findOneOrFail((created._id as any).toString(), companyId, user);
  }

  async findAllByCompany(
    companyId: string,
    user: AuthenticatedUser,
  ): Promise<InvitationCodeDocument[]> {
    return this.invitationCodeModel
      .find({
        companyId: new Types.ObjectId(companyId),
        deletedAt: null,
        ...this.visibilityScope(user),
      })
      .populate('positionId', 'name description')
      .populate('createdBy', 'name email')
      .sort({ createdAt: -1 })
      .exec();
  }

  async findOne(
    id: string,
    companyId: string,
    user: AuthenticatedUser,
  ): Promise<InvitationCodeDocument> {
    return this.findOneOrFail(id, companyId, user);
  }

  async update(
    id: string,
    companyId: string,
    dto: UpdateInvitationCodeDto,
    user: AuthenticatedUser,
  ): Promise<InvitationCodeDocument> {
    const invitationCode = await this.findOneOrFail(id, companyId, user);

    // Re-validate the role/position pair against whatever the update leaves in
    // place, so a partial update can't produce an invalid configuration (e.g.
    // switching to company_staff while leaving positionId null).
    const nextRole = dto.role ?? invitationCode.role;
    const nextPositionId =
      dto.positionId !== undefined
        ? dto.positionId
        : (invitationCode.positionId?.toString() ?? null);

    invitationCode.positionId = (await this.resolveRoleAndPosition(
      nextRole,
      nextPositionId,
      user,
    )) as any;
    invitationCode.role = nextRole;

    if (dto.isActive !== undefined) invitationCode.isActive = dto.isActive;

    if (dto.maxUses !== undefined) {
      if (
        dto.maxUses !== null &&
        dto.maxUses < (invitationCode.usedCount ?? 0)
      ) {
        throw new UnprocessableEntityException(
          `maxUses cannot be lower than the number of claims already made (${invitationCode.usedCount}).`,
        );
      }
      invitationCode.maxUses = dto.maxUses;
    }

    if (dto.expiresInDays !== undefined) {
      invitationCode.expiresAt = this.expiryFromDays(dto.expiresInDays);
    }

    await invitationCode.save();
    return this.findOneOrFail(id, companyId, user);
  }

  async remove(
    id: string,
    companyId: string,
    user: AuthenticatedUser,
  ): Promise<{ _id: string }> {
    const invitationCode = await this.findOneOrFail(id, companyId, user);
    invitationCode.deletedAt = new Date();
    invitationCode.isActive = false;
    await invitationCode.save();
    return { _id: id };
  }

  // ─── Claim side ───────────────────────────────────────────────────────────

  /**
   * Shows what a code grants before committing to it, so the claimer can see
   * which company/role/department they are about to join.
   */
  async preview(rawCode: string): Promise<any> {
    const invitationCode = await this.findClaimableCode(rawCode);
    await invitationCode.populate([
      { path: 'companyId', select: 'name address description' },
      { path: 'positionId', select: 'name description' },
    ]);

    return {
      code: invitationCode.code,
      company: invitationCode.companyId,
      role: invitationCode.role,
      position: invitationCode.positionId,
      expiresAt: invitationCode.expiresAt,
    };
  }

  /**
   * Redeems a code. Only an unassigned staff member with no company may claim;
   * on success their role and position are set to the code's configuration.
   */
  async claim(dto: ClaimInvitationCodeDto, user: AuthenticatedUser) {
    const invitationCode = await this.findClaimableCode(dto.code);

    // Re-read the user from the DB — the JWT may carry a stale role/company.
    const currentUser = await this.userModel.findById(user._id).exec();
    if (!currentUser) {
      throw new NotFoundException('User not found.');
    }
    if (currentUser.companyId) {
      throw new UnprocessableEntityException('You already belong to a company.');
    }
    if (currentUser.role !== Role.UnassignedStaff) {
      throw new ForbiddenException(
        'Only unassigned staff can claim an invitation code.',
      );
    }

    // Consume one use atomically, re-checking the guards in the same query so
    // two simultaneous claims cannot push usedCount past maxUses.
    const consumed = await this.invitationCodeModel
      .findOneAndUpdate(
        {
          _id: invitationCode._id,
          isActive: true,
          deletedAt: null,
          $and: [
            {
              $or: [
                { expiresAt: null },
                { expiresAt: { $gt: new Date() } },
              ],
            },
            {
              $or: [
                { maxUses: null },
                { $expr: { $lt: ['$usedCount', '$maxUses'] } },
              ],
            },
          ],
        },
        {
          $inc: { usedCount: 1 },
          $addToSet: { claimedBy: currentUser._id },
        },
        { new: true },
      )
      .exec();

    if (!consumed) {
      throw new UnprocessableEntityException(
        'This invitation code is no longer claimable.',
      );
    }

    const updatedUser = await this.userModel
      .findByIdAndUpdate(
        currentUser._id,
        {
          $set: {
            companyId: consumed.companyId,
            positionId: consumed.positionId,
            role: consumed.role,
          },
        },
        { new: true },
      )
      .select('-password')
      .populate('companyId', 'name address description')
      .populate('positionId', 'name description')
      .exec();

    if (!updatedUser) {
      // Give the use back — the user was never actually joined.
      await this.invitationCodeModel
        .updateOne(
          { _id: consumed._id },
          {
            $inc: { usedCount: -1 },
            $pull: { claimedBy: currentUser._id },
          },
        )
        .exec();
      throw new UnprocessableEntityException('Failed to apply the invitation code.');
    }

    await this.notifyOwnerOfClaim(consumed, updatedUser);

    return updatedUser;
  }

  // ─── Internals ────────────────────────────────────────────────────────────

  /**
   * Role/position rules for configuring a code:
   *  - role must be company_staff or company_manager
   *  - only the company owner may configure a company_manager code
   *  - company_staff requires a position; company_manager may omit it
   *  - the position must exist and belong to the caller's company
   *  - a department manager may only configure staff for their own department
   */
  private async resolveRoleAndPosition(
    role: string,
    positionId: string | null,
    user: AuthenticatedUser,
  ): Promise<Types.ObjectId | null> {
    if (![Role.CompanyStaff, Role.CompanyManager].includes(role as Role)) {
      throw new UnprocessableEntityException({
        message: 'Validation failed',
        errors: { field: [{ role: 'Invalid role specified' }] },
      });
    }

    // Managers (general or department) may only ever hand out staff codes —
    // granting the manager role is the owner's prerogative.
    if (role === Role.CompanyManager && user.role !== Role.CompanyOwner) {
      throw new ForbiddenException(
        'Only the company owner can configure manager invitation codes.',
      );
    }

    if (role === Role.CompanyManager && !positionId) {
      return null;
    }

    if (role === Role.CompanyStaff && !positionId) {
      throw new UnprocessableEntityException({
        message: 'Validation failed',
        errors: {
          field: [{ positionId: 'Position ID is required for staff role' }],
        },
      });
    }

    if (!Types.ObjectId.isValid(positionId as string)) {
      throw new UnprocessableEntityException({
        message: 'Validation failed',
        errors: { field: [{ positionId: 'Invalid Position ID format' }] },
      });
    }

    // Enforces company scope for non-admins.
    try {
      await this.positionsService.findById(positionId as string, user);
    } catch {
      throw new UnprocessableEntityException({
        message: 'Validation failed',
        errors: {
          field: [
            { positionId: `Position with ID ${positionId} not found` },
          ],
        },
      });
    }

    if (
      role === Role.CompanyStaff &&
      DepartmentAuthHelper.isDepartmentManager(user)
    ) {
      const managerPositionId = user.position!._id.toString();
      if (positionId !== managerPositionId) {
        throw new UnprocessableEntityException({
          message: 'Validation failed',
          errors: {
            field: [
              {
                positionId:
                  'Department managers can only invite staff for positions in their department.',
              },
            ],
          },
        });
      }
    }

    return new Types.ObjectId(positionId as string);
  }

  /**
   * Which codes a user is allowed to see/act on, as a Mongo filter fragment:
   *
   *  - Owner              → every code in the company (staff and manager codes)
   *  - General manager    → staff codes only, any department; never manager codes
   *  - Department manager → staff codes in their own department only
   *
   * Out-of-scope codes are reported as "not found" rather than "forbidden", so
   * a manager cannot probe for the existence of codes they may not see.
   */
  private visibilityScope(user: AuthenticatedUser): Record<string, any> {
    if (DepartmentAuthHelper.isDepartmentManager(user)) {
      return {
        role: Role.CompanyStaff,
        positionId: new Types.ObjectId(user.position!._id.toString()),
      };
    }

    if (DepartmentAuthHelper.isGeneralManager(user)) {
      return { role: Role.CompanyStaff };
    }

    // Company owner — unrestricted.
    return {};
  }

  private async findOneOrFail(
    id: string,
    companyId: string,
    user: AuthenticatedUser,
  ): Promise<InvitationCodeDocument> {
    if (!Types.ObjectId.isValid(id)) {
      throw new NotFoundException(`Invitation code with ID ${id} not found`);
    }

    const invitationCode = await this.invitationCodeModel
      .findOne({
        _id: id,
        companyId: new Types.ObjectId(companyId),
        deletedAt: null,
        ...this.visibilityScope(user),
      })
      .populate('positionId', 'name description')
      .populate('createdBy', 'name email')
      .exec();

    if (!invitationCode) {
      throw new NotFoundException(`Invitation code with ID ${id} not found`);
    }
    return invitationCode;
  }

  /** Loads a code and asserts it is currently redeemable. */
  private async findClaimableCode(
    rawCode: string,
  ): Promise<InvitationCodeDocument> {
    const code = rawCode.trim().toUpperCase();

    const invitationCode = await this.invitationCodeModel
      .findOne({ code, deletedAt: null })
      .exec();

    if (!invitationCode) {
      throw new NotFoundException('Invalid invitation code.');
    }
    if (!invitationCode.isActive) {
      throw new UnprocessableEntityException(
        'This invitation code is no longer active.',
      );
    }
    if (
      invitationCode.expiresAt &&
      invitationCode.expiresAt.getTime() < Date.now()
    ) {
      throw new UnprocessableEntityException(
        'This invitation code has expired.',
      );
    }
    if (
      invitationCode.maxUses !== null &&
      invitationCode.usedCount >= invitationCode.maxUses
    ) {
      throw new UnprocessableEntityException(
        'This invitation code has already been fully claimed.',
      );
    }

    return invitationCode;
  }

  private async reserveCustomCode(rawCode: string): Promise<string> {
    const code = rawCode.trim().toUpperCase();
    const existing = await this.invitationCodeModel
      .findOne({ code })
      .select('_id')
      .exec();
    if (existing) {
      throw new ConflictException(`Invitation code "${code}" is already taken.`);
    }
    return code;
  }

  private async generateUniqueCode(): Promise<string> {
    for (let i = 0; i < CODE_GENERATION_ATTEMPTS; i++) {
      const code = generateCode(CODE_LENGTH);
      const existing = await this.invitationCodeModel
        .findOne({ code })
        .select('_id')
        .exec();
      if (!existing) return code;
    }
    throw new ConflictException(
      'Could not generate a unique invitation code. Please try again.',
    );
  }

  private expiryFromDays(days: number | null): Date | null {
    if (!days) return null;
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + days);
    return expiresAt;
  }

  private async notifyOwnerOfClaim(
    invitationCode: InvitationCodeDocument,
    joinedUser: UserDocument,
  ): Promise<void> {
    try {
      const company = await this.companyModel
        .findById(invitationCode.companyId)
        .select('name ownerId')
        .exec();

      if (!company?.ownerId) return;

      await this.fcmService.sendToUser(
        company.ownerId.toString(),
        'Karyawan Baru Bergabung',
        `${joinedUser.name} telah bergabung dengan ${company.name} menggunakan kode undangan.`,
        {
          resource: 'invitation_code',
          resourceId: (invitationCode._id as any).toString(),
          status: 'claimed',
        },
      );
    } catch {
      // Notification failure must never fail the claim itself.
    }
  }
}
