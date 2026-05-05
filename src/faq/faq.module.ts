// src/faq/faq.module.ts
import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { MongooseModule } from '@nestjs/mongoose';
import { ConfigModule } from '@nestjs/config';
import { MulterModule } from '@nestjs/platform-express';
import { memoryStorage } from 'multer';

import { Company, CompanySchema } from 'src/company/schemas/company.schemas';
import { FaqProviderService } from './faq-provider.service';
import { FaqService } from './faq.service';
import { FaqController } from './faq.controller';
import { FaqPublicController } from './faq-public.controller';
import { AuthModule } from 'src/auth/auth.module';

@Module({
  imports: [
    ConfigModule,
    HttpModule.register({
      timeout: 30000,        // 30s — PDF uploads can be slow
      maxRedirects: 3,
    }),
    MongooseModule.forFeature([
      { name: Company.name, schema: CompanySchema },
    ]),
    MulterModule.register({ storage: memoryStorage() }),
    AuthModule,
  ],
  controllers: [FaqController, FaqPublicController],
  providers: [FaqProviderService, FaqService],
  exports: [FaqService],
})
export class FaqModule {}
