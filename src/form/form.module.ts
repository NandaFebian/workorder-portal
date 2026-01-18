// src/forms/forms.module.ts
import { Module, forwardRef } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { FormsController } from './form.controller';
import { FormsService } from './form.service';
import { FormTemplate, FormTemplateSchema } from './schemas/form-template.schema';
import { FormSubmission, FormSubmissionSchema } from './schemas/form-submissions.schema';
import { AuthModule } from 'src/auth/auth.module';
import { UsersModule } from 'src/users/users.module';
import { CompaniesModule } from 'src/company/companies.module';

@Module({
    imports: [
        MongooseModule.forFeature([
            { name: FormTemplate.name, schema: FormTemplateSchema },
            { name: FormSubmission.name, schema: FormSubmissionSchema },
        ]),
        forwardRef(() => AuthModule),
        UsersModule,
        forwardRef(() => CompaniesModule),
    ],
    controllers: [FormsController],
    providers: [FormsService],
    exports: [FormsService],
})
export class FormModule { }