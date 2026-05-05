// src/faq/interfaces/faq-document.interface.ts

/** Shape dokumen FAQ yang dikembalikan ke client (portal contract) */
export interface FaqDocument {
  id: number;
  title: string;
  content: string | null;
  type: 'TEXT' | 'PDF';
  fileUrl: string | null;
  mimeType: string | null;
  size: number | null;
  created_at: string;
}
