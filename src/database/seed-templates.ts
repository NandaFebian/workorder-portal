import { NestFactory } from '@nestjs/core';
import { SeederModule } from './seeder.module';
import { DatabaseSeederService } from './database-seeder.service';

async function bootstrap() {
  console.log(
    'Mengeksekusi seeder khusus untuk CompanyType dan ServiceTemplate...',
  );
  const app = await NestFactory.createApplicationContext(SeederModule);
  const seeder = app.get(DatabaseSeederService);

  try {
    await seeder.seed();
  } catch (error) {
    console.error('Terjadi kesalahan saat proses seeding template:', error);
  } finally {
    await app.close();
  }
}

bootstrap();
