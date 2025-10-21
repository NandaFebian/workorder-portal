// src/common/filters/http-exception.filter.ts
import { ExceptionFilter, Catch, ArgumentsHost, HttpException, HttpStatus } from '@nestjs/common';
import { Response } from 'express';

@Catch(HttpException)
export class HttpExceptionFilter implements ExceptionFilter {
    catch(exception: HttpException, host: ArgumentsHost) {
        const ctx = host.switchToHttp();
        const response = ctx.getResponse<Response>();
        const status = exception.getStatus();
        const exceptionResponse = exception.getResponse(); // Ini adalah payload dari HttpException

        let responseMessage: string = exception.message; // Ganti nama variabel agar tidak konflik
        let detailErrors: any;

        // Cek jika payload adalah objek
        if (typeof exceptionResponse === 'object' && exceptionResponse !== null) {
            const res = exceptionResponse as { message?: string | string[], code?: string, errors?: any };

            // --- PERBAIKAN DI SINI ---
            // Jika res.message ada, proses. Jika tidak, gunakan exception.message
            if (res.message) {
                // Jika res.message adalah array, gabungkan; jika string, gunakan langsung
                responseMessage = Array.isArray(res.message) ? res.message.join(', ') : res.message;
            }
            // ------------------------

            detailErrors = res.errors || undefined;
        }

        // Kirim respons JSON
        response
            .status(status)
            .json({
                success: false,
                statusCode: status,
                message: responseMessage, // Gunakan variabel yang sudah diproses
                ...(detailErrors && { errors: detailErrors }),
                timestamp: new Date().toISOString(),
            });
    }
}