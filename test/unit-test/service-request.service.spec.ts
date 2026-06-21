import { Test, TestingModule } from '@nestjs/testing';
import { ServiceRequestService } from 'src/service-request/service-request.service';
import { getModelToken } from '@nestjs/mongoose';
import { ServiceRequest } from 'src/service-request/schemas/service-request.schema';
import { ServiceRequestStatus } from 'src/common/enums/service-request-status.enum';
import { FormSubmission } from 'src/form/schemas/form-submissions.schema';
import { Service } from 'src/service/schemas/service.schema';
import { FormsService } from 'src/form/form.service';
import { WorkOrderService } from 'src/work-order/work-order.service';
import { ServicesInternalService } from 'src/service/services.internal.service';
import { WorkReportService } from 'src/work-report/work-report.service';
import { MembershipService } from 'src/membership/membership.service';
import { FcmService } from 'src/fcm/fcm.service';
import { UsersService } from 'src/users/users.service';
import { Types } from 'mongoose';
import {
  NotFoundException,
  ForbiddenException,
  BadRequestException,
  UnprocessableEntityException,
} from '@nestjs/common';

jest.mock('src/common/utils/generate-code.util', () => ({
  generateCode: jest.fn(() => 'TEST-CODE-123'),
}));

jest.mock('src/form/helpers/form-validation.helper', () => ({
  validateFormSubmission: jest.fn(),
}));

