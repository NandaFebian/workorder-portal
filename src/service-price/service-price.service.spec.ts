import { Test, TestingModule } from '@nestjs/testing';
import { ServicePriceService } from './service-price.service';
import { getModelToken } from '@nestjs/mongoose';
import { ServicePrice } from './schemas/service-price.schema';
import { Service } from '../service/schemas/service.schema';
import { FormsService } from '../form/form.service';
import { Types } from 'mongoose';
import {
  NotFoundException,
  ForbiddenException,
  ConflictException,
} from '@nestjs/common';

jest.mock('../service/helpers/service-aggregation.helper', () => ({
  getServicesWithAggregation: jest.fn(),
}));

jest.mock('../common/helpers/department-auth.helper', () => ({
  DepartmentAuthHelper: {
    isDepartmentManager: jest.fn().mockReturnValue(false),
    canManageService: jest.fn().mockReturnValue(true),
    filterServicesForUser: jest.fn((user, services) => services),
  },
}));

import { getServicesWithAggregation } from '../service/helpers/service-aggregation.helper';

describe('ServicePriceService', () => {
  let service: ServicePriceService;
  let priceModel: any;
  let serviceModel: any;
  let formsService: any;

  const mockUser = {
    _id: new Types.ObjectId('507f1f77bcf86cd799439020'),
    name: 'Manager',
    email: 'manager@test.com',
    role: 'manager_company',
    company: { _id: new Types.ObjectId('507f1f77bcf86cd799439012'), name: 'Test Corp' },
  };

  const mockPrice = {
    _id: '507f1f77bcf86cd799439031',
    serviceKey: 'test-service',
    price: 150000,
    deletedAt: null,
    save: jest.fn().mockResolvedValue(this),
  };

  const mockService = {
    _id: '507f1f77bcf86cd799439041',
    serviceKey: 'test-service',
    title: 'Test Service',
    companyId: '507f1f77bcf86cd799439012',
    __v: 1,
    deletedAt: null,
    workOrdersConfig: [],
  };

  const mockHydratedPrice = {
    _id: '507f1f77bcf86cd799439031',
    service: mockService,
    price: 150000,
  };

  beforeEach(async () => {
    const mockPriceModel = {
      find: jest.fn(),
      findOne: jest.fn(),
      create: jest.fn(),
    };
    const mockServiceModel = {
      findOne: jest.fn(),
      find: jest.fn(),
    };
    const mockFormsService = {};

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ServicePriceService,
        { provide: getModelToken(ServicePrice.name), useValue: mockPriceModel },
        { provide: getModelToken(Service.name), useValue: mockServiceModel },
        { provide: FormsService, useValue: mockFormsService },
      ],
    }).compile();

    service = module.get<ServicePriceService>(ServicePriceService);
    priceModel = module.get(getModelToken(ServicePrice.name));
    serviceModel = module.get(getModelToken(Service.name));
    formsService = module.get<FormsService>(FormsService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('findAll()', () => {
    it('UT-SP-001: should return prices for user company', async () => {
      (getServicesWithAggregation as jest.Mock)
        .mockResolvedValueOnce([mockService]);

      const leanMock = jest.fn().mockReturnThis();
      const execMock = jest.fn().mockResolvedValue([mockPrice]);
      priceModel.find.mockReturnValue({ lean: leanMock, exec: execMock });

      const result = await service.findAll(mockUser);

      expect(getServicesWithAggregation).toHaveBeenCalled();
      expect(priceModel.find).toHaveBeenCalledWith({
        serviceKey: { $in: ['test-service'] },
        deletedAt: null,
      });
      expect(result).toHaveLength(1);
    });

    it('UT-SP-002: should throw ForbiddenException when user has no company', async () => {
      const userNoCompany = { ...mockUser, company: null };

      await expect(service.findAll(userNoCompany as any)).rejects.toThrow(
        ForbiddenException,
      );
    });

    it('UT-SP-003: should return empty array when no prices exist', async () => {
      (getServicesWithAggregation as jest.Mock)
        .mockResolvedValueOnce([mockService]);

      priceModel.find.mockReturnValue({
        lean: jest.fn().mockReturnThis(),
        exec: jest.fn().mockResolvedValue([]),
      });

      const result = await service.findAll(mockUser);

      expect(result).toEqual([]);
    });
  });

  describe('create()', () => {
    const dto = { serviceId: '507f1f77bcf86cd799439041', price: 200000 };

    it('UT-SP-004: should create price successfully', async () => {
      serviceModel.findOne.mockReturnValue({
        sort: jest.fn().mockReturnThis(),
        exec: jest.fn().mockResolvedValue(mockService),
      });
      priceModel.findOne.mockResolvedValue(null);
      priceModel.create.mockResolvedValue(mockPrice);

      (getServicesWithAggregation as jest.Mock)
        .mockResolvedValueOnce([mockService]);

      const result = await service.create(dto, mockUser);

      expect(priceModel.create).toHaveBeenCalledWith({
        serviceKey: 'test-service',
        price: 200000,
      });
      expect(result).toBeDefined();
    });

    it('UT-SP-005: should throw ConflictException when price already exists', async () => {
      serviceModel.findOne.mockReturnValue({
        sort: jest.fn().mockReturnThis(),
        exec: jest.fn().mockResolvedValue(mockService),
      });
      priceModel.findOne.mockResolvedValue(mockPrice);

      await expect(service.create(dto, mockUser)).rejects.toThrow(
        ConflictException,
      );
    });

    it('UT-SP-006: should throw ForbiddenException when user has no company', async () => {
      const userNoCompany = { ...mockUser, company: null };

      await expect(
        service.create(dto, userNoCompany as any),
      ).rejects.toThrow(ForbiddenException);
    });

    it('UT-SP-007: should throw NotFoundException for invalid serviceId', async () => {
      serviceModel.findOne.mockReturnValue({
        sort: jest.fn().mockReturnThis(),
        exec: jest.fn().mockResolvedValue(null),
      });

      await expect(service.create(dto, mockUser)).rejects.toThrow(
        NotFoundException,
      );
    });

    it('UT-SP-008: should throw ForbiddenException for service from other company', async () => {
      const otherCompanyService = {
        ...mockService,
        companyId: '999999999999999999999999',
      };
      serviceModel.findOne.mockReturnValue({
        sort: jest.fn().mockReturnThis(),
        exec: jest.fn().mockResolvedValue(otherCompanyService),
      });

      await expect(service.create(dto, mockUser)).rejects.toThrow(
        ForbiddenException,
      );
    });
  });

  describe('update()', () => {
    const priceId = '507f1f77bcf86cd799439031';
    const dto = { price: 250000 };

    it('UT-SP-009: should update price successfully', async () => {
      priceModel.findOne.mockReturnValue({
        exec: jest.fn().mockResolvedValue({
          ...mockPrice,
          save: jest.fn().mockResolvedValue({ ...mockPrice, price: 250000 }),
        }),
      });
      serviceModel.find.mockReturnValue({
        exec: jest.fn().mockResolvedValue([mockService]),
      });
      (getServicesWithAggregation as jest.Mock)
        .mockResolvedValueOnce([mockService]);

      const result = await service.update(priceId, dto, mockUser);

      expect(result).toBeDefined();
    });

    it('UT-SP-010: should throw NotFoundException for invalid price ID', async () => {
      await expect(
        service.update('invalid-id', dto, mockUser),
      ).rejects.toThrow(NotFoundException);
    });

    it('UT-SP-011: should throw NotFoundException when price not found', async () => {
      priceModel.findOne.mockReturnValue({
        exec: jest.fn().mockResolvedValue(null),
      });

      await expect(
        service.update(priceId, dto, mockUser),
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('remove()', () => {
    const priceId = '507f1f77bcf86cd799439031';

    it('UT-SP-012: should soft-delete price successfully', async () => {
      const mockPriceWithSave = {
        ...mockPrice,
        deletedAt: null,
        save: jest.fn().mockResolvedValue({ ...mockPrice, deletedAt: new Date() }),
      };
      priceModel.findOne.mockReturnValue({
        exec: jest.fn().mockResolvedValue(mockPriceWithSave),
      });
      serviceModel.find.mockReturnValue({
        exec: jest.fn().mockResolvedValue([mockService]),
      });
      (getServicesWithAggregation as jest.Mock)
        .mockResolvedValueOnce([mockService]);

      const result = await service.remove(priceId, mockUser);

      expect(mockPriceWithSave.deletedAt).toBeDefined();
      expect(mockPriceWithSave.save).toHaveBeenCalled();
    });

    it('UT-SP-013: should throw NotFoundException when price not found', async () => {
      priceModel.findOne.mockReturnValue({
        exec: jest.fn().mockResolvedValue(null),
      });

      await expect(service.remove(priceId, mockUser)).rejects.toThrow(
        NotFoundException,
      );
    });
  });
});
