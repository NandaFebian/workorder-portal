import {
  INestApplication,
  ValidationPipe,
  BadRequestException,
} from '@nestjs/common';
import { ValidationError } from 'class-validator';
import { ResponseInterceptor } from './common/interceptors/response.interceptor';
import { HttpExceptionFilter } from './common/filters/http-exception.filter';

export function setupApp(app: INestApplication) {
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
      exceptionFactory: (errors: ValidationError[]) => {
        const fieldMap = new Map<string, string[]>();

        const flattenErrors = (validationErrors: ValidationError[]) => {
          for (const error of validationErrors) {
            if (error.constraints) {
              const msgs = Object.values(error.constraints);
              if (fieldMap.has(error.property)) {
                fieldMap.get(error.property)!.push(...msgs);
              } else {
                fieldMap.set(error.property, [...msgs]);
              }
            }
            if (error.children && error.children.length > 0) {
              flattenErrors(error.children);
            }
          }
        };

        flattenErrors(errors);

        const combinedErrors: Record<string, string> = {};
        for (const [key, value] of fieldMap.entries()) {
          combinedErrors[key] = value.join('\n');
        }

        const formattedErrors = {
          field: Object.keys(combinedErrors).length > 0 ? [combinedErrors] : [],
        };

        return new BadRequestException({
          message: 'Validation failed',
          code: 'VALIDATION_ERROR',
          errors: formattedErrors,
        });
      },
    }),
  );

  app.enableCors({
    origin: '*',
    methods: 'GET,POST,PUT,PATCH,DELETE,OPTIONS',
    credentials: false,
  });

  app.useGlobalInterceptors(new ResponseInterceptor());
  app.useGlobalFilters(new HttpExceptionFilter());
}
