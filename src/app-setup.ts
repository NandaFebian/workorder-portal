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

        const buildPath = (parentPath: string, property: string): string => {
          if (!parentPath) return property;
          if (!isNaN(Number(property))) {
            return `${parentPath}[${property}]`;
          }
          return `${parentPath}.${property}`;
        };

        const flattenErrors = (validationErrors: ValidationError[], parentPath = '') => {
          for (const error of validationErrors) {
            const currentPath = buildPath(parentPath, error.property);
            if (error.constraints) {
              const msgs = Object.values(error.constraints);
              if (fieldMap.has(currentPath)) {
                fieldMap.get(currentPath)!.push(...msgs);
              } else {
                fieldMap.set(currentPath, [...msgs]);
              }
            }
            if (error.children && error.children.length > 0) {
              flattenErrors(error.children, currentPath);
            }
          }
        };

        flattenErrors(errors);

        const fieldArray = Array.from(fieldMap.entries()).map(([key, value]) => ({
          [key]: value.join('\n'),
        }));

        const formattedErrors = {
          field: fieldArray,
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
