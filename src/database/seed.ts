import { NestFactory } from '@nestjs/core';
import { SeederModule } from './seeder.module';
import { DatabaseSeederService } from './database-seeder.service';

async function bootstrap() {
  // Membuat context aplikasi independen (standalone)
  const app = await NestFactory.createApplicationContext(SeederModule);

  // Ambil instance service seeder dari context
  const seeder = app.get(DatabaseSeederService);

  try {
    // Eksekusi fungsi seeding
    await seeder.seed();
  } catch (error) {
    console.error('Terjadi kesalahan saat proses seeding:', error);
  } finally {
    // Tutup koneksi agar proses node berhenti dengan sendirinya
    await app.close();
  }
}

bootstrap();
