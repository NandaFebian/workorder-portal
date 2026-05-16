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

    const redirectUrl = `${cfg.externalLoginUrl}?state=${state}`;

    return { redirect_url: redirectUrl, state };
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

    let externalProfile: { email: string; name: string };
    try {
      const response = await firstValueFrom(
        this.httpService.post(cfg.externalVerifyUrl, {
          code: dto.code,
          secret_key: cfg.secretKey,
        }),
      );
      externalProfile = response.data;
    } catch {
      throw new BadRequestException('Failed to verify code with external system');
    }

    if (!externalProfile?.email) {
      throw new BadRequestException('External system did not return a valid profile');
    }

    const existing = await this.externalAccountModel.findOne({
      externalCustomerEmail: externalProfile.email,
      companyId: new Types.ObjectId(dto.company_id),
      deletedAt: null,
    });

    if (existing) {
      throw new ConflictException(
        'An external account with this email is already paired to this company',
      );
    }

    const created = await this.externalAccountModel.create({
      externalCustomerEmail: externalProfile.email,
      externalCustomerName: externalProfile.name ?? '',
      companyId: new Types.ObjectId(dto.company_id),
      userId: user._id,
      pairedAt: new Date(),
    });

    return ExternalAccountResource.transform(created);
  }

  async findAllByCompany(companyId: string, user: AuthenticatedUser): Promise<any[]> {
    if (!Types.ObjectId.isValid(companyId)) {
      throw new NotFoundException('Invalid company ID');
    }

    const accounts = await this.externalAccountModel
      .find({ companyId: new Types.ObjectId(companyId), deletedAt: null })
      .populate('userId', 'name email')
      .sort({ pairedAt: -1 })
      .lean()
      .exec();

    return ExternalAccountResource.transformList(accounts);
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

    const isOwnerOrManager =
      user.role === 'owner_company' || user.role === 'manager_company';
    const isOwnAccount = account.userId.toString() === user._id.toString();

    if (!isOwnerOrManager && !isOwnAccount) {
      throw new ForbiddenException('You do not have permission to unpair this account');
    }

    if (isOwnerOrManager && user.company?._id) {
      if (account.companyId.toString() !== user.company._id.toString()) {
        throw new ForbiddenException('This account does not belong to your company');
      }
    }

    account.deletedAt = new Date();
    await account.save();

    return { unpaired_at: account.deletedAt };
  }

  async checkExternalMemberships(companyId: string, user: AuthenticatedUser): Promise<any> {
    if (!Types.ObjectId.isValid(companyId)) {
      throw new NotFoundException('Invalid company ID');
    }

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
      .lean()
      .exec();

    const emails = accounts.map((a: any) => a.externalCustomerEmail);

    try {
      const response = await firstValueFrom(
        this.httpService.post(cfg.externalCheckMembershipsUrl, {
          emails,
          secret_key: cfg.secretKey,
        }),
      );
      return response.data;
    } catch {
      throw new BadRequestException('Failed to check memberships from external system');
    }
  }
}
