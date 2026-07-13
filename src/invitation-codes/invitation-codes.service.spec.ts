import { Test, TestingModule } from '@nestjs/testing';
import { getModelToken } from '@nestjs/mongoose';
import {
  ForbiddenException,
  NotFoundException,
  UnprocessableEntityException,
} from '@nestjs/common';
import { Types } from 'mongoose';
import { InvitationCodesService } from './invitation-codes.service';
import { InvitationCode } from './schemas/invitation-code.schema';
import { User } from '../users/schemas/user.schema';
import { Company } from '../company/schemas/company.schemas';
import { PositionsService } from '../positions/positions.service';
import { FcmService } from '../fcm/fcm.service';
import { Role } from '../common/enums/role.enum';

const asExec = (value: any) => ({ exec: jest.fn().mockResolvedValue(value) });

// Chainable builder: findOne().select().populate()...exec()
const asChain = (value: any) => {
  const chain: any = {};
  chain.select = jest.fn().mockReturnValue(chain);
  chain.populate = jest.fn().mockReturnValue(chain);
  chain.sort = jest.fn().mockReturnValue(chain);
  chain.exec = jest.fn().mockResolvedValue(value);
  return chain;
};

describe('InvitationCodesService', () => {
  let service: InvitationCodesService;
  let codeModel: any;
  let userModel: any;
  let positionsService: PositionsService;

  const COMPANY_ID = new Types.ObjectId().toString();
  const POSITION_ID = new Types.ObjectId().toString();
  const OTHER_POSITION_ID = new Types.ObjectId().toString();

  const owner: any = {
    _id: new Types.ObjectId().toString(),
    role: Role.CompanyOwner,
    company: { _id: COMPANY_ID },
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        InvitationCodesService,
        {
          provide: getModelToken(InvitationCode.name),
          useValue: {
            create: jest.fn(),
            find: jest.fn(),
            findOne: jest.fn(),
            findOneAndUpdate: jest.fn(),
            updateOne: jest.fn(),
          },
        },
        {
          provide: getModelToken(User.name),
          useValue: {
            findById: jest.fn(),
            findByIdAndUpdate: jest.fn(),
          },
        },
        {
          provide: getModelToken(Company.name),
          useValue: { findById: jest.fn() },
        },
        {
          provide: PositionsService,
          useValue: { findById: jest.fn() },
        },
        {
          provide: FcmService,
          useValue: { sendToUser: jest.fn().mockResolvedValue(undefined) },
        },
      ],
    }).compile();

    service = module.get(InvitationCodesService);
    codeModel = module.get(getModelToken(InvitationCode.name));
    userModel = module.get(getModelToken(User.name));
    positionsService = module.get(PositionsService);
  });

  afterEach(() => jest.clearAllMocks());

  describe('create() — same rules as a regular invitation', () => {
    it('rejects a staff code with no position', async () => {
      await expect(
        service.create(COMPANY_ID, { role: Role.CompanyStaff } as any, owner),
      ).rejects.toThrow(UnprocessableEntityException);
      expect(codeModel.create).not.toHaveBeenCalled();
    });

    it('rejects a role outside staff/manager', async () => {
      await expect(
        service.create(COMPANY_ID, { role: Role.CompanyOwner } as any, owner),
      ).rejects.toThrow(UnprocessableEntityException);
    });

    it('allows a manager code with no position', async () => {
      codeModel.findOne.mockReturnValue(asChain(null)); // code uniqueness check
      codeModel.create.mockResolvedValue({ _id: new Types.ObjectId() });
      jest
        .spyOn(service as any, 'findOneOrFail')
        .mockResolvedValue({ code: 'ABC12345' } as any);

      await service.create(
        COMPANY_ID,
        { role: Role.CompanyManager } as any,
        owner,
      );

      const created = codeModel.create.mock.calls[0][0];
      expect(created.role).toBe(Role.CompanyManager);
      expect(created.positionId).toBeNull();
      expect(created.code).toEqual(expect.any(String));
    });

    it('stores the position for a staff code', async () => {
      jest
        .spyOn(positionsService, 'findById')
        .mockResolvedValue({ _id: POSITION_ID } as any);
      codeModel.findOne.mockReturnValue(asChain(null));
      codeModel.create.mockResolvedValue({ _id: new Types.ObjectId() });
      jest.spyOn(service as any, 'findOneOrFail').mockResolvedValue({} as any);

      await service.create(
        COMPANY_ID,
        { role: Role.CompanyStaff, positionId: POSITION_ID } as any,
        owner,
      );

      const created = codeModel.create.mock.calls[0][0];
      expect(created.role).toBe(Role.CompanyStaff);
      expect(created.positionId.toString()).toBe(POSITION_ID);
      expect(created.maxUses).toBeNull(); // unlimited by default
      expect(created.expiresAt).toBeNull(); // no expiry by default
    });

    it('stops a department manager configuring a code for another department', async () => {
      const deptManager: any = {
        _id: new Types.ObjectId().toString(),
        role: Role.CompanyManager,
        company: { _id: COMPANY_ID },
        position: { _id: POSITION_ID },
      };
      jest
        .spyOn(positionsService, 'findById')
        .mockResolvedValue({ _id: OTHER_POSITION_ID } as any);

      await expect(
        service.create(
          COMPANY_ID,
          { role: Role.CompanyStaff, positionId: OTHER_POSITION_ID } as any,
          deptManager,
        ),
      ).rejects.toThrow(UnprocessableEntityException);
      expect(codeModel.create).not.toHaveBeenCalled();
    });
  });

  describe('claim()', () => {
    const CODE_ID = new Types.ObjectId();

    const claimable = (overrides: any = {}) => ({
      _id: CODE_ID,
      code: 'JOIN2026',
      companyId: new Types.ObjectId(COMPANY_ID),
      role: Role.CompanyStaff,
      positionId: new Types.ObjectId(POSITION_ID),
      isActive: true,
      maxUses: null,
      usedCount: 0,
      expiresAt: null,
      ...overrides,
    });

    const claimer: any = { _id: new Types.ObjectId().toString() };

    it('sets role, position and company from the code config', async () => {
      const code = claimable();
      codeModel.findOne.mockReturnValue(asExec(code));
      userModel.findById.mockReturnValue(
        asExec({
          _id: claimer._id,
          name: 'Budi',
          role: Role.UnassignedStaff,
          companyId: null,
        }),
      );
      codeModel.findOneAndUpdate.mockReturnValue(asExec(code));
      userModel.findByIdAndUpdate.mockReturnValue(
        asChain({ _id: claimer._id, role: Role.CompanyStaff }),
      );

      await service.claim({ code: 'join2026' }, claimer);

      // Code lookup is case-insensitive (normalised to upper case).
      expect(codeModel.findOne).toHaveBeenCalledWith(
        expect.objectContaining({ code: 'JOIN2026' }),
      );

      const [, update] = userModel.findByIdAndUpdate.mock.calls[0];
      expect(update.$set).toEqual({
        companyId: code.companyId,
        positionId: code.positionId,
        role: Role.CompanyStaff,
      });

      // A use is consumed atomically.
      const [, incUpdate] = codeModel.findOneAndUpdate.mock.calls[0];
      expect(incUpdate.$inc).toEqual({ usedCount: 1 });
    });

    it('refuses a user who is not unassigned staff', async () => {
      codeModel.findOne.mockReturnValue(asExec(claimable()));
      userModel.findById.mockReturnValue(
        asExec({ role: Role.CompanyStaff, companyId: null }),
      );

      await expect(service.claim({ code: 'JOIN2026' }, claimer)).rejects.toThrow(
        ForbiddenException,
      );
      expect(userModel.findByIdAndUpdate).not.toHaveBeenCalled();
    });

    it('refuses a user who already belongs to a company', async () => {
      codeModel.findOne.mockReturnValue(asExec(claimable()));
      userModel.findById.mockReturnValue(
        asExec({
          role: Role.UnassignedStaff,
          companyId: new Types.ObjectId(),
        }),
      );

      await expect(service.claim({ code: 'JOIN2026' }, claimer)).rejects.toThrow(
        UnprocessableEntityException,
      );
      expect(userModel.findByIdAndUpdate).not.toHaveBeenCalled();
    });

    it('rejects an unknown code', async () => {
      codeModel.findOne.mockReturnValue(asExec(null));

      await expect(service.claim({ code: 'NOPE' }, claimer)).rejects.toThrow(
        NotFoundException,
      );
    });

    it('rejects an inactive, expired or fully-claimed code', async () => {
      const cases = [
        claimable({ isActive: false }),
        claimable({ expiresAt: new Date(Date.now() - 1000) }),
        claimable({ maxUses: 2, usedCount: 2 }),
      ];

      for (const code of cases) {
        codeModel.findOne.mockReturnValue(asExec(code));
        await expect(
          service.claim({ code: 'JOIN2026' }, claimer),
        ).rejects.toThrow(UnprocessableEntityException);
      }
      expect(userModel.findByIdAndUpdate).not.toHaveBeenCalled();
    });
  });
});
