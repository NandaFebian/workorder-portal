// src/faq/resources/faq.resource.ts
import { ProviderDocument } from '../interfaces/faq-provider.interface';
import { FaqDocument } from '../interfaces/faq-document.interface';

/**
 * FaqResource
 * Transforms external provider document shapes into portal contract shapes.
 */
export class FaqResource {
  /**
   * Transform a single provider document to portal contract.
   * Fills in missing fields (fileUrl → file_url, mimeType → mime_type) based on type.
   */
  static transformDocument(
    doc: ProviderDocument,
    overrides?: Partial<FaqDocument>,
  ): FaqDocument {
    const isText = doc.type === 'TEXT';
    return {
      id: doc.id,
      title: doc.title,
      content: doc.content ?? overrides?.content ?? null,
      type: doc.type,
      fileUrl: isText ? null : (doc.file_url ?? null),
      mimeType: isText ? null : (doc.mime_type ?? 'application/pdf'),
      size: isText ? null : (doc.size ?? null),
      created_at: doc.created_at,
      ...overrides,
    };
  }

  /**
   * Transform a list of provider documents to portal contract.
   */
  static transformDocumentList(docs: ProviderDocument[]): FaqDocument[] {
    return docs.map((d) => FaqResource.transformDocument(d));
  }
}
