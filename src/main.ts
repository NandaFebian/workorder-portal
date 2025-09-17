import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common'; // 1. Import ValidationPipe

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // 2. Tambahkan baris ini
  app.useGlobalPipes(new ValidationPipe({
    whitelist: true, // Abaikan properti yang tidak ada di DTO
    forbidNonWhitelisted: true, // Lemparkan error jika ada properti yang tidak seharusnya
  }));

  await app.listen(process.env.PORT ?? 3000);
}
bootstrap();