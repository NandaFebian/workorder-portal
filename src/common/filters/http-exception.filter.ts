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

        let responseMessage: string = exception.message;
        let detailErrors: any;

        if (typeof exceptionResponse === 'object' && exceptionResponse !== null) {
            const res = exceptionResponse as { message?: string | string[], code?: string, errors?: any };

            if (res.message) {
                responseMessage = Array.isArray(res.message) ? res.message.join(', ') : res.message;
            }

            detailErrors = res.errors || undefined;
        }

        response
            .status(status)
            .json({
                success: false,
                statusCode: status,
                message: responseMessage,
                ...(detailErrors && { errors: detailErrors }),
                timestamp: new Date().toISOString(),
            });
    }
}