import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { TemplateController } from './template.controller';
import { TemplateService } from './template.service';
import { CompanyType, CompanyTypeSchema } from './schemas/company-type.schema';
import { ServiceTemplate, ServiceTemplateSchema } from './schemas/service-template.schema';
import { FormModule } from '../form/form.module';
import { ServicesModule } from '../service/services.module';
import { PositionsModule } from '../positions/positions.module';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: CompanyType.name, schema: CompanyTypeSchema },
      { name: ServiceTemplate.name, schema: ServiceTemplateSchema },
    ]),
    FormModule,
    ServicesModule,
    PositionsModule,
  ],
  controllers: [TemplateController],
  providers: [TemplateService],
})
export class TemplateModule {}
