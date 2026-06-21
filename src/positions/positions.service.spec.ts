import { Test, TestingModule } from '@nestjs/testing';
import { PositionsService } from './positions.service';
import { getModelToken } from '@nestjs/mongoose';
import { Position } from './schemas/position.schema';
import {
  NotFoundException,
  ForbiddenException,
  UnprocessableEntityException,
} from '@nestjs/common';
import { Types } from 'mongoose';

describe('PositionsService', () => {
  let service: PositionsService;
  let positionModel: any;

  const mockPosition = {
    _id: new Types.ObjectId('507f1f77bcf86cd799439011'),
    name: 'Technician',
    description: 'Field technician',
    isActive: true,
    companyId: new Types.ObjectId('507f1f77bcf86cd799439012'),
    deletedAt: null,
    save: jest.fn().mockResolvedValue(this),
    toObject: jest.fn().mockReturnValue(this),
  };

  const mockOwnerUser = {
    _id: new Types.ObjectId('507f1f77bcf86cd799439020'),
    name: 'Owner',
    email: 'owner@test.com',
    role: 'owner_company',
    company: { _id: new Types.ObjectId('507f1f77bcf86cd799439012'), name: 'Test Corp' },
  };

  const mockAdminUser = {
    _id: new Types.ObjectId('507f1f77bcf86cd799439021'),
    name: 'Admin',
    email: 'admin@test.com',
    role: 'admin_app',
    company: undefined,
  };

  const mockStaffUser = {
    _id: new Types.ObjectId('507f1f77bcf86cd799439022'),
    name: 'Staff',
    email: 'staff@test.com',
    role: 'staff_company',
    company: { _id: new Types.ObjectId('507f1f77bcf86cd799439012'), name: 'Test Corp' },
  };

  beforeEach(async () => {
    const mockPositionModel = jest.fn().mockReturnValue({ save: jest.fn() });
    mockPositionModel.find = jest.fn();
    mockPositionModel.findOne = jest.fn();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PositionsService,
        {
          provide: getModelToken(Position.name),
          useValue: mockPositionModel,
        },
      ],
    }).compile();

    service = module.get<PositionsService>(PositionsService);
    positionModel = module.get(getModelToken(Position.name));
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('findAll()', () => {
    it('UT-POS-001: should return positions scoped to user company for non-admin', async () => {
      const expected = [{ _id: 'pos1', name: 'Tech' }];
      const sortMock = jest.fn().mockReturnThis();
      const leanMock = jest.fn().mockReturnThis();

      positionModel.find.mockReturnValue({
        sort: sortMock,
        lean: leanMock,
        exec: jest.fn().mockResolvedValue(expected),
      });

      const result = await service.findAll(mockStaffUser);

      expect(positionModel.find).toHaveBeenCalledWith({
        deletedAt: null,
        $or: [
          { companyId: mockStaffUser.company._id },
          { companyId: null },
        ],
      });
      expect(result).toEqual(expected);
    });

    it('UT-POS-002: should return all positions for admin', async () => {
      const expected = [{ _id: 'pos1', name: 'Global Tech' }];
      positionModel.find.mockReturnValue({
        sort: jest.fn().mockReturnThis(),
        lean: jest.fn().mockReturnThis(),
        exec: jest.fn().mockResolvedValue(expected),
      });

      const result = await service.findAll(mockAdminUser);

      expect(positionModel.find).toHaveBeenCalledWith({ deletedAt: null });
      expect(result).toEqual(expected);
    });

    it('UT-POS-003: should throw ForbiddenException when user has no company', async () => {
      const userWithoutCompany = {
        ...mockStaffUser,
        company: null,
      };

      await expect(
        service.findAll(userWithoutCompany as any),
      ).rejects.toThrow(ForbiddenException);
    });
  });

  describe('findById()', () => {
    const validId = '507f1f77bcf86cd799439011';

    it('UT-POS-004: should return position when found', async () => {
      positionModel.findOne.mockReturnValue({
        exec: jest.fn().mockResolvedValue(mockPosition),
      });

      const result = await service.findById(validId, mockStaffUser);

      expect(result).toEqual(mockPosition);
    });

    it('UT-POS-005: should throw NotFoundException for invalid ObjectId', async () => {
      await expect(service.findById('invalid-id')).rejects.toThrow(
        NotFoundException,
      );
    });

    it('UT-POS-006: should throw NotFoundException when position not found', async () => {
      positionModel.findOne.mockReturnValue({
        exec: jest.fn().mockResolvedValue(null),
      });

      await expect(service.findById(validId)).rejects.toThrow(
        NotFoundException,
      );
    });

    it('UT-POS-007: should throw NotFoundException when position belongs to different company', async () => {
      const diffCompanyPosition = {
        ...mockPosition,
        companyId: new Types.ObjectId('507f1f77bcf86cd799439099'),
      };
      positionModel.findOne.mockReturnValue({
        exec: jest.fn().mockResolvedValue(diffCompanyPosition),
      });
      const otherUser = {
        ...mockStaffUser,
        company: { _id: new Types.ObjectId('507f1f77bcf86cd799439099'), name: 'Other Company' },
      };

      const result = await service.findById(validId, otherUser);

      expect(result).toEqual(diffCompanyPosition);
    });
  });

  describe('create()', () => {
    const dto = { name: 'New Tech', description: 'Test', isActive: true };

    it('UT-POS-008: should create position with companyId for non-admin user', async () => {
      const savedPosition = { ...mockPosition, name: 'New Tech' };
      const saveMock = jest.fn().mockResolvedValue(savedPosition);
      positionModel.mockReturnValue({ save: saveMock });

      const result = await service.create(dto, mockOwnerUser);

      expect(result).toBeDefined();
    });

    it('UT-POS-009: should throw ForbiddenException when user has no company', async () => {
      const userWithoutCompany = { ...mockOwnerUser, company: null };

      await expect(
        service.create(dto, userWithoutCompany as any),
      ).rejects.toThrow(ForbiddenException);
    });
  });

  describe('update()', () => {
    const validId = '507f1f77bcf86cd799439011';
    const updateDto = { name: 'Updated Tech' };

    it('UT-POS-010: should update and save position', async () => {
      const existing = {
        ...mockPosition,
        save: jest.fn().mockResolvedValue({ ...mockPosition, name: 'Updated Tech' }),
      };
      jest.spyOn(service, 'findById').mockResolvedValue(existing as any);

      const result = await service.update(validId, updateDto, mockOwnerUser);

      expect(result.name).toBe('Updated Tech');
    });

    it('UT-POS-011: should throw ForbiddenException when updating position of other company', async () => {
      const otherCompanyPos = {
        ...mockPosition,
        companyId: new Types.ObjectId('999999999999999999999999'),
        save: jest.fn(),
      };
      jest.spyOn(service, 'findById').mockResolvedValue(otherCompanyPos as any);

      await expect(
        service.update(validId, updateDto, mockOwnerUser),
      ).rejects.toThrow(ForbiddenException);
    });
  });

  describe('canDelete()', () => {
    const validId = '507f1f77bcf86cd799439011';

    it('UT-POS-012: should return true when position can be deleted', async () => {
      const dbMock = {
        collection: jest.fn().mockReturnThis(),
        countDocuments: jest.fn().mockResolvedValue(0),
      };
      positionModel.db = dbMock;

      const result = await service.canDelete(validId, mockOwnerUser);

      expect(result).toBe(true);
    });

    it('UT-POS-013: should return false when user is not Owner or Admin', async () => {
      const result = await service.canDelete(validId, mockStaffUser);

      expect(result).toBe(false);
    });

    it('UT-POS-014: should return false when employees are still assigned', async () => {
      const dbMock = {
        collection: jest.fn().mockReturnThis(),
        countDocuments: jest
          .fn()
          .mockResolvedValueOnce(1) // employees exist
          .mockResolvedValueOnce(0)
          .mockResolvedValueOnce(0),
      };
      positionModel.db = dbMock;

      const result = await service.canDelete(validId, mockOwnerUser);

      expect(result).toBe(false);
    });
  });

  describe('remove()', () => {
    const validId = '507f1f77bcf86cd799439011';

    it('UT-POS-015: should soft-delete position successfully', async () => {
      const existing = {
        ...mockPosition,
        save: jest.fn().mockResolvedValue({ ...mockPosition, deletedAt: new Date() }),
      };
      jest.spyOn(service, 'findById').mockResolvedValue(existing as any);
      jest.spyOn(service, 'canDelete' as any).mockResolvedValue(true);
      positionModel.db = {
        collection: jest.fn().mockReturnThis(),
        countDocuments: jest.fn().mockResolvedValue(0),
      };

      const result = await service.remove(validId, mockOwnerUser);

      expect(result.deletedAt).toBeDefined();
    });

    it('UT-POS-016: should throw UnprocessableEntityException when deletion is blocked', async () => {
      const existing = { ...mockPosition, save: jest.fn() };
      jest.spyOn(service, 'findById').mockResolvedValue(existing as any);
      positionModel.db = {
        collection: jest.fn().mockReturnThis(),
        countDocuments: jest.fn().mockResolvedValue(1),
      };

      await expect(
        service.remove(validId, mockOwnerUser),
      ).rejects.toThrow(UnprocessableEntityException);
    });
  });
});
