import { Test, TestingModule } from '@nestjs/testing';
import { WorkReportService } from './work-report.service';
import { getModelToken } from '@nestjs/mongoose';
import { WorkReport } from './schemas/work-report.schema';
import { FormSubmission } from '../form/schemas/form-submissions.schema';
import { FormsService } from '../form/form.service';
import { FcmService } from '../fcm/fcm.service';
import { UsersService } from '../users/users.service';
import { WorkOrderService } from '../work-order/work-order.service';
import { Types } from 'mongoose';
import {
  NotFoundException,
  ForbiddenException,
  BadRequestException,
} from '@nestjs/common';

describe('WorkReportService', () => {
  let service: WorkReportService;
  let workReportModel: any;
  let formSubmissionModel: any;
  let formsService: any;
  let fcmService: any;
  let usersService: any;
  let workOrderService: any;

  const mockManager = {
    _id: new Types.ObjectId('507f1f77bcf86cd799439010'),
    role: 'manager_company',
    name: 'Manager',
    email: 'manager@test.com',
    company: { _id: new Types.ObjectId('507f1f77bcf86cd799439001'), name: 'Test Corp' },
  };

  const mockStaff = {
    _id: new Types.ObjectId('507f1f77bcf86cd799439011'),
    role: 'staff_company',
    name: 'Staff',
    email: 'staff@test.com',
    company: { _id: new Types.ObjectId('507f1f77bcf86cd799439001'), name: 'Test Corp' },
  };

  const mockReport = {
    _id: '507f1f77bcf86cd799439020',
    workOrderId: '507f1f77bcf86cd799439030',
    companyId: '507f1f77bcf86cd799439001',
    reportFormId: '507f1f77bcf86cd799439040',
    status: 'drafted',
    workReportApprovalAccessType: 'manager',
    showReportToRequester: false,
    deletedAt: null,
    save: jest.fn().mockResolvedValue(this),
    populate: jest.fn().mockResolvedValue(this),
    toObject: jest.fn().mockReturnValue({
      _id: '507f1f77bcf86cd799439020',
      workOrderId: '507f1f77bcf86cd799439030',
      status: 'submitted',
    }),
  };

  const mockWO = {
    _id: '507f1f77bcf86cd799439030',
    code: 'WO-001',
    staffPIC: '507f1f77bcf86cd799439011',
    assignedStaff: ['507f1f77bcf86cd799439011'],
    createdBy: '507f1f77bcf86cd799439010',
  };

  beforeEach(async () => {
    const mockWRModel = {
      findOne: jest.fn().mockReturnValue({
        populate: jest.fn().mockReturnThis(),
        exec: jest.fn().mockResolvedValue(null),
      }),
      findByIdAndUpdate: jest.fn(),
      new: jest.fn(),
    };
    const mockFSModel = {
      find: jest.fn(),
    };
    const mockForms = {
      findTemplateById: jest.fn(),
    };
    const mockFcm = {
      sendToUser: jest.fn(),
      markAsReadByResource: jest.fn().mockReturnValue({ catch: jest.fn() }),
    };
    const mockUsers = {
      findAllByCompanyId: jest.fn(),
    };
    const mockWO_ = {
      autoCompleteByWorkReport: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        WorkReportService,
        { provide: getModelToken(WorkReport.name), useValue: mockWRModel },
        { provide: getModelToken(FormSubmission.name), useValue: mockFSModel },
        { provide: FormsService, useValue: mockForms },
        { provide: FcmService, useValue: mockFcm },
        { provide: UsersService, useValue: mockUsers },
        { provide: WorkOrderService, useValue: mockWO_ },
      ],
    }).compile();

    service = module.get<WorkReportService>(WorkReportService);
    workReportModel = module.get(getModelToken(WorkReport.name));
    formSubmissionModel = module.get(getModelToken(FormSubmission.name));
    formsService = module.get<FormsService>(FormsService);
    fcmService = module.get<FcmService>(FcmService);
    usersService = module.get<UsersService>(UsersService);
    workOrderService = module.get<WorkOrderService>(WorkOrderService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('findOne()', () => {
    const reportId = '507f1f77bcf86cd799439020';

    it('UT-WR-001: should return report when found', async () => {
      workReportModel.findOne.mockReturnValue({
        populate: jest.fn().mockReturnThis(),
        exec: jest.fn().mockResolvedValue(mockReport),
      });
      // Mock _hydrateReport
      jest.spyOn(service as any, '_hydrateReport').mockResolvedValue(mockReport);

      const result = await service.findOne(reportId);
      expect(result).toBeDefined();
    });

    it('UT-WR-002: should throw NotFoundException for invalid ID', async () => {
      await expect(service.findOne('invalid-id')).rejects.toThrow(
        NotFoundException,
      );
    });

    it('UT-WR-003: should throw NotFoundException when report not found', async () => {
      workReportModel.findOne.mockReturnValue({
        populate: jest.fn().mockReturnThis(),
        exec: jest.fn().mockResolvedValue(null),
      });

      await expect(service.findOne(reportId)).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('findByWorkOrderId()', () => {
    const woId = '507f1f77bcf86cd799439030';

    it('UT-WR-004: should return report for valid work order', async () => {
      const populatedReport = {
        ...mockReport,
        workOrderId: mockWO,
        populate: jest.fn().mockReturnThis(),
      };
      workReportModel.findOne.mockReturnValue({
        populate: jest.fn().mockReturnThis(),
        exec: jest.fn().mockResolvedValue(populatedReport),
      });
      jest.spyOn(service as any, '_hydrateReport').mockResolvedValue(populatedReport);

      const result = await service.findByWorkOrderId(woId, mockStaff);
      expect(result).toBeDefined();
    });

    it('UT-WR-005: should throw ForbiddenException for unauthorized user', async () => {
      const unrelatedUser = {
        ...mockStaff,
        _id: new Types.ObjectId('999999999999999999999999'),
      };
      const populatedReport = {
        ...mockReport,
        workOrderId: mockWO,
        populate: jest.fn().mockReturnThis(),
      };
      workReportModel.findOne.mockReturnValue({
        populate: jest.fn().mockReturnThis(),
        exec: jest.fn().mockResolvedValue(populatedReport),
      });

      await expect(
        service.findByWorkOrderId(woId, unrelatedUser),
      ).rejects.toThrow(ForbiddenException);
    });

    it('UT-WR-006: should throw NotFoundException for invalid work order ID', async () => {
      await expect(service.findByWorkOrderId('invalid-id', mockManager)).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('markAsSent()', () => {
    const reportId = '507f1f77bcf86cd799439020';

    it('UT-WR-007: should mark drafted report as sent', async () => {
      const draftReport = {
        ...mockReport,
        status: 'drafted',
        workReportApprovalAccessType: 'manager',
        workOrderId: mockWO,
        save: jest.fn().mockResolvedValue({ ...mockReport, status: 'submitted' }),
        populate: jest.fn().mockReturnThis(),
      };
      workReportModel.findOne.mockReturnValue({
        populate: jest.fn().mockReturnThis(),
        exec: jest.fn().mockResolvedValue(draftReport),
      });
      jest.spyOn(service as any, '_hydrateReport').mockResolvedValue(draftReport);
      usersService.findAllByCompanyId.mockResolvedValue([mockManager]);
      fcmService.sendToUser.mockResolvedValue(undefined);

      const result = await service.markAsSent(reportId, mockStaff);
      expect(result).toBeDefined();
    });

    it('UT-WR-008: should auto-approve when approval type is auto', async () => {
      const autoReport = {
        ...mockReport,
        status: 'drafted',
        workReportApprovalAccessType: 'auto',
        workOrderId: mockWO,
        save: jest.fn().mockResolvedValue({ ...mockReport, status: 'approved' }),
        populate: jest.fn().mockReturnThis(),
      };
      workReportModel.findOne.mockReturnValue({
        populate: jest.fn().mockReturnThis(),
        exec: jest.fn().mockResolvedValue(autoReport),
      });
      jest.spyOn(service as any, '_hydrateReport').mockResolvedValue(autoReport);
      workOrderService.autoCompleteByWorkReport.mockResolvedValue(undefined);

      await service.markAsSent(reportId, mockStaff);
      expect(workOrderService.autoCompleteByWorkReport).toHaveBeenCalled();
    });

    it('UT-WR-009: should throw BadRequestException for invalid status transition', async () => {
      const approvedReport = {
        ...mockReport,
        status: 'approved',
        workOrderId: mockWO,
      };
      workReportModel.findOne.mockReturnValue({
        populate: jest.fn().mockReturnThis(),
        exec: jest.fn().mockResolvedValue(approvedReport),
      });

      await expect(service.markAsSent(reportId, mockStaff)).rejects.toThrow(
        BadRequestException,
      );
    });
  });

  describe('approve()', () => {
    const reportId = '507f1f77bcf86cd799439020';

    it('UT-WR-010: should approve submitted report', async () => {
      const submittedReport = {
        ...mockReport,
        status: 'submitted',
        workReportApprovalAccessType: 'manager',
        save: jest.fn().mockResolvedValue({ ...mockReport, status: 'approved' }),
        populate: jest.fn().mockResolvedValue({
          _id: mockWO._id,
          code: mockWO.code,
          staffPIC: mockWO.staffPIC,
          assignedStaff: mockWO.assignedStaff,
        }),
      };
      workReportModel.findOne.mockReturnValue({
        exec: jest.fn().mockResolvedValue(submittedReport),
      });
      jest.spyOn(service as any, '_hydrateReport').mockResolvedValue(submittedReport);
      fcmService.sendToUser.mockResolvedValue(undefined);

      const result = await service.approve(reportId, mockManager);
      expect(result).toBeDefined();
    });

    it('UT-WR-011: should throw BadRequestException when not submitted', async () => {
      const draftedReport = { ...mockReport, status: 'drafted' };
      workReportModel.findOne.mockReturnValue({
        exec: jest.fn().mockResolvedValue(draftedReport),
      });

      await expect(service.approve(reportId, mockManager)).rejects.toThrow(
        BadRequestException,
      );
    });

    it('UT-WR-012: should throw ForbiddenException for non-manager user', async () => {
      const submittedReport = { ...mockReport, status: 'submitted' };
      workReportModel.findOne.mockReturnValue({
        exec: jest.fn().mockResolvedValue(submittedReport),
      });

      await expect(service.approve(reportId, mockStaff)).rejects.toThrow(
        ForbiddenException,
      );
    });
  });

  describe('reject()', () => {
    const reportId = '507f1f77bcf86cd799439020';

    it('UT-WR-013: should reject submitted report', async () => {
      const submittedReport = {
        ...mockReport,
        status: 'submitted',
        workReportApprovalAccessType: 'manager',
        save: jest.fn().mockResolvedValue({ ...mockReport, status: 'rejected' }),
        populate: jest.fn().mockResolvedValue({
          _id: mockWO._id,
          code: mockWO.code,
          staffPIC: mockWO.staffPIC,
          assignedStaff: mockWO.assignedStaff,
        }),
      };
      workReportModel.findOne.mockReturnValue({
        exec: jest.fn().mockResolvedValue(submittedReport),
      });
      jest.spyOn(service as any, '_hydrateReport').mockResolvedValue(submittedReport);

      const result = await service.reject(reportId, mockManager);
      expect(result).toBeDefined();
    });

    it('UT-WR-014: should throw BadRequestException for auto-approve report', async () => {
      const autoReport = {
        ...mockReport,
        status: 'submitted',
        workReportApprovalAccessType: 'auto',
      };
      workReportModel.findOne.mockReturnValue({
        exec: jest.fn().mockResolvedValue(autoReport),
      });

      await expect(service.reject(reportId, mockManager)).rejects.toThrow(
        BadRequestException,
      );
    });
  });

  describe('remove()', () => {
    const reportId = '507f1f77bcf86cd799439020';

    it('UT-WR-015: should soft-delete report', async () => {
      const existingReport = {
        ...mockReport,
        save: jest.fn().mockResolvedValue({ ...mockReport, deletedAt: new Date() }),
      };
      workReportModel.findOne.mockReturnValue({
        exec: jest.fn().mockResolvedValue(existingReport),
      });
      jest.spyOn(service as any, '_hydrateReport').mockResolvedValue(existingReport);

      const result = await service.remove(reportId, mockManager);
      expect(result.deletedAt).toBeDefined();
    });

    it('UT-WR-016: should throw NotFoundException when report belongs to other company', async () => {
      const otherCompanyReport = {
        ...mockReport,
        companyId: '999999999999999999999999',
      };
      workReportModel.findOne.mockReturnValue({
        exec: jest.fn().mockResolvedValue(otherCompanyReport),
      });

      await expect(service.remove(reportId, mockManager)).rejects.toThrow(
        NotFoundException,
      );
    });
  });
});
