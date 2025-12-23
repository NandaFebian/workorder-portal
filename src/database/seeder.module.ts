import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { DatabaseSeederService } from './database-seeder.service';

// Import schemas
import { Company, CompanySchema } from '../company/schemas/company.schemas';
import { Position, PositionSchema } from '../positions/schemas/position.schema';
import { User, UserSchema } from '../users/schemas/user.schema';
import { FormTemplate, FormTemplateSchema } from '../form/schemas/form-template.schema';
import { Service, ServiceSchema } from '../service/schemas/service.schema';
import { MembershipCode, MembershipCodeSchema } from '../membership/schemas/membership.schema';

/**
 * Seeder Module
 * Module khusus untuk database seeding
 * Tidak di-import di AppModule, digunakan via CLI script
 */
@Module({
    imports: [
        MongooseModule.forFeature([
            { name: Company.name, schema: CompanySchema },
            { name: Position.name, schema: PositionSchema },
            { name: User.name, schema: UserSchema },
            { name: FormTemplate.name, schema: FormTemplateSchema },
            { name: Service.name, schema: ServiceSchema },
            { name: MembershipCode.name, schema: MembershipCodeSchema },
        ]),
    ],
    providers: [DatabaseSeederService],
    exports: [DatabaseSeederService],
})
export class SeederModule { }
