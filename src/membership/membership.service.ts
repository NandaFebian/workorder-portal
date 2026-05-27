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
        columns: (headers) => headers.map((h) => h.trim().toLowerCase()),
        skip_empty_lines: true,
        trim: true,
      });
    } catch {
      throw new BadRequestException('Invalid CSV format.');
    }

    if (records.length === 0) {
      throw new BadRequestException('CSV file is empty.');
    }

    const firstRecordHeaders = Object.keys(records[0]);
    const hasEmail = firstRecordHeaders.includes('external_customer_email') || firstRecordHeaders.includes('email');
    const hasName = firstRecordHeaders.includes('external_customer_name') || firstRecordHeaders.includes('name');
    const hasToken = firstRecordHeaders.includes('token');

    if (!hasEmail || !hasName || !hasToken) {
      throw new BadRequestException(
        'CSV must contain external_customer_email (or email), external_customer_name (or name), and token columns.',
      );
    }

    const docs: any[] = [];
    for (const row of records) {
      const email = row.external_customer_email || row.email;
      const name = row.external_customer_name || row.name;
      const token = row.token;

      if (!email || !name || !token) {
        throw new BadRequestException(
          'Each row must have external_customer_email, external_customer_name, and token columns.',
        );
      }

      docs.push({
        companyId: user.company._id,
        externalCustomerEmail: email,
        externalCustomerName: name,
        token,
      });
    }

    const tokens = docs.map((d) => d.token);
    const existingCodes = await this.membershipCodeModel.find({
      companyId: user.company._id,
      token: { $in: tokens },
      deletedAt: null,
    }).select('token').lean();

    if (existingCodes.length > 0) {
      const duplicates = existingCodes.map((c) => c.token);
      throw new ConflictException(
        `Duplicate token(s) already exist in database for this company: ${duplicates.join(', ')}`,
      );
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

      const config = company?.integrationConfig;
      const integrationType = config?.integrationType || (config as any)?.integration_type || 'external_system';

      if (integrationType === 'claim_token') {
        const membership = await this.membershipCodeModel.findOne({
          companyId: companyId,
          claimedBy: userId,
          $or: [{ deletedAt: null }, { deletedAt: { $exists: false } }],
        }).select('_id').lean();
        return !!membership;
      }

      const isIntegrationActive = config?.isIntegrationActive || (config as any)?.is_integration_active || false;
      if (isIntegrationActive) {
        return this.checkExternalSubscription(userId, companyId, config as any);
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
    const externalCheckMembershipsUrl = cfg?.externalCheckMembershipsUrl || cfg?.external_check_memberships_url;
    const secretKey = cfg?.secretKey || cfg?.secret_key;
    if (!externalCheckMembershipsUrl || !secretKey) {
      return !!account;
    }

    try {
      const response = await firstValueFrom(
        this.httpService.post(externalCheckMembershipsUrl, {
          emails: [account.externalCustomerEmail],
          client_secret: secretKey,
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
        externalAccount: null,
        integrationType: (membership as any).integrationType || 'claim_token',
      });
    }

    for (const ea of externalAccounts) {
      if (!ea.userId) continue;
      const clientId = (ea.userId as any)._id.toString();
      const eaMethod = (ea as any).integrationType || 'external_system';

      if (result.has(clientId)) {
        const existing = result.get(clientId);
        existing.externalAccount = ExternalAccountResource.transform(ea);
        
        const m = memberships.find((x) => (x.claimedBy as any)?._id?.toString() === clientId);
        if (m) {
          const mTime = m.claimedAt ? new Date(m.claimedAt).getTime() : Infinity;
          const eaTime = ea.pairedAt ? new Date(ea.pairedAt).getTime() : Infinity;
          if (eaTime < mTime) {
            existing.integrationType = eaMethod;
          }
        }
      } else {
        result.set(clientId, {
          user: ea.userId,
          externalAccount: ExternalAccountResource.transform(ea),
          integrationType: eaMethod,
        });
      }
    }

    return Array.from(result.values());
  }

  async claimCode(
    dto: { code?: string; token?: string; companyId?: string; company_id?: string },
    user: AuthenticatedUser,
  ): Promise<any> {
    const token = dto.token || dto.code;
    if (!token) {
      throw new BadRequestException('Membership code or token is required');
    }

    const targetCompanyId = dto.companyId || dto.company_id;
    const query: any = {
      token,
      deletedAt: null,
    };
    if (targetCompanyId) {
      query.companyId = targetCompanyId;
    }

    const codeDoc = await this.membershipCodeModel.findOne(query);

    if (!codeDoc) {
      throw new NotFoundException('Invalid membership code');
    }

    const company = await this.companyModel.findOne({
      _id: codeDoc.companyId,
      deletedAt: null,
    }).select('integrationConfig').lean();

    const config = company?.integrationConfig;
    const integrationType = config?.integrationType || (config as any)?.integration_type || 'external_system';
    if (integrationType !== 'claim_token') {
      throw new BadRequestException(
        'This company does not use token-based membership. Please use the external account integration.',
      );
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

    const createdEa = await this.externalAccountModel.create({
      externalCustomerEmail: codeDoc.externalCustomerEmail,
      externalCustomerName: codeDoc.externalCustomerName,
      companyId: codeDoc.companyId,
      userId: user._id,
      pairedAt: new Date(),
      integrationType: 'claim_token',
    });

    const populatedEa = await this.externalAccountModel
      .findById(createdEa._id)
      .populate('companyId')
      .lean()
      .exec();

    return ExternalAccountResource.transform(populatedEa);
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
