import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Company, CompanyDocument } from './schemas/company.schemas';
import { UpdateCompanyDto } from './dto/update-company.dto';

@Injectable()
export class CompaniesService {
    constructor(@InjectModel(Company.name) private companyModel: Model<CompanyDocument>) { }

    // Method untuk membuat perusahaan baru
    async create(createCompanyDto: { name: string; address: string | null; ownerId: Types.ObjectId }): Promise<CompanyDocument> {
        const newCompany = new this.companyModel(createCompanyDto);
        return newCompany.save();
    }

    // Method untuk mengupdate perusahaan
    async update(id: string, updateCompanyDto: UpdateCompanyDto): Promise<CompanyDocument> {
        if (!Types.ObjectId.isValid(id)) {
            throw new NotFoundException(`Invalid company ID: ${id}`);
        }
        const updatedCompany = await this.companyModel.findByIdAndUpdate(id, updateCompanyDto, { new: true }).exec();
        if (!updatedCompany) {
            throw new NotFoundException(`Company with ID ${id} not found`);
        }
        return updatedCompany;
    }

    // Method untuk mendapatkan semua perusahaan (untuk keperluan admin)
    async findAll(): Promise<CompanyDocument[]> {
        return this.companyModel.find().exec();
    }

    // Method untuk mendapatkan perusahaan berdasarkan ID
    async findById(id: string): Promise<CompanyDocument> {
        if (!Types.ObjectId.isValid(id)) {
            throw new NotFoundException(`Invalid company ID: ${id}`);
        }
        const company = await this.companyModel.findById(id).exec();
        if (!company) {
            throw new NotFoundException(`Company with ID ${id} not found`);
        }
        return company;
    }
}