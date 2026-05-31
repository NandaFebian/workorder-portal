// src/faq/faq-provider.service.ts
import {
  Injectable,
  BadGatewayException,
  ServiceUnavailableException,
  Logger,
} from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { ConfigService } from '@nestjs/config';
import { firstValueFrom } from 'rxjs';
// eslint-disable-next-line @typescript-eslint/no-require-imports
const FormData = require('form-data') as typeof import('form-data');
import {
  ProviderRegisterResponse,
  ProviderGetDocsResponse,
  ProviderDocument,
  ProviderUploadTextResponse,
  ProviderAskResponse,
  ProviderHistoryItem,
  ProviderGetHistoryResponse,
} from './interfaces/faq-provider.interface';

/**
 * FaqProviderService
 * Pure HTTP client wrapper for the external FAQ chatbot service.
 * All business logic lives in FaqService; this service only handles transport.
 */
@Injectable()
export class FaqProviderService {
  private readonly logger = new Logger(FaqProviderService.name);
  private readonly baseUrl: string;

  constructor(
    private readonly httpService: HttpService,
    private readonly configService: ConfigService,
  ) {
    const url = this.configService.get<string>('FAQ_SERVICE_URL');
    if (!url) {
      throw new Error(
        'FAQ_SERVICE_URL is not configured in environment variables.',
      );
    }
    this.baseUrl = url;
  }

  // ─────────────────────────────────────────────────────────────
  // PRIVATE HELPERS
  // ─────────────────────────────────────────────────────────────

  private getHeaders(apiKey: string) {
    return { 'x-api-key': apiKey };
  }

  /**
   * Centralized error handler for external API calls.
   * Maps provider HTTP errors → NestJS exceptions.
   */
  private handleError(error: any, operation: string): never {
    if (error.response) {
      const status = error.response.status;
      const message =
        error.response.data?.message ??
        error.response.data?.detail ??
        'Unknown error from FAQ provider';

      this.logger.error(
        `[${operation}] Provider returned ${status}: ${message}`,
      );

      throw new BadGatewayException(`FAQ service error: ${message}`);
    }

    this.logger.error(`[${operation}] Network/timeout error: ${error.message}`);
    throw new ServiceUnavailableException(
      'FAQ service is currently unavailable',
    );
  }

  // ─────────────────────────────────────────────────────────────
  // PUBLIC API METHODS
  // ─────────────────────────────────────────────────────────────

  /**
   * Register a company with the external FAQ provider.
   * Called only once — returns the permanent API key to store.
   */
  async register(companyName: string): Promise<ProviderRegisterResponse> {
    try {
      const response = await firstValueFrom(
        this.httpService.post<ProviderRegisterResponse>(
          `${this.baseUrl}/faq/register`,
          { company_name: companyName },
        ),
      );
      return response.data;
    } catch (error) {
      this.handleError(error, 'register');
    }
  }

  /**
   * Upload a text knowledge document.
   */
  async uploadText(
    apiKey: string,
    title: string,
    content: string,
  ): Promise<ProviderUploadTextResponse> {
    try {
      const response = await firstValueFrom(
        this.httpService.post<ProviderUploadTextResponse>(
          `${this.baseUrl}/faq/upload/text`,
          { title, content },
          { headers: this.getHeaders(apiKey) },
        ),
      );
      return response.data;
    } catch (error) {
      this.handleError(error, 'uploadText');
    }
  }

  /**
   * Upload a PDF knowledge document using multipart/form-data.
   */
  async uploadPdf(
    apiKey: string,
    title: string,
    fileBuffer: Buffer,
    originalname: string,
    mimetype: string,
  ): Promise<any> {
    try {
      const form = new FormData();
      form.append('title', title);
      form.append('file', fileBuffer, {
        filename: originalname,
        contentType: mimetype,
      });

      const response = await firstValueFrom(
        this.httpService.post(`${this.baseUrl}/faq/upload/pdf`, form, {
          headers: {
            ...this.getHeaders(apiKey),
            ...form.getHeaders(),
          },
        }),
      );
      return response.data;
    } catch (error) {
      this.handleError(error, 'uploadPdf');
    }
  }

  /**
   * Get all knowledge documents for a company.
   */
  async getDocuments(apiKey: string): Promise<ProviderDocument[]> {
    try {
      const response = await firstValueFrom(
        this.httpService.get<ProviderGetDocsResponse>(
          `${this.baseUrl}/faq/documents`,
          { headers: this.getHeaders(apiKey) },
        ),
      );
      // Provider may return { data: [...] } or a raw array
      const body = response.data;
      if (Array.isArray(body)) return body;
      return (body as any).data ?? [];
    } catch (error) {
      this.handleError(error, 'getDocuments');
    }
  }

  /**
   * Delete a specific knowledge document.
   */
  async deleteDocument(apiKey: string, docId: number): Promise<void> {
    try {
      await firstValueFrom(
        this.httpService.delete(`${this.baseUrl}/faq/documents/${docId}`, {
          headers: this.getHeaders(apiKey),
        }),
      );
    } catch (error) {
      this.handleError(error, 'deleteDocument');
    }
  }

  /**
   * Ask a question against the company's knowledge base.
   */
  async ask(
    apiKey: string,
    question: string,
    userId?: string,
  ): Promise<ProviderAskResponse> {
    try {
      const body: Record<string, string> = { question };
      if (userId) body['user_id'] = userId;

      const response = await firstValueFrom(
        this.httpService.post<ProviderAskResponse>(
          `${this.baseUrl}/faq/ask`,
          body,
          { headers: this.getHeaders(apiKey) },
        ),
      );
      return response.data;
    } catch (error) {
      this.handleError(error, 'ask');
    }
  }

  /**
   * Get chat history for a specific user from the company's knowledge base.
   */
  async getHistory(
    apiKey: string,
    userId: string,
  ): Promise<ProviderHistoryItem[]> {
    try {
      const response = await firstValueFrom(
        this.httpService.get<ProviderGetHistoryResponse>(
          `${this.baseUrl}/faq/history`,
          {
            headers: this.getHeaders(apiKey),
            params: { user_id: userId },
          },
        ),
      );
      const body = response.data;
      if (Array.isArray(body)) return body;
      return (body as any).data ?? [];
    } catch (error) {
      this.handleError(error, 'getHistory');
    }
  }
}
