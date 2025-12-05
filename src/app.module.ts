import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { FormModule } from './form/form.module';
import { CoreModule } from './core/core.module';
import { OperationsModule } from './operations/operations.module';
import { OrganizationModule } from './organization/organization.module';

@Module({
  imports: [
    CoreModule,
    AuthModule,
    UsersModule,
    OrganizationModule,
    FormModule,
    OperationsModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule { }