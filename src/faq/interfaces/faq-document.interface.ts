// src/faq/interfaces/faq-document.interface.ts

/** Shape dokumen FAQ yang dikembalikan ke client (portal contract) */
export interface FaqDocument {
  id: number;
  title: string;
  content: string | null;
  type: 'TEXT' | 'PDF';
  file_url: string | null;
  mime_type: string | null;
  size: number | null;
  created_at: string;
}

/** Shape history item yang dikembalikan ke client (portal contract) */
export interface FaqHistoryItem {
  id: number;
  question: string;
  answer: string;
  user_id: string;
  created_at: string;
}
