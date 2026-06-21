import { Test, TestingModule } from '@nestjs/testing';
import { WorkOrderService } from 'src/work-order/work-order.service';
import { getModelToken } from '@nestjs/mongoose';
import { WorkOrder } from 'src/work-order/schemas/work-order.schema';
import { FormSubmission } from 'src/form/schemas/form-submissions.schema';
import { FormsService } from 'src/form/form.service';
import { UsersService } from 'src/users/users.service';
import { WorkReportService } from 'src/work-report/work-report.service';
import { ServiceRequestService } from 'src/service-request/service-request.service';
import { FcmService } from 'src/fcm/fcm.service';
import { Types } from 'mongoose';
import { NotFoundException, ForbiddenException } from '@nestjs/common';

jest.mock('src/common/utils/generate-code.util', () => ({
  generateCode: jest.fn(() => 'TEST-001'),
}));

/**
 * Builds a chainable Mongoose query mock. It supports every access pattern the
 * service uses against a query:
 *   - `await model.findOne(...)`                         (thenable)
 *   - `await model.findOne(...).populate('serviceId')`   (populate → thenable)
 *   - `model.find(...).populate().sort().lean().exec()`  (chain → exec)
 */
const makeQuery = (doc: any) => {
  const q: any = {
    populate: jest.fn(() => q),
    sort: jest.fn(() => q),
    lean: jest.fn(() => q),
    exec: jest.fn(() => Promise.resolve(doc)),
    then: (resolve: any, reject: any) =>
      Promise.resolve(doc).then(resolve, reject),
  };
  return q;
};

