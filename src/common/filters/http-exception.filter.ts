// src/common/filters/http-exception.filter.ts
import { ExceptionFilter, Catch, ArgumentsHost, HttpException, HttpStatus } from '@nestjs/common';
import { Response } from 'express';

@Catch()
export class HttpExceptionFilter implements ExceptionFilter {
    catch(exception: unknown, host: ArgumentsHost) {
        const ctx = host.switchToHttp();
        const response = ctx.getResponse<Response>();

        // Default to Internal Server Error
        let status = HttpStatus.INTERNAL_SERVER_ERROR;
        let responseMessage: string = 'Internal server error';
        let responseCode: string = 'INTERNAL_SERVER_ERROR';
        let detailErrors: any = undefined;

        if (exception instanceof HttpException) {
            status = exception.getStatus();
            const exceptionResponse = exception.getResponse();
            responseMessage = exception.message;
            responseCode = `HTTP_${status}`;

            if (typeof exceptionResponse === 'object' && exceptionResponse !== null) {
                const res = exceptionResponse as { message?: string | string[], code?: string, errors?: any };

                if (res.message) {
                    responseMessage = Array.isArray(res.message) ? res.message.join(', ') : res.message;
                }

                if (res.code) {
                    responseCode = res.code;
                }

                if (res.errors) {
                    detailErrors = res.errors;
                }
            }
        } else if ((exception as any).name === 'CastError' && (exception as any).kind === 'ObjectId') {
            // Mongoose CastError
            status = HttpStatus.BAD_REQUEST;
            responseMessage = 'Invalid ID format';
            responseCode = 'INVALID_ID_FORMAT';
        } else if (exception instanceof Error) {
            responseMessage = exception.message;
            // In production, might want to hide internal error details, but for now keeping message as per typical debug needs.
        }

        const finalResponse: any = {
            message: responseMessage,
            code: responseCode
        };

        if (detailErrors) {
            finalResponse.errors = detailErrors;
        }

        response
            .status(status)
            .json(finalResponse);
    }
}