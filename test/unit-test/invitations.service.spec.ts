import { Test, TestingModule } from '@nestjs/testing';
import { InvitationsService } from 'src/invitations/invitations.service';
import { getModelToken } from '@nestjs/mongoose';
import { Invitation } from 'src/company/schemas/invitation.schemas';
import { User } from 'src/users/schemas/user.schema';
import {
  ForbiddenException,
  NotFoundException,
  UnprocessableEntityException,
} from '@nestjs/common';
import { Types } from 'mongoose';
import { Role } from 'src/common/enums/role.enum';
import { FcmService } from 'src/fcm/fcm.service';

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

  let mockInvitation: any;
  let mockUserDocument: any;

  beforeEach(async () => {
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

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        InvitationsService,
        {
          provide: getModelToken(Invitation.name),
          useValue: { findById: jest.fn(), findOne: jest.fn(), create: jest.fn() },
        },
        {
          provide: getModelToken(User.name),
          useValue: { findById: jest.fn(), findByIdAndUpdate: jest.fn() },
        },
        {
          provide: FcmService,
          useValue: {
            sendToUser: jest.fn(),
            markAsReadByType: jest.fn().mockResolvedValue(undefined),
          },
        },
      ],
    }).compile();

    service = module.get<InvitationsService>(InvitationsService);
    invitationModel = module.get(getModelToken(Invitation.name));
    userModel = module.get(getModelToken(User.name));
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  // ─── UT-INV-001/002/003: acceptInvitation() ───

  describe('acceptInvitation()', () => {
    it('UT-INV-001: Menerima undangan valid → relasi user-company aktif', async () => {
      invitationModel.findById.mockReturnValue({
        exec: jest.fn().mockResolvedValue(mockInvitation),
      });
      userModel.findById.mockReturnValue({
        exec: jest.fn().mockResolvedValue(mockUserDocument),
      });

      const updatedUser = {
        ...mockUserDocument,
        companyId: mockInvitation.companyId,
        positionId: mockInvitation.positionId,
        role: mockInvitation.role,
      };
      userModel.findByIdAndUpdate.mockReturnValue({
        select: jest.fn().mockReturnValue({
          exec: jest.fn().mockResolvedValue(updatedUser),
        }),
      });

      const result = await service.acceptInvitation('507f1f77bcf86cd799439020', mockUser as any);

      expect(mockInvitation.status).toBe('accepted');
      expect(mockInvitation.save).toHaveBeenCalled();
      expect(result.role).toBe(Role.CompanyStaff);
    });

    it('UT-INV-002: Menerima undangan yang sudah di-accept → throw ConflictError', async () => {
      const acceptedInvitation = { ...mockInvitation, status: 'accepted' };
      invitationModel.findById.mockReturnValue({
        exec: jest.fn().mockResolvedValue(acceptedInvitation),
      });

      await expect(
        service.acceptInvitation('507f1f77bcf86cd799439020', mockUser as any),
      ).rejects.toThrow(UnprocessableEntityException);
    });

    it('UT-INV-003: Menerima undangan dengan ID tidak ditemukan → throw NotFoundError', async () => {
      invitationModel.findById.mockReturnValue({
        exec: jest.fn().mockResolvedValue(null),
      });

      await expect(
        service.acceptInvitation('507f1f77bcf86cd799439099', mockUser as any),
      ).rejects.toThrow(NotFoundException);
    });
  });

  // ─── UT-INV-004/005: rejectInvitation() ───

  describe('rejectInvitation()', () => {
    it('UT-INV-004: Menolak undangan pending → status rejected', async () => {
      const pendingInvitation = {
        ...mockInvitation,
        status: 'pending',
        save: jest.fn().mockResolvedValue(true),
      };
      invitationModel.findById.mockReturnValue({
        exec: jest.fn().mockResolvedValue(pendingInvitation),
      });

      const result = await service.rejectInvitation('507f1f77bcf86cd799439020', mockUser as any);
      expect(pendingInvitation.status).toBe('rejected');
      expect(pendingInvitation.save).toHaveBeenCalled();
    });

    it('UT-INV-005: Menolak undangan yang sudah di-accept → throw ConflictError', async () => {
      const acceptedInvitation = { ...mockInvitation, status: 'accepted' };
      invitationModel.findById.mockReturnValue({
        exec: jest.fn().mockResolvedValue(acceptedInvitation),
      });

      await expect(
        service.rejectInvitation('507f1f77bcf86cd799439020', mockUser as any),
      ).rejects.toThrow(UnprocessableEntityException);
    });
  });

  // ─── UT-INV-006: getMyPendingInvitations() ───

  describe('findPendingForUser()', () => {
    it('UT-INV-006: Mengambil undangan pending milik user → array undangan', async () => {
      userModel.findById.mockReturnValue({
        exec: jest.fn().mockResolvedValue(mockUserDocument),
      });
      // find() is chained for the pending query and called plainly for the expired query
      invitationModel.find = jest.fn().mockReturnValue({
        populate: jest.fn().mockReturnThis(),
        select: jest.fn().mockReturnThis(),
        sort: jest.fn().mockReturnThis(),
        exec: jest.fn().mockResolvedValue([]),
      });

      const result = await service.findPendingForUser(mockUser._id);

      expect(Array.isArray(result)).toBe(true);
      expect(invitationModel.find).toHaveBeenCalled();
    });
  });

  // ─── UT-INV-007/008: remove() ───

  describe('remove()', () => {
    it('UT-INV-007: Menghapus undangan ID valid → konfirmasi penghapusan', async () => {
      const mockInv = {
        ...mockInvitation,
        deletedAt: null,
        save: jest.fn().mockResolvedValue({ deletedAt: new Date() }),
        populate: jest.fn().mockResolvedValue(undefined),
      };
      // remove() resolves the invitation via findOne(...).exec()
      invitationModel.findOne.mockReturnValue({
        exec: jest.fn().mockResolvedValue(mockInv),
      });
      // The deleting user must belong to the same company as the invitation
      const adminUser = {
        ...mockUser,
        company: { _id: mockInvitation.companyId },
      };

      const result = await service.remove('507f1f77bcf86cd799439020', adminUser as any);
      expect(result).toBeDefined();
    });

    it('UT-INV-008: Menghapus undangan ID tidak ditemukan → throw NotFoundError', async () => {
      invitationModel.findOne.mockReturnValue({
        exec: jest.fn().mockResolvedValue(null),
      });

      await expect(
        service.remove('507f1f77bcf86cd799439099', mockUser as any),
      ).rejects.toThrow(NotFoundException);
    });
  });
});
