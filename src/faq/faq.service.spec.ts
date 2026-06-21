import { Test, TestingModule } from '@nestjs/testing';
import { FaqService } from './faq.service';
import { getModelToken } from '@nestjs/mongoose';
import { Company } from '../company/schemas/company.schemas';
import { FaqProviderService } from './faq-provider.service';
import { Types } from 'mongoose';
import {
  NotFoundException,
  ForbiddenException,
  BadRequestException,
} from '@nestjs/common';
import { Logger } from '@nestjs/common';

describe('FaqService', () => {
  let service: FaqService;
  let companyModel: any;
  let providerService: any;

  const mockOwner = {
    _id: new Types.ObjectId('507f1f77bcf86cd799439011'),
    name: 'Owner',
    email: 'owner@test.com',
    role: 'owner_company',
    company: { _id: new Types.ObjectId('507f1f77bcf86cd799439001'), name: 'Test Corp' },
  };

  const mockCompany = {
    _id: '507f1f77bcf86cd799439001',
    name: 'Test Corp',
    ownerId: '507f1f77bcf86cd799439011',
    isFaqActive: false,
    faqApiKey: null,
    faqExternalCompanyId: null,
    save: jest.fn().mockResolvedValue(this),
  };

  beforeEach(async () => {
    jest.spyOn(Logger.prototype, 'log').mockImplementation(() => {});
    jest.spyOn(Logger.prototype, 'error').mockImplementation(() => {});
    jest.spyOn(Logger.prototype, 'warn').mockImplementation(() => {});

    const mockCompanyModel = {
      findOne: jest.fn(),
    };
    const mockProvider = {
      register: jest.fn(),
      uploadText: jest.fn(),
      getDocuments: jest.fn(),
      deleteDocument: jest.fn(),
      ask: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        FaqService,
        { provide: getModelToken(Company.name), useValue: mockCompanyModel },
        { provide: FaqProviderService, useValue: mockProvider },
      ],
    }).compile();

    service = module.get<FaqService>(FaqService);
    companyModel = module.get(getModelToken(Company.name));
    providerService = module.get<FaqProviderService>(FaqProviderService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('getActiveCompanyById()', () => {
    const companyId = '507f1f77bcf86cd799439001';

    it('UT-FAQ-001: should return company when FAQ is active', async () => {
      const activeCompany = {
        ...mockCompany,
        isFaqActive: true,
        faqApiKey: 'api-key-123',
      };
      companyModel.findOne.mockReturnValue({
        exec: jest.fn().mockResolvedValue(activeCompany),
      });

      const result = await service.getActiveCompanyById(companyId);
      expect(result).toEqual(activeCompany);
    });

    it('UT-FAQ-002: should throw NotFoundException when company not found', async () => {
      companyModel.findOne.mockReturnValue({
        exec: jest.fn().mockResolvedValue(null),
      });

      await expect(
        service.getActiveCompanyById(companyId),
      ).rejects.toThrow(NotFoundException);
    });

    it('UT-FAQ-003: should throw BadRequestException when FAQ is inactive', async () => {
      companyModel.findOne.mockReturnValue({
        exec: jest.fn().mockResolvedValue(mockCompany),
      });

      await expect(
        service.getActiveCompanyById(companyId),
      ).rejects.toThrow(BadRequestException);
    });
  });

  describe('toggleActive()', () => {
    it('UT-FAQ-004: should activate FAQ for company owner', async () => {
      const inactiveCompany = {
        ...mockCompany,
        isFaqActive: false,
        save: jest.fn().mockResolvedValue({ ...mockCompany, isFaqActive: true }),
      };
      companyModel.findOne.mockReturnValue({
        populate: jest.fn().mockReturnThis(),
        exec: jest.fn().mockResolvedValue(inactiveCompany),
      });
      providerService.register.mockResolvedValue({
        company: { id: 123, apiKey: 'new-api-key' },
      });

      const result = await service.toggleActive(mockOwner, true);
      expect(result).toBeDefined();
    });

    it('UT-FAQ-005: should deactivate FAQ', async () => {
      const activeCompany = {
        ...mockCompany,
        isFaqActive: true,
        faqApiKey: 'some-key',
        faqExternalCompanyId: 123,
        save: jest.fn().mockResolvedValue({ ...mockCompany, isFaqActive: false }),
      };
      companyModel.findOne.mockReturnValue({
        populate: jest.fn().mockReturnThis(),
        exec: jest.fn().mockResolvedValue(activeCompany),
      });

      const result = await service.toggleActive(mockOwner, false);
      expect(result).toBeDefined();
    });

    it('UT-FAQ-006: should throw ForbiddenException when user is not owner', async () => {
      const nonOwnerCompany = {
        ...mockCompany,
        ownerId: 'other-user-id',
      };
      companyModel.findOne.mockReturnValue({
        populate: jest.fn().mockReturnThis(),
        exec: jest.fn().mockResolvedValue(nonOwnerCompany),
      });

      await expect(service.toggleActive(mockOwner, true)).rejects.toThrow(
        ForbiddenException,
      );
    });
  });

  describe('uploadTextDocs()', () => {
    const dto = { title: 'Test Doc', content: 'Test content' };

    it('UT-FAQ-007: should upload text document', async () => {
      const activeCompany = {
        ...mockCompany,
        isFaqActive: true,
        faqApiKey: 'api-key',
        faqExternalCompanyId: 123,
      };
      companyModel.findOne.mockReturnValue({
        populate: jest.fn().mockReturnThis(),
        exec: jest.fn().mockResolvedValue(activeCompany),
      });
      providerService.uploadText.mockResolvedValue({ id: 'doc-1' });

      const result = await service.uploadTextDocs(mockOwner, dto.title, dto.content);
      expect(result).toBeDefined();
    });
  });

  describe('getDocs()', () => {
    it('UT-FAQ-008: should return list of documents', async () => {
      const activeCompany = {
        ...mockCompany,
        isFaqActive: true,
        faqApiKey: 'api-key',
        faqExternalCompanyId: 123,
      };
      companyModel.findOne.mockReturnValue({
        populate: jest.fn().mockReturnThis(),
        exec: jest.fn().mockResolvedValue(activeCompany),
      });
      providerService.getDocuments.mockResolvedValue([
        { id: 'doc-1', title: 'Doc 1' },
      ]);

      const result = await service.getDocs(mockOwner);
      expect(result).toHaveLength(1);
    });
  });

  describe('deleteDoc()', () => {
    it('UT-FAQ-009: should delete document by external docsId', async () => {
      const activeCompany = {
        ...mockCompany,
        isFaqActive: true,
        faqApiKey: 'api-key',
        faqExternalCompanyId: 123,
      };
      companyModel.findOne.mockReturnValue({
        populate: jest.fn().mockReturnThis(),
        exec: jest.fn().mockResolvedValue(activeCompany),
      });
      providerService.deleteDocument.mockResolvedValue({ success: true });

      await expect(
        service.deleteDoc(mockOwner, 123),
      ).resolves.not.toThrow();
    });
  });

  describe('ask()', () => {
    const companyId = '507f1f77bcf86cd799439001';
    const question = 'What services do you offer?';

    it('UT-FAQ-010: should ask question and return answer', async () => {
      const activeCompany = {
        ...mockCompany,
        isFaqActive: true,
        faqApiKey: 'api-key',
        faqExternalCompanyId: 123,
      };
      companyModel.findOne.mockReturnValue({
        exec: jest.fn().mockResolvedValue(activeCompany),
      });
      providerService.ask.mockResolvedValue({
        data: { answer: 'We offer various services.' },
      });

      const result = await service.ask(companyId, question);
      expect(result).toBeDefined();
      expect(result.answer).toBe('We offer various services.');
    });

    it('UT-FAQ-011: should throw BadRequestException when FAQ inactive', async () => {
      companyModel.findOne.mockReturnValue({
        exec: jest.fn().mockResolvedValue(mockCompany),
      });

      await expect(service.ask(companyId, question)).rejects.toThrow(
        BadRequestException,
      );
    });
  });
});
