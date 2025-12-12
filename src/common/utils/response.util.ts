import { ApiResponse, ApiErrorResponse } from '../interfaces/response.interface';

/**
 * Response Utility Class
 * Menyediakan helper methods untuk membuat standardized API responses
 * 
 * Usage:
 * - Success: return ResponseUtil.success('Operation successful', data);
 * - Success with meta: return ResponseUtil.success('Registered', data, { welcome: true });
 * - Error: throw ResponseUtil.error('Validation failed', errors, 'VALIDATION_ERROR');
 */
export class ResponseUtil {
    /**
     * Create a standardized success response
     * @param message - Success message
     * @param data - Response data (optional)
     * @param meta - Additional metadata (optional)
     */
    static success<T>(message: string, data?: T, meta?: any): ApiResponse<T> {
        const response: ApiResponse<T> = {
            message,
        };

        if (data !== undefined) {
            response.data = data;
        }

        if (meta !== undefined) {
            response.meta = meta;
        }

        return response;
    }

    /**
     * Create a standardized error response
     * @param message - Error message
     * @param errors - Validation errors keyed by field name (optional)
     * @param code - Error code (optional)
     */
    static error(
        message: string,
        errors?: Record<string, string[]>,
        code?: string,
    ): ApiErrorResponse {
        const response: ApiErrorResponse = {
            message,
        };

        if (errors !== undefined) {
            response.errors = errors;
        }

        if (code !== undefined) {
            response.code = code;
        }

        return response;
    }
}
