/**
 * Standard API Response Interface
 * Digunakan untuk semua success response di seluruh aplikasi
 */
export interface ApiResponse<T> {
    message: string;
    data?: T;
    meta?: any; // Optional untuk kasus khusus seperti welcome message
}

/**
 * Error Response Interface
 * Digunakan untuk error response dengan validation errors
 */
export interface ApiErrorResponse {
    message: string;
    errors?: Record<string, string[]>;
    code?: string;
}
