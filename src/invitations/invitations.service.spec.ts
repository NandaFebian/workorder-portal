// src/invitations/invitations.service.spec.ts
import { Test, TestingModule } from '@nestjs/testing';
import { InvitationsService } from './invitations.service';
import { getModelToken } from '@nestjs/mongoose';
import { Invitation } from '../company/schemas/invitation.schemas';
import { User } from '../users/schemas/user.schema';
import {
  BadRequestException,
  ForbiddenException,
  NotFoundException,
  UnprocessableEntityException,
} from '@nestjs/common';
import { Types } from 'mongoose';
import { Role } from '../common/enums/role.enum';
import { FcmService } from '../fcm/fcm.service';

describe('InvitationsService', () => {
  let service: InvitationsService;
  let invitationModel: any;
  let userModel: any;

  const mockUser = {
    _id: '507f1f77bcf86cd799439011',
    email: 'user@test.com',
    role: Role.UnassignedStaff,
    companyId: null,
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        InvitationsService,
        {
          provide: getModelToken(Invitation.name),
          useValue: {
            findById: jest.fn(),
            findOne: jest.fn(),
            create: jest.fn(),
          },
        },
        {
          provide: getModelToken(User.name),
          useValue: {
            findById: jest.fn(),
            findByIdAndUpdate: jest.fn(),
          },
        },
        { provide: FcmService, useValue: { sendToUser: jest.fn() } },
      ],
    }).compile();

    service = module.get<InvitationsService>(InvitationsService);
    invitationModel = module.get(getModelToken(Invitation.name));
    userModel = module.get(getModelToken(User.name));
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('acceptInvitation()', () => {
    let mockInvitation: any;
    let mockUserDocument: any;

    beforeEach(() => {
      mockInvitation = {
        _id: '507f1f77bcf86cd799439020',
        userId: new Types.ObjectId('507f1f77bcf86cd799439011'),
        companyId: new Types.ObjectId('507f1f77bcf86cd799439012'),
        positionId: new Types.ObjectId('507f1f77bcf86cd799439013'),
        role: Role.CompanyStaff,
        status: 'pending',
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
        save: jest.fn().mockResolvedValue(true),
        populate: jest.fn().mockReturnThis(),
      };

      mockUserDocument = {
        _id: '507f1f77bcf86cd799439011',
        email: 'user@test.com',
        name: 'Test User',
        role: Role.UnassignedStaff,
        companyId: null,
      };
    });

    it('UT-INV-001: should accept invitation successfully', async () => {
      // Arrange
      const mockExec = jest.fn().mockResolvedValue(mockInvitation);
      invitationModel.findById.mockReturnValue({ exec: mockExec });

      const mockUserExec = jest.fn().mockResolvedValue(mockUserDocument);
      userModel.findById.mockReturnValue({ exec: mockUserExec });

      const updatedUser = {
        ...mockUserDocument,
        companyId: mockInvitation.companyId,
        positionId: mockInvitation.positionId,
        role: mockInvitation.role,
      };

      const mockSelect = jest
        .fn()
        .mockReturnValue({ exec: jest.fn().mockResolvedValue(updatedUser) });
      userModel.findByIdAndUpdate.mockReturnValue({ select: mockSelect });

      // Act
      const result = await service.acceptInvitation(
        '507f1f77bcf86cd799439020',
        mockUser as any,
      );

      // Assert
      expect(invitationModel.findById).toHaveBeenCalledWith(
        '507f1f77bcf86cd799439020',
      );
      expect(mockInvitation.status).toBe('accepted');
      expect(mockInvitation.save).toHaveBeenCalled();
      expect(userModel.findByIdAndUpdate).toHaveBeenCalledWith(
        mockUser._id,
        {
          $set: {
            companyId: mockInvitation.companyId,
            positionId: mockInvitation.positionId,
            role: mockInvitation.role,
          },
        },
        { new: true },
      );
      expect(result.role).toBe(Role.CompanyStaff);
    });

    it('UT-INV-002: should throw ForbiddenException when user already has company', async () => {
      // Arrange
      const mockExec = jest.fn().mockResolvedValue(mockInvitation);
      invitationModel.findById.mockReturnValue({ exec: mockExec });

      const userWithCompany = {
        ...mockUserDocument,
        companyId: new Types.ObjectId('507f1f77bcf86cd799439099'),
      };
      const mockUserExec = jest.fn().mockResolvedValue(userWithCompany);
      userModel.findById.mockReturnValue({ exec: mockUserExec });

      // Act & Assert
      await expect(
        service.acceptInvitation('507f1f77bcf86cd799439020', mockUser as any),
      ).rejects.toThrow(UnprocessableEntityException);
      expect(mockInvitation.status).toBe('rejected');
      expect(mockInvitation.save).toHaveBeenCalled();
    });

    it('UT-INV-003: should throw UnprocessableEntityException when invitation expired', async () => {
      // Arrange
      const expiredInvitation = {
        ...mockInvitation,
        expiresAt: new Date(Date.now() - 1000), // Expired
      };
      const mockExec = jest.fn().mockResolvedValue(expiredInvitation);
      invitationModel.findById.mockReturnValue({ exec: mockExec });

      // Act & Assert
      await expect(
        service.acceptInvitation('507f1f77bcf86cd799439020', mockUser as any),
      ).rejects.toThrow(UnprocessableEntityException);
      expect(expiredInvitation.status).toBe('expired');
      expect(expiredInvitation.save).toHaveBeenCalled();
    });

    it('UT-INV-004: should throw UnprocessableEntityException when invitation already accepted', async () => {
      // Arrange
      const acceptedInvitation = {
        ...mockInvitation,
        status: 'accepted',
      };
      const mockExec = jest.fn().mockResolvedValue(acceptedInvitation);
      invitationModel.findById.mockReturnValue({ exec: mockExec });

      // Act & Assert
      await expect(
        service.acceptInvitation('507f1f77bcf86cd799439020', mockUser as any),
      ).rejects.toThrow(UnprocessableEntityException);
    });

    it('UT-INV-005: should throw ForbiddenException when wrong user tries to accept', async () => {
      // Arrange
      const invitationForDifferentUser = {
        ...mockInvitation,
        userId: new Types.ObjectId('507f1f77bcf86cd799439099'),
      };
      const mockExec = jest.fn().mockResolvedValue(invitationForDifferentUser);
      invitationModel.findById.mockReturnValue({ exec: mockExec });

      // Act & Assert
      await expect(
        service.acceptInvitation('507f1f77bcf86cd799439020', mockUser as any),
      ).rejects.toThrow(ForbiddenException);
    });

    it('UT-INV-006: should update user role correctly', async () => {
      // Arrange
      const managerInvitation = {
        ...mockInvitation,
        role: Role.CompanyManager,
      };
      const mockExec = jest.fn().mockResolvedValue(managerInvitation);
      invitationModel.findById.mockReturnValue({ exec: mockExec });

      const mockUserExec = jest.fn().mockResolvedValue(mockUserDocument);
      userModel.findById.mockReturnValue({ exec: mockUserExec });

      const updatedUser = {
        ...mockUserDocument,
        role: Role.CompanyManager,
      };

      const mockSelect = jest
        .fn()
        .mockReturnValue({ exec: jest.fn().mockResolvedValue(updatedUser) });
      userModel.findByIdAndUpdate.mockReturnValue({ select: mockSelect });

      // Act
      const result = await service.acceptInvitation(
        '507f1f77bcf86cd799439020',
        mockUser as any,
      );

      // Assert
      expect(result.role).toBe(Role.CompanyManager);
    });

    it('UT-INV-007: should update user companyId correctly', async () => {
      // Arrange
      const mockExec = jest.fn().mockResolvedValue(mockInvitation);
      invitationModel.findById.mockReturnValue({ exec: mockExec });

      const mockUserExec = jest.fn().mockResolvedValue(mockUserDocument);
      userModel.findById.mockReturnValue({ exec: mockUserExec });

      const updatedUser = {
        ...mockUserDocument,
        companyId: mockInvitation.companyId,
      };

      const mockSelect = jest
        .fn()
        .mockReturnValue({ exec: jest.fn().mockResolvedValue(updatedUser) });
      userModel.findByIdAndUpdate.mockReturnValue({ select: mockSelect });

      // Act
      const result = await service.acceptInvitation(
        '507f1f77bcf86cd799439020',
        mockUser as any,
      );

      // Assert
      expect(result.companyId).toEqual(mockInvitation.companyId);
    });

    it('UT-INV-008: should update user positionId correctly', async () => {
      // Arrange
      const mockExec = jest.fn().mockResolvedValue(mockInvitation);
      invitationModel.findById.mockReturnValue({ exec: mockExec });

      const mockUserExec = jest.fn().mockResolvedValue(mockUserDocument);
      userModel.findById.mockReturnValue({ exec: mockUserExec });

      const updatedUser = {
        ...mockUserDocument,
        positionId: mockInvitation.positionId,
      };

      const mockSelect = jest
        .fn()
        .mockReturnValue({ exec: jest.fn().mockResolvedValue(updatedUser) });
      userModel.findByIdAndUpdate.mockReturnValue({ select: mockSelect });

      // Act
      const result = await service.acceptInvitation(
        '507f1f77bcf86cd799439020',
        mockUser as any,
      );

      // Assert
      expect(result.positionId).toEqual(mockInvitation.positionId);
    });

    it('UT-INV-009: should change invitation status to accepted', async () => {
      // Arrange
      const mockExec = jest.fn().mockResolvedValue(mockInvitation);
      invitationModel.findById.mockReturnValue({ exec: mockExec });

      const mockUserExec = jest.fn().mockResolvedValue(mockUserDocument);
      userModel.findById.mockReturnValue({ exec: mockUserExec });

      const mockSelect = jest.fn().mockReturnValue({
        exec: jest.fn().mockResolvedValue(mockUserDocument),
      });
      userModel.findByIdAndUpdate.mockReturnValue({ select: mockSelect });

      const saveSpy = jest.spyOn(mockInvitation, 'save');

      // Act
      await service.acceptInvitation(
        '507f1f77bcf86cd799439020',
        mockUser as any,
      );

      // Assert
      expect(mockInvitation.status).toBe('accepted');
      expect(saveSpy).toHaveBeenCalled();
    });

    it('UT-INV-010: should save both user and invitation', async () => {
      // Arrange
      const mockExec = jest.fn().mockResolvedValue(mockInvitation);
      invitationModel.findById.mockReturnValue({ exec: mockExec });

      const mockUserExec = jest.fn().mockResolvedValue(mockUserDocument);
      userModel.findById.mockReturnValue({ exec: mockUserExec });

      const updatedUser = { ...mockUserDocument };
      const mockSelect = jest
        .fn()
        .mockReturnValue({ exec: jest.fn().mockResolvedValue(updatedUser) });
      const updateSpy = jest
        .spyOn(userModel, 'findByIdAndUpdate')
        .mockReturnValue({ select: mockSelect });

      const saveSpy = jest.spyOn(mockInvitation, 'save');

      // Act
      await service.acceptInvitation(
        '507f1f77bcf86cd799439020',
        mockUser as any,
      );

      // Assert
      expect(saveSpy).toHaveBeenCalled(); // Invitation saved
      expect(updateSpy).toHaveBeenCalled(); // User updated
    });
  });
});
