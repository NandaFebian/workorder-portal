import { Test, TestingModule } from '@nestjs/testing';
import { CustomerPairingService } from './customer-pairing.service';
import { getModelToken } from '@nestjs/mongoose';
import { ExternalAccount } from './schemas/external-account.schema';
import { Company } from '../company/schemas/company.schemas';
import { PairingState } from './schemas/pairing-state.schema';
import { HttpService } from '@nestjs/axios';
import { Types } from 'mongoose';
import {
  NotFoundException,
  BadRequestException,
  UnauthorizedException,
} from '@nestjs/common';
import { of } from 'rxjs';

jest.mock('src/common/utils/crypto.util', () => ({
  decrypt: jest.fn((val) => val),
}));

jest.mock('./resources/external-account.resource', () => ({
  ExternalAccountResource: {
    transform: jest.fn((data) => data),
    transformList: jest.fn((data) => data),
  },
}));

describe('CustomerPairingService', () => {
  let service: CustomerPairingService;
  let externalAccountModel: any;
  let companyModel: any;
  let pairingStateModel: any;
  let httpService: any;

  const mockUser = {
    _id: new Types.ObjectId('507f1f77bcf86cd799439011'),
    role: 'client',
    name: 'Test Client',
    email: 'client@test.com',
  };

  const mockCompany = {
    _id: '507f1f77bcf86cd799439001',
    name: 'Test Corp',
    integrationConfig: {
      isIntegrationActive: true,
      externalLoginUrl: 'https://external.com/login',
      externalTokenUrl: 'https://external.com/token',
      externalApiUrl: 'https://external.com/api',
      externalVerifyUrl: 'https://external.com/verify',
      secretKey: 'encrypted-secret-key',
      clientId: 'client-123',
      clientSecret: 'secret-456',
    },
  };

  const mockExternalAccount = {
    _id: '507f1f77bcf86cd799439020',
    externalCustomerEmail: 'ext@test.com',
    externalCustomerName: 'External User',
    companyId: '507f1f77bcf86cd799439001',
    userId: '507f1f77bcf86cd799439011',
    pairedAt: new Date(),
    expiresAt: new Date(Date.now() + 86400000),
    integrationType: 'oauth',
    deletedAt: null,
    save: jest.fn().mockResolvedValue(this),
    toObject: jest.fn().mockReturnValue({}),
  };

  beforeEach(async () => {
    const mockEAModel = {
      create: jest.fn(),
      find: jest.fn(),
      findOne: jest.fn(),
      findById: jest.fn(),
    };
    const mockCoModel = {
      findOne: jest.fn(),
    };
    const mockPSModel = {
      create: jest.fn(),
      findOne: jest.fn(),
      deleteOne: jest.fn(),
    };
    const mockHttp = {
      post: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CustomerPairingService,
        { provide: getModelToken(ExternalAccount.name), useValue: mockEAModel },
        { provide: getModelToken(Company.name), useValue: mockCoModel },
        { provide: getModelToken(PairingState.name), useValue: mockPSModel },
        { provide: HttpService, useValue: mockHttp },
      ],
    }).compile();

    service = module.get<CustomerPairingService>(CustomerPairingService);
    externalAccountModel = module.get(getModelToken(ExternalAccount.name));
    companyModel = module.get(getModelToken(Company.name));
    pairingStateModel = module.get(getModelToken(PairingState.name));
    httpService = module.get<HttpService>(HttpService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('startPairing()', () => {
    const dto = {
      redirect_base_url: 'https://app.com/callback',
      company_id: '507f1f77bcf86cd799439001',
    };

    it('UT-CP-001: should create pairing state and return redirect URL', async () => {
      companyModel.findOne.mockReturnValue({
        exec: jest.fn().mockResolvedValue(mockCompany),
      });
      pairingStateModel.create.mockResolvedValue({ _id: 'state-1' });

      const result = await service.startPairing(dto, mockUser);

      expect(result).toHaveProperty('redirect_url');
      expect(result.redirect_url).toContain('external.com/login');
      expect(pairingStateModel.create).toHaveBeenCalled();
    });

    it('UT-CP-002: should throw NotFoundException when company not found', async () => {
      companyModel.findOne.mockReturnValue({
        exec: jest.fn().mockResolvedValue(null),
      });

      await expect(service.startPairing(dto, mockUser)).rejects.toThrow(
        NotFoundException,
      );
    });

    it('UT-CP-003: should throw BadRequestException when integration is inactive', async () => {
      const inactiveCompany = {
        ...mockCompany,
        integrationConfig: { isIntegrationActive: false },
      };
      companyModel.findOne.mockReturnValue({
        exec: jest.fn().mockResolvedValue(inactiveCompany),
      });

      await expect(service.startPairing(dto, mockUser)).rejects.toThrow(
        BadRequestException,
      );
    });

    it('UT-CP-004: should throw BadRequestException when external URL not configured', async () => {
      const noUrlCompany = {
        ...mockCompany,
        integrationConfig: { isIntegrationActive: true, externalLoginUrl: null },
      };
      companyModel.findOne.mockReturnValue({
        exec: jest.fn().mockResolvedValue(noUrlCompany),
      });

      await expect(service.startPairing(dto, mockUser)).rejects.toThrow(
        BadRequestException,
      );
    });
  });

  describe('completePairing()', () => {
    const dto = {
      company_id: '507f1f77bcf86cd799439001',
      code: 'auth-code-123',
      state: 'valid-state-token',
    };

    it('UT-CP-005: should complete pairing successfully', async () => {
      const stateDoc = {
        _id: 'state-1',
        state: 'valid-state-token',
        userId: mockUser._id,
        companyId: '507f1f77bcf86cd799439001',
      };
      pairingStateModel.findOne.mockResolvedValue(stateDoc);
      pairingStateModel.deleteOne.mockResolvedValue({ deletedCount: 1 });
      companyModel.findOne.mockReturnValue({
        exec: jest.fn().mockResolvedValue(mockCompany),
      });
      httpService.post.mockReturnValue(
        of({
          data: {
            external_customer_id: 'ext@test.com',
            name: 'External User',
            subscription_status: 'ACTIVE',
          },
        }),
      );
      externalAccountModel.findOne.mockResolvedValue(null);
      externalAccountModel.create.mockResolvedValue(mockExternalAccount);
      externalAccountModel.findById.mockReturnValue({
        populate: jest.fn().mockReturnThis(),
        lean: jest.fn().mockReturnThis(),
        exec: jest.fn().mockResolvedValue({
          _id: '507f1f77bcf86cd799439020',
          externalCustomerEmail: 'ext@test.com',
          externalCustomerName: 'External User',
          integrationType: 'external_system',
          pairedAt: new Date(),
          companyId: { _id: '507f1f77bcf86cd799439001', name: 'Test Corp' },
        }),
      });

      const result = await service.completePairing(dto, mockUser);
      expect(result).toBeDefined();
    });

    it('UT-CP-006: should throw UnauthorizedException for invalid state', async () => {
      pairingStateModel.findOne.mockReturnValue({
        exec: jest.fn().mockResolvedValue(null),
      });

      await expect(service.completePairing(dto, mockUser)).rejects.toThrow(
        UnauthorizedException,
      );
    });
  });

  describe('findAllForUser()', () => {
    it('UT-CP-007: should return all paired accounts for user', async () => {
      const expected = [mockExternalAccount];
      const sortMock = jest.fn().mockReturnThis();
      const leanMock = jest.fn().mockReturnThis();
      externalAccountModel.find.mockReturnValue({
        populate: jest.fn().mockReturnThis(),
        sort: sortMock,
        lean: leanMock,
        exec: jest.fn().mockResolvedValue(expected),
      });

      const result = await service.findAllForUser(mockUser);
      expect(result).toEqual(expected);
    });
  });

  describe('findForUserInCompany()', () => {
    const companyId = '507f1f77bcf86cd799439001';

    it('UT-CP-008: should return paired account for user in company', async () => {
      externalAccountModel.findOne.mockReturnValue({
        populate: jest.fn().mockReturnThis(),
        lean: jest.fn().mockReturnThis(),
        exec: jest.fn().mockResolvedValue(mockExternalAccount),
      });

      const result = await service.findForUserInCompany(companyId, mockUser);
      expect(result).toBeDefined();
    });
  });

  describe('unpair()', () => {
    const accountId = '507f1f77bcf86cd799439020';

    it('UT-CP-009: should unpair account successfully', async () => {
      const existingAccount = {
        ...mockExternalAccount,
        userId: mockUser._id,
        save: jest.fn().mockResolvedValue({ ...mockExternalAccount, deletedAt: new Date() }),
      };
      externalAccountModel.findOne.mockReturnValue({
        exec: jest.fn().mockResolvedValue(existingAccount),
      });
      externalAccountModel.findById.mockReturnValue({
        populate: jest.fn().mockReturnThis(),
        lean: jest.fn().mockReturnThis(),
        exec: jest.fn().mockResolvedValue({
          _id: '507f1f77bcf86cd799439020',
          externalCustomerEmail: 'ext@test.com',
          externalCustomerName: 'External User',
          integrationType: 'external_system',
          pairedAt: new Date(),
          deletedAt: new Date(),
          companyId: { _id: '507f1f77bcf86cd799439001', name: 'Test Corp' },
        }),
      });

      const result = await service.unpair(accountId, mockUser);
      expect(result.deletedAt).toBeDefined();
    });

    it('UT-CP-010: should throw NotFoundException when account not found', async () => {
      externalAccountModel.findOne.mockReturnValue({
        exec: jest.fn().mockResolvedValue(null),
      });

      await expect(service.unpair(accountId, mockUser)).rejects.toThrow(
        NotFoundException,
      );
    });
  });
});
