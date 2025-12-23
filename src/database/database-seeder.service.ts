import { Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { SeedDataConfig, SEED_IDS } from './seed-data.config';

// Schemas
import { Company, CompanyDocument } from '../company/schemas/company.schemas';
import { Position, PositionDocument } from '../positions/schemas/position.schema';
import { User, UserDocument } from '../users/schemas/user.schema';
import { FormTemplate, FormTemplateDocument } from '../form/schemas/form-template.schema';
import { Service, ServiceDocument } from '../service/schemas/service.schema';
import { MembershipCode, MembershipCodeDocument } from '../membership/schemas/membership.schema';

/**
 * Database Seeder Service
 * Populates database with comprehensive interconnected sample data
 * 
 * FEATURES:
 * - Dependency-aware seeding (correct order)
 * - Idempotent (can run multiple times safely)
 * - Progress logging
 * - Error handling
 * - Realistic sample data for testing all modules
 */
@Injectable()
export class DatabaseSeederService {
    private readonly logger = new Logger(DatabaseSeederService.name);

    constructor(
        @InjectModel(Company.name) private companyModel: Model<CompanyDocument>,
        @InjectModel(Position.name) private positionModel: Model<PositionDocument>,
        @InjectModel(User.name) private userModel: Model<UserDocument>,
        @InjectModel(FormTemplate.name) private formTemplateModel: Model<FormTemplateDocument>,
        @InjectModel(Service.name) private serviceModel: Model<ServiceDocument>,
        @InjectModel(MembershipCode.name) private membershipCodeModel: Model<MembershipCodeDocument>,
    ) { }

    /**
     * Seed all entities in correct dependency order
     */
    async seedAll(): Promise<void> {
        this.logger.log('🌱 Starting comprehensive database seeding...');
        this.logger.log('=====================================');

        try {
            // Seed in dependency order
            await this.seedCompanies();
            await this.seedPositions();
            await this.seedUsers();
            await this.seedFormTemplates();
            await this.seedServices();
            await this.seedMembershipCodes();

            this.logger.log('=====================================');
            this.logger.log('✅ Database seeding completed successfully!');
            this.logger.log('');
            this.logger.log('📧 Test Credentials:');
            this.logger.log('   Admin: admin@system.com / password123');
            this.logger.log('   TekMaju Owner: budi@tekmaju.co.id / password123');
            this.logger.log('   TekMaju Manager: siti@tekmaju.co.id / password123');
            this.logger.log('   TekMaju Staff: ahmad@tekmaju.co.id / password123');
            this.logger.log('   Freelancer: andi@freelance.com / password123');
            this.logger.log('');
            this.logger.log('🎫 Membership Codes:');
            this.logger.log('   TEKMAJU2024 - For TekMaju Field Engineer');
            this.logger.log('   SOLUSI2024 - For Solusi Digital Developer');

        } catch (error) {
            this.logger.error('❌ Database seeding failed:', error.message);
            this.logger.error(error.stack);
            throw error;
        }
    }

    /**
     * Seed Companies
     */
    async seedCompanies(): Promise<void> {
        this.logger.log('📦 Seeding Companies...');

        const existingCount = await this.companyModel.countDocuments({
            _id: { $in: SeedDataConfig.companies.map(c => c._id) }
        });

        if (existingCount > 0) {
            this.logger.warn(`   ⚠️  ${existingCount} companies already exist, skipping...`);
            return;
        }

        await this.companyModel.insertMany(SeedDataConfig.companies);
        this.logger.log(`   ✅ Seeded ${SeedDataConfig.companies.length} companies`);
        SeedDataConfig.companies.forEach(c => {
            this.logger.log(`      - ${c.name}`);
        });
    }

    /**
     * Seed Positions
     */
    async seedPositions(): Promise<void> {
        this.logger.log('📦 Seeding Positions...');

        const existingCount = await this.positionModel.countDocuments({
            _id: { $in: SeedDataConfig.positions.map(p => p._id) }
        });

        if (existingCount > 0) {
            this.logger.warn(`   ⚠️  ${existingCount} positions already exist, skipping...`);
            return;
        }

        await this.positionModel.insertMany(SeedDataConfig.positions);
        this.logger.log(`   ✅ Seeded ${SeedDataConfig.positions.length} positions`);
        SeedDataConfig.positions.forEach(p => {
            this.logger.log(`      - ${p.name}`);
        });
    }

    /**
     * Seed Users (all roles)
     */
    async seedUsers(): Promise<void> {
        this.logger.log('📦 Seeding Users...');

        const existingCount = await this.userModel.countDocuments({
            _id: { $in: SeedDataConfig.users.map(u => u._id) }
        });

        if (existingCount > 0) {
            this.logger.warn(`   ⚠️  ${existingCount} users already exist, skipping...`);
            return;
        }

        // Passwords already hashed in seed-data.config.ts
        await this.userModel.insertMany(SeedDataConfig.users);
        this.logger.log(`   ✅ Seeded ${SeedDataConfig.users.length} users`);

        // Group by role
        const roles = {
            admin: SeedDataConfig.users.filter(u => u.role === 'admin').length,
            owner_company: SeedDataConfig.users.filter(u => u.role === 'owner_company').length,
            manager_company: SeedDataConfig.users.filter(u => u.role === 'manager_company').length,
            staff_company: SeedDataConfig.users.filter(u => u.role === 'staff_company').length,
            staff_unassigned: SeedDataConfig.users.filter(u => u.role === 'staff_unassigned').length,
        };

        this.logger.log(`      - ${roles.admin} Admin`);
        this.logger.log(`      - ${roles.owner_company} Company Owners`);
        this.logger.log(`      - ${roles.manager_company} Company Managers`);
        this.logger.log(`      - ${roles.staff_company} Company Staff`);
        this.logger.log(`      - ${roles.staff_unassigned} Freelancers`);
    }

    /**
     * Seed Form Templates
     */
    async seedFormTemplates(): Promise<void> {
        this.logger.log('📦 Seeding Form Templates...');

        const existingCount = await this.formTemplateModel.countDocuments({
            formKey: { $in: SeedDataConfig.formTemplates.map(f => f.formKey) }
        });

        if (existingCount > 0) {
            this.logger.warn(`   ⚠️  ${existingCount} form templates already exist, skipping...`);
            return;
        }

        await this.formTemplateModel.insertMany(SeedDataConfig.formTemplates);
        this.logger.log(`   ✅ Seeded ${SeedDataConfig.formTemplates.length} form templates`);
        SeedDataConfig.formTemplates.forEach(f => {
            this.logger.log(`      - ${f.title} (${f.fields.length} fields)`);
        });
    }

    /**
     * Seed Services
     */
    async seedServices(): Promise<void> {
        this.logger.log('📦 Seeding Services...');

        const existingCount = await this.serviceModel.countDocuments({
            _id: { $in: SeedDataConfig.services.map(s => s._id) }
        });

        if (existingCount > 0) {
            this.logger.warn(`   ⚠️  ${existingCount} services already exist, skipping...`);
            return;
        }

        await this.serviceModel.insertMany(SeedDataConfig.services);
        this.logger.log(`   ✅ Seeded ${SeedDataConfig.services.length} services`);
        SeedDataConfig.services.forEach(s => {
            this.logger.log(`      - ${s.title} (${s.workOrderForms.length} work order forms)`);
        });
    }

    /**
     * Seed Membership Codes
     */
    async seedMembershipCodes(): Promise<void> {
        this.logger.log('📦 Seeding Membership Codes...');

        const existingCount = await this.membershipCodeModel.countDocuments({
            _id: { $in: SeedDataConfig.membershipCodes.map(m => m._id) }
        });

        if (existingCount > 0) {
            this.logger.warn(`   ⚠️  ${existingCount} membership codes already exist, skipping...`);
            return;
        }

        await this.membershipCodeModel.insertMany(SeedDataConfig.membershipCodes);
        this.logger.log(`   ✅ Seeded ${SeedDataConfig.membershipCodes.length} membership codes`);
        SeedDataConfig.membershipCodes.forEach(m => {
            this.logger.log(`      - ${m.code} (${m.isClaimed ? 'claimed' : 'available'})`);
        });
    }

    /**
     * Clear all seeded data (DANGEROUS!)
     */
    async clearAll(): Promise<void> {
        this.logger.warn('🗑️  Clearing all seeded data...');
        this.logger.warn('=====================================');

        try {
            // Delete in reverse dependency order
            await this.membershipCodeModel.deleteMany({
                _id: { $in: SeedDataConfig.membershipCodes.map(m => m._id) }
            });
            this.logger.log('   ✅ Cleared membership codes');

            await this.serviceModel.deleteMany({
                _id: { $in: SeedDataConfig.services.map(s => s._id) }
            });
            this.logger.log('   ✅ Cleared services');

            await this.formTemplateModel.deleteMany({
                formKey: { $in: SeedDataConfig.formTemplates.map(f => f.formKey) }
            });
            this.logger.log('   ✅ Cleared form templates');

            await this.userModel.deleteMany({
                _id: { $in: SeedDataConfig.users.map(u => u._id) }
            });
            this.logger.log('   ✅ Cleared users');

            await this.positionModel.deleteMany({
                _id: { $in: SeedDataConfig.positions.map(p => p._id) }
            });
            this.logger.log('   ✅ Cleared positions');

            await this.companyModel.deleteMany({
                _id: { $in: SeedDataConfig.companies.map(c => c._id) }
            });
            this.logger.log('   ✅ Cleared companies');

            this.logger.warn('=====================================');
            this.logger.log('✅ All seeded data cleared!');
        } catch (error) {
            this.logger.error('❌ Failed to clear data:', error.message);
            throw error;
        }
    }

    /**
     * Get seeding status
     */
    async getStatus(): Promise<any> {
        const companiesCount = await this.companyModel.countDocuments({
            _id: { $in: SeedDataConfig.companies.map(c => c._id) }
        });

        const positionsCount = await this.positionModel.countDocuments({
            _id: { $in: SeedDataConfig.positions.map(p => p._id) }
        });

        const usersCount = await this.userModel.countDocuments({
            _id: { $in: SeedDataConfig.users.map(u => u._id) }
        });

        const formTemplatesCount = await this.formTemplateModel.countDocuments({
            formKey: { $in: SeedDataConfig.formTemplates.map(f => f.formKey) }
        });

        const servicesCount = await this.serviceModel.countDocuments({
            _id: { $in: SeedDataConfig.services.map(s => s._id) }
        });

        const membershipCodesCount = await this.membershipCodeModel.countDocuments({
            _id: { $in: SeedDataConfig.membershipCodes.map(m => m._id) }
        });

        const totalSeeded = companiesCount + positionsCount + usersCount +
            formTemplatesCount + servicesCount + membershipCodesCount;
        const totalExpected = SeedDataConfig.companies.length +
            SeedDataConfig.positions.length +
            SeedDataConfig.users.length +
            SeedDataConfig.formTemplates.length +
            SeedDataConfig.services.length +
            SeedDataConfig.membershipCodes.length;

        return {
            overall: {
                seeded: totalSeeded,
                total: totalExpected,
                percentage: (totalSeeded / totalExpected) * 100,
            },
            companies: {
                seeded: companiesCount,
                total: SeedDataConfig.companies.length,
                percentage: (companiesCount / SeedDataConfig.companies.length) * 100,
            },
            positions: {
                seeded: positionsCount,
                total: SeedDataConfig.positions.length,
                percentage: (positionsCount / SeedDataConfig.positions.length) * 100,
            },
            users: {
                seeded: usersCount,
                total: SeedDataConfig.users.length,
                percentage: (usersCount / SeedDataConfig.users.length) * 100,
            },
            formTemplates: {
                seeded: formTemplatesCount,
                total: SeedDataConfig.formTemplates.length,
                percentage: (formTemplatesCount / SeedDataConfig.formTemplates.length) * 100,
            },
            services: {
                seeded: servicesCount,
                total: SeedDataConfig.services.length,
                percentage: (servicesCount / SeedDataConfig.services.length) * 100,
            },
            membershipCodes: {
                seeded: membershipCodesCount,
                total: SeedDataConfig.membershipCodes.length,
                percentage: (membershipCodesCount / SeedDataConfig.membershipCodes.length) * 100,
            },
        };
    }
}
