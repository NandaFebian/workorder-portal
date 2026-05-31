// src/faq/faq.service.ts
import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  BadRequestException,
  BadGatewayException,
  Logger,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Company, CompanyDocument } from 'src/company/schemas/company.schemas';
import { FaqProviderService } from './faq-provider.service';
import { FaqResource } from './resources/faq.resource';
import {
  FaqDocument,
  FaqHistoryItem,
} from './interfaces/faq-document.interface';
import type { AuthenticatedUser } from 'src/auth/interfaces/authenticated-user.interface';

@Injectable()
export class FaqService {
  private readonly logger = new Logger(FaqService.name);

  constructor(
    @InjectModel(Company.name)
    private readonly companyModel: Model<CompanyDocument>,
    private readonly providerService: FaqProviderService,
  ) {}

  // ─────────────────────────────────────────────────────────────
  // PRIVATE HELPERS
  // ─────────────────────────────────────────────────────────────

  /**
   * Get a company and assert that the authenticated user is its owner.
   * Verifies both company association AND ownerId to prevent cross-company manipulation.
   */
  private async getCompanyForOwner(
    user: AuthenticatedUser,
  ): Promise<CompanyDocument> {
    if (!user.company?._id) {
      throw new ForbiddenException('You are not associated with any company.');
    }
    const company = await this.companyModel
      .findOne({ _id: user.company._id, deletedAt: null })
      .populate('ownerId')
      .exec();

    if (!company) {
      throw new NotFoundException('Company not found.');
    }

    // Ensure the authenticated user is actually the owner of this company
    const ownerIdStr =
      (company.ownerId as any)?._id?.toString() || company.ownerId?.toString();
    if (ownerIdStr !== user._id.toString()) {
      throw new ForbiddenException(
        'Only the company owner can manage FAQ configuration.',
      );
    }

    return company;
  }

  /**
   * Get a company by ID (for public/client use).
   * Asserts that FAQ feature is active.
   */
  async getActiveCompanyById(companyId: string): Promise<CompanyDocument> {
    const company = await this.companyModel
      .findOne({ _id: companyId, deletedAt: null })
      .exec();

    if (!company) {
      throw new NotFoundException('Company not found.');
    }
    if (!company.isFaqActive || !company.faqApiKey) {
      throw new BadRequestException(
        'FAQ feature is not active for this company.',
      );
    }
    return company;
  }

  // ─────────────────────────────────────────────────────────────
  // OWNER-SIDE OPERATIONS
  // ─────────────────────────────────────────────────────────────

  /**
   * Toggle FAQ feature on/off for the owner's company.
   * On first activation, auto-registers the company with the external provider.
   */
  async toggleActive(
    user: AuthenticatedUser,
    isActive: boolean,
  ): Promise<CompanyDocument> {
    const company = await this.getCompanyForOwner(user);

    if (isActive) {
      // First-time activation: register with external provider
      if (!company.faqApiKey) {
        this.logger.log(
          `Registering company "${company.name}" with FAQ provider...`,
        );
        const result = await this.providerService.register(company.name);
        company.faqApiKey = result.company.apiKey;
        company.faqExternalCompanyId = result.company.id;
        this.logger.log(
          `Company "${company.name}" registered. External ID: ${result.company.id}`,
        );
      }
      company.isFaqActive = true;
    } else {
      // Deactivate — keep token so re-activation doesn't re-register
      company.isFaqActive = false;
    }

    await company.save();
    return company;
  }