describe('WorkOrderService', () => {
  let service: WorkOrderService;
  let workOrderModel: any;
  let submissionModel: any;
  let usersService: any;
  let workReportService: any;
  let fcmService: any;

  const mockManager: any = {
    _id: new Types.ObjectId('507f1f77bcf86cd799439010'),
    role: 'manager_company',
    name: 'Manager',
    email: 'manager@test.com',
    company: { _id: new Types.ObjectId('507f1f77bcf86cd799439001'), name: 'Test Corp' },
    position: { _id: new Types.ObjectId('507f1f77bcf86cd799439040') },
  };

  const baseWO = {
    _id: '507f1f77bcf86cd799439020',
    code: 'WO-001',
    serviceRequestId: null,
    batchId: null,
    serviceId: '507f1f77bcf86cd799439030',
    companyId: '507f1f77bcf86cd799439001',
    createdBy: '507f1f77bcf86cd799439010',
    staffPIC: null,
    assignedStaff: [],
    positionId: null,
    workOrderApprovalAccessType: 'auto',
    workReportApprovalAccessType: 'auto',
    status: 'drafted',
    deletedAt: null,
    toObject: jest.fn().mockReturnValue({ _id: '507f1f77bcf86cd799439020', code: 'WO-001' }),
  };

  // Construct a fresh WO instance per test so its `save` spy stays isolated.
  const makeWO = (overrides: any = {}) => ({
    ...baseWO,
    ...overrides,
    save: jest.fn().mockResolvedValue({ ...baseWO, ...overrides }),
  });

  beforeEach(async () => {
    // The model is used as a constructor (`new this.workOrderModel(...)`) AND as
    // a static query holder, so it must be a function with statics attached.
    const MockWOModel: any = function (this: any, data: any) {
      Object.assign(this, data);
      if (!this._id) this._id = new Types.ObjectId();
      this.save = jest.fn().mockResolvedValue(this);
    };
    MockWOModel.find = jest.fn();
    MockWOModel.findOne = jest.fn();
    MockWOModel.findByIdAndUpdate = jest.fn();
    MockWOModel.updateMany = jest.fn().mockResolvedValue({});
    MockWOModel.db = {
      model: jest.fn().mockReturnValue({
        findOne: jest.fn().mockResolvedValue(null),
      }),
    };

    const mockSubModel = { create: jest.fn(), find: jest.fn() };
    const mockForms = {
      findTemplateById: jest.fn(),
      findLatestTemplateByKey: jest.fn(),
    };
    const mockUsers = {
      findByPositionId: jest.fn(),
      findById: jest.fn(),
      findOneByEmail: jest.fn(),
      findAllByCompanyId: jest.fn().mockResolvedValue([]),
    };
    const mockWR = {
      findByWorkOrderId: jest.fn().mockResolvedValue(null),
      create: jest.fn().mockResolvedValue({}),
      update: jest.fn().mockResolvedValue({}),
      findOneQuietlyByWorkOrderId: jest.fn().mockResolvedValue(null),
    };
    const mockSR = { updateSRStatusSystemically: jest.fn().mockResolvedValue(undefined) };
    const mockFcm = {
      sendToUser: jest.fn().mockResolvedValue(undefined),
      markAsReadByResource: jest.fn().mockReturnValue({ catch: jest.fn() }),
      markAsRead: jest.fn().mockReturnValue({ catch: jest.fn() }),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        WorkOrderService,
        { provide: getModelToken(WorkOrder.name), useValue: MockWOModel },
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
    usersService = module.get<UsersService>(UsersService);
    workReportService = module.get<WorkReportService>(WorkReportService);
    fcmService = module.get<FcmService>(FcmService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  // ─── create() ───

  describe('create()', () => {
    it('UT-WO-001: Membuat work order baru dengan payload lengkap → status DRAFTED', async () => {
      const createDto = {
        serviceRequestId: null,
        serviceId: '507f1f77bcf86cd799439030',
        workOrderApprovalAccessType: 'auto',
        workReportApprovalAccessType: 'auto',
      };
      jest
        .spyOn(service, 'findOneInternal')
        .mockResolvedValue({ data: { status: 'drafted' } });

      const result = await service.create(createDto, mockManager);

      expect(result).toBeDefined();
      expect(result.data.status).toBe('drafted');
      expect(workReportService.create).toHaveBeenCalled();
    });

    it('UT-WO-002: Membuat work order tanpa field wajib → throw error', async () => {
      const userNoCompany = { ...mockManager, company: null };
      await expect(service.create({}, userNoCompany as any)).rejects.toThrow(
        ForbiddenException,
      );
    });
  });

  // ─── assignStaff() ───

  describe('assignStaff()', () => {
    const woId = '507f1f77bcf86cd799439020';

    it('UT-WO-003: Menugaskan staff ke WO DRAFTED → mengembalikan WO dengan staff', async () => {
      workOrderModel.findOne.mockReturnValue(makeQuery(makeWO()));
      usersService.findOneByEmail.mockResolvedValue({
        _id: new Types.ObjectId('507f1f77bcf86cd799439055'),
        email: 'pic@test.com',
        companyId: mockManager.company._id,
      });
      jest.spyOn(service, 'findOneInternal').mockResolvedValue({ data: {} });

      const result = await service.assignStaff(
        woId,
        { staff_pic: 'pic@test.com', assign_staffs: ['staff@test.com'] },
        mockManager,
      );
      expect(result).toBeDefined();
    });

    it('UT-WO-004: Menugaskan staff pada WO yang tidak ditemukan → throw NotFoundError', async () => {
      workOrderModel.findOne.mockReturnValue(makeQuery(null));

      await expect(
        service.assignStaff(woId, { staff_pic: 'invalid', assign_staffs: [] }, mockManager),
      ).rejects.toThrow(NotFoundException);
    });
  });

  // ─── start() ───

  describe('start()', () => {
    const woId = '507f1f77bcf86cd799439020';

    it('UT-WO-005: Memulai WO berstatus APPROVED → status ON_PROGRESS', async () => {
      const approvedWO = makeWO({
        status: 'approved',
        staffPIC: null,
        assignedStaff: [mockManager._id],
      });
      workOrderModel.findOne.mockReturnValue(makeQuery(approvedWO));
      jest.spyOn(service, 'findOneInternal').mockResolvedValue({ data: {} });

      const result = await service.start(woId, mockManager);
      expect(result).toBeDefined();
      expect(approvedWO.save).toHaveBeenCalled();
    });

    it('UT-WO-006: Memulai WO yang sudah COMPLETED → throw ConflictError', async () => {
      workOrderModel.findOne.mockReturnValue(makeQuery(makeWO({ status: 'completed' })));
      await expect(service.start(woId, mockManager)).rejects.toThrow();
    });

    it('UT-WO-007: Memulai WO yang belum di-assign (DRAFTED) → throw ConflictError', async () => {
      workOrderModel.findOne.mockReturnValue(makeQuery(makeWO({ status: 'drafted' })));
      await expect(service.start(woId, mockManager)).rejects.toThrow();
    });
  });

  // ─── complete() ───

  describe('complete()', () => {
    const woId = '507f1f77bcf86cd799439020';

    it('UT-WO-008: Menyelesaikan WO ON_PROGRESS → status COMPLETED', async () => {
      workOrderModel.findOne.mockReturnValue(makeQuery(makeWO({ status: 'on_progress' })));
      workReportService.findOneQuietlyByWorkOrderId.mockResolvedValue({
        _id: 'report-1',
        status: 'approved',
      });
      jest.spyOn(service, 'findOneInternal').mockResolvedValue({ data: {} });

      const result = await service.complete(woId, null, mockManager);
      expect(result).toBeDefined();
    });

    it('UT-WO-009: Menyelesaikan WO bukan ON_PROGRESS → throw ConflictError', async () => {
      workOrderModel.findOne.mockReturnValue(makeQuery(makeWO({ status: 'drafted' })));
      await expect(service.complete(woId, null, mockManager)).rejects.toThrow();
    });
  });

  // ─── fail() ───

  describe('fail()', () => {
    const woId = '507f1f77bcf86cd799439020';

    it('UT-WO-010: Menandai WO gagal dari ON_PROGRESS → status FAILED', async () => {
      workOrderModel.findOne.mockReturnValue(makeQuery(makeWO({ status: 'on_progress' })));
      workReportService.findOneQuietlyByWorkOrderId.mockResolvedValue({
        _id: 'report-1',
        status: 'approved',
      });
      jest.spyOn(service, 'findOneInternal').mockResolvedValue({ data: {} });

      const result = await service.fail(woId, 'Error occurred', mockManager);
      expect(result).toBeDefined();
    });

    it('UT-WO-011: Menandai gagal pada WO COMPLETED → throw ConflictError', async () => {
      workOrderModel.findOne.mockReturnValue(makeQuery(makeWO({ status: 'completed' })));
      await expect(service.fail(woId, 'reason', mockManager)).rejects.toThrow();
    });
  });

  // ─── cancel() ───

  describe('cancel()', () => {
    const woId = '507f1f77bcf86cd799439020';

    it('UT-WO-012: Membatalkan WO DRAFTED → status CANCELLED', async () => {
      workOrderModel.findOne.mockReturnValue(makeQuery(makeWO({ status: 'drafted' })));
      jest.spyOn(service, 'findOneInternal').mockResolvedValue({ data: {} });

      const result = await service.cancel(woId, mockManager);
      expect(result).toBeDefined();
    });

    it('UT-WO-013: Membatalkan WO ON_PROGRESS → throw ConflictError', async () => {
      workOrderModel.findOne.mockReturnValue(makeQuery(makeWO({ status: 'on_progress' })));
      await expect(service.cancel(woId, mockManager)).rejects.toThrow();
    });
  });

  // ─── updateStatus() ───

  describe('updateStatus()', () => {
    const woId = '507f1f77bcf86cd799439020';

    it('UT-WO-014: Mengubah status WO sesuai alur transisi valid → status terbaru', async () => {
      workOrderModel.findOne.mockReturnValue(makeQuery(makeWO({ status: 'approved' })));
      jest
        .spyOn(service, 'findOneInternal')
        .mockResolvedValue({ data: { status: 'sent' } });

      const result = await service.updateStatus(woId, { status: 'sent' }, mockManager);
      expect(result).toBeDefined();
      expect(result.data.status).toBe('sent');
    });
  });

  // ─── remove() ───

  describe('remove()', () => {
    const woId = '507f1f77bcf86cd799439020';

    it('UT-WO-015: Menghapus WO berdasarkan ID valid → konfirmasi penghapusan', async () => {
      workOrderModel.findOne.mockReturnValue(makeQuery(makeWO()));
      jest
        .spyOn(service as any, '_hydrateOne')
        .mockResolvedValue({ data: {}, meta: {} });

      const result = await service.remove(woId, mockManager);
      expect(result.data.deletedAt).toBeDefined();
    });

    it('UT-WO-016: Menghapus WO dengan ID tidak ditemukan → throw NotFoundError', async () => {
      workOrderModel.findOne.mockReturnValue(makeQuery(null));
      await expect(service.remove(woId, mockManager)).rejects.toThrow(NotFoundException);
    });
  });

  // ─── findAll() ───

  describe('findAll()', () => {
    it('UT-WO-017: Mengambil seluruh WO milik company → mengembalikan array', async () => {
      const expected = [{ _id: 'wo1', code: 'WO-001' }];
      workOrderModel.find.mockReturnValue(makeQuery(expected));
      jest.spyOn(service as any, '_hydrateOne').mockImplementation((wo: any) => wo);

      const result = await service.findAllInternal(mockManager, {});
      expect(result).toEqual(expected);
    });
  });

  // ─── findOne() ───

  describe('findOne()', () => {
    const woId = '507f1f77bcf86cd799439020';

    it('UT-WO-018: Mengambil detail WO berdasarkan ID valid → mengembalikan object', async () => {
      workOrderModel.findOne.mockReturnValue(makeQuery(makeWO()));
      submissionModel.find.mockReturnValue(makeQuery([]));
      jest.spyOn(service as any, '_hydrateOne').mockResolvedValue({ data: {} });

      const result = await service.findOneInternal(woId, mockManager);
      expect(result).toBeDefined();
    });

    it('UT-WO-019: Mengambil detail WO dengan ID tidak ditemukan → throw NotFoundError', async () => {
      workOrderModel.findOne.mockReturnValue(makeQuery(null));
      await expect(service.findOneInternal(woId, mockManager)).rejects.toThrow(
        NotFoundException,
      );
    });
  });
});