describe('ServiceRequestService', () => {
  let service: ServiceRequestService;
  let srModel: any;
  let submissionModel: any;
  let serviceModel: any;
  let formsService: any;
  let workOrderService: any;
  let membershipService: any;
  let fcmService: any;
  let usersService: any;

  const mockClient = {
    _id: new Types.ObjectId('507f1f77bcf86cd799439011'),
    name: 'Test Client',
    email: 'client@test.com',
    role: 'client',
    company: undefined,
  };

  const mockAdmin = {
    _id: new Types.ObjectId('507f1f77bcf86cd799439010'),
    name: 'Admin',
    email: 'admin@test.com',
    role: 'manager_company',
    company: { _id: '507f1f77bcf86cd799439030', name: 'Test Corp' },
  };

  const mockServiceDoc = {
    _id: '507f1f77bcf86cd799439020',
    serviceKey: 'test-service',
    title: 'Test Service',
    accessType: 'public',
    isActive: true,
    deletedAt: null,
    draftingWorkOrderType: 'manual',
    companyId: '507f1f77bcf86cd799439030',
    serviceRequestConfig: {
      serviceRequestApprovalAccessType: 'auto',
      reviewNeed: false,
      intakeFormId: null,
      reviewFormId: null,
    },
    workOrdersConfig: [],
  };

  const mockSR = {
    _id: '507f1f77bcf86cd799439040',
    code: 'SR-TEST-001',
    serviceId: '507f1f77bcf86cd799439020',
    requestedBy: '507f1f77bcf86cd799439011',
    companyId: '507f1f77bcf86cd799439030',
    serviceRequestStatus: 'received',
    serviceRequestApprovalAccessType: 'auto',
    reviewNeed: false,
    receivedAt: new Date(),
    save: jest.fn().mockResolvedValue(this),
    toObject: jest.fn().mockReturnValue({
      _id: '507f1f77bcf86cd799439040',
      code: 'SR-TEST-001',
      serviceRequestStatus: 'received',
    }),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ServiceRequestService,
        {
          provide: getModelToken(ServiceRequest.name),
          useValue: { create: jest.fn(), find: jest.fn(), findOne: jest.fn(), findByIdAndUpdate: jest.fn() },
        },
        {
          provide: getModelToken(FormSubmission.name),
          useValue: { create: jest.fn(), find: jest.fn(), findOne: jest.fn() },
        },
        {
          provide: getModelToken(Service.name),
          useValue: { findOne: jest.fn(), find: jest.fn() },
        },
        {
          provide: FormsService,
          useValue: { findTemplateById: jest.fn(), findLatestTemplateByKey: jest.fn(), findTemplateByIdIncludeDeleted: jest.fn().mockResolvedValue(null) },
        },
        {
          provide: WorkOrderService,
          useValue: {
            validateAutoAssignForConfigs: jest.fn(),
            createFromServiceRequest: jest.fn(),
            findRawByServiceRequestId: jest.fn().mockResolvedValue([]),
            findOneInternal: jest.fn().mockResolvedValue({ data: {} }),
            createInternal: jest.fn().mockResolvedValue({ _id: 'wo-1' }),
          },
        },
        {
          provide: ServicesInternalService,
          useValue: {
            findByVersionId: jest.fn().mockResolvedValue({
              workOrdersConfig: [],
              draftingWorkOrderType: 'manual',
            }),
          },
        },
        { provide: WorkReportService, useValue: {} },
        { provide: MembershipService, useValue: { isMember: jest.fn() } },
        { provide: FcmService, useValue: { sendToUser: jest.fn() } },
        {
          provide: UsersService,
          useValue: {
            findAllByCompanyId: jest.fn(),
            findById: jest.fn(),
            findOneByEmail: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<ServiceRequestService>(ServiceRequestService);
    srModel = module.get(getModelToken(ServiceRequest.name));
    submissionModel = module.get(getModelToken(FormSubmission.name));
    serviceModel = module.get(getModelToken(Service.name));
    formsService = module.get<FormsService>(FormsService);
    workOrderService = module.get<WorkOrderService>(WorkOrderService);
    membershipService = module.get<MembershipService>(MembershipService);
    fcmService = module.get<FcmService>(FcmService);
    usersService = module.get<UsersService>(UsersService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  // ─── UT-SR-001/002/003: submitIntake() ───

  describe('submitIntake()', () => {
    const serviceId = '507f1f77bcf86cd799439020';
    const intakeDto = { formId: null, fieldsData: [] };

    it('UT-SR-001: Submit intake dengan field lengkap → mengembalikan SR baru', async () => {
      serviceModel.findOne.mockImplementation((query: any) => {
        if (query._id) return {
          select: jest.fn().mockReturnThis(),
          sort: jest.fn().mockReturnThis(),
          exec: jest.fn().mockResolvedValue(mockServiceDoc),
        };
        if (query.serviceKey) return {
          sort: jest.fn().mockReturnThis(),
          select: jest.fn().mockReturnThis(),
          exec: jest.fn().mockResolvedValue(mockServiceDoc),
        };
        return { exec: jest.fn().mockResolvedValue(null) };
      });

      srModel.create.mockResolvedValue(mockSR);
      usersService.findAllByCompanyId.mockResolvedValue([]);
      fcmService.sendToUser.mockResolvedValue(undefined);
      // findOneForClient() is called at the end of submitIntake to build the response
      srModel.findOne.mockReturnValue({
        populate: jest.fn().mockReturnThis(),
        exec: jest.fn().mockResolvedValue(mockSR),
      });

      const result = await service.submitIntake(serviceId, mockClient, intakeDto);

      expect(result).toBeDefined();
      expect(srModel.create).toHaveBeenCalled();
    });

    it('UT-SR-002: Submit intake dengan field wajib kosong → validasi error', async () => {
      serviceModel.findOne.mockImplementation(() => ({
        select: jest.fn().mockReturnThis(),
        sort: jest.fn().mockReturnThis(),
        exec: jest.fn().mockResolvedValue(null),
      }));

      await expect(
        service.submitIntake('nonexistent', mockClient, intakeDto),
      ).rejects.toThrow();
    });

    it('UT-SR-003: Submit intake ke service tidak aktif → throw BadRequestError', async () => {
      const inactiveSvc = { ...mockServiceDoc, isActive: false, deletedAt: new Date() };

      serviceModel.findOne.mockImplementation((query: any) => {
        if (query._id) return {
          select: jest.fn().mockReturnThis(),
          sort: jest.fn().mockReturnThis(),
          exec: jest.fn().mockResolvedValue(inactiveSvc),
        };
        if (query.serviceKey) return {
          sort: jest.fn().mockReturnThis(),
          select: jest.fn().mockReturnThis(),
          exec: jest.fn().mockResolvedValue(inactiveSvc),
        };
        return { exec: jest.fn().mockResolvedValue(null) };
      });

      await expect(
        service.submitIntake(serviceId, mockClient, intakeDto),
      ).rejects.toThrow();
    });
  });

  // ─── UT-SR-004/005/006: approve() ───

  describe('approve()', () => {
    const srId = '507f1f77bcf86cd799439040';

    it('UT-SR-004: Menyetujui request → status APPROVED', async () => {
      const receivedSR = {
        ...mockSR,
        serviceRequestStatus: 'received',
        save: jest.fn().mockResolvedValue({ ...mockSR, serviceRequestStatus: 'approved' }),
      };
      srModel.findOne.mockImplementation((query: any) => {
        if (query && query._id) return {
          populate: jest.fn().mockReturnThis(),
          exec: jest.fn().mockResolvedValue(receivedSR),
        };
        return { exec: jest.fn().mockResolvedValue(receivedSR) };
      });
      serviceModel.findOne.mockReturnValue({
        exec: jest.fn().mockResolvedValue({
          ...mockServiceDoc,
          workOrdersConfig: [],
          toObject: jest.fn().mockReturnValue({ ...mockServiceDoc, workOrdersConfig: [] }),
        }),
      });
      fcmService.sendToUser.mockResolvedValue(undefined);

      const result = await service.updateStatus(srId, ServiceRequestStatus.APPROVED, mockAdmin as any);
      expect(result).toBeDefined();
    });

    it('UT-SR-005: Menyetujui request yang sudah APPROVED → throw ConflictError', async () => {
      const approvedSR = { ...mockSR, serviceRequestStatus: 'approved' };
      srModel.findOne.mockReturnValue({
        exec: jest.fn().mockResolvedValue(approvedSR),
      });

      await expect(
        service.updateStatus(srId, ServiceRequestStatus.APPROVED, mockAdmin as any),
      ).rejects.toThrow(UnprocessableEntityException);
    });

    it('UT-SR-006: Menyetujui request yang sudah REJECTED → throw ConflictError', async () => {
      const rejectedSR = { ...mockSR, serviceRequestStatus: 'rejected' };
      srModel.findOne.mockReturnValue({
        exec: jest.fn().mockResolvedValue(rejectedSR),
      });

      await expect(
        service.updateStatus(srId, ServiceRequestStatus.APPROVED, mockAdmin as any),
      ).rejects.toThrow(UnprocessableEntityException);
    });
  });

  // ─── UT-SR-007/008: reject() ───

  describe('reject()', () => {
    const srId = '507f1f77bcf86cd799439040';

    it('UT-SR-007: Menolak request PENDING → status REJECTED', async () => {
      const receivedSR = {
        ...mockSR,
        serviceRequestStatus: 'received',
        save: jest.fn().mockResolvedValue({ ...mockSR, serviceRequestStatus: 'rejected' }),
      };
      srModel.findOne.mockImplementation((query: any) => {
        if (query && query._id) return {
          populate: jest.fn().mockReturnThis(),
          exec: jest.fn().mockResolvedValue(receivedSR),
        };
        return { exec: jest.fn().mockResolvedValue(receivedSR) };
      });
      fcmService.sendToUser.mockResolvedValue(undefined);

      const result = await service.updateStatus(srId, ServiceRequestStatus.REJECTED, mockAdmin as any);
      expect(result).toBeDefined();
    });

    it('UT-SR-008: Menolak request yang sudah di-approve → throw ConflictError', async () => {
      const approvedSR = { ...mockSR, serviceRequestStatus: 'approved' };
      srModel.findOne.mockReturnValue({
        exec: jest.fn().mockResolvedValue(approvedSR),
      });

      await expect(
        service.updateStatus(srId, ServiceRequestStatus.REJECTED, mockAdmin as any),
      ).rejects.toThrow(UnprocessableEntityException);
    });
  });

  // ─── UT-SR-009/010: assignStaff() ───

  describe('assignStaff()', () => {
    const srId = '507f1f77bcf86cd799439040';

    it('UT-SR-009: Menugaskan staff ke SR approved → object request dengan staff tertaut', async () => {
      const approvedSR = {
        ...mockSR,
        serviceRequestStatus: 'approved',
        staffPIC: null,
        save: jest.fn().mockResolvedValue(undefined),
      };
      // assignStaff() resolves the SR via findOne(...) awaited directly
      srModel.findOne.mockResolvedValue(approvedSR);
      usersService.findOneByEmail.mockResolvedValue({
        _id: new Types.ObjectId('507f1f77bcf86cd799439077'),
        email: 'pic@test.com',
        companyId: new Types.ObjectId('507f1f77bcf86cd799439030'),
      });
      jest
        .spyOn(service, 'findOneInternal')
        .mockResolvedValue({ data: { staffPIC: 'pic' } });
      fcmService.sendToUser.mockResolvedValue(undefined);

      const result = await service.assignStaff(
        srId,
        { staff_pic: 'pic@test.com' } as any,
        mockAdmin as any,
      );
      expect(result).toBeDefined();
      expect(approvedSR.save).toHaveBeenCalled();
    });

    it('UT-SR-010: Menugaskan staff dengan user ID tidak valid → throw error', async () => {
      const approvedSR = {
        ...mockSR,
        serviceRequestStatus: 'approved',
        staffPIC: null,
        save: jest.fn().mockResolvedValue(undefined),
      };
      srModel.findOne.mockResolvedValue(approvedSR);
      usersService.findOneByEmail.mockResolvedValue(null);

      await expect(
        service.assignStaff(srId, { staff_pic: 'unknown@test.com' } as any, mockAdmin as any),
      ).rejects.toThrow();
    });
  });

  // ─── UT-SR-011/012: cancelSr() ───

  describe('cancelSr()', () => {
    const srId = '507f1f77bcf86cd799439040';

    it('UT-SR-011: Membatalkan SR PENDING → status CANCELLED', async () => {
      const receivedSR = {
        ...mockSR,
        serviceRequestStatus: 'received',
        save: jest.fn().mockResolvedValue({ ...mockSR, serviceRequestStatus: 'cancelled' }),
      };
      srModel.findOne.mockImplementation((query: any) => {
        if (query && query._id) return {
          populate: jest.fn().mockReturnThis(),
          exec: jest.fn().mockResolvedValue(receivedSR),
        };
        return { exec: jest.fn().mockResolvedValue(receivedSR) };
      });

      const result = await service.updateStatus(srId, ServiceRequestStatus.CANCELLED, mockClient as any);
      expect(result).toBeDefined();
    });

    it('UT-SR-012: Membatalkan SR yang sudah APPROVED → throw ConflictError', async () => {
      const approvedSR = { ...mockSR, serviceRequestStatus: 'approved' };
      srModel.findOne.mockReturnValue({
        exec: jest.fn().mockResolvedValue(approvedSR),
      });

      await expect(
        service.updateStatus(srId, ServiceRequestStatus.CANCELLED, mockClient as any),
      ).rejects.toThrow(UnprocessableEntityException);
    });
  });

  // ─── UT-SR-013: getInbox() ───

  describe('getInbox()', () => {
    it('UT-SR-013: Mengambil daftar request masuk untuk company admin → array SR', async () => {
      const mockSRs = [{ _id: 'sr1', code: 'SR-001', toObject: jest.fn().mockReturnThis() }];
      srModel.find.mockReturnValue({
        sort: jest.fn().mockReturnThis(),
        populate: jest.fn().mockReturnThis(),
        lean: jest.fn().mockReturnThis(),
        exec: jest.fn().mockResolvedValue(mockSRs),
      });

      const result = await service.findAllByCompanyId('507f1f77bcf86cd799439030', mockAdmin as any);
      expect(result).toHaveLength(1);
    });
  });

  // ─── UT-SR-014: getSent() ───

  describe('getSent()', () => {
    it('UT-SR-014: Mengambil daftar request yang dikirim oleh client → array SR', async () => {
      const mockSRs = [{ _id: 'sr1', code: 'SR-001', toObject: jest.fn().mockReturnThis() }];
      srModel.find.mockReturnValue({
        sort: jest.fn().mockReturnThis(),
        populate: jest.fn().mockReturnThis(),
        lean: jest.fn().mockReturnThis(),
        exec: jest.fn().mockResolvedValue(mockSRs),
      });

      const result = await service.findAllByClientId(mockClient._id.toString());
      expect(result).toHaveLength(1);
    });
  });

  // ─── UT-SR-015/016: getDetailSr() ───

  describe('getDetailSr()', () => {
    const srId = '507f1f77bcf86cd799439040';

    it('UT-SR-015: Mengambil detail SR berdasarkan ID valid → object tunggal', async () => {
      srModel.findOne.mockReturnValue({
        populate: jest.fn().mockReturnThis(),
        exec: jest.fn().mockResolvedValue(mockSR),
      });

      const result = await service.getReportForRequester(srId, mockClient);
      expect(result).toBeDefined();
    });

    it('UT-SR-016: Mengambil detail SR dengan ID tidak ditemukan → throw NotFoundError', async () => {
      srModel.findOne.mockReturnValue({
        populate: jest.fn().mockReturnThis(),
        exec: jest.fn().mockResolvedValue(null),
      });

      await expect(
        service.getReportForRequester(srId, mockClient),
      ).rejects.toThrow(NotFoundException);
    });
  });

  // ─── UT-SR-017/018: remove() ───

  describe('remove()', () => {
    const srId = '507f1f77bcf86cd799439040';

    it('UT-SR-017: Menghapus SR berdasarkan ID valid → konfirmasi penghapusan', async () => {
      const existingSR = {
        ...mockSR,
        save: jest.fn().mockResolvedValue({ ...mockSR, deletedAt: new Date() }),
      };
      // remove() calls findOne(...).exec() directly, then findOneInternal(...) which
      // chains .populate() before .exec() — support both shapes.
      srModel.findOne.mockReturnValue({
        populate: jest.fn().mockReturnThis(),
        exec: jest.fn().mockResolvedValue(existingSR),
      });

      const result = await service.remove(srId, mockAdmin as any);
      expect(result).toBeDefined();
    });

    it('UT-SR-018: Menghapus SR dengan ID tidak ditemukan → throw NotFoundError', async () => {
      srModel.findOne.mockReturnValue({
        exec: jest.fn().mockResolvedValue(null),
      });

      await expect(service.remove(srId, mockAdmin as any)).rejects.toThrow(NotFoundException);
    });
  });
});
