// src/company/companies.client.service.ts
import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Company, CompanyDocument } from './schemas/company.schemas';
import { Service, ServiceDocument } from 'src/service/schemas/service.schema';
import { ServicesClientService } from 'src/service/services.client.service';
import { AuthenticatedUser } from 'src/auth/interfaces/authenticated-user.interface';

@Injectable()
export class CompaniesClientService {
  constructor(
    @InjectModel(Company.name) private companyModel: Model<CompanyDocument>,
    @InjectModel(Service.name) private serviceModel: Model<ServiceDocument>,
    private servicesClientService: ServicesClientService, // Inject service client
  ) {}

  async findAllPublic(keyword?: string): Promise<CompanyDocument[]> {
    const baseFilter = {
      isActive: true,
      deletedAt: null,
    };

    const trimmedKeyword = keyword?.trim();

    // No keyword → return all active companies (existing behavior)
    if (!trimmedKeyword) {
      return this.companyModel
        .find(baseFilter)
        .select('_id name address description ownerId') // Select specific fields
        .sort({ createdAt: -1 })
        .exec();
    }

    // Case-insensitive partial match, with regex special characters escaped
    // so the keyword is treated as a literal string.
    const escaped = trimmedKeyword.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const keywordRegex = new RegExp(escaped, 'i');

    // Find companies that own at least one public service whose title matches
    // the keyword. Services are versioned by serviceKey, so we take the latest
    // version per key (by __v) before checking accessType/isActive.
    const matchingServiceCompanies: { _id: Types.ObjectId }[] =
      await this.serviceModel.aggregate([
        { $match: { deletedAt: null } },
        { $sort: { __v: -1 } },
        { $group: { _id: '$serviceKey', latest: { $first: '$$ROOT' } } },
        { $replaceRoot: { newRoot: '$latest' } },
        {
          $match: {
            accessType: 'public',
            isActive: true,
            title: { $regex: keywordRegex },
          },
        },
        { $group: { _id: '$companyId' } },
      ]);

    const companyIdsWithMatchingService = matchingServiceCompanies.map(
      (doc) => doc._id,
    );

    return this.companyModel
      .find({
        ...baseFilter,
        $or: [
          { name: { $regex: keywordRegex } },
          { _id: { $in: companyIdsWithMatchingService } },
        ],
      })
      .select('_id name address description ownerId')
      .sort({ createdAt: -1 })
      .exec();
  }

  async findPublicById(
    id: string,
    user?: AuthenticatedUser | null,
  ): Promise<any> {
    if (!Types.ObjectId.isValid(id)) {
      throw new NotFoundException(`Invalid company ID: ${id}`);
    }

    const company = await this.companyModel
      .findOne({
        _id: id,
        isActive: true,
        deletedAt: null,
      })
      .select(
        '_id name address description ownerId integrationConfig isFaqActive',
      )
      .exec();

    if (!company) {
      throw new NotFoundException(
        `Company with ID ${id} not found or is not active`,
      );
    }

    const { isSubscribed } =
      await this.servicesClientService.findAllByCompanyId(id, user);
    const isIntegrationActive =
      company.integrationConfig?.isIntegrationActive ?? false;
    const integrationType =
      company.integrationConfig?.integrationType ?? 'external_system';

    const { integrationConfig, ...companyObj } = company.toObject();

    return {
      company: companyObj,
      isSubscribed,
      isIntegrationActive,
      integrationType,
    };
  }

  async findPublicServicesByCompanyId(
    id: string,
    user?: AuthenticatedUser | null,
  ): Promise<{
    isSubscribed: boolean;
    isIntegrationActive: boolean;
    services: any[];
  }> {
    if (!Types.ObjectId.isValid(id)) {
      throw new NotFoundException(`Invalid company ID: ${id}`);
    }
    const company = await this.companyModel
      .findOne({
        _id: id,
        isActive: true,
        deletedAt: null,
      })
      .select('integrationConfig')
      .exec();

    if (!company) {
      throw new NotFoundException(
        `Company with ID ${id} not found or is not active`,
      );
    }

    const { isSubscribed, services } =
      await this.servicesClientService.findAllByCompanyId(id, user);
    const isIntegrationActive =
      company.integrationConfig?.isIntegrationActive ?? false;

    return {
      isSubscribed,
      isIntegrationActive,
      services,
    };
  }
}
