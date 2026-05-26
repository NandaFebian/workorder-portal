import { Test, TestingModule } from '@nestjs/testing';
import { getModelToken } from '@nestjs/mongoose';
import { BadRequestException, ForbiddenException, ConflictException, NotFoundException } from '@nestjs/common';
import { MembershipService } from './membership.service';
import { MembershipCode } from './schemas/membership.schema';
import { Company } from 'src/company/schemas/company.schemas';
import { ExternalAccount } from 'src/customer-pairing/schemas/external-account.schema';
import { HttpService } from '@nestjs/axios';

describe('MembershipService', () => {
  let service: MembershipService;
  let membershipCodeModelMock: any;
  let companyModelMock: any;
  let externalAccountModelMock: any;

  beforeEach(async () => {
    membershipCodeModelMock = {
      insertMany: jest.fn(),
      findOne: jest.fn(),
      findOneAndUpdate: jest.fn(),
      findById: jest.fn(),
    };

    companyModelMock = {
      findOne: jest.fn(),
    };

    externalAccountModelMock = {
      create: jest.fn(),
      findOne: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        MembershipService,
        {
          provide: getModelToken(MembershipCode.name),
          useValue: membershipCodeModelMock,
        },
        {
          provide: getModelToken(Company.name),
          useValue: companyModelMock,
        },
        {
          provide: getModelToken(ExternalAccount.name),
          useValue: externalAccountModelMock,
        },
        {
          provide: HttpService,
          useValue: {},
        },
      ],
    }).compile();

    service = module.get<MembershipService>(MembershipService);
  });

  describe('importFromCsv', () => {
    const mockUser: any = {
      company: {
        _id: 'company-id-123',
      },
    };

    it('should throw ForbiddenException if user has no company', async () => {
      await expect(
        service.importFromCsv({} as any, { company: null } as any),
      ).rejects.toThrow(ForbiddenException);
    });

    it('should throw BadRequestException if file is missing', async () => {
      await expect(
        service.importFromCsv(null as any, mockUser),
      ).rejects.toThrow(BadRequestException);
    });

    it('should throw BadRequestException if CSV format is invalid', async () => {
      const mockFile = {
        buffer: Buffer.from('invalid,csv\n"unclosed quote'),
      } as any;
      await expect(
        service.importFromCsv(mockFile, mockUser),
      ).rejects.toThrow(BadRequestException);
    });

    it('should throw BadRequestException if CSV is empty', async () => {
      const mockFile = {
        buffer: Buffer.from(''),
      } as any;
      await expect(
        service.importFromCsv(mockFile, mockUser),
      ).rejects.toThrow(BadRequestException);
    });

    it('should successfully import when all required columns are present', async () => {
      const csvContent = 
        'external_customer_email,external_customer_name,token\n' +
        'user1@example.com,User One,TOKEN123\n' +
        'user2@example.com,User Two,TOKEN456';
      const mockFile = {
        buffer: Buffer.from(csvContent),
      } as any;

      membershipCodeModelMock.insertMany.mockResolvedValue([
        { externalCustomerEmail: 'user1@example.com', externalCustomerName: 'User One', token: 'TOKEN123' },
        { externalCustomerEmail: 'user2@example.com', externalCustomerName: 'User Two', token: 'TOKEN456' },
      ]);

      const result = await service.importFromCsv(mockFile, mockUser);
      expect(result).toBeDefined();
      expect(membershipCodeModelMock.insertMany).toHaveBeenCalledWith([
        {
          companyId: 'company-id-123',
          externalCustomerEmail: 'user1@example.com',
          externalCustomerName: 'User One',
          token: 'TOKEN123',
        },
        {
          companyId: 'company-id-123',
          externalCustomerEmail: 'user2@example.com',
          externalCustomerName: 'User Two',
          token: 'TOKEN456',
        },
      ]);
    });

    it('should support email and name aliases', async () => {
      const csvContent = 
        'email,name,token\n' +
        'user1@example.com,User One,TOKEN123';
      const mockFile = {
        buffer: Buffer.from(csvContent),
      } as any;

      membershipCodeModelMock.insertMany.mockResolvedValue([
        { externalCustomerEmail: 'user1@example.com', externalCustomerName: 'User One', token: 'TOKEN123' },
      ]);

      await service.importFromCsv(mockFile, mockUser);
      expect(membershipCodeModelMock.insertMany).toHaveBeenCalledWith([
        {
          companyId: 'company-id-123',
          externalCustomerEmail: 'user1@example.com',
          externalCustomerName: 'User One',
          token: 'TOKEN123',
        },
      ]);
    });

    it('should throw BadRequestException if token column is missing or empty', async () => {
      const csvContent = 
        'external_customer_email,external_customer_name,token\n' +
        'user1@example.com,User One,\n';
      const mockFile = {
        buffer: Buffer.from(csvContent),
      } as any;

      await expect(
        service.importFromCsv(mockFile, mockUser),
      ).rejects.toThrow(BadRequestException);
    });

    it('should throw BadRequestException if email or name columns are missing', async () => {
      const csvContent = 
        'external_customer_name,token\n' +
        'User One,TOKEN123\n';
      const mockFile = {
        buffer: Buffer.from(csvContent),
      } as any;

      await expect(
        service.importFromCsv(mockFile, mockUser),
      ).rejects.toThrow(BadRequestException);
    });
  });

  describe('claimCode', () => {
    const mockUser: any = {
      _id: 'user-id-123',
    };

    it('should throw NotFoundException if code is invalid', async () => {
      membershipCodeModelMock.findOne.mockResolvedValue(null);
      await expect(
        service.claimCode({ code: 'INVALID' }, mockUser),
      ).rejects.toThrow(NotFoundException);
    });

    it('should successfully claim code and create external account record', async () => {
      const mockCodeDoc = {
        _id: 'code-id-123',
        companyId: 'company-id-123',
        externalCustomerEmail: 'external@example.com',
        externalCustomerName: 'External Name',
        token: 'TOKEN123',
        claimedBy: null,
      };

      membershipCodeModelMock.findOne.mockImplementation((query) => {
        if (query.token === 'TOKEN123') {
          return mockCodeDoc;
        }
        // Mock query for isUserSubscribed check
        return {
          select: jest.fn().mockReturnValue({
            lean: jest.fn().mockResolvedValue(null),
          }),
        };
      });

      companyModelMock.findOne.mockReturnValue({
        select: jest.fn().mockReturnValue({
          lean: jest.fn().mockResolvedValue({
            integrationConfig: {
              integrationType: 'claim_token',
            },
          }),
        }),
      });

      membershipCodeModelMock.findOneAndUpdate.mockResolvedValue({
        ...mockCodeDoc,
        claimedBy: mockUser._id,
      });

      membershipCodeModelMock.findById.mockReturnValue({
        populate: jest.fn().mockReturnValue({
          populate: jest.fn().mockReturnValue({
            exec: jest.fn().mockResolvedValue({
              toObject: jest.fn().mockReturnValue({
                companyId: 'company-id-123',
                externalCustomerEmail: 'external@example.com',
                externalCustomerName: 'External Name',
                token: 'TOKEN123',
                claimedBy: { _id: 'user-id-123' },
              }),
            }),
          }),
        }),
      });

      const result = await service.claimCode({ code: 'TOKEN123' }, mockUser);
      expect(result).toBeDefined();
      expect(externalAccountModelMock.create).toHaveBeenCalledWith({
        externalCustomerEmail: 'external@example.com',
        externalCustomerName: 'External Name',
        companyId: 'company-id-123',
        userId: mockUser._id,
        pairedAt: expect.any(Date),
        integrationType: 'claim_token',
      });
    });
  });
});
