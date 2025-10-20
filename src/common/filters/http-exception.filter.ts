// src/common/filters/http-exception.filter.ts
import { ExceptionFilter, Catch, ArgumentsHost, HttpException, HttpStatus } from '@nestjs/common';
import { Response } from 'express';

@Catch(HttpException)
export class HttpExceptionFilter implements ExceptionFilter {
    catch(exception: HttpException, host: ArgumentsHost) {
        const ctx = host.switchToHttp();
        const response = ctx.getResponse<Response>();
        const status = exception.getStatus();
        const exceptionResponse = exception.getResponse();

        let message = exception.message;
        let errors: any;

        if (typeof exceptionResponse === 'object' && exceptionResponse !== null) {
            const res = exceptionResponse as { message: string | string[], error: any };
            message = Array.isArray(res.message) ? res.message.join(', ') : res.message;
            errors = res.error || undefined;
        }

        response
            .status(status)
            .json({
                success: false,
                statusCode: status,
                message: message,
                ...(errors && { errors }),
                timestamp: new Date().toISOString(),
            });
    }
}