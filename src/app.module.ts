// src/app.module.ts
import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { MongooseModule } from '@nestjs/mongoose';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { CompaniesModule } from './company/companies.module';
import { PositionsModule } from './positions/positions.module';
import { FormModule } from './form/form.module';
import { ServicesModule } from './service/services.module';

@Module({
  imports: [
    MongooseModule.forRoot('mongodb+srv://nandafebian_db_user:nanda123@work-order.qyzazlz.mongodb.net/work_order?retryWrites=true&w=majority&appName=work-order'),
    AuthModule,
    UsersModule,
    CompaniesModule,
    PositionsModule,
    FormModule,
    ServicesModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule { }