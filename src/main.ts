import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe, BadRequestException } from '@nestjs/common';
import { ValidationError } from 'class-validator';
import { ResponseInterceptor } from './common/interceptors/response.interceptor';
import { HttpExceptionFilter } from './common/filters/http-exception.filter';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
      exceptionFactory: (errors: ValidationError[]) => {
        const formattedErrors = errors.map((error) => ({
          field: error.property,
          message: error.constraints
            ? Object.values(error.constraints)[0]
            : 'Unknown validation error',
        }));

        return new BadRequestException({
          message: 'Validation failed',
          code: 'VALIDATION_ERROR',
          errors: formattedErrors,
        });
      },
    }),
  );

  app.useGlobalInterceptors(new ResponseInterceptor());
  app.useGlobalFilters(new HttpExceptionFilter());

  // Hanya jalankan app.listen() di sini
  // Port bisa diambil dari environment variable jika perlu
  await app.listen(process.env.PORT || 3000);
  console.log(`Application is running on: ${await app.getUrl()}`);
}

// Hanya panggil bootstrap
bootstrap();