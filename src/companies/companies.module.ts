import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Company, CompanySchema } from '../schemas/company.schemas';
import { CompaniesService } from './companies.service';

@Module({
    imports: [
        MongooseModule.forFeature([{ name: Company.name, schema: CompanySchema }]),
    ],
    providers: [CompaniesService],
    exports: [CompaniesService], // Ekspor agar bisa dipakai di AuthModule
})
export class CompaniesModule { }