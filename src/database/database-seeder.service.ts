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
    @InjectModel(CompanyType.name)
    private readonly companyTypeModel: Model<CompanyType>,
    @InjectModel(ServiceTemplate.name)
    private readonly serviceTemplateModel: Model<ServiceTemplate>,
  ) {}

  async seed() {
    this.logger.log('Memulai proses seeding database...');

    await this.seedCompanyTypes();
    await this.seedServiceTemplates();

    this.logger.log('Proses seeding berhasil diselesaikan!');
  }

  private async seedCompanyTypes() {
    const deletedCount = await this.companyTypeModel.deleteMany({});
    this.logger.log(
      `[CompanyType] ${deletedCount.deletedCount} data lama dihapus.`,
    );

    await this.companyTypeModel.insertMany(companyTypesData);
    this.logger.log(
      `[CompanyType] ${companyTypesData.length} data baru berhasil di-insert.`,
    );
  }

  private async seedServiceTemplates() {
    const deletedCount = await this.serviceTemplateModel.deleteMany({});
    this.logger.log(
      `[ServiceTemplate] ${deletedCount.deletedCount} data lama dihapus.`,
    );

    await this.serviceTemplateModel.insertMany(serviceTemplatesData);
    this.logger.log(
      `[ServiceTemplate] ${serviceTemplatesData.length} data baru berhasil di-insert.`,
    );
  }
}
