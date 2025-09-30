import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe, BadRequestException } from '@nestjs/common';
import { ValidationError } from 'class-validator';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      // exceptionFactory adalah "pabrik" untuk membuat format error kustom
      exceptionFactory: (errors: ValidationError[]) => {
        const formattedErrors = errors.map((error) => ({
          field: error.property,
          // Mengambil pesan error pertama dari daftar constraints
          message: error.constraints ? Object.values(error.constraints)[0] : 'Unknown validation error',
        }));

        // Mengembalikan exception dengan format yang Anda inginkan
        return new BadRequestException({
          message: 'Validation failed',
          code: 'VALIDATION_ERROR',
          errors: formattedErrors,
        });
      },
    }),
  );

  await app.listen(process.env.PORT ?? 3000);
}
bootstrap();