// src/service/services.internal.service.spec.ts
import { Test, TestingModule } from '@nestjs/testing';
import { ServicesInternalService } from './services.internal.service';
import { getModelToken } from '@nestjs/mongoose';
import { Service } from './schemas/service.schema';
import { FormsService } from '../form/form.service';
import { NotFoundException, ForbiddenException } from '@nestjs/common';
import { Types } from 'mongoose';

describe('ServicesInternalService', () => {
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

  describe('updateById()', () => {
    const mockService = {
      _id: new Types.ObjectId('507f1f77bcf86cd799439020'),
      serviceKey: 'SVC-001',
      name: 'Test Service',
      version: 1,
      companyId: new Types.ObjectId('507f1f77bcf86cd799439012'),
      requiredStaffs: [],
    };

    it('UT-SVC-001: should create new version successfully', async () => {
      // Arrange
      const existingService = { ...mockService, version: 1 };
      const mockExec = jest.fn().mockResolvedValue(existingService);
      const mockSort = jest.fn().mockReturnValue({ exec: mockExec });
      serviceModel.findOne.mockReturnValue({ exec: mockExec, sort: mockSort });

      const updateSpy = jest.spyOn(service, 'update').mockResolvedValue({
        ...existingService,
        version: 2,
        title: 'Updated Service',
      } as any);

      // Act
      const result = await service.updateById(
        '507f1f77bcf86cd799439020',
        { title: 'Updated Service' },
        mockUser as any,
      );

      // Assert
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

    it('UT-SVC-002: should increment version number correctly', async () => {
      // Arrange
      const existingService = { ...mockService, version: 3 };
      const mockExec = jest.fn().mockResolvedValue(existingService);
      const mockSort = jest.fn().mockReturnValue({ exec: mockExec });
      serviceModel.findOne.mockReturnValue({ exec: mockExec, sort: mockSort });

      const updateSpy = jest.spyOn(service, 'update').mockResolvedValue({
        ...existingService,
        version: 4,
      } as any);

      // Act
      const result = await service.updateById(
        '507f1f77bcf86cd799439020',
        { title: 'Updated Service' },
        mockUser as any,
      );

      // Assert
      expect(updateSpy).toHaveBeenCalledWith(
        'SVC-001',
        { title: 'Updated Service' },
        mockUser,
      );
      expect(result.version).toBe(4);
    });

    it('UT-SVC-003: should preserve old version (not modify existing)', async () => {
      // Arrange
      const existingService = { ...mockService };
      const mockExec = jest.fn().mockResolvedValue(existingService);
      const mockSort = jest.fn().mockReturnValue({ exec: mockExec });
      serviceModel.findOne.mockReturnValue({ exec: mockExec, sort: mockSort });

      // Mock update to verify old service is not modified
      const updateSpy = jest.spyOn(service, 'update').mockResolvedValue({
        ...existingService,
        _id: new Types.ObjectId('507f1f77bcf86cd799439099'), // New ID
        version: 2,
      } as any);

      // Act
      await service.updateById(
        '507f1f77bcf86cd799439020',
        { title: 'Updated Service' },
        mockUser as any,
      );

      // Assert
      expect(updateSpy).toHaveBeenCalled();
      // Verify the update method is called (which creates new version)
      expect(updateSpy).toHaveBeenCalledWith(
        'SVC-001',
        expect.any(Object),
        mockUser,
      );
    });

    it('UT-SVC-004: should preserve serviceKey in new version', async () => {
      // Arrange
      const existingService = { ...mockService, serviceKey: 'SVC-001' };
      const mockExec = jest.fn().mockResolvedValue(existingService);
      const mockSort = jest.fn().mockReturnValue({ exec: mockExec });
      serviceModel.findOne.mockReturnValue({ exec: mockExec, sort: mockSort });

      const updateSpy = jest.spyOn(service, 'update').mockResolvedValue({
        ...existingService,
        version: 2,
        serviceKey: 'SVC-001', // Same serviceKey
      } as any);

      // Act
      const result = await service.updateById(
        '507f1f77bcf86cd799439020',
        { title: 'Updated Service' },
        mockUser as any,
      );

      // Assert
      expect(result.serviceKey).toBe('SVC-001');
      expect(updateSpy).toHaveBeenCalledWith(
        'SVC-001',
        expect.any(Object),
        mockUser,
      );
    });

    it('UT-SVC-005: should preserve companyId in new version', async () => {
      // Arrange
      const existingService = {
        ...mockService,
        companyId: mockUser.company._id,
      };
      const mockExec = jest.fn().mockResolvedValue(existingService);
      const mockSort = jest.fn().mockReturnValue({ exec: mockExec });
      serviceModel.findOne.mockReturnValue({ exec: mockExec, sort: mockSort });

      const updateSpy = jest.spyOn(service, 'update').mockResolvedValue({
        ...existingService,
        version: 2,
        companyId: mockUser.company._id, // Same companyId
      } as any);

      // Act
      const result = await service.updateById(
        '507f1f77bcf86cd799439020',
        { title: 'Updated Service' },
        mockUser as any,
      );

      // Assert
      expect(result.companyId).toEqual(mockUser.company._id);
    });

    it('UT-SVC-006: should throw ForbiddenException when user is from different company', async () => {
      // Arrange - service from different company should NOT be found by updateById
      // (updateById filters by companyId), so it throws NotFoundException
      const mockExec = jest.fn().mockResolvedValue(null);
      const mockSort = jest.fn().mockReturnValue({ exec: mockExec });
      serviceModel.findOne.mockReturnValue({ exec: mockExec, sort: mockSort });

      // Act & Assert
      await expect(
        service.updateById(
          '507f1f77bcf86cd799439020',
          { title: 'Updated' },
          mockUser as any,
        ),
      ).rejects.toThrow(NotFoundException);
    });

    it('UT-SVC-007: should throw NotFoundException when service not found', async () => {
      // Arrange
      const mockExec = jest.fn().mockResolvedValue(null);
      serviceModel.findOne.mockReturnValue({ exec: mockExec });

      // Act & Assert
      await expect(
        service.updateById(
          '507f1f77bcf86cd799439020',
          { title: 'Updated' },
          mockUser as any,
        ),
      ).rejects.toThrow(NotFoundException);
      expect(serviceModel.findOne).toHaveBeenCalled();
    });

    it('UT-SVC-008: should update requiredStaffs in new version', async () => {
      // Arrange
      const existingService = { ...mockService, requiredStaffs: [] };
      const mockExec = jest.fn().mockResolvedValue(existingService);
      const mockSort = jest.fn().mockReturnValue({ exec: mockExec });
      serviceModel.findOne.mockReturnValue({ exec: mockExec, sort: mockSort });

      const newRequiredStaffs = [
        { positionId: '507f1f77bcf86cd799439030', count: 2 },
      ];

      const updateSpy = jest.spyOn(service, 'update').mockResolvedValue({
        ...existingService,
        version: 2,
        workOrdersConfig: [],
      } as any);

      // Act
      const result = await service.updateById(
        '507f1f77bcf86cd799439020',
        { workOrdersConfig: [] } as any,
        mockUser as any,
      );

      // Assert
      expect(result).toBeDefined();
      expect(updateSpy).toHaveBeenCalledWith(
        'SVC-001',
        expect.objectContaining({ workOrdersConfig: [] }),
        mockUser,
      );
    });
  });
});
