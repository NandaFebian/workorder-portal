// src/company/companies.internal.service.spec.ts
import { Test, TestingModule } from '@nestjs/testing';
import { CompaniesInternalService } from './companies.internal.service';
import { getModelToken } from '@nestjs/mongoose';
import { Company } from './schemas/company.schemas';
import { Invitation } from './schemas/invitation.schemas';
import { UsersService } from '../users/users.service';
import { PositionsService } from '../positions/positions.service';
import {
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
});
