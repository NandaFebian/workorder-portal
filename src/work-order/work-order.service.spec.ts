// src/work-order/work-order.service.spec.ts
import { Test, TestingModule } from '@nestjs/testing';
import { WorkOrderService } from './work-order.service';
import { getModelToken } from '@nestjs/mongoose';
import { WorkOrder } from './schemas/work-order.schema';
import { FormSubmission } from '../service/schemas/form-submission.schema';
import { FormsService } from '../form/form.service';
import { UsersService } from '../users/users.service';
import { WorkReportService } from '../work-report/work-report.service';
import {
  NotFoundException,
  BadRequestException,
  ForbiddenException,
} from '@nestjs/common';
import { Types } from 'mongoose';

describe('WorkOrderService', () => {
  let service: WorkOrderService;
  let workOrderModel: any;
  let usersService: UsersService;

  const mockUser = {
    _id: '507f1f77bcf86cd799439011',
    email: 'owner@test.com',
    role: 'owner_company',
    company: {
      _id: '507f1f77bcf86cd799439012',
      name: 'Test Company',
    },
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        WorkOrderService,
        {
          provide: getModelToken(WorkOrder.name),
          useValue: {
            findOne: jest.fn(),
            find: jest.fn(),
            create: jest.fn(),
            save: jest.fn(),
          },
        },
        {
          provide: getModelToken(FormSubmission.name),
          useValue: {
            find: jest.fn(),
            create: jest.fn(),
          },
        },
        {
          provide: FormsService,
          useValue: {
            findTemplateById: jest.fn(),
          },
        },
        {
          provide: UsersService,
          useValue: {
            findOneByEmail: jest.fn(),
          },
        },
        {
          provide: WorkReportService,
          useValue: {
            findByWorkOrderId: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<WorkOrderService>(WorkOrderService);
    workOrderModel = module.get(getModelToken(WorkOrder.name));
    usersService = module.get<UsersService>(UsersService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('updateStatus()', () => {
    const mockWorkOrder: any = {
      _id: '507f1f77bcf86cd799439013',
      companyId: '507f1f77bcf86cd799439012',
      status: 'drafted',
      startedAt: null as Date | null,
      completedAt: null as Date | null,
      save: jest.fn(),
    };

    it('UT-WO-001: should update status from drafted to ready', async () => {
      // Arrange
      const wo = { ...mockWorkOrder, status: 'drafted' };
      workOrderModel.findOne.mockResolvedValue(wo);
      jest.spyOn(service, 'findOneInternal').mockResolvedValue(wo);

      // Act
      const result = await service.updateStatus(
        '507f1f77bcf86cd799439013',
        { status: 'ready' },
        mockUser as any,
      );

      // Assert
      expect(workOrderModel.findOne).toHaveBeenCalledWith({
        _id: '507f1f77bcf86cd799439013',
        companyId: mockUser.company._id,
        deletedAt: null,
      });
      expect(wo.status).toBe('ready');
      expect(wo.save).toHaveBeenCalled();
    });

    it('UT-WO-002: should update status to in_progress and set startedAt', async () => {
      // Arrange
      const wo = { ...mockWorkOrder, status: 'ready', startedAt: null };
      workOrderModel.findOne.mockResolvedValue(wo);
      jest.spyOn(service, 'findOneInternal').mockResolvedValue(wo);
      const beforeTime = new Date();

      // Act
      await service.updateStatus(
        '507f1f77bcf86cd799439013',
        { status: 'in_progress' },
        mockUser as any,
      );

      // Assert
      expect(wo.status).toBe('in_progress');
      expect(wo.startedAt).toBeInstanceOf(Date);
      expect(wo.startedAt!.getTime()).toBeGreaterThanOrEqual(
        beforeTime.getTime(),
      );
      expect(wo.save).toHaveBeenCalled();
    });

    it('UT-WO-003: should update status to completed and set completedAt', async () => {
      // Arrange
      const wo = { ...mockWorkOrder, status: 'in_progress', completedAt: null };
      workOrderModel.findOne.mockResolvedValue(wo);
      jest.spyOn(service, 'findOneInternal').mockResolvedValue(wo);
      const beforeTime = new Date();

      // Act
      await service.updateStatus(
        '507f1f77bcf86cd799439013',
        { status: 'completed' },
        mockUser as any,
      );

      // Assert
      expect(wo.status).toBe('completed');
      expect(wo.completedAt).toBeInstanceOf(Date);
      expect(wo.completedAt!.getTime()).toBeGreaterThanOrEqual(
        beforeTime.getTime(),
      );
      expect(wo.save).toHaveBeenCalled();
    });

    it('UT-WO-004: should allow invalid transition from drafted to completed (no validation)', async () => {
      // Arrange
      // Note: Current implementation doesn't validate state transitions
      const wo = { ...mockWorkOrder, status: 'drafted' };
      workOrderModel.findOne.mockResolvedValue(wo);
      jest.spyOn(service, 'findOneInternal').mockResolvedValue(wo);

      // Act
      await service.updateStatus(
        '507f1f77bcf86cd799439013',
        { status: 'completed' },
        mockUser as any,
      );

      // Assert
      expect(wo.status).toBe('completed');
      expect(wo.save).toHaveBeenCalled();
    });

    it('UT-WO-005: should allow invalid transition from completed to ready (no validation)', async () => {
      // Arrange
      // Note: Current implementation doesn't validate state transitions
      const wo = { ...mockWorkOrder, status: 'completed' };
      workOrderModel.findOne.mockResolvedValue(wo);
      jest.spyOn(service, 'findOneInternal').mockResolvedValue(wo);

      // Act
      await service.updateStatus(
        '507f1f77bcf86cd799439013',
        { status: 'ready' },
        mockUser as any,
      );

      // Assert
      expect(wo.status).toBe('ready');
      expect(wo.save).toHaveBeenCalled();
    });

    it('UT-WO-006: should validate startedAt timestamp is close to current time', async () => {
      // Arrange
      const wo = { ...mockWorkOrder, status: 'ready', startedAt: null };
      workOrderModel.findOne.mockResolvedValue(wo);
      jest.spyOn(service, 'findOneInternal').mockResolvedValue(wo);
      const beforeTime = Date.now();

      // Act
      await service.updateStatus(
        '507f1f77bcf86cd799439013',
        { status: 'in_progress' },
        mockUser as any,
      );

      // Assert
      const afterTime = Date.now();
      expect(wo.startedAt).toBeInstanceOf(Date);
      expect(wo.startedAt!.getTime()).toBeGreaterThanOrEqual(beforeTime);
      expect(wo.startedAt!.getTime()).toBeLessThanOrEqual(afterTime);
    });

    it('UT-WO-007: should validate completedAt timestamp is a Date object', async () => {
      // Arrange
      const wo = { ...mockWorkOrder, status: 'in_progress', completedAt: null };
      workOrderModel.findOne.mockResolvedValue(wo);
      jest.spyOn(service, 'findOneInternal').mockResolvedValue(wo);

      // Act
      await service.updateStatus(
        '507f1f77bcf86cd799439013',
        { status: 'completed' },
        mockUser as any,
      );

      // Assert
      expect(wo.completedAt).toBeInstanceOf(Date);
    });

    it('UT-WO-008: should throw NotFoundException when work order not found', async () => {
      // Arrange
      workOrderModel.findOne.mockResolvedValue(null);

      // Act & Assert
      await expect(
        service.updateStatus(
          '507f1f77bcf86cd799439013',
          { status: 'ready' },
          mockUser as any,
        ),
      ).rejects.toThrow(NotFoundException);
      expect(workOrderModel.findOne).toHaveBeenCalled();
    });

    it('UT-WO-009: should throw BadRequestException when user company info is missing', async () => {
      // Arrange
      const userWithoutCompany = { ...mockUser, company: null };

      // Act & Assert
      await expect(
        service.updateStatus(
          '507f1f77bcf86cd799439013',
          { status: 'ready' },
          userWithoutCompany as any,
        ),
      ).rejects.toThrow(BadRequestException);
    });
  });

  describe('assignStaff()', () => {
    const mockWorkOrder = {
      _id: '507f1f77bcf86cd799439013',
      companyId: '507f1f77bcf86cd799439012',
      assignedStaffs: [],
      save: jest.fn(),
    };

    const mockStaff = {
      _id: '507f1f77bcf86cd799439020',
      email: 'staff@test.com',
      companyId: '507f1f77bcf86cd799439012',
    };

    it('UT-WO-010: should assign staff successfully for owner role', async () => {
      // Arrange
      workOrderModel.findOne.mockResolvedValue(mockWorkOrder);
      jest
        .spyOn(usersService, 'findOneByEmail')
        .mockResolvedValue(mockStaff as any);
      jest
        .spyOn(service, 'findOneInternal')
        .mockResolvedValue(mockWorkOrder as any);

      // Act
      await service.assignStaff(
        '507f1f77bcf86cd799439013',
        { staffEmail: ['staff@test.com'] },
        mockUser as any,
      );

      // Assert
      expect(usersService.findOneByEmail).toHaveBeenCalledWith(
        'staff@test.com',
      );
      expect(mockWorkOrder.assignedStaffs).toContain(mockStaff._id);
      expect(mockWorkOrder.save).toHaveBeenCalled();
    });

    it('UT-WO-011: should assign staff successfully for manager role', async () => {
      // Arrange
      const managerUser = { ...mockUser, role: 'manager_company' };
      workOrderModel.findOne.mockResolvedValue(mockWorkOrder);
      jest
        .spyOn(usersService, 'findOneByEmail')
        .mockResolvedValue(mockStaff as any);
      jest
        .spyOn(service, 'findOneInternal')
        .mockResolvedValue(mockWorkOrder as any);

      // Act
      await service.assignStaff(
        '507f1f77bcf86cd799439013',
        { staffEmail: ['staff@test.com'] },
        managerUser as any,
      );

      // Assert
      expect(mockWorkOrder.assignedStaffs).toContain(mockStaff._id);
      expect(mockWorkOrder.save).toHaveBeenCalled();
    });

    it('UT-WO-012: should allow staff role to assign (no role validation in current implementation)', async () => {
      // Arrange
      // Note: Current implementation doesn't validate user role for assignment
      const staffUser = { ...mockUser, role: 'staff_company' };
      workOrderModel.findOne.mockResolvedValue(mockWorkOrder);
      jest
        .spyOn(usersService, 'findOneByEmail')
        .mockResolvedValue(mockStaff as any);
      jest
        .spyOn(service, 'findOneInternal')
        .mockResolvedValue(mockWorkOrder as any);

      // Act
      await service.assignStaff(
        '507f1f77bcf86cd799439013',
        { staffEmail: ['staff@test.com'] },
        staffUser as any,
      );

      // Assert
      expect(mockWorkOrder.save).toHaveBeenCalled();
    });

    it('UT-WO-013: should throw BadRequestException when staff is from different company', async () => {
      // Arrange
      const staffFromDifferentCompany = {
        ...mockStaff,
        companyId: '507f1f77bcf86cd799439099',
      };
      workOrderModel.findOne.mockResolvedValue(mockWorkOrder);
      jest
        .spyOn(usersService, 'findOneByEmail')
        .mockResolvedValue(staffFromDifferentCompany as any);

      // Act & Assert
      await expect(
        service.assignStaff(
          '507f1f77bcf86cd799439013',
          { staffEmail: ['staff@test.com'] },
          mockUser as any,
        ),
      ).rejects.toThrow(BadRequestException);
    });

    it('UT-WO-014: should handle empty staffIds array', async () => {
      // Arrange
      workOrderModel.findOne.mockResolvedValue(mockWorkOrder);
      jest
        .spyOn(service, 'findOneInternal')
        .mockResolvedValue(mockWorkOrder as any);

      // Act
      await service.assignStaff(
        '507f1f77bcf86cd799439013',
        { staffEmail: [] },
        mockUser as any,
      );

      // Assert
      expect(mockWorkOrder.assignedStaffs).toEqual([]);
      expect(mockWorkOrder.save).toHaveBeenCalled();
    });

    it('UT-WO-015: should assign multiple staff members', async () => {
      // Arrange
      const staff1 = {
        ...mockStaff,
        _id: '507f1f77bcf86cd799439020',
        email: 'staff1@test.com',
      };
      const staff2 = {
        ...mockStaff,
        _id: '507f1f77bcf86cd799439021',
        email: 'staff2@test.com',
      };
      const staff3 = {
        ...mockStaff,
        _id: '507f1f77bcf86cd799439022',
        email: 'staff3@test.com',
      };

      workOrderModel.findOne.mockResolvedValue(mockWorkOrder);
      jest
        .spyOn(usersService, 'findOneByEmail')
        .mockResolvedValueOnce(staff1 as any)
        .mockResolvedValueOnce(staff2 as any)
        .mockResolvedValueOnce(staff3 as any);
      jest
        .spyOn(service, 'findOneInternal')
        .mockResolvedValue(mockWorkOrder as any);

      // Act
      await service.assignStaff(
        '507f1f77bcf86cd799439013',
        {
          staffEmail: ['staff1@test.com', 'staff2@test.com', 'staff3@test.com'],
        },
        mockUser as any,
      );

      // Assert
      expect(usersService.findOneByEmail).toHaveBeenCalledTimes(3);
      expect(mockWorkOrder.assignedStaffs).toHaveLength(3);
      expect(mockWorkOrder.save).toHaveBeenCalled();
    });

    it('UT-WO-016: should validate each staff email during assignment', async () => {
      // Arrange
      workOrderModel.findOne.mockResolvedValue(mockWorkOrder);
      const findByEmailSpy = jest
        .spyOn(usersService, 'findOneByEmail')
        .mockResolvedValue(mockStaff as any);
      jest
        .spyOn(service, 'findOneInternal')
        .mockResolvedValue(mockWorkOrder as any);

      // Act
      await service.assignStaff(
        '507f1f77bcf86cd799439013',
        { staffEmail: ['staff1@test.com', 'staff2@test.com'] },
        mockUser as any,
      );

      // Assert
      expect(findByEmailSpy).toHaveBeenCalledWith('staff1@test.com');
      expect(findByEmailSpy).toHaveBeenCalledWith('staff2@test.com');
      expect(findByEmailSpy).toHaveBeenCalledTimes(2);
    });
  });
});
