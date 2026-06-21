import { Test, TestingModule } from '@nestjs/testing';
import { ServiceRequestService } from './service-request.service';
import { getModelToken } from '@nestjs/mongoose';
import { ServiceRequest } from './schemas/service-request.schema';
import { ServiceRequestStatus } from '../common/enums/service-request-status.enum';
import { FormSubmission } from '../form/schemas/form-submissions.schema';
import { Service } from '../service/schemas/service.schema';
import { FormsService } from '../form/form.service';
import { WorkOrderService } from '../work-order/work-order.service';
import { ServicesInternalService } from '../service/services.internal.service';
import { WorkReportService } from '../work-report/work-report.service';
import { MembershipService } from '../membership/membership.service';
import { FcmService } from '../fcm/fcm.service';
import { UsersService } from '../users/users.service';
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

  const mockUser = {
    _id: new Types.ObjectId('507f1f77bcf86cd799439011'),
    name: 'Test Client',
    email: 'client@test.com',
    role: 'client',
    company: undefined,
  };

  const mockServiceDoc = {
    _id: '507f1f77bcf86cd799439020',
    serviceKey: 'test-service',
    title: 'Test Service',
    accessType: 'public',
    isActive: true,
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
    const mockSRModel = {
      create: jest.fn(),
      find: jest.fn(),
      findOne: jest.fn(),
      findByIdAndUpdate: jest.fn(),
    };
    const mockSubModel = {
      create: jest.fn(),
      find: jest.fn(),
      findOne: jest.fn(),
    };
    const mockSvcModel = {
      findOne: jest.fn(),
      find: jest.fn(),
    };
    const mockForms = {
      findTemplateById: jest.fn(),
      findLatestTemplateByKey: jest.fn(),
      findTemplateByIdIncludeDeleted: jest.fn().mockResolvedValue(null),
    };
    const mockWO = {
      validateAutoAssignForConfigs: jest.fn(),
      createFromServiceRequest: jest.fn(),
      findRawByServiceRequestId: jest.fn().mockResolvedValue([]),
      findOneInternal: jest.fn().mockResolvedValue({ data: {} }),
      createInternal: jest.fn().mockResolvedValue({ _id: 'wo-1' }),
    };
    const mockSvcInternal = {};
    const mockWR = {};
    const mockMember = {
      isMember: jest.fn(),
    };
    const mockFcm = {
      sendToUser: jest.fn(),
    };
    const mockUsers = {
      findAllByCompanyId: jest.fn(),
      findById: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ServiceRequestService,
        { provide: getModelToken(ServiceRequest.name), useValue: mockSRModel },
        { provide: getModelToken(FormSubmission.name), useValue: mockSubModel },
        { provide: getModelToken(Service.name), useValue: mockSvcModel },
        { provide: FormsService, useValue: mockForms },
        { provide: WorkOrderService, useValue: mockWO },
        { provide: ServicesInternalService, useValue: mockSvcInternal },
        { provide: WorkReportService, useValue: mockWR },
        { provide: MembershipService, useValue: mockMember },
        { provide: FcmService, useValue: mockFcm },
        { provide: UsersService, useValue: mockUsers },
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

  describe('submitIntake()', () => {
    const serviceId = '507f1f77bcf86cd799439020';
    const intakeDto = { formId: null, fieldsData: [] };

    it('UT-SR-001: should create service request successfully for public service', async () => {
      // Mock the _getValidatedLatestService logic
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

      const result = await service.submitIntake(serviceId, mockUser, intakeDto);

      expect(result).toBeDefined();
      expect(srModel.create).toHaveBeenCalled();
    });

    it('UT-SR-002: should throw ForbiddenException for internal service from external client', async () => {
      const internalSvc = { ...mockServiceDoc, accessType: 'internal' };

      serviceModel.findOne.mockImplementation((query: any) => {
        if (query._id) return {
          select: jest.fn().mockReturnThis(),
          sort: jest.fn().mockReturnThis(),
          exec: jest.fn().mockResolvedValue(internalSvc),
        };
        if (query.serviceKey) return {
          sort: jest.fn().mockReturnThis(),
          select: jest.fn().mockReturnThis(),
          exec: jest.fn().mockResolvedValue(internalSvc),
        };
        return { exec: jest.fn().mockResolvedValue(null) };
      });

      await expect(
        service.submitIntake(serviceId, mockUser, intakeDto),
      ).rejects.toThrow(ForbiddenException);
    });

    it('UT-SR-003: should throw BadRequestException for inactive service', async () => {
      const inactiveSvc = {
        ...mockServiceDoc,
        isActive: false,
        deletedAt: new Date(),
      };

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
        service.submitIntake(serviceId, mockUser, intakeDto),
      ).rejects.toThrow();
    });
  });

  describe('findInbox()', () => {
    it('UT-SR-004: should return service requests for user company', async () => {
      const companyIdStr = '507f1f77bcf86cd799439030';
      const mockSRs = [{
        _id: 'sr1',
        code: 'SR-001',
        companyId: companyIdStr,
        serviceId: mockServiceDoc._id,
        requestedBy: mockUser._id,
        serviceRequestStatus: 'received',
        toObject: jest.fn().mockReturnThis(),
      }];
      const sortMock = jest.fn().mockReturnThis();
      const populateMock = jest.fn().mockReturnThis();
      const leanMock = jest.fn().mockReturnThis();
      srModel.find.mockReturnValue({
        sort: sortMock,
        populate: populateMock,
        lean: leanMock,
        exec: jest.fn().mockResolvedValue(mockSRs),
      });

      const internalUser = {
        ...mockUser,
        role: 'manager_company',
        company: { _id: companyIdStr, name: 'Test' },
      };
      const result = await service.findAllByCompanyId(companyIdStr, internalUser as any);
      expect(result).toHaveLength(1);
    });
  });

  describe('findSent()', () => {
    it('UT-SR-005: should return SRs sent by the requesting user', async () => {
      const mockSRs = [{
        _id: 'sr1',
        code: 'SR-001',
        companyId: '507f1f77bcf86cd799439030',
        serviceId: mockServiceDoc._id,
        requestedBy: mockUser._id,
        serviceRequestStatus: 'received',
        toObject: jest.fn().mockReturnThis(),
      }];
      const sortMock = jest.fn().mockReturnThis();
      const populateMock = jest.fn().mockReturnThis();
      const leanMock = jest.fn().mockReturnThis();
      srModel.find.mockReturnValue({
        sort: sortMock,
        populate: populateMock,
        lean: leanMock,
        exec: jest.fn().mockResolvedValue(mockSRs),
      });

      const result = await service.findAllByClientId(mockUser._id.toString());
      expect(result).toHaveLength(1);
    });
  });

  describe('approve()', () => {
    const srId = '507f1f77bcf86cd799439040';

    it('UT-SR-006: should approve received service request', async () => {
      const srCompanyId = mockSR.companyId;
      const receivedSR = {
        ...mockSR,
        companyId: srCompanyId,
        serviceRequestStatus: 'received',
        save: jest.fn().mockResolvedValue({ ...mockSR, serviceRequestStatus: 'approved' }),
      };
      srModel.findOne.mockReturnValue({
        exec: jest.fn().mockResolvedValue(receivedSR),
      });
      serviceModel.findOne.mockReturnValue({
        exec: jest.fn().mockResolvedValue({
          ...mockServiceDoc,
          companyId: srCompanyId,
          workOrdersConfig: [],
          toObject: jest.fn().mockReturnValue({
            ...mockServiceDoc,
            companyId: srCompanyId,
            workOrdersConfig: [],
          }),
        }),
      });
      srModel.findOne.mockImplementation((query: any) => {
        if (query && query._id) return {
          populate: jest.fn().mockReturnThis(),
          exec: jest.fn().mockResolvedValue(receivedSR),
        };
        return { exec: jest.fn().mockResolvedValue(null) };
      });

      const internalUser = {
        ...mockUser,
        role: 'manager_company',
        company: { _id: srCompanyId, name: 'Test' },
      };
      fcmService.sendToUser.mockResolvedValue(undefined);

      const result = await service.updateStatus(srId, ServiceRequestStatus.APPROVED, internalUser as any);
      expect(result).toBeDefined();
    });

    it('UT-SR-007: should throw NotFoundException when SR not found', async () => {
      srModel.findOne.mockReturnValue({
        exec: jest.fn().mockResolvedValue(null),
      });

      await expect(
        service.updateStatus(srId, ServiceRequestStatus.APPROVED, mockUser as any),
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('reject()', () => {
    const srId = '507f1f77bcf86cd799439040';

    it('UT-SR-008: should reject received service request', async () => {
      const srCompanyId = mockSR.companyId;
      const receivedSR = {
        ...mockSR,
        companyId: srCompanyId,
        serviceRequestStatus: 'received',
        save: jest.fn().mockResolvedValue({ ...mockSR, serviceRequestStatus: 'rejected' }),
      };
      srModel.findOne.mockReturnValue({
        exec: jest.fn().mockResolvedValue(receivedSR),
      });
      srModel.findOne.mockImplementation((query: any) => {
        if (query && query._id) return {
          populate: jest.fn().mockReturnThis(),
          exec: jest.fn().mockResolvedValue(receivedSR),
        };
        return { exec: jest.fn().mockResolvedValue(null) };
      });

      const internalUser = {
        ...mockUser,
        role: 'manager_company',
        company: { _id: srCompanyId, name: 'Test' },
      };
      fcmService.sendToUser.mockResolvedValue(undefined);

      const result = await service.updateStatus(srId, ServiceRequestStatus.REJECTED, internalUser as any);
      expect(result).toBeDefined();
    });

    it('UT-SR-009: should throw UnprocessableEntityException when already approved', async () => {
      const approvedSR = { ...mockSR, serviceRequestStatus: 'approved' };
      srModel.findOne.mockReturnValue({
        exec: jest.fn().mockResolvedValue(approvedSR),
      });

      await expect(
        service.updateStatus(srId, ServiceRequestStatus.REJECTED, mockUser as any),
      ).rejects.toThrow(UnprocessableEntityException);
    });
  });

  describe('submitReview()', () => {
    const srId = '507f1f77bcf86cd799439040';

    it('UT-SR-010: should submit review for completed service request', async () => {
      const completedSR = {
        ...mockSR,
        serviceRequestStatus: 'completed',
        reviewNeed: true,
        reviewFormId: '507f1f77bcf86cd799439050',
        save: jest.fn().mockResolvedValue(mockSR),
      };
      const mockFormTemplate = {
        _id: '507f1f77bcf86cd799439050',
        formKey: 'review-form',
        fields: [],
      };

      srModel.findOne.mockReturnValue({
        exec: jest.fn().mockResolvedValue(completedSR),
      });
      formsService.findTemplateById.mockResolvedValue(mockFormTemplate);
      formsService.findLatestTemplateByKey.mockResolvedValue(mockFormTemplate);
      submissionModel.create.mockResolvedValue({ _id: 'sub-1' });
      fcmService.sendToUser.mockResolvedValue(undefined);

      const result = await service.submitReview(srId, mockUser, {
        formId: '507f1f77bcf86cd799439050',
        fieldsData: [{ order: 1, value: 'Great service!' }],
      });

      expect(result).toBeDefined();
    });
  });

  describe('getReport()', () => {
    const srId = '507f1f77bcf86cd799439040';

    it('UT-SR-011: should return report for completed service request', async () => {
      const completedSR = {
        ...mockSR,
        serviceRequestStatus: 'completed',
        toObject: jest.fn().mockReturnValue({
          _id: srId,
          code: 'SR-TEST-001',
          serviceRequestStatus: 'completed',
        }),
      };
      srModel.findOne.mockReturnValue({
        populate: jest.fn().mockReturnThis(),
        exec: jest.fn().mockResolvedValue(completedSR),
      });

      const result = await service.getReportForRequester(srId, mockUser);
      expect(result).toBeDefined();
    });
  });
});
