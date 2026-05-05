// src/faq/interfaces/faq-provider.interface.ts

/** Response saat register company ke provider */
export interface ProviderRegisterResponse {
  message: string;
  company: {
    id: number;
    name: string;
    apiKey: string;
  };
}

/** Satu item dokumen dari provider */
export interface ProviderDocument {
  id: number;
  company_id: number;
  title: string;
  content?: string;
  type: 'TEXT' | 'PDF';
  file_url?: string | null;
  mime_type?: string | null;
  size?: number | null;
  created_at: string;
}

/** Response GET /faq/documents */
export interface ProviderGetDocsResponse {
  data: ProviderDocument[];
}

/** Response POST /faq/upload/text */
export interface ProviderUploadTextResponse {
  message: string;
  data?: ProviderDocument;
}

/** Response POST /faq/upload/pdf */
export interface ProviderUploadPdfResponse {
  message: string;
  data?: ProviderDocument;
}

/** Response POST /faq/ask */
export interface ProviderAskResponse {
  message: string;
  data: string;
  metadata?: {
    engine?: string;
    model?: string;
  };
}
