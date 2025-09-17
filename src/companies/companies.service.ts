import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Company, CompanyDocument } from '../schemas/company.schemas';

@Injectable()
export class CompaniesService {
    constructor(@InjectModel(Company.name) private companyModel: Model<CompanyDocument>) { }

    async create(createCompanyDto: { name: string; address: string; ownerId: Types.ObjectId }): Promise<CompanyDocument> {
        const newCompany = new this.companyModel(createCompanyDto);
        return newCompany.save();
    }
}