// src/company/companies.internal.service.spec.ts
import { Test, TestingModule } from '@nestjs/testing';
import { CompaniesInternalService } from './companies.internal.service';
import { getModelToken } from '@nestjs/mongoose';
import { Company } from './schemas/company.schemas';
import { Invitation } from './schemas/invitation.schemas';
import { ExternalAccount } from 'src/customer-pairing/schemas/external-account.schema';
import { MembershipCode } from 'src/membership/schemas/membership.schema';
import { UsersService } from '../users/users.service';
import { PositionsService } from '../positions/positions.service';
import { FcmService } from '../fcm/fcm.service';
import {
  ConflictException,
  NotFoundException,
  UnprocessableEntityException,
} from '@nestjs/common';
import { Types } from 'mongoose';
import { Role } from '../common/enums/role.enum';

describe('CompaniesInternalService', () => {
  let service: CompaniesInternalService;
  let companyModel: any;
  let invitationModel: any;
  let usersService: UsersService;
  let positionsService: PositionsService;

  const mockCompany = {
    _id: '507f1f77bcf86cd799439012',
    name: 'Test Company',
    ownerId: '507f1f77bcf86cd799439030',
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CompaniesInternalService,
        {
          provide: getModelToken(Company.name),
          useValue: {
            findById: jest.fn(),
            findOne: jest.fn(),
            create: jest.fn(),
          },
        },
        {
          provide: getModelToken(Invitation.name),
          useValue: {
            create: jest.fn(),
            find: jest.fn(),
          },
        },
        {
          provide: UsersService,
          useValue: {
            findOneByEmail: jest.fn(),
          },
        },
        {
          provide: PositionsService,
          useValue: {
            findById: jest.fn(),
          },
        },
        {
          provide: getModelToken(ExternalAccount.name),
          useValue: { find: jest.fn(), findOne: jest.fn() },
        },
        {
          provide: getModelToken(MembershipCode.name),
          useValue: { find: jest.fn(), findOne: jest.fn() },
        },
        {
          provide: FcmService,
          useValue: { sendToUser: jest.fn().mockResolvedValue(undefined) },
        },
      ],
    }).compile();

    service = module.get<CompaniesInternalService>(CompaniesInternalService);
    companyModel = module.get(getModelToken(Company.name));
    invitationModel = module.get(getModelToken(Invitation.name));
    usersService = module.get<UsersService>(UsersService);
    positionsService = module.get<PositionsService>(PositionsService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('inviteEmployees()', () => {
    const mockUser = {
      _id: '507f1f77bcf86cd799439040',
      name: 'Test User',
      email: 'user@test.com',
      role: Role.UnassignedStaff,
      companyId: null,
    };

    const mockPosition = {
      _id: '507f1f77bcf86cd799439050',
      id: '507f1f77bcf86cd799439050',
      name: 'Developer',
    };

    beforeEach(() => {
      // Second pass loads the company name for the notification, and cancels
      // any superseded pending invitations.
      companyModel.findById.mockReturnValue({
        select: jest.fn().mockReturnValue({
          exec: jest.fn().mockResolvedValue(mockCompany),
        }),
      });
      invitationModel.updateMany = jest.fn().mockResolvedValue({});
    });

    it('UT-CMP-001: should invite single employee successfully', async () => {
      // Arrange
      jest
        .spyOn(service, 'findInternalById')
        .mockResolvedValue(mockCompany as any);
      jest
        .spyOn(usersService, 'findOneByEmail')
        .mockResolvedValue(mockUser as any);
      jest
        .spyOn(positionsService, 'findById')
        .mockResolvedValue(mockPosition as any);
      jest.spyOn(invitationModel, 'create').mockResolvedValue({});

      const inviteDto = {
        invites: [
          {
            email: 'user@test.com',
            role: Role.CompanyStaff,
            positionId: '507f1f77bcf86cd799439050',
          },
        ],
      };

      // Act
      const result = await service.inviteEmployees(
        '507f1f77bcf86cd799439012',
        inviteDto,
      );

      // Assert
      expect(service.findInternalById).toHaveBeenCalledWith(
        '507f1f77bcf86cd799439012',
      );
      expect(usersService.findOneByEmail).toHaveBeenCalledWith('user@test.com');
      expect(positionsService.findById).toHaveBeenCalledWith(
        '507f1f77bcf86cd799439050',
      );
      expect(invitationModel.create).toHaveBeenCalled();
      expect(result.data).toHaveLength(1);
      expect(result.errors).toHaveLength(0);
    });

    it('UT-CMP-002: should invite multiple employees in bulk', async () => {
      // Arrange
      const user1 = { ...mockUser, email: 'user1@test.com' };
      const user2 = { ...mockUser, email: 'user2@test.com' };
      const user3 = { ...mockUser, email: 'user3@test.com' };
      const user4 = { ...mockUser, email: 'user4@test.com' };
      const user5 = { ...mockUser, email: 'user5@test.com' };

      jest
        .spyOn(service, 'findInternalById')
        .mockResolvedValue(mockCompany as any);
      jest
        .spyOn(usersService, 'findOneByEmail')
        .mockResolvedValueOnce(user1 as any)
        .mockResolvedValueOnce(user2 as any)
        .mockResolvedValueOnce(user3 as any)
        .mockResolvedValueOnce(user4 as any)
        .mockResolvedValueOnce(user5 as any);
      jest
        .spyOn(positionsService, 'findById')
        .mockResolvedValue(mockPosition as any);
      jest.spyOn(invitationModel, 'create').mockResolvedValue({});

      const inviteDto = {
        invites: [
          {
            email: 'user1@test.com',
            role: Role.CompanyStaff,
            positionId: '507f1f77bcf86cd799439050',
          },
          {
            email: 'user2@test.com',
            role: Role.CompanyStaff,
            positionId: '507f1f77bcf86cd799439050',
          },
          {
            email: 'user3@test.com',
            role: Role.CompanyStaff,
            positionId: '507f1f77bcf86cd799439050',
          },
          {
            email: 'user4@test.com',
            role: Role.CompanyStaff,
            positionId: '507f1f77bcf86cd799439050',
          },
          {
            email: 'user5@test.com',
            role: Role.CompanyStaff,
            positionId: '507f1f77bcf86cd799439050',
          },
        ],
      };

      // Act
      const result = await service.inviteEmployees(
        '507f1f77bcf86cd799439012',
        inviteDto,
      );

      // Assert
      expect(usersService.findOneByEmail).toHaveBeenCalledTimes(5);
      expect(invitationModel.create).toHaveBeenCalledTimes(5);
      expect(result.data).toHaveLength(5);
      expect(result.errors).toHaveLength(0);
    });

    it('UT-CMP-003: should set expiration date correctly', async () => {
      // Arrange
      jest
        .spyOn(service, 'findInternalById')
        .mockResolvedValue(mockCompany as any);
      jest
        .spyOn(usersService, 'findOneByEmail')
        .mockResolvedValue(mockUser as any);
      jest
        .spyOn(positionsService, 'findById')
        .mockResolvedValue(mockPosition as any);

      const createSpy = jest
        .spyOn(invitationModel, 'create')
        .mockResolvedValue({});
      const beforeTime = new Date();
      beforeTime.setDate(beforeTime.getDate() + 7);

      const inviteDto = {
        invites: [
          {
            email: 'user@test.com',
            role: Role.CompanyStaff,
            positionId: '507f1f77bcf86cd799439050',
          },
        ],
      };

      // Act
      await service.inviteEmployees('507f1f77bcf86cd799439012', inviteDto);

      // Assert
      expect(createSpy).toHaveBeenCalled();
      const createCall = createSpy.mock.calls[0][0] as any;
      expect(createCall.expiresAt).toBeInstanceOf(Date);
      // Verify it's approximately 7 days from now (within 1 minute tolerance)
      const expectedTime = new Date();
      expectedTime.setDate(expectedTime.getDate() + 7);
      const timeDiff = Math.abs(
        createCall.expiresAt.getTime() - expectedTime.getTime(),
      );
      expect(timeDiff).toBeLessThan(60000); // Less than 1 minute difference
    });

    it('UT-CMP-004: should add error for invalid positionId', async () => {
      // Arrange
      jest
        .spyOn(service, 'findInternalById')
        .mockResolvedValue(mockCompany as any);
      jest
        .spyOn(usersService, 'findOneByEmail')
        .mockResolvedValue(mockUser as any);
      jest.spyOn(positionsService, 'findById').mockResolvedValue(null as any);

      const inviteDto = {
        invites: [
          {
            email: 'user@test.com',
            role: Role.CompanyStaff,
            positionId: 'invalid-position-id',
          },
        ],
      };

      // Act & Assert
      await expect(
        service.inviteEmployees('507f1f77bcf86cd799439012', inviteDto),
      ).rejects.toThrow(UnprocessableEntityException);

      try {
        await service.inviteEmployees('507f1f77bcf86cd799439012', inviteDto);
      } catch (error: any) {
        const errResponse = error.getResponse();
        expect(errResponse.errors).toHaveLength(1);
        expect(errResponse.errors[0].message).toContain('Position');
      }
    });

    it('UT-CMP-005: should handle duplicate email gracefully', async () => {
      // Arrange
      const userWithCompany = {
        ...mockUser,
        companyId: '507f1f77bcf86cd799439099',
      };
      jest
        .spyOn(service, 'findInternalById')
        .mockResolvedValue(mockCompany as any);
      jest
        .spyOn(usersService, 'findOneByEmail')
        .mockResolvedValue(userWithCompany as any);
      jest
        .spyOn(positionsService, 'findById')
        .mockResolvedValue(mockPosition as any);

      const inviteDto = {
        invites: [
          {
            email: 'user@test.com',
            role: Role.CompanyStaff,
            positionId: '507f1f77bcf86cd799439050',
          },
        ],
      };

      // Act & Assert
      await expect(
        service.inviteEmployees('507f1f77bcf86cd799439012', inviteDto),
      ).rejects.toThrow(UnprocessableEntityException);

      try {
        await service.inviteEmployees('507f1f77bcf86cd799439012', inviteDto);
      } catch (error: any) {
        const errResponse = error.getResponse();
        expect(errResponse.errors).toHaveLength(1);
        expect(errResponse.errors[0].message).toContain(
          'already belongs to a company',
        );
      }
    });

    it('UT-CMP-006: should set same companyId for all invitations', async () => {
      // Arrange
      const user1 = { ...mockUser, email: 'user1@test.com' };
      const user2 = { ...mockUser, email: 'user2@test.com' };

      jest
        .spyOn(service, 'findInternalById')
        .mockResolvedValue(mockCompany as any);
      jest
        .spyOn(usersService, 'findOneByEmail')
        .mockResolvedValueOnce(user1 as any)
        .mockResolvedValueOnce(user2 as any);
      jest
        .spyOn(positionsService, 'findById')
        .mockResolvedValue(mockPosition as any);

      const createSpy = jest
        .spyOn(invitationModel, 'create')
        .mockResolvedValue({});

      const inviteDto = {
        invites: [
          {
            email: 'user1@test.com',
            role: Role.CompanyStaff,
            positionId: '507f1f77bcf86cd799439050',
          },
          {
            email: 'user2@test.com',
            role: Role.CompanyStaff,
            positionId: '507f1f77bcf86cd799439050',
          },
        ],
      };

      // Act
      await service.inviteEmployees('507f1f77bcf86cd799439012', inviteDto);

      // Assert
      expect(createSpy).toHaveBeenCalledTimes(2);
      const call1 = createSpy.mock.calls[0][0] as any;
      const call2 = createSpy.mock.calls[1][0] as any;
      expect(call1.companyId.toString()).toBe('507f1f77bcf86cd799439012');
      expect(call2.companyId.toString()).toBe('507f1f77bcf86cd799439012');
    });

    it('UT-CMP-007: should set invitation status to pending', async () => {
      // Arrange
      jest
        .spyOn(service, 'findInternalById')
        .mockResolvedValue(mockCompany as any);
      jest
        .spyOn(usersService, 'findOneByEmail')
        .mockResolvedValue(mockUser as any);
      jest
        .spyOn(positionsService, 'findById')
        .mockResolvedValue(mockPosition as any);

      const createSpy = jest
        .spyOn(invitationModel, 'create')
        .mockResolvedValue({});

      const inviteDto = {
        invites: [
          {
            email: 'user@test.com',
            role: Role.CompanyStaff,
            positionId: '507f1f77bcf86cd799439050',
          },
        ],
      };

      // Act
      await service.inviteEmployees('507f1f77bcf86cd799439012', inviteDto);

      // Assert
      expect(createSpy).toHaveBeenCalled();
      const createCall = createSpy.mock.calls[0][0] as any;
      expect(createCall.status).toBe('pending');
    });
  });
  describe('company name uniqueness', () => {
    // findOne().select().exec() chain used by assertNameAvailable
    const nameLookup = (result: any) => {
      const chain: any = {};
      chain.select = jest.fn().mockReturnValue(chain);
      chain.exec = jest.fn().mockResolvedValue(result);
      return chain;
    };

    const matchedName = () => companyModel.findOne.mock.calls[0][0].name.$regex;

    it('rejects a create whose name is already taken', async () => {
      companyModel.findOne.mockReturnValue(nameLookup({ _id: 'existing' }));

      await expect(
        service.create({
          name: 'PT Maju Jaya',
          address: null,
          ownerId: new Types.ObjectId(),
        }),
      ).rejects.toThrow(ConflictException);
    });

    it('matches case-insensitively and ignores surrounding whitespace', async () => {
      companyModel.findOne.mockReturnValue(nameLookup({ _id: 'existing' }));

      await expect(
        service.create({
          name: '  pt maju jaya  ',
          address: null,
          ownerId: new Types.ObjectId(),
        }),
      ).rejects.toThrow(ConflictException);

      const regex: RegExp = matchedName();
      expect(regex.test('PT Maju Jaya')).toBe(true); // different case -> collision
      expect(regex.flags).toContain('i');
    });

    it('is an exact match, not a partial one', async () => {
      companyModel.findOne.mockReturnValue(nameLookup(null));
      (companyModel as any).prototype = undefined;

      await service
        .create({
          name: 'Maju',
          address: null,
          ownerId: new Types.ObjectId(),
        })
        .catch(() => undefined); // creation itself is not what we assert here

      const regex: RegExp = matchedName();
      expect(regex.test('Maju')).toBe(true);
      expect(regex.test('Maju Jaya')).toBe(false); // must not collide
    });

    it('escapes regex metacharacters in the name', async () => {
      companyModel.findOne.mockReturnValue(nameLookup(null));

      await service
        .create({
          name: 'A.B*C',
          address: null,
          ownerId: new Types.ObjectId(),
        })
        .catch(() => undefined);

      const regex: RegExp = matchedName();
      expect(regex.test('A.B*C')).toBe(true);
      expect(regex.test('AXBXXC')).toBe(false); // metachars must be literal
    });

    it('rejects an update that renames onto another company', async () => {
      const id = '507f1f77bcf86cd799439012';
      companyModel.findById.mockReturnValue({
        exec: jest.fn().mockResolvedValue({ _id: id, name: 'Old Name' }),
      });
      companyModel.findOne.mockReturnValue(nameLookup({ _id: 'someone-else' }));

      await expect(service.update(id, { name: 'Taken Name' })).rejects.toThrow(
        ConflictException,
      );
    });

    it('lets a company keep its own name on update', async () => {
      const id = '507f1f77bcf86cd799439012';
      const doc: any = {
        _id: id,
        name: 'Same Name',
        save: jest.fn().mockResolvedValue({ _id: id, name: 'Same Name' }),
      };
      companyModel.findById.mockReturnValue({
        exec: jest.fn().mockResolvedValue(doc),
      });
      companyModel.findOne.mockReturnValue(nameLookup(null));

      await service.update(id, { name: 'Same Name' });

      // The company excludes itself from the collision check.
      const filter = companyModel.findOne.mock.calls[0][0];
      expect(filter._id.$ne.toString()).toBe(id);
      expect(doc.save).toHaveBeenCalled();
    });

    it('skips the check when the update does not touch the name', async () => {
      const id = '507f1f77bcf86cd799439012';
      const doc: any = {
        _id: id,
        name: 'Same Name',
        save: jest.fn().mockResolvedValue({}),
      };
      companyModel.findById.mockReturnValue({
        exec: jest.fn().mockResolvedValue(doc),
      });

      await service.update(id, { address: 'New address' });

      expect(companyModel.findOne).not.toHaveBeenCalled();
    });
  });
});
