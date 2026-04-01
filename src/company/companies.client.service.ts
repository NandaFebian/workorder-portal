// src/company/companies.client.service.ts
import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Company, CompanyDocument } from './schemas/company.schemas';
import { ServicesClientService } from 'src/service/services.client.service';
import { AuthenticatedUser } from 'src/auth/interfaces/authenticated-user.interface';

@Injectable()
export class CompaniesClientService {
  constructor(
    @InjectModel(Company.name) private companyModel: Model<CompanyDocument>,
    private servicesClientService: ServicesClientService, // Inject service client
  ) {}

  async findAllPublic(): Promise<CompanyDocument[]> {
    return this.companyModel
      .find({
        isActive: true,
        deletedAt: null,
      })
      .select('_id name address description ownerId') // Select specific fields
      .sort({ createdAt: -1 })
      .exec();
  }

  async findPublicById(id: string, user?: AuthenticatedUser | null): Promise<any> {
    if (!Types.ObjectId.isValid(id)) {
      throw new NotFoundException(`Invalid company ID: ${id}`);
    }

    const company = await this.companyModel
      .findOne({
        _id: id,
        isActive: true,
        deletedAt: null,
      })
      .select('_id name address description ownerId')
      .exec();

    if (!company) {
      throw new NotFoundException(
        `Company with ID ${id} not found or is not active`,
      );
    }

    const { isSubscribed, services } = await this.servicesClientService.findAllByCompanyId(id, user);
    const companyData = company.toObject();

    return {
      ...companyData,
      isSubscribed,
      services,
    };
  }

  async findPublicServicesByCompanyId(id: string, user?: AuthenticatedUser | null): Promise<{ isSubscribed: boolean; services: any[] }> {
    if (!Types.ObjectId.isValid(id)) {
      throw new NotFoundException(`Invalid company ID: ${id}`);
    }
    const companyExists = await this.companyModel.countDocuments({
      _id: id,
      isActive: true,
      deletedAt: null,
    });
    if (companyExists === 0) {
      throw new NotFoundException(
        `Company with ID ${id} not found or is not active`,
      );
    }

    return this.servicesClientService.findAllByCompanyId(id, user);
  }
}
