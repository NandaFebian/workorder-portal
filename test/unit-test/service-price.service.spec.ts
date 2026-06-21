import { Test, TestingModule } from '@nestjs/testing';
import { ServicePriceService } from 'src/service-price/service-price.service';
import { getModelToken } from '@nestjs/mongoose';
import { ServicePrice } from 'src/service-price/schemas/service-price.schema';
import { Service } from 'src/service/schemas/service.schema';
import { FormsService } from 'src/form/form.service';
import { Types } from 'mongoose';
import {
  NotFoundException,
  ForbiddenException,
  ConflictException,
} from '@nestjs/common';

jest.mock('src/service/helpers/service-aggregation.helper', () => ({
  getServicesWithAggregation: jest.fn(),
}));

jest.mock('src/common/helpers/department-auth.helper', () => ({
  DepartmentAuthHelper: {
    isDepartmentManager: jest.fn().mockReturnValue(false),
    canManageService: jest.fn().mockReturnValue(true),
    filterServicesForUser: jest.fn((user, services) => services),
  },
}));

import { getServicesWithAggregation } from 'src/service/helpers/service-aggregation.helper';

describe('ServicePriceService', () => {
  let service: ServicePriceService;
  let priceModel: any;
  let serviceModel: any;

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

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ServicePriceService,
        { provide: getModelToken(ServicePrice.name), useValue: { find: jest.fn(), findOne: jest.fn(), create: jest.fn() } },
        { provide: getModelToken(Service.name), useValue: { findOne: jest.fn(), find: jest.fn() } },
        { provide: FormsService, useValue: {} },
      ],
    }).compile();

    service = module.get<ServicePriceService>(ServicePriceService);
    priceModel = module.get(getModelToken(ServicePrice.name));
    serviceModel = module.get(getModelToken(Service.name));
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  // ─── UT-SP-001: create() positif ───

  describe('create()', () => {
    const dto = { serviceId: '507f1f77bcf86cd799439041', price: 200000 };

    it('UT-SP-001: Membuat harga layanan valid → mengembalikan record harga', async () => {
      serviceModel.findOne.mockReturnValue({
        sort: jest.fn().mockReturnThis(),
        exec: jest.fn().mockResolvedValue(mockService),
      });
      priceModel.findOne.mockResolvedValue(null);
      priceModel.create.mockResolvedValue(mockPrice);
      (getServicesWithAggregation as jest.Mock).mockResolvedValueOnce([mockService]);

      const result = await service.create(dto, mockUser);
      expect(result).toBeDefined();
      expect(priceModel.create).toHaveBeenCalled();
    });

    it('UT-SP-002: Membuat harga dengan field wajib kosong → throw error', async () => {
      const userNoCompany = { ...mockUser, company: null };

      await expect(service.create(dto, userNoCompany as any)).rejects.toThrow(ForbiddenException);
    });

    it('UT-SP-003: Membuat harga duplikat → throw ConflictError', async () => {
      serviceModel.findOne.mockReturnValue({
        sort: jest.fn().mockReturnThis(),
        exec: jest.fn().mockResolvedValue(mockService),
      });
      priceModel.findOne.mockResolvedValue(mockPrice);

      await expect(service.create(dto, mockUser)).rejects.toThrow(ConflictException);
    });
  });

  // ─── UT-SP-004/005: update() ───

  describe('update()', () => {
    const priceId = '507f1f77bcf86cd799439031';
    const dto = { price: 250000 };

    it('UT-SP-004: Memperbarui harga berdasarkan ID valid → record diperbarui', async () => {
      priceModel.findOne.mockReturnValue({
        exec: jest.fn().mockResolvedValue({
          ...mockPrice,
          save: jest.fn().mockResolvedValue({ ...mockPrice, price: 250000 }),
        }),
      });
      serviceModel.find.mockReturnValue({
        exec: jest.fn().mockResolvedValue([mockService]),
      });
      (getServicesWithAggregation as jest.Mock).mockResolvedValueOnce([mockService]);

      const result = await service.update(priceId, dto, mockUser);
      expect(result).toBeDefined();
    });

    it('UT-SP-005: Memperbarui harga dengan ID tidak ditemukan → throw NotFoundError', async () => {
      priceModel.findOne.mockReturnValue({
        exec: jest.fn().mockResolvedValue(null),
      });

      await expect(service.update(priceId, dto, mockUser)).rejects.toThrow(NotFoundException);
    });
  });

  // ─── UT-SP-006: findAll() ───

  describe('findAll()', () => {
    it('UT-SP-006: Mengambil seluruh harga layanan milik company → array harga', async () => {
      (getServicesWithAggregation as jest.Mock).mockResolvedValueOnce([mockService]);
      priceModel.find.mockReturnValue({
        lean: jest.fn().mockReturnThis(),
        exec: jest.fn().mockResolvedValue([mockPrice]),
      });

      const result = await service.findAll(mockUser);
      expect(result).toHaveLength(1);
    });
  });

  // ─── UT-SP-007/008: remove() ───

  describe('remove()', () => {
    const priceId = '507f1f77bcf86cd799439031';

    it('UT-SP-007: Menghapus harga layanan ID valid → konfirmasi penghapusan', async () => {
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
      (getServicesWithAggregation as jest.Mock).mockResolvedValueOnce([mockService]);

      const result = await service.remove(priceId, mockUser);
      expect(mockPriceWithSave.save).toHaveBeenCalled();
    });

    it('UT-SP-008: Menghapus harga dengan ID tidak ditemukan → throw NotFoundError', async () => {
      priceModel.findOne.mockReturnValue({
        exec: jest.fn().mockResolvedValue(null),
      });

      await expect(service.remove(priceId, mockUser)).rejects.toThrow(NotFoundException);
    });
  });
});
