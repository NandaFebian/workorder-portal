import {
  Injectable,
  BadRequestException,
  ConflictException,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';
import {
  MembershipCode,
  MembershipCodeDocument,
} from './schemas/membership.schema';
import { GenerateMemberCodesDto } from './dto/generate-code.dto';
import { ClaimMemberCodeDto } from './dto/claim-code.dto';
import { AuthenticatedUser } from 'src/auth/interfaces/authenticated-user.interface';
import { Company, CompanyDocument } from 'src/company/schemas/company.schemas';
import {
  ExternalAccount,
  ExternalAccountDocument,
} from 'src/customer-pairing/schemas/external-account.schema';
import { ExternalAccountResource } from 'src/customer-pairing/resources/external-account.resource';
import * as crypto from 'crypto';

@Injectable()
export class MembershipService {
  constructor(
    @InjectModel(MembershipCode.name)
    private membershipCodeModel: Model<MembershipCodeDocument>,
    @InjectModel(Company.name)
    private companyModel: Model<CompanyDocument>,
    @InjectModel(ExternalAccount.name)
    private externalAccountModel: Model<ExternalAccountDocument>,
    private readonly httpService: HttpService,
  ) { }

  async generateCodes(
    dto: GenerateMemberCodesDto,
    user: AuthenticatedUser,
  ): Promise<MembershipCodeDocument[]> {
    if (!user.company?._id) {
      throw new ForbiddenException('User is not associated with any company.');
    }

    const codes: any[] = [];
    const prefix = dto.prefix ? dto.prefix.toUpperCase() : 'MEM';

    for (let i = 0; i < dto.amount; i++) {
      // Secure unique code generation: PREFIX-8HEXCHARS
      const randomPart = crypto.randomBytes(4).toString('hex').toUpperCase();
      const uniqueCode = `${prefix}-${randomPart}`;

      codes.push({
        code: uniqueCode,
        isClaimed: false,
        companyId: user.company._id,
      });
    }

    // Insert many (skipping duplicates if any, though unlikely with random)
    try {
      return (await this.membershipCodeModel.insertMany(codes)) as any;
    } catch (error) {
      throw new BadRequestException(
        'Failed to generate codes. Possible duplicate detected.',
      );
    }
  }

  async findAll(user: AuthenticatedUser): Promise<any[]> {
    if (!user.company?._id) {
      throw new ForbiddenException('User is not associated with any company.');
    }
    return this.membershipCodeModel
      .find({ companyId: user.company._id, deletedAt: null })
      .populate('claimedBy', 'name email role')
      .sort({ createdAt: -1 })
      .lean()
      .exec();
  }

  /**
   * Helper: cek apakah user sudah berlangganan (claimed membership) pada company tertentu.
   * Dapat dipanggil dari modul lain (mis. ServicesClientService).
   */
  async isUserSubscribed(
    userId: string,
    companyId: string,
  ): Promise<boolean> {
    if (
      !userId ||
      !companyId ||
      !Types.ObjectId.isValid(userId) ||
      !Types.ObjectId.isValid(companyId)
    ) {
      return false;
    }

    try {
      const company = await this.companyModel.findOne({
        _id: companyId,
        deletedAt: null,
      }).select('integrationConfig').lean();

      if (company?.integrationConfig?.isIntegrationActive) {
        return this.checkExternalSubscription(userId, companyId, company.integrationConfig as any);
      }

      const membership = await this.membershipCodeModel.findOne({
        companyId: companyId,
        claimedBy: userId,
        isClaimed: true,
        $or: [{ deletedAt: null }, { deletedAt: { $exists: false } }],
      }).select('_id').lean();

      return !!membership;
    } catch (error) {
      return false;
    }
  }

  private async checkExternalSubscription(
    userId: string,
    companyId: string,
    integrationConfig: any,
  ): Promise<boolean> {
    const account = await this.externalAccountModel.findOne({
      companyId: companyId,
      userId: userId,
      deletedAt: null,
    });

    if (!account) return false;

    const cfg = integrationConfig;
    if (!cfg?.externalCheckMembershipsUrl || !cfg?.secretKey) {
      return !!account;
    }

    try {
      const response = await firstValueFrom(
        this.httpService.post(cfg.externalCheckMembershipsUrl, {
          emails: [account.externalCustomerEmail],
          client_secret: cfg.secretKey,
        }),
      );

      const data: any[] = Array.isArray(response.data) ? response.data : [];
      const match = data.find(
        (m: any) => m.email === account.externalCustomerEmail,
      );
      const isActive = match?.status === 'ACTIVE';

      if (isActive) {
        const newExpiry = match?.expires_at
          ? new Date(match.expires_at)
          : new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
        await this.externalAccountModel.updateOne(
          { _id: account._id },
          { $set: { expiresAt: newExpiry } },
        );
        return true;
      } else {
        await this.externalAccountModel.updateOne(
          { _id: account._id },
          { $set: { deletedAt: new Date() } },
        );
        return false;
      }
    } catch {
      return !!account;
    }
  }

  async findAllSubscribedClients(user: AuthenticatedUser): Promise<any[]> {
    if (!user.company?._id) {
      throw new ForbiddenException('User is not associated with any company.');
    }

    const companyId = user.company._id;

    const memberships = await this.membershipCodeModel
      .find({
        companyId,
        isClaimed: true,
        deletedAt: null,
      })
      .populate('claimedBy', 'name email role')
      .sort({ claimedAt: -1 })
      .lean()
      .exec();

    const externalAccounts = await this.externalAccountModel
      .find({
        companyId,
        deletedAt: null,
      })
      .populate('companyId')
      .populate('userId', 'name email role')
      .lean()
      .exec();

    const result = new Map<string, any>();

    for (const membership of memberships) {
      if (!membership.claimedBy) continue;
      const clientId = (membership.claimedBy as any)._id.toString();
      result.set(clientId, {
        user: membership.claimedBy,
        external_account: null,
      });
    }

    for (const ea of externalAccounts) {
      if (!ea.userId) continue;
      const clientId = (ea.userId as any)._id.toString();
      if (result.has(clientId)) {
        const existing = result.get(clientId);
        existing.external_account = ExternalAccountResource.transform(ea);
      } else {
        result.set(clientId, {
          user: ea.userId,
          external_account: ExternalAccountResource.transform(ea),
        });
      }
    }

    return Array.from(result.values());
  }

  async claimCode(
    dto: ClaimMemberCodeDto,
    user: AuthenticatedUser,
  ): Promise<MembershipCodeDocument> {
    const codeDoc = await this.membershipCodeModel.findOne({
      code: dto.code,
      deletedAt: null,
    });

    if (!codeDoc) {
      throw new NotFoundException('Invalid membership code');
    }

    if (codeDoc.isClaimed) {
      throw new ConflictException('Membership code already claimed');
    }

    const alreadySubscribed = await this.isUserSubscribed(
      user._id.toString(),
      codeDoc.companyId.toString(),
    );

    if (alreadySubscribed) {
      throw new ConflictException(
        'You have already claimed a membership code for this company',
      );
    }

    const updatedDoc = await this.membershipCodeModel.findOneAndUpdate(
      { _id: codeDoc._id, isClaimed: false },
      {
        $set: {
          isClaimed: true,
          claimedBy: user._id,
          claimedAt: new Date(),
        },
      },
      { new: true }
    );

    if (!updatedDoc) {
      throw new ConflictException('Membership code already claimed by another concurrent request');
    }

    // Re-fetch with full company object populated
    const populated = await this.membershipCodeModel
      .findById(codeDoc._id)
      .populate('claimedBy', 'name email role')
      .populate('companyId', 'name address')
      .exec();

    const doc = populated!.toObject() as any;
    const { companyId, ...rest } = doc;
    return {
      ...rest,
      company: companyId,
    } as any;
  }

  async remove(id: string): Promise<any> {
    if (!Types.ObjectId.isValid(id)) {
      throw new NotFoundException('Invalid membership code ID');
    }

    const code = await this.membershipCodeModel
      .findOne({ _id: id, deletedAt: null })
      .exec();
    if (!code) {
      throw new NotFoundException('Membership code not found');
    }

    // Soft delete
    const deletedAt = new Date();
    code.deletedAt = deletedAt;
    await code.save();

    return code.toObject ? code.toObject() : { ...code };
  }
}
