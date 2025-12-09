import { INestApplication, ValidationPipe, BadRequestException } from '@nestjs/common';
import { ValidationError } from 'class-validator';
import { ResponseInterceptor } from './common/interceptors/response.interceptor';
import { HttpExceptionFilter } from './common/filters/http-exception.filter';

export function setupApp(app: INestApplication) {
    app.useGlobalPipes(
        new ValidationPipe({
            whitelist: true,
            transform: true,
            exceptionFactory: (errors: ValidationError[]) => {
                const formattedErrors = errors.reduce((acc, error) => {
                    const constraints = error.constraints
                        ? Object.values(error.constraints)
                        : ['Unknown validation error'];

                    if (!acc.field) {
                        acc.field = [];
                    }

                    constraints.forEach(constraint => {
                        acc.field.push({ [error.property]: constraint });
                    });

                    return acc;
                }, {} as any);

                return new BadRequestException({
                    message: 'Validation failed',
                    code: 'VALIDATION_ERROR',
                    errors: formattedErrors,
                });
            },
        }),
    );

    app.enableCors({
        origin: "*",
        methods: "GET,POST,PUT,PATCH,DELETE,OPTIONS",
        credentials: false,
    });

    app.useGlobalInterceptors(new ResponseInterceptor());
    app.useGlobalFilters(new HttpExceptionFilter());
}