  /**
   * Upload a text knowledge document.
   * Provider only returns a success message, so we re-fetch docs to build the full object.
   */
  async uploadTextDocs(
    user: AuthenticatedUser,
    title: string,
    content: string,
  ): Promise<FaqDocument> {
    const company = await this.getCompanyForOwner(user);

    if (!company.isFaqActive || !company.faqApiKey) {
      throw new BadRequestException(
        'FAQ feature must be active to upload documents.',
      );
    }

    const uploadResult = await this.providerService.uploadText(
      company.faqApiKey,
      title,
      content,
    );

    // If provider returns the doc directly, use it; otherwise re-fetch to find the latest
    if (uploadResult?.data) {
      return FaqResource.transformDocument(uploadResult.data, { content });
    }

    // Fallback: re-fetch document list and return the latest TEXT doc
    const docs = await this.providerService.getDocuments(company.faqApiKey);
    const textDocs = docs.filter((d) => d.type === 'TEXT');
    const latest = textDocs[textDocs.length - 1];

    if (!latest) {
      throw new BadGatewayException(
        'Document was uploaded but could not be retrieved.',
      );
    }

    return FaqResource.transformDocument(latest, { content });
  }

  /**
   * Upload a PDF knowledge document.
   */
  async uploadPdfDocs(
    user: AuthenticatedUser,
    title: string,
    file: Express.Multer.File,
  ): Promise<FaqDocument> {
    const company = await this.getCompanyForOwner(user);

    if (!company.isFaqActive || !company.faqApiKey) {
      throw new BadRequestException(
        'FAQ feature must be active to upload documents.',
      );
    }

    const uploadResult = await this.providerService.uploadPdf(
      company.faqApiKey,
      title,
      file.buffer,
      file.originalname,
      file.mimetype,
    );

    // If provider returns the doc directly, use it; otherwise re-fetch
    if (uploadResult?.data) {
      return FaqResource.transformDocument(uploadResult.data);
    }

    const docs = await this.providerService.getDocuments(company.faqApiKey);
    const pdfDocs = docs.filter((d) => d.type === 'PDF');
    const latest = pdfDocs[pdfDocs.length - 1];

    if (!latest) {
      throw new BadGatewayException(
        'PDF was uploaded but could not be retrieved.',
      );
    }

    return FaqResource.transformDocument(latest);
  }

  /**
   * Get all knowledge documents for the owner's company.
   */
  async getDocs(user: AuthenticatedUser): Promise<FaqDocument[]> {
    const company = await this.getCompanyForOwner(user);

    if (!company.isFaqActive || !company.faqApiKey) {
      throw new BadRequestException(
        'FAQ feature must be active to retrieve documents.',
      );
    }

    const docs = await this.providerService.getDocuments(company.faqApiKey);
    return FaqResource.transformDocumentList(docs);
  }

  /**
   * Delete a specific knowledge document.
   */
  async deleteDoc(user: AuthenticatedUser, docsId: number): Promise<void> {
    const company = await this.getCompanyForOwner(user);

    if (!company.isFaqActive || !company.faqApiKey) {
      throw new BadRequestException(
        'FAQ feature must be active to delete documents.',
      );
    }

    await this.providerService.deleteDocument(company.faqApiKey, docsId);
  }

  // ─────────────────────────────────────────────────────────────
  // CLIENT-SIDE OPERATIONS
  // ─────────────────────────────────────────────────────────────

  /**
   * Ask a question to the company's FAQ chatbot.
   * Public endpoint — any authenticated user can call this.
   */
  async ask(
    companyId: string,
    question: string,
    userId?: string,
  ): Promise<{ answer: string }> {
    const company = await this.getActiveCompanyById(companyId);

    const result = await this.providerService.ask(
      company.faqApiKey!,
      question,
      userId,
    );

    // Provider returns { message, data: { answer: "..." } }
    const answer = result.data?.answer ?? '';
    return { answer };
  }

  /**
   * Get chatbot history for a specific user against a company's knowledge base.
   */
  async getHistory(
    companyId: string,
    userId: string,
  ): Promise<FaqHistoryItem[]> {
    const company = await this.getActiveCompanyById(companyId);

    const items = await this.providerService.getHistory(
      company.faqApiKey!,
      userId,
    );

    return FaqResource.transformHistoryList(items);
  }
}
