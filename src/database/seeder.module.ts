import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { CoreModule } from '../core/core.module';
import { DatabaseSeederService } from './database-seeder.service';

// Import schemas
import { CompanyType, CompanyTypeSchema } from '../template/schemas/company-type.schema';
import { ServiceTemplate, ServiceTemplateSchema } from '../template/schemas/service-template.schema';

/**
 * Seeder Module
 * Module khusus untuk database seeding
 * Menggunakan CoreModule untuk koneksi database dan config
 */
@Module({
    imports: [
        CoreModule,
        MongooseModule.forFeature([
            { name: CompanyType.name, schema: CompanyTypeSchema },
            { name: ServiceTemplate.name, schema: ServiceTemplateSchema },
        ]),
    ],
    providers: [DatabaseSeederService],
    exports: [DatabaseSeederService],
})
export class SeederModule { }