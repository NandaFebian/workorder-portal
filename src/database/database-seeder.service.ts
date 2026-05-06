import { Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { CompanyType } from '../template/schemas/company-type.schema';
import { ServiceTemplate } from '../template/schemas/service-template.schema';
import { companyTypesData, serviceTemplatesData } from './seed-data.config';

@Injectable()
export class DatabaseSeederService {
    private readonly logger = new Logger(DatabaseSeederService.name);

    constructor(
        @InjectModel(CompanyType.name) private readonly companyTypeModel: Model<CompanyType>,
        @InjectModel(ServiceTemplate.name) private readonly serviceTemplateModel: Model<ServiceTemplate>,
    ) { }

    async seed() {
        this.logger.log('Memulai proses seeding database...');

        await this.seedCompanyTypes();
        await this.seedServiceTemplates();

        this.logger.log('Proses seeding berhasil diselesaikan!');
    }

    private async seedCompanyTypes() {
        for (const data of companyTypesData) {
            // Update jika ada, atau buat baru jika belum ada
            await this.companyTypeModel.findOneAndUpdate(
                { name: data.name },
                { $set: data },
                { upsert: true, new: true }
            ).exec();
            this.logger.log(`[CompanyType] Berhasil di-upsert: ${data.name}`);
        }
    }

    private async seedServiceTemplates() {
        for (const data of serviceTemplatesData) {
            // Update jika ada, atau buat baru jika belum ada
            await this.serviceTemplateModel.findOneAndUpdate(
                { title: data.title, companyTypeId: data.companyTypeId },
                { $set: data },
                { upsert: true, new: true }
            ).exec();
            this.logger.log(`[ServiceTemplate] Berhasil di-upsert: ${data.title}`);
        }
    }
}