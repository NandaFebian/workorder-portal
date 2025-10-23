// src/main.ts
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe, BadRequestException } from '@nestjs/common'; // Impor diperlukan
import { ValidationError } from 'class-validator'; // Impor diperlukan
import { ResponseInterceptor } from './common/interceptors/response.interceptor';
import { HttpExceptionFilter } from './common/filters/http-exception.filter';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.useGlobalPipes(
    // Bagian inilah yang menangani validasi detail
    new ValidationPipe({
      whitelist: true,              // Abaikan properti tambahan
      //forbidNonWhitelisted: true,  // Tolak request jika ada properti tambahan
      transform: true,              // Otomatis transformasi DTO

      // Fungsi ini dijalankan ketika validasi gagal
      exceptionFactory: (errors: ValidationError[]) => {
        // 1. Memformat array error bawaan class-validator
        const formattedErrors = errors.map((error) => ({
          field: error.property, // Mendapatkan nama field yang error
          // Mendapatkan pesan error pertama untuk field tersebut
          message: error.constraints ? Object.values(error.constraints)[0] : 'Unknown validation error',
        }));

        // 2. Melemparkan BadRequestException dengan format error yang kita inginkan
        // Ini akan ditangkap oleh HttpExceptionFilter global Anda
        return new BadRequestException({
          message: 'Validation failed',
          code: 'VALIDATION_ERROR', // Kode error custom
          errors: formattedErrors, // Array error yang sudah diformat
        });
      },
    }),
  );

  app.useGlobalInterceptors(new ResponseInterceptor()); // Menangani format response sukses
  app.useGlobalFilters(new HttpExceptionFilter()); // Menangani format response error (termasuk dari ValidationPipe)

  await app.listen(process.env.PORT ?? 3000);
}
bootstrap();