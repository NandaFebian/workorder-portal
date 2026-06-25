import { Test, TestingModule } from '@nestjs/testing';
import { ServicesInternalService } from 'src/service/services.internal.service';
import { getModelToken } from '@nestjs/mongoose';
import { Service } from 'src/service/schemas/service.schema';
import { FormsService } from 'src/form/form.service';
import {
  NotFoundException,
  ForbiddenException,
  UnprocessableEntityException,
} from '@nestjs/common';
import { Types } from 'mongoose';

jest.mock('src/service/helpers/service-aggregation.helper', () => ({
  getServicesWithAggregation: jest.fn(),
}));
import { getServicesWithAggregation } from 'src/service/helpers/service-aggregation.helper';

describe('ServicesInternalService (Service Module)', () => {
  let service: ServicesInternalService;
  let serviceModel: any;

  const mockUser = {
    _id: '507f1f77bcf86cd799439011',
    email: 'owner@test.com',
    role: 'owner_company',
    company: {
      _id: new Types.ObjectId('507f1f77bcf86cd799439012'),
      name: 'Test Company',
    },
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ServicesInternalService,
        {
          provide: getModelToken(Service.name),
          useValue: {
            findOne: jest.fn(),
            find: jest.fn(),
            create: jest.fn(),
            updateMany: jest.fn().mockResolvedValue({ modifiedCount: 1 }),
            exec: jest.fn(),
          },
        },
        {
          provide: FormsService,
          useValue: {
            findTemplateById: jest.fn(),
            findLatestTemplateByKey: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<ServicesInternalService>(ServicesInternalService);
    serviceModel = module.get(getModelToken(Service.name));
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  // ─── updateById() — pembuatan versi baru ───

  describe('updateById()', () => {
    const mockService = {
      _id: new Types.ObjectId('507f1f77bcf86cd799439020'),
      serviceKey: 'SVC-001',
      name: 'Test Service',
      version: 1,
      companyId: new Types.ObjectId('507f1f77bcf86cd799439012'),
      requiredStaffs: [],
    };

    it('UT-SVC-001: Memperbarui service → membuat versi baru', async () => {
      const existingService = { ...mockService, version: 1 };
      const mockExec = jest.fn().mockResolvedValue(existingService);
      const mockSort = jest.fn().mockReturnValue({ exec: mockExec });
      serviceModel.findOne.mockReturnValue({ exec: mockExec, sort: mockSort });

      const updateSpy = jest.spyOn(service, 'update').mockResolvedValue({
        ...existingService,
        version: 2,
        title: 'Updated Service',
      } as any);

      const result = await service.updateById(
        '507f1f77bcf86cd799439020',
        { title: 'Updated Service' },
        mockUser as any,
      );

      expect(serviceModel.findOne).toHaveBeenCalledWith({
        _id: new Types.ObjectId('507f1f77bcf86cd799439020'),
        companyId: mockUser.company._id,
        deletedAt: null,
      });
      expect(updateSpy).toHaveBeenCalledWith(
        'SVC-001',
        { title: 'Updated Service' },
        mockUser,
      );
      expect(result.version).toBe(2);
    });

    it('UT-SVC-002: Nomor versi bertambah dengan benar', async () => {
      const existingService = { ...mockService, version: 3 };
      const mockExec = jest.fn().mockResolvedValue(existingService);
      const mockSort = jest.fn().mockReturnValue({ exec: mockExec });
      serviceModel.findOne.mockReturnValue({ exec: mockExec, sort: mockSort });

      jest.spyOn(service, 'update').mockResolvedValue({
        ...existingService,
        version: 4,
      } as any);

      const result = await service.updateById(
        '507f1f77bcf86cd799439020',
        { title: 'Updated Service' },
        mockUser as any,
      );

      expect(result.version).toBe(4);
    });

    it('UT-SVC-003: Versi lama dipertahankan (tidak dimodifikasi)', async () => {
      const existingService = { ...mockService };
      const mockExec = jest.fn().mockResolvedValue(existingService);
      const mockSort = jest.fn().mockReturnValue({ exec: mockExec });
      serviceModel.findOne.mockReturnValue({ exec: mockExec, sort: mockSort });

      const updateSpy = jest.spyOn(service, 'update').mockResolvedValue({
        ...existingService,
        _id: new Types.ObjectId('507f1f77bcf86cd799439099'),
        version: 2,
      } as any);

      await service.updateById(
        '507f1f77bcf86cd799439020',
        { title: 'Updated Service' },
        mockUser as any,
      );

      expect(updateSpy).toHaveBeenCalledWith('SVC-001', expect.any(Object), mockUser);
    });

    it('UT-SVC-004: serviceKey dipertahankan pada versi baru', async () => {
      const existingService = { ...mockService, serviceKey: 'SVC-001' };
      const mockExec = jest.fn().mockResolvedValue(existingService);
      const mockSort = jest.fn().mockReturnValue({ exec: mockExec });
      serviceModel.findOne.mockReturnValue({ exec: mockExec, sort: mockSort });

      jest.spyOn(service, 'update').mockResolvedValue({
        ...existingService,
        version: 2,
        serviceKey: 'SVC-001',
      } as any);

      const result = await service.updateById(
        '507f1f77bcf86cd799439020',
        { title: 'Updated Service' },
        mockUser as any,
      );

      expect(result.serviceKey).toBe('SVC-001');
    });

    it('UT-SVC-005: companyId dipertahankan pada versi baru', async () => {
      const existingService = { ...mockService, companyId: mockUser.company._id };
      const mockExec = jest.fn().mockResolvedValue(existingService);
      const mockSort = jest.fn().mockReturnValue({ exec: mockExec });
      serviceModel.findOne.mockReturnValue({ exec: mockExec, sort: mockSort });

      jest.spyOn(service, 'update').mockResolvedValue({
        ...existingService,
        version: 2,
        companyId: mockUser.company._id,
      } as any);

      const result = await service.updateById(
        '507f1f77bcf86cd799439020',
        { title: 'Updated Service' },
        mockUser as any,
      );

      expect(result.companyId).toEqual(mockUser.company._id);
    });

    it('UT-SVC-006: User dari company berbeda → throw NotFoundException', async () => {
      const mockExec = jest.fn().mockResolvedValue(null);
      const mockSort = jest.fn().mockReturnValue({ exec: mockExec });
      serviceModel.findOne.mockReturnValue({ exec: mockExec, sort: mockSort });

      await expect(
        service.updateById(
          '507f1f77bcf86cd799439020',
          { title: 'Updated' },
          mockUser as any,
        ),
      ).rejects.toThrow(NotFoundException);
    });

    it('UT-SVC-007: Service tidak ditemukan → throw NotFoundException', async () => {
      const mockExec = jest.fn().mockResolvedValue(null);
      serviceModel.findOne.mockReturnValue({ exec: mockExec });

      await expect(
        service.updateById(
          '507f1f77bcf86cd799439020',
          { title: 'Updated' },
          mockUser as any,
        ),
      ).rejects.toThrow(NotFoundException);
    });

    it('UT-SVC-008: Memperbarui requiredStaffs pada versi baru', async () => {
      const existingService = { ...mockService, requiredStaffs: [] };
      const mockExec = jest.fn().mockResolvedValue(existingService);
      const mockSort = jest.fn().mockReturnValue({ exec: mockExec });
      serviceModel.findOne.mockReturnValue({ exec: mockExec, sort: mockSort });

      const updateSpy = jest.spyOn(service, 'update').mockResolvedValue({
        ...existingService,
        version: 2,
        workOrdersConfig: [],
      } as any);

      const result = await service.updateById(
        '507f1f77bcf86cd799439020',
        { workOrdersConfig: [] } as any,
        mockUser as any,
      );

      expect(result).toBeDefined();
      expect(updateSpy).toHaveBeenCalledWith(
        'SVC-001',
        expect.objectContaining({ workOrdersConfig: [] }),
        mockUser,
      );
    });
  });

  // ─── findAll() ───

  describe('findAll()', () => {
    it('UT-SVC-009: Mengambil seluruh service milik company → array service', async () => {
      (getServicesWithAggregation as jest.Mock).mockResolvedValue([
        { _id: 'svc1', title: 'Layanan A', workOrdersConfig: [] },
      ]);

      const result = await service.findAll(mockUser as any);

      expect(result).toHaveLength(1);
      expect(getServicesWithAggregation).toHaveBeenCalled();
    });

    it('UT-SVC-010: findAll oleh user tanpa company → throw ForbiddenException', async () => {
      await expect(
        service.findAll({ ...mockUser, company: undefined } as any),
      ).rejects.toThrow(ForbiddenException);
    });
  });

  // ─── findByVersionId() ───

  describe('findByVersionId()', () => {
    const svcId = '507f1f77bcf86cd799439020';

    it('UT-SVC-011: Mengambil detail service versi tertentu → object service', async () => {
      (getServicesWithAggregation as jest.Mock).mockResolvedValue([
        { _id: svcId, title: 'Layanan A', workOrdersConfig: [] },
      ]);

      const result = await service.findByVersionId(svcId, mockUser as any);

      expect(result).toBeDefined();
      expect(result.title).toBe('Layanan A');
    });

    it('UT-SVC-012: Mengambil detail service yang tidak ditemukan → throw NotFoundException', async () => {
      (getServicesWithAggregation as jest.Mock).mockResolvedValue([]);

      await expect(
        service.findByVersionId(svcId, mockUser as any),
      ).rejects.toThrow(NotFoundException);
    });
  });

  // ─── toggleActive() ───

  describe('toggleActive()', () => {
    const svcId = '507f1f77bcf86cd799439020';

    it('UT-SVC-013: Mengaktifkan/menonaktifkan service → seluruh versi diperbarui', async () => {
      serviceModel.findOne.mockReturnValue({
        exec: jest.fn().mockResolvedValue({ serviceKey: 'SVC-001' }),
      });
      (getServicesWithAggregation as jest.Mock).mockResolvedValue([
        { _id: svcId, isActive: false },
      ]);

      const result = await service.toggleActive(svcId, false, mockUser as any);

      expect(serviceModel.updateMany).toHaveBeenCalledWith(
        { serviceKey: 'SVC-001', companyId: mockUser.company._id },
        { $set: { isActive: false } },
      );
      expect(result).toBeDefined();
    });
  });

  // ─── removeById() ───

  describe('removeById()', () => {
    const svcId = '507f1f77bcf86cd799439020';

    it('UT-SVC-014: Menghapus service versi terbaru → soft-delete seluruh versi', async () => {
      (getServicesWithAggregation as jest.Mock).mockResolvedValue([
        { _id: svcId, title: 'Layanan A', workOrdersConfig: [] },
      ]);
      serviceModel.findOne.mockReturnValue({
        exec: jest.fn().mockResolvedValue({ serviceKey: 'SVC-001' }),
        sort: jest.fn().mockReturnValue({
          exec: jest.fn().mockResolvedValue({
            _id: new Types.ObjectId(svcId),
          }),
        }),
      });

      const result = await service.removeById(svcId, mockUser as any);

      expect(serviceModel.updateMany).toHaveBeenCalled();
      expect(result.deletedAt).toBeDefined();
    });

    it('UT-SVC-015: Menghapus service yang tidak ditemukan → throw NotFoundException', async () => {
      (getServicesWithAggregation as jest.Mock).mockResolvedValue([]);

      await expect(
        service.removeById(svcId, mockUser as any),
      ).rejects.toThrow(NotFoundException);
    });
  });
});
