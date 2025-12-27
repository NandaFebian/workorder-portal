// src/common/filters/http-exception.filter.ts
import { ExceptionFilter, Catch, ArgumentsHost, HttpException, HttpStatus } from '@nestjs/common';
import { Request, Response } from 'express';

/**
 * Standard error response interface
 */
export interface StandardErrorResponse {
    code: number;
    timestamp: string;
    path: string;
    message: string;
    errors?: any;
}

@Catch()
export class HttpExceptionFilter implements ExceptionFilter {
    catch(exception: unknown, host: ArgumentsHost) {
        const ctx = host.switchToHttp();
        const response = ctx.getResponse<Response>();
        const request = ctx.getRequest<Request>();

        // Default to Internal Server Error
        let status = HttpStatus.INTERNAL_SERVER_ERROR;
        let responseMessage: string = 'Internal server error';
        let detailErrors: any = undefined;

        if (exception instanceof HttpException) {
            status = exception.getStatus();
            const exceptionResponse = exception.getResponse();
            responseMessage = exception.message;

            if (typeof exceptionResponse === 'object' && exceptionResponse !== null) {
                const res = exceptionResponse as { message?: string | string[], errors?: any };

                if (res.message) {
                    responseMessage = Array.isArray(res.message) ? res.message.join(', ') : res.message;
                }

                if (res.errors) {
                    detailErrors = res.errors;
                }
            }
        } else if ((exception as any).name === 'CastError' && (exception as any).kind === 'ObjectId') {
            // Mongoose CastError
            status = HttpStatus.BAD_REQUEST;
            responseMessage = 'Invalid ID format';
        } else if (exception instanceof Error) {
            responseMessage = exception.message;
            // In production, might want to hide internal error details
        }

        const errorResponse: StandardErrorResponse = {
            code: status,
            timestamp: new Date().toISOString(),
            path: request.url,
            message: responseMessage
        };

        if (detailErrors) {
            errorResponse.errors = detailErrors;
        }

        response
            .status(status)
            .json(errorResponse);
    }
}