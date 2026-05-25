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
import { AuthenticatedUser } from 'src/auth/interfaces/authenticated-user.interface';
import { Company, CompanyDocument } from 'src/company/schemas/company.schemas';
import {
  ExternalAccount,
  ExternalAccountDocument,
} from 'src/customer-pairing/schemas/external-account.schema';
import { ExternalAccountResource } from 'src/customer-pairing/resources/external-account.resource';
import { parse } from 'csv-parse/sync';
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
  ) {}

  async importFromCsv(
    file: Express.Multer.File,
    user: AuthenticatedUser,
  ): Promise<MembershipCodeDocument[]> {
    if (!user.company?._id) {
      throw new ForbiddenException('User is not associated with any company.');
    }

    if (!file || !file.buffer) {
      throw new BadRequestException('CSV file is required.');
    }

    let records: any[];
    try {
      records = parse(file.buffer.toString('utf-8'), {
        columns: true,
        skip_empty_lines: true,
        trim: true,
      });
    } catch {
      throw new BadRequestException('Invalid CSV format.');
    }

    if (records.length === 0) {
      throw new BadRequestException('CSV file is empty.');
    }

    const docs: any[] = [];
    for (const row of records) {
      const email = row.external_customer_email || row.email;
      const name = row.external_customer_name || row.name;
      const token = row.token || `TKN-${crypto.randomBytes(4).toString('hex').toUpperCase()}`;

      if (!email || !name) {
        throw new BadRequestException(
          'Each row must have external_customer_email and external_customer_name columns.',
        );
      }

      docs.push({
        companyId: user.company._id,
        externalCustomerEmail: email,
        externalCustomerName: name,
        token,
      });
    }

    try {
      return (await this.membershipCodeModel.insertMany(docs)) as any;
    } catch (error: any) {
      if (error?.code === 11000) {
        throw new ConflictException('Duplicate token detected in CSV.');
      }
      throw new BadRequestException('Failed to import CSV data.');
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

      const integrationType = company?.integrationConfig?.integrationType ?? 'external_system';

      if (integrationType === 'claim_token') {
        const membership = await this.membershipCodeModel.findOne({
          companyId: companyId,
          claimedBy: userId,
          $or: [{ deletedAt: null }, { deletedAt: { $exists: false } }],
        }).select('_id').lean();
        return !!membership;
      }

      if (company?.integrationConfig?.isIntegrationActive) {
        return this.checkExternalSubscription(userId, companyId, company.integrationConfig as any);
      }

      const membership = await this.membershipCodeModel.findOne({
        companyId: companyId,
        claimedBy: userId,
        $or: [{ deletedAt: null }, { deletedAt: { $exists: false } }],
      }).select('_id').lean();

      return !!membership;
    } catch {
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
        claimedBy: { $ne: null },
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
        integration_type: (membership as any).integrationType || 'claim_token',
      });
    }

    for (const ea of externalAccounts) {
      if (!ea.userId) continue;
      const clientId = (ea.userId as any)._id.toString();
      const eaMethod = (ea as any).integrationType || 'external_system';

      if (result.has(clientId)) {
        const existing = result.get(clientId);
        existing.external_account = ExternalAccountResource.transform(ea);
        
        const m = memberships.find((x) => (x.claimedBy as any)?._id?.toString() === clientId);
        if (m) {
          const mTime = m.claimedAt ? new Date(m.claimedAt).getTime() : Infinity;
          const eaTime = ea.pairedAt ? new Date(ea.pairedAt).getTime() : Infinity;
          if (eaTime < mTime) {
            existing.integration_type = eaMethod;
          }
        }
      } else {
        result.set(clientId, {
          user: ea.userId,
          external_account: ExternalAccountResource.transform(ea),
          integration_type: eaMethod,
        });
      }
    }

    return Array.from(result.values());
  }

  async claimCode(
    dto: { code: string },
    user: AuthenticatedUser,
  ): Promise<any> {
    const codeDoc = await this.membershipCodeModel.findOne({
      token: dto.code,
      deletedAt: null,
    });

    if (!codeDoc) {
      throw new NotFoundException('Invalid membership code');
    }

    if (codeDoc.claimedBy) {
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
       { _id: codeDoc._id, claimedBy: null },
       {
         $set: {
           claimedBy: user._id,
           claimedAt: new Date(),
           integrationType: 'claim_token',
         },
       },
       { new: true }
     );

    if (!updatedDoc) {
      throw new ConflictException('Membership code already claimed by another concurrent request');
    }

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

  async remove(id: string, user: AuthenticatedUser): Promise<any> {
    if (!Types.ObjectId.isValid(id)) {
      throw new NotFoundException('Invalid membership code ID');
    }

    const code = await this.membershipCodeModel
      .findOne({ _id: id, deletedAt: null })
      .exec();
    if (!code) {
      throw new NotFoundException('Membership code not found');
    }

    const deletedAt = new Date();
    code.deletedAt = deletedAt;
    await code.save();

    if (code.claimedBy) {
      await this.externalAccountModel.updateMany(
        {
          companyId: code.companyId,
          userId: code.claimedBy,
          deletedAt: null,
        },
        { $set: { deletedAt } },
      );
    }

    return code.toObject ? code.toObject() : { ...code };
  }
}
