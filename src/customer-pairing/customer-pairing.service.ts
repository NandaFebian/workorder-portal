import {
  Injectable,
  BadRequestException,
  ConflictException,
  ForbiddenException,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';
import * as crypto from 'crypto';
import {
  ExternalAccount,
  ExternalAccountDocument,
} from './schemas/external-account.schema';
import { Company, CompanyDocument } from 'src/company/schemas/company.schemas';
import { StartPairingDto } from './dto/start-pairing.dto';
import { CompletePairingDto } from './dto/complete-pairing.dto';
import { AuthenticatedUser } from 'src/auth/interfaces/authenticated-user.interface';
import { ExternalAccountResource } from './resources/external-account.resource';
import { PairingState, PairingStateDocument } from './schemas/pairing-state.schema';

@Injectable()
export class CustomerPairingService {
  constructor(
    @InjectModel(ExternalAccount.name)
    private externalAccountModel: Model<ExternalAccountDocument>,
    @InjectModel(Company.name)
    private companyModel: Model<CompanyDocument>,
    @InjectModel(PairingState.name)
    private pairingStateModel: Model<PairingStateDocument>,
    private httpService: HttpService,
  ) { }

  async startPairing(dto: StartPairingDto, user: AuthenticatedUser): Promise<any> {
    const company = await this.companyModel
      .findOne({ _id: dto.company_id, deletedAt: null })
      .exec();

    if (!company) {
      throw new NotFoundException('Company not found');
    }

    const cfg = (company as any).integrationConfig;
    if (!cfg?.isIntegrationActive) {
      throw new BadRequestException('Integration is not active for this company');
    }
    if (!cfg?.externalLoginUrl) {
      throw new BadRequestException('External login URL is not configured');
    }

    const state = crypto.randomBytes(16).toString('hex');

    await this.pairingStateModel.create({
      state,
      userId: user._id,
      companyId: new Types.ObjectId(dto.company_id),
    });

    const redirectUri = `${dto.redirect_base_url}?company_id=${dto.company_id}`;
    const redirectUrl = `${cfg.externalLoginUrl}?redirect_uri=${encodeURIComponent(redirectUri)}&state=${state}`;

    return { redirect_url: redirectUrl };
  }

  async completePairing(dto: CompletePairingDto, user: AuthenticatedUser): Promise<any> {
    const stateDoc = await this.pairingStateModel.findOne({
      state: dto.state,
      userId: user._id,
      companyId: new Types.ObjectId(dto.company_id),
    });

    if (!stateDoc) {
      throw new UnauthorizedException('Invalid or expired state token');
    }

    await this.pairingStateModel.deleteOne({ _id: stateDoc._id });

    const company = await this.companyModel
      .findOne({ _id: dto.company_id, deletedAt: null })
      .exec();

    if (!company) {
      throw new NotFoundException('Company not found');
    }

    const cfg = (company as any).integrationConfig;
    if (!cfg?.externalVerifyUrl || !cfg?.secretKey) {
      throw new BadRequestException('External verify URL or secret key is not configured');
    }

    let externalProfile: { external_customer_id: string; name: string; subscription_status: string };
    try {
      const response = await firstValueFrom(
        this.httpService.post(cfg.externalVerifyUrl, {
          code: dto.code,
          client_secret: cfg.secretKey,
        }),
      );
      externalProfile = response.data;
    } catch {
      throw new BadRequestException('Failed to verify code with external system');
    }

    if (!externalProfile?.external_customer_id) {
      throw new BadRequestException('External system did not return a valid profile');
    }

    const existing = await this.externalAccountModel.findOne({
      externalCustomerEmail: externalProfile.external_customer_id,
      companyId: new Types.ObjectId(dto.company_id),
      deletedAt: null,
    });

    if (existing) {
      throw new ConflictException(
        'This external account is already paired to this company',
      );
    }

    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7);

    const created = await this.externalAccountModel.create({
      externalCustomerEmail: externalProfile.external_customer_id,
      externalCustomerName: externalProfile.name ?? '',
      companyId: new Types.ObjectId(dto.company_id),
      userId: user._id,
      pairedAt: new Date(),
      expiresAt,
    });

    const populated = await this.externalAccountModel
      .findById(created._id)
      .populate('companyId')
      .lean()
      .exec();

    return ExternalAccountResource.transform(populated);
  }

  async findAllForUser(user: AuthenticatedUser): Promise<any[]> {
    const accounts = await this.externalAccountModel
      .find({ userId: user._id, deletedAt: null })
      .populate('companyId')
      .sort({ pairedAt: -1 })
      .lean()
      .exec();

    return ExternalAccountResource.transformList(accounts);
  }

  async findForUserInCompany(companyId: string, user: AuthenticatedUser): Promise<any> {
    if (!Types.ObjectId.isValid(companyId)) {
      throw new NotFoundException('Invalid company ID');
    }

    const account = await this.externalAccountModel
      .findOne({
        companyId: new Types.ObjectId(companyId),
        userId: user._id,
        deletedAt: null,
      })
      .populate('companyId')
      .lean()
      .exec();

    if (!account) {
      throw new NotFoundException('No external account found for this company');
    }

    return ExternalAccountResource.transform(account);
  }

  async unpair(id: string, user: AuthenticatedUser): Promise<any> {
    if (!Types.ObjectId.isValid(id)) {
      throw new NotFoundException('Invalid external account ID');
    }

    const account = await this.externalAccountModel
      .findOne({ _id: id, deletedAt: null })
      .exec();

    if (!account) {
      throw new NotFoundException('External account not found');
    }

    const isOwnAccount = account.userId.toString() === user._id.toString();
    if (!isOwnAccount) {
      throw new ForbiddenException('You do not have permission to unpair this account');
    }

    account.deletedAt = new Date();
    await account.save();

    const populated = await this.externalAccountModel
      .findById(account._id)
      .populate('companyId')
      .lean()
      .exec();

    return ExternalAccountResource.transform(populated);
  }

  async getExternalMemberships(user: AuthenticatedUser): Promise<any[]> {
    if (!user.company?._id) {
      throw new ForbiddenException('User is not associated with any company.');
    }

    const companyId = user.company._id.toString();
    const company = await this.companyModel
      .findOne({ _id: companyId, deletedAt: null })
      .exec();

    if (!company) {
      throw new NotFoundException('Company not found');
    }

    const cfg = (company as any).integrationConfig;
    if (!cfg?.isIntegrationActive) {
      throw new BadRequestException('Integration is not active for this company');
    }
    if (!cfg?.externalCheckMembershipsUrl || !cfg?.secretKey) {
      throw new BadRequestException('External memberships URL or secret key is not configured');
    }

    const accounts = await this.externalAccountModel
      .find({ companyId: new Types.ObjectId(companyId), deletedAt: null })
      .populate('userId', 'name email role')
      .populate('companyId')
      .lean()
      .exec();

    const emails = accounts.map((a: any) => a.externalCustomerEmail);

    let externalData: any[] = [];
    try {
      const response = await firstValueFrom(
        this.httpService.post(cfg.externalCheckMembershipsUrl, {
          emails,
          client_secret: cfg.secretKey,
        }),
      );
      externalData = response.data;
    } catch {
      throw new BadRequestException('Failed to check memberships from external system');
    }

    return accounts.map((account: any) => ({
      user: account.userId,
      external_account: ExternalAccountResource.transform(account),
    }));
  }
}
