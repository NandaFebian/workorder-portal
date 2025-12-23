import { NestFactory } from '@nestjs/core';
import { Module, Logger } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { SeederModule } from './seeder.module';
import { DatabaseSeederService } from './database-seeder.service';

/**
 * CLI Script untuk Database Seeding
 * 
 * Usage:
 * - npm run seed              -> Seed all data
 * - npm run seed:clear        -> Clear all seeded data
 * - npm run seed:status       -> Check seeding status
 */

// Create root module for seeder
@Module({
    imports: [
        ConfigModule.forRoot({
            isGlobal: true,
            envFilePath: '.env',
        }),
        MongooseModule.forRootAsync({
            imports: [ConfigModule],
            useFactory: async (configService: ConfigService) => ({
                uri: configService.get<string>('MONGO_URI') || 'mongodb://localhost:27017/workorder',
            }),
            inject: [ConfigService],
        }),
        SeederModule,
    ],
})
class SeederAppModule { }

async function bootstrap() {
    const logger = new Logger('Seeder');

    // Get command from args
    const command = process.argv[2] || 'seed';

    try {
        // Create standalone NestJS app
        const app = await NestFactory.createApplicationContext(SeederAppModule);

        const seeder = app.get(DatabaseSeederService);

        // Execute command
        switch (command) {
            case 'seed':
                logger.log('🌱 Executing: Seed All');
                await seeder.seedAll();
                break;

            case 'clear':
                logger.log('🗑️  Executing: Clear All');
                await seeder.clearAll();
                break;

            case 'status':
                logger.log('📊 Executing: Get Status');
                const status = await seeder.getStatus();
                console.log('\n📊 Seeding Status:');
                console.log('==================');
                console.log(`Overall:        ${status.overall.seeded}/${status.overall.total} (${status.overall.percentage.toFixed(0)}%)`);
                console.log(`Companies:      ${status.companies.seeded}/${status.companies.total} (${status.companies.percentage.toFixed(0)}%)`);
                console.log(`Positions:      ${status.positions.seeded}/${status.positions.total} (${status.positions.percentage.toFixed(0)}%)`);
                console.log(`Users:          ${status.users.seeded}/${status.users.total} (${status.users.percentage.toFixed(0)}%)`);
                console.log(`Form Templates: ${status.formTemplates.seeded}/${status.formTemplates.total} (${status.formTemplates.percentage.toFixed(0)}%)`);
                console.log(`Services:       ${status.services.seeded}/${status.services.total} (${status.services.percentage.toFixed(0)}%)`);
                console.log(`Memberships:    ${status.membershipCodes.seeded}/${status.membershipCodes.total} (${status.membershipCodes.percentage.toFixed(0)}%)`);
                console.log('==================\n');
                break;

            default:
                logger.error(`Unknown command: ${command}`);
                logger.log('Available commands: seed, clear, status');
                process.exit(1);
        }

        await app.close();
        logger.log('✅ Done!');
        process.exit(0);

    } catch (error) {
        logger.error('❌ Error:', error.message);
        logger.error(error.stack);
        process.exit(1);
    }
}

bootstrap();
