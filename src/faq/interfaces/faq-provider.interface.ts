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
  data: {
    answer: string;
  };
  metadata?: {
    engine?: string;
    model?: string;
    used_tokens?: {
      inputTokens?: number;
      outputTokens?: number;
    };
    document_count?: number;
  };
}

/** Satu item history dari provider */
export interface ProviderHistoryItem {
  id: number;
  company_id: number;
  question: string;
  answer: string;
  user_id: string;
  created_at: string;
}

/** Response GET /faq/history */
export interface ProviderGetHistoryResponse {
  data: ProviderHistoryItem[];
}
