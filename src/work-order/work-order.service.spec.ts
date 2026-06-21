import { Test, TestingModule } from '@nestjs/testing';
import { WorkOrderService } from './work-order.service';
import { getModelToken } from '@nestjs/mongoose';
import { WorkOrder } from './schemas/work-order.schema';
import { FormSubmission } from '../form/schemas/form-submissions.schema';
import { FormsService } from '../form/form.service';
import { UsersService } from '../users/users.service';
import { WorkReportService } from '../work-report/work-report.service';
import { ServiceRequestService } from '../service-request/service-request.service';
import { FcmService } from '../fcm/fcm.service';
import { Types } from 'mongoose';
import {
  NotFoundException,
  ForbiddenException,
  UnprocessableEntityException,
} from '@nestjs/common';

jest.mock('src/common/utils/generate-code.util', () => ({
  generateCode: jest.fn(() => 'WO-TEST-001'),
}));

describe('WorkOrderService', () => {
  let service: WorkOrderService;
  let workOrderModel: any;
  let submissionModel: any;
  let formsService: any;
  let usersService: any;
  let workReportService: any;
  let serviceRequestService: any;
  let fcmService: any;

  const mockManager = {
    _id: new Types.ObjectId('507f1f77bcf86cd799439010'),
    role: 'manager_company',
    name: 'Manager',
    email: 'manager@test.com',
    company: { _id: new Types.ObjectId('507f1f77bcf86cd799439001'), name: 'Test Corp' },
    position: { _id: new Types.ObjectId('507f1f77bcf86cd799439040') },
  };

  const mockStaff = {
    _id: new Types.ObjectId('507f1f77bcf86cd799439011'),
    role: 'staff_company',
    name: 'Staff',
    email: 'staff@test.com',
    company: { _id: new Types.ObjectId('507f1f77bcf86cd799439001'), name: 'Test Corp' },
    position: { _id: new Types.ObjectId('507f1f77bcf86cd799439041') },
  };

  const mockWO = {
    _id: '507f1f77bcf86cd799439020',
    code: 'WO-001',
    serviceRequestId: null,
    serviceId: '507f1f77bcf86cd799439030',
    companyId: '507f1f77bcf86cd799439001',
    createdBy: '507f1f77bcf86cd799439010',
    staffPIC: null,
    assignedStaff: [],
    positionId: '507f1f77bcf86cd799439040',
    workOrderApprovalAccessType: 'auto',
    workReportApprovalAccessType: 'auto',
    minStaff: 1,
    maxStaff: 2,
    status: 'drafted',
    deletedAt: null,
    save: jest.fn().mockResolvedValue(this),
    populate: jest.fn().mockResolvedValue(this),
    toObject: jest.fn().mockReturnValue({
      _id: '507f1f77bcf86cd799439020',
      code: 'WO-001',
      status: 'drafted',
    }),
  };

  beforeEach(async () => {
    const mockWOModel = {
      create: jest.fn(),
      find: jest.fn(),
      findOne: jest.fn(),
      findByIdAndUpdate: jest.fn(),
      new: jest.fn(),
      db: {
        model: jest.fn().mockReturnValue({
          findOne: jest.fn().mockResolvedValue(null),
        }),
      },
    };
    const mockSubModel = {
      create: jest.fn(),
      find: jest.fn(),
    };
    const mockForms = {
      findTemplateById: jest.fn(),
      findLatestTemplateByKey: jest.fn(),
    };
    const mockUsers = {
      findByPositionId: jest.fn(),
      findById: jest.fn(),
      findAllByCompanyId: jest.fn(),
    };
    const mockWR = {
      findByWorkOrderId: jest.fn().mockResolvedValue(null),
    };
    const mockSR = {};
    const mockFcm = {
      sendToUser: jest.fn(),
      markAsReadByResource: jest.fn().mockReturnValue({ catch: jest.fn() }),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        WorkOrderService,
        { provide: getModelToken(WorkOrder.name), useValue: mockWOModel },
        { provide: getModelToken(FormSubmission.name), useValue: mockSubModel },
        { provide: FormsService, useValue: mockForms },
        { provide: UsersService, useValue: mockUsers },
        { provide: WorkReportService, useValue: mockWR },
        { provide: ServiceRequestService, useValue: mockSR },
        { provide: FcmService, useValue: mockFcm },
      ],
    }).compile();

    service = module.get<WorkOrderService>(WorkOrderService);
    workOrderModel = module.get(getModelToken(WorkOrder.name));
    submissionModel = module.get(getModelToken(FormSubmission.name));
    formsService = module.get<FormsService>(FormsService);
    usersService = module.get<UsersService>(UsersService);
    fcmService = module.get<FcmService>(FcmService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('validateAutoAssignForConfigs()', () => {
    it('UT-WO-001: should pass when enough staff are available', async () => {
      usersService.findByPositionId.mockResolvedValue([
        { _id: 'staff1', companyId: '507f1f77bcf86cd799439001', role: 'staff_company' },
        { _id: 'staff2', companyId: '507f1f77bcf86cd799439001', role: 'staff_company' },
      ]);

      await expect(
        service.validateAutoAssignForConfigs(
          [{ positionId: 'pos1', minStaff: 1 }],
          '507f1f77bcf86cd799439001',
        ),
      ).resolves.not.toThrow();
    });

    it('UT-WO-002: should throw when not enough staff available', async () => {
      usersService.findByPositionId.mockResolvedValue([]);

      await expect(
        service.validateAutoAssignForConfigs(
          [{ positionId: 'pos1', minStaff: 1 }],
          '507f1f77bcf86cd799439001',
        ),
      ).rejects.toThrow(UnprocessableEntityException);
    });
  });

  describe('create()', () => {
    it('UT-WO-003: should create a work order', async () => {
      const createDto = {
        serviceRequestId: null,
        serviceId: '507f1f77bcf86cd799439030',
        workOrderApprovalAccessType: 'auto',
        workReportApprovalAccessType: 'auto',
      };

      workOrderModel.create.mockResolvedValue(mockWO);

      const result = await service.create(createDto, mockManager);
      expect(result).toBeDefined();
    });
  });

  describe('findAll()', () => {
    it('UT-WO-004: should return all work orders for user company', async () => {
      const expected = [{ _id: 'wo1', code: 'WO-001' }];
      const sortMock = jest.fn().mockReturnThis();
      const populateMock = jest.fn().mockReturnThis();
      const leanMock = jest.fn().mockReturnThis();
      workOrderModel.find.mockReturnValue({
        sort: sortMock,
        populate: populateMock,
        lean: leanMock,
        exec: jest.fn().mockResolvedValue(expected),
      });

      const result = await service.findAllInternal(mockManager, {});
      expect(result).toEqual(expected);
    });
  });

  describe('findOne()', () => {
    const woId = '507f1f77bcf86cd799439020';

    it('UT-WO-005: should return work order when found', async () => {
      workOrderModel.findOne.mockReturnValue({
        populate: jest.fn().mockReturnThis(),
        exec: jest.fn().mockResolvedValue(mockWO),
      });

      const result = await service.findOneInternal(woId, mockManager);
      expect(result).toBeDefined();
    });

    it('UT-WO-006: should throw NotFoundException when not found', async () => {
      workOrderModel.findOne.mockReturnValue({
        populate: jest.fn().mockReturnThis(),
        exec: jest.fn().mockResolvedValue(null),
      });

      await expect(service.findOneInternal(woId, mockManager)).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('update()', () => {
    const woId = '507f1f77bcf86cd799439020';

    it('UT-WO-007: should update work order successfully', async () => {
      const existingWO = {
        ...mockWO,
        save: jest.fn().mockResolvedValue({ ...mockWO, description: 'Updated' }),
      };
      workOrderModel.findOne.mockReturnValue({
        populate: jest.fn().mockReturnThis(),
        exec: jest.fn().mockResolvedValue(existingWO),
      });

      const result = await service.update(woId, { description: 'Updated' }, mockManager);
      expect(result).toBeDefined();
    });
  });

  describe('assignStaff()', () => {
    const woId = '507f1f77bcf86cd799439020';

    it('UT-WO-008: should assign staff to work order', async () => {
      const existingWO = {
        ...mockWO,
        status: 'drafted',
        save: jest.fn().mockResolvedValue(mockWO),
      };
      workOrderModel.findOne.mockReturnValue({
        populate: jest.fn().mockReturnThis(),
        exec: jest.fn().mockResolvedValue(existingWO),
      });

      const result = await service.assignStaff(
        woId,
        { staff_pic: 'pic@test.com', assign_staffs: ['staff@test.com'] },
        mockManager,
      );
      expect(result).toBeDefined();
    });
  });

  describe('markAsSent()', () => {
    const woId = '507f1f77bcf86cd799439020';

    it('UT-WO-009: should mark work order as sent', async () => {
      const existingWO = {
        ...mockWO,
        status: 'drafted',
        save: jest.fn().mockResolvedValue({ ...mockWO, status: 'sent' }),
      };
      workOrderModel.findOne.mockReturnValue({
        populate: jest.fn().mockReturnThis(),
        exec: jest.fn().mockResolvedValue(existingWO),
      });

      const result = await service.markAsSent(woId, mockManager);
      expect(result).toBeDefined();
    });

    it('UT-WO-010: should throw BadRequestException for invalid status transition', async () => {
      const completedWO = { ...mockWO, status: 'completed' };
      workOrderModel.findOne.mockReturnValue({
        populate: jest.fn().mockReturnThis(),
        exec: jest.fn().mockResolvedValue(completedWO),
      });

      await expect(service.markAsSent(woId, mockManager)).rejects.toThrow();
    });
  });

  describe('approve()', () => {
    const woId = '507f1f77bcf86cd799439020';

    it('UT-WO-011: should approve work order', async () => {
      const existingWO = {
        ...mockWO,
        status: 'sent',
        workOrderApprovalAccessType: 'manager',
        save: jest.fn().mockResolvedValue({ ...mockWO, status: 'approved' }),
        populate: jest.fn().mockResolvedValue(mockWO),
      };
      workOrderModel.findOne.mockReturnValue({
        populate: jest.fn().mockReturnThis(),
        exec: jest.fn().mockResolvedValue(existingWO),
      });

      const result = await service.approve(woId, mockManager);
      expect(result).toBeDefined();
    });
  });

  describe('reject()', () => {
    const woId = '507f1f77bcf86cd799439020';

    it('UT-WO-012: should reject work order', async () => {
      const existingWO = {
        ...mockWO,
        status: 'sent',
        save: jest.fn().mockResolvedValue({ ...mockWO, status: 'rejected' }),
      };
      workOrderModel.findOne.mockReturnValue({
        populate: jest.fn().mockReturnThis(),
        exec: jest.fn().mockResolvedValue(existingWO),
      });

      const result = await service.reject(woId, mockManager);
      expect(result).toBeDefined();
    });
  });

  describe('start()', () => {
    const woId = '507f1f77bcf86cd799439020';

    it('UT-WO-013: should start work order', async () => {
      const existingWO = {
        ...mockWO,
        status: 'approved',
        save: jest.fn().mockResolvedValue({ ...mockWO, status: 'on_progress' }),
      };
      workOrderModel.findOne.mockReturnValue({
        populate: jest.fn().mockReturnThis(),
        exec: jest.fn().mockResolvedValue(existingWO),
      });

      const result = await service.start(woId, mockManager);
      expect(result).toBeDefined();
    });
  });

  describe('complete()', () => {
    const woId = '507f1f77bcf86cd799439020';

    it('UT-WO-014: should complete work order', async () => {
      const existingWO = {
        ...mockWO,
        status: 'on_progress',
        save: jest.fn().mockResolvedValue({ ...mockWO, status: 'completed' }),
      };
      workOrderModel.findOne.mockReturnValue({
        populate: jest.fn().mockReturnThis(),
        exec: jest.fn().mockResolvedValue(existingWO),
      });

      const result = await service.complete(woId, null, mockManager);
      expect(result).toBeDefined();
    });
  });

  describe('fail()', () => {
    const woId = '507f1f77bcf86cd799439020';

    it('UT-WO-015: should fail work order with reason', async () => {
      const existingWO = {
        ...mockWO,
        status: 'on_progress',
        save: jest.fn().mockResolvedValue({ ...mockWO, status: 'failed', issue_note: 'Error occurred' }),
      };
      workOrderModel.findOne.mockReturnValue({
        populate: jest.fn().mockReturnThis(),
        exec: jest.fn().mockResolvedValue(existingWO),
      });

      const result = await service.fail(woId, 'Error occurred', mockManager);
      expect(result).toBeDefined();
    });
  });

  describe('cancel()', () => {
    const woId = '507f1f77bcf86cd799439020';

    it('UT-WO-016: should cancel work order', async () => {
      const existingWO = {
        ...mockWO,
        status: 'drafted',
        save: jest.fn().mockResolvedValue({ ...mockWO, status: 'cancelled' }),
      };
      workOrderModel.findOne.mockReturnValue({
        populate: jest.fn().mockReturnThis(),
        exec: jest.fn().mockResolvedValue(existingWO),
      });

      const result = await service.cancel(woId, mockManager);
      expect(result).toBeDefined();
    });
  });

  describe('remove()', () => {
    const woId = '507f1f77bcf86cd799439020';

    it('UT-WO-017: should soft-delete work order', async () => {
      const existingWO = {
        ...mockWO,
        save: jest.fn().mockResolvedValue({ ...mockWO, deletedAt: new Date() }),
      };
      workOrderModel.findOne.mockReturnValue({
        populate: jest.fn().mockReturnThis(),
        exec: jest.fn().mockResolvedValue(existingWO),
      });

      const result = await service.remove(woId, mockManager);
      expect(result.deletedAt).toBeDefined();
    });
  });

  describe('recreate()', () => {
    const woId = '507f1f77bcf86cd799439020';

    it('UT-WO-018: should recreate failed work order', async () => {
      const failedWO = {
        ...mockWO,
        status: 'failed',
        save: jest.fn().mockResolvedValue(mockWO),
      };
      workOrderModel.findOne.mockReturnValue({
        populate: jest.fn().mockReturnThis(),
        exec: jest.fn().mockResolvedValue(failedWO),
      });
      workOrderModel.create.mockResolvedValue({ ...mockWO, _id: 'new-wo-id' });

      const result = await service.recreate(woId, mockManager);
      expect(result).toBeDefined();
    });
  });

  describe('getReport()', () => {
    const woId = '507f1f77bcf86cd799439020';

    it('UT-WO-019: should return report for work order', async () => {
      workOrderModel.findOne.mockReturnValue({
        populate: jest.fn().mockReturnThis(),
        exec: jest.fn().mockResolvedValue(mockWO),
      });

      const result = await service.getReport(woId, mockManager);
      expect(result).toBeDefined();
    });
  });
});
