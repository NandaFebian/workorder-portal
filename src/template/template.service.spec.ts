import { Test, TestingModule } from '@nestjs/testing';
import { TemplateService } from './template.service';
import { getModelToken } from '@nestjs/mongoose';
import { CompanyType } from './schemas/company-type.schema';
import { ServiceTemplate } from './schemas/service-template.schema';
import { FormsService } from '../form/form.service';
import { ServicesInternalService } from '../service/services.internal.service';
import { PositionsService } from '../positions/positions.service';
import { NotFoundException } from '@nestjs/common';

describe('TemplateService', () => {
  let service: TemplateService;
  let companyTypeModel: any;
  let serviceTemplateModel: any;
  let formsService: any;
  let servicesService: any;
  let positionsService: any;

  const mockCompanyTypes = [
    { _id: 'ct1', name: 'Hotel', description: 'Hotel industry' },
    { _id: 'ct2', name: 'Restaurant', description: 'Restaurant industry' },
  ];

  const mockTemplates = [
    { _id: 'st1', title: 'Room Cleaning', description: 'Room cleaning service' },
    { _id: 'st2', title: 'Laundry', description: 'Laundry service' },
  ];

  const mockFullTemplate = {
    _id: 'st1',
    title: 'Room Cleaning',
    description: 'Room cleaning service',
    accessType: 'public',
    draftingWorkOrderType: 'manual',
    serviceRequestConfig: {
      approvalAccessType: 'auto',
      reviewNeed: false,
      intakeFormId: null,
      reviewFormId: null,
    },
    workOrdersConfig: [],
  };

  beforeEach(async () => {
    const mockCTModel = {
      find: jest.fn(),
      findById: jest.fn(),
    };
    const mockSTModel = {
      find: jest.fn(),
      findById: jest.fn(),
    };
    const mockForms = {
      createTemplate: jest.fn().mockResolvedValue({ _id: 'form-1' }),
    };
    const mockServices = {
      create: jest.fn().mockResolvedValue({
        _id: 'svc-id-123',
        title: 'Test Service',
      }),
    };
    const mockPositions = {};

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TemplateService,
        { provide: getModelToken(CompanyType.name), useValue: mockCTModel },
        { provide: getModelToken(ServiceTemplate.name), useValue: mockSTModel },
        { provide: FormsService, useValue: mockForms },
        { provide: ServicesInternalService, useValue: mockServices },
        { provide: PositionsService, useValue: mockPositions },
      ],
    }).compile();

    service = module.get<TemplateService>(TemplateService);
    companyTypeModel = module.get(getModelToken(CompanyType.name));
    serviceTemplateModel = module.get(getModelToken(ServiceTemplate.name));
    formsService = module.get<FormsService>(FormsService);
    servicesService = module.get<ServicesInternalService>(ServicesInternalService);
    positionsService = module.get<PositionsService>(PositionsService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('getCompanyTypes()', () => {
    it('UT-TPL-001: should return all company types', async () => {
      companyTypeModel.find.mockReturnValue({
        select: jest.fn().mockReturnThis(),
        lean: jest.fn().mockReturnThis(),
        exec: jest.fn().mockResolvedValue(mockCompanyTypes),
      });

      const result = await service.getCompanyTypes();
      expect(result).toHaveLength(2);
      expect(result[0]).toHaveProperty('companyTypeName', 'Hotel');
    });

    it('UT-TPL-002: should return empty array when no types exist', async () => {
      companyTypeModel.find.mockReturnValue({
        select: jest.fn().mockReturnThis(),
        lean: jest.fn().mockReturnThis(),
        exec: jest.fn().mockResolvedValue([]),
      });

      const result = await service.getCompanyTypes();
      expect(result).toEqual([]);
    });
  });

  describe('getServicesByCompanyType()', () => {
    const ctId = '507f1f77bcf86cd799439011';

    it('UT-TPL-003: should return services for valid company type', async () => {
      companyTypeModel.findById.mockReturnValue({
        lean: jest.fn().mockReturnThis(),
        exec: jest.fn().mockResolvedValue(mockCompanyTypes[0]),
      });
      serviceTemplateModel.find.mockReturnValue({
        select: jest.fn().mockReturnThis(),
        lean: jest.fn().mockReturnThis(),
        exec: jest.fn().mockResolvedValue(mockTemplates),
      });

      const result = await service.getServicesByCompanyType(ctId);
      expect(result).toHaveLength(2);
    });

    it('UT-TPL-004: should throw NotFoundException for invalid ID', async () => {
      await expect(
        service.getServicesByCompanyType('invalid-id'),
      ).rejects.toThrow(NotFoundException);
    });

    it('UT-TPL-005: should throw NotFoundException when company type not found', async () => {
      companyTypeModel.findById.mockReturnValue({
        lean: jest.fn().mockReturnThis(),
        exec: jest.fn().mockResolvedValue(null),
      });

      await expect(
        service.getServicesByCompanyType(ctId),
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('getServiceTemplatePreview()', () => {
    const stId = '507f1f77bcf86cd799439021';

    it('UT-TPL-006: should return service template preview', async () => {
      serviceTemplateModel.findById.mockReturnValue({
        lean: jest.fn().mockReturnThis(),
        exec: jest.fn().mockResolvedValue(mockFullTemplate),
      });

      const result = await service.getServiceTemplatePreview(stId);
      expect(result).toBeDefined();
      expect(result.service.title).toBe('Room Cleaning');
    });

    it('UT-TPL-007: should throw NotFoundException for invalid ID', async () => {
      await expect(
        service.getServiceTemplatePreview('invalid-id'),
      ).rejects.toThrow(NotFoundException);
    });

    it('UT-TPL-008: should throw NotFoundException when template not found', async () => {
      serviceTemplateModel.findById.mockReturnValue({
        lean: jest.fn().mockReturnThis(),
        exec: jest.fn().mockResolvedValue(null),
      });

      await expect(
        service.getServiceTemplatePreview(stId),
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('generateServices()', () => {
    const ctId = '507f1f77bcf86cd799439011';
    const stIds = ['507f1f77bcf86cd799439021'];

    it('UT-TPL-009: should generate services from templates', async () => {
      companyTypeModel.findById.mockReturnValue({
        lean: jest.fn().mockReturnThis(),
        exec: jest.fn().mockResolvedValue(mockCompanyTypes[0]),
      });
      serviceTemplateModel.find.mockReturnValue({
        lean: jest.fn().mockReturnThis(),
        exec: jest.fn().mockResolvedValue([mockFullTemplate]),
      });
      serviceTemplateModel.findById.mockReturnValue({
        lean: jest.fn().mockReturnThis(),
        exec: jest.fn().mockResolvedValue(mockFullTemplate),
      });

      const mockOwner = {
        _id: 'user1',
        role: 'owner_company',
        company: { _id: 'comp1', name: 'Test' },
      };

      const result = await service.generateServices(
        mockOwner as any,
        stIds,
      );
      expect(result).toBeDefined();
    });

    it('UT-TPL-010: should throw NotFoundException when service template not found', async () => {
      serviceTemplateModel.findById.mockReturnValue({
        lean: jest.fn().mockReturnThis(),
        exec: jest.fn().mockResolvedValue(null),
      });

      const mockOwner = {
        _id: 'user1',
        name: 'Owner',
        email: 'owner@test.com',
        role: 'owner_company',
        company: { _id: 'comp1', name: 'Test' },
      };

      await expect(
        service.generateServices(mockOwner as any, stIds),
      ).rejects.toThrow(NotFoundException);
    });
  });
});
